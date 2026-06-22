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

const END = 84.4;   // narration ends ~84.3s (script_voice.mp3 ≈ 84.71s)

let browser;
(async () => {
  browser = await chromium.launch({
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

  await page.goto('http://localhost:8861/video/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(async () => { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]); } catch {} });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(800);

  // SFX list (default-element sounds rebuilt at real CUE times) → mixed in by mix_sfx.js
  const sfx = await page.evaluate(() => window.SFX || []);
  fs.writeFileSync(path.join(OUTDIR, 'sfx.json'), JSON.stringify(sfx));
  console.log('SFX entries:', sfx.length);

  const preroll = (Date.now() - tRec) / 1000;   // seconds of webm before audio t=0
  console.log('Playing… preroll =', preroll.toFixed(3), 's');
  await page.evaluate(() => window.__play());
  fs.writeFileSync(path.join(OUTDIR, 'preroll.json'), JSON.stringify({ preroll }));

  const deadline = Date.now() + 130000;
  let last = 0, stalls = 0;
  while (Date.now() < deadline) {
    const t = await page.evaluate(() => document.querySelector('#vo').currentTime);
    if (t >= END) { console.log('reached end at', t.toFixed(2)); break; }
    if (Math.abs(t - last) < 0.05) { stalls++; if (stalls > 20) { console.log('stalled at', t.toFixed(2)); break; } }
    else stalls = 0;
    last = t;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(2400);   // tail — hold the Follow end-card

  const video = page.video();
  await context.close();            // finalizes the webm
  const webm = await video.path();
  console.log('WEBM:', webm);
  const dest = path.join(OUTDIR, 'recording.webm');
  fs.copyFileSync(webm, dest);
  console.log('SAVED:', dest, Math.round(fs.statSync(dest).size / 1024), 'KB');
})()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(async () => { try { if (browser) await browser.close(); } catch {} });
