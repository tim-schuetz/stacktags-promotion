// Generate a realistic noodle-shop MENU CARD photo with a dish photo + a blank
// name banner (Imagen 4 via Gemini). We overlay the real biáng glyph as the dish
// name afterwards (Imagen can't render the Ext-G character reliably), so we ask
// for NO text anywhere.
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const prompt =
  'A realistic, warm photo of a single rustic Chinese noodle-shop menu card — a slightly worn ' +
  'cream paper menu standing/lying on a dark wooden restaurant table. In the upper half there is ' +
  'one large, appetising printed photo of a bowl of thick wide hand-pulled biangbiang noodles with ' +
  'chilli oil and scallions. Below the photo is a clean, empty cream banner strip where a dish name ' +
  'would be printed. Soft warm restaurant lighting, gentle shadow, shallow depth of field, straight-on. ' +
  'Absolutely NO text, NO letters, NO numbers, NO Chinese characters anywhere on the menu.';

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'menu_raw.png');

(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio: '3:4', personGeneration: 'dont_allow' },
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
