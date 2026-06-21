// Quick layout/preview screenshots of the changed scenes (no full capture).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-gpu', '--force-device-scale-factor=1', '--mute-audio'] });
  const page = await (await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8872/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  try { await page.waitForFunction(() => window.THREE && window.earcut && window.topojson, { timeout: 20000 }); } catch {}
  await page.waitForTimeout(800);
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(400);

  const shot = async name => { await page.screenshot({ path: path.join(OUT, name + '.png') }); console.log('  shot', name); };

  // POEM (figures + bubbles + old man on the right)
  await page.evaluate(() => window.__seek(88.5)); await page.waitForTimeout(500); await shot('poem');

  // PUNCH (lead figure slid high up, bubble to the right, crowd below)
  await page.evaluate(() => window.__seek(100.0)); await page.waitForTimeout(1700); await shot('punch');

  // RESULT — show the depth grid on beat 5, then drive the fill/scroll forward
  await page.evaluate(() => window.__seek(49.5));      // beat 5 visible (INSTANT end-state)
  await page.evaluate(() => window.__rr(false));       // restart the animation forward
  await page.waitForTimeout(650);  await shot('result_a_fill');     // early: bottom fills
  await page.waitForTimeout(900);  await shot('result_b_scroll');   // mid: scrolling up
  await page.waitForTimeout(1750); await shot('result_c_top');      // end: stopped at top
  await page.evaluate(() => { document.querySelector('#result-beat').classList.add('box-in'); });
  await page.waitForTimeout(700);  await shot('result_d_box');      // box landed

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
