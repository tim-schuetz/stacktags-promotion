/* ============================================================
   Stacktags — "How a bureaucrats' dialect conquered China"
   NEW STYLE cue engine. The video is a depth-transition fly-through
   on a moving grid (default element), bookended by the default GLOBE
   (geography hook) and TIMELINE (rocket back past Rome), closed by the
   default OUTRO. Subtitles mirror the spoken line at the bottom.

   Everything is keyed to the narration audio (#vo) so each beat lands
   on the word that is spoken. window.__play() runs it live (used by the
   recorder); window.__seek(t) jumps to a still state (used by QA shots).
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const vo = $('#vo');

  // ---- scene helpers -------------------------------------------------
  const SCENES = ['globe', 'timeline', 'states', 'depth', 'ship', 'outro'];
  function setScene(name) {
    SCENES.forEach((s) => $('#scene-' + s).classList.toggle('active', s === name));
  }

  // ---- depth-transition spine content (the moving-grid fly-through) --
  // Short, punchy beats so they read at 104px; CJK in a sans face.
  const cjk = (g, py, gloss) =>
    `<span class="cjk">${g}</span>` +
    (py ? `<span class="py">${py}</span>` : '') +
    (gloss ? `<span class="gloss">${gloss}</span>` : '');

  // The big on-screen beats are ILLUSTRATIONS (not the spoken words echoed as
  // text) — the subtitles carry the words. Only the actual SUBJECT words (the
  // Chinese terms + "Mandarin") are shown as type, because the words ARE the topic.
  const I = window.ILLUS || {};
  // The warring-states → 汉 takeover is its own honeycomb scene (states.js); the
  // depth fly-through picks up from the unification onward.
  // 普通话 holds while a "common speech" gloss slides UP from the bottom on cue
  // (the cjk + pinyin stay put — see the common-speech cue / .pth-compo CSS).
  const PTH = '<div class="pth-compo">'
    + '<div class="pth-main"><span class="cjk">普通话</span><span class="py">pǔtōnghuà</span></div>'
    + '<div class="pth-common">“common speech”</div></div>';
  const STEPS = [
    { svg: I.script },                                                       // 0 the writing standardized
    { text: '<div class="han-compo">'                                        // 1 the dynasty (汉 + a Han ruler)
        + '<img class="han-fig" src="assets/photos/han_emperor_cut.png" alt="">'
        + '<div class="han-text">' + cjk('汉', 'Hàn', '“the Han”') + '</div>'
        + '</div>' },
    { text: cjk('汉语', 'Hànyǔ', '“the language of Han”') },                 // 2
    { svg: I.speech },                                                       // 3 same writing, different speech (one beat)
    { svg: I.official },                                                     // 4 official drops in from the top
    { text: cjk('官话', 'guānhuà', '“the officials’ speech”'), atY: -360 }, // 5 slides in ABOVE the official (not covering it)
    { svg: I.media },                                                        // 6 schools · radio · TV (held through the "1.4 billion" line)
    { text: PTH },                                                           // 7 普通话 (+ "common speech" gloss)
  ];

  // beat i is entered at time t with camera move `mode` (never repeats back-to-back).
  // MANDARIN is no longer a depth beat — it slides in over the globe in the ship scene.
  const BEATS = [
    { i: 1,  t: 40.7,  mode: 'pan-right'},   // 汉   ("the dynasty after it did, the Han")
    { i: 2,  t: 48.9,  mode: 'zoom-out' },   // 汉语 ("their language Hanyu")
    { i: 3,  t: 51.9,  mode: 'pan-left' },   // speech ("but here's the catch")
    { i: 4,  t: 63.1,  mode: 'drop'     },   // official drops in ("the officials settled")
    { i: 5,  t: 68.7,  mode: 'drop'     },   // 官话 slides in from the top, official slides down
    // (media — beat 6 — now lives in the SHIP scene beside MANDARIN, so it is no
    //  longer a depth beat; the depth layer for it stays unused/hidden.)
    { i: 7,  t: 99.8,  mode: 'zoom-in'  },   // 普通话 ("putonghua")
  ];
  const TL_START = 9.3;            // timeline scene
  const STATES_START = 16.7;       // warring-states honeycomb scene
  const DEPTH_START = 33.4;        // depth fly-through (writing standardized onward)
  const SHIP_START = 73.8;         // Portuguese ship → China scene (incl. the MANDARIN reveal)
  const MANDARIN_T = 81.6;         // MANDARIN slides in from the top, globe slides down
  const LASTCENTURY_T = 85.36;     // "then, last century": globe stage slides away, MANDARIN stays
  const SHIP_END = 99.65;          // ship scene holds MANDARIN + media until 普通话 takes over
  const OUTRO_START = 111.6;       // outro scene (CTA ending)

  // ---- subtitles: VERBATIM, mirroring exactly what is spoken (script_audio.mp3) --
  // Times force-aligned to the re-recorded take via OpenAI Whisper (_build/whisper.json).
  const SUBS = [
    [0.00,  'Over a billion people speak <b>Mandarin</b>,'],
    [1.9,   'but almost none of them call it that.'],
    [4.44,  '<b>Mandarin</b> is a name foreigners gave it.'],
    [6.2,   'And the real story of how it took over China'],
    [8.06,  'begins before <b>Rome</b> was ever an empire.'],
    [10.08, 'Because long before Rome ruled anything,'],
    [12.0,  'China had already risen and fallen through dynasties'],
    [14.54, 'going back more than <b>3,000 years</b>.'],
    [16.78, 'But China back then wasn’t one country.'],
    [19.64, 'It was a patchwork of <b>rival states</b>,'],
    [21.58, 'locked in near-constant war,'],
    [23.24, 'dozens of kingdoms, with different rulers,'],
    [25.2,  'different armies, and different spoken tongues.'],
    [27.84, 'Then, in <b>221 BC</b>, one state finally conquered the rest,'],
    [32.0,  'forced them into a single empire,'],
    [33.48, 'and standardized the writing,'],
    [35.2,  'so everyone wrote the same characters.'],
    [36.80, 'That first empire didn’t last long.'],
    [39.10, 'But the dynasty after it did: the <b>Han</b>.'],
    [41.28, 'The Han ruled for four centuries,'],
    [43.6,  'and became so foundational that, to this day,'],
    [46.46, 'most Chinese call themselves <b>Han</b>,'],
    [49.04, 'and their language <b>Hànyǔ</b>, the language of Han.'],
    [51.98, 'But here’s the catch:'],
    [52.9,  'unifying the writing is not the same as unifying the speech.'],
    [55.46, 'For two thousand years, Chinese across the empire wrote alike,'],
    [60.40, 'but spoke languages they couldn’t understand out loud.'],
    [61.74, 'So to actually govern, the officials settled'],
    [64.5,  'on one shared spoken standard,'],
    [66.54, 'based on the northern, capital dialect.'],
    [68.28, 'They called it <b><span class="cjk">官话</span> guānhuà</b>,'],
    [70.2,  'the speech of the officials,'],
    [71.92, 'and that’s where our word is born.'],
    [74.02, 'When Portuguese traders reached China in the 1500s,'],
    [78.40, 'they called those robed officials <b>mandarins</b>.'],
    [79.62, 'So in Europe, the officials’ language became <b>Mandarin</b>.'],
    [83.0,  'A foreign name for the language of power.'],
    [85.36, 'Then, last century, that same northern standard was formalized,'],
    [89.62, 'taught in every school,'],
    [91.22, 'and pushed through radio and TV,'],
    [93.0,  'until it became the shared voice of <b>1.4 billion</b> people.'],
    [96.72, 'And they gave it a new, surprisingly humble name:'],
    [99.96, '<b><span class="cjk">普通话</span> pǔtōnghuà</b>.'],
    [103.14,'Which means, simply, <b>common speech</b>.'],
    [105.2, 'Everyday, ordinary talk.'],
    [106.30,'So the exotic, powerful name the West knows,'],
    [109.60,'to a billion speakers back home,'],
    [110.8, 'it’s just <b>normal language</b>.'],
    [111.76,'Wanna actually start learning Chinese?'],
    [114.44,'Discover thousands of free exercises and more learning content on <b>stacktags.io</b>.'],
  ];

  function setSub(html) {
    const el = $('#sub');
    el.classList.remove('in'); void el.offsetWidth;   // restart the slide-up
    el.innerHTML = html;
    el.classList.add('in');
  }

  // ---- SOUND EFFECTS (default-element sounds, replayed at the real cue times) --
  // Headless Playwright can't record Web-Audio, so the SFX are declared here and
  // baked onto the narration at mux time (_build/mix_sfx.js). window.SFX is dumped
  // by capture.js → capture/sfx.json. swoosh = every depth transition / scene
  // change / fly-in; pop = a word/character/object appearing; ticking = the
  // timeline counting back. Assets are normalized to ~-3 dBFS (see assets/sound).
  const SND = { swoosh: 'assets/sound/swoosh.wav', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/ticking.wav' };
  const SFX = [
    [0.9,   'pop',     0.55],  // hook word "Mandarin" pops in
    [2.3,   'swoosh',  0.50],  // the cross-out slashes across
    [9.3,   'swoosh',  0.50],  // → timeline scene
    [9.5,   'ticking', 0.55],  // ruler counts back through the dynasties
    [14.35, 'swoosh',  0.50],  // Xia composition slides in
    [16.7,  'swoosh',  0.50],  // → warring-states scene
    [22.0,  'swoosh',  0.45],  // takeovers begin
    [24.8,  'swoosh',  0.50],  // 汉 begins its conquest
    [32.0,  'swoosh',  0.55],  // "single empire" — borders melt, one 汉 scales up
    [33.4,  'swoosh',  0.50],  // → depth spine (writing standardized)
    [40.7,  'swoosh',  0.50],  // 汉  (pan-right)
    [48.9,  'swoosh',  0.50],  // 汉语 (zoom-out)
    [51.9,  'swoosh',  0.50],  // speech (pan-left)
    [60.4,  'pop',     0.45],  // first gibberish speech bubble pops in
    [61.2,  'pop',     0.45],  // second gibberish speech bubble pops in
    [63.1,  'swoosh',  0.50],  // official drops in
    [68.7,  'swoosh',  0.50],  // 官话 slides in over the official
    [73.8,  'swoosh',  0.50],  // → ship scene
    [75.3,  'swoosh',  0.45],  // the caravel sets sail
    [78.4,  'swoosh',  0.50],  // ship arrives → Portuguese building rises
    [81.6,  'swoosh',  0.50],  // MANDARIN drops in from the top
    [85.36, 'swoosh',  0.45],  // "then, last century" — the globe stage slides away (MANDARIN stays)
    [89.6,  'pop',     0.55],  // school pops in (beside MANDARIN)
    [91.2,  'pop',     0.55],  // radio pops in
    [92.0,  'pop',     0.55],  // TV pops in
    [99.8,  'swoosh',  0.50],  // 普通话 (zoom-in)
    [103.14,'pop',     0.50],  // "common speech" slides up
    [111.6, 'swoosh',  0.50],  // → outro (logo assembles)
  ];
  // warring-states honeycomb: a soft pop as each of the 19 tiles snaps in
  // (states.show() staggers them at 16.7 + i*0.27s)
  for (let i = 0; i < 19; i++) SFX.push([+(16.7 + i * 0.27).toFixed(2), 'pop', 0.33]);
  SFX.sort((a, b) => a[0] - b[0]);
  window.SFX = SFX;
  function playSfx(e) { try { const a = new Audio(SND[e[1]]); a.volume = e[2]; a.play().catch(() => {}); } catch (err) {} }

  // ---- element handles ----------------------------------------------
  let globeCtrl = null, shipGlobeCtrl = null, depth = null, tl = null, states = null, shipEl = null;

  // Mount the SHIP-scene globe (a second live globe) once the hook globe is
  // built — so both finish their heavy geometry build before playback. It is
  // halted immediately (transparent, zero render cost) and only resumed for the
  // ship scene, where it rotates from India to China as the caravel sails.
  function mountShipGlobe() {
    const host = document.querySelector('#ship-host .ship-globe-host');
    if (!host || host.querySelector('canvas')) return;
    window.mountStacktagsGlobe(host, {
      focus: { lat: 20, lon: 78, cam: 2.5 },   // India faces the viewer first
      startCam: 2.5,
      highlight: 'China',
      autoReveal: false,
      onReady: (c) => {
        shipGlobeCtrl = c; c.halt();   // frozen until the ship scene
        // the turquoise DASHED sea route drawn ON the globe: out of the Arabian
        // Sea, SOUTH of Sri Lanka, across the Bay of Bengal, through the Strait
        // of Malacca, up the South China Sea, onto the South China coast.
        c.setRoute([[10, 64], [8, 71], [5, 77], [3.5, 82], [5, 89], [5, 95], [3.5, 98], [2.3, 100.5], [5, 104], [9, 108], [14, 111], [19, 113], [23.5, 113.2]]);
        c.attachShip(document.querySelector('#ship-host .ship-img'));   // ship rides the route's tip
      },
    });
  }

  function mountElements() {
    // GLOBE — China filled turquoise (sharper default element). No city marker,
    // no zoom-in dive: it just settles on China, then hands off to the timeline.
    // 0.75× render buffer (CSS-stretched): the sharper 3D-border globe stays
    // crisp while keeping the headless capture near real-time (two globes total).
    window.__GLOBE_RS = 0.75;
    window.mountStacktagsGlobe($('#globe-host'), {
      focus: { lat: 33, lon: 107, cam: 2.25 },
      startCam: 3.7,
      highlight: 'China',
      autoReveal: false,
      onReady: (c) => { globeCtrl = c; mountShipGlobe(); },
    });

    // TIMELINE — rocket back past Rome through the dynasties
    tl = new window.StacktagsTimeline($('#tl-host'), {
      spacing: 560,
      sound: 'elements/sound/tickingtimeline.mp3',
      volume: 0.7,
      events: [
        { year: '27 BC',   label: 'Rome becomes an empire' },
        { year: '206 BC',  label: 'Han dynasty' },
        { year: '1046 BC', label: 'Zhou dynasty' },
        { year: '1600 BC', label: 'Shang dynasty' },
        { year: '2070 BC', label: 'Xia dynasty' },
      ],
      // land on the earliest dynasty: name & date at the TOP, the artifacts
      // distributed in the middle, and a BIG temple anchored at the bottom.
      endPhoto: { title: 'the <b>Xia</b> dynasty', year: 'c. 2070 BC' },
      endImages: [
        { src: 'assets/photos/temple_cut.png',         x: 0,    y: 560,  w: 820 },  // big, anchored bottom
        { src: 'assets/photos/dynasty_vessel_cut.png', x: 20,   y: -250, w: 320 },
        { src: 'assets/photos/bronze_tools_cut.png',   x: -345, y: -30,  w: 280 },
        { src: 'assets/photos/ancient_money_cut.png',  x: 345,  y: 80,   w: 260 },
      ],
    });

    // WARRING-STATES honeycomb (秦汉楚齐燕赵魏 → 汉 takeover)
    states = new window.StacktagsStates($('#states-host'));

    // PORTUGUESE SHIP → CHINA scene
    shipEl = new window.StacktagsShip($('#ship-host'));

    // DEPTH-TRANSITION SPINE
    depth = new window.StacktagsDepthTransitionsOptimized($('#depth-host'), { steps: STEPS });

    // OUTRO logo (default endcard element) — built into #outro-logo; the .play
    // class on the scene drives the build/wordmark/url animation.
    $('#outro-logo').innerHTML = window.makeStacktagsLogo({ size: 640 });
  }

  // ============ LIVE CUE TIMELINE ============
  // one-shot actions fired as the audio passes their time
  function buildCues() {
    const C = [];
    // -- globe hook --
    C.push({ t: 0.0,  do: () => { setScene('globe'); if (globeCtrl) globeCtrl.reveal(); } });
    C.push({ t: 0.45, do: () => { if (globeCtrl) globeCtrl.reveal(); } });
    C.push({ t: 0.9,  do: () => { $('#hook-word').classList.add('in'); } });
    C.push({ t: 2.3,  do: () => { $('#hook-word').classList.add('cross'); } });
    C.push({ t: 7.0,  do: () => { $('#hook-word').classList.remove('in'); } });
    // -- timeline -- (globe just settles on China, no dive)
    C.push({ t: TL_START, do: () => { $('#globe-host').classList.add('gone'); setScene('timeline'); } });
    C.push({ t: 9.45, do: () => { tl.reset(); tl.run({ duration: 4200 }); } }); // a touch faster → Xia composition lands earlier (~13.65) and holds longer to 16.7
    C.push({ t: 10.6, do: () => { if (globeCtrl) globeCtrl.halt(); } });   // free CPU: globe is off-screen now
    // -- warring states honeycomb --
    C.push({ t: STATES_START, do: () => { setScene('states'); states.reset(); states.show(); } }); // builds tile-by-tile
    C.push({ t: 22.0, do: () => { states.bleed(); } });                    // takeovers begin earlier (states overtake neighbours)
    C.push({ t: 24.8, do: () => { states.conquer(); } });                  // 汉 ripples out slowly, finishing ≈30.7 (before "single empire")
    C.push({ t: 32.0, do: () => { states.empire(); } });                   // "forced into a single empire" → borders melt, one 汉 scales up
    // -- depth spine (writing standardized onward) --
    C.push({ t: DEPTH_START, do: () => { setScene('depth'); depth.reset(); depth._showFirst(0); } });
    BEATS.forEach((b) => C.push({ t: b.t, do: () => { depth.transitionTo(b.i, b.mode, 1050); } }));
    // brief pulses inside the speech scene
    C.push({ t: 57.5, do: () => { const p = $('#depth-host .sp-parch'); if (p) { p.classList.remove('pulse'); void p.offsetWidth; p.classList.add('pulse'); } } }); // "wrote alike" → 字
    // "but spoke languages…": the two gibberish bubbles pop in one after another
    C.push({ t: 60.4, do: () => { const e = $('#depth-host .sp-bub-l'); if (e) e.classList.add('show'); } });
    C.push({ t: 61.2, do: () => { const e = $('#depth-host .sp-bub-r'); if (e) e.classList.add('show'); } });
    // when 官话 slides in over the official, clear the lingering speech beat (3)
    // so it's a clean two-layer stack (官话 over official), not a faded triple.
    C.push({ t: 68.85, do: () => { if (depth && depth.layers[3]) { depth.layers[3].style.transition = 'opacity .5s ease'; depth.layers[3].style.opacity = '0'; if (depth._kept) depth._kept = depth._kept.filter((k) => k !== 3); } } });
    // media (in the SHIP scene, beside the still-visible MANDARIN): school · radio ·
    // TV pop in one-by-one (each scales up) on their words
    C.push({ t: 89.6, do: () => { const e = $('#ship-host .media-img.m1'); if (e) e.classList.add('pop'); } }); // "taught in every school"
    C.push({ t: 91.2, do: () => { const e = $('#ship-host .media-img.m2'); if (e) e.classList.add('pop'); } }); // "radio"
    C.push({ t: 92.0, do: () => { const e = $('#ship-host .media-img.m3'); if (e) e.classList.add('pop'); } }); // "and TV"
    // "common speech" gloss slides up under 普通话 (普通话 stays)
    C.push({ t: 103.14, do: () => { const e = $('#depth-host .pth-compo'); if (e) e.classList.add('reveal'); } });
    // -- Portuguese ship → China → MANDARIN; then the globe goes but MANDARIN stays
    //    while school·radio·TV pop in beside it; finally hands off to 普通话 --
    C.push({ t: SHIP_START, do: () => { setScene('ship'); shipEl.reset(); shipEl.show(); if (shipGlobeCtrl) { shipGlobeCtrl.resume(); shipGlobeCtrl.reveal(); } } });
    C.push({ t: 75.3, do: () => { shipEl.sail(); if (shipGlobeCtrl) { shipGlobeCtrl.setFocus(24, 113); shipGlobeCtrl.revealRoute(3100); } } }); // sail + rotate India→South China + draw the route on the globe
    C.push({ t: 78.6, do: () => { shipEl.arrive(); } });             // ship has reached land → shrinks away; building rises (delayed) at China
    C.push({ t: MANDARIN_T, do: () => { shipEl.mandarin(); } });      // MANDARIN slides from top, globe slides down
    // "then, last century": ONLY the globe stage slides away — MANDARIN stays put.
    C.push({ t: LASTCENTURY_T, do: () => { shipEl.formalize(); } });
    C.push({ t: 86.3, do: () => { if (shipGlobeCtrl) shipGlobeCtrl.halt(); } }); // free CPU once the globe has faded out
    // hand off to the depth spine for 普通话 (MANDARIN + media clear as it zooms in)
    C.push({ t: SHIP_END, do: () => { if (depth) depth.reset(); setScene('depth'); } });
    // -- outro -- (default endcard animation, then the folder reference slides in)
    C.push({ t: OUTRO_START, do: () => { setScene('outro'); $('#scene-outro').classList.add('play'); } });
    // subtitles
    SUBS.forEach(([t, html]) => C.push({ t, do: () => setSub(html) }));
    // sound effects (live preview only; the capture bakes them in at mux time)
    SFX.forEach((e) => C.push({ t: e[0], do: () => playSfx(e) }));
    C.sort((a, b) => a.t - b.t);
    return C;
  }

  let CUES = [], cuePtr = 0, raf = 0;

  function tick() {
    const t = vo.currentTime;
    while (cuePtr < CUES.length && CUES[cuePtr].t <= t + 0.001) { try { CUES[cuePtr].do(); } catch (e) {} cuePtr++; }
    const dur = vo.duration || 121.9;
    $('#vprogress').style.width = Math.min(100, (t / dur) * 100) + '%';
    $('#info').textContent = t.toFixed(1) + 's';
    if (!vo.paused && !vo.ended) raf = requestAnimationFrame(tick);
  }

  function resetAll() {
    cancelAnimationFrame(raf);
    cuePtr = 0;
    setScene('globe');
    $('#globe-host').classList.remove('gone');
    if (globeCtrl) globeCtrl.resume();
    $('#hook-word').classList.remove('in', 'cross', 'sub-in');
    if (tl) tl.reset();
    if (states) states.reset();
    if (shipEl) shipEl.reset();
    if (shipGlobeCtrl) shipGlobeCtrl.halt();   // ship globe stays frozen until its scene
    if (depth) depth.reset();
    document.querySelectorAll('#depth-host .sp-bub').forEach((b) => b.classList.remove('show')); // gibberish bubbles hidden again
    const pth = $('#depth-host .pth-compo'); if (pth) pth.classList.remove('reveal');
    $('#scene-outro').classList.remove('play');
    const s = $('#sub'); s.classList.remove('in'); s.innerHTML = '';
    $('#vprogress').style.width = '0%';
  }

  function showSync(on) { $('#syncflash').classList.toggle('on', !!on); }

  function play() {
    resetAll();
    showSync(false);          // the recorder holds black BEFORE calling play(); clear it now
    vo.currentTime = 0;
    vo.play().catch(() => {});
    raf = requestAnimationFrame(tick);
  }

  // ============ INSTANT SEEK (QA stills — no animation replay) ============
  function lastBefore(arr, t, key) { let v = -1; for (let i = 0; i < arr.length; i++) if (arr[i][key !== undefined ? key : 0] <= t) v = i; return v; }

  function applyState(t) {
    cancelAnimationFrame(raf);
    // subtitle
    let si = -1; for (let i = 0; i < SUBS.length; i++) if (SUBS[i][0] <= t) si = i;
    const s = $('#sub'); if (si >= 0) { s.innerHTML = SUBS[si][1]; s.classList.add('in'); } else { s.classList.remove('in'); s.innerHTML = ''; }
    $('#vprogress').style.width = Math.min(100, (t / (vo.duration || 121.9)) * 100) + '%';
    $('#info').textContent = t.toFixed(1) + 's';

    if (t < TL_START) {
      setScene('globe');
      $('#globe-host').classList.remove('gone');
      if (globeCtrl) globeCtrl.reveal();
      $('#hook-word').classList.toggle('in', t >= 0.7 && t < 7.0);
      $('#hook-word').classList.toggle('cross', t >= 2.0);
    } else if (t < STATES_START) {
      setScene('timeline');
      $('#globe-host').classList.add('gone');
      tl.showEnd();
    } else if (t < DEPTH_START) {
      setScene('states');
      if (t >= 31.0) { states.showUnified(); if (t >= 32.0) states.empire(); }
      else if (t >= 24.8) { states.showUnified(); }
      else { // static full honeycomb for the still (skip the build stagger)
        states.reset(); states.el.classList.add('in');
        states.groups.forEach((g) => g.classList.add('on'));
        states.cells.forEach((c, i) => states._setName(i, c.name));
      }
    } else if (t >= SHIP_START && t < SHIP_END) {
      setScene('ship');
      shipEl.reset();
      if (shipGlobeCtrl) { shipGlobeCtrl.resume(); shipGlobeCtrl.reveal(); shipGlobeCtrl.setFocus(t >= 75.3 ? 24 : 20, t >= 75.3 ? 113 : 78); }
      shipEl.show(); if (t >= 75.3) shipEl.sail(); if (t >= 78.4) shipEl.arrive();
      if (t >= MANDARIN_T) shipEl.mandarin();
      if (t >= LASTCENTURY_T) shipEl.formalize();        // globe gone, MANDARIN stays
      if (t >= 89.6) { const e = $('#ship-host .media-img.m1'); if (e) e.classList.add('pop'); }
      if (t >= 91.2) { const e = $('#ship-host .media-img.m2'); if (e) e.classList.add('pop'); }
      if (t >= 92.0) { const e = $('#ship-host .media-img.m3'); if (e) e.classList.add('pop'); }
    } else if (t < OUTRO_START) {
      setScene('depth');
      // which beat is current at time t?
      let bi = 0; for (const b of BEATS) if (b.t <= t) bi = b.i;
      depth.reset(); depth._showFirst(bi);
      // the gibberish bubbles only pop in late inside the speech beat
      const bl = $('#depth-host .sp-bub-l'), br = $('#depth-host .sp-bub-r');
      if (bl) bl.classList.toggle('show', bi === 3 && t >= 60.4);
      if (br) br.classList.toggle('show', bi === 3 && t >= 61.2);
      if (t >= 103.14) { const e = $('#depth-host .pth-compo'); if (e) e.classList.add('reveal'); }
    } else {
      setScene('outro');
      $('#scene-outro').classList.add('play');
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
    setScene('globe');
    fit();
    $('#play').onclick = play;
    $('#restart').onclick = play;
    $('#cleanbtn').onclick = () => document.body.classList.toggle('clean');
    document.addEventListener('keydown', (e) => { if (e.key === 'c' || e.key === 'C') document.body.classList.toggle('clean'); });

    // recorder + QA hooks
    window.__play = play;
    window.__showSync = showSync;   // recorder holds a black frame, then play() clears it (sync marker)
    window.__seek = (t) => { if (!vo.paused) vo.pause(); applyState(t); };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
