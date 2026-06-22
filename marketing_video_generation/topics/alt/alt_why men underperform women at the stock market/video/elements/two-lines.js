/* ============================================================
   Custom element — TWO LINES (the recurring device of this video)
   A busy "Trader / Men / Active" line (grey, jagged, with little
   downward fee-bite notches) vs a calm "Buy-and-Hold / Women" line
   (teal, smooth) that climbs steadily and finishes HIGHER. Both draw
   in left->right; end dots travel the tip; end pills fade in and the
   end values count up. White + turquoise, Inter, no borders — floats
   transparently over the page grid.

   USAGE
     const tl = new StacktagsTwoLines(host, {
       series: [
         { key:'busy', label:'Men',   color:'#8a949d', smooth:false,
           feeBites:true, bites:[6,11,16,21,26], points:[...0..1...],
           endValue:121, valuePrefix:'$', valueSuffix:'k' },
         { key:'calm', label:'Women', color:'#119271', smooth:true,
           glow:true, points:[...0..1...], endValue:158, valuePrefix:'$', valueSuffix:'k' },
       ],
     });
     tl.draw({ duration: 2200 });  tl.showAll();  tl.reset();

   Helpers (static): StacktagsTwoLines.busy(n,end,bites), .calm(n,end)
   ============================================================ */
