/* ============================================================
   Stacktags — "5 Chinese words you are already using"  (v2 — depth style)

   New look (per designguide.md): one continuous faux-3D DEPTH fly-through on a
   dynamic moving grid (StacktagsDepthTransitionsOptimized). Every beat lands on
   the spoken word (audio-currentTime cue engine, timings force-aligned via
   Whisper). The enumeration_with_in_detail element folds the 5 words into the
   stacked Stacktags logo and stays as a corner progress badge. Subtitles mirror
   the narration. White + turquoise (#35A292), Inter (+ Noto Sans SC for hanzi).
   ============================================================ */
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---- the 5 loanwords (story order) ---- */
const WORDS = [
  { key:'typhoon',    en:'Typhoon',     hanzi:'台风',   py:'táifēng',   gloss:'the great wind' },
  { key:'tofu',       en:'Tofu',        hanzi:'豆腐',   py:'dòufu',     gloss:'curdled bean' },
  { key:'yinyang',    en:'Yin & Yang',  hanzi:'阴阳',   py:'yīn yáng',  gloss:'shady & sunny side' },
  { key:'taikonaut',  en:'Taikonaut',   hanzi:'太空',   py:'tàikōng',   gloss:'the great emptiness' },
  { key:'papertiger', en:'Paper Tiger', hanzi:'纸老虎', py:'zhǐ lǎohǔ', gloss:'paper tiger' },
];

/* ============================================================
   SVG art (white + turquoise, no photos)
   ============================================================ */
