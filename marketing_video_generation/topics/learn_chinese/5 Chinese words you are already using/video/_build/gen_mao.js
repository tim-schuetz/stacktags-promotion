// Generate a friendly flat-cartoon Mao portrait via Imagen 4 -> ../assets/raw/mao.png
// (then rembg_cut.py mao -> transparent cut-out). Calm "sticker clipart" phrasing
// so Imagen returns the subject, not unrelated stock.
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');

const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const BGC = 'isolated and perfectly centered on a 100% flat solid pure white background (RGB 255,255,255), the whole background is one plain white colour, NO gradient, NO vignette, NO shadow on the background, NO floor, the subject does not touch the edges.';
const STYLE_CARTOON = 'Clean modern flat 2D cartoon vector illustration, bold clean dark outlines, simple cel shading, vibrant friendly colours, no text, no letters, no watermark, no logos.';

const SHOT = {
  key: 'mao', ar: '3:4',
  prompt: 'A friendly cartoon caricature portrait of Mao Zedong, the Chinese leader of the 1940s, instantly recognizable: a broad round face with full cheeks, a very high broad forehead with a receding hairline, thick black hair combed straight back, calm faint closed-mouth smile, the small signature mole just below the centre of his lower lip, wearing a buttoned-up grey Zhongshan (Mao) tunic suit with a mandarin stand-up collar, head and shoulders, facing slightly to one side.'
};

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const full = `${shot.prompt} ${BGC} ${STYLE_CARTOON}`;
  const body = { instances: [{ prompt: full }], parameters: { sampleCount: 1, aspectRatio: shot.ar || '3:4', personGeneration: 'allow_adult' } };
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
  console.log('Generating mao via imagen-4.0-generate-001 ...');
  try { await gen(SHOT); } catch (e) { console.error('  X', e.message); process.exitCode = 1; }
  console.log('Done.');
})();