(function (global) {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (n, a) => { const e = document.createElementNS(SVGNS, n); for (const k in (a || {})) e.setAttribute(k, a[k]); return e; };

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
  const polyPath = (pts) => 'M ' + pts.map((p) => p[0] + ' ' + p[1]).join(' L ');

  class StacktagsTwoLines {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.W = 1000; this.H = 1140; this.pad = { l: 96, r: 250, t: 150, b: 220 };
      this.series = (opts.series || []).slice();
      this.el = document.createElement('div');
      this.el.className = 'stk-tl2';
      this.el.innerHTML =
        `${opts.title ? `<div class="stk-tl2-title">${opts.title}</div>` : ''}<div class="stk-tl2-plot"></div>`;
      (this.host || document.body).appendChild(this.el);
      this._build();
      this._raf = 0;
    }

    _x(i, n) { const { l, r } = this.pad; return l + (this.W - l - r) * (n <= 1 ? 0 : i / (n - 1)); }
    _y(v) { const { t, b } = this.pad; return t + (this.H - t - b) * (1 - v); }

    _build() {
      const svg = el('svg', { viewBox: `0 0 ${this.W} ${this.H}`, class: 'stk-tl2-svg' });
      const baseY = this.H - this.pad.b;
      svg.appendChild(el('line', { class: 'stk-tl2-base', x1: this.pad.l - 24, y1: baseY, x2: this.W - this.pad.r + 150, y2: baseY }));

      this.S = this.series.map((s, si) => {
        const n = s.points.length;
        const pts = s.points.map((v, i) => [this._x(i, n), this._y(v)]);
        const d = s.smooth ? smoothPath(pts) : polyPath(pts);
        const clip = el('clipPath', { id: `tl2c${si}x${Math.round(pts[0][0])}` });
        const rect = el('rect', { x: -10, y: -80, width: 0, height: this.H + 160 });
        clip.appendChild(rect); svg.appendChild(clip);

        const path = el('path', { class: 'stk-tl2-line ' + s.key + (s.glow ? ' glow' : ''), d, fill: 'none', stroke: s.color });
        path.setAttribute('clip-path', `url(#${clip.id})`);
        svg.appendChild(path);

        // fee-bite ticks (small grey down-chevrons just under the busy line)
        const biteEls = [];
        if (s.feeBites && s.bites) {
          s.bites.forEach((bi) => {
            const p = pts[bi]; if (!p) return;
            const g = el('g', { class: 'stk-tl2-bite', transform: `translate(${p[0]},${p[1] + 6})`, opacity: 0 });
            g.appendChild(el('path', { d: 'M -14 8 L 0 30 L 14 8', fill: 'none', stroke: '#9aa4ad', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
            svg.appendChild(g); biteEls.push({ g, x: p[0] });
          });
        }

        const dot = el('circle', { class: 'stk-tl2-dot ' + s.key, r: 15, cx: pts[0][0], cy: pts[0][1], fill: s.color, opacity: 0 });
        svg.appendChild(dot);

        // end pill (rect + label + value), as SVG so it stays aligned with the line
        const last = pts[pts.length - 1];
        const px = last[0] + 34, py = last[1];
        const grp = el('g', { class: 'stk-tl2-pill ' + s.key, transform: `translate(${px},${py})`, opacity: 0 });
        const hasVal = s.endValue != null;
        const pillH = hasVal ? 126 : 78, pillW = 220;
        grp.appendChild(el('rect', { x: 0, y: -pillH / 2, width: pillW, height: pillH, rx: 26, class: 'stk-tl2-pill-bg' }));
        const lab = el('text', { x: 26, y: hasVal ? -16 : 11, class: 'stk-tl2-pill-lab' }); lab.textContent = s.label || '';
        grp.appendChild(lab);
        let valEl = null;
        if (hasVal) {
          valEl = el('text', { x: 26, y: 40, class: 'stk-tl2-pill-val' });
          valEl.textContent = (s.valuePrefix || '') + '0' + (s.valueSuffix || '');
          grp.appendChild(valEl);
        }
        svg.appendChild(grp);

        return { s, pts, rect, dot, biteEls, grp, valEl, startX: pts[0][0], endX: last[0] };
      });

      this.el.querySelector('.stk-tl2-plot').appendChild(svg);
      this.svg = svg;
    }

    _setVal(S, e) {
      if (!S.valEl) return;
      const v = S.s.endValue * e;
      const txt = (S.s.valuePrefix || '') + (S.s.valueDecimals != null
        ? v.toFixed(S.s.valueDecimals)
        : Math.round(v).toLocaleString('en-US')) + (S.s.valueSuffix || '');
      S.valEl.textContent = txt;
    }

    _tipAt(S, x) {
      const pts = S.pts;
      for (let i = 0; i < pts.length - 1; i++) {
        if (x <= pts[i + 1][0]) {
          const f = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0] || 1);
          return [x, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * Math.max(0, Math.min(1, f))];
        }
      }
      return pts[pts.length - 1];
    }

    draw({ duration = 2200, settle = 380 } = {}) {
      this.el.classList.add('in');
      const t0 = performance.now();
      const ease = (p) => 1 - Math.pow(1 - p, 3);
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const e = ease(p);
        this.S.forEach((S) => {
          const x = S.startX + (S.endX - S.startX) * e;
          S.rect.setAttribute('width', x + 12);
          const tip = this._tipAt(S, x);
          S.dot.setAttribute('cx', tip[0]); S.dot.setAttribute('cy', tip[1]);
          S.dot.setAttribute('opacity', Math.min(1, p * 3));
          S.biteEls.forEach((b) => { if (b.x <= x) b.g.setAttribute('opacity', 1); });
          this._setVal(S, e);
        });
        if (p < 1) { this._raf = requestAnimationFrame(step); return; }
        // settle: reveal the end pills
        this.S.forEach((S, i) => setTimeout(() => S.grp.setAttribute('opacity', 1), 80 + i * 140));
      };
      this._raf = requestAnimationFrame(step);
    }

    showAll() {
      this.el.classList.add('in');
      this.S.forEach((S) => {
        S.rect.setAttribute('width', S.endX + 12);
        const last = S.pts[S.pts.length - 1];
        S.dot.setAttribute('cx', last[0]); S.dot.setAttribute('cy', last[1]); S.dot.setAttribute('opacity', 1);
        S.biteEls.forEach((b) => b.g.setAttribute('opacity', 1));
        S.grp.setAttribute('opacity', 1);
        this._setVal(S, 1);
      });
    }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this.el.classList.remove('in');
      this.S.forEach((S) => {
        S.rect.setAttribute('width', 0);
        S.dot.setAttribute('opacity', 0);
        S.biteEls.forEach((b) => b.g.setAttribute('opacity', 0));
        S.grp.setAttribute('opacity', 0);
        this._setVal(S, 0);
      });
    }
  }

  // ---- point generators (normalized 0..1) ----
  // calm: smooth concave rise to `end`
  StacktagsTwoLines.calm = function (n, end) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      out.push(+(0.10 + (end - 0.10) * (1 - Math.pow(1 - t, 1.7))).toFixed(4));
    }
    return out;
  };
  // busy: rises like calm but every `every` steps takes a fee-bite (small dip),
  // and trends to a lower `end`. Returns { points, bites }.
  StacktagsTwoLines.busy = function (n, end, every) {
    const pts = []; const bites = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      let v = 0.10 + (end - 0.10) * (1 - Math.pow(1 - t, 1.6));
      // jitter so it looks restless
      v += Math.sin(i * 1.7) * 0.012;
      pts.push(v);
    }
    for (let i = every; i < n - 1; i += every) {
      pts[i] = Math.max(0.04, pts[i] - 0.075);   // the bite
      bites.push(i);
    }
    return { points: pts.map((v) => +v.toFixed(4)), bites };
  };

  global.StacktagsTwoLines = StacktagsTwoLines;
})(window);
