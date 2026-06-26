/* ============================================================
   "The plan to replace Chinese characters with the alphabet" — choreography.
   Engine: persistent grid camera + faux-3D depth transitions + an
   audio.currentTime cue engine + verbatim subtitles + a declared SFX bed.
   Arc: hook (alphabet vs 字) → vocab (pinyin writes sounds: 3 object words)
   → Zhou Youguang → the REFORM WALL (pinyin tries to replace the characters,
   fails, becomes their helper) → phone IME (the irony) → punchline → outro.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);

  const stage = $('#stage'), grid = $('#grid'), vo = $('#vo'), subsLine = $('#subs-line');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // ---- scene parts ----
  const duo = $('#duo'), duoChar = $('#duo-char'), duoAlpha = $('#duo-alpha');
  const VROWS = ['vrow-rice', 'vrow-sauce', 'vrow-poo'];
  const zhouStage = $('#zhou-stage');
  const charrow = $('#charrow'), toohard = $('#toohard'), lawstamp = $('#lawstamp');
  const litchart = $('#litchart'), skyline = $('#skyline'), lcNum = $('#lc-num');
  const imeBox = $('#ime'), imeField = $('#ime-field'), imeCands = $('#ime-cands'), imeKeys = $('#ime-keys');

  // ============================================================
  // BUILD: reform-wall cells (+ overwhelmed learner), phone IME
  // ============================================================
  const CELLS = [['文', 'wén'], ['字', 'zì'], ['书', 'shū'], ['语', 'yǔ'], ['言', 'yán']];
  function buildReform() {
    charrow.innerHTML = CELLS.map(([h, p]) => `<div class="cell"><div class="hz cjk">${h}</div><div class="py">${p}</div></div>`).join('');
    $('#th-learner').innerHTML =
      `<svg viewBox="0 0 80 92">
         <path d="M26 46 l-15 -15" stroke="#35A292" stroke-width="9" stroke-linecap="round"/>
         <path d="M54 46 l15 -15" stroke="#35A292" stroke-width="9" stroke-linecap="round"/>
         <circle cx="40" cy="22" r="14" fill="#119271"/>
         <path d="M40 38 C26 38 22 52 22 68 v18 h36 v-18 c0-16-4-30-18-30Z" fill="#35A292"/>
         <circle cx="11" cy="20" r="4" fill="#8ec9bb"/><circle cx="69" cy="20" r="4" fill="#8ec9bb"/>
       </svg>`;
  }
  const cells = () => [...charrow.children];

  const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  const keyEls = {};
  function buildPhone() {
    imeKeys.innerHTML = '';
    ROWS.forEach((row) => {
      const r = document.createElement('div'); r.className = 'krow';
      [...row].forEach((c) => { const k = document.createElement('div'); k.className = 'key'; k.textContent = c; keyEls[c] = k; r.appendChild(k); });
      imeKeys.appendChild(r);
    });
    imeCands.innerHTML = '';
    [['1', '你'], ['2', '您'], ['3', '你好'], ['4', '妮']].forEach((c, i) => {
      const el = document.createElement('div'); el.className = 'cand'; el.dataset.i = i;
      el.innerHTML = `<span class="idx">${c[0]}</span><span class="zh cjk">${c[1]}</span>`;
      imeCands.appendChild(el);
    });
  }
  buildReform(); buildPhone();

  // ---- outro endcard ----
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) {
    outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });
    outroLogo.querySelectorAll('svg > g').forEach((g) => { if (!g.classList.contains('chev')) g.classList.add('lyr'); });
  }
  function outroAssemble() { $('#outro-ec').classList.add('play'); }
  function outroReset() { $('#outro-ec').classList.remove('play'); }

  // ============================================================
  // GRID CAMERA
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
      case 'zoom-out': return { from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 }, to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'fade': return { from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in': default: return { from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 }, to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100;
    const fromEl = current; if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s;
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
  // SCENE ACTIONS
  // ============================================================
  const cls = (el, name, on) => el.classList.toggle(name, !!on);

  // GLYPH
  function setDuo(ch, py) { duoChar.textContent = ch; duoAlpha.innerHTML = [...py].map((c) => c === ' ' ? '<span style="width:26px"></span>' : `<span>${c}</span>`).join(''); }
  function glyphHook() { duo.className = 'duo'; setDuo('字', 'zì'); }
  function duoReplace() { duo.className = 'duo replacing'; }
  function duoKill() { duo.className = 'duo killed'; }
  function duoFail() { duo.className = 'duo pop'; setDuo('字', 'zì'); setTimeout(() => { if (duo.classList.contains('pop')) duo.classList.remove('pop'); }, 600); }
  function glyphPulse() { duo.className = 'duo ls'; setDuo('字', 'zì'); }

  // VOCAB
  function vocabReset() { VROWS.forEach((id) => $('#' + id).classList.remove('in')); }
  function vocabRow(id) { $('#' + id).classList.add('in'); }

  // ZHOU
  function zhouReset() { zhouStage.classList.remove('in'); }
  function zhouIn() { zhouStage.classList.add('in'); }

  // REFORM WALL
  function reformReset() {
    cells().forEach((c) => { c.className = 'cell'; });
    charrow.classList.remove('helper', 'gag');
    toohard.classList.remove('in');
    lawstamp.classList.remove('in');
  }
  function reformIntro() { /* the row stands: char + pinyin sitting politely below */ }
  function reformConvert(instant) {            // "gradually replace them": pinyin overtakes the WHOLE row, wave L→R
    [0, 1, 2, 3, 4].forEach((i, k) => { if (instant) cells()[i].classList.add('taken'); else setTimeout(() => cells()[i].classList.add('taken'), k * 180); });
  }
  function reformTooHard(on) { cls(toohard, 'in', on); cls(charrow, 'gag', on); }
  function reformGagOff() { toohard.classList.remove('in'); charrow.classList.remove('gag'); }
  function reformFreeze() { lawstamp.classList.add('in'); }   // the LAW stamp hovers but never falls
  function reformBuried() { lawstamp.classList.remove('in'); cells().forEach((c) => { if (c.classList.contains('taken')) c.classList.add('buried'); }); }
  function reformRestore() { cells().forEach((c) => c.classList.remove('taken', 'buried')); }
  function reformHelper() { charrow.classList.add('helper'); }   // pinyin glows as the helper under each character
  function reformPayoff() { cells().forEach((c) => { c.className = 'cell'; }); charrow.classList.add('helper'); toohard.classList.remove('in'); lawstamp.classList.remove('in'); }

  // MODERN (literacy rate chart + skyscrapers)
  let countRAF = 0;
  function modernReset() { litchart.classList.remove('in'); skyline.classList.remove('in'); if (lcNum) lcNum.textContent = '20'; if (countRAF) cancelAnimationFrame(countRAF); }
  function modernIn(instant) {
    litchart.classList.add('in'); skyline.classList.add('in');
    if (!lcNum) return;
    if (instant) { lcNum.textContent = '97'; return; }
    const t0 = performance.now(), dur = 1700;
    (function step(now) { const e = Math.min(1, (now - t0) / dur); lcNum.textContent = Math.round(20 + 77 * e); if (e < 1) countRAF = requestAnimationFrame(step); })(performance.now());
  }

  // PHONE
  let imeStr = '';
  function imeReset() {
    imeStr = ''; imeField.innerHTML = '<span class="pin"></span><span class="caret"></span>';
    imeField.classList.remove('alive'); imeBox.classList.remove('typing'); imeCands.classList.remove('show');
    [...imeCands.children].forEach((c) => c.classList.remove('show', 'pick'));
    Object.values(keyEls).forEach((k) => k.classList.remove('down'));
  }
  function pressKey(letter, instant) {
    imeStr += letter; const pin = imeField.querySelector('.pin'); if (pin) pin.textContent = imeStr; imeBox.classList.add('typing');
    if (instant) return; const k = keyEls[letter]; if (k) { k.classList.add('down'); setTimeout(() => k.classList.remove('down'), 150); }
  }
  function candsShow(instant) { imeCands.classList.add('show'); [...imeCands.children].forEach((c, i) => { if (instant) c.classList.add('show'); else setTimeout(() => c.classList.add('show'), i * 80); }); }
  function candPick() { const t = imeCands.querySelector('[data-i="2"]'); if (t) t.classList.add('show', 'pick'); }
  function imeCommit() { imeBox.classList.remove('typing'); imeField.innerHTML = '<span class="han cjk">你好</span>'; imeCands.classList.remove('show'); }
  function thriveOn() { imeField.classList.add('alive'); }

  window.__ready = true;

  // ============================================================
  // SUBTITLES (verbatim, grey; key words turquoise)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 120);
  }
  const SUBS = [
    [0.0, 'Pinyin — the system that'],
    [1.18, 'spells Chinese with the <b>Latin alphabet</b> —'],
    [3.50, 'was originally built to do one thing:'],
    [5.70, '<b>replace</b> Chinese characters <b>completely</b>.'],
    [7.92, 'The plan was to let the alphabet'],
    [9.30, 'quietly <b>kill them off</b>.'],
    [11.16, '<b>It failed</b>.'],
    [11.96, 'And today, it does the <b>exact opposite</b>.'],
    [14.14, 'Pinyin is the system that'],
    [14.98, 'writes Chinese <b>sounds</b>'],
    [16.12, 'using our familiar <b>A-B-C letters</b>.'],
    [18.54, 'It was created in the <b>1950s</b>'],
    [20.46, 'by a committee led by a man named'],
    [21.96, '<b>Zhou Youguang</b> —'],
    [23.06, 'often called the <b>father of Pinyin</b>.'],
    [25.04, 'But for many of the reformers —'],
    [27.28, 'including <b>Mao</b> himself —'],
    [28.76, 'Pinyin wasn’t meant to just sit'],
    [29.82, 'politely beside the characters.'],
    [31.58, 'It was meant to <b>gradually replace</b> them.'],
    [33.56, 'The thinking went: the characters'],
    [35.12, 'were <b>too hard</b>, holding back literacy.'],
    [37.52, 'The future was a <b>simple alphabet</b>,'],
    [39.22, 'like most of the world used.'],
    [40.86, 'Pinyin was the <b>bridge</b> to get there.'],
    [42.30, 'Now, the honest part:'],
    [43.78, 'that goal was never fully'],
    [44.86, '<b>written into law</b> —'],
    [45.82, 'and it was never officially'],
    [46.92, 'declared dead, either.'],
    [48.18, 'It was simply… <b>buried</b>.'],
    [50.32, 'As literacy rose and the country modernized,'],
    [53.04, 'the appetite to throw out'],
    [53.94, 'thousands of years of characters <b>faded</b>,'],
    [56.06, 'and Pinyin got quietly'],
    [57.08, 'reclassified as a <b>helper</b> —'],
    [58.50, 'a way to teach pronunciation'],
    [60.30, 'and <b>sound out</b> characters,'],
    [61.66, 'not to replace them.'],
    [62.64, 'And here’s the twist.'],
    [63.96, 'Pinyin didn’t kill the characters.'],
    [65.38, 'It <b>saved</b> them.'],
    [66.36, 'Because today, how do you type Chinese'],
    [68.56, 'on a <b>phone</b> or a keyboard?'],
    [69.74, 'You type the <b>Pinyin</b> —'],
    [70.88, 'and pick the <b>character</b> from a list.'],
    [72.74, 'The system built to replace the characters'],
    [74.78, 'is now the main reason'],
    [75.66, 'they <b>thrive</b> in the digital age.'],
    [77.48, 'So Pinyin was a <b>weapon</b>'],
    [78.42, 'aimed straight at Chinese characters —'],
    [80.28, 'that completely <b>missed</b>,'],
    [81.60, 'and became their <b>life support</b> instead.'],
    [83.52, 'The bridge meant to lead away from'],
    [85.00, 'the characters is now the bridge'],
    [86.42, 'everyone uses to <b>reach</b> them.'],
    [87.42, 'Wanna actually start learning <b>Chinese</b>?'],
    [90.44, 'Discover thousands of free exercises'],
    [92.20, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES
  // ============================================================
  const CUES = [
    // ---- HOOK ----
    [0.0, (i) => enter($('#sc-glyph'), 'fade', 600, i, glyphHook)],
    [5.70, () => duoReplace()],
    [9.30, () => duoKill()],
    [11.16, () => duoFail()],
    [11.96, () => { glyphHook(); gridPush(); }],

    // ---- VOCAB (3 object words, shown not spoken) ----
    [14.14, (i) => enter($('#sc-vocab'), 'zoom-in', 950, i, vocabReset)],
    [15.00, () => vocabRow('vrow-rice')],
    [16.00, () => vocabRow('vrow-sauce')],
    [17.00, () => vocabRow('vrow-poo')],

    // ---- ZHOU YOUGUANG ----
    [18.54, (i) => enter($('#sc-zhou'), 'zoom-out', 1000, i, zhouIn)],

    // ---- REFORM WALL ----
    [25.04, (i) => enter($('#sc-reform'), 'zoom-in', 1050, i, () => { reformReset(); reformIntro(); })],
    [32.16, (i) => reformConvert(i)],            // "gradually replace them" — the WHOLE row is taken over
    [35.36, () => reformTooHard(true)],          // "too hard" — 龘 + overwhelmed learner
    [38.28, () => reformGagOff()],               // gag ends, the all-pinyin row returns
    [44.86, () => reformFreeze()],               // "written into law" — stamp hovers, never falls
    [48.82, () => reformBuried()],               // "buried"

    // ---- MODERN (literacy chart + skyscrapers) ----
    [50.32, (i) => enter($('#sc-modern'), 'zoom-out', 1050, i, () => modernIn(i))],
    [56.06, (i) => { enter($('#sc-reform'), 'zoom-out', 1000, i, () => {}); reformRestore(); reformHelper(); }],  // back to the wall: characters restored, pinyin now the helper

    // ---- PHONE IME ----
    [62.64, (i) => enter($('#sc-phone'), 'zoom-in', 1000, i, imeReset)],
    [70.00, (i) => pressKey('n', i)],
    [70.18, (i) => pressKey('i', i)],
    [70.34, (i) => pressKey('h', i)],
    [70.50, (i) => pressKey('a', i)],
    [70.66, (i) => pressKey('o', i)],
    [71.00, (i) => candsShow(i)],
    [71.44, () => candPick()],
    [72.10, () => imeCommit()],
    [72.92, () => thriveOn()],

    // ---- PUNCHLINE / OUTRO ----
    [77.48, (i) => enter($('#sc-glyph'), 'zoom-in', 1000, i, () => { duo.className = 'duo'; setDuo('字', 'zì'); })],
    [81.60, () => glyphPulse()],
    [83.78, (i) => enter($('#sc-reform'), 'zoom-out', 1050, i, reformPayoff)],
    [87.42, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(); }],
  ];

  // ============================================================
  // SFX — swoosh on grid-moving transitions; pop for pop-ins; tick for typing.
  // ============================================================
  const SFX = [
    [5.70, 'pop', 0.32],
    [11.16, 'pop', 0.5],
    [11.96, 'swoosh', 0.42],
    [14.14, 'swoosh', 0.5],
    [15.00, 'pop', 0.45], [16.00, 'pop', 0.45], [17.00, 'pop', 0.45],
    [18.54, 'swoosh', 0.5],
    [25.04, 'swoosh', 0.5],
    [32.16, 'pop', 0.42], [32.34, 'pop', 0.4], [32.52, 'pop', 0.4], [32.70, 'pop', 0.38], [32.88, 'pop', 0.36],
    [35.36, 'pop', 0.5],
    [44.86, 'pop', 0.45],
    [48.82, 'pop', 0.34],
    [50.32, 'swoosh', 0.5],
    [56.06, 'swoosh', 0.5],
    [62.64, 'swoosh', 0.5],
    [70.00, 'tick', 0.5], [70.18, 'tick', 0.5], [70.34, 'tick', 0.5], [70.50, 'tick', 0.5], [70.66, 'tick', 0.5],
    [71.00, 'pop', 0.45],
    [72.10, 'pop', 0.5],
    [77.48, 'swoosh', 0.5],
    [83.78, 'swoosh', 0.5],
    [87.42, 'swoosh', 0.55],
  ];
  window.SFX = SFX;
  const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', tick: 'assets/sound/tick.wav' };
  function playSfx(entry) { try { const a = new Audio(SND[entry[1]]); a.volume = entry[2] != null ? entry[2] : 0.6; a.play().catch(() => {}); } catch (e) {} }

  // ============================================================
  // CUE ENGINE
  // ============================================================
  const firedScene = new Set(), firedSub = new Set(), firedSfx = new Set();
  let lastT = 0;
  function resetScenes() { glyphHook(); vocabReset(); zhouReset(); reformReset(); modernReset(); imeReset(); outroReset(); }
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
