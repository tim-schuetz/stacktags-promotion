// Record the playing page in real time to a .webm via the cached Chromium.
// Burns a black sync flash at audio t=0 so mux.js can find the exact trim point.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_CANDIDATES = [
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  'C:/Users/tjsch/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',
];
const exe = CHROME_CANDIDATES.find(p => fs.existsSync(p));
const OUTDIR = path.resolve(__dirname, 'capture');
fs.mkdirSync(OUTDIR, { recursive: true });

const END = 68.68;   // narration length (script_audio_combined.mp3 ≈ 68.68s)

(async () => {
  const browser = await chromium.launch({
    executablePath: exe,
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--disable-gpu',
      '--force-device-scale-factor=1',
      '--mute-audio',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUTDIR, size: { width: 1080, height: 1920 } },
  });
  const page = await context.newPage();
  const tRec = Date.now();   // recording starts ~when the page is created
  page.on('console', m => { if (m.type() === 'error') console.log('  [page error]', m.text()); });

  await page.goto('http://localhost:8867/video/index.html', { waitUntil: 'load' });
  // go to the white "clean" look immediately so the only near-black frames in the
  // recording are the t=0 sync flash (not a dark pre-clean body backdrop).
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  // dump the SFX list so mix_sfx.js can overlay the sounds at the real cue times
  try { const sfx = await page.evaluate(() => window.SFX || []); fs.writeFileSync(path.join(OUTDIR, 'sfx.json'), JSON.stringify(sfx)); } catch (e) {}
  // let fonts + the cut-out PNGs decode
  await page.waitForTimeout(2200);

  // Hold a solid black frame ~650ms, then clear it and start playback in the SAME
  // tick. The recorded black block ends exactly at audio t=0, so the mux can find
  // the precise trim point with blackdetect — robust to start-up lag.
  await page.evaluate(() => window.__showSync(true));
  await page.waitForTimeout(650);
  const preroll = (Date.now() - tRec) / 1000;   // wall-clock estimate (mux uses blackdetect)
  console.log('Playing… (wall-clock preroll ≈', preroll.toFixed(3), 's)');
  await page.evaluate(() => window.__play());
  fs.writeFileSync(path.join(OUTDIR, 'preroll.json'), JSON.stringify({ preroll }));

  // wait until the narration finishes (poll currentTime)
  const deadline = Date.now() + 130000;
  let last = 0, stalls = 0;
  while (Date.now() < deadline) {
    const t = await page.evaluate(() => document.querySelector('#vo').currentTime);
    if (t >= END) { console.log('reached end at', t.toFixed(2)); break; }
    if (Math.abs(t - last) < 0.05) { stalls++; if (stalls > 20) { console.log('stalled at', t.toFixed(2)); break; } }
    else stalls = 0;
    last = t;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(2400);   // tail — hold the Follow end-card

  const video = page.video();
  await context.close();            // finalizes the webm
  const webm = await video.path();
  await browser.close();
  console.log('WEBM:', webm);
  const dest = path.join(OUTDIR, 'recording.webm');
  fs.copyFileSync(webm, dest);
  console.log('SAVED:', dest, Math.round(fs.statSync(dest).size / 1024), 'KB');
})().catch(e => { console.error(e); process.exit(1); });
