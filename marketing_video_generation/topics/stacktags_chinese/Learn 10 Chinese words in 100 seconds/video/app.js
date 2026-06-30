/* ============================================================
   Stacktags — "Learn 10 Chinese words in 100 seconds"
   New depth-transition style. The whole video is a single
   StacktagsDepthTransitionsOptimized flow (dynamic grid + faux-3D
   camera). An audio-currentTime cue engine drives every camera move,
   subtitle line and HanziWriter morph onto the spoken beat.
   White + turquoise (#35A292), Inter (CJK uses a sans face).
   ============================================================ */
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const TEAL = '#35A292';            // brand turquoise (designguide)

/* ---- the 10 characters ---- */
const WORDS = [
  { n:1,  char:'人', py:'rén',  mean:'person',   photo:'person' },
  { n:2,  char:'火', py:'huǒ',  mean:'fire',     photo:'fire' },
  { n:3,  char:'水', py:'shuǐ', mean:'water',    photo:'water' },
  { n:4,  char:'山', py:'shān', mean:'mountain', photo:'mountain' },
  { n:5,  char:'木', py:'mù',   mean:'tree',     photo:'tree' },
  { n:6,  char:'日', py:'rì',   mean:'sun',      photo:'sun' },
  { n:7,  char:'月', py:'yuè',  mean:'moon',     photo:'moon' },
  { n:8,  char:'口', py:'kǒu',  mean:'mouth',    photo:'mouth' },
  { n:9,  char:'雨', py:'yǔ',   mean:'rain',     photo:'rain' },
  { n:10, char:'田', py:'tián', mean:'field',    photo:'field' },
];

/* ---- twist: pictures stack into new words — shown as ONE accumulating
   vertical list (each new equation appears below; earlier ones stay) ---- */
const TWIST_ROWS = [
  { a:'木', apy:'mù',   b:'木', bpy:'mù',  res:'林', rpy:'lín',  label:'wood' },
  { a:'林', apy:'lín',  b:'木', bpy:'mù',  res:'森', rpy:'sēn',  label:'forest' },
  { a:'日', apy:'rì',   b:'月', bpy:'yuè', res:'明', rpy:'míng', label:'bright' },
  { a:'人', apy:'rén',  b:'木', bpy:'mù',  res:'休', rpy:'xiū',  label:'rest' },
  { a:'田', apy:'tián', b:'力', bpy:'lì',  res:'男', rpy:'nán',  label:'man' },
];
// when each row is revealed (word-aligned to the spliced narration, ≈146.8s)
const TWIST_ROW_T = [103.98, 107.62, 111.00, 117.72, 123.28];

/* visually busy REAL characters for the "impossible wall" — every one has local
   stroke data (elements/wall-data.js), so they are DRAWN stroke-by-stroke in the
   exact same turquoise style as the hero 人 (not flat font glyphs). */
const WALL_CHARS = ['鬱','矗','靈','鷹','鑫','觀','廳','灣','鑰','釁','鑲','響','體','顯','變','戀','驚','鱗','鬢','讓'];

/* ============================================================
   CONTENT BUILDERS (beat HTML)
   ============================================================ */
const pad2 = n => ('0' + n).slice(-2);

function cardHtml(w) {
  return `<div class="card">
    <div class="morph">
      <img class="morph-photo" src="assets/photos/${w.photo}.png" alt="${w.mean}">
      <div class="morph-hanzi"></div>
    </div>
    <div class="card-py">${w.py}</div>
    <div class="card-mean">${w.mean}</div>
  </div>`;
}

