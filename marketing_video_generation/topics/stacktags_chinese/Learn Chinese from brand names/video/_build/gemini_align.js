// Whisper quota exhausted → Gemini timestamped transcript of script_audio.mp3.
// Uses the https module (no undici headers-timeout on big audio) + 2.5-flash.
// Output: gemini_align.json  (array of { start:<sec>, text })
const fs = require('fs');
const path = require('path');
const https = require('https');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();

const PROMPT = `You are a precise forced-aligner. Transcribe this ~120 second English narration and return ONLY a JSON array.
Break it into SHORT phrases (3-7 words, one clause per item). For EACH phrase give the exact START time in SECONDS (float) from the start of the audio.
Rules:
- Cover the ENTIRE clip 0 → ~120s. The LAST phrase's start must fall in the final ~8 seconds.
- Timestamps strictly increasing, as accurate as you can hear.
- Verbatim, brand names as pronounced (Baoma, Benchi, Kekou kele, Lixiang, Weilai, BYD).
Output exactly: [{"start":0.0,"text":"..."},{"start":1.8,"text":"..."}]`;

const buf = fs.readFileSync(path.resolve(__dirname, '../../script_audio.mp3'));
const payload = JSON.stringify({
  contents: [{ parts: [ { text: PROMPT }, { inline_data: { mime_type: 'audio/mpeg', data: buf.toString('base64') } } ] }],
  generationConfig: { temperature: 0, responseMimeType: 'application/json' },
});

const req = https.request({
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`,
  method: 'POST',
  headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) },
  timeout: 180000,
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const j = JSON.parse(data);
      const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
      const arr = JSON.parse(txt);
      fs.writeFileSync(path.resolve(__dirname, 'gemini_align.json'), JSON.stringify(arr, null, 2));
      let mono = true; for (let i = 1; i < arr.length; i++) if (arr[i].start < arr[i-1].start) mono = false;
      console.log('phrases:', arr.length, '| first:', arr[0].start, '| last:', arr[arr.length-1].start, '| monotonic:', mono);
      console.log('\n' + arr.map(a => `${(+a.start).toFixed(2)}\t${a.text}`).join('\n'));
    } catch (e) { console.error('parse fail:', e.message, '\n', data.slice(0, 800)); process.exit(1); }
  });
});
req.on('error', e => { console.error('req error', e.message); process.exit(1); });
req.on('timeout', () => { req.destroy(); console.error('timeout'); process.exit(1); });
req.write(payload); req.end();
