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
  { key: 'bowl', ar: '1:1',
    prompt: 'A single plain white ceramic rice bowl filled to the brim with steamed white rice, NO chopsticks, nothing sticking out of it, gentle slightly-above front three-quarter view.' },
  { key: 'censer', ar: '1:1',
    prompt: 'A single small dark bronze Chinese incense censer (ding-style bowl burner) filled with pale ash, with three thin straight unlit incense sticks standing perfectly upright in the ash, NO smoke, gentle slightly-above front three-quarter view.' },
  { key: 'chrys', ar: '1:1',
    prompt: 'A single white chrysanthemum flower head with a short green stem, the traditional Chinese funeral / mourning flower, fresh, soft petals, gentle top-down three-quarter view.' },
  { key: 'lantern', ar: '1:1',
    prompt: 'A single pale cream-white lotus-shaped paper river lantern (a Ghost Festival floating water lantern), layered lotus petals, a soft warm glow from inside, calm and delicate.' },
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
