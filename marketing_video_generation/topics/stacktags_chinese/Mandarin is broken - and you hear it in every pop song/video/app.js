/* ============================================================
   "Mandarin is broken" — DEPTH FLY-THROUGH build (v2).
   One persistent dynamic grid = the camera, flying between beats
   with varied moves. The ON-SCREEN content never just echoes the
   spoken line — figures / illustrations / devices carry the idea,
   while the bottom SUBTITLES mirror the narration verbatim.
   Audio-synced cue engine; timestamps force-aligned via Whisper.
   White + turquoise, Inter. 9:16, 1080×1920.
   ============================================================ */
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let INSTANT = false;
let timers = [];
const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

/* ============================================================
   BEATS — the depth fly-through sequence (one layer each)
   ============================================================ */
const BEATS = [
  // 0 — HOOK (title / thesis). "broken" splits bro|ken + bends down on the outer edges.
  { html:
    `<div class="hook-beat" id="hook-beat">
       <div class="hk-kicker">a 1,000-year erosion</div>
       <div class="hk-title">Mandarin is a <span class="brk"><span class="brk-l">bro</span><span class="brk-r">ken</span></span> language</div>
       <div class="hk-sub">— you hear it in every <b>pop song</b></div>
     </div>` },
  // 1 — TANG: timeline rewinds the dynasties → lands on a TEMPLE + COINS cut-outs;
  //     then the poet RISES from below and the temple/coins stay.
  { html:
    `<div class="tang-beat" id="tang-beat">
       <div id="tl-host" class="tl-host"></div>
       <img class="tang-poet" id="tang-poet" src="assets/illus/tang_poet.png" alt="">
     </div>` },
  // 2 — ENUMERATION (the four hard endings)  [mount: StacktagsEnumerationDetail]
  { html: `<div id="enum-host" style="position:absolute;inset:0;"></div>` },
  // 3 — MOON 月 (NGWAT → YUÈ)
  { html:
    `<div class="moon-beat" id="moon-beat">
       <div class="moon-char">月</div>
       <div class="moon-row">
         <span class="moon-old">NGWA<span class="tt">T</span></span>
         <span class="moon-arrow">→</span>
         <span class="moon-new">YUÈ</span>
       </div>
       <div class="moon-tag">a hard stop on the <b>-t</b></div>
     </div>` },
  // 4 — TRIO + struck p t k m
  { html:
    `<div class="trio-beat" id="trio-beat">
       <div class="trio-head">And it wasn't just <b>one</b> word.</div>
       <div class="trio-rows">
         <div class="trio-row" data-k="ten"><span class="t-gloss">ten · 十</span><span class="t-old">SA<span class="drop">P</span></span><span class="t-arr">→</span><span class="t-new">SHÍ</span></div>
         <div class="trio-row" data-k="six"><span class="t-gloss">six · 六</span><span class="t-old">LU<span class="drop">K</span></span><span class="t-arr">→</span><span class="t-new">LIÙ</span></div>
         <div class="trio-row" data-k="heart"><span class="t-gloss">heart · 心</span><span class="t-old">SA<span class="drop">M</span></span><span class="t-arr">→</span><span class="t-new">XĪN</span></div>
       </div>
       <div class="trio-ptkm"><span class="pk">p</span><span class="pk">t</span><span class="pk">k</span><span class="pk">m</span></div>
       <div class="trio-count" id="trio-count"><span class="tc-val" id="tc-val">1200</span><span class="tc-lbl">syllables</span></div>
     </div>` },
  // 5 — RESULT: turquoise dots fill in from the bottom-left, row by row going up,
  //     then the view scrolls up fast (easing in + out) over a huge field of more
  //     dots and decelerates to a stop as a framed "~400 syllables" box appears.
  { html:
    `<div class="result-beat" id="result-beat">
       <div class="rb-view" id="rb-view"><div class="rb-field" id="rb-field"></div></div>
       <div class="rb-box"><span class="rb-num">~400</span><span class="rb-lbl">syllables</span></div>
     </div>` },
  // 6 — POP WEB (homophones)  [mount: StacktagsTextPopup]
  { html: `<div id="pop-host" style="position:absolute;inset:0;"></div>` },
  // 7 — POP SINGER belting open vowels (cut-out) + vowel pills
  { html:
    `<div class="singer-beat" id="singer-beat">
       <img class="illus singer" src="assets/illus/pop_singer.png" alt="">
       <span class="vw vw1">ahh</span><span class="vw vw2">eyy</span><span class="vw vw3">ohh</span><span class="vw vw4">wayy</span>
     </div>` },
  // 8 — SOUTH (globe → Hong Kong photo → kept-card on top)  [mount: globe]
  { html:
    `<div class="south-beat" id="south-beat">
       <div class="globe-wrap" id="globe-host"></div>
       <img class="south-photo" id="south-photo" src="assets/photos/hongkong.png" alt="">
       <div class="keep-card" id="keep-card">
         <div class="kp-head">Cantonese kept <b>everything</b></div>
         <div class="kp-sub">six tones · every old ending intact</div>
         <div class="kp-lets"><span class="kp-let">p</span><span class="kp-let">t</span><span class="kp-let">k</span><span class="kp-let">m</span></div>
         <div class="kp-snaps"><span class="kp-snap">yut</span><span class="kp-snap">sap</span><span class="kp-snap">luk</span></div>
       </div>
     </div>` },
  // 9 — POEM 江雪: lines + two speakers — Mandarin (left, garbled bubble) vs Cantonese (right, real chars)
  { html:
    `<div class="poem-beat" id="poem-beat">
       <div class="poem-title">江雪 · a Tang poem</div>
       <div class="poem-lines">
         <div class="pl">千山鳥飛<span class="rhyme">絕</span></div>
         <div class="pl">萬徑人蹤<span class="rhyme">滅</span></div>
         <div class="pl">獨釣寒江<span class="rhyme">雪</span></div>
       </div>
       <div class="poem-figs">
         <div class="pf pf-right" id="pf-right">
           <div class="bubble bubble-good">絕 · 滅 · 雪</div>
           <img class="pf-img" src="assets/cutouts/crowd_1.png" alt="">
         </div>
       </div>
     </div>` },
  // 10 — PUNCH: (the lead Mandarin figure is a persistent stage overlay — see
  //      #lead-fig in index.html); here a crowd of OTHER characters spawns.
  { html: `<div class="punch-beat" id="punch-beat"><div class="punch-crowd" id="punch-crowd"></div></div>` },
  // 11 — OUTRO  [mount: StacktagsOutro]
  { html: `<div id="outro-host" style="position:absolute;inset:0;"></div>` },
];

