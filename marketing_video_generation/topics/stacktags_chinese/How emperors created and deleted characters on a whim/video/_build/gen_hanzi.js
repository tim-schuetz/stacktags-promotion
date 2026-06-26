// Fetch per-stroke vector data from hanzi-writer-data@2.0.1 and vendor it locally
// as window.HANZI = { char: {strokes, medians} } for offline/deterministic capture.
const https = require('https');
const fs = require('fs');
const path = require('path');

// Stroke-animated characters this video needs.
const CHARS = ['避','讳','李','世','民','觀','音','武','則','天','日','月','空','字','曌'];

const OUT = path.resolve(__dirname, '../assets/hanzi/hanzi.js');

function fetchChar(ch) {
  const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(ch)}.json`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { res.resume(); return resolve({ ch, ok: false, code: res.statusCode }); }
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try { const j = JSON.parse(data); resolve({ ch, ok: true, strokes: j.strokes, medians: j.medians }); }
        catch (e) { resolve({ ch, ok: false, code: 'parse' }); }
      });
    }).on('error', (e) => resolve({ ch, ok: false, code: e.message }));
  });
}

(async () => {
  const out = {};
  const missing = [];
  for (const ch of CHARS) {
    const r = await fetchChar(ch);
    if (r.ok) { out[ch] = { strokes: r.strokes, medians: r.medians }; console.log('OK  ', ch, r.strokes.length, 'strokes'); }
    else { missing.push(ch); console.log('MISS', ch, r.code); }
  }
  fs.writeFileSync(OUT, '/* vendored hanzi-writer-data@2.0.1 stroke data — offline/deterministic */\nwindow.HANZI = ' + JSON.stringify(out) + ';\n');
  console.log('\nWROTE', OUT, '(' + Object.keys(out).length + ' chars)');
  if (missing.length) console.log('MISSING (need Noto SC / SVG fallback):', missing.join(' '));
})();
