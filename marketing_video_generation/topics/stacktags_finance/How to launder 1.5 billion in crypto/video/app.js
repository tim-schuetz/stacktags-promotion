/* ============================================================
   "How to launder $1.5 billion in crypto" — choreography
   The whole middle of the video plays on ONE persistent
   decentralised server network: transactions, hash records,
   Bybit/Lazarus tagging, the freeze, and all three laundering
   moves (chain hopping, mixers, splitting) happen relative to
   the same scattered servers. Audio-synced cue engine.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage');
  const grid = $('#grid');
  const vo = $('#vo');
  const subsLine = $('#subs-line');

  function fit() { stage.style.transform = 'scale(' + Math.min(innerWidth / 1080, innerHeight / 1920) + ')'; }
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
  // HOOK — generated images: Bybit → coins → Lazarus, $1.5 BILLION
  // ============================================================
  $('#sc-news').innerHTML =
    `<div class="hook2" id="hook2">
       <img class="hk-flag" src="assets/nkflag.png" alt="">
       <img class="hk-lazarus" src="assets/lazarus_cut.png" alt="">
       <div class="hk-laz-label">Lazarus</div>
       <div class="hk-amount"><span class="big">$1.5</span><span class="sub">BILLION</span></div>
       <img class="hk-skyline" src="assets/dubai_cut.png" alt="">
       <div class="hk-bybit"><div class="hk-bybit-lbl">Bybit</div><img src="assets/bybit_cut.png" alt=""></div>
       <svg class="hk-arrow" viewBox="0 0 1080 1920" preserveAspectRatio="none">
         <path class="hk-arrow-line" pathLength="1000" d="M540 1340 C 900 1130, 900 690, 662 690"/>
         <polygon class="hk-arrow-head" points="636,690 686,664 686,716"/>
       </svg>
     </div>`;
  const hook2 = $('#hook2');

  // ============================================================
  // SERVER NETWORK — the persistent canvas
  // ============================================================
  const SCATTER = [[210,330],[545,285],[860,395],[360,560],[720,640],[170,835],[520,905],[855,950],[330,1130],[675,1190]];
  const BYBIT = 3, LAZARUS = 6, EXCHANGE = 7, HOP_RETURN = 9;
  const H1 = '0x9f3a…c712', H2 = '0x47e1…a0b9';
  const LIFT = -470;
  const RING = [{ t: 'btc', n: 'BTC', dx: -250, dy: 0 }, { t: 'eth', n: 'ETH', dx: 0, dy: -250 }, { t: 'sol', n: 'SOL', dx: 250, dy: 0 }, { t: 'usdt', n: 'USDT', dx: 0, dy: 250 }];
  const RING_C = [540, 1200];
  const RING_NODES = RING.map((r) => [RING_C[0] + r.dx, RING_C[1] + r.dy]);

  // nearest-2 mesh + the two narrative edges
  const NET_EDGES = (function () {
    const E = new Set();
    SCATTER.forEach((p, i) => {
      const d = SCATTER.map((q, j) => [Math.hypot(p[0]-q[0], p[1]-q[1]), j]).filter((x) => x[1] !== i).sort((a, b) => a[0]-b[0]);
      [d[0], d[1]].forEach((n) => E.add(Math.min(i, n[1]) + '-' + Math.max(i, n[1])));
    });
    E.add(Math.min(BYBIT, LAZARUS) + '-' + Math.max(BYBIT, LAZARUS));
    E.add(Math.min(LAZARUS, EXCHANGE) + '-' + Math.max(LAZARUS, EXCHANGE));
    return [...E].map((s) => s.split('-').map(Number));
  })();

  const net = (function buildNetwork(scene) {
    const root = document.createElement('div'); root.className = 'snet';
    let lines = '<svg class="snet-lines" viewBox="0 0 1080 1920">';
    NET_EDGES.forEach(([a, b]) => { const len = Math.hypot(SCATTER[a][0]-SCATTER[b][0], SCATTER[a][1]-SCATTER[b][1]); lines += `<line x1="${SCATTER[a][0]}" y1="${SCATTER[a][1]}" x2="${SCATTER[b][0]}" y2="${SCATTER[b][1]}" style="--len:${len.toFixed(0)}"/>`; });
    lines += '</svg>';
    let servers = '';
    SCATTER.forEach(([x, y], i) => {
      servers += `<div class="srv" data-i="${i}" style="left:${x}px;top:${y}px;">`
        + `<div class="srv-cap"><span class="srv-stack"></span><span class="srv-dot" style="animation-delay:${(i*0.37).toFixed(2)}s"></span></div>`
        + `<div class="srv-hash h2">${H2}</div><div class="srv-hash h1">${H1}</div>`
        + '<div class="srv-line"></div><div class="srv-line short"></div>'
        + '<div class="srv-tag"></div><div class="srv-frost"></div></div>';
    });
    const ringArc = `<svg class="ring-arc" viewBox="0 0 1080 1920"><circle cx="${RING_C[0]}" cy="${RING_C[1]}" r="250"/></svg>`;
    const ringNodes = RING.map((r) => `<div class="ring-node" style="left:${r.dx}px;top:${r.dy}px;">${tokenHTML(r.t)}<div class="ci-name">${r.n}</div></div>`).join('');
    root.innerHTML = '<div class="snet-grp">' + lines + servers + '</div>'
      + ringArc + '<div class="snet-ring">' + ringNodes + '</div>'
      + '<div class="snet-mixer"><img src="assets/mixer_dash.png" alt=""></div>'
      + '<div class="snet-fx"></div>';
    scene.appendChild(root);
    const srvs = Array.from(root.querySelectorAll('.srv'));
    const fxLayer = root.querySelector('.snet-fx');
    let lifted = false;
    const pos = (i) => [SCATTER[i][0], SCATTER[i][1] + (lifted ? LIFT : 0)];

    function makeCoin(x, y, cls, html) { const el = document.createElement('div'); el.className = 'fxcoin' + (cls ? ' ' + cls : ''); el.innerHTML = html || ''; el.style.left = x + 'px'; el.style.top = y + 'px'; el._bx = x; el._by = y; fxLayer.appendChild(el); return el; }
    function moveCoin(el, x, y, dur) { el.style.setProperty('--dur', (dur || 0.9) + 's'); el.style.transform = `translate(-50%,-50%) translate(${x - el._bx}px, ${y - el._by}px)`; }
    function killCoin(el, delay) { setTimeout(() => { if (!el.parentNode) return; el.style.transition = 'opacity .3s ease'; el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, delay || 0); }
    function flyCoin(x0, y0, x1, y1, o) { o = o || {}; const el = makeCoin(x0, y0, o.cls, o.html); void el.offsetWidth; el.style.setProperty('--dur', (o.dur || 0.9) + 's'); el.style.transform = `translate(-50%,-50%) translate(${x1 - x0}px, ${y1 - y0}px)`; if (o.onArrive) setTimeout(o.onArrive, (o.dur || 0.9) * 1000); if (!o.keep) killCoin(el, (o.dur || 0.9) * 1000 + (o.hold || 90)); return el; }
    function clearFx() { fxLayer.innerHTML = ''; }

    return {
      root, srvs,
      serversIn(instant) { srvs.forEach((s, i) => { if (instant) s.classList.add('in'); else setTimeout(() => s.classList.add('in'), 100 + i * 110); }); },
      serverIn(idx) { srvs[idx].classList.add('in'); },
      serversInRest(except, instant) { srvs.forEach((s, i) => { if (i === except) return; if (instant) s.classList.add('in'); else setTimeout(() => s.classList.add('in'), 60 + i * 90); }); },
      unfreeze(idx) { srvs[idx].classList.remove('frozen', 'tagged'); const t = srvs[idx].querySelector('.srv-tag'); if (t) t.textContent = ''; },
      linesIn() { root.classList.add('lines-in'); },
      tx(from, to, o) { o = o || {}; const A = pos(from), B = pos(to); return flyCoin(A[0], A[1], B[0], B[1], { html: tokenHTML(o.token || 'btc'), dur: o.dur || 1.0, onArrive: o.onArrive }); },
      hash(idx, slot) { srvs[idx].classList.add('show-h' + slot); },
      hashAll(slot, instant) { srvs.forEach((s, i) => { if (instant) s.classList.add('show-h' + slot); else setTimeout(() => s.classList.add('show-h' + slot), i * 70); }); },
      tag(idx, text) { const t = srvs[idx].querySelector('.srv-tag'); t.textContent = text; srvs[idx].classList.add('tagged'); },
      freeze(idx) { srvs[idx].classList.add('frozen'); const t = srvs[idx].querySelector('.srv-tag'); t.textContent = 'FROZEN'; srvs[idx].classList.add('tagged'); },
      setLift(on) { lifted = on; root.classList.toggle('lifted', on); },
      mode(name) { root.classList.remove('mode-hop', 'mode-mix'); if (name) root.classList.add('mode-' + name); },
      doHopping() {
        clearFx();
        setTimeout(() => {
          const L = pos(LAZARUS); const coin = makeCoin(L[0], L[1], 'teal', '$'); void coin.offsetWidth;
          moveCoin(coin, RING_C[0], RING_C[1], 0.8);
          const seq = [0, 1, 2, 3, 0, 2, 1]; let d = 880;
          seq.forEach((k) => { setTimeout(() => moveCoin(coin, RING_NODES[k][0], RING_NODES[k][1], 0.5), d); d += 560; });
          setTimeout(() => { const N = pos(HOP_RETURN); moveCoin(coin, N[0], N[1], 0.8); killCoin(coin, 900); }, d);
        }, 950);
      },
      mixerIn() { const SRC = [LAZARUS, 5, 7, 9, 4], TOK = ['btc', 'eth', 'sol', 'usdt', 'btc']; SRC.forEach((idx, k) => { const P = pos(idx); setTimeout(() => flyCoin(P[0], P[1], RING_C[0], RING_C[1], { html: tokenHTML(TOK[k]), dur: 0.85, hold: 0 }), k * 150); }); },
      mixerOut() { const SRC = [LAZARUS, 5, 7, 9, 4]; SRC.forEach((idx, k) => { const P = pos(idx); setTimeout(() => flyCoin(RING_C[0], RING_C[1], P[0], P[1], { cls: 'teal', html: '₿', dur: 0.85 }), k * 150); }); },
      doSplitting() {
        clearFx();
        setTimeout(() => {
          const L = pos(LAZARUS); const targets = [0, 1, 2, 4, 5, 7, 8, 9];  // exclude Bybit (3) + Lazarus (6)
          const onward = (idx) => { const others = targets.filter((x) => x !== idx); const t2 = others[(Math.random() * others.length) | 0]; const P = pos(idx), Q = pos(t2); flyCoin(P[0], P[1], Q[0], Q[1], { cls: 'teal sm', dur: 0.7 }); };
          targets.forEach((idx, k) => { const P = pos(idx); setTimeout(() => flyCoin(L[0], L[1], P[0], P[1], { cls: 'teal sm', dur: 0.7, onArrive: () => onward(idx) }), k * 95); });
          setTimeout(() => targets.forEach((idx, k) => setTimeout(() => onward(idx), k * 80)), 2300);
          setTimeout(() => targets.forEach((idx, k) => setTimeout(() => onward(idx), k * 80)), 4000);
        }, 950);
      },
      reset() {
        srvs.forEach((s) => { s.classList.remove('in', 'show-h1', 'show-h2', 'tagged', 'frozen'); const t = s.querySelector('.srv-tag'); if (t) t.textContent = ''; });
        root.classList.remove('lines-in', 'lifted', 'mode-hop', 'mode-mix'); lifted = false; clearFx();
      },
    };
  })($('#sc-network'));

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 620 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

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
    el.style.setProperty('--tx', (p.tx || 0) + 'px'); el.style.setProperty('--ty', (p.ty || 0) + 'px');
    el.style.setProperty('--s', p.s != null ? p.s : 1); el.style.opacity = p.op != null ? p.op : 1;
    el.style.filter = p.blur ? `blur(${p.blur}px)` : 'none'; if (p.z != null) el.style.zIndex = p.z;
  }
  function POSES(mode, e) {
    switch (mode) {
      case 'zoom-out': return { from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 }, to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'fade': return { from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      default: return { from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 }, to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100; const fromEl = current;
    if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3; const t0 = performance.now(); const gy0 = gcam.y;
      setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur)); const dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: lerp(1, 1.3, e), op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        gdisp.y = gy0 + dy * 0.5;
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
        gdisp.y = gy0; gcam.s = gs0; current = toEl; if (onArrive) onArrive();
      })(performance.now());
      return;
    }
    const p0 = POSES(mode, 0); if (p0.grid != null) gcam.s = gs0 * p0.grid;
    setPose(toEl, Object.assign({ op: 0 }, p0.to)); const t0 = performance.now();
    (function step(now) {
      const e = easeInOut(clamp01((now - t0) / dur)); const ps = POSES(mode, e);
      if (fromEl) setPose(fromEl, ps.from); setPose(toEl, ps.to);
      if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
      if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
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
    subsLine.classList.remove('in'); setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 140);
  }
  const SUBS = [
    [0.0,  'When North Korean hackers pulled off the biggest crypto heist in history —'],
    [3.6,  'around <b>$1.5 billion</b> —'],
    [5.6,  'they ran straight into a problem most people never expect:'],
    [9.66, "in crypto, you can't actually <b>hide</b> the money."],
    [10.82,'Most people think crypto is <b>anonymous</b> — perfect for crime.'],
    [14.44,"It's almost the exact <b>opposite</b>."],
    [15.88,"And it comes down to every blockchain's most innate <b>structure</b>."],
    [19.04,"The ledger isn't kept in one place."],
    [20.82,'An identical copy lives on <b>thousands of computers</b> worldwide.'],
    [24.76,'Every single transaction is <b>broadcast</b> to all of them,'],
    [27.64,'and locked into the very same shared record.'],
    [30.18,'So the instant these hackers moved a coin,'],
    [32.38,'every one of those machines <b>saw it</b> —'],
    [34.28,'and kept it, <b>forever</b>.'],
    [36.94,'So when the group known as <b>Lazarus</b> drained that exchange,'],
    [38.34,'the whole world could watch the stolen funds sitting in their wallets.'],
    [41.40,'Stealing it was the <b>easy</b> part.'],
    [43.10,'Spending it is the <b>hard</b> part.'],
    [44.76,'Because the moment they try to send that money to an exchange to cash out,'],
    [48.26,'it gets <b>flagged and frozen</b>.'],
    [51.58,'So to have any hope of using it, they try to <b>break the trail</b>.'],
    [53.10,'They do it three ways.'],
    [54.94,'One: <b>chain hopping</b>.'],
    [56.06,'They bounce the money across different blockchains, again and again,'],
    [60.06,'so the trail has to keep <b>jumping networks</b>.'],
    [61.76,'Two: <b>mixers</b>.'],
    [63.68,'They throw the coins into a pot with the coins of thousands of other users'],
    [66.26,'who also aim to obscure their traces —'],
    [68.52,'may it be because of criminal activities,'],
    [70.38,'or just because they want to uphold privacy.'],
    [72.50,'Three: <b>splitting</b>.'],
    [73.42,'They chop the haul into thousands of tiny transfers across countless wallets,'],
    [77.72,"so there's no single <b>stream</b> left to follow."],
    [79.50,"And that's the <b>irony</b>."],
    [82.98,"The only reason they need all of this is that crypto isn't <b>anonymous</b> at all."],
    [84.32,"It's the most <b>transparent</b> money ever made —"],
    [87.28,'a permanent record, copied across the <b>entire world</b>.'],
    [89.38,'So stealing a billion is the <b>easy</b> part.'],
    [91.26,'Actually spending it is a problem most criminals never saw coming.'],
    [94.60,'Want more of how crypto really works?'],
    [96.66,'Discover millions of ideas, exercises and more learning content'],
    [99.88,'on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — all on the persistent network
  // ============================================================
  const CUES = [
    [0.0,  (i) => enter($('#sc-news'), 'fade', 700, i)],
    [0.1,  () => hook2.classList.add('go')],

    // network: ONE ledger appears on "the ledger isn't kept in one place",
    // the copies on "an identical copy…", then the lines between them
    [18.0, (i) => enter($('#sc-network'), 'zoom-out', 1150, i, () => { net.serverIn(LAZARUS); if (i) { net.serversInRest(LAZARUS, true); net.linesIn(); } })],
    [20.82,(i) => net.serversInRest(LAZARUS, i)],
    [22.60,() => net.linesIn()],

    // "every single transaction": coin Bybit→Lazarus, both hash, then all
    [24.76,(i) => { if (!i) net.tx(BYBIT, LAZARUS, { token: 'btc' }); }],
    [26.00,() => { net.hash(BYBIT, 1); net.hash(LAZARUS, 1); }],
    [27.20,(i) => net.hashAll(1, i)],

    // "so the instant": same again, then tag Bybit + Lazarus red
    [30.18,(i) => { if (!i) net.tx(BYBIT, LAZARUS, { token: 'btc' }); }],
    [32.38,() => { net.hash(BYBIT, 2); net.hash(LAZARUS, 2); }],
    [33.40,(i) => net.hashAll(2, i)],
    // red Bybit / Lazarus identification when Lazarus is first named
    [36.94,() => { net.tag(BYBIT, 'BYBIT'); net.tag(LAZARUS, 'LAZARUS'); }],

    // "because the moment…": Lazarus → exchange server, which freezes it
    [45.86,(i) => { if (!i) net.tx(LAZARUS, EXCHANGE, { token: 'btc', dur: 1.4 }); }],
    [48.26,() => net.freeze(EXCHANGE)],

    // "They do it three ways" — clear the exchange's frozen state
    [53.10,() => net.unfreeze(EXCHANGE)],

    // THE THREE MOVES — on the network
    [54.94,(i) => { net.setLift(true); net.mode('hop'); if (!i) net.doHopping(); }],
    [61.76,(i) => { net.setLift(true); net.mode('mix'); }],
    [63.68,(i) => { if (!i) net.mixerIn(); }],
    [70.38,(i) => { if (!i) net.mixerOut(); }],
    [72.50,(i) => { net.setLift(false); net.mode(''); if (!i) net.doSplitting(); }],

    // OUTRO — fade (clean cut from the avatar window, no scene slide-out flash)
    [94.60,(i) => { enter($('#sc-outro'), 'fade', 700, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX
  // ============================================================
  const SFX = [
    [0.80,'pop', 0.40],
    [18.0,'swoosh', 0.50], [20.82,'pop', 0.38],
    [26.00,'pop', 0.40], [32.38,'pop', 0.40], [36.94,'pop', 0.45],
    [48.26,'pop', 0.45],
    [54.94,'swoosh', 0.50],
    [61.76,'swoosh', 0.42], [63.68,'pop', 0.38], [64.00,'pop', 0.38],
    [70.38,'pop', 0.38], [70.70,'pop', 0.38],
    [72.50,'swoosh', 0.50], [73.42,'pop', 0.36], [73.80,'pop', 0.36], [74.20,'pop', 0.36],
    [94.60,'swoosh', 0.60],
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
    if (hook2) hook2.classList.remove('go');
    net.reset();
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

  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });
  hardReset();
})();
