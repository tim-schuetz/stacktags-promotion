// Rebuild the SFX track deterministically and mix it onto the narration.
// Reads capture/sfx.json (dumped from window.SFX) and overlays each cue onto
// script_voice.mp3 with ffmpeg (delay to t, scale to vol, sum, soft-limit).
// Output → capture/narration_sfx.m4a, which mux.js muxes onto the video.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const mp3 = path.resolve(BUILD, '../../script_voice.mp3');
const out = path.join(BUILD, 'capture', 'narration_sfx.m4a');
const sfxPath = path.join(BUILD, 'capture', 'sfx.json');

const SND = {
  swoosh: path.resolve(BUILD, '../assets/sound/swoosh.ogg'),
  pop: path.resolve(BUILD, '../assets/sound/pop.wav'),
  ticking: path.resolve(BUILD, '../assets/sound/ticking.mp3'),
};

if (!fs.existsSync(sfxPath)) { console.error('no sfx.json — run capture.js first'); process.exit(1); }
const sfx = JSON.parse(fs.readFileSync(sfxPath, 'utf8'))
  .filter((s) => SND[s[1]] && fs.existsSync(SND[s[1]]));
console.log('mixing', sfx.length, 'SFX cues onto narration');

const inputs = ['-i', mp3];
sfx.forEach((s) => { inputs.push('-i', SND[s[1]]); });

// keep everything mono (so the mono narration keeps its full level)
const parts = ['[0:a]aformat=sample_rates=44100:channel_layouts=mono[base]'];
const labels = ['[base]'];
sfx.forEach((s, j) => {
  const ms = Math.round(s[0] * 1000);
  const vol = s[2] != null ? s[2] : 0.6;
  parts.push(`[${j + 1}:a]aformat=sample_rates=44100:channel_layouts=mono,adelay=${ms}:all=1,volume=${vol}[s${j}]`);
  labels.push(`[s${j}]`);
});
parts.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first,alimiter=limit=0.98:attack=2:release=15:level=false[mix]`);
const filter = parts.join(';');

const args = [
  '-y', ...inputs,
  '-filter_complex', filter,
  '-map', '[mix]',
  '-ac', '1', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
  out,
];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nMIXED:', out, Math.round(fs.statSync(out).size / 1024), 'KB');
