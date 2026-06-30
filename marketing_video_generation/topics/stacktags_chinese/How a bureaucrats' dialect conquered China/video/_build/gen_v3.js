// v3 cartoon images via Imagen 4 → ../assets/raw/<key>.png  (cut out afterwards)
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Flat 2D vector cartoon illustration, bold clean dark outlines, simple rounded shapes, limited palette of turquoise green, cream and warm wood/bronze with soft minimal shading, friendly childrens-book style, PLAIN SOLID WHITE BACKGROUND, single subject centered with generous margin, no text, no letters, no watermark, no ground shadow.';

const SHOTS = [
  // Han dynasty RULER — the "the dynasty after it did: the Han" (汉) beat
  { key: 'han_emperor', ar: '3:4', prompt: 'A majestic ancient Chinese HAN DYNASTY EMPEROR standing regally in full body front view, wearing a flowing golden imperial-yellow silk dragon robe with wide draping sleeves and a jade waist belt, and the flat-board imperial crown (mianguan): a flat rectangular black-and-gold board on top of the head with rows of hanging white jade bead strings dangling in front, calm dignified powerful expression, long thin beard, hands clasped together in front. Regal, authoritative, the founding ruler. Gold and imperial yellow robe with subtle turquoise-green and bronze accents.' },
  { key: 'pict_house',  ar: '1:1', prompt: 'A simple cute house with a peaked roof, a door and one window, front view.' },
  { key: 'pict_horse',  ar: '1:1', prompt: 'A cute cartoon brown PONY HORSE ANIMAL, standing in clean side profile, full body with four slender legs clearly visible, a flowing mane along the neck and a long swishing tail, head turned slightly, calm friendly expression, definitely a four-legged horse animal, no humans, no people, no riders.' },
  { key: 'pict_person', ar: '1:1', prompt: 'A single stylized ancient Chinese figure wearing a long flowing traditional hanfu robe with wide draping sleeves and a waist sash, hands tucked together in front, standing calmly upright, front view, full body, serene expression, simple topknot hair.' },
  { key: 'temple',      ar: '4:3', prompt: 'An ancient Chinese temple hall / palace with a tiered upturned tiled roof, red lacquered columns and a stone platform, classic Han-era architecture, front three-quarter view.' },
  { key: 'school',      ar: '1:1', prompt: 'A school building with a clock or small bell tower, a door and rows of windows, front view.' },
  { key: 'radio',       ar: '1:1', prompt: 'A vintage wooden tabletop RADIO RECEIVER, a rectangular box with a round mesh speaker grille, two round tuning dials, and a thin telescopic antenna sticking up; a retro electronic radio device, definitely not food, no cake.' },
  { key: 'tv',          ar: '1:1', prompt: 'A vintage cathode-ray television set with two antenna rabbit-ears and short legs, front view.' },
  { key: 'portuguese_building', ar: '3:4', prompt: 'A grand Portuguese colonial building in the Manueline style: white-washed stone walls with a terracotta tiled roof, tall arched windows, a small bell tower with a cross, ornate stone carving around the doorway, and blue-and-white azulejo tile accents, front three-quarter view, a single standalone building.' },
  // deliberately bad, wonky doodles (black lines only) for "standardized the writing"
  { key: 'doodle_house',  ar: '1:1', prompt: 'A 4-year-old child\'s first crayon scribble of a HOUSE, EXTREMELY crude and ultra-simple: just one wonky crooked square box with a lopsided triangle roof balanced on top and a tiny crooked rectangle door, maybe one wobbly square window — nothing else. Only about 6 shaky wobbly thick black marker strokes, barely meeting at the corners, deliberately terrible and childish, almost like stick-figure simplicity. Flat 2D, pure black outline strokes on pure white, strictly black and white, NO grey, NO shading, NO fill, NO detail, NOT a cartoon, no 3D, no text.' },
  { key: 'doodle_horse',  ar: '1:1', prompt: 'A 4-year-old child\'s first crayon scribble of a HORSE, EXTREMELY crude and ultra-simple: just one wonky potato/bean-shaped blob body, four straight stick legs, a stick neck with a small blob head, and one line for a tail — nothing else, almost unrecognizable. Only about 8 shaky wobbly thick black marker strokes, deliberately terrible and childish, stick-figure simplicity. Flat 2D, pure black outline strokes on pure white, strictly black and white, NO grey, NO shading, NO fill, NO detail (no mane, no hooves, no muscles), NOT a cartoon, no 3D, no text.' },
  { key: 'doodle_person', ar: '1:1', prompt: 'A super ugly crude doodle scribbled in 5 seconds by a small child with a thick black felt-tip marker: a wonky lopsided standing PERSON, crooked shaky wobbly uneven lines that barely meet, deliberately bad, clumsy and amateurish, very simple, naive outsider-art scribble, flat 2D, pure black marker outline strokes on a pure white background, strictly black-and-white only, absolutely NO grey, NO shading, NO fill, NOT a polished cartoon, no 3D, no text.' },
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
