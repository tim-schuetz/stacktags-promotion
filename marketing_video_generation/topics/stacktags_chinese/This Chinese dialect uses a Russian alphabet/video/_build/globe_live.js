// Live check: play and screenshot during the migration globe (route reveal).
const { chromium } = require('playwright-core');
const fs = require('fs'); const path = require('path');
const CHROME = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'qa'); fs.mkdirSync(OUT, { recursive: true });
const GRABS = [11.5, 13.5, 15.5];   // globe appears, route reveals, route grows
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8873/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.body.classList.add('clean'));
  await page.evaluate(() => window.__play());
  let done = 0;
  for (const g of GRABS) {
    while (await page.evaluate(() => document.querySelector('#vo').currentTime) < g) { await page.waitForTimeout(60); }
    const f = path.join(OUT, `live_${String(g).replace('.', '_')}.png`);
    await page.screenshot({ path: f }); console.log('shot', f); done++;
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
