// Generate a real photo of a bowl of biangbiang noodles (Imagen 4 via Gemini).
// Key is read from the bombatags backend .env (not in this lean repo).
const fs = require('fs');
const path = require('path');

const ENV = 'C:/software_projekte/bombatags/application/backend/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/GEMINI_API_KEY\s*=\s*(.+)/) || [])[1].trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('no GEMINI_API_KEY'); process.exit(1); }

const prompt =
  'A photorealistic top-down photo of a single bowl of biangbiang noodles, a famous Shaanxi Chinese ' +
  'dish: very wide, thick, flat hand-pulled belt noodles in one rustic ceramic bowl, topped with ' +
  'chili flakes, scallions, garlic, a sizzle of hot oil and a little bok choy. Appetising, steam ' +
  'rising, natural soft daylight. The bowl is centered on a plain solid white seamless background ' +
  'with nothing else around it, so it is easy to cut out. Sharp focus, high quality food photography, ' +
  'no text, no chopsticks, no hands.';

const outDir = path.resolve(__dirname, '../assets/img');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'noodles_raw.png');

(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${key}`;
  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio: '1:1', personGeneration: 'dont_allow' },
  });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const txt = await res.text();
      if (!res.ok) { console.log('HTTP', res.status, txt.slice(0, 300)); await new Promise(r => setTimeout(r, 1800)); continue; }
      const j = JSON.parse(txt);
      const b64 = j.predictions && j.predictions[0] && j.predictions[0].bytesBase64Encoded;
      if (!b64) { console.log('no image bytes', txt.slice(0, 300)); await new Promise(r => setTimeout(r, 1800)); continue; }
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log('SAVED', out, Math.round(fs.statSync(out).size / 1024), 'KB');
      return;
    } catch (e) { console.log('err', e.message); await new Promise(r => setTimeout(r, 1800)); }
  }
  process.exit(1);
})();
