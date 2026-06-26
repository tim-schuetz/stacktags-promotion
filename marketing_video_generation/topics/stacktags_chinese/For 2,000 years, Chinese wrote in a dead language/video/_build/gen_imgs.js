// Generate the figure photos (Imagen 4 via Gemini) -> assets/img/<name>_raw.png
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/stacktags-promotion/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const JOBS = [
  { name: 'hushi', ar: '3:4', prompt:
    'A photorealistic vintage sepia-toned studio portrait photograph from around 1917 of a young Chinese male scholar and intellectual, wearing round wire-rim spectacles and a traditional long scholar gown (changshan), short neat hair, calm confident thoughtful expression, head and shoulders, plain solid light grey background, soft even lighting, early twentieth century photography, sharp focus, no text, no border.' },
  { name: 'hero', ar: '3:4', prompt:
    'A photorealistic portrait of an ordinary Chinese man from the late imperial era, wearing a simple plain cotton robe, friendly approachable neutral expression, upper body, plain solid light grey background, soft natural studio lighting, sharp focus, no text, no props, no border.' },
  { name: 'scholar', ar: '3:4', prompt:
    'A photorealistic image of a dignified Confucian scholar-official in elaborate traditional silk robes and a black scholar cap, holding and reading an open classical Chinese bound book, serious and aloof, upper body, plain solid light grey background, soft studio lighting, imperial China, sharp focus, no text, no border.' },
  { name: 'crowd', ar: '4:3', prompt:
    'A photorealistic image of a small group of four ordinary Chinese commoners from the imperial era, wearing simple plain working clothes, standing close together and chatting, full upper bodies, plain solid light grey background, soft natural lighting, sharp focus, no text, no border.' },
];

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });

async function gen(job) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({ instances: [{ prompt: job.prompt }], parameters: { sampleCount: 1, aspectRatio: job.ar, personGeneration: 'allow_adult' } });
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const txt = await res.text();
      if (!res.ok) { console.log(job.name, 'HTTP', res.status, txt.slice(0, 200)); await new Promise(r => setTimeout(r, 2000)); continue; }
      const j = JSON.parse(txt);
      const b64 = j.predictions && j.predictions[0] && j.predictions[0].bytesBase64Encoded;
      if (!b64) { console.log(job.name, 'no bytes', txt.slice(0, 200)); await new Promise(r => setTimeout(r, 2000)); continue; }
      const out = path.join(outDir, job.name + '_raw.png');
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log('SAVED', out, Math.round(fs.statSync(out).size / 1024), 'KB');
      return true;
    } catch (e) { console.log(job.name, 'err', e.message); await new Promise(r => setTimeout(r, 2000)); }
  }
  console.log(job.name, 'FAILED'); return false;
}

(async () => { for (const job of JOBS) await gen(job); })();
