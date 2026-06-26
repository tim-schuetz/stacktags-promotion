// Generate realistic historical figures for the video (Imagen 4 via Gemini).
// Classical Chinese court-portrait / statue style (authentic, not photoreal cosplay).
// Key read from the bombatags backend .env (not in this lean repo).
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const FIGS = [
  {
    name: 'wuzetian',
    prompt:
      'An antique traditional Chinese hanging-scroll court portrait painting of Empress Wu Zetian ' +
      '(624 to 705 AD), the only woman ever to rule China as emperor. An ancient dignified Chinese ' +
      'empress seated on a throne, wearing an elaborate golden phoenix crown (fengguan) covered with ' +
      'beads and dangling ornaments, and richly embroidered Tang dynasty imperial silk robes. Painted ' +
      'in ink and mineral colour on silk in the classical Chinese court-portrait style, a calm ' +
      'commanding expression, frontal half-length pose, symmetrical. Plain solid light-grey background, ' +
      'soft even lighting, high detail. No text, no modern clothing, no photograph, no border, no frame.',
  },
];

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });

async function genOne(fig) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({
    instances: [{ prompt: fig.prompt }],
    parameters: { sampleCount: 1, aspectRatio: '3:4', personGeneration: 'allow_adult' },
  });
  const out = path.join(outDir, fig.name + '_raw.png');
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const txt = await res.text();
      if (!res.ok) { console.log(fig.name, 'HTTP', res.status, txt.slice(0, 200)); await new Promise(r => setTimeout(r, 2000)); continue; }
      const j = JSON.parse(txt);
      const b64 = j.predictions && j.predictions[0] && j.predictions[0].bytesBase64Encoded;
      if (!b64) { console.log(fig.name, 'no bytes', txt.slice(0, 200)); await new Promise(r => setTimeout(r, 2000)); continue; }
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log('SAVED', out, Math.round(fs.statSync(out).size / 1024), 'KB');
      return true;
    } catch (e) { console.log(fig.name, 'err', e.message); await new Promise(r => setTimeout(r, 2000)); }
  }
  return false;
}

(async () => {
  for (const fig of FIGS) { await genOne(fig); }
  console.log('done');
})();
