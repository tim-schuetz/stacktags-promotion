/* ============================================================
   "China rewrote its entire writing by government order"
   Audio-synced choreography over a persistent grid (faux-3D camera).
   Spine: ONE 田字格 cell carries the video; real characters (makemeahanzi
   stroke data) are written into it and reshaped BY DECREE — they shed
   strokes (round one works), shed too many (round two breaks, 1977),
   then get reverted (1986). Top-down turquoise seal = government order;
   at the end the people push back from below. Minimal on-screen text:
   the only "words" are the characters themselves.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
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
  // HERO CHARACTER renderer (any hanzi from window.HANZI stroke data)
  // ============================================================
  const SVGNS = 'http://www.w3.org/2000/svg';
  function makeHanzi(hostSel, char, opts) {
    opts = opts || {};
    const host = typeof hostSel === 'string' ? $(hostSel) : hostSel;
    const data = (window.HANZI && window.HANZI[char]) || { strokes: [] };
    const strokes = data.strokes || [];
    const size = opts.size || 470;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('class', 'hz' + (opts.ghost ? ' ghosted' : ''));
    function layer(cls) {
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('transform', 'translate(0,1024) scale(1,-1)');
      g.setAttribute('class', cls);
      const ps = strokes.map((d) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); g.appendChild(p); return p; });
      svg.appendChild(g); return ps;
    }
    if (opts.ghost) layer('hz-ghost');
    const ink = layer('hz-ink');
    host.appendChild(svg);
    const N = ink.length;
    const drift = ink.map((_, i) => { const a = i * 2.3998; return { x: Math.cos(a) * 95, y: Math.sin(a) * 56 + 44, r: (i % 2 ? 1 : -1) * (12 + (i % 5) * 5) }; });
    let timers = [];
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };
    const setI = (fn) => { ink.forEach((p) => { p.style.transition = 'none'; }); fn(); void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; }); };
    return {
      svg, ink, N,
      teal(on) { svg.classList.toggle('teal', on !== false); },
      ghost(on) { svg.classList.toggle('ghosted', on !== false); },
      full() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 1; })); },
      hide() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      reset() { clearT(); svg.classList.remove('teal'); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      firstN(n) { clearT(); setI(() => ink.forEach((p, i) => { p.style.transform = 'none'; p.style.opacity = i < n ? 1 : 0; })); },
      writeOn(o) {
        o = o || {}; if (o.instant) { this.full(); return; }
        clearT();
        setI(() => ink.forEach((p) => { p.style.transform = 'translateY(20px)'; p.style.opacity = 0; }));
        const st = o.stagger || 80;
        ink.forEach((p, i) => timers.push(setTimeout(() => { p.style.transform = 'none'; p.style.opacity = 1; }, (o.delay || 0) + i * st)));
      },
      shed(idxs, o) {
        o = o || {}; const st = o.stagger || 80;
        const fall = (i) => { const d = drift[i]; ink[i].style.transform = `translate(${d.x}px,${d.y}px) rotate(${d.r}deg)`; ink[i].style.opacity = 0; };
        if (o.instant) { setI(() => idxs.forEach(fall)); return; }
        idxs.forEach((i, k) => timers.push(setTimeout(() => fall(i), (o.delay || 0) + k * st)));
      },
      shedAll(o) { const all = []; for (let i = 0; i < N; i++) all.push(i); this.shed(all, o); },
    };
  }

  // a trad glyph crumbles while a simp glyph writes itself on
  function simplify(trad, simp, o) {
    o = o || {};
    if (o.instant) { trad.shedAll({ instant: true }); simp.full(); return; }
    trad.shedAll({ stagger: o.stagger || 60 });
    simp.writeOn({ stagger: o.stagger || 70, delay: o.delay != null ? o.delay : 150 });
  }

  // ---- hero glyph instances (one per scene slot) ----
  const hkTrad = makeHanzi('#hk-trad', '龍', { size: 470 });
  const hkSimp = makeHanzi('#hk-simp', '龙', { size: 430 });
  const hkSkel = makeHanzi('#hk-skel', '歺', { size: 300 });
  const cxChar = makeHanzi('#cx-char', '鬱', { size: 470 });
  const cutTrad = makeHanzi('#cut-trad', '愛', { size: 470 });
  const cutSimp = makeHanzi('#cut-simp', '爱', { size: 450 });
  makeHanzi('#cut-heart', '心', { size: 150 });               // heart marker (CSS-driven)
  const fastTrad = makeHanzi('#fast-trad', '龜', { size: 300 });
  const fastSimp = makeHanzi('#fast-simp', '龟', { size: 300 });
  const r2Trad = makeHanzi('#r2-trad', '蛋', { size: 460 });
  const r2Simp = makeHanzi('#r2-simp', '旦', { size: 430 });
  const cfColor = makeHanzi('#cf-color', '彩', { size: 300 });
  const cfPick = makeHanzi('#cf-pick', '采', { size: 300 });
  const spSimp = makeHanzi('#sp-simp', '旦', { size: 430 });
  const spTrad = makeHanzi('#sp-trad', '蛋', { size: 460 });
  const pnChar = makeHanzi('#pn-char', '爱', { size: 460 });

  // ============================================================
  // SCENE BUILDERS (wall, counter, cascade, hands, map)
  // ============================================================
  // the wall of writing = the barrier. Each char can swap traditional -> simplified
  // (the barrier "lowering" when literacy climbs).
  const WALL_PAIRS = [['龍','龙'],['鬱','郁'],['書','书'],['學','学'],['藝','艺'],['鐵','铁'],['聲','声'],['廳','厅'],['灣','湾'],['黨','党'],['憂','忧'],['豐','丰'],['豔','艳'],['籠','笼'],['羅','罗'],['關','关'],['難','难'],['繼','继'],['續','续'],['舊','旧'],['歲','岁'],['衛','卫'],['醫','医'],['嚴','严'],['屬','属'],['廣','广'],['麗','丽'],['龜','龟']];
  const wallEls = [];
  (function buildWall() {
    const host = $('#wall'); if (!host) return;
    WALL_PAIRS.forEach(([t, s], i) => { const el = document.createElement('div'); el.className = 'wc'; el.textContent = t; el.dataset.t = t; el.dataset.s = s; el.style.transitionDelay = (i * 22) + 'ms'; host.appendChild(el); wallEls.push(el); });
  })();
  function simplifyWall() { wallEls.forEach((el) => { el.textContent = el.dataset.s; }); $('#wall').classList.add('lit'); }
  function resetWall() { wallEls.forEach((el) => { el.textContent = el.dataset.t; }); $('#wall').classList.remove('show', 'lit'); }

  // the recreated 1956 official simplification scheme (繁 -> 简 rows + a red seal)
  const DOC_PAIRS = [['龍', '龙'], ['愛', '爱'], ['馬', '马'], ['門', '门'], ['書', '书'], ['國', '国']];
  (function buildDocRows() {
    const host = $('#doc-rows'); if (!host) return;
    DOC_PAIRS.forEach(([t, s]) => {
      const w = document.createElement('div'); w.className = 'drow';
      w.innerHTML = `<span class="dt">${t}</span><span class="da">→</span><span class="ds">${s}</span>`;
      host.appendChild(w);
    });
  })();
  const docRowEls = () => Array.from(document.querySelectorAll('#doc-rows .drow'));
  function revealDoc(instant) {
    docRowEls().forEach((el, k) => { if (instant) el.classList.add('in'); else setTimeout(() => el.classList.add('in'), k * 130); });
  }

  // counter
  let cxRAF = 0;
  function countTo(to, dur, instant) {
    cancelAnimationFrame(cxRAF);
    const el = $('#cx-num'); if (!el) return;
    if (instant) { el.textContent = to; return; }
    const t0 = performance.now();
    (function step(now) {
      const e = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(e * to);
      if (e < 1) cxRAF = requestAnimationFrame(step);
    })(performance.now());
  }

  // china map (async; fail-soft if offline)
  let mapCtrl = null, mLabelMain = null, mLabelTrad = null, mPinTw = null, mPinHk = null, mapLen = 6000;
  function mkLabel(cls, x, y, ch, tag) {
    const host = $('#map-host'); const el = document.createElement('div');
    el.className = 'mlabel ' + cls; el.style.left = x + 'px'; el.style.top = y + 'px';
    el.innerHTML = `<div class="mch">${ch}</div><div class="mtag">${tag}</div>`;
    host.appendChild(el); return el;
  }
  function mkPin(x, y) {
    const host = $('#map-host'); const el = document.createElement('div');
    el.className = 'mpin'; el.style.left = x + 'px'; el.style.top = y + 'px';
    el.innerHTML = `<div class="dot"></div>`;
    host.appendChild(el); return el;
  }
  async function buildMap() {
    try {
      mapCtrl = await window.mountChinaMap($('#map-host'), { width: 980, height: 1180, pad: 180 });
      mapLen = mapCtrl.line.getTotalLength ? mapCtrl.line.getTotalLength() : 6000;
      const main = mapCtrl.project(36.0, 92.0);
      mLabelMain = mkLabel('main', main.x, main.y, '国', 'Mainland · simplified');
      const tw = mapCtrl.project(23.7, 121.0); mPinTw = mkPin(tw.x, tw.y);
      const hk = mapCtrl.project(22.3, 114.17); mPinHk = mkPin(hk.x, hk.y);
      const trad = mapCtrl.project(18.5, 125.5); mLabelTrad = mkLabel('trad', trad.x, trad.y, '國', 'Taiwan · Hong Kong');
      mapReset();
    } catch (e) { /* offline -> fail soft */ }
  }
  function mapReset() {
    if (!mapCtrl) return;
    const L = mapCtrl.line;
    L.style.transition = 'none'; L.style.strokeDasharray = mapLen; L.style.strokeDashoffset = mapLen;
    mapCtrl.fill.style.transition = 'none'; mapCtrl.fill.style.opacity = '0';
    [mLabelMain, mLabelTrad, mPinTw, mPinHk].forEach((e) => e && e.classList.remove('in'));
  }
  buildMap();

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 600 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }

  // small transient grid "kick" to sell a decree's impact (justifies the swoosh)
  function gridKick(instant) {
    if (instant) return;
    gcam.s *= 1.045; setTimeout(() => { gcam.s /= 1.045; }, 150);
  }

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
    [0.0, 'In the 20th century, China did something almost no country ever does:'],
    [3.94, 'it <b>rewrote its own writing</b> —'],
    [5.46, 'by <b>government order</b>.'],
    [6.78, 'The first time, it <b>stuck</b>.'],
    [8.52, 'The second time, it was such a <b>disaster</b>'],
    [10.34, 'they had to <b>cancel</b> it.'],
    [11.96, "Here's the story of how you <b>redesign a language</b> —"],
    [14.38, 'and how it can <b>backfire</b>.'],
    [16.02, "Back in the mid-1900s, most people in China <b>couldn't read</b>."],
    [19.1, 'The characters were beautiful —'],
    [20.4, 'but <b>complex</b>, often with <b>dozens of strokes</b> each.'],
    [22.96, 'So to lift <b>literacy</b>, the government decided to <b>simplify</b> the writing,'],
    [26.58, 'officially <b>cutting strokes</b> and streamlining <b>thousands</b> of characters.'],
    [29.88, 'That first simplification, through the 1950s and 60s, largely <b>worked</b>.'],
    [34.64, 'Characters got <b>faster to write</b>,'],
    [36.06, '<b>literacy climbed</b> —'],
    [37.38, 'and "Simplified Chinese" is still what the <b>mainland</b> uses today,'],
    [40.36, 'while <b>Taiwan</b> and <b>Hong Kong</b> kept the original, <b>traditional</b> forms.'],
    [43.66, 'So far, a rare <b>success</b> in engineering a language.'],
    [46.64, 'Then they <b>pushed their luck</b>.'],
    [48.1, 'In <b>1977</b> came a second round, simplifying characters <b>even further</b>.'],
    [52.1, 'But this one went <b>too far</b>.'],
    [53.4, 'The new forms were <b>confusing</b>,'],
    [55.46, 'stripped of so much that they <b>lost their clarity</b> —'],
    [57.7, 'and <b>people hated them</b>.'],
    [59.22, 'It was so unpopular that in <b>1986</b>,'],
    [61.62, 'the government officially <b>scrapped</b> the entire second round.'],
    [64.36, 'A rare, public admission that a language reform had simply <b>failed</b>.'],
    [68.46, 'Most languages drift and evolve <b>slowly</b>, on their own.'],
    [71.58, 'China engineered its writing <b>by decree</b> —'],
    [73.48, 'proving you really can redesign a language from the <b>top down</b>…'],
    [76.5, 'but only up to the point where the <b>people writing it push back</b>.'],
    [78.9, 'Wanna actually start learning <b>Chinese</b>?'],
    [81.66, 'Discover thousands of <b>free</b> exercises'],
    [83.66, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — keyed to whisper word timings
  // ============================================================
  const D = $('#hk-decree'), D2 = $('#r2-decree'), D3 = $('#sp-decree'), D4 = $('#pn-decree');
  const CUES = [
    // ---- HOOK ----
    [0.0, (i) => { enter($('#sc-hook'), 'fade', 650, i); hkTrad.writeOn({ instant: i, stagger: 260, delay: 350 }); }],
    [5.46, (i) => { if (i) return; D.classList.add('press'); gridKick(); setTimeout(() => D.classList.remove('press'), 720); }],
    [5.7, (i) => simplify(hkTrad, hkSimp, { instant: i, stagger: 55 })],
    [5.92, () => $('#hk-year').classList.add('in')],
    [7.6, () => { $('#hk-tick').classList.add('in'); }],
    [8.52, (i) => { hkSimp.hide(); $('#hk-tick').classList.remove('in'); $('#hk-skel').style.opacity = 1; hkSkel.writeOn({ instant: i, stagger: 70 }); }],
    [10.34, () => $('#hk-strike').classList.add('in')],
    [10.94, (i) => { hkSkel.shedAll({ instant: i, stagger: 60 }); $('#hk-strike').classList.remove('in'); hkSimp.full(); }],

    // ---- WHY: writing as a barrier looming over the people who can't read ----
    [16.02, (i) => { enter($('#sc-wall'), 'zoom-out', 1100, i); $('#wall').classList.add('show'); $('#wall-people').classList.add('in'); }],

    // ---- WHY: just how complex one character was (stroke counter) ----
    [19.1, (i) => { enter($('#sc-complex'), 'zoom-in', 1050, i); $('#cx-counter').classList.add('in'); cxChar.writeOn({ instant: i, stagger: 100 }); countTo(29, 2900, i); }],

    // ---- WHY: the emblematic cut — 愛 loses its heart ----
    [22.96, (i) => { enter($('#sc-cut'), 'zoom-out', 1100, i); cutTrad.writeOn({ instant: i, stagger: 120 }); }],
    [25.2, () => $('#cut-heart').classList.add('show')],
    [26.82, (i) => { $('#cut-heart').classList.remove('show'); $('#cut-heart').classList.add('lift'); simplify(cutTrad, cutSimp, { instant: i, stagger: 55 }); }],

    // ---- the mass act: the official 1956 simplification scheme, held + stamped "adopted" ----
    [28.14, (i) => { enter($('#sc-doc'), 'zoom-out', 1100, i); revealDoc(i); }],
    [33.0, () => $('#doc').classList.add('sealed')],

    // ---- ROUND ONE: literacy climbs — the SAME wall, now simplified & legible, people brighten ----
    [36.06, (i) => { enter($('#sc-wall'), 'zoom-in', 1000, i); $('#wall').classList.add('show'); simplifyWall(); $('#wall-people').classList.add('in', 'bright'); }],

    // ---- ROUND ONE: mainland vs Taiwan/HK ----
    [37.38, (i) => { enter($('#sc-map'), 'zoom-out', 1150, i, () => { if (mapCtrl) { if (i) mapCtrl.showInstant(); else mapCtrl.drawIn(1500); } }); }],
    [39.06, () => mLabelMain && mLabelMain.classList.add('in')],
    [40.56, () => { mPinTw && mPinTw.classList.add('in'); mPinHk && mPinHk.classList.add('in'); }],
    [41.3, () => mLabelTrad && mLabelTrad.classList.add('in')],

    // ---- ROUND TWO: 1977 ----
    [48.1, (i) => { enter($('#sc-round2'), 'zoom-in', 1050, i); r2Trad.full(); r2Simp.hide(); }],
    [48.26, () => $('#r2-year').classList.add('in')],
    [49.54, (i) => { if (!i) { D2.classList.add('press'); gridKick(); setTimeout(() => D2.classList.remove('press'), 720); } simplify(r2Trad, r2Simp, { instant: i, stagger: 55 }); }],

    // ---- ROUND TWO: lost clarity (彩 sheds 彡 → 采 = 采) ----
    [54.0, (i) => { enter($('#sc-confusion'), 'zoom-out', 1100, i); cfColor.full(); cfPick.full(); }],
    [55.46, (i) => { cfColor.shed([8, 9, 10], { instant: i, stagger: 90 }); $('#sc-confusion').classList.add('collide'); $('#conf-bub').classList.add('in'); }],

    // ---- ROUND TWO: scrapped 1986 ----
    [59.22, (i) => { enter($('#sc-scrap'), 'zoom-in', 1050, i); spSimp.full(); spTrad.hide(); }],
    [60.56, () => $('#sp-year').classList.add('in')],
    [62.36, (i) => { if (!i) { D3.classList.add('press'); gridKick(); setTimeout(() => D3.classList.remove('press'), 720); } $('#sp-strike').classList.add('in'); simplify(spSimp, spTrad, { instant: i, stagger: 55, delay: 360 }); }],
    [63.7, () => $('#sp-strike').classList.remove('in')],

    // ---- PUNCHLINE ----
    [68.46, (i) => { enter($('#sc-punch'), 'zoom-out', 1150, i); pnChar.full(); $('#pn-char').classList.add('drift'); }],
    [71.58, (i) => { $('#pn-char').classList.remove('drift'); if (!i) { D4.classList.add('press'); gridKick(); setTimeout(() => D4.classList.remove('press'), 900); } }],
    [77.62, () => { $('#pn-people').classList.add('in'); }],
    [78.36, (i) => { const el = $('#pn-char'); el.classList.remove('spring'); if (!i) { void el.offsetWidth; el.classList.add('spring'); } }],

    // ---- OUTRO ----
    [79.0, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX  (swoosh only when the grid moves; pop per word/char; ticking on counter)
  // ============================================================
  const SFX = [
    [5.46, 'swoosh', 0.5], [5.92, 'pop', 0.45], [7.6, 'pop', 0.4],
    [16.02, 'swoosh', 0.5], [18.08, 'pop', 0.5],
    [19.1, 'swoosh', 0.5], [19.3, 'ticking', 0.4],
    [22.96, 'swoosh', 0.5], [26.82, 'pop', 0.45],
    [28.14, 'swoosh', 0.5], [28.4, 'pop', 0.4], [28.7, 'pop', 0.4], [29.0, 'pop', 0.4],
    [33.0, 'pop', 0.5],
    [36.06, 'swoosh', 0.5],
    [37.38, 'swoosh', 0.5], [39.06, 'pop', 0.5], [40.56, 'pop', 0.5], [41.3, 'pop', 0.5],
    [48.1, 'swoosh', 0.5], [48.26, 'pop', 0.5], [49.54, 'swoosh', 0.5],
    [54.0, 'swoosh', 0.5], [55.46, 'pop', 0.55],
    [59.22, 'swoosh', 0.5], [60.56, 'pop', 0.5], [62.36, 'swoosh', 0.55],
    [68.46, 'swoosh', 0.5], [71.58, 'swoosh', 0.55], [77.62, 'pop', 0.5], [79.0, 'swoosh', 0.55],
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
    [hkTrad, hkSimp, hkSkel, cxChar, cutTrad, cutSimp, fastTrad, fastSimp, r2Trad, r2Simp, cfColor, cfPick, spSimp, spTrad, pnChar].forEach((h) => h.reset());
    $('#hk-skel').style.opacity = 0;
    [D, D2, D3, D4].forEach((d) => d && d.classList.remove('press'));
    document.querySelectorAll('.yearstamp').forEach((y) => y.classList.remove('in'));
    $('#hk-tick').classList.remove('in'); $('#hk-strike').classList.remove('in');
    resetWall();
    document.querySelectorAll('.photocard').forEach((p) => p.classList.remove('in', 'bright'));
    $('#cx-counter').classList.remove('in'); cancelAnimationFrame(cxRAF); $('#cx-num').textContent = '0';
    $('#cut-heart').classList.remove('show', 'lift');
    docRowEls().forEach((el) => el.classList.remove('in')); $('#doc').classList.remove('sealed');
    $('#fast-pen').classList.remove('write');
    $('#sc-confusion').classList.remove('collide'); $('#conf-bub').classList.remove('in');
    $('#sp-strike').classList.remove('in');
    $('#pn-char').classList.remove('drift', 'spring');
    $('#outro-ec').classList.remove('play');
    mapReset();
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
