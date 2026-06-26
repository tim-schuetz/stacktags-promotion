// Generate the hero-object photos via Google Imagen 4 → assets/raw/*.png.
// Each is a SINGLE object on a plain white background (easy to rembg-cut, then
// a dashed outline is baked on). Smoke is added in CSS, not the photo.
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Photorealistic product shot, single object, centered, plain solid pure white seamless background, soft even studio lighting, gentle soft contact shadow, high detail, no text, no letters, no captions, no watermark, no logos, no hands, no people.';

const SHOTS = [
  { key: 'beer', ar: '3:4',
    prompt: 'A single classic green glass beer bottle (Tsingtao-style Chinese lager), long neck, gold crown cap on, a simple pale cream label with a small gold-and-red emblem (no readable words), a few fine condensation droplets on the cold glass, standing perfectly upright, straight-on eye-level product view.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: `${shot.prompt} ${STYLE}` }], parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: 'dont_allow' } };
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
