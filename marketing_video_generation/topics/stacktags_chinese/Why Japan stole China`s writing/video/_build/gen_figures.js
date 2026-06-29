// Generate the cast (Imagen 4 via Gemini): 1 Chinese scholar + 3 distinct ancient Japanese.
// Full-body standing on plain white → easy rembg cut. 2 samples each → pick the best.
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const COMMON = 'facing forward, full body visible from head to feet, standing upright, centered in frame, plain solid pure white background, soft even studio lighting, realistic painterly historical portrait illustration, dignified, clean, no text, no caption, no watermark, no border, no floor shadow.';
const JOBS = [
  { name: 'china_scholar', ar: '3:4', n: 2, prompt:
    'A dignified ancient Chinese scholar-official from around the 6th century, wearing flowing traditional Han-style silk robes (hanfu) with wide long sleeves and a black scholar\'s cap, long thin beard, wise calm expression, holding a rolled hand-scroll, ' + COMMON },
  { name: 'jp_a', ar: '3:4', n: 2, prompt:
    'A friendly young man from ancient Japan around the 6th century (Kofun–Asuka period), wearing simple plain hemp robes tied with a cloth sash, short dark hair, warm approachable smile, one hand raised mid-gesture as if speaking, ' + COMMON },
  { name: 'jp_b', ar: '3:4', n: 2, prompt:
    'A calm middle-aged man from ancient Japan around the 6th century, wearing simple traditional robes in a muted earthy color with a sash, a short dark beard, hair tied back in a small knot, ' + COMMON },
  { name: 'jp_c', ar: '3:4', n: 2, prompt:
    'A curious young person from ancient Japan around the 6th century, wearing simple light-colored robes with a sash and a plain cloth headband around the forehead, dark hair, ' + COMMON },
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
