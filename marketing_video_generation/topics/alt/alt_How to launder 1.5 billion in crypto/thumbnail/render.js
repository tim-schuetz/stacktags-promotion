// Render Thumbnail.html (1280x720) to thumbnail.png via the cached Chromium.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--disable-gpu', '--force-device-scale-factor=1'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8861/thumbnail/Thumbnail.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]); } catch {} });
  await page.waitForTimeout(500);
  const el = await page.$('#thumb');
  await el.screenshot({ path: path.join(__dirname, 'thumbnail.png') });
  await browser.close();
  console.log('wrote thumbnail.png');
})().catch(e => { console.error(e); process.exit(1); });
