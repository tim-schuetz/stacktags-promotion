// Seek to key timestamps and screenshot each beat (visual QA).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_CANDIDATES = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME_CANDIDATES.find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const SHOTS = process.argv[2]
  ? process.argv.slice(2).map(s => { const [l, t] = s.split('@'); return { l, t: +t }; })
  : [
    { l: 'hook',          t: 3.0 },
    { l: 'tang-head',     t: 8.0 },
    { l: 'tang-counter',  t: 13.5 },
    { l: 'tang-endings',  t: 19.0 },
    { l: 'moon-ngwat',    t: 25.0 },
    { l: 'moon-morph',    t: 31.0 },
    { l: 'collapse-trio', t: 39.5 },
    { l: 'collapse-van',  t: 45.0 },
    { l: 'collapse-400',  t: 51.5 },
    { l: 'pop-pile',      t: 56.5 },
    { l: 'pop-vowels',    t: 64.5 },
    { l: 'south-globe',   t: 68.2 },
    { l: 'south-photo',   t: 71.5 },
    { l: 'south-keep',    t: 79.0 },
    { l: 'south-poem-man',t: 84.5 },
    { l: 'south-poem-can',t: 87.0 },
    { l: 'punch-won',     t: 94.0 },
    { l: 'punch-lost',    t: 97.0 },
    { l: 'outro-brand',   t: 100.5 },
    { l: 'outro-cta',     t: 102.2 },
  ];

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--disable-gpu', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));

  await page.goto('http://localhost:8872/video/index.html', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(800);

  for (const s of SHOTS) {
    await page.evaluate(t => window.__seek(t), s.t);
    await page.waitForTimeout(s.t >= 67 && s.t <= 72 ? 2200 : 1000);  // globe needs longer to load
    const f = path.join(OUT, `${String(s.t).padStart(5,'0')}_${s.l}.png`);
    await page.screenshot({ path: f });
    console.log('shot', s.t, s.l);
  }
  if (errs.length) { console.log('\n=== CONSOLE ERRORS ==='); errs.slice(0, 40).forEach(e => console.log(' ', e)); }
  else console.log('\nno console errors');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
