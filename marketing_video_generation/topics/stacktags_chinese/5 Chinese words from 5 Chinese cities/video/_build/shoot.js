// Seek to key timestamps and screenshot each (for visual QA / tuning).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_CANDIDATES = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME_CANDIDATES.find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

// times (seconds) to capture; override via argv
const TIMES = process.argv.slice(2).length
  ? process.argv.slice(2).map(Number)
  : [0.8, 1.9, 5.0, 9.0, 11.5, 17.0, 21.5, 24.0, 37.0, 45.0, 48.0, 52.5, 55.5, 59.0, 67.0, 70.0, 73.0, 86.0, 95.0, 99.0, 108.5, 112.5];

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--disable-gpu', '--force-device-scale-factor=1', '--mute-audio'] });
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8861/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(1800); // let maps + globe mount

  for (const t of TIMES) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(t < 1.7 ? 1200 : 450); // globe needs more frames
    const name = `t_${String(t).replace('.', '_')}.png`;
    await page.screenshot({ path: path.join(OUT, name) });
    console.log('shot', name);
  }
  await browser.close();
  console.log('done →', OUT);
})().catch(e => { console.error(e); process.exit(1); });