/* ============================================================
   ELEMENT REFS + MOUNTS
   ============================================================ */
let depth = null, enumEl = null, popEl = null, outroEl = null, tlEl = null;
let globeCtrl = null;

function mountAll() {
  enumEl = new StacktagsEnumerationDetail($('#enum-host'), {
    title: '',
    items: [
      { glyph: 'p', label: 'final ‑p', sub: 'lips snap shut' },
      { glyph: 't', label: 'final ‑t', sub: 'tongue stops it' },
      { glyph: 'k', label: 'final ‑k', sub: 'back of the throat' },
      { glyph: 'm', label: 'final ‑m', sub: 'hum to a close' },
    ],
  });

  popEl = new StacktagsTextPopup($('#pop-host'), {
    words: [
      { text: 'shì', x: 0, y: 0, size: 210, keyD: true },
      { text: '是', x: -300, y: -440, size: 120 },
      { text: '事', x: 120, y: -420, size: 132, key: true },
      { text: '市', x: 320, y: -300, size: 116 },
      { text: '室', x: -360, y: -240, size: 112 },
      { text: '世', x: 300, y: -120, size: 128, key: true },
      { text: '试', x: -280, y: 150, size: 120 },
      { text: '视', x: 300, y: 150, size: 124 },
      { text: '势', x: -340, y: 330, size: 112, key: true },
      { text: '适', x: -60, y: 360, size: 120 },
      { text: '释', x: 260, y: 360, size: 116 },
      { text: '似', x: 60, y: -250, size: 100 },
    ],
  });

  // timeline (rewind through the dynasties → land on a TEMPLE + COINS composition)
  tlEl = new StacktagsTimeline($('#tl-host'), {
    spacing: 540,
    events: [
      { year: '2024', label: 'today' },
      { year: '1912', label: 'Republic' },
      { year: '1644', label: 'Qing' },
      { year: '1368', label: 'Ming' },
      { year: '1271', label: 'Yuan' },
      { year: '960',  label: 'Song' },
    ],
    endImages: [
      { src: 'assets/cutouts/temple.png', x: 0,    y: -300, w: 640 },
      { src: 'assets/cutouts/coin.png',   x: -330, y: 40,   w: 180 },
      { src: 'assets/cutouts/coin.png',   x: 320,  y: -40,  w: 150 },
    ],
    endPhoto: {},
  });

  outroEl = new StacktagsOutro($('#outro-host'), { handle: 'stacktags.io' });

  buildDots();                    // result: a tall field of dots that fills + scrolls
  buildPunchCrowd();              // punch: a crowd of OTHER character cut-outs
  // globe is mounted lazily (a cue ~10s before its scene)
}

