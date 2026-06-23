// Generate the 3 S7 objects (bus / shop / dinner) on plain white bg for clean cutout.
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Single object, centered, isolated on a plain solid pure white background, soft realistic studio lighting, subtle soft shadow, photorealistic, high detail, no text, no watermark, no other objects.';
const SHOTS = [
  { key: 'obj_bus', prompt: 'A single small modern city public bus, clean three-quarter side view.' },
  { key: 'obj_shop', prompt: 'A single small neighborhood convenience-store shop front with a green awning and a roll-up shutter, front view.' },
  { key: 'obj_dinner', prompt: 'A single bowl of steaming Chinese noodle soup with a pair of chopsticks resting across the rim, three-quarter view.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: `${shot.prompt} ${STYLE}` }], parameters: { sampleCount: 1, aspectRatio: '1:1', personGeneration: 'dont_allow' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 3) { await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} ${r.status} ${t.slice(0, 200)}`); }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) { if (attempt < 3) { await new Promise(s => setTimeout(s, 1500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no bytes`); }
  fs.writeFileSync(path.join(OUT, `${shot.key}_raw.png`), Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${shot.key}_raw.png`);
}
(async () => { for (const s of SHOTS) { try { await gen(s); } catch (e) { console.error('  ✗', e.message); } } console.log('Done.'); })();
