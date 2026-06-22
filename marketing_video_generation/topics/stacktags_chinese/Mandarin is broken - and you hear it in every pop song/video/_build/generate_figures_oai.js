// Speaker figures as TRANSPARENT cut-outs via OpenAI gpt-image-1 (native alpha,
// same pipeline/style as the Tang poet). Fallback when Imagen+chroma fails.
// Output: ../assets/cutouts/<key>.png
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('OPENAI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/cutouts');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Flat modern editorial vector illustration, clean and minimal, smooth simple shapes with subtle soft shading. Limited palette dominated by teal/turquoise (#35A292) and deep teal (#119271), with warm cream off-white and soft grey accents. Friendly and a little humorous, single centered full-body subject, clear silhouette. NO text, no logos, no frame, no ground shadow. Fully TRANSPARENT background, crisp clean cut-out.';

const SHOTS = [
  { key: 'speaker_mandarin',
    prompt: 'A friendly modern young Chinese man standing, casual streetwear hoodie in teal, one hand raised mid-gesture as if talking, mouth open speaking, relaxed and a bit goofy.' },
  { key: 'speaker_cantonese',
    prompt: 'A friendly modern young Chinese woman standing, casual chic outfit in cream and teal, confident upright posture, one hand gesturing as if speaking clearly, warm smile.' },
  { key: 'temple', size: '1024x1024',
    prompt: 'A single traditional Chinese temple / pagoda building seen straight on, tiered upturned teal-green tiled roofs, cream walls, red-and-gold accents kept subtle, a couple of steps at the base. Centered, no surroundings, no ground, no people.' },
];

async function gen(shot, attempt = 1) {
  const body = { model: 'gpt-image-1', prompt: `${shot.prompt} ${STYLE}`, n: 1, size: shot.size || '1024x1536', quality: 'high', background: 'transparent' };
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` }, body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    if (attempt < 3 && r.status !== 429) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 2500)); return gen(shot, attempt + 1); }
    throw new Error(`${shot.key} failed: ${r.status} ${t.slice(0, 200)}`);
  }
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${shot.key}: no bytes`);
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)}KB, transparent)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} figure(s) via gpt-image-1 (transparent) ...`);
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  X', e.message); } }
  console.log('Done.');
})();
