const { chromium } = require('playwright-core');
const fs = require('fs');
const exe = ['C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'].find(p => fs.existsSync(p));
(async () => {
  const b = await chromium.launch({ executablePath: exe, headless: true, args: ['--autoplay-policy=no-user-gesture-required','--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8901/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  await page.evaluate(() => window.__seek(90.0));
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { sel, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: cs.opacity, disp: cs.display, txt: (el.textContent||'').slice(0,20) }; };
    return { ecPlay: document.querySelector('#outro-ec').className, items: ['#sc-outro','#outro-ec','#outro-logo','#outro-logo svg','.ec .wm','.ec .url'].map(pick) };
  });
  console.log(JSON.stringify(info, null, 1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