// Opening "impossible scribbles": complex characters spawn at RANDOM spots all over
// the screen (incl. the centre), each flashing in BIG + SHARP then scaling DOWN and
// blurring into the background. The hero 人 spawns centred by the same pop, but stays
// big + sharp (no shrink, no blur). Deterministic PRNG so QA and the render match.
let _seed = 20260620;
const rnd = () => { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; };
// JITTERED GRID so the big chars cover the screen EVENLY (one per cell + random
// jitter) — avoids the clustering/empty-corners of pure-random placement. The
// appearance order is still randomized below (so it's not row-by-row).
const COLS = 4, ROWS = 5, FX = 470, FY = 630;
const SCRIBBLE_COUNT = COLS * ROWS;          // 20 big chars (≈ as big as 人)
const POP_CHARS = Array.from({ length: SCRIBBLE_COUNT }, (_, i) => {
  const col = i % COLS, row = Math.floor(i / COLS);
  const cw = (2 * FX) / COLS, ch = (2 * FY) / ROWS;
  return {
    text: WALL_CHARS[i % WALL_CHARS.length],
    x: Math.round(-FX + cw * (col + 0.5) + (rnd() * 2 - 1) * cw * 0.32),
    y: Math.round(-FY + ch * (row + 0.5) + (rnd() * 2 - 1) * ch * 0.32),
    size: 190 + Math.floor(rnd() * 100),     // 190–290px (the hero 人 is 420)
  };
});
// randomized spawn order (Fisher–Yates) so they appear scattered, not top-to-bottom
const POP_ORDER = POP_CHARS.map((_, i) => i);
for (let i = POP_ORDER.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [POP_ORDER[i], POP_ORDER[j]] = [POP_ORDER[j], POP_ORDER[i]]; }
const HALF = Math.floor(SCRIBBLE_COUNT / 2);

function comboStackHtml() {
  const tok = (ch, py, cls) =>
    `<span class="ct ${cls || ''}"><span class="cglyph cjk">${ch}</span><span class="cpy">${py}</span></span>`;
  return `<div class="twiststack">` + TWIST_ROWS.map(r =>
    `<div class="crow">
       ${tok(r.a, r.apy)}<span class="cop">+</span>${tok(r.b, r.bpy)}<span class="cop">=</span>${tok(r.res, r.rpy, 'cres')}<span class="clbl">${r.label}</span>
     </div>`).join('') + `</div>`;
}

function recapHtml() {
  return `<div class="recap">
    <div class="recap-head">You just read <b>10 characters</b>.</div>
    <div class="recap-grid">` + WORDS.map(w => `<div class="recap-cell cjk">${w.char}</div>`).join('') + `</div>
  </div>`;
}


/* ============================================================
   THE BEAT LIST  (t = when it becomes active; via = camera move)
   Camera moves alternate so no two consecutive moves are the same.
   ============================================================ */
const BEAT = [
  { t:0,     kind:'text',  via:null,       text:`In the next <b>100 seconds</b><br>you'll learn 10 characters` },
  // "without memorizing" RISES IN FROM THE BOTTOM (liftb = mirror of lift)
  { t:3.08,  kind:'text',  via:'liftb',    text:`…without <b>memorizing</b><br>a single one.` },
  // "impossible / random scribbles" → complex chars are DRAWN all over then recede
  // into the background; the hero 人 draws, recedes WITH them, then surges back out.
  { t:5.46,  kind:'popup', via:'zoom-out', html:`<div class="popfield"></div>` },
  { t:19.42, kind:'word', wi:0, via:'zoom-in' },
  { t:27.52, kind:'word', wi:1, via:'pan-right' },
  { t:34.64, kind:'word', wi:2, via:'lift' },
  { t:42.08, kind:'word', wi:3, via:'zoom-in' },
  { t:49.18, kind:'word', wi:4, via:'pan-left' },
  { t:55.88, kind:'word', wi:5, via:'zoom-out' },
  { t:67.80, kind:'word', wi:6, via:'zoom-in' },
  { t:74.08, kind:'word', wi:7, via:'pan-right' },
  { t:81.56, kind:'word', wi:8, via:'lift' },
  { t:92.20, kind:'word', wi:9, via:'zoom-in' },
  { t:99.56, kind:'text', via:'zoom-out', text:`Stack the pictures —<br>they <b>build new words</b>.` },
  // ONE beat: the equations stack up one below another (earlier ones stay)
  { t:103.98, kind:'combostack', via:'zoom-in', html:comboStackHtml() },
  { t:130.80, kind:'recap', via:'zoom-out', html:recapHtml() },
];
// fill word html now that builders exist
BEAT.forEach(b => {
  if (b.kind === 'word') b.html = cardHtml(WORDS[b.wi]);
});
const toStep = b => (b.text !== undefined ? { text: b.text } : { html: b.html });
const COMBO_BEAT = BEAT.findIndex(b => b.kind === 'combostack');

/* ============================================================
   SUBTITLES — mirror the narration, one line at a time (lines 0–40;
   the closing CTAs are carried by the outro card itself).
   ============================================================ */
