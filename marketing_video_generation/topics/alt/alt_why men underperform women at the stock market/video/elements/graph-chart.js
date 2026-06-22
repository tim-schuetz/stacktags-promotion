/* ============================================================
   Stacktags default element — GRAPH CHART (logic)
   Draws a line/area or bar chart in, left to right, with a moving
   end-dot and a headline value that counts up as it draws.
   White + turquoise, Inter, thin grey gridlines, no borders.

   USAGE
     const chart = new StacktagsGraphChart(hostEl, {
       type: 'line',                       // 'line' | 'bar'
       title: 'Daily active users',        // supports <b> for turquoise
       sub: 'last 12 weeks',
       data: [{label:'W1',value:120}, ...],// label optional
       max: null,                          // y-axis max (auto if null)
       valuePrefix: '', valueSuffix: '',   // for the headline count-up
       showValue: true,                    // big counting number
       sound: 'sound/graph.mp3',           // optional SFX on draw start
     });
     chart.draw({ duration: 1800 });       // animate it in
     chart.showAll();                       // final frame instantly (seek)
     chart.reset();

   Pairs with graph-chart.css. Pure SVG/DOM + optional <audio>.
   ============================================================ */
(function (global) {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (n, a) => { const e = document.createElementNS(SVGNS, n); for (const k in (a || {})) e.setAttribute(k, a[k]); return e; };

  // Catmull-Rom -> cubic bezier path through the points (smooth line).
  function smoothPath(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  class StacktagsGraphChart {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = Object.assign({ type: 'line', showValue: true, valuePrefix: '', valueSuffix: '' }, opts);
      this.data = (opts.data || []).map(d => (typeof d === 'number' ? { value: d } : d));
      this.W = 900; this.H = 760; this.pad = { l: 40, r: 40, t: 30, b: 80 };

      this.el = document.createElement('div');
      this.el.className = 'stk-chart';
      this.el.innerHTML =
        `<div class="stk-chart-head">
           ${opts.title ? `<div class="stk-chart-title">${opts.title}</div>` : ''}
           ${opts.sub ? `<div class="stk-chart-sub">${opts.sub}</div>` : ''}
         </div>
         ${this.opts.showValue ? `<div class="stk-chart-value"><span class="num">0</span><span class="unit"></span></div>` : ''}
         <div class="stk-chart-plot"></div>`;
      (this.host || document.body).appendChild(this.el);
      this.valueEl = this.el.querySelector('.stk-chart-value .num');
      this.unitEl = this.el.querySelector('.stk-chart-value .unit');
      if (this.unitEl) this.unitEl.textContent = this.opts.valueSuffix || '';

      this._build();
      this._raf = 0;
    }

    _scaleY(v) {
      const { t, b } = this.pad;
      const max = this.opts.max != null ? this.opts.max : Math.max(1, ...this.data.map(d => d.value));
      this.max = max;
      return t + (this.H - t - b) * (1 - v / max);
    }
    _x(i) {
      const { l, r } = this.pad;
      const n = this.data.length;
      return l + (this.W - l - r) * (n <= 1 ? 0.5 : i / (n - 1));
    }

    _build() {
      const svg = el('svg', { viewBox: `0 0 ${this.W} ${this.H}` });
      const { t, b } = this.pad;
      // horizontal gridlines (4)
      const grid = el('g', { class: 'stk-chart-grid' });
      const rows = 4;
      for (let i = 0; i <= rows; i++) {
        const y = t + (this.H - t - b) * (i / rows);
        grid.appendChild(el('line', { x1: 0, y1: y, x2: this.W, y2: y }));
      }
      svg.appendChild(grid);

      if (this.opts.type === 'bar') this._buildBars(svg);
      else this._buildLine(svg);

      // x labels
      if (this.data.some(d => d.label)) {
        const xl = el('g', { class: 'stk-chart-xlabels' });
        this._xlabels = [];
        this.data.forEach((d, i) => {
          if (!d.label) return;
          const tx = el('text', { x: this._x(i), y: this.H - b + 44, 'text-anchor': 'middle', 'font-size': 26, opacity: 0 });
          tx.textContent = d.label;
          tx._x = this._x(i);
          xl.appendChild(tx);
          this._xlabels.push(tx);
        });
        svg.appendChild(xl);
      }
      this.el.querySelector('.stk-chart-plot').appendChild(svg);
      this.svg = svg;
    }

    _buildLine(svg) {
      const pts = this.data.map((d, i) => [this._x(i), this._scaleY(d.value)]);
      const baseY = this.H - this.pad.b;
      const lineD = smoothPath(pts);
      const areaD = lineD + ` L ${pts[pts.length - 1][0]} ${baseY} L ${pts[0][0]} ${baseY} Z`;

      // vertical fill gradient: more opaque near the line (top), fading to nearly
      // transparent at the bottom
      const gid = 'stkGrad' + Math.floor(this._x(0) + this.data.length);
      const defs = el('defs');
      const grad = el('linearGradient', { id: gid, x1: 0, y1: this.pad.t, x2: 0, y2: baseY, gradientUnits: 'userSpaceOnUse' });
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': '#35A292', 'stop-opacity': 0.42 }));
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': '#35A292', 'stop-opacity': 0.02 }));
      defs.appendChild(grad); svg.appendChild(defs);

      this.area = el('path', { class: 'stk-chart-area', d: areaD, fill: `url(#${gid})` });
      this.line = el('path', { class: 'stk-chart-line', d: lineD });
      // clip that grows left->right to reveal the draw
      const clip = el('clipPath', { id: 'stkClip' + Math.floor(this._x(0) + this.data.length) });
      this.clipRect = el('rect', { x: 0, y: -40, width: 0, height: this.H + 80 });
      clip.appendChild(this.clipRect);
      svg.appendChild(clip);
      this.area.setAttribute('clip-path', `url(#${clip.id})`);
      this.line.setAttribute('clip-path', `url(#${clip.id})`);
      svg.appendChild(this.area);
      svg.appendChild(this.line);

      this.halo = el('circle', { class: 'stk-chart-dot-halo', r: 22, cx: pts[0][0], cy: pts[0][1], opacity: 0 });
      this.dot = el('circle', { class: 'stk-chart-dot', r: 11, cx: pts[0][0], cy: pts[0][1], opacity: 0 });
      svg.appendChild(this.halo); svg.appendChild(this.dot);
      this._pts = pts;
    }

    _buildBars(svg) {
      const n = this.data.length;
      const { l, r, b } = this.pad;
      const baseY = this.H - b;
      const slot = (this.W - l - r) / n;
      const bw = slot * 0.6;
      const peak = Math.max(...this.data.map(d => d.value));
      this.bars = this.data.map((d, i) => {
        const x = l + slot * i + (slot - bw) / 2;
        const yTop = this._scaleY(d.value);
        const rect = el('rect', { class: 'stk-chart-bar' + (d.value === peak ? ' peak' : ''), x, y: baseY, width: bw, height: 0, rx: 12 });
        rect._full = baseY - yTop; rect._baseY = baseY;
        svg.appendChild(rect);
        return rect;
      });
    }

    _ping() {
      if (!this.opts.sound) return;
      try { const a = new Audio(this.opts.sound); a.volume = this.opts.volume != null ? this.opts.volume : 0.7; a.play().catch(() => {}); } catch (e) {}
    }

    draw({ duration = 1800 } = {}) {
      this.el.classList.add('head-in');
      setTimeout(() => this.el.classList.add('value-in'), 150);
      this._ping();
      const total = this.data.reduce((s, d) => s + d.value, 0);
      const last = this.data.length ? this.data[this.data.length - 1].value : 0;
      const headlineTarget = this.opts.headline != null ? this.opts.headline : (this.opts.type === 'bar' ? total : last);

      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, Math.max(0, (now - t0) / duration));
        const e = 1 - Math.pow(1 - p, 3);
        if (this.opts.type === 'bar') {
          const k = this.bars.length;
          this.bars.forEach((rect, i) => {
            const local = Math.max(0, Math.min(1, (e * k - i)));
            const ee = 1 - Math.pow(1 - local, 3);
            rect.setAttribute('height', rect._full * ee);
            rect.setAttribute('y', rect._baseY - rect._full * ee);
          });
        } else {
          // reveal the line exactly up to the moving end-dot (so the dot is
          // always at the drawn tip — never trailing behind the line)
          const idxF = e * (this._pts.length - 1);
          const i0 = Math.floor(idxF), i1 = Math.min(this._pts.length - 1, i0 + 1), f = idxF - i0;
          const cx = this._pts[i0][0] + (this._pts[i1][0] - this._pts[i0][0]) * f;
          const cy = this._pts[i0][1] + (this._pts[i1][1] - this._pts[i0][1]) * f;
          this.clipRect.setAttribute('width', cx + 4);
          if (this._xlabels) this._xlabels.forEach(t => { if (t._x <= cx) t.setAttribute('opacity', 1); });
          [this.dot, this.halo].forEach(c => { c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('opacity', Math.min(1, p * 3)); });
        }
        if (this.valueEl) this.valueEl.textContent = (this.opts.valuePrefix || '') + Math.round(headlineTarget * e).toLocaleString('en-US');
        if (p < 1) this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    }

    showAll() {
      this.el.classList.add('head-in', 'value-in');
      if (this.opts.type === 'bar') this.bars.forEach(r => { r.setAttribute('height', r._full); r.setAttribute('y', r._baseY - r._full); });
      else { this.clipRect.setAttribute('width', this.W); const p = this._pts[this._pts.length - 1]; [this.dot, this.halo].forEach(c => { c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('opacity', 1); }); if (this._xlabels) this._xlabels.forEach(t => t.setAttribute('opacity', 1)); }
      const last = this.data.length ? this.data[this.data.length - 1].value : 0;
      const total = this.data.reduce((s, d) => s + d.value, 0);
      const headlineTarget = this.opts.headline != null ? this.opts.headline : (this.opts.type === 'bar' ? total : last);
      if (this.valueEl) this.valueEl.textContent = (this.opts.valuePrefix || '') + Math.round(headlineTarget).toLocaleString('en-US');
    }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this.el.classList.remove('head-in', 'value-in');
      if (this.opts.type === 'bar') this.bars.forEach(r => { r.setAttribute('height', 0); r.setAttribute('y', r._baseY); });
      else { this.clipRect.setAttribute('width', 0); [this.dot, this.halo].forEach(c => c.setAttribute('opacity', 0)); }
      if (this.valueEl) this.valueEl.textContent = '0';
    }
  }

  global.StacktagsGraphChart = StacktagsGraphChart;
})(window);