/* ---- RESULT dots: a tall field that fills bottom-left → up, then scrolls up ----
   Geometry is fixed (not measured) so it works even while the beat is off-screen
   during an INSTANT seek. Must match the .rb-row grid in styles.css. */
const RB_COLS = 22, RB_ROWS = 130, RB_DOT = 22, RB_GAP = 16;
const RB_FIELD_H = RB_ROWS * RB_DOT + (RB_ROWS - 1) * RB_GAP;   // 4924
const RB_VIEW_H = 1920;
const RB_TOPGAP = 470;   // over-scroll past the top so a clear band is left for the box
const RB_MAXSHIFT = RB_FIELD_H - RB_VIEW_H + RB_TOPGAP;         // 3474 — field top ends at y≈470

function buildDots() {
  const field = $('#rb-field'); if (!field) return;
  let h = '';
  for (let r = 0; r < RB_ROWS; r++) {
    let row = '<div class="rb-row">';
    for (let c = 0; c < RB_COLS; c++) row += `<span class="dot" style="--c:${c}"></span>`;
    h += row + '</div>';
  }
  field.innerHTML = h;
}

// fill the bottom screen dot-by-dot, then scroll up over the rest (ease in + out,
// reveal-front leads the camera so rows are full before they slide into view) →
// decelerate to a stop at the top, where the "~400 syllables" box lands.
let rbRaf = 0;
function resetResult() {
  if (rbRaf) { cancelAnimationFrame(rbRaf); rbRaf = 0; }
  $$('#rb-field .rb-row').forEach(r => r.classList.remove('on'));
  const f = $('#rb-field'); if (f) f.style.transform = 'translateX(-50%) translateY(0px)';
}
function runResult(instant) {
  const field = $('#rb-field'); if (!field) return;
  const rows = $$('#rb-field .rb-row');
  if (rbRaf) { cancelAnimationFrame(rbRaf); rbRaf = 0; }
  if (instant) {
    rows.forEach(r => r.classList.add('on'));
    field.style.transform = `translateX(-50%) translateY(${RB_MAXSHIFT}px)`;
    return;
  }
  rows.forEach(r => r.classList.remove('on'));
  field.style.transform = 'translateX(-50%) translateY(0px)';
  const T = 3200;
  const smoother = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10);  // ease in+out
  let revealed = 0;   // rows turned on, counted from the BOTTOM
  const t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - t0) / T);
    const P = smoother(p);
    field.style.transform = `translateX(-50%) translateY(${(P * RB_MAXSHIFT).toFixed(1)}px)`;
    const target = Math.round(Math.min(1, P * 1.3) * RB_ROWS);   // reveal-front leads camera
    while (revealed < target) { const r = rows[RB_ROWS - 1 - revealed]; if (r) r.classList.add('on'); revealed++; }
    if (p < 1) rbRaf = requestAnimationFrame(step);
    else { rbRaf = 0; rows.forEach(r => r.classList.add('on')); }
  })(t0);
}
window.__rr = runResult;   // debug hook: drive the result fill/scroll in isolation

