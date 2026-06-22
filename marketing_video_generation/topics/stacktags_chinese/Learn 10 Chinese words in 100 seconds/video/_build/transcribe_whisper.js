// Word-level transcription of the narration via OpenAI Whisper (whisper-1,
// verbose_json + word timestamps). Reliable across the whole clip (Gemini drifts).
// Writes whisper_words.json: { duration, words:[{word,start,end}], text }.
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (env.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('OPENAI_API_KEY not found');
const audioPath = path.resolve(__dirname, '../../script_audio.mp3');

(async () => {
  const buf = fs.readFileSync(audioPath);
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'script_audio.mp3');
  fd.append('model', 'whisper-1');
  fd.append('response_format', 'verbose_json');
  fd.append('timestamp_granularities[]', 'word');
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: 'Bearer ' + KEY }, body: fd,
  });
  if (!r.ok) { console.error('HTTP', r.status, (await r.text()).slice(0, 400)); process.exit(1); }
  const j = await r.json();
  fs.writeFileSync(path.join(__dirname, 'whisper_words.json'),
    JSON.stringify({ duration: j.duration, words: j.words || [], text: j.text }));
  console.log('duration:', j.duration, ' words:', (j.words || []).length);
  console.log('\nTEXT:\n' + j.text);
})().catch(e => { console.error(e); process.exit(1); });
