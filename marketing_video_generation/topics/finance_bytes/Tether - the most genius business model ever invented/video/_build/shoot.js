// Seek to representative timestamps and screenshot each beat (instant end-states)
// — the cheap QA loop before the expensive real-time capture.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find((p) => fs.existsSync(p));

const SHOTS = [
  [7.5, '01_headlines'],
  [13.0, '02_mechanic'],
  [22.0, '03_peg'],
  [47.0, '04_trick'],
  [55.5, '05_zero'],
  [78.0, '07_cost'],
  [81.0, '08a_room_bar'],
  [85.0, '08b_room_both'],
  [92.0, '09_catch'],
  [102.0, '10_audit'],
  [116.0, '11_punch_coin'],
  [121.5, '12_outro'],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist', '--force-device-scale-factor=1', '--mute-audio'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  await page.goto('http://localhost:8871/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(600);
  const dir = path.join(__dirname, 'shots');
  fs.mkdirSync(dir, { recursive: true });
  for (const [t, name] of SHOTS) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(750);
    await page.screenshot({ path: path.join(dir, name + '.png') });
    console.log('  shot', name, '@', t);
  }
  await browser.close();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
