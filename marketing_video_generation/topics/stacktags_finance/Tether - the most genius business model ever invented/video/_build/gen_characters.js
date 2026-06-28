// Generate brand-consistent MODERN flat-cartoon characters via Imagen 4.
// Single full-body figure, plain white bg, consistent flat-vector style.
// Saves ../assets/figures/<key>.png  (cut out later with rembg, NO dashed outline)
const fs = require('fs');
const path = require('path');

function loadKey() {
  for (const p of ['C:/software_projekte/stacktags-promotion/.env',
                   'C:/software_projekte/bombatags/application/backend/.env']) {
    try { const k = (fs.readFileSync(p, 'utf8').match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim(); if (k) return k; } catch {}
  }
  throw new Error('GEMINI_API_KEY not found');
}
const KEY = loadKey();
const OUT = path.resolve(__dirname, '../assets/figures');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Flat 2D vector cartoon illustration, clean modern flat style, bold smooth dark outlines, simple flat shapes, soft minimal shading, friendly and approachable, FULL BODY head to feet, standing, centered, isolated on a plain solid pure white background. Subtle teal/turquoise (#35A292) accent in the clothing. Consistent character-design style across the set. No text, no letters, no numbers, no watermark, no logo, no extra objects.';

const SHOTS = [
  { key: 'founder', prompt: 'A calm, slightly smug male startup founder in a smart dark business suit, hands relaxed at his sides, a subtle knowing little smile, confident and composed.' },
  { key: 'trader',  prompt: 'A young eager crypto trader, casual hoodie and jeans, holding up a smartphone in one hand, leaning forward with an excited expression.' },
  { key: 'person',  prompt: 'A simple ordinary standing person in plain neutral casual clothes, arms at sides, neutral calm expression, generic everyman.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: `${shot.prompt} ${STYLE}` }],
    parameters: { sampleCount: 1, aspectRatio: '3:4', personGeneration: 'allow_adult' },
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
    throw new Error(`${shot.key}: no image bytes`);
  }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} characters ...`);
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  ✗', e.message); } }
  console.log('Done.');
})();
