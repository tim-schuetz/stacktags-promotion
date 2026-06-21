/* ============================================================
   Stacktags — "Mandarin is broken — and you hear it in every pop song"
   Audio-synced cue engine. Every element lands on the timestamp where
   its line is spoken (timestamps force-aligned via OpenAI Whisper —
   see _build/whisper.json). White + turquoise. 9:16, 1080×1920.
   ============================================================ */
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let enumEl = null, outroEl = null;
let hookWave = null, popWave = null, globeMounted = false;
let timers = [];
let INSTANT = false;
const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

/* ============================================================
   SCENES
   ============================================================ */
const SCENES = ['scene-hook','scene-tang','scene-moon','scene-collapse','scene-pop','scene-south','scene-outro'];
const WM_SCENES = { 'scene-tang':1, 'scene-moon':1, 'scene-collapse':1, 'scene-pop':1 };
function setScene(id) {
  SCENES.forEach(s => $('#' + s).classList.toggle('active', s === id));
  $('#stage').classList.toggle('show-wm', !!WM_SCENES[id]);
}

/* ============================================================
   PERSISTENT SYLLABLE COUNTER
   ============================================================ */
let sylShown = 1200, sylTween = 0;
function setSyl(v, dur) {
  const valEl = $('#syl-val');
  if (sylTween) { cancelAnimationFrame(sylTween); sylTween = 0; }
  if (INSTANT || !dur) { sylShown = v; valEl.textContent = Math.round(v); return; }
  const from = sylShown, to = v, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    sylShown = from + (to - from) * e;
    valEl.textContent = Math.round(sylShown);
    if (p < 1) sylTween = requestAnimationFrame(step); else { sylTween = 0; sylShown = to; }
  })(performance.now());
}
function sylSub(t) { $('#syl-sub').textContent = t; }
const sylCls = (c, on = true) => $('#syl-counter').classList.toggle(c, on);

/* ============================================================
   LAZY MOUNTS
   ============================================================ */
function ensureHookWave() {
  if (hookWave) return;
  try { hookWave = mountWaveform($('#hook-wave')); hookWave.setMode('pop'); } catch (e) { console.error('hookWave', e); }
}
function ensurePopWave() {
  if (popWave) return;
  try { popWave = mountWaveform($('#pop-wave')); popWave.setMode('open'); } catch (e) { console.error('popWave', e); }
}
function ensureGlobe() {
  if (globeMounted) return;
  try {
    window.mountStacktagsGlobe($('#globe-host'), {
      focus: { lat: 23.5, lon: 112.5, cam: 1.9 },
      startCam: 3.9,
      highlight: 'China',
      marker: { lat: 22.3, lon: 114.17 },   // Hong Kong
    });
    globeMounted = true;
  } catch (e) { console.error('globe', e); }
}

function mountElements() {
  enumEl = new StacktagsEnumeration($('#tang-enum'), {
    items: [
      { n: 1, glyph: 'p', label: 'final ‑p', sub: 'lips snap shut' },
      { n: 2, glyph: 't', label: 'final ‑t', sub: 'tongue stops it' },
      { n: 3, glyph: 'k', label: 'final ‑k', sub: 'back of the throat' },
      { n: 4, glyph: 'm', label: 'final ‑m', sub: 'hum to a close' },
    ],
  });
  outroEl = new StacktagsOutro($('#outro-host'), {
    cta: 'Follow',
    tagline: 'Languages hiding in plain sight.',
    folderName: 'Why Mandarin lost its sounds →',
    folderUrl: 'stacktags.com/f/mandarin-lost-sounds',
  });
}

/* helpers */
const sc = (id, c, on = true) => $('#' + id).classList.toggle(c, on);
const trioRow = k => $(`.trio-row[data-k="${k}"]`);
function revealLetters(sel, n, stagger) {
  const els = $$(sel);
  for (let i = 0; i < n && i < els.length; i++) {
    if (INSTANT) els[i].classList.add('in');
    else later(() => els[i].classList.add('in'), i * stagger);
  }
}

