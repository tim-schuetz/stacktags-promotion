// Generate an Avatar IV video of the founder (motion-prompted gesture + grin).
const HG = process.env.HG_KEY;
const IMG_KEY = 'image/ed7eeb739ff945058f63928c8dd18d42/original.png';
const VOICE = 'da65fc02985a42d8beaec80fc6e01f3d';

const body = {
  image_key: IMG_KEY,
  video_title: 'tether-founder-av4',
  voice_id: VOICE,
  script: 'Attestations, not full audits. Trust me — every token is backed. Just trust me.',
  dimension: { width: 720, height: 1280 },
  custom_motion_prompt: 'A smug businessman in a dark suit proudly holds up and presents his clipboard checklist, gesturing toward it with his other hand, then breaks into a wide satisfied grin.',
};

(async () => {
  const r = await fetch('https://api.heygen.com/v2/video/av4/generate', {
    method: 'POST',
    headers: { 'X-Api-Key': HG, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  console.log('STATUS', r.status);
  console.log(JSON.stringify(j).slice(0, 600));
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
