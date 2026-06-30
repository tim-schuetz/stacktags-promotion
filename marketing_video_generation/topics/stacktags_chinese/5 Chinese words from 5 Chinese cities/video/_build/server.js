// Minimal static file server for the video folder (so fetch/media work cleanly).
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');  // the topic folder (holds video/ + the mp3)
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.mp3':'audio/mpeg', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.stat(fp, (serr, st) => {
    if (serr || !st.isFile()) { res.writeHead(404); return res.end('not found: ' + p); }
    const type = TYPES[path.extname(fp)] || 'application/octet-stream';
    const range = req.headers.range;
    // honour byte-range requests so <audio>/<video> are seekable (needed for QA seeks)
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : st.size - 1;
      if (isNaN(start) || start < 0) start = 0;
      if (isNaN(end) || end >= st.size) end = st.size - 1;
      if (start > end) { res.writeHead(416, { 'content-range': `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { 'content-type': type, 'cache-control': 'no-store',
        'accept-ranges': 'bytes', 'content-range': `bytes ${start}-${end}/${st.size}`,
        'content-length': end - start + 1 });
      return fs.createReadStream(fp, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store',
      'accept-ranges': 'bytes', 'content-length': st.size });
    fs.createReadStream(fp).pipe(res);
  });
}).listen(8911, () => console.log('serving on http://localhost:8911'));
