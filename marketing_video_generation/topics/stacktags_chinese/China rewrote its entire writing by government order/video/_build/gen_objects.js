// Generate clean single-object images for the table's left column (Imagen 4 via Gemini),
// on a plain white background so they cut out cleanly.
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const JOBS = [
  { name: 'horse', prompt: 'A single brown horse standing in profile, full body, simple and clear, centered, on a plain solid pure white background, soft even studio lighting, sharp focus, product-photo style, no shadow, no text, no border.' },
  { name: 'gate', prompt: 'A single traditional Chinese wooden gate / doorway (a paifang-style gate), standing alone, front view, simple and clear, centered, on a plain solid pure white background, soft even lighting, sharp focus, no people, no text, no border.' },
  { name: 'egg', prompt: 'A single white chicken egg, standing upright, simple and clear, centered, on a plain solid pure white background, soft even studio lighting, sharp focus, product-photo style, no text, no border.' },
  { name: 'bowl', prompt: 'A single bowl of steaming noodles, seen from a slight angle, simple and clear, centered, on a plain solid pure white background, soft even studio lighting, sharp focus, product-photo style, no text, no border.' },
];

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });

async function gen(job) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({ instances: [{ prompt: job.prompt }], parameters: { sampleCount: 1, aspectRatio: '1:1' } });
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const txt = await res.text();
      if (!res.ok) { console.log(job.name, 'HTTP', res.status, txt.slice(0, 160)); await new Promise(r => setTimeout(r, 2000)); continue; }
      const j = JSON.parse(txt);
      const b64 = j.predictions && j.predictions[0] && j.predictions[0].bytesBase64Encoded;
      if (!b64) { console.log(job.name, 'no bytes'); await new Promise(r => setTimeout(r, 2000)); continue; }
      const out = path.join(outDir, job.name + '_raw.png');
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log('SAVED', out, Math.round(fs.statSync(out).size / 1024), 'KB');
      return true;
    } catch (e) { console.log(job.name, 'err', e.message); await new Promise(r => setTimeout(r, 2000)); }
  }
  console.log(job.name, 'FAILED'); return false;
}

(async () => { for (const job of JOBS) await gen(job); })();
