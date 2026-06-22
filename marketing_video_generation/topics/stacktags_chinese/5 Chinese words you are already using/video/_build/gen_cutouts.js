// Generate cut-out hero images via Google Imagen 4, on a flat MAGENTA chroma
// background so cutout.py can key them to transparent PNGs.
// Saves raw renders to ../assets/raw/<key>.png   (then run cutout.py)
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

// flat chroma key the keyer removes. Magenta — none of our subjects are magenta.
const BG = 'isolated and perfectly centered on a 100% flat solid uniform chroma-key magenta background (pure RGB 255,0,255), the whole background is one single even magenta colour, NO gradient, NO vignette, NO shadow cast on the background, NO floor, the subject does not touch the edges';
const STYLE = 'Photorealistic, cinematic, high detail, rich colour, crisp studio product lighting, sharp focus on the subject, no text, no letters, no captions, no watermark, no logos.';

const SHOTS = [
  { key: 'tiger', ar: '1:1',
    prompt: 'A majestic Bengal tiger, head and shoulders portrait, vivid orange fur with bold black stripes, calm proud expression, looking straight toward the camera, beautiful wildlife photography.' },
  { key: 'tofu', ar: '1:1',
    prompt: 'A fresh white block of tofu on a small white plate, topped with thin slices of green spring onion and a drizzle of soy sauce, a pair of wooden chopsticks beside it, clean appetising food photography.' },
  { key: 'astronaut', ar: '3:4',
    prompt: 'A lone astronaut in a clean white spacesuit floating weightless and tilted, full body from helmet to boots, golden mirrored visor reflecting faint light, life-support backpack, tethers drifting, a sense of silent weightless floating.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: `${shot.prompt} ${BG} ${STYLE}` }],
    parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: 'allow_adult' },
  };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    if (attempt < 3) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); }
    throw new Error(`${shot.key} failed: ${r.status} ${t.slice(0, 300)}`);
  }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    if (attempt < 3) { console.warn(`  retry ${shot.key} (no bytes)`); await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); }
    throw new Error(`${shot.key}: no image bytes. ${JSON.stringify(j).slice(0, 300)}`);
  }
  const file = path.join(OUT, `${shot.key}.png`);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} chroma cut-out renders via imagen-4.0-generate-001 ...`);
  for (const shot of list) {
    try { await gen(shot); } catch (e) { console.error('  X', e.message); }
  }
  console.log('Done.');
})();
