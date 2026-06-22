/* ============================================================
   "why men underperform women at the stock market" — choreography
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
  // SCENE INNER MARKUP (the non-element scenes)
  // ============================================================
  $('#sc-open').innerHTML = `
    <div class="open-head">Why <span class="m">men</span> underperform <span class="w">women</span></div>
    <div class="open-sub">And it's <b>not</b> because they pick worse stocks.</div>
    <div class="open-figs">
      <div class="open-fig man"><img src="assets/trader_man.png" alt=""></div>
      <div class="open-vs">vs</div>
      <div class="open-fig woman"><img src="assets/calm_woman.png" alt=""></div>
    </div>`;

  $('#sc-pros1').innerHTML = `
    <div class="center-col">
      <div class="big-line">And no — this isn't<br>a <span class="grey">rookie</span> mistake.</div>
      <div class="pill"><span class="dot"></span> Even professional fund managers</div>
      <div class="tease"><span class="arrow">↓</span> here's the psychology</div>
    </div>`;

  $('#sc-glitch').innerHTML = `
    <div class="eyebrow">Mistake <span class="n">#1</span> · the disposition effect</div>
    <div class="scene-title">We <b>sell our winners</b> — and cling to our <span class="grey">losers</span>.</div>
    <div class="glitch-cols">
      <div class="glitch-col win" id="gl-win">
        <div class="col-head">Winners ▲</div>
        <div class="stock up"><span class="tk">NVDA</span><span class="pct">+38%</span><span class="tag">SOLD ✓</span></div>
        <div class="stock up"><span class="tk">AAPL</span><span class="pct">+24%</span><span class="tag">SOLD ✓</span></div>
      </div>
      <div class="glitch-col lose" id="gl-lose">
        <div class="col-head">Losers ▼</div>
        <div class="stock down"><span class="tk">ACME</span><span class="pct">−31%</span><span class="tag">HELD</span></div>
        <div class="stock down"><span class="tk">QRS</span><span class="pct">−19%</span><span class="tag">HELD</span></div>
        <div class="clutch">✊</div>
      </div>
    </div>`;

  $('#sc-fifty').innerHTML = `
    <div class="bignum-wrap">
      <div class="bignum"><span class="num">0</span><span class="u">%</span></div>
      <div class="bignum-sub">more likely to <b>cash in a gain</b><br>than to take a <span class="grey">loss</span></div>
      <div class="bignum-cap">across tens of thousands of US investors</div>
    </div>`;

  $('#sc-tax').innerHTML = `
    <div class="scene-title">Tax-wise, that's exactly <b>backwards</b>.</div>
    <div class="tax-cards">
      <div class="tax-card" id="tax-sold">
        <div class="tc-act">Sold a winner</div>
        <div class="tc-icon">📈</div>
        <div class="tc-res">→ hands you a bill</div>
        <div class="tax-stamp">TAX BILL</div>
      </div>
      <div class="tax-card held" id="tax-held">
        <div class="tc-act">Held a loser</div>
        <div class="tc-icon">📉</div>
        <div class="tc-res">a write-off you skipped</div>
        <div class="glow-tag">MISSED DEDUCTION</div>
      </div>
    </div>`;

  $('#sc-pros2').innerHTML = `
    <div class="bignum-wrap">
      <div class="pill"><span class="dot"></span> Even professional funds</div>
      <div class="bignum"><span class="num">0</span><span class="u">%</span></div>
      <div class="bignum-sub">more often realize <b>gains</b> than <span class="grey">losses</span><br><span class="grey">it's wired in.</span></div>
    </div>`;

  $('#sc-overtrade').insertAdjacentHTML('beforeend', `
    <div class="eyebrow">Mistake <span class="n">#2</span> · overtrading</div>
    <div class="center-col"><div class="big-line">Every trade quietly<br><b>leaks money</b>.</div></div>`);

  $('#sc-cost').innerHTML = `
    <div class="center-col">
      <div class="big-line">Their picks were<br><span class="grey">just as good</span>.<br>It was the <b>cost</b>.</div>
    </div>`;

  $('#sc-overconf').innerHTML = `
    <div class="oc-eyebrow">fueled by overconfidence</div>
    <div class="oc-tag">+45%<span class="small">more trades</span></div>
    <div class="oc-fig"><img src="assets/trader_man.png" alt=""></div>
    <div class="oc-bottom">…which dragged his net returns <b>below women's</b>.</div>`;

  $('#sc-secret').insertAdjacentHTML('beforeend', `
    <div class="secret-head">Doing <b>less</b> beats doing more.</div>
    <div class="secret-sub">The best investors aren't the busiest —<br>they're the most <b>patient</b>.</div>`);

  // OUTRO endcard
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 620 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // ============================================================
  // ELEMENT MOUNTS
  // ============================================================
  const L1 = { busy: window.StacktagsTwoLines.busy(30, 0.50, 5), calm: window.StacktagsTwoLines.calm(30, 0.86) };
  const ST = { busy: window.StacktagsTwoLines.busy(30, 0.48, 5), calm: window.StacktagsTwoLines.calm(30, 0.84) };
  const SE = { busy: window.StacktagsTwoLines.busy(30, 0.46, 5), calm: window.StacktagsTwoLines.calm(30, 0.88) };

  const lines1 = new window.StacktagsTwoLines('#lines1-host', {
    title: 'They just <b>trade too much</b>.',
    series: [
      { key: 'busy', label: 'Men', color: GREY, smooth: false, feeBites: true, bites: L1.busy.bites, points: L1.busy.points },
      { key: 'calm', label: 'Women', color: TEAL, smooth: true, glow: true, points: L1.calm },
    ],
  });
  const study = new window.StacktagsTwoLines('#study-host', {
    title: 'Traded the most <span class="grey">vs</span> did almost nothing.',
    series: [
      { key: 'busy', label: 'Active', color: GREY, smooth: false, feeBites: true, bites: ST.busy.bites, points: ST.busy.points },
      { key: 'calm', label: 'Patient', color: TEAL, smooth: true, glow: true, points: ST.calm },
    ],
  });
  const overtradeLine = new window.StacktagsTwoLines('#overtrade-line', {
    series: [
      { key: 'busy', label: 'Trader', color: GREY, smooth: false, feeBites: true, bites: ST.busy.bites, points: ST.busy.points },
    ],
  });
  const secret = new window.StacktagsTwoLines('#secret-host', {
    series: [
      { key: 'busy', label: 'Busy', color: GREY, smooth: false, feeBites: true, bites: SE.busy.bites, points: SE.busy.points },
      { key: 'calm', label: 'Patient', color: TEAL, smooth: true, glow: true, points: SE.calm },
    ],
  });

  const fees = new window.StacktagsTextPopup('#fees-host', {
    words: [
      { text: 'fees', x: -300, y: -120, keyD: true, size: 130 },
      { text: 'spreads', x: 150, y: 30, keyD: true, size: 130 },
      { text: 'taxes', x: -120, y: 230, keyD: true, size: 130 },
    ],
  });

  const BAR_CATS = ['Active 20%', 'Buy & hold'];
  const bars = new window.StacktagsGraphChart('#bars-host', {
    type: 'bar', showValue: false, valueSuffix: '%', max: 22,
    title: 'Same market — 1990s US data',
    data: [{ value: 11.4 }, { value: 18.5 }],
  });
  // per-bar value labels (above) + category labels (below) — the default bar
  // chart shows only one headline, so we append our own SVG text (same coord
  // system as the bars → guaranteed alignment).
  let barLabels = [];
  (function buildBarLabels() {
    const SVGNS = 'http://www.w3.org/2000/svg';
    const svg = bars.svg; if (!svg || !bars.bars) return;
    barLabels = bars.bars.map((rect, i) => {
      const cx = (+rect.getAttribute('x')) + (+rect.getAttribute('width')) / 2;
      const top = rect._baseY - rect._full;
      const calm = i === bars.bars.length - 1;
      const t = document.createElementNS(SVGNS, 'text');
      t.setAttribute('x', cx); t.setAttribute('y', top - 30);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'bar-val-svg ' + (calm ? 'calm' : 'busy'));
      t.setAttribute('opacity', 0); t.textContent = '0%';
      svg.appendChild(t);
      const c = document.createElementNS(SVGNS, 'text');
      c.setAttribute('x', cx); c.setAttribute('y', rect._baseY + 58);
      c.setAttribute('text-anchor', 'middle');
      c.setAttribute('class', 'bar-cat-svg');
      c.setAttribute('opacity', 0); c.textContent = BAR_CATS[i] || '';
      svg.appendChild(c);
      return { t, c, target: bars.data[i].value };
    });
  })();

  const gauges = new window.StacktagsTurnoverGauges('#gauges-host', {
    title: 'Portfolio <b>turnover</b> per year',
    rows: [
      { key: 'men', label: 'Men', value: 80, color: GREY, icon: '♂' },
      { key: 'women', label: 'Women', value: 50, color: TEAL, icon: '♀' },
    ],
  });

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

  function openLit() { $('#sc-open').classList.add('lit'); }

  function glitchReveal(instant) {
    const w = $('#gl-win'), l = $('#gl-lose');
    w.querySelectorAll('.stock').forEach((s, i) => instant ? s.classList.add('show') : setTimeout(() => s.classList.add('show'), 120 + i * 170));
    l.querySelectorAll('.stock').forEach((s, i) => instant ? s.classList.add('show') : setTimeout(() => s.classList.add('show'), 220 + i * 170));
  }
  function glitchSell(instant) {
    const w = $('#gl-win');
    w.querySelectorAll('.stock').forEach((s) => s.classList.add('show', 'tagged'));
    if (instant) { w.classList.add('sold'); return; }
    setTimeout(() => w.classList.add('sold'), 600);
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

  function taxShow() { $('#sc-tax').classList.add('show-tax'); }
  function taxStamp() { $('#tax-sold').classList.add('stamped'); }
  function taxGlow() { $('#tax-held').classList.add('lit'); }

  function barsDraw(instant) {
    barLabels.forEach((b) => b.c.setAttribute('opacity', 1));
    if (instant) { bars.showAll(); barLabels.forEach((b) => { b.t.setAttribute('opacity', 1); b.t.textContent = b.target.toFixed(1) + '%'; }); return; }
    bars.draw({ duration: 6500 });
  }
  function barVal(i, instant) {
    const b = barLabels[i]; if (!b) return;
    b.t.setAttribute('opacity', 1);
    if (instant) { b.t.textContent = b.target.toFixed(1) + '%'; return; }
    animate(1700, (e) => b.t.textContent = (b.target * e).toFixed(1) + '%');
  }

  function gaugesFill(instant) { if (instant) gauges.showAll(); else gauges.fill({ duration: 3400 }); }

  function ocShow(instant) {
    const s = $('#sc-overconf'); s.classList.add('show-oc');
    const fig = $('#sc-overconf .oc-fig');
    if (instant) fig.classList.add('shake'); else setTimeout(() => fig.classList.add('shake'), 450);
  }
  function ocCap() { $('#sc-overconf').classList.add('cap'); }
  function secretCap() { $('#sc-secret').classList.add('cap'); }

  // ============================================================
  // SUBTITLES (mirror the narration, one short line at a time)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 130);
  }
  const SUBS = [
    [0.0, 'Men underperform women at the stock market —'],
    [2.6, 'and it’s not because they pick worse stocks.'],
    [4.9, 'It’s because they <b>trade too much</b>.'],
    [6.7, 'The more you trade, the more you quietly <b>bleed to costs</b> —'],
    [9.5, 'every single time.'],
    [10.6, 'In one of the most famous studies in finance,'],
    [13.2, 'the investors who traded the most'],
    [14.7, 'badly lost to the ones who did <b>almost nothing</b>.'],
    [16.7, 'And no — this isn’t a rookie mistake.'],
    [19.0, 'Even professional fund managers fall for it.'],
    [21.3, 'Here’s the psychology.'],
    [22.4, 'It starts with one deeply human glitch:'],
    [24.7, 'we love <b>selling our winners</b>,'],
    [26.0, 'and we can’t let go of our <b>losers</b>.'],
    [28.1, 'Across tens of thousands of US investors,'],
    [30.2, 'people cashed in their gains about <b>50% more often</b> than their losses —'],
    [34.5, 'locking in what’s working, babysitting what isn’t.'],
    [36.8, 'And here’s the kicker: tax-wise, that’s exactly <b>backwards</b>.'],
    [40.5, 'Selling a winner hands you a <b>tax bill</b>;'],
    [42.1, 'selling a loser would actually save you money.'],
    [43.9, 'We do the opposite — on pure instinct.'],
    [46.2, 'Think the pros are above this? They’re not.'],
    [48.3, 'Even professional funds realize their gains about <b>21% more often</b>.'],
    [52.3, 'It’s wired in.'],
    [53.5, 'Now stack the second mistake on top: <b>overtrading</b>.'],
    [56.8, 'Every trade costs — <b>fees, spreads, taxes</b> —'],
    [60.3, 'and those tiny leaks compound.'],
    [61.8, 'In that 1990s US data, the most active 20% of investors'],
    [66.3, 'earned just <b>11.4% a year</b>.'],
    [68.9, 'Buy-and-hold investors? <b>Over 18%</b>.'],
    [71.5, 'Same market. The difference wasn’t worse stock-picking —'],
    [74.4, 'their picks were about as good.'],
    [75.7, 'It was the <b>cost</b> of all that activity.'],
    [77.6, 'Which brings us back to the title.'],
    [79.0, 'Men churned their portfolios around <b>80% a year</b>;'],
    [82.6, 'women, around <b>50%</b>.'],
    [84.1, 'Men traded roughly <b>45% more</b> —'],
    [86.6, 'fueled by overconfidence —'],
    [88.2, 'and that extra activity dragged their net returns below women’s.'],
    [92.6, 'Less trading, more keeping.'],
    [94.5, 'So the uncomfortable secret of the market:'],
    [96.7, '<b>doing less beats doing more</b>.'],
    [98.5, 'The best investors aren’t the busiest —'],
    [100.5, 'they’re the most <b>patient</b>.'],
    [101.9, 'Want more counterintuitive truths like this?'],
    [104.0, '<b>Follow Stacktags.</b>'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    [0.0, (i) => enter($('#sc-open'), 'fade', 650, i, () => { if (i) openLit(); })],
    [0.9, () => openLit()],

    [4.9, (i) => enter($('#sc-lines1'), 'zoom-out', 1100, i, () => drawLines(lines1, i))],
    [10.6, (i) => enter($('#sc-study'), 'zoom-out', 1100, i, () => drawLines(study, i))],
    [16.7, (i) => enter($('#sc-pros1'), 'drop', 1050, i)],

    // ---- WHY #1 ----
    [22.4, (i) => enter($('#sc-glitch'), 'zoom-in', 1050, i, () => glitchReveal(i))],
    [24.9, (i) => glitchSell(i)],
    [27.0, (i) => glitchHold(i)],
    [30.2, (i) => enter($('#sc-fifty'), 'zoom-out', 1100, i, () => bigNum('#sc-fifty', 50, 1900, i))],
    [36.8, (i) => enter($('#sc-tax'), 'rise', 1100, i, () => { taxShow(); })],
    [41.3, () => taxStamp()],
    [42.6, () => taxGlow()],
    [46.2, (i) => enter($('#sc-pros2'), 'drop', 1050, i, () => bigNum('#sc-pros2', 21, 1700, i))],

    // ---- WHY #2 ----
    [53.5, (i) => enter($('#sc-overtrade'), 'zoom-out', 1100, i, () => drawLines(overtradeLine, i))],
    [56.8, (i) => enter($('#sc-fees'), 'zoom-out', 1000, i, () => { if (i) fees.showAll(); })],
    [58.0, (i) => { if (!i) fees.pop(0); }],
    [59.1, (i) => { if (!i) fees.pop(1); }],
    [59.5, (i) => { if (!i) fees.pop(2); }],
    [61.8, (i) => enter($('#sc-bars'), 'zoom-out', 1100, i, () => barsDraw(i))],
    [65.5, (i) => barVal(0, i)],
    [69.0, (i) => barVal(1, i)],
    [71.5, (i) => enter($('#sc-cost'), 'pan-right', 1050, i)],

    // ---- WHY #3 ----
    [79.0, (i) => enter($('#sc-gauges'), 'zoom-out', 1100, i, () => gaugesFill(i))],
    [84.1, (i) => enter($('#sc-overconf'), 'pan-right', 1050, i, () => ocShow(i))],
    [90.3, () => ocCap()],

    // ---- OUTRO ----
    [94.5, (i) => enter($('#sc-secret'), 'zoom-out', 1150, i, () => drawLines(secret, i))],
    [98.5, () => secretCap()],
    [101.9, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh ONLY on grid-moving transitions (not 'fade') + on
  // default-element actions; pop on flying-in objects / text-popup
  // words; ticking on count-ups (numbers / bars / gauges).
  // [t, sound, vol]
  // ============================================================
  const SFX = [
    // hook
    [0.9, 'pop', 0.45], [1.05, 'pop', 0.45], [1.2, 'pop', 0.4],   // characters + vs spring in
    [4.9, 'swoosh', 0.5],                                          // lines1 zoom-out
    [10.6, 'swoosh', 0.5],                                         // study zoom-out
    [16.7, 'swoosh', 0.5],                                         // pros1 drop
    // WHY 1
    [22.4, 'swoosh', 0.5],                                         // glitch zoom-in
    [24.9, 'pop', 0.5], [27.0, 'pop', 0.5],                        // sold tag + clutch
    [30.2, 'swoosh', 0.5], [30.6, 'ticking', 0.4],                // fifty zoom-out + count-up
    [36.8, 'swoosh', 0.5], [41.3, 'pop', 0.6], [42.6, 'pop', 0.45],// tax rise + stamp slam + glow
    [46.2, 'swoosh', 0.5], [46.9, 'ticking', 0.4],                // pros2 drop + count-up
    // WHY 2
    [53.5, 'swoosh', 0.5],                                         // overtrade zoom-out
    [56.8, 'swoosh', 0.45], [58.0, 'pop', 0.55], [59.1, 'pop', 0.55], [59.5, 'pop', 0.55],  // fees popups
    [61.8, 'swoosh', 0.5], [64.6, 'ticking', 0.4],                // bars zoom-out + draw count
    [71.5, 'swoosh', 0.5],                                         // cost pan
    // WHY 3
    [79.0, 'swoosh', 0.5], [79.7, 'ticking', 0.42],               // gauges zoom-out + fill count
    [84.1, 'swoosh', 0.5],                                         // overconf pan
    // OUTRO
    [94.5, 'swoosh', 0.5],                                         // secret zoom-out
    [101.9, 'swoosh', 0.6],                                        // outro lift + assemble
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
    // reset element + scene states
    [lines1, study, overtradeLine, secret, fees, bars, gauges].forEach((o) => { try { o.reset(); } catch (e) {} });
    barLabels.forEach((b) => { b.t.setAttribute('opacity', 0); b.t.textContent = '0%'; b.c.setAttribute('opacity', 0); });
    $('#sc-open').classList.remove('lit');
    ['#gl-win', '#gl-lose'].forEach((s) => { const e = $(s); if (e) e.classList.remove('sold', 'held'); });
    document.querySelectorAll('#sc-glitch .stock').forEach((s) => s.classList.remove('show', 'tagged'));
    $('#sc-tax').classList.remove('show-tax');
    const ts = $('#tax-sold'), th = $('#tax-held'); if (ts) ts.classList.remove('stamped'); if (th) th.classList.remove('lit');
    document.querySelectorAll('#sc-fifty .bignum .num, #sc-pros2 .bignum .num').forEach((n) => n.textContent = '0');
    const oc = $('#sc-overconf'); if (oc) oc.classList.remove('show-oc', 'cap'); const ocf = $('#sc-overconf .oc-fig'); if (ocf) ocf.classList.remove('shake');
    $('#sc-secret').classList.remove('cap');
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
