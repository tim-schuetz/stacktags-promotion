/* ============================================================
   "Why Japan stole China's writing" — NEW STYLE choreography
   A continuous faux-3D camera over a persistent dynamic grid.
   Everything is driven off the narration's audio.currentTime (cue
   engine) so each beat lands on the spoken word. Reuses the default
   elements: figure (unrelated languages), text-popup (readings),
   outro, + the shared depth-grid / theme / subtitles.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);

  const stage = $('#stage');
  const grid = $('#grid');
  const vo = $('#vo');
  const subsLine = $('#subs-line');

  function fit() {
    const s = Math.min(innerWidth / 1080, innerHeight / 1920);
    stage.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();

  // crude hand-drawn doodles (humor device: characters that look like pictures)
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

  // ============================================================
  // SCENE BUILDERS (run once)
  // ============================================================
  // HOOK — a real Japanese sentence 私はテレビを見る split into its 3 scripts
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
      <div class="hk-invented"><span class="sweep"></span><span class="txt">two — invented in Japan</span></div>
    </div>`;

  // MISFIT + RESOLVE share the same structure
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

  // BORROW scene — China & Japan side by side; a Chinese figure speaks 氣, the nearest
  // Japanese figure takes the bubble (tail flips L→R), the others echo it slightly
  // modified into the Japanese form 気 (米 → メ).
  (function buildBorrow() {
    const P = window.makePerson || (() => '');
    const scholar = P({ robe: '#119271', collar: '#eaf5f1', obi: '#0c5f4b', skin: '#f1c49a', hair: '#241f1b', style: 'scholar', arm: 'up', w: 232 });
    const j1 = P({ robe: '#e6ebe9', collar: '#ffffff', obi: '#35A292', skin: '#f6cfa6', hair: '#2c2622', style: 'short', w: 206 });
    const j2 = P({ robe: '#cfe6dd', collar: '#ffffff', obi: '#232B33', skin: '#efc197', hair: '#34291f', style: 'side', w: 198 });
    const j3 = P({ robe: '#ffffff', collar: '#e7f4ef', obi: '#35A292', skin: '#f3c79e', hair: '#241f1b', style: 'headband', w: 190 });
    $('#sc-borrow').innerHTML = `
      <div class="borrow" id="borrow">
        <svg class="bw-map" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid meet">
          <path class="bw-land china" d="M150,1010 C260,965 380,975 440,1035 C475,1070 470,1180 458,1265 C444,1370 270,1405 175,1360 C100,1325 95,1215 108,1150 C118,1095 95,1050 150,1010 Z"/>
          <path class="bw-land japan" d="M650,1050 C760,1010 900,1015 958,1075 C1000,1118 995,1228 978,1300 C958,1392 780,1422 690,1374 C625,1340 622,1232 632,1172 C640,1122 615,1085 650,1050 Z"/>
        </svg>
        <div class="bw-label cn">中国<small>China</small></div>
        <div class="bw-label jp">日本<small>Japan</small></div>
        <div class="bw-fig cnf">${scholar}</div>
        <div class="bw-fig j1">${j1}</div>
        <div class="bw-fig j2">${j2}</div>
        <div class="bw-fig j3">${j3}</div>
        <div class="bw-bub shared" id="bw-shared"><span class="bw-char cjk">氣</span><span class="tail"></span></div>
        <div class="bw-bub jp j2b" id="bw-jp2"><span class="bw-char cjk">気</span><span class="tail c"></span></div>
        <div class="bw-bub jp j3b" id="bw-jp3"><span class="bw-char cjk">気</span><span class="tail c"></span></div>
      </div>`;
  })();

  // SCROLL — figure talks beside a blank scroll that then fills with pictograph characters
  $('#sc-scroll').innerHTML = `
    <div class="scroll-scene" id="scroll-scene">
      <div class="ss-tag tag-pill" id="ss-tag">~1,500 years ago</div>
      <img class="ss-fig" src="assets/img/figure_a_cut.png" alt="" onerror="this.style.display='none'">
      <div class="ss-bub"><span class="cjk">ぺらぺら…</span></div>
      <div class="ss-scroll" id="ss-scroll">
        <div class="ss-char"><span class="glyph cjk">山</span>${DOODLE.mountain}</div>
        <div class="ss-char"><span class="glyph cjk">木</span>${DOODLE.tree}</div>
        <div class="ss-char"><span class="glyph cjk">川</span>${DOODLE.river}</div>
      </div>
    </div>`;

  // IMPORT — 2D East-Asia map; characters sail a dashed route China → Japan
  $('#sc-import').innerHTML = `
    <div class="map-scene" id="map-scene">
      <svg class="map-svg" viewBox="0 0 1080 1080" preserveAspectRatio="xMidYMid meet">
        <path class="land china" d="M120,300 C200,250 360,250 430,300 C470,330 470,420 460,520 C450,640 410,760 330,800 C240,840 150,800 120,700 C95,620 110,520 120,460 C126,400 90,340 120,300 Z"/>
        <path class="land japan" d="M790,360 C840,340 880,380 870,430 C860,475 815,500 800,470 C788,445 760,400 790,360 Z"/>
        <path class="land japan" d="M860,500 C915,485 955,540 930,610 C905,675 855,700 835,660 C818,620 815,520 860,500 Z"/>
        <path class="land japan" d="M930,640 C965,635 985,675 968,705 C950,735 915,735 905,705 C898,682 905,648 930,640 Z"/>
        <path class="route" d="M 430 600 Q 640 380 850 540"/>
      </svg>
      <div class="map-label cn">中国<small>China</small></div>
      <div class="map-label jp">日本<small>Japan</small></div>
      <div class="map-chip cjk c0">山</div>
      <div class="map-chip cjk c1">木</div>
      <div class="map-chip cjk c2">川</div>
      <div class="map-chip cjk c3">字</div>
    </div>`;

  // UNRELATED — two figures read the SAME character 字 in garbled, different ways
  $('#sc-unrelated').innerHTML = `
    <div class="fig-scene" id="unrel-scene">
      <div class="fig-stage">
        <span class="fig-parch">${PARCH('字')}</span>
        <img class="fig fig-a" src="assets/img/figure_a_cut.png" alt="" onerror="this.style.display='none'">
        <img class="fig fig-b" src="assets/img/figure_b_cut.png" alt="" onerror="this.style.display='none'">
        <div class="fig-bub fig-bub-l">%$#!</div>
        <div class="fig-bub fig-bub-r">#@¿!</div>
        <div class="fig-flag l cjk">中</div>
        <div class="fig-flag r cjk">日</div>
      </div>
    </div>`;

  // ENGLISH — writing "HELLO" with kanji-by-sound → a piece that won't fit
  $('#sc-english').innerHTML = `
    <div class="eng-scene" id="eng-scene">
      <div class="eng-word">HELLO</div>
      <div class="eng-boxes">
        <div class="eng-box b0"><span class="cjk">哈</span></div>
        <div class="eng-box b1 over"><span class="cjk">楼</span></div>
        <div class="eng-box b2"><span class="cjk">罗</span></div>
        <div class="eng-box b3 over"><span class="cjk">呜</span></div>
        <div class="eng-box b4"><span class="cjk">欧</span></div>
      </div>
      <div class="eng-puzzle">
        <div class="pz-slot"></div>
        <div class="pz-piece cjk">語</div>
      </div>
    </div>`;

  // TWO JOBS — 木 splits into meaning (tree) and sound (ki)
  $('#sc-twojobs').innerHTML = `
    <div class="twojobs" id="twojobs">
      <div class="tj-char cjk">木</div>
      <div class="tj-branch meaning">
        ${DOODLE.tree}
        <div class="tj-cap">tree<small>its meaning</small></div>
      </div>
      <div class="tj-branch sound">
        <div class="tj-read">ki</div>
        <div class="tj-brick"><span class="cjk">き</span><span class="cjk">の</span><span class="cjk">こ</span></div>
        <div class="tj-cap">just a sound<small>spelling a word</small></div>
      </div>
    </div>`;

  // READINGS — 山 with on'yomi (san) + kun'yomi (yama)
  $('#sc-readings').innerHTML = `
    <div class="readings" id="readings">
      <div class="rd-char cjk">山</div>
      <div class="rd-one on" id="rd-on">
        <div class="rd-kana cjk">サン</div><div class="rd-rome">san</div>
        <div class="rd-tag"><span class="cjk">音読み</span> · from Chinese</div>
      </div>
      <div class="rd-one kun" id="rd-kun">
        <div class="rd-kana cjk">やま</div><div class="rd-rome">yama</div>
        <div class="rd-tag"><span class="cjk">訓読み</span> · native</div>
      </div>
    </div>`;

  // EXPLODE — 生 with many readings popping out (text-popup)
  $('#sc-explode').innerHTML = `<div class="explode" id="explode"><div class="ex-char cjk">生</div><div id="ex-host"></div></div>`;
  const EX_READS = [
    { text: 'sei', x: -360, y: -300, size: 78, key: true },
    { text: 'shō', x: 330, y: -330, size: 78 },
    { text: 'nama', x: -430, y: -40, size: 78, key: true },
    { text: 'i', x: 420, y: -30, size: 78 },
    { text: 'ki', x: -360, y: 230, size: 78 },
    { text: 'ha', x: 340, y: 250, size: 78, key: true },
    { text: 'u', x: -150, y: 380, size: 70 },
    { text: 'fu', x: 170, y: 390, size: 70 },
  ];
  let exPop = null;
  try {
    exPop = new StacktagsTextPopup($('#ex-host'), { words: EX_READS });
  } catch (e) { /* fail soft */ }

  // KANA — kanji → kana morphs (hiragana + katakana)
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
  const MIX_GLYPHS = [['私','kanji'],['は','hira'],['テ','kata'],['レ','kata'],['ビ','kata'],['を','hira'],['見','kanji'],['る','hira']];
  $('#sc-mix').innerHTML = `
    <div class="mix" id="mix">
      <div class="mix-line cjk">${MIX_GLYPHS.map(([g,c],i)=>`<span class="g ${c} i${i}">${g}</span>`).join('')}</div>
      <div class="mix-legend">
        <span class="kanji"><i></i>meaning</span><span class="hira"><i></i>hiragana</span><span class="kata"><i></i>katakana</span>
      </div>
    </div>`;

  // BEAUTY — calm final arrangement of the three scripts
  $('#sc-beauty').innerHTML = `
    <div class="beauty" id="beauty">
      <div class="bt-arr cjk"><span class="g kanji">漢</span><span class="g hira">あ</span><span class="g kata">ア</span></div>
    </div>`;

  // OUTRO endcard (logo)
  const outroLogo = $('#outro-logo');
  if (outroLogo && window.makeStacktagsLogo) outroLogo.innerHTML = window.makeStacktagsLogo({ size: 560 });

  // ============================================================
  // GRID CAMERA (persistent, always subtly moving)
  // ============================================================
  const gcam = { s: 1, x: 0, y: 0 };
  const gdisp = { s: 1, x: 0, y: 0 };
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
      gcam.s = gs0 * (p0.grid != null ? p0.grid : 1);
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

  // ---- in-scene state helpers ----
  const cls = (sel, c, on) => { const el = $(sel); if (el) el.classList[on === false ? 'remove' : 'add'](c); };

  function hookSplit(i) { cls('#hook', 'split'); }
  function hookInvented(i) { cls('#hook', 'invented'); }
  // BORROW scene
  function borrowTalk(sel) { const e = $(sel); if (!e) return; e.classList.remove('talk'); void e.offsetWidth; e.classList.add('talk'); }
  function borrowStart(i) {
    const b = $('#borrow'); if (b) b.classList.add('show');
    const sh = $('#bw-shared'); if (sh) sh.classList.add('in');
    if (!i) setTimeout(() => borrowTalk('.bw-fig.cnf'), 120);   // China speaks 氣
  }
  function borrowHandoff(i) {            // nearest Japanese figure takes the bubble: tail flips L→R, goes teal
    const sh = $('#bw-shared'); if (sh) sh.classList.add('flip');
    if (!i) borrowTalk('.bw-fig.j1');
  }
  function borrowJP2(i) { const e = $('#bw-jp2'); if (e) e.classList.add('in'); if (!i) borrowTalk('.bw-fig.j2'); }
  function borrowJP3(i) { const e = $('#bw-jp3'); if (e) e.classList.add('in'); if (!i) borrowTalk('.bw-fig.j3'); }
  function scrollShow(i) { cls('#scroll-scene', 'show'); }
  function scrollFill(i) { cls('#scroll-scene', 'filled'); }
  function mapSail(i) { const m = $('#map-scene'); if (!m) return; if (i) m.classList.add('instant'); m.classList.add('sail'); cls('.map-svg .china', 'lit'); }
  function figSpeak(i) { cls('#unrel-scene', 'speak'); }
  function engJam(i) { cls('#eng-scene', 'jam'); }
  function engNofit(i) { cls('#eng-scene', 'nofit'); }
  function tjMeaning(i) { cls('#twojobs', 'split'); cls('#twojobs', 'meaning'); }
  function tjSound(i) { cls('#twojobs', 'split'); cls('#twojobs', 'sound'); }
  function rdOn(i) { cls('#rd-on', 'show'); }
  function rdKun(i) { cls('#rd-kun', 'show'); }
  function explodeBoom(i) {
    cls('#explode', 'boom');
    if (!exPop) return;
    if (i) { exPop.showAll(); return; }
    exPop.reset();
    EX_READS.forEach((_, k) => setTimeout(() => exPop.pop(k), 120 + k * 360));
  }
  function knHira(i) { const r = $('#kn-hira'); if (!r) return; r.classList.add('show'); r.querySelectorAll('.kn-pair').forEach((p) => p.classList.add('morph')); }
  function knKata(i) { const r = $('#kn-kata'); if (!r) return; r.classList.add('show'); r.querySelectorAll('.kn-pair').forEach((p) => p.classList.add('morph')); }
  function mixWeave(i) { cls('#mix', 'weave'); }
  function resolveSnap(i) { cls('#sc-resolve .misfit', 'resolved'); }
  function beautyShow(i) { cls('#beauty', 'show'); }
  function beautyScroll(i) {
    // a small callback to the once-blank scroll, now full
    const b = $('#beauty'); if (!b || b.querySelector('.ss-scroll')) return;
    const mini = document.createElement('div');
    mini.className = 'ss-scroll mini filled';
    mini.innerHTML = `<div class="ss-char"><span class="glyph cjk">山</span>${DOODLE.mountain}</div>
      <div class="ss-char"><span class="glyph cjk">木</span>${DOODLE.tree}</div>
      <div class="ss-char"><span class="glyph cjk">川</span>${DOODLE.river}</div>`;
    b.appendChild(mini);
    const arr = b.querySelector('.bt-arr'); if (arr) arr.style.opacity = '0';
  }
  function outroAssemble(i) { cls('#outro-ec', 'play'); }

  // ============================================================
  // SUBTITLES (verbatim narration, one short line at a time)
  // ============================================================
  function setSub(html, instant) {
    if (instant) { subsLine.innerHTML = html; subsLine.classList.add('in'); return; }
    subsLine.classList.remove('in');
    setTimeout(() => { subsLine.innerHTML = html; subsLine.classList.add('in'); }, 130);
  }
  const SUBS = [
    [0.00, 'Japan doesn’t use Chinese characters'],
    [1.70, 'because the two languages are <b>related</b> —'],
    [3.88, 'they’re <b>not</b>, at all.'],
    [5.28, 'Japan borrowed China’s writing'],
    [6.48, 'for a language it simply <b>didn’t fit</b> —'],
    [8.28, 'and then spent centuries <b>duct-taping</b> it together.'],
    [10.64, 'Here’s how.'],
    [11.36, 'Rewind about 1,500 years.'],
    [13.46, 'Japan had a spoken language —'],
    [14.88, 'but <b>no writing</b> at all.'],
    [16.20, 'The most advanced writing nearby was <b>Chinese</b>.'],
    [18.56, 'So Japan imported it <b>wholesale</b> —'],
    [20.58, 'characters and all.'],
    [21.60, 'One problem.'],
    [22.58, 'Chinese and Japanese are completely <b>unrelated</b> —'],
    [25.14, 'different grammar, different sounds.'],
    [27.04, 'It’s a bit like trying to write <b>English</b>'],
    [28.40, 'using only Chinese characters.'],
    [30.38, 'The pieces <b>didn’t line up</b>.'],
    [31.72, 'So the Japanese got creative.'],
    [33.54, 'They used each character <b>two different ways</b>:'],
    [35.88, 'sometimes for its <b>meaning</b>,'],
    [37.08, 'and sometimes purely for its <b>sound</b> —'],
    [38.88, 'to spell out native Japanese words.'],
    [41.10, 'Which left a strange legacy:'],
    [42.60, 'a single character ended up with several <b>readings</b> —'],
    [45.20, 'a Chinese-style one, and a native Japanese one.'],
    [47.86, 'To this day, the same <b>kanji</b>'],
    [49.48, 'can be read multiple ways depending on context —'],
    [52.32, 'one of the <b>hardest</b> parts of learning Japanese.'],
    [54.48, 'Then they went further.'],
    [55.68, 'They took certain characters and simplified them down'],
    [58.20, 'into two sets of small phonetic symbols —'],
    [60.04, '<b>hiragana</b> and <b>katakana</b> —'],
    [61.62, 'to handle the grammar and sounds'],
    [63.48, 'the borrowed characters couldn’t.'],
    [65.34, 'So today, written Japanese'],
    [66.82, 'mixes <b>all three</b> at once:'],
    [68.74, 'Chinese characters for meaning,'],
    [70.16, 'plus the two homegrown scripts <b>woven</b> around them.'],
    [72.62, 'Japan took a writing system'],
    [73.82, 'built for a totally different language —'],
    [75.74, 'and bent it, <b>patched</b> it,'],
    [77.10, 'and rebuilt it until it fit.'],
    [78.48, 'The result is one of the most <b>beautiful</b> —'],
    [81.50, 'and most <b>complicated</b> —'],
    [82.62, 'writing systems in the world.'],
    [84.42, 'All because, once,'],
    [85.42, 'there was nothing else to write with.'],
    [87.10, 'Wanna actually start learning Chinese —'],
    [88.86, 'where this all began?'],
    [90.24, 'Discover thousands of free exercises'],
    [91.84, 'and more learning content'],
    [92.94, 'on <b>stacktags.io</b>.'],
  ];

  // ============================================================
  // CUES — scene actions on the narration timeline
  // ============================================================
  const CUES = [
    [0.00, (i) => enter($('#sc-hook'), 'fade', 650, i)],
    [3.88, (i) => hookSplit(i)],
    [4.70, (i) => hookInvented(i)],
    [5.28, (i) => enter($('#sc-borrow'), 'zoom-out', 700, i, () => borrowStart(i))],
    [6.95, (i) => borrowHandoff(i)],
    [7.95, (i) => borrowJP2(i)],
    [8.85, (i) => borrowJP3(i)],
    [11.36, (i) => { enter($('#sc-scroll'), 'drop', 1050, i, () => scrollShow(i)); if (i) scrollShow(i); }],
    [16.20, (i) => scrollFill(i)],
    [18.56, (i) => enter($('#sc-import'), 'zoom-out', 1100, i, () => mapSail(i))],
    [22.58, (i) => enter($('#sc-unrelated'), 'rise', 1050, i, () => figSpeak(i))],
    [27.04, (i) => enter($('#sc-english'), 'pan-right', 1050, i, () => engJam(i))],
    [30.38, (i) => engNofit(i)],
    [33.54, (i) => enter($('#sc-twojobs'), 'zoom-in', 1050, i)],
    [35.88, (i) => tjMeaning(i)],
    [37.08, (i) => tjSound(i)],
    [42.60, (i) => enter($('#sc-readings'), 'drop', 1050, i)],
    [45.20, (i) => rdOn(i)],
    [46.50, (i) => rdKun(i)],
    [47.86, (i) => enter($('#sc-explode'), 'zoom-out', 1100, i)],
    [48.98, (i) => explodeBoom(i)],
    [57.96, (i) => enter($('#sc-kana'), 'rise', 1050, i)],
    [60.04, (i) => knHira(i)],
    [60.90, (i) => knKata(i)],
    [65.34, (i) => enter($('#sc-mix'), 'zoom-in', 1050, i, () => mixWeave(i))],
    [72.62, (i) => enter($('#sc-resolve'), 'zoom-out', 1100, i)],
    [75.74, (i) => resolveSnap(i)],
    [78.48, (i) => enter($('#sc-beauty'), 'fade', 900, i, () => beautyShow(i))],
    [84.42, (i) => beautyScroll(i)],
    [87.10, (i) => { enter($('#sc-outro'), 'lift', 1100, i); outroAssemble(i); }],
  ];

  // ============================================================
  // SFX — swoosh when the grid moves OR a default element animates; pop per word
  // ============================================================
  const SFX = [
    [3.88, 'swoosh', 0.42],                       // hook split (grid zoom-out)
    [4.05, 'pop', 0.45], [4.18, 'pop', 0.45], [4.31, 'pop', 0.45],
    [5.28, 'swoosh', 0.50],                       // borrow scene zoom-out (grid moves)
    [5.75, 'pop', 0.50],                          // China speaks 氣
    [6.95, 'swoosh', 0.34],                       // bubble handed to Japan (tail flips)
    [7.95, 'pop', 0.50], [8.85, 'pop', 0.50],     // the two Japanese echoes 気
    [11.36, 'swoosh', 0.50],                      // scroll drop
    [16.20, 'pop', 0.5], [16.62, 'pop', 0.5], [17.04, 'pop', 0.5],   // scroll fills
    [18.56, 'swoosh', 0.50],                      // map zoom-out + sail
    [22.58, 'swoosh', 0.50],                      // figure element (speak)
    [27.04, 'swoosh', 0.50],                      // english pan
    [30.38, 'swoosh', 0.34],                      // puzzle won't fit
    [33.54, 'swoosh', 0.50],                      // twojobs zoom-in
    [35.88, 'pop', 0.5], [37.08, 'pop', 0.5],     // meaning / sound branches
    [42.60, 'swoosh', 0.50],                      // readings drop
    [45.20, 'pop', 0.55], [46.50, 'pop', 0.55],   // san / yama
    [47.86, 'swoosh', 0.50],                      // explode zoom-out
    // 生 readings popping out
    [49.10, 'pop', 0.55], [49.46, 'pop', 0.55], [49.82, 'pop', 0.55], [50.18, 'pop', 0.55],
    [50.54, 'pop', 0.55], [50.90, 'pop', 0.55], [51.26, 'pop', 0.55], [51.62, 'pop', 0.55],
    [57.96, 'swoosh', 0.50],                      // kana rise
    [60.04, 'pop', 0.5], [60.40, 'pop', 0.5], [60.90, 'pop', 0.5], [61.26, 'pop', 0.5],   // kana morphs
    [65.34, 'swoosh', 0.50],                      // mix zoom-in
    [72.62, 'swoosh', 0.50],                      // resolve zoom-out
    [75.74, 'swoosh', 0.42],                      // resolve snap (tape peels, kana snap)
    [78.48, 'swoosh', 0.40],                      // beauty (soft)
    [87.10, 'swoosh', 0.60],                      // outro assemble
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
    // clear all scene states
    ['#hook'].forEach((s) => { const e = $(s); if (e) e.classList.remove('split', 'invented'); });
    const bw = $('#borrow'); if (bw) bw.classList.remove('show');
    ['#bw-shared', '#bw-jp2', '#bw-jp3'].forEach((s) => { const e = $(s); if (e) e.classList.remove('in', 'flip'); });
    document.querySelectorAll('.bw-fig').forEach((e) => e.classList.remove('talk'));
    const ss = $('#scroll-scene'); if (ss) ss.classList.remove('show', 'filled');
    const mp = $('#map-scene'); if (mp) { mp.classList.remove('sail', 'instant'); const c = $('.map-svg .china'); if (c) c.classList.remove('lit'); }
    const us = $('#unrel-scene'); if (us) us.classList.remove('speak');
    const es = $('#eng-scene'); if (es) es.classList.remove('jam', 'nofit');
    const tj = $('#twojobs'); if (tj) tj.classList.remove('split', 'meaning', 'sound');
    ['#rd-on', '#rd-kun'].forEach((s) => { const e = $(s); if (e) e.classList.remove('show'); });
    const ex = $('#explode'); if (ex) ex.classList.remove('boom'); if (exPop) exPop.reset();
    ['#kn-hira', '#kn-kata'].forEach((s) => { const r = $(s); if (r) { r.classList.remove('show'); r.querySelectorAll('.kn-pair').forEach((p) => p.classList.remove('morph')); } });
    const mx = $('#mix'); if (mx) mx.classList.remove('weave');
    const rv = $('#sc-resolve .misfit'); if (rv) rv.classList.remove('resolved');
    const bt = $('#beauty'); if (bt) { bt.classList.remove('show'); const mini = bt.querySelector('.ss-scroll'); if (mini) mini.remove(); const arr = bt.querySelector('.bt-arr'); if (arr) arr.style.opacity = ''; }
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
    gdisp.s += (gcam.s - gdisp.s) * 0.07;
    gdisp.x += (gcam.x - gdisp.x) * 0.07;
    gdisp.y += (gcam.y - gdisp.y) * 0.07;
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
