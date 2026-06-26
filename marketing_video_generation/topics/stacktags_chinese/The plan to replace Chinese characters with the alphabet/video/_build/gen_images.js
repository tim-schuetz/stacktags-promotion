// Generate the hero-object photos via Google Imagen 4 → assets/raw/*.png.
// Realistic objects on a plain white background (easy to rembg-cut), plus a
// funny cartoon (diarrhea) and a realistic Zhou-Youguang-type scholar portrait.
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const PRODUCT = 'Photorealistic product shot, single object, centered, plain solid pure white seamless background, soft even studio lighting, gentle soft contact shadow, high detail, no text, no letters, no captions, no watermark, no logos, no hands, no people.';
const CARTOON = 'Flat vector cartoon illustration, simple clean comic style, bold friendly shapes, soft turquoise and warm tones, plain solid pure white background, gentle humor, no text, no letters, no watermark.';
const PORTRAIT = 'Warm realistic portrait photograph, head and shoulders, plain light neutral seamless background, soft natural lighting, gentle documentary style, high detail, no text, no watermark.';
const BUILDING = 'Sharp architectural photograph, one single isolated building, the full tower visible from base to top, plain solid pure white seamless background, even daylight, high detail, no people, no other buildings, no text, no watermark.';

const SHOTS = [
  { key: 'ricesack', ar: '1:1', person: 'dont_allow', style: PRODUCT,
    prompt: 'A single open burlap jute sack full of uncooked white rice grains, the top folded open showing the heap of white rice spilling slightly, rustic woven cloth bag, plump and full, three-quarter front view.' },
  { key: 'chopsticks', ar: '1:1', person: 'dont_allow', style: PRODUCT,
    prompt: 'A single pair of plain light wooden chopsticks lying together side by side at a slight diagonal angle, natural bamboo, clean and simple.' },
  { key: 'toilet', ar: '1:1', person: 'allow_adult', style: CARTOON,
    prompt: 'A funny cartoon of a distressed person sitting on a white toilet, clenching, holding their belly with both hands, pained grimace, sweat drops flying, cheeks puffed, clearly suffering from an urgent stomach upset, humorous and a little silly.' },
  { key: 'zhou', ar: '3:4', person: 'allow_adult', style: PORTRAIT,
    prompt: 'A kind elderly East Asian man in his late eighties, a thoughtful Chinese linguist and scholar, round eyeglasses, thin neat white hair, gentle warm smile, wearing a simple buttoned cardigan over a shirt, calm dignified expression, mid-20th-century intellectual.' },
  { key: 'fishsauce', ar: '3:4', person: 'dont_allow', style: PRODUCT,
    prompt: 'A single tall clear glass bottle of fish sauce, filled with translucent amber-brown liquid, a simple plain paper label and a dark screw cap, classic Southeast-Asian fish sauce bottle, straight front view.' },
  { key: 'tower1', ar: '9:16', person: 'dont_allow', style: BUILDING,
    prompt: 'A single sleek modern glass skyscraper, a tall slender rectangular high-rise office tower with a stepped crown, blue-green glass curtain-wall facade, the whole building.' },
  { key: 'tower2', ar: '9:16', person: 'dont_allow', style: BUILDING,
    prompt: 'A single contemporary curved glass skyscraper, a smooth gently-tapering high-rise tower with a rounded top, clean reflective silver-blue facade, the whole building.' },
  { key: 'tower3', ar: '9:16', person: 'dont_allow', style: BUILDING,
    prompt: 'A single futuristic twisting skyscraper, a modern spiralling high-rise tower of glass and steel with a tapered point, the whole building.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: `${shot.prompt} ${shot.style}` }], parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: shot.person || 'dont_allow' } };
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
