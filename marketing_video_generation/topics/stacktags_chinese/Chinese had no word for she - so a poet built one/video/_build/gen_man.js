// Generate a young Chinese man (~1920) for the "he" referent in the he/she/it trio.
// Deliberately DIFFERENT from the scholar Liu Bannong (no glasses, plainer) to avoid confusion.
const fs = require('fs');
const path = require('path');
const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const prompt =
  'A photorealistic studio portrait of a young Chinese man from the early Republican era, ' +
  'around 1920, in his early twenties. Short neat side-parted hair, NO glasses, clean-shaven, ' +
  'friendly calm neutral expression, wearing a simple dark mandarin-collar jacket. ' +
  'Head-and-shoulders, three-quarter view, looking slightly off camera. Soft even studio ' +
  'lighting, muted natural colours, a single plain solid light-grey backdrop, sharp focus, ' +
  'fine detail, no text, no border, no props, no glasses.';

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'man_raw.png');

(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4', personGeneration: 'allow_adult' } });
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const txt = await res.text();
      if (!res.ok) { console.log('HTTP', res.status, txt.slice(0, 200)); await new Promise(r => setTimeout(r, 1800)); continue; }
      const b64 = JSON.parse(txt).predictions?.[0]?.bytesBase64Encoded;
      if (!b64) { console.log('no bytes', txt.slice(0, 200)); await new Promise(r => setTimeout(r, 1800)); continue; }
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log('SAVED', out, Math.round(fs.statSync(out).size / 1024), 'KB'); return;
    } catch (e) { console.log('err', e.message); await new Promise(r => setTimeout(r, 1800)); }
  }
  process.exit(1);
})();
