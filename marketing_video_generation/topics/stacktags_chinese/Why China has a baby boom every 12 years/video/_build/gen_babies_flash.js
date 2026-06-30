// Generate the baby assets via gemini-2.5-flash-image (Imagen-4 blocks minors).
//   node gen_babies_flash.js
// Output → assets/raw/<key>.png
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { key: 'baby_real',
    prompt: 'Generate a photorealistic image: a cute chubby happy East Asian baby about eight months old, sitting upright and smiling, wearing a soft plain teal onesie, full body, centered on a plain solid pure white seamless background, soft even studio lighting, gentle soft contact shadow, no text, no watermark.' },
  { key: 'baby_stick',
    prompt: 'Generate a very simple minimalist hand-drawn black ink doodle of a baby: a thin single-weight black outline, a round head with one tiny curl of hair, two small dot eyes and a small smile, a simple rounded swaddled body, childlike doodle / stick-figure style, no shading, no color fill, pure black lines only, centered on a plain solid pure white background.' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${KEY}`;
  const body = { contents: [{ parts: [{ text: shot.prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 3) { await new Promise(s => setTimeout(s, 1800)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} ${r.status} ${t.slice(0, 400)}`); }
  const j = await r.json();
  const parts = j.candidates?.[0]?.content?.parts || [];
  const img = parts.find(p => p.inlineData && p.inlineData.data);
  if (!img) { if (attempt < 3) { await new Promise(s => setTimeout(s, 1800)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no image — ${JSON.stringify(j).slice(0, 300)}`); }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(img.inlineData.data, 'base64'));
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(img.inlineData.data, 'base64').length / 1024)} KB)`);
}
(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  for (const s of list) { try { await gen(s); } catch (e) { console.error('  ✗', e.message); } }
  console.log('Done.');
})();
