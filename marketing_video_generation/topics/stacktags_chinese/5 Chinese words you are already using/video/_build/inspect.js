// Fast static QA: load once, render each scene cleanly (single beat or badge),
// let CSS settle, screenshot. Saves ./shots/insp_<name>.png. Always closes chromium.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CH = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
            'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const SHOTS = path.resolve(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// each: [name, evalFn-as-string, settleMs]
const SCENES = [
  ['names',      `window.__showBeat(1)`, 1400],
  ['gag',        `window.__showBeat(2,['helmet-in','baguette-in','rice-in'])`, 1400],
  ['badge',      `window.__showBadge(2,2)`, 2600],
  ['yy_intro',   `window.__showBeat(7)`, 1200],
  ['yy_reveal',  `window.__showBeat(7,['reveal','hl-yin','hl-yang'])`, 1500],
  ['yy_flag',    `window.__showBeat(7,['reveal','hl-yin','hl-yang','flag-in'])`, 1600],
  ['astro',      `window.__showBeat(8)`, 1400],
  ['mao',        `window.__showBeat(12,['mao-pop'])`, 1400],
  ['recap',      `window.__showBeat(13)`, 1400],
];

let browser;
(async () => {
  browser = await chromium.launch({ executablePath: CH, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--disable-gpu', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));

  await page.goto('http://localhost:8853/video/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => typeof window.__showBeat === 'function', null, { timeout: 15000 });
  await page.evaluate(async () => { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]); } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(500);

  for (const [name, fn, settle] of SCENES) {
    await page.evaluate(fn);
    await page.waitForTimeout(settle);
    await page.screenshot({ path: path.join(SHOTS, 'insp_' + name + '.png') });
    console.log('shot', name);
  }
  console.log('\nPAGE ERRORS:', errs.length ? '\n  ' + errs.slice(0, 30).join('\n  ') : 'none');
})()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(async () => { try { if (browser) await browser.close(); } catch {} });
