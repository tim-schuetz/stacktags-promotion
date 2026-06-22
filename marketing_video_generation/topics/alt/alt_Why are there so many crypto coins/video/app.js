/* ============================================================
   "Why are there so many crypto coins?" — NEW STYLE choreography
   A continuous faux-3D camera over a persistent dynamic grid. Every
   beat is driven off the narration's audio.currentTime (cue engine)
   so it lands on the spoken word. Reuses the default elements:
   graph-chart, text-popup, outro, the shared theme/subtitles + the
   ported depth-grid transitions.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const make = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  // ---- stage refs ----
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
  // SCENE DOM
  // ============================================================
  // ---- HOOK 1: counter ----
  $('#sc-count').innerHTML =
    `<div class="count-wrap">
       <div class="count-coins" id="count-coins"></div>
       <div class="count-center">
         <div class="count-eyebrow">crypto coins in existence</div>
         <div class="count-num"><span id="count-val">0</span><span class="count-plus">+</span></div>
         <div class="count-tag" id="count-tag">…and <b>counting</b></div>
       </div>
     </div>`;
  const countCoins = $('#count-coins');
  const COUNT_CHIPS = [];
  (function buildCountChips() {
    const glyphs = ['₿', 'Ξ', '$', '◎', '⬡', '$'];
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + (i % 3);
      const rad = 240 + (i % 5) * 110 + Math.random() * 70;
      const x = 540 + Math.cos(a) * rad * 0.92;
      const y = 960 + Math.sin(a) * rad;
      if (Math.abs(x - 540) < 240 && Math.abs(y - 960) < 230) continue; // keep the centre clear
      const d = 46 + Math.random() * 64;
      const chip = make(`<div class="count-chip ${i % 4 === 0 ? 'gold' : ''}" style="left:${x}px;top:${y}px;--d:${d}px">${glyphs[i % glyphs.length]}</div>`);
      countCoins.appendChild(chip);
      COUNT_CHIPS.push(chip);
    }
  })();
  const countVal = $('#count-val');
  const countTag = $('#count-tag');
  const COUNT_TARGET = 9400000;
  let countRAF = 0;
  function countUp(instant) {
    if (countRAF) cancelAnimationFrame(countRAF);
    if (instant) { countVal.textContent = COUNT_TARGET.toLocaleString('en-US'); COUNT_CHIPS.forEach(c => c.classList.add('in')); return; }
    COUNT_CHIPS.forEach((c, i) => setTimeout(() => c.classList.add('in'), 60 + i * 36));
    const t0 = performance.now(), dur = 2100;
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      countVal.textContent = Math.round(COUNT_TARGET * e).toLocaleString('en-US');
      if (p < 1) countRAF = requestAnimationFrame(step);
    })(performance.now());
  }

  // ---- HOOK 2: too slow ----
  $('#sc-slow').innerHTML =
    `<div class="slow-wrap">
       <div class="slow-coin"><img src="assets/photos/bitcoin_dash.png" alt="Bitcoin" onerror="this.style.display='none'"></div>
       <div class="slow-snail" id="slow-snail"><img src="assets/photos/snail_dash.png" alt="" onerror="this.style.display='none'"></div>
       <div class="slow-label" id="slow-label">too <b>slow</b></div>
       <div class="slow-bar" id="slow-bar"><i></i></div>
     </div>`;

  // ---- WAVE 1: Bitcoin ----
  $('#sc-btc').innerHTML =
    `<div class="wave">
       <div class="wave-top">
         <div class="wave-num">WAVE 1</div>
         <div class="wave-name">Bitcoin</div>
         <div class="wave-sub">brilliant digital money</div>
       </div>
       <div class="wave-coin"><img src="assets/photos/bitcoin_dash.png" alt="Bitcoin" onerror="this.style.display='none'"></div>
       <div class="btc-rail" id="btc-rail">
         <div class="rail-cap">it does just <b>one</b> job — move BTC</div>
         <div class="rail-line"></div>
         <div class="rail-end a"></div><div class="rail-end b"></div>
         <div class="rail-coin">₿</div>
       </div>
       <div class="btc-build" id="btc-build">
         <div class="btc-blocks">
           <div class="btc-block b1">app <span class="x">✗</span></div>
           <div class="btc-block b2">app <span class="x">✗</span></div>
           <div class="btc-block b3">app <span class="x">✗</span></div>
         </div>
       </div>
       <div class="btc-more" id="btc-more">so people wanted <b>more</b></div>
     </div>`;

  // ---- WAVE 2: Ethereum ----
  $('#sc-eth').innerHTML =
    `<div class="wave">
       <div class="wave-top">
         <div class="wave-num">WAVE 2</div>
         <div class="wave-name">Ethereum</div>
         <div class="wave-sub">a programmable platform</div>
       </div>
       <div class="eth-apps" id="eth-apps">
         <div class="eth-app a1">🎮</div><div class="eth-app a2">💱</div><div class="eth-app a3">🖼️</div>
       </div>
       <div class="eth-platform" id="eth-platform">ETHEREUM</div>
       <div class="eth-sc" id="eth-sc"><span class="chip">smart contracts</span></div>
       <div class="eth-code" id="eth-code"><pre><span class="cm">// a new token, in a few lines</span>
<span class="kw">contract</span> <span class="fn">MyCoin</span> {
  <span class="kw">uint</span> supply = <span class="fn">1_000_000</span>;
}</pre></div>
       <div class="eth-tokens" id="eth-tokens"></div>
     </div>`;

  // ---- WAVE 3: rivals ----
  $('#sc-rivals').innerHTML =
    `<div class="rivals-wrap">
       <div class="rivals-title">rivals appear —<br><b>faster · cheaper</b></div>
       <div class="rival-node" id="rn-sol" style="left:90px;top:780px">
         <div class="rival-badge">◎<div class="rival-coin-badge">$</div></div>
         <div class="rival-name">Solana</div>
       </div>
       <div class="rival-node" id="rn-bnb" style="left:560px;top:700px">
         <div class="rival-badge">⬡<div class="rival-coin-badge">$</div></div>
         <div class="rival-name">BNB Chain</div>
       </div>
       <div class="rival-node" id="rn-many" style="left:360px;top:1140px">
         <div class="rival-badge">⋯<div class="rival-coin-badge">$</div></div>
         <div class="rival-name">+ many more</div>
       </div>
     </div>`;

  // ---- WAVE 4: mint ----
  $('#sc-mint').innerHTML =
    `<div class="mint-wrap">
       <div class="mint-eyebrow">making a coin is now</div>
       <div class="mint-platform" id="mint-platform">completely <b>trivial</b></div>
       <div class="mint-btn-box">
         <div class="mint-spit" id="mint-spit"></div>
         <div class="mint-btn">MINT ▸</div>
         <div class="mint-finger">👆</div>
       </div>
     </div>`;
  const mintPlatform = $('#mint-platform');
  const mintSpit = $('#mint-spit');

  // ---- WAVE 4: flood ----
  const floodHost = $('#flood-host');
  floodHost.innerHTML =
    `<div class="flood-doge" id="flood-doge"><img src="assets/photos/doge_dash.png" alt="" onerror="this.style.display='none'"></div>
     <div class="flood-verdict" id="flood-verdict">most <b>worthless within days</b></div>`;
  const FLOOD_TICKERS = ['$DOGE', '$PEPE', '$SHIB', '$WIF', '$BONK', '$MOON', '$FLOKI', '$TRUMP', '$CHAD', '$SAFE', '$ELON', '$PONZI', '$RUG', '$WAGMI'];
  const FLOOD_CHIPS = [];
  (function buildFloodChips() {
    const slots = [
      [180, 470], [880, 470], [120, 760], [950, 770], [250, 1010], [820, 1010],
      [430, 430], [690, 540], [160, 1180], [900, 1180], [540, 360], [330, 640],
      [760, 760], [560, 1230],
    ];
    FLOOD_TICKERS.forEach((tk, i) => {
      const [x, y] = slots[i % slots.length];
      const r = (i % 2 ? 1 : -1) * (3 + (i % 4) * 2);
      const chip = make(`<div class="flood-chip" style="left:${x}px;top:${y}px;--r:${r}deg">${tk}</div>`);
      floodHost.appendChild(chip);
      FLOOD_CHIPS.push(chip);
    });
  })();
  const floodDoge = $('#flood-doge');

  // ---- PUNCHLINE: tree ----
  $('#sc-tree').innerHTML =
    `<div class="tree-wrap">
       <div class="tree-headline" id="tree-headline">each fix made the <b>next coin easier</b></div>
       <svg class="tree-svg" id="tree-svg" viewBox="0 0 1080 1920" preserveAspectRatio="none"></svg>
     </div>`;
  const treeWrap = $('#sc-tree .tree-wrap');
  const treeSvg = $('#tree-svg');
  const TREE_NODES = [
    { id: 'btc', x: 540, y: 1600, d: 160, img: 'assets/photos/bitcoin.png', cap: '① Bitcoin' },
    { id: 'eth', x: 540, y: 1230, d: 140, img: 'assets/photos/ethereum.png', cap: '② Ethereum' },
    { id: 'r1', x: 250, y: 900, d: 104, glyph: '◎' },
    { id: 'r2', x: 540, y: 860, d: 104, glyph: '⬡', cap: '③ rival chains' },
    { id: 'r3', x: 830, y: 900, d: 104, glyph: '⋯' },
  ];
  const TREE_BRANCHES = [
    'M540,1518 C540,1430 540,1360 540,1302',
    'M520,1162 C430,1070 330,1010 268,952',
    'M540,1158 C540,1040 540,980 540,914',
    'M560,1162 C650,1070 750,1010 812,952',
  ];
  // explosion twigs (from rivals upward) + leaf endpoints
  const TREE_TWIGS = [];
  const TREE_LEAVES = [];
  [[250, 850], [540, 808], [830, 850]].forEach(([rx, ry], ri) => {
    for (let k = 0; k < 4; k++) {
      const lx = rx + (k - 1.5) * 150 + (Math.random() * 60 - 30);
      const ly = 470 + Math.random() * 180;
      TREE_TWIGS.push(`M${rx},${ry} C${rx + (lx - rx) * .4},${ry - 120} ${lx},${ly + 120} ${lx},${ly}`);
      TREE_LEAVES.push([lx, ly]);
    }
  });
  // extra free-floating leaves to sell the flood
  for (let i = 0; i < 14; i++) TREE_LEAVES.push([110 + Math.random() * 860, 380 + Math.random() * 320]);
  const treeNodeEls = {}, treeLeafEls = [], treePaths = [];
  (function buildTree() {
    [...TREE_BRANCHES, ...TREE_TWIGS].forEach((d) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d); p.style.setProperty('--len', '1600');
      treeSvg.appendChild(p); treePaths.push(p);
    });
    TREE_NODES.forEach((n) => {
      const inner = n.img ? `<img src="${n.img}" onerror="this.parentNode.textContent='₿'">` : n.glyph;
      const el = make(`<div class="tree-node" id="tn-${n.id}" style="left:${n.x}px;top:${n.y}px">
          <div class="tree-dot ${n.glyph ? 'teal' : ''}" style="--nd:${n.d}px">${inner}</div>
          ${n.cap ? `<div class="tree-cap">${n.cap}</div>` : ''}
        </div>`);
      treeWrap.appendChild(el); treeNodeEls[n.id] = el;
    });
    const memeLabel = make(`<div class="tree-node in" style="left:820px;top:430px;opacity:0" id="tn-meme"><div class="tree-cap" style="font-size:36px;color:var(--stk-teal-d)">④ memecoins</div></div>`);
    treeWrap.appendChild(memeLabel); treeNodeEls.meme = memeLabel;
    TREE_LEAVES.forEach(([x, y]) => {
      const lf = make(`<div class="tree-leaf" style="left:${x}px;top:${y}px"></div>`);
      treeWrap.appendChild(lf); treeLeafEls.push(lf);
    });
  })();
  function drawBranch(i) { if (treePaths[i]) treePaths[i].classList.add('drawn'); }
  function treeGrow(stage, instant) {
    // stage 1: root, 2: eth, 3: rivals, 4: explosion
    if (stage >= 1) treeNodeEls.btc.classList.add('in');
    if (stage >= 2) { drawBranch(0); treeNodeEls.eth.classList.add('in'); }
    if (stage >= 3) { [1, 2, 3].forEach(drawBranch); ['r1', 'r2', 'r3'].forEach(id => treeNodeEls[id].classList.add('in')); }
    if (stage >= 4) {
      for (let i = 4; i < treePaths.length; i++) (instant ? drawBranch(i) : setTimeout(() => drawBranch(i), (i - 4) * 40));
      treeNodeEls.meme.style.opacity = '1';
      treeLeafEls.forEach((lf, i) => instant ? lf.classList.add('in') : setTimeout(() => lf.classList.add('in'), i * 50));
    }
  }

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // ============================================================
  // DEFAULT ELEMENT MOUNTS
  // ============================================================
  // fees chart (Wave 3) — Ethereum fee per transaction, climbing
  let feesChart = null;
  try {
    feesChart = new StacktagsGraphChart($('#fees-host'), {
      type: 'line',
      title: 'Ethereum <b>fee</b> per transaction',
      sub: 'as it got popular',
      data: [
        { label: "'16", value: 2 }, { label: "'17", value: 9 }, { label: "'18", value: 16 },
        { label: "'20", value: 34 }, { label: "'21", value: 72 }, { label: "peak", value: 130 },
      ],
      valuePrefix: '$', headline: 130, showValue: true,
    });
    const cap = make(`<div class="fees-cap">popular → slow &amp; <b>expensive</b></div>`);
    $('#sc-fees').appendChild(cap);
  } catch (e) { /* fail soft */ }

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
    const cs = clamp(gdisp.s * idleS, 0.82, 1.6);
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
    if (instant) { showInstant(el); if (onArrive) onArrive(); return; }
    depthGo(el, mode, dur, onArrive);
  }

  // ---- spawn helpers ----
  function spawnTokens(host, n, glyphs, spread, instant) {
    for (let i = 0; i < n; i++) {
      // a downward fan (out of the code box into the empty lower band)
      const ang = Math.PI * 0.12 + Math.random() * Math.PI * 0.76;
      const ex = Math.cos(ang) * (spread * (0.6 + Math.random() * 0.6));
      const ey = Math.sin(ang) * (spread * (0.5 + Math.random() * 0.7));
      const tok = make(`<div class="eth-token" style="--ex:${ex}px;--ey:${ey}px;left:50%;top:10px">${glyphs[i % glyphs.length]}</div>`);
      host.appendChild(tok);
      if (instant) tok.classList.add('in');
      else setTimeout(() => tok.classList.add('in'), 20 + i * 80);
    }
  }
  function spawnSpit(instant) {
    mintSpit.innerHTML = '';
    const N = 12, glyphs = ['$', '◎', 'Ξ', '🐶', '$', '⬡'];
    for (let i = 0; i < N; i++) {
      const ang = -Math.PI / 2 + (i / N - 0.5) * 2.4;
      const sx = Math.cos(ang) * (360 + Math.random() * 200);
      const sy = Math.sin(ang) * (360 + Math.random() * 200);
      const tok = make(`<div class="mint-tok" style="--sx:${sx}px;--sy:${sy}px">${glyphs[i % glyphs.length]}</div>`);
      mintSpit.appendChild(tok);
      if (instant) tok.style.opacity = '0';
      else setTimeout(() => tok.classList.add('go'), 40 + i * 70);
    }
  }

  // ============================================================
  // SUBTITLES (mirror the narration, one short line at a time)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 130);
  }
  const SUBS = [
    [0.00, 'There are now <b>millions</b> of cryptocurrencies.'],
    [2.32, 'Not thousands — <b>millions</b>.'],
    [4.32, 'And it all started because the very first one,'],
    [6.40, 'Bitcoin was simply too <b>slow</b>.'],
    [8.30, 'Bitcoin was the original.'],
    [9.40, 'Brilliant as digital money —'],
    [10.68, 'but somewhat <b>limited</b>.'],
    [13.60, 'It’s slow.'],
    [14.54, 'It can basically do just one thing:'],
    [16.40, '<b>move Bitcoin</b>.'],
    [17.52, 'You can’t build anything on top of it.'],
    [19.42, 'So people wanted <b>more</b>.'],
    [20.70, 'That’s where <b>Ethereum</b> came in.'],
    [21.98, 'It added <b>smart contracts</b> —'],
    [23.74, 'little programs that run on the blockchain.'],
    [26.18, 'Suddenly it could host <b>apps</b>,'],
    [28.26, 'not just payments.'],
    [29.40, 'And anyone could create their own <b>token</b>'],
    [31.40, 'on top of Ethereum,'],
    [32.54, 'with just a few lines of <b>code</b>.'],
    [34.34, 'The <b>floodgates</b> cracked open.'],
    [35.60, 'Then Ethereum got so popular,'],
    [36.92, 'it became slow and <b>expensive</b>.'],
    [39.02, 'So a wave of rival blockchains launched,'],
    [40.80, 'each promising to be faster, or <b>cheaper</b>.'],
    [43.24, '<b>Solana</b>, <b>BNB</b>, and many more.'],
    [45.34, 'And every one comes with its own <b>coin</b>.'],
    [47.70, 'And finally, it became <b>trivial</b>'],
    [49.30, 'to make a coin at all.'],
    [50.68, 'Platforms like <b>Pump.fun</b>'],
    [51.92, 'let anyone launch a token in <b>seconds</b>,'],
    [53.84, 'for almost nothing.'],
    [54.91, 'The result?'],
    [56.06, 'A flood of <b>memecoins</b> —'],
    [57.42, 'coins based on jokes, dogs, celebrities —'],
    [60.06, 'most with no purpose but <b>speculation</b>,'],
    [61.80, 'and most <b>worthless</b> within days.'],
    [63.74, 'So why are there millions of coins?'],
    [65.44, 'Because crypto kept fixing its own <b>limits</b> —'],
    [67.98, 'and each fix made it easier'],
    [69.54, 'for anyone to <b>mint</b> the next one.'],
    [70.98, 'We went from one careful <b>experiment</b>…'],
    [72.94, 'to a <b>button</b> that spits out'],
    [74.40, 'a new currency in seconds.'],
    [75.78, 'Just remember: almost none of them'],
    [77.06, 'are <b>worth anything</b>.'],
    [78.44, 'Want more of how crypto really works?'],
    [80.20, 'Follow <b>Stacktags</b>.'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    // HOOK 1 — counter
    [0.00, (i) => enter($('#sc-count'), 'fade', 650, i, () => countUp(i))],
    [2.32, (i) => { countTag.classList.add('in'); if (i) countUp(true); }],

    // HOOK 2 — too slow
    [4.42, (i) => enter($('#sc-slow'), 'zoom-out', 1050, i, () => {
      $('#slow-snail').classList.add('in');
      const bar = $('#slow-bar'); bar.classList.add('in');
      if (i) bar.classList.add('go'); else setTimeout(() => bar.classList.add('go'), 120);
    })],
    [6.40, () => $('#slow-label').classList.add('in')],

    // WAVE 1 — Bitcoin
    [8.30, (i) => enter($('#sc-btc'), 'drop', 1050, i)],
    [13.60, () => $('#btc-rail').classList.add('in', 'go')],
    [17.52, () => $('#btc-build').classList.add('in')],
    [19.42, () => $('#btc-more').classList.add('in')],

    // WAVE 2 — Ethereum
    [20.70, (i) => enter($('#sc-eth'), 'rise', 1050, i, () => { $('#eth-platform').classList.add('in'); })],
    [21.98, () => $('#eth-sc').classList.add('in')],
    [26.18, () => $('#eth-apps').classList.add('in')],
    [29.40, () => $('#eth-code').classList.add('in')],
    [32.54, (i) => spawnTokens($('#eth-tokens'), 5, ['$', '◎', 'Ξ', '⬡'], 300, i)],
    [34.34, (i) => spawnTokens($('#eth-tokens'), 6, ['$', '◎', 'Ξ', '⬡', '🐶'], 380, i)],

    // WAVE 3 — fees chart
    [35.60, (i) => enter($('#sc-fees'), 'zoom-out', 1100, i, () => { if (feesChart) { i ? feesChart.showAll() : feesChart.draw({ duration: 2400 }); } })],
    [37.90, () => $('#sc-fees').classList.add('cap-in')],

    // WAVE 3 — rivals
    [39.02, (i) => enter($('#sc-rivals'), 'pan-right', 1050, i)],
    [43.24, () => $('#rn-sol').classList.add('in')],
    [43.88, () => $('#rn-bnb').classList.add('in')],
    [44.74, () => $('#rn-many').classList.add('in')],
    [45.34, () => ['rn-sol', 'rn-bnb', 'rn-many'].forEach(id => $('#' + id).classList.add('coined'))],

    // WAVE 4 — mint
    [47.70, (i) => enter($('#sc-mint'), 'drop', 1050, i, () => { $('#sc-mint').classList.add('plat-in', 'btn-in'); })],
    [50.68, () => { mintPlatform.innerHTML = 'on platforms like <b>Pump.fun</b>'; }],
    [51.92, (i) => { $('#sc-mint').classList.add('tap'); spawnSpit(i); }],

    // WAVE 4 — flood
    [56.06, (i) => enter($('#sc-flood'), 'zoom-out', 1100, i, () => {
      floodDoge.classList.add('in');
      const order = [0, 5, 10, 2, 7, 12];
      if (i) order.forEach(idx => FLOOD_CHIPS[idx] && FLOOD_CHIPS[idx].classList.add('in'));
      else order.forEach((idx, k) => setTimeout(() => FLOOD_CHIPS[idx] && FLOOD_CHIPS[idx].classList.add('in'), 60 + k * 130));
    })],
    [57.42, (i) => {
      const rest = [1, 3, 4, 6, 8, 9, 11, 13];
      if (i) rest.forEach(idx => FLOOD_CHIPS[idx] && FLOOD_CHIPS[idx].classList.add('in'));
      else rest.forEach((idx, k) => setTimeout(() => FLOOD_CHIPS[idx] && FLOOD_CHIPS[idx].classList.add('in'), 20 + k * 150));
    }],
    [61.80, () => { FLOOD_CHIPS.forEach((c, i) => { if (i % 5 !== 0) c.classList.add('dead'); }); $('#sc-flood').classList.add('verdict-in'); }],

    // PUNCHLINE — tree
    [63.74, (i) => enter($('#sc-tree'), 'zoom-out', 1150, i, () => { $('#tree-headline').classList.add('in'); treeGrow(1, i); })],
    [65.44, () => treeGrow(2)],
    [67.98, () => treeGrow(3)],
    [69.20, (i) => treeGrow(4, i)],
    [70.98, () => { treeNodeEls.btc.classList.add('lit'); }],          // "one careful experiment" — pulse the origin
    [72.94, () => { treeNodeEls.btc.classList.remove('lit'); }],
    [75.78, () => { treeLeafEls.forEach((lf, i) => { if (i % 6 !== 0) lf.classList.add('dead'); }); }],

    // OUTRO
    [78.44, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — declared sound bed. swoosh on grid-moving transitions /
  // default elements; ticking on count-ups & the chart; pop per
  // popped word/object. The render pipeline reads window.SFX and
  // overlays each sound on the narration with ffmpeg.
  // [t, sound ∈ {swoosh,pop,ticking}, vol 0..1]
  // ============================================================
  const SFX = [
    [0.00, 'ticking', 0.42],                                  // counter rockets up
    [4.42, 'swoosh', 0.50],                                   // → too slow (zoom-out)
    [8.30, 'swoosh', 0.52],                                   // → Bitcoin (drop)
    [20.70, 'swoosh', 0.52],                                  // → Ethereum (rise)
    [21.98, 'pop', 0.50],                                     // smart contracts chip
    [26.18, 'pop', 0.45], [26.40, 'pop', 0.45], [26.62, 'pop', 0.45],  // apps
    [32.54, 'pop', 0.45], [32.95, 'pop', 0.45], [33.40, 'pop', 0.45],  // tokens from code
    [34.34, 'swoosh', 0.40],                                  // floodgates burst
    [35.60, 'swoosh', 0.50], [36.00, 'ticking', 0.42],        // → fees chart + count-up
    [39.02, 'swoosh', 0.50],                                  // → rivals (pan)
    [43.24, 'pop', 0.52], [43.88, 'pop', 0.52], [44.74, 'pop', 0.52],  // Solana / BNB / many
    [45.34, 'pop', 0.42], [45.66, 'pop', 0.42], [45.98, 'pop', 0.42],  // their coins
    [47.70, 'swoosh', 0.52],                                  // → mint (drop)
    [51.92, 'pop', 0.45], [52.20, 'pop', 0.45], [52.55, 'pop', 0.45], [52.95, 'pop', 0.45],  // spit
    [56.06, 'swoosh', 0.50],                                  // → flood (zoom-out)
    [56.20, 'pop', 0.50], [56.66, 'pop', 0.50], [57.10, 'pop', 0.50],  // first chips
    [57.55, 'pop', 0.50], [57.95, 'pop', 0.50], [58.40, 'pop', 0.50], [58.90, 'pop', 0.50], [59.32, 'pop', 0.50],  // jokes/dogs/celebs
    [63.74, 'swoosh', 0.52],                                  // → tree (zoom-out)
    [65.44, 'pop', 0.45], [67.98, 'pop', 0.45],               // eth + rivals grow
    [69.20, 'pop', 0.42], [69.55, 'pop', 0.42], [69.90, 'pop', 0.42], [70.25, 'pop', 0.42],  // explosion leaves
    [78.44, 'swoosh', 0.60],                                  // → outro endcard
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
    if (countRAF) cancelAnimationFrame(countRAF);
    countVal.textContent = '0';
    COUNT_CHIPS.forEach(c => c.classList.remove('in'));
    countTag.classList.remove('in');
    $('#slow-snail').classList.remove('in');
    $('#slow-label').classList.remove('in');
    $('#slow-bar').classList.remove('in', 'go'); $('#slow-bar').querySelector('i').style.width = '';
    ['btc-rail', 'btc-build', 'btc-more'].forEach(id => $('#' + id).classList.remove('in', 'go'));
    ['eth-platform', 'eth-sc', 'eth-apps', 'eth-code'].forEach(id => $('#' + id).classList.remove('in'));
    $('#eth-tokens').innerHTML = '';
    if (feesChart) feesChart.reset();
    $('#sc-fees').classList.remove('cap-in');
    ['rn-sol', 'rn-bnb', 'rn-many'].forEach(id => $('#' + id).classList.remove('in', 'coined'));
    $('#sc-mint').classList.remove('plat-in', 'btn-in', 'tap');
    mintPlatform.innerHTML = 'completely <b>trivial</b>'; mintSpit.innerHTML = '';
    floodDoge.classList.remove('in');
    FLOOD_CHIPS.forEach(c => c.classList.remove('in', 'dead'));
    $('#sc-flood').classList.remove('verdict-in');
    $('#tree-headline').classList.remove('in');
    Object.values(treeNodeEls).forEach(n => { if (n.id !== 'tn-meme') n.classList.remove('in'); n.classList.remove('lit'); });
    treeNodeEls.meme.style.opacity = '0';
    treeLeafEls.forEach(lf => lf.classList.remove('in', 'dead'));
    treePaths.forEach(p => p.classList.remove('drawn'));
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
