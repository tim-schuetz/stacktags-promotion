// Mux the recorded webm (video) + original narration (audio) into the final mp4.
//
// The trim point is found from a black SYNC FLASH the page burns in at audio t=0
// (see app.js / #syncflash). This is robust to how long the headless page took to
// start — wall-clock preroll is unreliable because playwright's recording does not
// begin at the same instant our timer starts. The flash gives the exact webm time
// where audio t=0 is, so we -ss to just after it and mux the original mp3.
// The narration is padded ~2s so the Follow end-card holds past the last word.
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const webm = path.join(BUILD, 'capture', 'recording.webm');
const mp3  = path.resolve(BUILD, '../../script_audio_combined.mp3');
// prefer the narration+SFX mix (mix_sfx.js) if it exists; else the bare narration
const sfxAudio = path.join(BUILD, 'capture', 'narration_sfx.m4a');
const audioSrc = fs.existsSync(sfxAudio) ? sfxAudio : mp3;
const out  = path.resolve(BUILD, '../one-poem-one-word.mp4');

if (!fs.existsSync(webm)) { console.error('no recording.webm'); process.exit(1); }
console.log('audio source:', path.basename(audioSrc));

const probe = (file) => parseFloat(execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file],
  { encoding: 'utf8' }).trim());
const webmDur = probe(webm);
const audioDur = probe(mp3);

// --- find the sync hold with blackdetect ------------------------------------
const bd = spawnSync('ffmpeg', ['-hide_banner', '-i', webm, '-vf', 'blackdetect=d=0.05:pix_th=0.10', '-an', '-f', 'null', '-'],
  { encoding: 'utf8' });
const detect = (bd.stderr || '') + (bd.stdout || '');

const intervals = [];
const re = /black_start:([\d.]+)\s+black_end:([\d.]+)/g;
let m;
while ((m = re.exec(detect)) !== null) intervals.push({ s: parseFloat(m[1]), e: parseFloat(m[2]) });

// The content (white grid throughout) is never black, so the sync hold is the
// LAST black interval in the recording. Its end == audio t=0.
let flash = intervals.length ? intervals[intervals.length - 1] : null;
let preroll;
if (flash) {
  preroll = flash.e + 0.02;     // start just after the black clears
  console.log(`sync hold ${flash.s.toFixed(3)}–${flash.e.toFixed(3)}s (of ${intervals.length} black intervals) -> preroll ${preroll.toFixed(3)}s`);
} else {
  preroll = Math.max(0, webmDur - audioDur);   // fallback
  console.log(`no flash found (intervals=${intervals.length}); fallback preroll ${preroll.toFixed(3)}s`);
}
console.log(`webm=${webmDur.toFixed(2)}s  audio=${audioDur.toFixed(2)}s  content after trim=${(webmDur - preroll).toFixed(2)}s`);

const OUT_DUR = (audioDur + 1.9).toFixed(2);   // hold the end-card ~1.9s past the last word
const vf = `fps=30,scale=1080:1920:flags=lanczos`;
const args = [
  '-y',
  '-ss', preroll.toFixed(3), '-i', webm,
  '-i', audioSrc,
  '-filter_complex', `[0:v]${vf}[v]`,
  '-map', '[v]', '-map', '1:a:0',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-preset', 'medium', '-crf', '20',
  '-r', '30', '-vsync', 'cfr',
  '-af', 'apad',   // pad trailing silence so the end-card holds past the last word
  '-c:a', 'aac', '-b:a', '192k',
  '-t', String(OUT_DUR),
  '-movflags', '+faststart',
  out,
];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nMP4:', out, Math.round(fs.statSync(out).size / 1024 / 1024 * 10) / 10, 'MB');
