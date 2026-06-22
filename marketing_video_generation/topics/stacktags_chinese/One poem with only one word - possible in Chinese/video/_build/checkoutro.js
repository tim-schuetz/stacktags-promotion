// Seek into the outro, wait for the CSS reveal transitions to finish, screenshot.
const { chromium } = require('playwright-core');
const fs = require('fs');
const exe = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
].find(p => fs.existsSync(p));
(async () => {
  const b = await chromium.launch({ executablePath: exe, headless: true, args: ['--disable-gpu', '--mute-audio'] });
  const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
  p.on('console', m => { if (m.type() === 'error') console.log('[err]', m.text()); });
  await p.goto('http://localhost:8867/video/index.html', { waitUntil: 'load' });
  await p.evaluate(async () => { try { await document.fonts.ready; } catch {} document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => window.__seek(93.0));   // enters outro, adds .play
  await p.waitForTimeout(2400);                   // let logo→wordmark→url reveal fully
  await p.screenshot({ path: require('path').resolve(__dirname, 'shots/outro_final.png') });
  console.log('outro_final.png written');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
