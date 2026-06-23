// Render the thumbnail HTML to a 1280x720 PNG.
const { chromium } = require('playwright-core');
const fs = require('fs'); const path = require('path');
const CHROME = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, '../../thumbnail/thumbnail.png');
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=1'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8873/thumbnail/thumbnail.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(600);
  const el = await page.$('#thumb');
  await el.screenshot({ path: OUT });
  console.log('SAVED', OUT);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
