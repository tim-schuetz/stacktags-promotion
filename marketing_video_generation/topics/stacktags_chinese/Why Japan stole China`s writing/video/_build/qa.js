// Seek to each beat and screenshot it (cheap QA before the real capture).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME.find((p) => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'qa');
fs.mkdirSync(OUT, { recursive: true });

// [time, label]
const SHOTS = [
  [1.5, 'hook-sentence'], [4.6, 'hook-split'],
  [6.0, 'borrow-start'], [7.0, 'borrow-handoff'], [8.2, 'borrow-jp2'], [9.3, 'borrow-jp3'],
  [13.0, 'scroll-show'], [17.2, 'scroll-filled'], [20.5, 'map-sail'],
  [24.5, 'figure'], [28.5, 'english-jam'], [31.5, 'english-nofit'],
  [36.5, 'twojobs-meaning'], [39.0, 'twojobs-sound'],
  [45.8, 'readings-on'], [47.2, 'readings-both'], [51.0, 'explode'],
  [59.5, 'kana-start'], [62.0, 'kana-morphed'], [68.0, 'mix-weave'],
  [74.5, 'resolve'], [77.5, 'resolve-snap'], [80.5, 'beauty'],
  [85.5, 'beauty-scroll'], [90.0, 'outro'],
];

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8871/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => document.body.classList.add('clean'));
  await page.waitForTimeout(600);

  for (const [t, label] of SHOTS) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(850);   // let transitions settle
    const f = path.join(OUT, `${String(t).padStart(5, '0')}_${label}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f);
  }
  await browser.close();
  console.log('QA done');
})().catch((e) => { console.error(e); process.exit(1); });
