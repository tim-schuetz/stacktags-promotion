/* ============================================================
   Stacktags video element — ZODIAC WHEEL (the hero device)
   A ring of the 12 Chinese zodiac hanzi laid out like a clock face.
   It can spin (multi-turn), lock the Dragon 龙 to the top, grey the
   other eleven, lift a hero glyph + label into the centre hub, and
   run a clock hand for the "like clockwork" outro.

   White + turquoise, Inter/Noto Sans SC, no borders. Pure DOM/CSS.

   USAGE
     const w = mountZodiacWheel(host, { R: 300, glyph: 104 });
     w.popAll({ stagger: 120 });   // pop the 12 glyphs in around the ring
     w.spin(-480);                 // free spin (deg; negative = clockwise-ish)
     w.dragonLock(1);              // spin so 龙 lands at top (+1 extra turn)
     w.dragonGlow(true);          // the ring's 龙 scales up + glows
     w.gray(true);                 // grey the other eleven
     w.hub(htmlString);            // centre-hub content (cross-fades)
     w.clock(true); w.hand(deg);   // outro clock hand
     w.showAll(); w.reset();
   ============================================================ */
(function (global) {
  // canonical order, starting at 12 o'clock going clockwise
  const ZODIAC = [
    { c: '鼠' }, { c: '牛' }, { c: '虎' }, { c: '兔' },
    { c: '龙', dragon: true }, { c: '蛇' }, { c: '马' }, { c: '羊' },
    { c: '猴' }, { c: '鸡' }, { c: '狗' }, { c: '猪' },
  ];
  const DRAGON_I = 4;
  const DRAGON_A = DRAGON_I * 30;   // base angle of the dragon glyph (deg)

  global.mountZodiacWheel = function (host, opts = {}) {
    host = typeof host === 'string' ? document.querySelector(host) : host;
    const R = opts.R || 300;
    const glyph = opts.glyph || 104;

    const root = document.createElement('div');
    root.className = 'zw';
    root.style.setProperty('--R', R + 'px');
    root.style.setProperty('--zwg', glyph + 'px');

    const ring = document.createElement('div');
    ring.className = 'zw-ring';
    ring.style.setProperty('--rot', '0deg');

    const glyphs = ZODIAC.map((z, i) => {
      const g = document.createElement('div');
      g.className = 'zw-g' + (z.dragon ? ' dragon' : '');
      g.style.setProperty('--a', (i * 30) + 'deg');
      g.innerHTML = '<span class="zw-gi cjk">' + z.c + '</span>';
      ring.appendChild(g);
      return g;
    });
    const dragonG = glyphs[DRAGON_I];

    const hand = document.createElement('div');
    hand.className = 'zw-hand';
    hand.innerHTML = '<span class="zw-hand-line"></span><span class="zw-hand-cap"></span>';

    const hub = document.createElement('div');
    hub.className = 'zw-hub';

    root.appendChild(ring);
    root.appendChild(hand);
    root.appendChild(hub);
    (host || document.body).appendChild(root);

    let curRot = 0;

    const api = {
      el: root,
      ring, hub, dragonG,

      popIn(i) { glyphs[i] && glyphs[i].classList.add('in'); },
      popAll({ stagger = 120 } = {}) {
        glyphs.forEach((g, i) => setTimeout(() => g.classList.add('in'), i * stagger));
      },
      showAllGlyphs() { glyphs.forEach(g => g.classList.add('in')); },

      // running highlight sweep around the ring (for "twelve animals, one per year")
      sweep({ stagger = 120, hold = 220 } = {}) {
        glyphs.forEach((g, i) => {
          setTimeout(() => {
            g.classList.add('lit');
            setTimeout(() => { if (!g.classList.contains('dragon')) g.classList.remove('lit'); }, hold);
          }, i * stagger);
        });
      },

      spin(deg, { instant = false } = {}) {
        curRot = deg;
        if (instant) ring.style.transition = 'none';
        ring.style.setProperty('--rot', deg + 'deg');
        if (instant) { void ring.offsetWidth; ring.style.transition = ''; }
      },
      // spin so the dragon ends at the top (12 o'clock); +turns extra full spins
      dragonLock(turns = 1, { instant = false } = {}) {
        this.spin(-DRAGON_A - 360 * turns, { instant });
      },

      dragonGlow(on = true) { dragonG.classList.toggle('glow', !!on); },
      gray(on = true) { ring.classList.toggle('gray', !!on); },

      hub(html, instant) {
        if (instant) { hub.innerHTML = html; hub.classList.add('in'); return; }
        hub.classList.remove('in');
        setTimeout(() => { hub.innerHTML = html; hub.classList.add('in'); }, 110);
      },
      hubClear(instant) {
        if (instant) { hub.classList.remove('in'); hub.innerHTML = ''; return; }
        hub.classList.remove('in');
        setTimeout(() => { hub.innerHTML = ''; }, 200);
      },

      clock(on = true) { root.classList.toggle('clockmode', !!on); },
      hand(deg, { instant = false } = {}) {
        if (instant) hand.style.transition = 'none';
        hand.style.setProperty('--h', deg + 'deg');
        if (instant) { void hand.offsetWidth; hand.style.transition = ''; }
      },

      showAll() {
        this.showAllGlyphs();
      },
      reset() {
        glyphs.forEach(g => g.classList.remove('in', 'lit'));
        dragonG.classList.remove('glow');
        ring.classList.remove('gray');
        root.classList.remove('clockmode');
        this.spin(0, { instant: true });
        this.hand(0, { instant: true });
        hub.classList.remove('in'); hub.innerHTML = '';
      },
    };
    return api;
  };
})(window);
