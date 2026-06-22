// Generate hero images via Google Imagen 4 (Gemini API). Saves raw renders to
// ../assets/raw/<key>.png. Then rembg_cut.py -> ../assets/photos (transparent).
// Cartoon characters: flat explainer-style illustration. Objects: photoreal.
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

// flat chroma background that rembg/keying separates cleanly. Magenta — none of
// our subjects are magenta.
const BG = 'isolated and perfectly centered on a 100% flat solid uniform chroma-key magenta background (pure RGB 255,0,255), the whole background one single even magenta colour, NO gradient, NO vignette, NO shadow on the background, NO floor, the subject does not touch the edges';
const PHOTO = 'Photorealistic, cinematic, high detail, rich colour, crisp studio product lighting, sharp focus on the subject, no text, no letters, no captions, no watermark, no logos.';
const CARTOON = 'Flat modern vector cartoon illustration for an explainer video, bold clean dark outline, smooth simple shading, friendly characterful, single character, no text, no letters, no watermark.';

const SHOTS = [
  { key: 'hacker_loot', ar: '3:4',
    prompt: 'A sneaky cartoon computer hacker character, a person wearing a dark charcoal-grey hoodie with the hood up casting a shadow over the eyes, a sly confident grin, holding up a big bulging sack of glowing golden coins money over one shoulder, the other hand giving a thumbs up, full body, standing pose. ' + CARTOON },
  { key: 'hacker_stuck', ar: '3:4',
    prompt: 'A frustrated cartoon computer hacker character, the same person wearing a dark charcoal-grey hoodie with the hood up, anxious worried face, sweating with one big sweat drop, both hands thrown up in confusion and helplessness, shrugging shoulders, full body, standing pose. ' + CARTOON },
  { key: 'coin', ar: '1:1',
    prompt: 'A single shiny polished golden crypto coin, plain smooth blank metallic gold disc, slightly tilted three-quarter view, clean reflective gold surface, completely BLANK face with NO symbol and NO letters engraved, one coin only. ' + PHOTO },
  { key: 'tumbler', ar: '1:1',
    prompt: 'A shiny stainless-steel rotating drum tumbler machine, like a polished metal mixing barrel or lottery drum on a small stand, a round metal cylinder mixer with a small hatch opening, brushed metal, three-quarter view, one machine only. ' + PHOTO },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: `${shot.prompt} ${BG}` }],
    parameters: { sampleCount: 1, aspectRatio: shot.ar || '1:1', personGeneration: 'allow_adult' },
  };
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
    throw new Error(`${shot.key}: no image bytes. ${JSON.stringify(j).slice(0, 300)}`);
  }
  const file = path.join(OUT, `${shot.key}.png`);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} renders via imagen-4.0-generate-001 ...`);
  for (const shot of list) {
    try { await gen(shot); } catch (e) { console.error('  X', e.message); }
  }
  console.log('Done.');
})();