function yinYangSVG() {
  return `<svg class="art-svg yy-swirl" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="#fff" stroke="var(--stk-ink)" stroke-width="2.5"/>
    <path d="M50 2 a48 48 0 0 1 0 96 a24 24 0 0 1 0 -48 a24 24 0 0 0 0 -48" fill="var(--stk-ink)"/>
    <circle cx="50" cy="26" r="8" fill="#fff"/>
    <circle cx="50" cy="74" r="8" fill="var(--stk-ink)"/>
  </svg>`;
}
function skFlagSVG() {
  const bar = (x, y, w, h, broken) =>
    broken
      ? `<rect x="${x}" y="${y}" width="${(w-4)/2}" height="${h}" rx="1"/><rect x="${x+(w+4)/2}" y="${y}" width="${(w-4)/2}" height="${h}" rx="1"/>`
      : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/>`;
  function trigram(cx, cy, angle, pattern) {
    const W = 34, H = 6, GAP = 10; let inner = '';
    pattern.forEach((p, i) => { inner += bar(-W/2, -GAP + i * GAP, W, H, p === 0); });
    return `<g transform="translate(${cx} ${cy}) rotate(${angle})" fill="var(--stk-ink)">${inner}</g>`;
  }
  return `<svg class="sk-flag" viewBox="0 0 300 200" aria-hidden="true">
    <rect width="300" height="200" fill="#fff"/>
    <g transform="translate(150 100) rotate(-33.69)">
      <!-- taegeuk: a solid RED base, then ONE blue S-path overlays it -->
      <!-- (no white-base circle, so no stray white dot can show through) -->
      <circle r="44" fill="#CD2E3A"/>
      <path d="M0 -44 A44 44 0 0 1 0 44 A22 22 0 0 1 0 0 A22 22 0 0 0 0 -44 Z" fill="#0047A0"/>
    </g>
    ${trigram(63, 50, 33.69, [1,1,1])}
    ${trigram(237, 50, -33.69, [0,0,0])}
    ${trigram(63, 150, -33.69, [1,0,1])}
    ${trigram(237, 150, 33.69, [0,1,0])}
  </svg>`;
}
/* ============================================================
   BEATS — the depth fly-through steps
   ============================================================ */
const han = (str) => [...str].map(c => `<span class="hz">${c}</span>`).join('');

function recapRowsHTML() {
  return WORDS.map((w, i) =>
    `<div class="recap-row" data-i="${i}">
       <span class="rr-han">${w.hanzi}</span>
       <span class="rr-txt"><b>${w.en.toLowerCase()}</b><span>${w.py}</span></span>
     </div>`).join('');
}

const BEATS = [
  /* 0 — hook opener: the spoken title line (the one place on-screen text IS the goal) */
  /* 0 */ { cls:'beat-hook1', text:
    `<div class="hk1">
       <div class="l1">You already speak<br>a little <span class="key">Chinese</span>.</div>
       <div class="l2">You just don't know it yet.</div>
     </div>` },
  /* 1 — the 5 words teased as big CUT-OUT images scattered across the frame */
  /* 1 */ { cls:'beat-names', via:'zoom-in', text:
    `<div class="names">
       <div class="nimg n-typhoon ring" data-i="0"><img src="assets/photos/typhoon.png" alt="" onerror="this.style.display='none'"></div>
       <div class="nimg n-tofu"    data-i="1"><img src="assets/photos/tofu_dash.png" alt="" onerror="this.style.display='none'"></div>
       <div class="nimg n-yy ring" data-i="2">${yinYangSVG()}</div>
       <div class="nimg n-astro"   data-i="3"><img src="assets/photos/astronaut_dash.png" alt="" onerror="this.style.display='none'"></div>
       <div class="nimg n-tiger"   data-i="4"><img src="assets/photos/tiger_dash.png" alt="" onerror="this.style.display='none'"></div>
     </div>` },
  /* 2 — the "borrowed from Latin & French, then China" gag (no on-screen text) */
  /* 2 */ { cls:'beat-gag', via:'lift', text:
    `<div class="gag">
       <img class="gag-helmet-back"  src="assets/photos/helmet_back.png"  alt="" onerror="this.style.display='none'">
       <img class="gag-person"   src="assets/photos/englishman.png" alt="" onerror="this.style.display='none'">
       <img class="gag-helmet-front" src="assets/photos/helmet_front.png" alt="" onerror="this.style.display='none'">
       <img class="gag-baguette" src="assets/photos/baguette.png" alt="" onerror="this.style.display='none'">
       <div class="gag-table"><img class="gag-rice" src="assets/photos/rice_table.png" alt="" onerror="this.style.display='none'"><div class="gag-table-top"><i class="leg leg-l"></i><i class="leg leg-r"></i></div></div>
     </div>` },

  /* 3 — TYPHOON intro (real photo, circular) */ { cls:'beat-photo beat-ty-intro', text:
    `<div class="ph"><div class="ph-photo ty-photo"><img src="assets/photos/typhoon.png" alt="" onerror="this.style.display='none'"></div><div class="ph-en">TYPHOON</div></div>` },
  /* 4 — TYPHOON reveal */ { cls:'beat-reveal beat-typhoon', via:'zoom-in', text:
    `<div class="rv">
       <div class="rv-han">${han('台风')}</div>
       <div class="rv-py">táifēng</div>
       <div class="rv-gloss">“the great wind”</div>
     </div>` },

  /* 5 — TOFU intro (photo) */ { cls:'beat-photo beat-to-intro', via:'pan-right', atY:-40, text:
    `<div class="ph"><img class="ph-img" src="assets/photos/tofu.png" alt="" onerror="this.style.display='none'"><div class="ph-en">TOFU</div></div>` },
  /* 6 — TOFU reveal */ { cls:'beat-reveal beat-tofu', via:'zoom-in', text:
    `<div class="rv">
       <div class="rv-han">${han('豆腐')}</div>
       <div class="rv-py">dòufu</div>
       <div class="rv-chars"><span class="ch ch-dou"><b>豆</b> bean</span><span class="ch ch-fu"><b>腐</b> curdled</span></div>
     </div>` },

  /* 7 — YIN & YANG: ONE continuous beat. Big swirl + label (intro) → on `.reveal`
         the SAME swirl shifts down & scales while the hanzi flies in → on `.flag-in`
         it shrinks onto the Korean flag's taegeuk. The swirl never disappears. */
  /* 7 */ { cls:'beat-reveal beat-yy', via:'lift', text:
    `<div class="yy">
       <div class="yy-head">
         <div class="rv-han">${han('阴阳')}</div>
         <div class="rv-py">yīn yáng</div>
         <div class="rv-chars"><span class="ch ch-yin"><b>阴</b> shady side</span><span class="ch ch-yang"><b>阳</b> sunny side</span></div>
       </div>
       <div class="yy-stage">
         <div class="yy-flag">${skFlagSVG()}</div>
         <div class="yy-symbol">${yinYangSVG()}</div>
       </div>
       <div class="yy-label">YIN &amp; YANG</div>
     </div>` },

  /* 9 — TAIKONAUT intro (astronaut centred; three words fly in from L / R / below) */ { cls:'beat-tk-intro', via:'pan-left', text:
    `<div class="tk">
       <img class="tk-astro" src="assets/photos/astronaut.png" alt="" onerror="this.style.display='none'">
       <div class="tk-word w-astro" data-n="0"><b>astronaut</b><span class="tk-g">astro · “star”</span></div>
       <div class="tk-word w-cosmo" data-n="1"><b>cosmonaut</b><span class="tk-g">cosmo · “cosmos”</span></div>
       <div class="tk-word w-taiko chn" data-n="2"><b>taikonaut</b><span class="tk-g">太空 · tàikōng</span></div>
     </div>` },
  /* 10 — TAIKONAUT reveal */ { cls:'beat-reveal beat-tk', via:'zoom-in', text:
    `<div class="rv">
       <div class="rv-han">${han('太空')}</div>
       <div class="rv-py">tàikōng</div>
       <div class="rv-gloss">“the great emptiness”</div>
     </div>` },

  /* 11 — PAPER TIGER intro (photo) */ { cls:'beat-photo beat-pt-intro', via:'pan-right', text:
    `<div class="ph pt">
       <img class="ph-img" src="assets/photos/tiger.png" alt="" onerror="this.style.display='none'">
       <div class="ph-en">PAPER TIGER</div>
     </div>` },
  /* 12 — PAPER TIGER reveal */ { cls:'beat-reveal beat-pt', via:'zoom-in', text:
    `<div class="rv">
       <div class="rv-han">${han('纸老虎')}</div>
       <div class="rv-py">zhǐ lǎohǔ</div>
       <div class="rv-gloss">“paper tiger”</div>
     </div>` },
  /* 13 — MAO: a portrait of Mao + a speech bubble holding a (paper cut-out) tiger */
  /* 13 */ { cls:'beat-mao', via:'pan-left', text:
    `<div class="mao">
       <img class="mao-img" src="assets/photos/mao.png" alt="" onerror="this.style.display='none'">
       <div class="mao-bubble"><img class="mao-tiger" src="assets/photos/tiger_dash.png" alt="" onerror="this.style.display='none'"></div>
     </div>` },

  /* 14 — RECAP (the 5 vocab words line back up — no caption sentence) */
  /* 14 */ { cls:'beat-recap', via:'zoom-out', text:
    `<div class="recap"><div class="recap-rows">${recapRowsHTML()}</div></div>` },
  /* 15 — HANZI WALL (the 5 characters together — pure vocab closer) */
  /* 15 */ { cls:'beat-hanzi-wall', via:'lift', text:
    `<div class="hwall">${WORDS.map(w => `<span class="hw">${w.hanzi}</span>`).join('')}</div>` },
  /* 16 — BLANK: the camera clears to bare moving grid; the outro endcard
          (its own #outro-host layer) assembles on top */
  /* 16 */ { cls:'beat-blank', via:'zoom-in', text:'' },
];

/* index map */
const IDX = { hook1:0, names:1, borrowed:2, ty_i:3, ty_r:4, to_i:5, to_r:6, yy:7, tk_i:8, tk_r:9, pt_i:10, pt_r:11, mao:12, recap:13, hanzi:14, brand:15 };

/* ============================================================
   ELEMENTS
   ============================================================ */
let depth = null, enumEl = null;
const L = i => depth.layers[i];                 // a beat's DOM element
const onBeat = (i, c) => { const el = L(i); if (el) el.classList.add(c); };

function mountElements() {
  depth = new StacktagsDepthTransitionsOptimized('#depth-host', { steps: BEATS });
  // tag each beat element with its content class so styles.css can target it
  BEATS.forEach((b, i) => { if (b.cls) depth.layers[i].className += ' ' + b.cls; });

  enumEl = new StacktagsEnumerationDetail($('#enum-host'), {
    title: '5 Chinese words <b>you already use</b>',
    items: WORDS.map(w => ({ label: w.en, sub: `${w.py} · ${w.gloss}` })),
  });
  // put the hanzi onto each enumeration tile (instead of the "Bild" placeholder)
  $$('#enum-host .se2-tile-top span').forEach((s, i) => {
    if (WORDS[i]) { s.textContent = WORDS[i].hanzi; s.classList.add('glyph'); }
  });

  // closing endcard — the default `outro` element (makeStacktagsLogo: stacked
  // logo + chevrons), with the wordmark + url, plus our folder link
  const ec = document.createElement('div');
  ec.className = 'ec';
  ec.innerHTML =
    `<div id="ec-logo"></div>
     <div class="wm"><span class="s">stack</span><span class="t">tags</span></div>
     <div class="url">stacktags.io</div>
     <div class="ec-folder">Thousands of <b>free exercises</b> &amp; learning content</div>`;
  $('#outro-host').appendChild(ec);
  $('#ec-logo').innerHTML = window.makeStacktagsLogo({ size: 560 });
}

/* ============================================================
   PHASE helpers
   ============================================================ */
const depthHost = () => $('#depth-host');
const enumHost  = () => $('#enum-host');

function showHook() {
  enumHost().classList.remove('show', 'grid');
  depthHost().classList.remove('hide');
  depth.reset();
  depth._showFirst(IDX.hook1);
}
function enterEnum() {
  depthHost().classList.add('hide');
  enumHost().classList.add('show', 'grid');
  enumEl.reset();
  enumEl.showTitle();
  enumEl.revealAll({ stagger: 150 });
}
function enterWords() {
  enumHost().classList.remove('grid');     // keep the docked logo, drop its grid
  depthHost().classList.remove('hide');
  depth.reset();
  depth._showFirst(IDX.ty_i);              // typhoon intro, fades in over the dock
}
function leaveEnumBadge() { enumHost().classList.remove('show'); }

/* outro: the blank beat clears to bare grid; the endcard assembles on top (.play triggers the CSS) */
function enterOutro() { $('#outro-host').classList.add('show', 'play'); }

/* a depth transition (guarded so re-entrancy is impossible during forward play) */
function go(i, mode) { depth.transitionTo(i, mode || BEATS[i].via || 'zoom-in', 850); }

/* intra-beat helpers */
function pop(i) { const el = L(IDX.names); const c = el && el.querySelector(`.nimg[data-i="${i}"]`); if (c) c.classList.add('in'); }
function tkRow(n) { const el = L(IDX.tk_i); const r = el && el.querySelector(`.tk-word[data-n="${n}"]`); if (r) r.classList.add('in'); }
function recapRow(i) { const el = L(IDX.recap); const r = el && el.querySelector(`.recap-row[data-i="${i}"]`); if (r) r.classList.add('in'); }

/* running vocab tally (introduced hanzi accumulate top-left, beside the stack) */
function showVocab() { const h = $('#vocab-tally'); if (h) h.classList.add('show'); }
function hideVocab() { const h = $('#vocab-tally'); if (!h) return; h.classList.remove('show'); h.innerHTML = ''; }
function addVocab(i) {
  const host = $('#vocab-tally'); const w = WORDS[i]; if (!host || !w) return;
  $$('.vt', host).forEach(v => v.classList.remove('active'));
  let row = host.querySelector(`.vt[data-i="${i}"]`);
  if (!row) {
    row = document.createElement('div'); row.className = 'vt'; row.dataset.i = i;
    row.innerHTML = `<span class="vt-han">${w.hanzi}</span><span class="vt-py">${w.py}</span>`;
    host.appendChild(row);
  }
  row.classList.add('active');
  void row.offsetWidth; row.classList.add('in');
}

/* ============================================================
   CUES — fired off audio.currentTime (seconds)
   ============================================================ */
const CUES = [
  // ---------- HOOK ----------
  { t: 0.00,  fn: () => showHook() },
  { t: 1.64,  fn: () => onBeat(IDX.hook1, 's2') },           // "you just don't know it yet"
  { t: 2.92,  fn: () => { go(IDX.names, 'zoom-in'); pop(0); } },  // Typhoon
  { t: 3.76,  fn: () => pop(1) },                            // Tofu
  { t: 4.50,  fn: () => pop(2) },                            // Yin and yang
  { t: 5.72,  fn: () => pop(3) },                            // Taikonaut
  { t: 6.44,  fn: () => pop(4) },                            // Paper tiger
  // borrowed-from gag: Englishman, Roman helmet (Latin), baguette (French), table+rice (China)
  { t: 10.34, fn: () => go(IDX.borrowed, 'lift') },          // "We all know English borrowed from Latin and French"
  { t: 11.36, fn: () => onBeat(IDX.borrowed, 'helmet-in') }, // "Latin"
  { t: 11.80, fn: () => onBeat(IDX.borrowed, 'baguette-in') }, // "French"
  { t: 14.02, fn: () => onBeat(IDX.borrowed, 'rice-in') },   // "from the other side of the world"

  // ---------- ENUMERATION (fold into the stacked logo) ----------
  { t: 17.04, fn: () => enterEnum() },                       // "Here are 5 Chinese words"
  { t: 18.20, fn: () => enumEl.collapseToLogo({ delay: 0 }) },
  { t: 18.95, fn: () => enumEl.dockToTop() },

  // ---------- WORD 1 — Typhoon ----------
  { t: 19.54, fn: () => { enterWords(); showVocab(); } },    // "First, the one nobody suspects, the weather"
  { t: 23.20, fn: () => { go(IDX.ty_r, 'zoom-in'); addVocab(0); } }, // "One. Typhoon. táifēng"

  // ---------- WORD 2 — Tofu ----------
  { t: 30.58, fn: () => { go(IDX.to_i, 'pan-right'); enumEl.setActive(1); } }, // "from the weather to your lunch"
  { t: 32.74, fn: () => { go(IDX.to_r, 'zoom-in'); addVocab(1); } }, // "Two. Tofu. dòufu"
  { t: 35.74, fn: () => onBeat(IDX.to_r, 'hl-dou') },        // "dòu means bean"
  { t: 36.66, fn: () => onBeat(IDX.to_r, 'hl-fu') },         // "fǔ means curdled"

  // ---------- WORD 3 — Yin & Yang (one continuous beat; swirl persists) ----------
  { t: 45.50, fn: () => { go(IDX.yy, 'lift'); enumEl.setActive(2); } },  // "Next, an idea you've definitely seen" — big swirl + label
  { t: 48.92, fn: () => { onBeat(IDX.yy, 'reveal'); addVocab(2); } }, // "Three. Yin and yang" — text flies in, SAME swirl shifts + shrinks
  { t: 50.36, fn: () => onBeat(IDX.yy, 'hl-yin') },          // "Yin is the shady side"
  { t: 52.84, fn: () => onBeat(IDX.yy, 'hl-yang') },         // "Yang, the sunny side"
  { t: 56.60, fn: () => onBeat(IDX.yy, 'flag-in') },         // "the South Korean flag" — swirl shrinks onto the taegeuk

  // ---------- WORD 4 — Taikonaut ----------
  { t: 66.58, fn: () => { go(IDX.tk_i, 'pan-left'); enumEl.setActive(3); } }, // "Four. Taikonaut"
  { t: 72.84, fn: () => tkRow(0) },                          // "America has astronauts"
  { t: 76.48, fn: () => tkRow(1) },                          // "Russia, cosmonauts"
  { t: 79.58, fn: () => tkRow(2) },                          // "and China, Taikonauts"
  { t: 82.42, fn: () => { go(IDX.tk_r, 'zoom-in'); addVocab(3); } }, // "literally the great emptiness"

  // ---------- WORD 5 — Paper Tiger ----------
  { t: 87.32, fn: () => { go(IDX.pt_i, 'pan-right'); enumEl.setActive(4); } }, // "Our last one isn't a thing"
  { t: 90.00, fn: () => onBeat(IDX.pt_i, 'crumple') },
  { t: 92.30, fn: () => { go(IDX.pt_r, 'zoom-in'); addVocab(4); } }, // "Five. Paper tiger. zhǐ lǎohǔ"
  // Mao: the 1946 quote — Mao portrait + a speech bubble holding the paper(-cutout) tiger
  { t: 98.62,  fn: () => go(IDX.mao, 'pan-left') },          // "The phrase conquered English in 1946,"
  { t: 103.40, fn: () => onBeat(IDX.mao, 'mao-pop') },       // "...called US imperialism a paper tiger."

  // ---------- RECAP + OUTRO ----------
  { t: 108.60, fn: () => { leaveEnumBadge(); hideVocab(); go(IDX.recap, 'zoom-out'); } }, // "So, typhoon, tofu..."
  { t: 109.10, fn: () => recapRow(0) },
  { t: 109.86, fn: () => recapRow(1) },
  { t: 110.72, fn: () => recapRow(2) },
  { t: 112.04, fn: () => recapRow(3) },
  { t: 112.82, fn: () => recapRow(4) },
  { t: 116.26, fn: () => go(IDX.hanzi, 'lift') },            // "without realizing they were Chinese"
  // clear to the bare moving grid, then assemble the endcard on top
  { t: 120.12, fn: () => { go(IDX.brand, 'zoom-in'); enterOutro(); } }, // "Wanna actually start learning Chinese?"
  { t: 122.00, fn: () => $('#outro-host').classList.add('folder-in') }, // "Discover thousands of free exercises… on stacktags.io"
];
CUES.sort((a, b) => a.t - b.t);
let fired = new Array(CUES.length).fill(false);

/* ============================================================
   SFX — default-element sounds rebuilt at the real CUE times.
   swoosh = every depth transition / scene change / fold / dock /
   flying-in object / outro assemble;  pop = a word/sticker/row/
   bubble appearing.  Mixed into the final mp4 by _build/mix_sfx.js
   (Web-Audio can't be captured headless), and played live here so
   the browser preview has sound too.  [t, sound, vol]
   ============================================================ */
const SFX = [
  // RULE: swoosh ONLY when the background GRID actually MOVES (a depth `go()` transition —
  // the camera pans/zooms/lifts) OR a DEFAULT ELEMENT animates (enumeration fold/dock, outro
  // assemble) regardless of the grid. NO swoosh for intra-beat fly-ins where the grid is
  // static (helmet/baguette/table, taikonaut word slides, crumple, yin-yang reveal/flag morph,
  // enterWords fade-in). pop = a word/sticker/row/bubble appearing.
  // --- opening: grid zooms into the names beat (swoosh) + 5 sticker pops ---
  [2.92, 'swoosh', 0.55], [2.92, 'pop', 0.55],
  [3.76, 'pop', 0.55], [4.50, 'pop', 0.55], [5.72, 'pop', 0.55], [6.44, 'pop', 0.55],
  // --- gag: grid LIFTS into the beat (swoosh); helmet/baguette/table fly in WITHOUT grid motion → no swoosh ---
  [10.34, 'swoosh', 0.55],
  // --- enumeration DEFAULT ELEMENT: appear → fold into logo → dock (swoosh regardless of grid) ---
  [17.04, 'swoosh', 0.5], [18.20, 'swoosh', 0.5], [18.95, 'swoosh', 0.5],
  // --- word reveals = depth transitions (grid moves). intra-beat reveals/slides/morphs get NO swoosh ---
  [23.20, 'swoosh', 0.55],                            // typhoon reveal (grid zoom)
  [30.58, 'swoosh', 0.5], [32.74, 'swoosh', 0.55],    // tofu intro (pan) + reveal (zoom)
  [45.50, 'swoosh', 0.5],                             // yin&yang beat lifts in (reveal + flag morph are intra-beat)
  [66.58, 'swoosh', 0.5], [82.42, 'swoosh', 0.55],    // taikonaut intro (pan) + reveal (zoom) — word slides intra-beat
  [87.32, 'swoosh', 0.5], [92.30, 'swoosh', 0.55],    // paper-tiger intro (pan) + reveal (zoom) — crumple intra-beat
  [98.62, 'swoosh', 0.5],                             // mao scene (pan)
  [103.40, 'pop', 0.6],                               // mao speech-bubble pop
  // --- recap: grid pulls back into the recap beat (swoosh) + 5 row pops ---
  [108.60, 'swoosh', 0.55],
  [109.10, 'pop', 0.5], [109.86, 'pop', 0.5], [110.72, 'pop', 0.5], [112.04, 'pop', 0.5], [112.82, 'pop', 0.5],
  // --- hanzi wall (grid lifts) + outro DEFAULT ELEMENT assemble ---
  [116.26, 'swoosh', 0.5], [120.12, 'swoosh', 0.55],
];
SFX.sort((a, b) => a[0] - b[0]);
window.SFX = SFX;
const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav' };
let firedSfx = new Array(SFX.length).fill(false);
function playSfx(e) {
  try { const a = new Audio(SND[e[1]]); a.volume = e[2] != null ? e[2] : 0.5; a.play().catch(() => {}); } catch {}
}

/* ============================================================
   SUBTITLES — mirror the narration, one line at a time
   ============================================================ */
const SUBS = [
  { t: 0.00,   h: 'You already speak a little <b>Chinese</b>.' },
  { t: 1.64,   h: "You just don't know it yet." },
  { t: 2.92,   h: 'Typhoon. Tofu. Yin and yang.' },
  { t: 5.72,   h: 'Taikonaut. Paper tiger.' },
  { t: 7.74,   h: 'Every one is an English word' },
  { t: 8.70,   h: 'that came straight out of <b>Chinese</b>.' },
  { t: 10.34,  h: 'We all know English borrowed from Latin and French,' },
  { t: 12.52,  h: 'but it quietly pocketed a few' },
  { t: 14.02,  h: 'from the other side of the world,' },
  { t: 14.96,  h: 'with some wild stories attached.' },
  { t: 17.04,  h: 'Here are <b>5 Chinese words</b> you’re already using.' },
  { t: 19.54,  h: 'First, the one nobody suspects — the weather.' },
  { t: 22.40,  h: 'One. <b>Typhoon</b> — táifēng.' },
  { t: 25.06,  h: 'That monster storm off the Pacific?' },
  { t: 27.12,  h: 'The word comes from Chinese <b>táifēng</b>,' },
  { t: 28.76,  h: 'roughly “the great wind.”' },
  { t: 30.58,  h: 'From the weather to your lunch.' },
  { t: 32.16,  h: 'Two. <b>Tofu</b>.' },
  { t: 35.74,  h: '<b>dòu</b> means “bean,” and <b>fǔ</b> means “curdled.”' },
  { t: 38.12,  h: 'So every time you order tofu,' },
  { t: 39.60,  h: 'you’re literally asking for <b>“curdled bean”</b> —' },
  { t: 42.20,  h: 'a dish coined in China over two thousand years ago.' },
  { t: 45.50,  h: "Next, an idea you've definitely seen." },
  { t: 48.00,  h: 'Three. <b>Yin and yang</b>.' },
  { t: 50.36,  h: 'Yin is the shady side of a hill;' },
  { t: 52.84,  h: 'Yang, the sunny side —' },
  { t: 54.80,  h: 'opposites that need each other.' },
  { t: 56.30,  h: "And yes — that's the symbol in the middle" },
  { t: 58.30,  h: 'of the <b>South Korean flag</b>,' },
  { t: 60.04,  h: 'which fuels a quiet tug-of-war:' },
  { t: 62.32,  h: 'an ancient Chinese concept' },
  { t: 63.60,  h: 'that became a national emblem next door.' },
  { t: 66.58,  h: 'Four. <b>Taikonaut</b>.' },
  { t: 69.56,  h: 'Every space nation names its travelers for the heavens.' },
  { t: 72.84,  h: 'America has <b>astronauts</b> — Greek for “star.”' },
  { t: 76.48,  h: 'Russia, <b>cosmonauts</b> — “cosmos.”' },
  { t: 79.58,  h: 'And China? <b>Taikonauts</b> —' },
  { t: 81.32,  h: 'from the word <b>tàikōng</b>,' },
  { t: 82.42,  h: 'literally “the great emptiness.”' },
  { t: 84.88,  h: 'Outer space, named like a poem.' },
  { t: 87.32,  h: "Our last one isn't a thing —" },
  { t: 88.82,  h: "it's an insult that went global." },
  { t: 91.22,  h: 'Five. <b>Paper tiger</b> — zhǐ lǎohǔ.' },
  { t: 94.72,  h: 'A paper tiger looks terrifying' },
  { t: 96.04,  h: "until you see it can't bite." },
  { t: 98.62,  h: 'The phrase conquered English in <b>1946</b>,' },
  { t: 101.52, h: 'when Mao Zedong called US imperialism “a paper tiger.”' },
  { t: 105.38, h: 'It got translated word-for-word, and it stuck.' },
  { t: 108.60, h: 'So — typhoon, tofu, yin and yang,' },
  { t: 112.04, h: 'taikonaut, paper tiger.' },
  { t: 113.96, h: "Five words you've spoken your whole life," },
  { t: 116.26, h: 'without realizing they were <b>Chinese</b>.' },
  { t: 118.24, h: 'The language is closer than it looks.' },
  { t: 120.12, h: 'Wanna actually start learning Chinese?' },
  { t: 122.00, h: 'Discover thousands of free exercises' },
  { t: 123.58, h: 'and more learning content on <b>stacktags.io</b>.' },
  { t: 126.60, h: '' },
];
SUBS.sort((a, b) => a.t - b.t);
let subIdx = -1;
function updateSubs(t) {
  let k = -1;
  for (let i = 0; i < SUBS.length; i++) { if (SUBS[i].t <= t + 1e-3) k = i; else break; }
  if (k === subIdx) return;
  subIdx = k;
  const line = $('#subline');
  const h = k >= 0 ? SUBS[k].h : '';
  line.classList.remove('in');
  // re-trigger the entrance transition
  void line.offsetWidth;
  line.innerHTML = h;
  if (h) line.classList.add('in');
}

/* ============================================================
   ENGINE — forward, audio-driven
   ============================================================ */
const audio = $('#vo');
let raf = 0;
const DUR = 125.81;

function tick() {
  const t = audio.currentTime;
  for (let i = 0; i < CUES.length; i++) {
    if (!fired[i] && CUES[i].t <= t + 1e-3) { fired[i] = true; try { CUES[i].fn(); } catch (e) { console.error('cue', CUES[i].t, e); } }
  }
  for (let i = 0; i < SFX.length; i++) {
    if (!firedSfx[i] && SFX[i][0] <= t + 1e-3) { firedSfx[i] = true; playSfx(SFX[i]); }
  }
  updateSubs(t);
  $('#vprogress').style.width = (100 * t / (audio.duration || DUR)) + '%';
  $('#info').textContent = t.toFixed(1) + 's';
  raf = requestAnimationFrame(tick);
}

function hardReset() {
  fired.fill(false);
  firedSfx.fill(false);
  subIdx = -1;
  $('#subline').classList.remove('in');
  $('#subline').innerHTML = '';
  if (enumEl) enumEl.reset();
  enumHost().classList.remove('show', 'grid');
  hideVocab();
  $('#outro-host').classList.remove('show', 'play', 'folder-in');
  // clear any intra-beat state classes
  ['s2','helmet-in','baguette-in','rice-in','hl-dou','hl-fu','reveal','hl-yin','hl-yang','flag-in','crumple','mao-pop']
    .forEach(c => BEATS.forEach((_, i) => L(i) && L(i).classList.remove(c)));
  $$('.nimg, .tk-word, .recap-row').forEach(e => e.classList.remove('in'));
  if (depth) { depth.reset(); }
}

function play() {
  hardReset();
  showHook();
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
  showHook();

  $('#play').addEventListener('click', play);
  $('#restart').addEventListener('click', restart);
  $('#cleanbtn').addEventListener('click', () => { document.body.classList.toggle('clean'); fit(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'c' || e.key === 'C') { document.body.classList.toggle('clean'); fit(); }
    if (e.key === ' ') { e.preventDefault(); audio.paused ? play() : audio.pause(); }
  });

  // expose for headless capture
  window.__play = play;
  // QA-only: show a single beat cleanly (no transition pile-up) + optional state classes.
  window.__showBeat = (idx, classes) => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }   // stop the cue engine so it can't re-fire showHook
    audio.pause();
    hardReset();
    depthHost().classList.remove('hide');
    enumHost().classList.remove('show', 'grid');
    depth.reset(); depth._showFirst(idx);
    const el = L(idx); if (!el) return;
    (classes || []).forEach(c => el.classList.add(c));
    el.querySelectorAll('.nimg, .tk-word, .recap-row').forEach(e => e.classList.add('in'));
  };
  // QA-only: set up the docked corner badge + vocab tally to inspect it.
  window.__showBadge = (activeIdx, nVocab) => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    audio.pause();
    hardReset();
    depthHost().classList.add('hide');
    enumHost().classList.add('show');
    enumEl.reset(); enumEl.showTitle(); enumEl.revealAll({ stagger: 0 });
    enumEl.collapseToLogo({ delay: 0 });
    setTimeout(() => { enumEl.dockToTop(); enumEl.setActive(activeIdx); }, 1000);
    showVocab(); for (let i = 0; i <= nVocab; i++) addVocab(i);
  };
  raf = requestAnimationFrame(tick);
});
