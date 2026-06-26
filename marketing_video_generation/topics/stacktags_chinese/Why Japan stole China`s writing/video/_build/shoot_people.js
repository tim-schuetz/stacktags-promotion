const { chromium } = require('playwright-core');
const { pathToFileURL } = require('url');
const fs = require('fs'); const path = require('path');
const CHROME = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'];
const exe = CHROME.find((p) => fs.existsSync(p));
(async () => {
  const b = await chromium.launch({ executablePath: exe, headless: true, args: ['--force-device-scale-factor=1'] });
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(path.resolve(__dirname, 'people_test.html')).href, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.resolve(__dirname, 'qa/people.png') });
  await b.close(); console.log('shot people.png');
})().catch((e) => { console.error(e); process.exit(1); });
