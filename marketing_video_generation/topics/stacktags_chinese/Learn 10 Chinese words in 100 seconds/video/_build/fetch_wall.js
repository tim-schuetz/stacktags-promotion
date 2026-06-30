// Fetch stroke data for complex 'wall' characters from hanzi-writer-data CDN.
// Reports which exist and vendors the good ones to ../elements/wall-hanzi.js
const fs = require('fs');
const path = require('path');

// Candidate visually-dense (mostly traditional) characters.
const CAND = ['鬱','響','廳','體','識','靈','矗','龍','鷹','灣','寶','顧','鑫','嚴','麗','競','鐵','藝','護','譜','攝','顯','變','讓','觀','聽','戀','鑰','黌','齒','齡','鑲','纖','驚','鱗','麟','龜','鼎','龐','巖','巒','贏','釁','釀','囊','叢','釁','鬢','鬚','齋'];
const uniq = [...new Set(CAND)];

(async () => {
  const ok = {};
  for (const ch of uniq) {
    const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(ch)}.json`;
    try {
      const r = await fetch(url);
      if (!r.ok) { console.log('MISS', ch, r.status); continue; }
      const j = await r.json();
      if (!j.strokes || !j.strokes.length) { console.log('EMPTY', ch); continue; }
      ok[ch] = { strokes: j.strokes, medians: j.medians };
      console.log('OK  ', ch, j.strokes.length, 'strokes');
    } catch (e) { console.log('ERR ', ch, e.message); }
  }
  console.log('\nTOTAL OK:', Object.keys(ok).length, '->', Object.keys(ok).join(''));
  fs.writeFileSync(path.resolve(__dirname, '_wall_data.json'), JSON.stringify(ok));
})();
