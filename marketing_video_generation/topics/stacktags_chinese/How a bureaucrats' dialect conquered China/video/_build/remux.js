// Precise A/V remux. The headless capture can render slower than real time and
// NON-uniformly (a heavy scene lags more than a light one), so a single PTS
// rescale (mux.js) cannot keep every beat on its spoken word. capture.js logged
// the webm-wallclock -> audio-currentTime mapping; here we turn each recorded
// frame's input timestamp T into the audio time it was showing (fwd(T)), so the
// video is re-timed onto the real narration clock. Then fps=30 makes it CFR and
// we mux the original mp3.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const webm = path.join(BUILD, 'capture', 'recording.webm');
const mp3  = path.resolve(BUILD, '../../script_audio.mp3');
const out  = path.resolve(BUILD, '../how-mandarin-conquered-china.mp4');
const timing = JSON.parse(fs.readFileSync(path.join(BUILD, 'capture', 'timing.json'), 'utf8'));
const preroll = timing.preroll;

if (!fs.existsSync(webm)) { console.error('no recording.webm'); process.exit(1); }

const probe = (file) => parseFloat(execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file],
  { encoding: 'utf8' }).trim());
const audioDur = probe(mp3);

// --- build a clean, monotonic (wRel -> ct) mapping from the samples ---------
// wRel = webm time since play start (= sample webm time - preroll), matching the
// input timestamp T after `-ss preroll`.
let pts = timing.samples
  .map(([w, ct]) => [+(w - preroll), ct])
  .filter(([w, ct]) => w >= -0.05 && ct >= 0);
pts.sort((a, b) => a[0] - b[0]);
// enforce strictly increasing in BOTH axes
const mono = [];
let lw = -1, lc = -1;
for (const [w, ct] of pts) {
  if (w > lw + 1e-3 && ct > lc + 1e-4) { mono.push([w, ct]); lw = w; lc = ct; }
}
if (mono.length < 2) { console.error('not enough timing samples'); process.exit(1); }
if (mono[0][0] > 0) mono.unshift([0, Math.max(0, mono[0][1] - mono[0][0])]);

// downsample to a small set of breakpoints (the mapping is smooth) — a compact
// setpts expression keeps ffmpeg's expr evaluator cheap. ~24 piecewise-linear
// segments capture even a non-uniform drift curve to well under a frame.
const MAXBP = 24;
let bp = mono;
if (mono.length > MAXBP) {
  bp = [];
  for (let i = 0; i < MAXBP; i++) bp.push(mono[Math.round(i * (mono.length - 1) / (MAXBP - 1))]);
}
// dedupe after rounding
const seen = new Set(); const B = [];
for (const [w, ct] of bp) { const k = w.toFixed(3); if (!seen.has(k)) { seen.add(k); B.push([+w.toFixed(3), +ct.toFixed(3)]); } }

// --- piecewise-linear fwd(T) as an ffmpeg setpts expression -----------------
// fwd(T) returns the audio time (sec) that input-time T was displaying.
const parts = [];
parts.push(`lt(T\\,${B[0][0]})*${B[0][1]}`);                       // before first bp: clamp
for (let i = 0; i < B.length - 1; i++) {
  const [w0, c0] = B[i], [w1, c1] = B[i + 1];
  const s = ((c1 - c0) / (w1 - w0)).toFixed(6);
  parts.push(`(gte(T\\,${w0})*lt(T\\,${w1}))*(${c0}+${s}*(T-${w0}))`);
}
const [wl, cl] = B[B.length - 1];
parts.push(`gte(T\\,${wl})*(${cl}+(T-${wl}))`);                    // after last bp: slope 1
const fwd = parts.join('+');

console.log(`audio=${audioDur.toFixed(2)}s  samples=${timing.samples.length}  breakpoints=${B.length}`);
console.log(`map span: wRel[0..${wl.toFixed(2)}] -> ct[..${cl.toFixed(2)}]  (capture ran ${(wl / cl).toFixed(3)}x wall/audio)`);

const vf = `setpts=(${fwd})/TB,fps=30,scale=1080:1920:flags=lanczos`;
const args = [
  '-y',
  '-ss', String(preroll), '-i', webm,
  '-i', mp3,
  '-filter_complex', `[0:v]${vf}[v]`,
  '-map', '[v]', '-map', '1:a:0',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-preset', 'medium', '-crf', '20',
  '-r', '30', '-vsync', 'cfr',
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart', '-shortest',
  out,
];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nMP4:', out, Math.round(fs.statSync(out).size / 1024 / 1024 * 10) / 10, 'MB');
