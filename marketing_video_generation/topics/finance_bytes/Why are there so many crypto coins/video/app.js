/* ============================================================
   "Why are there so many crypto coins?" — NEW STYLE choreography
   A continuous faux-3D camera over a persistent dynamic grid. Every
   beat is driven off the narration's audio.currentTime (cue engine)
   so it lands on the spoken word. Depth transitions ported from the
   default depth-transitions element. White + turquoise, Inter only.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage');
  const grid = $('#grid');
  const vo = $('#vo');
  const subsLine = $('#subs-line');

  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  const rnd = (a, b) => a + Math.random() * (b - a);
  const GLYPHS = ['₿', 'Ξ', '◎', '◈', '¢', '$', '✦'];
  function coinEl(cls, glyph) {
    const d = document.createElement('div');
    d.className = 'coin ' + (cls || '');
    d.textContent = glyph != null ? glyph : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    return d;
  }
  // tiny monochrome app icons (stay on-brand: teal line art, no colourful emoji)
  function appIcon(name) {
    const s = 'fill:none;stroke:currentColor;stroke-width:7;stroke-linecap:round;stroke-linejoin:round';
    const M = {
      swap: `<path d="M22 34h44l-14-14 M78 66H34l14 14" style="${s}"/>`,
      nft: `<rect x="22" y="22" width="56" height="56" rx="10" style="${s}"/><circle cx="40" cy="42" r="7" style="${s}"/><path d="M26 72l20-20 16 14 12-10 " style="${s}"/>`,
      game: `<rect x="18" y="34" width="64" height="34" rx="17" style="${s}"/><path d="M34 51h12 M40 45v12" style="${s}"/><circle cx="66" cy="48" r="4" fill="currentColor" stroke="none"/><circle cx="72" cy="56" r="4" fill="currentColor" stroke="none"/>`,
    };
    return `<svg viewBox="0 0 100 100" width="104" height="104">${M[name] || M.swap}</svg>`;
  }

  // ============================================================
  // SCENE BUILDERS
  // ============================================================
  // 1 — counter + coin flood
  $('#sc-counter').innerHTML =
    `<div class="counter-wrap">
       <div class="counter-ey">crypto coins in existence</div>
       <div class="counter-num" id="cnt-num">0</div>
       <div class="counter-sub" id="cnt-sub">and counting…</div>
     </div>
     <div class="coin-flood" id="coin-flood"></div>`;
  // pre-build the flood coins (fly in from the edges, settle into a loose cloud)
  (function buildCounterCoins() {
    const host = $('#coin-flood');
    for (let i = 0; i < 26; i++) {
      const c = coinEl(Math.random() < 0.18 ? 'sm solid' : (Math.random() < 0.4 ? 'sm' : 'xs'));
      const ang = rnd(0, Math.PI * 2), R = rnd(360, 620);
      const hx = Math.cos(ang) * R * 0.7, hy = Math.sin(ang) * R * 0.62;
      c.style.left = '50%'; c.style.top = '46%';
      c.style.setProperty('--fx', (Math.cos(ang) * 1300) + 'px');
      c.style.setProperty('--fy', (Math.sin(ang) * 1300) + 'px');
      c.style.setProperty('--hx', hx + 'px');
      c.style.setProperty('--hy', hy + 'px');
      host.appendChild(c);
    }
  })();

  // 2 — sluggish bitcoin
  $('#sc-slow').innerHTML =
    `<div class="btc-stage">
       <div class="btc-baseline"></div>
       <img class="btc-coin" id="slow-coin" src="assets/img/bitcoin-dashed.png" alt="" onerror="this.style.display='none'">
       <div class="btc-tag">Bitcoin — <span class="hit">too slow</span></div>
     </div>`;

  // 3 — one rail, one job
  $('#sc-rail').innerHTML =
    `<div class="rail-stage">
       <div class="rail-line"></div>
       <img class="rail-coin" id="rail-coin" src="assets/img/bitcoin_cut.png" alt="" onerror="this.style.display='none'">
       <div class="rail-cap">One rail. <b>One job:</b> move bitcoin.</div>
     </div>`;

  // 4 — can't build on top
  $('#sc-build').innerHTML =
    `<div class="build-stage" id="build-stage">
       <div class="build-q">?</div>
       <div class="build-base">₿</div>
       <div class="bk bk1">app</div>
       <div class="bk bk2">app</div>
       <div class="bk bk3">app</div>
     </div>`;

  // 5 — ethereum platform + apps
  $('#sc-eth').innerHTML =
    `<div class="eth-stage" id="eth-stage">
       <div class="eth-apps">
         <div class="app-blk run">${appIcon('swap')}</div>
         <div class="app-blk run">${appIcon('nft')}</div>
         <div class="app-blk run">${appIcon('game')}</div>
       </div>
       <div class="eth-slab"><span class="eth-x">Ξ</span><span class="eth-name">Ethereum</span></div>
       <div class="eth-chip">smart contracts — apps on a blockchain</div>
     </div>`;

  // 6 — code -> token
  $('#sc-code').innerHTML =
    `<div class="code-stage" id="code-stage">
       <div class="code-card">
         <div class="code-bar"><i></i><i></i><i></i><span>Token.sol</span></div>
         <div class="code-body">
           <div class="ln"><span class="cm">// a whole new coin, in a few lines</span></div>
           <div class="ln"><span class="kw">contract</span> <span class="fn">MyToken</span> {</div>
           <div class="ln">  name   = <span class="st">"DogeMoon"</span>;</div>
           <div class="ln">  ticker = <span class="st">"DMI"</span>;</div>
           <div class="ln">  supply = <span class="st">1_000_000_000</span>;</div>
           <div class="ln">}</div>
           <div class="code-deploy">▶ Deploy</div>
         </div>
       </div>
       <div class="code-cur">👆</div>
       <div class="coin solid code-token" id="code-token">$</div>
     </div>`;

  // 7 — floodgates
  $('#sc-flood').innerHTML =
    `<div class="flood-stage" id="flood-stage">
       <div class="flood-word">The <b>floodgates</b> crack open</div>
       <div class="flood-field" id="flood-field"></div>
     </div>`;
  (function buildFloodCoins() {
    const host = $('#flood-field');
    for (let i = 0; i < 42; i++) {
      const c = coinEl(Math.random() < 0.2 ? 'sm solid' : (Math.random() < 0.5 ? 'sm' : 'xs'));
      c.style.left = '50%'; c.style.top = '50%';
      c.style.setProperty('--x', rnd(-470, 470) + 'px');
      c.style.setProperty('--y', rnd(-560, 620) + 'px');
      host.appendChild(c);
    }
  })();

  // 8 — congested + rising gas fee
  $('#sc-congest').innerHTML =
    `<div class="cong-stage" id="cong-stage">
       <div class="cong-fee"><div class="lab">GAS FEE</div><div class="amt" id="cong-amt">$0</div></div>
       <div class="cong-slab" id="cong-slab"></div>
       <div class="cong-clock"><span class="sp"></span> slow &amp; jammed</div>
     </div>`;
  (function buildJam() { const s = $('#cong-slab'); for (let i = 0; i < 18; i++) { const b = document.createElement('div'); b.className = 'jam'; b.style.animationDelay = (Math.random() * 1).toFixed(2) + 's'; s.appendChild(b); } })();

  // 9 — rival chains
  const RIVALS = [
    { t: 'SOL', s: 'faster' }, { t: 'BNB', s: 'cheaper' }, { t: 'AVAX', s: 'faster' },
    { t: 'TRX', s: 'cheaper' }, { t: 'ADA', s: 'faster' }, { t: 'NEAR', s: 'cheaper' },
  ];
  $('#sc-rivals').innerHTML =
    `<div class="riv-stage" id="riv-stage">
       <div class="riv-title">Each with its <b>own coin</b></div>
       <div class="riv-grid" id="riv-grid">
         ${RIVALS.map((r) => `<div class="riv-node"><div class="riv-pill">${r.t}</div><small>${r.s}</small><div class="coin sm"></div></div>`).join('')}
       </div>
       <div class="riv-more">…and many, many more</div>
     </div>`;
  Array.from($('#riv-grid').querySelectorAll('.riv-node .coin')).forEach((c, i) => { c.textContent = ['◎', '◈', '✦', '¢', '◎', '◈'][i] || '◎'; });

  // 10 — pump.fun-style launch UI
  $('#sc-launch').innerHTML =
    `<div class="launch-stage" id="launch-stage">
       <div class="launch-card">
         <div class="launch-h">Launch a coin<span class="dot">.</span></div>
         <div class="launch-sub">no code · no team · almost free</div>
         <div class="lf"><div class="lf-lab">Name</div><div class="lf-box">DogeMoonInu</div></div>
         <div class="lf"><div class="lf-lab">Ticker</div><div class="lf-box"><span class="cur">$</span>DMI</div></div>
         <div class="launch-meta">
           <div class="m"><div class="mv">~$2</div><div class="ml">total cost</div></div>
           <div class="m"><div class="mv">~30s</div><div class="ml">to go live</div></div>
         </div>
         <div class="launch-btn" id="launch-btn">Launch Coin</div>
       </div>
       <div class="launch-cur">👆</div>
       <div class="coin solid launch-pop" id="launch-pop">$</div>
     </div>`;

  // 11 — memecoin flood + cartoon faces
  $('#sc-meme').innerHTML =
    `<div class="meme-stage" id="meme-stage">
       <div class="meme-field" id="meme-field"></div>
       <img class="meme-face f-dog"   src="assets/img/coin-dog_cut.png"   alt="" onerror="this.style.display='none'">
       <img class="meme-face f-celeb" src="assets/img/coin-celeb_cut.png" alt="" onerror="this.style.display='none'">
       <img class="meme-face f-moon"  src="assets/img/coin-moon_cut.png"  alt="" onerror="this.style.display='none'">
       <div class="meme-worth">most <b>worthless</b> within days</div>
     </div>`;
  (function placeFaces() {
    const set = (sel, x, y, r) => { const el = $(sel); el.style.setProperty('--x', x + 'px'); el.style.setProperty('--y', y + 'px'); el.style.setProperty('--r', r + 'deg'); };
    set('.f-dog', -230, -250, -8); set('.f-celeb', 250, 40, 9); set('.f-moon', -160, 360, -5);
  })();
  (function buildMemeCoins() {
    const host = $('#meme-field');
    for (let i = 0; i < 30; i++) {
      const c = coinEl(Math.random() < 0.5 ? 'sm' : 'xs');
      c.style.left = '50%'; c.style.top = '0';
      c.style.setProperty('--x', rnd(-490, 490) + 'px');
      c.style.setProperty('--y', rnd(120, 1500) + 'px');
      host.appendChild(c);
    }
  })();

  // 12 — the tree of fixes
  const TREE = [
    { y: 300, sym: '₿', soft: false, tt: 'Bitcoin', ts: 'great money — but slow', dots: 1 },
    { y: 600, sym: 'Ξ', soft: true, tt: 'Ethereum', ts: 'smart contracts → tokens', dots: 3 },
    { y: 920, sym: '◇', soft: true, tt: 'Rival chains', ts: 'faster · cheaper · own coin', dots: 6 },
    { y: 1250, sym: '∞', soft: true, tt: 'One-click mint', ts: 'a coin in seconds', dots: 12 },
  ];
  $('#sc-tree').innerHTML =
    `<div class="tree-stage" id="tree-stage">
       <div class="tree-spine"></div>
       ${TREE.map((n, i) => `
         <div class="tree-node n${i}" style="top:${n.y}px">
           <div class="tree-badge ${n.soft ? 'soft' : ''}">${n.sym}</div>
           <div class="tree-txt"><div class="tt">${n.tt}</div><div class="ts">${n.ts}</div></div>
           <div class="tree-dots">${Array.from({ length: n.dots }).map(() => '<span class="d"></span>').join('')}</div>
         </div>`).join('')}
     </div>`;
  // dock the dot clusters to the right of the labels so they never overlap text
  Array.from($('#sc-tree').querySelectorAll('.tree-dots')).forEach((d) => {
    d.style.position = 'absolute'; d.style.left = '560px'; d.style.top = '50%';
    d.style.transform = 'translateY(-50%)'; d.style.flexWrap = 'wrap'; d.style.maxWidth = '150px';
  });

  // 13 — one experiment -> a button
  $('#sc-button').innerHTML =
    `<div class="btn-stage" id="btn-stage">
       <div class="btn-left">
         <img src="assets/img/bitcoin_cut.png" alt="" onerror="this.style.display='none'">
         <div class="cap">one careful<br>experiment</div>
       </div>
       <div class="btn-arrow">→</div>
       <div class="btn-right">
         <div class="btn-mint" id="btn-mint">mint ⚡</div>
         <div class="cap">a button, any time</div>
       </div>
       <div class="btn-heap" id="btn-heap"></div>
       <div class="btn-worth">≈ <span class="hit">worth nothing</span></div>
     </div>`;
  (function buildHeap() {
    const host = $('#btn-heap');
    for (let i = 0; i < 18; i++) {
      const c = coinEl(Math.random() < 0.5 ? 'sm' : 'xs');
      c.style.setProperty('--hx', rnd(-70, 70) + 'px');
      c.style.setProperty('--hy', rnd(120, 470) + 'px');
      host.appendChild(c);
    }
  })();

  // OUTRO endcard
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // ============================================================
  // GRID CAMERA
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
  // DEPTH SCENE TRANSITIONS (ported)
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
        to: { s: lerp(.72, 1, e), ty: lerp(980, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .85 };
      case 'zoom-out': return {
        from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 },
        to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'pan-left': return {
        from: { tx: lerp(0, -1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 },
        to: { tx: lerp(1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 }, panX: -1180 };
      case 'pan-right': return {
        from: { tx: lerp(0, 1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 },
        to: { tx: lerp(-1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 }, panX: 1180 };
      case 'drop': return {
        from: { s: lerp(1, .66, e), ty: lerp(0, 180, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 },
        to: { s: lerp(.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .9 };
      case 'fade': return {
        from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in':
      default: return {
        from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 },
        to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current;
    if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x, gy0 = gcam.y;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3; const t0 = performance.now();
      setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur)); const z = lerp(1, 1.3, e), dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: z, op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        gdisp.y = gy0 + dy * 0.5;
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 });
        setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
        gdisp.y = gy0; gcam.s = gs0; current = toEl; if (onArrive) onArrive();
      })(performance.now()); return;
    }
    const p0 = POSES(mode, 0);
    if (p0.grid != null) gcam.s = gs0 * p0.grid;
    if (p0.panX != null) gcam.x = gx0 + p0.panX * gs0 * 0.18;
    setPose(toEl, Object.assign({ op: 0 }, p0.to));
    const t0 = performance.now();
    (function step(now) {
      const e = easeInOut(clamp01((now - t0) / dur)); const ps = POSES(mode, e);
      if (fromEl) setPose(fromEl, ps.from);
      setPose(toEl, ps.to);
      if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
      if (fromEl) setPose(fromEl, { op: 0, z: 0 });
      setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1); current = toEl; if (onArrive) onArrive();
    })(performance.now());
  }
  function showInstant(el) {
    SCENES.forEach((s) => { if (s !== el) setPose(s, { op: 0, z: 0 }); });
    setPose(el, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); current = el;
  }
  function enter(el, mode, dur, instant, onArrive) {
    if (instant) { showInstant(el); if (onArrive) onArrive(); return; }
    depthGo(el, mode, dur, onArrive);
  }

  // ============================================================
  // IN-SCENE ANIMATIONS
  // ============================================================
  const fmt = (n) => Math.floor(n).toLocaleString('en-US');
  let cntRAF = 0;
  function floodIn(instant) {
    const coins = Array.from($('#coin-flood').children);
    coins.forEach((c, i) => { if (instant) c.classList.add('in'); else setTimeout(() => c.classList.add('in'), 250 + i * 70); });
  }
  function playCounter(instant) {
    const num = $('#cnt-num'), sub = $('#cnt-sub');
    if (cntRAF) cancelAnimationFrame(cntRAF);
    if (instant) {
      num.textContent = '1,000,000+'; num.classList.add('boom');
      sub.innerHTML = 'not <span class="strike">thousands</span> — <span class="hit">millions</span>';
      floodIn(true); return;
    }
    num.classList.remove('boom'); sub.textContent = 'and counting…';
    const t0 = performance.now(), dur = 3100, target = 1000000;
    (function step(now) {
      const e = clamp01((now - t0) / dur), eased = 1 - Math.pow(1 - e, 3);
      num.textContent = e < 1 ? fmt(eased * target) : '1,000,000+';
      if (e < 1) { cntRAF = requestAnimationFrame(step); }
      else { num.classList.add('boom'); sub.innerHTML = 'not <span class="strike">thousands</span> — <span class="hit">millions</span>'; }
    })(performance.now());
    floodIn(false);
  }
  function playSlow(instant) {
    const c = $('#slow-coin'); if (!c) return;
    c.style.transition = instant ? 'none' : 'left 4.4s cubic-bezier(.3,0,.6,1)';
    c.style.left = instant ? '640px' : '120px';
    if (!instant) { void c.offsetWidth; requestAnimationFrame(() => { c.style.left = '700px'; }); }
    else c.style.left = '700px';
  }
  function playRail(instant) {
    const c = $('#rail-coin'); if (!c) return;
    if (instant) { c.classList.add('go'); return; }
    c.classList.remove('go'); void c.offsetWidth; setTimeout(() => c.classList.add('go'), 400);
  }
  function playBuild(instant) { const s = $('#build-stage'); if (s) { if (instant) s.classList.add('topple'); else setTimeout(() => s.classList.add('topple'), 200); } }
  function playEth(instant) { const s = $('#eth-stage'); if (s) { if (instant) s.classList.add('up'); else setTimeout(() => s.classList.add('up'), 120); } }
  function playCode(instant) {
    const s = $('#code-stage'); if (!s) return;
    if (instant) { s.classList.add('in', 'tap', 'fire'); return; }
    s.classList.add('in');
    setTimeout(() => s.classList.add('tap'), 1400);
    setTimeout(() => s.classList.add('fire'), 2400);
  }
  function playFlood(instant) {
    const s = $('#flood-stage'); if (s) s.classList.add('go');
    const coins = Array.from($('#flood-field').children);
    coins.forEach((c, i) => { if (instant) c.classList.add('in'); else setTimeout(() => c.classList.add('in'), 120 + i * 35); });
  }
  let feeRAF = 0;
  function playCongest(instant) {
    const amt = $('#cong-amt'); if (!amt) return;
    if (feeRAF) cancelAnimationFrame(feeRAF);
    if (instant) { amt.textContent = '$87'; amt.classList.add('hot'); return; }
    amt.classList.remove('hot');
    const t0 = performance.now(), dur = 2600, target = 87;
    (function step(now) {
      const e = clamp01((now - t0) / dur), v = (1 - Math.pow(1 - e, 2)) * target;
      amt.textContent = '$' + Math.round(v);
      if (v > 45) amt.classList.add('hot');
      if (e < 1) feeRAF = requestAnimationFrame(step);
    })(performance.now());
  }
  function playRivals(instant) {
    const s = $('#riv-stage'); if (s) s.classList.add('in');
    const nodes = Array.from($('#riv-grid').children);
    nodes.forEach((n, i) => { if (instant) n.classList.add('in'); else setTimeout(() => n.classList.add('in'), 250 + i * 340); });
    if (instant) s.classList.add('more'); else setTimeout(() => s && s.classList.add('more'), 250 + nodes.length * 340 + 200);
  }
  function playLaunch(instant) {
    const s = $('#launch-stage'); if (!s) return;
    if (instant) { s.classList.add('in', 'press', 'fire'); return; }
    s.classList.add('in');
    setTimeout(() => s.classList.add('press'), 4600);
    setTimeout(() => s.classList.add('fire'), 4900);
    setTimeout(() => s.classList.remove('press'), 5100);
  }
  function playMeme(instant) {
    const field = Array.from($('#meme-field').children);
    const faces = ['.f-dog', '.f-celeb', '.f-moon'];
    if (instant) {
      field.forEach((c) => c.classList.add('in')); faces.forEach((f) => $(f).classList.add('in'));
      return;   // the grey-out/worth beat is owned by the memeDie cue (t≈62)
    }
    field.forEach((c, i) => setTimeout(() => c.classList.add('in'), 100 + i * 60));
    setTimeout(() => $('.f-dog').classList.add('in'), 700);
    setTimeout(() => $('.f-celeb').classList.add('in'), 1500);
    setTimeout(() => $('.f-moon').classList.add('in'), 2400);
  }
  function memeDie(instant) {
    $('#meme-field').classList.add('dead');
    ['.f-dog', '.f-celeb', '.f-moon'].forEach((f) => $(f) && $(f).classList.add('dead'));
    $('#meme-stage').classList.add('worth');
  }
  function playTree(instant) {
    const s = $('#tree-stage'); if (s) s.classList.add('grow');
    const nodes = Array.from(s.querySelectorAll('.tree-node'));
    nodes.forEach((n, i) => { if (instant) n.classList.add('in'); else setTimeout(() => n.classList.add('in'), 350 + i * 850); });
  }
  function playButton(instant) {
    const s = $('#btn-stage'); if (!s) return;
    const coins = Array.from($('#btn-heap').children);
    if (instant) { s.classList.add('in', 'fire'); coins.forEach((c) => c.classList.add('in')); return; }   // 'worth' owned by buttonWorth cue (t≈78)
    s.classList.add('in');
    setTimeout(() => s.classList.add('fire'), 700);
    coins.forEach((c, i) => setTimeout(() => c.classList.add('in'), 900 + i * 200));
  }
  function buttonWorth() { const s = $('#btn-stage'); if (s) s.classList.add('worth'); }

  // ============================================================
  // SUBTITLES — verbatim, grey with turquoise key words
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 130);
  }
  const SUBS = [
    [0.0, 'There are now <b>millions</b> of cryptocurrencies.'],
    [2.46, 'Not thousands — <b>millions</b>.'],
    [4.08, 'And it all started because the very first one,'],
    [6.4, 'Bitcoin, was simply <b>too slow</b>.'],
    [8.78, 'Bitcoin was the original —'],
    [10.06, 'brilliant as digital money.'],
    [11.42, "But it's limited. It's slow,"],
    [13.38, 'and it can basically do just <b>one thing</b>:'],
    [15.62, 'move bitcoin.'],
    [16.7, "You can't really <b>build</b> anything on top of it."],
    [18.84, 'So people wanted more.'],
    [20.32, "That's where Ethereum came in."],
    [21.94, 'It added <b>smart contracts</b> —'],
    [23.82, 'little programs that run on the blockchain itself.'],
    [26.48, 'Suddenly a blockchain could host <b>apps</b>,'],
    [28.6, 'not just payments.'],
    [29.58, 'And crucially, anyone could create their own token'],
    [31.76, 'with just a <b>few lines of code</b>.'],
    [34.58, 'The <b>floodgates</b> cracked open.'],
    [35.9, 'Then Ethereum got so popular'],
    [37.26, 'it became <b>slow and expensive</b> to use.'],
    [39.32, 'So a wave of rival blockchains launched,'],
    [41.36, 'each promising to be <b>faster or cheaper</b> —'],
    [43.42, 'Solana, BNB, and many more.'],
    [45.84, 'And every single one comes with <b>its own coin</b>.'],
    [48.0, 'And finally, it became <b>trivial</b> to make a coin.'],
    [50.72, 'Platforms like Pump.fun let anyone'],
    [52.14, 'launch a token in <b>seconds</b>, for almost nothing.'],
    [55.05, 'The result? A flood of <b>memecoins</b> —'],
    [57.26, 'coins based on jokes, dogs, celebrities —'],
    [59.86, 'most with no purpose beyond <b>speculation</b>,'],
    [62.0, 'and most <b>worthless</b> within days.'],
    [63.96, 'So why are there millions of coins?'],
    [65.86, 'Because crypto kept fixing its own <b>limitations</b> —'],
    [68.32, 'and each fix made it easier to mint the next one.'],
    [71.5, 'We went from one careful experiment…'],
    [74.26, 'to a <b>button</b> that spits out a currency in seconds.'],
    [77.22, 'Just remember:'],
    [78.06, 'almost none of them are <b>worth anything</b>.'],
    [79.88, 'Want more of how crypto really works?'],
    [81.94, '<b>Follow Stacktags.</b>'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    [0.0, (i) => enter($('#sc-counter'), 'fade', 650, i, () => playCounter(i))],
    [4.08, (i) => enter($('#sc-slow'), 'zoom-out', 1050, i, () => playSlow(i))],
    [8.78, (i) => enter($('#sc-rail'), 'zoom-in', 1050, i, () => playRail(i))],
    [16.7, (i) => enter($('#sc-build'), 'drop', 1000, i, () => playBuild(i))],
    [20.32, (i) => enter($('#sc-eth'), 'rise', 1050, i, () => playEth(i))],
    [29.58, (i) => enter($('#sc-code'), 'zoom-in', 1000, i, () => playCode(i))],
    [34.58, (i) => enter($('#sc-flood'), 'zoom-out', 1050, i, () => playFlood(i))],
    [35.9, (i) => enter($('#sc-congest'), 'pan-left', 1050, i, () => playCongest(i))],
    [39.32, (i) => enter($('#sc-rivals'), 'pan-right', 1050, i, () => playRivals(i))],
    [48.0, (i) => enter($('#sc-launch'), 'zoom-in', 1050, i, () => playLaunch(i))],
    [55.05, (i) => enter($('#sc-meme'), 'zoom-out', 1100, i, () => playMeme(i))],
    [62.0, (i) => memeDie(i)],
    [63.96, (i) => enter($('#sc-tree'), 'rise', 1100, i, () => playTree(i))],
    [68.32, (i) => enter($('#sc-button'), 'zoom-in', 1050, i, () => playButton(i))],
    [78.0, (i) => buttonWorth(i)],
    [79.88, (i) => { enter($('#sc-follow'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — declared sound bed (read by the render pipeline + played live)
  // [t, sound ∈ {swoosh,pop,ticking}, vol]
  // ============================================================
  const SFX = [
    // scene transitions (the grid moves) → swoosh
    [4.08, 'swoosh', 0.5], [8.78, 'swoosh', 0.5], [16.7, 'swoosh', 0.5], [20.32, 'swoosh', 0.5],
    [29.58, 'swoosh', 0.5], [34.58, 'swoosh', 0.55], [35.9, 'swoosh', 0.45], [39.32, 'swoosh', 0.5],
    [48.0, 'swoosh', 0.5], [55.05, 'swoosh', 0.55], [63.96, 'swoosh', 0.5], [68.32, 'swoosh', 0.5],
    [79.88, 'swoosh', 0.6],
    // ticking — the counter racing up, and the gas fee climbing
    [0.4, 'ticking', 0.5], [36.3, 'ticking', 0.5],
    // pops — tokens/chips springing in
    [32.0, 'pop', 0.55],                                   // code → token
    [34.9, 'pop', 0.5], [35.2, 'pop', 0.5], [35.5, 'pop', 0.5],   // floodgates multiply
    [41.5, 'pop', 0.5], [42.4, 'pop', 0.5], [43.42, 'pop', 0.55], [43.98, 'pop', 0.55], [45.0, 'pop', 0.5], [46.0, 'pop', 0.5], // rivals
    [53.0, 'pop', 0.6],                                    // launch fires
    [56.2, 'pop', 0.55], [56.8, 'pop', 0.5], [57.5, 'pop', 0.5], [58.2, 'pop', 0.5], [59.0, 'pop', 0.5], // memecoin flood
    [64.5, 'pop', 0.5], [65.4, 'pop', 0.5], [66.3, 'pop', 0.5], [67.2, 'pop', 0.5],   // tree branches
    [69.4, 'pop', 0.45], [70.0, 'pop', 0.45], [70.6, 'pop', 0.45],                    // button heap
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/ticking.mp3' };
  function playSfx(entry) {
    try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {}
  }

  // ============================================================
  // CUE ENGINE
  // ============================================================
  const firedScene = new Set(), firedSub = new Set(), firedSfx = new Set();
  let lastT = 0;
  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    if (cntRAF) cancelAnimationFrame(cntRAF); if (feeRAF) cancelAnimationFrame(feeRAF);
    SCENES.forEach((el) => setPose(el, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null; gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
    // reset per-scene state
    const num = $('#cnt-num'); if (num) { num.textContent = '0'; num.classList.remove('boom'); }
    const sub = $('#cnt-sub'); if (sub) sub.textContent = 'and counting…';
    Array.from($('#coin-flood').children).forEach((c) => c.classList.remove('in'));
    const sc = $('#slow-coin'); if (sc) { sc.style.transition = 'none'; sc.style.left = '120px'; }
    const rc = $('#rail-coin'); if (rc) rc.classList.remove('go');
    $('#build-stage') && $('#build-stage').classList.remove('topple');
    $('#eth-stage') && $('#eth-stage').classList.remove('up');
    $('#code-stage') && $('#code-stage').classList.remove('in', 'tap', 'fire');
    $('#flood-stage') && $('#flood-stage').classList.remove('go');
    Array.from($('#flood-field').children).forEach((c) => c.classList.remove('in'));
    const amt = $('#cong-amt'); if (amt) { amt.textContent = '$0'; amt.classList.remove('hot'); }
    const rs = $('#riv-stage'); if (rs) rs.classList.remove('in', 'more');
    Array.from($('#riv-grid').children).forEach((c) => c.classList.remove('in'));
    $('#launch-stage') && $('#launch-stage').classList.remove('in', 'press', 'fire');
    $('#meme-field') && $('#meme-field').classList.remove('dead');
    Array.from($('#meme-field').children).forEach((c) => c.classList.remove('in'));
    ['.f-dog', '.f-celeb', '.f-moon'].forEach((f) => $(f) && $(f).classList.remove('in', 'dead'));
    $('#meme-stage') && $('#meme-stage').classList.remove('worth');
    const ts = $('#tree-stage'); if (ts) ts.classList.remove('grow');
    Array.from($('#sc-tree').querySelectorAll('.tree-node')).forEach((n) => n.classList.remove('in'));
    $('#btn-stage') && $('#btn-stage').classList.remove('in', 'fire', 'worth');
    Array.from($('#btn-heap').children).forEach((c) => c.classList.remove('in'));
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
