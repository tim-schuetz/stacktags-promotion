// Generate individual NON-realistic (illustration) houses at night, on white bg,
// for a cut-out dark-city row in S3.
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/photos');

const STYLE = 'Simple flat 2D vector illustration, minimal cartoon drawing style, clean bold outlines, NIGHT scene: dark slate-blue facade with a few warm glowing yellow lit windows. A single building, centered, isolated on a plain solid pure white background. No ground, no people, no text, no watermark.';
const SHOTS = [
  { key: 'house1', prompt: 'A small one-story house with a pitched roof.' },
  { key: 'house2', prompt: 'A narrow two-story townhouse with a flat roof.' },
  { key: 'house3', prompt: 'A small traditional Uyghur flat-roofed mud-brick house.' },
  { key: 'house4', prompt: 'A modest three-story apartment building.' },
  { key: 'house5', prompt: 'A little shop-house with an awning over the door.' },
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
