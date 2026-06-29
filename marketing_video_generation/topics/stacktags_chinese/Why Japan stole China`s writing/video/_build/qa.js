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
  [2.6, 'in-china'], [5.4, 'in-jp-empty'], [7.0, 'in-jp-sound'], [8.6, 'in-handoff'], [10.6, 'in-bend'],
  [13.2, 'in-3scripts'],
  [16.5, 'scroll-show'], [20.0, 'scroll-filled'], [22.8, 'scroll-flood'],
  [27.0, 'unrelated'], [31.0, 'english-jam'], [33.8, 'english-nofit'],
  [37.0, 'twojobs'], [40.2, 'twojobs-sound'],
  [46.0, 'readings'], [49.6, 'readings-both'], [53.6, 'explode'],
  [60.0, 'kana-start'], [64.0, 'kana-morphed'], [70.0, 'mix-weave'],
  [76.5, 'resolve'], [79.6, 'resolve-snap'], [83.0, 'beauty'],
  [88.0, 'beauty-scroll'], [92.0, 'outro'],
];

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8903/video/index.html', { waitUntil: 'domcontentloaded' });
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
