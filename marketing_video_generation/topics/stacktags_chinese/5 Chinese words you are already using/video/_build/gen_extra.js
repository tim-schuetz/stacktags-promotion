// Generate the v3 extra assets via Imagen 4 into ../assets/raw/.
//  - typhoon: a REAL photo (full scene; presented as a circle, NOT cut out)
//  - englishman / baguette / helmet / rice_table: flat CARTOON on white
//    (then rembg_cut.py -> transparent cut-outs in ../assets/photos/)
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const BGC = 'isolated and perfectly centered on a 100% flat solid pure white background (RGB 255,255,255), the whole background is one plain white colour, NO gradient, NO vignette, NO shadow on the background, NO floor, the subject does not touch the edges.';
const STYLE_PHOTO = 'Photorealistic, cinematic, rich colour, dramatic lighting, no text, no letters, no watermark, no logos.';
const STYLE_CARTOON = 'Clean modern flat 2D cartoon vector illustration, bold clean dark outlines, simple cel shading, vibrant friendly colours, no text, no letters, no watermark, no logos.';

const SHOTS = [
  { key: 'typhoon', ar: '1:1', cartoon: false,
    prompt: 'Satellite top-down view of an enormous spiral typhoon over the sea: a powerful white swirling cyclone with a clear dark eye at its centre, churning over the deep blue Pacific Ocean, immense scale and power.' },
  { key: 'englishman', ar: '3:4', cartoon: true,
    prompt: 'A funny friendly cartoon of a stereotypical posh Englishman, full body standing: neat parted ginger hair on a BARE head (no hat), a big curly handlebar mustache, a monocle, rosy cheeks, a brown tweed three-piece suit with a bow tie, holding a tiny teacup in his left hand, his right hand open and held out to the side ready to catch something.' },
  { key: 'baguette', ar: '1:1', cartoon: true,
    prompt: 'A single French baguette bread loaf, golden crispy crust with diagonal score marks, drawn at a slight diagonal angle.' },
  { key: 'helmet', ar: '1:1', cartoon: true,
    prompt: 'A Roman centurion galea war helmet with a tall bright red horsehair crest plume on top, polished golden bronze metal, three-quarter front view.' },
  { key: 'rice_table', ar: '4:3', cartoon: true,
    prompt: 'A cute white ceramic bowl filled with fluffy steaming white rice, a pair of wooden chopsticks resting across the bowl, the bowl standing on a short slab of warm brown wood.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const full = shot.cartoon ? `${shot.prompt} ${BGC} ${STYLE_CARTOON}` : `${shot.prompt} ${STYLE_PHOTO}`;
  const body = { instances: [{ prompt: full }], parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: 'allow_adult' } };
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
    throw new Error(`${shot.key}: no image bytes.`);
  }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} extra assets via imagen-4.0-generate-001 ...`);
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  X', e.message); } }
  console.log('Done.');
})();