function buildPunchCrowd() {
  const host = $('#punch-crowd'); if (!host) return;
  const rnd = i => { const x = Math.sin(i * 99.71) * 10000; return x - Math.floor(x); };  // deterministic scatter
  // 17 distinct young/varied faces that may repeat. The old MAN (crowd_1) is the
  // poem speaker → kept OUT of the crowd so he isn't duplicated; the old WOMAN
  // (crowd_7) appears just ONCE.
  const pool = ['crowd_2', 'crowd_3', 'crowd_4', 'crowd_5', 'crowd_6', 'crowd_8', 'crowd_9',
    'crowd_10', 'crowd_11', 'crowd_12', 'crowd_13', 'crowd_14', 'crowd_15', 'crowd_16',
    'crowd_17', 'crowd_18', 'speaker_cantonese_v2'];   // 17 (coprime with the step 3)
  const COLS = 7, N = 34;
  // pinned faces: old woman once (placed 9); the 2nd-row "girl in a dress" (placed 4)
  // is SWAPPED with the moustache man (normally placed 20) so he stands in row 2
  const fixed = { 9: 'crowd_7', 4: 'crowd_15', 20: 'crowd_16' };
  // keep the crowd OUT of the big lead figure's box (upper-left) so nobody cuts
  // into it; the top rows then only fill the RIGHT side, under the speech
  // bubble, where there's still room.
  const inLead = (x, y) => x < 50 && y < 47;
  let h = '', placed = 0, i = 0;
  while (placed < N && i < 90) {
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = 12 + col * 12.6 + (rnd(i) * 8 - 4);
    const y = 30 + row * 9.5 + (rnd(i + 99) * 7 - 3.5);   // start higher (under the bubble) and avoid the figure
    i++;
    if (inLead(x, y)) continue;                          // skip cells that overlap the lead figure
    const w = 112 + Math.round(rnd(i + 7) * 74);
    const src = fixed[placed] || pool[(placed * 3 + row) % pool.length];
    h += `<img class="cc" src="assets/cutouts/${src}.png" alt="" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${w}px;z-index:${Math.round(y)};--d:${(placed % 12) * 45}ms">`;
    placed++;
  }
  host.innerHTML = h;
}

function ensureGlobe() {
  if (globeCtrl) return;
  if (!(window.THREE && window.earcut && window.topojson)) { setTimeout(ensureGlobe, 80); return; }
  try {
    window.mountStacktagsGlobe($('#globe-host'), {
      focus: { lat: 23.0, lon: 112.5, cam: 2.4 },
      startCam: 3.6,
      highlight: 'China',
      marker: { lat: 22.3, lon: 114.17 },   // Hong Kong
      autoReveal: false,
      onReady: (c) => { globeCtrl = c; },
    });
  } catch (e) { console.error('globe', e); }
}

/* ============================================================
   CAMERA — drive the depth element from cues
   ============================================================ */
function goTo(i, mode, dur = 1150) {
  if (INSTANT) { depth._showFirst(i); depth.cur = i; return; }
  depth.transitionTo(i, mode, dur);
}
const addC = (id, c) => { const el = $('#' + id); if (el) el.classList.add(c); };

/* ============================================================
   HUD — syllable counter
   ============================================================ */
let sylShown = 1200, sylTween = 0;
function setSyl(v, dur) {
  const valEl = $('#syl-val');
  if (sylTween) { cancelAnimationFrame(sylTween); sylTween = 0; }
  if (INSTANT || !dur) { sylShown = v; valEl.textContent = Math.round(v); return; }
  const from = sylShown, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    sylShown = from + (v - from) * e;
    valEl.textContent = Math.round(sylShown);
    if (p < 1) sylTween = requestAnimationFrame(step); else { sylTween = 0; sylShown = v; }
  })(performance.now());
}
const sylSub = t => { $('#syl-sub').textContent = t; };
const sylCls = (c, on = true) => $('#syl').classList.toggle(c, on);

/* ============================================================
   TRIO — in-scene syllable count-down (1200 → 400), shown BELOW
   the struck p t k m. Replaces the old top HUD counter.
   ============================================================ */
let tcTween = 0;
function runTrioCount(instant) {
  const el = $('#tc-val'); if (!el) return;
  if (tcTween) { cancelAnimationFrame(tcTween); tcTween = 0; }
  if (instant) { el.textContent = '400'; return; }
  const from = 1200, to = 400, dur = 1100, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * e);
    if (p < 1) tcTween = requestAnimationFrame(step); else { tcTween = 0; el.textContent = '400'; }
  })(t0);
}
window.__tc = runTrioCount;   // debug hook: drive the trio count-down in isolation

/* ============================================================
   HUD — subtitles (mirror the spoken line, VERBATIM) + watermark
   ============================================================ */
