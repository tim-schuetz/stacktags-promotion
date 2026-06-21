// QA: play the page in real time and screenshot at given audio timestamps
// (forward only — no seeking). Saves to ./shots/<t>.png and logs page errors.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CH = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
            'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const SHOTS = path.resolve(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const TIMES = (process.argv[2] || '0.8,4.5,8.2,12.5,14.6,17.4,19.2,22,26.5,30,36,39,41.5,47.5,52,56,66,73,77,82.5,87.5,90.5,98,105,112,114.6')
  .split(',').map(Number);

let browser;
(async () => {
  browser = await chromium.launch({ executablePath: CH, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--disable-gpu', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  page.on('crash', () => errs.push('PAGE CRASHED'));

  await page.goto('http://localhost:8853/video/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(async () => { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]); } catch {} });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); window.__play(); });

  const todo = [...TIMES].sort((a, b) => a - b);
  const deadline = Date.now() + 140000;
  while (todo.length && Date.now() < deadline) {
    const t = await page.evaluate(() => document.querySelector('#vo').currentTime);
    while (todo.length && t >= todo[0]) {
      const target = todo.shift();
      const name = String(target).replace('.', '_') + 's.png';
      await page.screenshot({ path: path.join(SHOTS, name) });
      console.log('shot @', target, '(t=' + t.toFixed(2) + ')');
    }
    await page.waitForTimeout(120);
  }
  console.log('\nPAGE ERRORS:', errs.length ? '\n  ' + errs.slice(0, 30).join('\n  ') : 'none');
})()
  .catch(e => { console.error(e); process.exitCode = 1; })
  // ALWAYS close chromium so no orphaned headless chrome.exe piles up
  .finally(async () => { try { if (browser) await browser.close(); } catch {} });
