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

const END = 89.4;   // narration length (script_voice.mp3 ≈ 90.0s)

(async () => {
  const browser = await chromium.launch({
    executablePath: exe,
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      // Let WebGL use the GPU (software WebGL via --disable-gpu starves the CPU
      // and stretches the recorded timeline → drift). The globe is also gated to
      // only render while it's on-screen (see globe.js pause/dispose).
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
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

  await page.goto('http://localhost:8896/video/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
  // dump the page's declared SFX bed so the audio step can rebuild it
  // deterministically (headless can't record Web Audio).
  try {
    const sfx = await page.evaluate(() => window.SFX || []);
    fs.writeFileSync(path.join(OUTDIR, 'sfx.json'), JSON.stringify(sfx));
    console.log('SFX cues dumped:', sfx.length);
  } catch (e) { console.log('SFX dump failed:', e.message); }
  await page.waitForTimeout(600);
  await page.evaluate(() => { document.body.classList.add('clean'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(800);

  // Start playback, then measure the preroll at the moment the audio ACTUALLY
  // begins advancing (decode/buffer latency means currentTime can stay at 0 for
  // a beat after .play() resolves). Aligning the trim to real audio-t=0 keeps
  // the video from lagging the narration.
  await page.evaluate(() => window.__play());
  let ct = 0;
  while (ct < 0.04) { ct = await page.evaluate(() => document.querySelector('#vo').currentTime); }
  const preroll = (Date.now() - tRec) / 1000 - ct;   // wall-clock of audio t=0
  console.log('Playing… preroll =', preroll.toFixed(3), 's (ct@measure =', ct.toFixed(3), ')');
  fs.writeFileSync(path.join(OUTDIR, 'preroll.json'), JSON.stringify({ preroll }));

  // wait until the narration finishes (poll currentTime)
  const deadline = Date.now() + 155000;
  let last = 0, stalls = 0;
  while (Date.now() < deadline) {
    const t = await page.evaluate(() => document.querySelector('#vo').currentTime);
    if (t >= END) { console.log('reached end at', t.toFixed(2)); break; }
    if (Math.abs(t - last) < 0.05) { stalls++; if (stalls > 20) { console.log('stalled at', t.toFixed(2)); break; } }
    else stalls = 0;
    last = t;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(4000);   // tail — hold on the assembled outro past the last word

  const video = page.video();
  await context.close();            // finalizes the webm
  const webm = await video.path();
  await browser.close();
  console.log('WEBM:', webm);
  const dest = path.join(OUTDIR, 'recording.webm');
  fs.copyFileSync(webm, dest);
  console.log('SAVED:', dest, Math.round(fs.statSync(dest).size / 1024), 'KB');
})().catch(e => { console.error(e); process.exit(1); });
