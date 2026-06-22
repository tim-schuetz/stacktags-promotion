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

const TIMES = process.argv.slice(2).length
  ? process.argv.slice(2).map(Number)
  : [1.5, 7.5, 13.0, 18.5, 24.0, 28.5, 33.0, 39.0, 42.5, 50.5, 55.0, 59.5, 67.0, 70.5, 73.5, 81.0, 87.0, 97.5, 103.5];

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--ignore-gpu-blocklist', '--force-device-scale-factor=1', '--mute-audio'] });
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8871/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(900);

  for (const t of TIMES) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(450);
    const name = `t_${String(t).replace('.', '_')}.png`;
    await page.screenshot({ path: path.join(OUT, name) });
    console.log('shot', name);
  }
  await browser.close();
  console.log('done →', OUT);
})().catch(e => { console.error(e); process.exit(1); });
