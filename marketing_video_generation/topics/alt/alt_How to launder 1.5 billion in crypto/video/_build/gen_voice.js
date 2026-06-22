// Generate the narration mp3 via ElevenLabs (voice: Liam - Viral Short-Form
// Storyteller). Reads narration.txt, writes ../../script_voice.mp3.
const fs = require('fs');
const path = require('path');

const API_KEY = 'sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8';
const VOICE_ID = 'VCgLBmBjldJmfphyB8sZ'; // Liam - Viral Short-Form Storyteller
const text = fs.readFileSync(path.join(__dirname, 'narration.txt'), 'utf8').trim();
const out = path.resolve(__dirname, '../../script_voice.mp3');

(async () => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_192`;
  const body = {
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
  };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!r.ok) { console.error('HTTP', r.status, await r.text()); process.exit(1); }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(out, buf);
  console.log('wrote', out, Math.round(buf.length / 1024), 'KB');
})();
