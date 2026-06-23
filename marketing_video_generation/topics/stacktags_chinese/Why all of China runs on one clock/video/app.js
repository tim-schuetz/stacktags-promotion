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
  let westGlobeCtrl, route6Ctrl, compareGlobeCtrl;
  let usCmp, cnCmp, usBands, cnBands;
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

  async function buildCompare() {
    const FIXED = 12.2;
    usCmp = await window.mountCountryMap($('#us-map'), { country: 'United States of America', mainlandOnly: true, fixedScale: FIXED, width: 820, height: 480, pad: 30 });
    cnCmp = await window.mountCountryMap($('#cn-map'), { country: 'China', fixedScale: FIXED, width: 820, height: 540, pad: 30 });
    $('#us-map').style.width = usCmp.W + 'px'; $('#us-map').style.height = usCmp.H + 'px';
    $('#cn-map').style.width = cnCmp.W + 'px'; $('#cn-map').style.height = cnCmp.H + 'px';
    usCmp.showInstant(); cnCmp.showInstant();
    usBands = window.makeTimeZoneBands(usCmp, { ghost: true, clockSize: 62, bands: [
      { lon0: -125, lon1: -115, h: 9 }, { lon0: -115, lon1: -101, h: 10 }, { lon0: -101, lon1: -87, h: 11 }, { lon0: -87, lon1: -66, h: 12 },
    ] });
    cnBands = window.makeTimeZoneBands(cnCmp, { ghost: true, clockSize: 64, bands: [
      { lon0: 73, lon1: 82.5, h: 9 }, { lon0: 82.5, lon1: 97.5, h: 10 }, { lon0: 97.5, lon1: 112.5, h: 11 }, { lon0: 112.5, lon1: 127.5, h: 12 }, { lon0: 127.5, lon1: 135.5, h: 13 },
    ] });
    $('#us-map').appendChild(usBands.host); $('#cn-map').appendChild(cnBands.host);
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
      window.mountStacktagsGlobe($('#west-globe'), { focus: { lat: 38, lon: 86, cam: 2.2 }, startCam: 3.1, startLat: 15, startLon: 100, highlight: 'China', marker: { lat: 39.47, lon: 75.99 }, autoReveal: false, onReady: (c) => { westGlobeCtrl = c; c.halt(); } });
    } catch (e) {}
    try {
      window.mountStacktagsGlobe($('#route-globe'), { focus: { lat: 38, lon: 100, cam: 2.5 }, startCam: 3.0, startLat: 16, startLon: 102, highlight: 'China', autoReveal: false, onReady: (c) => { route6Ctrl = c; c.halt(); } });
    } catch (e) {}
    try {
      // S4 intro: starts zoomed on the western point of China, then zooms out and travels to the USA
      window.mountStacktagsGlobe($('#compare-globe'), { focus: { lat: 39.47, lon: 75.99, cam: 1.18 }, startCam: 1.18, startLat: 39.47, startLon: 75.99, highlight: 'China', marker: { lat: 39.47, lon: 75.99 }, autoReveal: false, onReady: (c) => { compareGlobeCtrl = c; c.halt(); } });
    } catch (e) {}
  }

  // ============================================================
  // INIT
  // ============================================================
  buildWest(); buildLocal(); mountGlobes();
  (async function init() {
    try {
      await buildHook(); await buildCompare(); await buildPunch();
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

  // S5 — US leaves upward, China-wrap slides to centre, 1949 flicks
  function compareTo1949(instant) {
    const us = $('#cmp-us'), cw = $('#cmp-china-wrap'), yt = $('#merge-year');
    us.style.transition = instant ? 'none' : 'opacity .55s ease, transform .7s cubic-bezier(.4,0,.2,1)';
    us.style.opacity = '0'; us.style.transform = 'translateY(-360px)';
    cw.style.transition = instant ? 'none' : 'transform .8s cubic-bezier(.3,.85,.3,1)';
    cw.classList.add('centred');
    if (!instant) { yt.classList.remove('in'); void yt.offsetWidth; }
    yt.classList.add('in');
  }
  // S5 — the 5 China clocks converge to the map centre and merge into one
  function compareMerge(instant) {
    if (!cnBands) return;
    cnBands.host.classList.add('flush');
    cnBands.bands.forEach((b) => b.classList.add('one'));
    cnBands.clocks.forEach((c, i) => {
      if (i === 2) {                       // middle clock survives + grows
        c.setTheme('official'); c.el.style.zIndex = 6;
        c.el.style.transition = instant ? 'none' : 'left .7s cubic-bezier(.3,.9,.3,1), top .7s cubic-bezier(.3,.9,.3,1), transform .8s cubic-bezier(.34,1.35,.5,1)';
        c.el.style.left = '50%'; c.el.style.top = '50%'; c.el.style.transform = 'translate(-50%,-50%) scale(3.2)';
        c.snap(12, 0);
      } else {
        c.el.style.transition = instant ? 'none' : 'left .6s ease, top .6s ease, opacity .5s ease';
        c.el.style.left = '50%'; c.el.style.top = '50%'; c.el.style.opacity = '0';
      }
    });
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

    // S4 — globe zooms out from west China and travels to the USA, then the flat comparison
    [13.4, (i) => enter($('#sc-compare'), 'fade', 500, i, () => {
      const cs = $('#compare-stage'), cg = $('#compare-globe');
      if (i) { cg.classList.add('gone'); cs.classList.add('in'); if (usBands) usBands.showInstant(); return; }
      cs.classList.remove('in'); cg.classList.remove('gone');
      if (!compareGlobeCtrl) { cs.classList.add('in'); if (usBands) usBands.wipeIn({ stagger: 120 }); return; }
      compareGlobeCtrl.resume(); compareGlobeCtrl.reveal();
      setTimeout(() => compareGlobeCtrl.setFocus(38, 262, 2.7), 220);          // zoom out + travel east to the USA
      setTimeout(() => { cg.classList.add('gone'); cs.classList.add('in'); if (usBands) usBands.wipeIn({ stagger: 120 }); setTimeout(() => compareGlobeCtrl && compareGlobeCtrl.halt(), 450); }, 2500);
    })],
    [18.6, (i) => { if (cnBands) (i ? cnBands.showInstant() : cnBands.wipeIn({ stagger: 110 })); }],
    // S5 — continuous: US leaves, China stays & repositions, then the clocks merge
    [20.1, (i) => compareTo1949(i)],
    [24.5, (i) => compareMerge(i)],

    // S6 — globe: Beijing dot → line west → Xinjiang dot
    [29.9, (i) => enter($('#sc-globe6'), 'zoom-out', 1000, i, () => {
      if (!route6Ctrl) return;
      route6Ctrl.resume(); route6Ctrl.reveal();
      if (i) { route6Ctrl.addDot(39.9, 116.4); route6Ctrl.setRoute([[39.9, 116.4], [43.8, 87.6]]); route6Ctrl.revealRoute(1); route6Ctrl.addDot(43.8, 87.6); return; }
      setTimeout(() => route6Ctrl.addDot(39.9, 116.4), 450);          // Beijing
    })],
    [32.2, (i) => { if (!i && route6Ctrl) { route6Ctrl.setRoute([[39.9, 116.4], [43.8, 87.6]]); route6Ctrl.revealRoute(2200); setTimeout(() => route6Ctrl.addDot(43.8, 87.6), 2000); } }],

    // S7 — unofficial local time + real cut-out objects (stays through the "ask the time" line)
    [42.4, (i) => enter($('#sc-local'), 'rise', 1000, i, () => {
      if (route6Ctrl) route6Ctrl.halt();
      const dc = $('#dclocks'); if (dc) dc.classList.add('in');
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

    // S11 — outro
    [65.3, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX  [t, name, vol]  — swoosh only on grid/element motion
  // ============================================================
  const SFX = [
    [3.4, 'swoosh', 0.34],
    [3.55, 'pop', 0.5], [3.78, 'pop', 0.5], [4.0, 'pop', 0.5], [4.22, 'pop', 0.5], [4.44, 'pop', 0.5],   // 5 ghost clocks
    [7.35, 'swoosh', 0.45], [7.7, 'tick', 0.7],                          // clock grows to centre + 北京时间
    [8.5, 'swoosh', 0.5], [9.9, 'swoosh', 0.5],                          // globe scene + dive-in
    [13.4, 'swoosh', 0.5],                                               // zoom to compare
    [20.1, 'swoosh', 0.5], [20.8, 'pop', 0.45],                         // US leaves + 1949 tick
    [24.5, 'swoosh', 0.42], [27.7, 'tick', 0.7],                        // clocks converge + merge snap
    [29.9, 'swoosh', 0.5], [32.3, 'swoosh', 0.4],                       // globe route in + line draws
    [42.4, 'swoosh', 0.5], [45.0, 'tick', 0.6],                         // rise to local + local clock
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
    const cstg = $('#compare-stage'); if (cstg) cstg.classList.remove('in');
    const cglb = $('#compare-globe'); if (cglb) cglb.classList.remove('gone'); if (compareGlobeCtrl) compareGlobeCtrl.halt();
    if (usBands) usBands.bands.forEach((b) => b.classList.remove('in')); if (cnBands) cnBands.bands.forEach((b) => b.classList.remove('in', 'one'));
    if (cnBands) { cnBands.host.classList.remove('flush'); cnBands.clocks.forEach((c, i) => { c.el.style.transition = 'none'; c.el.style.opacity = ''; c.el.style.transform = 'translate(-50%,-50%) scale(.4)'; c.el.style.left = c.el.dataset.ol || ''; c.el.style.top = c.el.dataset.ot || ''; c.el.style.zIndex = ''; c.setTheme('ghost'); c.snap([9, 10, 11, 12, 13][i], 0); c.el.classList.remove('in'); }); }
    const us = $('#cmp-us'), cw = $('#cmp-china-wrap'), yt = $('#merge-year');
    if (us) { us.style.transition = 'none'; us.style.opacity = ''; us.style.transform = ''; }
    if (cw) { cw.style.transition = 'none'; cw.classList.remove('centred'); }
    if (yt) yt.classList.remove('in');
    if (route6Ctrl) route6Ctrl.halt();
    const dcl = $('#dclocks'); if (dcl) dcl.classList.remove('in');
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
