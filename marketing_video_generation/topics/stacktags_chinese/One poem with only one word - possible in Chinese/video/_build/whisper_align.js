// Accurate forced alignment via OpenAI Whisper (verbose_json, word+segment
// timestamps). Whisper timestamps are reliable across the full clip, unlike
// Gemini which drifts past ~1 min. Output: whisper.json (raw) + prints segments.
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('OPENAI_API_KEY not found');

const AUDIO = path.resolve(__dirname, '../../script_audio_combined.mp3');

(async () => {
  const buf = fs.readFileSync(AUDIO);
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'script_audio_combined.mp3');
  fd.append('model', 'whisper-1');
  fd.append('response_format', 'verbose_json');
  fd.append('timestamp_granularities[]', 'word');
  fd.append('timestamp_granularities[]', 'segment');
  fd.append('language', 'en');

  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}` },
    body: fd,
  });
  if (!r.ok) { console.error('HTTP', r.status, await r.text()); process.exit(1); }
  const j = await r.json();
  fs.writeFileSync(path.resolve(__dirname, 'whisper.json'), JSON.stringify(j, null, 2));
  console.log('duration:', j.duration, '— segments:', (j.segments || []).length, '— words:', (j.words || []).length);
  console.log('\n=== SEGMENTS ===');
  console.log((j.segments || []).map(s => `${s.start.toFixed(2)}\t${s.end.toFixed(2)}\t${s.text.trim()}`).join('\n'));
})();
