// Seek to key beats and screenshot them (cheap visual QA before the full capture).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const SHOTS = path.resolve(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const TIMES = process.argv.slice(2).length ? process.argv.slice(2).map(Number)
  : [16, 17.5, 21, 33.5, 36.5, 39, 46, 49.5, 52, 54, 58, 85.5];

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await page.goto('http://localhost:8891/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(4000);                 // let the atlas/maps mount
  await page.evaluate(() => document.body.classList.add('clean'));
  for (const t of TIMES) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(650);
    const f = path.join(SHOTS, `t_${String(t).replace('.', '_')}.png`);
    await page.screenshot({ path: f });
    console.log('shot', t);
  }
  if (errs.length) { console.log('\n--- page errors ---'); [...new Set(errs)].slice(0, 30).forEach(e => console.log(' ', e)); }
  else console.log('\nno page errors');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
