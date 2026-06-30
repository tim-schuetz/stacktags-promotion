// Live-playback QA: capture the Qingdao->globe transition AS IT PLAYS (the iris +
// globe pull-back can't be seen via instant __seek), plus static checks for the
// recap (west/east no pill) and the hook subtitle ("...again.").
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const exe = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
const OUT = path.resolve(__dirname, 'shots_qa'); fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist',
           '--enable-gpu-rasterization', '--force-device-scale-factor=1', '--mute-audio'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
  await page.goto('http://localhost:8911/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(1500);

  // ---- static beats (instant seek end-states) ----
  for (const t of [20.4, 59.5, 67.0, 86.0, 111.5, 113.0]) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, `s_${String(t).replace('.', '_')}.png`) });
    console.log('static', t);
  }

  // ---- LIVE: seek to 80s and, once the seek truly completes ('seeked'), play at
  // 1x. No fast-forward — depth transitions need real-time to resolve cleanly. ----
  await page.evaluate(() => new Promise((res) => {
    const vo = document.querySelector('#vo');
    vo.muted = true;
    const onSeeked = () => { vo.removeEventListener('seeked', onSeeked); vo.play().then(res).catch(() => res()); };
    vo.addEventListener('seeked', onSeeked);
    window.__seek(80.0);
  }));
  const grabs = [88.6, 89.5, 90.4, 91.3, 92.2, 93.2];
  let gi = 0;
  const t0 = Date.now();
  let lastlog = 0;
  while (gi < grabs.length && Date.now() - t0 < 20000) {
    const ct = await page.evaluate(() => document.querySelector('#vo').currentTime);
    if (Date.now() - lastlog > 1000) { console.log('  ...ct', ct.toFixed(2)); lastlog = Date.now(); }
    while (gi < grabs.length && ct >= grabs[gi]) {
      await page.screenshot({ path: path.join(OUT, `live_${String(grabs[gi]).replace('.', '_')}.png`) });
      console.log('live', grabs[gi].toFixed(2), '(ct', ct.toFixed(2), ')');
      gi++;
    }
    await page.waitForTimeout(50);
  }
  await browser.close();
  console.log('done ->', OUT);
})().catch(e => { console.error(e); process.exit(1); });
