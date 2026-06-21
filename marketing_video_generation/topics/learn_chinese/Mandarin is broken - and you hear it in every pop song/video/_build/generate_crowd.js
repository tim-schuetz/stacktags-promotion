// More crowd characters for the "voice of a nation" punch scene — same flat
// cartoon/caricature PEOPLE style as generate_v3.js, just more variety so the
// crowd repeats far less. Writes crowd_5..crowd_12 (keeps the existing ones).
const fs = require('fs');
const path = require('path');

const envTxt = fs.readFileSync('C:/software_projekte/bombatags/application/backend/.env', 'utf8');
const KEY = (envTxt.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error('OPENAI_API_KEY not found');
const OUT = path.resolve(__dirname, '../assets/cutouts');
fs.mkdirSync(OUT, { recursive: true });

const PEOPLE = 'Flat modern CARTOON illustration, playful caricature with a slightly oversized expressive head and big comedic face, clearly Chinese / East-Asian features, charming and a little goofy. Limited palette: teal/turquoise (#35A292), deep teal (#119271), warm cream off-white, soft grey. Single full-body figure, clear silhouette, no text, no ground shadow. Fully TRANSPARENT background, crisp clean cut-out.';

const SHOTS = [
  { key: 'crowd_5',  prompt: 'A funny stylised young Chinese male university student with round glasses and a backpack, mouth open mid-cheer, one fist pumped up, excited.' },
  { key: 'crowd_6',  prompt: 'A funny stylised elegant young Chinese woman in a teal qipao dress, laughing with her head tilted back, one hand raised gracefully.' },
  { key: 'crowd_7',  prompt: 'A funny stylised tiny old Chinese grandma with a grey hair-bun and big round glasses, beaming, both hands clasped at her chest.' },
  { key: 'crowd_8',  prompt: 'A funny stylised Chinese food-delivery courier in a teal cap and jacket holding a small parcel, big grin, giving a thumbs up.' },
  { key: 'crowd_9',  prompt: 'A funny stylised burly Chinese construction worker in a cream tank top and hard hat, huge arms crossed then thrown open, shouting happily.' },
  { key: 'crowd_10', prompt: 'A funny stylised sporty young Chinese woman with a high bouncy ponytail in a teal tracksuit, mid-laugh, one hand on her hip and the other thrown up in a thumbs up, energetic.' },
  { key: 'crowd_11', prompt: 'A funny stylised little Chinese girl with two pigtails and a teal dress, waving with both hands, huge happy open-mouth smile.' },
  { key: 'crowd_12', prompt: 'A funny stylised lanky teenage Chinese boy in a cream-and-teal basketball jersey and shorts, huge grin, one arm raised high mid-cheer, lively.' },
  { key: 'crowd_13', prompt: 'A funny stylised young Chinese office woman in a teal blazer with round glasses, holding a coffee cup, laughing brightly.' },
  { key: 'crowd_14', prompt: 'A funny stylised cool young Chinese man in a cream hoodie with headphones around his neck, relaxed grin, giving a peace sign.' },
  { key: 'crowd_15', prompt: 'A funny stylised cheerful middle-aged Chinese man with a bushy moustache in a teal polo shirt, hearty belly laugh, both arms thrown wide.' },
  { key: 'crowd_16', prompt: 'A funny stylised young Chinese woman with a short bob haircut in a denim dress, waving happily with one hand, big smile.' },
  { key: 'crowd_17', prompt: 'A funny stylised Chinese teenage girl with glasses, a knitted beanie and a backpack, giving an enthusiastic thumbs up, beaming.' },
  { key: 'crowd_18', prompt: 'A funny stylised jolly bald chubby Chinese uncle in a cream tang-style shirt, big belly laugh, both hands resting on his round belly.' },
];

async function gen(shot, attempt = 1) {
  const body = { model: 'gpt-image-1', prompt: `${shot.prompt} ${PEOPLE}`, n: 1, size: '1024x1536', quality: 'high', background: 'transparent' };
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
  console.log(`Generating ${list.length} crowd asset(s) via gpt-image-1 ...`);
  for (const shot of list) { try { await gen(shot); } catch (e) { console.error('  X', e.message); } }
  console.log('Done.');
})();
