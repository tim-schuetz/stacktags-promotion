/* ============================================================
   "The most complex Chinese character — invented for a noodle"
   Faux-3D camera over a persistent grid, audio-synced.
   The spine is ONE biáng glyph (public-domain SVG) living in a
   田字格 practice cell: it ink-writes on (counter races to ~58),
   decomposes into the real characters hiding inside it, then the
   one humble bowl it exists for. Around it: a dictionary miss, the
   dough-slap origin, the Unicode gap, a phone that can't render it,
   and the 2020 fix. Minimal on-screen text.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const stage = $('#stage');
  const grid = $('#grid');
  const vo = $('#vo');
  const subsLine = $('#subs-line');

  function fit() {
    const s = Math.min(innerWidth / 1080, innerHeight / 1920);
    stage.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();

  // ============================================================
  // HERO — biáng write-on + stroke counter
  // ============================================================
  const biang = $('#biang');
  const ctN = $('#ct-n');
  const counter = $('#counter');
  let writeRAF = 0;
  function setWrite(p) {            // p: 0..1 reveal fraction (top -> bottom)
    const bottom = Math.max(0, 100 - p * 100);
    biang.style.clipPath = 'inset(0 0 ' + bottom.toFixed(2) + '% 0)';
    ctN.textContent = String(Math.round(p * 58));
  }
  function writeOn(instant) {
    if (writeRAF) cancelAnimationFrame(writeRAF);
    counter.classList.add('in');
    if (instant) { setWrite(1); return; }
    setWrite(0);
    const t0 = performance.now(), dur = 2550;
    (function step(now) {
      const e = Math.min(1, (now - t0) / dur);
      const p = e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;  // easeInOut
      setWrite(p);
      if (e < 1) { writeRAF = requestAnimationFrame(step); }
      else { counter.classList.add('pulse'); setTimeout(() => counter.classList.remove('pulse'), 500); }
    })(performance.now());
  }
  function counterPulse() { counter.classList.add('pulse'); setTimeout(() => counter.classList.remove('pulse'), 500); }

  // compare characters / components
  const cmps = $$('#compare .cmp');
  const compBoxes = $$('#comp .comp-box');
  function popCmp(i) { if (cmps[i]) cmps[i].classList.add('in'); }
  function dimCompare() { cmps.forEach((c) => c.classList.add('dim')); }
  function hideCompare() { $('#compare').style.opacity = '0'; }
  function showComp(i) { if (compBoxes[i]) compBoxes[i].classList.add('in'); }
  function hideComps() { compBoxes.forEach((b) => b.classList.remove('in')); }

  // hook chat / pinyin
  function showChat() { $('#chat').classList.add('in'); }
  function hideChat() { $('#chat').classList.remove('in'); }
  function showPinyin() { $('#pinyin').classList.add('in'); }
  function hidePinyin() { $('#pinyin').classList.remove('in'); }

  // noodle bowl + connector
  function showBowl() {
    $('#cell').classList.add('up');
    counter.classList.remove('in');
    hidePinyin();
    $('#bowl').classList.add('in');
    $('#bowl-lab').classList.add('in');
  }
  function showConn() { $('#conn').classList.add('in'); }
  function finalShot() {
    $('#cell').classList.add('up');
    hideCompare(); hideComps(); hideChat(); hidePinyin();
    counter.classList.remove('in');
    setWrite(1);
    $('#bowl').classList.add('in');
    $('#bowl-lab').classList.remove('in');
    $('#conn').classList.remove('in');
  }
  function showEmoji() {
    $('#cell').classList.remove('up');
    $('#bowl').classList.remove('in');
    $('#bowl-lab').classList.remove('in');
    $('#conn').classList.remove('in');
    $('#emoji').classList.add('in');
  }

  // ============================================================
  // DICTIONARY
  // ============================================================
  function dictNone(instant) {
    $('#dict-none').classList.add('in');
    if (!instant) { const d = $('#dict'); d.classList.add('shake'); setTimeout(() => d.classList.remove('shake'), 420); }
  }

  // ============================================================
  // SLAP — dough hits the table, "biáng!"
  // ============================================================
  function doughSlap() { $('#dough').classList.add('slap'); }
  function slapWord() { $('#slap-word').classList.add('in'); }

  // ============================================================
  // UNICODE — the master list with a gap where biáng should be
  // ============================================================
  const UNI = [
    ['U+5B57', '字'], ['U+8A00', '言'], ['U+9762', '面'],
    ['GAP', ''],
    ['U+7C73', '米'], ['U+5C71', '山'], ['U+65E5', '日'],
  ];
  let uniBuilt = false;
  function uniBuild() {
    if (uniBuilt) return; uniBuilt = true;
    const host = $('#uni-list');
    UNI.forEach((r) => {
      const row = document.createElement('div');
      row.className = 'uni-row' + (r[0] === 'GAP' ? ' gap' : '');
      if (r[0] === 'GAP') {
        row.innerHTML = '<span class="uni-hex">U+30EDE</span><span class="tofu sm"></span>';
      } else {
        row.innerHTML = '<span class="uni-hex">' + r[0] + '</span><span class="uni-ch">' + r[1] + '</span>';
      }
      host.appendChild(row);
    });
  }
  function uniPlay(instant) {
    uniBuild();
    const list = $('#uni-list');
    if (instant) { list.classList.add('in'); return; }
    requestAnimationFrame(() => list.classList.add('in'));
  }

  // ============================================================
  // SCREEN — phone/menu show □; then 2020 stamp resolves it
  // ============================================================
  function msgShow() { $('#msg').classList.add('in'); }
  function menuShow() { $('#menu').classList.add('in'); }
  function pasteShow() { $('#paste').classList.add('in'); }
  function stampShow() { $('#stamp').classList.add('in'); }
  function resolveScreen() {
    $('#msg-tofu').classList.add('resolved');
    $('#menu-tofu').classList.add('resolved');
    $('#paste').classList.remove('in');
  }

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 600 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // ============================================================
  // GRID CAMERA + DEPTH TRANSITIONS  (reused engine)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const cs = clamp(gdisp.s * (1 + Math.sin(t * 0.5) * 0.012), 0.82, 1.6);
    const cell = 120 * cs;
    const px = ((gdisp.x + Math.sin(t * 0.33) * 11) % cell + cell) % cell;
    const py = ((gdisp.y + Math.cos(t * 0.27) * 9) % cell + cell) % cell;
    grid.style.backgroundSize = cell + 'px ' + cell + 'px';
    grid.style.backgroundPosition = 'calc(50% + ' + px + 'px) calc(50% + ' + py + 'px)';
  }
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const SCENES = Array.from(document.querySelectorAll('.scene'));
  function setPose(el, p) {
    el.style.setProperty('--tx', (p.tx || 0) + 'px');
    el.style.setProperty('--ty', (p.ty || 0) + 'px');
    el.style.setProperty('--s', p.s != null ? p.s : 1);
    el.style.opacity = p.op != null ? p.op : 1;
    el.style.filter = p.blur ? `blur(${p.blur}px)` : 'none';
    if (p.z != null) el.style.zIndex = p.z;
  }
  function POSES(mode, e) {
    switch (mode) {
      case 'rise': return { from: { s: lerp(1, .66, e), ty: lerp(0, -230, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 }, to: { s: lerp(.72, 1, e), ty: lerp(980, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .85 };
      case 'zoom-out': return { from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 }, to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'pan-right': return { from: { tx: lerp(0, 1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 }, to: { tx: lerp(-1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 }, panX: 1180 };
      case 'drop': return { from: { s: lerp(1, .66, e), ty: lerp(0, 180, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 }, to: { s: lerp(.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .9 };
      case 'fade': return { from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in': default: return { from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 }, to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current;
    if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3; const t0 = performance.now(); const gy0 = gcam.y;
      setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur)); const dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: lerp(1, 1.3, e), op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        gdisp.y = gy0 + dy * 0.5;
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 });
        setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
        gdisp.y = gy0; gcam.s = gs0; current = toEl; if (onArrive) onArrive();
      })(performance.now());
      return;
    }
    const p0 = POSES(mode, 0);
    if (p0.grid != null) gcam.s = gs0 * p0.grid;
    if (p0.panX != null) gcam.x = gx0 + p0.panX * gs0 * 0.18;
    setPose(toEl, Object.assign({ op: 0 }, p0.to));
    const t0 = performance.now();
    (function step(now) {
      const e = easeInOut(clamp01((now - t0) / dur));
      const ps = POSES(mode, e);
      if (fromEl) setPose(fromEl, ps.from);
      setPose(toEl, ps.to);
      if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
      if (fromEl) setPose(fromEl, { op: 0, z: 0 });
      setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1); current = toEl; if (onArrive) onArrive();
    })(performance.now());
  }
  function showInstant(el) { SCENES.forEach((s) => { if (s !== el) setPose(s, { op: 0, z: 0 }); }); setPose(el, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); current = el; }
  function enter(el, mode, dur, instant, onArrive) { if (instant) { showInstant(el); if (onArrive) onArrive(); return; } depthGo(el, mode, dur, onArrive); }

  // ============================================================
  // SUBTITLES
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 140);
  }
  const SUBS = [
    [0.0, 'This is one <b>single</b> Chinese character,'],
    [2.02, 'it has around <b>58 strokes</b>,'],
    [3.78, 'it means one specific kind of <b>noodle</b>.'],
    [5.78, 'And until <b>2020</b>,'],
    [7.14, 'no computer on Earth could <b>type</b> it.'],
    [9.0, 'Meet <b>biáng</b>.'],
    [9.74, 'Most Chinese characters have a handful of strokes —'],
    [12.12, 'five, ten, maybe fifteen.'],
    [14.3, 'This one crams nearly <b>sixty strokes</b>'],
    [16.18, 'into a single character.'],
    [17.28, "it's so packed it looks less like writing"],
    [19.14, 'and more like a <b>tiny painting</b>.'],
    [20.8, 'And after all that complexity,'],
    [22.64, 'it means…'],
    [23.7, 'just <b>one thing</b>.'],
    [25.12, '<b>Biángbiáng noodles</b> —'],
    [26.12, 'a thick, hand-pulled noodle'],
    [27.68, 'from the <b>Shaanxi</b> region of China.'],
    [29.64, "That's it."],
    [30.26, 'One of the most complicated characters ever,'],
    [31.94, 'for <b>one bowl of food</b>.'],
    [33.6, "It doesn't even appear in standard <b>dictionaries</b>."],
    [35.86, 'As the story goes,'],
    [37.18, 'it was dreamed up around a noodle stall —'],
    [39.14, 'the “biang” being the <b>slapping sound</b>'],
    [40.92, 'of the dough hitting the table.'],
    [42.48, "And because it's so rare and so complex,"],
    [44.84, "for years it simply didn't exist in <b>Unicode</b> —"],
    [47.26, 'the master list of every character'],
    [48.78, 'computers can display.'],
    [50.26, "So you couldn't <b>type</b> it, <b>text</b> it,"],
    [52.06, 'or put it on a <b>digital menu</b>.'],
    [53.92, 'Restaurants had to draw it <b>by hand</b>'],
    [55.22, 'or paste in a picture.'],
    [56.78, 'Only in <b>2020</b> did it finally get added —'],
    [59.4, 'so computers could at last render'],
    [60.92, 'a single bowl of noodles.'],
    [62.36, 'A character too complicated for the <b>digital age</b> —'],
    [65.04, 'invented for a <b>plate of noodles</b>.'],
    [66.96, 'Proof that even in a world of emojis,'],
    [69.08, 'some words are just too <b>gloriously complex</b> to type.'],
    [72.14, 'Want to actually start <b>learning Chinese</b>?'],
    [74.28, 'Discover thousands of <b>free</b> exercises'],
    [76.34, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — keyed to the whisper word timings
  // ============================================================
  const CUES = [
    // HOOK — biáng writes itself on, counter races to ~58
    [0.0, (i) => enter($('#sc-hero'), 'fade', 650, i, () => writeOn(i))],
    [3.0, (i) => { if (i) writeOn(true); else counterPulse(); }],
    [7.14, () => showChat()],
    // THE CHARACTER
    [9.0, () => { hideChat(); showPinyin(); }],
    [12.12, () => popCmp(0)],
    [12.64, () => popCmp(1)],
    [13.2, () => popCmp(2)],
    [14.3, () => { dimCompare(); counterPulse(); }],
    // decomposition — real characters hiding inside (馬 心 月 言 長 辶)
    [18.12, () => { hideCompare(); showComp(0); }],
    [18.56, () => showComp(3)],
    [19.14, () => showComp(2)],
    [19.6, () => showComp(1)],
    [20.94, () => showComp(4)],
    [21.4, () => showComp(5)],
    [22.64, () => { hideComps(); hideCompare(); }],
    // NOODLES — the one thing it's for
    [25.12, () => showBowl()],
    [31.94, () => showConn()],
    // DICTIONARY — it isn't there
    [33.6, (i) => enter($('#sc-dict'), 'zoom-out', 1000, i)],
    [34.86, (i) => dictNone(i)],
    // STALL — the slap of the dough
    [37.18, (i) => enter($('#sc-slap'), 'drop', 950, i)],
    [41.28, (i) => { if (!i) doughSlap(); }],
    [41.72, (i) => { if (i) { doughSlap(); slapWord(); } else slapWord(); }],
    // UNICODE — the gap
    [42.48, (i) => enter($('#sc-unicode'), 'zoom-in', 1000, i, () => uniPlay(i))],
    [46.46, () => { const g = $('#uni-list .gap'); if (g) { g.classList.add('pulse'); } }],
    // SCREEN — □ everywhere, then 2020 resolves it
    [50.26, (i) => enter($('#sc-screen'), 'pan-right', 1050, i, () => msgShow())],
    [52.7, () => menuShow()],
    [53.92, () => pasteShow()],
    [57.22, (i) => stampShow()],
    [58.74, () => resolveScreen()],
    // FINAL — glyph + bowl, then the emoji size-gag
    [59.4, (i) => enter($('#sc-hero'), 'zoom-out', 1100, i, () => finalShot())],
    [66.96, () => showEmoji()],
    // OUTRO
    [72.14, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX  (swoosh only when the grid moves; pop per popped word/tap;
  //        ticking under the stroke-counter write-on)
  // ============================================================
  const SFX = [
    [0.4, 'ticking', 0.40],
    [3.0, 'pop', 0.45],
    [12.12, 'pop', 0.50], [12.64, 'pop', 0.50], [13.2, 'pop', 0.50],
    [18.12, 'pop', 0.32], [18.56, 'pop', 0.32], [19.14, 'pop', 0.32],
    [19.6, 'pop', 0.32], [20.94, 'pop', 0.32], [21.4, 'pop', 0.32],
    [33.6, 'swoosh', 0.50],
    [34.86, 'pop', 0.45],
    [37.18, 'swoosh', 0.50],
    [41.72, 'pop', 0.60],
    [42.48, 'swoosh', 0.50],
    [50.26, 'swoosh', 0.50],
    [52.7, 'pop', 0.40],
    [57.22, 'pop', 0.55],
    [58.74, 'pop', 0.45],
    [59.4, 'swoosh', 0.50],
    [66.96, 'pop', 0.45],
    [72.14, 'swoosh', 0.55],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/tickingtimeline.mp3' };
  function playSfx(entry) { try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {} }

  // ============================================================
  // CUE ENGINE
  // ============================================================
  const firedScene = new Set(), firedSub = new Set(), firedSfx = new Set();
  let lastT = 0;
  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    SCENES.forEach((el) => setPose(el, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null;
    gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
    if (writeRAF) cancelAnimationFrame(writeRAF);
    setWrite(0);
    counter.classList.remove('in', 'pulse');
    cmps.forEach((c) => c.classList.remove('in', 'dim'));
    $('#compare').style.opacity = '';
    hideComps();
    hideChat(); hidePinyin();
    $('#cell').classList.remove('up');
    $('#bowl').classList.remove('in'); $('#bowl-lab').classList.remove('in'); $('#conn').classList.remove('in');
    $('#emoji').classList.remove('in');
    $('#dict-none').classList.remove('in'); $('#dict').classList.remove('shake');
    $('#dough').classList.remove('slap'); $('#slap-word').classList.remove('in');
    const ul = $('#uni-list'); if (ul) ul.classList.remove('in');
    const g = $('#uni-list .gap'); if (g) g.classList.remove('pulse');
    $('#msg').classList.remove('in'); $('#menu').classList.remove('in'); $('#paste').classList.remove('in'); $('#stamp').classList.remove('in');
    $('#msg-tofu').classList.remove('resolved'); $('#menu-tofu').classList.remove('resolved');
    outroReset();
    subsLine.classList.remove('in');
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
    gdisp.s += (gcam.s - gdisp.s) * 0.07;
    gdisp.x += (gcam.x - gdisp.x) * 0.07;
    gdisp.y += (gcam.y - gdisp.y) * 0.07;
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

  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); }
    if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean');
  });
  hardReset();
})();
