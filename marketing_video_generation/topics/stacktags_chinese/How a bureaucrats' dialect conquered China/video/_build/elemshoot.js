// Record a default-element demo to <elem>/preview.mp4 (+ a couple QA frames).
// Usage: node elemshoot.js <elem-folder> <durationSec>
const { chromium } = require('playwright-core');
const { execFileSync, spawnSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DEF = path.resolve(__dirname, '../../../../../default_video_elements');
const elem = process.argv[2];
const DUR = parseFloat(process.argv[3] || '6');
if (!elem) { console.error('need elem folder'); process.exit(1); }

const CHROME = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.ogg':'audio/ogg', '.mp3':'audio/mpeg', '.svg':'image/svg+xml', '.mp4':'video/mp4' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  const fp = path.join(DEF, p);
  if (!fp.startsWith(DEF)) { res.writeHead(403); return res.end(); }
  fs.readFile(fp, (e, b) => { if (e) { res.writeHead(404); return res.end('404 ' + p); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream', 'cache-control': 'no-store' }); res.end(b); });
}).listen(8849);

(async () => {
  const OUT = path.join(DEF, elem, '_rec');
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--disable-gpu', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1080, height: 1920 } } });
  const tRec = Date.now();              // recording starts ~when the page is created
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto(`http://localhost:8849/${elem}/demo.html`, { waitUntil: 'load' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.addStyleTag({ content: 'button{display:none!important}' });   // hide the viewer Play button
  await page.evaluate(() => window.__demoReady || Promise.resolve());
  await page.waitForTimeout(1800);                 // let the globe/world-atlas mount
  await page.evaluate(() => { try { window.__demoPlay && window.__demoPlay(); } catch (e) {} });
  await page.waitForTimeout(DUR * 1000 + 400);
  const video = page.video();
  await ctx.close();
  const webm = await video.path();
  await browser.close();
  server.close();

  // The heavy globe build stalls the recording during load, so the timeline
  // lags there and the actual animation lands at the END of the webm. Trim the
  // LAST (DUR + small tail) seconds = the play window.
  const probe = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nokey=1:noprint_wrappers=1', f], { encoding: 'utf8' }).trim());
  const wdur = probe(webm);
  const ss = Math.max(0, wdur - DUR - 0.25);
  const out = path.join(DEF, elem, 'preview.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', ss.toFixed(2), '-i', webm,
    '-t', DUR.toFixed(2), '-vf', 'fps=30,scale=1080:1920:flags=lanczos', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-preset', 'medium', '-crf', '21', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('preview:', out, Math.round(fs.statSync(out).size / 1024) + 'KB');
  fs.rmSync(OUT, { recursive: true, force: true });
})().catch(e => { console.error(e); server.close(); process.exit(1); });
