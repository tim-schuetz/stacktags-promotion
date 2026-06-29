/* ============================================================
   "Why all of China runs on one clock" — choreography (v2).
   Reuses the reference engine (grid camera + faux-3D depth transitions +
   audio.currentTime cue engine + verbatim subtitles + declared SFX bed).
   v2: clock-grows-to-centre reveal (no stamp), a 3D globe dive into the far
   west handing off to a photo, a continuous compare→merge, a globe route
   Beijing→Xinjiang, and real cut-out objects in the local-time scene.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const el = (cls, tag) => { const d = document.createElement(tag || 'div'); if (cls) d.className = cls; return d; };

  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // ============================================================
  // CONTROLLERS
  // ============================================================
  let cnHook, hookBands, hookCaliper, bjClock;
  let westGlobeCtrl, mainGlobeCtrl;
  let circleClocks = [];
  let usHl = false, xjPinned = false;
  let lifeEls = [];
  let cnPunch, punchClk, punchSun, punchGhost;

  // ---------- builders ----------
  async function buildHook() {
    const host = $('#hook-map'); host.style.width = '940px'; host.style.height = '760px';
    cnHook = await window.mountCountryMap(host, { country: 'China', width: 940, height: 760, pad: 150 });
    cnHook.line.style.opacity = '0'; cnHook.fill.style.opacity = '0';
    hookBands = window.makeTimeZoneBands(cnHook, {
      ghost: true, clockSize: 104,
      bands: [
        { lon0: 73, lon1: 82.5, h: 9 }, { lon0: 82.5, lon1: 97.5, h: 10 },
        { lon0: 97.5, lon1: 112.5, h: 11 }, { lon0: 112.5, lon1: 127.5, h: 12 },
        { lon0: 127.5, lon1: 135.5, h: 13 },
      ],
    });
    host.appendChild(hookBands.host);
    hookCaliper = window.makeCaliper({ label: '5,000 km' });
    $('#hook-stage').appendChild(hookCaliper.el);
    // the big Beijing clock — starts at the noon band, travels to centre on cue
    bjClock = window.makeAnalogClock({ size: 104, h: 12, m: 0, theme: 'official' });
    bjClock.el.classList.add('bj-clock');
    $('#hook-stage').appendChild(bjClock.el);
  }

  // 5 clocks arranged in a circle (foreground over the globe), pop 4+1, then merge to one
  function buildClockCircle() {
    const host = $('#clock-circle');
    const hrs = [9, 10, 11, 12, 13];
    const angles = [-90, -18, 54, 126, 198];   // 5 positions, 72° apart, starting at the top
    circleClocks = angles.map((a, i) => {
      const rad = a * Math.PI / 180;
      const x = 540 + 290 * Math.cos(rad), y = 800 + 290 * Math.sin(rad);
      const c = window.makeAnalogClock({ size: 150, h: hrs[i], theme: 'official' });
      c.el.classList.add('circle-clk');
      c.el.dataset.hx = x; c.el.dataset.hy = y;
      c.el.style.left = x + 'px'; c.el.style.top = y + 'px';
      host.appendChild(c.el);
      return c;
    });
  }

  function buildWest() {
    const houses = [{ k: 'house4', h: 450 }, { k: 'house1', h: 330 }, { k: 'house2', h: 450 }, { k: 'house3', h: 310 }, { k: 'house4', h: 450 }, { k: 'house1', h: 330 }];
    $('#wc-houses').innerHTML = houses.map((o) => `<img src="assets/photos/${o.k}.png" style="height:${o.h}px;margin:0 -8px" onerror="this.style.display='none'">`).join('');
  }

  function buildLocal() {
    const stageEl = $('#local-stage');
    // two DIGITAL clocks stacked: Beijing on top, Xinjiang below (2 hours behind)
    stageEl.innerHTML =
      `<div class="dclocks" id="dclocks">
         <div class="dclock bj"><div class="dc-time">12:00</div><div class="dc-label">Beijing</div></div>
         <div class="dc-gap">−2 h</div>
         <div class="dclock xj"><div class="dc-time">10:00</div><div class="dc-label">Xinjiang</div></div>
       </div>
       <div class="life-row" id="life-row"></div>`;
    const lifeImg = (key, t) => `<div class="life"><div class="life-imgwrap"><img class="life-img" src="assets/photos/${key}.png" onerror="this.parentNode.parentNode.style.display='none'"></div><div class="life-t">${t}</div></div>`;
    $('#life-row').innerHTML = lifeImg('obj_bus_dash', '10:00') + lifeImg('obj_shop_dash', '10:00') + lifeImg('obj_dinner_dash', '19:30');
    lifeEls = Array.from($('#life-row').querySelectorAll('.life'));
  }

  async function buildPunch() {
    const host = $('#punch-map'); host.style.width = '940px'; host.style.height = '620px';
    cnPunch = await window.mountCountryMap(host, { country: 'China', width: 940, height: 620, pad: 90 });
    cnPunch.line.style.opacity = '0'; cnPunch.fill.style.opacity = '0';
    const layer = $('#punch-layer');
    punchClk = window.makeAnalogClock({ size: 158, h: 12, m: 0, theme: 'official' });
    const pc = el('hero-clk'); pc.appendChild(punchClk.el); pc.style.left = '50%'; pc.style.top = '2%';
    layer.appendChild(pc);
    punchGhost = window.makeBeijingStamp({ text: '北京时间', sub: 'UTC +8' });
    punchGhost.showStamped(); punchGhost.el.style.opacity = '0'; punchGhost.el.style.top = '46%';
    layer.appendChild(punchGhost.el);
    punchSun = window.makeSun({ size: 150 }); layer.appendChild(punchSun.el);
    const pw = cnPunch.project(40, 80);
    punchSun.place(pw.x / cnPunch.W * 100, 96);
  }

  // outro endcard
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) {
    outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
    outroLogo.querySelectorAll('svg > g').forEach((g) => { if (!g.classList.contains('chev')) g.classList.add('lyr'); });
  }
  function outroAssemble() { $('#outro-ec').classList.add('play'); }
  function outroReset() { $('#outro-ec').classList.remove('play'); }

  // ---------- globes (mounted lazily, halted until their cue) ----------
  function mountGlobes() {
    if (!(window.THREE && window.earcut && window.topojson && window.mountStacktagsGlobe)) { setTimeout(mountGlobes, 120); return; }
    try {
      window.mountStacktagsGlobe($('#west-globe'), { focus: { lat: 38, lon: 90, cam: 4.0 }, startCam: 4.0, startLat: 20, startLon: 104, highlight: 'China', marker: { lat: 39.47, lon: 75.99 }, autoReveal: false, onReady: (c) => { westGlobeCtrl = c; c.halt(); } });
    } catch (e) {}
    try {
      // main globe (S4–S6): sits at China, travels to the USA and back, then runs the route; full round globe (no side clip)
      window.mountStacktagsGlobe($('#main-globe'), { focus: { lat: 36, lon: 100, cam: 4.5 }, startCam: 4.5, startLat: 36, startLon: 100, highlight: 'China', autoReveal: false, onReady: (c) => { mainGlobeCtrl = c; c.halt(); } });
    } catch (e) {}
  }

  // ============================================================
  // INIT
  // ============================================================
  buildWest(); buildLocal(); buildClockCircle(); mountGlobes();
  (async function init() {
    try {
      await buildHook(); await buildPunch();
      window.__ready = true; if (vo.paused) applyUpTo(vo.currentTime || 0);
    } catch (e) { console.log('init failed:', e.message); }
  })();

  // ============================================================
  // GRID CAMERA
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const idleS = 1 + Math.sin(t * 0.5) * 0.012, idleX = Math.sin(t * 0.33) * 10, idleY = Math.cos(t * 0.27) * 8;
    const cs = clamp(gdisp.s * idleS, 0.8, 1.6), cell = 120 * cs;
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
  function setPose(elx, p) {
    elx.style.setProperty('--tx', (p.tx || 0) + 'px');
    elx.style.setProperty('--ty', (p.ty || 0) + 'px');
    elx.style.setProperty('--s', p.s != null ? p.s : 1);
    elx.style.opacity = p.op != null ? p.op : 1;
    elx.style.filter = p.blur ? `blur(${p.blur}px)` : 'none';
    if (p.z != null) elx.style.zIndex = p.z;
  }
  function POSES(mode, e) {
    switch (mode) {
      case 'rise': return { from: { s: lerp(1, .66, e), ty: lerp(0, -230, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 }, to: { s: lerp(.72, 1, e), ty: lerp(980, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .85 };
      case 'zoom-out': return { from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 }, to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'pan-left': return { from: { tx: lerp(0, -1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 }, to: { tx: lerp(1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 }, panX: -1180 };
      case 'drop': return { from: { s: lerp(1, .66, e), ty: lerp(0, 180, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 }, to: { s: lerp(.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .9 };
      case 'fade': return { from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in': default: return { from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 }, to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current; if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x, gy0 = gcam.y;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3; const t0 = performance.now(); setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur)), z = lerp(1, 1.3, e), dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: z, op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        gdisp.y = gy0 + dy * 0.5;
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
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
      const e = easeInOut(clamp01((now - t0) / dur)), ps = POSES(mode, e);
      if (fromEl) setPose(fromEl, ps.from); setPose(toEl, ps.to);
      if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
      if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1); current = toEl; if (onArrive) onArrive();
    })(performance.now());
  }
  function showInstant(elx) { SCENES.forEach((s) => { if (s !== elx) setPose(s, { op: 0, z: 0 }); }); setPose(elx, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); current = elx; }
  function enter(elx, mode, dur, instant, onArrive) { if (instant) { showInstant(elx); if (onArrive) onArrive(); return; } depthGo(elx, mode, dur, onArrive); }

  // ============================================================
  // in-scene actions
  // ============================================================
  // S2 — the noon ghost clock (2nd from right) grows to the map centre + 北京时间 fades in
  function beijingReveal(instant) {
    if (!hookBands) return;
    hookBands.host.classList.add('flush');
    hookBands.bands.forEach((b) => b.classList.add('one'));
    // all 5 ghost clocks fade out; the dedicated big clock takes over (handoff at the noon band)
    hookBands.clocks.forEach((c) => { c.el.style.transition = instant ? 'none' : 'opacity .35s ease'; c.el.style.opacity = '0'; });
    if (bjClock) {
      bjClock.el.style.transition = instant ? 'none' : 'left .7s cubic-bezier(.3,.9,.3,1), top .7s cubic-bezier(.3,.9,.3,1), transform .78s cubic-bezier(.34,1.45,.5,1), opacity .25s ease';
      bjClock.el.style.opacity = '1'; bjClock.el.style.left = '50%'; bjClock.el.style.top = '48%';
      bjClock.el.style.transform = 'translate(-50%,-50%) scale(2.2)';
    }
    if (hookCaliper) { hookCaliper.el.style.transition = instant ? 'none' : 'opacity .4s ease'; hookCaliper.el.style.opacity = '0'; }
    const t = $('#bj-title');
    if (instant) { t.style.transition = 'none'; t.classList.add('in'); }
    else { t.style.transition = 'opacity .55s ease .35s, transform .55s cubic-bezier(.34,1.5,.5,1) .35s'; t.classList.add('in'); }
  }

  // S4/S5 — clock-circle (over the globe): pop clocks [from,to), then merge to one, then fade
  function circleReveal(from, to, instant) {
    for (let i = from; i < to; i++) {
      const c = circleClocks[i]; if (!c) continue;
      const apply = () => {
        c.el.style.transition = instant ? 'none' : 'transform .5s cubic-bezier(.34,1.56,.64,1), opacity .35s ease';
        c.el.style.transform = 'translate(-50%,-50%) scale(1)'; c.el.style.opacity = '1';
      };
      if (instant) apply(); else setTimeout(apply, (i - from) * 170);
    }
  }
  function circleMerge(instant) {
    circleClocks.forEach((c, i) => {
      if (i === 3) {                       // the noon clock survives + grows
        c.el.style.zIndex = 6;
        c.el.style.transition = instant ? 'none' : 'left .8s cubic-bezier(.3,.9,.3,1), top .8s cubic-bezier(.3,.9,.3,1), transform .9s cubic-bezier(.34,1.3,.5,1)';
        c.el.style.left = '540px'; c.el.style.top = '800px'; c.el.style.transform = 'translate(-50%,-50%) scale(2.4)';
      } else {
        c.el.style.transition = instant ? 'none' : 'left .7s ease, top .7s ease, opacity .5s ease';
        c.el.style.left = '540px'; c.el.style.top = '800px'; c.el.style.opacity = '0';
      }
    });
  }
  function circleFade(instant) {
    const c = circleClocks[3]; if (!c) return;
    c.el.style.transition = instant ? 'none' : 'opacity .55s ease';
    c.el.style.opacity = '0';
  }
  // S4 — colour the USA once the globe has travelled there
  function colourUSA() { if (mainGlobeCtrl && !usHl) { usHl = true; mainGlobeCtrl.addHighlight('United States of America', 1000); } }
  // S6 — a building pops at the Xinjiang point on the globe
  function popXjBuilding(instant) {
    const b = $('#xj-building'); if (!b || !mainGlobeCtrl) return;
    if (!xjPinned) { mainGlobeCtrl.pinElement(b, 43.8, 87.6); xjPinned = true; }
    b.style.transition = instant ? 'none' : 'transform .5s cubic-bezier(.34,1.5,.5,1), opacity .4s ease';
    b.style.transform = 'translate(-50%,-90%) scale(1)'; b.style.opacity = '1';
  }
  // S6→S7 — dive into the Xinjiang point (building scales up, globe zooms in)
  function diveXinjiang(instant) {
    if (!mainGlobeCtrl) return;
    const b = $('#xj-building');
    if (instant) { mainGlobeCtrl.setFocus(43.8, 87.6, 1.2); if (b) { b.style.transition = 'none'; b.style.transform = 'translate(-50%,-90%) scale(3.6)'; } return; }
    if (b) { b.style.transition = 'transform 1.3s cubic-bezier(.4,.05,.3,1)'; b.style.transform = 'translate(-50%,-90%) scale(3.6)'; }
    mainGlobeCtrl.setSlew(0.045);
    mainGlobeCtrl.zoomToMarker({ lat: 43.8, lon: 87.6, cam: 1.2, duration: 1400 });
  }

  function punchCrest(instant) {
    if (!cnPunch || !punchSun) return;
    const pw = cnPunch.project(40, 80);
    if (punchGhost) punchGhost.el.style.opacity = '.1';
    if (instant) { punchSun.place(pw.x / cnPunch.W * 100, 49); return; }
    punchSun.glide(pw.x / cnPunch.W * 100, 49, { ms: 2600 });
  }

  // ============================================================
  // SUBTITLES
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 130);
  }
  const SUBS = [
    [0.0, 'China is almost <b>5,000 kilometers</b> wide —'],
    [2.4, 'wide enough to cross <b>five time zones</b>.'],
    [4.5, 'But the entire country runs on a single clock:'],
    [7.4, '<b>Beijing time</b>.'],
    [8.4, 'Which means out in the far <b>west</b>,'],
    [10.4, 'the sun sometimes doesn’t come up'],
    [11.7, 'until <b>ten in the morning</b>.'],
    [13.4, 'China is about as wide'],
    [15.1, 'as the <b>United States</b> —'],
    [16.6, 'which uses <b>four</b> separate time zones.'],
    [18.6, 'So China should have roughly <b>five</b>.'],
    [20.1, 'But in <b>1949</b>, the new government'],
    [22.3, 'scrapped them all and put the whole nation'],
    [24.2, 'on one time — <b>Beijing time</b> —'],
    [26.2, 'as a symbol of national unity.'],
    [27.7, 'One country, <b>one clock</b>.'],
    [29.9, 'Near Beijing, that’s fine.'],
    [31.9, 'But thousands of kilometers west, in <b>Xinjiang</b>,'],
    [34.6, 'the official time is out of step with the sky.'],
    [37.6, 'In winter, sunrise comes around <b>10 a.m.</b>'],
    [40.3, 'and the sun stays up late into the evening.'],
    [42.4, 'So people quietly run their lives'],
    [44.8, 'on an unofficial <b>Xinjiang time</b> —'],
    [46.8, '<b>two hours</b> behind Beijing.'],
    [48.7, 'The buses, the shops, dinner…'],
    [51.5, 'Ask someone the time, and you might'],
    [53.4, 'have to ask back:'],
    [54.5, '<b>Beijing time, or our time?</b>'],
    [55.8, 'A single time zone keeps the country'],
    [57.9, 'on the same page.'],
    [59.2, 'But the sun doesn’t take orders from <b>Beijing</b>.'],
    [61.2, 'So half a continent away,'],
    [62.8, 'people just quietly made their <b>own time</b> anyway…'],
    [65.3, 'Want more places that break the map?'],
    [67.2, '<b>Follow Stacktags.</b>'],
  ];

  // ============================================================
  // CUES
  // ============================================================
  const CUES = [
    // S1 — map, caliper, bands + 5 ghost clocks
    [0.0, (i) => enter($('#sc-hook'), 'fade', 650, i, () => { if (cnHook) { i ? cnHook.showInstant() : cnHook.drawIn(1300); } })],
    [1.2, (i) => { if (hookCaliper) (i ? hookCaliper.showOpen() : hookCaliper.open()); }],
    [3.4, (i) => { if (hookBands) (i ? hookBands.showInstant() : hookBands.wipeIn({ stagger: 175 })); }],
    // S2 — noon clock grows to centre + 北京时间
    [7.3, (i) => beijingReveal(i)],

    // S3 — globe dive into the far west → full-screen photo
    [8.4, (i) => enter($('#sc-west'), 'fade', 480, i, () => {
      if (i) { $('#west-globe').classList.add('gone'); $('#west-city').classList.add('in'); return; }
      $('#west-city').classList.remove('in'); $('#west-globe').classList.remove('gone');
      if (!westGlobeCtrl) { $('#west-city').classList.add('in'); return; }
      westGlobeCtrl.resume(); westGlobeCtrl.reveal();
      setTimeout(() => westGlobeCtrl.zoomToMarker({ lat: 39.47, lon: 75.99, cam: 1.05, duration: 1500 }, { onArrive: () => {
        $('#west-globe').classList.add('gone'); $('#west-city').classList.add('in');
        setTimeout(() => westGlobeCtrl && westGlobeCtrl.halt(), 250);
      } }), 360);
    })],

    // S4–S5 — one globe: China→USA (slow), colour the USA, then 4+1 clocks pop in a circle and merge to one
    [13.4, (i) => enter($('#sc-globe-main'), 'fade', 500, i, () => {
      if (!mainGlobeCtrl) return;
      mainGlobeCtrl.resume(); mainGlobeCtrl.reveal();
      if (i) { mainGlobeCtrl.setFocus(38, 262, 4.5); colourUSA(); return; }
      mainGlobeCtrl.setSlew(0.02);                                          // a bit slower
      setTimeout(() => mainGlobeCtrl.setFocus(38, 262, 4.5), 200);          // China → USA
      setTimeout(colourUSA, 2600);                                          // colour the USA on arrival
    })],
    [16.6, (i) => circleReveal(0, 4, i)],                                   // 4 clocks pop in a circle
    [18.6, (i) => circleReveal(4, 5, i)],                                   // 5th clock pops
    [24.5, (i) => circleMerge(i)],                                          // converge to one big clock
    [29.9, (i) => { circleFade(i); if (mainGlobeCtrl) { if (!i) mainGlobeCtrl.setSlew(0.03); mainGlobeCtrl.setFocus(36, 100, 4.5); } }],   // clock fades + globe USA→China

    // S6 — Beijing dot → route west to Xinjiang → dot + building
    [31.9, (i) => {
      if (!mainGlobeCtrl) return;
      if (i) { mainGlobeCtrl.resume(); mainGlobeCtrl.reveal(); mainGlobeCtrl.setFocus(36, 100, 4.5); mainGlobeCtrl.addDot(39.9, 116.4); mainGlobeCtrl.setRoute([[39.9, 116.4], [43.8, 87.6]]); mainGlobeCtrl.revealRoute(1); mainGlobeCtrl.addDot(43.8, 87.6); popXjBuilding(true); return; }
      mainGlobeCtrl.addDot(39.9, 116.4);                                    // Beijing
    }],
    [33.0, (i) => { if (!i && mainGlobeCtrl) { mainGlobeCtrl.setRoute([[39.9, 116.4], [43.8, 87.6]]); mainGlobeCtrl.revealRoute(2200); setTimeout(() => { mainGlobeCtrl.addDot(43.8, 87.6); popXjBuilding(false); }, 2000); } }],

    // S6→S7 — dive into the Xinjiang point
    [40.3, (i) => diveXinjiang(i)],

    // S7 — unofficial local time + real cut-out objects
    [42.4, (i) => enter($('#sc-local'), 'fade', 500, i, () => {
      if (mainGlobeCtrl) mainGlobeCtrl.halt();
      const dc = $('#dclocks'); if (dc) { dc.classList.add('in'); if (i) dc.classList.add('in2'); else setTimeout(() => dc.classList.add('in2'), 1700); }
      if (i) lifeEls.forEach((l) => l.classList.add('in'));
    })],
    [48.9, (i) => { if (!i && lifeEls[0]) lifeEls[0].classList.add('in'); }],
    [49.7, (i) => { if (!i && lifeEls[1]) lifeEls[1].classList.add('in'); }],
    [50.8, (i) => { if (!i && lifeEls[2]) lifeEls[2].classList.add('in'); }],

    // S9+S10 — calm map, then the sun crests
    [55.8, (i) => enter($('#sc-punch'), 'zoom-out', 1100, i, () => {
      if (cnPunch) { i ? cnPunch.showInstant() : cnPunch.drawIn(1200); }
      if (punchClk) punchClk.snap(12, 0);
      if (i) punchCrest(true);
    })],
    [59.2, (i) => { if (!i) punchCrest(false); }],

    // S11 — outro (the assemble plays AFTER the lift + after the presenter leaves the foreground)
    [65.3, (i) => { enter($('#sc-outro'), 'lift', 1100, i); if (i) outroAssemble(); else setTimeout(outroAssemble, 1600); }],
  ];

  // ============================================================
  // SFX  [t, name, vol]  — swoosh only on grid/element motion
  // ============================================================
  const SFX = [
    [3.4, 'swoosh', 0.34],
    [3.55, 'pop', 0.5], [3.78, 'pop', 0.5], [4.0, 'pop', 0.5], [4.22, 'pop', 0.5], [4.44, 'pop', 0.5],   // 5 ghost clocks
    [7.35, 'swoosh', 0.45], [7.7, 'tick', 0.7],                          // clock grows to centre + 北京时间
    [8.5, 'swoosh', 0.5], [9.9, 'swoosh', 0.5],                          // globe scene + dive-in
    [13.4, 'swoosh', 0.5],                                              // globe travel China→USA
    [16.6, 'pop', 0.5], [16.85, 'pop', 0.5], [17.1, 'pop', 0.5], [17.35, 'pop', 0.5],   // 4 clocks pop in a circle
    [18.7, 'pop', 0.5],                                                 // 5th clock
    [24.5, 'swoosh', 0.42], [27.7, 'tick', 0.7],                        // clocks converge + merge
    [29.9, 'swoosh', 0.5],                                              // clock fades + globe USA→China
    [31.9, 'pop', 0.4], [33.1, 'swoosh', 0.4], [35.2, 'pop', 0.5],      // Beijing dot + route + Xinjiang building
    [40.3, 'swoosh', 0.55],                                             // dive into Xinjiang
    [42.4, 'swoosh', 0.4], [45.0, 'tick', 0.6],                         // land in local scene + local clock
    [48.9, 'pop', 0.5], [49.6, 'pop', 0.5], [50.8, 'pop', 0.5],         // 3 cut-out objects
    [55.8, 'swoosh', 0.5],                                              // zoom-out to punch
    [59.2, 'swoosh', 0.5],                                              // sun crest
    [65.3, 'swoosh', 0.6],                                              // outro lift
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
    if (cnHook) { cnHook.line.style.opacity = '0'; cnHook.fill.style.opacity = '0'; }
    if (hookBands) {
      hookBands.host.classList.remove('flush');
      hookBands.bands.forEach((b) => b.classList.remove('in', 'one'));
      hookBands.clocks.forEach((c, i) => { c.el.classList.remove('in', 'to-centre'); c.el.style.transition = 'none'; c.el.style.opacity = ''; c.el.style.transform = 'translate(-50%,-50%) scale(.4)'; c.el.style.zIndex = ''; c.el.style.left = c.el.dataset.ol || ''; c.el.style.top = c.el.dataset.ot || ''; c.setTheme('ghost'); c.snap([9, 10, 11, 12, 13][i], 0); });
    }
    if (hookCaliper) { hookCaliper.el.classList.remove('open'); hookCaliper.el.style.opacity = ''; hookCaliper.el.style.transition = 'none'; }
    if (bjClock) { bjClock.el.style.transition = 'none'; bjClock.el.style.opacity = '0'; bjClock.el.style.left = '67%'; bjClock.el.style.top = '12%'; bjClock.el.style.transform = 'translate(-50%,-50%) scale(1)'; bjClock.snap(12, 0); }
    const bt = $('#bj-title'); if (bt) { bt.classList.remove('in'); bt.style.transition = 'none'; }
    $('#west-globe').classList.remove('gone'); $('#west-city').classList.remove('in');
    if (westGlobeCtrl) westGlobeCtrl.halt();
    if (mainGlobeCtrl) mainGlobeCtrl.halt();
    circleClocks.forEach((c) => { c.el.classList.remove('in'); c.el.style.transition = 'none'; c.el.style.opacity = ''; c.el.style.zIndex = ''; c.el.style.left = c.el.dataset.hx + 'px'; c.el.style.top = c.el.dataset.hy + 'px'; c.el.style.transform = 'translate(-50%,-50%) scale(.3)'; });
    const xb = $('#xj-building'); if (xb) { xb.style.transition = 'none'; xb.style.transform = 'translate(-50%,-90%) scale(.3)'; xb.style.opacity = '0'; }
    const dcl = $('#dclocks'); if (dcl) dcl.classList.remove('in', 'in2');
    lifeEls.forEach((l) => l.classList.remove('in'));
    if (cnPunch) { cnPunch.line.style.opacity = '0'; cnPunch.fill.style.opacity = '0'; } if (punchClk) punchClk.snap(12, 0);
    if (punchGhost) punchGhost.el.style.opacity = '0';
    if (punchSun && cnPunch) { const pw = cnPunch.project(40, 80); punchSun.place(pw.x / cnPunch.W * 100, 96); }
    outroReset();
  }
  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    SCENES.forEach((elx) => setPose(elx, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null; gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
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
  // PLAYBACK
  // ============================================================
  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });

  hardReset();
})();
