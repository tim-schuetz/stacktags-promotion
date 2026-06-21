// Generate transparent cut-out illustrations for the depth-transition beats.
// Uses OpenAI gpt-image-1 (the only provider here that returns a real
// transparent background) — Imagen 4 can't do alpha cut-outs. Flat-illustration
// style to match the clean white + turquoise look. Output: ../assets/<name>.png
const fs = require('fs');
const path = require('path');
const https = require('https');

// read OPENAI_API_KEY from application/backend/.env
const envPath = path.resolve('C:/software_projekte/bombatags/application/backend/.env');
const env = fs.readFileSync(envPath, 'utf8');
const KEY = (env.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1].trim();
if (!KEY) { console.error('no OPENAI_API_KEY'); process.exit(1); }

const OUT = path.resolve(__dirname, '../assets');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = 'Modern flat vector illustration, clean smooth shapes with soft cel shading, '
  + 'refined limited palette, subtle soft drop shadow, a single centered subject, die-cut sticker, '
  + 'fully ISOLATED on a transparent background, no scene, no ground line, no frame, no text, no letters, crisp clean edges.';

const JOBS = [
  { name: 'treasure-horse', prompt: 'A majestic noble horse standing proudly, sculpted from polished gold with a few inset emerald and turquoise gems and a small jeweled crown motif on its head, luxurious regal treasure. ' + STYLE },
  { name: 'galloping-horse', prompt: 'A powerful horse galloping at full speed in mid-stride, dynamic sense of velocity, sleek dark silhouette with subtle turquoise speed streaks trailing behind it. ' + STYLE },
  { name: 'future-city',     prompt: 'A sleek minimalist futuristic city skyline, clean modern slender towers with a couple of soft floating rounded maglev pods, calm optimistic sci-fi, turquoise and white palette with light grey. ' + STYLE },
  { name: 'dream-clouds',    prompt: 'A soft dreamy fluffy cloud with a few gentle stars, sparkles and a tiny crescent moon floating around it, light and aspirational, pastel white and turquoise. ' + STYLE },
  { name: 'ideal-summit',    prompt: 'A glowing mountain summit reaching up into soft radiant light with a small flag planted at the very peak, aspirational and serene, turquoise and white palette. ' + STYLE },
  { name: 'cola-splash',     prompt: 'A joyful dynamic splash of dark cola liquid with fizzy round bubbles and a few bright sparkles, refreshing and playful, glossy. ' + STYLE },
];

function gen(job) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      model: 'gpt-image-1',
      prompt: job.prompt,
      size: '1024x1024',
      background: 'transparent',
      output_format: 'png',
      quality: 'medium',
      n: 1,
    });
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/images/generations', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY, 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.error) { console.log('  ✗', job.name, '-', j.error.message); return resolve(false); }
          const b64 = j.data && j.data[0] && j.data[0].b64_json;
          if (!b64) { console.log('  ✗', job.name, '- no image in response'); return resolve(false); }
          const file = path.join(OUT, job.name + '.png');
          fs.writeFileSync(file, Buffer.from(b64, 'base64'));
          console.log('  ✓', job.name, '->', Math.round(fs.statSync(file).size / 1024), 'KB');
          resolve(true);
        } catch (e) { console.log('  ✗', job.name, '- parse error', e.message); resolve(false); }
      });
    });
    req.on('error', e => { console.log('  ✗', job.name, '- request error', e.message); resolve(false); });
    req.write(body); req.end();
  });
}

(async () => {
  console.log('Generating', JOBS.length, 'cut-outs with gpt-image-1 (transparent)…');
  // run with light concurrency
  const results = [];
  for (let i = 0; i < JOBS.length; i += 2) {
    const batch = JOBS.slice(i, i + 2);
    results.push(...await Promise.all(batch.map(gen)));
  }
  const ok = results.filter(Boolean).length;
  console.log(`\nDone: ${ok}/${JOBS.length} images in ${OUT}`);
})();
