/* ============================================================
   "In China, numbers are a secret language" — choreography (rework 3).
   Phone CHAT for the HOOK only; from "why does that work?" on, the phone
   dissolves and every beat lives on the open white grid (no box). WHY =
   crude stick-figure doodles (death/wealth/lasting) that then get USED
   (speech bubble / gift box). Audio-synced cue engine, verbatim subtitles,
   declared SFX bed (swoosh only when the grid moves). 250 etymology cut.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  const pcam = $('#phone-cam');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) {
    outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
    outroLogo.querySelectorAll('svg > g').forEach((g) => { if (!g.classList.contains('chev')) g.classList.add('lyr'); });
  }

  function buildFlood() {
    const f = $('#flood'); if (!f) return;
    const lefts = [40, 300, 470, 110, 520, 250, 410, 170];
    for (let i = 1; i <= 8; i++) {
      const c = document.createElement('div'); c.className = 'cm c' + i; c.style.left = lefts[i - 1] + 'px';
      c.innerHTML = '<span class="dot"></span>666'; f.appendChild(c);
    }
  }
  buildFlood();

  window.__ready = true;

  // ---- GRID CAMERA ----
  const gcam = { s: 1, x: 0, y: 0 }, gdisp = { s: 1, x: 0, y: 0 };
  let jolt = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const idleS = 1 + Math.sin(t * 0.5) * 0.01, idleX = Math.sin(t * 0.33) * 8, idleY = Math.cos(t * 0.27) * 6;
    const cs = clamp(gdisp.s * idleS, 0.8, 1.6), cell = 120 * cs;
    const px = ((gdisp.x + idleX) % cell + cell) % cell;
    const py = ((gdisp.y + idleY + jolt) % cell + cell) % cell;
    grid.style.backgroundSize = cell + 'px ' + cell + 'px';
    grid.style.backgroundPosition = 'calc(50% + ' + px + 'px) calc(50% + ' + py + 'px)';
    jolt *= 0.82;
  }
  let pushTimer = 0;
  function gridPush() { gcam.s = 1.12; gcam.x += 26; clearTimeout(pushTimer); pushTimer = setTimeout(() => { gcam.s = 1; gcam.x = 0; }, 900); }

  let ppTimer = 0;
  function setPZ(z) { pcam.style.setProperty('--pz', z); }
  function phonePunch() { setPZ(0.955); clearTimeout(ppTimer); ppTimer = setTimeout(() => setPZ(1), 500); }
  setPZ(1);

  // ---- SCENES & GROUPS ----
  function setScene(id) {
    $('#sc-chat').style.opacity = id === 'sc-chat' ? 1 : 0;
    $('#sc-chat').classList.toggle('lift', id !== 'sc-chat');
    $('#sc-outro').style.opacity = id === 'sc-outro' ? 1 : 0;
    $('#sc-outro').classList.toggle('go', id === 'sc-outro');
  }
  let curGrp = null;
  function showGroup(id, instant) {
    const next = $('#' + id);
    if (!instant && curGrp && curGrp !== next) { const c = curGrp; c.classList.add('out'); setTimeout(() => c.classList.remove('out'), 600); }
    $$('.grp').forEach((g) => { if (g !== next) g.classList.remove('on'); });
    next.classList.remove('out'); next.classList.add('on');
    pcam.style.opacity = (id === 'g-hook') ? '1' : '0';   // phone is for the hook only
    curGrp = next;
  }
  function go(id, instant) { showGroup(id, instant); if (!instant) { gridPush(); phonePunch(); } }

  const S = (id) => { const e = $('#' + id); if (e) e.classList.add('show'); };
  const P = (id) => { const e = $('#' + id); if (e) e.classList.add('pop'); };
  const ctx = (id) => { const e = $('#' + id); if (e) e.classList.add('ctx'); };
  const startFlood = () => { const f = $('#flood'); if (f) f.classList.add('show'); };

  // ---- SUBTITLES ----
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 110);
  }
  const SUBS = [
    [0.0, 'In China, <b>520</b> means “I love you.”'],
    [3.4, 'But <b>250</b> means “you idiot.”'],
    [6.0, 'And there’s a lot more <b>hidden</b> in the language.'],
    [8.0, 'Why does that work?'],
    [9.1, 'Because Chinese is full of words'],
    [10.7, 'that sound almost exactly like <b>numbers</b>.'],
    [12.7, 'So people started using strings of numbers as <b>code</b> —'],
    [15.4, 'something you can text, comment,'],
    [17.2, 'or even put on a <b>gift</b>.'],
    [18.6, 'A few digits standing in for a whole phrase.'],
    [20.9, 'Say <b>520</b> fast — wǔ èr líng —'],
    [24.3, 'and it sounds like wǒ ài nǐ:'],
    [26.6, '“<b>I love you</b>.”'],
    [27.2, 'It’s so well known that May 20th —'],
    [29.6, 'written 5/20 —'],
    [30.4, 'has become an unofficial <b>romance day</b>,'],
    [32.1, 'like a second Valentine’s.'],
    [33.6, 'Add <b>1314</b> — which sounds like'],
    [35.9, '“forever, a lifetime” —'],
    [37.8, 'so <b>520 1314</b> means “I’ll love you forever.”'],
    [41.6, 'But the same trick cuts the other way.'],
    [43.7, 'Call someone a <b>250</b> — èr bǎi wǔ —'],
    [46.4, 'and you’ve called them a <b>fool</b>.'],
    [47.8, 'And there’s more:'],
    [48.8, '<b>88</b> sounds like “bye-bye.”'],
    [50.7, '<b>666</b> means you’re a legend, seriously skilled.'],
    [53.7, 'A few digits can carry an entire <b>mood</b>.'],
    [56.0, 'So a string of numbers in a Chinese chat'],
    [58.1, 'might be a maths problem…'],
    [59.2, 'or a love letter…'],
    [60.1, 'or an insult.'],
    [60.9, 'One block of numbers —'],
    [62.0, 'two completely <b>different worlds</b>.'],
    [63.9, 'Wanna actually start learning <b>Chinese</b>?'],
    [65.7, 'Discover thousands of free exercises'],
    [67.7, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ---- CUES ----
  const CUES = [
    // HOOK (phone)
    [0.0, (i) => { setScene('sc-chat'); showGroup('g-hook', i); }],
    [0.9, () => S('hk-b1')],
    [2.5, () => { S('hk-r1'); S('hk-h'); }],
    [3.6, () => S('hk-b2')],
    [5.1, () => S('hk-r2')],
    [6.0, () => { S('hkm1'); S('hkm2'); S('hkm3'); gridPush(); }],
    [6.6, () => { S('hkm4'); S('hkm5'); S('hkm6'); }],

    // WHY — crude doodles on the open grid
    [8.0, (i) => go('g-why', i)],
    [9.4, () => S('dd-death')],
    [10.7, () => S('dd-wealth')],
    [12.1, () => S('dd-lasting')],
    [15.9, () => ctx('dd-death')],     // text  → speech bubble + 2nd figure + arrow
    [16.6, () => ctx('dd-wealth')],    // comment → speech bubble
    [17.3, () => ctx('dd-lasting')],   // gift  → slapped on a gift box

    // LOVE — hero morph
    [20.9, (i) => go('g-love', i)],
    [23.1, () => S('lv-py')],
    [24.3, () => S('lv-bridge')],
    [25.5, () => S('lv-py2')],
    [26.5, () => P('lv-z1')],
    [26.7, () => P('lv-z2')],
    [26.9, () => { P('lv-z3'); S('lv-h'); S('lv-en'); }],

    // ROMANCE — couple photo
    [27.7, (i) => { go('g-romance', i); S('rom-photo'); }],
    [30.4, () => S('rom-cap')],

    // 1314 → gift (cross-fade)
    [33.6, (i) => go('g-1314', i)],
    [35.9, () => P('t4-z1')],
    [36.1, () => P('t4-z2')],
    [36.4, () => P('t4-z3')],
    [36.9, () => { P('t4-z4'); S('t4-en'); }],
    [38.0, () => { $('#g-1314').classList.add('gifton'); gridPush(); }],

    // INSULT 250
    [41.6, () => { gridPush(); }],
    [43.7, (i) => go('g-250', i)],
    [45.6, () => S('in-py')],
    [47.0, () => { P('in-z1'); P('in-z2'); P('in-z3'); S('in-en'); }],

    // 88
    [48.0, (i) => { go('g-88', i); S('b88-bubble'); }],
    [49.8, () => { S('b88-zh'); S('b88-en'); }],

    // 666
    [50.7, (i) => { go('g-666', i); startFlood(); }],
    [52.0, () => { S('c666-zh'); S('c666-en'); }],

    // PUNCHLINE
    [53.7, (i) => { go('g-punch', i); S('punch-block'); }],
    [58.1, () => S('read-math')],
    [59.2, () => S('read-love')],
    [60.1, () => S('read-insult')],
    [60.9, () => { gridPush(); }],

    // OUTRO
    [63.9, (i) => { setScene('sc-outro'); if (!i) gridPush(); }],
  ];

  // ---- SFX (swoosh only when the grid moves) ----
  const SFX = [
    [0.9, 'pop', 0.5], [2.5, 'pop', 0.5], [3.6, 'pop', 0.5], [5.1, 'pop', 0.5],
    [6.0, 'swoosh', 0.4], [6.1, 'pop', 0.42], [6.3, 'pop', 0.42], [6.6, 'pop', 0.4],
    [8.0, 'swoosh', 0.5],
    [9.4, 'pop', 0.5], [10.7, 'pop', 0.5], [12.1, 'pop', 0.5],
    [15.9, 'pop', 0.5], [16.6, 'pop', 0.5], [17.3, 'pop', 0.5],
    [20.9, 'swoosh', 0.48],
    [26.5, 'pop', 0.5], [26.7, 'pop', 0.5], [26.9, 'pop', 0.55],
    [27.7, 'swoosh', 0.5], [30.4, 'pop', 0.45],
    [33.6, 'swoosh', 0.48],
    [35.9, 'pop', 0.5], [36.1, 'pop', 0.5], [36.4, 'pop', 0.5], [36.9, 'pop', 0.55],
    [38.0, 'swoosh', 0.4],
    [41.6, 'swoosh', 0.45],
    [43.7, 'pop', 0.5],
    [47.0, 'pop', 0.5],
    [48.0, 'swoosh', 0.48], [48.0, 'pop', 0.5],
    [50.7, 'swoosh', 0.42], [51.0, 'tick', 0.4], [51.3, 'tick', 0.4], [51.6, 'tick', 0.4],
    [53.7, 'swoosh', 0.45],
    [58.1, 'pop', 0.5], [59.2, 'pop', 0.5], [60.1, 'pop', 0.5],
    [60.9, 'swoosh', 0.4],
    [63.9, 'swoosh', 0.55],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', tick: 'assets/sound/tick.wav' };
  function playSfx(entry) { try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {} }

  // ---- CUE ENGINE ----
  const firedScene = new Set(), firedSub = new Set(), firedSfx = new Set();
  let lastT = 0;
  function resetScenes() {
    $$('.grp *').forEach((e) => e.classList.remove('show', 'pop', 'out', 'ctx'));
    $$('.grp').forEach((g) => g.classList.remove('on', 'out', 'gifton'));
    const f = $('#flood'); if (f) f.classList.remove('show');
    pcam.style.opacity = '1'; curGrp = null;
    $('#sc-chat').classList.remove('lift'); $('#sc-chat').style.opacity = 1;
    $('#sc-outro').classList.remove('go'); $('#sc-outro').style.opacity = 0;
  }
  function hardReset() {
    firedScene.clear(); firedSub.clear(); firedSfx.clear();
    gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0; jolt = 0;
    clearTimeout(pushTimer); clearTimeout(ppTimer); setPZ(1);
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

  // ---- PLAYBACK ----
  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });

  hardReset();
})();
