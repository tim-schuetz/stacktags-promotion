// Generate the geography payoff images via Google Imagen 4.
// Used only for the "head south to Hong Kong / Guangdong" globe→photo
// transition. The rest of this (technical/linguistics) video stays graphic.
// Saves PNGs into ../assets/photos/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Photorealistic, cinematic, high detail, rich color, dramatic atmospheric lighting, no text, no letters, no captions, no watermark, no logos.';

const SHOTS = [
  { key: 'hongkong', ar: '9:16',
    prompt: 'Hong Kong Victoria Harbour at golden hour seen from Victoria Peak: a dense skyline of glittering skyscrapers along the water, green forested hills in the foreground, junk boats and ferries on the harbour, distant misty mountains of Guangdong on the far shore, warm cinematic glow, breathtaking vertical cityscape.' },
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
  console.log(`Generating ${list.length} image(s) via imagen-4.0-generate-001 ...`);
  for (const shot of list) {
    try { await gen(shot); } catch (e) { console.error('  ✗', e.message); }
  }
  console.log('Done.');
})();
