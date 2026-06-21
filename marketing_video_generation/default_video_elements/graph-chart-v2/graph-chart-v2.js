/* ============================================================
   Stacktags default element — GRAPH CHART v2 (climbing camera)
   The line first travels all the way to the RIGHT edge at full zoom;
   only then does the camera start zooming OUT, compressing the world
   toward the bottom-left origin. Because both axes are pinned to that
   corner, the y-axis labels contract top→bottom and the x-axis labels
   contract right→left in lock-step as the view pulls back. Labels fly
   in (y from the top, x from the right) as the line passes them, each
   with a small tick mark. White + turquoise, Inter.

   USAGE
     new StacktagsGraphChartV2('#host', {
       data: [{label,value}, …], valueSuffix:'',
     }).draw({ duration: 3600 });
   ============================================================ */
(function (global) {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (n, a) => { const e = document.createElementNS(SVGNS, n); for (const k in (a || {})) e.setAttribute(k, a[k]); return e; };
  const clamp01 = t => Math.max(0, Math.min(1, t));
  const easeOut = t => 1 - Math.pow(1 - t, 2.2);
  const lerp = (a, b, f) => a + (b - a) * f;
  function smoothPath(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  class StacktagsGraphChartV2 {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.data = (opts.data || []).map(d => (typeof d === 'number' ? { value: d } : d));
      this.n = this.data.length;

      // --- world geometry (data origin at world (0, baseY)) ---
      this.plotW  = 1480;
      this.baseY  = 1500;
      this.plotH  = 1500;
      this.worldW = this.plotW + 40;
      this.worldH = this.baseY + 40;
      this.max = Math.max(1, ...this.data.map(d => d.value));

      // --- camera: origin pinned to a fixed screen corner; zoom out happens
      //     only once the tip pushes past the right edge / top margin ---
      this.originX = 150;   // screen x of the data origin (left, fixed)
      this.originY = 1560;  // screen y of the baseline (bottom, fixed)
      this.right   = 1012;  // tip is held at this screen x once it arrives
      this.topPad  = 300;   // tip is held below this screen y
      this.S0      = 1.34;  // initial (zoomed-in) scale

      this.el = document.createElement('div');
      this.el.className = 'gv2';
      this.el.innerHTML =
        `<div class="gv2-value"><span class="num">0</span><span class="unit"></span></div>
         <div class="gv2-world"></div>
         <div class="gv2-axis"></div>`;
      (this.host || document.body).appendChild(this.el);
      this.world = this.el.querySelector('.gv2-world');
      this.axis = this.el.querySelector('.gv2-axis');
      this.valueEl = this.el.querySelector('.gv2-value .num');
      this.el.querySelector('.gv2-value .unit').textContent = opts.valueSuffix || '';
      this.world.style.width = this.worldW + 'px';
      this.world.style.height = this.worldH + 'px';

      this._build();
      this._raf = 0;
      this._frame(0);
    }

    _x(i) { return this.plotW * (this.n <= 1 ? 0.5 : i / (this.n - 1)); }
    _y(v) { return this.baseY - (v / this.max) * this.plotH; }

    _build() {
      const pts = this.data.map((d, i) => [this._x(i), this._y(d.value)]);
      this._pts = pts;
      const svg = el('svg', { class: 'gv2-svg', viewBox: `0 0 ${this.worldW} ${this.worldH}`, width: this.worldW, height: this.worldH });

      const gid = 'gv2grad';
      const defs = el('defs');
      const grad = el('linearGradient', { id: gid, x1: 0, y1: this.baseY - this.plotH, x2: 0, y2: this.baseY, gradientUnits: 'userSpaceOnUse' });
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': '#35A292', 'stop-opacity': 0.40 }));
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': '#35A292', 'stop-opacity': 0.02 }));
      defs.appendChild(grad); svg.appendChild(defs);

      const lineD = smoothPath(pts);
      const areaD = lineD + ` L ${pts[pts.length - 1][0]} ${this.baseY} L ${pts[0][0]} ${this.baseY} Z`;
      const clip = el('clipPath', { id: 'gv2clip' });
      this.clipRect = el('rect', { x: -20, y: -120, width: 0, height: this.worldH + 240 });
      clip.appendChild(this.clipRect); svg.appendChild(clip);
      this.area = el('path', { class: 'gv2-area', d: areaD, fill: `url(#${gid})`, 'clip-path': 'url(#gv2clip)' });
      this.line = el('path', { class: 'gv2-line', d: lineD, 'clip-path': 'url(#gv2clip)' });
      svg.appendChild(this.area); svg.appendChild(this.line);
      this.dot = el('circle', { class: 'gv2-dot', r: 15, cx: pts[0][0], cy: pts[0][1], opacity: 0 });
      svg.appendChild(this.dot);
      this.world.appendChild(svg);

      // y-axis levels (label + tick), screen-space, fly in from the top
      this._ylevels = [];
      for (let j = 0; j <= 4; j++) {
        const frac = j / 4, wy = this.baseY - frac * this.plotH;
        const lbl = document.createElement('div');
        lbl.className = 'gv2-ylabel';
        lbl.innerHTML = `<span class="tick"></span><span class="i">${Math.round(this.max * frac).toLocaleString('en-US')}</span>`;
        this.axis.appendChild(lbl);
        this._ylevels.push({ frac, wy, el: lbl });
      }

      // x-axis ticks (label + tick), screen-space, fly in from the right
      this._xlabels = pts.map((p, i) => {
        const lbl = document.createElement('div');
        lbl.className = 'gv2-xlabel';
        lbl.innerHTML = `<span class="tick"></span><span class="i">${this.data[i].label != null ? this.data[i].label : (i + 1)}</span>`;
        lbl.style.top = (this.originY + 8) + 'px';
        this.axis.appendChild(lbl);
        return { wx: p[0], el: lbl };
      });
    }

    // p in [0,1]
    _frame(p) {
      const e = easeOut(p);
      const idxF = e * (this.n - 1);
      const i0 = Math.floor(idxF), i1 = Math.min(this.n - 1, i0 + 1), f = idxF - i0;
      const cx = lerp(this._pts[i0][0], this._pts[i1][0], f);
      const cy = lerp(this._pts[i0][1], this._pts[i1][1], f);
      const moving = e > 0.004;   // nothing shows until the graph starts moving

      this.clipRect.setAttribute('width', moving ? cx + 24 : 0);

      // zoom: stay at S0 until the tip reaches the right edge / top margin,
      // then pull back just enough to keep it pinned there
      let S = this.S0;
      if (cx > 1) S = Math.min(S, (this.right - this.originX) / cx);
      const climb = this.baseY - cy;
      if (climb > 1) S = Math.min(S, (this.originY - this.topPad) / climb);

      const tx = this.originX;                    // origin x pinned (left)
      const ty = this.originY - this.baseY * S;    // origin y pinned (bottom)
      this.world.style.transform = `translate(${tx}px, ${ty}px) scale(${S})`;

      this.dot.setAttribute('cx', cx); this.dot.setAttribute('cy', cy);
      // dot + origin labels appear only WITH the first movement, not waiting
      this.dot.setAttribute('opacity', clamp01((e - 0.004) * 30));

      // project axes through the same camera; reveal as the line passes
      const reachedFrac = climb / this.plotH;
      this._ylevels.forEach((lv) => {
        lv.el.style.top = (ty + lv.wy * S) + 'px';
        lv.el.classList.toggle('in', moving && reachedFrac >= lv.frac - 0.04);
      });
      this._xlabels.forEach((lb) => {
        lb.el.style.left = (tx + lb.wx * S) + 'px';
        lb.el.classList.toggle('in', moving && cx >= lb.wx - 6);
      });

      const last = this.data.length ? this.data[this.n - 1].value : 0;
      if (this.valueEl) this.valueEl.textContent = Math.round(last * e).toLocaleString('en-US');
    }

    draw({ duration = 3600 } = {}) {
      this.el.classList.add('in');
      const t0 = performance.now();
      const step = (now) => {
        const p = clamp01((now - t0) / duration);
        this._frame(p);
        if (p < 1) this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    }

    showAll() { this.el.classList.add('in'); this._frame(1); }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this.el.classList.remove('in');
      this._frame(0);
    }
  }

  global.StacktagsGraphChartV2 = StacktagsGraphChartV2;
})(window);