const SUBS = [
  { t:0,      html:`In the next 100 seconds, you'll learn <b>10 Chinese characters</b>` },
  { t:3.08,   html:`…without <b>memorizing</b> a single one.` },
  { t:5.46,   html:`Most people think Chinese is <b>impossible</b>:` },
  { t:7.76,   html:`thousands that look like <b>random scribbles</b>.` },
  { t:12.88,  html:`They're tiny <b>drawings</b> of what they mean.` },
  { t:15.04,  html:`See it once, and you <b>can't unsee it</b>. Watch.` },
  { t:17.92,  html:`Start with <b>you</b>.` },
  { t:19.42,  html:`<b>rén</b> — "person."` },
  { t:21.60,  html:`A body and two legs, mid-stride. One human, <b>two strokes</b>.` },
  { t:25.76,  html:`Give them a <b>fire</b> to gather around.` },
  { t:27.52,  html:`<b>huǒ</b> — "fire."` },
  { t:30.40,  html:`A flame in the middle, two sparks off the sides. A <b>campfire</b>.` },
  { t:34.64,  html:`<b>shuǐ</b> — "water."` },
  { t:36.94,  html:`A stream down the middle, droplets each side. A <b>river</b>.` },
  { t:42.08,  html:`<b>shān</b> — "mountain."` },
  { t:44.54,  html:`Three peaks — one tall, two short. The mountain a <b>kid would draw</b>.` },
  { t:49.18,  html:`<b>mù</b> — "tree" or "wood."` },
  { t:52.94,  html:`Trunk, branches up, roots down. A <b>whole tree</b>.` },
  { t:55.88,  html:`<b>rì</b> — "sun," and also "day."` },
  { t:60.40,  html:`A circle with a dot, squared off. So it also means <b>"day."</b>` },
  { t:67.80,  html:`<b>yuè</b> — "moon," and also "month."` },
  { t:72.16,  html:`A crescent on its side.` },
  { t:74.08,  html:`<b>kǒu</b> — "mouth."` },
  { t:77.02,  html:`An open mouth — a square opening. The hole you <b>eat and talk</b> with.` },
  { t:81.56,  html:`<b>yǔ</b> — "rain."` },
  { t:85.14,  html:`Sky, a cloud, four <b>raindrops</b> falling inside.` },
  { t:89.68,  html:`And it has to <b>land somewhere</b>.` },
  { t:92.20,  html:`<b>tián</b> — "field."` },
  { t:94.24,  html:`Farmland from above, split into four plots. A <b>rice field</b>.` },
  { t:99.56,  html:`Stack the pictures and they <b>build new words</b>.` },
  { t:103.98, html:`Two trees…` },
  { t:105.06, html:`木 + 木 makes <b>林</b>, a wood. A third makes <b>森</b>, a dense forest.` },
  { t:111.00, html:`Sun plus moon…` },
  { t:112.60, html:`日 + 月 makes <b>明</b>, "bright."` },
  { t:117.72, html:`A person by a tree…` },
  { t:119.20, html:`人 + 木 makes <b>休</b>, "rest."` },
  { t:123.28, html:`力 means <b>"strength."</b>` },
  { t:125.16, html:`Strength in a field — 田 + 力 — makes <b>男</b>, "man."` },
  { t:130.80, html:`Chinese isn't random symbols — it's a small set of <b>pictures</b>.` },
  { t:136.96, html:`You just read <b>10 characters</b> — no memorizing.` },
  { t:139.74, html:`Wanna actually <b>start learning Chinese?</b>` },
  { t:141.40, html:`Discover thousands of free exercises on <b>stacktags.io</b>.` },
];

/* ============================================================
   STATE
   ============================================================ */
let depth = null, outro = null;
let writers = {};          // beatIndex -> HanziWriter
let timers = [];
let INSTANT = false;       // when seeking: render end-state with no delays
let subTimer = 0;
const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

/* ============================================================
   BEAT ENTER — content animation per beat (camera move is separate)
   ============================================================ */
function goBeat(i, via) {
  if (via == null) depth._showFirst(i);
  else depth.transitionTo(i, via, 1150);
  onBeatEnter(i);
}

