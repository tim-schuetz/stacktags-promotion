// Cheap pre-capture QA: seek to each beat and screenshot the settled state.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const CHROME = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'qa'); fs.mkdirSync(OUT, { recursive: true });
const TIMES = process.argv.slice(2).map(Number);
const LIST = TIMES.length ? TIMES : [1.0, 4.6, 8.0, 19.0, 22.5, 25.5, 28.0, 34.5, 37.0, 43.5, 47.5, 53.5, 58.5, 66.0, 78.5];

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8873/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.waitForTimeout(1800);   // let three.js / world-atlas load
  await page.evaluate(() => document.body.classList.add('clean'));
  for (const t of LIST) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(700);
    const f = path.join(OUT, `t_${String(t).replace('.', '_')}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
