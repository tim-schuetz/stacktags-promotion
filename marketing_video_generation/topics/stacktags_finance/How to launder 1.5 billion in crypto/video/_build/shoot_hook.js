// Quick QA: screenshot the hook at a few times.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'hook_qa');
fs.mkdirSync(OUT, { recursive: true });
const TIMES = process.argv.length > 2 ? process.argv.slice(2).map(Number) : [3, 4.5];
(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--force-device-scale-factor=1', '--mute-audio'] });
  const page = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 }).then(c => c.newPage());
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8863/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => document.body.classList.add('clean'));
  await page.waitForTimeout(700);
  for (const t of TIMES) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(700);
    const f = path.join(OUT, 'new' + String(t).replace('.', '_') + '.png');
    await page.screenshot({ path: f });
    console.log('shot', t);
  }
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
