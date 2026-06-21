// Quick content check: ask Gemini to transcribe the first ~8s of the narration,
// so we know whether the audio still opens with "This is a poem" (same take) or
// was re-recorded as "What you see here is a poem". (Whisper quota is exhausted.)
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

(async () => {
  const buf = fs.readFileSync(path.resolve(__dirname, '../../script_audio.mp3'));
  const b64 = buf.toString('base64');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`;
  const body = {
    contents: [{
      parts: [
        { text: 'Transcribe this English narration VERBATIM (plain text, no timestamps). Just the words.' },
        { inline_data: { mime_type: 'audio/mpeg', data: b64 } },
      ],
    }],
  };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { console.error('HTTP', r.status, (await r.text()).slice(0, 500)); process.exit(1); }
  const j = await r.json();
  const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || JSON.stringify(j).slice(0, 600);
  console.log(txt.trim());
})();
