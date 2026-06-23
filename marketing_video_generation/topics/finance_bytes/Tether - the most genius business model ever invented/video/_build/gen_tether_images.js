// Generate the photographic props via Google Imagen 4. Single isolated objects on
// a plain solid white background (so rembg can cut them out cleanly), no text.
// Saves PNGs into ../assets/photos/<key>.png
const fs = require('fs');
const path = require('path');

function loadKey() {
  const candidates = [
    'C:/software_projekte/stacktags-promotion/.env',
    'C:/software_projekte/bombatags/application/backend/.env',
  ];
  for (const p of candidates) {
    try {
      const t = fs.readFileSync(p, 'utf8');
      const k = (t.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
      if (k) return k;
    } catch {}
  }
  throw new Error('GEMINI_API_KEY not found');
}
const KEY = loadKey();

const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Single object, centered, isolated on a plain solid pure white background, soft even studio lighting, subtle soft shadow, photorealistic, high detail, sharp focus, product photography. No text, no letters, no captions, no watermark, no logos, no extra objects.';

const SHOTS = [
  { key: 'dollar',   prompt: 'A single crisp US one-dollar bill lying flat at a slight three-quarter angle.' },
  { key: 'vault',    prompt: 'A single heavy steel bank vault with its round door swung open, revealing neat stacks of US dollar cash inside, chrome locking wheel on the door.' },
  { key: 'office',   prompt: 'A single small modern minimalist glass-and-steel office building, a low two-story corporate cube, clean architecture, seen from a slight downward three-quarter angle.' },
  { key: 'magnifier', prompt: 'A single classic magnifying glass with a polished metal rim and a dark handle, lens facing the camera at a slight angle.' },
  { key: 'cash',     prompt: 'A single neat banded brick bundle of US one-hundred-dollar bills, crisp stacked banknotes wrapped with a paper band.' },
  { key: 'company',  prompt: 'A single tall modern corporate skyscraper office tower, a sleek glass high-rise headquarters building, seen from a slight upward three-quarter angle.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: `${shot.prompt} ${STYLE}` }],
    parameters: { sampleCount: 1, aspectRatio: '1:1', personGeneration: 'dont_allow' },
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
