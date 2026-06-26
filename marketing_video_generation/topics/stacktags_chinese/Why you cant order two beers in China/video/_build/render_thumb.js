// Screenshot the thumbnail page at 1280x720 -> thumbnail/thumbnail.png
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, '../../thumbnail/thumbnail.png');

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--force-device-scale-factor=1', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  await page.goto('http://localhost:8888/thumbnail/thumbnail.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForFunction(() => window.__ready === true, { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(500);
  const thumb = await page.$('#thumb');
  await thumb.screenshot({ path: OUT });
  console.log('SAVED', OUT);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
