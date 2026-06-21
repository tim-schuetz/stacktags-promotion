// Round 2 cut-outs: the three Chinese EV cars (used in the twist + their cards,
// replacing the mountain/city/clouds) and a clean NIO emblem (replaces the
// hand-drawn SVG). gpt-image-1, transparent. Output: ../assets/<name>.png
const fs = require('fs');
const path = require('path');
const https = require('https');

const env = fs.readFileSync(path.resolve('C:/software_projekte/bombatags/application/backend/.env'), 'utf8');
const KEY = (env.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1].trim();
const OUT = path.resolve(__dirname, '../assets');

const CAR = 'clean 3/4 front-side view, modern premium electric car, smooth studio product illustration with soft reflections, '
  + 'die-cut sticker, fully ISOLATED on a transparent background, no scene, no ground, no shadow on floor, no text, no license plate, crisp edges.';

const JOBS = [
  { name: 'li-car',  q: 'medium', prompt: 'A large luxurious three-row family SUV in pearl white with a full-width LED light bar across the front, premium and spacious (Li Auto style). ' + CAR },
  { name: 'nio-car', q: 'medium', prompt: 'A sleek aerodynamic premium electric fastback sedan in midnight blue with slim sharp headlights, elegant and futuristic (NIO style). ' + CAR },
  { name: 'byd-car', q: 'medium', prompt: 'A sporty modern electric sedan in metallic silver with a sleek coupe roofline and clean surfaces (BYD style). ' + CAR },
  { name: 'nio-logo', q: 'high', prompt: 'A minimalist geometric automobile emblem: a smooth rounded arch shape on top symbolising the open sky, directly above two bold solid vertical bars that taper toward the bottom symbolising the road ahead. One single solid dark charcoal grey colour (#23323a), perfectly symmetrical, flat, clean vector mark, centered, isolated on a fully transparent background, NO text, NO letters, NO words, no circle frame.' },
];

function gen(job) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ model: 'gpt-image-1', prompt: job.prompt, size: '1024x1024',
      background: 'transparent', output_format: 'png', quality: job.q, n: 1 });
    const req = https.request({ hostname: 'api.openai.com', path: '/v1/images/generations', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY, 'Content-Length': Buffer.byteLength(body) } },
      (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { const j = JSON.parse(d);
          if (j.error) { console.log('  ✗', job.name, '-', j.error.message); return resolve(false); }
          const b64 = j.data && j.data[0] && j.data[0].b64_json;
          if (!b64) { console.log('  ✗', job.name, '- no image'); return resolve(false); }
          fs.writeFileSync(path.join(OUT, job.name + '.png'), Buffer.from(b64, 'base64'));
          console.log('  ✓', job.name); resolve(true);
        } catch (e) { console.log('  ✗', job.name, e.message); resolve(false); }
      }); });
    req.on('error', e => { console.log('  ✗', job.name, e.message); resolve(false); });
    req.write(body); req.end();
  });
}
(async () => {
  console.log('Generating', JOBS.length, 'cut-outs…');
  for (let i = 0; i < JOBS.length; i += 2) await Promise.all(JOBS.slice(i, i + 2).map(gen));
  console.log('done ->', OUT);
})();