let subTimer = 0;
function setSub(html) {
  const el = $('#subs-line');
  if (INSTANT) { el.innerHTML = html; el.classList.add('in'); return; }
  el.classList.remove('in');
  if (subTimer) clearTimeout(subTimer);
  subTimer = later(() => { el.innerHTML = html; el.classList.add('in'); }, 130);
}
const wm = on => $('#brand-wm').classList.toggle('show', on);
/* give the subtitle a white pill while it sits over the Hong Kong photo */
const subPhoto = on => $('#subs').classList.toggle('on-photo', on);

function revealEach(sel, n, stagger) {
  const els = $$(sel);
  for (let i = 0; i < n && i < els.length; i++) {
    if (INSTANT) els[i].classList.add('in');
    else later(() => els[i].classList.add('in'), i * stagger);
  }
}

/* ============================================================
   CUES — fired off the clock (seconds). Subtitles are the EXACT
   spoken words; the screen shows a device/figure, never the line.
   ============================================================ */
const CUES = [
  // ---------- HOOK (0–2.8) ----------
  { t: 0.10, fn: () => { setSub('Mandarin is a <b>broken</b> language —'); } },
  { t: 0.80, fn: () => { addC('hook-beat', 'break'); } },
  { t: 1.55, fn: () => { setSub('— and you can hear it in every <b>pop song</b>.'); } },

  // ---------- REWIND (timeline → temple + coins) → POET RISES ----------
  { t: 3.88, fn: () => { goTo(1, 'lift'); wm(true); setSub("It wasn't always this way."); if (tlEl) { if (INSTANT) tlEl.showEnd(); else tlEl.run({ duration: 2200 }); } } },
  { t: 5.41, fn: () => { setSub('Rewind to the <b>Tang dynasty</b> —'); } },
  { t: 7.00, fn: () => { addC('tang-beat', 'poet-in'); setSub("China's golden age of poetry."); } },
  { t: 9.10, fn: () => { setSub('Back then the language had roughly three to four times'); } },
  { t: 11.95, fn: () => { setSub('as many distinct syllables as Mandarin does now.'); } },

  // ---------- THE FOUR HARD ENDINGS (enumeration) ----------
  { t: 14.05, fn: () => { goTo(2, 'zoom-out'); if (enumEl) { enumEl.showTitle(); if (INSTANT) enumEl.revealUpTo(3); } setSub('And words ended in crisp, hard consonants —'); } },
  { t: 17.04, fn: () => { setSub('p, t, k, and m.'); if (enumEl) enumEl.revealUpTo(0); } },
  { t: 17.26, fn: () => { if (enumEl) enumEl.revealUpTo(1); } },
  { t: 17.53, fn: () => { if (enumEl) enumEl.revealUpTo(2); } },
  { t: 18.10, fn: () => { if (enumEl) enumEl.revealUpTo(3); } },
  { t: 18.55, fn: () => { if (enumEl) enumEl.spotlight(1); } },

  // ---------- MOON 月 ----------
  { t: 18.88, fn: () => { goTo(3, 'zoom-in'); setSub('Take the word for "moon," 月.'); } },
  { t: 20.99, fn: () => { setSub('In Tang Chinese, it sounded like this —'); } },
  { t: 23.20, fn: () => { addC('moon-beat', 'old-in'); } },
  { t: 23.45, fn: () => { setSub('"ngwat."'); } },
  { t: 24.10, fn: () => { addC('moon-beat', 'stop-in'); setSub('A hard stop, right on that -t.'); } },
  { t: 26.80, fn: () => { setSub('Now fast-forward to Mandarin.'); } },
  { t: 28.44, fn: () => { setSub('That same word?'); } },
  { t: 29.82, fn: () => { addC('moon-beat', 'morph'); setSub('"Yuè."'); } },
  { t: 30.90, fn: () => { setSub('The hard ending — gone.'); } },

  // ---------- THE COLLAPSE ----------
  { t: 32.45, fn: () => { goTo(4, 'pan-left'); setSub("And it isn't just this one word."); } },
  { t: 34.48, fn: () => { addC2('ten', 'show'); } },
  { t: 35.55, fn: () => { addC2('ten', 'morph'); setSub('Ten: "sap" became "shí".'); } },
  { t: 37.10, fn: () => { addC2('six', 'show'); } },
  { t: 37.95, fn: () => { addC2('six', 'morph'); setSub('Six: "luk" became "liù".'); } },
  { t: 40.20, fn: () => { addC2('heart', 'show'); } },
  { t: 40.95, fn: () => { addC2('heart', 'morph'); setSub('Heart: "sam" became "xīn".'); } },
  { t: 43.13, fn: () => { addC('trio-beat', 'ptkm-in'); setSub('Every one of those final consonants — p, t, k, m —'); } },
  { t: 44.67, fn: () => { $$('.pk')[0].classList.add('struck'); } },
  { t: 44.83, fn: () => { $$('.pk')[1].classList.add('struck'); } },
  { t: 45.15, fn: () => { $$('.pk')[2].classList.add('struck'); } },
  { t: 45.35, fn: () => { $$('.pk')[3].classList.add('struck'); } },
  { t: 45.65, fn: () => { setSub('vanished from Mandarin completely.'); addC('trio-beat', 'count-in'); runTrioCount(INSTANT); } },

  // ---------- THE RESULT — dots fill + scroll up → framed "400 syllables" box ----------
  { t: 49.25, fn: () => { goTo(5, 'lift'); runResult(INSTANT); sylCls('in', false); setSub('The result: a language of 1.4 billion people,'); } },
  { t: 52.90, fn: () => { addC('result-beat', 'box-in'); setSub('running on only about 400 syllables.'); } },

  // ---------- WHY YOU HEAR IT IN POP ----------
  { t: 54.61, fn: () => { goTo(6, 'zoom-in'); sylCls('in', false); setSub('And when you cram that many words into so few sounds,'); } },
  { t: 55.30, fn: () => { if (popEl) { if (INSTANT) popEl.showAll(); else popEl.popAll({ stagger: 215 }); } } },
  { t: 57.66, fn: () => { setSub('the rhyme pool collapses.'); } },
  { t: 59.56, fn: () => { setSub('Everything starts to sound the same.'); } },

  // ---------- LONG OPEN VOWELS — pop singer ----------
  { t: 60.50, fn: () => { ensureGlobe(); } },   // spin up the globe early for its scene
  { t: 61.60, fn: () => { goTo(7, 'pan-right'); addC('singer-beat', 'in'); setSub("That's why so much Mandarin pop leans on"); } },
  { t: 63.36, fn: () => { setSub('long, open vowels —'); } },
  { t: 64.54, fn: () => { $$('.vw')[0].classList.add('in'); } },
  { t: 64.93, fn: () => { $$('.vw')[1].classList.add('in'); } },
  { t: 65.52, fn: () => { $$('.vw')[2].classList.add('in'); setSub('ahh, eyy, ohh, wayy.'); } },
  { t: 66.08, fn: () => { $$('.vw')[3].classList.add('in'); } },
  { t: 66.95, fn: () => { setSub('There are no crisp endings left to snap a line shut.'); } },

  // ---------- THE SOUTHERN TIME CAPSULE ----------
  { t: 69.10, fn: () => { goTo(8, 'lift'); wm(false); setSub('But head south —'); } },
  { t: 69.30, fn: () => { if (globeCtrl) globeCtrl.reveal(); } },
  { t: 69.95, fn: () => {
      if (INSTANT) { addC('south-beat', 'photo-in'); return; }
      if (globeCtrl) globeCtrl.zoomToMarker({ cam: 1.02, duration: 1500 }, { onArrive: () => addC('south-beat', 'photo-in') });
      else addC('south-beat', 'photo-in');
      setSub('to Hong Kong and Guangdong —');
  }},
  { t: 71.47, fn: () => { addC('south-beat', 'photo-in'); subPhoto(true); setSub('and you hit the language that kept everything.'); } },
  { t: 74.55, fn: () => { addC('south-beat', 'keep-in'); setSub('Cantonese still has six tones,'); } },
  { t: 75.85, fn: () => { revealEach('.kp-let', 4, 200); setSub('and every one of those old endings — p, t, k, m — fully intact.'); } },
  { t: 78.40, fn: () => { revealEach('.kp-snap', 3, 240); } },

  // ---------- POEM 江雪 — two speakers ----------
  { t: 80.90, fn: () => { goTo(9, 'zoom-in'); subPhoto(false); addC('poem-beat', 'lines-in'); setSub('Which leads to something wild:'); if (globeCtrl && globeCtrl.stop) globeCtrl.stop(); } },
  { t: 83.40, fn: () => { setSub('thousand-year-old Tang poems,'); } },
  { t: 85.20, fn: () => { addC('lead-fig', 'in'); setSub('the ones that sound slightly off in Mandarin —'); } },
  { t: 87.25, fn: () => { addC('poem-beat', 'can-in'); setSub('still rhyme perfectly in Cantonese.'); } },
  { t: 89.34, fn: () => { setSub('The southern dialect is basically a time capsule'); } },
  { t: 92.24, fn: () => { setSub('of how this poetry was meant to sound.'); } },

  // ---------- PUNCHLINE / OUTRO — figure rises WITH the lift + crowd + shared bubble ----------
  { t: 94.70, fn: () => { setSub("So here's the irony."); } },
  // figure slides up IN SYNC with the background lift; the bubble slides+scales to its right
  { t: 95.30, fn: () => { goTo(10, 'lift', 1050); wm(true); addC('lead-fig', 'up'); setSub('Mandarin won — it became the voice of a nation.'); } },
  { t: 98.25, fn: () => { addC('punch-beat', 'crowd-in'); setSub('But while the language won, the sound was lost.'); } },
  { t: 101.20, fn: () => {
      goTo(11, 'zoom-out'); sylCls('in', false); wm(false);
      $('#lead-fig').classList.remove('in', 'up');
      if (outroEl) { outroEl.assemble(); if (INSTANT) outroEl.showAll(); }
      setSub('Wanna actually start learning Chinese?');
  }},
  { t: 103.81, fn: () => { setSub('Discover thousands of free exercises and<br>more learning content on <b>stacktags.io</b>.'); } },
];
CUES.sort((a, b) => a.t - b.t);
let fired = new Array(CUES.length).fill(false);