function onBeatEnter(i) {
  const b = BEAT[i];
  const layer = depth.layers[i];
  if (b.kind === 'word') {
    // CHARACTER FIRST; then the photo reveals; the character LINGERS ~1s, then fades
    const morph = layer.querySelector('.morph');
    const wr = writers[i];
    if (INSTANT) {
      morph.classList.add('revealed', 'faded');        // end-state = the photo
      try { wr.hideCharacter({ duration: 0 }); } catch {}
    } else {
      morph.classList.remove('revealed', 'faded');
      try { wr.hideCharacter({ duration: 0 }); } catch {}
      later(() => { try { wr.animateCharacter(); } catch {} }, 800);   // draw the character
      later(() => morph.classList.add('revealed'), 2800);             // photo appears (character stays)
      later(() => morph.classList.add('faded'), 3800);                // character fades 1s later
    }
  } else if (b.kind === 'popup') {
    // complex chars DRAW on then recede (first wave now, rest @7.76); the hero 人
    // draws @12.9, recedes @15.0, surges back out @17.1 (see the CUES below).
    if (INSTANT) popFieldShowAll();
    else popScribbles(0, HALF - 1, 240);
  } else if (b.kind === 'combostack') {
    // equations stack up; row 0 now, the rest on their own cues (kept visible)
    if (INSTANT) $$('.crow', layer).forEach(r => r.classList.add('in'));
    else revealTwistRow(0);
  } else if (b.kind === 'recap') {
    const cells = $$('.recap-cell', layer);
    if (INSTANT) cells.forEach(c => c.classList.add('in'));
    else cells.forEach((c, k) => later(() => c.classList.add('in'), 500 + k * 80));
  }
}

function revealTwistRow(k) {
  const rows = $$('.crow', depth.layers[COMBO_BEAT]);
  if (rows[k]) rows[k].classList.add('in');
}

/* ---- opening pop-field (custom): a wall of complex characters, each DRAWN
   stroke-by-stroke in the SAME turquoise style as the hero 人, then receding
   (shrink + blur + dim) into the background. The hero 人 draws, recedes WITH
   the wall, then surges back out to the front. All via HanziWriter. ---- */
const HW_OPTS = {
  charDataLoader: (c, done) => done(window.HANZI_DATA[c]),
  strokeColor: TEAL, drawingColor: TEAL, outlineColor: '#cfe6dd',
  showOutline: true, showCharacter: false,
};
let pfEls = [], pfWriters = [], pfHero = null, pfHeroWriter = null;
function buildPopField(host) {
  pfEls = []; pfWriters = [];
  POP_CHARS.forEach((c) => {
    const el = document.createElement('div');
    el.className = 'pf-host';
    el.style.setProperty('--x', c.x + 'px');
    el.style.setProperty('--y', c.y + 'px');
    el.style.width = c.size + 'px';
    el.style.height = c.size + 'px';
    host.appendChild(el);
    pfEls.push(el);
    pfWriters.push(HanziWriter.create(el, c.text, Object.assign({
      width: c.size, height: c.size, padding: 2,
      strokeAnimationSpeed: 3, delayBetweenStrokes: 8,
    }, HW_OPTS)));
  });
  pfHero = document.createElement('div');
  pfHero.className = 'pf-host pf-hero';
  pfHero.style.setProperty('--x', '0px');
  pfHero.style.setProperty('--y', '0px');
  pfHero.style.width = '420px';
  pfHero.style.height = '420px';
  host.appendChild(pfHero);
  pfHeroWriter = HanziWriter.create(pfHero, '人', Object.assign({
    width: 420, height: 420, padding: 4,
    strokeAnimationSpeed: 1.15, delayBetweenStrokes: 110,
  }, HW_OPTS));
}
// draw POP_ORDER[a..b] (randomized order); each char is revealed + drawn, then
// recedes into the background the moment its strokes finish.
function popScribbles(a, b, stagger) {
  for (let k = a; k <= b; k++) {
    const idx = POP_ORDER[k];
    later(() => {
      const el = pfEls[idx], w = pfWriters[idx];
      if (!el) return;
      el.classList.add('draw');
      try { w.animateCharacter({ onComplete: () => later(() => el.classList.add('recede'), 200) }); }
      catch { el.classList.add('recede'); }
    }, (k - a) * stagger);
  }
}
function popHeroDraw()   { if (!pfHero) return; pfHero.classList.remove('recede', 'front'); pfHero.classList.add('draw'); try { pfHeroWriter.animateCharacter(); } catch {} }
function popHeroRecede() { if (pfHero) pfHero.classList.add('recede'); }
function popHeroFront()  { if (pfHero) { pfHero.classList.remove('recede'); pfHero.classList.add('front'); } }
function popFieldShowAll() {
  pfEls.forEach((el, i) => { el.classList.add('draw', 'recede'); try { pfWriters[i].showCharacter({ duration: 0 }); } catch {} });
  if (pfHero) { pfHero.classList.remove('recede'); pfHero.classList.add('draw', 'front'); try { pfHeroWriter.showCharacter({ duration: 0 }); } catch {} }
}
function popFieldReset() {
  pfEls.forEach((el, i) => { el.classList.remove('draw', 'recede'); try { pfWriters[i].hideCharacter({ duration: 0 }); } catch {} });
  if (pfHero) { pfHero.classList.remove('draw', 'recede', 'front'); try { pfHeroWriter.hideCharacter({ duration: 0 }); } catch {} }
}

