// Read window.SFX from the page (no recording needed) -> capture/sfx.json,
// so SFX can be (re)mixed without a fresh capture. Loads via file:// (no server).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const CH = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
            'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const idx = path.resolve(__dirname, '..', 'index.html');
const out = path.join(__dirname, 'capture', 'sfx.json');
fs.mkdirSync(path.dirname(out), { recursive: true });

let browser;
(async () => {
  browser = await chromium.launch({ executablePath: CH, headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto(pathToFileURL(idx).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => Array.isArray(window.SFX), null, { timeout: 10000 });
  const sfx = await page.evaluate(() => window.SFX);
  fs.writeFileSync(out, JSON.stringify(sfx));
  console.log('wrote sfx.json:', sfx.length, 'entries');
})()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(async () => { try { if (browser) await browser.close(); } catch {} });
