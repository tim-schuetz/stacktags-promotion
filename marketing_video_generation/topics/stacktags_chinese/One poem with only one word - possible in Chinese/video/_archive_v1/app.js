/* ============================================================
   Stacktags — "One poem with only one word — possible in Chinese"
   The Lion-Eating Poet in the Stone Den (施氏食獅史) by Yuen Ren Chao.
   Audio-synced cue engine. Every element lands on the timestamp where
   its line is spoken (force-aligned via OpenAI Whisper — _build/whisper.json).
   White + turquoise. 9:16, 1080×1920.
   ============================================================ */
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let enumEl = null, outroEl = null;
let aloudWave = null, flatWave = null, collapseEl = null;
let timers = [];
let INSTANT = false;
const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

/* ---- the poem: every character is read "shi" (tone differs) ---- */
const POEM = [
  ['石','shí'],['室','shì'],['詩','shī'],['士','shì'],['施','shī'],['氏','shì'],
  ['嗜','shì'],['獅','shī'],['誓','shì'],['食','shí'],['十','shí'],['獅','shī'],
  ['施','shī'],['氏','shì'],['時','shí'],['時','shí'],['適','shì'],['市','shì'],
  ['視','shì'],['獅','shī'],['十','shí'],['時','shí'],['適','shì'],['十','shí'],
  ['獅','shī'],['適','shì'],['市','shì'],['是','shì'],['時','shí'],['適','shì'],
  ['施','shī'],['氏','shì'],['適','shì'],['市','shì'],['施','shī'],['氏','shì'],
  ['視','shì'],['是','shì'],['十','shí'],['獅','shī'],['恃','shì'],['矢','shǐ'],
  ['勢','shì'],['使','shǐ'],['是','shì'],['十','shí'],['獅','shī'],['逝','shì'],
  ['世','shì'],['氏','shì'],['拾','shí'],['是','shì'],['十','shí'],['獅','shī'],
  ['屍','shī'],['適','shì'],['石','shí'],['室','shì'],['石','shí'],['室','shì'],
  ['濕','shī'],['氏','shì'],['使','shǐ'],['侍','shì'],['拭','shì'],['石','shí'],
  ['室','shì'],['石','shí'],['室','shì'],['拭','shì'],['施','shī'],['氏','shì'],
  ['始','shǐ'],['試','shì'],['食','shí'],['是','shì'],['十','shí'],['獅','shī'],
  ['食','shí'],['時','shí'],['始','shǐ'],['識','shí'],['是','shì'],['十','shí'],
  ['獅','shī'],['屍','shī'],['實','shí'],['十','shí'],['石','shí'],['獅','shī'],
  ['屍','shī'],['試','shì'],['釋','shì'],['是','shì'],
];

/* ============================================================
   SCENES
   ============================================================ */
const SCENES = ['scene-hook','scene-poem','scene-aloud','scene-paper','scene-why','scene-outro'];
const WM_SCENES = { 'scene-poem':1, 'scene-aloud':1, 'scene-paper':1, 'scene-why':1 };
function setScene(id) {
  SCENES.forEach(s => $('#' + s).classList.toggle('active', s === id));
  $('#stage').classList.toggle('show-wm', !!WM_SCENES[id]);
}
function setToggle(mode) {                 // 'aloud' | 'paper' | 'off'
  const st = $('#stage'), mt = $('#mode-toggle');
  st.classList.toggle('show-toggle', mode === 'aloud' || mode === 'paper');
  mt.classList.toggle('aloud-on', mode === 'aloud');
  mt.classList.toggle('paper-on', mode === 'paper');
}

/* ============================================================
   LAZY MOUNTS
   ============================================================ */
function ensureAloudWave() {
  if (aloudWave) return;
  try { aloudWave = mountWaveform($('#aloud-wave')); aloudWave.setMode('pop'); } catch (e) { console.error('aloudWave', e); }
}
function ensureFlatWave() {
  if (flatWave) return;
  try { flatWave = mountWaveform($('#ps-wave')); flatWave.setMode('flat'); } catch (e) { console.error('flatWave', e); }
}
function ensureCollapse() {
  if (collapseEl) return;
  try { collapseEl = mountSoundCollapse($('#wc-host')); } catch (e) { console.error('collapse', e); }
}

