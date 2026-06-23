/* ============================================================
   "How to launder $1.5 billion in crypto" — choreography
   Faux-3D camera over a persistent grid, audio-synced. Spine =
   a DECENTRALISED SERVER NETWORK (servers scattered across the
   frame; a single coin moves; every node writes the same black
   hash = the public, replicated record). No redundant on-screen
   text — visuals + subtitles carry it.
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

  // ---- token logos (real currencies) ----
  let solId = 0;
  function tokenHTML(name) {
    if (name === 'btc') return '<div class="tok btc">₿</div>';
    if (name === 'usdt') return '<div class="tok usdt">₮</div>';
    if (name === 'eth') return '<div class="tok eth"><svg viewBox="0 0 40 64" width="34" height="54"><polygon points="20,2 38,32 20,42 2,32" fill="#fff"/><polygon points="20,46 38,35 20,62 2,35" fill="#fff" opacity=".82"/></svg></div>';
    if (name === 'sol') { const id = 'sg' + (solId++); return `<div class="tok sol"><svg viewBox="0 0 54 44" width="46"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9945FF"/><stop offset="1" stop-color="#14F195"/></linearGradient></defs><g fill="url(#${id})"><path d="M11,4 L52,4 L43,12 L2,12 Z"/><path d="M2,18 L43,18 L52,26 L11,26 Z"/><path d="M11,32 L52,32 L43,40 L2,40 Z"/></g></svg></div>`; }
    return '<div class="tok">?</div>';
  }

  // ============================================================
  // SCENE BUILDERS
  // ============================================================
  // ---- HOOK: recreated Bybit-hack news headlines ----
  const NEWS = [
    { ol: 'Reuters', lg: 'R', bg: '#f47b20', date: 'Feb 21, 2025', rot: -3, top: 70,
      head: 'Bybit hit by record <b>$1.5 billion</b> crypto hack', live: true },
    { ol: 'Bloomberg', lg: 'B', bg: '#111418', date: 'Feb 22, 2025', rot: 2.4, top: 470,
      head: "North Korea's <b>Lazarus Group</b> blamed for largest-ever theft" },
    { ol: 'CoinDesk', lg: 'C', bg: '#1652f0', date: 'Feb 24, 2025', rot: -1.8, top: 845,
      head: 'Investigators trace the stolen funds <b>across the blockchain</b>' },
  ];
  $('#sc-news').innerHTML = `<div class="news-wrap">${NEWS.map((n, i) => `
      <div class="news-card" id="news-${i}" style="--rot:${n.rot}deg; top:${n.top}px;">
        <div class="news-top">
          <div class="news-logo" style="background:${n.bg};">${n.lg}</div>
          <div class="news-outlet">${n.ol}</div>
          <div class="news-meta">${n.date}</div>
        </div>
        <div class="news-head">${n.head}</div>
        ${n.live ? '<div class="news-live">BREAKING</div>' : ''}
      </div>`).join('')}</div>`;
  const newsCards = NEWS.map((_, i) => $('#news-' + i));

  // ---- SCATTERED SERVER NETWORK (the spine) ----
  const SCATTER = [[210,330],[545,285],[860,395],[360,560],[720,640],[170,835],[520,905],[855,950],[330,1130],[675,1190]];
  const HASH = '0x9f3a…c712';
  const NET_EDGES = (function () {
    const E = new Set();
    SCATTER.forEach((p, i) => {
      const d = SCATTER.map((q, j) => [Math.hypot(p[0]-q[0], p[1]-q[1]), j]).filter((x) => x[1] !== i).sort((a, b) => a[0]-b[0]);
      [d[0], d[1]].forEach((n) => { E.add(Math.min(i, n[1]) + '-' + Math.max(i, n[1])); });
    });
    return [...E].map((s) => s.split('-').map(Number));
  })();
  function buildScatterNet(scene, coinFrom, coinTo) {
    const root = document.createElement('div'); root.className = 'snet';
    let svg = '<svg class="snet-lines" viewBox="0 0 1080 1920">';
    NET_EDGES.forEach(([a, b]) => { svg += `<line x1="${SCATTER[a][0]}" y1="${SCATTER[a][1]}" x2="${SCATTER[b][0]}" y2="${SCATTER[b][1]}"/>`; });
    svg += '</svg>';
    let servers = '';
    SCATTER.forEach(([x, y], i) => {
      servers += `<div class="srv" style="left:${x}px;top:${y}px;"><div class="srv-cap"><span class="srv-stack"></span><span class="srv-dot" style="animation-delay:${(i*0.37).toFixed(2)}s"></span></div>`
        + `<div class="srv-hash">${HASH}</div><div class="srv-line"></div><div class="srv-line"></div><div class="srv-line short"></div></div>`;
    });
    const A = SCATTER[coinFrom], B = SCATTER[coinTo];
    const coin = `<div class="snet-coin" style="--ax:${A[0]}px;--ay:${A[1]}px;--dx:${B[0]-A[0]}px;--dy:${B[1]-A[1]}px;">₿</div>`;
    root.innerHTML = svg + servers + coin;
    scene.appendChild(root);
    const srvs = Array.from(root.querySelectorAll('.srv'));
    const coinEl = root.querySelector('.snet-coin');
    return {
      root, srvs, coinEl,
      serversIn(instant) { srvs.forEach((s, i) => { if (instant) s.classList.add('in'); else setTimeout(() => s.classList.add('in'), 100 + i * 110); }); },
      broadcast() { srvs.forEach((s, i) => { setTimeout(() => { s.classList.add('ping'); setTimeout(() => s.classList.remove('ping'), 300); }, i * 90); }); },
      coinGo(instant) { if (instant) { coinEl.style.transition = 'none'; coinEl.classList.add('go'); void coinEl.offsetWidth; coinEl.style.transition = ''; } else coinEl.classList.add('go'); },
      hashAll(instant) { srvs.forEach((s, i) => { if (instant) s.classList.add('hashed'); else setTimeout(() => s.classList.add('hashed'), i * 70); }); },
      hashOne(i) { srvs[i].classList.add('hashed'); },
      hashRest(except, instant) { srvs.forEach((s, i) => { if (i === except) return; if (instant) s.classList.add('hashed'); else setTimeout(() => s.classList.add('hashed'), 60 + i * 75); }); },
      reset() { srvs.forEach((s) => s.classList.remove('in', 'hashed', 'ping')); coinEl.classList.remove('go'); },
    };
  }
  const netA = buildScatterNet($('#sc-network'), 1, 4);
  const netB = buildScatterNet($('#sc-punchline'), 7, 4);

  // ---- MOVE 1: chain hopping between real currencies ----
  const ISLANDS = [
    { x: 0, y: 300, t: 'btc', n: 'BTC' }, { x: 350, y: 40, t: 'eth', n: 'ETH' },
    { x: 700, y: 300, t: 'sol', n: 'SOL' }, { x: 350, y: 560, t: 'usdt', n: 'USDT' },
  ];
  const ARCS = ['M120,360 Q295,150 470,100', 'M470,100 Q645,150 820,360', 'M820,360 Q645,610 470,620', 'M470,620 Q295,610 120,360'];
  $('#move1').innerHTML =
    `<div class="ch-wrap">
       <svg class="ch-arc" viewBox="0 0 940 760">${ARCS.map((d, i) => `<path id="ch-arc-${i}" d="${d}"/>`).join('')}</svg>
       ${ISLANDS.map((s) => `<div class="ch-island" style="left:${s.x}px; top:${s.y}px;">${tokenHTML(s.t)}<div class="ci-name">${s.n}</div></div>`).join('')}
       <div class="ch-coin" id="ch-coin" style="left:72px; top:312px;">$</div>
     </div>`;
  const chCoin = $('#ch-coin');
  const chArcs = ARCS.map((_, i) => $('#ch-arc-' + i));
  const HOPS = [{ dx: 0, dy: 0 }, { dx: 350, dy: -260 }, { dx: 700, dy: 0 }, { dx: 350, dy: 260 }];
  let hopTimer = 0, hopI = 0;
  function hopTo(i) { chCoin.style.transform = `translate(${HOPS[i].dx}px, ${HOPS[i].dy}px)`; const arc = (i + ARCS.length - 1) % ARCS.length; if (i !== 0 || hopI !== 0) chArcs[arc].classList.add('lit'); }
  function startHops() { stopHops(); hopI = 0; chArcs.forEach((a) => a.classList.remove('lit')); hopTimer = setInterval(() => { hopI = (hopI + 1) % HOPS.length; hopTo(hopI); }, 680); }
  function stopHops() { if (hopTimer) { clearInterval(hopTimer); hopTimer = 0; } }
  function showHopsInstant() { chArcs.forEach((a) => a.classList.add('lit')); chCoin.style.transition = 'none'; hopTo(2); void chCoin.offsetWidth; chCoin.style.transition = ''; }

  // ---- MOVE 2: mixer — 3 users throw real tokens in, get turquoise out ----
  const FIGX = [250, 540, 830];
  const IN_TOK = ['btc', 'eth', 'sol', 'usdt', 'eth', 'btc', 'sol', 'usdt', 'btc'];
  (function buildMixer() {
    let h = '<div class="mx2-wrap" id="mx2wrap">';
    h += '<div class="mx2-crowd">' + '<span></span>'.repeat(11) + '</div>';
    FIGX.forEach((x) => { h += `<div class="mx2-fig top" style="left:${x-60}px; top:120px;"><div class="fig-head"></div><div class="fig-body"></div></div>`; });
    FIGX.forEach((x) => { h += `<div class="mx2-fig bot" style="left:${x-60}px; top:930px;"><div class="fig-head"></div><div class="fig-body"></div></div>`; });
    h += '<div class="mx2-drum"><div class="mx2-blades"></div></div>';
    let ci = 0;
    FIGX.forEach((fx) => { for (let k = 0; k < 3; k++) { const sx = fx - 38 + k * 38, sy = 215; h += `<div class="mx2-coin cin" style="--x:${sx}px;--y:${sy}px;--dx:${540-sx}px;--dy:${660-sy}px;transition-delay:${(ci*0.06).toFixed(2)}s;">${tokenHTML(IN_TOK[ci])}</div>`; ci++; } });
    let co = 0;
    FIGX.forEach((fx) => { for (let k = 0; k < 3; k++) { const tx = fx - 38 + k * 38, ty = 905; h += `<div class="mx2-coin cout" style="--x:540px;--y:300px;--dx:${tx-540}px;--dy:${ty-300}px;transition-delay:${(co*0.06).toFixed(2)}s;">₿</div>`; co++; } });
    h += '</div>';
    $('#move2').innerHTML = h;
  })();
  const mx2wrap = $('#mx2wrap');
  function mxThrow() { mx2wrap.classList.add('throw'); }
  function mxSwap() { mx2wrap.classList.add('swap'); }
  function mxNewFigs() { mx2wrap.classList.add('newfigs'); }
  function mxPayout() { mx2wrap.classList.add('payout'); }
  function mxFinal() { mx2wrap.classList.add('throw', 'swap', 'newfigs', 'payout'); }
  function mxReset() { mx2wrap.classList.remove('throw', 'swap', 'newfigs', 'payout'); }

  // ---- MOVE 3: splitting ----
  const SPN = 24;
  let spWallets = '', spDots = '', spLines = '';
  for (let i = 0; i < SPN; i++) {
    const ang = (i / SPN) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const r = 250 + Math.random() * 150;
    const x = Math.cos(ang) * r, y = Math.sin(ang) * r * 0.9;
    spWallets += `<div class="sp-wallet" style="left:${470 + x - 30}px; top:${410 + y - 24}px;">▦</div>`;
    spDots += `<div class="sp-dot" style="--dx:${x.toFixed(0)}px; --dy:${y.toFixed(0)}px; --d:${(i % 8) * 0.035}s;"></div>`;
    spLines += `<line x1="470" y1="410" x2="${(470 + x).toFixed(0)}" y2="${(410 + y).toFixed(0)}" />`;
  }
  $('#move3').innerHTML = `<div class="sp-wrap"><svg class="sp-thread" viewBox="0 0 940 820">${spLines}</svg>${spWallets}<div class="sp-pile">$</div>${spDots}</div>`;
  const move3 = $('#move3');

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 620 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // ---- ENUMERATION (default element): the three moves, docked ----
  let enumEl = null;
  try {
    enumEl = new StacktagsEnumerationDetail($('#enum-host'), {
      items: [{ label: 'Chain hopping', sub: 'jump networks' }, { label: 'Mixers', sub: 'blur the origin' }, { label: 'Splitting', sub: 'scatter the haul' }],
    });
  } catch (e) { /* fail soft */ }
  const moves = [$('#move1'), $('#move2'), $('#move3')];
  function showMove(idx, instant) {
    moves.forEach((m, i) => m.classList.toggle('in', i === idx));
    if (idx === 0) { instant ? showHopsInstant() : startHops(); } else stopHops();
    if (idx === 1) { mxReset(); if (instant) mxFinal(); } else if (idx !== 1) { /* leave */ }
    if (idx !== 2) move3.classList.remove('burst');
    if (enumEl) enumEl.setActive(idx);
  }

  // ============================================================
  // GRID CAMERA + DEPTH TRANSITIONS
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
    [0.0,  'When North Korean hackers pulled off the biggest crypto heist in history —'],
    [3.6,  'around <b>$1.5 billion</b> —'],
    [5.6,  'they ran straight into a problem most people never expect:'],
    [9.92, "in crypto, you can't actually <b>hide</b> the money."],
    [10.96,'Most people think crypto is <b>anonymous</b> — perfect for crime.'],
    [14.64,"It's almost the exact <b>opposite</b>."],
    [15.84,"And it comes down to every blockchain's most innate <b>structure</b>."],
    [18.94,"The ledger isn't kept in one place."],
    [20.54,'An identical copy lives on <b>thousands of computers</b> worldwide.'],
    [25.90,'Every transaction is <b>broadcast</b> to all of them,'],
    [27.66,'and locked into the very same shared record.'],
    [30.34,'So the instant these hackers moved a coin,'],
    [32.76,'every one of those machines <b>saw it</b> —'],
    [34.50,'and kept it, <b>forever</b>.'],
    [37.22,'So when the group known as <b>Lazarus</b> drained that exchange,'],
    [39.10,'the whole world could watch the stolen funds sitting in their wallets.'],
    [42.70,'Stealing it was the <b>easy</b> part.'],
    [44.36,'Spending it is the <b>hard</b> part.'],
    [46.04,'Because the moment they try to send that money to an exchange to cash out,'],
    [49.94,'it gets <b>flagged and frozen</b>.'],
    [53.28,'So to have any hope of using it, they try to <b>break the trail</b>.'],
    [54.82,'They do it three ways.'],
    [56.38,'One: <b>chain hopping</b>.'],
    [57.24,'They bounce the money across different blockchains, again and again,'],
    [61.70,'so the trail has to keep <b>jumping networks</b>.'],
    [63.52,'Two: <b>mixers</b>.'],
    [65.34,'They throw the coins into a pot with the coins of thousands of other users'],
    [68.02,'who also aim to obscure their traces —'],
    [70.22,'may it be because of criminal activities,'],
    [72.02,'or just because they want to uphold privacy.'],
    [74.00,'Three: <b>splitting</b>.'],
    [74.88,'They chop the haul into thousands of tiny transfers across countless wallets,'],
    [79.06,"so there's no single <b>stream</b> left to follow."],
    [80.82,"And that's the <b>irony</b>."],
    [84.10,"The only reason they need all of this is that crypto isn't <b>anonymous</b> at all."],
    [85.32,"It's the most <b>transparent</b> money ever made —"],
    [87.80,'a permanent record, copied across the <b>entire world</b>.'],
    [89.76,'So stealing a billion is the <b>easy</b> part.'],
    [91.86,'Actually spending it is a problem most criminals never saw coming.'],
    [95.06,'Want more of how crypto really works?'],
    [96.8, 'Follow <b>Stacktags</b>.'],
  ];

  // ============================================================
  // CUES
  // ============================================================
  const CUES = [
    // HOOK — headlines in quick succession
    [0.0,  (i) => enter($('#sc-news'), 'fade', 600, i, () => { if (i) newsCards.forEach((c) => c.classList.add('in')); else newsCards[0].classList.add('in'); })],
    [1.1,  () => newsCards[1].classList.add('in')],
    [2.2,  () => newsCards[2].classList.add('in')],

    // STRUCTURE — scattered server network builds (bridges the "anonymous/opposite" line)
    [10.96,(i) => enter($('#sc-network'), 'zoom-out', 1150, i, () => netA.serversIn(i))],
    [25.90,(i) => { if (!i) netA.broadcast(); }],
    [30.34,(i) => netA.coinGo(i)],
    [32.76,(i) => netA.hashAll(i)],
    [37.22,(i) => { if (!i) netA.broadcast(); }],

    // WHY CAN'T SPEND — flagged & frozen
    [46.04,(i) => enter($('#sc-frozen'), 'pan-right', 1050, i, () => {
      const c = $('#fz-coin');
      if (i) { c.classList.add('go'); $('#fz-flag').classList.add('show'); $('#fz-frost').classList.add('show'); $('.fz-wrap').classList.add('frozen'); return; }
      setTimeout(() => c.classList.add('go'), 280);
    })],
    [49.94,() => { $('#fz-flag').classList.add('show'); $('#fz-frost').classList.add('show'); $('.fz-wrap').classList.add('frozen'); }],

    // THE THREE MOVES
    [54.82,(i) => {
      enter($('#sc-enum'), 'lift', 1000, i);
      if (!enumEl) return;
      if (i) { enumEl.revealAll({ stagger: 0 }); enumEl.collapseToLogo({ delay: 0 }); enumEl.dockToTop(); return; }
      enumEl.reset(); enumEl.revealAll({ stagger: 130 });
      setTimeout(() => enumEl.collapseToLogo({ delay: 0 }), 560);
      setTimeout(() => enumEl.dockToTop(), 1150);
    }],
    [56.38,(i) => showMove(0, i)],
    [63.52,(i) => showMove(1, i)],
    [65.34,(i) => { if (!i) mxThrow(); }],
    [68.02,(i) => { if (!i) mxSwap(); }],
    [70.22,(i) => { if (!i) mxNewFigs(); }],
    [72.02,(i) => { if (!i) mxPayout(); }],
    [74.00,(i) => showMove(2, i)],
    [74.88,() => move3.classList.add('burst')],

    // PUNCHLINE — scattered network; coin → one hash → propagate to all
    [80.82,(i) => enter($('#sc-punchline'), 'zoom-out', 1150, i, () => { netB.serversIn(true); if (i) { netB.coinGo(true); netB.hashAll(true); } })],
    [84.10,(i) => { if (!i) netB.coinGo(false); }],
    [85.32,(i) => { if (!i) netB.hashOne(4); }],
    [87.80,(i) => { if (!i) netB.hashRest(4, false); }],

    // OUTRO
    [95.06,(i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX
  // ============================================================
  const SFX = [
    [10.96,'swoosh', 0.50],                 // zoom-out to the network
    [32.76,'pop',    0.45],                 // hash committed
    [46.04,'swoosh', 0.50],                 // pan to the exchange
    [49.94,'pop',    0.45],                 // frozen impact
    [54.82,'swoosh', 0.55], [55.50,'swoosh', 0.50], [56.10,'swoosh', 0.40],  // lift + fold + dock
    [63.52,'swoosh', 0.34],                 // switch to mixers
    [65.34,'pop', 0.40], [65.62,'pop', 0.40], [65.90,'pop', 0.40],           // tokens thrown in
    [72.02,'pop', 0.45], [72.32,'pop', 0.45], [72.62,'pop', 0.45],           // turquoise coins out
    [74.00,'swoosh', 0.34],                 // switch to splitting
    [80.82,'swoosh', 0.50],                 // zoom-out to punchline
    [85.32,'pop', 0.45], [87.80,'pop', 0.40], [88.20,'pop', 0.40],           // hash + propagation
    [95.06,'swoosh', 0.60],                 // lift + outro assembles
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
    newsCards.forEach((c) => c.classList.remove('in'));
    netA.reset(); netB.reset();
    const c = $('#fz-coin'); if (c) c.classList.remove('go');
    $('#fz-flag').classList.remove('show'); $('#fz-frost').classList.remove('show'); $('.fz-wrap').classList.remove('frozen');
    if (enumEl) enumEl.reset();
    stopHops(); chArcs.forEach((a) => a.classList.remove('lit')); chCoin.style.transform = 'translate(0,0)';
    mxReset(); move3.classList.remove('burst');
    moves.forEach((m) => m.classList.remove('in'));
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
