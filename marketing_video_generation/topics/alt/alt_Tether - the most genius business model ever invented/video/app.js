/* ============================================================
   "Tether — the most genius business model ever invented"
   NEW STYLE choreography: a continuous faux-3D camera over a
   persistent dynamic grid. Every beat is driven off the
   narration's audio.currentTime (cue engine) so it lands on the
   spoken word. Reuses the default elements: graph-chart,
   text-popup, outro + the shared depth-grid / theme / subtitles.
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
  // the USDT token face (₮ glyph + label) — injected into every coin
  // ============================================================
  function tetherCoinHTML() {
    return `<svg class="tt-glyph" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="20" width="76" height="14" rx="4" fill="#fff"/>
        <rect x="52" y="20" width="16" height="80" rx="4" fill="#fff"/>
        <rect x="33" y="50" width="54" height="13" rx="4" fill="#fff"/>
      </svg><span class="tt-lbl">USDT</span>`;
  }
  document.querySelectorAll('.brand-tether').forEach((c) => { c.innerHTML = tetherCoinHTML(); });

  // ============================================================
  // DEFAULT-ELEMENT MOUNTS
  // ============================================================
  // yield line chart — counts to ≈5%
  let yieldChart = null;
  try {
    yieldChart = new StacktagsGraphChart('#yield-host', {
      type: 'line', title: 'Parked in <b>U.S. Treasury bills</b>', sub: 'the safest loan on Earth',
      valuePrefix: '≈', valueSuffix: '%', headline: 5, showValue: true,
      data: [{ value: 1.2 }, { value: 1.8 }, { value: 2.5 }, { value: 3.3 }, { value: 4.1 }, { value: 4.6 }, { value: 5 }],
    });
  } catch (e) {}

  // profit bar chart — counts to $13B
  let profitChart = null;
  try {
    profitChart = new StacktagsGraphChart('#profit-host', {
      type: 'bar', title: 'Tether <b>profit</b>', sub: 'reported, per year',
      valuePrefix: '$', valueSuffix: 'B', headline: 13, showValue: true,
      data: [{ label: '’21', value: 2 }, { label: '’22', value: 3 }, { label: '’23', value: 6 }, { label: '’24', value: 13 }],
    });
  } catch (e) {}

  // stocks/coins word-cloud that fades away on the punchline
  let fadePop = null;
  try {
    fadePop = new StacktagsTextPopup('#fade-host', {
      words: [
        { text: 'stocks', x: -250, y: -380, size: 84 },
        { text: 'BTC', x: 240, y: -210, size: 92, key: true },
        { text: 'the right pick', x: -170, y: -30, size: 70 },
        { text: 'ETH', x: 250, y: 150, size: 92, key: true },
        { text: 'hot coins', x: -250, y: 320, size: 76 },
        { text: 'timing', x: 210, y: 430, size: 64, pill: true },
      ],
    });
  } catch (e) {}

  // outro endcard logo
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 600 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // crowd of little people for "other people's money"
  $('#opm-crowd').innerHTML = Array.from({ length: 12 }, () => '<span>👤</span>').join('');

  // ============================================================
  // counter count-up ($100B+)
  // ============================================================
  function fmtUSD(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  let counterRAF = 0;
  const COUNTER_TARGET = 110000000000;
  function runCounter(instant) {
    const el = $('#counter-num'); if (!el) return;
    if (counterRAF) cancelAnimationFrame(counterRAF);
    if (instant) { el.textContent = fmtUSD(COUNTER_TARGET); return; }
    const dur = 2500, t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtUSD(COUNTER_TARGET * e);
      if (p < 1) counterRAF = requestAnimationFrame(step);
    })(performance.now());
  }

  // ============================================================
  // GRID CAMERA (persistent, always subtly moving)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 };
  const gdisp = { s: 1, x: 0, y: 0 };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function applyGrid() {
    const t = vo.currentTime || 0;
    const idleS = 1 + Math.sin(t * 0.5) * 0.012;
    const idleX = Math.sin(t * 0.33) * 11;
    const idleY = Math.cos(t * 0.27) * 9;
    const cs = clamp(gdisp.s * idleS, 0.82, 1.5);
    const cell = 120 * cs;
    const px = ((gdisp.x + idleX) % cell + cell) % cell;
    const py = ((gdisp.y + idleY) % cell + cell) % cell;
    grid.style.backgroundSize = cell + 'px ' + cell + 'px';
    grid.style.backgroundPosition = 'calc(50% + ' + px + 'px) calc(50% + ' + py + 'px)';
  }

  // ============================================================
  // DEPTH SCENE TRANSITIONS (ported from the depth-transitions element)
  // ============================================================
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
      case 'rise': return {
        from: { s: lerp(1, .66, e), ty: lerp(0, -230, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 },
        to:   { s: lerp(.72, 1, e), ty: lerp(980, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 },
        grid: .85 };
      case 'zoom-out': return {
        from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 },
        to:   { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 },
        grid: .8 };
      case 'pan-left': return {
        from: { tx: lerp(0, -1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 },
        to:   { tx: lerp(1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 },
        panX: -1180 };
      case 'pan-right': return {
        from: { tx: lerp(0, 1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 },
        to:   { tx: lerp(-1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 },
        panX: 1180 };
      case 'drop': return {
        from: { s: lerp(1, .66, e), ty: lerp(0, 180, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 },
        to:   { s: lerp(.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 },
        grid: .9 };
      case 'fade': return {
        from: { op: clamp01(1 - e / .55), z: 1 },
        to:   { op: clamp01(e / .5), z: 3 },
        grid: 1 };
      case 'zoom-in':
      default: return {
        from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 },
        to:   { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 },
        grid: 1.45 };
    }
  }

  let current = null;
  let sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current;
    if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x, gy0 = gcam.y;

    if (mode === 'lift') {
      gcam.s = gs0 * 1.3;
      const t0 = performance.now();
      setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur));
        const z = lerp(1, 1.3, e), dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: z, op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        gdisp.y = gy0 + dy * 0.5;
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 });
        setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
        gdisp.y = gy0; gcam.s = gs0;
        current = toEl; if (onArrive) onArrive();
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
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1);
      current = toEl; if (onArrive) onArrive();
    })(performance.now());
  }

  function showInstant(el) {
    SCENES.forEach((s) => { if (s !== el) setPose(s, { op: 0, z: 0 }); });
    setPose(el, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
    current = el;
  }
  function enter(el, mode, dur, instant, onArrive) {
    if (instant) { showInstant(el); if (onArrive) onArrive(true); return; }
    depthGo(el, mode, dur, () => { if (onArrive) onArrive(false); });
  }

  // small helper: toggle a class on a scene
  const cls = (sel, name, on) => { const el = $(sel); if (el) el.classList[on === false ? 'remove' : 'add'](name); };

  // ============================================================
  // SUBTITLES
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 130);
  }

  // mirror the narration, one line at a time (key words in <b>)
  const SUBS = [
    [0.00,  'There’s a company that makes more money per employee than almost anyone on Earth.'],
    [3.44,  'Around a hundred staff.'],
    [4.70,  'Billions in annual profit.'],
    [5.84,  'And the entire business model is this:'],
    [8.26,  'You give them a dollar,'],
    [9.22,  'they hand you a token,'],
    [10.28, 'and they <b>keep the dollar</b>.'],
    [11.68, 'That’s Tether. And it’s completely <b>legal</b>.'],
    [14.12, 'Here’s why it might be the most <b>genius</b> business model ever invented.'],
    [17.72, 'Tether runs USDT — a “stablecoin.”'],
    [20.32, 'One USDT is always meant to equal one US dollar.'],
    [23.98, 'Crypto traders love it:'],
    [25.20, 'it’s a dollar that lives on the blockchain,'],
    [26.86, 'so they can jump in and out of trades instantly.'],
    [29.30, 'To get one, you hand Tether a real dollar,'],
    [31.36, 'and they mint you a token.'],
    [33.72, 'But the magic isn’t the token —'],
    [35.48, 'it’s what happens to your <b>dollar</b>.'],
    [37.10, 'Tether doesn’t just let your dollar sit in a drawer.'],
    [39.46, 'It parks those billions mostly in U.S. Treasury bills —'],
    [43.24, 'basically the safest loan on the planet,'],
    [45.52, 'earning around <b>four to five percent</b> a year.'],
    [47.54, 'And how much of that interest do they pass back to you?'],
    [51.04, '<b>Zero.</b>'],
    [51.92, 'You’re holding a dollar that pays you nothing,'],
    [53.76, 'and Tether keeps every cent of the yield.'],
    [55.92, 'Now multiply it.'],
    [56.76, 'There’s well over a hundred billion dollars of USDT out there.'],
    [60.24, 'A hundred billion of other people’s money,'],
    [62.40, 'working for Tether — <b>for free</b>.'],
    [64.50, 'And normally, getting capital is expensive.'],
    [66.92, 'A bank pays interest to its depositors.'],
    [68.80, 'A company pays interest on its bonds.'],
    [71.16, 'Everyone pays for money.'],
    [72.90, 'Tether’s cost? <b>Nothing</b>.'],
    [74.16, 'It’s an interest-free loan from millions of users,'],
    [76.46, 'and it keeps <b>a hundred percent</b> of the return.'],
    [78.78, 'In 2024, it reported around <b>thirteen billion dollars</b> in profit,'],
    [82.80, 'with a team you could fit in a single room.'],
    [84.94, 'So what’s the catch? <b>Trust.</b>'],
    [86.86, 'It holds up only as long as people believe'],
    [88.52, 'every token is really backed by a real dollar,'],
    [91.14, 'and don’t all rush to cash out at once.'],
    [93.24, 'Tether has been fined before for overstating its reserves,'],
    [96.76, 'and it publishes attestations — not full independent audits.'],
    [100.22,'The model is <b>brilliant</b>.'],
    [101.64,'But it runs entirely on <b>confidence</b>.'],
    [103.56,'Still — it cracked something most people never even see.'],
    [106.98,'The most profitable trade in finance'],
    [108.72,'wasn’t picking the right stock, or the right coin.'],
    [111.40,'It was realizing that if you get to <b>issue the dollar</b>…'],
    [114.14,'you get to <b>keep the interest</b>.'],
    [115.24,'Want more business models that sound illegal but aren’t?'],
    [118.38,'Follow <b>Stacktags</b>.'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    // ---- HOOK ----
    [0.00, (i) => enter($('#sc-intro'), 'fade', 750, i, () => { cls('#sc-intro', 'show'); })],
    [3.44, () => cls('#sc-intro', 'stats')],

    // ---- THE DEAL ----
    [8.26,  (i) => enter($('#sc-deal'), 'zoom-in', 1050, i, () => cls('#sc-deal', 's1'))],
    [9.22,  () => cls('#sc-deal', 's2')],
    [10.28, () => cls('#sc-deal', 's3')],

    // ---- LEGAL ----
    [11.68, (i) => enter($('#sc-legal'), 'drop', 950, i)],
    [12.45, () => cls('#legal-stamp', 'in')],

    // ---- TITLE ----
    [14.12, (i) => enter($('#sc-title'), 'zoom-out', 1100, i)],

    // ---- STABLECOIN ----
    [17.72, (i) => enter($('#sc-stable'), 'rise', 950, i)],

    // ---- PEG ----
    [20.32, (i) => enter($('#sc-peg'), 'pan-right', 1000, i)],
    [21.60, () => cls('#sc-peg', 'lock')],

    // ---- BLOCKCHAIN ----
    [23.98, (i) => enter($('#sc-chain'), 'zoom-in', 1000, i)],
    [25.40, () => cls('#sc-chain', 'io-in')],
    [27.40, () => cls('#sc-chain', 'io-out')],

    // ---- MINT ----
    [29.30, (i) => enter($('#sc-mint'), 'drop', 1000, i, () => cls('#sc-mint', 'a'))],
    [31.36, () => cls('#sc-mint', 'b')],

    // ---- MAGIC ----
    [33.72, (i) => enter($('#sc-magic'), 'zoom-out', 1050, i)],
    [35.48, () => cls('#sc-magic', 'dim')],

    // ---- VAULT → T-BILLS ----
    [37.10, (i) => enter($('#sc-tbills'), 'pan-left', 1050, i)],
    [39.80, () => cls('#sc-tbills', 'flow')],

    // ---- YIELD CHART ----
    [43.24, (i) => enter($('#sc-yield'), 'zoom-in', 1050, i, (inst) => {
      if (!yieldChart) return;
      if (inst) yieldChart.showAll(); else { yieldChart.reset(); setTimeout(() => yieldChart.draw({ duration: 2100 }), 250); }
    })],

    // ---- ZERO ----
    [47.54, (i) => enter($('#sc-zero'), 'zoom-out', 1050, i, () => cls('#sc-zero', 'q'))],
    [51.04, () => cls('#sc-zero', 'stamp-in')],

    // ---- KEEP ----
    [51.92, (i) => enter($('#sc-keep'), 'rise', 1000, i, () => cls('#sc-keep', 'a'))],
    [53.76, () => cls('#sc-keep', 'b')],

    // ---- COUNTER ----
    [56.76, (i) => enter($('#sc-counter'), 'zoom-in', 1050, i, (inst) => runCounter(inst))],

    // ---- OTHER PEOPLE'S MONEY ----
    [60.24, (i) => enter($('#sc-opm'), 'drop', 1000, i, () => cls('#sc-opm', 'in'))],
    [62.40, () => cls('#opm-stamp', 'in')],

    // ---- COST ----
    [64.50, (i) => enter($('#sc-cost'), 'pan-right', 1050, i)],
    [66.92, () => cls('#sc-cost', 'bank')],
    [68.80, () => cls('#sc-cost', 'co')],
    [72.90, () => cls('#sc-cost', 'teth')],

    // ---- PROFIT ----
    [78.78, (i) => enter($('#sc-profit'), 'zoom-out', 1050, i, (inst) => {
      if (!profitChart) return;
      if (inst) profitChart.showAll(); else { profitChart.reset(); setTimeout(() => profitChart.draw({ duration: 1900 }), 250); }
    })],
    [82.80, () => cls('#sc-profit', 'team')],

    // ---- TRUST ----
    [84.94, (i) => enter($('#sc-trust'), 'zoom-in', 1000, i, () => cls('#sc-trust', 'on'))],

    // ---- BACKED ----
    [86.86, (i) => enter($('#sc-backed'), 'rise', 1000, i)],
    [91.14, () => cls('#sc-backed', 'run')],

    // ---- MAGNIFY ----
    [93.24, (i) => enter($('#sc-magnify'), 'pan-left', 1050, i, () => cls('#sc-magnify', 'q'))],
    [96.76, () => cls('#sc-magnify', 'cap')],

    // ---- CONFIDENCE ----
    [100.22, (i) => enter($('#sc-conf'), 'zoom-out', 1050, i, () => cls('#sc-conf', 'a'))],
    [101.64, () => cls('#sc-conf', 'b')],

    // ---- STOCKS/COINS FADE ----
    [106.98, (i) => enter($('#sc-fade'), 'zoom-in', 1050, i, (inst) => {
      if (!fadePop) return;
      $('#sc-fade').classList.remove('gone');
      if (inst) { fadePop.showAll(); return; }
      fadePop.reset();
      [200, 700, 1200, 1700, 2200, 2700].forEach((ms, idx) => setTimeout(() => fadePop.pop(idx), ms));
    })],
    [110.40, () => cls('#sc-fade', 'gone')],

    // ---- THRONE ----
    [111.40, (i) => enter($('#sc-throne'), 'rise', 1050, i, () => cls('#sc-throne', 'up'))],
    [114.14, () => cls('#sc-throne', 'line')],

    // ---- OUTRO ----
    [115.30, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh ONLY on depth transitions (the grid moves there);
  // pop on word/element pops; ticking on count-ups (chart/counter).
  // [t, sound ∈ {swoosh,pop,ticking}, vol]
  // ============================================================
  const SFX = [
    [8.26, 'swoosh', 0.5], [9.22, 'pop', 0.5], [10.28, 'pop', 0.5],
    [11.68, 'swoosh', 0.5], [12.45, 'pop', 0.5],
    [14.12, 'swoosh', 0.5],
    [17.72, 'swoosh', 0.5],
    [20.32, 'swoosh', 0.5], [21.60, 'pop', 0.45],
    [23.98, 'swoosh', 0.5], [25.40, 'pop', 0.42], [27.40, 'pop', 0.42],
    [29.30, 'swoosh', 0.5], [31.36, 'pop', 0.45],
    [33.72, 'swoosh', 0.5], [35.48, 'pop', 0.45],
    [37.10, 'swoosh', 0.5], [39.80, 'pop', 0.45],
    [43.24, 'swoosh', 0.5], [43.60, 'ticking', 0.40],
    [47.54, 'swoosh', 0.5], [51.04, 'pop', 0.6],
    [51.92, 'swoosh', 0.5], [53.76, 'pop', 0.45],
    [56.76, 'swoosh', 0.5], [57.10, 'ticking', 0.40],
    [60.24, 'swoosh', 0.5], [62.40, 'pop', 0.5],
    [64.50, 'swoosh', 0.5], [66.92, 'pop', 0.45], [68.80, 'pop', 0.45], [72.90, 'pop', 0.5],
    [78.78, 'swoosh', 0.5], [79.10, 'ticking', 0.40], [82.80, 'pop', 0.45],
    [84.94, 'swoosh', 0.5], [85.88, 'pop', 0.5],
    [86.86, 'swoosh', 0.5], [91.14, 'pop', 0.45],
    [93.24, 'swoosh', 0.5], [96.76, 'pop', 0.45],
    [100.22, 'swoosh', 0.5], [101.64, 'pop', 0.5],
    [106.98, 'swoosh', 0.5],
    [107.18, 'pop', 0.5], [107.68, 'pop', 0.5], [108.18, 'pop', 0.5], [108.68, 'pop', 0.5], [109.18, 'pop', 0.5], [109.68, 'pop', 0.5],
    [111.40, 'swoosh', 0.5], [111.80, 'pop', 0.45], [114.14, 'pop', 0.5],
    [115.30, 'swoosh', 0.6],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/ticking.wav' };
  function playSfx(entry) {
    try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {}
  }

  // ============================================================
  // CUE ENGINE
  // ============================================================
  const firedScene = new Set();
  const firedSub = new Set();
  const firedSfx = new Set();
  let lastT = 0;

  const SCENE_STATE_CLASSES = ['show', 'stats', 's1', 's2', 's3', 'in', 'lock', 'io-in', 'io-out',
    'a', 'b', 'dim', 'flow', 'q', 'stamp-in', 'bank', 'co', 'teth', 'team', 'on', 'run', 'cap', 'gone', 'up', 'line'];

  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    SCENES.forEach((el) => setPose(el, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null;
    gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
    // clear every scene's state classes
    SCENES.forEach((el) => SCENE_STATE_CLASSES.forEach((c) => el.classList.remove(c)));
    document.querySelectorAll('.stamp').forEach((s) => s.classList.remove('in'));
    if (yieldChart) yieldChart.reset();
    if (profitChart) profitChart.reset();
    if (fadePop) fadePop.reset();
    if (counterRAF) cancelAnimationFrame(counterRAF);
    const cnum = $('#counter-num'); if (cnum) cnum.textContent = '$0';
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

  // ============================================================
  // PLAYBACK CONTROL
  // ============================================================
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
