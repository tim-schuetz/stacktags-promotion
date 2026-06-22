// Generate the supporting images via Google Imagen 4. Plain white backgrounds
// so they cut out cleanly with rembg. Saves PNGs into ../assets/raw/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'High detail, crisp focus, even soft studio lighting, no text, no letters, no watermark, no logos, isolated subject, plain pure solid white background (#ffffff).';

const SHOTS = [
  { key: 'cash_pile', ar: '1:1',
    prompt: 'A large neat pile of banded bundles of United States hundred-dollar bills stacked into a small pyramid of cash, crisp green banknotes, photorealistic studio product photo.' },
  { key: 'vault', ar: '1:1',
    prompt: 'A heavy round steel bank vault door, polished chrome safe door standing slightly open revealing a softly glowing empty interior, thick locking bolts, modern photorealistic studio product photo.' },
  { key: 'dollar_bill', ar: '4:3',
    prompt: 'A single crisp United States one-dollar bill shown flat and straight from directly above, sharp detailed engraving, photorealistic top-down product shot.' },
  { key: 'tbill', ar: '1:1',
    prompt: 'A single formal United States Treasury bill certificate, an ornate engraved government bond paper document with a decorative border and an embossed seal, photorealistic, shown at a slight three-quarter angle.' },
  { key: 'character', ar: '1:1',
    prompt: 'Cute kawaii sticker-style cartoon mascot illustration with a thick clean rounded black outline and soft flat cel shading: a cheerful confident businessman in a teal suit sitting relaxed on top of a big pile of cash money, hands behind his head, big friendly smile. Simple, centered, full body.' },
  { key: 'bank_building', ar: '3:4',
    prompt: 'A small classical bank building with six tall white columns and a triangular pediment roof, clean and stately, photorealistic architectural front view.' },
  { key: 'company_building', ar: '3:4',
    prompt: 'A single sleek modern glass-and-steel corporate office skyscraper tower, blue reflective windows, clean and tall, photorealistic architectural front view.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: `${shot.prompt} ${STYLE}` }],
    parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: 'allow_adult' },
  };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    if (attempt < 3) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 1800)); return gen(shot, attempt + 1); }
    throw new Error(`${shot.key} failed: ${r.status} ${t.slice(0, 300)}`);
  }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    if (attempt < 3) { console.warn(`  retry ${shot.key} (no bytes)`); await new Promise(s => setTimeout(s, 1800)); return gen(shot, attempt + 1); }
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
