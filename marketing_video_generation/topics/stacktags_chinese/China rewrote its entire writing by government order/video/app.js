/* ============================================================
   "China rewrote its entire writing by government order" — v2
   A question answered on one hero character (龍→龙), then ONE table
   that fills over the whole video: object · 繁体 · 1956 简体 · 1977 二简.
   1956 column fills (it worked) → real literacy chart climbs → 1977
   column fills (too far) → struck out + scrapped → ending: 繁体 vs 简体.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // ---------- hero hanzi renderer (stroke data) ----------
  const SVGNS = 'http://www.w3.org/2000/svg';
  function makeHanzi(hostSel, char, opts) {
    opts = opts || {};
    const host = typeof hostSel === 'string' ? $(hostSel) : hostSel;
    const strokes = ((window.HANZI && window.HANZI[char]) || { strokes: [] }).strokes || [];
    const size = opts.size || 470;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024'); svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('class', 'hz' + (opts.ghost ? ' ghosted' : ''));
    function layer(cls) {
      const g = document.createElementNS(SVGNS, 'g'); g.setAttribute('transform', 'translate(0,1024) scale(1,-1)'); g.setAttribute('class', cls);
      const ps = strokes.map((d) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); g.appendChild(p); return p; });
      svg.appendChild(g); return ps;
    }
    if (opts.ghost) layer('hz-ghost');
    const ink = layer('hz-ink'); host.appendChild(svg);
    const N = ink.length;
    const drift = ink.map((_, i) => { const a = i * 2.3998; return { x: Math.cos(a) * 95, y: Math.sin(a) * 56 + 44, r: (i % 2 ? 1 : -1) * (12 + (i % 5) * 5) }; });
    let timers = []; const clearT = () => { timers.forEach(clearTimeout); timers = []; };
    const setI = (fn) => { ink.forEach((p) => { p.style.transition = 'none'; }); fn(); void svg.offsetWidth; ink.forEach((p) => { p.style.transition = ''; }); };
    return {
      svg, ink, N,
      full() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 1; })); },
      hide() { clearT(); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      reset() { clearT(); svg.classList.remove('teal'); setI(() => ink.forEach((p) => { p.style.transform = 'none'; p.style.opacity = 0; })); },
      writeOn(o) { o = o || {}; if (o.instant) { this.full(); return; } clearT();
        setI(() => ink.forEach((p) => { p.style.transform = 'translateY(20px)'; p.style.opacity = 0; }));
        const st = o.stagger || 80; ink.forEach((p, i) => timers.push(setTimeout(() => { p.style.transform = 'none'; p.style.opacity = 1; }, (o.delay || 0) + i * st))); },
      shed(idxs, o) { o = o || {}; const st = o.stagger || 80;
        const fall = (i) => { const d = drift[i]; ink[i].style.transform = `translate(${d.x}px,${d.y}px) rotate(${d.r}deg)`; ink[i].style.opacity = 0; };
        if (o.instant) { setI(() => idxs.forEach(fall)); return; } idxs.forEach((i, k) => timers.push(setTimeout(() => fall(i), (o.delay || 0) + k * st))); },
      shedAll(o) { const all = []; for (let i = 0; i < N; i++) all.push(i); this.shed(all, o); },
    };
  }
  function simplify(trad, simp, o) { o = o || {}; if (o.instant) { trad.shedAll({ instant: true }); simp.full(); return; } trad.shedAll({ stagger: o.stagger || 60 }); simp.writeOn({ stagger: o.stagger || 70, delay: o.delay != null ? o.delay : 150 }); }

  const hkTrad = makeHanzi('#hk-trad', '龍', { size: 470 });
  const hkSimp = makeHanzi('#hk-simp', '龙', { size: 430 });
  const hkSkel = makeHanzi('#hk-skel', '歺', { size: 300 });
  const cxChar = makeHanzi('#cx-char', '鬱', { size: 470 });
  const cxSimp = makeHanzi('#cx-simp', '郁', { size: 430 });

  // ---------- WHY wall (barrier) ----------
  const WALL_CHARS = ['龍','鬱','書','學','藝','鐵','聲','廳','灣','黨','憂','豐','豔','籠','羅','關','難','繼','續','舊','歲','衛','醫','嚴','屬','廣','麗','龜'];
  (function buildWall() { const host = $('#wall'); if (!host) return; WALL_CHARS.forEach((c, i) => { const s = document.createElement('div'); s.className = 'wc'; s.textContent = c; s.style.transitionDelay = (i * 22) + 'ms'; host.appendChild(s); }); })();

  // ---------- THE TABLE ----------
  const ROWS = [
    { img: 'horse.png', trad: '馬', simp: '马', er: '马' },
    { img: 'gate.png',  trad: '門', simp: '门', er: '门' },
    { img: 'egg.png',   trad: '蛋', simp: '蛋', er: '旦' },
    { img: 'bowl.png',  trad: '餐', simp: '餐', er: '歺' },
  ];
  const rtable = $('#rtable');
  (function buildTable() {
    const body = $('#rt-body'); if (!body) return;
    ROWS.forEach((r) => {
      const simpChg = r.simp !== r.trad, erChg = r.er !== r.simp;
      const row = document.createElement('div'); row.className = 'rt-row';
      row.innerHTML =
        `<div class="rt-c obj"><img src="assets/img/${r.img}" alt=""></div>` +
        `<div class="rt-c trad"><span class="ch">${r.trad}</span></div>` +
        `<div class="rt-c simp ${simpChg ? 'chg' : 'same'}"><span class="ch">${r.simp}</span></div>` +
        `<div class="rt-c er ${erChg ? 'chg' : 'same'}"><span class="ch">${r.er}</span></div>`;
      body.appendChild(row);
    });
  })();
  const rowEls = () => Array.from(document.querySelectorAll('#rt-body .rt-row'));
  const simpCells = () => Array.from(document.querySelectorAll('#rt-body .rt-c.simp'));
  const erCells = () => Array.from(document.querySelectorAll('#rt-body .rt-c.er'));
  function tableRows(instant) { rowEls().forEach((el, k) => { if (instant) el.classList.add('in'); else setTimeout(() => el.classList.add('in'), k * 120); }); }
  function fillSimp(instant) { document.querySelector('.rt-h.col-simp').classList.add('show'); simpCells().forEach((c, k) => { if (instant) c.classList.add('show'); else setTimeout(() => c.classList.add('show'), 120 + k * 150); }); }
  function fillEr(instant) { document.querySelector('.rt-h.col-er').classList.add('show'); erCells().forEach((c, k) => { if (instant) c.classList.add('show'); else setTimeout(() => c.classList.add('show'), 120 + k * 150); }); }
  function scrapEr(instant) { rtable.classList.add('struck'); if (instant) rtable.classList.add('scrapped'); else setTimeout(() => rtable.classList.add('scrapped'), 520); }
  function tableShake(instant) { if (instant) return; rtable.animate([{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(calc(-50% - 9px),-50%)' }, { transform: 'translate(calc(-50% + 9px),-50%)' }, { transform: 'translate(-50%,-50%)' }], { duration: 360, iterations: 2 }); }

  // ---------- LITERACY CHART (real data: 1950 ~20% -> 1982 ~66% -> 2000 ~91%) ----------
  let chLine = null, chLen = 1000, chDots = [], chPct = null, chRAF = 0;
  (function buildChart() {
    const host = $('#chart'); if (!host) return;
    const D = 'M130,1058 C 360,1034 470,832 655,772 C 800,726 862,660 952,616';
    const clip = D + ' L952,1182 L130,1182 Z';
    host.innerHTML =
      `<svg viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="chclip"><path d="${clip}"/></clipPath>
          <linearGradient id="chtint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#119271" stop-opacity="0.20"/><stop offset="1" stop-color="#1c2630" stop-opacity="0.20"/>
          </linearGradient>
        </defs>
        <text class="ch-title" x="130" y="498">Adult literacy in China</text>
        <g clip-path="url(#chclip)">
          <image href="assets/img/people.png" x="130" y="560" width="822" height="640" preserveAspectRatio="xMidYMid slice"/>
          <rect x="130" y="560" width="822" height="640" fill="url(#chtint)"/>
        </g>
        <line class="ch-axis" x1="130" y1="540" x2="130" y2="1182"/>
        <line class="ch-axis" x1="130" y1="1182" x2="958" y2="1182"/>
        <path class="ch-line-w" id="chlinew" d="${D}"/>
        <path class="ch-line" id="chline" d="${D}"/>
        <path d="M952,616 l-30,2 l14,26 z" fill="#119271"/>
        <circle class="ch-dot" id="chd0" cx="130" cy="1058" r="12"/>
        <circle class="ch-dot" id="chd1" cx="655" cy="772" r="12"/>
        <circle class="ch-dot" id="chd2" cx="952" cy="616" r="12"/>
        <text class="ch-xlab" x="150" y="1238">1950</text>
        <text class="ch-xlab" x="655" y="1238">1982</text>
        <text class="ch-xlab" x="930" y="1238">2000</text>
        <text class="ch-pct" id="chpct" x="690" y="600" text-anchor="end">20%</text>
      </svg>`;
    chLine = $('#chline'); chLen = chLine.getTotalLength ? chLine.getTotalLength() : 1100;
    chPct = $('#chpct'); chDots = [$('#chd0'), $('#chd1'), $('#chd2')];
    [$('#chlinew'), chLine].forEach((l) => { l.style.strokeDasharray = chLen; l.style.strokeDashoffset = chLen; });
  })();
  function chartReset() { if (!chLine) return; [$('#chlinew'), chLine].forEach((l) => { l.style.transition = 'none'; l.style.strokeDashoffset = chLen; }); chDots.forEach((d) => { d.style.opacity = 0; }); if (chPct) chPct.textContent = '20%'; cancelAnimationFrame(chRAF); }
  function drawChart(instant) {
    if (!chLine) return; cancelAnimationFrame(chRAF);
    if (instant) { [$('#chlinew'), chLine].forEach((l) => { l.style.transition = 'none'; l.style.strokeDashoffset = 0; }); chDots.forEach((d) => { d.style.opacity = 1; }); chPct.textContent = '91%'; return; }
    [$('#chlinew'), chLine].forEach((l) => { l.style.transition = 'none'; l.style.strokeDashoffset = chLen; }); void chLine.getBoundingClientRect();
    [$('#chlinew'), chLine].forEach((l) => { l.style.transition = 'stroke-dashoffset 3200ms cubic-bezier(.5,0,.2,1)'; l.style.strokeDashoffset = 0; });
    chDots.forEach((d, k) => { d.style.opacity = 0; setTimeout(() => { d.style.transition = 'opacity .3s ease'; d.style.opacity = 1; }, 400 + k * 1300); });
    const t0 = performance.now();
    (function step(now) { const e = Math.min(1, (now - t0) / 3200); chPct.textContent = Math.round(20 + e * 71) + '%'; if (e < 1) chRAF = requestAnimationFrame(step); })(performance.now());
  }

  // ---------- counter (complex scene) ----------
  let cxRAF = 0;
  function countTo(to, dur, instant) { cancelAnimationFrame(cxRAF); const el = $('#cx-num'); if (!el) return; if (instant) { el.textContent = to; return; } const t0 = performance.now(); (function step(now) { const e = Math.min(1, (now - t0) / dur); el.textContent = Math.round(e * to); if (e < 1) cxRAF = requestAnimationFrame(step); })(performance.now()); }

  // ---------- outro ----------
  const outroLogo = $('#outro-logo'); if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 600 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function gridKick(instant) { if (instant) return; gcam.s *= 1.045; setTimeout(() => { gcam.s /= 1.045; }, 150); }

  // ============================================================
  // GRID CAMERA + DEPTH TRANSITIONS
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() { const t = vo.currentTime || 0; const cs = clamp(gdisp.s * (1 + Math.sin(t * 0.5) * 0.012), 0.82, 1.6); const cell = 120 * cs;
    const px = ((gdisp.x + Math.sin(t * 0.33) * 11) % cell + cell) % cell; const py = ((gdisp.y + Math.cos(t * 0.27) * 9) % cell + cell) % cell;
    grid.style.backgroundSize = cell + 'px ' + cell + 'px'; grid.style.backgroundPosition = 'calc(50% + ' + px + 'px) calc(50% + ' + py + 'px)'; }
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const clamp01 = (v) => Math.max(0, Math.min(1, v)); const lerp = (a, b, t) => a + (b - a) * t;
  const SCENES = Array.from(document.querySelectorAll('.scene'));
  function setPose(el, p) { el.style.setProperty('--tx', (p.tx || 0) + 'px'); el.style.setProperty('--ty', (p.ty || 0) + 'px'); el.style.setProperty('--s', p.s != null ? p.s : 1); el.style.opacity = p.op != null ? p.op : 1; el.style.filter = p.blur ? `blur(${p.blur}px)` : 'none'; if (p.z != null) el.style.zIndex = p.z; }
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
    mode = mode || 'zoom-in'; dur = dur || 1100; const fromEl = current; if (sceneRAF) cancelAnimationFrame(sceneRAF); const gs0 = gcam.s;
    if (mode === 'lift') { gcam.s = gs0 * 1.3; const t0 = performance.now(); const gy0 = gcam.y; setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) { const e = easeInOut(clamp01((now - t0) / dur)); const dy = 1450 * e; if (fromEl) setPose(fromEl, { ty: dy, s: lerp(1, 1.3, e), op: 1, blur: 0, z: 4 }); setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 }); gdisp.y = gy0 + dy * 0.5; if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; } if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); gdisp.y = gy0; gcam.s = gs0; current = toEl; if (onArrive) onArrive(); })(performance.now()); return; }
    const p0 = POSES(mode, 0); if (p0.grid != null) gcam.s = gs0 * p0.grid; setPose(toEl, Object.assign({ op: 0 }, p0.to)); const t0 = performance.now();
    (function step(now) { const e = easeInOut(clamp01((now - t0) / dur)); const ps = POSES(mode, e); if (fromEl) setPose(fromEl, ps.from); setPose(toEl, ps.to); if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; } if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); gcam.s = gs0 * (p0.grid != null ? p0.grid : 1); current = toEl; if (onArrive) onArrive(); })(performance.now());
  }
  function showInstant(el) { SCENES.forEach((s) => { if (s !== el) setPose(s, { op: 0, z: 0 }); }); setPose(el, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); current = el; }
  function enter(el, mode, dur, instant, onArrive) { if (instant) { showInstant(el); if (onArrive) onArrive(); return; } depthGo(el, mode, dur, onArrive); }

  // ---------- subtitles ----------
  function setSub(html, instant) { if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; } subsLine.classList.remove('in'); setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 140); }
  const SUBS = [
    [0.0, 'Is it actually possible to rewrite an entire language —'],
    [3.0, 'by <b>government order</b>?'],
    [4.38, '<b>Yes.</b> It is.'],
    [5.7, 'And yes — it can <b>fail</b>.'],
    [8.1, 'China is <b>proof of both</b>.'],
    [10.4, "In the mid-1900s, most people in China <b>couldn't read</b>."],
    [12.6, 'The characters were beautiful —'],
    [14.2, 'but <b>brutally complex</b>, often dozens of strokes each.'],
    [17.4, 'So to lift <b>literacy</b>, the government did something almost no country does:'],
    [21.0, 'it simplified the writing itself — <b>by decree</b>.'],
    [23.94, 'Take a few <b>everyday characters</b>.'],
    [25.96, 'In the 1950s, the first reform <b>cut them down</b> —'],
    [28.4, 'fewer strokes, faster to write.'],
    [30.52, 'And <b>it worked</b>.'],
    [31.58, '<b>Literacy climbed</b> —'],
    [32.82, 'from around <b>one in five</b> adults who could read,'],
    [35.0, 'to <b>most of the country</b>.'],
    [36.62, 'So in <b>1977</b>, they pushed their luck — a second round,'],
    [40.2, 'simplifying <b>even further</b>.'],
    [42.78, 'But this time, they went <b>too far</b>.'],
    [44.3, 'The new forms were stripped down so much they <b>lost their meaning</b> —'],
    [46.64, '<b>confusing</b>, and unpopular.'],
    [48.84, 'People just <b>refused to use them</b>.'],
    [50.48, 'So in <b>1986</b>, the government did something rare:'],
    [52.86, 'it admitted the reform had <b>failed</b>,'],
    [54.42, 'and <b>scrapped</b> the entire second round.'],
    [56.56, 'Today, that first simplification is what the mainland writes —'],
    [59.4, '<b>简体</b>, "simplified".'],
    [61.8, 'But <b>Taiwan</b> and <b>Hong Kong</b> never adopted it —'],
    [64.5, 'they kept the original <b>繁体</b>, "traditional".'],
    [67.5, 'One language… <b>two ways to write it</b> —'],
    [69.56, 'redesigned from the <b>top down</b>,'],
    [71.2, 'but only as far as <b>the people</b> would allow.'],
    [73.44, 'Wanna actually start learning <b>Chinese</b>?'],
    [75.22, 'Discover thousands of <b>free</b> exercises'],
    [77.0, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ---------- CUES ----------
  const CXD = $('#cx-decree');
  const CUES = [
    // HOOK
    [0.0, (i) => { enter($('#sc-hook'), 'fade', 650, i); hkTrad.writeOn({ instant: i, stagger: 195, delay: 350 }); }],
    [4.38, (i) => simplify(hkTrad, hkSimp, { instant: i, stagger: 55 })],
    [5.7, (i) => { hkSimp.hide(); $('#hk-skel').style.opacity = 1; hkSkel.writeOn({ instant: i, stagger: 70 }); }],
    [6.6, () => $('#hk-strike').classList.add('in')],
    [7.5, (i) => { hkSkel.shedAll({ instant: i, stagger: 55 }); $('#hk-strike').classList.remove('in'); hkSimp.full(); $('#hk-tick').classList.add('in'); }],

    // WHY
    [10.4, (i) => { enter($('#sc-wall'), 'zoom-out', 1100, i); $('#wall').classList.add('show'); $('#wall-people').classList.add('in'); }],
    [12.6, (i) => { enter($('#sc-complex'), 'zoom-in', 1050, i); $('#cx-counter').classList.add('in'); cxChar.writeOn({ instant: i, stagger: 100 }); countTo(29, 2900, i); }],
    [21.2, (i) => { if (!i) { CXD.classList.add('press'); gridKick(); setTimeout(() => CXD.classList.remove('press'), 800); } $('#cx-counter').classList.remove('in'); simplify(cxChar, cxSimp, { instant: i, stagger: 45 }); }],

    // TABLE — round one (1956)
    [23.94, (i) => { enter($('#sc-table'), 'zoom-out', 1100, i); tableRows(i); }],
    [25.96, (i) => { fillSimp(i); $('#tb-year').textContent = '1956'; $('#tb-year').classList.add('in'); }],
    [30.52, () => $('#tb-tick').classList.add('in')],

    // LITERACY CHART
    [31.58, (i) => { enter($('#sc-chart'), 'zoom-in', 1050, i, () => drawChart(i)); }],

    // TABLE — round two (1977)
    [36.62, (i) => { enter($('#sc-table'), 'zoom-out', 1100, i); tableRows(true); fillSimp(true); $('#tb-tick').classList.remove('in'); $('#tb-year').textContent = '1977'; $('#tb-year').classList.add('in'); fillEr(i); }],
    [44.3, () => $('#tb-bub').classList.add('in')],
    [48.84, (i) => tableShake(i)],

    // SCRAP (1986)
    [54.42, (i) => { $('#tb-bub').classList.remove('in'); $('#tb-year').textContent = '1986'; scrapEr(i); }],

    // ENDING — 繁体 vs 简体
    [56.56, () => { rtable.classList.add('hl-simp'); $('#lab-simp').classList.add('in'); $('#tb-year').classList.remove('in'); }],
    [61.8, () => { rtable.classList.add('hl-trad'); $('#lab-trad').classList.add('in'); }],

    // OUTRO
    [73.44, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ---------- SFX ----------
  const SFX = [
    [4.38, 'pop', 0.45], [6.6, 'pop', 0.4],
    [10.4, 'swoosh', 0.5],
    [12.6, 'swoosh', 0.5], [12.8, 'ticking', 0.4],
    [22.2, 'swoosh', 0.5],
    [23.94, 'swoosh', 0.5],
    [26.0, 'pop', 0.45], [26.2, 'pop', 0.45], [26.4, 'pop', 0.45], [26.6, 'pop', 0.45],
    [30.52, 'pop', 0.5],
    [21.2, 'swoosh', 0.5],
    [31.58, 'swoosh', 0.5], [31.9, 'ticking', 0.45],
    [36.62, 'swoosh', 0.5],
    [36.9, 'pop', 0.45], [37.1, 'pop', 0.45], [37.3, 'pop', 0.45], [37.5, 'pop', 0.45],
    [44.3, 'pop', 0.55],
    [54.42, 'swoosh', 0.55],
    [56.56, 'pop', 0.45], [61.8, 'pop', 0.45],
    [73.44, 'swoosh', 0.55],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/tickingtimeline.mp3' };
  function playSfx(entry) { try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {} }

  // ---------- CUE ENGINE ----------
  const firedScene = new Set(), firedSub = new Set(), firedSfx = new Set();
  let lastT = 0;
  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    SCENES.forEach((el) => setPose(el, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null; gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
    [hkTrad, hkSimp, hkSkel, cxChar, cxSimp].forEach((h) => h.reset());
    $('#hk-skel').style.opacity = 0; $('#hk-tick').classList.remove('in'); $('#hk-strike').classList.remove('in');
    CXD.classList.remove('press');
    $('#wall').classList.remove('show'); $('#wall-people').classList.remove('in', 'bright');
    $('#cx-counter').classList.remove('in'); cancelAnimationFrame(cxRAF); $('#cx-num').textContent = '0';
    rowEls().forEach((el) => el.classList.remove('in'));
    document.querySelectorAll('.rt-c.simp, .rt-c.er').forEach((c) => c.classList.remove('show'));
    document.querySelectorAll('.rt-h.col-simp, .rt-h.col-er').forEach((h) => h.classList.remove('show'));
    rtable.classList.remove('struck', 'scrapped', 'hl-simp', 'hl-trad');
    $('#tb-year').classList.remove('in'); $('#tb-tick').classList.remove('in'); $('#tb-bub').classList.remove('in');
    $('#lab-simp').classList.remove('in'); $('#lab-trad').classList.remove('in');
    chartReset();
    $('#outro-ec').classList.remove('play');
    subsLine.classList.remove('in');
  }
  function applyUpTo(t) { hardReset(); SUBS.forEach((s, k) => { if (s[0] <= t) { firedSub.add(k); setSub(s[1], true); } }); CUES.forEach((c, k) => { if (c[0] <= t) { firedScene.add(k); c[1](true); } }); SFX.forEach((s, k) => { if (s[0] <= t) firedSfx.add(k); }); }
  function tick() {
    requestAnimationFrame(tick); const t = vo.currentTime || 0;
    gdisp.s += (gcam.s - gdisp.s) * 0.07; gdisp.x += (gcam.x - gdisp.x) * 0.07; gdisp.y += (gcam.y - gdisp.y) * 0.07; applyGrid();
    if (!vo.paused) {
      if (t < lastT - 0.3) applyUpTo(t);
      for (let k = 0; k < SUBS.length; k++) if (!firedSub.has(k) && t >= SUBS[k][0]) { firedSub.add(k); setSub(SUBS[k][1], false); }
      for (let k = 0; k < CUES.length; k++) if (!firedScene.has(k) && t >= CUES[k][0]) { firedScene.add(k); CUES[k][1](false); }
      for (let k = 0; k < SFX.length; k++) if (!firedSfx.has(k) && t >= SFX[k][0]) { firedSfx.add(k); playSfx(SFX[k]); }
    }
    lastT = t; const seek = $('#seek'), tcode = $('#tcode'); if (seek && document.activeElement !== seek) seek.value = t; if (tcode) tcode.textContent = t.toFixed(1);
  }
  requestAnimationFrame(tick);
  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play; window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });
  hardReset();
})();
