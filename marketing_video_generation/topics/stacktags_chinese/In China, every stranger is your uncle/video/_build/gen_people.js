// Generate the stranger PORTRAITS via Google Imagen 4 → assets/raw/*.png.
// Each is a single ordinary, relatable person (NOT a glossy stock model) on a
// plain white background, so rembg can cut a clean figure + a dashed outline is
// baked on. personGeneration must be 'allow_adult' (gen_images.js forbids people).
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Photorealistic candid half-body portrait, one ordinary everyday relatable person (NOT a glossy fashion model, plain average face), waist up, centered, facing the camera, gentle natural smile, simple casual real clothing, soft even natural lighting, plain solid pure white seamless studio background, gentle soft contact shadow, sharp focus, high detail, no text, no letters, no captions, no watermark, no logos, no props in hands.';

const SHOTS = [
  { key: 'man_shop', ar: '3:4',
    prompt: 'A friendly ordinary Chinese man around 55 years old, a small-shop owner, wearing a simple plain work apron over an everyday shirt, short greying hair.' },
  { key: 'man_bus', ar: '3:4',
    prompt: 'A friendly ordinary Chinese man around 50 years old, a city bus driver, wearing a simple plain navy-blue uniform shirt and a plain peaked driver cap, short hair.' },
  { key: 'woman_old', ar: '3:4',
    prompt: 'A friendly ordinary older Chinese woman around 62 years old, a neighbour, wearing a simple plain knit cardigan, short tidy greying hair, kind warm face.' },
  { key: 'woman_young', ar: '3:4',
    prompt: 'A friendly ordinary young Chinese woman around 25 years old, wearing a simple plain casual everyday top, shoulder-length straight dark hair, natural relaxed look.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: `${shot.prompt} ${STYLE}` }], parameters: { sampleCount: 1, aspectRatio: shot.ar || '3:4', personGeneration: 'allow_adult' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 3) { await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} ${r.status} ${t.slice(0, 300)}`); }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) { if (attempt < 3) { await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no bytes ${JSON.stringify(j).slice(0, 200)}`); }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}
(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  for (const s of list) { try { await gen(s); } catch (e) { console.error('  ✗', e.message); } }
  console.log('Done.');
})();
