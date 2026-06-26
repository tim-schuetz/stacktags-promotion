/* ============================================================
   "Why you can't order two beers in China" — choreography.
   Reuses the reference engine (persistent grid camera + faux-3D depth
   transitions + an audio.currentTime cue engine + verbatim subtitles +
   a declared SFX bed). ONE persistent equation — [ num ] [ slot ] [ 啤酒 ] —
   carries the whole story; the empty measure-word SLOT is the hero and is
   filled / emptied / multiplied / re-filled through every beat.
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
  const wallGrid = $('#wall-grid'), wallNum = $('#wall-num');

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
  // clean line icons (inline SVG, never OS emoji) — KIND of thing
  // ============================================================
  const SVG = (inner, opt) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${opt || ''}>${inner}</svg>`;
  const ICON = {
    book: SVG('<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>'),
    paw: SVG('<ellipse cx="12" cy="16" rx="5" ry="3.6" fill="currentColor" stroke="none"/><circle cx="6" cy="11" r="1.9" fill="currentColor" stroke="none"/><circle cx="10" cy="7.6" r="1.9" fill="currentColor" stroke="none"/><circle cx="14" cy="7.6" r="1.9" fill="currentColor" stroke="none"/><circle cx="18" cy="11" r="1.9" fill="currentColor" stroke="none"/>'),
    sheet: SVG('<rect x="5" y="3" width="14" height="18" rx="1.6"/><path d="M8 8h8M8 12h8M8 16h5" stroke-width="1.6"/>'),
    monitor: SVG('<rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M9 20h6M12 16v4"/>'),
    fish: SVG('<path d="M3 12c4-6 12-6 15 0-3 6-11 6-15 0z"/><path d="M18 12l3-3v6z"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/>'),
    bottle: SVG('<path d="M10 2.5h4v3l1.4 3.2V20a1.8 1.8 0 0 1-1.8 1.8h-3.2A1.8 1.8 0 0 1 8.6 20V8.7L10 5.5z"/>'),
    car: SVG('<path d="M3 13l2-5h14l2 5v4h-2.2a1.8 1.8 0 0 1-3.6 0H8.8a1.8 1.8 0 0 1-3.6 0H3z"/><circle cx="7" cy="17" r="1.3" fill="currentColor" stroke="none"/><circle cx="17" cy="17" r="1.3" fill="currentColor" stroke="none"/>'),
    shirt: SVG('<path d="M9 3l3 2 3-2 5 4-3 3-1-1v9H8v-9l-1 1-3-3z"/>'),
    cup: SVG('<path d="M5 8h12v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/>'),
    umbrella: SVG('<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v6.5a2 2 0 0 0 4 0"/>'),
    person: SVG('<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>'),
  };

  // ============================================================
  // the wall: 150+ measure words, each ↔ the KIND of thing it counts
  // ============================================================
  const WALL = [
    { zh: '本', py: 'běn', gloss: 'books', ico: 'book' },
    { zh: '只', py: 'zhī', gloss: 'animals', ico: 'paw' },
    { zh: '张', py: 'zhāng', gloss: 'flat things', ico: 'sheet' },
    { zh: '台', py: 'tái', gloss: 'machines', ico: 'monitor' },
    { zh: '条', py: 'tiáo', gloss: 'long things', ico: 'fish' },
    { zh: '瓶', py: 'píng', gloss: 'bottles', ico: 'bottle' },
    { zh: '辆', py: 'liàng', gloss: 'vehicles', ico: 'car' },
    { zh: '件', py: 'jiàn', gloss: 'clothes', ico: 'shirt' },
    { zh: '杯', py: 'bēi', gloss: 'cups', ico: 'cup' },
    { zh: '把', py: 'bǎ', gloss: 'handled things', ico: 'umbrella' },
  ];
  function buildWall() {
    wallGrid.innerHTML = WALL.map((m) =>
      `<div class="mw-tile"><div class="t-zh cjk">${m.zh}</div><div class="t-mid"><div class="t-py">${m.py}</div><div class="t-gloss">${m.gloss}</div></div><div class="t-ico">${ICON[m.ico]}</div></div>`
    ).join('');
  }
  buildWall();
  const wallTiles = () => Array.from(wallGrid.children);
  let wallCountRAF = 0;

  // ============================================================
  // equation state helpers (each leaves explicit, replay-safe state)
  // ============================================================
  const NOUNS = {
    beer: { zh: '啤酒', py: 'píjiǔ · beer', html: '<div class="beers"><img src="assets/photos/beer_dash.png" alt=""><img src="assets/photos/beer_dash.png" alt=""></div>' },
    dog: { zh: '狗', py: 'gǒu · dog', html: '<div class="noun-ico">' + ICON.paw + '</div>' },
    book: { zh: '书', py: 'shū · book', html: '<div class="noun-ico">' + ICON.book + '</div>' },
    person: { zh: '人', py: 'rén · person', html: '<div class="noun-ico">' + ICON.person + '</div>' },
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
  function oneShot(el, name, ms) { el.classList.remove(name); void el.offsetWidth; el.classList.add(name); setTimeout(() => el.classList.remove(name), ms); }
  function numPulse() { oneShot(numTile, 'np', 520); }
  function numWobble() { oneShot(numTile, 'wob', 620); }

  function fillSlot(zh, py, instant) {
    slotMwZh.textContent = zh; slotMwPy.textContent = py;
    slotEl.classList.remove('empty', 'gone'); slotEl.classList.add('filled');
  }
  function emptySlot() { slotEl.classList.remove('filled', 'gone'); slotEl.classList.add('empty'); }
  function slotGone(on) { if (on) { slotEl.classList.remove('empty', 'filled'); slotEl.classList.add('gone'); } else { emptySlot(); } }
  function slotDemand() { oneShot(slotEl, 'demand', 720); }

  function nounDim(on) { cls(nounTile, 'dim', on); }
  function eqOk(on) { eqRow.classList.remove('half'); cls(eqRow, 'ok', on !== false); if (on === false) eqRow.classList.remove('ok'); }
  function eqHalf() { eqRow.classList.remove('ok'); eqRow.classList.add('half'); }
  function eqClearMark() { eqRow.classList.remove('ok', 'half'); }
  function showLabel(on) { cls(eqLabel, 'in', on); }
  function pingVocab(on) { cls(vocabPing, 'in', on); }
  function showStamp94(on) { cls(stamp94El, 'in', on); }
  function showExam(on) { cls(examEl, 'in', on); }
  function showAttempts(on) { cls(attempts, 'in', on); if (!on) attempts.classList.remove('struck'); }
  function strikeAttempts() { attempts.classList.add('struck'); }

  // baseline equation (hook / clean): 2 [□] 啤酒, nothing extra
  function eqBase() {
    numHome(); setNum('2', '', false, true); emptySlot(); setNoun('beer');
    nounDim(false); eqClearMark(); showLabel(false); pingVocab(false);
    showStamp94(false); showExam(false); showAttempts(false);
  }

  // wall start: cascade tiles in + roll the counter to 150
  function wallStart(instant) {
    cancelAnimationFrame(wallCountRAF);
    const tiles = wallTiles();
    tiles.forEach((t) => t.classList.remove('hot'));
    if (instant) { tiles.forEach((t) => t.classList.add('in')); wallNum.textContent = '150'; return; }
    tiles.forEach((t, i) => { t.classList.remove('in'); setTimeout(() => t.classList.add('in'), 60 + i * 70); });
    const t0 = performance.now(), dur = 1700;
    (function roll(now) {
      const e = Math.min(1, (now - t0) / dur);
      wallNum.textContent = Math.round(e * 150);
      if (e < 1) wallCountRAF = requestAnimationFrame(roll);
    })(performance.now());
  }
  function pulseWall(idx) { wallTiles().forEach((t, i) => cls(t, 'hot', i === idx)); }
  function wallResetState() { cancelAnimationFrame(wallCountRAF); wallNum.textContent = '0'; wallTiles().forEach((t) => t.classList.remove('in', 'hot')); }

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
    const gs0 = gcam.s, gx0 = gcam.x;
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
    [0.0, 'Try to order <b>“two beers”</b> in Chinese,'],
    [1.88, 'and you’ve just made a grammar mistake.'],
    [3.90, 'You literally cannot say <b>“two beer.”</b>'],
    [5.72, 'You need a special little word in between —'],
    [7.52, 'and Chinese has more than <b>a hundred</b> of them.'],
    [9.52, 'Here’s the rule.'],
    [10.58, 'In Chinese, you can’t stick a number'],
    [11.74, 'straight onto a <b>noun</b>.'],
    [13.72, 'No “two beer,” no “three dog,” no “five book.”'],
    [16.68, 'Between the number and the thing,'],
    [18.04, 'you need a <b>measure word</b> — a classifier.'],
    [20.68, 'So “two beers” becomes, literally,'],
    [22.70, '“two bottles beer” — <b>两瓶啤酒</b>.'],
    [25.76, 'That little <b>瓶</b>, “bottle,” is the measure word.'],
    [28.20, 'Leave it out, and it’s <b>broken Chinese</b>.'],
    [30.50, 'And it goes deeper.'],
    [31.78, 'Even the word “two” is special here.'],
    [34.36, 'Normally “two” is <b>二</b> (èr) —'],
    [35.94, 'but right before a measure word,'],
    [37.82, 'it changes to a different word, <b>两</b> (liǎng).'],
    [40.22, 'So even counting to two trips people up.'],
    [42.68, 'And then there’s the real <b>mountain</b>:'],
    [44.04, 'there are over <b>150</b> of these measure words —'],
    [46.80, 'and which one you use depends'],
    [48.48, 'on the <b>shape or type</b> of thing.'],
    [50.56, 'Flat things, long things, animals,'],
    [53.06, 'books, machines — many have their own.'],
    [55.88, 'But here’s the <b>relief</b>.'],
    [56.70, 'One general measure word — <b>个</b> (gè) —'],
    [59.02, 'works for the huge majority of cases.'],
    [61.46, 'By some counts, around <b>94%</b> of the time.'],
    [63.96, 'So if you blank on the exact one,'],
    [65.76, '<b>个</b> will usually save you.'],
    [67.36, 'Not always perfect — but <b>understood</b>.'],
    [69.62, 'In English, “two” just works on <b>everything</b>.'],
    [72.62, 'In Chinese, you have to know <b>what kind</b> of thing'],
    [74.50, 'you’re counting before you can count it.'],
    [76.82, 'Which is why ordering two beers'],
    [78.48, 'is secretly a <b>grammar exam</b>.'],
    [80.24, 'Wanna actually start learning <b>Chinese</b>?'],
    [81.54, 'Discover thousands of free exercises'],
    [83.78, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — [t, (instant)=>{...}]  (each sets explicit, replay-safe state)
  // ============================================================
  const CUES = [
    // ---- HOOK ----
    [0.0, (i) => enter('#sc-eq', 'fade', 500, i, eqBase)],
    [2.30, () => numLunge()],
    [2.92, () => { numRecoil(); slotDemand(); }],                 // "grammar mistake"
    [3.90, () => numLunge()],
    [5.10, () => { numRecoil(); slotDemand(); }],                 // "two beer"
    [5.72, () => { numHome(); emptySlot(); }],                    // "special little word in between"
    [8.40, () => slotDemand()],                                   // "a hundred of them"
    [9.52, () => { gridPush(); numHome(); }],                     // "Here's the rule"

    // ---- THE RULE ----
    [10.58, () => { numHome(); emptySlot(); }],
    [12.92, () => { numRecoil(); slotDemand(); }],                // "...straight onto a noun"
    [13.72, (i) => { numHome(); showAttempts(true); }],          // "no two beer / three dog / five book"
    [16.20, () => strikeAttempts()],
    [16.68, () => { showAttempts(false); numHome(); }],          // "between the number and the thing"
    [18.04, () => { showLabel(true); slotDemand(); }],           // "you need a measure word — a classifier"
    [23.10, (i) => { showLabel(false); fillSlot('瓶', 'píng', i); setNum('两', 'liǎng', true, i); eqOk(true); }], // 两瓶啤酒 ✓
    [25.76, () => { pingVocab(true); }],                          // "that little 瓶, bottle, is the measure word"
    [28.20, (i) => { pingVocab(false); emptySlot(); setNum('2', '', false, i); nounDim(true); eqOk(false); }],   // "leave it out — broken Chinese"
    [30.50, (i) => { fillSlot('瓶', 'píng', i); setNum('两', 'liǎng', true, i); nounDim(false); eqOk(true); }],   // "and it goes deeper" — re-lock

    // ---- IT GETS TRICKIER (二 → 两) ----
    [31.78, () => { eqOk(false); numPulse(); }],                  // "even the word two is special"
    [34.36, (i) => { setNum('二', 'èr', true, i); numPulse(); }], // "normally two is 二"
    [39.34, (i) => { setNum('两', 'liǎng', true, i); }],          // "...changes to 两"
    [40.22, () => numWobble()],                                   // "trips people up"

    // ---- THE WALL (150+) ----
    [44.04, (i) => enter('#sc-wall', 'zoom-out', 1050, i, () => wallStart(i))], // "over 150 measure words"
    [50.56, () => pulseWall(2)],   // flat → 张
    [51.56, () => pulseWall(4)],   // long → 条
    [52.40, () => pulseWall(1)],   // animals → 只
    [53.06, () => pulseWall(0)],   // books → 本
    [53.74, () => pulseWall(3)],   // machines → 台

    // ---- THE SHORTCUT (个) ----
    [55.88, (i) => enter('#sc-eq', 'zoom-in', 1050, i, () => { eqBase(); })],   // "but here's the relief"
    [58.30, (i) => { fillSlot('个', 'gè', i); setNum('两', 'liǎng', true, i); eqOk(true); }], // "one general measure word 个"
    [61.46, (i) => { showStamp94(true); }],                       // "around 94% of the time"
    [63.96, (i) => { showStamp94(false); eqOk(true); setNoun('beer'); }],
    [64.40, () => setNoun('dog')],                                // 个 saves you across many nouns
    [65.10, () => setNoun('book')],
    [65.85, () => setNoun('person')],
    [67.36, () => { eqHalf(); setNoun('beer'); }],                // "not always perfect — but understood"

    // ---- PUNCHLINE ----
    [69.62, (i) => { eqClearMark(); slotGone(true); setNum('2', '', false, i); numFree(true); setNoun('beer'); }], // "in English two just works on everything" — digit 2 snaps on freely
    [70.62, () => setNoun('dog')],
    [71.30, () => setNoun('book')],
    [72.62, (i) => { numFree(false); slotGone(false); setNoun('beer'); slotDemand(); }], // "in Chinese — you must know what kind"
    [76.82, (i) => { fillSlot('瓶', 'píng', i); setNum('两', 'liǎng', true, i); eqOk(true); }], // "ordering two beers"
    [79.20, (i) => { showExam(true); }],                          // "secretly a grammar exam"

    // ---- OUTRO ----
    [80.24, (i) => { enter('#sc-outro', 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh only when the grid moves / a scene transition plays;
  // pop for tile & word pop-ins; tick for the 150 count. [t, name, vol]
  // ============================================================
  const SFX = [
    [2.92, 'pop', 0.42],                     // recoil off the slot
    [5.10, 'pop', 0.42],
    [9.52, 'swoosh', 0.4],                   // grid push to settle
    [13.72, 'pop', 0.45], [14.74, 'pop', 0.4], [15.68, 'pop', 0.4],  // attempts cascade
    [23.10, 'pop', 0.55],                    // 瓶 drops into the slot
    [25.76, 'pop', 0.45],                    // 瓶 vocab pops
    [28.20, 'pop', 0.34],                    // 瓶 pulled back out
    [34.36, 'pop', 0.4],                     // 二
    [39.34, 'pop', 0.46],                    // → 两 flip
    [44.04, 'swoosh', 0.5],                  // zoom-out to the wall (grid moves)
    [44.25, 'tick', 0.32], [44.75, 'tick', 0.32], [45.25, 'tick', 0.32], [45.75, 'tick', 0.3],
    [55.88, 'swoosh', 0.5],                  // zoom back in (grid moves)
    [58.30, 'pop', 0.5],                     // 个 drops in
    [61.46, 'pop', 0.5],                     // 94% stamp
    [64.40, 'pop', 0.34], [65.10, 'pop', 0.34], [65.85, 'pop', 0.34], // noun sweep
    [72.62, 'pop', 0.5],                     // slot slams back
    [79.20, 'pop', 0.5],                     // grammar-exam stamp
    [80.24, 'swoosh', 0.55],                 // outro lift (grid moves)
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
