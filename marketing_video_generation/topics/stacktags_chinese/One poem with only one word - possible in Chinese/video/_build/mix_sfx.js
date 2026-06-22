// Overlay the element SFX onto the narration at the real cue times → narration_sfx.m4a.
// Web-Audio can't be captured headless, so we rebuild the sound deterministically from
// capture/sfx.json (written by capture.js from window.SFX). The WHOLE graph stays MONO
// (the narration is mono — a stereo upmix would drop the voice ~3 dB). normalize=0 keeps
// the voice at its full level; a transparent limiter guards against clipping.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const mp3 = path.resolve(BUILD, '../../script_audio_combined.mp3');
const sfxPath = path.join(BUILD, 'capture', 'sfx.json');
const out = path.join(BUILD, 'capture', 'narration_sfx.m4a');
const SND = {
  swoosh: path.resolve(BUILD, '../assets/sound/swoosh.wav'),
  pop:    path.resolve(BUILD, '../assets/sound/pop.wav'),
};

if (!fs.existsSync(sfxPath)) { console.error('no capture/sfx.json — run capture.js first'); process.exit(1); }
const sfx = JSON.parse(fs.readFileSync(sfxPath, 'utf8'));
console.log(`mixing ${sfx.length} SFX hits into the narration (mono)…`);

const args = ['-y', '-i', mp3];
sfx.forEach(([t, name]) => { args.push('-i', SND[name]); });

let fc = '[0:a]aformat=sample_rates=44100:channel_layouts=mono[base];';
const labels = ['[base]'];
sfx.forEach(([t, name, vol], i) => {
  const inp = i + 1;
  const ms = Math.round(t * 1000);
  fc += `[${inp}:a]aformat=sample_rates=44100:channel_layouts=mono,adelay=${ms}:all=1,volume=${vol}[s${i}];`;
  labels.push(`[s${i}]`);
});
fc += `${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first[mx];` +
      `[mx]alimiter=limit=0.98:level=false[out]`;

args.push('-filter_complex', fc, '-map', '[out]', '-ac', '1', '-ar', '44100', '-c:a', 'aac', '-b:a', '192k', out);
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nwrote', out);
