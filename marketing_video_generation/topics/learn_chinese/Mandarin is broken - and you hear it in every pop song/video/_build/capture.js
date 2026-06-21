// Record the playing page in real time to a .webm via the cached Chromium.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_CANDIDATES = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME_CANDIDATES.find(p => fs.existsSync(p));
const OUTDIR = path.resolve(__dirname, 'capture');
fs.mkdirSync(OUTDIR, { recursive: true });

const END = 107.5;   // play out to the end of the outro (narration ≈ 108.44s)

(async () => {
  const browser = await chromium.launch({
    executablePath: exe,
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--disable-gpu',
      '--force-device-scale-factor=1',
      '--mute-audio',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUTDIR, size: { width: 1080, height: 1920 } },
  });
  const page = await context.newPage();
  const tRec = Date.now();   // recording starts ~when the page is created
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });

  await page.goto('http://localhost:8872/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  // wait for the globe CDN deps (Three.js / earcut / topojson) — don't block forever
  try { await page.waitForFunction(() => window.THREE && window.earcut && window.topojson, { timeout: 20000 }); }
  catch { console.log('  (globe deps not ready in time — globe may fall back)'); }
  await page.waitForTimeout(1200);
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(800);

  // dump the SFX cue list (real CUE times) so mix_sfx.js can lay the sounds over the narration
  try {
    const sfx = await page.evaluate(() => window.SFX || []);
    fs.writeFileSync(path.join(OUTDIR, 'sfx.json'), JSON.stringify(sfx));
    console.log('SFX cues:', sfx.length, '→ capture/sfx.json');
  } catch (e) { console.log('  (no SFX list:', e.message, ')'); }

  const preroll = (Date.now() - tRec) / 1000;   // seconds of webm before content t=0
  console.log('Playing (wall-clock)… preroll =', preroll.toFixed(3), 's');
  await page.evaluate(() => window.__playForCapture());
  fs.writeFileSync(path.join(OUTDIR, 'preroll.json'), JSON.stringify({ preroll }));

  // wall-clock cue engine: poll the engine's own clock (not the muted audio)
  const deadline = Date.now() + 140000;
  while (Date.now() < deadline) {
    const t = await page.evaluate(() => window.__t());
    if (t >= END) { console.log('reached end at', t.toFixed(2)); break; }
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2600);   // tail — hold the Follow end-card

  const video = page.video();
  await context.close();            // finalizes the webm
  const webm = await video.path();
  await browser.close();
  console.log('WEBM:', webm);
  const dest = path.join(OUTDIR, 'recording.webm');
  fs.copyFileSync(webm, dest);
  console.log('SAVED:', dest, Math.round(fs.statSync(dest).size / 1024), 'KB');
})().catch(e => { console.error(e); process.exit(1); });
