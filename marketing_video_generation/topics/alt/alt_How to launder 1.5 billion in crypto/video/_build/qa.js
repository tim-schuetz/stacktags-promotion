// QA: open the page headless and screenshot each beat in a clean state so the
// layout can be eyeballed without a full capture. -> shots/<name>.png
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const exe = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));
const SHOTS = path.resolve(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// [name, kind, arg, classes]
const PLAN = [
  ['00_chart',     'chart'],
  ['00b_loot',     'beat', 0, []],
  ['01_ledger1',   'beat', 1, ['lit']],
  ['02_anon',      'beat', 2, ['stamp']],
  ['03_ledger2',   'beat', 3, []],          // chips auto-shown by __showBeat
  ['04_watch',     'beat', 4, ['seen']],
  ['05_easyhard',  'beat', 5, ['hard']],
  ['06_frozen',    'beat', 6, ['flag', 'froze']],
  ['07_move1',     'beat', 7, []],
  ['08_move2',     'beat', 8, []],
  ['09_move3',     'beat', 9, ['burst']],
  ['10_trans',     'beat', 10, ['lit']],
  ['11_callback',  'beat', 11, ['l2']],
  ['12_enum',      'enum', 0],
  ['13_outro',     'outro'],
];

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--disable-gpu', '--force-device-scale-factor=1'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8861/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]); } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(700);

  for (const [name, kind, arg, classes] of PLAN) {
    if (kind === 'chart') await page.evaluate(() => window.__showChart());
    else if (kind === 'beat') await page.evaluate(([i, c]) => window.__showBeat(i, c), [arg, classes || []]);
    else if (kind === 'enum') await page.evaluate((a) => window.__showEnum(a), arg);
    else if (kind === 'outro') await page.evaluate(() => window.__showOutro());
    await page.waitForTimeout(kind === 'enum' ? 1700 : 700);
    await page.screenshot({ path: path.join(SHOTS, name + '.png') });
    console.log('shot', name);
  }
  await browser.close();
  console.log('done ->', SHOTS);
})().catch(e => { console.error(e); process.exit(1); });
