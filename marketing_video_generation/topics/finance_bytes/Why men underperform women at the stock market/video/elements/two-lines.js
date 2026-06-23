/* ============================================================
   Custom element — TWO LINES  (the recurring device of this video)
   A busy GREY line (jagged, with little downward "fee-bite" notches)
   vs a calm TEAL line (smooth, softly glowing) that climbs steadily
   and finishes HIGHER. Both draw in left→right with a travelling end
   dot; end pills fade in. Floats transparently over the page grid.
   White + turquoise, Inter, no borders.

   USAGE
     const tl = new StkTwoLines(host, {
       title: 'They just <b>trade too much</b>.',   // optional
       busy:  { label: 'Men',   end: 0.54, bites: 5 },
       calm:  { label: 'Women', end: 0.88 },
       gap:   true,            // ping a teal "+gap" marker between the tips
       overtake: false,        // calm starts below busy then crosses above
     });
     tl.draw({ duration: 2200 });   tl.showAll();   tl.reset();
   ============================================================ */
(function (global) {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in (a || {})) e.setAttribute(k, a[k]); return e; };
  const GREY = '#8a949d', TEAL = '#119271';

  function smooth(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }
  const poly = (pts) => 'M ' + pts.map((p) => p[0] + ' ' + p[1]).join(' L ');

  // calm: smooth concave rise from lo to end
  function calmPts(n, end, lo) {
    const o = [];
    for (let i = 0; i < n; i++) { const t = i / (n - 1); o.push(lo + (end - lo) * (1 - Math.pow(1 - t, 1.7))); }
    return o;
  }
  // busy: restless rise to a lower end, with downward fee-bites every `every`
  function busyPts(n, end, every, lo) {
    const v = [], bites = [];
    for (let i = 0; i < n; i++) { const t = i / (n - 1); v.push(lo + (end - lo) * (1 - Math.pow(1 - t, 1.55)) + Math.sin(i * 1.7) * 0.013); }
    for (let i = every; i < n - 1; i += every) { v[i] = Math.max(0.04, v[i] - 0.072); bites.push(i); }
    return { pts: v.map((x) => +x.toFixed(4)), bites };
  }

  class StkTwoLines {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.W = 1000; this.H = 1120; this.pad = { l: 92, r: 240, t: 170, b: 230 };
      this.n = opts.n || 34;
      this.root = document.createElement('div');
      this.root.className = 'stk2l';
      this.root.innerHTML = (opts.title ? `<div class="stk2l-title">${opts.title}</div>` : '') + '<div class="stk2l-plot"></div>';
      (this.host || document.body).appendChild(this.root);
      this._raf = 0;
      this._build();
    }

    _x(i) { const { l, r } = this.pad; return l + (this.W - l - r) * (i / (this.n - 1)); }
    _y(v) { const { t, b } = this.pad; return t + (this.H - t - b) * (1 - v); }

    _build() {
      const o = this.opts;
      const svg = mk('svg', { viewBox: `0 0 ${this.W} ${this.H}`, class: 'stk2l-svg' });
      const baseY = this.H - this.pad.b;
      svg.appendChild(mk('line', { class: 'stk2l-base', x1: this.pad.l - 22, y1: baseY, x2: this.W - this.pad.r + 140, y2: baseY }));

      this.S = [];
      // build calm + busy series as requested (default: both)
      const wantBusy = o.busy !== false, wantCalm = o.calm !== false;
      const overtake = !!o.overtake;

      if (wantBusy) {
        const bo = o.busy || {}; const end = bo.end != null ? bo.end : 0.52;
        const gen = busyPts(this.n, end, bo.bites || 5, 0.12);
        this.S.push(this._series('busy', GREY, gen.pts, false, bo.label || 'Men', gen.bites, false));
      }
      if (wantCalm) {
        const co = o.calm || {}; let end = co.end != null ? co.end : 0.86;
        // overtake: dip the early part of the calm line so it starts below busy
        const pts = calmPts(this.n, end, overtake ? 0.30 : 0.12);
        if (overtake) for (let i = 0; i < this.n; i++) { const t = i / (this.n - 1); pts[i] -= (1 - t) * 0.20; }
        this.S.push(this._series('calm', TEAL, pts, true, co.label || 'Women', null, true));
      }

      // optional teal "gap" connector between the two end tips
      if (o.gap && this.S.length === 2) {
        const a = this.S[0], b = this.S[1];
        const ax = this._x(this.n - 1), ay = a.yPts[this.n - 1], by = b.yPts[this.n - 1];
        this.gapEl = mk('g', { class: 'stk2l-gap', opacity: 0 });
        this.gapEl.appendChild(mk('line', { x1: ax + 0, y1: ay, x2: ax + 0, y2: by, class: 'stk2l-gapline' }));
        svg.appendChild(this.gapEl);
        this._gapMid = [ax, (ay + by) / 2];
      }

      this.S.forEach((s) => { svg.appendChild(s.clip); svg.appendChild(s.path); s.biteEls.forEach((b) => svg.appendChild(b.g)); svg.appendChild(s.dot); svg.appendChild(s.pill); });
      this.root.querySelector('.stk2l-plot').appendChild(svg);
      this.svg = svg;
    }

    _series(key, color, vals, isSmooth, label, bites, glow) {
      const pts = vals.map((v, i) => [this._x(i), this._y(v)]);
      const yPts = pts.map((p) => p[1]);
      const id = key + Math.round(Math.random() * 1e6);
      const clip = mk('clipPath', { id });
      const rect = mk('rect', { x: -20, y: -120, width: 0, height: this.H + 240 });
      clip.appendChild(rect);
      const path = mk('path', { d: isSmooth ? smooth(pts) : poly(pts), class: 'stk2l-line ' + key + (glow ? ' glow' : ''), fill: 'none', stroke: color, 'clip-path': `url(#${id})` });
      const biteEls = [];
      if (bites) bites.forEach((bi) => {
        const p = pts[bi]; if (!p) return;
        const g = mk('g', { class: 'stk2l-bite', transform: `translate(${p[0]},${p[1] + 4})`, opacity: 0 });
        g.appendChild(mk('path', { d: 'M -13 7 L 0 28 L 13 7', fill: 'none', stroke: '#9aa4ad', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        biteEls.push({ g, x: p[0] });
      });
      const dot = mk('circle', { class: 'stk2l-dot ' + key, r: 14, cx: pts[0][0], cy: pts[0][1], fill: color, opacity: 0 });
      const last = pts[pts.length - 1];
      const pill = mk('g', { class: 'stk2l-pill ' + key, transform: `translate(${last[0] + 30},${last[1]})`, opacity: 0 });
      pill.appendChild(mk('rect', { x: 0, y: -42, width: 196, height: 84, rx: 24, class: 'stk2l-pill-bg' }));
      const lab = mk('text', { x: 26, y: 13, class: 'stk2l-pill-lab' }); lab.textContent = label || '';
      pill.appendChild(lab);
      return { key, pts, yPts, rect, clip, path, dot, biteEls, pill, startX: pts[0][0], endX: last[0] };
    }

    _tip(S, x) {
      const pts = S.pts;
      for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) {
        const f = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0] || 1);
        return [x, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * Math.max(0, Math.min(1, f))];
      }
      return pts[pts.length - 1];
    }

    draw({ duration = 2200 } = {}) {
      this.root.classList.add('in');
      const t0 = performance.now();
      const ease = (p) => 1 - Math.pow(1 - p, 3);
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration), e = ease(p);
        this.S.forEach((S) => {
          const x = S.startX + (S.endX - S.startX) * e;
          S.rect.setAttribute('width', x + 16);
          const tip = this._tip(S, x);
          S.dot.setAttribute('cx', tip[0]); S.dot.setAttribute('cy', tip[1]); S.dot.setAttribute('opacity', Math.min(1, p * 3));
          S.biteEls.forEach((b) => { if (b.x <= x) b.g.setAttribute('opacity', 1); });
        });
        if (p < 1) { this._raf = requestAnimationFrame(step); return; }
        this.S.forEach((S, i) => setTimeout(() => S.pill.setAttribute('opacity', 1), 60 + i * 150));
        if (this.gapEl) setTimeout(() => this.gapEl.setAttribute('opacity', 1), 360);
      };
      this._raf = requestAnimationFrame(step);
    }

    showAll() {
      this.root.classList.add('in');
      this.S.forEach((S) => {
        S.rect.setAttribute('width', S.endX + 16);
        const last = S.pts[S.pts.length - 1];
        S.dot.setAttribute('cx', last[0]); S.dot.setAttribute('cy', last[1]); S.dot.setAttribute('opacity', 1);
        S.biteEls.forEach((b) => b.g.setAttribute('opacity', 1));
        S.pill.setAttribute('opacity', 1);
      });
      if (this.gapEl) this.gapEl.setAttribute('opacity', 1);
    }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this.root.classList.remove('in');
      this.S.forEach((S) => { S.rect.setAttribute('width', 0); S.dot.setAttribute('opacity', 0); S.biteEls.forEach((b) => b.g.setAttribute('opacity', 0)); S.pill.setAttribute('opacity', 0); });
      if (this.gapEl) this.gapEl.setAttribute('opacity', 0);
    }
  }

  global.StkTwoLines = StkTwoLines;
})(window);
