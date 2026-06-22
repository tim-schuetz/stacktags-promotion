// Seek to a list of timestamps and screenshot (instant end-state QA).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_CANDIDATES = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME_CANDIDATES.find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'final_frames');
fs.mkdirSync(OUT, { recursive: true });

const TIMES = (process.argv[2] || '1.5,9.6,10.9,13,15,18.5,22,26.5,31.6,36,45,51.5,54,58,63,73.5,81,85.5,92,95,102,108.6,113,117')
  .split(',').map(Number);

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--ignore-gpu-blocklist', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [err]', m.text()); });
  await page.goto('http://localhost:8870/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => document.body.classList.add('clean'));
  await page.waitForTimeout(1200);
  for (const t of TIMES) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(900);   // let CSS transitions settle
    const f = path.join(OUT, 't' + String(t).replace('.', '_') + '.png');
    await page.screenshot({ path: f });
    console.log('shot', t);
  }
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
