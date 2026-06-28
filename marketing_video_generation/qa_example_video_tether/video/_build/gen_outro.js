// Generate ONLY the new outro CTA line via ElevenLabs (Liam), to splice onto the
// existing narration (preserves all 0-118s timings). -> _build/outro_clip.mp3
const fs = require('fs');
const path = require('path');
const API_KEY = 'sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8';
const VOICE_ID = 'VCgLBmBjldJmfphyB8sZ';
const TEXT = 'Discover millions of ideas, exercises and more learning content on stacktags.io.';
const OUT = path.resolve(__dirname, 'outro_clip.mp3');

(async () => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const body = { text: TEXT, model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.42, similarity_boost: 0.8, style: 0.28, use_speaker_boost: true } };
  const r = await fetch(url, { method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`ElevenLabs failed: ${r.status} ${(await r.text()).slice(0, 300)}`);
  fs.writeFileSync(OUT, Buffer.from(await r.arrayBuffer()));
  console.log(`✓ wrote ${OUT}`);
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
