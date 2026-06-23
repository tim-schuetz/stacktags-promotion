// Generate the one S3 backdrop photo (pre-dawn far-west street) via Google Imagen 4.
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Photorealistic, cinematic, high detail, moody natural light, no text, no letters, no captions, no watermark, no logos.';
const SHOTS = [
  { key: 'west_street', ar: '16:9', prompt: 'A quiet empty old-town street in Kashgar in far-western China BEFORE dawn: deep blue pre-dawn twilight, the sky still dark, no sun yet, warm street lamps glowing, low traditional Uyghur mud-brick and brick buildings lining a cobbled lane, soft mist, calm and sleepy early morning mood.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: `${shot.prompt} ${STYLE}` }], parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: 'allow_adult' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 3) { await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} ${r.status} ${t.slice(0, 300)}`); }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) { if (attempt < 3) { await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no bytes ${JSON.stringify(j).slice(0, 200)}`); }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}
(async () => { for (const s of SHOTS) { try { await gen(s); } catch (e) { console.error('  ✗', e.message); } } console.log('Done.'); })();
