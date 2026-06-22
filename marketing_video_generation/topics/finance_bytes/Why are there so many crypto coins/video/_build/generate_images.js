// Generate the crypto images via Google Imagen 4. Plain WHITE backgrounds so rembg
// can cut them cleanly. Saves PNGs into ../assets/img/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(OUT, { recursive: true });

const NOTEXT = 'No text, no letters, no words, no captions, no watermark, no logos.';

const SHOTS = [
  { key: 'bitcoin',
    prompt: `A single physical Bitcoin coin: shiny polished gold metal with one large clearly embossed Bitcoin symbol in the very center — the capital letter B with two short vertical strokes crossing through it (₿) — clean and centered, photorealistic studio product shot, soft reflections, gentle top light, isolated on a plain pure solid white background. Only that single B symbol, no other text. ${NOTEXT}` },
  { key: 'coin-dog',
    prompt: `A cute funny cartoon meme coin: a round gold coin token with a goofy smiling Shiba Inu doge dog face on it, flat vector sticker illustration, bold clean outlines, playful, centered, isolated on a plain pure solid white background. ${NOTEXT}` },
  { key: 'coin-celeb',
    prompt: `A funny cartoon meme coin: a round gold coin token with a smug cool grinning face wearing black sunglasses, flat vector sticker illustration, bold clean outlines, playful, centered, isolated on a plain pure solid white background. ${NOTEXT}` },
  { key: 'coin-moon',
    prompt: `A funny cartoon meme coin: a round gold coin token with a little cartoon rocket blasting off toward a crescent moon on its face, flat vector sticker illustration, bold clean outlines, playful, centered, isolated on a plain pure solid white background. ${NOTEXT}` },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: shot.prompt }], parameters: { sampleCount: 1, aspectRatio: '1:1' } };
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
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  ✗', e.message); } }
  console.log('Done.');
})();
