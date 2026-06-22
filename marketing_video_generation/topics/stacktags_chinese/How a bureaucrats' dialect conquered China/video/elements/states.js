/* ============================================================
   Stacktags video element (this topic) — WARRING STATES honeycomb
   A flat-top hex flower (1 + 6 + 12 = 19) that builds tile-by-tile,
   slowly, each with its own state name appearing just after it. When
   a tile is taken over, the new colour SWEEPS across it from the
   direction it was conquered from (clip-path reveal). Finally 汉
   ripples out from the centre and takes the whole field.
   Cue-driven: show() · bleed() · conquer().
   ============================================================ */
(function (global) {
  const STROKE = '#1f5e51';
  const UNI = '#35A292';   // 汉's colour (also what every tile becomes once conquered)
  const NAMES = ['汉', '秦', '楚', '齐', '燕', '赵', '魏', '韩', '宋', '鲁', '郑', '卫', '陈', '蔡', '吴', '越', '巴', '蜀', '晋'];

  function hslHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    const hx = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return '#' + hx(r) + hx(g) + hx(b);
  }
  // each dynasty gets ONE colour: all medium-toned teal/green family, MIXED with
  // only slight hue variation — no inner-dark / outer-light gradient. (Index 0 =
  // 汉 = the unify colour.) Deterministic spread so neighbours differ a little.
  const SHADES = [UNI];
  for (let i = 1; i < 19; i++) {
    const h = 152 + ((i * 67) % 36);   // hue 152–187 (green → teal, on-brand)
    const s = 44 + ((i * 23) % 16);    // 44–60%
    const l = 41 + ((i * 13) % 11);    // 41–52% (all medium, never washed-out)
    SHADES.push(hslHex(h, s, l));
  }

  function hexFlat(cx, cy, R) {
    let p = [];
    for (let k = 0; k < 6; k++) { const a = Math.PI / 180 * 60 * k; p.push((cx + R * Math.cos(a)).toFixed(1) + ',' + (cy + R * Math.sin(a)).toFixed(1)); }
    return p.join(' ');
  }
  const CLIP = { L: 'inset(0 100% 0 0)', R: 'inset(0 0 0 100%)', T: 'inset(0 0 100% 0)', B: 'inset(100% 0 0 0)' };
  function sideFromTo(fx, fy, tx, ty) {           // winner(f) → loser(t): colour comes from the winner side
    const dx = fx - tx, dy = fy - ty;
    if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'L' : 'R';
    return dy < 0 ? 'T' : 'B';
  }

  class StacktagsStates {
    constructor(host) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      const R = 92, cx = 400, cy = 425;
      const cells = [];
      for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
        const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
        if (ring > 2) continue;
        cells.push({ q, r, ring, x: cx + 1.5 * R * q, y: cy + Math.sqrt(3) * R * (r + q / 2) });
      }
      cells.sort((a, b) => a.ring - b.ring || Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
      cells.forEach((c, i) => { c.name = NAMES[i]; c.fill = SHADES[i]; });
      this.cells = cells; this.cx = cx; this.cy = cy;
      this.fill = cells.map((c) => c.fill);

      const W = cx * 2, H = cy * 2;
      let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
      cells.forEach((c) => {
        const pts = hexFlat(c.x, c.y, R - 2);
        svg += `<g class="st-cell">`
          + `<polygon class="st-hex" points="${pts}" fill="${c.fill}" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round"/>`
          + `<polygon class="st-sweep" points="${pts}" fill="${UNI}" stroke="none" style="clip-path:inset(0 100% 0 0)"/>`
          + `<text class="st-name" x="${c.x}" y="${c.y}" text-anchor="middle" dominant-baseline="central" fill="#fff"></text></g>`;
      });
      svg += `</svg>`;
      this.el = document.createElement('div'); this.el.className = 'st-wrap'; this.el.innerHTML = svg;
      (this.host || document.body).appendChild(this.el);
      this.groups = [...this.el.querySelectorAll('.st-cell')];
      this.hexes = [...this.el.querySelectorAll('.st-hex')];
      this.sweeps = [...this.el.querySelectorAll('.st-sweep')];
      this.labels = [...this.el.querySelectorAll('.st-name')];
      this._timers = [];
    }

    _t(fn, ms) { const id = setTimeout(fn, ms); this._timers.push(id); }
    _clear() { this._timers.forEach(clearTimeout); this._timers = []; }
    _setName(i, name) { this.labels[i].textContent = name; this.labels[i].style.opacity = 1; }

    // a colour sweeps across tile i from `side`, then the name + base colour commit
    _sweep(i, color, name, side) {
      const sw = this.sweeps[i], base = this.hexes[i], lbl = this.labels[i];
      sw.style.fill = color; sw.style.transition = 'none'; sw.style.clipPath = CLIP[side];
      void sw.getBoundingClientRect();
      sw.style.transition = 'clip-path .5s ease'; sw.style.clipPath = 'inset(0 0 0 0)';
      this._t(() => { lbl.style.opacity = 0; this._t(() => { lbl.textContent = name; lbl.style.opacity = 1; }, 120); }, 150);
      this._t(() => { base.style.fill = color; this.fill[i] = color; sw.style.transition = 'none'; sw.style.clipPath = CLIP[side]; }, 540);
    }

    // build tile-by-tile, slowly; each name appears just after its tile
    show() {
      this._clear();
      this.el.classList.add('in');
      this.hexes.forEach((h, i) => { h.style.fill = this.cells[i].fill; });
      this.fill = this.cells.map((c) => c.fill);
      this.groups.forEach((g) => g.classList.remove('on'));
      this.sweeps.forEach((s) => { s.style.transition = 'none'; s.style.clipPath = CLIP.L; });
      this.labels.forEach((l) => { l.textContent = ''; l.style.opacity = 0; });
      this.cells.forEach((c, i) => {
        this._t(() => { this.groups[i].classList.add('on'); this._t(() => this._setName(i, c.name), 170); }, i * 270);
      });
    }
    showNames() { this.cells.forEach((c, i) => this._setName(i, c.name)); }

    // a few states overtake a neighbour (directional colour sweep)
    bleed() {
      const pairs = [[0, 3], [1, 7], [4, 12]]; // [winner, loser]
      pairs.forEach(([w, l], k) => {
        this._t(() => {
          const side = sideFromTo(this.cells[w].x, this.cells[w].y, this.cells[l].x, this.cells[l].y);
          this._sweep(l, this.fill[w], this.cells[w].name, side);
        }, 150 + k * 560);
      });
    }

    // 汉 ripples out from the centre, ONE tile at a time, slowly — the takeover
    // keeps going until 汉 has the whole field (≈6s). Each tile is swept from the
    // centre side (the colour runs over it from where it was conquered).
    conquer() {
      const order = this.cells.map((c, i) => i).sort((a, b) => this.cells[a].ring - this.cells[b].ring);
      order.forEach((i, k) => {
        this._t(() => {
          const side = sideFromTo(this.cx, this.cy, this.cells[i].x, this.cells[i].y);
          this._sweep(i, UNI, '汉', side);
        }, k * 330);
      });
    }

    // "forced into a single empire": the borders between the hexes melt away and
    // every 汉 character disappears except the centre one, which scales up.
    empire() {
      this._clear();
      this.hexes.forEach((h) => { h.style.transition = 'stroke .6s ease, fill .6s ease'; h.style.fill = UNI; h.style.stroke = UNI; });
      this.fill = this.cells.map(() => UNI);
      this.labels.forEach((l, i) => {
        if (i === 0) return;
        l.style.transition = 'opacity .45s ease'; l.style.opacity = 0;
      });
      // bring the centre cell to the FRONT (SVG paints in DOM order) so the big
      // 汉 isn't clipped by the neighbouring hexes that were drawn after it
      const svg = this.el.querySelector('svg');
      if (svg && this.groups[0]) svg.appendChild(this.groups[0]);
      const c0 = this.labels[0];
      c0.textContent = '汉'; c0.style.opacity = 1;
      c0.style.zIndex = 1000;
      c0.style.transition = 'font-size .65s cubic-bezier(.34,1.5,.5,1)';
      c0.style.fontSize = '165px';
    }

    showUnified() {
      this._clear(); this.el.classList.add('in');
      this.groups.forEach((g) => g.classList.add('on'));
      this.hexes.forEach((h) => h.style.fill = UNI);
      this.sweeps.forEach((s) => s.style.clipPath = CLIP.L);
      this.labels.forEach((l) => { l.textContent = '汉'; l.style.opacity = 1; });
    }
    reset() {
      this._clear(); this.el.classList.remove('in'); this.fill = this.cells.map((c) => c.fill);
      this.groups.forEach((g) => g.classList.remove('on'));
      this.hexes.forEach((h, i) => { h.style.transition = 'none'; h.style.fill = this.cells[i].fill; h.style.stroke = STROKE; });
      this.sweeps.forEach((s) => { s.style.transition = 'none'; s.style.clipPath = CLIP.L; });
      this.labels.forEach((l) => { l.style.transition = 'none'; l.style.fontSize = ''; l.textContent = ''; l.style.opacity = 0; });
    }
  }
  global.StacktagsStates = StacktagsStates;
})(window);
