// Prepare + normalise the SFX assets to ~-3 dBFS (raw assets are mastered very
// quietly → inaudible under the voice). Creates: swoosh.ogg, pop.wav, ticking.mp3
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SND = path.resolve(__dirname, '../assets/sound');

function maxVol(file) {
  // ffmpeg writes volumedetect to stderr and exits 0 → must read stderr explicitly.
  const r = spawnSync('ffmpeg', ['-i', file, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const out = (r.stderr || '') + (r.stdout || '');
  const m = out.match(/max_volume:\s*(-?\d+(\.\d+)?)\s*dB/);
  return m ? parseFloat(m[1]) : null;
}

function normalizeTo(file, target = -3, codecArgs = []) {
  const mv = maxVol(file);
  if (mv == null) { console.log('  ! could not read level of', path.basename(file)); return; }
  const gain = (target - mv).toFixed(2);
  const tmp = file + '.tmp' + path.extname(file);
  execFileSync('ffmpeg', ['-y', '-i', file, '-af', `volume=${gain}dB`, ...codecArgs, tmp], { stdio: 'ignore' });
  fs.renameSync(tmp, file);
  console.log(`  ✓ ${path.basename(file)}  ${mv}dB → ${target}dB (gain ${gain}dB)`);
}

(function main() {
  // 1) swoosh: normalise the copied raw ogg
  const swooshRaw = path.join(SND, 'swoosh_raw.ogg');
  const swoosh = path.join(SND, 'swoosh.ogg');
  execFileSync('ffmpeg', ['-y', '-i', swooshRaw, '-c:a', 'libvorbis', swoosh], { stdio: 'ignore' });
  normalizeTo(swoosh, -3, ['-c:a', 'libvorbis']);

  // 2) pop: synthesise a short soft blip, then normalise
  const pop = path.join(SND, 'pop.wav');
  execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'sine=frequency=760:duration=0.12',
    '-af', 'afade=t=out:st=0.006:d=0.114:curve=exp', '-ar', '44100', '-ac', '1', pop], { stdio: 'ignore' });
  normalizeTo(pop, -3, ['-ar', '44100', '-ac', '1']);

  // 3) ticking: loop the raw ticking out to ~3.3s, then normalise
  const tickRaw = path.join(SND, 'ticking_raw.mp3');
  const ticking = path.join(SND, 'ticking.mp3');
  execFileSync('ffmpeg', ['-y', '-stream_loop', '6', '-i', tickRaw, '-t', '3.3', '-ar', '44100', '-ac', '1', ticking], { stdio: 'ignore' });
  normalizeTo(ticking, -3, ['-ar', '44100', '-ac', '1']);

  console.log('sounds ready.');
})();
