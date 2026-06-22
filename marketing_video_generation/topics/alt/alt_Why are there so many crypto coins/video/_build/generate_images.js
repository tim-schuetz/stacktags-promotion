// Generate the realistic object photos via Google Imagen 4.
// Saves PNGs into ../assets/raw/<key>.png (then cropped by crop_images.py).
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Single object, centered, isolated on a plain pure solid white background, soft even studio lighting, subtle soft contact shadow, photorealistic, high detail, no text, no letters, no caption, no watermark, no logos, no hands.';

const SHOTS = [
  { key: 'bitcoin',  prompt: 'One single shiny gold physical Bitcoin coin standing upright facing the camera, the Bitcoin "B" symbol embossed on its face, glossy metallic gold.' },
  { key: 'ethereum', prompt: 'One single physical Ethereum coin standing upright facing the camera, brushed silver and chrome metal with the Ethereum diamond octahedron symbol embossed on its face.' },
  { key: 'doge',     prompt: 'One cute Shiba Inu dog head, the classic "doge" meme dog, tan and cream fur, looking slightly sideways with a knowing expression, photorealistic studio portrait.' },
  { key: 'snail',    prompt: 'One cute garden snail with a glossy brown spiral shell, crawling slowly, side view, photorealistic macro studio shot.' },
  { key: 'rocket',   prompt: 'One small shiny cartoon-style toy rocket ship, white and turquoise, pointing up and to the right, clean glossy 3d render look.' },
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
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} images via imagen-4.0-generate-001 ...`);
  for (const shot of list) {
    try { await gen(shot); } catch (e) { console.error('  X', e.message); }
  }
  console.log('Done.');
})();
