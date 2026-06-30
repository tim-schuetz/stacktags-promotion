/* ============================================================
   "The chopstick mistake that means death in China" — choreography.
   Reuses the reference engine (persistent grid camera + faux-3D depth
   transitions + an audio.currentTime cue engine + verbatim subtitles +
   a declared SFX bed). ONE hero bowl carries the whole story; the censer
   is its visual rhyme, grounded by a real (desaturated) memorial photo that
   rises at the bottom during the rhyme. Ends on the upright chopsticks at
   "which is exactly why" — NO outro — so a YouTube replay loops cleanly.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);

  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // scene parts
  const tableInner = $('#table-inner');
  const bowlGroup = $('#bowl-group'), sticks = $('#sticks');
  const rhymeSide = $('#rhyme-side'), smokeBowl = $('#smoke-bowl');
  const smokeCenser = rhymeSide.querySelector('.smoke-censer');
  const vocabK = $('#vocab-kuaizi');
  const ghostInner = $('#ghost-inner'), vocabG = $('#vocab-guiyue');

  // the dotted connector between the two upright groups (rhyme layout coords)
  $('#rhyme-path').setAttribute('d', 'M340 604 Q545 552 732 582');

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
  function gridPush() { gcam.s = 1.16; clearTimeout(pushTimer); pushTimer = setTimeout(() => { gcam.s = 1; }, 950); }

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
  const cls = (el, name, on) => el.classList.toggle(name, !!on);
  function setSticks(state) { sticks.className = 'sticks' + (state ? ' ' + state : ''); }
  function rhymeOn(on) {
    cls(tableInner, 'rhyme', on);
    cls(smokeCenser, 'on', on);
    gcam.x = on ? 70 : 0;            // small camera pan justifies the swoosh
  }
  function tableHook() {            // bowl present, sticks not yet
    rhymeOn(false); cls(tableInner, 'funeral', false); cls(smokeBowl, 'on', false);
  }
  function tablePunch() {           // bare: centered bowl + flat sticks (calm beat)
    rhymeOn(false); cls(tableInner, 'funeral', false);
    cls(smokeBowl, 'on', false);
    cls(vocabK, 'in', false); setSticks('flat');
  }

  // ============================================================
  // SUBTITLES (verbatim, grey; key words turquoise)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 120);
  }
  const SUBS = [
    [0.0,   'There’s one thing you must <b>never</b> do'],
    [1.42,  'with chopsticks in China:'],
    [2.94,  'stand them <b>straight up</b> in your bowl of rice.'],
    [4.92,  'Do it, and you’ve just set a place…'],
    [6.36,  '…for the <b>dead</b>.'],
    [7.62,  'It’s one of the deepest dining <b>taboos</b>'],
    [9.16,  'in Chinese culture.'],
    [10.56, 'And the reason is what it <b>resembles</b>.'],
    [12.56, 'At funerals and ancestor rituals,'],
    [14.52, 'a bowl of rice with <b>incense</b> —'],
    [15.96, 'or chopsticks — standing straight up'],
    [17.7,  'is offered to the <b>deceased</b>.'],
    [19.18, 'It’s a gift for the dead.'],
    [20.58, 'So at a normal dinner,'],
    [21.84, 'chopsticks jammed upright'],
    [22.78, 'look exactly like a <b>death offering</b>.'],
    [24.58, 'It’s read as an <b>omen</b> —'],
    [25.74, 'almost like inviting death to the table.'],
    [27.34, 'Instead, you lay your chopsticks <b>flat</b> —'],
    [29.72, 'across the top of the bowl, or on a little rest.'],
    [32.82, 'Tiny gesture, <b>completely different</b> meaning.'],
    [35.06, 'And these death-related taboos'],
    [36.42, 'get taken even more seriously'],
    [37.84, 'during the seventh lunar month —'],
    [39.8,  '<b>“Ghost Month”</b> —'],
    [40.52, 'when spirits are said to <b>roam</b>,'],
    [41.68, 'and people avoid anything'],
    [42.96, 'that might invite <b>bad luck</b>.'],
    [44.6,  'It’s just two sticks and a bowl of rice.'],
    [46.8,  'But <b>stand them up</b>,'],
    [47.86, 'and you’ve turned dinner into a <b>funeral</b> —'],
    [49.36, 'which is exactly <b>why</b>'],
  ];

  // ============================================================
  // CUES
  // ============================================================
  const CUES = [
    // ---- HOOK ----
    [0.0,   (i) => enter($('#sc-table'), 'fade', 600, i, tableHook)],
    [3.26,  () => setSticks('up')],                                 // chopsticks slam upright ("straight up")
    [3.9,   () => cls(vocabK, 'in', true)],                         // 筷子 pops
    [6.36,  () => { cls(vocabK, 'in', false); cls(smokeBowl, 'on', true); gridPush(); }],  // "for the dead": smoke + ominous push

    // ---- WHY IT'S TABOO — the rhyme + the real funeral backdrop ----
    [11.0,  () => { rhymeOn(true); cls(smokeBowl, 'on', true); }],  // censer slides in ("what it resembles")
    [12.56, () => cls(tableInner, 'funeral', true)],               // real memorial photo rises at the bottom; bowls slide up
    [24.58, () => { rhymeOn(false); cls(tableInner, 'funeral', false); cls(smokeBowl, 'on', true); }],  // omen: censer + backdrop leave

    // ---- THE FIX ----
    [28.3,  () => { setSticks('flat'); cls(smokeBowl, 'on', false); }],

    // ---- GHOST MONTH ----
    [37.18, (i) => enter($('#sc-ghost'), 'zoom-out', 1050, i, () => { cls(ghostInner, 'night', true); cls(ghostInner, 'lit', true); })],
    [39.8,  () => cls(vocabG, 'in', true)],                         // 鬼月 pops

    // ---- PUNCHLINE / LOOP (ends on the upright chopsticks — no outro) ----
    [44.6,  (i) => enter($('#sc-table'), 'zoom-in', 1000, i, tablePunch)],
    [46.96, () => { setSticks('up'); cls(smokeBowl, 'on', true); }],  // "stand them up"
  ];

  // ============================================================
  // SFX — swoosh only when the grid moves / a scene transition plays;
  // pop for object & word pop-ins. [t, name, vol]
  // ============================================================
  const SFX = [
    [3.26,  'pop', 0.5],                     // chopsticks slam
    [3.9,   'pop', 0.5],                     // 筷子 pops
    [6.36,  'swoosh', 0.42],                 // ominous camera push ("for the dead")
    [11.0,  'swoosh', 0.48],                 // censer slides into the rhyme (grid pans)
    [12.56, 'swoosh', 0.4],                  // funeral backdrop rises + bowls slide up
    [24.58, 'swoosh', 0.42],                 // censer + backdrop leave
    [37.18, 'swoosh', 0.5],                  // zoom-out to Ghost Month
    [39.8,  'pop', 0.5],                     // 鬼月 pops
    [44.6,  'swoosh', 0.5],                  // zoom back in to the bowl
    [46.96, 'pop', 0.45],                    // chopsticks snap up
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
    setSticks('');
    cls(tableInner, 'rhyme', false); cls(tableInner, 'funeral', false);
    cls(smokeBowl, 'on', false); cls(smokeCenser, 'on', false);
    cls(vocabK, 'in', false); cls(vocabG, 'in', false);
    cls(ghostInner, 'night', false); cls(ghostInner, 'lit', false);
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
