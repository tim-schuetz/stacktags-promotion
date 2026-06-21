// Mux the recorded webm (video) + original narration (audio) into video.mp4,
// trimming the measured pre-roll so audio t=0 aligns with content t=0.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const webm = path.join(BUILD, 'capture', 'recording.webm');
const mp3  = path.resolve(BUILD, '../../script_audio.mp3');
const out  = path.resolve(BUILD, '../learn-10-chinese-words-100s.mp4');
const preroll = JSON.parse(fs.readFileSync(path.join(BUILD, 'capture', 'preroll.json'), 'utf8')).preroll;

if (!fs.existsSync(webm)) { console.error('no recording.webm'); process.exit(1); }
console.log('preroll trim =', preroll.toFixed(3), 's');

const args = [
  '-y',
  '-ss', String(preroll), '-i', webm,
  '-i', mp3,
  '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-preset', 'medium', '-crf', '20',
  '-r', '30', '-vf', 'fps=30,scale=1080:1920:flags=lanczos',
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart', '-shortest',
  out,
];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nMP4:', out, Math.round(fs.statSync(out).size / 1024 / 1024 * 10) / 10, 'MB');
