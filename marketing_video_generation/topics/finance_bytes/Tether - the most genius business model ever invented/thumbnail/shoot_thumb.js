// Screenshot the 1280x720 thumbnail to thumbnail.png (served via the video _build server on :8871).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const CHROME = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find((p) => fs.existsSync(p));

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=1'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  await page.goto('http://localhost:8871/thumbnail/thumbnail.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(500);
  const el = await page.$('#thumb');
  await el.screenshot({ path: path.join(__dirname, 'thumbnail.png') });
  await browser.close();
  console.log('wrote thumbnail.png');
})().catch((e) => { console.error(e); process.exit(1); });
