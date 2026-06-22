// Bake the default-element SFX (capture/sfx.json) onto the narration so they are
// audible in the final MP4. Web-Audio isn't captured by Playwright, so the sounds
// are overlaid deterministically at their declared cue times.
//
// Everything stays MONO (the narration is mono; a stereo upmix would drop the
// voice ~3 dB). amix normalize=0 keeps the narration at its full level; the SFX
// just add on top, and a transparent limiter catches the rare summed peak.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const SND_DIR = path.resolve(BUILD, '../assets/sound');
const SND = { swoosh: 'swoosh.wav', pop: 'pop.wav', ticking: 'ticking.wav' };
const mp3 = path.resolve(BUILD, '../../script_audio.mp3');
const sfxJson = path.join(BUILD, 'capture', 'sfx.json');
const out = path.join(BUILD, 'capture', 'narration_sfx.m4a');

if (!fs.existsSync(sfxJson)) { console.error('no sfx.json — skipping SFX mix'); process.exit(1); }
const sfx = JSON.parse(fs.readFileSync(sfxJson, 'utf8'))
  .filter(([t, name]) => SND[name] && fs.existsSync(path.join(SND_DIR, SND[name])));

console.log(`mixing ${sfx.length} SFX onto the narration (mono)`);

// inputs: 0 = narration, 1..N = each SFX file
const inputs = ['-i', mp3];
sfx.forEach(([, name]) => { inputs.push('-i', path.join(SND_DIR, SND[name])); });

const AF = 'aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono';
let fc = `[0:a]${AF}[base];`;
const labels = ['[base]'];
sfx.forEach(([t, , vol], i) => {
  const idx = i + 1;
  const delay = Math.max(0, Math.round(t * 1000));
  fc += `[${idx}:a]${AF},adelay=${delay}:all=1,volume=${vol}[s${idx}];`;
  labels.push(`[s${idx}]`);
});
fc += `${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first,`
   +  `alimiter=limit=0.98:level=false[out]`;

const args = ['-y', ...inputs, '-filter_complex', fc, '-map', '[out]',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '1', out];

execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('\nSFX track:', out, Math.round(fs.statSync(out).size / 1024), 'KB');
