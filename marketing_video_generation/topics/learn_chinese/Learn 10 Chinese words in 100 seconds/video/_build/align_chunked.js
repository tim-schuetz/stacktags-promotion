// Robust line→timestamp alignment for the WHOLE clip via Gemini, in short
// OVERLAPPING chunks (Gemini drifts over long audio — see memory). Each chunk is
// cut with ffmpeg, sent with the full line list; Gemini returns LOCAL start times
// for the lines that begin inside that chunk; we offset by the chunk start and
// merge (preferring non-edge candidates, then enforce monotonic). -> timings.json
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const AUDIO = path.resolve(__dirname, '../../script_audio.mp3');
const TMP = path.join(__dirname, '_chunks');
fs.mkdirSync(TMP, { recursive: true });

const LINES = [
  "In the next 100 seconds you'll learn 10 Chinese characters",
  "without memorizing a single one.",
  "Most people think Chinese is impossible:",
  "thousands of characters that look like random scribbles. But the oldest, most common ones aren't random",
  "they're tiny drawings of what they mean.",
  "See it once, and you can't unsee it. Watch.",
  "Start with you.",
  "1) person.",
  "A body and two legs, mid-stride. One human, two strokes.",
  "Give them a fire to gather around.",
  "2) fire.",
  "A flame in the middle, two sparks flying off the sides. A campfire.",
  "3) water.",
  "A stream down the middle, droplets splashing off both sides. A river in three strokes.",
  "4) mountain.",
  "Three peaks - one tall, two short. The mountain a kid would draw.",
  "5) tree or wood.",
  "Trunk, branches reaching up, roots spreading down. A whole tree.",
  "6) sun, and also day.",
  "A circle with a dot, later squared off to write it faster. The sun marks a day, so it also means day.",
  "Next is",
  "7) moon, and also month.",
  "A crescent on its side. One moon cycle is a month, so it means month too.",
  "8) mouth.",
  "An open mouth, just a square opening. The hole you eat and talk with.",
  "9) rain.",
  "Sky on top, a cloud, four raindrops falling inside. Rain, drawn out.",
  "And it has to land somewhere.",
  "10) field.",
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

const CHUNKS = [
  { start: 0,   dur: 48 },
  { start: 40,  dur: 48 },
  { start: 80,  dur: 48 },
  { start: 118, dur: 42 },
];

const numbered = LINES.map((t, i) => `${i}: ${t}`).join('\n');

async function alignChunk(c) {
  const file = path.join(TMP, `c_${c.start}.mp3`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(c.start), '-t', String(c.dur), '-i', AUDIO, file]);
  const b64 = fs.readFileSync(file).toString('base64');
  const prompt = `This audio is a SEGMENT of a longer English voiceover (it starts partway through). Below is the full ordered list of all spoken lines in the whole video (index: text).
Listen and return, for EACH line that BEGINS to be spoken WITHIN THIS SEGMENT, the start time in SECONDS FROM THE START OF THIS AUDIO SEGMENT (decimal). Omit lines that do not begin in this segment (spoken earlier or later). Lines keep their given order.
Return ONLY strict JSON: array of {"i": <index>, "start": <seconds_from_segment_start>}.

LINES:
${numbered}`;
  const body = {
    contents: [{ parts: [{ inline_data: { mime_type: 'audio/mp3', data: b64 } }, { text: prompt }] }],
    generationConfig: { temperature: 0, responseMimeType: 'application/json' },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`;
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  const arr = JSON.parse(txt);
  return arr.filter(o => o.start >= 0 && o.start <= c.dur);
}

(async () => {
  // candidates[i] = [{abs, edge}]
  const cand = LINES.map(() => []);
  for (const c of CHUNKS) {
    const arr = await alignChunk(c);
    for (const o of arr) {
      if (o.i < 0 || o.i >= LINES.length) continue;
      const edge = o.start < 1.2 || o.start > c.dur - 1.2;   // near a cut → less trusted
      cand[o.i].push({ abs: Math.round((c.start + o.start) * 100) / 100, edge });
    }
    console.log(`chunk @${c.start}: ${arr.length} lines`);
  }
  // pick: prefer non-edge candidates; among them the smallest (earliest reliable)
  const picked = cand.map(list => {
    if (!list.length) return null;
    const nonEdge = list.filter(x => !x.edge);
    const pool = nonEdge.length ? nonEdge : list;
    return pool.reduce((a, b) => (b.abs < a.abs ? b : a)).abs;
  });
  // fill gaps + enforce monotonic non-decreasing
  let last = 0;
  const out = LINES.map((text, i) => {
    let s = picked[i];
    if (s == null) s = last + 0.3;            // missing → just after previous
    if (s < last) s = last + 0.05;            // keep order
    last = s;
    return { i, text, start: Math.round(s * 100) / 100 };
  });
  fs.writeFileSync(path.resolve(__dirname, 'timings.json'), JSON.stringify(out, null, 2));
  console.log('\nWrote timings.json. Last start:', out[out.length - 1].start);
  console.log(out.map(o => `${o.i}\t${o.start}\t${o.text.slice(0, 46)}`).join('\n'));
  const missing = picked.map((p, i) => p == null ? i : -1).filter(i => i >= 0);
  if (missing.length) console.log('\n⚠ filled (no candidate) lines:', missing.join(', '));
})().catch(e => { console.error(e); process.exit(1); });
