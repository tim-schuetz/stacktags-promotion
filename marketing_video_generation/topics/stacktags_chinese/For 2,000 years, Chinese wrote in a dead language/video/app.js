/* ============================================================
   "For 2,000 years, Chinese wrote in a dead language" (v2)
   Audio-synced choreography over a persistent grid (faux-3D camera).
   Spine: ONE person who SPEAKS plain (白话) but WRITES classical
   (文言文) — a big "≠". A DRIFT scene tracks ONE word ("you"): the
   written form froze (文言文, identical top & bottom) while the spoken
   form kept changing (白话: 汝→爾→你). Diglossia locks literacy to a
   tiny scholarly elite; Hu Shi (1917) reunites them; ≠ resolves to =.
   Figures are real photo cut-outs (assets/img/*_cut.png).
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage');
  const grid = $('#grid');
  const vo = $('#vo');
  const subsLine = $('#subs-line');

  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // ============================================================
  // HANZI renderer (stroke data from window.HANZI)
  // ============================================================
  const SVGNS = 'http://www.w3.org/2000/svg';
  function makeHanzi(hostSel, char, opts) {
    opts = opts || {};
    const host = typeof hostSel === 'string' ? $(hostSel) : hostSel;
    const data = (window.HANZI && window.HANZI[char]) || { strokes: [] };
    const strokes = data.strokes || [];
    const size = opts.size || 120;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('class', 'hz');
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('transform', 'translate(0,1024) scale(1,-1)');
    g.setAttribute('class', 'hz-ink');
    const ink = strokes.map((d) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); g.appendChild(p); return p; });
    svg.appendChild(g); host.appendChild(svg);
    const N = ink.length;
    const drift = ink.map((_, i) => { const a = i * 2.3998; return { x: Math.cos(a) * 70, y: Math.sin(a) * 44 + 30, r: (i % 2 ? 1 : -1) * (10 + (i % 5) * 5) }; });
    let timers = [];
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };
    const setI = (fn) => { ink.forEach((p) => { p.style.transition = 'none'; }); fn(); void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; }); };
    return {
      svg, ink, N,
      teal(on) { svg.classList.toggle('teal', on !== false); },
      full() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 1; })); },
      hide() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      reset() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      writeOn(o) { o = o || {}; if (o.instant) { this.full(); return; } clearT();
        setI(() => ink.forEach((p) => { p.style.transform = 'translateY(16px)'; p.style.opacity = 0; }));
        const st = o.stagger || 70; ink.forEach((p, i) => timers.push(setTimeout(() => { p.style.transform = 'none'; p.style.opacity = 1; }, (o.delay || 0) + i * st))); },
      shedAll(o) { o = o || {}; const st = o.stagger || 55;
        const fall = (i) => { const d = drift[i]; ink[i].style.transform = `translate(${d.x}px,${d.y}px) rotate(${d.r}deg)`; ink[i].style.opacity = 0; };
        if (o.instant) { setI(() => ink.forEach((_, i) => fall(i))); return; }
        ink.forEach((_, i) => timers.push(setTimeout(() => fall(i), (o.delay || 0) + i * st))); },
    };
  }
  function wordHanzi(pairs, size) {
    const glyphs = pairs.map(([sel, ch]) => makeHanzi(sel, ch, { size }));
    return {
      glyphs,
      writeOn(o) { o = o || {}; if (o.instant) { glyphs.forEach((g) => g.full()); return; } glyphs.forEach((g, k) => g.writeOn({ stagger: o.stagger || 70, delay: (o.delay || 0) + k * (o.perGlyph || 240) })); },
      full() { glyphs.forEach((g) => g.full()); }, hide() { glyphs.forEach((g) => g.hide()); }, reset() { glyphs.forEach((g) => g.reset()); },
      shedAll(o) { o = o || {}; glyphs.forEach((g, k) => g.shedAll({ stagger: o.stagger || 45, delay: (o.delay || 0) + k * 110, instant: o.instant })); },
      teal(on) { glyphs.forEach((g) => g.teal(on)); },
    };
  }

  // ---- glyph instances ----
  const hkScroll = wordHanzi([['#hk-w0', '吾'], ['#hk-w1', '不'], ['#hk-w2', '知']], 122);
  const dlt = makeHanzi('#dlt', '汝', { size: 130 });
  const drt = makeHanzi('#drt', '汝', { size: 130 });
  const drm = makeHanzi('#drm', '爾', { size: 130 }); drm.teal(true);
  const drb = makeHanzi('#drb', '你', { size: 130 }); drb.teal(true);
  const dlbO = makeHanzi('#dlb-o', '汝', { size: 130 });
  const dlbN = makeHanzi('#dlb-n', '你', { size: 130 }); dlbN.teal(true);
  const hsScroll = wordHanzi([['#hs0', '白'], ['#hs1', '话']], 122); hsScroll.teal(true);
  const payOld = wordHanzi([['#po0', '吾'], ['#po1', '不'], ['#po2', '知']], 122);
  const payNew = wordHanzi([['#pn0', '我'], ['#pn1', '不'], ['#pn2', '知'], ['#pn3', '道']], 100);

  // ---- scroll icon (the only drawn prop) ----
  function scrollSVG(w) {
    w = w || 250; const h = Math.round(w * 220 / 240);
    let s = `<svg viewBox="0 0 240 220" width="${w}" height="${h}" style="display:block;overflow:visible">`;
    s += `<rect x="40" y="28" width="160" height="164" rx="6" fill="#fbfaf6" stroke="#232B33" stroke-width="4"/>`;
    for (let i = 0; i < 6; i++) { const y = 52 + i * 23; s += `<rect x="60" y="${y}" width="${i % 2 ? 92 : 122}" height="7" rx="3.5" fill="rgba(35,43,51,.42)"/>`; }
    s += `<rect x="26" y="16" width="188" height="20" rx="10" fill="#a8814a"/><rect x="26" y="184" width="188" height="20" rx="10" fill="#a8814a"/>`;
    s += `</svg>`; return s;
  }
  $('#dig-scroll').innerHTML = scrollSVG(250);

  // ---- DRIFT lines (frozen grey vs living teal) ----
  const dlLeft = $('#dl-left'), dlRight = $('#dl-right');
  function linesDraw(instant) { [dlLeft, dlRight].forEach((L) => { L.style.transition = instant ? 'none' : 'transform 1.2s cubic-bezier(.4,0,.2,1)'; L.style.transform = 'scaleY(1)'; }); }
  function linesReset() { [dlLeft, dlRight].forEach((L) => { L.style.transition = 'none'; L.style.transform = 'scaleY(0)'; }); }
  function pulse(sel) { const e = $(sel); if (!e) return; e.classList.remove('d-pulse'); void e.offsetWidth; e.classList.add('d-pulse'); }

  // ---- decade counter ----
  let decRAF = 0;
  function decadeCount(instant) { cancelAnimationFrame(decRAF); const el = $('#news-y');
    if (instant) { el.textContent = '1927'; return; }
    const t0 = performance.now(), dur = 1500;
    (function step(now) { const e = Math.min(1, (now - t0) / dur); el.textContent = String(Math.round(1917 + e * 10)); if (e < 1) decRAF = requestAnimationFrame(step); })(performance.now()); }

  // ---- newspaper body ----
  (function buildNews() {
    const cl = $('#np-classical'), ve = $('#np-vernacular');
    for (let i = 0; i < 11; i++) { const c = document.createElement('div'); c.className = 'np-col'; c.style.right = (i * 64) + 'px'; cl.appendChild(c); }
    const widths = [86, 100, 72, 94, 64, 90, 50];
    for (let i = 0; i < 7; i++) { const l = document.createElement('div'); l.className = 'np-line' + (widths[i] < 70 ? ' short' : ''); l.style.top = (i * 60) + 'px'; l.style.width = widths[i] + '%'; ve.appendChild(l); }
  })();

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 600 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }

  function brushWrite(sel, instant) { const el = $(sel); if (!el) return; el.classList.add('in'); if (instant) return; el.classList.remove('write'); void el.offsetWidth; el.classList.add('write'); }
  function gridKick(instant) { if (instant) return; gcam.s *= 1.04; setTimeout(() => { gcam.s /= 1.04; }, 150); }

  // ============================================================
  // GRID CAMERA + DEPTH TRANSITIONS  (reused engine)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const cs2 = clamp(gdisp.s * (1 + Math.sin(t * 0.5) * 0.012), 0.82, 1.6);
    const cell = 120 * cs2;
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
    el.style.setProperty('--tx', (p.tx || 0) + 'px'); el.style.setProperty('--ty', (p.ty || 0) + 'px');
    el.style.setProperty('--s', p.s != null ? p.s : 1); el.style.opacity = p.op != null ? p.op : 1;
    el.style.filter = p.blur ? `blur(${p.blur}px)` : 'none'; if (p.z != null) el.style.zIndex = p.z;
  }
  function POSES(mode, e) {
    switch (mode) {
      case 'rise': return { from: { s: lerp(1, .66, e), ty: lerp(0, -230, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 }, to: { s: lerp(.72, 1, e), ty: lerp(980, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .85 };
      case 'zoom-out': return { from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 }, to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'drop': return { from: { s: lerp(1, .66, e), ty: lerp(0, 180, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 }, to: { s: lerp(.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .9 };
      case 'fade': return { from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in': default: return { from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 }, to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100; const fromEl = current;
    if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x; const p0 = POSES(mode, 0);
    if (p0.grid != null) gcam.s = gs0 * p0.grid;
    setPose(toEl, Object.assign({ op: 0 }, p0.to));
    const t0 = performance.now();
    (function step(now) {
      const e = easeInOut(clamp01((now - t0) / dur)); const ps = POSES(mode, e);
      if (fromEl) setPose(fromEl, ps.from); setPose(toEl, ps.to);
      if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
      if (fromEl) setPose(fromEl, { op: 0, z: 0 });
      setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1); current = toEl; if (onArrive) onArrive();
    })(performance.now());
  }
  function showInstant(el) { SCENES.forEach((s) => { if (s !== el) setPose(s, { op: 0, z: 0 }); }); setPose(el, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); current = el; }
  function enter(el, mode, dur, instant, onArrive) { el = typeof el === 'string' ? $(el) : el; if (instant) { showInstant(el); if (onArrive) onArrive(); return; } depthGo(el, mode, dur, onArrive); }

  // ============================================================
  // SUBTITLES (verbatim, chunked)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 140);
  }
  const SUBS = [
    [0.0, 'For most of its history, China wrote in a language that <b>nobody</b> actually spoke —'],
    [4.0, "and hadn't spoken for well over a <b>thousand years</b>."],
    [6.62, "You'd <b>speak</b> one kind of Chinese…"],
    [8.42, 'and <b>write</b> a completely different one.'],
    [10.32, 'Until about a century ago, written Chinese was <b>文言文</b> —'],
    [13.78, 'Classical, or Literary, Chinese.'],
    [16.22, 'It was based on the language of the ancient classics,'],
    [18.36, 'from over <b>two thousand years</b> ago.'],
    [20.1, 'And it basically <b>froze</b> there.'],
    [22.0, 'Meanwhile, spoken Chinese kept <b>evolving</b>,'],
    [24.74, 'century after century.'],
    [26.0, 'So the written language and the spoken language'],
    [27.82, '<b>drifted</b> further and further apart —'],
    [30.0, 'until they were effectively <b>two different languages</b>.'],
    [32.28, 'You spoke everyday Chinese — <b>白话</b>, "plain speech" —'],
    [35.56, 'but to write, you had to use this ancient, compressed,'],
    [38.6, '<b>classical</b> form almost no one actually spoke.'],
    [41.72, 'Linguists have a name for this:'],
    [43.28, '<b>diglossia</b> —'],
    [44.38, 'one language for the <b>street</b>,'],
    [45.9, 'another for the <b>page</b>.'],
    [47.18, "And being literate didn't just mean knowing the characters."],
    [50.54, 'It meant mastering a <b>near-dead language</b> on top of your own.'],
    [53.5, 'Which made reading and writing <b>brutally hard</b>,'],
    [55.8, 'and kept them <b>locked</b> to a small, scholarly <b>elite</b>.'],
    [58.92, 'Everyday speech simply wasn\'t considered <b>"proper"</b> to write down.'],
    [62.54, 'Then, starting around <b>1917</b>,'],
    [64.96, 'a scholar named <b>Hu Shi</b> led a movement'],
    [66.9, 'with a <b>radical idea</b>:'],
    [68.16, 'write the way you actually <b>speak</b>.'],
    [70.08, 'Use the living, spoken language — <b>baihua</b> —'],
    [72.88, 'as the <b>written standard</b>.'],
    [74.22, 'It caught on <b>fast</b>.'],
    [75.68, 'Within about a <b>decade</b>, the vernacular had replaced'],
    [77.46, 'classical Chinese in schools and <b>newspapers</b>.'],
    [80.62, 'So for two thousand years, China wrote in a language'],
    [82.92, 'that <b>time had left behind</b> —'],
    [84.7, 'and it took a twentieth-century revolution'],
    [87.1, 'just to let people <b>write the way they talk</b>.'],
    [88.88, 'We take it for granted that we write our own language.'],
    [90.78, "For most of Chinese history, that <b>wasn't even allowed</b>."],
    [93.44, 'Wanna actually start learning <b>Chinese</b>?'],
    [95.3, 'Discover thousands of <b>free</b> exercises'],
    [96.88, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES
  // ============================================================
  const CUES = [
    // ---- HOOK ----
    [0.0, (i) => { enter('#sc-hook', 'fade', 650, i); }],
    [6.84, (i) => { $('#hk-bubble').classList.add('in'); $('#hk-say').classList.add('in'); }],
    [8.6, (i) => { $('#hk-paper').classList.add('in'); $('#hk-write').classList.add('in'); brushWrite('#hk-brush', i); hkScroll.writeOn({ instant: i, perGlyph: 230, stagger: 70 }); }],
    [9.5, (i) => { $('#hk-neq').classList.add('in'); gridKick(i); }],

    // ---- DRIFT (one word: written frozen vs spoken evolving) ----
    [10.32, (i) => { enter('#sc-drift', 'zoom-out', 1100, i); $('#dc-lt').classList.add('in'); $('.dl-left').classList.add('in'); dlt.writeOn({ instant: i, stagger: 70 }); }],
    [14.5, (i) => { $('#dc-rt').classList.add('in'); $('.dl-right').classList.add('in'); drt.writeOn({ instant: i, stagger: 70 }); }],
    [16.5, (i) => { linesDraw(i); }],
    [22.7, (i) => { $('#dc-rm').classList.add('in'); drm.writeOn({ instant: i, stagger: 55 }); }],
    [27.0, (i) => { $('#dc-rb').classList.add('in'); drb.writeOn({ instant: i, stagger: 60 }); }],
    [30.3, (i) => { $('#dc-lb').classList.add('in'); dlbO.writeOn({ instant: i, stagger: 60 }); }],
    [33.86, (i) => { if (!i) { pulse('#dc-rb'); } }],
    [35.56, (i) => { if (!i) { pulse('#dc-lb'); } }],

    // ---- DIGLOSSIA (street 白话 vs page 文言文) ----
    [41.72, (i) => { enter('#sc-dig', 'zoom-in', 1050, i); }],
    [43.28, (i) => { $('#dig-term').classList.add('in'); }],
    [44.38, (i) => { $('#dig-street').classList.add('in'); $('#dig-split').classList.add('in'); }],
    [45.9, (i) => { $('#dig-page').classList.add('in'); }],

    // ---- ELITE (a tiny scholarly few above the many) ----
    [55.8, (i) => { enter('#sc-elite', 'zoom-out', 1100, i); $('#el-top').classList.add('in'); $('#el-divide').classList.add('in'); }],
    [57.4, (i) => { $('#el-bottom').classList.add('in'); }],

    // ---- HU SHI / 1917 ----
    [62.54, (i) => { enter('#sc-huishi', 'drop', 1050, i); }],
    [63.8, (i) => { $('#hs-year').classList.add('in'); gridKick(i); }],
    [65.4, (i) => { $('#hs-name').classList.add('in'); }],
    [68.16, (i) => { $('#hs-paper').classList.add('in'); brushWrite('#hs-brush', i); hsScroll.writeOn({ instant: i, perGlyph: 260, stagger: 75 }); }],

    // ---- RECONVERGE (written adopts the living word) ----
    [72.88, (i) => { enter('#sc-drift', 'zoom-in', 1050, i, () => { dlbO.shedAll({ instant: i, stagger: 50 }); dlbN.writeOn({ instant: i, stagger: 60, delay: 200 }); $('#dlb-py').textContent = 'nǐ'; if (!i) { pulse('#dc-lb'); pulse('#dc-rb'); } }); }],

    // ---- NEWS: within a decade ----
    [75.68, (i) => { enter('#sc-news', 'zoom-out', 1100, i); $('#news-decade').classList.add('in'); decadeCount(i); }],
    [76.84, (i) => { $('#newspaper').classList.add('in'); }],
    [79.22, (i) => { $('#newspaper').classList.add('modern'); }],

    // ---- PAYOFF: ≠ → = ----
    [80.62, (i) => { enter('#sc-payoff', 'zoom-in', 1050, i); $('#pay-bubble').classList.add('in'); $('#pay-paper').classList.add('in'); payOld.writeOn({ instant: true }); $('#pay-rel').textContent = '≠'; $('#pay-rel').classList.add('in'); }],
    [84.7, (i) => { payOld.shedAll({ instant: i, stagger: 50 }); payNew.writeOn({ instant: i, perGlyph: 200, stagger: 65, delay: 200 }); }],
    [86.2, (i) => { const r = $('#pay-rel'); r.textContent = '='; r.classList.remove('eq'); if (!i) { void r.offsetWidth; } r.classList.add('eq'); gridKick(i); }],

    // ---- OUTRO ----
    [93.44, (i) => { enter('#sc-outro', 'zoom-out', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX
  // ============================================================
  const SFX = [
    [6.84, 'pop', 0.5], [8.6, 'pop', 0.4], [9.5, 'swoosh', 0.5],
    [10.32, 'swoosh', 0.5], [10.5, 'pop', 0.4], [14.5, 'pop', 0.4],
    [22.7, 'pop', 0.45], [27.0, 'pop', 0.5], [30.3, 'pop', 0.45],
    [41.72, 'swoosh', 0.5], [43.28, 'pop', 0.5], [44.38, 'pop', 0.45], [45.9, 'pop', 0.45],
    [55.8, 'swoosh', 0.5], [57.4, 'pop', 0.45],
    [62.54, 'swoosh', 0.5], [63.8, 'swoosh', 0.55], [65.4, 'pop', 0.45], [68.16, 'pop', 0.45],
    [72.88, 'swoosh', 0.55],
    [75.68, 'swoosh', 0.5], [75.78, 'ticking', 0.45], [76.84, 'pop', 0.45], [79.22, 'pop', 0.5],
    [80.62, 'swoosh', 0.5], [84.7, 'pop', 0.45], [86.2, 'swoosh', 0.55],
    [93.44, 'swoosh', 0.55],
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
    current = null; gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
    [hkScroll, dlt, drt, drm, drb, dlbO, dlbN, hsScroll, payOld, payNew].forEach((g) => g.reset());
    drm.teal(true); drb.teal(true); dlbN.teal(true); hsScroll.teal(true);
    // hook / payoff
    ['#hk-bubble', '#hk-paper', '#hk-neq', '#hk-say', '#hk-write', '#pay-bubble', '#pay-paper', '#pay-rel'].forEach((s) => $(s).classList.remove('in'));
    $('#hk-brush').classList.remove('in', 'write'); $('#hs-brush').classList.remove('in', 'write');
    $('#pay-rel').textContent = '≠'; $('#pay-rel').classList.remove('eq');
    // drift
    ['#dc-lt', '#dc-rt', '#dc-rm', '#dc-rb', '#dc-lb'].forEach((s) => { $(s).classList.remove('in', 'd-pulse'); });
    $('.dl-left').classList.remove('in'); $('.dl-right').classList.remove('in'); linesReset(); $('#dlb-py').textContent = 'rǔ';
    // diglossia
    ['#dig-term', '#dig-street', '#dig-page', '#dig-split'].forEach((s) => $(s).classList.remove('in'));
    // elite
    ['#el-top', '#el-divide', '#el-bottom'].forEach((s) => $(s).classList.remove('in'));
    // hu shi
    ['#hs-name', '#hs-year', '#hs-paper'].forEach((s) => $(s).classList.remove('in'));
    // news
    $('#news-decade').classList.remove('in'); $('#newspaper').classList.remove('in', 'modern'); cancelAnimationFrame(decRAF); $('#news-y').textContent = '1917';
    // outro
    $('#outro-ec').classList.remove('play');
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

  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });
  hardReset();
})();
