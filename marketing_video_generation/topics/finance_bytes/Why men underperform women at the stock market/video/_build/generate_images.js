// Generate the character images via Google Imagen 4. Saves PNGs into ../assets/photos/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/photos');
fs.mkdirSync(OUT, { recursive: true });

// One shared style so the two characters pair visually and match the Stacktags look.
const STYLE = 'Modern flat vector cartoon illustration, bold clean shapes with subtle soft shading, '
  + 'color palette limited to turquoise teal (#35A292), white, and dark slate navy ink outlines, '
  + 'with small red and green stock-chart accents. Friendly and slightly humorous character design. '
  + 'Full body, single subject, centered, generous empty margin around the subject, '
  + 'isolated on a pure solid plain white #ffffff background. No text, no letters, no numbers, no logos, no watermark.';

const SHOTS = [
  { key: 'trader_man',
    prompt: 'A stressed, over-confident young male day-trader in a wrinkled dress shirt with a loose tie, '
      + 'sitting and leaning forward frantically, eyes wide, sweat droplets flying, both hands up in panic, '
      + 'surrounded by a couple of small floating screens showing jagged red and green candlestick charts. '
      + 'He looks hyperactive and overwhelmed, doing way too much.' },
  { key: 'calm_woman',
    prompt: 'A calm, relaxed female investor sitting comfortably and leaning back in a chair with a serene, '
      + 'confident little smile, holding a warm cup of coffee in one hand, totally at ease. '
      + 'Beside her floats one tidy screen showing a single smooth steadily-rising green line. '
      + 'She looks patient and unbothered, doing almost nothing.' },
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
