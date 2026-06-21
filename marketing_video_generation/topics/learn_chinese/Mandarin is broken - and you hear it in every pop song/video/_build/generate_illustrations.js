// Generate FREESTANDING CUT-OUT illustrations (transparent background) for the
// creative gap-filling beats — figures that fly in via the depth camera instead
// of echoing the spoken line as on-screen text.
// Uses OpenAI gpt-image-1 (background:transparent) — Imagen can't do alpha cut-outs.
// Saves transparent PNGs into ../assets/illus/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('OPENAI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/illus');
fs.mkdirSync(OUT, { recursive: true });

// shared house style — flat, on-brand (teal + cream + soft grey), cut-out
const STYLE = 'Flat modern editorial vector illustration, clean and minimal, smooth simple shapes with subtle soft shading. Limited palette dominated by teal/turquoise (#35A292) and deep teal (#119271), with warm cream off-white and soft grey accents. Friendly and a little humorous, gentle stereotype, single centered full-body subject, clear silhouette. NO text, no letters, no logos, no frame, no ground shadow. Fully TRANSPARENT background, crisp clean cut-out.';

const SHOTS = [
  { key: 'tang_poet',
    prompt: 'A Tang-dynasty Chinese scholar-poet standing in flowing elegant hanfu robes, a calligraphy brush in one hand and an open bamboo scroll in the other, a small crescent-moon ink motif beside him, serene golden-age poise, gentle smile.' },
  { key: 'pop_singer',
    prompt: 'A modern pop singer mid-performance, holding a microphone close to the mouth, eyes shut, mouth wide open belting a long held note, a few small musical notes floating nearby, relaxed dynamic pose, trendy casual outfit, expressive and slightly funny.' },
];

async function gen(shot, attempt = 1) {
  const body = {
    model: 'gpt-image-1',
    prompt: `${shot.prompt} ${STYLE}`,
    n: 1,
    size: '1024x1536',
    quality: 'high',
    background: 'transparent',
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
  if (!b64) throw new Error(`${shot.key}: no image bytes. ${JSON.stringify(j).slice(0, 300)}`);
  const file = path.join(OUT, `${shot.key}.png`);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} cut-out illustration(s) via gpt-image-1 ...`);
  for (const shot of list) {
    try { await gen(shot); } catch (e) { console.error('  X', shot.key, e.message); }
  }
  console.log('Done.');
})();
