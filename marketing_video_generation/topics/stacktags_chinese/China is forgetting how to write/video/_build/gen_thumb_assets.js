// Generate thumbnail assets via Imagen 4 (Gemini): realistic whiteboards (landscape+portrait)
// and a new graduation-gown student scratching his head, puzzled. Key from bombatags .env.
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });

const board =
  'A photorealistic empty white classroom whiteboard with a slim brushed-aluminium frame, mounted on a ' +
  'plain softly-lit light grey wall, clean smooth surface with subtle soft realistic reflections, a thin ' +
  'marker tray along the bottom edge holding one or two markers, completely blank with NO writing and NO ' +
  'text, straight-on front view, the whiteboard fills almost the entire frame, professional product photo, ' +
  'soft even studio lighting, high detail, sharp focus.';

const student =
  'A photorealistic full-length studio photo of a young East Asian male university graduate wearing a black ' +
  'academic graduation gown and a flat black mortarboard graduation cap with a tassel, one hand raised to ' +
  'scratch the side of his head, looking puzzled and confused, thinking hard as if he just forgot something, ' +
  'eyebrows raised, plain seamless light grey studio background, soft natural lighting, three-quarter view, ' +
  'full body visible, sharp focus, high quality photograph, no text.';

const jobs = [
  { prompt: board,   aspect: '16:9', person: 'dont_allow',  prefix: 'wb_land', n: 2 },
  { prompt: board,   aspect: '9:16', person: 'dont_allow',  prefix: 'wb_port', n: 2 },
  { prompt: student, aspect: '3:4',  person: 'allow_adult', prefix: 'grad',    n: 3 },
];

async function gen(job) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({
    instances: [{ prompt: job.prompt }],
    parameters: { sampleCount: job.n, aspectRatio: job.aspect, personGeneration: job.person },
  });
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const txt = await res.text();
      if (!res.ok) { console.log(job.prefix, 'HTTP', res.status, txt.slice(0, 200)); await new Promise(r => setTimeout(r, 2000)); continue; }
      const j = JSON.parse(txt);
      const preds = (j.predictions || []).filter(p => p && p.bytesBase64Encoded);
      if (!preds.length) { console.log(job.prefix, 'no bytes', txt.slice(0, 200)); await new Promise(r => setTimeout(r, 2000)); continue; }
      preds.forEach((p, i) => {
        const out = path.join(outDir, `${job.prefix}_${i + 1}.png`);
        fs.writeFileSync(out, Buffer.from(p.bytesBase64Encoded, 'base64'));
        console.log('SAVED', out, Math.round(fs.statSync(out).size / 1024), 'KB');
      });
      return;
    } catch (e) { console.log(job.prefix, 'err', e.message); await new Promise(r => setTimeout(r, 2000)); }
  }
  console.log(job.prefix, 'FAILED');
}

(async () => { for (const job of jobs) await gen(job); console.log('ALLDONE'); })();
