// New assets via gpt-image-1 (transparent cut-outs): a FLAT coin, two funnier/
// more-stylized speaker figures (v2), and a set of crowd characters for the
// final scene. Keeps the old speaker_*.png; writes new keys.
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('OPENAI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/cutouts');
fs.mkdirSync(OUT, { recursive: true });

// flat, on-brand, but a touch more CARTOON/CARICATURE + funnier for the people
const PEOPLE = 'Flat modern CARTOON illustration, playful caricature with a slightly oversized expressive head and big comedic face, clearly Chinese / East-Asian features, charming and a little goofy. Limited palette: teal/turquoise (#35A292), deep teal (#119271), warm cream off-white, soft grey. Single full-body figure, clear silhouette, no text, no ground shadow. Fully TRANSPARENT background, crisp clean cut-out.';
const FLAT = 'Flat modern vector illustration, clean minimal, smooth simple shapes, limited teal/turquoise + warm gold + cream palette, no text, no ground. Transparent background, crisp cut-out.';

const SHOTS = [
  { key: 'coin', size: '1024x1024', style: FLAT,
    prompt: 'A single ancient Chinese round cash coin with a square hole in the middle, seen face-on, simple flat illustration, teal-green rim with warm soft-gold face, a couple of tiny seal-script-like marks (abstract, no real text).' },
  { key: 'speaker_mandarin_v2', style: PEOPLE,
    prompt: 'A funny stylised young Chinese man standing, casual streetwear hoodie in teal, mouth wide open talking enthusiastically, one hand thrown up in a big gesture, goofy cheerful expression.' },
  { key: 'speaker_cantonese_v2', style: PEOPLE,
    prompt: 'A funny stylised young Chinese woman standing, casual chic outfit in cream and teal, confident big grin, mouth open speaking clearly, one hand raised making a point.' },
  { key: 'crowd_1', style: PEOPLE,
    prompt: 'A funny stylised elderly Chinese grandpa with a long thin wispy white beard and a traditional tang jacket, hands clasped, mouth open mid-talk, jolly.' },
  { key: 'crowd_2', style: PEOPLE,
    prompt: 'A funny stylised trendy young Chinese woman in a cute modern outfit, throwing a peace sign, big toothy smile, mouth open talking.' },
  { key: 'crowd_3', style: PEOPLE,
    prompt: 'A funny stylised chubby middle-aged Chinese businessman in a slightly-too-tight suit, surprised wide-open mouth, arms out, comedic.' },
  { key: 'crowd_4', style: PEOPLE,
    prompt: 'A funny stylised cheerful chubby Chinese kid in casual clothes, waving with both hands, mouth wide open shouting happily.' },
];

async function gen(shot, attempt = 1) {
  const body = { model: 'gpt-image-1', prompt: `${shot.prompt} ${shot.style}`, n: 1, size: shot.size || '1024x1536', quality: 'high', background: 'transparent' };
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` }, body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    if (attempt < 3 && r.status !== 429) { console.warn(`  retry ${shot.key} (${r.status})`); await new Promise(s => setTimeout(s, 2500)); return gen(shot, attempt + 1); }
    throw new Error(`${shot.key} failed: ${r.status} ${t.slice(0, 160)}`);
  }
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json; if (!b64) throw new Error(`${shot.key}: no bytes`);
  fs.writeFileSync(path.join(OUT, `${shot.key}.png`), Buffer.from(b64, 'base64'));
  console.log(`  OK ${shot.key}.png (${Math.round(Buffer.from(b64, 'base64').length / 1024)}KB)`);
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SHOTS.filter(s => only.includes(s.key)) : SHOTS;
  console.log(`Generating ${list.length} asset(s) via gpt-image-1 ...`);
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  X', e.message); } }
  console.log('Done.');
})();
