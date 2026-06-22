/* ============================================================
   Stacktags default element — PIE / DONUT CHART (logic)
   An SVG pie (Kreisdiagramm) or donut that sweeps itself in clockwise.
   Legend modes:
     - 'arc'    : labels curve AROUND the outer radius and are written as
                  the ring fills (same speed) — used for the donut.
     - 'inside' : labels sit INSIDE each segment; the largest segment also
                  shows its % and in a bigger font — used for the pie.
     - 'below'  : classic legend underneath (default fallback).
   White + turquoise palette, Inter, no borders.

   USAGE
     new StacktagsPieChart('#host', {
       donut: true, legend: 'arc',
       title: '…', sub: '…',
       data: [{ label:'Anleihen', value:42 }, …],
       sound: 'sound/chart.mp3',
     }).draw({ duration: 1700 });
   ============================================================ */
(function (global) {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const mk = (n, a) => { const e = document.createElementNS(SVGNS, n); for (const k in (a || {})) e.setAttribute(k, a[k]); return e; };
  const TAU = Math.PI * 2;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const PALETTE = ['#0c7d5e', '#119271', '#2aa987', '#46bda0', '#74d2bd', '#a6e3d6'];

  class StacktagsPieChart {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.donut = !!opts.donut;
      this.legendMode = opts.legend || (this.donut ? 'arc' : 'below');
      this.data = (opts.data || []).map((d, i) => ({
        label: d.label || '', value: +d.value || 0,
        color: d.color || PALETTE[i % PALETTE.length],
      }));
      this.total = this.data.reduce((s, d) => s + d.value, 0) || 1;
      this._maxIdx = this.data.reduce((m, d, i, a) => d.value > a[m].value ? i : m, 0);

      this.cx = 200; this.cy = 200; this.rO = this.donut ? 168 : 196; this.rI = this.donut ? 86 : 0;   // pie circle bigger

      this.el = document.createElement('div');
      this.el.className = 'stk-pie' + (this.donut ? ' donut' : '');
      this.el.innerHTML =
        `<div class="stk-pie-head">
           ${opts.title ? `<div class="stk-pie-title">${opts.title}</div>` : ''}
           ${opts.sub ? `<div class="stk-pie-sub">${opts.sub}</div>` : ''}
         </div>
         <div class="stk-pie-plot"></div>` +
        (this.legendMode === 'below' ? `<div class="stk-pie-legend"></div>` : '');
      (this.host || document.body).appendChild(this.el);

      this._build();
      this._raf = 0;
    }

    _pt(r, a) { return [this.cx + r * Math.sin(a), this.cy - r * Math.cos(a)]; }

    _arc(a0, a1) {
      const { rO, rI, cx, cy } = this;
      if (a1 - a0 >= TAU - 1e-4) a1 = a0 + TAU - 1e-4;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const [ox0, oy0] = this._pt(rO, a0), [ox1, oy1] = this._pt(rO, a1);
      if (rI <= 0) return `M ${cx} ${cy} L ${ox0} ${oy0} A ${rO} ${rO} 0 ${large} 1 ${ox1} ${oy1} Z`;
      const [ix1, iy1] = this._pt(rI, a1), [ix0, iy0] = this._pt(rI, a0);
      return `M ${ox0} ${oy0} A ${rO} ${rO} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${rI} ${rI} 0 ${large} 0 ${ix0} ${iy0} Z`;
    }

    // a label arc that keeps text upright: top half drawn CW, bottom half CCW
    _labelArcPath(r, a0, a1) {
      const mid = (a0 + a1) / 2;
      const norm = ((mid % TAU) + TAU) % TAU;
      const bottom = norm > Math.PI * 0.5 && norm < Math.PI * 1.5;
      const [x0, y0] = this._pt(r, a0), [x1, y1] = this._pt(r, a1);
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      return bottom
        ? `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x0} ${y0}`   // reversed → upright
        : `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
    }

    _build() {
      const svg = mk('svg', { viewBox: '0 0 400 400' });
      if (this.donut) svg.appendChild(mk('circle', { class: 'stk-pie-track', cx: this.cx, cy: this.cy, r: (this.rO + this.rI) / 2, 'stroke-width': this.rO - this.rI }));

      let a = 0;
      this.segs = this.data.map((d, i) => {
        const a0 = a, a1 = a + (d.value / this.total) * TAU; a = a1;
        const path = mk('path', { class: 'stk-pie-seg', d: this._arc(a0, a0), fill: d.color, stroke: '#ffffff', 'stroke-width': 4, 'stroke-linejoin': 'round' });
        svg.appendChild(path);
        return { a0, a1, path, color: d.color };
      });

      // labels overlay
      const labels = mk('g', { class: 'stk-pie-labels' });
      this.labelEls = this.data.map((d, i) => {
        const s = this.segs[i];
        const pct = Math.round((d.value / this.total) * 100);
        if (this.legendMode === 'arc') {
          const r = this.rO + 26;
          const id = 'arc' + i + '_' + Math.floor(Math.random() * 1e6);
          labels.appendChild(mk('path', { id, d: this._labelArcPath(r, s.a0 + 0.04, s.a1 - 0.04), fill: 'none' }));
          const t = mk('text', { class: 'stk-pie-arclabel' });
          const tp = mk('textPath', { href: '#' + id, startOffset: '50%', 'text-anchor': 'middle' });
          tp.setAttribute('startOffset', '50%');
          tp.textContent = d.label;
          t.appendChild(tp); labels.appendChild(t);
          t.style.opacity = 0;
          return t;
        } else if (this.legendMode === 'inside') {
          const big = i === this._maxIdx;
          // the biggest segment's label sits near the outer edge so it PROTRUDES
          // past the slice; the rest sit at the segment centroid
          const rmid = big ? this.rO * 1.02 : (this.donut ? (this.rO + this.rI) / 2 : this.rO * 0.56);
          const [lx0, ly] = this._pt(rmid, (s.a0 + s.a1) / 2);
          const lx = big ? lx0 - 46 : lx0;       // nudge the big label further left
          const t = mk('text', { class: 'stk-pie-inlabel' + (big ? ' big' : ''), x: lx, y: ly, 'text-anchor': 'middle' });
          const l1 = mk('tspan', { x: lx, dy: big ? '-0.1em' : '0.32em' }); l1.textContent = d.label; t.appendChild(l1);
          if (big) { const l2 = mk('tspan', { x: lx, dy: '1.05em', class: 'pctline' }); l2.textContent = pct + '%'; t.appendChild(l2); }
          svg.appendChild(t); t.style.opacity = 0;
          return t;
        }
        return null;
      });
      if (this.legendMode === 'arc') svg.appendChild(labels);

      this.el.querySelector('.stk-pie-plot').appendChild(svg);
      this.svg = svg;

      // below-legend fallback
      if (this.legendMode === 'below') {
        const lg = this.el.querySelector('.stk-pie-legend');
        this.legendItems = this.data.map(d => {
          const pct = Math.round((d.value / this.total) * 100);
          const item = document.createElement('div');
          item.className = 'stk-pie-li';
          item.innerHTML = `<span class="dot" style="background:${d.color}"></span><span class="lbl">${d.label}</span><span class="pct">${pct}%</span>`;
          lg.appendChild(item); return item;
        });
      }
    }

    _ping() {
      if (!this.opts.sound) return;
      try { const a = new Audio(this.opts.sound); a.volume = this.opts.volume != null ? this.opts.volume : 0.7; a.play().catch(() => {}); } catch (e) {}
    }

    _revealLabels(sweep) {
      this.labelEls.forEach((t, i) => {
        if (!t) return;
        const s = this.segs[i];
        if (this.legendMode === 'arc') t.style.opacity = clamp01((sweep - s.a0) / Math.max(0.001, (s.a1 - s.a0)));   // written as the ring fills
        else if (sweep >= (s.a0 + s.a1) / 2) t.style.opacity = 1;
      });
      if (this.legendItems) this.segs.forEach((s, i) => { if (sweep >= (s.a0 + s.a1) / 2) this.legendItems[i].classList.add('in'); });
    }

    draw({ duration = 1700 } = {}) {
      this.el.classList.add('head-in');
      this._ping();
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, Math.max(0, (now - t0) / duration));
        const e = 1 - Math.pow(1 - p, 3);
        const sweep = e * TAU;
        this.segs.forEach(s => s.path.setAttribute('d', this._arc(s.a0, Math.max(s.a0, Math.min(s.a1, sweep)))));
        this._revealLabels(sweep);
        if (p < 1) this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    }

    showAll() {
      this.el.classList.add('head-in');
      this.segs.forEach(s => s.path.setAttribute('d', this._arc(s.a0, s.a1)));
      this._revealLabels(TAU);
    }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this.el.classList.remove('head-in');
      this.segs.forEach(s => s.path.setAttribute('d', this._arc(s.a0, s.a0)));
      this.labelEls.forEach(t => { if (t) t.style.opacity = 0; });
      if (this.legendItems) this.legendItems.forEach(it => it.classList.remove('in'));
    }
  }

  global.StacktagsPieChart = StacktagsPieChart;
})(window);
