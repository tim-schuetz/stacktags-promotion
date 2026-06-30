/* ============================================================
   "Why you can't order three beers in China" — choreography.
   Reuses the reference engine (persistent grid camera + faux-3D depth
   transitions + an audio.currentTime cue engine + verbatim subtitles +
   a declared SFX bed). ONE persistent equation — [ 三 ] [ slot ] [ 啤酒 ] —
   carries the whole story; the empty measure-word SLOT is the hero and is
   filled / emptied / multiplied (a scrolling wall) / re-filled per beat.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const cls = (el, name, on) => el && el.classList.toggle(name, !!on);

  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // ---- equation refs ----
  const eqRow = $('#eq-row'), numTile = $('#tile-num'), numFace = $('#num-face'), numPy = $('#num-py');
  const slotEl = $('#slot'), slotMwZh = slotEl.querySelector('.mw-zh'), slotMwPy = slotEl.querySelector('.mw-py');
  const nounTile = $('#tile-noun'), nounSwap = $('#noun-swap'), nlZh = nounTile.querySelector('.nl-zh'), nlPy = nounTile.querySelector('.nl-py');
  const eqLabel = $('#eq-label'), vocabPing = $('#vocab-ping'), stamp94El = $('#stamp94'), examEl = $('#exam');
  const attempts = $('#attempts');
  const wallInner = $('#wall-inner'), wallField = $('#wall-field'), wallKeys = $('#wall-keys'), wallNum = $('#wall-num');

  // a turquoise lock-in tick lives inside the row
  const lockOk = document.createElement('div'); lockOk.className = 'lock-ok'; lockOk.textContent = '✓'; eqRow.appendChild(lockOk);

  // outro endcard
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) {
    outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
    outroLogo.querySelectorAll('svg > g').forEach((g) => { if (!g.classList.contains('chev')) g.classList.add('lyr'); });
  }
  function outroAssemble() { $('#outro-ec').classList.add('play'); }
  function outroReset() { $('#outro-ec').classList.remove('play'); }

  // ============================================================
  // clean line icons (inline SVG, never OS emoji) — the KIND a key classifier counts
  // ============================================================
  const SVG = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const ICON = {
    book: SVG('<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>'),
    paw: SVG('<ellipse cx="12" cy="16" rx="5" ry="3.6" fill="currentColor" stroke="none"/><circle cx="6" cy="11" r="1.9" fill="currentColor" stroke="none"/><circle cx="10" cy="7.6" r="1.9" fill="currentColor" stroke="none"/><circle cx="14" cy="7.6" r="1.9" fill="currentColor" stroke="none"/><circle cx="18" cy="11" r="1.9" fill="currentColor" stroke="none"/>'),
    sheet: SVG('<rect x="5" y="3" width="14" height="18" rx="1.6"/><path d="M8 8h8M8 12h8M8 16h5" stroke-width="1.6"/>'),
    monitor: SVG('<rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M9 20h6M12 16v4"/>'),
    fish: SVG('<path d="M3 12c4-6 12-6 15 0-3 6-11 6-15 0z"/><path d="M18 12l3-3v6z"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/>'),
  };

  // ============================================================
  // the wall: a screen-full of 150+ classifiers + a key shelf of the most
  // important ones, each paired with the KIND of thing it counts.
  // ============================================================
  const FILLER = [
    ['瓶', 'píng'], ['辆', 'liàng'], ['件', 'jiàn'], ['杯', 'bēi'], ['把', 'bǎ'], ['双', 'shuāng'], ['支', 'zhī'], ['块', 'kuài'],
    ['颗', 'kē'], ['棵', 'kē'], ['头', 'tóu'], ['匹', 'pǐ'], ['间', 'jiān'], ['座', 'zuò'], ['封', 'fēng'], ['副', 'fù'],
    ['幅', 'fú'], ['门', 'mén'], ['节', 'jié'], ['粒', 'lì'], ['朵', 'duǒ'], ['片', 'piàn'], ['根', 'gēn'], ['串', 'chuàn'],
    ['群', 'qún'], ['排', 'pái'], ['套', 'tào'], ['位', 'wèi'], ['名', 'míng'], ['场', 'chǎng'], ['顿', 'dùn'], ['阵', 'zhèn'],
    ['层', 'céng'], ['道', 'dào'], ['项', 'xiàng'], ['份', 'fèn'], ['类', 'lèi'], ['种', 'zhǒng'], ['盏', 'zhǎn'], ['卷', 'juàn'],
  ];
  const KEYS = [
    { zh: '本', py: 'běn', gloss: 'books', ico: 'book' },
    { zh: '只', py: 'zhī', gloss: 'animals', ico: 'paw' },
    { zh: '张', py: 'zhāng', gloss: 'flat things', ico: 'sheet' },
    { zh: '台', py: 'tái', gloss: 'machines', ico: 'monitor' },
    { zh: '条', py: 'tiáo', gloss: 'long things', ico: 'fish' },
  ];
  function buildWall() {
    wallField.innerHTML = FILLER.map((m) => `<div class="wf-chip"><div class="z cjk">${m[0]}</div><div class="p">${m[1]}</div></div>`).join('');
    wallKeys.innerHTML = KEYS.map((m) =>
      `<div class="mw-tile"><div class="t-zh cjk">${m.zh}</div><div class="t-mid"><div class="t-py">${m.py}</div><div class="t-gloss">${m.gloss}</div></div><div class="t-ico">${ICON[m.ico]}</div></div>`
    ).join('');
  }
  buildWall();
  const keyTiles = () => Array.from(wallKeys.children);
  let wallCountRAF = 0;

  function wallScroll(on, instant) {
    if (instant) wallInner.style.transition = 'none';
    wallInner.classList.toggle('scrolled', on);
    if (instant) { void wallInner.offsetWidth; wallInner.style.transition = ''; }
  }
  function wallStart(instant) {
    cancelAnimationFrame(wallCountRAF);
    wallScroll(false, true);                 // always begin at the top
    keyTiles().forEach((t) => t.classList.remove('hot'));
    if (instant) { wallNum.textContent = '150'; return; }
    const t0 = performance.now(), dur = 1700;
    (function roll(now) {
      const e = Math.min(1, (now - t0) / dur);
      wallNum.textContent = Math.round(e * 150);
      if (e < 1) wallCountRAF = requestAnimationFrame(roll);
    })(performance.now());
  }
  function pulseKey(idx) { keyTiles().forEach((t, i) => cls(t, 'hot', i === idx)); }
  function wallResetState() { cancelAnimationFrame(wallCountRAF); wallNum.textContent = '0'; wallScroll(false, true); keyTiles().forEach((t) => t.classList.remove('hot')); }

  // ============================================================
  // equation state helpers (each leaves explicit, replay-safe state)
  // ============================================================
  const BEERS = '<div class="beers"><img src="assets/photos/beer_dash.png" alt=""><img src="assets/photos/beer_dash.png" alt=""><img src="assets/photos/beer_dash.png" alt=""></div>';
  const NOUNS = {
    beer: { zh: '啤酒', py: 'píjiǔ · beer', html: BEERS },
    dog: { zh: '狗', py: 'gǒu · dog', html: '<img class="noun-photo" src="assets/photos/dog_dash.png" alt="">' },
    book: { zh: '书', py: 'shū · book', html: '<img class="noun-photo" src="assets/photos/book_dash.png" alt="">' },
    apple: { zh: '苹果', py: 'píngguǒ · apple', html: '<img class="noun-photo" src="assets/photos/apple_dash.png" alt="">' },
  };
  let curNoun = '';
  function setNoun(kind) {
    if (kind === curNoun) return; curNoun = kind;
    const n = NOUNS[kind]; nounSwap.innerHTML = n.html; nlZh.textContent = n.zh; nlPy.textContent = n.py;
  }
  function setNum(face, py, cjk, instant) {
    const apply = () => { numFace.textContent = face; cls(numFace, 'cjk-num', cjk); numPy.textContent = py || ''; };
    if (instant) { numFace.classList.remove('swap'); apply(); return; }
    numFace.classList.add('swap');
    setTimeout(() => { apply(); numFace.classList.remove('swap'); }, 150);
  }
  function numHome() { numTile.classList.remove('lunge', 'recoil', 'free'); }
  function numLunge() { numTile.classList.remove('recoil', 'free'); numTile.classList.add('lunge'); }
  function numRecoil() { numTile.classList.remove('lunge', 'free'); numTile.classList.add('recoil'); }
  function numFree(on) { numTile.classList.remove('lunge', 'recoil'); cls(numTile, 'free', on); }

  function fillSlot(zh, py) { slotMwZh.textContent = zh; slotMwPy.textContent = py; slotEl.classList.remove('empty', 'gone'); slotEl.classList.add('filled'); }
  function emptySlot() { slotEl.classList.remove('filled', 'gone'); slotEl.classList.add('empty'); }
  function slotGone(on) { if (on) { slotEl.classList.remove('empty', 'filled'); slotEl.classList.add('gone'); } else { emptySlot(); } }
  function slotDemand() { slotEl.classList.remove('demand'); void slotEl.offsetWidth; slotEl.classList.add('demand'); setTimeout(() => slotEl.classList.remove('demand'), 720); }

  function nounDim(on) { cls(nounTile, 'dim', on); }
  function eqOk(on) { eqRow.classList.remove('half'); if (on === false) { eqRow.classList.remove('ok'); } else { eqRow.classList.add('ok'); } }
  function eqHalf() { eqRow.classList.remove('ok'); eqRow.classList.add('half'); }
  function eqClearMark() { eqRow.classList.remove('ok', 'half'); }
  function showLabel(on) { cls(eqLabel, 'in', on); }
  function pingVocab(on) { cls(vocabPing, 'in', on); }
  function showStamp94(on) { cls(stamp94El, 'in', on); }
  function showExam(on) { cls(examEl, 'in', on); }
  function showAttempts(on) { cls(attempts, 'in', on); if (!on) attempts.classList.remove('struck'); }
  function strikeAttempts() { attempts.classList.add('struck'); }

  // baseline equation: 三 [□] 啤酒, nothing extra
  function eqBase() {
    numHome(); setNum('三', 'sān', true, true); emptySlot(); setNoun('beer');
    nounDim(false); eqClearMark(); showLabel(false); pingVocab(false);
    showStamp94(false); showExam(false); showAttempts(false);
  }

  window.__ready = true;

  // ============================================================
  // GRID CAMERA (persistent, with gentle idle life)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  let jolt = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const idleS = 1 + Math.sin(t * 0.5) * 0.012, idleX = Math.sin(t * 0.33) * 9, idleY = Math.cos(t * 0.27) * 7;
    const cs = clamp(gdisp.s * idleS, 0.8, 1.6), cell = 120 * cs;
    const px = ((gdisp.x + idleX) % cell + cell) % cell;
    const py = ((gdisp.y + idleY + jolt) % cell + cell) % cell;
    grid.style.backgroundSize = cell + 'px ' + cell + 'px';
    grid.style.backgroundPosition = 'calc(50% + ' + px + 'px) calc(50% + ' + py + 'px)';
    jolt *= 0.82;
  }
  let pushTimer = 0;
  function gridPush() { gcam.s = 1.14; clearTimeout(pushTimer); pushTimer = setTimeout(() => { gcam.s = 1; }, 900); }

  // ============================================================
  // DEPTH SCENE TRANSITIONS (ported from the depth-transitions element)
  // ============================================================
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const SCENES = Array.from(document.querySelectorAll('.scene'));
  function setPose(elx, p) {
    elx.style.setProperty('--tx', (p.tx || 0) + 'px');
    elx.style.setProperty('--ty', (p.ty || 0) + 'px');
    elx.style.setProperty('--s', p.s != null ? p.s : 1);
    elx.style.opacity = p.op != null ? p.op : 1;
    elx.style.filter = p.blur ? `blur(${p.blur}px)` : 'none';
    if (p.z != null) elx.style.zIndex = p.z;
  }
  function POSES(mode, e) {
    switch (mode) {
      case 'zoom-out': return { from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 }, to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'lift': return null; // handled specially below
      case 'fade': return { from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in': default: return { from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 }, to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current; if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3; const t0 = performance.now(); setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur)), z = lerp(1, 1.3, e), dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: z, op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        gdisp.y = dy * 0.5;
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
        gcam.s = 1; current = toEl; if (onArrive) onArrive();
      })(performance.now());
      return;
    }
    const p0 = POSES(mode, 0);
    if (p0.grid != null) gcam.s = gs0 * p0.grid;
    setPose(toEl, Object.assign({ op: 0 }, p0.to));
    const t0 = performance.now();
    (function step(now) {
      const e = easeInOut(clamp01((now - t0) / dur)), ps = POSES(mode, e);
      if (fromEl) setPose(fromEl, ps.from); setPose(toEl, ps.to);
      if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
      if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1); current = toEl; if (onArrive) onArrive();
    })(performance.now());
  }
  function showInstant(elx) { SCENES.forEach((s) => { if (s !== elx) setPose(s, { op: 0, z: 0 }); }); setPose(elx, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); current = elx; }
  function enter(sel, mode, dur, instant, onArrive) { const elx = $(sel); if (instant) { showInstant(elx); if (onArrive) onArrive(); return; } depthGo(elx, mode, dur, onArrive); }

  // ============================================================
  // SUBTITLES (verbatim, grey; key words turquoise)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 120);
  }
  const SUBS = [
    [0.0, 'In China, you can’t order <b>“three beer.”</b>'],
    [2.28, 'And the reason has nothing to do with <b>alcohol</b> —'],
    [4.46, 'but with <b>grammar</b>.'],
    [5.64, 'In Chinese, you can’t put a number'],
    [6.90, 'straight onto a <b>noun</b>.'],
    [8.74, 'No “three beer,” no “two dog,” no “five book.”'],
    [12.08, 'Between the number and the thing,'],
    [13.44, 'you need a <b>measure word</b> — a classifier.'],
    [16.00, 'So “three beers” becomes, literally,'],
    [17.70, '“three bottles beer” — <b>三瓶啤酒</b>.'],
    [20.40, 'That little <b>瓶</b>, “bottle,” is the measure word.'],
    [23.26, 'Leave it out, and it’s <b>broken Chinese</b>.'],
    [25.22, 'And it goes deeper.'],
    [26.02, 'There are over <b>150</b> of these measure words —'],
    [29.10, 'and which one you use depends'],
    [30.46, 'on the <b>shape or type</b> of thing.'],
    [31.88, 'Flat things, long things, animals,'],
    [34.32, 'books, machines — almost everything has its own.'],
    [37.28, 'But here’s the <b>relief</b>.'],
    [38.36, 'One general measure word — <b>个</b> (gè) —'],
    [40.24, 'works for the huge majority of cases.'],
    [42.44, 'By some counts, around <b>94%</b> of the time.'],
    [45.20, 'So if you blank on the exact one,'],
    [46.76, '<b>个</b> will usually save you.'],
    [48.32, 'Not always perfect — but <b>understood</b>.'],
    [50.46, 'In English, “three” just works on <b>everything</b>.'],
    [53.00, 'In Chinese, you have to know <b>what kind</b> of thing'],
    [54.54, 'you’re counting before you can count it.'],
    [57.10, 'Which is why ordering three beers'],
    [58.42, 'is secretly a <b>grammar exam</b>.'],
    [60.38, 'Wanna actually start learning <b>Chinese</b>?'],
    [62.40, 'Discover thousands of free exercises'],
    [64.50, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — [t, (instant)=>{...}]  (each sets explicit, replay-safe state)
  // ============================================================
  const CUES = [
    // ---- HOOK ----
    [0.0, (i) => enter('#sc-eq', 'fade', 500, i, eqBase)],
    [1.06, () => numLunge()],                                       // "order three beer"
    [1.58, () => { numRecoil(); slotDemand(); }],
    [2.62, () => { numHome(); nounDim(true); }],                    // "nothing to do with alcohol" — bottles dim
    [4.46, () => { nounDim(false); slotDemand(); }],                // "but with grammar" — slot flares
    [5.40, () => { numHome(); gridPush(); }],

    // ---- THE RULE ----
    [5.64, () => { numHome(); emptySlot(); }],
    [7.94, () => { numRecoil(); slotDemand(); }],                   // "...onto a noun"
    [8.74, () => { numHome(); showAttempts(true); }],               // "no three beer / two dog / five book"
    [11.30, () => strikeAttempts()],
    [12.08, () => { showAttempts(false); numHome(); }],             // "between the number and the thing"
    [13.44, () => { showLabel(true); slotDemand(); }],              // "you need a measure word — a classifier"
    [18.20, (i) => { showLabel(false); fillSlot('瓶', 'píng'); eqOk(true); }],  // 三瓶啤酒 ✓ (瓶 drops on "bottles")
    [20.40, () => { pingVocab(true); }],                            // "that little 瓶, bottle, is the measure word"
    [23.26, (i) => { pingVocab(false); emptySlot(); nounDim(true); eqOk(false); }],  // "leave it out — broken Chinese"
    [25.22, (i) => { fillSlot('瓶', 'píng'); nounDim(false); eqOk(true); }],         // "and it goes deeper" — re-lock

    // ---- THE WALL (a scrolling screen-full of 150+) ----
    [26.02, (i) => enter('#sc-wall', 'zoom-out', 1050, i, () => wallStart(i))],      // "over 150 measure words"
    [27.30, (i) => wallScroll(true, i)],                            // scroll down through them
    [31.88, () => pulseKey(2)],   // flat → 张
    [32.76, () => pulseKey(4)],   // long → 条
    [33.50, () => pulseKey(1)],   // animals → 只
    [34.32, () => pulseKey(0)],   // books → 本
    [34.96, () => pulseKey(3)],   // machines → 台

    // ---- THE SHORTCUT (个) ----
    [37.28, (i) => enter('#sc-eq', 'zoom-in', 1050, i, () => { eqBase(); })],        // "but here's the relief"
    [39.40, (i) => { fillSlot('个', 'gè'); eqOk(true); }],          // "one general measure word 个"
    [42.44, (i) => { showStamp94(true); }],                         // "around 94% of the time"
    [45.20, (i) => { showStamp94(false); eqOk(true); setNoun('beer'); }],
    [45.55, () => setNoun('dog')],                                  // 个 saves you across many nouns (real photos)
    [46.30, () => setNoun('book')],
    [47.05, () => setNoun('apple')],
    [48.32, () => { eqHalf(); setNoun('beer'); }],                  // "not always perfect — but understood"

    // ---- PUNCHLINE ----
    [50.46, (i) => { eqClearMark(); slotGone(true); setNum('3', '', false, i); numFree(true); setNoun('beer'); }], // "in English three just works on everything" — digit 3, no slot
    [51.26, () => setNoun('dog')],
    [51.96, () => setNoun('book')],
    [53.00, (i) => { numFree(false); slotGone(false); setNoun('beer'); setNum('三', 'sān', true, i); slotDemand(); }], // "in Chinese — you must know what kind"
    [57.10, (i) => { fillSlot('瓶', 'píng'); eqOk(true); }],        // "ordering three beers"
    [59.00, (i) => { showExam(true); }],                            // "secretly a grammar exam"

    // ---- OUTRO ----
    [60.38, (i) => { enter('#sc-outro', 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh only when the grid moves / a scene transition plays;
  // pop for tile & word pop-ins; tick for the 150 count. [t, name, vol]
  // ============================================================
  const SFX = [
    [1.58, 'pop', 0.42],                     // recoil off the slot
    [4.46, 'pop', 0.42],                     // grammar flare
    [5.40, 'swoosh', 0.4],                   // grid push to settle
    [8.90, 'pop', 0.45], [10.08, 'pop', 0.4], [11.12, 'pop', 0.4],  // attempts cascade
    [18.20, 'pop', 0.55],                    // 瓶 drops into the slot
    [20.40, 'pop', 0.45],                    // 瓶 vocab pops
    [23.26, 'pop', 0.34],                    // 瓶 pulled back out
    [26.02, 'swoosh', 0.5],                  // zoom-out to the wall (grid moves)
    [26.3, 'tick', 0.32], [26.7, 'tick', 0.32], [27.1, 'tick', 0.3],
    [27.30, 'swoosh', 0.34],                 // the downward scroll
    [37.28, 'swoosh', 0.5],                  // zoom back in (grid moves)
    [39.40, 'pop', 0.5],                     // 个 drops in
    [42.44, 'pop', 0.5],                     // 94% stamp
    [45.55, 'pop', 0.34], [46.30, 'pop', 0.34], [47.05, 'pop', 0.34], // noun sweep
    [53.00, 'pop', 0.5],                     // slot slams back
    [59.00, 'pop', 0.5],                     // grammar-exam stamp
    [60.38, 'swoosh', 0.55],                 // outro lift (grid moves)
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', tick: 'assets/sound/tick.wav' };
  function playSfx(entry) { try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {} }

  // ============================================================
  // CUE ENGINE
  // ============================================================
  const firedScene = new Set(), firedSub = new Set(), firedSfx = new Set();
  let lastT = 0;
  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    SCENES.forEach((elx) => setPose(elx, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null; gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0; jolt = 0;
    clearTimeout(pushTimer);
    eqBase(); wallResetState(); outroReset(); subsLine.classList.remove('in');
  }
  function applyUpTo(t) {
    hardReset();
    SUBS.forEach((s, k) => { if (s[0] <= t) { firedSub.add(k); setSub(s[1], true); } });
    CUES.forEach((c, k) => { if (c[0] <= t) { firedScene.add(k); c[1](true); } });
    SFX.forEach((s, k) => { if (s[0] <= t) firedSfx.add(k); });
  }
  function tick() {
    requestAnimationFrame(tick);
    const t = vo.currentTime || 0;
    gdisp.s += (gcam.s - gdisp.s) * 0.07; gdisp.x += (gcam.x - gdisp.x) * 0.07; gdisp.y += (gcam.y - gdisp.y) * 0.07;
    applyGrid();
    if (!vo.paused) {
      if (t < lastT - 0.3) applyUpTo(t);
      for (let k = 0; k < SUBS.length; k++) if (!firedSub.has(k) && t >= SUBS[k][0]) { firedSub.add(k); setSub(SUBS[k][1], false); }
      for (let k = 0; k < CUES.length; k++) if (!firedScene.has(k) && t >= CUES[k][0]) { firedScene.add(k); CUES[k][1](false); }
      for (let k = 0; k < SFX.length; k++) if (!firedSfx.has(k) && t >= SFX[k][0]) { firedSfx.add(k); playSfx(SFX[k]); }
    }
    lastT = t;
    const seek = $('#seek'), tcode = $('#tcode');
    if (seek && document.activeElement !== seek) seek.value = t;
    if (tcode) tcode.textContent = t.toFixed(1);
  }
  requestAnimationFrame(tick);

  // ============================================================
  // PLAYBACK CONTROL
  // ============================================================
  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });

  hardReset();
})();
