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
  // Hero image for the "250 = fool" etymology (half a string of coins / 半吊子).
  { key: 'coins', ar: '1:1',
    prompt: 'A short string of about eight old Chinese bronze cash coins — each a round coin with a square hole in the middle — threaded loosely onto a thin dark-red silk cord, laid in a gentle curve, the cord clearly not full so a length of empty cord trails off one end, worn antique brass patina, gentle slightly-above three-quarter view.' },
  // Optional gift context for "...or even put on a gift" (a red lucky-money envelope).
  { key: 'hongbao', ar: '1:1',
    prompt: 'A single closed bright-red Chinese lucky money envelope (hongbao) standing slightly angled, plain clean front, a subtle gold foil emblem, soft sheen, gentle front three-quarter view.' },
  // Real-world phenomenon for the 5/20 romance day: couples really rush to register
  // marriage on May 20. Shown as a "shared photo" inside the chat (rectangular, not cut).
  { key: 'couple', ar: '4:3', person: 'allow_adult',
    style: 'Candid realistic photograph, warm golden-hour light, ordinary amateur phone-photo look, shallow depth of field, absolutely no text, no captions, no letters, no watermark, no logos.',
    prompt: 'A happy young Chinese couple — a man and a woman together in one frame — laughing and looking at each other, the woman holding a single red rose, standing close, soft blurred city park behind them.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const promptText = `${shot.prompt} ${shot.style != null ? shot.style : STYLE}`;
  const body = { instances: [{ prompt: promptText }], parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: shot.person || 'dont_allow' } };
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