/* ---- subtitles ---- */
function setSub(html) {
  const el = $('#subline');
  if (INSTANT) { el.innerHTML = html || ''; el.classList.toggle('in', !!html); return; }
  clearTimeout(subTimer);
  el.classList.remove('in');
  if (!html) return;
  subTimer = setTimeout(() => { el.innerHTML = html; el.classList.add('in'); }, 140);
  timers.push(subTimer);
}

/* ---- outro ---- */
function showOutro() {
  $('#depth-host').style.opacity = '0';
  $('#outro-layer').classList.add('in');   // grid shows through; subtitles keep running
  outro.assemble();
}

/* ============================================================
   CUES — derived from BEAT + SUBS + a few specials
   ============================================================ */
const CUES = [];
BEAT.forEach((b, i) => CUES.push({ t: b.t, kind: 'beat', i, via: b.via }));
SUBS.forEach(s => CUES.push({ t: s.t, kind: 'sub', html: s.html }));
CUES.push({ t: 7.76,  kind: 'fn', fn: () => popScribbles(HALF, SCRIBBLE_COUNT - 1, 240) });  // wall floods on "random scribbles"
CUES.push({ t: 12.88, kind: 'fn', fn: popHeroDraw });    // 人 draws ("tiny drawings of what they mean")
CUES.push({ t: 15.04, kind: 'fn', fn: popHeroRecede });  // 人 recedes into the wall ("see it once…")
CUES.push({ t: 17.28, kind: 'fn', fn: popHeroFront });   // 人 surges back out ("Watch.")
// the twist equations stack up one below another (row 0 fires with the beat @101.2)
TWIST_ROW_T.slice(1).forEach((t, k) => CUES.push({ t, kind: 'fn', fn: () => revealTwistRow(k + 1) }));
CUES.push({ t: 139.74, kind: 'fn', fn: showOutro });   // logo → wordmark → url assemble (staggered)
CUES.sort((a, b) => a.t - b.t);     // stable: beats keep priority over subs at equal t
let fired = new Array(CUES.length).fill(false);

function runCue(c) {
  if (c.kind === 'beat') goBeat(c.i, c.via);
  else if (c.kind === 'sub') setSub(c.html);
  else if (c.kind === 'fn') c.fn();
}

/* ============================================================
   ENGINE
   ============================================================ */
const audio = $('#vo');
let raf = 0, lastT = -1;
let useClock = false, t0 = 0;   // capture mode: drive the timeline off the wall clock

function tick() {
  const t = useClock ? (performance.now() - t0) / 1000 : audio.currentTime;
  if (useClock || !audio.paused) {
    if (!useClock && t < lastT - 0.25) applyUpTo(t);   // seek-back → rebuild (audio mode only)
    else for (let i = 0; i < CUES.length; i++) {
      if (!fired[i] && CUES[i].t <= t + 1e-3) { fired[i] = true; runCue(CUES[i]); }
    }
    lastT = t;
  }
  $('#vprogress').style.width = (100 * t / (audio.duration || 146.77)) + '%';
  $('#info').textContent = t.toFixed(1) + 's';
  raf = requestAnimationFrame(tick);
}

/* render the exact end-state at time `t` with no animations (for seeking) */
function applyUpTo(t) {
  hardReset();
  INSTANT = true;
  let bi = 0;
  for (let i = 0; i < BEAT.length; i++) if (BEAT[i].t <= t + 1e-3) bi = i;
  depth.seekTo(bi);
  onBeatEnter(bi);
  let sub = '';
  SUBS.forEach(s => { if (s.t <= t + 1e-3) sub = s.html; });
  setSub(sub);
  if (t >= 139.74) showOutro();
  INSTANT = false;
  fired = CUES.map(c => c.t <= t + 1e-3);
  lastT = t;
}

