// Fast static QA of the "borrowed-from" gag scene only: render beat 2 (IDX.borrowed) with
// helmet-in + baguette-in + rice-in applied, screenshot it. No real-time playback.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CH = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
            'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const SHOTS = path.resolve(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const OUT = path.join(SHOTS, process.argv[2] || 'gag.png');

let browser;
(async () => {
  browser = await chromium.launch({ executablePath: CH, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--disable-gpu', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await page.goto('http://localhost:8853/video/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(async () => { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]); } catch {} });
  await page.waitForTimeout(800);
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  // show the gag with all three in-states; the transitions settle quickly
  await page.evaluate(() => window.__showBeat(2, ['helmet-in', 'baguette-in', 'rice-in']));
  await page.waitForTimeout(1100);
  await page.screenshot({ path: OUT });
  console.log('shot ->', OUT, '  PAGE ERRORS:', errs.length ? '\n  ' + errs.slice(0, 20).join('\n  ') : 'none');
})()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(async () => { try { if (browser) await browser.close(); } catch {} });
