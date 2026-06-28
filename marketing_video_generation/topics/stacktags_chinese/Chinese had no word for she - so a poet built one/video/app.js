/* ============================================================
   "Chinese had no word for 'she' — so a poet built one"
   Audio-synced choreography over a persistent grid (faux-3D camera).
   HERO = a Chinese writing cell. The single character 他 (tā) is
   written, taken apart, and REBUILT: highlight the left "person"
   block 亻, lift it out, slot in "woman" 女 → 她. A slot-equation
   (亻+也=他 / 女+也=她) teaches that hanzi are built from parts.
   Minimal on-screen text: the only "words" are learned vocab.
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
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('transform', 'translate(0,1024) scale(1,-1)');
    g.setAttribute('class', 'hz-ink');
    const ink = strokes.map((d) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); g.appendChild(p); return p; });
    svg.appendChild(g);
    host.appendChild(svg);
    const N = ink.length;
    const drift = ink.map((_, i) => { const a = i * 2.3998; return { x: Math.cos(a) * 60, y: Math.sin(a) * 40 + 26, r: (i % 2 ? 1 : -1) * (10 + (i % 5) * 4) }; });
    let timers = [];
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };
    const setI = (fn) => { ink.forEach((p) => { p.style.transition = 'none'; }); fn(); void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; }); };
    return {
      svg, ink, N,
      teal(on) { svg.classList.toggle('teal', on !== false); },
      full() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 1; })); },
      hide() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      reset() { clearT(); svg.classList.remove('teal'); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; p.style.fill = ''; })); },
      writeOn(o) {
        o = o || {}; if (o.instant) { this.full(); return; }
        clearT();
        setI(() => ink.forEach((p) => { p.style.transform = 'translateY(16px)'; p.style.opacity = 0; }));
        const st = o.stagger || 80;
        ink.forEach((p, i) => timers.push(setTimeout(() => { p.style.transform = 'none'; p.style.opacity = 1; }, (o.delay || 0) + i * st)));
      },
    };
  }

  // --- per-stroke control (for the radical swap + the 亻-from-他 trick) ---
  function strokesWriteOn(inst, idxs, o) {
    o = o || {};
    idxs.forEach((idx, k) => {
      const p = inst.ink[idx];
      p.style.transition = 'none'; p.style.transform = 'translateY(16px)'; p.style.opacity = 0;
      void inst.svg.offsetWidth; p.style.transition = '';
      if (o.instant) { p.style.transform = 'none'; p.style.opacity = 1; return; }
      setTimeout(() => { p.style.transform = 'none'; p.style.opacity = 1; }, (o.delay || 0) + k * (o.stagger || 90));
    });
  }
  function strokesShow(inst, idxs) { idxs.forEach((i) => { const p = inst.ink[i]; p.style.transform = 'none'; p.style.opacity = 1; }); }
  function strokesHide(inst, idxs) { idxs.forEach((i) => { const p = inst.ink[i]; p.style.opacity = 0; }); }
  function strokesLift(inst, idxs, o) {
    o = o || {};
    idxs.forEach((i) => { const p = inst.ink[i]; if (o.instant) p.style.transition = 'none'; p.style.transform = 'translate(-46px,-170px) rotate(-14deg)'; p.style.opacity = 0; if (o.instant) { void inst.svg.offsetWidth; p.style.transition = ''; } });
  }
  function strokesTeal(inst, idxs, on) { idxs.forEach((i) => { inst.ink[i].style.fill = on ? 'var(--stk-teal-d)' : ''; }); }

  // ---- glyph instances ----
  const inHe = makeHanzi('#in-he', '他', { size: 320 });
  const prHe = makeHanzi('#pr-he', '他', { size: 240 });
  const ivHe = makeHanzi('#iv-he', '他', { size: 430 });
  const ivShe = makeHanzi('#iv-she', '她', { size: 430 });
  const eqRen = makeHanzi('#eq-ren', '他', { size: 96 });   // show only strokes [0,1] = 亻
  const eqYe1 = makeHanzi('#eq-ye1', '也', { size: 96 });
  const eqHe = makeHanzi('#eq-he', '他', { size: 96 });
  const eqNv = makeHanzi('#eq-nv', '女', { size: 96 });
  const eqYe2 = makeHanzi('#eq-ye2', '也', { size: 96 });
  const eqShe = makeHanzi('#eq-she', '她', { size: 96 });
  const puHe = makeHanzi('#pu-he', '他', { size: 230 });
  const puShe = makeHanzi('#pu-she', '她', { size: 230 });
  const puShe2 = makeHanzi('#pu-she2', '她', { size: 160 });
  const puShe3 = makeHanzi('#pu-she3', '她', { size: 220 });
  const ALLG = [inHe, prHe, ivHe, ivShe, eqRen, eqYe1, eqHe, eqNv, eqYe2, eqShe, puHe, puShe, puShe2, puShe3];
  const TEALG = [eqNv, eqShe, puShe, puShe2, puShe3];   // the "she" / "woman" glyphs read teal
  $('#eq-ye1').classList.add('shared'); $('#eq-ye2').classList.add('shared');

  // ============================================================
  // ICONS (self-coloured inline SVG)
  // ============================================================
  function bulbIcon() { const c = '#232B33', t = '#35A292'; return `<svg viewBox="0 0 150 200" width="150" height="200"><path d="M75,16 a54,54 0 0 1 32,97 q-9,7 -9,21 l-46,0 q0,-14 -9,-21 a54,54 0 0 1 32,-97 Z" fill="#fff" stroke="${c}" stroke-width="6"/><path d="M58,70 q17,-20 34,0 q-9,26 0,44" fill="none" stroke="${t}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="52" y="150" width="46" height="13" rx="4" fill="${c}"/><rect x="56" y="167" width="38" height="11" rx="4" fill="${c}"/></svg>`; }

  $('#pu-bulb').innerHTML = bulbIcon();
  const IMG = (n) => "url('assets/img/" + n + "_dashed.png')";
  document.documentElement.style.setProperty('--liu', IMG('liu'));
  document.documentElement.style.setProperty('--woman', IMG('woman'));
  document.documentElement.style.setProperty('--man', IMG('man'));
  document.documentElement.style.setProperty('--cat', IMG('cat'));

  // ============================================================
  // INVENTION — the radical swap mechanic
  // ============================================================
  function invWriteHe(i) { ivHe.writeOn({ instant: i, stagger: 85 }); ivShe.hide(); }
  function invPersonHi(i) { strokesTeal(ivHe, [0, 1], true); $('#iv-box').classList.add('in'); }
  function invSwapOut(i) { $('#iv-box').classList.add('lift'); strokesLift(ivHe, [0, 1], { instant: i }); }
  function invWoman(i) {
    // hand-off the shared 也 (他's copy out, 她's own in — both sit right, so it reads
    // as "the rest stays") while the new 女 writes into the freed left slot.
    strokesHide(ivHe, [2, 3, 4]);
    strokesShow(ivShe, [3, 4, 5]);
    strokesWriteOn(ivShe, [0, 1, 2], { stagger: 95, instant: i });
    $('#iv-lbl-woman').classList.add('in');
  }
  function invResult(i) {
    const c = $('#iv-cell'); c.classList.remove('pop'); if (!i) { void c.offsetWidth; c.classList.add('pop'); }
    $('#iv-lbl-woman').classList.remove('in');
  }
  function eqRow1(i) { $('#iv-eq1').classList.add('in'); strokesWriteOn(eqRen, [0, 1], { stagger: 70, instant: i }); eqYe1.writeOn({ instant: i }); eqHe.writeOn({ instant: i, delay: 180 }); }
  function eqRow2(i) { $('#iv-eq2').classList.add('in'); eqNv.writeOn({ instant: i }); eqYe2.writeOn({ instant: i }); eqShe.writeOn({ instant: i, delay: 180 }); }
  function eqSameSound(i) { $('#eq-py1').classList.add('pulse'); $('#eq-py2').classList.add('pulse'); if (!i) setTimeout(() => { $('#eq-py1').classList.remove('pulse'); $('#eq-py2').classList.remove('pulse'); }, 650); }

  // ============================================================
  // PUNCH 1 — "她 is everywhere" wash (static Noto SC glyphs)
  // ============================================================
  const EVPOS = [
    { x: 6, y: 14, s: 130, o: .9 }, { x: 28, y: 4, s: 84, o: .55 }, { x: 50, y: 18, s: 150, o: 1 },
    { x: 74, y: 6, s: 96, o: .6 }, { x: 90, y: 22, s: 120, o: .85 }, { x: 16, y: 40, s: 104, o: .7 },
    { x: 40, y: 48, s: 88, o: .5 }, { x: 62, y: 42, s: 128, o: .9 }, { x: 84, y: 52, s: 92, o: .6 },
    { x: 8, y: 66, s: 116, o: .8 }, { x: 32, y: 74, s: 96, o: .6 }, { x: 54, y: 70, s: 140, o: .95 },
    { x: 76, y: 78, s: 100, o: .7 }, { x: 92, y: 68, s: 84, o: .5 },
  ];
  (function buildEverywhere() {
    const host = $('#pu-every');
    EVPOS.forEach((p) => { const d = document.createElement('div'); d.className = 'ev-she'; d.textContent = '她'; d.style.left = p.x + '%'; d.style.top = p.y + '%'; d.style.fontSize = p.s + 'px'; d.style.setProperty('--evop', p.o); host.appendChild(d); });
  })();
  function everywhereGo(i) { $$('#pu-every .ev-she').forEach((el, k) => { if (i) el.classList.add('in'); else setTimeout(() => el.classList.add('in'), k * 55); }); }

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 600 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }

  function brushWrite(sel, instant) { const el = $(sel); if (!el) return; el.classList.add('in'); if (instant) return; el.classList.remove('write'); void el.offsetWidth; el.classList.add('write'); }
  function pulse(sel, cls) { const el = $(sel); if (!el) return; el.classList.add(cls || 'pulse'); }

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
  // SUBTITLES (verbatim, chunked)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 140);
  }
  const SUBS = [
    [0.0, 'Just a hundred years ago,'],
    [1.28, 'Chinese had <b>no word for “she.”</b>'],
    [3.14, 'A single word covered <b>he, she, and it</b>.'],
    [5.98, 'Then a poet sat down and <b>built a new one</b>.'],
    [8.84, 'For most of its history, Chinese got by'],
    [10.68, 'with <b>one</b> pronoun — <b>tā</b> —'],
    [12.28, 'for he, she, and it.'],
    [14.22, 'Nobody felt anything was <b>missing</b>.'],
    [16.36, 'Then, in the early twentieth century,'],
    [18.22, 'Chinese writers started translating'],
    [19.48, 'a <b>flood of Western books</b> —'],
    [20.74, 'full of “<b>he said</b>,” “<b>she said</b>.”'],
    [23.82, 'And suddenly, that catch-all pronoun'],
    [25.4, 'was a <b>problem</b>.'],
    [26.04, 'To translate faithfully, they needed a way'],
    [28.3, 'to tell <b>“he”</b> and <b>“she”</b> apart on the page.'],
    [31.46, 'So, around <b>1920</b>, a poet and linguist'],
    [34.0, 'named <b>Liu Bannong</b> did something elegant.'],
    [36.6, 'He took the existing character for “he” —'],
    [38.78, 'built with a little <b>“person” piece</b> on the left.'],
    [42.6, 'And he simply <b>swapped that piece out</b>,'],
    [44.36, 'replacing the “person” part'],
    [45.72, 'with the character for <b>“woman.”</b>'],
    [47.38, 'The result was a <b>brand-new character</b>,'],
    [49.2, 'meaning <b>“she.”</b>'],
    [50.36, 'And that shows how Chinese actually works.'],
    [53.1, '<b>Characters are built from parts</b> —'],
    [55.52, 'so you can engineer a whole new word'],
    [57.16, 'just by changing <b>one component</b>.'],
    [59.64, '<b>Person</b>, plus the rest, equals “he.”'],
    [62.34, '<b>Woman</b>, plus the rest, equals “she.”'],
    [65.34, '<b>Same sound</b>, new meaning,'],
    [67.06, '<b>built like Lego</b>.'],
    [68.38, 'It wasn’t loved by everyone —'],
    [69.82, 'some argued that giving women a separate pronoun,'],
    [71.74, 'while men kept the original <b>“default”</b> one,'],
    [73.96, 'was itself a statement.'],
    [75.56, 'But it <b>stuck</b>.'],
    [76.74, 'Today, <b>she is everywhere</b>.'],
    [78.34, 'So the Chinese word for “she”'],
    [79.42, 'is <b>younger than the lightbulb</b> —'],
    [80.96, 'and unlike almost every other word,'],
    [82.88, '<b>it has an author</b>.'],
    [84.14, 'Wanna actually start learning <b>Chinese</b>?'],
    [86.22, 'Discover thousands of <b>free</b> exercises'],
    [87.8, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — keyed to whisper word timings
  // ============================================================
  const CUES = [
    // ---- INTRO — empty → 他 flies in (top) → poet (left) → he/she/it = man/woman/cat ----
    [0.0, (i) => { enter('#sc-intro', 'fade', 650, i); }],                               // empty screen for the first 3s
    [3.14, (i) => { $('#in-cell').classList.add('in'); inHe.full(); }],                  // 他 flies in from the top, stays up
    [5.98, (i) => { $('#in-poet').classList.add('in'); }],                               // the poet flies in, to the left of 他
    [11.5, (i) => { $('#in-py').classList.add('in'); }],                                 // teach the sound: tā
    [12.48, (i) => { $('#ti-man').classList.add('in'); $('#ta-man').classList.add('in'); }],     // he → a man
    [12.98, (i) => { $('#ti-woman').classList.add('in'); $('#ta-woman').classList.add('in'); }], // she → a woman
    [13.62, (i) => { $('#ti-cat').classList.add('in'); $('#ta-cat').classList.add('in'); }],     // it → a cat

    // ---- PRESSURE — Western books → the same books, Chinese covers ; he/she → 他 ----
    [16.36, (i) => { enter('#sc-pressure', 'zoom-out', 1100, i); $$('#pr-western .book').forEach((b, k) => { if (i) b.classList.add('in'); else setTimeout(() => b.classList.add('in'), k * 130); }); }],
    [19.48, (i) => { $('#pr-trans').classList.add('in'); $$('#pr-chinese .book').forEach((b, k) => { if (i) b.classList.add('in'); else setTimeout(() => b.classList.add('in'), k * 130); }); }], // ...translated into Chinese
    [20.74, (i) => { $('#pr-he-tag').classList.add('in'); $('#pr-she-tag').classList.add('in'); $('#pr-cell').classList.add('in'); prHe.full(); }], // "he said" / "she said" + the one 他
    [21.9, (i) => { $('#pl-he').classList.add('in'); }],
    [22.96, (i) => { $('#pl-she').classList.add('in'); }],
    [23.82, (i) => { $('#pr-clash').classList.add('in'); gridKick(i); }],                // both collide on the SAME 他 = the problem

    // ---- INVENTION ----
    [31.46, (i) => { enter('#sc-invent', 'zoom-in', 1050, i, () => invWriteHe(i)); }],
    [34.0, (i) => { $('#iv-liu').classList.add('in'); }],                                // named Liu Bannong
    [36.6, (i) => { $('#iv-liu').classList.add('dock'); }],
    [39.96, (i) => invPersonHi(i)],                                                      // highlight the 亻 "person" block
    [43.12, (i) => { invSwapOut(i); gridKick(i); }],                                     // lift it out
    [44.36, (i) => invWoman(i)],                                                         // slot in 女
    [47.38, (i) => invResult(i)],                                                        // → a clean 她
    [53.1, (i) => eqRow1(i)],                                                            // 亻 + 也 = 他
    [59.64, (i) => { pulse('#eq-py1'); if (!i) setTimeout(() => $('#eq-py1').classList.remove('pulse'), 650); }],
    [62.34, (i) => eqRow2(i)],                                                           // 女 + 也 = 她
    [65.34, (i) => eqSameSound(i)],                                                      // same sound (both tā)

    // ---- PUNCH 1 ----
    [68.38, (i) => { enter('#sc-punch1', 'zoom-out', 1100, i); $$('#pu-vs .vs-item').forEach((v) => v.classList.add('in')); puHe.writeOn({ instant: i, stagger: 70 }); puShe.writeOn({ instant: i, stagger: 70 }); }],
    [76.74, (i) => { everywhereGo(i); }],                                                // 她 is everywhere

    // ---- PUNCH 2 ----
    [78.34, (i) => { enter('#sc-punch2', 'zoom-in', 1050, i); puShe2.writeOn({ instant: i, stagger: 70 }); }],
    [79.42, (i) => { $('#pu-young').classList.add('in'); $$('#pu-young .yo-item').forEach((it) => it.classList.add('in')); }],
    [82.88, (i) => { $('#pu-young').classList.remove('in'); $$('#pu-young .yo-item').forEach((it) => it.classList.remove('in')); $('#pu-by').classList.add('in'); puShe3.writeOn({ instant: i, stagger: 70 }); gridKick(i); }], // fade the lightbulb compare, bring up the author byline

    // ---- OUTRO ----
    [84.14, (i) => { enter('#sc-outro', 'zoom-out', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX  (swoosh only when the grid moves / an element flies in;
  //       pop per word/object click)
  // ============================================================
  const SFX = [
    [3.14, 'pop', 0.5],
    [5.98, 'pop', 0.5],
    [12.48, 'pop', 0.45], [12.98, 'pop', 0.45], [13.62, 'pop', 0.45],
    [16.36, 'swoosh', 0.5],
    [16.5, 'pop', 0.4], [16.63, 'pop', 0.4], [16.76, 'pop', 0.4],
    [19.48, 'pop', 0.42], [19.61, 'pop', 0.42], [19.74, 'pop', 0.42],
    [20.74, 'pop', 0.45],
    [23.82, 'swoosh', 0.5],
    [31.46, 'swoosh', 0.5],
    [34.0, 'pop', 0.5],
    [39.96, 'pop', 0.45],
    [43.12, 'swoosh', 0.5],
    [44.36, 'pop', 0.5],
    [47.38, 'pop', 0.55],
    [53.1, 'pop', 0.45],
    [62.34, 'pop', 0.45],
    [65.34, 'pop', 0.4],
    [68.38, 'swoosh', 0.5],
    [76.74, 'pop', 0.4], [77.0, 'pop', 0.4], [77.3, 'pop', 0.4],
    [78.34, 'swoosh', 0.5],
    [82.88, 'pop', 0.5],
    [84.14, 'swoosh', 0.55],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/tickingtimeline.mp3' };
  function playSfx(entry) { try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {} }

  // helper used by the very first cue (write 他 in the intro cell)
  function invInHe(i) { inHe.writeOn({ instant: i, stagger: 90 }); }

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
    ALLG.forEach((g) => g.reset());
    TEALG.forEach((g) => g.teal(true));
    // intro
    $('#in-cell').classList.remove('in'); $('#in-poet').classList.remove('in'); $('#in-py').classList.remove('in', 'pulse');
    $$('#in-trio .ti').forEach((t) => t.classList.remove('in'));
    $$('#in-arrows .ta').forEach((a) => a.classList.remove('in'));
    // pressure
    $$('#pr-western .book, #pr-chinese .book').forEach((b) => b.classList.remove('in'));
    $('#pr-trans').classList.remove('in');
    $('#pr-he-tag').classList.remove('in'); $('#pr-she-tag').classList.remove('in');
    $('#pr-cell').classList.remove('in'); $('#pr-clash').classList.remove('in');
    $('#pl-he').classList.remove('in'); $('#pl-she').classList.remove('in');
    // invention
    $('#iv-liu').classList.remove('in', 'dock'); $('#iv-box').classList.remove('in', 'lift');
    $('#iv-lbl-woman').classList.remove('in');
    $('#iv-eq1').classList.remove('in'); $('#iv-eq2').classList.remove('in');
    $('#eq-py1').classList.remove('pulse'); $('#eq-py2').classList.remove('pulse');
    // punch
    $$('#pu-vs .vs-item').forEach((v) => v.classList.remove('in'));
    $$('#pu-every .ev-she').forEach((el) => el.classList.remove('in'));
    $('#pu-young').classList.remove('in'); $$('#pu-young .yo-item').forEach((it) => it.classList.remove('in'));
    $('#pu-by').classList.remove('in');
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
