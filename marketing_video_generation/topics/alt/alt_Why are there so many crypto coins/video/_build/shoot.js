// QA: open the page, seek to a list of timestamps, screenshot each (clean mode).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const exe = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));

const OUT = path.resolve(__dirname, 'capture', 'shots');
fs.mkdirSync(OUT, { recursive: true });

const TIMES = process.argv.slice(2).map(Number);
const list = TIMES.length ? TIMES : [1.0, 3.0, 5.5, 9.0, 14.5, 18.0, 21.5, 24.5, 28.0, 31.0, 33.5, 36.5, 38.5, 41.0, 44.5, 46.0, 48.5, 51.0, 53.0, 57.0, 59.0, 62.5, 64.5, 66.5, 69.5, 71.5, 74.0, 77.0, 79.5, 81.5];

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist', '--force-device-scale-factor=1', '--mute-audio'] });
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8871/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => document.body.classList.add('clean'));
  await page.waitForTimeout(700);
  for (const t of list) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(700);   // let transitions settle to end-state
    const f = path.join(OUT, `t${String(t).replace('.', '_')}.png`);
    await page.screenshot({ path: f });
    console.log('shot', t, '->', path.basename(f));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
