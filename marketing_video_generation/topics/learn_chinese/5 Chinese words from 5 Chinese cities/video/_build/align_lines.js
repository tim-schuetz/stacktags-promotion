// Pin each script line to a precise start time using Whisper's word-level
// timestamps + monotonic anchor matching. Output: timings.json [{i,text,start}].
const fs = require('fs');
const path = require('path');

const LINES = [
  "Shanghai means on the sea.",
  "Beijing, northern capital.",
  "Nanjing, southern capital.",
  "Qingdao, green island.",
  "And Hong Kong? Fragrant harbor.",
  "Because Chinese city names aren't random sounds — every one is a tiny description. A map you can actually read.",
  "Learn five characters from five cities, and you'll never read a map the same way. Let's go.",
  "We start on the coast.",
  "One. Shanghai. Hai means sea.",
  "Shang means on, and hai means sea. Shanghai is literally on the sea — exactly where it sits, at the edge of the Pacific. First character: hai, sea.",
  "Now head north, to the capital.",
  "Two. Beijing. Bei means north.",
  "Jing means capital, and bei means north. Beijing is the northern capital — which almost asks its own question.",
  "Because if there's a northern capital, there has to be a —",
  "Three. Nanjing. Nan means south.",
  "Southern one. Nan means south: Nanjing, the southern capital. Two cities, one character apart.",
  "North and south — let's finish the compass.",
  "West sits Xi'an — xi means west. And the region of Guangdong — dong means east. North, south, west, east: all four directions, straight off the map.",
  "Back to the coast — with a German surprise.",
  "Four. Qingdao. Dao means island.",
  "Qing means green, and dao means island — the green island. A century ago it was a German colony — which is why China's most famous beer, Tsingtao, was founded right here by German brewers.",
  "Down the coast to the last one.",
  "Five. Hong Kong. Gang means harbor.",
  "You know it as Hong Kong — but xiang means fragrant, and gang means harbor. The fragrant harbor, named for the scented wood once shipped through its docks.",
  "So in five cities: sea, north, south, island, harbor — plus west and east for free.",
  "That's the trick with Chinese: the names you half-know are already teaching you the language. A map isn't just a map — it's a vocabulary list.",
  "Want to actually start learning it?",
  "Click here to practice.",
  "Want more like this?",
  "Follow Stacktags.",
];

// Monotonic anchors using Whisper's actual spellings (lowercased, alnum only).
const ANCHORS = [
  ['shanghai', 'means', 'on'],
  ['beijing', 'northern'],
  ['nanjing', 'southern'],
  ['qingdao'],
  ['hong', 'kong'],
  ['because', 'chinese', 'city'],
  ['learn', '5', 'characters'],
  ['we', 'start', 'on', 'the', 'coast'],
  ['shanghai'],                 // 2nd occurrence (after cursor)
  ['sheng', 'means', 'on'],
  ['now', 'head', 'north'],
  ['beijing'],                  // after cursor → the bei-means-north reveal
  ['jing', 'means', 'capital'],
  ['because', 'if'],
  ['nanjing'],                  // after cursor → the nan-means-south reveal
  ['two', 'cities'],
  ['north', 'and', 'south'],
  ['west', 'sits'],
  ['back', 'to', 'the', 'coast'],
  ['qingdao'],                  // after cursor → 2nd occurrence
  ['qing', 'means', 'green'],
  ['down', 'the', 'coast'],
  ['hong', 'kong'],             // after cursor → 2nd occurrence
  ['fragrant'],                 // after cursor → "sheng means fragrant"
  ['so', 'in', 'five', 'cities'],
  ['thats', 'the', 'trick'],
  ['want', 'to', 'actually'],
  ['click', 'here'],
  ['want', 'more', 'like'],
  ['follow'],
];

const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const w = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'whisper.json'), 'utf8'));
const words = (w.words || []).map(o => ({ t: o.start, n: norm(o.word) }));

let cursor = 0;
const out = [];
ANCHORS.forEach((toks, i) => {
  const T = toks.map(norm);
  let found = -1;
  for (let p = cursor; p <= words.length - T.length; p++) {
    let ok = true;
    for (let k = 0; k < T.length; k++) { if (words[p + k].n !== T[k]) { ok = false; break; } }
    if (ok) { found = p; break; }
  }
  if (found < 0) {
    console.error(`!! anchor not found for line ${i}: [${toks.join(' ')}] (cursor=${cursor})`);
    out.push({ i, text: LINES[i], start: out.length ? out[out.length - 1].start + 1 : 0 });
    return;
  }
  const ctx = words.slice(found, found + Math.max(T.length, 4)).map(x => x.n).join(' ');
  out.push({ i, text: LINES[i], start: Math.round(words[found].t * 100) / 100 });
  console.log(`${i}\t${words[found].t.toFixed(2)}\t[${toks.join(' ')}] -> "${ctx}"`);
  cursor = found + T.length;
});

fs.writeFileSync(path.resolve(__dirname, 'timings.json'), JSON.stringify(out, null, 2));
console.log('\nWrote timings.json with', out.length, 'lines. Last start:', out[out.length - 1]?.start);
