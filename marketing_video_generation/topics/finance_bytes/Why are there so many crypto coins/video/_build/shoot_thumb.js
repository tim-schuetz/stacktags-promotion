// Render the thumbnail page to a 1280×720 PNG.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, '../../thumbnail/thumbnail.png');

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--force-device-scale-factor=1'] });
  const page = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }).then(c => c.newPage());
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8870/thumbnail/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  await browser.close();
  console.log('SAVED', OUT);
})().catch(e => { console.error(e); process.exit(1); });
