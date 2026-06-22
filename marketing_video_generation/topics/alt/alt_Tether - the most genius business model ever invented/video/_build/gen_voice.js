// Generate the narration MP3 via ElevenLabs.
// Voice: "Liam - Viral Short-Form Storyteller" (VCgLBmBjldJmfphyB8sZ).
// Output -> ../../script_voice.mp3 (the title folder, sibling of video/).
const fs = require('fs');
const path = require('path');

const KEY = process.env.ELEVENLABS_API_KEY || 'sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8';
const VOICE = 'VCgLBmBjldJmfphyB8sZ';   // Liam - Viral Short-Form Storyteller
const MODEL = 'eleven_multilingual_v2';

const text = fs.readFileSync(path.resolve(__dirname, 'narration.txt'), 'utf8')
  .split(/\n\s*\n/).map(s => s.trim()).filter(Boolean).join('\n\n');

const out = path.resolve(__dirname, '../../script_voice.mp3');

(async () => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`;
  const body = {
    text,
    model_id: MODEL,
    voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.30, use_speaker_boost: true, speed: 1.0 },
  };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!r.ok) { console.error('HTTP', r.status, await r.text()); process.exit(1); }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(out, buf);
  console.log('WROTE', out, Math.round(buf.length / 1024), 'KB');
})().catch(e => { console.error(e); process.exit(1); });