/* ============================================================
   CUES — fired off audio.currentTime (seconds)
   ============================================================ */
const CUES = [
  // ---------- HOOK (0–6) ----------
  { t: 0.00, fn: () => { setScene('scene-hook'); ensureHookWave(); sc('scene-hook','t1-in'); } },
  { t: 1.54, fn: () => { sc('scene-hook','t2-in'); } },
  { t: 2.40, fn: () => { sc('scene-hook','wave-in'); if (hookWave) hookWave.setActive(true); } },
  { t: 4.04, fn: () => { sc('scene-hook','foot-in'); } },

  // ---------- TANG GOLDEN AGE (6–19.7) ----------
  { t: 6.08, fn: () => {
      if (hookWave) hookWave.setActive(false);
      setScene('scene-tang'); sc('scene-tang','poembg-in'); sc('scene-tang','head-in');
  }},
  { t: 9.72, fn: () => { // counter glows in at ~1200
      setSyl(1200, 0); sylSub('Tang-era Chinese'); sylCls('ghost-on', false);
      sylCls('hero', false); sylCls('big', false); sylCls('in', true);
  }},
  { t: 16.06, fn: () => { // "hard consonants" — endings line up
      sc('scene-tang','endhead-in');
      if (INSTANT) enumEl.revealUpTo(3);
  }},
  { t: 17.06, fn: () => enumEl.revealRow(0) },  // P
  { t: 17.58, fn: () => enumEl.revealRow(1) },  // T
  { t: 18.22, fn: () => enumEl.revealRow(2) },  // K
  { t: 18.94, fn: () => enumEl.revealRow(3) },  // M

  // ---------- MOON WORD 月 (19.7–32) ----------
  { t: 19.70, fn: () => { // "take the word for moon" — zoom into the -t row, hand off
      if (INSTANT) { setScene('scene-moon'); sc('scene-moon','glyph-in'); return; }
      enumEl.zoomTo(1, { scale: 2.7, duration: 850 });
      later(() => enumEl.handoff(), 260);
      later(() => { setScene('scene-moon'); sc('scene-moon','glyph-in'); }, 620);
  }},
  { t: 22.04, fn: () => { sc('scene-moon','glyph-in'); sc('scene-moon','old-in'); } }, // NGWAT
  { t: 24.52, fn: () => { sc('scene-moon','stop-in'); } },                              // highlight -T + tag
  { t: 30.02, fn: () => { sc('scene-moon','morph'); } },                               // NGWAT -> YUÈ
  { t: 30.66, fn: () => { sc('scene-moon','now-in'); } },                              // "hard ending gone"

  // ---------- THE COLLAPSE (32–52) ----------
  { t: 32.16, fn: () => { setScene('scene-collapse'); sc('scene-collapse','head-in'); } },
  { t: 34.14, fn: () => trioRow('ten').classList.add('show') },
  { t: 35.40, fn: () => trioRow('ten').classList.add('morph') },   // SAP -> SHÍ
  { t: 36.14, fn: () => trioRow('six').classList.add('show') },
  { t: 37.78, fn: () => trioRow('six').classList.add('morph') },   // LUK -> LIÙ
  { t: 38.72, fn: () => trioRow('heart').classList.add('show') },
  { t: 40.18, fn: () => trioRow('heart').classList.add('morph') }, // SAM -> XĪN
  { t: 41.54, fn: () => { sc('scene-collapse','vanish-in'); } },   // p t k m on screen
  { t: 43.42, fn: () => $$('.cv-let')[0].classList.add('struck') },// p
  { t: 43.70, fn: () => $$('.cv-let')[1].classList.add('struck') },// t
  { t: 44.40, fn: () => $$('.cv-let')[2].classList.add('struck') },// k
  { t: 44.80, fn: () => $$('.cv-let')[3].classList.add('struck') },// m
  { t: 45.70, fn: () => { sc('scene-collapse','gone-in'); setSyl(400, 5200); } }, // counter ticks DOWN
  { t: 48.32, fn: () => { sc('scene-collapse','result-in'); sylCls('big', true); } },
  { t: 51.40, fn: () => { setSyl(400, 0); sylSub('modern Mandarin'); } },

  // ---------- WHY YOU HEAR IT IN POP (52–67) ----------
  { t: 52.28, fn: () => {
      setScene('scene-pop'); sylCls('in', false); sylCls('big', false);
      sc('scene-pop','head-in'); sc('scene-pop','pile-in');
  }},
  { t: 55.82, fn: () => { sc('scene-pop','collapse'); } },   // words slide onto one syllable
  { t: 57.32, fn: () => { sc('scene-pop','same-in'); } },
  { t: 59.14, fn: () => { // long open vowels + waveform
      sc('scene-pop','vowels-in'); ensurePopWave(); if (popWave) popWave.setActive(true);
  }},
  { t: 62.80, fn: () => $$('.pv')[0].classList.add('in') },   // ahh
  { t: 63.12, fn: () => $$('.pv')[1].classList.add('in') },   // eyy
  { t: 63.70, fn: () => $$('.pv')[2].classList.add('in') },   // ohh
  { t: 64.38, fn: () => $$('.pv')[3].classList.add('in') },   // wayy

  // ---------- THE SOUTHERN TIME CAPSULE (67–93) ----------
  { t: 67.60, fn: () => {
      if (popWave) popWave.setActive(false);
      setScene('scene-south'); sc('scene-south','head-in'); sc('scene-south','globe-in'); ensureGlobe();
  }},
  { t: 70.74, fn: () => { sc('scene-south','photo-in'); } },     // crossfade to Hong Kong photo
  { t: 72.96, fn: () => { sc('scene-south','keep-in'); } },      // Cantonese kept everything panel
  { t: 76.48, fn: () => { if (INSTANT) $$('.sk-let').forEach(e=>e.classList.add('in')); else revealLetters('.sk-let', 4, 340); } },
  { t: 78.26, fn: () => { if (INSTANT) $$('.snap').forEach(e=>e.classList.add('in')); else revealLetters('.snap', 3, 240); } },
  { t: 80.86, fn: () => { sc('scene-south','poem-in'); } },      // Tang poem 江雪
  { t: 83.32, fn: () => { sc('scene-south','poem-man'); } },     // Mandarin — ✗ rhyme broken
  { t: 85.48, fn: () => { sc('scene-south','poem-can'); } },     // Cantonese — ✓ clicks shut
  { t: 87.54, fn: () => { sc('scene-south','cap-in'); } },       // time capsule caption

  // ---------- PUNCHLINE / OUTRO (91.8–102.6) ----------
  { t: 91.84, fn: () => { setScene('scene-outro'); } },
  { t: 93.38, fn: () => { // Mandarin won — counter rests, hero
      sc('scene-outro','won-in');
      setSyl(400, 0); sylSub('from 1200 distinct sounds');
      sylCls('big', false); sylCls('hero', true); sylCls('ghost-on', false); sylCls('in', true);
  }},
  { t: 94.20, fn: () => { sc('scene-outro','sub-in'); } },
  { t: 95.78, fn: () => { sc('scene-outro','lost-in'); sylCls('ghost-on', true); } }, // ghost 1200 fades behind 400
  { t: 98.90, fn: () => { // brand card assembles
      sylCls('in', false); sylCls('hero', false);
      sc('scene-outro','brand-in'); outroEl.assemble();
      if (INSTANT) outroEl.showAll();
      else { later(() => outroEl.showFolder(), 900); }
  }},
  { t: 101.30, fn: () => { outroEl.showCta(); outroEl.pulseCta(); } },
];
CUES.sort((a, b) => a.t - b.t);
let fired = new Array(CUES.length).fill(false);

