// Build the SFX track from capture/sfx.json and lay it OVER the narration,
// producing capture/narration_sfx.m4a. The WHOLE graph stays MONO so the (mono)
// narration keeps its full level — a stereo upmix runs the voice through the
// pan-law and drops it ~3 dB. amix normalize=0 ⇒ the voice keeps full gain;
// a transparent alimiter only catches the rare SFX-on-loud-word overlap.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const mp3 = path.resolve(BUILD, '../../script_audio.mp3');
const sfxJson = path.join(BUILD, 'capture', 'sfx.json');
const out = path.join(BUILD, 'capture', 'narration_sfx.m4a');

const SND = {
  swoosh:  path.resolve(BUILD, '../assets/sound/swoosh.wav'),
  pop:     path.resolve(BUILD, '../assets/sound/pop.wav'),
  ticking: path.resolve(BUILD, '../assets/sound/ticking.wav'),
};

if (!fs.existsSync(mp3)) { console.error('no narration mp3 at', mp3); process.exit(1); }
let sfx = [];
try { sfx = JSON.parse(fs.readFileSync(sfxJson, 'utf8')); }
catch { console.error('no capture/sfx.json — run capture.js first'); process.exit(1); }
sfx = sfx.filter(e => SND[e[1]] && fs.existsSync(SND[e[1]]));
if (!sfx.length) { console.error('no usable SFX entries'); process.exit(1); }
console.log('mixing', sfx.length, 'SFX over the narration (mono)…');

// inputs: [0] = narration, then one input per SFX hit
const inputs = ['-i', mp3];
const parts = ['[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono[base]'];
const mixLabels = ['[base]'];
sfx.forEach((e, k) => {
  const [t, name, vol] = e;
  const ms = Math.round(t * 1000);
  inputs.push('-i', SND[name]);
  const lbl = `s${k}`;
  // mono → delay to the cue time → set per-hit volume
  parts.push(`[${k + 1}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,adelay=${ms}:all=1,volume=${vol}[${lbl}]`);
  mixLabels.push(`[${lbl}]`);
});
// duration=first ⇒ output length = narration; normalize=0 ⇒ voice keeps full level
const filter = parts.join(';') +
  `;${mixLabels.join('')}amix=inputs=${mixLabels.length}:normalize=0:duration=first[mx];` +
  `[mx]alimiter=limit=0.98:level=false[a]`;

const args = [
  '-y',
  ...inputs,
  '-filter_complex', filter,
  '-map', '[a]',
  '-c:a', 'aac', '-b:a', '256k', '-ac', '1',
  out,
];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
const counts = sfx.reduce((m, e) => (m[e[1]] = (m[e[1]] || 0) + 1, m), {});
console.log('\nSFX-mixed narration:', out, Math.round(fs.statSync(out).size / 1024), 'KB',
  '—', Object.entries(counts).map(([k, v]) => `${k}×${v}`).join(', '));
