// Seek to a list of timestamps and screenshot the 1080x1920 stage (clean mode).
// Uses the same cached Chromium as capture.js. Output: _build/shots/<t>.png
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));

const TIMES = (process.argv[2] || '2,4,9,12,16,20,26,32,37,48,53,57,62,66,70,72,76,78,81,88,90,98,106').split(',').map(Number);
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required','--disable-gpu','--force-device-scale-factor=1','--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await page.goto('file:///C:/software_projekte/bombatags/promotion/marketing_video_generation/topics/learn_chinese/Learn%20Chinese%20from%20brand%20names/video/index.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(400);
  for (const t of TIMES) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(1100); // let transitions settle
    const f = path.join(OUT, String(t).replace('.', '_') + '.png');
    await page.screenshot({ path: f });
    console.log('shot', t, '->', path.basename(f));
  }
  if (errs.length) console.log('\nPAGE ERRORS:\n' + errs.join('\n'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
