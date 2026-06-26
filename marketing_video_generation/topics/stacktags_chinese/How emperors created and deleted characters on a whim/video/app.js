/* ============================================================
   "How emperors created and deleted characters on a whim"
   Audio-synced choreography over a persistent grid (faux-3D camera).
   Spine: the imperial SEAL of decree. It DELETES (a character crumbles
   stroke by stroke) and CREATES (a character writes itself on). The
   naming taboo 避讳 drops the forbidden 世 from 觀世音 → 觀音 (Guanyin);
   empress Wu Zetian mints 曌 (sun 日 + moon 月 over sky 空).
   On-screen text = only the taught vocab; the narration is the subtitle.
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
    const size = opts.size || 120;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('class', 'hz');
    function layer(cls) {
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('transform', 'translate(0,1024) scale(1,-1)');
      g.setAttribute('class', cls);
      const ps = strokes.map((d) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); g.appendChild(p); return p; });
      svg.appendChild(g); return ps;
    }
    const ink = layer('hz-ink');
    host.appendChild(svg);
    const N = ink.length;
    const drift = ink.map((_, i) => { const a = i * 2.3998; return { x: Math.cos(a) * 70, y: Math.sin(a) * 44 + 30, r: (i % 2 ? 1 : -1) * (10 + (i % 5) * 5) }; });
    let timers = [];
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };
    const setI = (fn) => { ink.forEach((p) => { p.style.transition = 'none'; }); fn(); void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; }); };
    const fall = (i) => { const d = drift[i]; ink[i].style.transform = `translate(${d.x}px,${d.y}px) rotate(${d.r}deg)`; ink[i].style.opacity = 0; };
    return {
      svg, ink, N,
      teal(on) { svg.classList.toggle('teal', on !== false); },
      full() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 1; })); },
      hide() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      reset() { clearT(); svg.classList.remove('teal'); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      writeOn(o) {
        o = o || {}; if (o.instant) { this.full(); return; }
        clearT();
        setI(() => ink.forEach((p) => { p.style.transform = 'translateY(16px)'; p.style.opacity = 0; }));
        const st = o.stagger || 70;
        ink.forEach((p, i) => timers.push(setTimeout(() => { p.style.transform = 'none'; p.style.opacity = 1; }, (o.delay || 0) + i * st)));
      },
      shedAll(o) {
        o = o || {}; const st = o.stagger || 55;
        if (o.instant) { setI(() => ink.forEach((_, i) => fall(i))); return; }
        ink.forEach((_, i) => timers.push(setTimeout(() => fall(i), (o.delay || 0) + i * st)));
      },
      // shed only specific stroke indices (e.g. the "missing stroke" demo)
      shed(idxs, o) {
        o = o || {}; const st = o.stagger || 60;
        if (o.instant) { setI(() => idxs.forEach((i) => fall(i))); return; }
        idxs.forEach((i, k) => timers.push(setTimeout(() => fall(i), (o.delay || 0) + k * st)));
      },
    };
  }

  // a WORD = several stroke-data glyphs that write on left → right
  function wordHanzi(pairs, size) {
    const glyphs = pairs.map(([sel, ch]) => makeHanzi(sel, ch, { size }));
    return {
      glyphs,
      writeOn(o) { o = o || {}; if (o.instant) { glyphs.forEach((g) => g.full()); return; } glyphs.forEach((g, k) => g.writeOn({ stagger: o.stagger || 70, delay: (o.delay || 0) + k * (o.perGlyph || 240) })); },
      full() { glyphs.forEach((g) => g.full()); },
      hide() { glyphs.forEach((g) => g.hide()); },
      reset() { glyphs.forEach((g) => g.reset()); },
      shedAll(o) { o = o || {}; glyphs.forEach((g, k) => g.shedAll({ stagger: o.stagger || 45, delay: (o.delay || 0) + k * 110, instant: o.instant })); },
      teal(on) { glyphs.forEach((g) => g.teal(on)); },
    };
  }

  // ============================================================
  // FLAT FIGURES (rulers) + the imperial SEAL (self-coloured inline SVG)
  // ============================================================
  function figSVG(o) {
    o = o || {}; const ink = o.accent === 'teal' ? '#119271' : '#232B33'; const acc = '#119271';
    const w = o.w || 200, h = Math.round(w * 1.22);
    let s = `<svg class="fig-svg" viewBox="0 0 200 244" width="${w}" height="${h}">`;
    s += `<path d="M40,244 Q40,132 100,132 Q160,132 160,244 Z" fill="${ink}"/>`;
    // robe collar (crossed-lapel V) — the imperial garment, drawn on the chest
    if (o.robe) s += `<path d="M76,138 L100,182 L124,138" fill="none" stroke="${acc}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<circle cx="100" cy="62" r="42" fill="${ink}"/>`;
    if (o.crown === 'emperor') {
      // 冕旒: flat board (mian) with bead-strings (liu) draping over the forehead
      s += `<rect x="38" y="2" width="124" height="13" rx="3" fill="${acc}"/>`;
      s += `<g fill="${acc}">`;
      [60, 80, 100, 120, 140].forEach((bx) => { s += `<circle cx="${bx}" cy="24" r="3.6"/><circle cx="${bx}" cy="35" r="3.6"/><circle cx="${bx}" cy="46" r="3.6"/>`; });
      s += `</g>`;
    }
    if (o.crown === 'empress') {
      // 鳳冠: beaded phoenix headdress
      s += `<g fill="${acc}"><circle cx="64" cy="18" r="7"/><circle cx="82" cy="9" r="8"/><circle cx="100" cy="4" r="9"/><circle cx="118" cy="9" r="8"/><circle cx="136" cy="18" r="7"/></g>`;
      s += `<rect x="62" y="20" width="76" height="14" rx="7" fill="${acc}"/>`;
    }
    s += `</svg>`; return s;
  }
  function sealSVG() {
    return `<svg class="seal-svg" viewBox="0 0 150 210" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`
      + `<rect x="62" y="14" width="26" height="62" rx="13" fill="#0f8268"/>`
      + `<rect x="42" y="74" width="66" height="20" rx="9" fill="#0c6f58"/>`
      + `<rect x="20" y="92" width="110" height="100" rx="18" fill="#119271"/>`
      + `<g stroke="#eafaf4" stroke-width="7" stroke-linecap="round" fill="none">`
      + `<path d="M46 162 h58"/><path d="M58 120 v52"/><path d="M92 120 v52"/><path d="M58 142 h34"/>`
      + `</g></svg>`;
  }

  // ---- inject seals; figures are real cut-out <img> portraits (assets/img) ----
  document.querySelectorAll('.seal').forEach((el) => { el.innerHTML = sealSVG(); });

  // ---- glyph instances ----
  const hkDel = makeHanzi('#hk-del', '字', { size: 260 });   // hook: a character, deleted
  const hkNew = makeHanzi('#hk-new', '日', { size: 260 });   // hook: a new character, minted
  const hkT1a = makeHanzi('#hk-t1g', '觀', { size: 118 });   // teaser: 觀音 (goddess)
  const hkT1b = makeHanzi('#hk-t1g', '音', { size: 118 });
  hkT1a.teal(true); hkT1b.teal(true);
  const ruleWord = wordHanzi([['#rule-w0', '避'], ['#rule-w1', '讳']], 150);
  const ruleSample = makeHanzi('#rule-sample', '字', { size: 190 });
  const coEmp = wordHanzi([['#co-e0', '李'], ['#co-e1', '世'], ['#co-e2', '民']], 130);   // emperor's name (keeps 世)
  const coGod = wordHanzi([['#co-g0', '觀'], ['#co-g1', '世'], ['#co-g2', '音']], 130);   // goddess loses the shared 世
  const wzName = wordHanzi([['#wz-w0', '武'], ['#wz-w1', '則'], ['#wz-w2', '天']], 150);
  const zhSun = makeHanzi('#zh-sun', '日', { size: 150 });
  const zhMoon = makeHanzi('#zh-moon', '月', { size: 150 });
  const zhSky = makeHanzi('#zh-sky', '空', { size: 150 });
  const puDel = makeHanzi('#pu-delg', '世', { size: 170 });
  const puGy = wordHanzi([['#pu-gy0', '觀'], ['#pu-gy1', '音']], 130); puGy.teal(true);

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 600 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }

  // ---- the seal "jab" (press to touch, auto-retract) ----
  function sealJab(sel, instant) { const el = $(sel); if (!el) return; el.classList.add('in'); if (instant) return; el.classList.remove('jab'); void el.offsetWidth; el.classList.add('jab'); }
  // run a deferred impact effect only on forward play (seek applies end-state directly)
  function onImpact(instant, fn, ms) { if (instant) return; setTimeout(fn, ms == null ? 250 : ms); }

  // small transient grid "kick" to sell an impact (justifies a swoosh)
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
  function enter(el, mode, dur, instant, onArrive) { el = typeof el === 'string' ? $(el) : el; if (instant) { showInstant(el); if (onArrive) onArrive(); return; } depthGo(el, mode, dur, onArrive); }

  // ============================================================
  // SUBTITLES (verbatim, chunked; taught vocab shown as hanzi)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 140);
  }
  const SUBS = [
    [0.0, 'In imperial China, a ruler could <b>delete</b> a word from the language —'],
    [3.64, 'or <b>invent</b> a brand-new one — just by <b>decree</b>.'],
    [6.98, "One emperor's name quietly <b>renamed</b> China's most beloved <b>goddess</b> forever."],
    [10.78, 'And an <b>empress</b> designed a character for herself that still exists today.'],
    [14.56, 'For centuries, there was a strict rule called the <b>naming taboo</b> —'],
    [18.28, '<b>避讳</b>, bìhuì.'],
    [18.96, 'You were not allowed to write the characters'],
    [20.58, "that appeared in the emperor's <b>personal name</b>."],
    [22.68, 'Out of respect, they had to be <b>avoided</b>, <b>swapped</b>,'],
    [25.38, 'or left with a <b>missing stroke</b>.'],
    [26.58, "The emperor's name literally <b>edited the language</b>."],
    [30.0, 'Take the most famous case.'],
    [31.64, 'The Tang emperor <b>Taizong</b> was named Li Shimin — <b>李世民</b> —'],
    [34.1, 'and his name contained the character <b>世</b>, shì.'],
    [36.18, 'Now, there was a hugely beloved figure of Buddhist <b>mercy</b>,'],
    [39.8, 'called <b>觀世音</b> — Guanshiyin.'],
    [41.16, 'But her name contained that <b>forbidden 世</b>.'],
    [43.6, 'So it was <b>dropped</b>.'],
    [45.04, '觀世音 became <b>觀音</b> — Guanyin.'],
    [47.06, 'And the shortened name <b>stuck</b>.'],
    [48.98, 'To this day, the goddess of mercy worshipped across China'],
    [51.94, 'is called <b>Guanyin</b> —'],
    [53.58, "renamed, essentially, by an emperor's name,"],
    [55.94, 'over a <b>thousand years</b> ago.'],
    [57.74, 'And it ran the <b>other way</b>, too —'],
    [59.4, 'rulers could <b>invent</b> characters.'],
    [60.98, 'The boldest case: <b>Wu Zetian</b>,'],
    [63.16, 'the only woman ever to rule China as <b>emperor</b> in her own right.'],
    [66.26, 'She created a whole set of <b>brand-new characters</b>.'],
    [68.72, 'The most famous was her own name:'],
    [70.54, '<b>曌</b>, zhào —'],
    [71.34, 'built from the characters for <b>sun</b> and <b>moon</b>,'],
    [73.42, 'shining over the <b>sky</b>.'],
    [75.02, '"Sun and moon in the <b>heavens</b>."'],
    [76.44, 'A character she designed, <b>for herself</b>.'],
    [78.92, 'Most of her inventions <b>vanished</b> after she died —'],
    [81.34, 'but the idea behind them was very <b>real</b>:'],
    [83.3, "the writing itself was the <b>ruler's to shape</b>."],
    [86.2, 'We tend to think a language <b>belongs to its people</b>.'],
    [88.74, 'For much of Chinese history, it also belonged'],
    [90.62, 'to whoever sat on the <b>throne</b> —'],
    [92.48, 'someone who could <b>erase</b> a character,'],
    [94.22, 'or <b>mint</b> one, with a word.'],
    [96.6, 'And sometimes, like with <b>Guanyin</b>,'],
    [98.78, "that royal edit is still on everyone's <b>lips</b>,"],
    [101.22, 'a <b>thousand years</b> later.'],
    [102.76, 'Wanna actually start learning <b>Chinese</b>?'],
    [104.74, 'Discover thousands of <b>free</b> exercises'],
    [106.86, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — keyed to whisper word timings
  // ============================================================
  const CUES = [
    // ---- HOOK: seal deletes 字, then mints 日; two teasers ----
    [0.0, (i) => { enter('#sc-hook', 'fade', 650, i); $('#hk-seal').classList.add('in'); if (i) hkDel.full(); else hkDel.writeOn({ stagger: 60, delay: 200 }); }],
    [1.84, (i) => { sealJab('#hk-seal', i); gridKick(i); if (i) hkDel.shedAll({ instant: true }); else onImpact(i, () => hkDel.shedAll({ stagger: 60 })); }],
    [3.96, (i) => { sealJab('#hk-seal', i); if (i) hkNew.full(); else onImpact(i, () => hkNew.writeOn({ stagger: 80 })); }],
    [6.98, (i) => { $('#hk-t1').classList.add('in'); hkT1a.full(); hkT1b.full(); $('#hk-cell').classList.add('out'); $('#hk-seal').classList.remove('in'); }],
    [10.78, (i) => { $('#hk-t2').classList.add('in'); }],

    // ---- RULE: 避讳 + the missing-stroke demo ----
    [14.56, (i) => { enter('#sc-rule', 'zoom-out', 1100, i); }],
    [16.72, (i) => { $('#rule-word').classList.add('in'); ruleWord.writeOn({ instant: i, perGlyph: 240, stagger: 60 }); }],
    [17.06, (i) => { $('#rule-gloss').classList.add('in'); }],
    [18.28, (i) => { $('#rule-py').classList.add('in'); }],
    [18.96, (i) => { $('#rule-cell').classList.add('in'); $('#rule-seal').classList.add('in'); ruleSample.writeOn({ instant: i, stagger: 55 }); }],
    [26.2, (i) => { sealJab('#rule-seal', i); gridKick(i); if (i) ruleSample.shed([ruleSample.N - 1], { instant: true }); else onImpact(i, () => ruleSample.shed([ruleSample.N - 1])); }],
    [27.2, (i) => { sealJab('#rule-seal', i); gridKick(i); }],

    // ---- COLLISION: emperor (top) & goddess (bottom) share 世; his claim
    //      travels down the link and forces her 世 out → 觀音 ----
    [30.0, (i) => { enter('#sc-collide', 'drop', 1050, i); $('#co-emp').classList.add('in'); }],
    [31.64, (i) => { $('#co-empcap').classList.add('in'); }],
    [33.0, (i) => { $('#co-empname').classList.add('in'); coEmp.writeOn({ instant: i, perGlyph: 215, stagger: 60 }); }],
    [35.06, (i) => { coEmp.glyphs[1].teal(true); }],   // his 世 — claimed by the throne
    [36.18, (i) => { $('#co-god').classList.add('in'); }],
    [39.86, (i) => { $('#co-godname').classList.add('in'); coGod.writeOn({ instant: i, perGlyph: 215, stagger: 60 }); $('#co-py').classList.add('in'); $('#co-gloss').classList.add('in'); }],
    [40.9, (i) => { $('#co-link').classList.add('in'); coGod.glyphs[1].teal(true); }],   // the SAME 世 in both names → link
    [42.32, (i) => { const l = $('#co-link'); l.classList.add('charge'); if (!i) { l.classList.remove('charge'); void l.offsetWidth; l.classList.add('charge'); } gridKick(i); }],
    [44.14, (i) => { coGod.glyphs[1].shedAll({ instant: i, stagger: 45 }); $('#co-link').classList.remove('in', 'charge'); gridKick(i); }],
    [45.7, (i) => { $('#co-g1s').classList.add('collapsed'); }],
    [46.12, (i) => { $('#co-py').textContent = 'Guānyīn'; }],
    [50.1, (i) => { $('#co-god').classList.add('big'); }],   // the statue — still worshipped today

    // ---- WU ZETIAN: the empress who minted her own name (real portrait) ----
    [57.74, (i) => { enter('#sc-wuzetian', 'pan-right', 1100, i); }],
    [59.4, (i) => { gridKick(i); }],
    [60.98, (i) => { $('#wz-fig').classList.add('in'); }],
    [62.3, (i) => { $('#wz-name').classList.add('in'); wzName.writeOn({ instant: i, perGlyph: 220, stagger: 60 }); }],

    // ---- 曌 ASSEMBLY: 日 + 月 over 空 → 曌 ----
    [68.72, (i) => { enter('#sc-zhao', 'zoom-in', 1050, i); }],
    [72.08, (i) => { $('#zh-sun-wrap').classList.add('lit'); zhSun.writeOn({ instant: i, stagger: 70 }); }],
    [72.66, (i) => { $('#zh-moon-wrap').classList.add('lit'); zhMoon.writeOn({ instant: i, stagger: 70 }); }],
    [74.02, (i) => { $('#zh-sky-wrap').classList.add('lit'); zhSky.writeOn({ instant: i, stagger: 70 }); }],
    [75.02, (i) => { $('#zh-asm').classList.add('merge'); $('#zh-final').classList.add('in'); $('#zh-py').classList.add('in'); $('#zh-gloss').classList.add('in'); gridKick(i); }],
    [76.44, (i) => { sealJab('#zh-seal', i); gridKick(i); }],
    [78.92, (i) => { ['#zo0', '#zo1', '#zo2'].forEach((s, k) => { const e = $(s); if (i) e.classList.add('in'); else setTimeout(() => e.classList.add('in'), k * 130); }); }],
    [80.64, (i) => { ['#zo0', '#zo1', '#zo2'].forEach((s, k) => { const e = $(s); e.classList.add('in'); if (i) e.classList.add('gone'); else setTimeout(() => e.classList.add('gone'), k * 130); }); }],

    // ---- PUNCHLINE: throne erases (世) / mints (曌); Guanyin endures ----
    [86.2, (i) => { enter('#sc-punchline', 'zoom-out', 1100, i); $('#pu-seal').classList.add('in'); }],
    [88.74, (i) => { $('#pu-del').classList.add('in'); puDel.writeOn({ instant: i, stagger: 55 }); $('#pu-mint').classList.add('in'); }],
    [93.12, (i) => { $('#pu-del').classList.add('erased'); if (!i) puDel.shedAll({ stagger: 50 }); else puDel.shedAll({ instant: true }); gridKick(i); }],
    [94.4, (i) => { $('#pu-mint').classList.add('minted'); }],
    [97.92, (i) => { $('#pu-statue').classList.add('in'); $('#pu-guanyin').classList.add('in'); puGy.writeOn({ instant: i, perGlyph: 200, stagger: 55 }); $('#pu-py').classList.add('in'); $('#pu-seal').classList.add('hide'); $('#pu-mint').classList.add('hide'); $('#pu-del').classList.add('hide'); if (!i) { const g = $('#pu-guanyin'); g.classList.remove('pulse'); void g.offsetWidth; g.classList.add('pulse'); } }],
    [101.22, (i) => { if (!i) { const g = $('#pu-guanyin'); g.classList.remove('pulse'); void g.offsetWidth; g.classList.add('pulse'); } }],

    // ---- OUTRO ----
    [102.76, (i) => { enter('#sc-outro', 'zoom-in', 1050, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX  (swoosh when the grid moves / a default element animates;
  //       pop per character/object appearing)
  // ============================================================
  const SFX = [
    [1.84, 'swoosh', 0.5], [3.96, 'pop', 0.5],
    [6.98, 'pop', 0.5], [10.78, 'pop', 0.5],
    [14.56, 'swoosh', 0.5], [16.72, 'pop', 0.5], [26.2, 'pop', 0.45], [27.2, 'swoosh', 0.5],
    [30.0, 'swoosh', 0.5], [33.0, 'pop', 0.5], [35.7, 'swoosh', 0.55],
    [39.28, 'swoosh', 0.5], [39.86, 'pop', 0.5], [44.14, 'swoosh', 0.5], [46.12, 'pop', 0.45],
    [57.74, 'swoosh', 0.5], [59.4, 'swoosh', 0.55], [62.3, 'pop', 0.5], [63.16, 'pop', 0.45],
    [68.72, 'swoosh', 0.5], [72.08, 'pop', 0.5], [72.66, 'pop', 0.5], [74.02, 'pop', 0.5],
    [75.02, 'swoosh', 0.55], [76.44, 'swoosh', 0.55], [78.92, 'pop', 0.45], [80.64, 'swoosh', 0.5],
    [86.2, 'swoosh', 0.5], [93.12, 'swoosh', 0.5], [94.4, 'pop', 0.5], [97.92, 'pop', 0.5],
    [102.76, 'swoosh', 0.55],
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
    [hkDel, hkNew, hkT1a, hkT1b, ruleWord, ruleSample, coEmp, coGod, wzName, zhSun, zhMoon, zhSky, puDel, puGy].forEach((g) => g.reset());
    hkT1a.teal(true); hkT1b.teal(true); puGy.teal(true);
    // seals
    document.querySelectorAll('.seal').forEach((el) => el.classList.remove('in', 'jab', 'dim'));
    // hook
    $('#hk-t1').classList.remove('in'); $('#hk-t2').classList.remove('in'); $('#hk-cell').classList.remove('out');
    // rule
    $('#rule-word').classList.remove('in'); $('#rule-py').classList.remove('in'); $('#rule-gloss').classList.remove('in'); $('#rule-cell').classList.remove('in');
    // collision (emperor + goddess share 世)
    $('#co-emp').classList.remove('in'); $('#co-empname').classList.remove('in'); $('#co-empcap').classList.remove('in');
    $('#co-godname').classList.remove('in'); $('#co-py').classList.remove('in'); $('#co-py').textContent = 'Guānshìyīn'; $('#co-gloss').classList.remove('in');
    $('#co-g1s').classList.remove('collapsed'); $('#co-god').classList.remove('in', 'big'); $('#co-link').classList.remove('in', 'charge');
    // wu zetian
    $('#wz-fig').classList.remove('in'); $('#wz-name').classList.remove('in');
    // zhao
    $('#zh-asm').classList.remove('merge'); $('#zh-final').classList.remove('in'); $('#zh-py').classList.remove('in'); $('#zh-gloss').classList.remove('in');
    document.querySelectorAll('.asm-part').forEach((el) => el.classList.remove('lit'));
    ['#zo0', '#zo1', '#zo2'].forEach((s) => $(s).classList.remove('in', 'gone'));
    // punchline
    $('#pu-del').classList.remove('in', 'erased', 'hide'); $('#pu-mint').classList.remove('in', 'minted', 'dim', 'hide'); $('#pu-seal').classList.remove('hide'); $('#pu-statue').classList.remove('in'); $('#pu-guanyin').classList.remove('in', 'pulse'); $('#pu-py').classList.remove('in');
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
