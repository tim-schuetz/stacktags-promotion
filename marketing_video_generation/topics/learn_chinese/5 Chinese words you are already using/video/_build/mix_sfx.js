// Overlay the default-element SFX (capture/sfx.json) onto the mono narration at
// their real CUE times -> capture/narration_sfx.m4a. Web-Audio can't be captured
// headless, so the sounds are mixed in deterministically here.
// Whole graph is MONO and amix normalize=0, so the voice keeps its full level.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const mp3 = path.resolve(BUILD, '../../script_audio.mp3');
const sfxPath = path.join(BUILD, 'capture', 'sfx.json');
const out = path.join(BUILD, 'capture', 'narration_sfx.m4a');

const SND = {
  swoosh: path.resolve(BUILD, '../assets/sound/swoosh.ogg'),
  pop:    path.resolve(BUILD, '../assets/sound/pop.wav'),
};

if (!fs.existsSync(sfxPath)) { console.error('no capture/sfx.json — run capture.js or dump_sfx.js first'); process.exit(1); }
const sfx = JSON.parse(fs.readFileSync(sfxPath, 'utf8'));
console.log('mixing', sfx.length, 'SFX onto the narration');

// one -i per SFX entry (so the same file can be placed at many times)
const inputs = ['-i', mp3];
const parts = ['[0:a]aformat=sample_rates=44100:channel_layouts=mono[base]'];
const labels = ['[base]'];
sfx.forEach((e, i) => {
  const [t, name, vol] = e;
  const file = SND[name];
  if (!file) { console.warn('  unknown sound, skipping:', name); return; }
  inputs.push('-i', file);
  const delayMs = Math.round(t * 1000);
  parts.push(`[${i + 1}:a]aformat=sample_rates=44100:channel_layouts=mono,adelay=${delayMs}:all=1,volume=${vol}[s${i}]`);
  labels.push(`[s${i}]`);
});

const n = labels.length;   // base + all sfx
const graph = parts.join(';') + ';' + labels.join('') +
  `amix=inputs=${n}:normalize=0:duration=first[mix];[mix]alimiter=limit=0.98:level=false[out]`;

const args = ['-y', ...inputs, '-filter_complex', graph, '-map', '[out]',
  '-ac', '1', '-c:a', 'aac', '-b:a', '192k', out];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nwrote', out, Math.round(fs.statSync(out).size / 1024), 'KB');
