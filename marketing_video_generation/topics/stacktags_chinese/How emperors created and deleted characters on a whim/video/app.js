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
  const ruleWord = wordHanzi([['#rule-w0', '避'], ['#rule-w1', '讳']], 150);
  const ruleSample = makeHanzi('#rule-sample', '字', { size: 190 });
  const coEmp = wordHanzi([['#co-e0', '李'], ['#co-e1', '世'], ['#co-e2', '民']], 130);   // emperor's name (keeps 世)
  const coGod = wordHanzi([['#co-g0', '觀'], ['#co-g1', '世'], ['#co-g2', '音']], 130);   // goddess loses the shared 世
  const wzName = wordHanzi([['#wz-w0', '武'], ['#wz-w1', '則'], ['#wz-w2', '天']], 150);
  const zhSun = makeHanzi('#zh-sun', '日', { size: 150 });
  const zhMoon = makeHanzi('#zh-moon', '月', { size: 150 });
  const zhSky = makeHanzi('#zh-sky', '空', { size: 150 });
  const puGy = wordHanzi([['#pu-gy0', '觀'], ['#pu-gy1', '音']], 140); puGy.teal(true);

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
    [3.2, 'or <b>invent</b> a brand-new one — just by <b>decree</b>.'],
    [5.96, 'For centuries, there was a strict rule called the <b>naming taboo</b> —'],
    [8.84, '<b>避讳</b>, bìhuì.'],
    [9.74, 'You were not allowed to write the characters'],
    [11.74, "that appeared in the emperor's <b>personal name</b>."],
    [13.56, 'Out of respect, they had to be <b>avoided</b>, <b>swapped</b>,'],
    [16.1, 'or left with a <b>missing stroke</b>.'],
    [17.78, "The emperor's name literally <b>edited the language</b>."],
    [20.14, 'Take the most famous case.'],
    [21.78, 'The Tang emperor <b>Taizong</b> was named Li Shimin — <b>李世民</b> —'],
    [24.34, 'and his name contained the character <b>世</b>, shì.'],
    [26.66, 'Now, there was a hugely beloved figure of Buddhist <b>mercy</b>,'],
    [29.3, 'called <b>觀世音</b> — Guanshiyin.'],
    [30.5, 'But her name contained that <b>forbidden 世</b>.'],
    [32.38, 'So it was <b>dropped</b>.'],
    [33.62, '觀世音 became <b>觀音</b> — Guanyin.'],
    [35.44, 'And the shortened name <b>stuck</b>.'],
    [37.5, 'To this day, the goddess of mercy worshipped across China'],
    [40.54, 'is called <b>Guanyin</b> —'],
    [41.54, "renamed, essentially, by an emperor's name,"],
    [43.74, 'over a <b>thousand years</b> ago.'],
    [45.16, 'And it ran the <b>other way</b>, too —'],
    [46.98, 'rulers could <b>invent</b> characters.'],
    [48.58, 'You might wonder: there was a <b>female emperor</b>?'],
    [50.62, "Yes — and it was the only one in China's"],
    [52.56, '<b>five-thousand-year</b> history of dynasties:'],
    [54.74, '<b>Wu Zetian</b>.'],
    [55.94, 'And as women are creative in design,'],
    [57.68, 'she used her powers to invent a <b>whole set of new characters</b>.'],
    [60.48, 'The most famous was her own name:'],
    [62.44, '<b>曌</b>, zhào —'],
    [62.94, 'built from the characters for <b>sun</b> and <b>moon</b>,'],
    [65.5, 'shining over the <b>sky</b>.'],
    [67.1, '"Sun and moon in the <b>heavens</b>."'],
    [68.6, 'A character she designed, <b>for herself</b>.'],
    [71.14, 'Most of her inventions <b>vanished</b> after she died —'],
    [73.36, 'but the idea behind them was very <b>real</b>:'],
    [75.54, "the writing itself was the <b>ruler's to shape</b>."],
    [77.68, 'And sometimes, like with <b>Guanyin</b>,'],
    [79.78, "that royal edit is still on everyone's <b>lips</b>,"],
    [82.04, 'a <b>thousand years</b> later.'],
    [83.06, 'Wanna actually start learning <b>Chinese</b>?'],
    [85.58, 'Discover thousands of <b>free</b> exercises'],
    [87.56, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — keyed to whisper word timings
  // ============================================================
  const CUES = [
    // ---- HOOK: seal deletes 字, then mints 日 ----
    [0.0, (i) => { enter('#sc-hook', 'fade', 650, i); $('#hk-seal').classList.add('in'); if (i) hkDel.full(); else hkDel.writeOn({ stagger: 60, delay: 200 }); }],
    [1.68, (i) => { sealJab('#hk-seal', i); gridKick(i); if (i) hkDel.shedAll({ instant: true }); else onImpact(i, () => hkDel.shedAll({ stagger: 60 })); }],
    [3.34, (i) => { sealJab('#hk-seal', i); if (i) hkNew.full(); else onImpact(i, () => hkNew.writeOn({ stagger: 80 })); }],

    // ---- RULE: 避讳 + the missing-stroke demo ----
    [5.96, (i) => { enter('#sc-rule', 'zoom-out', 1100, i); }],
    [7.72, (i) => { $('#rule-word').classList.add('in'); ruleWord.writeOn({ instant: i, perGlyph: 240, stagger: 60 }); $('#rule-gloss').classList.add('in'); }],
    [8.84, (i) => { $('#rule-py').classList.add('in'); }],
    [9.74, (i) => { $('#rule-cell').classList.add('in'); $('#rule-seal').classList.add('in'); ruleSample.writeOn({ instant: i, stagger: 55 }); }],
    [16.9, (i) => { sealJab('#rule-seal', i); gridKick(i); if (i) ruleSample.shed([ruleSample.N - 1], { instant: true }); else onImpact(i, () => ruleSample.shed([ruleSample.N - 1])); }],
    [17.78, (i) => { sealJab('#rule-seal', i); gridKick(i); }],

    // ---- TAIZONG + example words; 觀世音→觀音 is the LAST example ----
    [20.14, (i) => { enter('#sc-collide', 'drop', 1050, i); $('#co-emp').classList.add('in'); }],
    [21.78, (i) => { $('#co-empcap').classList.add('in'); }],
    [23.44, (i) => { $('#co-empname').classList.add('in'); coEmp.writeOn({ instant: i, perGlyph: 215, stagger: 60 }); }],
    [24.34, (i) => { ['#co-ex0', '#co-ex1', '#co-ex2'].forEach((s, k) => { const e = $(s); if (i) e.classList.add('in'); else setTimeout(() => e.classList.add('in'), k * 230); }); }],
    [25.66, (i) => { coEmp.glyphs[1].teal(true); }],   // the 世 in the emperor's name lights up
    [26.66, (i) => { $('#co-god').classList.add('in'); }],
    [29.3, (i) => { $('#co-godname').classList.add('in'); coGod.writeOn({ instant: i, perGlyph: 215, stagger: 60 }); $('#co-py').classList.add('in'); $('#co-gloss').classList.add('in'); }],
    [31.86, (i) => { coGod.glyphs[1].teal(true); gridKick(i); }],   // the forbidden 世
    [32.76, (i) => { coGod.glyphs[1].shedAll({ instant: i, stagger: 45 }); gridKick(i); }],   // dropped
    [34.16, (i) => { $('#co-g1s').classList.add('collapsed'); }],   // 觀 + 音 close up
    [34.8, (i) => { $('#co-py').textContent = 'Guānyīn'; }],
    [38.56, (i) => { $('#co-god').classList.add('big'); }],   // the statue — still worshipped today

    // ---- WU ZETIAN: humour beat — the only female emperor (real portrait) ----
    [45.16, (i) => { enter('#sc-wuzetian', 'pan-right', 1100, i); }],
    [46.98, (i) => { $('#wz-fig').classList.add('in'); }],
    [54.74, (i) => { $('#wz-name').classList.add('in'); wzName.writeOn({ instant: i, perGlyph: 220, stagger: 60 }); gridKick(i); }],

    // ---- 曌: her "whole set" pops up (top, stays), 曌 built below, then the set vanishes ----
    [57.68, (i) => { enter('#sc-zhao', 'zoom-in', 1050, i); ['#ziv0', '#ziv1', '#ziv2', '#ziv3'].forEach((s, k) => { const e = $(s); if (i) e.classList.add('in'); else setTimeout(() => e.classList.add('in'), 350 + k * 190); }); }],
    [64.12, (i) => { $('#zh-sun-wrap').classList.add('lit'); zhSun.writeOn({ instant: i, stagger: 70 }); }],
    [64.68, (i) => { $('#zh-moon-wrap').classList.add('lit'); zhMoon.writeOn({ instant: i, stagger: 70 }); }],
    [66.12, (i) => { $('#zh-sky-wrap').classList.add('lit'); zhSky.writeOn({ instant: i, stagger: 70 }); }],
    [67.1, (i) => { $('#zh-asm').classList.add('merge'); $('#zh-final').classList.add('in'); $('#zh-py').classList.add('in'); $('#zh-gloss').classList.add('in'); gridKick(i); }],
    [68.6, (i) => { sealJab('#zh-seal', i); gridKick(i); }],
    [71.14, (i) => { ['#ziv0', '#ziv1', '#ziv2', '#ziv3'].forEach((s, k) => { const e = $(s); e.classList.add('in'); if (i) e.classList.add('gone'); else setTimeout(() => e.classList.add('gone'), k * 110); }); gridKick(i); }],

    // ---- PUNCHLINE: the enduring Guanyin (statue + 觀音) ----
    [77.68, (i) => { enter('#sc-punchline', 'zoom-out', 1100, i); $('#pu-statue').classList.add('in'); }],
    [78.92, (i) => { $('#pu-guanyin').classList.add('in'); puGy.writeOn({ instant: i, perGlyph: 200, stagger: 55 }); $('#pu-py').classList.add('in'); }],
    [79.78, (i) => { $('#pu-statue').classList.add('big'); if (!i) { const g = $('#pu-guanyin'); g.classList.remove('pulse'); void g.offsetWidth; g.classList.add('pulse'); } }],

    // ---- OUTRO ----
    [83.06, (i) => { enter('#sc-outro', 'zoom-in', 1050, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX  (swoosh when the grid moves / a default element animates;
  //       pop per character/object appearing)
  // ============================================================
  const SFX = [
    [1.68, 'swoosh', 0.5], [3.34, 'pop', 0.5],
    [5.96, 'swoosh', 0.5], [7.72, 'pop', 0.5], [16.9, 'pop', 0.45], [17.78, 'swoosh', 0.5],
    [20.14, 'swoosh', 0.5], [23.44, 'pop', 0.5], [24.34, 'pop', 0.4], [29.3, 'pop', 0.5], [32.76, 'swoosh', 0.5], [34.16, 'pop', 0.45],
    [45.16, 'swoosh', 0.5], [46.98, 'pop', 0.45], [54.74, 'pop', 0.5],
    [57.68, 'swoosh', 0.5], [58.05, 'pop', 0.4], [64.12, 'pop', 0.5], [64.68, 'pop', 0.5], [66.12, 'pop', 0.5],
    [67.1, 'swoosh', 0.55], [68.6, 'swoosh', 0.55], [71.14, 'swoosh', 0.5],
    [77.68, 'swoosh', 0.5], [78.92, 'pop', 0.5],
    [83.06, 'swoosh', 0.55],
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
    [hkDel, hkNew, ruleWord, ruleSample, coEmp, coGod, wzName, zhSun, zhMoon, zhSky, puGy].forEach((g) => g.reset());
    puGy.teal(true);
    // seals
    document.querySelectorAll('.seal').forEach((el) => el.classList.remove('in', 'jab', 'dim'));
    // hook
    $('#hk-cell').classList.remove('out');
    // rule
    $('#rule-word').classList.remove('in'); $('#rule-py').classList.remove('in'); $('#rule-gloss').classList.remove('in'); $('#rule-cell').classList.remove('in');
    // taizong + example words; 觀世音→觀音
    $('#co-emp').classList.remove('in'); $('#co-empname').classList.remove('in'); $('#co-empcap').classList.remove('in');
    ['#co-ex0', '#co-ex1', '#co-ex2'].forEach((s) => $(s).classList.remove('in', 'fade'));
    $('#co-godname').classList.remove('in'); $('#co-py').classList.remove('in'); $('#co-py').textContent = 'Guānshìyīn'; $('#co-gloss').classList.remove('in');
    $('#co-g1s').classList.remove('collapsed'); $('#co-god').classList.remove('in', 'big');
    // wu zetian
    $('#wz-fig').classList.remove('in'); $('#wz-name').classList.remove('in');
    // zhao
    $('#zh-asm').classList.remove('merge'); $('#zh-final').classList.remove('in'); $('#zh-py').classList.remove('in'); $('#zh-gloss').classList.remove('in');
    document.querySelectorAll('.asm-part').forEach((el) => el.classList.remove('lit'));
    ['#ziv0', '#ziv1', '#ziv2', '#ziv3'].forEach((s) => $(s).classList.remove('in', 'gone'));
    // punchline
    $('#pu-statue').classList.remove('in', 'big'); $('#pu-guanyin').classList.remove('in', 'pulse'); $('#pu-py').classList.remove('in');
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
