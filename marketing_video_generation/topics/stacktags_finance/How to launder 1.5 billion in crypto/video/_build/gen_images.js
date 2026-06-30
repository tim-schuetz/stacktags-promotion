// Generate the realistic images via Google Imagen 4 → ../assets/raw/<key>.png
const fs = require('fs');
const path = require('path');
const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('GEMINI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/raw');
fs.mkdirSync(OUT, { recursive: true });

const WHITE = 'plain pure solid white background, soft even studio lighting, subtle soft contact shadow, photorealistic, high detail, no text, no letters, no caption, no watermark.';

const SHOTS = [
  { key: 'lazarus', ar: '3:4', person: 'allow_adult',
    prompt: 'A single mysterious anonymous hacker shown from the waist up, wearing a dark grey hooded sweatshirt with the hood up, face hidden in deep shadow so it is not visible, ominous and serious, cold teal-blue rim lighting from the side, cinematic, menacing, representing a state-sponsored cyber-crime group, photorealistic, centered, isolated on a ' },
  { key: 'nkflag', ar: '16:9', person: 'dont_allow',
    prompt: 'The national flag of North Korea waving gently, a wide red central band with a white-bordered red five-pointed star inside a white disc on the left, thin white stripes and blue bands top and bottom, vivid saturated colors, full-frame fabric texture, clean studio shot, ' },
  { key: 'bybit', ar: '3:4', person: 'dont_allow',
    prompt: 'A single modern sleek glass corporate skyscraper, the headquarters of a crypto-currency exchange, blue-tinted glass facade, clean futuristic architecture at dusk, standing upright, centered, isolated on a ' },
  { key: 'coin', ar: '1:1', person: 'dont_allow',
    prompt: 'One single shiny gold physical Bitcoin coin facing the camera, the Bitcoin "B" symbol embossed on its face, glossy reflective metallic gold, centered, isolated on a ' },
  { key: 'mixer', ar: '1:1', person: 'dont_allow',
    prompt: 'A single shiny metallic rotating drum tumbler machine, like an industrial mixing barrel or a lottery ball tumbler on a stand, chrome steel with soft turquoise glow inside, glossy 3d product render, centered, isolated on a ' },
  { key: 'dubai', ar: '16:9', person: 'dont_allow',
    prompt: 'A row of several modern Dubai skyscrapers of varied heights standing side by side, a dense futuristic glass-and-steel city skyline at daytime, distinct separate towers, full buildings standing upright on a flat base, photorealistic, isolated on a ' },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: shot.prompt + WHITE }], parameters: { sampleCount: 1, aspectRatio: shot.ar, personGeneration: shot.person } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 3) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 1800)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} failed: ${r.status} ${t.slice(0, 300)}`); }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) { if (attempt < 3) { console.warn(`  retry ${shot.key} (no bytes)`); await new Promise(s => setTimeout(s, 1800)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no bytes ${JSON.stringify(j).slice(0, 200)}`); }
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB)`);
}
(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} images via imagen-4.0-generate-001 ...`);
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  X', e.message); } }
  console.log('Done.');
})();
