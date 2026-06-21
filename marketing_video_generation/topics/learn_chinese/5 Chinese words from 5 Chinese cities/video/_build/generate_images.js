// Generate the 5 city skyline photos via Google Imagen 4.
// Saves PNGs into ../assets/photos/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Photorealistic, cinematic wide shot, high detail, rich color, postcard-perfect composition, no text, no letters, no captions, no watermark, no logos.';

const SHOTS = [
  { key: 'shanghai', prompt: 'The Shanghai skyline at golden dusk: the Bund waterfront looking across the Huangpu River to the Pudong financial district with the Oriental Pearl Tower and tall glittering skyscrapers, warm city lights beginning to reflect on the water.' },
  { key: 'beijing',  prompt: 'The Forbidden City in Beijing: the grand crimson-and-gold imperial palace gate with traditional sweeping tiled rooftops and a wide symmetrical stone courtyard, clear blue sky, warm golden-hour light.' },
  { key: 'nanjing',  prompt: 'The ancient Nanjing city wall: a massive weathered grey stone fortification with a traditional Chinese gate tower on top, lush green trees along its base, calm soft daylight.' },
  { key: 'qingdao',  prompt: 'The old town of Qingdao from a gentle elevated angle: rows of charming European-style buildings with distinctive red-tiled roofs descending toward a deep blue bay, a church spire among them, bright sunny day.' },
  { key: 'hongkong', prompt: 'The Hong Kong Victoria Harbour skyline at night: a dense wall of brightly illuminated skyscrapers rising along the waterfront, colorful neon and window lights mirrored in the dark harbour water, a traditional boat crossing.' },
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
