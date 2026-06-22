/* ============================================================
   "5 Chinese words from 5 Chinese cities" — NEW STYLE choreography
   A continuous faux-3D camera over a persistent dynamic grid.
   Everything is driven off the narration's audio.currentTime (cue
   engine) so each beat lands on the spoken word. Reuses the default
   elements: globe, enumeration-with-detail, text-popup, china-map,
   the shared depth-grid + theme/subtitles.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);

  // ---- stage refs ----
  const stage = $('#stage');
  const grid = $('#grid');
  const vo = $('#vo');
  const subsLine = $('#subs-line');

  // fit the 1080×1920 stage into the viewport
  function fit() {
    const s = Math.min(innerWidth / 1080, innerHeight / 1920);
    stage.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();

  // ============================================================
  // DATA
  // ============================================================
  const HOOK = [
    { hanzi: '上海', py: 'Shànghǎi',  learn: '海', mean: 'sea' },
    { hanzi: '北京', py: 'Běijīng',   learn: '北', mean: 'north' },
    { hanzi: '南京', py: 'Nánjīng',   learn: '南', mean: 'south' },
    { hanzi: '青岛', py: 'Qīngdǎo',   learn: '岛', mean: 'island' },
    { hanzi: '香港', py: 'Xiānggǎng', learn: '港', mean: 'harbor' },
  ];

  const CITIES = [
    { id: 'shanghai', en: 'Shanghai', hanzi: '上海', py: 'Shànghǎi', index: 1,
      photo: 'assets/photos/shanghai.png',
      chars: [{ zh: '上', py: 'shàng', mean: 'on' }, { zh: '海', py: 'hǎi', mean: 'sea', learn: true }],
      take: { zh: '海', mean: 'sea' } },
    { id: 'beijing', en: 'Beijing', hanzi: '北京', py: 'Běijīng', index: 2,
      photo: 'assets/photos/beijing.png',
      chars: [{ zh: '北', py: 'běi', mean: 'north', learn: true }, { zh: '京', py: 'jīng', mean: 'capital' }],
      take: { zh: '北', mean: 'north' } },
    { id: 'nanjing', en: 'Nanjing', hanzi: '南京', py: 'Nánjīng', index: 3,
      photo: 'assets/photos/nanjing.png',
      chars: [{ zh: '南', py: 'nán', mean: 'south', learn: true }, { zh: '京', py: 'jīng', mean: 'capital' }],
      take: { zh: '南', mean: 'south' },
      note: '<span class="cjk">北京</span> <b>北</b> north · <span class="cjk">南京</span> <b>南</b> south' },
    { id: 'qingdao', en: 'Qingdao', hanzi: '青岛', py: 'Qīngdǎo', index: 4, bottle: true,
      photo: 'assets/photos/qingdao.png',
      chars: [{ zh: '青', py: 'qīng', mean: 'green' }, { zh: '岛', py: 'dǎo', mean: 'island', learn: true }],
      take: { zh: '岛', mean: 'island' } },
    { id: 'hongkong', en: 'Hong Kong', hanzi: '香港', py: 'Xiānggǎng', index: 5,
      photo: 'assets/photos/hongkong.png',
      chars: [{ zh: '香', py: 'xiāng', mean: 'fragrant' }, { zh: '港', py: 'gǎng', mean: 'harbor', learn: true }],
      take: { zh: '港', mean: 'harbor' } },
  ];

  // a real Tsingtao bottle — Gemini (Imagen 4) photo, cut out with rembg, with a
  // dashed silhouette outline baked on (assets/tsingtao-dashed.png, transparent).
  const TSINGTAO_SVG = `<div class="tsingtao-bottle"><img src="assets/tsingtao-dashed.png" alt="Tsingtao" onerror="this.style.display='none'"></div>`;

  // ============================================================
  // SCENE BUILDERS
  // ============================================================
  HOOK.forEach((h, i) => {
    $('#sc-hook' + i).innerHTML =
      `<div class="hook-inner">
         <div class="hook-city cjk">${h.hanzi}</div>
         <div class="hook-py">${h.py}</div>
         <div class="hook-vocab"><span class="hv-zh cjk">${h.learn}</span> = <span class="hv-mean">${h.mean}</span></div>
       </div>`;
  });

  CITIES.forEach((c) => {
    const scene = $('#sc-' + c.id);
    scene.innerHTML =
      `<div class="card" id="card-${c.id}">
         <div class="card-index"><b>${c.index}</b> / 5</div>
         <div class="card-photo">
           <img src="${c.photo}" alt="" onerror="this.style.display='none'">
           <div class="card-photo-cap"><div class="zh cjk">${c.hanzi}</div><div class="py">${c.py}</div></div>
         </div>
         <div class="card-split">
           ${c.chars.map((ch) => `
             <div class="char ${ch.learn ? 'learn' : ''}">
               <div class="char-zh">${ch.zh}</div>
               <div class="char-py">${ch.py}</div>
               <div class="char-mean">${ch.mean}</div>
             </div>`).join('')}
         </div>
         <div class="card-takeaway"><span class="ta-zh cjk">${c.take.zh}</span> = <span class="ta-mean">${c.take.mean}</span></div>
         ${c.note ? `<div class="card-note">${c.note}</div>` : ''}
         ${c.bottle ? TSINGTAO_SVG : ''}
       </div>`;
  });

  // compass (no spoken-text headings — the rose + needle illustrate it)
  $('#sc-compass').innerHTML =
    `<div class="cmp-wrap" id="cmp-wrap">
       <div class="cmp-rose">
         <div class="cmp-needle" id="cmp-needle"></div>
         <div class="cmp-hub"></div>
         <div class="cmp-pt n lit"><div class="zh">北</div><small>north · Běijīng</small></div>
         <div class="cmp-pt s lit"><div class="zh">南</div><small>south · Nánjīng</small></div>
         <div class="cmp-pt w pending" id="cmp-w"><div class="zh">西</div><small>west · Xī'ān</small></div>
         <div class="cmp-pt e pending" id="cmp-e"><div class="zh">东</div><small>east · Guǎngdōng</small></div>
       </div>
     </div>`;

  // CTA — no spoken-text echo; a Practice button (the action) over a fan of
  // exercise-card chips (illustrates "free exercises"). The narration + the
  // outro (stacktags.io) carry the words.
  $('#cta-host').innerHTML =
    `<div class="cta-wrap" id="cta-wrap">
       <div class="cta-cards"><span class="cc l"></span><span class="cc c"></span><span class="cc r"></span></div>
       <div style="position:relative;display:inline-block;">
         <div class="cta-ring"></div>
         <div class="cta-btn">Practice <span class="arr">→</span></div>
         <div class="cta-finger">👆</div>
       </div>
     </div>`;

  // OUTRO endcard — updated default element (makeStacktagsLogo + .ec layout).
  // Lands on the narration's closing "…on stacktags.io".
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 620 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // ============================================================
  // COMPONENT MOUNTS (default elements)
  // ============================================================
  // enumeration → in-detail follow-up
  let enumEl = null;
  try {
    enumEl = new StacktagsEnumerationDetail($('#enum-host'), {
      items: CITIES.map((c) => ({ label: c.en, sub: `${c.take.zh} · ${c.take.mean}` })),
    });
    // drop the real skyline photos into the morphing tiles
    enumEl.tiles.forEach((tile, i) => {
      const top = tile.querySelector('.se2-tile-top');
      if (!top) return;
      top.style.backgroundImage = `url(${CITIES[i].photo})`;
      top.style.backgroundSize = 'cover';
      top.style.backgroundPosition = 'center';
      const sp = top.querySelector('span'); if (sp) sp.remove();
    });
  } catch (e) { /* element missing — fail soft */ }

  // text-popup recap word cloud — popped scattered, then converged to a
  // centred vertical column (= "a vocabulary list") on the "vocabulary" beat.
  const RECAP_WORDS = [
    { text: '海 sea',     x: -250, y: -380, key: true, size: 80 },
    { text: '北 north',   x: 240,  y: -200, size: 80 },
    { text: '南 south',   x: -210, y: -20,  size: 80 },
    { text: '岛 island',  x: 270,  y: 160,  key: true, size: 80 },
    { text: '港 harbor',  x: -250, y: 330,  size: 80 },
    { text: '西 west',    x: 220,  y: 470,  pill: true, size: 60 },
    { text: '东 east',    x: -150, y: 560,  pill: true, size: 60 },
  ];
  let recapPop = null, recapWordEls = [];
  try {
    recapPop = new StacktagsTextPopup($('#sc-recap'), { words: RECAP_WORDS });
    recapWordEls = Array.from($('#sc-recap').querySelectorAll('.stk-pop-word'));
  } catch (e) { /* fail soft */ }

  function setRecapHome() {   // scatter (original positions)
    recapWordEls.forEach((el, i) => {
      el.style.setProperty('--tx', RECAP_WORDS[i].x + 'px');
      el.style.setProperty('--ty', RECAP_WORDS[i].y + 'px');
    });
  }
  function convergeRecap(instant) {   // all to horizontal centre, stacked vertically
    const n = recapWordEls.length;
    recapWordEls.forEach((el, i) => {
      if (instant) el.style.transition = 'none';
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', ((i - (n - 1) / 2) * 132) + 'px');
      el.classList.add('in'); el.classList.remove('behind');
    });
    if (instant) { void $('#sc-recap').offsetWidth; recapWordEls.forEach((el) => { el.style.transition = ''; }); }
  }

  // globe 1 (Shanghai dive at ~20.7s) + globe 2 (Qingdao → Hong Kong at ~84s).
  // Both mount now but stay paused (no render) until needed — software/GPU
  // WebGL is expensive and rendering them the whole clip stretches the capture.
  let globeCtrl = null, globe2Ctrl = null;
  const globeHost = $('#globe-host');
  const globePhoto = $('#globe-photo');
  const globeHost2 = $('#globe-host2');
  const gv2PhotoA = $('#gv2-photoA');
  const gv2PhotoB = $('#gv2-photoB');
  (function mountGlobe1() {
    if (!(window.THREE && window.earcut && window.topojson)) { setTimeout(mountGlobe1, 80); return; }
    try {
      window.mountStacktagsGlobe(globeHost, {
        focus: { lat: 30, lon: 118, cam: 3.0 },
        startCam: 3.6,
        highlight: 'China',
        marker: { lat: 31.23, lon: 121.47 },   // Shanghai
        autoReveal: false,
        onReady: (c) => { globeCtrl = c; c.pause(); },
      });
    } catch (e) { /* fail soft */ }
  })();
  // globe 2 = the default "zoom-out → dive-in" element. Mounted lazily (~95s),
  // just before its move, so only ONE WebGL context is live at a time.
  function mountGlobe2() {
    if (globe2Ctrl || !(window.THREE && window.earcut && window.topojson) || !window.mountStacktagsGlobeV2) return;
    try {
      window.mountStacktagsGlobeV2(globeHost2, {
        highlight: 'China',
        markers: [{ lat: 36.07, lon: 120.38 }, { lat: 22.30, lon: 114.17 }],   // Qingdao → Hong Kong
        closeCam: 1.05,
        overviewCam: 2.6,
        onReady: (c) => { globe2Ctrl = c; },
      });
    } catch (e) { /* fail soft */ }
  }

  // china-map silhouette behind the payoff line
  let cnMap = null;
  (function mountMap() {
    if (!window.mountChinaMap || !window.topojson) { setTimeout(mountMap, 80); return; }
    window.mountChinaMap($('#payoff-map'), { width: 820, height: 900, pad: 120 })
      .then((m) => { cnMap = m; m.line.style.opacity = '0'; m.fill.style.opacity = '0'; })
      .catch(() => {});
  })();

  // ============================================================
  // GRID CAMERA (persistent, always subtly moving)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 };    // target
  const gdisp = { s: 1, x: 0, y: 0 };   // displayed (follows gcam)
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
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
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1);   // keep the kicked scale
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

  // ---- in-scene helpers ----
  function lightCity(id) {
    const card = $('#card-' + id);
    if (!card) return;
    card.querySelectorAll('.char').forEach((ch) => {
      if (ch.classList.contains('learn')) ch.classList.add('lit'); else ch.classList.add('dim');
    });
    card.classList.add('reveal');
  }
  function noteCity(id) { const c = $('#card-' + id); if (c) c.classList.add('note-in'); }

  // rotate the compass needle to point at a direction (0=N, -90=W/西, 90=E/东)
  function setNeedle(deg, instant) {
    const n = $('#cmp-needle'); if (!n) return;
    if (instant) n.style.transition = 'none';
    n.style.transform = 'rotate(' + deg + 'deg)';
    if (instant) { void n.offsetWidth; n.style.transition = ''; }
  }

  // PAYOFF illustration — pin the 5 learned characters on the China map at their
  // real city locations (a "map you can read"). No spoken-text echo.
  const PAYOFF_PINS = [
    [31.23, 121.47, '海'], [39.90, 116.40, '北'], [32.06, 118.80, '南'],
    [36.07, 120.38, '岛'], [22.30, 114.17, '港'],
  ];
  function buildPayoffPins(instant) {
    const host = $('#payoff-map'); if (!host || !cnMap) return;
    host.querySelectorAll('.payoff-pin').forEach((p) => p.remove());
    // the 5 cities cluster on the east coast — show clean small red dots
    // (no glyphs, which would overlap); the meanings live in the hook + recap.
    PAYOFF_PINS.forEach(([lat, lon], k) => {
      const pos = cnMap.project(lat, lon);
      const pin = document.createElement('div');
      pin.className = 'payoff-pin';
      pin.style.left = pos.x + 'px';
      pin.style.top = pos.y + 'px';
      host.appendChild(pin);
      if (instant) pin.classList.add('in');
      else setTimeout(() => pin.classList.add('in'), 450 + k * 380);
    });
  }

  // ============================================================
  // SUBTITLES (mirror the narration, one short line at a time)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 140);
  }
  // Subtitles are PINYIN only (no hanzi — the cards carry the characters), each
  // city named ONCE, and every clause complete (nothing clipped).
  const SUBS = [
    [0.0,  'Shanghai means “on the <b>sea</b>.”'],
    [2.50, 'Beijing — “<b>northern</b> capital.”'],
    [4.78, 'Nanjing — “<b>southern</b> capital.”'],
    [7.02, 'Qingdao — “green <b>island</b>.”'],
    [8.84, 'And Hong Kong? “Fragrant <b>harbor</b>.”'],
    [11.02,'Chinese city names aren’t random sounds —'],
    [13.6, 'every one is a tiny <b>description</b>.'],
    [15.5, 'A map you can actually <b>read</b>.'],
    [17.06,'Learn five characters from five cities —'],
    [19.7, 'you’ll never read a map the same way.'],
    [21.88,'We start on the coast — Shànghǎi.'],
    [23.94,'shàng means “on,” hǎi means “<b>sea</b>.”'],
    [27.7, 'Literally “on the sea” — at the edge of the Pacific.'],
    [32.92,'First character: hǎi, “<b>sea</b>.”'],
    [35.54,'Now head north — Běijīng, the capital.'],
    [38.66,'jīng means “capital,” běi means “<b>north</b>.”'],
    [42.5, 'The “northern capital” — which begs a question…'],
    [46.86,'If there’s a northern capital, there’s a southern one — Nánjīng.'],
    [49.76,'nán means “<b>south</b>,” and jīng is the same “capital.”'],
    [56.66,'Two cities, one character apart.'],
    [59.10,'North and south — let’s finish the compass.'],
    [61.66,'Xī’ān sits west — xī means “<b>west</b>.”'],
    [63.66,'Guǎngdōng — guǎng “wide,” dōng means “<b>east</b>.”'],
    [71.62,'North, south, west, east — straight off the map.'],
    [74.96,'Now back to the coast — Qingdao.'],
    [77.26,'qīng means “green,” dǎo means “<b>island</b>.”'],
    [82.0, 'A century ago — a German colony,'],
    [85.0, 'home of Tsingtao, China’s most famous beer.'],
    [88.54,'Down the coast — to the last one.'],
    [91.08,'You know it as Hong Kong —'],
    [94.0, 'its Chinese name, Xiānggǎng, is no accident:'],
    [97.0, 'xiāng means “fragrant,” gǎng means “<b>harbor</b>.”'],
    [100.5,'The “fragrant harbor” — named for the scented wood.'],
    [104.58,'Five cities: sea, north, south, island, harbor —'],
    [109.16,'plus <b>west</b> and <b>east</b>, for free.'],
    [113.04,'The names you half-know are already teaching you the language.'],
    [117.52,'A map isn’t just a map — it’s a <b>vocabulary list</b>.'],
    [119.28,'Wanna actually start learning Chinese?'],
    [121.54,'Discover thousands of free exercises and more learning content'],
    [124.10,'on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    // ---- HOOK (Beijing drops from top, Nanjing rises from below) ----
    [0.0,  (i) => enter($('#sc-hook0'), 'fade', 650, i)],
    [2.50, (i) => enter($('#sc-hook1'), 'drop', 700, i)],
    [4.78, (i) => enter($('#sc-hook2'), 'rise', 700, i)],
    [7.02, (i) => enter($('#sc-hook3'), 'pan-right', 700, i)],
    [8.84, (i) => enter($('#sc-hook4'), 'zoom-out', 700, i)],

    // ---- PAYOFF — the China map with the 5 characters pinned (a readable map) ----
    [11.02, (i) => enter($('#sc-payoff'), 'zoom-out', 1150, i, () => {
      if (cnMap) { i ? cnMap.showInstant() : cnMap.drawIn(1300); }
      buildPayoffPins(i);
    })],

    // ---- ENUMERATION (5 cities list → fold into the Stacktags stack) ----
    [17.06, (i) => {
      enter($('#sc-enum'), 'lift', 1000, i);
      if (!enumEl) return;
      if (i) { enumEl.revealAll({ stagger: 0 }); enumEl.collapseToLogo({ delay: 0 }); return; }
      enumEl.reset();
      enumEl.revealAll({ stagger: 260 });
      setTimeout(() => enumEl.collapseToLogo({ delay: 0 }), 2400);
      setTimeout(() => { if (globeCtrl) globeCtrl.resume(); }, 3800);   // wake globe ~20.8s, before its dive
    }],

    // ---- GLOBE → SHANGHAI photo handoff ----
    [21.88, (i) => enter($('#sc-globe'), 'zoom-out', 1100, i, () => {
      if (i) { globeHost.classList.add('gone'); globePhoto.classList.add('in'); return; }
      setTimeout(() => {
        if (!globeCtrl) { globeHost.classList.add('gone'); globePhoto.classList.add('in'); return; }
        globeCtrl.resume();
        globeCtrl.reveal();
        globeCtrl.zoomToMarker(
          { lat: 31.23, lon: 121.47, cam: 1.02, duration: 1500 },
          { onArrive: () => {
              globeHost.classList.add('gone'); globePhoto.classList.add('in');
              setTimeout(() => globeCtrl && globeCtrl.dispose(), 350);
          } }
        );
      }, 220);
    })],

    // ---- SHANGHAI ----
    [24.0, (i) => enter($('#sc-shanghai'), 'zoom-in', 1100, i, () => { if (i) lightCity('shanghai'); })],
    [26.0, () => lightCity('shanghai')],

    // ---- BEIJING (drops in from the TOP) ----
    [35.54, (i) => enter($('#sc-beijing'), 'drop', 1050, i, () => { if (i) lightCity('beijing'); })],
    [41.0,  () => lightCity('beijing')],

    // ---- NANJING (rises in from BELOW) ----
    [46.86, (i) => enter($('#sc-nanjing'), 'rise', 1050, i, () => { if (i) { lightCity('nanjing'); noteCity('nanjing'); } })],
    [51.0,  () => lightCity('nanjing')],
    [53.0,  () => noteCity('nanjing')],

    // ---- COMPASS (needle points at each direction as it's named) ----
    [59.10, (i) => enter($('#sc-compass'), 'zoom-out', 1100, i, () => {
      setNeedle(0, i);
      if (i) {
        $('#cmp-w').classList.remove('pending'); $('#cmp-w').classList.add('lit');
        $('#cmp-e').classList.remove('pending'); $('#cmp-e').classList.add('lit');
        setNeedle(90, true);
      }
    })],
    // Xī'ān (west) → needle swings LEFT to 西 — right as "Xī'ān" is named (61.94)
    [62.0, () => { const w = $('#cmp-w'); w.classList.remove('pending'); w.classList.add('lit', 'pop'); setNeedle(-90); }],
    // Guǎngdōng (east) → needle swings RIGHT to 东 — right as "Guǎngdōng" is named (65.50)
    [65.5, () => { const e2 = $('#cmp-e'); e2.classList.remove('pending'); e2.classList.add('lit', 'pop'); setNeedle(90); }],

    // ---- QINGDAO (real Tsingtao bottle flies in from the left) ----
    [74.96, (i) => enter($('#sc-qingdao'), 'pan-right', 1050, i, () => { if (i) { lightCity('qingdao'); $('#card-qingdao').classList.add('bottle-in'); } })],
    [80.0,  () => lightCity('qingdao')],
    [84.5,  () => $('#card-qingdao').classList.add('bottle-in')],   // Tsingtao bottle flies in (when "Tsingtao" is said)
    [86.5,  (i) => { if (!i) mountGlobe2(); }],   // pre-warm the 2nd globe

    // ---- QINGDAO → HONG KONG (default zoom-out → dive-in element) ----
    [88.54, (i) => {
      enter($('#sc-globe2'), 'fade', 700, i);
      const burst = () => { globeHost2.classList.add('gone'); gv2PhotoB.classList.add('in'); };
      if (i) { gv2PhotoA.classList.add('out'); burst(); return; }
      // Qingdao photo shrinks back into its dot, then one continuous out→across→dive-in arc to Hong Kong
      setTimeout(() => gv2PhotoA.classList.add('out'), 180);
      setTimeout(() => {
        if (!globe2Ctrl) { burst(); return; }
        globe2Ctrl.outIn(
          { total: 2500 },
          { onArrive: () => { burst(); setTimeout(() => globe2Ctrl && globe2Ctrl.stop(), 350); } }
        );
      }, 1000);
    }],

    // ---- HONG KONG card ----
    [93.0, (i) => enter($('#sc-hongkong'), 'zoom-in', 1050, i, () => { if (i) lightCity('hongkong'); })],
    [100.0,  () => lightCity('hongkong')],

    // ---- RECAP (text-popup word cloud) ----
    [104.58, (i) => enter($('#sc-recap'), 'zoom-out', 1150, i, () => {
      if (!recapPop) return;
      if (i) { recapPop.showAll(); return; }
      recapPop.reset(); setRecapHome();
      const times = [700, 1200, 1700, 2200, 2700, 4580, 5200];   // sea,north,south,island,harbor,west,east
      times.forEach((ms, idx) => setTimeout(() => recapPop.pop(idx), ms));
    })],

    // ---- VOCAB: the popped words slide to centre, stacking into a list ----
    [117.52, (i) => convergeRecap(i)],

    // ---- OUTRO endcard straight after the list (lands on "…on stacktags.io") ----
    [119.5, (i) => { enter($('#sc-follow'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — declared sound bed (the default elements' swoosh/pop, mapped onto
  // THIS video's real beats). Single source of truth: the render pipeline reads
  // window.SFX and overlays each sound on the narration with ffmpeg (Playwright
  // headless can't record Web Audio), and a real browser plays them live below.
  // [t = narration seconds, sound ∈ {swoosh,pop}, vol 0..1]
  // ============================================================
  const SFX = [
    // hook — four quick depth cuts
    [2.50, 'swoosh', 0.40], [4.78, 'swoosh', 0.40], [7.02, 'swoosh', 0.40], [8.84, 'swoosh', 0.40],
    [11.02, 'swoosh', 0.50],                                       // payoff map zoom-out
    [17.06, 'swoosh', 0.50], [19.50, 'swoosh', 0.40],              // enumeration lift + fold into the stack
    [21.88, 'swoosh', 0.50], [23.60, 'swoosh', 0.48],              // globe zoom-out + Shanghai photo burst
    [35.54, 'swoosh', 0.50],                                       // Beijing drops in
    [46.86, 'swoosh', 0.50],                                       // Nanjing rises in
    [59.10, 'swoosh', 0.50], [62.00, 'swoosh', 0.34], [65.50, 'swoosh', 0.34],  // compass + the two needle swings
    [74.96, 'swoosh', 0.50], [84.50, 'swoosh', 0.50],              // Qingdao pan + Tsingtao bottle fly-in
    [89.70, 'swoosh', 0.48], [92.10, 'swoosh', 0.50],              // Qingdao→Hong Kong globe pull-back + dive burst
    [104.58, 'swoosh', 0.50],                                      // recap scene
    // the 7 recap words popping in (sea, north, south, island, harbor, west, east)
    [106.43, 'pop', 0.55], [106.93, 'pop', 0.55], [107.43, 'pop', 0.55], [107.93, 'pop', 0.55],
    [108.43, 'pop', 0.55], [110.31, 'pop', 0.55], [110.93, 'pop', 0.55],
    [117.52, 'swoosh', 0.45],                                      // words converge into the vocabulary list
    [119.62, 'swoosh', 0.60],                                      // outro endcard assembles
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav' };
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
    if (enumEl) enumEl.reset();
    globeHost.classList.remove('gone'); globePhoto.classList.remove('in');
    globeHost2.classList.remove('gone');
    if (gv2PhotoA) gv2PhotoA.classList.remove('out');
    if (gv2PhotoB) gv2PhotoB.classList.remove('in');
    document.querySelectorAll('.char').forEach((c) => c.classList.remove('lit', 'dim'));
    document.querySelectorAll('.card').forEach((c) => c.classList.remove('reveal', 'note-in', 'bottle-in'));
    const w = $('#cmp-w'), e2 = $('#cmp-e');
    if (w) { w.classList.add('pending'); w.classList.remove('lit', 'pop'); }
    if (e2) { e2.classList.add('pending'); e2.classList.remove('lit', 'pop'); }
    setNeedle(0, true);
    if ($('#cta-wrap')) $('#cta-wrap').classList.remove('btn-in', 'tap');
    outroReset();
    if (recapPop) recapPop.reset();
    setRecapHome();
    if (cnMap) { cnMap.line.style.opacity = '0'; cnMap.fill.style.opacity = '0'; }
    const pm = $('#payoff-map'); if (pm) pm.querySelectorAll('.payoff-pin').forEach((p) => p.remove());
    subsLine.classList.remove('in');
  }

  function applyUpTo(t) {
    hardReset();
    SUBS.forEach((s, k) => { if (s[0] <= t) { firedSub.add(k); setSub(s[1], true); } });
    CUES.forEach((c, k) => { if (c[0] <= t) { firedScene.add(k); c[1](true); } });
    SFX.forEach((s, k) => { if (s[0] <= t) firedSfx.add(k); });   // mark past sounds as played (don't replay on seek)
  }

  function tick() {
    requestAnimationFrame(tick);
    const t = vo.currentTime || 0;

    // grid follow + render (always moving = dynamic grid)
    gdisp.s += (gcam.s - gdisp.s) * 0.07;
    gdisp.x += (gcam.x - gdisp.x) * 0.07;
    gdisp.y += (gcam.y - gdisp.y) * 0.07;
    applyGrid();

    if (!vo.paused) {
      // backward seek → re-render end-states instantly
      if (t < lastT - 0.3) applyUpTo(t);
      for (let k = 0; k < SUBS.length; k++) if (!firedSub.has(k) && t >= SUBS[k][0]) { firedSub.add(k); setSub(SUBS[k][1], false); }
      for (let k = 0; k < CUES.length; k++) if (!firedScene.has(k) && t >= CUES[k][0]) { firedScene.add(k); CUES[k][1](false); }
      for (let k = 0; k < SFX.length; k++) if (!firedSfx.has(k) && t >= SFX[k][0]) { firedSfx.add(k); playSfx(SFX[k]); }
    }
    lastT = t;

    // HUD
    const seek = $('#seek'), tcode = $('#tcode');
    if (seek && document.activeElement !== seek) seek.value = t;
    if (tcode) tcode.textContent = t.toFixed(1);
  }
  requestAnimationFrame(tick);

  // ============================================================
  // PLAYBACK CONTROL
  // ============================================================
  function play() {
    hardReset();
    vo.currentTime = 0;
    lastT = 0;
    vo.play().catch(() => {});
  }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };

  // HUD wiring
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); }
    if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean');
  });

  // start at a clean reset
  hardReset();
})();
