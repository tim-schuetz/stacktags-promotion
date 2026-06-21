// Mux the recorded webm (video) + original narration (audio) into the final mp4,
// trimming the measured pre-roll so audio t=0 aligns with content t=0.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const webm = path.join(BUILD, 'capture', 'recording.webm');
const mp3  = path.resolve(BUILD, '../../script_audio.mp3');
const sfxMix = path.join(BUILD, 'capture', 'narration_sfx.m4a');
const out  = path.resolve(BUILD, '../mandarin-is-broken.mp4');
const preroll = JSON.parse(fs.readFileSync(path.join(BUILD, 'capture', 'preroll.json'), 'utf8')).preroll;

if (!fs.existsSync(webm)) { console.error('no recording.webm'); process.exit(1); }
console.log('preroll trim =', preroll.toFixed(3), 's');

// Hold the final "Follow" end-card ~1.8s past the last spoken word:
// pad the audio with trailing silence and cap the output length.
const OUT_DUR = 109.0;   // audio ≈ 108.44s + ~0.6s outro hold

// Audio source: the SFX-mixed narration (mix_sfx.js) if present, else the raw mp3.
// All SFX are baked into narration_sfx.m4a, so mux only trims preroll + pads the tail.
const haveMix = fs.existsSync(sfxMix);
const audio = haveMix ? sfxMix : mp3;
console.log('audio:', haveMix ? 'narration_sfx.m4a (SFX baked in)' : 'script_audio.mp3 (raw, no SFX)');

const args = [
  '-y',
  '-ss', String(preroll), '-i', webm,
  '-i', audio,
  '-filter_complex', '[1:a]apad[a]',     // pad with trailing silence; -t caps the length
  '-map', '0:v:0', '-map', '[a]',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-preset', 'medium', '-crf', '20',
  '-r', '30', '-vf', 'fps=30,scale=1080:1920:flags=lanczos',
  '-c:a', 'aac', '-b:a', '192k',
  '-t', String(OUT_DUR),
  '-movflags', '+faststart',
  out,
];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nMP4:', out, Math.round(fs.statSync(out).size / 1024 / 1024 * 10) / 10, 'MB');
