/* ============================================================
   "Why China has a baby boom every 12 years" — choreography.
   Hero device: a ZODIAC WHEEL that ticks like a clock and locks on
   the Dragon 龙 every twelve notches. Audio-synced cue engine
   (vo.currentTime) + verbatim subtitles + a declared SFX bed.
   Scenes: WHEEL (hook+belief) → DATA (births chart + news card) →
   TWIST (dragon-kids crowd) → PUNCH (clock over China) → OUTRO.
   Swoosh only when the grid moves or an element animates in.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const SVGNS = 'http://www.w3.org/2000/svg';

  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // ---------- inline brand SVGs (never OS emoji) ----------
  const BABY_INNER = `
    <path d="M24 45c-9 0-15-6-15-14 0-3 2-5 5-5h20c3 0 5 2 5 5 0 8-6 14-15 14z" fill="#35A292"/>
    <circle cx="24" cy="16" r="11.5" fill="#35A292"/>
    <path d="M24 4.5c2.4 1 3.4 3.2 2.2 5.4" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="20" cy="16" r="1.7" fill="#fff"/><circle cx="28" cy="16" r="1.7" fill="#fff"/>
    <path d="M20.5 21q3.5 2.4 7 0" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round"/>`;
  const BABY_SVG = `<svg viewBox="0 0 48 48" fill="none">${BABY_INNER}</svg>`;
  const babymarkSVG = `<svg class="hb-babymark" viewBox="0 0 48 48" fill="none">${BABY_INNER}</svg>`;

  const kidSVG = (hero) => `<svg viewBox="0 0 100 124" fill="none">
    <path d="M22 122 V84 a28 28 0 0 1 56 0 V122 Z" fill="${hero ? '#119271' : '#35A292'}"/>
    <circle cx="50" cy="30" r="22" fill="#fff" stroke="#232B33" stroke-width="4"/>
    <circle cx="43" cy="29" r="2.6" fill="#232B33"/><circle cx="57" cy="29" r="2.6" fill="#232B33"/>
    <path d="M44 37 q6 4 12 0" stroke="#232B33" stroke-width="3" fill="none" stroke-linecap="round"/>
    <text x="50" y="103" text-anchor="middle" font-family="'Noto Sans SC','Inter'" font-weight="900" font-size="24" fill="#fff">龙</text></svg>`;

  const parentSVG = (flip) => `<svg viewBox="0 0 100 172" fill="none" style="transform:scaleX(${flip ? -1 : 1})">
    <path d="M70 118 L90 80" stroke="#35A292" stroke-width="13" stroke-linecap="round"/>
    <circle cx="50" cy="30" r="22" fill="#fff" stroke="#232B33" stroke-width="4"/>
    <circle cx="43" cy="30" r="2.6" fill="#232B33"/><circle cx="57" cy="30" r="2.6" fill="#232B33"/>
    <path d="M44 38q6 4 12 0" stroke="#232B33" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M28 168v-44a22 22 0 0 1 44 0v44z" fill="#35A292"/></svg>`;

  // ============================================================
  // BUILD: zodiac wheel (hook + belief)
  // ============================================================
  const wheel = window.mountZodiacWheel('#wheel-host', { R: 300, glyph: 104 });
  const wheelHost = $('#wheel-host');
  wheelHost.style.opacity = '0';
  wheelHost.style.transform = 'translate(-50%,-50%) scale(.6)';
  wheelHost.style.transition = 'opacity .55s ease, transform .95s cubic-bezier(.2,.8,.2,1)';
  function wheelIn(on) {
    wheelHost.style.opacity = on ? '1' : '0';
    wheelHost.style.transform = 'translate(-50%,-50%) scale(' + (on ? 1 : .6) + ')';
  }

  // hub content builders
  const hubLabel = (zh, py, en) => `<div class="hb-stack"><div class="hb-zh cjk">${zh}</div><div class="hb-py">${py}</div><div class="hb-en">${en}</div></div>`;
  const hubHero = (big, py, en, baby) => `<div class="hb-stack"><div class="hb-big cjk">${big}${baby ? babymarkSVG : ''}</div>${py ? `<div class="hb-py">${py}</div>` : ''}${en ? `<div class="hb-en">${en}</div>` : ''}</div>`;

  // ============================================================
  // BUILD: hook year-ticker
  // ============================================================
  const TK_YEARS = [1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024];
  const DRAGON_YEARS = [2000, 2012, 2024];
  (function buildTicker() {
    const yearsEl = $('#tk-years'), burstsEl = $('#tk-bursts');
    const x = (yr) => ((yr - 1994) / (2024 - 1994)) * 100;   // % across
    TK_YEARS.forEach((yr) => {
      const d = document.createElement('div');
      d.className = 'tk-year' + (DRAGON_YEARS.includes(yr) ? ' dragon' : '');
      d.style.left = x(yr) + '%';
      d.textContent = yr;
      yearsEl.appendChild(d);
    });
    DRAGON_YEARS.forEach((yr, k) => {
      const b = document.createElement('div');
      b.className = 'burst'; b.id = 'burst-' + k;
      b.style.left = x(yr) + '%';
      b.innerHTML = `<div class="babies"><span class="baby">${BABY_SVG}</span><span class="baby">${BABY_SVG}</span><span class="baby">${BABY_SVG}</span></div><div class="stem"></div>`;
      burstsEl.appendChild(b);
    });
    [[2000, 2012], [2012, 2024]].forEach(([a, c]) => {
      const g = document.createElement('div');
      g.className = 'tk-gap'; g.style.left = ((x(a) + x(c)) / 2) + '%';
      g.textContent = '← 12 years →';
      burstsEl.appendChild(g);
    });
  })();
  const popBurst = (k) => { const b = $('#burst-' + k); if (b) b.classList.add('pop'); };
  const showGap = () => $$('.tk-gap').forEach((g) => g.classList.add('show'));

  // ============================================================
  // BUILD: parents (belief)
  // ============================================================
  $('#parents').innerHTML =
    `<div class="parent">${parentSVG(false)}</div>` +
    `<div class="parent">${parentSVG(true)}</div>` +
    `<div class="pthought"><span class="cjk">龙</span></div>`;

  // ============================================================
  // BUILD: births chart (custom — bands + 龙 ticks + draw + morph)
  // ============================================================
  function makeBirthsChart(host) {
    const W = 940, H = 720, pad = { l: 50, r: 50, t: 70, b: 96 };
    const YEARS = [1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
    const DRAGON_IDX = [3, 9, 15];   // 2000, 2012, 2024
    const MAXV = 85;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'bc-svg');
    host.appendChild(svg);
    const mk = (n, a) => { const e = document.createElementNS(SVGNS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };

    const xOf = (i) => pad.l + (W - pad.l - pad.r) * (i / (YEARS.length - 1));
    const yOf = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / MAXV);
    const baseY = H - pad.b;

    const g = mk('g', { class: 'bc-grid' });
    for (let i = 0; i <= 4; i++) { const y = pad.t + (H - pad.t - pad.b) * (i / 4); g.appendChild(mk('line', { x1: 0, y1: y, x2: W, y2: y })); }
    svg.appendChild(g);

    const bands = DRAGON_IDX.map((i) => { const bw = 66, r = mk('rect', { class: 'bc-band', x: xOf(i) - bw / 2, y: pad.t - 10, width: bw, height: (H - pad.t - pad.b) + 10 }); svg.appendChild(r); return r; });

    const defs = mk('defs'); const grad = mk('linearGradient', { id: 'bcGrad', x1: 0, y1: pad.t, x2: 0, y2: baseY, gradientUnits: 'userSpaceOnUse' });
    grad.appendChild(mk('stop', { offset: '0%', 'stop-color': '#35A292', 'stop-opacity': .40 }));
    grad.appendChild(mk('stop', { offset: '100%', 'stop-color': '#35A292', 'stop-opacity': .02 }));
    defs.appendChild(grad); svg.appendChild(defs);

    const clip = mk('clipPath', { id: 'bcClip' }); const clipRect = mk('rect', { x: 0, y: -40, width: 0, height: H + 80 }); clip.appendChild(clipRect); svg.appendChild(clip);
    const area = mk('path', { class: 'bc-area', fill: 'url(#bcGrad)', 'clip-path': 'url(#bcClip)' });
    const line = mk('path', { class: 'bc-line', 'clip-path': 'url(#bcClip)' });
    svg.appendChild(area); svg.appendChild(line);

    const halo = mk('circle', { class: 'bc-dot-halo', r: 20, opacity: 0 });
    const dot = mk('circle', { class: 'bc-dot', r: 10, opacity: 0 });
    svg.appendChild(halo); svg.appendChild(dot);

    const ticks = DRAGON_IDX.map((i) => { const t = mk('text', { class: 'bc-tick', x: xOf(i), y: 0 }); t.textContent = '龙'; svg.appendChild(t); return t; });
    DRAGON_IDX.forEach((i) => { const t = mk('text', { class: 'bc-xlab', x: xOf(i), y: H - pad.b + 44 }); t.textContent = YEARS[i]; svg.appendChild(t); });

    function smooth(pts) {
      if (pts.length < 2) return '';
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
      }
      return d;
    }
    let cur = null, pts = [];
    function setVals(vals) {
      cur = vals.slice();
      pts = vals.map((v, i) => [xOf(i), yOf(v)]);
      const d = smooth(pts);
      line.setAttribute('d', d);
      area.setAttribute('d', d + ` L ${pts[pts.length - 1][0]} ${baseY} L ${pts[0][0]} ${baseY} Z`);
      ticks.forEach((t, k) => { const p = pts[DRAGON_IDX[k]]; t.setAttribute('y', p[1] - 26); });
      const last = pts[pts.length - 1]; dot.setAttribute('cx', last[0]); dot.setAttribute('cy', last[1]); halo.setAttribute('cx', last[0]); halo.setAttribute('cy', last[1]);
    }
    let raf = 0;
    return {
      reset() { if (raf) cancelAnimationFrame(raf); clipRect.setAttribute('width', 0); dot.setAttribute('opacity', 0); halo.setAttribute('opacity', 0); ticks.forEach(t => t.classList.remove('show')); bands.forEach(b => b.classList.remove('hot')); },
      draw(vals, { duration = 1700 } = {}) {
        setVals(vals); if (raf) cancelAnimationFrame(raf);
        const t0 = performance.now();
        const stepFn = (now) => {
          const p = Math.min(1, (now - t0) / duration), e = 1 - Math.pow(1 - p, 3);
          const idxF = e * (pts.length - 1), i0 = Math.floor(idxF), i1 = Math.min(pts.length - 1, i0 + 1), f = idxF - i0;
          const cx = pts[i0][0] + (pts[i1][0] - pts[i0][0]) * f, cy = pts[i0][1] + (pts[i1][1] - pts[i0][1]) * f;
          clipRect.setAttribute('width', cx + 6);
          dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); halo.setAttribute('cx', cx); halo.setAttribute('cy', cy);
          dot.setAttribute('opacity', Math.min(1, p * 3)); halo.setAttribute('opacity', Math.min(1, p * 3) * .6);
          ticks.forEach((t, k) => { if (xOf(DRAGON_IDX[k]) <= cx) t.classList.add('show'); });
          if (p < 1) raf = requestAnimationFrame(stepFn);
        };
        raf = requestAnimationFrame(stepFn);
      },
      morphTo(target, { duration = 900 } = {}) {
        if (!cur) { this.showAll(target); return; }
        if (raf) cancelAnimationFrame(raf);
        clipRect.setAttribute('width', W + 40);
        const from = cur.slice(), t0 = performance.now();
        const stepFn = (now) => {
          const p = Math.min(1, (now - t0) / duration), e = 1 - Math.pow(1 - p, 3);
          setVals(from.map((v, i) => v + (target[i] - v) * e));
          if (p < 1) raf = requestAnimationFrame(stepFn);
        };
        raf = requestAnimationFrame(stepFn);
      },
      showAll(vals) { setVals(vals); clipRect.setAttribute('width', W + 40); dot.setAttribute('opacity', 1); halo.setAttribute('opacity', .6); ticks.forEach(t => t.classList.add('show')); },
      hotBand(k, on = true) { if (bands[k]) bands[k].classList.toggle('hot', on); },
      hotAll() { bands.forEach(b => b.classList.add('hot')); ticks.forEach(t => t.classList.add('show')); },
    };
  }
  const CHINA_VALS = [55, 53, 50, 58, 48, 47, 46, 45, 44, 53, 46, 44, 40, 34, 30, 36];
  const SHARP_VALS = [40, 41, 39, 70, 24, 41, 40, 41, 40, 78, 22, 41, 40, 41, 39, 72];
  const births = makeBirthsChart($('#births-host'));

  // ============================================================
  // BUILD: twist crowd (dragon-kids)
  // ============================================================
  const CROWD_N = 30;
  (function buildCrowd() {
    const c = $('#crowd');
    for (let i = 0; i < CROWD_N; i++) {
      const k = document.createElement('div');
      k.className = 'kid';
      k.innerHTML = kidSVG(false);
      c.appendChild(k);
    }
    $('#th-kid').innerHTML = kidSVG(true);
  })();
  const kids = () => $$('#crowd .kid');
  // reveal in a spread-out (coprime-stride) order so the crowd fills in scattered, not left-to-right
  const REVEAL_ORDER = (() => {
    const n = CROWD_N; let stride = 13; const gcd = (a, b) => b ? gcd(b, a % b) : a; while (gcd(stride, n) !== 1) stride++;
    return Array.from({ length: n }, (_, k) => (k * stride) % n);
  })();
  function crowdReveal(n) { const ks = kids(); for (let i = 0; i < n && i < ks.length; i++) ks[REVEAL_ORDER[i]].classList.add('in'); }

  // ============================================================
  // BUILD: punchline — china backdrop + clock wheel + pulse line
  // ============================================================
  (function buildChina() {
    if (!window.CHINA_SILHOUETTE) return;
    $('#china-bg').innerHTML = `<svg viewBox="${window.CHINA_SILHOUETTE.viewBox}"><path d="${window.CHINA_SILHOUETTE.path}"/></svg>`;
  })();
  const clockWheel = window.mountZodiacWheel('#punch-clock', { R: 280, glyph: 92 });

  const pulseSvg = $('#pulse-svg');
  (function buildPulse() {
    const baseY = 168, L = 30, Rr = 870;
    const base = document.createElementNS(SVGNS, 'path'); base.setAttribute('class', 'pl-base'); base.setAttribute('d', `M ${L} ${baseY} L ${Rr} ${baseY}`);
    const areaP = document.createElementNS(SVGNS, 'path'); areaP.setAttribute('class', 'pl-area');
    const lineP = document.createElementNS(SVGNS, 'path'); lineP.setAttribute('class', 'pl-line');
    pulseSvg.appendChild(base); pulseSvg.appendChild(areaP); pulseSvg.appendChild(lineP);
    pulseSvg._mk = { baseY, L, Rr, areaP, lineP };
  })();
  function pulsePath(nBumps) {
    const { baseY, L, Rr } = pulseSvg._mk;
    const centers = [0.22, 0.5, 0.78].map((f) => L + (Rr - L) * f);
    const peak = 130, halfW = 70;
    let d = `M ${L} ${baseY}`;
    for (let b = 0; b < nBumps; b++) {
      const cx = centers[b];
      d += ` L ${cx - halfW} ${baseY} C ${cx - halfW / 2} ${baseY} ${cx - 18} ${baseY - peak} ${cx} ${baseY - peak} C ${cx + 18} ${baseY - peak} ${cx + halfW / 2} ${baseY} ${cx + halfW} ${baseY}`;
    }
    d += ` L ${Rr} ${baseY}`;
    return d;
  }
  function setPulse(n) {
    const d = pulsePath(n);
    pulseSvg._mk.lineP.setAttribute('d', d);
    pulseSvg._mk.areaP.setAttribute('d', d + ` L ${pulseSvg._mk.Rr} 200 L ${pulseSvg._mk.L} 200 Z`);
  }
  setPulse(0);

  // outro logo
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) {
    outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
    outroLogo.querySelectorAll('svg > g').forEach((g) => { if (!g.classList.contains('chev')) g.classList.add('lyr'); });
  }

  window.__ready = true;

  // ============================================================
  // GRID CAMERA (persistent gentle life + push on beats)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  let jolt = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const idleS = 1 + Math.sin(t * 0.5) * 0.01, idleX = Math.sin(t * 0.33) * 7, idleY = Math.cos(t * 0.27) * 6;
    const cs = clamp(gdisp.s * idleS, 0.8, 1.6), cell = 120 * cs;
    const px = ((gdisp.x + idleX) % cell + cell) % cell;
    const py = ((gdisp.y + idleY + jolt) % cell + cell) % cell;
    grid.style.backgroundSize = cell + 'px ' + cell + 'px';
    grid.style.backgroundPosition = 'calc(50% + ' + px + 'px) calc(50% + ' + py + 'px)';
    jolt *= 0.82;
  }
  let pushTimer = 0;
  function gridPush() { gcam.s = 1.12; gcam.x += 26; clearTimeout(pushTimer); pushTimer = setTimeout(() => { gcam.s = 1; gcam.x = 0; }, 900); }

  // ============================================================
  // SCENES
  // ============================================================
  const SCENES = ['sc-wheel', 'sc-data', 'sc-twist', 'sc-punch', 'sc-outro'];
  function setScene(id) {
    SCENES.forEach((s) => { $('#' + s).classList.toggle('active', s === id); });
    $('#sc-outro').classList.toggle('go', id === 'sc-outro');
  }
  const addC = (id, c) => { const e = $('#' + id); if (e) e.classList.add(c); };
  const rmC = (id, c) => { const e = $('#' + id); if (e) e.classList.remove(c); };

  // ============================================================
  // SUBTITLES (verbatim; grey, key words turquoise)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 110);
  }
  const SUBS = [
    [0.0, 'Every <b>12 years</b>, China —'],
    [1.28, 'and much of East Asia —'],
    [2.68, 'has a <b>baby boom</b>.'],
    [4.34, 'Not because of the economy.'],
    [5.88, 'Not because of policy.'],
    [7.06, 'Because of the <b>zodiac</b>.'],
    [8.40, 'Parents want their child born'],
    [9.80, 'in the <b>Year of the Dragon</b>.'],
    [11.04, 'The Chinese zodiac runs on'],
    [12.34, '<b>12 animals</b>, one per year.'],
    [14.12, 'And the Dragon is the'],
    [15.12, '<b>most prized</b> of them all —'],
    [16.30, 'tied to strength, luck,'],
    [17.24, 'ambition, success.'],
    [19.02, 'A “<b>dragon child</b>” is seen'],
    [19.98, 'as destined for great things.'],
    [21.94, 'So couples actually plan around it —'],
    [23.72, 'trying to time a birth'],
    [24.60, 'for a <b>dragon year</b>.'],
    [25.92, 'And here’s the <b>wild part</b>:'],
    [27.22, 'you can see it in the numbers.'],
    [28.68, 'In dragon years, <b>births rise</b>.'],
    [31.08, 'China’s last full dragon year, <b>2012</b>,'],
    [33.42, 'brought a clear bump —'],
    [34.76, 'reportedly the most births'],
    [35.84, 'in over a decade.'],
    [36.90, 'And the effect is even <b>sharper</b>'],
    [38.38, 'in places like Taiwan, Hong Kong,'],
    [40.42, 'and Singapore,'],
    [41.38, 'where dragon years produce a <b>spike</b> —'],
    [43.60, 'followed by a <b>dip</b> the very next year.'],
    [45.54, 'A superstition, leaving a hard'],
    [46.86, '<b>fingerprint</b> on a country’s demographics.'],
    [49.18, 'There’s even a catch for the'],
    [50.18, '<b>dragon kids</b> themselves.'],
    [51.62, 'Being born in a boom year means'],
    [52.98, 'a <b>bigger generation</b> —'],
    [53.94, 'so more competition for school places,'],
    [56.30, 'university spots,'],
    [57.14, 'jobs, their whole lives.'],
    [58.88, 'A <b>lucky sign</b>...'],
    [60.32, 'and a very <b>crowded class</b>.'],
    [61.94, 'We tend to think of superstition'],
    [62.66, 'as <b>harmless</b>.'],
    [64.18, 'But the wish for a dragon child'],
    [65.64, 'literally <b>bends the birth rate</b>'],
    [66.88, 'of the most populous region on Earth —'],
    [68.48, 'every <b>12 years</b>, like clockwork.'],
    [71.36, 'Wanna actually start learning <b>Chinese</b>?'],
    [74.38, 'Discover thousands of free exercises'],
    [76.34, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES  [t, fn(instant)]
  // ============================================================
  const CUES = [
    // ---------- HOOK: year-ticker rhythm ----------
    [0.0, (i) => { setScene('sc-wheel'); addC('hook-ticker', 'on'); }],
    [0.9, () => popBurst(0)],
    [1.9, () => { popBurst(1); showGap(); }],
    [3.0, () => popBurst(2)],
    // ---------- HOOK: eliminate economy / policy ----------
    [4.34, () => { addC('hook-ticker', 'out'); addC('hook-elim', 'on'); addC('elim-econ', 'show'); }],
    [5.05, () => addC('elim-econ', 'struck')],
    [5.88, () => addC('elim-pol', 'show')],
    [6.45, () => addC('elim-pol', 'struck')],
    // ---------- HOOK: the wheel spins in, locks on the Dragon ----------
    [7.06, (i) => { rmC('hook-elim', 'on'); wheelIn(true); wheel.popAll({ stagger: i ? 0 : 55 }); wheel.spin(-690, { instant: i }); gridPush(); }],
    [9.40, (i) => { wheel.spin(-840, { instant: i }); }],
    [9.95, (i) => { wheel.dragonGlow(true); wheel.hub(hubLabel('龙年', 'lóng nián', 'Year of the Dragon'), i); }],

    // ---------- BELIEF ----------
    [11.04, (i) => { if (!i) wheel.sweep({ stagger: 200, hold: 240 }); wheel.hub(hubLabel('生肖', 'shēngxiào', 'the zodiac'), i); wheel.dragonGlow(false); }],
    [14.30, (i) => { wheel.gray(true); wheel.dragonGlow(true); wheel.hub(hubHero('龙', 'lóng', 'dragon'), i); }],
    [19.10, (i) => { wheel.hub(hubHero('龙', 'lóng bǎobao · “dragon baby”', '', true), i); }],
    [21.94, () => { addC('parents', 'on'); }],
    [23.10, () => { addC('parents', 'think'); }],

    // ---------- DATA ----------
    [25.92, (i) => { setScene('sc-data'); if (!i) gridPush(); addC('data-title', 'show'); $('#data-title').textContent = 'China'; }],
    [27.40, (i) => { if (i) births.showAll(CHINA_VALS); else births.draw(CHINA_VALS, { duration: 2200 }); }],
    [31.08, () => { births.hotBand(1, true); }],
    [32.40, (i) => { addC('news-card', 'show'); if (!i) gridPush(); }],
    [36.90, (i) => {
      rmC('news-card', 'show'); births.hotBand(1, false);
      $('#data-title').innerHTML = 'Taiwan · Hong Kong · Singapore';
      if (i) births.showAll(SHARP_VALS); else births.morphTo(SHARP_VALS, { duration: 1000 });
      if (!i) gridPush();
    }],
    [41.38, () => { births.hotBand(1, true); }],
    [43.60, () => { births.hotBand(1, false); }],
    [45.54, (i) => {
      $('#data-title').innerHTML = 'a 12-year <span class="dt-zh">rhythm</span>';
      if (i) births.showAll(CHINA_VALS); else births.morphTo(CHINA_VALS, { duration: 900 });
      births.hotAll();
    }],
    [47.00, () => { addC('data-cap', 'show'); $('#data-cap').textContent = 'every 12 years'; }],

    // ---------- TWIST ----------
    [49.18, (i) => { setScene('sc-twist'); if (!i) gridPush(); addC('twist-hero', 'show'); }],
    [51.62, (i) => { addC('twist-hero', 'gone'); crowdReveal(12); if (!i) gridPush(); }],
    [53.94, () => { crowdReveal(20); }],
    [56.30, () => { crowdReveal(26); }],
    [57.14, () => { crowdReveal(30); }],
    [58.88, () => { addC('crowd', 'shine'); }],
    [60.32, (i) => { addC('seat', 'show'); addC('crowd', 'lean'); if (!i) gridPush(); }],

    // ---------- PUNCHLINE ----------
    [61.94, (i) => {
      setScene('sc-punch'); if (!i) gridPush();
      addC('china-bg', 'show');
      clockWheel.showAllGlyphs(); clockWheel.spin(-120, { instant: true }); clockWheel.gray(true); clockWheel.dragonGlow(true); clockWheel.clock(true); clockWheel.hand(0, { instant: true });
    }],
    [64.18, () => { addC('pulse-line', 'show'); }],
    [65.70, (i) => { clockWheel.hand(-360, { instant: i }); setPulse(1); }],
    [66.85, (i) => { clockWheel.hand(-720, { instant: i }); setPulse(2); }],
    [68.10, (i) => { clockWheel.hand(-1080, { instant: i }); setPulse(3); }],
    [68.55, () => { clockWheel.dragonGlow(true); }],

    // ---------- OUTRO ----------
    [71.36, (i) => { setScene('sc-outro'); if (!i) gridPush(); }],
  ];

  // ============================================================
  // SFX — swoosh only when the grid moves / an element flies in;
  // pop for baby bursts & glyph reveals; tick for chart draw & clock.
  // [t, name, vol]
  // ============================================================
  const SFX = [
    [0.9, 'pop', 0.5], [1.9, 'pop', 0.5], [3.0, 'pop', 0.5],
    [4.34, 'swoosh', 0.4], [5.05, 'pop', 0.4], [6.45, 'pop', 0.4],
    [7.06, 'swoosh', 0.5], [7.2, 'pop', 0.4], [7.5, 'pop', 0.4], [7.8, 'pop', 0.4],
    [9.40, 'swoosh', 0.42], [9.95, 'pop', 0.5],
    [11.2, 'pop', 0.4], [12.0, 'pop', 0.4], [13.0, 'pop', 0.4],
    [14.30, 'swoosh', 0.42], [19.10, 'pop', 0.5],
    [21.94, 'swoosh', 0.4],
    [25.92, 'swoosh', 0.5],
    [27.40, 'tick', 0.4], [28.0, 'tick', 0.4], [28.7, 'tick', 0.4], [29.4, 'tick', 0.4],
    [31.08, 'pop', 0.5], [32.40, 'swoosh', 0.45],
    [36.90, 'swoosh', 0.48],
    [41.38, 'pop', 0.45], [43.60, 'pop', 0.45],
    [45.54, 'swoosh', 0.42], [47.00, 'pop', 0.5],
    [49.18, 'swoosh', 0.5], [49.3, 'pop', 0.5],
    [51.62, 'swoosh', 0.4], [51.7, 'pop', 0.4], [52.0, 'pop', 0.4], [52.3, 'pop', 0.4],
    [53.94, 'pop', 0.4], [56.30, 'pop', 0.4], [57.14, 'pop', 0.4],
    [58.88, 'swoosh', 0.4],
    [60.32, 'swoosh', 0.42],
    [61.94, 'swoosh', 0.5],
    [64.18, 'swoosh', 0.4],
    [65.70, 'tick', 0.5], [66.85, 'tick', 0.5], [68.10, 'tick', 0.55],
    [71.36, 'swoosh', 0.55],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', tick: 'assets/sound/tick.wav' };
  function playSfx(entry) { try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {} }

  // ============================================================
  // CUE ENGINE
  // ============================================================
  const firedScene = new Set(), firedSub = new Set(), firedSfx = new Set();
  let lastT = 0;
  function resetScenes() {
    SCENES.forEach((s) => { $('#' + s).classList.remove('active'); });
    $('#sc-outro').classList.remove('go');
    ['hook-ticker', 'hook-elim'].forEach((id) => { rmC(id, 'on'); rmC(id, 'out'); });
    rmC('elim-econ', 'show'); rmC('elim-econ', 'struck'); rmC('elim-pol', 'show'); rmC('elim-pol', 'struck');
    $$('.burst').forEach((b) => b.classList.remove('pop')); $$('.tk-gap').forEach((g) => g.classList.remove('show'));
    wheelIn(false); wheel.reset();
    rmC('parents', 'on'); rmC('parents', 'think');
    rmC('data-title', 'show'); rmC('news-card', 'show'); rmC('data-cap', 'show'); births.reset();
    kids().forEach((k) => k.classList.remove('in')); rmC('twist-hero', 'show'); rmC('twist-hero', 'gone'); rmC('crowd', 'lean'); rmC('crowd', 'shine'); rmC('seat', 'show');
    rmC('china-bg', 'show'); rmC('pulse-line', 'show'); setPulse(0); clockWheel.reset();
  }
  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0; jolt = 0;
    clearTimeout(pushTimer);
    resetScenes(); subsLine.classList.remove('in');
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

  // ============================================================
  // PLAYBACK CONTROL
  // ============================================================
  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });

  hardReset();
})();
