/* ============================================================
   Stacktags default element — BAR CHART v2 (panning camera)
   A big, zoomed-in bar chart. The camera glides from the lower-left
   to the upper-right, and each bar only EXTENDS UP once the camera
   reaches it — its x-axis label fades in at that same moment.
   White + turquoise, Inter, no borders.

   USAGE
     new StacktagsGraphChart('#host', {
       data: [{label,value}, …],
     }).draw({ duration: 3600 });
   ============================================================ */
(function (global) {
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const smooth  = t => t * t * (3 - 2 * t);
  const clamp01 = t => Math.max(0, Math.min(1, t));
  const lerp    = (a, b, f) => a + (b - a) * f;

  class StacktagsGraphChart {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.data = (opts.data || []).map(d => (typeof d === 'number' ? { value: d } : d));

      // --- world geometry (big) ---
      this.leftPad = 240;
      this.slot    = 420;
      this.barW    = 250;
      this.baseY   = 1320;            // baseline (world Y)
      this.maxBarH = 1020;
      this.n       = this.data.length;
      this.worldW  = this.leftPad + this.n * this.slot + 120;
      this.worldH  = this.baseY + 220;

      // --- camera (smoothly zooms OUT as the bars grow to the right) ---
      this.S0 = 1.12;                 // start zoom
      this.S1 = 0.70;                 // end zoom (pulled back)
      this.targetX  = 540;            // active bar lands here on screen
      this.targetXEnd = 770;          // …drifts right near the end (last bar on the right)
      this.targetY  = 760;            // …with its FINAL top at this height

      const maxVal = Math.max(1, ...this.data.map(d => d.value));
      this.maxVal = maxVal;
      const peak = Math.max(...this.data.map(d => d.value));

      this.el = document.createElement('div');
      this.el.className = 'bv2';
      this.el.innerHTML = '<div class="bv2-world"></div>';
      (this.host || document.body).appendChild(this.el);
      this.world = this.el.querySelector('.bv2-world');
      this.world.style.width  = this.worldW + 'px';
      this.world.style.height = this.worldH + 'px';

      // baseline axis line
      const axis = document.createElement('div');
      axis.className = 'bv2-axis';
      axis.style.cssText = `left:${this.leftPad - 90}px;width:${this.n * this.slot + 40}px;top:${this.baseY}px;`;
      this.world.appendChild(axis);

      this.bars = this.data.map((d, i) => {
        const barLeft = this.leftPad + i * this.slot;
        const cx = barLeft + this.barW / 2;
        const fullH = (d.value / maxVal) * this.maxBarH;

        const bar = document.createElement('div');
        bar.className = 'bv2-bar' + (d.value === peak ? ' peak' : '');
        bar.style.left = barLeft + 'px';
        bar.style.width = this.barW + 'px';
        this.world.appendChild(bar);

        const val = document.createElement('div');
        val.className = 'bv2-val';
        val.style.left = cx + 'px';
        val.textContent = '0';
        this.world.appendChild(val);

        const lbl = document.createElement('div');
        lbl.className = 'bv2-xlabel';
        lbl.style.left = cx + 'px';
        lbl.style.top = (this.baseY + 40) + 'px';
        lbl.textContent = d.label != null ? d.label : (i + 1);
        this.world.appendChild(lbl);

        return { bar, val, lbl, cx, fullH, value: d.value };
      });

      this._frame(-0.85);   // initial state (nothing grown, camera on bar 0)
      this._raf = 0;
    }

    // pa = camera parameter in "bar index" units (can start negative)
    _frame(pa) {
      const cur = this.bars.map((b, i) => {
        const g = easeOut(clamp01(pa - (i - 0.85)));   // grows as camera nears bar i
        const h = b.fullH * g;
        b.bar.style.height = h + 'px';
        b.bar.style.top = (this.baseY - h) + 'px';
        b.val.style.top = (this.baseY - h - 96) + 'px';
        b.val.textContent = Math.round(b.value * g).toLocaleString('en-US');
        if (g > 0.12) { b.bar.classList.add('in'); b.val.classList.add('in'); b.lbl.classList.add('in'); }
        else { b.bar.classList.remove('in'); b.val.classList.remove('in'); b.lbl.classList.remove('in'); }
        return { cx: b.cx, finalTop: this.baseY - b.fullH };
      });

      // camera follows the FINAL bar tops (a smooth staircase — never dips back
      // down to the baseline between bars) and zooms out as we move right
      const idx = Math.max(0, Math.min(this.n - 1, pa));
      const i0 = Math.floor(idx), i1 = Math.min(this.n - 1, i0 + 1), f = idx - i0;
      const camX = lerp(cur[i0].cx, cur[i1].cx, f);
      const camY = lerp(cur[i0].finalTop, cur[i1].finalTop, f);
      const prog = clamp01(pa / (this.n - 1));
      const S = lerp(this.S0, this.S1, smooth(prog));
      // keep the active bar centred for most of the run, then ease the framing
      // to the right so the final (right-most) bar lands on the right side
      const tX = lerp(this.targetX, this.targetXEnd, smooth(clamp01((prog - 0.5) / 0.5)));
      const tx = tX - camX * S;
      const ty = this.targetY - camY * S;
      this.world.style.transform = `translate(${tx}px, ${ty}px) scale(${S})`;
    }

    _span() { return (this.n - 1) + 0.85; }   // pa travels from -0.85 → n-1

    draw({ duration = 3600 } = {}) {
      this.el.classList.add('in');
      const t0 = performance.now();
      const step = (now) => {
        const p = clamp01((now - t0) / duration);
        const pa = -0.85 + smooth(p) * this._span();
        this._frame(pa);
        if (p < 1) this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    }

    showAll() {
      this.el.classList.add('in');
      this._frame(this.n - 1);
    }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this.el.classList.remove('in');
      this._frame(-0.85);
    }
  }

  global.StacktagsGraphChart = StacktagsGraphChart;
})(window);
