// Generate a real photo of a cook slapping/pulling biangbiang dough (Imagen 4 via Gemini).
// The folk origin of the name: "biang" = the slap of the dough on the table.
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const prompt =
  'A photorealistic, atmospheric photo inside a rustic Shaanxi street noodle stall: a cook\'s two ' +
  'hands slapping and stretching a long, thick, wide belt of pale wheat dough down onto a floured ' +
  'dark wooden table, a small cloud of flour dust kicked up by the impact, slight motion blur on the ' +
  'dough, warm dim evening market light, steam in the background, authentic and a little gritty, ' +
  'shallow depth of field, focus on the hands and the dough. Documentary food photography, no text.';

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'stall_raw.png');

(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio: '4:3', personGeneration: 'allow_adult' },
  });
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const txt = await res.text();
      if (!res.ok) { console.log('HTTP', res.status, txt.slice(0, 300)); await new Promise(r => setTimeout(r, 2000)); continue; }
      const j = JSON.parse(txt);
      const b64 = j.predictions && j.predictions[0] && j.predictions[0].bytesBase64Encoded;
      if (!b64) { console.log('no image bytes', txt.slice(0, 300)); await new Promise(r => setTimeout(r, 2000)); continue; }
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log('SAVED', out, Math.round(fs.statSync(out).size / 1024), 'KB');
      return;
    } catch (e) { console.log('err', e.message); await new Promise(r => setTimeout(r, 2000)); }
  }
  process.exit(1);
})();
