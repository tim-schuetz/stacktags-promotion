// Generate a Tsingtao beer bottle via Google Imagen 4 (Gemini), on a plain
// white bg → ../assets/tsingtao_raw.png. A separate rembg pass cuts it out.
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets');
fs.mkdirSync(OUT, { recursive: true });

const PROMPT = 'A single bottle of Tsingtao beer, upright and centered: a classic green glass beer bottle '
  + 'with the iconic Tsingtao label (a white label with a red banner and the red Tsingtao emblem), gold crown cap, '
  + 'realistic condensation, studio product photograph on a pure plain solid white background, soft even lighting, '
  + 'sharp focus, the whole bottle fully visible. No people, no extra objects, no surrounding scene.';

async function gen(attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: PROMPT }], parameters: { sampleCount: 1, aspectRatio: '3:4', personGeneration: 'dont_allow' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    if (attempt < 3) { console.warn('retry', r.status); await new Promise(s => setTimeout(s, 1500)); return gen(attempt + 1); }
    throw new Error('failed: ' + r.status + ' ' + t.slice(0, 300));
  }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    if (attempt < 3) { console.warn('retry (no bytes)'); await new Promise(s => setTimeout(s, 1500)); return gen(attempt + 1); }
    throw new Error('no image bytes: ' + JSON.stringify(j).slice(0, 300));
  }
  const file = path.join(OUT, 'tsingtao_raw.png');
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log('✓ tsingtao_raw.png', Math.round(Buffer.from(b64, 'base64').length / 1024), 'KB');
}
gen().catch(e => { console.error(e.message); process.exit(1); });