/* ============================================================
   ENGINE
   ============================================================ */
const audio = $('#vo');
let raf = 0, lastT = -1;
const DUR = 102.63;

function tick() {
  const t = audio.currentTime;
  if (t < lastT - 0.25) { applyUpTo(t); }
  else {
    for (let i = 0; i < CUES.length; i++) {
      if (!fired[i] && CUES[i].t <= t + 1e-3) { fired[i] = true; CUES[i].fn(); }
    }
  }
  lastT = t;
  $('#vprogress').style.width = (100 * t / (audio.duration || DUR)) + '%';
  $('#info').textContent = t.toFixed(1) + 's';
  raf = requestAnimationFrame(tick);
}

function applyUpTo(t) {
  hardReset();
  INSTANT = true;
  for (let i = 0; i < CUES.length; i++) {
    if (CUES[i].t <= t + 1e-3) { fired[i] = true; CUES[i].fn(); }
  }
  INSTANT = false;
  lastT = t;
}

function clearTimers() { timers.forEach(clearTimeout); timers = []; }

function hardReset() {
  clearTimers();
  fired.fill(false);
  if (sylTween) { cancelAnimationFrame(sylTween); sylTween = 0; }
  SCENES.forEach(s => $('#' + s).classList.remove('active'));
  // wipe per-scene state classes
  $('#scene-hook').className = 'scene scene-hook';
  $('#scene-tang').className = 'scene scene-tang';
  $('#scene-moon').className = 'scene scene-moon';
  $('#scene-collapse').className = 'scene scene-collapse';
  $('#scene-pop').className = 'scene scene-pop';
  $('#scene-south').className = 'scene scene-south';
  $('#scene-outro').className = 'scene scene-outro';
  $('#stage').classList.remove('show-wm');
  // counter
  sylShown = 1200; $('#syl-val').textContent = '1200'; sylSub('Tang-era Chinese');
  $('#syl-counter').className = 'syl-counter';
  // trio / letters / vowels
  $$('.trio-row').forEach(r => r.classList.remove('show', 'morph'));
  $$('.cv-let').forEach(e => e.classList.remove('struck'));
  $$('.pv').forEach(e => e.classList.remove('in'));
  $$('.pw').forEach(e => e.removeAttribute('style'));
  $$('.sk-let').forEach(e => e.classList.remove('in'));
  $$('.snap').forEach(e => e.classList.remove('in'));
  if (hookWave) hookWave.setActive(false);
  if (popWave) popWave.setActive(false);
  if (enumEl) enumEl.reset();
  if (outroEl) outroEl.reset();
}

function play() {
  hardReset();
  lastT = -1;
  audio.currentTime = 0;
  audio.play();
  if (!raf) raf = requestAnimationFrame(tick);
}
function restart() { play(); }

/* ============================================================
   FIT + INIT
   ============================================================ */
function fit() {
  const stage = $('#stage');
  const sx = window.innerWidth / 1080, sy = window.innerHeight / 1920;
  stage.style.transform = `scale(${Math.min(sx, sy)})`;
}
window.addEventListener('resize', fit);

window.addEventListener('DOMContentLoaded', () => {
  mountElements();
  fit();
  setScene('scene-hook');

  $('#play').addEventListener('click', play);
  $('#restart').addEventListener('click', restart);
  $('#cleanbtn').addEventListener('click', () => { document.body.classList.toggle('clean'); fit(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'c' || e.key === 'C') { document.body.classList.toggle('clean'); fit(); }
    if (e.key === ' ') { e.preventDefault(); audio.paused ? play() : audio.pause(); }
  });

  // expose for headless capture / seeking
  window.__seek = (t) => { audio.pause(); audio.currentTime = t; applyUpTo(t); };
  window.__play = play;
  raf = requestAnimationFrame(tick);
});
