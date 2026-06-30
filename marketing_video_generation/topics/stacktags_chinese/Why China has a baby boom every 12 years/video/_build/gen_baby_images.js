// Generate the photo/illustration assets for the revised video via Google Imagen 4.
//   node gen_baby_images.js              # all
//   node gen_baby_images.js couple baby # some
// Output → assets/raw/<key>.png  (then rembg-cut + dashed outline in Python).
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const WHITE = 'plain solid pure white seamless background, soft even studio lighting, gentle soft contact shadow, high detail, no text, no letters, no captions, no watermark, no logos.';
const OBJ = 'Photorealistic, single subject, centered, ' + WHITE + ' no people.';

const SHOTS = [
  // the planning couple (belief)
  { key: 'couple', ar: '1:1', person: 'allow_adult',
    prompt: 'A happy young East Asian couple, a man and a woman in their early thirties standing close together, both smiling warmly and looking up with hope, the woman gently resting one hand on her belly, simple casual modern clothing in soft neutral and muted teal tones, full body, ' + WHITE },
  // the realistic dragon-baby (twist hero)
  { key: 'baby_real', ar: '1:1', person: 'allow_all',
    prompt: 'A cute chubby happy East Asian baby about eight months old, sitting upright and smiling, wearing a soft plain teal onesie, full body, ' + WHITE },
  // the simple stick-figure baby doodle (replicated into the crowd)
  { key: 'baby_stick', ar: '1:1', person: 'allow_all',
    prompt: 'A very simple minimalist hand-drawn black ink doodle of a baby: a thin single-weight black outline, round head with one tiny curl of hair, two small dot eyes and a small smile, a simple rounded swaddled body, childlike stick-figure doodle style, no shading, no fill, pure black lines only on a plain solid white background.' },
  // the three life stages (school / university / job) that pop up below
  { key: 'school', ar: '1:1', person: 'dont_allow',
    prompt: 'A small friendly primary school building with a pitched roof, a simple clock above the entrance and a flagpole, bright and clean, ' + OBJ },
  { key: 'university', ar: '1:1', person: 'dont_allow',
    prompt: 'A grand university building facade with tall classical columns, a triangular pediment and a central clock tower, prestigious campus architecture, completely blank stone facade with absolutely NO signage, NO words, NO letters, NO text or writing anywhere on the building, ' + OBJ },
  { key: 'office', ar: '1:1', person: 'dont_allow',
    prompt: 'A modern corporate office tower: a single tall glass-and-steel high-rise office building, contemporary blue-glass skyscraper, clean isolated, no other buildings, ' + OBJ },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: shot.prompt }], parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: shot.person || 'dont_allow' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 3) { await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} ${r.status} ${t.slice(0, 300)}`); }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) { if (attempt < 3) { await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no bytes ${JSON.stringify(j).slice(0, 240)}`); }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}
(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  for (const s of list) { try { await gen(s); } catch (e) { console.error('  ✗', e.message); } }
  console.log('Done.');
})();
