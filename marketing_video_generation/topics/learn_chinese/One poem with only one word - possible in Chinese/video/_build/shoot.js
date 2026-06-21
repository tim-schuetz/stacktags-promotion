// QA: seek to key beats (via window.__seek) and screenshot each into shots/.
// Usage: node shoot.js                     # the default beat list
//        node shoot.js hero@7 twist@51.5   # custom label@time pairs
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const exe = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const DEFAULT = [
  ['00_wall', 1.5], ['01_allshi', 4.0], ['02_hero', 8.0], ['03_title', 11.5],
  ['04_chao', 14.5], ['05_tones', 20.5], ['06_wave', 26.0], ['07_listener', 31.5],
  ['08_soundwall', 35.0], ['09_paper', 38.5], ['10_poet', 41.6], ['11_lion', 43.2],
  ['12_ten', 44.6], ['13_market', 46.5], ['14_stonelion', 51.6], ['15_fan', 53.5],
  ['16_ok', 56.5], ['17_shape', 60.5], ['18_tonesx', 63.5], ['19_brush', 67.0],
  ['20_collapse', 71.0], ['21_honest', 78.0], ['22_punch', 86.0],
  ['23_outro', 93.6], ['24_outro_cta', 95.4],
];

(async () => {
  const list = process.argv.slice(2).length
    ? process.argv.slice(2).map(a => { const [l, t] = a.split('@'); return [l, parseFloat(t)]; })
    : DEFAULT;
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--disable-gpu', '--force-device-scale-factor=1', '--mute-audio'] });
  const page = await (await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8867/video/index.html', { waitUntil: 'load' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(1500);
  for (const [label, t] of list) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(420);
    const f = path.join(OUT, `${label}.png`);
    await page.screenshot({ path: f });
    console.log('shot', label, '@', t + 's');
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
