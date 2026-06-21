/* ============================================================
   Stacktags — "One poem with only one word — possible in Chinese"
   The Lion-Eating Poet in the Stone Den (施氏食獅史) by Yuen Ren Chao.

   Opening sequence is a bespoke scene: the whole poem scrolls up, then its
   characters fly out of the text into a cluster (every one a "shi"), then fly
   again into the title, then the linguist portrait slides up from below (its
   dashed silhouette baked in) while the title stays. From the "tones" beat on,
   the video rides the default depth element (moving-grid fly-through), closed
   by the default OUTRO. Everything is keyed to the narration audio (#vo).
   window.__play() runs it live; window.__seek(t) jumps to a still state.
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const vo = $('#vo');
  const DUR = 68.680;

  // ---- scene helpers -------------------------------------------------
  const SCENES = ['open', 'depth', 'outro'];
  function setScene(name) {
    SCENES.forEach((s) => $('#scene-' + s).classList.toggle('active', s === name));
  }

  // ---- small HTML builders for the conceptual beats ------------------
  const cut = 'assets/cutouts/';
  function bars(n) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<i style="animation-delay:${(-(i * 0.07)).toFixed(2)}s"></i>`;
    return `<div class="wv">${s}</div>`;
  }
  const TONE_PATH = {
    high: 'M10 10 H110', rising: 'M10 32 L110 8',
    dip: 'M12 12 C38 38 84 38 108 14', falling: 'M10 8 L110 34',
  };
  function toneSVG(kind) { return `<svg class="tc" viewBox="0 0 120 40"><path d="${TONE_PATH[kind]}"/></svg>`; }

  // the full poem (every character is read "shi")
  const POEM_WALL = '石室詩士施氏，嗜獅，誓食十獅。氏時時適市視獅。十時，適十獅適市。是時，適施氏適市。氏視是十獅，恃矢勢，使是十獅逝世。氏拾是十獅屍，適石室。石室濕，氏使侍拭石室。石室拭，氏始試食是十獅屍。食時，始識是十獅屍，實十石獅屍。試釋是事。';

  const FAN = [
    { h: '詩', g: 'poem',  fx: 0,    fy: -280 },
    { h: '獅', g: 'lion',  fx: 242,  fy: -140 },
    { h: '石', g: 'stone', fx: 242,  fy: 140 },
    { h: '史', g: 'story', fx: 0,    fy: 280 },
    { h: '是', g: 'this',  fx: -242, fy: 140 },
    { h: '食', g: 'eat',   fx: -242, fy: -140 },
  ];
  function fanHTML(core) {
    return `<div class="b-fan"><div class="core cjk">${core}</div>` +
      FAN.map(f => `<div class="fi" style="--fx:${f.fx}px;--fy:${f.fy}px"><span class="han">${f.h}</span><span class="gl">${f.g}</span></div>`).join('') +
      `</div>`;
  }

  // #8 — the legible poem shown again at the "zero confusion" beat
  function poemBackHTML(capHtml) {
    return `<div class="b-poemback"><div class="pb cjk">${POEM_WALL}</div>` +
      (capHtml ? `<div class="pbcap">${capHtml}</div>` : '') + `</div>`;
  }
  // the poem with a turquoise "shi" pinyin row that SLIDES IN under each line
  // (every character is just "shi") — revealed on `.py-in`
  function poemPyHTML(capHtml) {
    let body = '', li = 0;
    for (let i = 0; i < POEM_WALL.length; i += 11) {
      const chunk = POEM_WALL.substr(i, 11);
      let py = '';
      for (const ch of chunk) py += /[，。、；：！？]/.test(ch) ? '<i class="sp"></i>' : '<i>shi</i>';
      body += `<div class="ppl"><div class="ppl-han cjk">${chunk}</div><div class="ppl-py" style="transition-delay:${(li * 0.1).toFixed(2)}s">${py}</div></div>`;
      li++;
    }
    return `<div class="b-poempy"><div class="pp">${body}</div>` +
      (capHtml ? `<div class="pbcap">${capHtml}</div>` : '') + `</div>`;
  }
  // #5 — nine more lions rising from below (staggered)
  function lionsHTML() {
    const P = [[90,210],[235,210],[380,210],[525,210],[670,210],[160,30],[305,30],[450,30],[595,30]];
    let s = '';
    P.forEach(([x, y], i) => { s += `<img src="${cut}lion.png" style="left:${x}px;bottom:${y}px;animation-delay:${(i * 0.07).toFixed(2)}s"/>`; });
    return `<div class="b-lions">${s}</div>`;
  }
  // #6 — the poet rises up to meet the market
  function marketHTML() {
    return `<div class="b-market"><img class="mk-market" src="${cut}market.png"/><img class="mk-poet" src="${cut}poet.png"/></div>`;
  }

  // ---- depth-transition spine: beats 5+ (the opening handles 0–4 bespoke) ----
  const STEPS = [
    // 0–4 are handled by the bespoke opening scene; kept here only so depth indices line up
    { text: `<div class="b-hero"><div class="bh-word">shī</div></div>` },                                   // 0 (unused)
    { text: `<div class="b-hero"><div class="bh-word">shī</div></div>` },                                   // 1 (unused)
    { text: `<div class="b-hero"><div class="bh-word">shī</div></div>` },                                   // 2 (unused)
    { text: `<div class="b-hero"><div class="bh-word">shī</div></div>` },                                   // 3 (unused)
    { image: cut + 'chao_dotted.png', atX: 0, atY: -30, atScale: 0.92 },                                    // 4 (unused)
    // 5 — the four tones, each with its contour
    { text: `<div class="b-tones"><div class="bt-grid">
        <div class="tone"><span class="tw">shī</span>${toneSVG('high')}</div>
        <div class="tone"><span class="tw">shí</span>${toneSVG('rising')}</div>
        <div class="tone"><span class="tw">shǐ</span>${toneSVG('dip')}</div>
        <div class="tone"><span class="tw">shì</span>${toneSVG('falling')}</div>
      </div><div class="b-cap">four flavors of a <b>single syllable</b></div></div>` },
    // 6 — read it aloud: a busy waveform + the shi-blur
    { text: `<div class="b-wave">${bars(27)}<div class="blur">shi shi shi shi…</div></div>` },
    // 7 — the baffled listener: the Mandarin speaker + a garbled #!/&%* bubble
    { text: `<div class="b-nonsense"><div class="nbubble">#!/&amp;%*</div><img class="nf" src="${cut}speaker_mandarin.png" alt=""/></div>` },
    // 8 — a wall of the exact same sound
    { text: `<div class="b-soundwall"><div class="brick">${'<span>shi</span>'.repeat(12)}</div><div class="b-cap">a wall of the <b>exact same</b> sound</div></div>` },
    // 9 — on paper: every character is a different meaning
    { text: `<div class="b-paper"><div class="pg">
        <div class="cell"><span class="han cjk">詩</span><span class="gl">poet</span></div>
        <div class="cell"><span class="han cjk">獅</span><span class="gl">lion</span></div>
        <div class="cell"><span class="han cjk">食</span><span class="gl">eat</span></div>
        <div class="cell"><span class="han cjk">十</span><span class="gl">ten</span></div>
        <div class="cell"><span class="han cjk">市</span><span class="gl">market</span></div>
        <div class="cell"><span class="han cjk">石</span><span class="gl">stone</span></div>
      </div></div>` },
    // 10 — a poet named Shi (cut-out, upper so the rising lions have room below)
    { image: cut + 'poet.png', atX: 0, atY: -120, atScale: 0.82 },
    // 11 — one lion RISES from below, beside the poet (#5)
    { image: cut + 'lion.png', atX: 250, atY: -30, atScale: 0.42 },
    // 12 — nine MORE lions rise from below (#5 — no separate "ten" scene)
    { text: lionsHTML() },
    // 13 — goes to the market: the poet rises up to meet it (#6)
    { text: marketHTML() },
    // 14 — the twist: they were ten STONE lions (cut-out)
    { image: cut + 'stone_lion.png', atX: 0, atY: 140, atScale: 1.0 },
    // 15 — one "shì" fans out into clearly different characters
    { text: fanHTML('shì') },
    // 16 — the poem (zero confusion); its "shi" pinyin slides in under each line
    //      at the "their shape, not their sound" cue (replaces the old beat 17)
    { text: poemPyHTML('every line — just <b>shi</b>') },
    // 17 — (unused: the pinyin reveal happens on beat 16, no separate transition)
    { text: poemBackHTML('') },
  ];

  // beat i entered at time t with camera move `mode`. Beats 1–4 are the OPENING
  // (handled bespoke below); depth runs from beat 5 (tones) on.
  // Anchored to script_audio.mp3 (98.22s) via OpenAI Whisper word-level timestamps.
  const OP_CLUSTER_T = 7.52;    // "shi." — characters fly out of the poem into the cluster
  const OP_TITLE_T   = 11.38;   // "It's called …" — characters fly into the title
  const OP_PORTRAIT_T= 14.54;   // "written by the linguist" — portrait slides up, title stays
  const DEPTH_START  = 18.30;   // hand off to the tones beat at "and the only thing separating them…"

  const BEATS = [
    { i: 6,  t: 29.38, mode: 'lift'      },   // the shi-blur (read aloud)
    { i: 7,  t: 30.80, mode: 'zoom-in'   },   // to your ears (Mandarin speaker + #!/&%* bubble)
    { i: 8,  t: 33.96, mode: 'rise'      },   // wall of sound RISES from below, the speaker stays + slides up (#3)
    { i: 9,  t: 37.36, mode: 'zoom-out'  },   // look at it written down
    { i: 10, t: 41.16, mode: 'zoom-in'   },   // a poet named Shi
    { i: 11, t: 42.76, mode: 'rise'      },   // a lion rises from below (#5)
    { i: 12, t: 44.34, mode: 'rise'      },   // nine more lions rise (#5)
    { i: 13, t: 45.60, mode: 'zoom-in'   },   // poet rises up to the market (#6)
    { i: 14, t: 50.30, mode: 'zoom-out'  },   // … ten STONE lions (reveal lands on "stone lions")
    { i: 15, t: 52.16, mode: 'pan-left'  },   // every shi a different character
    { i: 16, t: 55.08, mode: 'zoom-in'   },   // the poem (zero confusion / whole trick)
  ];
  const PINYIN_T = 58.96;   // "…by their shape, not their sound" — the "shi" pinyin slides in on beat 16
  // #7 — the new (shortened) audio ends at "…not their sound" then goes straight to
  // the outro CTA. Outro endcard appears as "Want to actually start learning Chinese?" begins.
  const OUTRO_START = 62.06;   // "Want…" @62.06 (right after "…not their sound" @61.48)

  // ---- subtitles — mirror the spoken line EXACTLY, one line at a time ----
  // (NOTE: the audio still contains "So here's what it sounds like" and the whole
  // post-"sound" tail; those subtitles stay until the new shortened audio lands.)
  const SUBS = [
    [0.00,  'What you see here is a poem.'],
    [1.68,  'It’s more than <b>90 characters</b> long'],
    [3.76,  'and every single one of them'],
    [4.96,  'is pronounced exactly the same way:'],
    [7.52,  '<b>“shi.”</b>'],
    [8.24,  'In Chinese, somehow…'],
    [9.68,  'that actually <b>works.</b>'],
    [11.38, 'It’s called “The Lion-Eating'],
    [12.60, 'Poet in the Stone Den,”'],
    [14.54, 'written by the linguist'],
    [15.36, '<b>Yuen Ren Chao.</b>'],
    [16.98, '90-something characters —'],
    [18.32, 'and the only thing separating them'],
    [19.62, 'is their <b>tone</b>:'],
    [20.78, 'Now I’m not going to read it aloud,'],
    [22.30, 'but I got some help from <b>Google Translate.</b>'],
    [23.92, 'shā · shí · shǐ · shì'],
    [26.98, 'four flavors of a <b>single syllable.</b>'],
    [29.38, 'shi shi shi shi shi…'],
    [30.80, 'To your ears — to anyone’s ears —'],
    [32.60, 'it’s <b>pure nonsense.</b>'],
    [33.96, 'A wall of the exact same sound.'],
    [36.40, '<b>Nobody</b> could follow it.'],
    [37.36, 'But now look at it <b>written down.</b>'],
    [39.30, 'Suddenly it’s a crisp little <b>story</b>:'],
    [41.16, 'a poet named Shi,'],
    [42.32, 'who’s obsessed with eating <b>lions</b>,'],
    [44.34, 'vows to eat <b>ten</b> of them.'],
    [45.44, 'He goes to the <b>market</b>, finds ten lions,'],
    [48.00, '<b>kills</b> them, hauls them <b>home</b>,'],
    [49.02, 'and discovers they were actually'],
    [50.74, 'ten <b>stone lions.</b>'],
    [52.16, 'Every “shi” is a different character,'],
    [54.02, 'with a different <b>meaning</b>.'],
    [55.08, 'On paper, there’s <b>zero confusion</b>,'],
    [57.44, 'and that’s the whole trick:'],
    [58.96, 'Chinese characters carry meaning'],
    [59.88, 'by their <b>shape</b>, not their <b>sound</b>.'],
    [62.06, 'Wanna actually start <b>learning Chinese</b>?'],
    [63.94, 'Discover thousands of <b>free exercises</b>'],
    [65.58, 'and more learning content on <b>stacktags.io</b>.'],
  ];

  function setSub(html) {
    const el = $('#sub');
    el.classList.remove('in'); void el.offsetWidth;
    el.innerHTML = html;
    el.classList.add('in');
  }

  // ---- sound effects — hung on the REAL cue times; overlaid into the final mp4
  //      by _build/mix_sfx.js (Web-Audio can't be captured headless). swoosh on
  //      every transition / fly-in / outro-assemble; pop when characters snap in. ----
  const SFX = [
    [7.52,  'swoosh', 0.50],   // cluster morph (chars fly out of the poem)
    [11.38, 'swoosh', 0.50],   // title morph
    [14.54, 'swoosh', 0.50],   // portrait slides up from below
    [18.30, 'swoosh', 0.50],   // → tones (depth handoff)
    [29.38, 'swoosh', 0.50],   // → read-aloud waveform
    [30.80, 'swoosh', 0.50],   // → listener (Mandarin speaker)
    [33.96, 'swoosh', 0.50],   // → wall of sound
    [37.36, 'swoosh', 0.50],   // → on paper
    [41.16, 'swoosh', 0.50],   // → poet
    [42.76, 'swoosh', 0.50],   // → lion rises
    [44.34, 'swoosh', 0.50],   // → nine more lions rise
    [45.60, 'swoosh', 0.50],   // → market (poet rises to meet it)
    [50.30, 'swoosh', 0.50],   // → stone lion (twist)
    [52.16, 'swoosh', 0.50],   // → fan-out
    [55.08, 'swoosh', 0.50],   // → poem (zero confusion)
    [58.96, 'swoosh', 0.50],   // → poem (shape, not sound)
    [62.06, 'swoosh', 0.55],   // → outro assemble
    [8.25,  'pop',    0.55],   // cluster characters snap into the grid
    [12.10, 'pop',    0.55],   // title characters snap into place
    [18.80, 'pop',    0.55],   // the four tone chips pop in
  ];
  const SND = { swoosh: 'assets/sound/swoosh.wav', pop: 'assets/sound/pop.wav' };
  function playSfx(name, vol) { try { const a = new Audio(SND[name]); a.volume = Math.min(1, vol || 0.5); a.play().catch(() => {}); } catch (e) {} }

  // ============================================================
  //  OPENING SCENE — scrolling poem + character morphs + portrait
  // ============================================================
  const CLUSTER = [
    { c: '施', py: 'shī', x: 300, y: 770 },
    { c: '食', py: 'shí', x: 540, y: 770 },
    { c: '史', py: 'shǐ', x: 780, y: 770 },
    { c: '是', py: 'shì', x: 300, y: 1070 },
    { c: '獅', py: 'shī', x: 540, y: 1070 },
    { c: '石', py: 'shí', x: 780, y: 1070 },
  ];
  const CLUSTER_CAP = { y: 1255, html: 'every single one is <b>“shi”</b>' };
  const TITLE = [ { c: '施', x: 240 }, { c: '氏', x: 405 }, { c: '食', x: 570 }, { c: '獅', x: 735 }, { c: '史', x: 900 } ];
  const TITLE_Y = 740;
  // scattered launch points within the poem area (characters "form out of the text")
  const FLY_SRC = [[300,720],[760,640],[520,900],[300,1180],[760,1220],[540,1040]];

  let flyArr = [], flyByChar = {}, opRaf = 0, opCharLine = [];

  function buildOpening() {
    const poem = $('#op-poem');
    let html = ''; opCharLine = []; let li = 0;
    for (let i = 0; i < POEM_WALL.length; i += 6) {
      html += '<span class="ln">';
      for (const ch of POEM_WALL.substr(i, 6)) { html += `<span class="ch">${ch}</span>`; opCharLine.push(li); }
      html += '</span>';
      li++;
    }
    poem.innerHTML = html;

    const fly = $('#op-fly');
    flyArr = []; flyByChar = {};
    ['施', '食', '史', '是', '獅', '石', '氏'].forEach((c) => {
      const el = document.createElement('div');
      el.className = 'fc cjk'; el.textContent = c;
      fly.appendChild(el); flyByChar[c] = el;
      if (c !== '氏') flyArr.push(el);
    });

    const cl = $('#op-cluster');
    let clh = '';
    CLUSTER.forEach((cc) => { clh += `<div class="cl" style="left:${cc.x}px;top:${cc.y + 98}px">${cc.py}</div>`; });
    clh += `<div class="cap" style="top:${CLUSTER_CAP.y}px">${CLUSTER_CAP.html}</div>`;
    cl.innerHTML = clh;
  }

  function setFly(el, x, y, op, instant) {
    if (!el) return;
    if (instant) el.style.transition = 'none';
    el.style.opacity = op;
    el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    if (instant) { void el.offsetWidth; el.style.transition = ''; }
  }

  const OP_TOP = 24, OP_BODY_BOTTOM = 1320;   // coords inside the scroll body

  function opReset() {
    cancelAnimationFrame(opRaf);
    const poem = $('#op-poem');
    poem.classList.remove('gone');
    poem.querySelectorAll('.ch').forEach((el) => el.classList.remove('shown'));
    poem.style.transition = 'none'; poem.style.transform = `translateY(${OP_TOP}px)`;
    void poem.offsetWidth; poem.style.transition = '';
    $('#op-scroll').classList.remove('gone');
    Object.values(flyByChar).forEach((el) => setFly(el, 540, 960, 0, true));
    $('#op-cluster').classList.remove('in');
    $('#op-title').classList.remove('in');
    $('#op-portrait').classList.remove('in');
  }

  // type the poem letter by letter inside the scroll while it scrolls CONTINUOUSLY —
  // typing and scroll are both driven by ONE smoothstep curve, so the motion is fluid
  // and eases in at the start / out at the end (no per-line stepping).
  function opScroll() {
    cancelAnimationFrame(opRaf);
    const poem = $('#op-poem');
    poem.classList.remove('gone');
    const chars = poem.querySelectorAll('.ch');
    const lines = poem.querySelectorAll('.ln');
    const C = chars.length, N = lines.length;
    chars.forEach((el) => el.classList.remove('shown'));
    poem.style.transition = 'none';
    poem.style.transform = `translateY(${OP_TOP}px)`;
    void poem.offsetWidth;
    const lineH = N > 1 ? (lines[1].offsetTop - lines[0].offsetTop) : 124;
    const visible = OP_BODY_BOTTOM - OP_TOP;       // height of the visible parchment
    const totalH = N * lineH;                       // full poem height
    const TYPE_DUR = Math.max(2, OP_CLUSTER_T - 0.6);
    const smooth = (x) => x * x * (3 - 2 * x);      // gentle accelerate → decelerate
    let shown = 0;
    const t0 = performance.now();
    function frame(now) {
      const t = (now - t0) / 1000;
      const p = smooth(Math.min(1, t / TYPE_DUR));
      const revealed = Math.min(C, Math.round(p * C));
      for (; shown < revealed; shown++) chars[shown].classList.add('shown');
      // hold the scroll at the top until the body is FULL, then scroll smoothly
      const scroll = Math.max(0, p * totalH - visible);
      poem.style.transform = `translateY(${(OP_TOP - scroll).toFixed(1)}px)`;
      if (t < TYPE_DUR + 0.25) opRaf = requestAnimationFrame(frame);
    }
    opRaf = requestAnimationFrame(frame);
  }

  function opToCluster() {
    cancelAnimationFrame(opRaf);
    $('#op-scroll').classList.add('gone');      // manuscript scroll → white grid
    $('#op-poem').classList.add('gone');
    CLUSTER.forEach((cc, i) => {
      const el = flyArr[i]; const [sx, sy] = FLY_SRC[i];
      setFly(el, sx, sy, 0, true);              // launch point inside the poem
      el.style.opacity = '1';
      el.style.transform = `translate(${cc.x}px,${cc.y}px) translate(-50%,-50%)`;
    });
    $('#op-cluster').classList.add('in');
  }

  function opToTitle() {
    $('#op-cluster').classList.remove('in');
    setFly(flyByChar['氏'], CLUSTER[3].x, CLUSTER[3].y, 0, true);   // 氏 launches where 是 was
    flyByChar['氏'].style.opacity = '1';
    TITLE.forEach((tc) => {
      const el = flyByChar[tc.c];
      el.style.opacity = '1';
      el.style.transform = `translate(${tc.x}px,${TITLE_Y}px) translate(-50%,-50%)`;
    });
    flyByChar['是'].style.opacity = '0';
    flyByChar['石'].style.opacity = '0';
    $('#op-title').classList.add('in');
  }

  function opPortrait() { $('#op-portrait').classList.add('in'); }

  function opShowState(name) {
    cancelAnimationFrame(opRaf);
    const poem = $('#op-poem');
    if (name === 'scroll') {
      $('#op-scroll').classList.remove('gone');
      poem.classList.remove('gone');
      poem.querySelectorAll('.ch').forEach((el) => el.classList.add('shown'));
      poem.style.transition = 'none'; poem.style.transform = `translateY(${OP_TOP}px)`;
      Object.values(flyByChar).forEach((el) => setFly(el, 540, 960, 0, true));
      $('#op-cluster').classList.remove('in'); $('#op-title').classList.remove('in'); $('#op-portrait').classList.remove('in');
      return;
    }
    $('#op-scroll').classList.add('gone');
    poem.classList.add('gone');
    if (name === 'cluster') {
      CLUSTER.forEach((cc, i) => setFly(flyArr[i], cc.x, cc.y, 1, true));
      setFly(flyByChar['氏'], 540, 960, 0, true);
      $('#op-cluster').classList.add('in'); $('#op-title').classList.remove('in'); $('#op-portrait').classList.remove('in');
    } else { // title or portrait
      TITLE.forEach((tc) => setFly(flyByChar[tc.c], tc.x, TITLE_Y, 1, true));
      setFly(flyByChar['是'], CLUSTER[3].x, CLUSTER[3].y, 0, true);
      setFly(flyByChar['石'], CLUSTER[5].x, CLUSTER[5].y, 0, true);
      $('#op-cluster').classList.remove('in'); $('#op-title').classList.add('in');
      $('#op-portrait').classList.toggle('in', name === 'portrait');
    }
  }

  // ---- element handles ----------------------------------------------
  let depth = null, outroHost = null;

  function mountElements() {
    depth = new window.StacktagsDepthTransitionsOptimized('#depth-host', { steps: STEPS });
    outroHost = $('#outro-host');
    $('#logo').innerHTML = window.makeStacktagsLogo({ size: 620 });
    buildOpening();
  }

  // ============ LIVE CUE TIMELINE ============
  function buildCues() {
    const C = [];
    // opening
    C.push({ t: 0.0, do: () => { setScene('open'); opReset(); opScroll(); } });
    C.push({ t: OP_CLUSTER_T, do: opToCluster });
    C.push({ t: OP_TITLE_T, do: opToTitle });
    C.push({ t: OP_PORTRAIT_T, do: opPortrait });
    // hand off to depth at the tones beat
    C.push({ t: DEPTH_START, do: () => { setScene('depth'); depth.reset(); depth._showFirst(5); } });
    BEATS.forEach((b) => C.push({ t: b.t, do: () => { depth.transitionTo(b.i, b.mode, 1050); } }));
    // the "shi" pinyin slides in under each line of the poem beat (no new transition)
    C.push({ t: PINYIN_T, do: () => { const b = depth.layers[16] && depth.layers[16].querySelector('.b-poempy'); if (b) b.classList.add('py-in'); } });
    // outro — the default endcard reveals (logo → wordmark → url) on .play
    C.push({ t: OUTRO_START, do: () => { setScene('outro'); outroHost.classList.remove('play'); void outroHost.offsetWidth; outroHost.classList.add('play'); } });
    // subtitles
    SUBS.forEach(([t, html]) => C.push({ t, do: () => setSub(html) }));
    // sound effects (live preview; the mp4 gets them via mix_sfx.js)
    SFX.forEach(([t, name, vol]) => C.push({ t, do: () => playSfx(name, vol) }));
    C.sort((a, b) => a.t - b.t);
    return C;
  }

  let CUES = [], cuePtr = 0, raf = 0;

  function tick() {
    const t = vo.currentTime;
    while (cuePtr < CUES.length && CUES[cuePtr].t <= t + 0.001) { try { CUES[cuePtr].do(); } catch (e) {} cuePtr++; }
    $('#vprogress').style.width = Math.min(100, (t / (vo.duration || DUR)) * 100) + '%';
    $('#info').textContent = t.toFixed(1) + 's';
    if (!vo.paused && !vo.ended) raf = requestAnimationFrame(tick);
  }

  function resetAll() {
    cancelAnimationFrame(raf);
    cuePtr = 0;
    setScene('open');
    opReset();
    if (depth) depth.reset();
    if (outroHost) outroHost.classList.remove('play');
    const s = $('#sub'); s.classList.remove('in'); s.innerHTML = '';
    $('#vprogress').style.width = '0%';
  }

  function showSync(on) { $('#syncflash').classList.toggle('on', !!on); }

  function play() {
    resetAll();
    showSync(false);
    vo.currentTime = 0;
    vo.play().catch(() => {});
    raf = requestAnimationFrame(tick);
  }

  // ============ INSTANT SEEK (QA stills) ============
  function applyState(t) {
    cancelAnimationFrame(raf);
    let si = -1; for (let i = 0; i < SUBS.length; i++) if (SUBS[i][0] <= t) si = i;
    const s = $('#sub'); if (si >= 0) { s.innerHTML = SUBS[si][1]; s.classList.add('in'); } else { s.classList.remove('in'); s.innerHTML = ''; }
    $('#vprogress').style.width = Math.min(100, (t / (vo.duration || DUR)) * 100) + '%';
    $('#info').textContent = t.toFixed(1) + 's';

    if (t < DEPTH_START) {
      setScene('open');
      if (t < OP_CLUSTER_T) opShowState('scroll');
      else if (t < OP_TITLE_T) opShowState('cluster');
      else if (t < OP_PORTRAIT_T) opShowState('title');
      else opShowState('portrait');
    } else if (t < OUTRO_START) {
      setScene('depth');
      outroHost.classList.remove('play');
      let bi = 5; for (const b of BEATS) if (b.t <= t) bi = b.i;
      depth.reset(); depth._showFirst(bi);
      const pp = depth.layers[16] && depth.layers[16].querySelector('.b-poempy');
      if (pp) pp.classList.toggle('py-in', bi === 16 && t >= PINYIN_T);
    } else {
      setScene('outro');
      outroHost.classList.add('play');
    }
  }

  // ---- HUD + boot ----------------------------------------------------
  function fit() {
    const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
    document.documentElement.style.setProperty('--scale', s);
  }
  window.addEventListener('resize', fit);

  function boot() {
    mountElements();
    CUES = buildCues();
    setScene('open');
    opReset();
    fit();
    $('#play').onclick = play;
    $('#restart').onclick = play;
    $('#cleanbtn').onclick = () => document.body.classList.toggle('clean');
    document.addEventListener('keydown', (e) => { if (e.key === 'c' || e.key === 'C') document.body.classList.toggle('clean'); });

    window.__play = play;
    window.__showSync = showSync;
    window.__seek = (t) => { if (!vo.paused) vo.pause(); applyState(t); };
    window.SFX = SFX;   // read by capture.js / mix_sfx.js to overlay SFX into the mp4
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
