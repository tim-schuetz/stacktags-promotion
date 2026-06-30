// Upload the founder image to HeyGen + grab a voice id (for Avatar IV).
const fs = require('fs');
const path = require('path');
const HG = process.env.HG_KEY;
const IMG = path.resolve(__dirname, '../assets/figures/founder_list_grin_cut.png');

(async () => {
  // 1) upload image asset
  const buf = fs.readFileSync(IMG);
  const up = await fetch('https://upload.heygen.com/v1/asset', {
    method: 'POST',
    headers: { 'X-Api-Key': HG, 'Content-Type': 'image/png' },
    body: buf,
  });
  const uj = await up.json();
  console.log('UPLOAD:', JSON.stringify(uj).slice(0, 400));
  // 2) list voices, pick an English one
  const vr = await fetch('https://api.heygen.com/v2/voices', { headers: { 'X-Api-Key': HG } });
  const vj = await vr.json();
  const voices = (vj.data && vj.data.voices) || [];
  const en = voices.find((v) => (v.language || '').toLowerCase().includes('english')) || voices[0];
  console.log('VOICE:', en ? JSON.stringify({ voice_id: en.voice_id, name: en.name, lang: en.language }) : 'none', '| total', voices.length);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
