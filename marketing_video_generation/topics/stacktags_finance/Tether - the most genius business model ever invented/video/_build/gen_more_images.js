// Generate additional images via Imagen 4: realistic T-bill, stylized bank/company,
// depositors, bonds, and the Tether-founder-with-list (neutral + grinning).
const fs = require('fs');
const path = require('path');
function loadKey() {
  for (const p of ['C:/software_projekte/stacktags-promotion/.env',
                   'C:/software_projekte/bombatags/application/backend/.env']) {
    try { const k = (fs.readFileSync(p, 'utf8').match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim(); if (k) return k; } catch {}
  }
  throw new Error('GEMINI_API_KEY not found');
}
const KEY = loadKey();
const OUT = path.resolve(__dirname, '../assets/photos');
const OUTF = path.resolve(__dirname, '../assets/figures');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(OUTF, { recursive: true });

const REAL = 'photorealistic, high detail, sharp focus, studio product shot, isolated on a plain solid pure white background, soft shadow. No watermark, no logo.';
const FLAT = 'flat 2D vector illustration, clean bold dark outlines, simple flat shapes, soft minimal shading, subtle teal/turquoise (#35A292) accents, iconic and minimal, centered, isolated on a plain solid pure white background. No text, no letters, no watermark.';
const CHAR = 'Flat 2D vector cartoon illustration, clean modern flat style, bold smooth dark outlines, simple flat shapes, soft minimal shading, FULL BODY head to feet, standing, centered, isolated on a plain solid pure white background. Dark business suit with a subtle teal/turquoise tie. No text, no letters, no watermark.';

const SHOTS = [
  { key: 'tbill_real', dir: OUT,  ar: '4:3', people: 'dont_allow',
    prompt: 'A single realistic United States Treasury bill certificate — an official government bond security document with an ornate engraved guilloche border and an eagle emblem, lying flat at a slight three-quarter angle. ' + REAL },
  { key: 'bank2', dir: OUT, ar: '1:1', people: 'dont_allow',
    prompt: 'A classic bank building with tall front columns and a triangular pediment roof, simple and iconic. ' + FLAT },
  { key: 'company2', dir: OUT, ar: '3:4', people: 'dont_allow',
    prompt: 'A modern corporate office skyscraper tower, sleek and simple, iconic. ' + FLAT },
  { key: 'depositors', dir: OUT, ar: '1:1', people: 'allow_adult',
    prompt: 'A small friendly group of three ordinary everyday people standing together (bank customers / depositors), simple. ' + FLAT },
  { key: 'moneyheap', dir: OUT, ar: '4:3', people: 'dont_allow',
    prompt: 'A big messy heap/pile of US dollar cash — many loose banknotes and a few banded bundles piled up into a mound. ' + REAL },
  { key: 'bonds', dir: OUT, ar: '1:1', people: 'dont_allow',
    prompt: 'A rolled diploma-style certificate scroll tied with a red ribbon next to a gold wax seal, warm cream-and-gold colored paper, iconic. ' + FLAT },
  { key: 'founder_list_grin', dir: OUTF, ar: '3:4', people: 'allow_adult',
    prompt: 'A businessman holding a clipboard with a checklist in one hand, with a wide smug satisfied grin on his face, very pleased. ' + CHAR },
];

async function gen(shot, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${KEY}`;
  const body = { instances: [{ prompt: shot.prompt }], parameters: { sampleCount: 1, aspectRatio: shot.ar, personGeneration: shot.people } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); if (attempt < 3) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 1800)); return gen(shot, attempt + 1); } throw new Error(`${shot.key} failed: ${r.status} ${t.slice(0,200)}`); }
  const j = await r.json();
  const b64 = j.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) { if (attempt < 3) { console.warn(`  retry ${shot.key} (no bytes)`); await new Promise(s => setTimeout(s, 1800)); return gen(shot, attempt + 1); } throw new Error(`${shot.key}: no bytes`); }
  fs.writeFileSync(path.join(shot.dir, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${shot.key}.png (${Math.round(Buffer.from(b64,'base64').length/1024)} KB)`);
}
(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} images ...`);
  for (const s of list) { try { await gen(s); } catch (e) { console.error('  ✗', e.message); } }
  console.log('Done.');
})();
