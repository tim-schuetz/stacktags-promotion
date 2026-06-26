/* ============================================================
   "In China, every stranger is your uncle" — choreography.
   Reuses the reference engine (persistent grid camera + faux-3D depth
   transitions + an audio.currentTime cue engine + verbatim subtitles +
   a declared SFX bed). Persistent hero = a kinship MAP. Two visual rhymes:
   the three street strangers RETURN in the flip-side, and the SAME word
   叔叔 is both the precise map term and the warm street greeting.
   Camera grammar: zoom-out into the map, zoom back to the strangers,
   lift to the outro.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);

  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // scene parts
  const people = $('#people'), map = $('#map');
  const P = { shop: $('#p-shop'), bus: $('#p-bus'), young: $('#p-young'), old: $('#p-old') };
  const CH = { shop: $('#chip-shop'), bus: $('#chip-bus'), young: $('#chip-young'), old: $('#chip-old') };
  const N = { bobo: $('#n-bobo'), shushu: $('#n-shushu'), gufu: $('#n-gufu'), jiujiu: $('#n-jiujiu'), yifu: $('#n-yifu') };
  const AX = { side: $('#ax-side'), gen: $('#ax-gen'), order: $('#ax-order') };
  const uncP = $('#uncbox-people'), uncM = $('#uncbox-map');

  // outro endcard
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) {
    outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
    outroLogo.querySelectorAll('svg > g').forEach((g) => { if (!g.classList.contains('chev')) g.classList.add('lyr'); });
  }
  function outroAssemble() { $('#outro-ec').classList.add('play'); }
  function outroReset() { $('#outro-ec').classList.remove('play'); }

  window.__ready = true;

  // ============================================================
  // GRID CAMERA (persistent, with gentle idle life)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  let jolt = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const idleS = 1 + Math.sin(t * 0.5) * 0.012, idleX = Math.sin(t * 0.33) * 9, idleY = Math.cos(t * 0.27) * 7;
    const cs = clamp(gdisp.s * idleS, 0.8, 1.6), cell = 120 * cs;
    const px = ((gdisp.x + idleX) % cell + cell) % cell;
    const py = ((gdisp.y + idleY + jolt) % cell + cell) % cell;
    grid.style.backgroundSize = cell + 'px ' + cell + 'px';
    grid.style.backgroundPosition = 'calc(50% + ' + px + 'px) calc(50% + ' + py + 'px)';
    jolt *= 0.82;
  }
  let pushTimer = 0;
  function gridPush() { gcam.s = 1.14; clearTimeout(pushTimer); pushTimer = setTimeout(() => { gcam.s = 1; }, 900); }

  // ============================================================
  // DEPTH SCENE TRANSITIONS (ported from the depth-transitions element)
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
      case 'zoom-out': return { from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 }, to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'pan-left': return { from: { tx: lerp(0, -1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 }, to: { tx: lerp(1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 }, panX: -1180 };
      case 'lift': return null; // handled specially below
      case 'fade': return { from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in': default: return { from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 }, to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current; if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3; const t0 = performance.now(); setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur)), z = lerp(1, 1.3, e), dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: z, op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        gdisp.y = dy * 0.5;
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
        gcam.s = 1; current = toEl; if (onArrive) onArrive();
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
  // in-scene actions (class toggles → CSS transitions)
  // ============================================================
  const cls = (el, name, on) => el && el.classList.toggle(name, !!on);
  const showPerson = (el, on) => cls(el, 'on', on);

  function peopleHook() {                       // hook line-up: shop, bus, neighbor
    cls(people, 'show', true);
    showPerson(P.shop, true); showPerson(P.bus, true); showPerson(P.young, false); showPerson(P.old, true);
    cls(people, 'fused', false); cls(people, 'tree', false);
    ['shop', 'bus', 'young', 'old'].forEach((k) => cls(CH[k], 'in', false));
    cls(uncP, 'in', false);
  }
  function peopleFlip() {                        // flip line-up: older man, young woman, older woman
    cls(people, 'show', true);
    showPerson(P.shop, true); showPerson(P.bus, false); showPerson(P.young, true); showPerson(P.old, true);
    cls(people, 'fused', false); cls(people, 'tree', false);
    ['shop', 'bus', 'young', 'old'].forEach((k) => cls(CH[k], 'in', false));
    cls(uncP, 'in', false);
  }
  function fuse() { cls(people, 'fused', true); cls(uncP, 'in', true); }   // titles → one lazy word
  function treeWrap() { cls(people, 'tree', true); }                       // strangers sketched into the tree

  function mapEnter() {                          // arrive on the map: just the lumped word
    cls(uncM, 'in', true);
    cls(map, 'crowded', false); cls(map, 'opened', false); cls(map, 'neutralx', false); cls(map, 'why', false);
    ['bobo', 'shushu', 'gufu', 'jiujiu', 'yifu'].forEach((k) => cls(N[k], 'lit', false));
    cls(N.shushu, 'pulse', false);
    Object.values(AX).forEach((a) => cls(a, 'in', false));
  }
  function mapCrowd() { cls(map, 'crowded', true); }
  function mapOpen() { cls(map, 'crowded', false); cls(map, 'opened', true); gridPush(); }  // crack open → the tree
  const lite = (k) => cls(N[k], 'lit', true);
  function neutralX() { cls(map, 'neutralx', true); }
  function mapWhy() { cls(map, 'why', true); }
  const axisIn = (k) => cls(AX[k], 'in', true);
  function pulseShushu() { cls(N.shushu, 'pulse', true); }

  // ============================================================
  // SUBTITLES (verbatim, grey; key words turquoise)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 120);
  }
  const SUBS = [
    [0.0, 'In China, the man at the shop,'],
    [1.7, 'the bus driver, your neighbor —'],
    [3.16, 'they’re all your <b>“uncle”</b> or <b>“aunty.”</b>'],
    [5.94, 'But here’s the <b>irony</b>:'],
    [6.84, 'there’s no single Chinese word'],
    [8.02, 'for <b>“uncle”</b> at all.'],
    [9.26, 'There are at least <b>eight</b>.'],
    [10.38, 'Let me explain.'],
    [11.76, 'English has one <b>lazy</b> word — “uncle” —'],
    [13.76, 'for a whole <b>crowd</b> of different people.'],
    [16.12, 'Chinese <b>refuses</b> to be that vague.'],
    [17.92, 'It needs to know exactly who you mean.'],
    [20.0, 'Is he your <b>father’s</b> brother, or your <b>mother’s</b>?'],
    [22.16, 'Is he <b>older</b> than your parent, or <b>younger</b>?'],
    [24.56, 'Is he <b>blood</b>, or <b>married in</b>?'],
    [26.5, 'Every combination is a <b>different word</b>.'],
    [28.86, 'Father’s older brother, father’s younger brother,'],
    [30.94, 'mother’s brother, the husband of your father’s sister —'],
    [34.0, 'all completely <b>separate terms</b>.'],
    [36.32, 'There’s no <b>neutral</b> “uncle” to fall back on.'],
    [38.72, 'The word itself tells you the <b>exact relationship</b>.'],
    [41.24, 'Family structure mattered so much,'],
    [43.28, 'the language <b>baked it right in</b> —'],
    [45.6, 'which side, which generation,'],
    [47.38, 'which order of birth.'],
    [48.58, 'You don’t just say “uncle.”'],
    [50.02, 'You say <b>where he sits</b> in the family.'],
    [52.16, 'And yet —'],
    [53.02, 'Chinese uses these very same family words'],
    [54.92, 'for <b>total strangers</b>.'],
    [56.3, 'You call an older man <b>“uncle,”</b>'],
    [57.84, 'an older woman <b>“aunty,”</b>'],
    [59.32, 'a young woman <b>“big sister”</b> —'],
    [61.12, 'as a sign of <b>warmth and respect</b>.'],
    [63.38, 'Everyone gets <b>slotted into the family</b>.'],
    [65.08, 'So Chinese can’t translate “uncle”'],
    [66.46, 'with a <b>single word</b>.'],
    [67.66, 'It has a whole <b>map</b> of them.'],
    [68.78, 'But it’ll happily call a stranger'],
    [70.16, 'on the street your <b>uncle</b>.'],
    [71.56, 'A language incredibly <b>precise about family</b>…'],
    [73.54, 'that treats the <b>entire world</b> like one.'],
    [76.02, 'Wanna actually start learning <b>Chinese</b>?'],
    [77.9, 'Discover thousands of free exercises'],
    [79.72, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — set scene state, THEN run the depth transition (so the
  // incoming scene already shows the right line-up as it flies in).
  // ============================================================
  const CUES = [
    // ---- HOOK (people) ----
    [0.0, (i) => { peopleHook(); enter($('#sc-people'), 'fade', 600, i); }],
    [1.18, () => cls(CH.shop, 'in', true)],      // shopkeeper → 叔叔
    [1.92, () => cls(CH.bus, 'in', true)],       // bus driver → 叔叔
    [2.6, () => cls(CH.old, 'in', true)],        // neighbor   → 阿姨
    [6.84, () => fuse()],                        // all three titles fuse into one "uncle?"
    [10.38, (i) => { mapEnter(); enter($('#sc-map'), 'zoom-out', 1100, i); }],

    // ---- THE PROBLEM (map) ----
    [12.0, () => mapCrowd()],                    // a whole crowd crammed in one word
    [16.12, () => mapOpen()],                    // it cracks open into the tree
    [28.86, () => lite('bobo')],                 // 伯伯 father's older brother
    [29.88, () => lite('shushu')],               // 叔叔 father's younger brother
    [30.94, () => lite('jiujiu')],               // 舅舅 mother's brother
    [32.12, () => lite('gufu')],                 // 姑父 husband of father's sister
    [36.5, () => neutralX()],                    // no neutral "uncle" in the centre

    // ---- WHY (map) ----
    [41.24, () => mapWhy()],
    [45.6, () => axisIn('side')],                // 哪边 which side
    [46.38, () => axisIn('gen')],                // 哪辈 which generation
    [47.38, () => axisIn('order')],              // 排行 birth order
    [50.38, () => pulseShushu()],                // his exact seat

    // ---- THE FLIP SIDE (people return) ----
    [52.0, (i) => { peopleFlip(); enter($('#sc-people'), 'zoom-in', 1050, i); }],
    [57.0, () => cls(CH.shop, 'in', true)],      // older man   → 叔叔 (same word as the map!)
    [58.2, () => cls(CH.old, 'in', true)],       // older woman → 阿姨
    [59.8, () => cls(CH.young, 'in', true)],     // young woman → 大姐
    [63.38, () => treeWrap()],                   // branches sketch them into the family

    // ---- OUTRO ----
    [76.02, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh only when the grid moves / a scene transition plays;
  // pop for word & node pop-ins. [t, name, vol]
  // ============================================================
  const SFX = [
    [1.18, 'pop', 0.5], [1.92, 'pop', 0.5], [2.6, 'pop', 0.5],
    [6.84, 'pop', 0.55],                        // titles fuse
    [10.38, 'swoosh', 0.5],                     // zoom-out to the map (grid moves)
    [12.0, 'pop', 0.4],                         // crowd appears
    [16.12, 'swoosh', 0.45],                    // crack open (grid push)
    [28.86, 'pop', 0.5], [29.88, 'pop', 0.5], [30.94, 'pop', 0.5], [32.12, 'pop', 0.5],
    [36.5, 'pop', 0.45],                        // neutral ✕
    [45.6, 'pop', 0.32], [46.38, 'pop', 0.32], [47.38, 'pop', 0.32],
    [52.0, 'swoosh', 0.5],                      // zoom back to the strangers (grid moves)
    [57.0, 'pop', 0.5], [58.2, 'pop', 0.5], [59.8, 'pop', 0.5],
    [76.02, 'swoosh', 0.55],                    // outro lift
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
    cls(people, 'show', false); cls(people, 'fused', false); cls(people, 'tree', false);
    ['shop', 'bus', 'young', 'old'].forEach((k) => { showPerson(P[k], false); cls(CH[k], 'in', false); });
    cls(uncP, 'in', false); cls(uncM, 'in', false);
    cls(map, 'crowded', false); cls(map, 'opened', false); cls(map, 'neutralx', false); cls(map, 'why', false);
    ['bobo', 'shushu', 'gufu', 'jiujiu', 'yifu'].forEach((k) => cls(N[k], 'lit', false));
    cls(N.shushu, 'pulse', false);
    Object.values(AX).forEach((a) => cls(a, 'in', false));
    outroReset();
  }
  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    SCENES.forEach((elx) => setPose(elx, { tx: 0, ty: 0, s: 1, op: 0, blur: 0, z: 0 }));
    current = null; gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0; jolt = 0;
    clearTimeout(pushTimer);
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
  // PLAYBACK CONTROL
  // ============================================================
  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });

  hardReset();
})();
