/* ============================================================
   Stacktags default element — TIMELINE (logic)
   A measuring-tape RULER of thin ticks scrolls past a fixed centre
   playhead (running in REVERSE — the ruler travels left→right),
   popping year/event labels in as they cross the playhead, then the
   end photo slides in from the LEFT while scaling up.
   White + turquoise, Inter, thin lines, no borders.

   USAGE
     const tl = new StacktagsTimeline(hostEl, {
       events: [ { year:'618', label:'Tang dynasty' }, … ],
       endPhoto: { src:'assets/end.png', title:'…', sub:'…' },
       spacing: 620,           // px between events on the ruler
       sound: 'sound/timeline.mp3',
     });
     tl.run({ duration: 4200 });
     tl.showEnd();  tl.reset();

   Pairs with timeline.css. Pure DOM/CSS + optional <audio>.
   ============================================================ */
(function (global) {
  const STAGE_W = 1080;
  const PLAYHEAD = STAGE_W / 2;   // fixed screen-x of the playhead (centre)
  const TICK_GAP = 46;            // px between minor ruler ticks
  const MAJOR_EVERY = 4;          // every Nth tick is a tall one

  class StacktagsTimeline {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.events = opts.events || [];
      this.spacing = opts.spacing || 620;

      this.el = document.createElement('div');
      this.el.className = 'stk-tl';

      this.track = document.createElement('div');
      this.track.className = 'stk-tl-track';

      // events run to the LEFT (negative x) so that, as the ruler scrolls
      // RIGHT, they cross the centre playhead in array order.
      this.evX = this.events.map((_, i) => -i * this.spacing);
      const leftMost = this.evX.length ? this.evX[this.evX.length - 1] : 0;

      // a dense ruler of thin ticks spanning the whole travel
      const ruler = document.createElement('div');
      ruler.className = 'stk-tl-ruler';
      const from = 900, to = leftMost - 900;
      let k = 0;
      for (let x = from; x >= to; x -= TICK_GAP) {
        const tick = document.createElement('div');
        tick.className = 'stk-tl-tick' + (k % MAJOR_EVERY === 0 ? ' major' : '');
        tick.style.left = x + 'px';
        ruler.appendChild(tick);
        k++;
      }
      this.track.appendChild(ruler);

      // event labels (year + caption) sit at their ruler positions
      this.evEls = this.events.map((ev, i) => {
        const node = document.createElement('div');
        node.className = 'stk-tl-ev';
        node.style.left = this.evX[i] + 'px';
        node.innerHTML =
          `<div class="stk-tl-evtick"></div>` +
          (ev.year ? `<div class="stk-tl-year">${ev.year}</div>` : '') +
          (ev.label ? `<div class="stk-tl-label">${ev.label}</div>` : '');
        this.track.appendChild(node);
        return node;
      });
      this.el.appendChild(this.track);

      // fixed centre playhead
      const head = document.createElement('div');
      head.className = 'stk-tl-head';
      head.style.left = PLAYHEAD + 'px';
      this.el.appendChild(head);

      // end composition (cut-out images + text) slides in from the left, scaling up
      const ep = opts.endPhoto || {};
      this.end = document.createElement('div');
      this.end.className = 'stk-tl-end';
      this.end.innerHTML =
        `<div class="stk-tl-final">
           ${(opts.endImages || []).map(im => `<img class="stk-tl-cut" src="${im.src}" alt="" style="left:calc(50% + ${im.x || 0}px);top:calc(50% + ${im.y || 0}px);width:${im.w || 360}px" onerror="this.style.display='none'">`).join('')}
           <div class="stk-tl-cap">
             ${ep.title ? `<div class="t">${ep.title}</div>` : ''}
             ${ep.year ? `<div class="y">${ep.year}</div>` : ''}
             ${ep.sub ? `<div class="s">${ep.sub}</div>` : ''}
           </div>
         </div>`;
      this.el.appendChild(this.end);

      (this.host || document.body).appendChild(this.el);

      // scroll travel: start with event 0 AT the playhead, move right so the
      // ruler runs in reverse and later events arrive from the left.
      this.x0 = PLAYHEAD - this.evX[0];
      this.x1 = PLAYHEAD - leftMost + 200;     // past the last event
      this.track.style.transform = `translateX(${this.x0}px)`;
      this._raf = 0;
    }

    _ping() {
      if (!this.opts.sound) return;
      try { const a = new Audio(this.opts.sound); a.volume = this.opts.volume != null ? this.opts.volume : 0.8; a.play().catch(() => {}); } catch (e) {}
    }

    _updateReveal(tx) {
      this.evEls.forEach((node, i) => {
        const screenX = this.evX[i] + tx;        // events approach from the left
        if (screenX >= 30) node.classList.add('in');        // visible already on the LEFT
        if (screenX >= PLAYHEAD - 4) node.classList.add('passed');
      });
    }

    run({ duration = 4200 } = {}) {
      this._ping();
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, Math.max(0, (now - t0) / duration));
        const e = Math.pow(p, 3.3);              // start slow, accelerate HARD toward the end
        const tx = this.x0 + (this.x1 - this.x0) * e;
        this.track.style.transform = `translateX(${tx}px)`;
        this._updateReveal(tx);
        if (p < 1) this._raf = requestAnimationFrame(step);
        else this.showEnd();
      };
      this._raf = requestAnimationFrame(step);
    }

    showEnd() {
      this.evEls.forEach(n => n.classList.add('in', 'passed'));
      this.track.style.transform = `translateX(${this.x1}px)`;
      this.el.classList.add('end-in');
    }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this.el.classList.remove('end-in');
      this.evEls.forEach(n => n.classList.remove('in', 'passed'));
      this.track.style.transform = `translateX(${this.x0}px)`;
    }
  }

  global.StacktagsTimeline = StacktagsTimeline;
})(window);
