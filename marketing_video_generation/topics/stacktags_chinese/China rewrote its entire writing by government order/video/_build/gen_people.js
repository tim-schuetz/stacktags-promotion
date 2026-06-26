// Generate the recurring "the people" historical image (Imagen 4 via Gemini):
// the 1950s mass anti-illiteracy campaign (扫盲运动). 2 samples -> pick the best.
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const JOBS = [
  { name: 'literacy', ar: '4:3', n: 2, prompt:
    'A photorealistic vintage black-and-white documentary photograph from 1950s rural China: a group of ordinary adult peasant villagers, men and women, sitting close together at simple wooden desks in a modest village classroom, earnestly looking up and learning to read, an instructor standing at a chalkboard, the historic mass anti-illiteracy campaign, warm earnest hopeful mood, soft natural window light, authentic period clothing and detail, documentary realism, sharp focus, no text overlay, no captions, no watermark, no border.' },
  { name: 'writers', ar: '4:3', n: 2, prompt:
    'A photorealistic warm documentary photograph of a small group of ordinary Chinese people of mixed ages sitting together at a table writing Chinese characters by hand with pens and ink brushes on paper, concentrating, everyday people not officials, soft natural light, shallow depth of field, authentic, candid, sharp focus, no text overlay, no watermark, no border.' },
];

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });

async function gen(job) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({ instances: [{ prompt: job.prompt }], parameters: { sampleCount: job.n || 1, aspectRatio: job.ar, personGeneration: 'allow_adult' } });
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const txt = await res.text();
      if (!res.ok) { console.log(job.name, 'HTTP', res.status, txt.slice(0, 200)); await new Promise(r => setTimeout(r, 2000)); continue; }
      const j = JSON.parse(txt);
      const preds = (j.predictions || []).filter(p => p.bytesBase64Encoded);
      if (!preds.length) { console.log(job.name, 'no bytes', txt.slice(0, 200)); await new Promise(r => setTimeout(r, 2000)); continue; }
      preds.forEach((p, i) => {
        const out = path.join(outDir, job.name + '_' + i + '_raw.png');
        fs.writeFileSync(out, Buffer.from(p.bytesBase64Encoded, 'base64'));
        console.log('SAVED', out, Math.round(fs.statSync(out).size / 1024), 'KB');
      });
      return true;
    } catch (e) { console.log(job.name, 'err', e.message); await new Promise(r => setTimeout(r, 2000)); }
  }
  console.log(job.name, 'FAILED'); return false;
}

(async () => { for (const job of JOBS) await gen(job); })();
