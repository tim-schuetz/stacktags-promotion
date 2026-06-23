// QA: seek to key timestamps and screenshot the page (no recording) for visual review.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_CANDIDATES = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME_CANDIDATES.find(p => fs.existsSync(p));
const OUTDIR = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUTDIR, { recursive: true });

const DEFAULT_TS = [1.0, 3.0, 6.5, 9.0, 13.0, 18.5, 24.5, 26.5, 28.0, 33.4, 36.0, 41.0, 43.0, 44.5, 49.0, 53.0, 55.2, 57.5, 61.5, 63.0, 68.7, 73.0, 77.0, 80.5, 83.5, 85.6, 87.5, 90.5, 97.0, 99.5, 103.5, 106.5];

(async () => {
  const ts = process.argv.slice(2).map(Number).filter(n => !isNaN(n));
  const times = ts.length ? ts : DEFAULT_TS;
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--force-device-scale-factor=1'] });
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8863/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(400);
  for (const t of times) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(700);   // let in-scene animations settle
    const name = 't_' + String(t).replace('.', '_') + '.png';
    await page.screenshot({ path: path.join(OUTDIR, name) });
    console.log('  shot', name);
  }
  await browser.close();
  console.log('Done ->', OUTDIR);
})().catch(e => { console.error(e); process.exit(1); });
