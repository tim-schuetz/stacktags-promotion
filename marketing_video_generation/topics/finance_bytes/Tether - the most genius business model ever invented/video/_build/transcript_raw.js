// Get a grounded, timestamped transcript of what Gemini actually HEARS in the
// audio (not where our provided lines fall). Used to verify structure + build
// accurate cue timings. Output: transcript_raw.json => [{start,end,text}]
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const AUDIO = path.resolve(__dirname, '../../script_audio.mp3');
const audioB64 = fs.readFileSync(AUDIO).toString('base64');

const prompt = `Transcribe this English voiceover audio with timestamps.
The clip is about 113 seconds long; every timestamp MUST be between 0 and 114 seconds.
Break it into short natural phrases (roughly one clause per segment).
For EACH phrase return its start and end time in seconds (decimal) and the exact words spoken.
Return ONLY strict JSON: an array of objects {"start": <sec>, "end": <sec>, "text": "<words>"}. No prose, no markdown fences.`;

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
  const model = process.argv[2] || 'gemini-2.5-pro';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { console.error('HTTP', r.status, await r.text()); process.exit(1); }
  const j = await r.json();
  const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  let arr;
  try { arr = JSON.parse(txt); }
  catch (e) { console.error('Parse fail. Raw:\n', txt); process.exit(1); }
  fs.writeFileSync(path.resolve(__dirname, 'transcript_raw.json'), JSON.stringify(arr, null, 2));
  console.log('model:', model, '— segments:', arr.length, '— last end:', arr[arr.length - 1]?.end);
  console.log(arr.map(o => `${(o.start).toFixed(1)}\t${(o.end).toFixed(1)}\t${o.text}`).join('\n'));
})();
