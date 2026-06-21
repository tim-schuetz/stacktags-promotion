// Quick headless QA: load the page, capture console errors, seek to key
// timestamps via __seek and screenshot them. Fast sanity check before rendering.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'qa-shots');
fs.mkdirSync(OUT, { recursive: true });
const times = process.argv.slice(2).map(Number);
const TIMES = times.length ? times : [9, 21, 23, 107, 114, 126];

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--disable-gpu', '--force-device-scale-factor=1'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.goto('http://localhost:8853/video/index.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(400);
  for (const t of TIMES) {
    await page.evaluate(tt => window.__seek(tt), t);
    await page.waitForTimeout(450);
    const f = path.join(OUT, `t_${String(t).replace('.', '_')}.png`);
    await page.screenshot({ path: f });
    console.log('shot', t, '->', path.basename(f));
  }
  console.log(errors.length ? ('CONSOLE ERRORS:\n' + errors.join('\n')) : 'no console errors');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
