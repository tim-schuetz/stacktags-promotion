// Render thumbnail.html (1280×720) to ../thumbnail.png via the cached Chromium.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_CANDIDATES = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME_CANDIDATES.find(p => fs.existsSync(p));
const url = 'http://localhost:8871/video/_build/thumbnail.html';
const out = path.resolve(__dirname, '../thumbnail.png');

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--force-device-scale-factor=1'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(700);
  const elt = await page.$('#thumb');
  await elt.screenshot({ path: out });
  await browser.close();
  console.log('THUMB:', out, Math.round(fs.statSync(out).size / 1024), 'KB');
})().catch(e => { console.error(e); process.exit(1); });
