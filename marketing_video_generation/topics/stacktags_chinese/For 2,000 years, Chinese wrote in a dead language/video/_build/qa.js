// QA: seek to representative beat times and screenshot each (clean mode).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'capture');
fs.mkdirSync(OUT, { recursive: true });
const TIMES = (process.argv.slice(2).map(Number).filter(n => !isNaN(n)));
const DEF = [2.5, 5.0, 6.5, 9.0, 11.2, 17.5, 20.5, 24.0, 27.5, 31.0, 35.2, 36.6, 39.5, 42.0, 49.0, 51.0, 56.5, 60.5, 63.5, 70.0, 73.5, 78.6, 81.0];
const times = TIMES.length ? TIMES : DEF;

(async () => {
  const browser = await chromium.launch({
    executablePath: exe, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--force-device-scale-factor=1', '--mute-audio'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await page.goto('http://localhost:8894/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.body.classList.add('clean'));
  for (const t of times) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(450);
    const f = path.join(OUT, 'qa_' + t.toFixed(1) + '.png');
    await page.screenshot({ path: f });
    console.log('shot', f);
  }
  console.log('PAGE ERRORS:', errs.length);
  errs.slice(0, 25).forEach(e => console.log('  ', e));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
