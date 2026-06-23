// Render the thumbnail at 2x via the cached Chromium, then it gets downscaled.
const { chromium } = require('../video/_build/node_modules/playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME.find((p) => fs.existsSync(p));

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--force-device-scale-factor=2'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8862/thumbnail/thumbnail.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.resolve(__dirname, 'thumbnail_2x.png') });
  await browser.close();
  console.log('shot thumbnail_2x.png');
})().catch((e) => { console.error(e); process.exit(1); });
