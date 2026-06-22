// Generate the v2 cartoon images via Imagen 4 → ../assets/raw/<key>.png
// (raw, white background; cut out afterwards with cutout.py / rembg)
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Flat 2D vector cartoon illustration, bold clean dark outlines, simple rounded shapes, limited palette of turquoise green, cream and warm bronze with soft minimal shading, friendly childrens-book style, PLAIN SOLID WHITE BACKGROUND, single subject centered with generous margin, no text, no letters, no watermark, no shadow on the ground.';

const SHOTS = [
  { key: 'official_cartoon', ar: '3:4', prompt: 'A stylized ancient Chinese imperial official, a dignified mandarin in an ornate teal court robe with a square rank badge on the chest and a black gauze official hat with two side wings, standing upright and calm, facing forward, full body.' },
  { key: 'dynasty_vessel',   ar: '1:1', prompt: 'A single ancient Chinese bronze ritual vessel, a ding tripod cauldron with three legs, two handles and engraved taotie motifs, an early-dynasty bronze-age artifact, slightly weathered bronze.' },
  { key: 'bronze_tools',     ar: '1:1', prompt: 'Two ancient Chinese bronze-age artifacts side by side: a bronze spade tool and a curved bronze knife, early dynasty, weathered bronze with patina.' },
  { key: 'ancient_money',    ar: '1:1', prompt: 'A small neat stack of four round ancient Chinese bronze cash coins, each a flat round coin with a square hole punched in the centre, weathered bronze with patina, no faces, no people, only the coins.' },
  { key: 'caravel_only',     ar: '4:3', prompt: 'A 16th-century Portuguese caravel sailing ship with tall billowing white sails and a small flag, and a cheerful Portuguese trader in a feathered explorer hat standing on the deck waving. Show ONLY the ship floating, absolutely NO water, NO sea, NO waves underneath.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: `${shot.prompt} ${STYLE}` }], parameters: { sampleCount: 1, aspectRatio: shot.ar, personGeneration: 'allow_adult' } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 4) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 2500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} ${r.status} ${t.slice(0, 160)}`); }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) { if (attempt < 4) { console.warn(`  retry ${shot.key} (no bytes)`); await new Promise(s => setTimeout(s, 2500)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no bytes`); }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} images ...`);
  for (const s of list) { try { await gen(s); } catch (e) { console.error('  FAIL', e.message); } }
  console.log('Done.');
})();
