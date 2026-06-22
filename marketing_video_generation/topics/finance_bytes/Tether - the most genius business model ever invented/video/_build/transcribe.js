// Align the script's spoken lines to real audio timestamps via Gemini 2.5 Flash.
// Output: timings.json  =>  [{ i, text, start }]  (start in seconds, float)
const fs = require('fs');
const path = require('path');

// --- read GEMINI_API_KEY from backend/.env without echoing it ---
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found in backend/.env');

const AUDIO = path.resolve(__dirname, '../../script_audio.mp3');
const audioB64 = fs.readFileSync(AUDIO).toString('base64');

// Ordered spoken lines (stage directions + headers stripped). English narration
// with romanized pinyin, matching "5 Chinese words from 5 Chinese cities".
const LINES = [
  // ---- HOOK ----
  "Shanghai means on the sea.",
  "Beijing, northern capital.",
  "Nanjing, southern capital.",
  "Qingdao, green island.",
  "And Hong Kong? Fragrant harbor.",
  "Because Chinese city names aren't random sounds — every one is a tiny description. A map you can actually read.",
  "Learn five characters from five cities, and you'll never read a map the same way. Let's go.",
  // ---- THE 5 ----
  "We start on the coast.",
  "One. Shanghai. Hai means sea.",
  "Shang means on, and hai means sea. Shanghai is literally on the sea — exactly where it sits, at the edge of the Pacific. First character: hai, sea.",
  "Now head north, to the capital.",
  "Two. Beijing. Bei means north.",
  "Jing means capital, and bei means north. Beijing is the northern capital — which almost asks its own question.",
  "Because if there's a northern capital, there has to be a —",
  "Three. Nanjing. Nan means south.",
  "Southern one. Nan means south: Nanjing, the southern capital. Two cities, one character apart.",
  "North and south — let's finish the compass.",
  "West sits Xi'an — xi means west. And the region of Guangdong — dong means east. North, south, west, east: all four directions, straight off the map.",
  "Back to the coast — with a German surprise.",
  "Four. Qingdao. Dao means island.",
  "Qing means green, and dao means island — the green island. A century ago it was a German colony — which is why China's most famous beer, Tsingtao, was founded right here by German brewers.",
  "Down the coast to the last one.",
  "Five. Hong Kong. Gang means harbor.",
  "You know it as Hong Kong — but xiang means fragrant, and gang means harbor. The fragrant harbor, named for the scented wood once shipped through its docks.",
  // ---- OUTRO ----
  "So in five cities: sea, north, south, island, harbor — plus west and east for free.",
  "That's the trick with Chinese: the names you half-know are already teaching you the language. A map isn't just a map — it's a vocabulary list.",
  "Wanna actually start learning Chinese?",
  "Discover thousands of free exercises and more learning content on stacktags.io.",
];

const numbered = LINES.map((t, i) => `${i}: ${t}`).join('\n');

const prompt = `You are given an English voiceover audio file and the ordered list of spoken lines below (index: text).
Listen to the audio and return, for EACH line index, the START time in the audio (in seconds, decimal) at which that line begins to be spoken.
The lines are spoken in the given order with no reordering. Be as precise as you can (within ~0.2s).
Return ONLY strict JSON: an array of objects {"i": <index>, "start": <seconds>}. No prose, no markdown fences.

LINES:
${numbered}`;

const body = {
  contents: [{
    parts: [
      { inline_data: { mime_type: 'audio/mp3', data: audioB64 } },
      { text: prompt },
    ],
  }],
  generationConfig: { temperature: 0, responseMimeType: 'application/json' },
};

(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`;
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { console.error('HTTP', r.status, await r.text()); process.exit(1); }
  const j = await r.json();
  const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  let arr;
  try { arr = JSON.parse(txt); }
  catch (e) { console.error('Parse fail. Raw:\n', txt); process.exit(1); }
  const out = arr
    .sort((a, b) => a.i - b.i)
    .map(o => ({ i: o.i, text: LINES[o.i], start: Math.round(o.start * 100) / 100 }));
  fs.writeFileSync(path.resolve(__dirname, 'timings.json'), JSON.stringify(out, null, 2));
  console.log('Wrote timings.json with', out.length, 'lines. Last start:', out[out.length - 1]?.start);
  console.log(out.map(o => `${o.i}\t${o.start}\t${o.text.slice(0, 50)}`).join('\n'));
})();
