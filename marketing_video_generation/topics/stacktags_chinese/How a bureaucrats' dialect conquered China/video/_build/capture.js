// Record the playing page in real time to a .webm via the cached Chromium.
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

const END = 118.5;   // narration length (script_audio.mp3 ≈ 118.72s)

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

  await page.goto('http://localhost:8848/video/index.html', { waitUntil: 'load' });
  // go to the white "clean" look immediately so the only near-black frames in the
  // recording are the t=0 sync flash (not the dark pre-clean body backdrop).
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  // dump the SFX declarations (replayed at mux time — Web-Audio isn't captured)
  try {
    const sfx = await page.evaluate(() => window.SFX || []);
    fs.writeFileSync(path.join(OUTDIR, 'sfx.json'), JSON.stringify(sfx));
    console.log('SFX cues:', sfx.length);
  } catch (e) { console.log('no SFX'); }

  // give the TWO 3D globes (hook + ship; Three.js + world-atlas from CDN) time
  // to finish their geometry build before playback (no mid-play init stall)
  await page.waitForTimeout(3200);

  // Hold a solid black frame for ~600ms, then clear it and start playback in the
  // SAME tick. The recorded black block ends exactly at audio t=0, so the mux can
  // find the precise trim point with blackdetect — robust to start-up lag.
  await page.evaluate(() => window.__showSync(true));
  await page.waitForTimeout(650);
  const preroll = (Date.now() - tRec) / 1000;   // wall-clock estimate (mux uses blackdetect)
  console.log('Playing… (wall-clock preroll ≈', preroll.toFixed(3), 's)');
  await page.evaluate(() => window.__play());
  fs.writeFileSync(path.join(OUTDIR, 'preroll.json'), JSON.stringify({ preroll }));

  // Sample the webm-wallclock -> audio-currentTime mapping at high frequency.
  // A headless render can run slower than real time, and NON-uniformly (a heavy
  // scene lags more than a light one), so a single PTS factor cannot resync it.
  // remux.js inverts this mapping and remaps every frame onto the audio clock.
  const samples = [];   // [webmTimeSec, currentTimeSec]
  const deadline = Date.now() + 200000;
  let last = -1, stalls = 0;
  while (Date.now() < deadline) {
    const t = await page.evaluate(() => document.querySelector('#vo').currentTime);
    const w = (Date.now() - tRec) / 1000;
    samples.push([+w.toFixed(4), +t.toFixed(4)]);
    if (t >= END) { console.log('reached end at', t.toFixed(2)); break; }
    if (Math.abs(t - last) < 0.004) { stalls++; if (stalls > 150) { console.log('stalled at', t.toFixed(2)); break; } }
    else stalls = 0;
    last = t;
    await page.waitForTimeout(55);
  }
  await page.waitForTimeout(1000);   // tail
  fs.writeFileSync(path.join(OUTDIR, 'timing.json'), JSON.stringify({ preroll, samples }));
  console.log('timing samples:', samples.length);

  const video = page.video();
  await context.close();            // finalizes the webm
  const webm = await video.path();
  await browser.close();
  console.log('WEBM:', webm);
  const dest = path.join(OUTDIR, 'recording.webm');
  fs.copyFileSync(webm, dest);
  console.log('SAVED:', dest, Math.round(fs.statSync(dest).size / 1024), 'KB');
})().catch(e => { console.error(e); process.exit(1); });