function buildColumn() {
  const track = $('#hc-track');
  track.innerHTML = '';
  const cells = POEM.concat(POEM);   // duplicate for a seamless vertical loop
  cells.forEach(([c, p]) => {
    const cell = document.createElement('div');
    cell.className = 'hc-cell';
    cell.innerHTML = `<div class="hc-char">${c}</div><div class="hc-py">${p}</div>`;
    track.appendChild(cell);
  });
}

function mountElements() {
  buildColumn();
  enumEl = new StacktagsEnumeration($('#poem-tones'), {
    items: [
      { n: 1, glyph: 'shī', label: '1st tone — high & level', sub: '詩 · poem' },
      { n: 2, glyph: 'shí', label: '2nd tone — rising',       sub: '十 · ten'  },
      { n: 3, glyph: 'shǐ', label: '3rd tone — dipping',      sub: '史 · story'},
      { n: 4, glyph: 'shì', label: '4th tone — falling',      sub: '是 · this' },
    ],
  });
  outroEl = new StacktagsOutro($('#outro-host'), {
    cta: 'Follow',
    tagline: 'Languages hiding in plain sight.',
    folderName: 'The Lion-Eating Poet →',
    folderUrl: 'stacktags.com/f/lion-eating-poet',
  });
}

/* helpers */
const sc = (id, c, on = true) => $('#' + id).classList.toggle(c, on);
const beat = i => $(`.story-beat[data-b="${i}"]`);

/* ============================================================
   CUES — fired off audio.currentTime (seconds)
   ============================================================ */
const CUES = [
  // ---------- HOOK (0–10.7) ----------
  { t: 0.00, fn: () => { setScene('scene-hook'); sc('scene-hook','col-in'); sc('scene-hook','t1-in'); } },
  { t: 3.14, fn: () => { sc('scene-hook','t2-in'); } },                         // "And one sound."
  { t: 6.55, fn: () => { sc('scene-hook','shi-in'); } },                        // the "shī" reveal
  { t: 7.55, fn: () => { sc('scene-hook','foot-in'); } },                       // "that works."

  // ---------- THE POEM (10.7–24.7) ----------
  { t: 10.70, fn: () => { setScene('scene-poem'); sc('scene-poem','title-in'); } },   // 施氏食獅史
  { t: 13.32, fn: () => { sc('scene-poem','author-in'); } },                          // Yuen Ren Chao
  { t: 17.88, fn: () => { sc('scene-poem','tones-in'); if (INSTANT) enumEl.revealUpTo(3); } },
  { t: 20.52, fn: () => enumEl.revealRow(0) },   // shī
  { t: 21.16, fn: () => enumEl.revealRow(1) },   // shí
  { t: 21.74, fn: () => enumEl.revealRow(2) },   // shǐ
  { t: 22.52, fn: () => enumEl.revealRow(3) },   // shì
  { t: 23.08, fn: () => { sc('scene-poem','cap-in'); } },                             // "Four flavors…"

  // ---------- READ IT ALOUD (24.7–37.1) ----------
  { t: 24.74, fn: () => { setScene('scene-aloud'); setToggle('aloud'); sc('scene-aloud','head-in'); } },
  { t: 25.90, fn: () => { sc('scene-aloud','wave-in'); ensureAloudWave(); if (aloudWave) aloudWave.setActive(true); } },
  { t: 27.96, fn: () => { sc('scene-aloud','subs-in'); } },                           // "shi shi shi…"
  { t: 30.94, fn: () => { sc('scene-aloud','listener-in'); } },                       // baffled listener
  { t: 32.88, fn: () => { sc('scene-aloud','verdict-in'); } },                        // "Pure nonsense."

  // ---------- NOW READ IT ON PAPER (37.1–58.0) ----------
  { t: 37.10, fn: () => {
      if (aloudWave) aloudWave.setActive(false);
      setScene('scene-paper'); setToggle('paper'); sc('scene-paper','head-in');
  }},
  { t: 41.30, fn: () => beat(0).classList.add('in') },   // a poet named Shī
  { t: 42.76, fn: () => beat(1).classList.add('in') },   // obsessed with lions
  { t: 44.30, fn: () => beat(2).classList.add('in') },   // vows to eat ten
  { t: 46.20, fn: () => beat(3).classList.add('in') },   // goes to the market
  { t: 48.62, fn: () => beat(4).classList.add('in') },   // kills them, hauls home
  { t: 51.00, fn: () => beat(5).classList.add('in') },   // …ten STONE lions (twist)
  { t: 52.68, fn: () => { sc('scene-paper','verdict1-in'); } },                       // every shi = diff char
  { t: 55.84, fn: () => { sc('scene-paper','verdict2-in'); } },                       // zero confusion

  // ---------- WHY IT WORKS (58.0–83.7) ----------
  { t: 58.06, fn: () => { setScene('scene-why'); setToggle('off'); sc('scene-why','a-in'); sc('scene-why','head-in'); } },
  { t: 59.62, fn: () => { sc('scene-why','fan-in'); } },                              // fan out into shapes
  { t: 62.96, fn: () => { sc('scene-why','tones-in'); } },                            // tones help a little
  { t: 66.52, fn: () => { sc('scene-why','lift-in'); } },                             // writing does the lifting
  { t: 68.56, fn: () => { sc('scene-why','b-in'); ensureCollapse(); } },              // older sounds (stage B)
  { t: 70.44, fn: () => { if (collapseEl) collapseEl.collapse(); } },                 // particles converge
  { t: 73.20, fn: () => { sc('scene-why','collapsed'); } },                           // → one "shī"
  { t: 75.78, fn: () => { sc('scene-why','c-in'); sc('scene-why','honest1-in'); } },  // honesty (stage C)
  { t: 78.50, fn: () => { sc('scene-why','honest2-in'); } },                          // classical written Chinese
  { t: 81.72, fn: () => { sc('scene-why','honest3-in'); } },                          // breaking point

  // ---------- PUNCHLINE / OUTRO (83.7–96.36) ----------
  { t: 84.36, fn: () => { setScene('scene-outro'); setToggle('off'); } },
  { t: 85.88, fn: () => { sc('scene-outro','lead-in'); } },                           // writing, not speech
  { t: 86.50, fn: () => { sc('scene-outro','read-in'); } },                           // READ ✓
  { t: 87.94, fn: () => { sc('scene-outro','heard-in'); ensureFlatWave(); if (flatWave) flatWave.setActive(true); } }, // HEARD ✗
  { t: 89.64, fn: () => { sc('scene-outro','tag-in'); } },                            // read perfectly / can't hear
  { t: 92.74, fn: () => {                                                             // brand card assembles
      if (flatWave) flatWave.setActive(false);
      sc('scene-outro','brand-in'); outroEl.assemble();
      if (INSTANT) outroEl.showAll();
      else { later(() => outroEl.showFolder(), 900); }
  }},
  { t: 95.02, fn: () => { outroEl.showCta(); outroEl.pulseCta(); } },                 // Follow
];
CUES.sort((a, b) => a.t - b.t);
let fired = new Array(CUES.length).fill(false);

