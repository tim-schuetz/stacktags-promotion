// Generate this video's photos via Google Imagen 4. Saves to ../assets/raw/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Photorealistic, cinematic, high detail, rich natural color, clean composition, no text, no letters, no captions, no watermark, no logos, no people.';

const SHOTS = [
  // The real Dungan Mosque of Karakol, Kyrgyzstan — a mosque built like a Chinese
  // Buddhist temple (upturned painted eaves, no nails). A genuine, surprising
  // landmark of the Dungan, on a plain background so it cuts out cleanly.
  { key: 'karakol_mosque', ratio: '4:3', prompt: 'The Dungan Mosque of Karakol in Kyrgyzstan: an ornate single-storey wooden mosque built in the style of a Chinese Buddhist temple, with multi-tiered upturned eaves and a roof painted in bright red, green and yellow, carved wooden pillars and decorative brackets, isolated as a single building on a plain pale background, soft even daylight, full building visible and centered.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: `${shot.prompt} ${STYLE}` }],
    parameters: { sampleCount: 1, aspectRatio: shot.ratio || '1:1', personGeneration: 'dont_allow' },
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
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} image(s) via imagen-4.0-generate-001 ...`);
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  ✗', e.message); } }
  console.log('Done.');
})();
