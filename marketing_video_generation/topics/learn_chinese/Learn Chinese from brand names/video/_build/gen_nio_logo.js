// Generate the NIO emblem via Google Imagen 4 (Gemini) on a plain white bg →
// ../assets/nio_logo_raw_<n>.png. A separate rembg pass cuts it out. (Per
// specific_tools_instructions/crop_images.md.)
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets');

const PROMPT = 'The NIO electric-car brand emblem, the icon mark only, in one single solid dark charcoal-grey colour '
  + 'on a pure plain solid white background. The emblem has two parts: (1) on TOP, a smooth rounded arch — a filled '
  + 'half-circle dome shape like a rising sun or an upside-down U — symbolising the open sky; (2) directly BELOW it, '
  + 'separated by a small gap, two bold vertical bars that taper and get narrower toward the bottom, symbolising the '
  + 'road ahead. Minimalist, flat, perfectly symmetrical, centered, clean vector logo. No text, no letters, no words, '
  + 'no circular border, no extra shapes, no background scene.';

async function gen(n, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: PROMPT }], parameters: { sampleCount: 4, aspectRatio: '1:1', personGeneration: 'dont_allow' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    if (attempt < 3) { console.warn('retry', r.status); await new Promise(s => setTimeout(s, 1500)); return gen(n, attempt + 1); }
    throw new Error('failed: ' + r.status + ' ' + t.slice(0, 300));
  }
  const j = await r.json();
  const preds = j.predictions || [];
  preds.forEach((p, i) => {
    if (p.bytesBase64Encoded) {
      fs.writeFileSync(path.join(OUT, `nio_logo_raw_${i + 1}.png`), Buffer.from(p.bytesBase64Encoded, 'base64'));
      console.log(`✓ nio_logo_raw_${i + 1}.png`);
    }
  });
}
gen().catch(e => { console.error(e.message); process.exit(1); });
