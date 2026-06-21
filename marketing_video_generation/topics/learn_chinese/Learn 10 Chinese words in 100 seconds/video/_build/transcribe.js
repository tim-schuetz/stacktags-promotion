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

// Ordered spoken lines (stage directions + headers stripped).
const LINES = [
  "In the next 100 seconds you'll learn 10 Chinese characters",
  "without memorizing a single one.",
  "Most people think Chinese is impossible:",
  "thousands of characters that look like random scribbles. But the oldest, most common ones aren't random",
  "they're tiny drawings of what they mean.",
  "See it once, and you can't unsee it. Watch.",
  "Start with you.",
  "1) ren - person.",
  "A body and two legs, mid-stride. One human, two strokes.",
  "Give them a fire to gather around.",
  "2) huo - fire.",
  "A flame in the middle, two sparks flying off the sides. A campfire.",
  "3) shui - water.",
  "A stream down the middle, droplets splashing off both sides. A river in three strokes.",
  "4) shan - mountain.",
  "Three peaks - one tall, two short. The mountain a kid would draw.",
  "5) mu - tree or wood.",
  "Trunk, branches reaching up, roots spreading down. A whole tree.",
  "6) ri - sun, and also day.",
  "A circle with a dot, later squared off to write it faster. The sun marks a day, so it also means day.",
  "Next is",
  "7) yue - moon, and also month.",
  "A crescent on its side. One moon cycle is a month, so it means month too.",
  "8) kou - mouth.",
  "An open mouth, just a square opening. The hole you eat and talk with.",
  "9) yu - rain.",
  "Sky on top, a cloud, four raindrops falling inside. Rain, drawn out.",
  "And it has to land somewhere.",
  "10) tian - field.",
  "Farmland from above, split into four plots. A rice field, exactly like one.",
  "Now the part that makes Chinese click: stack the pictures and they build new words.",
  "Two trees",
  "mu plus mu makes lin, a wood. Add a third and sen is a dense forest.",
  "Sun plus moon",
  "ri plus yue makes ming, bright. The two brightest things in the sky.",
  "A person by a tree",
  "ren plus mu makes xiu, rest.",
  "And one free extra: li means strength.",
  "Strength in a field, tian plus li, makes nan, man, the one who works the field.",
  "That's the secret: Chinese isn't random symbols, it's a small set of pictures, combined in ways that make sense.",
  "You just read 10 characters, no memorizing.",
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