function clearTimers() { timers.forEach(clearTimeout); timers = []; }

function hardReset() {
  clearTimers();
  fired.fill(false);
  depth.reset();
  $('#depth-host').style.opacity = '';
  // word morphs
  BEAT.forEach((b, i) => {
    if (b.kind === 'word') {
      const m = depth.layers[i].querySelector('.morph');
      if (m) m.classList.remove('revealed', 'faded');
      try { writers[i].hideCharacter({ duration: 0 }); } catch {}
    }
    if (b.kind === 'combostack') $$('.crow', depth.layers[i]).forEach(e => e.classList.remove('in'));
    if (b.kind === 'recap') $$('.recap-cell', depth.layers[i]).forEach(c => c.classList.remove('in'));
  });
  popFieldReset();
  // outro
  $('#outro-layer').classList.remove('in');
  if (outro) outro.reset();
  setSub('');
}

function play() {
  hardReset();
  lastT = -1;
  useClock = false;
  audio.currentTime = 0;
  // show the first beat immediately so there is no blank flash
  fired[CUES.findIndex(c => c.kind === 'beat' && c.i === 0)] = true;
  goBeat(0, null);
  audio.play();
  if (!raf) raf = requestAnimationFrame(tick);
}

/* Headless render: drive the timeline off the WALL CLOCK (performance.now),
   not audio.currentTime — under --disable-gpu a heavy frame can stall media
   playback and freeze audio.currentTime, desyncing/halting the capture.
   The narration is muxed back in afterwards (mux.js), so it stays in sync. */
function playForCapture() {
  hardReset();
  lastT = -1;
  useClock = true;
  t0 = performance.now();
  fired[CUES.findIndex(c => c.kind === 'beat' && c.i === 0)] = true;
  goBeat(0, null);
  if (!raf) raf = requestAnimationFrame(tick);
}

/* ============================================================
   FIT + INIT
   ============================================================ */
function fit() {
  const stage = $('#stage');
  const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
  stage.style.transform = `scale(${s})`;
}
window.addEventListener('resize', fit);

window.addEventListener('DOMContentLoaded', () => {
  // build the depth flow with all beats
  depth = new StacktagsDepthTransitionsOptimized('#depth-host', { steps: BEAT.map(toStep) });

  // HanziWriter per word beat (local data, teal strokes, faint outline)
  BEAT.forEach((b, i) => {
    if (b.kind !== 'word') return;
    const host = depth.layers[i].querySelector('.morph-hanzi');
    writers[i] = HanziWriter.create(host, WORDS[b.wi].char, {
      charDataLoader: (c, done) => done(window.HANZI_DATA[c]),
      width: 460, height: 460, padding: 6,
      strokeColor: TEAL, drawingColor: TEAL, outlineColor: '#cfe6dd',
      showOutline: true, showCharacter: false,
      strokeAnimationSpeed: 1.15, delayBetweenStrokes: 110,
    });
  });

  // the "impossible scribbles → 人 spawns" opening pop-field (custom)
  const popBeat = BEAT.findIndex(b => b.kind === 'popup');
  buildPopField(depth.layers[popBeat].querySelector('.popfield'));

  // closing brand card (updated default: stack + chevrons + wordmark + stacktags.io)
  outro = new StacktagsOutro($('#outro-host'));

  fit();
  depth._showFirst(0);
  setSub(SUBS[0].html);

  $('#play').addEventListener('click', play);
  $('#restart').addEventListener('click', play);
  $('#cleanbtn').addEventListener('click', () => { document.body.classList.toggle('clean'); fit(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'c' || e.key === 'C') { document.body.classList.toggle('clean'); fit(); }
    if (e.key === ' ') { e.preventDefault(); audio.paused ? play() : audio.pause(); }
  });

  // expose for headless screenshotting / frame export
  window.__seek = (t) => { audio.pause(); audio.currentTime = t; applyUpTo(t); };
  window.__play = play;
  window.__playForCapture = playForCapture;                       // wall-clock timeline (render)
  window.__t = () => useClock ? (performance.now() - t0) / 1000 : audio.currentTime;
  // keep the rAF alive even when paused so seeks render
  raf = requestAnimationFrame(tick);
});
