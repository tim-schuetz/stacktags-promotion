/* ============================================================
   "In China, numbers are a secret language" — choreography.
   ONE persistent phone chat carries the whole story; beat groups
   inside the thread are shown one at a time and the codes morph
   (digits → pinyin → "sounds like" → hanzi → meaning). Audio-synced
   cue engine (vo.currentTime) + verbatim subtitles + a declared SFX
   bed. Camera grammar: grid nudges + a phone "punch" on each beat;
   swoosh ONLY when the grid moves; lift to the outro at the end.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  const pcam = $('#phone-cam'), phone = $('#phone');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // outro endcard logo
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) {
    outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
    outroLogo.querySelectorAll('svg > g').forEach((g) => { if (!g.classList.contains('chev')) g.classList.add('lyr'); });
  }

  // build the calendar grid + the 666 comment flood once
  function buildCal() {
    const g = $('#calgrid'); if (!g) return;
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((h) => { const d = document.createElement('div'); d.className = 'd dim'; d.textContent = h; g.appendChild(d); });
    for (let i = 0; i < 2; i++) { const d = document.createElement('div'); d.className = 'd dim'; g.appendChild(d); }
    for (let n = 1; n <= 31; n++) {
      const d = document.createElement('div');
      if (n === 20) { d.className = 'd twenty'; d.innerHTML = '<span class="cal-mark" id="cal-mark"></span><span class="dn">20</span>'; }
      else { d.className = 'd'; d.textContent = n; }
      g.appendChild(d);
    }
  }
  function buildFlood() {
    const f = $('#flood'); if (!f) return;
    const lefts = [40, 300, 470, 110, 520, 250, 410, 170];
    for (let i = 1; i <= 8; i++) {
      const c = document.createElement('div'); c.className = 'cm c' + i;
      c.style.left = lefts[i - 1] + 'px';
      c.innerHTML = '<span class="dot"></span>666';
      f.appendChild(c);
    }
  }
  buildCal(); buildFlood();

  window.__ready = true;

  // ============================================================
  // GRID CAMERA (persistent, with gentle idle life) — from the reference engine
  // ============================================================
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

  // phone "punch" — a quick subtle camera dip that settles (sells depth on a beat)
  let ppTimer = 0;
  function setPZ(z) { pcam.style.setProperty('--pz', z); }
  function phonePunch() { setPZ(0.955); clearTimeout(ppTimer); ppTimer = setTimeout(() => setPZ(1), 500); }
  setPZ(1);

  // ============================================================
  // SCENES & GROUPS
  // ============================================================
  function setScene(id, instant) {
    $('#sc-chat').style.opacity = id === 'sc-chat' ? 1 : 0;
    $('#sc-chat').classList.toggle('lift', id !== 'sc-chat');
    $('#sc-outro').style.opacity = id === 'sc-outro' ? 1 : 0;
    $('#sc-outro').classList.toggle('go', id === 'sc-outro');
  }
  let curGrp = null;
  function showGroup(id, instant) {
    const next = $('#' + id);
    if (!instant && curGrp && curGrp !== next) {
      const c = curGrp; c.classList.add('out');
      setTimeout(() => c.classList.remove('out'), 600);
    }
    $$('.grp').forEach((g) => { if (g !== next) g.classList.remove('on'); });
    next.classList.remove('out'); next.classList.add('on');
    curGrp = next;
  }
  // group change + the camera move that justifies a swoosh
  function go(id, instant) { showGroup(id, instant); if (!instant) { gridPush(); phonePunch(); } }

  const S = (id) => { const e = $('#' + id); if (e) e.classList.add('show'); };   // reveal
  const P = (id) => { const e = $('#' + id); if (e) e.classList.add('pop'); };    // pop in
  const cool = (on) => phone.classList.toggle('cool', !!on);
  const startFlood = () => { const f = $('#flood'); if (f) f.classList.add('show'); };

  // ============================================================
  // SUBTITLES (verbatim; grey, key words turquoise)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 110);
  }
  const SUBS = [
    [0.0, 'In China, <b>520</b> means “I love you.”'],
    [3.2, 'But <b>250</b> means “you idiot.”'],
    [5.9, 'Numbers there aren’t just numbers —'],
    [7.3, 'they’re a whole <b>secret language</b>.'],
    [8.8, 'Here’s how to read it.'],
    [9.8, 'It works because Chinese is full of words'],
    [11.7, 'that sound almost exactly like <b>numbers</b>.'],
    [13.8, 'So people started using strings of numbers as <b>code</b> —'],
    [16.2, 'something you can text, comment,'],
    [18.0, 'or even put on a <b>gift</b>.'],
    [19.3, 'A few digits standing in for a whole phrase.'],
    [21.6, 'Say <b>520</b> fast — wǔ èr líng —'],
    [24.7, 'and it sounds like wǒ ài nǐ:'],
    [26.4, '“<b>I love you</b>.”'],
    [27.0, 'It’s so well known that May 20th —'],
    [28.7, 'written 5/20 —'],
    [29.6, 'has become an unofficial <b>romance day</b>,'],
    [31.5, 'like a second Valentine’s.'],
    [33.3, 'Add <b>1314</b> — which sounds like'],
    [35.1, '“forever, a lifetime” —'],
    [36.8, 'so <b>520 1314</b> means “I’ll love you forever.”'],
    [40.5, 'But the same trick cuts the other way.'],
    [42.6, 'Call someone a <b>250</b> — èr bǎi wǔ —'],
    [45.2, 'and you’ve called them a <b>fool</b>.'],
    [46.7, 'The story goes it comes from an old expression'],
    [48.5, 'about half a string of coins —'],
    [50.0, 'being “not quite all there.”'],
    [51.9, 'And there’s more:'],
    [52.9, '<b>88</b> sounds like “bye-bye.”'],
    [54.3, '<b>666</b> means you’re a legend, seriously skilled.'],
    [58.4, 'A few digits can carry an entire <b>mood</b>.'],
    [60.6, 'So a string of numbers in a Chinese chat'],
    [62.7, 'might be a maths problem…'],
    [64.2, 'or a love letter…'],
    [65.5, 'or an insult.'],
    [66.5, 'One block of numbers —'],
    [67.9, 'two completely <b>different worlds</b>.'],
    [69.7, 'Wanna actually start learning <b>Chinese</b>?'],
    [71.6, 'Discover thousands of free exercises'],
    [73.7, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES  [t, fn(instant)]
  // ============================================================
  const CUES = [
    // ---- HOOK ----
    [0.0, (i) => { setScene('sc-chat', i); showGroup('g-hook', i); }],
    [1.0, () => S('hk-b1')],
    [2.4, () => { S('hk-r1'); S('hk-h'); }],
    [3.4, () => S('hk-b2')],
    [4.9, () => S('hk-r2')],
    [5.9, () => { gridPush(); }],                       // "aren't just numbers" — small grid move

    // ---- WHY IT WORKS ----
    [9.8, (i) => go('g-mech', i)],
    [10.4, () => P('mq4')],
    [11.4, () => P('mq8')],
    [12.3, () => P('mq9')],
    [16.8, () => P('cx-text')],
    [17.7, () => P('cx-comment')],
    [18.3, () => P('cx-gift')],

    // ---- LOVE: hero morph 520 → 我爱你 ----
    [21.6, (i) => go('g-love', i)],
    [23.6, () => S('lv-py')],
    [24.7, () => S('lv-bridge')],
    [25.3, () => S('lv-py2')],
    [26.3, () => P('lv-z1')],
    [26.5, () => P('lv-z2')],
    [26.78, () => { P('lv-z3'); S('lv-h'); S('lv-en'); }],

    // ---- CALENDAR: May 20 ----
    [27.6, (i) => go('g-cal', i)],
    [29.2, () => S('cal-mark')],
    [30.6, () => S('cal-tag')],

    // ---- 1314 → 一生一世 → combined on a gift ----
    [33.3, (i) => go('g-1314', i)],
    [35.0, () => P('t4-z1')],
    [35.2, () => P('t4-z2')],
    [35.4, () => P('t4-z3')],
    [35.6, () => { P('t4-z4'); S('t4-en'); }],
    [37.0, () => { S('t4-gift'); gridPush(); }],

    // ---- INSULT: tone flips, 250 → 二百五 ----
    [40.5, () => { cool(true); gridPush(); phonePunch(); }],
    [42.6, (i) => go('g-250', i)],
    [44.3, () => S('in-py')],
    [46.0, () => { P('in-z1'); P('in-z2'); P('in-z3'); S('in-ic'); S('in-en'); }],

    // ---- COINS etymology: 半吊子 ----
    [46.9, (i) => { go('g-coins', i); S('coins-img'); }],
    [49.2, () => { S('coins-zh'); S('coins-py'); }],
    [50.2, () => S('coins-mean')],
    [50.9, () => S('coins-story')],

    // ---- 88 → 拜拜 ----
    [52.6, (i) => { go('g-88', i); cool(false); S('b88-bubble'); }],
    [53.7, () => { S('b88-zh'); S('b88-en'); }],

    // ---- 666 → flood → 溜 / 厉害 ----
    [54.4, (i) => { go('g-666', i); startFlood(); }],
    [56.3, () => { S('c666-zh'); S('c666-en'); }],

    // ---- PUNCHLINE: one block, three readings ----
    [58.4, (i) => { go('g-punch', i); S('punch-mood'); }],
    [60.6, () => { S('punch-block'); gridPush(); phonePunch(); }],
    [62.7, () => S('read-math')],
    [64.2, () => S('read-love')],
    [65.5, () => S('read-insult')],
    [66.6, () => { gridPush(); }],                      // "two completely different worlds"

    // ---- OUTRO ----
    [69.7, (i) => { setScene('sc-outro', i); if (!i) gridPush(); }],
  ];

  // ============================================================
  // SFX — swoosh only when the grid moves; pop for bubbles/words; tick for flood.
  // [t, name, vol]
  // ============================================================
  const SFX = [
    [1.0, 'pop', 0.5], [2.4, 'pop', 0.5], [3.4, 'pop', 0.5], [4.9, 'pop', 0.5],
    [5.9, 'swoosh', 0.4],
    [9.8, 'swoosh', 0.5],
    [10.4, 'pop', 0.5], [11.4, 'pop', 0.5], [12.3, 'pop', 0.5],
    [16.8, 'pop', 0.45], [17.7, 'pop', 0.45], [18.3, 'pop', 0.45],
    [21.6, 'swoosh', 0.48],
    [26.3, 'pop', 0.5], [26.5, 'pop', 0.5], [26.78, 'pop', 0.55],
    [27.6, 'swoosh', 0.5],
    [30.6, 'pop', 0.45],
    [33.3, 'swoosh', 0.48],
    [35.0, 'pop', 0.5], [35.2, 'pop', 0.5], [35.4, 'pop', 0.5], [35.6, 'pop', 0.55],
    [37.0, 'swoosh', 0.4],
    [40.5, 'swoosh', 0.45],
    [42.6, 'pop', 0.5],
    [46.0, 'pop', 0.5],
    [46.9, 'swoosh', 0.5],
    [52.6, 'swoosh', 0.48], [52.6, 'pop', 0.5],
    [54.4, 'swoosh', 0.42], [54.7, 'tick', 0.4], [55.1, 'tick', 0.4], [55.5, 'tick', 0.4],
    [58.4, 'swoosh', 0.45], [58.5, 'pop', 0.5],
    [60.6, 'swoosh', 0.45],
    [62.7, 'pop', 0.5], [64.2, 'pop', 0.5], [65.5, 'pop', 0.5],
    [66.6, 'swoosh', 0.4],
    [69.7, 'swoosh', 0.55],
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
    $$('.grp *').forEach((e) => e.classList.remove('show', 'pop', 'out'));
    $$('.grp').forEach((g) => g.classList.remove('on', 'out'));
    const f = $('#flood'); if (f) f.classList.remove('show');
    cool(false); curGrp = null;
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
