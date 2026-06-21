/* ============================================================
   Stacktags default element — TEXT DEPTH TRANSITIONS (optimized, logic)
   A faux-3D camera that moves between beats with VARIED moves — it does
   NOT do the same thing every time:
     • zoom-in   : camera pushes INTO the current beat (it balloons + blurs
                   away) and the next emerges small from the distance.
     • zoom-out  : camera PULLS BACK (current recedes small into the depth)
                   and the next is revealed settling down from huge/close.
     • pan-left / pan-right : the screen slides sideways to the next beat.
   The grid plane carries the SAME move (scales for zoom, translates for
   pan) so every move reads as a real camera move. The grid keeps its state
   between beats (no resets / pops).
   Each beat is text ({ text }) or a large cut-out image ({ image }).

   USAGE
     const d = new StacktagsDepthTransitionsOptimized('#host', {
       steps: [ { text:'…' },
                { image:'assets/x.png', via:'zoom-in' },
                { text:'…', via:'zoom-out' },
                { text:'…', via:'pan-left' } ],
     });
     d.start({ firstHold: 650, hold: 950, duration: 1150 });
     d.reset();

   Pure DOM/CSS + rAF. Pairs with the matching .css.
   ============================================================ */
(function (global) {
  const easeInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  class StacktagsDepthTransitionsOptimized {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.steps = opts.steps || [];

      this.el = document.createElement('div');
      this.el.className = 'stk-depth2';
      this.grid = document.createElement('div');
      this.grid.className = 'stk-depth2-grid';
      this.stage = document.createElement('div');
      this.stage.className = 'stk-depth2-stage';
      this.el.appendChild(this.grid);
      this.el.appendChild(this.stage);
      (this.host || document.body).appendChild(this.el);

      this.layers = this.steps.map(s => {
        const beat = document.createElement('div');
        beat.className = 'stk-depth2-beat';
        if (s.image !== undefined || s.placeholder !== undefined) {
          if (s.image) {
            const wrap = document.createElement('div');
            wrap.className = 'stk-depth2-img';
            wrap.innerHTML = `<img src="${s.image}" alt="">`;
            beat.appendChild(wrap);
          } else {
            const ph = document.createElement('div');
            ph.className = 'stk-depth2-ph';
            ph.innerHTML = `<span>${s.placeholder || 'Bild'}</span>`;
            beat.appendChild(ph);
          }
        } else if (s.html !== undefined) {
          // a FULL-STAGE host beat: arbitrary 1080×1920 content (mounted
          // default elements live here — globe, enumeration, text-popup, …).
          beat.classList.add('full');
          const h = document.createElement('div');
          h.className = 'stk-depth2-full';
          h.innerHTML = s.html || '';
          beat.appendChild(h);
        } else {
          const t = document.createElement('div');
          t.className = 'stk-depth2-text';
          t.innerHTML = s.text || '';
          beat.appendChild(t);
        }
        this.stage.appendChild(beat);
        return beat;
      });

      // per-beat resting anchor: images can stay low (atY) so they don't cover
      // text; atScale fits them in. Default = centred, full size.
      this.rest = this.steps.map(s => ({ x: s.atX || 0, y: s.atY || 0, s: s.atScale || 1 }));
      // grid (camera) state — carried between beats so moves accumulate
      this.gs = 1; this.gx = 0; this.gy = 0;
      this.cur = -1;
      this._raf = 0; this._timers = [];
      this._setGrid(1, 0, 0);
    }

    _setGrid(s, x, y) {
      this.gs = s; this.gx = x; this.gy = y;       // keep true state for continuity
      // CLAMP the displayed cell size and WRAP the offset by one cell, so the
      // grid is ALWAYS full-bleed and visible — it can never scale away or drift
      // off no matter how the camera moves accumulate.
      const cs = Math.max(0.82, Math.min(1.28, s));
      const cell = 120 * cs;
      this.grid.style.backgroundSize = cell + 'px ' + cell + 'px';
      this.grid.style.backgroundPosition = 'calc(50% + ' + x + 'px) calc(50% + ' + y + 'px)';
    }
    _set(el, { tx = 0, ty = 0, s = 1, op = 1, blur = 0, z = 1 }) {
      el.style.setProperty('--tx', tx + 'px');
      el.style.setProperty('--ty', ty + 'px');
      el.style.setProperty('--s', s);
      el.style.opacity = op;
      el.style.filter = blur ? `blur(${blur}px)` : 'none';
      el.style.zIndex = z;
    }

    // pose presets at progress e. Curves overlap a lot, so the outgoing beat
    // LINGERS while the incoming is already on screen — several things visible
    // at once — and the incoming generally enters with its own motion.
    _poses(mode, e) {
      switch (mode) {
        case 'rise':       // current eases back + STAYS visible above; next RISES from below
          return {
            from: { s: lerp(1, 0.66, e), ty: lerp(0, -230, e), blur: 3 * e,  op: lerp(1, 0.55, e), z: 1 },
            to:   { s: lerp(0.72, 1, e), ty: lerp(980, 0, e),  blur: 7 * (1 - e), op: clamp01(e / 0.35), z: 3 },
            grid: 0.85,
          };
        case 'zoom-out':   // camera pulls back: out recedes small; in revealed from huge
          return {
            from: { s: lerp(1, 0.34, e), ty: lerp(0, 40, e),  blur: 8 * e,      op: clamp01(1.1 - e / 0.7), z: 1 },
            to:   { s: lerp(2.6, 1, e),  blur: 8 * (1 - e),   op: clamp01((e - 0.05) / 0.45), z: 3 },
            grid: 0.78,
          };
        case 'pan-left':   // screen slides left (next enters from the right)
          return {
            from: { tx: lerp(0, -1180, e), blur: 6 * e,       op: clamp01(1.1 - e / 0.8), z: 2 },
            to:   { tx: lerp(1180, 0, e), blur: 4 * (1 - e),  op: clamp01(e / 0.45), z: 3 },
            panX: -1180,
          };
        case 'pan-right':
          return {
            from: { tx: lerp(0, 1180, e), blur: 6 * e,        op: clamp01(1.1 - e / 0.8), z: 2 },
            to:   { tx: lerp(-1180, 0, e), blur: 4 * (1 - e), op: clamp01(e / 0.45), z: 3 },
            panX: 1180,
          };
        case 'lift':       // camera lifts UP + zoom: old beats slide DOWN off-screen
                           // (they fly out, they don't fade), new text drops in from top
          return {
            from: { ty: lerp(0, 920, e), blur: 0, op: 1, z: 4 },        // slides straight down & out
            to:   { ty: lerp(-640, 0, e), s: lerp(1.28, 1, e), blur: 6 * (1 - e), op: clamp01(e / 0.4), z: 2 },
            grid: 1.28, panY: -280,
          };
        case 'drop':       // current eases back + STAYS; next drops in from the TOP (e.g. lantern)
          return {
            from: { s: lerp(1, 0.66, e), ty: lerp(0, 180, e), blur: 3 * e,  op: lerp(1, 0.55, e), z: 1 },
            to:   { s: lerp(0.7, 1, e), ty: lerp(-1040, 0, e), blur: 7 * (1 - e), op: clamp01(e / 0.35), z: 3 },
            grid: 0.9,
          };
        case 'pop':        // a SMALL extra object appears at its anchor; everything else stays
          return {
            from: { s: lerp(1, 0.94, e), op: lerp(1, 0.92, e), z: 1 },
            to:   { s: lerp(0.4, 1, e), blur: 6 * (1 - e), op: clamp01(e / 0.3), z: 3 },
            grid: 1.04,
          };
        case 'zoom-in':
        default:           // camera pushes in: out balloons + blurs (lingers); in emerges from below-small
          return {
            from: { s: lerp(1, 3.0, e), blur: 9 * e,          op: clamp01(1.1 - e / 0.62), z: 3 },
            to:   { s: lerp(0.35, 1, e), ty: lerp(240, 0, e), blur: 6 * (1 - e), op: clamp01((e - 0.05) / 0.45), z: 2 },
            grid: 1.45,
          };
      }
    }

    _showFirst(i) {
      this.cur = i;
      this.layers.forEach((el, k) => this._set(el, { op: k === i ? 1 : 0, s: k === i ? this.rest[i].s : 1, tx: k === i ? this.rest[i].x : 0, ty: k === i ? this.rest[i].y : 0, blur: 0, z: k === i ? 2 : 1 }));
    }

    _animate(fromEl, toEl, mode, duration, keep, fromRest, toRest, extraOuts) {
      extraOuts = extraOuts || [];
      fromRest = fromRest || { y: 0, s: 1 };
      toRest = toRest || { y: 0, s: 1 };
      return new Promise(resolve => {
        const gs0 = this.gs, gx0 = this.gx, gy0 = this.gy;
        const p = this._poses(mode, 0);
        const gsT = p.grid != null ? gs0 * p.grid : gs0;
        const gxT = p.panX != null ? gx0 + p.panX * gs0 : gx0;
        const gyT = p.panY != null ? gy0 + p.panY * gs0 : gy0;
        const t0 = performance.now();
        const tick = (now) => {
          const e = easeInOut(clamp01((now - t0) / duration));
          if (mode === 'lift') {
            // unified camera: EVERYTHING on screen moves down + scales up together
            // (so the zoom illusion holds) while the new text drops in from the top.
            const z = lerp(1, 1.3, e), dy = 1450 * e;
            if (fromEl) this._set(fromEl, { tx: fromRest.x * z, ty: fromRest.y * z + dy, s: fromRest.s * z, op: 1, blur: 0, z: 4 });
            extraOuts.forEach(o => { const kp = o.pose || { tx: 0, ty: 0, s: 1, op: 1 }; this._set(o.el, { tx: (kp.tx || 0) * z, ty: kp.ty * z + dy, s: kp.s * z, op: kp.op, blur: 0, z: 3 }); });
            if (toEl) this._set(toEl, { tx: toRest.x * e, ty: lerp(-700, 0, e) + toRest.y * e, s: lerp(1.3, 1, e) * lerp(1, toRest.s, e), op: clamp01(e / 0.4), blur: 6 * (1 - e), z: 2 });
            this._setGrid(gs0 * z, gx0, gy0 + dy * 0.7);
            if ((now - t0) < duration) { this._raf = requestAnimationFrame(tick); return; }
            if (fromEl) this._set(fromEl, { op: 0 });
            extraOuts.forEach(o => this._set(o.el, { op: 0 }));
            this._set(toEl, { tx: toRest.x, ty: toRest.y, s: toRest.s, op: 1, blur: 0, z: 2 });
            this._setGrid(gs0 * 1.3, gx0, gy0 + 1450 * 0.7);
            resolve(); return;
          }
          const ps = this._poses(mode, e);
          if (fromEl) {
            const f = ps.from;
            f.tx = (f.tx || 0) + fromRest.x;
            f.ty = (f.ty || 0) + fromRest.y;
            f.s = (f.s != null ? f.s : 1) * fromRest.s;
            this._set(fromEl, f);
          }
          if (toEl) {
            const t = ps.to;
            t.tx = (t.tx || 0) + toRest.x * e;
            t.ty = (t.ty || 0) + toRest.y * e;       // settle onto the beat's anchor
            t.s = (t.s != null ? t.s : 1) * lerp(1, toRest.s, e);
            this._set(toEl, t);
          }
          if (extraOuts.length) {                    // kept background beats exit WITH the move
            const ef = this._poses(mode, e).from;
            extraOuts.forEach(o => {
              const kp = o.pose || { tx: 0, ty: 0, s: 1, op: 1 };
              this._set(o.el, {
                tx: (kp.tx || 0) + (ef.tx || 0),
                ty: (kp.ty || 0) + (ef.ty || 0),
                s: (kp.s != null ? kp.s : 1) * (ef.s != null ? ef.s : 1),
                op: (kp.op != null ? kp.op : 1) * (ef.op != null ? ef.op : 1),
                blur: ef.blur || 0, z: 1,
              });
            });
          }
          this._setGrid(lerp(gs0, gsT, e), lerp(gx0, gxT, e), lerp(gy0, gyT, e));
          if ((now - t0) < duration) this._raf = requestAnimationFrame(tick);
          else {
            if (fromEl && !keep) this._set(fromEl, { op: 0 });
            extraOuts.forEach(o => this._set(o.el, { op: 0 }));
            if (toEl) this._set(toEl, { tx: toRest.x, ty: toRest.y, s: toRest.s, op: 1, blur: 0, z: 2 });
            this._setGrid(gsT, gxT, gyT);
            resolve();
          }
        };
        this._raf = requestAnimationFrame(tick);
      });
    }

    async transitionTo(i, mode = 'zoom-in', duration = 1150) {
      const fromIdx = this.cur;
      const from = this.layers[fromIdx];
      const to = this.layers[i];
      // compose moves ADD to the scene (everything currently up stays); other
      // moves change scene, so the kept background beats clear out.
      const keep = mode === 'rise' || mode === 'drop' || mode === 'pop' || this.steps[i].keep;
      let extraOuts = [];
      if (!keep) {
        const kepts = this._kept.filter(k => k !== i).map(k => ({ el: this.layers[k], pose: this._keptPose[k] || { tx: 0, ty: 0, s: 1, op: 1 } }));
        if (mode === 'lift') extraOuts = kepts;       // slide out together
        else extraOuts = kepts;                        // animate out WITH the move (no instant vanish)
        this._kept = [];
      }
      this._set(to, Object.assign({ op: 0 }, this._poses(mode, 0).to));   // start pose
      await this._animate(from, to, mode, duration, keep, this.rest[fromIdx], this.rest[i], extraOuts);
      if (keep) {
        // the outgoing beat lingers in the background; existing kept beats remain
        if (this._kept.indexOf(fromIdx) < 0) this._kept.push(fromIdx);
        from.style.zIndex = 1;
        this._keptPose[fromIdx] = {
          tx: parseFloat(from.style.getPropertyValue('--tx')) || 0,
          ty: parseFloat(from.style.getPropertyValue('--ty')) || 0,
          s: parseFloat(from.style.getPropertyValue('--s')) || 1,
          op: parseFloat(from.style.opacity) || 1,
        };
      }
      this.cur = i;
    }

    async start({ hold = 950, duration = 1150, firstHold = 650 } = {}) {
      this.reset();
      this._showFirst(0);
      await this._wait(firstHold);
      const cycle = ['rise', 'zoom-out', 'pan-left', 'zoom-in', 'pan-right', 'rise'];
      for (let i = 1; i < this.steps.length; i++) {
        const mode = this.steps[i].via || cycle[(i - 1) % cycle.length];
        await this.transitionTo(i, mode, duration);
        await this._wait(hold);
      }
    }

    _wait(ms) { return new Promise(r => { const id = setTimeout(r, ms); this._timers.push(id); }); }

    showAll() { this._showFirst(this.steps.length - 1); }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._timers.forEach(clearTimeout); this._timers = [];
      this.cur = -1;
      this._kept = [];
      this._keptPose = {};
      this._setGrid(1, 0, 0);
      this.layers.forEach(el => this._set(el, { op: 0, s: 1, tx: 0, ty: 0, blur: 0 }));
    }
  }

  global.StacktagsDepthTransitionsOptimized = StacktagsDepthTransitionsOptimized;
})(window);
