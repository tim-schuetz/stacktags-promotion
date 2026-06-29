// Generate HeyGen Avatar IV talking-head clips (szuchak_middle) lip-synced to the
// existing ElevenLabs narration slices, then they get spliced over the base mp4.
// KEY is passed via env HEYGEN_KEY (a secret — never stored in a file).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const KEY = process.env.HEYGEN_KEY;
if (!KEY) throw new Error('HEYGEN_KEY env missing');
const GROUP = 'f7fa25f77abf419aa7cbde8931620677'; // szuchak_middle photo-avatar group
const BUILD = __dirname;
const MP3 = path.resolve(BUILD, '../../script_voice.mp3');
const OUT = path.join(BUILD, 'heygen');
fs.mkdirSync(OUT, { recursive: true });
const H = { 'X-Api-Key': KEY };
const WINDOWS = [{ name: 'w1', t0: 4.0, t1: 19.0 }, { name: 'w2', t0: 79.0, t1: 94.6 }];

async function jget(url) { const r = await fetch(url, { headers: H }); const t = await r.text(); if (!r.ok) throw new Error(`GET ${url} ${r.status} ${t.slice(0,200)}`); return JSON.parse(t); }
async function uploadAsset(buf, ct) { const r = await fetch('https://upload.heygen.com/v1/asset', { method: 'POST', headers: { ...H, 'Content-Type': ct }, body: buf }); const t = await r.text(); if (!r.ok) throw new Error(`upload ${r.status} ${t.slice(0,200)}`); return JSON.parse(t).data.id; }

async function getAvatarJpg() {
  const grp = await jget(`https://api.heygen.com/v2/avatar_group/${GROUP}/avatars`);
  const list = grp.data.avatar_list || grp.data.avatars || [];
  const look = list.find((a) => a.id === GROUP) || list.find((a) => (a.avatar_name || a.name || '').toLowerCase() === 'szuchak_middle') || list[0];
  console.log('look:', look.id, look.avatar_name || look.name);
  const src = path.join(OUT, 'avatar_src');
  fs.writeFileSync(src, Buffer.from(await (await fetch(look.image_url)).arrayBuffer()));
  execFileSync('ffmpeg', ['-y', '-i', src, path.join(OUT, 'avatar.jpg')], { stdio: 'ignore' });
  console.log('saved avatar.jpg');
}

(async () => {
  const mode = process.argv[2] || 'all';
  await getAvatarJpg();
  if (mode === 'image') { console.log('IMAGE-ONLY done'); return; }
  const imgId = await uploadAsset(fs.readFileSync(path.join(OUT, 'avatar.jpg')), 'image/jpeg');
  console.log('image asset:', imgId);
  for (const w of WINDOWS) {
    const wav = path.join(OUT, w.name + '.mp3');
    execFileSync('ffmpeg', ['-y', '-i', MP3, '-ss', String(w.t0), '-to', String(w.t1), '-c:a', 'libmp3lame', '-q:a', '2', wav], { stdio: 'ignore' });
    const aId = await uploadAsset(fs.readFileSync(wav), 'audio/mpeg');
    console.log(w.name, 'audio asset:', aId);
    const gen = await fetch('https://api.heygen.com/v3/videos', { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'image', image: { type: 'asset_id', asset_id: imgId }, audio_asset_id: aId, resolution: '1080p', aspect_ratio: '9:16' }) });
    const gt = await gen.text(); if (!gen.ok) throw new Error(`gen ${gen.status} ${gt.slice(0,300)}`);
    const vid = JSON.parse(gt).data.video_id;
    console.log(w.name, 'video_id:', vid);
    let url = null;
    for (let i = 0; i < 90; i++) {
      await new Promise((s) => setTimeout(s, 5000));
      const st = await jget(`https://api.heygen.com/v1/video_status.get?video_id=${vid}`);
      const status = st.data.status;
      if (i % 3 === 0) console.log('  ', w.name, status);
      if (status === 'completed') { url = st.data.video_url; break; }
      if (status === 'failed') throw new Error(`${w.name} failed: ${JSON.stringify(st.data.error || st.data).slice(0,200)}`);
    }
    if (!url) throw new Error(w.name + ' timed out');
    fs.writeFileSync(path.join(OUT, 'avatar_' + w.name + '.mp4'), Buffer.from(await (await fetch(url)).arrayBuffer()));
    console.log(w.name, 'SAVED avatar_' + w.name + '.mp4');
  }
  console.log('DONE');
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
