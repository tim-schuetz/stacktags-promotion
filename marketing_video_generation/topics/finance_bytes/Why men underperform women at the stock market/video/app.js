/* ============================================================
   "Why men underperform women at the stock market" — choreography
   A continuous faux-3D camera over a persistent dynamic grid; every
   beat is driven off the narration's audio.currentTime (cue engine)
   so it lands on the spoken word. Colour language: TEAL = patient /
   winner / buy-and-hold / women; GREY = busy / loser / active / men.
   Reuses default elements (graph-chart bar, text-popup, outro) and two
   custom elements (two-lines, turnover-gauges).
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const GREY = '#8a949d', TEAL = '#119271';

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
  // ELEMENT MOUNTS
  // ============================================================
  const lines1 = new window.StkTwoLines('#lines1-host', {
    title: 'They just <b>trade too much</b>.',
    busy: { label: 'Men', end: 0.50, bites: 5 },
    calm: { label: 'Women', end: 0.88 },
    gap: true,
  });
  const study = new window.StkTwoLines('#study-host', {
    title: 'Traded the most <span class="grey">vs</span> almost nothing.',
    busy: { label: 'Active', end: 0.45, bites: 6 },
    calm: { label: 'Patient', end: 0.90 },
    gap: true,
  });
  const overtradeLine = new window.StkTwoLines('#overtrade-host', {
    busy: { label: 'Trader', end: 0.46, bites: 7 }, calm: false,
  });
  const secret = new window.StkTwoLines('#secret-host', {
    busy: { label: 'Busy', end: 0.52, bites: 5 },
    calm: { label: 'Patient', end: 0.92 },
    overtake: true,
  });

  const fees = new window.StacktagsTextPopup('#fees-host', {
    words: [
      { text: 'fees', x: -300, y: -150, keyD: true, size: 132 },
      { text: 'spreads', x: 150, y: 20, keyD: true, size: 132 },
      { text: 'taxes', x: -110, y: 230, keyD: true, size: 132 },
    ],
  });

  const bars = new window.StacktagsGraphChart('#bars-host', {
    type: 'bar', showValue: false, max: 22,
    title: 'Same market — 1990s US data',
    data: [{ value: 11.4 }, { value: 18.5 }],
  });
  const BAR_CATS = ['Active 20%', 'Buy & hold'];
  // colour the bars per the language (grey = active trader, teal = buy & hold)
  let barLabels = [];
  (function buildBarLabels() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = bars.svg; if (!svg || !bars.bars) return;
    bars.bars.forEach((rect, i) => { rect.style.fill = i === bars.bars.length - 1 ? TEAL : '#b7c0c7'; });
    barLabels = bars.bars.map((rect, i) => {
      const cx = (+rect.getAttribute('x')) + (+rect.getAttribute('width')) / 2;
      const top = rect._baseY - rect._full;
      const calm = i === bars.bars.length - 1;
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', cx); t.setAttribute('y', top - 28);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'bar-val-svg ' + (calm ? 'calm' : 'busy'));
      t.setAttribute('opacity', 0); t.textContent = '0%';
      svg.appendChild(t);
      const c = document.createElementNS(NS, 'text');
      c.setAttribute('x', cx); c.setAttribute('y', rect._baseY + 56);
      c.setAttribute('text-anchor', 'middle');
      c.setAttribute('class', 'bar-cat-svg');
      c.setAttribute('opacity', 0); c.textContent = BAR_CATS[i] || '';
      svg.appendChild(c);
      return { t, c, target: bars.data[i].value };
    });
  })();

  const gauges = new window.StkGauges('#gauges-host', {
    title: 'Portfolio <b>turnover</b> per year',
    rows: [
      { key: 'men', label: 'Men', value: 80, icon: '♂' },
      { key: 'women', label: 'Women', value: 50, icon: '♀' },
    ],
    note: '+45% more trades',
  });

  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 620 });

  // ============================================================
  // GRID CAMERA (persistent, always subtly moving)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 };
  const gdisp = { s: 1, x: 0, y: 0 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const idleS = 1 + Math.sin(t * 0.5) * 0.012;
    const idleX = Math.sin(t * 0.33) * 11;
    const idleY = Math.cos(t * 0.27) * 9;
    const cs = clamp(gdisp.s * idleS, 0.82, 1.6);
    const cell = 120 * cs;
    const px = ((gdisp.x + idleX) % cell + cell) % cell;
    const py = ((gdisp.y + idleY) % cell + cell) % cell;
    grid.style.backgroundSize = cell + 'px ' + cell + 'px';
    grid.style.backgroundPosition = 'calc(50% + ' + px + 'px) calc(50% + ' + py + 'px)';
  }

  // ============================================================
  // DEPTH SCENE TRANSITIONS
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
        to: { s: lerp(.72, 1, e), ty: lerp(980, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 },
        grid: .85 };
      case 'zoom-out': return {
        from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 },
        to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 },
        grid: .8 };
      case 'pan-left': return {
        from: { tx: lerp(0, -1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 },
        to: { tx: lerp(1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 },
        panX: -1180 };
      case 'pan-right': return {
        from: { tx: lerp(0, 1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 },
        to: { tx: lerp(-1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 },
        panX: 1180 };
      case 'drop': return {
        from: { s: lerp(1, .66, e), ty: lerp(0, 180, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 },
        to: { s: lerp(.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 },
        grid: .9 };
      case 'fade': return {
        from: { op: clamp01(1 - e / .55), z: 1 },
        to: { op: clamp01(e / .5), z: 3 },
        grid: 1 };
      case 'zoom-in':
      default: return {
        from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 },
        to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 },
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
    if (instant) { showInstant(el); if (onArrive) onArrive(); return; }
    depthGo(el, mode, dur, onArrive);
  }

  // ============================================================
  // IN-SCENE HELPERS
  // ============================================================
  function animate(dur, fn, after) {
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      fn(e);
      if (p < 1) requestAnimationFrame(step); else if (after) after();
    })(performance.now());
  }
  function drawLines(obj, instant) { if (instant) obj.showAll(); else obj.draw({ duration: 2200 }); }
  function hookStage(cls) { $('#sc-hook').classList.add(cls); }

  function glitchReveal(instant) {
    const w = $('#gl-win'), l = $('#gl-lose');
    w.querySelectorAll('.stock').forEach((s, i) => instant ? s.classList.add('show') : setTimeout(() => s.classList.add('show'), 120 + i * 170));
    l.querySelectorAll('.stock').forEach((s, i) => instant ? s.classList.add('show') : setTimeout(() => s.classList.add('show'), 220 + i * 170));
  }
  function glitchSell(instant) {
    const w = $('#gl-win');
    w.querySelectorAll('.stock').forEach((s) => s.classList.add('show', 'tagged'));
    if (instant) { w.classList.add('sold'); return; }
    setTimeout(() => w.classList.add('sold'), 520);
  }
  function glitchHold(instant) {
    const l = $('#gl-lose');
    l.querySelectorAll('.stock').forEach((s) => s.classList.add('show', 'tagged'));
    l.classList.add('held');
  }

  function bigNum(sceneSel, target, dur, instant) {
    const el = $(sceneSel + ' .bignum .num'); if (!el) return;
    if (instant) { el.textContent = Math.round(target); return; }
    animate(dur, (e) => el.textContent = Math.round(target * e));
  }

  function taxShow() { /* cards already in scene; nothing extra */ }
  function taxStamp() { $('#tax-sold').classList.add('stamped'); }
  function taxGlow() { $('#tax-held').classList.add('lit'); }
  function pros2Wired() { $('#sc-pros2').classList.add('wired-in'); }

  function barsInitDraw(instant) {
    bars.el.classList.add('head-in');
    barLabels.forEach((b) => b.c.setAttribute('opacity', 1));
    if (instant) {
      bars.bars.forEach((r) => { r.setAttribute('height', r._full); r.setAttribute('y', r._baseY - r._full); });
      barLabels.forEach((b) => { b.t.setAttribute('opacity', 1); b.t.textContent = b.target.toFixed(1) + '%'; });
    }
  }
  function barGrow(i, instant) {
    const rect = bars.bars[i], b = barLabels[i]; if (!rect || !b) return;
    b.c.setAttribute('opacity', 1); b.t.setAttribute('opacity', 1);
    if (instant) { rect.setAttribute('height', rect._full); rect.setAttribute('y', rect._baseY - rect._full); b.t.textContent = b.target.toFixed(1) + '%'; return; }
    animate(1500, (e) => {
      rect.setAttribute('height', rect._full * e);
      rect.setAttribute('y', rect._baseY - rect._full * e);
      b.t.textContent = (b.target * e).toFixed(1) + '%';
    });
  }

  function gaugesStart() { gauges.el.classList.add('in'); }
  function gaugesFillRow(i, instant) { if (instant) { gauges.el.classList.add('in'); gauges.fills[i].style.width = gauges.rows[i].value + '%'; gauges.vals[i].textContent = gauges.rows[i].value + '%'; } else gauges.fillRow(i); }

  function ocShow(instant) {
    const s = $('#sc-overconf'); s.classList.add('show-oc');
    const fig = $('#sc-overconf .oc-fig');
    if (instant) fig.classList.add('shake'); else setTimeout(() => fig.classList.add('shake'), 420);
  }
  function ocCap() { $('#sc-overconf').classList.add('cap'); }
  function secretCap() { $('#sc-secret').classList.add('cap'); }
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }

  // ============================================================
  // SUBTITLES (mirror the narration, one short line at a time)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 120);
  }
  const SUBS = [
    [0.0, 'Men underperform women at the stock market —'],
    [2.78, 'and it’s not because they pick <b>worse stocks</b>.'],
    [5.3, 'It’s because they <b>trade too much</b>.'],
    [7.12, 'The more you trade, the more you quietly <b>bleed to costs</b> —'],
    [9.94, 'every single time.'],
    [11.2, 'In one of the most famous studies in finance,'],
    [13.56, 'the investors who traded the most'],
    [14.82, 'badly lost to the ones who did <b>almost nothing</b>.'],
    [17.42, 'And no — this isn’t a <b>rookie</b> mistake.'],
    [19.84, 'Even professional fund managers fall for it.'],
    [22.2, 'Here’s the psychology.'],
    [23.52, 'It starts with one deeply human glitch:'],
    [25.7, 'we love <b>selling our winners</b>,'],
    [27.14, 'and we can’t let go of our <b>losers</b>.'],
    [28.98, 'Across tens of thousands of US investors,'],
    [31.66, 'people cashed in their gains about <b>50% more often</b> than their losses —'],
    [35.42, 'locking in what’s working, babysitting what isn’t.'],
    [38.06, 'And here’s the kicker:'],
    [39.34, 'tax-wise, that’s exactly <b>backwards</b>.'],
    [41.58, 'Selling a winner hands you a <b>tax bill</b>;'],
    [43.22, 'selling a loser would actually save you money.'],
    [45.48, 'We do the opposite — on pure instinct.'],
    [47.88, 'Think the pros are above this? They’re not.'],
    [50.48, 'Even professional funds realize their gains about <b>21% more often</b>.'],
    [54.86, 'It’s wired in.'],
    [56.04, 'Now stack the second mistake on top: <b>overtrading</b>.'],
    [59.24, 'Every trade costs — <b>fees, spreads, taxes</b> —'],
    [63.12, 'and those tiny leaks compound.'],
    [64.58, 'In that 1990s US data, the most active 20% of investors'],
    [68.58, 'earned just <b>11.4% a year</b>.'],
    [70.98, 'Buy-and-hold investors? <b>Over 18%</b>.'],
    [73.8, 'Same market.'],
    [75.04, 'The difference wasn’t worse stock-picking —'],
    [76.94, 'their picks were about as good.'],
    [78.24, 'It was the <b>cost</b> of all that activity.'],
    [80.04, 'Which brings us back to the title.'],
    [81.4, 'Men churned their portfolios around <b>80% a year</b>;'],
    [84.16, 'women, around <b>50%</b>.'],
    [85.8, 'Men traded roughly <b>45% more</b> —'],
    [88.2, 'fueled by overconfidence —'],
    [89.86, 'and that extra activity dragged their net returns below women’s.'],
    [93.82, 'Less trading, more keeping.'],
    [95.68, 'So the uncomfortable secret of the market:'],
    [97.92, '<b>doing less beats doing more</b>.'],
    [99.5, 'The best investors aren’t the busiest —'],
    [101.48, 'they’re the most <b>patient</b>.'],
    [102.76, 'Want more counterintuitive truths like this?'],
    [104.88, '<b>Follow Stacktags.</b>'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    [0.0, (i) => enter($('#sc-hook'), 'fade', 650, i, () => { if (i) { hookStage('show-paper'); hookStage('show-news'); hookStage('show-stat'); hookStage('show-stamp'); } })],
    [0.5, () => hookStage('show-paper')],
    [1.4, () => hookStage('show-news')],
    [2.4, () => hookStage('show-stat')],
    [6.0, () => hookStage('show-stamp')],

    [7.12, (i) => enter($('#sc-lines1'), 'zoom-out', 1100, i, () => drawLines(lines1, i))],
    [11.2, (i) => enter($('#sc-study'), 'zoom-out', 1100, i, () => drawLines(study, i))],
    [17.42, (i) => enter($('#sc-pros1'), 'drop', 1050, i)],

    // ---- WHY #1 ----
    [23.52, (i) => enter($('#sc-glitch'), 'zoom-in', 1050, i, () => glitchReveal(i))],
    [25.7, (i) => glitchSell(i)],
    [27.14, (i) => glitchHold(i)],
    [31.66, (i) => enter($('#sc-fifty'), 'zoom-out', 1100, i, () => bigNum('#sc-fifty', 50, 1700, i))],
    [39.34, (i) => enter($('#sc-tax'), 'rise', 1100, i, () => taxShow())],
    [42.6, () => taxStamp()],
    [43.6, () => taxGlow()],
    [47.88, (i) => enter($('#sc-pros2'), 'drop', 1050, i)],
    [50.7, (i) => bigNum('#sc-pros2', 21, 1700, i)],
    [54.86, () => pros2Wired()],

    // ---- WHY #2 ----
    [56.04, (i) => enter($('#sc-overtrade'), 'zoom-out', 1100, i, () => drawLines(overtradeLine, i))],
    [59.24, (i) => enter($('#sc-fees'), 'zoom-out', 1000, i, () => { if (i) fees.showAll(); })],
    [60.64, (i) => { if (!i) fees.pop(0); }],
    [61.48, (i) => { if (!i) fees.pop(1); }],
    [62.14, (i) => { if (!i) fees.pop(2); }],
    [64.58, (i) => enter($('#sc-bars'), 'zoom-out', 1100, i, () => barsInitDraw(i))],
    [67.1, (i) => barGrow(0, i)],
    [71.3, (i) => barGrow(1, i)],
    [75.04, (i) => enter($('#sc-cost'), 'pan-right', 1050, i)],

    // ---- WHY #3 ----
    [80.04, (i) => enter($('#sc-gauges'), 'zoom-out', 1100, i, () => gaugesStart())],
    [81.5, (i) => gaugesFillRow(0, i)],
    [84.3, (i) => gaugesFillRow(1, i)],
    [86.78, () => gauges.pingNote()],
    [88.2, (i) => enter($('#sc-overconf'), 'pan-right', 1050, i, () => ocShow(i))],
    [89.86, () => ocCap()],

    // ---- OUTRO ----
    [95.68, (i) => enter($('#sc-secret'), 'zoom-out', 1150, i, () => drawLines(secret, i))],
    [97.92, () => secretCap()],
    [102.76, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh on grid-moving transitions + default-element actions;
  // pop on flying-in objects / words; ticking on count-ups. [t, sound, vol]
  // ============================================================
  const SFX = [
    [0.5, 'pop', 0.4], [1.4, 'pop', 0.45], [2.4, 'pop', 0.45], [6.0, 'pop', 0.55], // hook cards + stamp
    [7.12, 'swoosh', 0.5],
    [11.2, 'swoosh', 0.5],
    [17.42, 'swoosh', 0.5],
    // WHY 1
    [23.52, 'swoosh', 0.5], [25.7, 'pop', 0.5], [27.14, 'pop', 0.5],
    [31.66, 'swoosh', 0.5], [31.9, 'ticking', 0.4],
    [39.34, 'swoosh', 0.5], [42.6, 'pop', 0.6], [43.6, 'pop', 0.45],
    [47.88, 'swoosh', 0.5], [50.9, 'ticking', 0.4],
    // WHY 2
    [56.04, 'swoosh', 0.5],
    [59.24, 'swoosh', 0.45], [60.64, 'pop', 0.55], [61.48, 'pop', 0.55], [62.14, 'pop', 0.55],
    [64.58, 'swoosh', 0.5], [67.1, 'ticking', 0.4], [71.3, 'ticking', 0.4],
    [75.04, 'swoosh', 0.5],
    // WHY 3
    [80.04, 'swoosh', 0.5], [81.5, 'ticking', 0.42], [84.3, 'ticking', 0.42], [86.78, 'pop', 0.5],
    [88.2, 'swoosh', 0.5],
    // OUTRO
    [95.68, 'swoosh', 0.5],
    [102.76, 'swoosh', 0.6],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/ticking.mp3' };
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

  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    SCENES.forEach((el) => setPose(el, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null;
    gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
    [lines1, study, overtradeLine, secret, fees, gauges].forEach((o) => { try { o.reset(); } catch (e) {} });
    // bars reset
    bars.bars.forEach((r) => { r.setAttribute('height', 0); r.setAttribute('y', r._baseY); });
    barLabels.forEach((b) => { b.t.setAttribute('opacity', 0); b.t.textContent = '0%'; b.c.setAttribute('opacity', 0); });
    // hook
    $('#sc-hook').classList.remove('show-paper', 'show-news', 'show-stat', 'show-stamp');
    // glitch
    ['#gl-win', '#gl-lose'].forEach((s) => { const e = $(s); if (e) e.classList.remove('sold', 'held'); });
    document.querySelectorAll('#sc-glitch .stock').forEach((s) => s.classList.remove('show', 'tagged'));
    // numbers
    document.querySelectorAll('#sc-fifty .bignum .num, #sc-pros2 .bignum .num').forEach((n) => n.textContent = '0');
    $('#sc-pros2').classList.remove('wired-in');
    // tax
    const ts = $('#tax-sold'), th = $('#tax-held'); if (ts) ts.classList.remove('stamped'); if (th) th.classList.remove('lit');
    // overconf / secret / outro
    const oc = $('#sc-overconf'); if (oc) oc.classList.remove('show-oc', 'cap'); const ocf = $('#sc-overconf .oc-fig'); if (ocf) ocf.classList.remove('shake');
    $('#sc-secret').classList.remove('cap');
    const ec = $('#outro-ec'); if (ec) ec.classList.remove('play');
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
