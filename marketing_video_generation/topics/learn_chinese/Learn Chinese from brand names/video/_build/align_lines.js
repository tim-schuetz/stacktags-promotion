// Pin each cue beat to a precise start time using Whisper's word-level
// timestamps + monotonic anchor matching. Output: timings.json [{i,text,start}].
// (Run whisper_align.js first to produce whisper.json.)
const fs = require('fs');
const path = require('path');

// One entry per visual beat. `text` is documentation; `anchor` is the word(s)
// (lowercased, alnum-only) whose FIRST occurrence after the running cursor
// marks the beat. Anchors must appear in spoken order.
const BEATS = [
  { text: 'HOOK — BMW logo appears ("In China, BMW isn\'t BMW")',     anchor: ['in','china','bmw'] },
  { text: 'HOOK — BMW flips → 宝马 "treasure horse"',                  anchor: ['its','treasure'] },
  { text: 'HOOK — Mercedes flips → 奔驰 "galloping speed"',            anchor: ['mercedes','is','galloping'] },
  { text: 'HOOK — Coca-Cola card appears',                            anchor: ['coca','cola'] },
  { text: 'HOOK — Coca-Cola flips → 可口可乐 "delicious happiness"',    anchor: ['delicious','happiness'] },
  { text: 'HOOK — "None of those are accidents" (three line up, glow)',anchor: ['none','of','those'] },
  { text: 'HOOK — caption: doesn\'t just copy the sound',             anchor: ['when','a','brand'] },
  { text: 'HOOK — caption: picks characters that sound right + mean',  anchor: ['it','picks','characters'] },
  { text: 'ENUM — "Here\'s how the biggest names did it" (6 roster)',  anchor: ['heres','how','the','biggest'] },
  { text: 'ENUM — "Start with the cars" (zoom into BMW)',             anchor: ['start','with','the','cars'] },
  { text: 'CARD BMW — flip → 宝马 bǎomǎ',                             anchor: ['bmw','became'] },
  { text: 'CARD BMW — highlight 宝 treasure · 马 horse',              anchor: ['treasure','horse'] },
  { text: 'CARD BMW — note "a prized, powerful steed"',               anchor: ['promises','you'] },
  { text: 'CARD Mercedes — flip → 奔驰 bēnchí',                       anchor: ['mercedes','benz','became'] },
  { text: 'CARD Mercedes — meaning: to gallop, to speed',             anchor: ['to','gallop'] },
  { text: 'CARD Mercedes — note: sounds like Benz, pure motion',      anchor: ['sounds','like','benz'] },
  { text: 'CARD Mercedes — tagline: the name is the marketing',       anchor: ['the','name','is','the','marketing'] },
  { text: 'CARD Coca-Cola — enter ("all-time masterpiece")',          anchor: ['all','time','masterpiece'] },
  { text: 'CARD Coca-Cola — flip → 可口可乐 kěkǒu kělè',               anchor: ['kekokele'] },
  { text: 'CARD Coca-Cola — meaning: tasty + enjoyable',              anchor: ['copies','the','sound'] },
  { text: 'CARD Coca-Cola — gloss: "delicious happiness"',            anchor: ['soda','literally'] },
  { text: 'TWIST — "Chinese brands take it to another level"',        anchor: ['plenty','of','brands'] },
  { text: 'TWIST — "especially the new electric-car makers"',         anchor: ['especially','the','new'] },
  { text: 'TWIST — "reach into the language, grab a word = mission"',  anchor: ['reach','into'] },
  { text: 'CARD Li Auto — enter ("One brand is simply called…")',     anchor: ['one','brand','is','simply'] },
  { text: 'CARD Li Auto — flip 理想 → "THE IDEAL"',                    anchor: ['whole','name','just'] },
  { text: 'CARD Nio — enter ("you know it in the West as Nio")',      anchor: ['another','you','know'] },
  { text: 'CARD Nio — reveal 蔚来 wèilái',                            anchor: ['chinese','its','weilai'] },
  { text: 'CARD Nio — morph 蔚来 → 未来 (homophone)',                  anchor: ['which','sounds','exactly'] },
  { text: 'CARD Nio — resolve "THE FUTURE"',                          anchor: ['car','company','named'] },
  { text: 'CARD BYD — enter ("Take BYD")',                            anchor: ['take','byd'] },
  { text: 'CARD BYD — expand B·Y·D → BUILD YOUR DREAMS',              anchor: ['actually','stands'] },
  { text: 'CARD BYD — "an entire aspiration, baked into the logo"',   anchor: ['entire','aspiration'] },
  { text: 'CARD BYD — "Bold? A bit much? You be the judge"',          anchor: ['bold'] },
  { text: 'OUTRO — recap montage (treasure horse, galloping star…)',  anchor: ['a','treasure','horse'] },
  { text: 'OUTRO — caption: a tiny Chinese lesson in plain sight',    anchor: ['every','one','of','these'] },
  { text: 'OUTRO — "branding as a free language lesson"',             anchor: ['thats','branding'] },
  { text: 'OUTRO — brand card assembles ("want to actually learn it")',anchor: ['want','to','actually','start'] },
  { text: 'OUTRO — Practice CTA + folder ("Click here to practice")', anchor: ['click','here','to','practice'] },
  { text: 'OUTRO — "Want more like this?"',                           anchor: ['want','more','like','this'] },
  { text: 'OUTRO — Follow Stacktags (pulse)',                         anchor: ['follow','stack'] },
];

const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const w = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'whisper.json'), 'utf8'));
const words = (w.words || []).map(o => ({ t: o.start, n: norm(o.word) }));

let cursor = 0;
const out = [];
BEATS.forEach((b, i) => {
  const T = b.anchor.map(norm);
  let found = -1;
  for (let p = cursor; p <= words.length - T.length; p++) {
    let ok = true;
    for (let k = 0; k < T.length; k++) { if (words[p + k].n !== T[k]) { ok = false; break; } }
    if (ok) { found = p; break; }
  }
  if (found < 0) {
    console.error(`!! anchor not found for beat ${i}: [${b.anchor.join(' ')}] (cursor=${cursor})`);
    out.push({ i, text: b.text, start: out.length ? out[out.length - 1].start + 1 : 0 });
    return;
  }
  const ctx = words.slice(found, found + Math.max(T.length, 4)).map(x => x.n).join(' ');
  out.push({ i, text: b.text, start: Math.round(words[found].t * 100) / 100 });
  console.log(`${String(i).padStart(2)}  ${words[found].t.toFixed(2).padStart(6)}  [${b.anchor.join(' ')}] -> "${ctx}"`);
  cursor = found + T.length;
});

fs.writeFileSync(path.resolve(__dirname, 'timings.json'), JSON.stringify(out, null, 2));
console.log('\nWrote timings.json with', out.length, 'beats. Last start:', out[out.length - 1]?.start);
