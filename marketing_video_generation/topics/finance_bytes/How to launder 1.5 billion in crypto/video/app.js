/* ============================================================
   "How to launder $1.5 billion in crypto" — choreography
   A continuous faux-3D camera over a persistent dynamic grid.
   Everything is driven off the narration's audio.currentTime so
   each beat lands on the spoken word. Visual spine = a clean
   blockchain-explorer / public-ledger UI we keep returning to.
   Reuses the default elements: enumeration-with-detail + outro +
   the shared depth-grid / theme / subtitles.
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

  // ---------- small helpers ----------
  const HEX = '0123456789abcdef';
  function rh(n) { let s = ''; for (let i = 0; i < n; i++) s += HEX[(Math.random() * 16) | 0]; return s; }
  function addr() { return '0x' + rh(4) + '…' + rh(2); }
  function amt() { return (12 + Math.random() * 480).toFixed(1) + ' ETH'; }
  function tstamp() { const h = 10 + ((Math.random() * 9) | 0); const m = ((Math.random() * 60) | 0); const s = ((Math.random() * 60) | 0); return [h, m, s].map((x) => String(x).padStart(2, '0')).join(':'); }
  function rowHTML(extra) {
    return `<div class="lrow ${extra || ''}">
        <div class="lrow-icon">⇄</div>
        <div class="lrow-addr">${addr()} → ${addr()}</div>
        <div class="lrow-amt">+${amt()}</div>
        <div class="lrow-time">${tstamp()}</div>
      </div>`;
  }

  // ============================================================
  // SCENE BUILDERS
  // ============================================================
  // ---- HOOK 1: recreated Bybit-hack news headlines ----
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

  // ---- HOOK 2: stolen wallet, glowing $1.5B + transfer rows ----
  $('#sc-ledger-hook').innerHTML =
    `<div class="ledger" id="hook-ledger">
       <div class="ledger-head">
         <span class="dot"></span><span class="dot"></span><span class="dot"></span>
         <div class="ledger-title">PUBLIC LEDGER</div>
         <div class="ledger-live">live</div>
       </div>
       <div class="wallet-label">STOLEN WALLET · ${addr()}b3</div>
       <div class="wallet-balance" id="hook-bal">$0</div>
       <div class="wallet-sub"><span class="eye">●</span> visible to everyone</div>
       <div class="ledger-rows" id="hook-rows">${rowHTML() + rowHTML() + rowHTML()}</div>
     </div>`;
  const hookBal = $('#hook-bal');
  const hookRows = Array.from($('#hook-rows').querySelectorAll('.lrow'));

  function setBalance(v) {
    hookBal.textContent = '$' + Math.round(v).toLocaleString('en-US');
  }
  let balRAF = 0;
  function countBalance(instant) {
    if (balRAF) cancelAnimationFrame(balRAF);
    if (instant) { setBalance(1.5e9); return; }
    const t0 = performance.now(), dur = 1300, target = 1.5e9;
    (function step(now) {
      const e = Math.min(1, (now - t0) / dur);
      const p = 1 - Math.pow(1 - e, 3);
      setBalance(target * p);
      if (e < 1) balRAF = requestAnimationFrame(step);
    })(performance.now());
  }

  // ---- MYTH 2: the public ledger scrolling forever ----
  let scrollRows = '';
  for (let i = 0; i < 9; i++) scrollRows += rowHTML();
  $('#sc-ledger-scroll').innerHTML =
    `<div class="scroll-wrap" id="scroll-wrap">
       <div class="scroll-title">PUBLIC LEDGER · every transfer on record</div>
       <div class="read-head"></div>
       <div class="scroll-track" id="scroll-track">${scrollRows + scrollRows}</div>
     </div>`;
  const scrollWrap = $('#scroll-wrap');
  const scrollTrackRows = Array.from($('#scroll-track').querySelectorAll('.lrow'));
  function tagLazarus(on) {
    // tag two visible rows in each half of the looping track
    const idx = [3, 3 + 9];
    scrollTrackRows.forEach((r, k) => {
      if (idx.includes(k)) {
        r.classList.toggle('tag', on);
        if (on && !r.querySelector('.lrow-tag')) {
          const t = document.createElement('span'); t.className = 'lrow-tag'; t.textContent = 'LAZARUS';
          r.appendChild(t);
        }
      }
    });
  }

  // ---- PUNCHLINE: ledger callback that glows in unison ----
  let pnRows = '';
  for (let i = 0; i < 6; i++) pnRows += rowHTML();
  $('#sc-punchline').innerHTML =
    `<div class="ledger" id="pn-ledger">
       <div class="ledger-head">
         <span class="dot"></span><span class="dot"></span><span class="dot"></span>
         <div class="ledger-title">PUBLIC LEDGER</div>
         <div class="ledger-live">live</div>
       </div>
       <div class="ledger-rows" id="pn-rows">${pnRows}</div>
       <div class="eh-mini" id="pn-mini">
         <div class="ehm steal">STEALING <b>easy</b> <span class="ok">✓</span></div>
         <div class="ehm spend">SPENDING <b>hard</b> 🔒</div>
       </div>
     </div>`;
  const pnRowsEls = Array.from($('#pn-rows').querySelectorAll('.lrow'));
  const pnMini = $('#pn-mini');
  function glowPunchline(on) { pnRowsEls.forEach((r, i) => setTimeout(() => r.classList.toggle('glow', on), on ? i * 70 : 0)); }

  // ---- MOVE 1: chain hopping ----
  const ISLANDS = [
    { x: 0, y: 300, g: '⬡', n: 'Chain A' },
    { x: 350, y: 40, g: '◆', n: 'Chain B' },
    { x: 700, y: 300, g: '⬢', n: 'Chain C' },
    { x: 350, y: 560, g: '⬣', n: 'Chain D' },
  ];
  // island centre = (x+120, y+60); coin (96px) base at island A centre
  const ARCS = [
    'M120,360 Q295,150 470,100', 'M470,100 Q645,150 820,360',
    'M820,360 Q645,610 470,620', 'M470,620 Q295,610 120,360',
  ];
  $('#move1').innerHTML =
    `<div class="ch-wrap">
       <svg class="ch-arc" viewBox="0 0 940 760">${ARCS.map((d, i) => `<path id="ch-arc-${i}" d="${d}"/>`).join('')}</svg>
       ${ISLANDS.map((s) => `<div class="ch-island" style="left:${s.x}px; top:${s.y}px;"><div class="ci-glyph">${s.g}</div><div class="ci-name">${s.n}</div></div>`).join('')}
       <div class="ch-coin" id="ch-coin" style="left:72px; top:312px;">$</div>
     </div>`;
  const chCoin = $('#ch-coin');
  const chArcs = ARCS.map((_, i) => $('#ch-arc-' + i));
  // coin translate offsets from island A centre (120,360)
  const HOPS = [
    { dx: 0, dy: 0 }, { dx: 350, dy: -260 }, { dx: 700, dy: 0 }, { dx: 350, dy: 260 },
  ];
  let hopTimer = 0, hopI = 0;
  function hopTo(i) {
    chCoin.style.transform = `translate(${HOPS[i].dx}px, ${HOPS[i].dy}px)`;
    const arc = (i + ARCS.length - 1) % ARCS.length; // the arc that led here
    if (i !== 0 || hopI !== 0) chArcs[arc].classList.add('lit');
  }
  function startHops() {
    stopHops(); hopI = 0; chArcs.forEach((a) => a.classList.remove('lit'));
    hopTimer = setInterval(() => { hopI = (hopI + 1) % HOPS.length; hopTo(hopI); }, 680);
  }
  function stopHops() { if (hopTimer) { clearInterval(hopTimer); hopTimer = 0; } }
  function showHopsInstant() { chArcs.forEach((a) => a.classList.add('lit')); chCoin.style.transition = 'none'; hopTo(2); void chCoin.offsetWidth; chCoin.style.transition = ''; }

  // ---- MOVE 2: mixers ----
  const MX_IN = [{ x: -210, c: '#7fd9c6' }, { x: -70, c: '#a9c4ec' }, { x: 70, c: '#f0c98a' }, { x: 210, c: '#c7a9ec' }];
  let mxHTML = '<div class="mx-wrap"><div class="mx-drum"><div class="mx-blades"></div></div>';
  MX_IN.forEach((s, i) => { mxHTML += `<div class="mx-coin mx-in" style="--sx:${s.x}px; background:radial-gradient(circle at 36% 32%, #fff6, ${s.c}); animation-delay:${i * 0.18}s;"></div>`; });
  for (let i = 0; i < 4; i++) mxHTML += `<div class="mx-coin mx-out" style="--ox:${(i - 1.5) * 80}px; animation-delay:${i * 0.2}s;"></div>`;
  mxHTML += '<div class="mx-q" id="mxq0" style="left:120px; top:140px;">?</div><div class="mx-q" id="mxq1" style="right:120px; top:200px;">?</div><div class="mx-q" id="mxq2" style="left:300px; bottom:150px;">?</div></div>';
  $('#move2').innerHTML = mxHTML;
  const mxQ = [$('#mxq0'), $('#mxq1'), $('#mxq2')];
  function popMixQ(instant) { mxQ.forEach((q, i) => { if (instant) q.classList.add('pop'); else setTimeout(() => q.classList.add('pop'), i * 380); }); }
  function resetMixQ() { mxQ.forEach((q) => q.classList.remove('pop')); }

  // ---- MOVE 3: splitting ----
  const SPN = 24;
  let spWallets = '', spDots = '', spLines = '';
  const spPos = [];
  for (let i = 0; i < SPN; i++) {
    const ang = (i / SPN) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const r = 250 + Math.random() * 150;
    const x = Math.cos(ang) * r, y = Math.sin(ang) * r * 0.9;
    spPos.push({ x, y });
    const wl = 470 + x - 30, wt = 410 + y - 24;
    spWallets += `<div class="sp-wallet" style="left:${wl}px; top:${wt}px;">▦</div>`;
    spDots += `<div class="sp-dot" style="--dx:${x}px; --dy:${y}px; --d:${(i % 8) * 0.035}s;"></div>`;
    spLines += `<line x1="470" y1="410" x2="${470 + x}" y2="${410 + y}" />`;
  }
  $('#move3').innerHTML =
    `<div class="sp-wrap">
       <svg class="sp-thread" viewBox="0 0 940 820">${spLines}</svg>
       ${spWallets}
       <div class="sp-pile">$</div>
       ${spDots}
     </div>`;
  const move3 = $('#move3');

  // ---- OUTRO ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 620 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // ---- ENUMERATION (default element): the three moves, docked top-left ----
  let enumEl = null;
  try {
    enumEl = new StacktagsEnumerationDetail($('#enum-host'), {
      items: [
        { label: 'Chain hopping', sub: 'jump networks' },
        { label: 'Mixers', sub: 'blur the origin' },
        { label: 'Splitting', sub: 'scatter the haul' },
      ],
    });
  } catch (e) { /* fail soft */ }

  // cross-fade between the three move panels (no scene change → docked badge stays)
  const moves = [$('#move1'), $('#move2'), $('#move3')];
  function showMove(idx, instant) {
    moves.forEach((m, i) => m.classList.toggle('in', i === idx));
    if (idx === 0) { instant ? showHopsInstant() : startHops(); } else stopHops();
    if (idx === 1) { if (instant) popMixQ(true); } else resetMixQ();
    if (idx === 2) { move3.classList.add('burst'); } else move3.classList.remove('burst');
    if (enumEl) enumEl.setActive(idx);
  }

  // ============================================================
  // GRID CAMERA (persistent, subtly moving)
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
        to:   { s: lerp(.72, 1, e), ty: lerp(980, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .85 };
      case 'zoom-out': return {
        from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 },
        to:   { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'pan-right': return {
        from: { tx: lerp(0, 1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 },
        to:   { tx: lerp(-1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 }, panX: 1180 };
      case 'drop': return {
        from: { s: lerp(1, .66, e), ty: lerp(0, 180, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 },
        to:   { s: lerp(.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .9 };
      case 'fade': return {
        from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in':
      default: return {
        from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 },
        to:   { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current;
    if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3; const t0 = performance.now();
      const gy0 = gcam.y;
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
  function showInstant(el) {
    SCENES.forEach((s) => { if (s !== el) setPose(s, { op: 0, z: 0 }); });
    setPose(el, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); current = el;
  }
  function enter(el, mode, dur, instant, onArrive) {
    if (instant) { showInstant(el); if (onArrive) onArrive(); return; }
    depthGo(el, mode, dur, onArrive);
  }

  // ============================================================
  // SUBTITLES (verbatim to the narration, one line at a time)
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
    [9.02, "in crypto, you can't actually <b>hide</b> the money."],
    [11.44,'Every coin they stole was visible to the <b>entire world</b>.'],
    [14.5, "Here's what most people get wrong."],
    [16.12,'They think crypto is <b>anonymous</b> — perfect for crime.'],
    [18.54,"It's almost the <b>opposite</b>."],
    [19.94,'Most blockchains are a <b>public ledger</b>:'],
    [21.62,'every transaction, every wallet, every movement,'],
    [23.86,'recorded <b>forever</b>, for anyone on Earth to read.'],
    [26.28,'So when the group known as <b>Lazarus</b> drained that exchange,'],
    [29.4, 'the whole world could watch the stolen funds sitting in their wallets.'],
    [32.72,'Stealing it was the <b>easy</b> part.'],
    [34.58,'Spending it is the <b>hard</b> part.'],
    [36.26,'Because the moment they try to send that money to an exchange to cash out,'],
    [39.6, 'it gets <b>flagged and frozen</b>.'],
    [41.16,'So to have any hope of using it, they try to <b>break the trail</b>.'],
    [44.18,'They do it three ways.'],
    [45.6, 'One: <b>chain hopping</b>.'],
    [46.98,'They bounce the money across different blockchains, again and again,'],
    [50.24,'so the trail has to keep <b>jumping networks</b>.'],
    [52.68,'Two: <b>mixers</b>.'],
    [53.64,'They throw the coins into a pot with thousands of others and shuffle them,'],
    [57.32,'blurring which coins came from where.'],
    [59.2, 'Three: <b>splitting</b>.'],
    [60.42,'They chop the haul into thousands of tiny transfers across countless wallets,'],
    [63.92,"so there's no single <b>stream</b> left to follow."],
    [66.06,"And that's the <b>irony</b>."],
    [67.32,"The only reason they need all of this is that crypto isn't <b>anonymous</b> at all."],
    [70.76,"It's the most <b>transparent</b> money ever made —"],
    [72.7, 'a permanent, public record.'],
    [74.5, 'So stealing a billion is the <b>easy</b> part.'],
    [76.82,'Actually spending it is a problem most criminals never saw coming.'],
    [80.5, 'Want more of how crypto really works?'],
    [82.0, 'Follow <b>Stacktags</b>.'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  function setAnon(stage) {
    const w = $('#anon-word'), s = $('#anon-stamp');
    if (stage === 'reset') { w.textContent = 'ANONYMOUS'; w.classList.remove('struck', 'traceable'); s.classList.remove('hit', 'fade'); }
    if (stage === 'stamp') { s.classList.add('hit'); w.classList.add('struck'); }
    if (stage === 'trace') { w.textContent = 'TRACEABLE'; w.classList.remove('struck'); w.classList.add('traceable'); s.classList.add('fade'); }
  }
  const CUES = [
    // ---- HOOK 1 — news headlines slide in ----
    [0.2,  (i) => enter($('#sc-news'), 'fade', 600, i, () => { if (i) newsCards.forEach((c) => c.classList.add('in')); else newsCards[0].classList.add('in'); })],
    [2.3,  () => newsCards[1].classList.add('in')],
    [3.9,  () => newsCards[2].classList.add('in')],

    // ---- HOOK 2 — stolen wallet, $1.5B glowing ----
    [9.02, (i) => enter($('#sc-ledger-hook'), 'zoom-out', 1150, i, () => countBalance(i))],
    [11.44,(i) => hookRows.forEach((r, k) => { if (i) r.classList.add('glow'); else setTimeout(() => r.classList.add('glow'), k * 130); })],

    // ---- MYTH 1 — ANONYMOUS → FALSE → TRACEABLE ----
    [14.5, (i) => enter($('#sc-anon'), 'zoom-in', 1000, i, () => { if (i) setAnon('trace'); })],
    [19.02,(i) => { if (!i) setAnon('stamp'); }],
    [19.5, (i) => { if (!i) setAnon('trace'); }],

    // ---- MYTH 2 — public ledger scrolling ----
    [19.94,(i) => enter($('#sc-ledger-scroll'), 'rise', 1050, i, () => { scrollWrap.classList.add('run'); })],
    [27.8, (i) => tagLazarus(true)],

    // ---- MYTH 3 — stealing easy / spending hard ----
    [32.72,(i) => enter($('#sc-easyhard'), 'drop', 1000, i, () => { if (i) { $('#eh-steal').classList.add('in'); $('#eh-spend').classList.add('in', 'locked'); } else $('#eh-steal').classList.add('in'); })],
    [34.58,() => $('#eh-spend').classList.add('in')],
    [35.34,() => $('#eh-spend').classList.add('locked')],

    // ---- WHY — flagged & frozen at the exchange ----
    [36.26,(i) => enter($('#sc-frozen'), 'pan-right', 1050, i, () => {
      const c = $('#fz-coin'), wrap = $('.fz-wrap');
      if (i) { c.classList.add('go'); $('#fz-flag').classList.add('show'); $('#fz-frost').classList.add('show'); wrap.classList.add('frozen'); return; }
      setTimeout(() => c.classList.add('go'), 280);
    })],
    [39.86,() => { $('#fz-flag').classList.add('show'); $('#fz-frost').classList.add('show'); $('.fz-wrap').classList.add('frozen'); }],

    // ---- THE THREE MOVES — enumeration docks, moves cross-fade ----
    [44.18,(i) => {
      enter($('#sc-enum'), 'lift', 1000, i);
      if (!enumEl) return;
      if (i) { enumEl.revealAll({ stagger: 0 }); enumEl.collapseToLogo({ delay: 0 }); enumEl.dockToTop(); return; }
      enumEl.reset(); enumEl.revealAll({ stagger: 180 });
      setTimeout(() => enumEl.collapseToLogo({ delay: 0 }), 900);
      setTimeout(() => enumEl.dockToTop(), 1750);
    }],
    [46.28,(i) => showMove(0, i)],
    [52.68,(i) => showMove(1, i)],
    [59.2, (i) => showMove(2, i)],

    // ---- PUNCHLINE — back to the glowing ledger ----
    [66.06,(i) => enter($('#sc-punchline'), 'zoom-out', 1150, i, () => { if (i) { glowPunchline(true); pnMini.classList.add('show'); } })],
    [71.1, (i) => glowPunchline(true)],
    [74.5, () => pnMini.classList.add('show')],

    // ---- OUTRO ----
    [80.5, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh only when the grid moves OR a default element
  // animates; pop for word/object pops. [t, sound, vol]
  // ============================================================
  const SFX = [
    [9.02, 'swoosh', 0.50],                 // zoom-out to the ledger
    [14.5, 'swoosh', 0.45],                 // zoom-in to ANONYMOUS
    [19.02,'swoosh', 0.34],                 // FALSE stamp impact
    [19.94,'swoosh', 0.50],                 // rise into the scrolling ledger
    [32.72,'swoosh', 0.45],                 // drop to easy/hard
    [35.34,'pop',    0.50],                 // the lock snaps shut
    [36.26,'swoosh', 0.50],                 // pan to the exchange
    [39.86,'pop',    0.45],                 // flagged & frozen impact
    [44.18,'swoosh', 0.55],                 // lift into the enumeration
    [45.05,'swoosh', 0.50],                 // enumeration folds into the stack
    [45.95,'swoosh', 0.40],                 // stack docks to the corner
    [52.68,'swoosh', 0.34],                 // enumeration switches to mixers
    [57.40,'pop',    0.50], [57.90,'pop', 0.50], [58.40,'pop', 0.50],  // "?" pops (origins blur)
    [59.20,'swoosh', 0.34],                 // enumeration switches to splitting
    [66.06,'swoosh', 0.50],                 // zoom-out to the punchline ledger
    [71.10,'swoosh', 0.30],                 // rows glow up in unison
    [80.50,'swoosh', 0.60],                 // lift + outro assembles
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
    setBalance(0); hookRows.forEach((r) => r.classList.remove('glow'));
    setAnon('reset');
    scrollWrap.classList.remove('run'); tagLazarus(false);
    $('#eh-steal').classList.remove('in'); $('#eh-spend').classList.remove('in', 'locked');
    const c = $('#fz-coin'); if (c) c.classList.remove('go');
    $('#fz-flag').classList.remove('show'); $('#fz-frost').classList.remove('show'); $('.fz-wrap').classList.remove('frozen');
    if (enumEl) enumEl.reset();
    stopHops(); chArcs.forEach((a) => a.classList.remove('lit')); chCoin.style.transform = 'translate(0,0)';
    resetMixQ(); move3.classList.remove('burst');
    moves.forEach((m) => m.classList.remove('in'));
    pnRowsEls.forEach((r) => r.classList.remove('glow')); pnMini.classList.remove('show');
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
