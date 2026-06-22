// Mux the recorded webm (video) + narration+SFX (audio) into the final mp4,
// trimming the measured pre-roll so audio t=0 aligns with content t=0.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const webm = path.join(BUILD, 'capture', 'recording.webm');
const mp3  = path.resolve(BUILD, '../../script_voice.mp3');
const sfxAudio = path.join(BUILD, 'capture', 'narration_sfx.m4a');
const audioIn = fs.existsSync(sfxAudio) ? sfxAudio : mp3;
const out  = path.resolve(BUILD, '../how-to-launder-1.5b-crypto.mp4');
const preroll = JSON.parse(fs.readFileSync(path.join(BUILD, 'capture', 'preroll.json'), 'utf8')).preroll;
console.log('audio source =', path.basename(audioIn));

if (!fs.existsSync(webm)) { console.error('no recording.webm'); process.exit(1); }
console.log('preroll trim =', preroll.toFixed(3), 's');

// Hold the final "Follow" end-card ~1.7s past the last spoken word.
const OUT_DUR = 86.4;   // audio ≈ 84.71s + ~1.7s outro hold
const args = [
  '-y',
  '-ss', String(preroll), '-i', webm,
  '-i', audioIn,
  '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-preset', 'medium', '-crf', '20',
  '-r', '30', '-vf', 'fps=30,scale=1080:1920:flags=lanczos',
  '-af', 'apad',
  '-c:a', 'aac', '-b:a', '192k',
  '-t', String(OUT_DUR),
  '-movflags', '+faststart',
  out,
];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nMP4:', out, Math.round(fs.statSync(out).size / 1024 / 1024 * 10) / 10, 'MB');
