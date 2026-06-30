/* ============================================================
   Stacktags default element — TEXT POPUP (logic)
   Words pop onto the screen with a springy scale-in, each with an
   (optional, very quiet) "pop" sound. Good for rapid-fire keyword
   moments. White + turquoise, Inter, no borders.

   USAGE
     const pop = new StacktagsTextPopup(hostEl, {
       sound: 'sound/pop.mp3',   // optional; played quietly on each pop
       volume: 0.25,
       words: [
         { text: 'fast',     x: -260, y: -360, size: 96, rot: -6 },
         { text: 'homogeneous', x: 180, y: -120, key: true },
         { text: 'professional', x: -120, y: 200, pill: true, size: 72 },
       ],
     });
     pop.popAll({ stagger: 380 });   // pop them in one after another
     pop.pop(0);                      // pop a single word
     pop.reset();

   Word options: text, x, y (px offset from centre), size (px),
   rot (deg), key|key-d (turquoise), pill (tinted pill), bob (idle).
   Pairs with text-popup.css. Pure DOM/CSS + optional <audio>.
   ============================================================ */
(function (global) {
  class StacktagsTextPopup {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.el = document.createElement('div');
      this.el.className = 'stk-pop';
      (this.host || document.body).appendChild(this.el);

      this.volume = opts.volume != null ? opts.volume : 0.25;
      this.soundSrc = opts.sound || null;

      this.words = (opts.words || []).map(w => {
        const span = document.createElement('div');
        span.className = 'stk-pop-word'
          + (w.key ? ' key' : '') + (w.keyD ? ' key-d' : '')
          + (w.pill ? ' pill' : '') + (w.bob ? ' bob' : '');
        span.textContent = w.text || '';
        span.style.setProperty('--tx', (w.x || 0) + 'px');
        span.style.setProperty('--ty', (w.y || 0) + 'px');
        span.style.setProperty('--rot', (w.rot || 0) + 'deg');
        if (w.size) span.style.fontSize = w.size + 'px';
        this.el.appendChild(span);
        return span;
      });
      this._timers = [];
    }

    _ping() {
      if (!this.soundSrc) return;
      try {
        const a = new Audio(this.soundSrc);
        a.volume = this.volume;
        a.play().catch(() => {});   // missing file / autoplay block -> silent
      } catch (e) { /* ignore */ }
    }

    pop(i) {
      const el = this.words[i];
      if (!el || el.classList.contains('in')) return;
      // already-popped words recede behind the new one with a slight blur
      this.words.forEach(w => { if (w.classList.contains('in')) w.classList.add('behind'); });
      el.classList.add('in');
      el.classList.remove('behind');
      this._ping();
    }

    popAll({ stagger = 360 } = {}) {
      // pop in a SPREAD-OUT order (not top-to-bottom) via a coprime stride
      const n = this.words.length;
      let stride = Math.max(1, Math.round(n * 0.4));
      const gcd = (a, b) => b ? gcd(b, a % b) : a;
      while (n > 1 && gcd(stride, n) !== 1) stride++;
      for (let k = 0; k < n; k++) {
        const idx = (k * stride) % n;
        const id = setTimeout(() => this.pop(idx), k * stagger);
        this._timers.push(id);
      }
    }

    /* Show everything instantly with no sound — for seeking / screenshots. */
    showAll() { this.words.forEach(el => el.classList.add('in')); }

    reset() {
      this._timers.forEach(clearTimeout); this._timers = [];
      this.words.forEach(el => el.classList.remove('in'));
    }
  }

  global.StacktagsTextPopup = StacktagsTextPopup;
})(window);