function addC2(k, c) { const r = $(`.trio-row[data-k="${k}"]`); if (r) r.classList.add(c); }

/* ============================================================
   SFX — the default elements' own sounds (swoosh / pop / ticking)
   re-pinned to THIS video's real CUE times. Headless web-audio can't
   be captured, so capture.js dumps window.SFX → mix_sfx.js lays the
   sounds over the narration at these timestamps.
   ============================================================ */
const SFX = [];
// every depth transition / scene change → swoosh (the punch lift @95.30 also
// covers the figure slide-up, so no separate swoosh there)
[3.88, 14.05, 18.88, 32.45, 49.25, 54.61, 61.60, 69.10, 80.90, 95.30].forEach(t => SFX.push([t, 'swoosh', 0.5]));
SFX.push([101.20, 'swoosh', 0.55]); // outro assemble (zoom-out)
SFX.push([69.95, 'swoosh', 0.58]);  // globe dive-in
SFX.push([7.00,  'swoosh', 0.45]);  // the poet rises
SFX.push([85.20, 'swoosh', 0.45]);  // Mandarin speaker slides in (poem)
SFX.push([87.25, 'swoosh', 0.45]);  // Cantonese (old man) slides in
SFX.push([98.25, 'swoosh', 0.5]);   // crowd spawns
// count-ups → ticking
SFX.push([3.95,  'ticking', 0.4]);  // timeline rewind ruler
SFX.push([45.65, 'ticking', 0.4]);  // syllable counter collapses 1200→400
// objects/words popping in → pop
[17.04, 17.26, 17.53, 18.40].forEach(t => SFX.push([t, 'pop', 0.45]));   // enumeration cards
for (let i = 0; i < 12; i++) SFX.push([55.30 + i * 0.215, 'pop', 0.42]); // homophone text-popup words
[64.54, 64.93, 65.52, 66.08].forEach(t => SFX.push([t, 'pop', 0.5]));    // long-vowel pills
SFX.sort((a, b) => a[0] - b[0]);
window.SFX = SFX;

