/* ============================================================
   "China is forgetting how to write" — choreography
   Faux-3D camera over a persistent grid, audio-synced.
   The hero spine is ONE character (餐) rendered from real stroke
   data: recall fades (ink strokes assemble, then crumble away
   stroke by stroke) while recognition stays (a faint ghost layer).
   Around it: a fluent reading sweep (hook), the taught idiom
   提笔忘字, a phone IME, and a keyboard that types the character
   the hand can no longer write. Minimal on-screen text.
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
  // HERO CHARACTER renderer (from makemeahanzi stroke paths)
  // ============================================================
  const HANZI = window.HANZI_CAN || [];
  const SVGNS = 'http://www.w3.org/2000/svg';
  function makeHanzi(host, opts) {
    opts = opts || {};
    const size = opts.size || 540;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('class', 'hz');
    function layer(cls) {
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('transform', 'translate(0,1024) scale(1,-1)');
      g.setAttribute('class', cls);
      const ps = HANZI.map((d) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); g.appendChild(p); return p; });
      svg.appendChild(g); return ps;
    }
    layer('hz-ghost');
    const ink = layer('hz-ink');
    host.appendChild(svg);
    const N = ink.length;
    const drift = ink.map((_, i) => { const a = i * 2.3998; return { x: Math.cos(a) * 90, y: Math.sin(a) * 52 + 46, r: (i % 2 ? 1 : -1) * (10 + (i % 6) * 4) }; });
    let timers = [];
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };
    const snap = (state) => {
      ink.forEach((p) => { p.style.transition = 'none'; p.style.transform = 'none'; p.style.opacity = (state === 'full' ? 1 : 0); });
      void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; });
    };
    return {
      el: svg, ink,
      full() { clearT(); snap('full'); },
      hide() { clearT(); snap('hide'); },
      partial(n) { clearT(); ink.forEach((p, i) => { p.style.transition = 'none'; p.style.transform = 'none'; p.style.opacity = (i < n ? 1 : 0); }); void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; }); },
      restore() { clearT(); ink.forEach((p) => { p.style.transition = 'opacity .2s ease, transform .22s ease'; p.style.transform = 'none'; p.style.opacity = 1; }); },
      assemble(o) {
        o = o || {}; if (o.instant) { this.full(); return; }
        clearT();
        ink.forEach((p) => { p.style.transition = 'none'; p.style.transform = 'translateY(22px)'; p.style.opacity = 0; });
        void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; });
        const st = o.stagger || 85;
        ink.forEach((p, i) => { timers.push(setTimeout(() => { p.style.transform = 'none'; p.style.opacity = 1; }, i * st)); });
      },
      crumbleList(idxs, o) {
        o = o || {}; const st = o.stagger || 85;
        const fall = (i) => { const d = drift[i]; ink[i].style.transform = `translate(${d.x}px,${d.y}px) rotate(${d.r}deg)`; ink[i].style.opacity = 0; };
        if (o.instant) { idxs.forEach((i) => { ink[i].style.transition = 'none'; fall(i); }); void svg.offsetWidth; idxs.forEach((i) => { ink[i].style.transition = ''; }); return; }
        idxs.forEach((i, k) => { timers.push(setTimeout(() => fall(i), k * st)); });
      },
      crumble(o) { const all = []; for (let i = 0; i < N; i++) all.push(i); this.crumbleList(all, o); },
      reset() { clearT(); ink.forEach((p) => { p.style.transition = 'none'; p.style.transform = 'none'; p.style.opacity = 0; }); void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; }); },
    };
  }
  const hzRecall = makeHanzi($('#rc-char'), { size: 560 });
  const hzHistory = makeHanzi($('#hs-char'), { size: 560 });
  const rcScreen = $('#rc-screenchar'); if (rcScreen) rcScreen.textContent = '餐';

  // ============================================================
  // HOOK reading line — a real everyday sentence, read fluently
  // (今everyday: "I read and study every day")
  // ============================================================
  const READ_SENTENCE = '我每天都看书学习';
  const rdChars = [];
  (function buildRead() {
    const host = $('#hk-read'); if (!host) return;
    READ_SENTENCE.split('').forEach((ch) => { const s = document.createElement('span'); s.className = 'rd-char'; s.textContent = ch; host.appendChild(s); rdChars.push(s); });
  })();
  let rdTimers = [];
  function readSweep(instant) {
    rdTimers.forEach(clearTimeout); rdTimers = [];
    if (instant) { rdChars.forEach((s) => { s.classList.remove('lit'); s.classList.add('seen'); }); return; }
    rdChars.forEach((s) => s.classList.remove('lit', 'seen'));
    rdChars.forEach((s, i) => {
      rdTimers.push(setTimeout(() => s.classList.add('lit'), 240 + i * 158));
      rdTimers.push(setTimeout(() => { s.classList.remove('lit'); s.classList.add('seen'); }, 240 + i * 158 + 300));
    });
  }
  function readReset() { rdTimers.forEach(clearTimeout); rdTimers = []; rdChars.forEach((s) => s.classList.remove('lit', 'seen')); }

  // ============================================================
  // THE TERM — 提笔忘字 (text-popup default element)
  // ============================================================
  let termPop = null;
  try {
    termPop = new StacktagsTextPopup($('#term-host'), {
      words: [
        { text: '提', x: -345, y: -40, size: 168 },
        { text: '笔', x: -115, y: -40, size: 168 },
        { text: '忘', x: 115, y: -40, size: 168, keyD: true },
        { text: '字', x: 345, y: -40, size: 168 },
      ],
    });
  } catch (e) { /* fail soft */ }

  // ============================================================
  // PHONE IME (#sc-phone) — type "shi", surface candidates, tap one
  // ============================================================
  (function buildKb() {
    const kb = $('#ime-kb'); if (!kb) return;
    ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].forEach((r) => {
      const row = document.createElement('div'); row.className = 'kb-row';
      for (const ch of r) { const k = document.createElement('div'); k.className = 'key'; k.textContent = ch; k.dataset.k = ch; row.appendChild(k); }
      kb.appendChild(row);
    });
  })();
  const keyEl = (c) => document.querySelector('#sc-phone .key[data-k="' + c + '"]');
  const imeTyped = $('#ime-typed');
  let imeTimers = [];
  const clearIme = () => { imeTimers.forEach(clearTimeout); imeTimers = []; };
  function imeType(instant) {
    if (instant) { ['s', 'h', 'i'].forEach((c) => { const k = keyEl(c); if (k) k.classList.add('lit'); }); imeTyped.textContent = 'shi'; imeTyped.style.fontFamily = ''; return; }
    const seq = ['s', 'h', 'i']; imeTyped.textContent = ''; imeTyped.style.fontFamily = '';
    seq.forEach((c, i) => imeTimers.push(setTimeout(() => {
      const k = keyEl(c); if (k) { k.classList.add('lit'); setTimeout(() => k.classList.remove('lit'), 230); }
      imeTyped.textContent = seq.slice(0, i + 1).join('');
    }, i * 200)));
  }
  function imeCands(instant) {
    const cs = document.querySelectorAll('#sc-phone .ime-cand');
    cs.forEach((c, i) => { if (instant) c.classList.add('in'); else imeTimers.push(setTimeout(() => c.classList.add('in'), i * 120)); });
  }
  function imeTap(instant) {
    const sel = document.querySelector('#sc-phone .ime-cand[data-i="0"]');
    const fin = $('#ime-finger');
    const drop = () => { imeTyped.textContent = '是'; imeTyped.style.fontFamily = "'Noto Sans SC', var(--stk-font)"; };
    if (instant) { if (sel) sel.classList.add('sel'); drop(); return; }
    if (fin) { fin.style.left = '-2px'; fin.style.top = '168px'; fin.classList.add('tap'); }
    imeTimers.push(setTimeout(() => { if (sel) sel.classList.add('sel'); }, 120));
    imeTimers.push(setTimeout(drop, 320));
    imeTimers.push(setTimeout(() => { if (fin) fin.classList.remove('tap'); }, 760));
  }

  // ============================================================
  // HISTORY phone — a thumb taps a key and the character the hand
  // could no longer write appears, instantly, on the screen
  // ============================================================
  (function buildHistKb() {
    const kb = $('#hist-kb'); if (!kb) return;
    ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].forEach((r) => {
      const row = document.createElement('div'); row.className = 'kb-row';
      for (const ch of r) { const k = document.createElement('div'); k.className = 'key'; k.textContent = ch; k.dataset.k = ch; row.appendChild(k); }
      kb.appendChild(row);
    });
  })();
  let histTimers = [];
  function histType(instant) {
    histTimers.forEach(clearTimeout); histTimers = [];
    const fin = $('#hist-finger'); const ch = $('#hist-char');
    const tgt = document.querySelector('#hs-phone .key[data-k="c"]'); // c — cān
    if (instant) { if (ch) ch.classList.add('in'); return; }
    if (fin) { fin.style.left = '110px'; fin.style.top = '816px'; fin.classList.add('tap'); }
    if (tgt) histTimers.push(setTimeout(() => tgt.classList.add('lit'), 70));
    histTimers.push(setTimeout(() => { if (ch) ch.classList.add('in'); }, 320));
    histTimers.push(setTimeout(() => { if (fin) fin.classList.remove('tap'); if (tgt) tgt.classList.remove('lit'); }, 1100));
  }
  function histReset() {
    histTimers.forEach(clearTimeout); histTimers = [];
    $('#hs-phone').classList.remove('in');
    const ch = $('#hist-char'); if (ch) ch.classList.remove('in');
    document.querySelectorAll('#hs-phone .key').forEach((k) => k.classList.remove('lit'));
    const fin = $('#hist-finger'); if (fin) fin.classList.remove('tap');
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
    [0.0, 'A billion people can <b>read</b> their own language perfectly,'],
    [2.78, "but more and more of them can't <b>write</b> it by hand anymore."],
    [5.48, "There's even a name for it:"],
    [6.72, '<b>character amnesia</b>.'],
    [7.96, 'And the cause is sitting in your <b>pocket</b>.'],
    [10.34, 'Picture an educated Chinese speaker, pen in hand,'],
    [12.88, 'and they suddenly <b>blank</b>'],
    [13.76, 'on how to write a character they use every single day.'],
    [16.56, 'The Chinese term for it is'],
    [17.68, '<b>tí bǐ wàng zì</b>'],
    [19.12, '— literally, "pick up the pen, forget the character."'],
    [21.62, "And it's <b>spreading</b>. So what's going on?"],
    [23.82, 'It comes down to how you <b>type</b> Chinese…'],
    [25.76, "You don't draw the characters."],
    [27.36, 'You type the <b>sound</b>. The Pinyin…'],
    [29.72, 'and your phone shows you a list of matching characters.'],
    [32.34, 'You just <b>pick the right one</b>.'],
    [33.84, 'So all day long, you only have to <b>recognize</b> the character,'],
    [37.00, 'never build it from memory, stroke by stroke.'],
    [39.48, 'And recognition is <b>easy</b>.'],
    [41.30, 'Active recall — producing the whole thing from scratch —'],
    [43.74, 'is <b>hard</b>.'],
    [44.88, 'Classic <b>use-it-or-lose-it</b>.'],
    [46.70, 'People read fluently, type fluently,'],
    [48.76, 'then freeze the moment they have to handwrite.'],
    [50.86, 'Even simple, everyday characters <b>slip away</b>.'],
    [53.48, 'For thousands of years, to truly know a character'],
    [55.58, 'was to be able to <b>write</b> it.'],
    [56.70, 'Now, a billion people know their characters perfectly,'],
    [59.58, "and just can't quite <b>draw</b> them anymore."],
    [62.00, 'Maybe the first writing system in history'],
    [63.52, 'quietly handed over to a <b>keyboard</b>.'],
    [65.54, 'Want to actually start learning <b>Chinese</b>?'],
    [67.56, 'Discover thousands of <b>free</b> exercises'],
    [69.50, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — keyed to the new whisper word timings
  // ============================================================
  const CUES = [
    // HOOK — a real sentence read fluently (teal sweep), then the phone rises from
    // the pocket and sinks back down again (it never rides up with the scene change)
    [0.0, (i) => enter($('#sc-hook'), 'fade', 650, i, () => readSweep(i))],
    [7.96, () => $('#hk-phone').classList.add('in')],
    [9.50, () => { const p = $('#hk-phone'); p.classList.remove('in'); p.classList.add('out'); }],

    // PHENOMENON — picture an educated Chinese speaker (a real student at a board)
    [10.34, (i) => enter($('#sc-student'), 'rise', 950, i)],

    // PHENOMENON 2 — the taught idiom 提笔忘字
    [16.56, (i) => enter($('#sc-term'), 'drop', 1000, i, () => { if (i && termPop) termPop.showAll(); })],
    [17.68, (i) => { if (!i && termPop) termPop.pop(0); }],
    [17.90, (i) => { if (!i && termPop) termPop.pop(1); }],
    [18.10, (i) => { if (!i && termPop) termPop.pop(2); }],
    [18.30, (i) => { if (!i && termPop) termPop.pop(3); }],
    [19.12, () => $('#term-py').classList.add('in')],
    [20.30, () => $('#term-gloss').classList.add('in')],

    // WHY — the phone IME does the recognising
    [23.82, (i) => enter($('#sc-phone'), 'pan-right', 1050, i)],
    [28.42, (i) => imeType(i)],
    [30.00, (i) => imeCands(i)],
    [32.34, (i) => imeTap(i)],

    // RECALL — recognition stays (ghost + phone), recall fades (ink crumbles in waves)
    [33.84, (i) => { enter($('#sc-recall'), 'zoom-in', 1050, i); hzRecall.full(); }],
    [37.00, (i) => hzRecall.crumbleList([15, 13, 11], { instant: i, stagger: 120 })],
    [39.68, (i) => { $('#rc-phone').classList.add('lit'); hzRecall.restore(); }],
    [41.30, (i) => { $('#rc-phone').classList.remove('lit'); hzRecall.crumbleList([15, 14, 13, 12, 11, 10], { instant: i, stagger: 95 }); }],
    [44.88, (i) => hzRecall.crumbleList([9, 8, 7, 6], { instant: i, stagger: 110 })],
    [48.76, (i) => hzRecall.crumbleList([5, 4, 3], { instant: i, stagger: 120 })],
    [50.86, (i) => hzRecall.crumbleList([2, 1, 0], { instant: i, stagger: 150 })],

    // PUNCHLINE — hand writes it (assemble), hand fails (dissolve), keyboard types it
    // (no hide() onArrive — it used to race the assemble and wipe it to the ghost)
    [53.48, (i) => enter($('#sc-history'), 'zoom-out', 1150, i)],
    [54.62, (i) => hzHistory.assemble({ instant: i, stagger: 95 })],
    [59.58, (i) => hzHistory.crumble({ instant: i, stagger: 85 })],
    [62.00, () => $('#hs-phone').classList.add('in')],
    [64.00, (i) => histType(i)],

    // OUTRO
    [65.54, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX  (swoosh only when the grid moves; pop per popped word/tap)
  // ============================================================
  const SFX = [
    [10.34, 'swoosh', 0.50],
    [16.56, 'swoosh', 0.50],
    [17.68, 'pop', 0.50], [17.90, 'pop', 0.50], [18.10, 'pop', 0.50], [18.30, 'pop', 0.50],
    [23.82, 'swoosh', 0.50],
    [32.34, 'pop', 0.45],
    [33.84, 'swoosh', 0.50],
    [39.68, 'pop', 0.45],
    [53.48, 'swoosh', 0.50],
    [64.00, 'pop', 0.50],
    [65.54, 'swoosh', 0.55],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav' };
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
    readReset();
    $('#hk-phone').classList.remove('in', 'out');
    hzRecall.reset(); hzHistory.reset();
    if (termPop) termPop.reset();
    $('#term-py').classList.remove('in'); $('#term-gloss').classList.remove('in');
    clearIme();
    imeTyped.textContent = ''; imeTyped.style.fontFamily = '';
    document.querySelectorAll('#sc-phone .key').forEach((k) => k.classList.remove('lit'));
    document.querySelectorAll('#sc-phone .ime-cand').forEach((c) => c.classList.remove('in', 'sel'));
    $('#ime-finger').classList.remove('tap');
    $('#rc-phone').classList.remove('lit');
    histReset();
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
