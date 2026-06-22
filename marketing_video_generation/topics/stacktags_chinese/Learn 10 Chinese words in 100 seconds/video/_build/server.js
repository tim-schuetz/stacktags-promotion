// Minimal static file server for the topic folder (serves video/ + the mp3).
// Hardened: HTTP Range support (smooth media), streams, and never crashes on a
// client disconnect (the capture browser closing was killing the old server).
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');  // the topic folder
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.mp3':'audio/mpeg', '.svg':'image/svg+xml' };

const srv = http.createServer((req, res) => {
  req.on('error', () => {});
  res.on('error', () => {});
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.stat(fp, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('not found: ' + p); }
    const type = TYPES[path.extname(fp)] || 'application/octet-stream';
    const range = req.headers.range;
    const m = range && /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      let start = parseInt(m[1], 10); if (isNaN(start)) start = 0;
      let end = m[2] ? parseInt(m[2], 10) : st.size - 1;
      if (start > end || start >= st.size) { res.writeHead(416, { 'content-range': `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${start}-${end}/${st.size}`,
        'accept-ranges': 'bytes', 'content-length': end - start + 1, 'cache-control': 'no-store' });
      const rs = fs.createReadStream(fp, { start, end }); rs.on('error', () => res.destroy()); rs.pipe(res);
    } else {
      res.writeHead(200, { 'content-type': type, 'content-length': st.size, 'accept-ranges': 'bytes', 'cache-control': 'no-store' });
      const rs = fs.createReadStream(fp); rs.on('error', () => res.destroy()); rs.pipe(res);
    }
  });
});
srv.on('clientError', (e, sock) => { try { sock.destroy(); } catch {} });
process.on('uncaughtException', e => console.error('srv:', e.message));
srv.listen(8853, () => console.log('serving on http://localhost:8853'));
