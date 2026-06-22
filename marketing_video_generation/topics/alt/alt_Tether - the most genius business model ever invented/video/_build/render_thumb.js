// Render thumbnail.html → thumbnail.png (1280×720) via cached Chromium.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--force-device-scale-factor=2'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8870/video/thumbnail/thumbnail.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(600);
  const el = await page.$('#thumb');
  const out = path.resolve(__dirname, '../thumbnail/thumbnail.png');
  await el.screenshot({ path: out });
  await browser.close();
  console.log('THUMB:', out, Math.round(fs.statSync(out).size / 1024), 'KB');
})().catch(e => { console.error(e); process.exit(1); });