/* ============================================================
   ENGINE
   ============================================================ */
const audio = $('#vo');
let raf = 0, lastT = -1;
const DUR = 96.36;

function tick() {
  const t = audio.currentTime;
  // When paused (e.g. a headless seek via __seek), the cue state is already
  // applied by applyUpTo — don't let a transient currentTime read re-fire here.
  if (!audio.paused) {
    if (t < lastT - 0.25) { applyUpTo(t); }
    else {
      for (let i = 0; i < CUES.length; i++) {
        if (!fired[i] && CUES[i].t <= t + 1e-3) { fired[i] = true; CUES[i].fn(); }
      }
    }
    lastT = t;
  }
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
  SCENES.forEach(s => $('#' + s).classList.remove('active'));
  // wipe per-scene state classes (keep base class)
  $('#scene-hook').className   = 'scene scene-hook';
  $('#scene-poem').className   = 'scene scene-poem';
  $('#scene-aloud').className  = 'scene scene-aloud';
  $('#scene-paper').className  = 'scene scene-paper';
  $('#scene-why').className    = 'scene scene-why';
  $('#scene-outro').className  = 'scene scene-outro';
  $('#stage').classList.remove('show-wm', 'show-toggle');
  $('#mode-toggle').classList.remove('aloud-on', 'paper-on');
  // story beats
  $$('.story-beat').forEach(b => b.classList.remove('in'));
  // waveforms / collapse
  if (aloudWave) aloudWave.setActive(false);
  if (flatWave) flatWave.setActive(false);
  if (collapseEl) collapseEl.reset();
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
