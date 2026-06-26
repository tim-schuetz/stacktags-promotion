/* ============================================================
   "This Chinese dialect uses a Russian alphabet" (Dungan) — choreography.
   A continuous faux-3D camera over a persistent dynamic grid, driven off the
   narration's audio.currentTime (cue engine). Authentic Dungan Cyrillic
   throughout (researched, not invented). Reuses the globe, text-popup, outro
   default elements + the shared grid/theme/subtitles.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');

  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // ============================================================
  // SCENE BUILDERS (authentic Dungan content)
  // ============================================================
  // HOOK: staged vocab reveal — 再見 (hanzi) → zàijiàn (pinyin) → зэ җян (the
  // real Dungan spelling). Same word, shown in three layers.
  $('#sc-hook').innerHTML =
    `<div class="hook-wrap">
       <div class="hk-han cjk" id="hk-han">再見</div>
       <div class="hk-py" id="hk-py">zàijiàn &middot; <b>goodbye</b></div>
       <div class="hk-cyr" id="hk-cyr">зэ җян</div>
     </div>`;

  // TWIST: a wall of hanzi fades away → a complete authentic Dungan sentence in
  // Cyrillic builds in. Special Dungan-only letters (ә җ ң ў ү) glow turquoise.
  const SX = new Set(['ә', 'җ', 'ң', 'ў', 'ү']);
  const DUNGAN = 'Та до җи сангә нүзыҗи җянили.';
  const dlSpans = [...DUNGAN].map((c) =>
    c === ' ' ? '<span class="dl">&nbsp;</span>'
              : `<span class="dl${SX.has(c.toLowerCase()) ? ' sx' : ''}">${c}</span>`).join('');
  const WALL = ['语', '言', '文', '字', '汉', '话', '说', '写', '中', '国', '声', '音', '词', '句', '读', '书'];
  $('#sc-twist').innerHTML =
    `<div class="twist-wrap">
       <div class="hanzi-wall" id="hanzi-wall">${WALL.map((c) => `<span class="hw-char cjk">${c}</span>`).join('')}</div>
       <div class="dungan-line cjk" id="dungan-line" style="font-family:var(--stk-font)">${dlSpans}</div>
       <div class="dungan-gloss" id="dungan-gloss">“he came to the third daughter’s house” — in <b>letters</b></div>
     </div>`;

  // HOMOPHONE: the classic objection (妈/马/骂 all sound like "ma") → the proof
  // (Dungan marks the tone with a letter: ма / маъ / маь).
  const HOMO = [
    { zh: '妈', py: 'mā', cyr: 'ма', en: 'mother' },
    { zh: '马', py: 'mǎ', cyr: 'ма<b>ъ</b>', en: 'horse' },
    { zh: '骂', py: 'mà', cyr: 'ма<b>ь</b>', en: 'scold' },
  ];
  $('#sc-homophone').innerHTML =
    `<div class="homo-wrap" id="homo-wrap">
       <div class="homo-row">
         ${HOMO.map((h) => `<div class="homo-item">
            <div class="hi-zh">${h.zh}</div>
            <div class="hi-py">${h.py}</div>
            <div class="hi-cyr">${h.cyr}</div>
            <div class="hi-en">${h.en}</div>
          </div>`).join('')}
       </div>
       <div class="homo-note" id="homo-note"><span class="q">same sound — </span><span class="a">the letter marks the tone</span></div>
     </div>`;

  // BIGGER IDEA: one spoken language → two writing systems (汉字 / Кириллица).
  $('#sc-idea').innerHTML =
    `<div class="idea-wrap" id="idea-wrap">
       <div class="idea-source">
         <div class="idea-wave" id="idea-wave"></div>
         <div class="idea-src-label">one spoken <span class="cjk">中文</span></div>
       </div>
       <div class="idea-branch">
         <svg viewBox="0 0 560 150"><path d="M280 6 V44 M280 44 C280 90 120 70 120 140 M280 44 C280 90 440 70 440 140"/></svg>
       </div>
       <div class="idea-split">
         <div class="idea-out left"><span class="cjk">汉字</span><span class="lab">characters</span></div>
         <div class="idea-out right">Кириллица<span class="lab">letters</span></div>
       </div>
     </div>`;
  // soundwave bars
  (function () {
    const w = $('#idea-wave'); if (!w) return;
    const H = [42, 70, 96, 64, 110, 50, 84, 60, 38];
    w.innerHTML = H.map((h, i) => `<i style="height:${h}px;animation-delay:${(i * 0.09).toFixed(2)}s"></i>`).join('');
  })();

  // PUNCHLINE: the Cyrillic, glowing (callback to the hook).
  $('#sc-punch').innerHTML =
    `<div class="punch-wrap">
       <div class="punch-cyr">зэ җян</div>
       <div class="punch-sub">a kind of <span class="cjk">中文</span> · in кириллица</div>
     </div>`;

  // OUTRO logo (default element)
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 620 });
  function outroAssemble() { const ec = $('#outro-ec'); if (ec) ec.classList.add('play'); }
  function outroReset() { const ec = $('#outro-ec'); if (ec) ec.classList.remove('play'); }

  // ============================================================
  // GLOBE (migration China → Central Asia) — mounted paused, gated on-screen
  // ============================================================
  let globeCtrl = null;
  const globeHost = $('#globe-host'), caravan = $('#caravan');
  // Shaanxi/Gansu → over the Tian Shan → Karakol, Kyrgyzstan
  const ROUTE = [[34.27, 108.95], [36.5, 103.8], [38.5, 98.0], [40.5, 88.0], [42.0, 82.0], [42.49, 78.39]];
  (function mountGlobe() {
    if (!(window.THREE && window.earcut && window.topojson) || !window.mountStacktagsGlobe) { setTimeout(mountGlobe, 80); return; }
    try {
      window.mountStacktagsGlobe(globeHost, {
        focus: { lat: 38, lon: 93, cam: 2.75 },   // zoomed out: the route's east origin is in frame from the start
        startCam: 3.3,
        highlight: 'China',
        marker: { lat: 42.49, lon: 78.39 },     // Karakol (the dive-in endpoint)
        autoReveal: false,
        onReady: (c) => { globeCtrl = c; c.halt(); c.setRoute(ROUTE); c.attachShip(caravan); },
      });
    } catch (e) { /* fail soft */ }
  })();

  // ============================================================
  // GRID CAMERA (persistent, always subtly moving)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const idleS = 1 + Math.sin(t * 0.5) * 0.012;
    const idleX = Math.sin(t * 0.33) * 11, idleY = Math.cos(t * 0.27) * 9;
    const cs = clamp(gdisp.s * idleS, 0.82, 1.5), cell = 120 * cs;
    const px = ((gdisp.x + idleX) % cell + cell) % cell, py = ((gdisp.y + idleY) % cell + cell) % cell;
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
    const gs0 = gcam.s, gx0 = gcam.x, gy0 = gcam.y;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3;
      const t0 = performance.now();
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
      })(performance.now());
      return;
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
  // IN-SCENE HELPERS
  // ============================================================
  function hookAll() { $('#hk-han').classList.add('in'); $('#hk-py').classList.add('in'); $('#hk-cyr').classList.add('in', 'glow'); }

  function peopleIn() { $('#dperson-l').classList.add('in'); $('#dperson-r').classList.add('in'); }

  function showMosque() {
    globeHost.classList.add('gone');
    $('#mosque-photo').classList.add('in'); $('#mosque-cap').classList.add('in');
    $('#mig-origin').classList.remove('in'); caravan.classList.remove('in');
    if (globeCtrl) globeCtrl.halt();
  }

  function twistWallGone(i) { $('#hanzi-wall').classList.add('gone'); }
  function twistLineIn(i) { $('#dungan-line').classList.add('in'); }
  function twistGlossIn(i) { $('#dungan-gloss').classList.add('in'); }

  function homoItemsIn(i) {
    const items = document.querySelectorAll('#homo-wrap .homo-item');
    items.forEach((it, k) => { if (i) it.classList.add('in'); else setTimeout(() => it.classList.add('in'), 120 + k * 230); });
    $('#homo-wrap').classList.add('objection');
  }
  function homoProof(i) { const w = $('#homo-wrap'); w.classList.remove('objection'); w.classList.add('proof'); }

  function ideaIn(i) { $('#idea-wrap').classList.add('in'); }
  function ideaSplit(i) { $('#idea-wrap').classList.add('split'); }

  // ============================================================
  // SUBTITLES (verbatim mirror; grey, key words turquoise)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 140);
  }
  const SUBS = [
    [0.0,  'There’s a form of Chinese with no characters at all —'],
    [3.12, 'in the same alphabet as <b>Russian</b>.'],
    [5.02, 'It’s spoken in Central Asia,'],
    [6.54, 'and it quietly proves something many call <b>impossible</b>.'],
    [10.48,'In the 1800s, a group of Chinese Muslims — the <b>Hui</b> —'],
    [13.90,'fled unrest and migrated west,'],
    [16.00,'settling in what’s now Kyrgyzstan and Kazakhstan.'],
    [18.76,'Their descendants are called the <b>Dungan</b>.'],
    [20.54,'They speak a language descended from <b>Mandarin</b> —'],
    [23.82,'close enough a Mandarin speaker can follow it.'],
    [26.56,'But here’s the twist.'],
    [27.80,'Cut off from China, in the Soviet world,'],
    [30.22,'they stopped using Chinese <b>characters</b> entirely.'],
    [32.84,'Today, Dungan is written in <b>Cyrillic</b> —'],
    [35.18,'letters, just like Russian.'],
    [36.98,'Which matters, because people often say'],
    [38.86,'Chinese can’t be written with an <b>alphabet</b> —'],
    [41.36,'that it needs characters, because too many'],
    [43.14,'words <b>sound alike</b>.'],
    [45.16,'Dungan is living <b>proof</b> that it can.'],
    [47.28,'A complete, working Sinitic language,'],
    [49.94,'written phonetically, with letters.'],
    [51.84,'And that quietly reveals something.'],
    [53.38,'The characters and the language'],
    [54.84,'aren’t the <b>same thing</b>.'],
    [56.58,'The spoken Chinese language could,'],
    [58.50,'in principle, be written in letters —'],
    [60.40,'and the Dungan have done exactly that for generations.'],
    [64.10,'So somewhere in Central Asia, people are'],
    [65.96,'speaking a kind of <b>Chinese</b> —'],
    [67.66,'and writing it in the alphabet of <b>Russian</b>.'],
    [70.02,'A reminder that how a language <b>sounds</b>,'],
    [71.94,'and how we choose to <b>write</b> it down,'],
    [73.66,'aren’t the same thing at all.'],
    [75.18,'Wanna actually start learning Chinese?'],
    [77.08,'Discover thousands of free exercises'],
    [78.72,'and more learning content'],
    [79.94,'on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    // HOOK — 再見 → zàijiàn (pinyin) → зэ җян (Cyrillic), staged
    [0.0,  (i) => enter($('#sc-hook'), 'fade', 650, i, () => { if (i) hookAll(); else $('#hk-han').classList.add('in'); })],
    [1.40, (i) => { if (!i) $('#hk-py').classList.add('in'); }],    // pinyin appears underneath
    [3.20, (i) => { if (!i) $('#hk-cyr').classList.add('in'); }],   // Cyrillic appears ("same alphabet as Russian")
    [4.20, (i) => { if (!i) $('#hk-cyr').classList.add('glow'); }],

    // MIGRATION — pre-warm the globe behind the hook so it's painted on arrival
    [9.1, (i) => { if (!i && globeCtrl) { globeCtrl.resume(); globeCtrl.reveal(); } }],
    // zoomed-OUT globe (route's east origin visible) + dashed route west
    [10.48, (i) => enter($('#sc-migration'), 'zoom-out', 1150, i, () => {
      if (globeCtrl) { globeCtrl.resume(); globeCtrl.reveal(); }
      if (i) { showMosque(); peopleIn(); $('#dbub-l').classList.add('in'); $('#dbub-r').classList.add('in'); }
    })],
    [13.90, (i) => { if (i) return; caravan.classList.add('in'); if (globeCtrl) globeCtrl.revealRoute(3000); }],
    // dive INTO the endpoint (Karakol), then hand off to the mosque
    [17.10, (i) => { if (i) return; if (globeCtrl) globeCtrl.zoomToMarker({ cam: 1.05, duration: 1600 }, { onArrive: showMosque }); else showMosque(); }],
    // two real Dungan people speak — the mosque STAYS behind them
    [20.54, (i) => { if (!i) peopleIn(); }],
    [21.30, (i) => { if (!i) $('#dbub-l').classList.add('in'); }],
    [23.40, (i) => { if (!i) $('#dbub-r').classList.add('in'); }],

    // TWIST — hanzi wall fades → Dungan sentence
    [26.56, (i) => enter($('#sc-twist'), 'zoom-in', 1100, i, () => { if (i) { twistWallGone(i); twistLineIn(i); twistGlossIn(i); } })],
    [30.40, (i) => { if (!i) twistWallGone(i); }],
    [31.90, (i) => { if (!i) twistLineIn(i); }],   // sentence builds in over the breath, before "written in Cyrillic"
    [34.60, (i) => { if (!i) twistGlossIn(i); }],

    // HOMOPHONE — objection → tone-letter proof
    [40.90, (i) => enter($('#sc-homophone'), 'drop', 1050, i, () => homoItemsIn(i))],
    [45.16, (i) => homoProof(i)],

    // BIGGER IDEA — one language → two writing systems
    [51.84, (i) => enter($('#sc-idea'), 'zoom-out', 1150, i, () => { ideaIn(i); if (i) ideaSplit(i); })],
    [54.84, (i) => { if (!i) ideaSplit(i); }],

    // PUNCHLINE — the Cyrillic glowing
    [64.10, (i) => enter($('#sc-punch'), 'rise', 1050, i, () => { if (globeCtrl) globeCtrl.halt(); })],

    // OUTRO — assembles, lands on "…on stacktags.io"
    [75.30, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh only when the grid moves (scene transitions) or a default
  // element animates (globe / outro); pop for words appearing.
  // ============================================================
  const SFX = [
    // hook — зэ җян letters pop in
    [3.25, 'pop', 0.5], [3.5, 'pop', 0.5], [3.8, 'pop', 0.5], [4.05, 'pop', 0.5], [4.3, 'pop', 0.5],
    [10.48, 'swoosh', 0.5],                          // migration scene (grid moves)
    [13.90, 'swoosh', 0.45],                         // route reveals on the globe
    [17.10, 'swoosh', 0.5],                          // globe dives into Karakol (default element)
    [18.7, 'pop', 0.45],                             // mosque settles
    [20.54, 'pop', 0.45],                            // people slide in
    [21.30, 'pop', 0.5], [23.40, 'pop', 0.5],        // two Cyrillic bubbles
    [26.56, 'swoosh', 0.5],                          // twist scene
    [30.40, 'swoosh', 0.45],                         // hanzi wall whooshes away
    [31.90, 'swoosh', 0.45],                         // Dungan sentence builds in
    [40.90, 'swoosh', 0.5],                          // homophone scene (drop)
    [41.3, 'pop', 0.45], [41.6, 'pop', 0.45], [41.9, 'pop', 0.45],  // 妈 马 骂
    [45.5, 'pop', 0.5], [45.8, 'pop', 0.5], [46.1, 'pop', 0.5],     // tone letters reveal
    [51.84, 'swoosh', 0.5],                          // idea scene
    [55.1, 'pop', 0.5], [55.4, 'pop', 0.5],          // two writing-system outputs
    [64.10, 'swoosh', 0.5],                          // punchline scene
    [75.30, 'swoosh', 0.6],                          // outro assembles
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
    // hook
    $('#hk-han').classList.remove('in'); $('#hk-py').classList.remove('in'); $('#hk-cyr').classList.remove('in', 'glow');
    // migration + Dungan people
    globeHost.classList.remove('gone'); $('#mosque-photo').classList.remove('in'); $('#mosque-cap').classList.remove('in'); $('#mig-origin').classList.remove('in'); caravan.classList.remove('in');
    $('#dperson-l').classList.remove('in'); $('#dperson-r').classList.remove('in'); $('#dbub-l').classList.remove('in'); $('#dbub-r').classList.remove('in');
    if (globeCtrl) globeCtrl.halt();
    // twist
    $('#hanzi-wall').classList.remove('gone'); $('#dungan-line').classList.remove('in'); $('#dungan-gloss').classList.remove('in');
    // homophone
    $('#homo-wrap').classList.remove('objection', 'proof'); document.querySelectorAll('#homo-wrap .homo-item').forEach((it) => it.classList.remove('in'));
    // idea
    $('#idea-wrap').classList.remove('in', 'split');
    // outro
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
