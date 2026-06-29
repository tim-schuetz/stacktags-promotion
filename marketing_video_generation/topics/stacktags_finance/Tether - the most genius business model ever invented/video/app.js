/* ============================================================
   "Tether — the most genius business model ever invented"
   Continuous faux-3D camera over a persistent dynamic grid.
   Everything is driven off the narration's audio.currentTime
   (cue engine) so each beat lands on the spoken word.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const stage = $('#stage');
  const grid = $('#grid');
  const vo = $('#vo');
  const subsLine = $('#subs-line');

  function fit() {
    const s = Math.min(innerWidth / 1080, innerHeight / 1920);
    stage.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();

  // ---- math helpers ----
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ============================================================
  // GRID CAMERA (persistent, always subtly moving)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 };
  const gdisp = { s: 1, x: 0, y: 0 };
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
  const SCENES = $$('.scene');
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
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current;
    if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3;
      const t0 = performance.now();
      setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur));
        const z = lerp(1, 1.3, e), dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: z, op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 });
        setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
        gcam.s = gs0; current = toEl; if (onArrive) onArrive();
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
  // DYNAMIC CONTENT BUILDERS
  // ============================================================
  // ---- 3D token rain (Blender rigid-body sim → transparent webm) ----
  const tokfall = $('#tokfall');
  function playTokfall(instant) {
    if (!tokfall) return;
    try {
      if (instant) { tokfall.pause(); tokfall.currentTime = (tokfall.duration && isFinite(tokfall.duration)) ? tokfall.duration : 3.99; }
      else { tokfall.currentTime = 0; const p = tokfall.play(); if (p) p.catch(() => {}); }
    } catch (e) {}
  }
  function resetTokfall() { if (tokfall) { try { tokfall.pause(); tokfall.currentTime = 0; } catch (e) {} } }
  function buildTower() {
    const host = $('#tw-tbills'); host.innerHTML = '';
    ['T-BILLS', 'RESERVES', 'OTHER ASSETS'].forEach((l) => {
      const d = document.createElement('div'); d.className = 'tb'; d.textContent = l; host.appendChild(d);
    });
  }
  function buildThrone() {
    const host = $('#th-stack'); host.innerHTML = '';
    [170, 230, 280, 320, 350].forEach((w) => {
      const d = document.createElement('div'); d.className = 'tb'; d.dataset.w = w; host.appendChild(d);
    });
  }
  function crownThrone(instant) {
    const tbs = $('#th-stack').querySelectorAll('.tb');
    tbs.forEach((d, i) => {
      const w = d.dataset.w + 'px';
      if (instant) { d.style.transition = 'none'; d.style.width = w; }
      else { d.style.transition = ''; setTimeout(() => { d.style.width = w; }, 250 + i * 130); }
    });
  }
  function resetThrone() { $('#th-stack').querySelectorAll('.tb').forEach((d) => { d.style.transition = 'none'; d.style.width = '0'; }); }
  function growRoom(instant) {   // grow each profit bar to its data-h
    $$('#room .rfill').forEach((f) => {
      const h = f.dataset.h + 'px';
      if (instant) { f.style.transition = 'none'; f.style.height = h; }
      else { f.style.transition = ''; requestAnimationFrame(() => { f.style.height = h; }); }
    });
  }
  function resetRoom() { $$('#room .rfill').forEach((f) => { f.style.transition = 'none'; f.style.height = '0'; }); }
  function buildPunchNoise() {   // the "obvious trades", a tidy centred list
    const host = $('#pu-noise'); host.innerHTML = '';
    ['STOCKS', 'CRYPTO', 'ALTCOINS', 'NFTs', 'BONDS', 'GOLD'].forEach((txt) => {
      const c = document.createElement('div'); c.className = 'chip'; c.textContent = txt; host.appendChild(c);
    });
  }

  // ---- $100B odometer: driven by audio time in the tick loop (linear, never jumps) ----
  const ODO_T0 = 57.96, ODO_DUR = 3.0, ODO_MAX = 104000000000;
  function updateOdometer(t) {
    const el = $('#odo'); if (!el) return;
    const e = clamp((t - ODO_T0) / ODO_DUR, 0, 1);
    el.textContent = '$' + (Math.floor(ODO_MAX * e / 1e6) * 1e6).toLocaleString('en-US');
  }
  // ---- attestation scene: dashed dollars rain ONTO the money heap ----
  function buildAudit() {
    const host = $('#au-rain'); if (!host) return; host.innerHTML = '';
    for (let k = 0; k < 8; k++) {
      const im = document.createElement('img'); im.src = 'assets/photos/dollar_dashed.png';
      im.style.left = rnd(14, 72) + '%';
      im.style.setProperty('--dy', Math.round(rnd(360, 520)) + 'px');
      im.style.setProperty('--r', Math.round(rnd(-18, 18)) + 'deg');
      im.dataset.delay = Math.floor(rnd(0, 1800));
      host.appendChild(im);
    }
  }
  function rainAudit(instant) {
    const ims = $('#au-rain').querySelectorAll('img');
    if (instant) { ims.forEach((im) => { im.classList.remove('drop'); im.style.opacity = '1'; im.style.transform = 'translate(-50%, var(--dy)) rotate(var(--r))'; }); return; }
    ims.forEach((im) => { im.classList.remove('drop'); im.style.opacity = ''; im.style.transform = ''; });
    ims.forEach((im) => setTimeout(() => im.classList.add('drop'), +im.dataset.delay));
  }
  function resetAudit() { const h = $('#au-rain'); if (h) h.querySelectorAll('img').forEach((im) => { im.classList.remove('drop'); im.style.opacity = ''; im.style.transform = ''; }); }

  // ---- outro ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
  function outroPlay() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  buildTower(); buildThrone(); buildPunchNoise(); buildAudit();

  // ---- per-scene class helpers ----
  const cls = (sel, c) => { const el = $(sel); if (el) el.classList.add(c); };

  // ============================================================
  // SUBTITLES (mirror the narration, one short line at a time)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 130);
  }
  const SUBS = [
    [0.0,  'There’s a company that makes more money <b>per employee</b>'],
    [2.0,  'than almost anyone on Earth.'],
    [3.76, 'Around a hundred staff. Billions in annual profit.'],
    [6.5,  'And the entire business model is this:'],
    [8.86, 'you give them a dollar, they hand you a <b>token</b> —'],
    [11.3, 'and they <b>keep the dollar</b>.'],
    [12.6, 'That’s Tether. And it’s completely <b>legal</b>.'],
    [14.56,'Here’s why it might be the most <b>genius</b> business model ever invented.'],
    [17.88,'Tether runs <b>USDT</b> — a stablecoin.'],
    [20.54,'One USDT is always meant to equal <b>one US dollar</b>.'],
    [23.94,'Crypto traders love it: it’s a dollar that lives on the <b>blockchain</b>,'],
    [27.38,'so they can jump in and out of trades instantly.'],
    [29.72,'To get one, you hand Tether a real dollar,'],
    [31.5, 'and they <b>mint</b> you a token.'],
    [33.34,'Simple. But the magic isn’t the token —'],
    [35.2, 'it’s what happens to <b>your dollar</b>.'],
    [37.4, 'Because Tether doesn’t just let your dollar sit in a drawer.'],
    [40.02,'It takes all those billions and parks them mostly in <b>US Treasury bills</b> —'],
    [43.84,'basically the safest loan on the planet —'],
    [46.0, 'earning around <b>4 to 5%</b> a year.'],
    [48.46,'And how much of that interest do they pass back to you, the token holder?'],
    [52.12,'<b>Zero.</b> You’re holding a dollar that pays you nothing —'],
    [54.7, 'and Tether keeps <b>every cent</b> of the yield.'],
    [56.3, 'Now multiply it.'],
    [57.96,'There’s well over <b>a hundred billion dollars</b> of USDT out there —'],
    [61.24,'which means well over a hundred billion of other people’s money,'],
    [63.6, 'working for Tether, <b>for free</b>.'],
    [65.76,'And normally, getting capital is expensive: a bank pays interest to its depositors,'],
    [69.94,'a company pays interest on its bonds. Everyone pays for money.'],
    [73.72,'Tether’s cost? <b>Nothing.</b>'],
    [74.62,'It’s an interest-free loan from millions of users —'],
    [77.62,'and it keeps <b>100%</b> of the return.'],
    [79.9, 'In 2024, the company reported around <b>13 billion dollars</b> in profit,'],
    [83.86,'with a team you could fit in a <b>single room</b>.'],
    [86.42,'So what’s the catch? <b>Trust.</b>'],
    [88.12,'The whole thing holds up only as long as people believe'],
    [91.7, 'every token is really backed by a real dollar —'],
    [93.6, 'and don’t all rush to cash out at once.'],
    [95.88,'Tether has been <b>fined</b> before for overstating'],
    [97.7, 'what was actually in its reserves,'],
    [99.7, 'and it publishes <b>attestations</b>, not full independent audits.'],
    [103.22,'The model is brilliant. But it runs entirely on <b>confidence</b>.'],
    [106.78,'Still — it cracked something most people never even see.'],
    [109.86,'The most profitable trade in finance wasn’t'],
    [111.6,'picking the right stock, or the right coin.'],
    [113.06,'It was realizing that if you get to <b>issue the dollar</b>…'],
    [116.4,'you get to <b>keep the interest</b>.'],
    [118.14,'Discover millions of ideas, exercises'],
    [120.22,'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    // ---- 1 · HOOK (corner stats: 100 Employees, then 13B in 2024) ----
    [0.0, (i) => enter($('#sc-headlines'), 'fade', 650, i, () => {
      if (i) { cls('#stat-emp', 'in'); cls('#stat-prof', 'in'); return; }
      setTimeout(() => cls('#stat-emp', 'in'), 300);
      setTimeout(() => cls('#stat-prof', 'in'), 2300);
    })],

    // ---- 2 · MECHANIC (dollar appears+flies right; token appears+flies left, each in one motion) ----
    [8.86, (i) => enter($('#sc-mechanic'), 'zoom-out', 1100, i, () => {
      const m = $('#mech');
      m.classList.add('labels');   // "You" over the figure, "Tether" over the vault
      if (i) { m.classList.add('token-go'); return; }   // end-state: token at person, bill already in vault
    })],
    // "you give them a dollar" → bill appears at the person and flies right into the vault
    [9.44, (i) => { if (!i) { const m = $('#mech'); m.classList.add('bill-go'); setTimeout(() => m.classList.add('clink'), 760); } }],
    // "they hand you a token" → token appears at the vault and flies left to the person
    [10.52,(i) => { if (!i) cls('#mech', 'token-go'); }],

    // ---- 3 · WHAT IT IS (peg + trader + Tether/BTC cycle + swap pops) ----
    [17.88,(i) => enter($('#sc-usdt'), 'lift', 1000, i, () => {
      const w = $('#usdtwrap');
      if (i) { w.classList.add('peg-in', 'peg-locked', 'trader-in'); return; }
      setTimeout(() => w.classList.add('peg-in'), 250);
    })],
    [20.54,(i) => { if (!i) cls('#usdtwrap', 'peg-locked'); }],
    [23.94,(i) => { if (!i) cls('#usdtwrap', 'trader-in'); }],
    // "so they can jump in and out" → Tether<->BTC cycle spins (swap) then back
    [27.38,(i) => { if (!i) { const w = $('#usdtwrap'); w.classList.add('cycle-in');
      setTimeout(() => w.classList.add('cyc-spin'), 450);
      setTimeout(() => w.classList.remove('cyc-spin'), 1500);
      setTimeout(() => w.classList.remove('cycle-in'), 3000); } }],
    // "to get one, you..." → the dollar (peg) scales up
    [29.6, (i) => { if (!i) { const w = $('#usdtwrap'); w.classList.add('swap-bill'); setTimeout(() => w.classList.remove('swap-bill'), 700); } }],
    // "and they mint you a token" → the token (peg) scales up
    [32.0, (i) => { if (!i) { const w = $('#usdtwrap'); w.classList.add('swap-token'); setTimeout(() => w.classList.remove('swap-token'), 700); } }],

    // ---- 4 · THE TRICK (vault + T-bill, cash arc back to vault, holder gets 0%) ----
    [37.4, (i) => enter($('#sc-trick'), 'zoom-out', 1100, i, () => {
      const t = $('#trick');
      if (i) { t.classList.add('tbill-in', 'cash', 'holder-in', 'zero'); return; }   // end-state; live = vault only at first
    })],
    // "in US Treasury bills" → vault shifts left + the T-bill appears
    [42.1, (i) => { if (!i) cls('#trick', 'tbill-in'); }],
    // "earning around 4-5%" → cash flows in an arc back into the vault (+ 4–5% label)
    [46.0, (i) => { if (!i) cls('#trick', 'cash'); }],
    // "how much do they pass back to you, the holder?" → holder flies in below the vault
    [48.46,(i) => { if (!i) cls('#trick', 'holder-in'); }],
    // "Zero." → the 0% arrow stamps on
    [52.12,(i) => { if (!i) cls('#trick', 'zero'); }],

    // ---- 6 · SCALE ($100B odometer + crowd) ----
    [56.3, (i) => enter($('#sc-scale'), 'zoom-out', 1100, i, () => {
      const s = $('#scale');
      if (i) { s.classList.add('sub-in'); playTokfall(true); return; }
    })],
    [57.96,(i) => { if (!i) { cls('#scale', 'sub-in'); playTokfall(false); } }],

    // ---- 7 · COST OF CAPITAL ----
    [65.76,(i) => enter($('#sc-cost'), 'rise', 1050, i, () => {
      if (i) { $$('.cost-row').forEach((r) => r.classList.add('in')); return; }
      setTimeout(() => cls('.r-bank', 'in'), 250);
    })],
    [69.94,(i) => { if (!i) cls('.r-co', 'in'); }],
    [73.72,(i) => { if (!i) cls('.r-tether', 'in'); }],

    // ---- 8 · ROOM GAG ($13B, tiny team) ----
    [79.9, (i) => enter($('#sc-room'), 'zoom-out', 1100, i, () => {
      const r = $('#room');
      if (i) { r.classList.add('bar-in', 'team-in'); growRoom(true); return; }
      r.classList.add('bar-in'); growRoom(false);
    })],
    [83.86,(i) => { if (!i) cls('#room', 'team-in'); }],

    // ---- 9 · THE CATCH (trust tower) ----
    [86.42,(i) => enter($('#sc-catch'), 'lift', 1100, i, () => {
      const c = $('#catch');
      if (i) { c.classList.add('build'); return; }
      setTimeout(() => c.classList.add('build'), 1400);
    })],
    [103.22,(i) => { if (!i) { const c = $('#catch'); c.classList.add('wobble'); setTimeout(() => c.classList.remove('wobble'), 1600); } }],

    // ---- 10 · ATTESTATIONS (grinning founder w/ list, cash pile, dashed dollars rain, glee) ----
    [95.88,(i) => enter($('#sc-audit'), 'zoom-in', 1050, i, () => {
      const a = $('#audit');
      if (i) { a.classList.add('in'); rainAudit(true); return; }
      a.classList.add('in');
      setTimeout(() => rainAudit(false), 1600);
    })],
    [102.5,(i) => { if (!i) { const a = $('#audit'); a.classList.add('glee'); setTimeout(() => a.classList.remove('glee'), 800); } }],

    // ---- 11 · PUNCHLINE (obvious trades struck through → slide up → coin rises) ----
    [106.78,(i) => enter($('#sc-punch'), 'zoom-out', 1100, i, () => {
      const p = $('#punch'), chips = $$('#pu-noise .chip');
      if (i) { chips.forEach((c) => c.classList.add('show')); p.classList.add('strike', 'lift', 'crown'); crownThrone(true); return; }
      chips.forEach((c, idx) => setTimeout(() => c.classList.add('show'), 250 + idx * 200));
    })],
    [110.5,(i) => { if (!i) cls('#punch', 'strike'); }],
    [113.5,(i) => { if (!i) { cls('#punch', 'lift'); crownThrone(false); } }],
    [114.3,(i) => { if (!i) cls('#punch', 'crown'); }],

    // ---- 12 · OUTRO ----
    [118.14,(i) => { enter($('#sc-outro'), 'lift', 1100, i, () => outroPlay()); }],
  ];

  // ============================================================
  // SFX — swoosh on grid-moving transitions / default-element animates;
  // pop on objects appearing; ticking on count-ups. [t, sound, vol]
  // ============================================================
  const SFX = [
    [8.86, 'swoosh', 0.5],
    [9.44, 'pop', 0.45],
    [10.52, 'pop', 0.5],
    [17.88, 'swoosh', 0.5],
    [20.7, 'pop', 0.5],
    [27.38, 'swoosh', 0.42],
    [29.6, 'pop', 0.5],
    [32.0, 'pop', 0.5],
    [37.4, 'swoosh', 0.5],
    [48.46, 'swoosh', 0.42],
    [52.12, 'pop', 0.6],
    [56.3, 'swoosh', 0.5],
    [57.96, 'ticking', 0.55],
    [65.76, 'swoosh', 0.5],
    [79.9, 'swoosh', 0.5],
    [81.9, 'ticking', 0.45],
    [86.42, 'swoosh', 0.5],
    [95.88, 'swoosh', 0.48],
    [98.2, 'pop', 0.4], [99.3, 'pop', 0.4], [100.4, 'pop', 0.4],
    [102.5, 'pop', 0.5],
    [106.78, 'swoosh', 0.5],
    [114.3, 'pop', 0.55],
    [118.14, 'swoosh', 0.6],
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

  const STATE = {
    '#mech': ['bill-go', 'token-go', 'clink', 'labels'],
    '#usdtwrap': ['peg-in', 'peg-locked', 'trader-in', 'cycle-in', 'cyc-spin', 'swap-bill', 'swap-token'],
    '#trick': ['tbill-in', 'cash', 'holder-in', 'zero'],
    '#scale': ['sub-in'],
    '#room': ['bar-in', 'team-in'],
    '#catch': ['build', 'wobble'],
    '#audit': ['in', 'glee'],
    '#punch': ['strike', 'lift', 'crown'],
  };

  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    SCENES.forEach((el) => setPose(el, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null;
    gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
    Object.keys(STATE).forEach((sel) => { const el = $(sel); if (el) STATE[sel].forEach((c) => el.classList.remove(c)); });
    $$('#sc-headlines .stat').forEach((s) => s.classList.remove('in'));
    $$('.cost-row').forEach((r) => r.classList.remove('in'));
    $$('#pu-noise .chip').forEach((c) => c.classList.remove('show'));
    $('#odo').textContent = '$0';
    resetThrone(); resetRoom(); resetTokfall(); resetAudit();
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
    updateOdometer(t);   // $100B counter driven by audio time (linear, never jumps)
    if (!vo.paused) {
      if (t < lastT - 1.0) applyUpTo(t);   // only on real backward seeks, not capture jitter (avoids 1-frame reset flashes)
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
