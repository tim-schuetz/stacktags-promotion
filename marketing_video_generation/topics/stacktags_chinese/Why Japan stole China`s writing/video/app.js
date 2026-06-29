/* ============================================================
   "Why Japan stole China's writing" — NEW STYLE choreography (v2)
   Explanatory cold-open intro (China/Japan + figures, 氣→気 drift, then
   the three-scripts reveal) → "Let me explain" → the detailed story.
   Everything driven off the narration's audio.currentTime (cue engine).
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage'); const grid = $('#grid'); const vo = $('#vo'); const subsLine = $('#subs-line');
  function fit() { const s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = 'scale(' + s + ')'; }
  addEventListener('resize', fit); fit();

  // ---- shared illustration helpers ----
  const DOODLE = {
    mountain: `<svg class="doodle" viewBox="0 0 100 100"><polyline points="8,82 32,34 48,58 64,22 92,82"/></svg>`,
    tree: `<svg class="doodle" viewBox="0 0 100 100"><line x1="50" y1="92" x2="50" y2="54"/><path class="fillblob" d="M50 12 C24 14 22 48 50 50 C78 48 76 14 50 12 Z"/></svg>`,
    river: `<svg class="doodle" viewBox="0 0 100 100"><path d="M12,28 q18,16 33,2 t33,2"/><path d="M12,50 q18,16 33,2 t33,2"/><path d="M12,72 q18,16 33,2 t33,2"/></svg>`,
  };
  const PARCH = (glyph) => `<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="40" y="46" width="160" height="232" rx="8" fill="#f4ecd4" stroke="#232B33" stroke-width="6"/>
    <rect x="26" y="32" width="188" height="30" rx="15" fill="#decba0" stroke="#232B33" stroke-width="6"/>
    <rect x="26" y="266" width="188" height="30" rx="15" fill="#decba0" stroke="#232B33" stroke-width="6"/>
    <text x="120" y="196" text-anchor="middle" font-family="'Noto Sans JP',sans-serif" font-weight="900" font-size="120" fill="#232B33">${glyph}</text>
  </svg>`;
  const SOUND_WAVES = `<svg class="bw-waves" viewBox="0 0 90 70"><path d="M30 16 Q52 35 30 54"/><path d="M48 8 Q78 35 48 62"/><path d="M16 24 Q28 35 16 46"/></svg>`;

  // cast — generated (Imagen-4) figure cutouts: china_scholar + jp_a/jp_b/jp_c
  const fig = (n) => `<img class="figimg" src="assets/img/${n}_cut.png" alt="" draggable="false">`;

  // ============================================================
  // SCENE BUILDERS
  // ============================================================
  // INTRO / BORROW — China & Japan (real silhouettes), a Chinese scholar speaks 氣,
  // Japan has speech but no writing, then takes 氣 and bends it into 気.
  (function buildBorrow() {
    const C = window.COUNTRY_PATHS || { china: { viewBox: '0 0 10 10', path: '' }, japan: { viewBox: '0 0 10 10', path: '' } };
    const land = (cls, c, w) => { const p = c.viewBox.split(' ').map(Number); const h = Math.round(w * p[3] / p[2]); return `<svg class="bw-land ${cls}" viewBox="${c.viewBox}" width="${w}" height="${h}"><path d="${c.path}"/></svg>`; };
    $('#sc-borrow').innerHTML = `
      <div class="borrow" id="borrow">
        ${land('china', C.china, 500)}
        ${land('japan', C.japan, 332)}
        <div class="bw-era tag-pill">≈ 500 AD</div>
        <div class="bw-label cn">中国<small>China</small></div>
        <div class="bw-label jp">日本<small>Japan</small></div>
        <div class="bw-fig cnf">${fig('china_scholar')}</div>
        <div class="bw-fig j1">${fig('jp_a')}</div>
        <div class="bw-fig j2">${fig('jp_b')}</div>
        <div class="bw-fig j3">${fig('jp_c')}</div>
        <div class="bw-bub shared" id="bw-shared"><span class="bw-char cjk">氣</span><span class="tail"></span></div>
        <div class="bw-bub jpb" id="bw-jpb">${SOUND_WAVES}<span class="tail c"></span></div>
        <div class="bw-bub jp j2b" id="bw-jp2"><span class="bw-char cjk">気</span><span class="tail c"></span></div>
        <div class="bw-bub jp j3b" id="bw-jp3"><span class="bw-char cjk">気</span><span class="tail c"></span></div>
      </div>`;
  })();

  // HOOK — the three-scripts reveal ("the most complex writing system")
  $('#sc-hook').innerHTML = `
    <div class="hook" id="hook">
      <div class="hk-sentence cjk" id="hk-sentence">
        <span class="g kanji">私</span><span class="g hira">は</span><span class="g kata">テ</span><span class="g kata">レ</span><span class="g kata">ビ</span><span class="g hira">を</span><span class="g kanji">見</span><span class="g hira">る</span>
      </div>
      <div class="hk-cols cjk" id="hk-cols">
        <div class="hk-col kanji"><div class="hk-col-glyphs"><span class="g">私</span><span class="g">見</span></div><div class="hk-col-label">漢字<small>kanji</small></div></div>
        <div class="hk-col hira"><div class="hk-col-glyphs"><span class="g">は</span><span class="g">を</span><span class="g">る</span></div><div class="hk-col-label">ひらがな<small>hiragana</small></div></div>
        <div class="hk-col kata"><div class="hk-col-glyphs"><span class="g">テ</span><span class="g">レ</span><span class="g">ビ</span></div><div class="hk-col-label">カタカナ<small>katakana</small></div></div>
      </div>
      <div class="hk-invented"><span class="sweep"></span><span class="txt">three scripts in one</span></div>
    </div>`;

  // RESOLVE (kept — the "patched it together" payoff)
  function misfitHTML() {
    return `<div class="misfit">
      <div class="mf-slot">
        <div class="mf-kanji cjk">語</div>
        <div class="mf-tape t1"></div><div class="mf-tape t2"></div>
        <div class="mf-kana cjk k1">り</div><div class="mf-kana cjk k2">が</div><div class="mf-kana cjk k3">な</div>
      </div>
    </div>`;
  }
  $('#sc-resolve').innerHTML = misfitHTML();

  // SCROLL — a Japanese figure speaks beside a blank scroll → it fills with pictograph
  // characters → then floods (imported "wholesale")
  $('#sc-scroll').innerHTML = `
    <div class="scroll-scene" id="scroll-scene">
      <div class="ss-fig">${fig('jp_a')}</div>
      <div class="ss-bub"><span class="cjk">ぺらぺら…</span></div>
      <div class="ss-scroll" id="ss-scroll">
        <div class="ss-col">
          <div class="ss-char"><span class="glyph cjk">山</span>${DOODLE.mountain}</div>
          <div class="ss-char"><span class="glyph cjk">木</span>${DOODLE.tree}</div>
          <div class="ss-char"><span class="glyph cjk">川</span>${DOODLE.river}</div>
        </div>
        <div class="ss-flood" id="ss-flood">${'安以宇衣於加幾久計己佐之寸世曽太知川天止'.split('').map((c) => `<span class="cjk">${c}</span>`).join('')}</div>
      </div>
    </div>`;

  // UNRELATED — a Chinese + a Japanese figure read 字 in garbled, different ways
  $('#sc-unrelated').innerHTML = `
    <div class="unrel" id="unrel-scene">
      <span class="ur-parch">${PARCH('字')}</span>
      <div class="ur-fig l">${fig('china_scholar')}</div>
      <div class="ur-fig r">${fig('jp_b')}</div>
      <div class="ur-bub l">%$#!</div>
      <div class="ur-bub r">#@¿!</div>
      <div class="ur-flag l cjk">中</div>
      <div class="ur-flag r cjk">日</div>
    </div>`;

  // ENGLISH — writing "HELLO" with kanji-by-sound → a piece that won't fit
  $('#sc-english').innerHTML = `
    <div class="eng-scene" id="eng-scene">
      <div class="eng-word">HELLO</div>
      <div class="eng-boxes">
        <div class="eng-box b0"><span class="cjk">哈</span></div><div class="eng-box b1 over"><span class="cjk">楼</span></div>
        <div class="eng-box b2"><span class="cjk">罗</span></div><div class="eng-box b3 over"><span class="cjk">呜</span></div>
        <div class="eng-box b4"><span class="cjk">欧</span></div>
      </div>
      <div class="eng-puzzle"><div class="pz-slot"></div><div class="pz-piece cjk">語</div></div>
    </div>`;

  // TWO JOBS — 木 splits into meaning (tree) and sound (ki)
  $('#sc-twojobs').innerHTML = `
    <div class="twojobs" id="twojobs">
      <div class="tj-char cjk">木</div>
      <div class="tj-branch meaning">${DOODLE.tree}<div class="tj-cap">tree<small>its meaning</small></div></div>
      <div class="tj-branch sound"><div class="tj-read">ki</div><div class="tj-brick"><span class="cjk">き</span><span class="cjk">の</span><span class="cjk">こ</span></div><div class="tj-cap">just a sound<small>spelling a word</small></div></div>
    </div>`;

  // READINGS — 山 with on'yomi (san) + kun'yomi (yama)
  $('#sc-readings').innerHTML = `
    <div class="readings" id="readings">
      <div class="rd-char cjk">山</div>
      <div class="rd-one on" id="rd-on"><div class="rd-kana cjk">サン</div><div class="rd-rome">san</div><div class="rd-tag"><span class="cjk">音読み</span> · from Chinese</div></div>
      <div class="rd-one kun" id="rd-kun"><div class="rd-kana cjk">やま</div><div class="rd-rome">yama</div><div class="rd-tag"><span class="cjk">訓読み</span> · native</div></div>
    </div>`;

  // EXPLODE — 生 with many readings popping out
  $('#sc-explode').innerHTML = `<div class="explode" id="explode"><div class="ex-char cjk">生</div><div id="ex-host"></div></div>`;
  const EX_READS = [
    { text: 'sei', x: -360, y: -300, size: 78, key: true }, { text: 'shō', x: 330, y: -330, size: 78 },
    { text: 'nama', x: -430, y: -40, size: 78, key: true }, { text: 'i', x: 420, y: -30, size: 78 },
    { text: 'ki', x: -360, y: 230, size: 78 }, { text: 'ha', x: 340, y: 250, size: 78, key: true },
    { text: 'u', x: -150, y: 380, size: 70 }, { text: 'fu', x: 170, y: 390, size: 70 },
  ];
  let exPop = null;
  try { exPop = new StacktagsTextPopup($('#ex-host'), { words: EX_READS }); } catch (e) {}

  // KANA — kanji → kana morphs
  $('#sc-kana').innerHTML = `
    <div class="kana" id="kana">
      <div class="kn-block">
        <div class="kn-blbl hira">ひらがな <small>hiragana</small></div>
        <div class="kn-row hira" id="kn-hira">
          <div class="kn-pair"><span class="kn-from cjk">安</span><span class="kn-arrow">→</span><span class="kn-to cjk">あ</span></div>
          <div class="kn-pair"><span class="kn-from cjk">加</span><span class="kn-arrow">→</span><span class="kn-to cjk">か</span></div>
        </div>
      </div>
      <div class="kn-block">
        <div class="kn-blbl kata">カタカナ <small>katakana</small></div>
        <div class="kn-row kata" id="kn-kata">
          <div class="kn-pair"><span class="kn-from cjk">阿</span><span class="kn-arrow">→</span><span class="kn-to cjk">ア</span></div>
          <div class="kn-pair"><span class="kn-from cjk">伊</span><span class="kn-arrow">→</span><span class="kn-to cjk">イ</span></div>
        </div>
      </div>
    </div>`;

  // MIX — the hook sentence reassembled, woven from all three scripts
  const MIX_GLYPHS = [['私', 'kanji'], ['は', 'hira'], ['テ', 'kata'], ['レ', 'kata'], ['ビ', 'kata'], ['を', 'hira'], ['見', 'kanji'], ['る', 'hira']];
  $('#sc-mix').innerHTML = `
    <div class="mix" id="mix">
      <div class="mix-line cjk">${MIX_GLYPHS.map(([g, c], i) => `<span class="g ${c} i${i}">${g}</span>`).join('')}</div>
      <div class="mix-legend"><span class="kanji"><i></i>meaning</span><span class="hira"><i></i>hiragana</span><span class="kata"><i></i>katakana</span></div>
    </div>`;

  // BEAUTY — calm final arrangement
  $('#sc-beauty').innerHTML = `<div class="beauty" id="beauty"><div class="bt-arr cjk"><span class="g kanji">漢</span><span class="g hira">あ</span><span class="g kata">ア</span></div></div>`;

  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });

  // ============================================================
  // GRID CAMERA
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 }; const gdisp = { s: 1, x: 0, y: 0 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function applyGrid() {
    const t = vo.currentTime || 0;
    const cs = clamp(gdisp.s * (1 + Math.sin(t * 0.5) * 0.012), 0.82, 1.5);
    const cell = 120 * cs;
    const px = ((gdisp.x + Math.sin(t * 0.33) * 11) % cell + cell) % cell;
    const py = ((gdisp.y + Math.cos(t * 0.27) * 9) % cell + cell) % cell;
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
  function setPose(el, p) {
    el.style.setProperty('--tx', (p.tx || 0) + 'px'); el.style.setProperty('--ty', (p.ty || 0) + 'px');
    el.style.setProperty('--s', p.s != null ? p.s : 1);
    el.style.opacity = p.op != null ? p.op : 1; el.style.filter = p.blur ? `blur(${p.blur}px)` : 'none';
    if (p.z != null) el.style.zIndex = p.z;
  }
  function POSES(mode, e) {
    switch (mode) {
      case 'rise': return { from: { s: lerp(1, .66, e), ty: lerp(0, -230, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 }, to: { s: lerp(.72, 1, e), ty: lerp(980, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .85 };
      case 'zoom-out': return { from: { s: lerp(1, .34, e), ty: lerp(0, 40, e), blur: 14 * e, op: clamp01(1.1 - e / .7), z: 1 }, to: { s: lerp(2.6, 1, e), blur: 18 * (1 - e), op: clamp01((e - .05) / .45), z: 3 }, grid: .8 };
      case 'pan-right': return { from: { tx: lerp(0, 1180, e), blur: 6 * e, op: clamp01(1.1 - e / .8), z: 2 }, to: { tx: lerp(-1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / .45), z: 3 }, panX: 1180 };
      case 'drop': return { from: { s: lerp(1, .66, e), ty: lerp(0, 180, e), blur: 3 * e, op: lerp(1, .55, e), z: 1 }, to: { s: lerp(.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / .35), z: 3 }, grid: .9 };
      case 'fade': return { from: { op: clamp01(1 - e / .55), z: 1 }, to: { op: clamp01(e / .5), z: 3 }, grid: 1 };
      case 'zoom-in': default: return { from: { s: lerp(1, 3.0, e), blur: 24 * e, op: clamp01(1.1 - e / .62), z: 3 }, to: { s: lerp(.35, 1, e), ty: lerp(240, 0, e), blur: 8 * (1 - e), op: clamp01((e - .05) / .45), z: 2 }, grid: 1.45 };
    }
  }
  let current = null, sceneRAF = 0;
  function depthGo(toEl, mode, dur, onArrive) {
    mode = mode || 'zoom-in'; dur = dur || 1100; const fromEl = current;
    if (sceneRAF) cancelAnimationFrame(sceneRAF);
    const gs0 = gcam.s, gx0 = gcam.x;
    if (mode === 'lift') {
      gcam.s = gs0 * 1.3; const t0 = performance.now(); setPose(toEl, { ty: -700, s: 1.3, op: 0, z: 2 });
      (function step(now) {
        const e = easeInOut(clamp01((now - t0) / dur)); const dy = 1450 * e;
        if (fromEl) setPose(fromEl, { ty: dy, s: lerp(1, 1.3, e), op: 1, blur: 0, z: 4 });
        setPose(toEl, { ty: lerp(-700, 0, e), s: lerp(1.3, 1, e), op: clamp01(e / .4), blur: 6 * (1 - e), z: 2 });
        if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
        if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
        gcam.s = gs0; current = toEl; if (onArrive) onArrive();
      })(performance.now()); return;
    }
    const p0 = POSES(mode, 0);
    if (p0.grid != null) gcam.s = gs0 * p0.grid;
    if (p0.panX != null) gcam.x = gx0 + p0.panX * gs0 * 0.18;
    setPose(toEl, Object.assign({ op: 0 }, p0.to));
    const t0 = performance.now();
    (function step(now) {
      const e = easeInOut(clamp01((now - t0) / dur)); const ps = POSES(mode, e);
      if (fromEl) setPose(fromEl, ps.from); setPose(toEl, ps.to);
      if ((now - t0) < dur) { sceneRAF = requestAnimationFrame(step); return; }
      if (fromEl) setPose(fromEl, { op: 0, z: 0 }); setPose(toEl, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 });
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1); current = toEl; if (onArrive) onArrive();
    })(performance.now());
  }
  function showInstant(el) { SCENES.forEach((s) => { if (s !== el) setPose(s, { op: 0, z: 0 }); }); setPose(el, { tx: 0, ty: 0, s: 1, op: 1, blur: 0, z: 3 }); current = el; }
  function enter(el, mode, dur, instant, onArrive) { if (instant) { showInstant(el); if (onArrive) onArrive(); return; } depthGo(el, mode, dur, onArrive); }

  // ============================================================
  // in-scene helpers
  // ============================================================
  const cls = (sel, c, on) => { const el = $(sel); if (el) el.classList[on === false ? 'remove' : 'add'](c); };
  // BORROW
  function borrowTalk(sel) { const e = $(sel); if (!e) return; e.classList.remove('talk'); void e.offsetWidth; e.classList.add('talk'); }
  function borrowStart(i) { const b = $('#borrow'); if (b) b.classList.add('show'); const sh = $('#bw-shared'); if (sh) sh.classList.add('in'); if (!i) setTimeout(() => borrowTalk('.bw-fig.cnf'), 140); }
  function borrowJpEmpty(i) { const e = $('#bw-jpb'); if (e) e.classList.add('in'); }
  function borrowJpSound(i) { const e = $('#bw-jpb'); if (e) e.classList.add('in', 'sound'); if (!i) { borrowTalk('.bw-fig.j1'); borrowTalk('.bw-fig.j2'); } }
  function borrowHandoff(i) { const e = $('#bw-jpb'); if (e) e.classList.remove('in', 'sound'); const sh = $('#bw-shared'); if (sh) sh.classList.add('flip'); if (!i) borrowTalk('.bw-fig.j1'); }
  function borrowBend(i) { const a = $('#bw-jp2'); if (a) a.classList.add('in'); if (!i) borrowTalk('.bw-fig.j2'); setTimeout(() => { const b = $('#bw-jp3'); if (b) b.classList.add('in'); if (!i) borrowTalk('.bw-fig.j3'); }, i ? 0 : 520); }
  // HOOK
  function hookSplit(i) { cls('#hook', 'split'); }
  function hookInvented(i) { cls('#hook', 'invented'); }
  // SCROLL
  function scrollShow(i) { cls('#scroll-scene', 'show'); if (!i) borrowTalk('.ss-fig'); }
  function scrollFill(i) { cls('#scroll-scene', 'filled'); }
  function scrollFlood(i) { cls('#scroll-scene', 'flood'); }
  // UNRELATED
  function unrelSpeak(i) { cls('#unrel-scene', 'speak'); }
  // ENGLISH
  function engJam(i) { cls('#eng-scene', 'jam'); }
  function engNofit(i) { cls('#eng-scene', 'nofit'); }
  // TWO JOBS
  function tjMeaning(i) { cls('#twojobs', 'split'); cls('#twojobs', 'meaning'); }
  function tjSound(i) { cls('#twojobs', 'split'); cls('#twojobs', 'sound'); }
  // READINGS
  function rdOn(i) { cls('#rd-on', 'show'); }
  function rdKun(i) { cls('#rd-kun', 'show'); }
  // EXPLODE
  function explodeBoom(i) { cls('#explode', 'boom'); if (!exPop) return; if (i) { exPop.showAll(); return; } exPop.reset(); EX_READS.forEach((_, k) => setTimeout(() => exPop.pop(k), 120 + k * 320)); }
  // KANA
  function knHira(i) { const r = $('#kn-hira'); if (!r) return; r.classList.add('show'); r.querySelectorAll('.kn-pair').forEach((p) => p.classList.add('morph')); }
  function knKata(i) { const r = $('#kn-kata'); if (!r) return; r.classList.add('show'); r.querySelectorAll('.kn-pair').forEach((p) => p.classList.add('morph')); }
  // MIX
  function mixWeave(i) { cls('#mix', 'weave'); }
  // RESOLVE
  function resolveSnap(i) { cls('#sc-resolve .misfit', 'resolved'); }
  // BEAUTY
  function beautyShow(i) { cls('#beauty', 'show'); }
  function beautyScroll(i) {
    const b = $('#beauty'); if (!b || b.querySelector('.ss-scroll')) return;
    const mini = document.createElement('div'); mini.className = 'ss-scroll mini filled';
    mini.innerHTML = `<div class="ss-col"><div class="ss-char"><span class="glyph cjk">山</span>${DOODLE.mountain}</div><div class="ss-char"><span class="glyph cjk">木</span>${DOODLE.tree}</div><div class="ss-char"><span class="glyph cjk">川</span>${DOODLE.river}</div></div>`;
    b.appendChild(mini); const arr = b.querySelector('.bt-arr'); if (arr) arr.style.opacity = '0';
  }
  function outroAssemble(i) { cls('#outro-ec', 'play'); }

  // ============================================================
  // SUBTITLES
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 130);
  }
  const SUBS = [
    [0.00, 'Around the year 500, the Japanese'],
    [1.80, 'copied the Chinese writing system.'],
    [3.98, 'Why? Because they <b>didn’t have one</b>.'],
    [6.12, 'But they very well had a <b>language</b> —'],
    [7.68, 'so what they did was take the Chinese writing,'],
    [9.50, 'and <b>bend</b> it for their own.'],
    [11.06, 'And the result is the <b>most complex</b>'],
    [12.60, 'writing system in the world.'],
    [14.20, 'Let me explain.'],
    [15.46, 'Back then, Japan had a spoken language —'],
    [17.36, 'but <b>no writing</b> at all.'],
    [18.80, 'The most advanced writing nearby was <b>Chinese</b>.'],
    [21.12, 'So Japan imported it <b>wholesale</b> —'],
    [22.96, 'characters and all.'],
    [24.16, 'One problem.'],
    [25.20, 'Chinese and Japanese are completely <b>unrelated</b> —'],
    [27.84, 'different grammar, different sounds.'],
    [29.80, 'It’s a bit like trying to write <b>English</b>'],
    [31.04, 'using only Chinese characters.'],
    [32.94, 'The pieces <b>didn’t line up</b>.'],
    [34.24, 'So the Japanese got creative.'],
    [35.88, 'They used each character <b>two different ways</b>:'],
    [38.20, 'sometimes for its <b>meaning</b>,'],
    [39.34, 'and sometimes purely for its <b>sound</b> —'],
    [41.04, 'to spell out native Japanese words.'],
    [43.30, 'Which left a strange legacy:'],
    [44.86, 'a single character ended up with several <b>readings</b> —'],
    [47.66, 'a Chinese-style one, and a native Japanese one.'],
    [50.68, 'To this day, the same <b>kanji</b>'],
    [52.14, 'can be read multiple ways depending on context —'],
    [55.02, 'one of the <b>hardest</b> parts of learning Japanese.'],
    [57.10, 'Then they went further.'],
    [58.26, 'They took certain characters and simplified them down'],
    [60.54, 'into two sets of small phonetic symbols —'],
    [62.64, '<b>hiragana</b> and <b>katakana</b> —'],
    [64.32, 'to handle the grammar and sounds'],
    [66.28, 'the borrowed characters couldn’t.'],
    [68.08, 'So today, written Japanese'],
    [69.32, 'mixes <b>all three</b> at once:'],
    [71.30, 'Chinese characters for meaning,'],
    [72.40, 'plus the two homegrown scripts <b>woven</b> around them.'],
    [75.22, 'Japan took a writing system'],
    [76.40, 'built for a totally different language —'],
    [78.32, 'and bent it, <b>patched</b> it,'],
    [79.72, 'and rebuilt it until it fit.'],
    [81.46, 'The result is one of the most <b>beautiful</b> —'],
    [83.56, 'and most <b>complicated</b> —'],
    [84.78, 'writing systems in the world.'],
    [86.60, 'All because, once,'],
    [88.24, 'there was nothing else to write with.'],
    [90.06, 'Wanna actually start learning Chinese —'],
    [92.16, 'where this all began?'],
    [93.60, 'Discover thousands of free exercises'],
    [95.72, 'and more learning content'],
    [96.74, 'on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES
  // ============================================================
  const CUES = [
    // ---- INTRO: borrow scene ----
    [0.00, (i) => enter($('#sc-borrow'), 'fade', 700, i, () => borrowStart(i))],
    [4.58, (i) => borrowJpEmpty(i)],
    [6.12, (i) => borrowJpSound(i)],
    [7.68, (i) => borrowHandoff(i)],
    [9.50, (i) => borrowBend(i)],
    // ---- INTRO: three-scripts reveal ----
    [11.06, (i) => enter($('#sc-hook'), 'zoom-out', 950, i)],
    [12.60, (i) => hookSplit(i)],
    [13.70, (i) => hookInvented(i)],
    // ---- EXPLANATION ----
    [15.46, (i) => { enter($('#sc-scroll'), 'drop', 1000, i, () => scrollShow(i)); if (i) scrollShow(i); }],
    [18.80, (i) => scrollFill(i)],
    [21.12, (i) => scrollFlood(i)],
    [25.20, (i) => enter($('#sc-unrelated'), 'rise', 1000, i, () => unrelSpeak(i))],
    [29.80, (i) => enter($('#sc-english'), 'pan-right', 1000, i, () => engJam(i))],
    [32.94, (i) => engNofit(i)],
    [35.18, (i) => enter($('#sc-twojobs'), 'zoom-in', 1000, i)],
    [38.20, (i) => tjMeaning(i)],
    [39.34, (i) => tjSound(i)],
    [44.86, (i) => enter($('#sc-readings'), 'drop', 1000, i)],
    [47.82, (i) => rdOn(i)],
    [49.18, (i) => rdKun(i)],
    [50.68, (i) => enter($('#sc-explode'), 'zoom-out', 1050, i)],
    [52.14, (i) => explodeBoom(i)],
    [58.26, (i) => enter($('#sc-kana'), 'rise', 1000, i)],
    [62.64, (i) => knHira(i)],
    [63.30, (i) => knKata(i)],
    [68.08, (i) => enter($('#sc-mix'), 'zoom-in', 1000, i, () => mixWeave(i))],
    [75.22, (i) => enter($('#sc-resolve'), 'zoom-out', 1050, i)],
    [78.32, (i) => resolveSnap(i)],
    [81.46, (i) => enter($('#sc-beauty'), 'fade', 900, i, () => beautyShow(i))],
    [86.60, (i) => beautyScroll(i)],
    [90.06, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(i); }],
  ];

  // ============================================================
  // SFX
  // ============================================================
  const SFX = [
    [3.20, 'pop', 0.50],                          // China speaks 氣
    [4.58, 'pop', 0.42],                          // Japan: empty bubble
    [6.12, 'pop', 0.45],                          // Japan: has speech
    [7.68, 'swoosh', 0.34],                       // bubble handed to Japan
    [9.50, 'pop', 0.50], [10.02, 'pop', 0.50],    // 気 echoes
    [11.06, 'swoosh', 0.50],                      // three-scripts zoom-out
    [12.70, 'pop', 0.45], [12.86, 'pop', 0.45], [13.02, 'pop', 0.45],
    [15.46, 'swoosh', 0.50],                      // scroll drop
    [18.80, 'pop', 0.5], [19.22, 'pop', 0.5], [19.64, 'pop', 0.5],
    [21.12, 'swoosh', 0.40],                      // wholesale flood
    [25.20, 'swoosh', 0.50],                      // unrelated rise
    [29.80, 'swoosh', 0.50],                      // english pan
    [32.94, 'swoosh', 0.34],                      // puzzle
    [35.18, 'swoosh', 0.50],                      // twojobs zoom-in
    [38.20, 'pop', 0.5], [39.34, 'pop', 0.5],
    [44.86, 'swoosh', 0.50],                      // readings drop
    [47.82, 'pop', 0.55], [49.18, 'pop', 0.55],
    [50.68, 'swoosh', 0.50],                      // explode zoom-out
    [52.40, 'pop', 0.55], [52.74, 'pop', 0.55], [53.08, 'pop', 0.55], [53.42, 'pop', 0.55],
    [53.76, 'pop', 0.55], [54.10, 'pop', 0.55], [54.44, 'pop', 0.55], [54.78, 'pop', 0.55],
    [58.26, 'swoosh', 0.50],                      // kana rise
    [62.64, 'pop', 0.5], [63.00, 'pop', 0.5], [63.30, 'pop', 0.5], [63.66, 'pop', 0.5],
    [68.08, 'swoosh', 0.50],                      // mix zoom-in
    [75.22, 'swoosh', 0.50],                      // resolve zoom-out
    [78.32, 'swoosh', 0.42],                      // resolve snap
    [81.46, 'swoosh', 0.40],                      // beauty
    [90.06, 'swoosh', 0.60],                      // outro
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
    current = null; gcam.s = 1; gcam.x = 0; gcam.y = 0; gdisp.s = 1; gdisp.x = 0; gdisp.y = 0;
    const bw = $('#borrow'); if (bw) bw.classList.remove('show');
    ['#bw-shared', '#bw-jpb', '#bw-jp2', '#bw-jp3'].forEach((s) => { const e = $(s); if (e) e.classList.remove('in', 'flip', 'sound'); });
    document.querySelectorAll('.bw-fig, .ss-fig, .ur-fig').forEach((e) => e.classList.remove('talk'));
    const hk = $('#hook'); if (hk) hk.classList.remove('split', 'invented');
    const ss = $('#scroll-scene'); if (ss) ss.classList.remove('show', 'filled', 'flood');
    const us = $('#unrel-scene'); if (us) us.classList.remove('speak');
    const es = $('#eng-scene'); if (es) es.classList.remove('jam', 'nofit');
    const tj = $('#twojobs'); if (tj) tj.classList.remove('split', 'meaning', 'sound');
    ['#rd-on', '#rd-kun'].forEach((s) => { const e = $(s); if (e) e.classList.remove('show'); });
    const ex = $('#explode'); if (ex) ex.classList.remove('boom'); if (exPop) exPop.reset();
    ['#kn-hira', '#kn-kata'].forEach((s) => { const r = $(s); if (r) { r.classList.remove('show'); r.querySelectorAll('.kn-pair').forEach((p) => p.classList.remove('morph')); } });
    const mx = $('#mix'); if (mx) mx.classList.remove('weave');
    const rv = $('#sc-resolve .misfit'); if (rv) rv.classList.remove('resolved');
    const bt = $('#beauty'); if (bt) { bt.classList.remove('show'); const m = bt.querySelector('.ss-scroll'); if (m) m.remove(); const a = bt.querySelector('.bt-arr'); if (a) a.style.opacity = ''; }
    const ec = $('#outro-ec'); if (ec) ec.classList.remove('play');
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

  function play() { hardReset(); vo.currentTime = 0; lastT = 0; vo.play().catch(() => {}); }
  window.__play = play;
  window.__seek = (t) => { vo.pause(); vo.currentTime = t; lastT = t; applyUpTo(t); };
  $('#btn-play').addEventListener('click', () => { if (vo.paused) play(); else vo.pause(); });
  $('#seek').addEventListener('input', (e) => { window.__seek(parseFloat(e.target.value)); });
  addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); if (vo.paused) play(); else vo.pause(); } if (e.key.toLowerCase() === 'c') document.body.classList.toggle('clean'); });
  hardReset();
})();
