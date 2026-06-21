// Generate the 10 "real photo" morph images via Google Imagen 4.
// Saves PNGs into ../assets/photos/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Photorealistic, cinematic, high detail, single clear subject centered in frame, simple uncluttered background, soft natural light, no text, no letters, no watermark, no people unless specified.';

const SHOTS = [
  { key: 'person',   prompt: 'A single person walking mid-stride seen from the side, full body, one leg forward one leg back forming a wide A-shape, arms relaxed, clean light grey seamless studio background.' },
  { key: 'fire',     prompt: 'A small campfire at night, one tall pointed central flame with a couple of glowing sparks flying off to each side, deep dark background, close-up.' },
  { key: 'water',    prompt: 'A single narrow vertical stream of clear water flowing straight down with small droplets splashing off both sides, smooth dark teal background, studio macro.' },
  { key: 'mountain', prompt: 'A mountain range with three rocky peaks, one tall central peak flanked by two shorter peaks, clear pale sky, distant landscape.' },
  { key: 'tree',     prompt: 'A single healthy young tree with a clear straight vertical trunk, a rounded leafy green canopy of branches reaching upward, and a few roots spreading out at the base, isolated and centered, clean soft pale neutral background.' },
  { key: 'sun',      prompt: 'The bright round glowing disc of the sun centered in a clear blue sky, soft rays, no clouds.' },
  { key: 'moon',     prompt: 'A thin bright crescent moon tilted on its side against a deep dark night sky, centered, sharp.' },
  { key: 'mouth',    prompt: 'Extreme close-up of a single open human mouth, lips parted forming a clean oval opening, soft neutral skin-tone background, studio beauty lighting.' },
  { key: 'rain',     prompt: 'A single grey rain cloud with many straight raindrops falling down from it, pale light-blue sky background.' },
  { key: 'field',    prompt: 'Aerial straight-down drone view of green farmland divided into four equal square plots by two crossing dirt paths forming a plus shape, top-down.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: `${shot.prompt} ${STYLE}` }],
    parameters: { sampleCount: 1, aspectRatio: '1:1', personGeneration: 'allow_adult' },
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
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} images via imagen-4.0-generate-001 ...`);
  for (const shot of list) {
    try { await gen(shot); } catch (e) { console.error('  ✗', e.message); }
  }
  console.log('Done.');
})();
