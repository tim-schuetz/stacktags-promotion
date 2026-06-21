// Generate the cinematic photos for the video via Google Imagen 4.
// Saves PNGs into ../assets/photos/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Photorealistic, cinematic, dramatic lighting, high detail, rich color, epic composition, shallow depth of field, no text, no letters, no captions, no watermark, no logos, no modern signage.';

const SHOTS = [
  // Hook — establishing shot of China after the globe zoom-in
  { key: 'china_land', prompt: 'The Great Wall of China snaking dramatically over green misty mountain ridges at golden sunrise, layered peaks fading into atmospheric haze, sweeping aerial wide shot, ancient and majestic.' },
  // Han dynasty officials — the "robed officials settle on one spoken standard" beat
  { key: 'han_officials', prompt: 'Ancient Chinese imperial officials in elegant flowing silk robes and traditional black gauze hats standing in a grand palace hall with red lacquered columns and golden carved beams, soft warm light from tall windows, dignified and historic, Han dynasty atmosphere.' },
  // Portuguese ship — the "Portuguese traders reach China in the 1500s" beat
  { key: 'portuguese_ship', prompt: 'A 16th-century Portuguese carrack sailing ship with tall masts and billowing sails arriving at a misty Chinese port at dawn, traditional Chinese junk boats and a tiled-roof harbor town in the background, calm reflective water, cinematic age-of-exploration mood.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = {
    instances: [{ prompt: `${shot.prompt} ${STYLE}` }],
    parameters: { sampleCount: 1, aspectRatio: '1:1', personGeneration: 'allow_adult' },
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
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} images via imagen-4.0-generate-001 ...`);
  for (const shot of list) {
    try { await gen(shot); } catch (e) { console.error('  ✗', e.message); }
  }
  console.log('Done.');
})();
