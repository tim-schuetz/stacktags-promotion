// Generate CARTOON (Zeichentrick) images via Google Imagen 4 → ../assets/photos/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Flat 2D vector cartoon illustration, bold clean dark outlines, simple rounded shapes, limited palette of turquoise green, cream and white with soft minimal shading, friendly and playful childrens-book style, PLAIN SOLID WHITE BACKGROUND, subject centered with margin, no text, no letters, no watermark, no logo.';

const SHOTS = [
  { key: 'speaker_north', ar: '3:4', prompt: 'A stylized ancient Chinese man, a Han-dynasty commoner with a neat topknot and a simple turquoise robe, standing and speaking with a friendly open expression, one hand raised mid-conversation, facing slightly to the right.' },
  { key: 'speaker_south', ar: '3:4', prompt: 'A stylized ancient Chinese man, a Han-dynasty commoner with a cloth head-wrap and a simple cream-coloured robe, standing and speaking with a friendly open expression, one hand raised mid-conversation, facing slightly to the left.' },
  { key: 'portuguese_cartoon', ar: '4:3', prompt: 'A 16th-century Portuguese merchant sailing ship, a caravel with tall billowing white sails and a small flag, on gentle rolling ocean waves, a cheerful Portuguese trader in a feathered explorer hat standing on the deck and waving, bright age-of-exploration mood.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: `${shot.prompt} ${STYLE}` }], parameters: { sampleCount: 1, aspectRatio: shot.ar, personGeneration: 'allow_adult' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 4) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 2500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} failed: ${r.status} ${t.slice(0, 200)}`); }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) { if (attempt < 4) { console.warn(`  retry ${shot.key} (no bytes)`); await new Promise(s => setTimeout(s, 2500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no bytes ${JSON.stringify(j).slice(0, 200)}`); }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} cartoon images via imagen-4.0 ...`);
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  FAIL', e.message); } }
  console.log('Done.');
})();
