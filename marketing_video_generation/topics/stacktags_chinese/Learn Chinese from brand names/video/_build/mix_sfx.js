// Bake the SFX (capture/sfx.json) into the narration → capture/narration_sfx.m4a.
// Everything stays MONO (the narration is mono; a stereo upmix would drop the
// voice ~3 dB). amix normalize=0 keeps the voice at full level; a transparent
// alimiter guards against clipping. See specific_tools_instructions/add_sound_effects.md.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const mp3 = path.resolve(BUILD, '../../script_audio.mp3');
const out = path.join(BUILD, 'capture', 'narration_sfx.m4a');
const sfxPath = path.join(BUILD, 'capture', 'sfx.json');

const SND = {
  swoosh: path.resolve(BUILD, '../assets/sound/swoosh.ogg'),
  pop:    path.resolve(BUILD, '../assets/sound/pop.wav'),
};

if (!fs.existsSync(sfxPath)) { console.error('no sfx.json — run capture first'); process.exit(1); }
const sfx = JSON.parse(fs.readFileSync(sfxPath, 'utf8'))
  .filter(e => SND[e.sound])
  .sort((a, b) => a.t - b.t);
console.log('mixing', sfx.length, 'SFX over the narration (mono)…');

const MONO = 'aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono';
const args = ['-y', '-i', mp3];
sfx.forEach(e => args.push('-i', SND[e.sound]));

const parts = [`[0:a]${MONO}[base]`];
const labels = ['[base]'];
sfx.forEach((e, i) => {
  const inp = i + 1;
  const delay = Math.max(0, Math.round(e.t * 1000));
  const vol = (e.vol != null ? e.vol : 0.5).toFixed(3);
  parts.push(`[${inp}:a]${MONO},adelay=${delay}:all=1,volume=${vol}[s${i}]`);
  labels.push(`[s${i}]`);
});
parts.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first[mix]`);
parts.push(`[mix]alimiter=limit=0.98:level=false[out]`);

args.push('-filter_complex', parts.join(';'),
  '-map', '[out]', '-ac', '1', '-c:a', 'aac', '-b:a', '192k', out);

execFileSync('ffmpeg', args, { stdio: ['ignore', 'inherit', 'inherit'] });
console.log('\n✓', out, Math.round(fs.statSync(out).size / 1024), 'KB');