const SND = { swoosh: 'assets/sound/swoosh.wav', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/ticking.wav' };
const firedSfx = new Set();
function playSfx(i) { try { const a = new Audio(SND[SFX[i][1]]); a.volume = SFX[i][2]; a.play().catch(() => {}); } catch (e) {} }

/* ============================================================
   ENGINE
   ============================================================ */
const audio = $('#vo');
let raf = 0, lastT = -1;
const DUR = 108.44;

let useWallClock = false, clockStart = null;
function nowT() {
  if (useWallClock) return clockStart == null ? 0 : (performance.now() - clockStart) / 1000;
  return audio.currentTime;
}

function tick() {
  const t = nowT();
  const paused = useWallClock ? false : audio.paused;
  if (!paused && t < lastT - 0.25) { applyUpTo(t); }
  else if (!paused) {
    for (let i = 0; i < CUES.length; i++) {
      if (!fired[i] && CUES[i].t <= t + 1e-3) { fired[i] = true; CUES[i].fn(); }
    }
    // live SFX for the browser preview only (capture is silent → muxed in later)
    if (!useWallClock) {
      for (let i = 0; i < SFX.length; i++) {
        if (!firedSfx.has(i) && SFX[i][0] <= t + 1e-3) { firedSfx.add(i); playSfx(i); }
      }
    }
  }
  lastT = t;
  $('#vprogress').style.width = (100 * Math.min(t, DUR) / DUR) + '%';
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
  for (let i = 0; i < SFX.length; i++) if (SFX[i][0] <= t + 1e-3) firedSfx.add(i);  // mark, don't play
  lastT = t;
}

function hardReset() {
  clearTimers();
  fired.fill(false);
  if (sylTween) { cancelAnimationFrame(sylTween); sylTween = 0; }

  depth.reset();
  depth._showFirst(0);

  $('#hook-beat') && ($('#hook-beat').className = 'hook-beat');
  $('#tang-beat') && ($('#tang-beat').className = 'tang-beat');
  $('#result-beat') && ($('#result-beat').className = 'result-beat'); resetResult();
  $('#singer-beat') && ($('#singer-beat').className = 'singer-beat');
  const mb = $('#moon-beat'); if (mb) mb.className = 'moon-beat';
  const tb = $('#trio-beat'); if (tb) tb.className = 'trio-beat';
  if (tcTween) { cancelAnimationFrame(tcTween); tcTween = 0; }
  const tcv = $('#tc-val'); if (tcv) tcv.textContent = '1200';
  const sb = $('#south-beat'); if (sb) sb.className = 'south-beat';
  const pb = $('#poem-beat'); if (pb) pb.className = 'poem-beat';
  const pu = $('#punch-beat'); if (pu) pu.className = 'punch-beat';
  $('#lead-fig') && $('#lead-fig').classList.remove('in', 'up');
  $$('.trio-row').forEach(r => r.classList.remove('show', 'morph'));
  $$('.pk').forEach(e => e.classList.remove('struck'));
  $$('.vw').forEach(e => e.classList.remove('in'));
  $$('.kp-let').forEach(e => e.classList.remove('in'));
  $$('.kp-snap').forEach(e => e.classList.remove('in'));

  sylShown = 1200; $('#syl-val').textContent = '1200'; sylSub('distinct syllables');
  $('#syl').className = 'syl';
  $('#subs-line').className = 'stk-subs-line'; $('#subs-line').innerHTML = '';
  $('#subs').classList.remove('on-photo');
  wm(false);

  if (enumEl) enumEl.reset();
  if (popEl) popEl.reset();
  if (outroEl) outroEl.reset();
  if (tlEl) tlEl.reset();
}

function play() {
  hardReset();
  lastT = -1; useWallClock = false;
  audio.currentTime = 0;
  audio.play();
  if (!raf) raf = requestAnimationFrame(tick);
}

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
  depth = new StacktagsDepthTransitionsOptimized('#depth-host', { steps: BEATS });
  depth.reset();
  depth._showFirst(0);
  mountAll();
  fit();

  $('#play').addEventListener('click', play);
  $('#restart').addEventListener('click', play);
  $('#cleanbtn').addEventListener('click', () => { document.body.classList.toggle('clean'); fit(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'c' || e.key === 'C') { document.body.classList.toggle('clean'); fit(); }
    if (e.key === ' ') { e.preventDefault(); audio.paused ? play() : audio.pause(); }
  });

  window.__seek = (t) => { audio.pause(); useWallClock = false; audio.currentTime = t; applyUpTo(t); };
  window.__play = play;
  window.__playForCapture = () => { hardReset(); useWallClock = true; clockStart = performance.now(); if (!raf) raf = requestAnimationFrame(tick); };
  window.__t = () => nowT();
  window.__END = DUR;
  raf = requestAnimationFrame(tick);
});
