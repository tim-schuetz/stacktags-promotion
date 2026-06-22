// Generate transparent cut-out ILLUSTRATIONS for the lion-poem video via
// OpenAI gpt-image-1 (the only provider here that does real transparency —
// Imagen 4 has no alpha channel, and the depth element wants floating cut-outs
// on the white grid). Flat editorial vector style, white + turquoise palette,
// so the 6 cut-outs read as one consistent set.
//   node generate_cutouts.js            # all
//   node generate_cutouts.js poet lion  # only some
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('OPENAI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/cutouts');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Flat modern editorial vector illustration, clean bold shapes, soft cel shading, ' +
  'limited palette of turquoise (#35A292), deep teal (#119271), cream white and warm neutral tones, ' +
  'subtle soft contact shadow, friendly and professional, a single centered full subject, ' +
  'isolated on a fully transparent background. No text, no words, no letters, no border, no frame, no background scenery.';

const SHOTS = [
  { key: 'chao', prompt: 'A warm stylized portrait illustration of an early-20th-century Chinese male linguistics scholar: round eyeglasses, neat side-parted black hair, a 1930s grey suit with a tie, gentle intellectual half-smile. Head-and-shoulders bust, three-quarter view.' },
  { key: 'poet', prompt: 'A cheerful cartoon ancient Chinese scholar-poet standing: long flowing teal and cream silk scholar robe, a black scholar cap, a long thin grey beard, holding an upright calligraphy writing brush. Whole body, lively friendly pose.' },
  { key: 'lion', prompt: 'A lively friendly cartoon lion with a full golden-amber mane, sitting playfully with one paw raised, big expressive happy eyes, warm golden fur. Whole body.' },
  { key: 'stone_lion', prompt: 'A carved grey stone Chinese imperial guardian lion statue (shishi) sitting on a small rectangular stone pedestal, stylized, cool grey granite, curled mane carved in stone, solemn and still. Whole statue.' },
  { key: 'market', prompt: 'A small charming ancient Chinese street market stall: a curved tiled roof, two hanging red-and-cream lanterns, wooden counter with baskets and rolled goods, teal cloth awning. A compact standalone stall, whole object.' },
  { key: 'listener', prompt: 'A confused modern young person standing, both hands raised in a baffled shrug, eyebrows up, mouth in a puzzled "huh?" expression, simple casual teal hoodie and trousers. Whole body, comedic.' },
];

async function gen(shot, attempt = 1) {
  const body = {
    model: 'gpt-image-1',
    prompt: `${shot.prompt} ${STYLE}`,
    n: 1,
    size: '1024x1024',
    quality: 'high',
    background: 'transparent',
    output_format: 'png',
  };
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    if (attempt < 3) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 2500)); return gen(shot, attempt + 1); }
    throw new Error(`${shot.key} failed: ${r.status} ${t.slice(0, 400)}`);
  }
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) {
    if (attempt < 3) { console.warn(`  retry ${shot.key} (no bytes)`); await new Promise(s => setTimeout(s, 2500)); return gen(shot, attempt + 1); }
    throw new Error(`${shot.key}: no image bytes. ${JSON.stringify(j).slice(0, 300)}`);
  }
  const buf = Buffer.from(b64, 'base64');
  const file = path.join(OUT, `${shot.key}.png`);
  fs.writeFileSync(file, buf);
  console.log(`  ✓ ${shot.key}.png (${Math.round(buf.length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} cut-out(s) via gpt-image-1 (transparent) ...`);
  for (const shot of list) {
    try { await gen(shot); } catch (e) { console.error('  ✗', e.message); }
  }
  console.log('Done.');
})();
