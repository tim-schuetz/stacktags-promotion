/* ============================================================
   Custom element — TURNOVER GAUGES
   Two horizontal "turnover meters" that fill and count up:
   Men ~80% (grey, busy) vs Women ~50% (teal, calm). Each row can be
   filled on its own beat (fillRow) so the meters track the narration.

   USAGE
     const g = new StkGauges(host, {
       title: 'Portfolio <b>turnover</b> per year',
       rows: [
         { key:'men',   label:'Men',   value:80, icon:'♂' },
         { key:'women', label:'Women', value:50, icon:'♀' },
       ],
       note: '+45% more trades',     // optional bracket note (hidden until pingNote)
     });
     g.fillRow(0);  g.fillRow(1);  g.pingNote();  g.showAll();  g.reset();
   ============================================================ */
(function (global) {
  class StkGauges {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.rows = opts.rows || [];
      this.el = document.createElement('div');
      this.el.className = 'stk-gg';
      this.el.innerHTML =
        (opts.title ? `<div class="stk-gg-title">${opts.title}</div>` : '') +
        this.rows.map((r, i) => `
          <div class="stk-gg-row ${r.key}" style="--d:${i * 0.14}s">
            <div class="stk-gg-head">
              <span class="stk-gg-label">${r.icon ? `<span class="stk-gg-icon">${r.icon}</span>` : ''}${r.label}</span>
              <span class="stk-gg-val">0%</span>
            </div>
            <div class="stk-gg-track"><div class="stk-gg-fill"></div></div>
          </div>`).join('') +
        (opts.note ? `<div class="stk-gg-note">${opts.note}</div>` : '');
      (this.host || document.body).appendChild(this.el);
      this.fills = Array.from(this.el.querySelectorAll('.stk-gg-fill'));
      this.vals = Array.from(this.el.querySelectorAll('.stk-gg-val'));
      this.noteEl = this.el.querySelector('.stk-gg-note');
      this._rafs = [];
    }

    fillRow(i, { duration = 1500 } = {}) {
      this.el.classList.add('in');
      const r = this.rows[i]; if (!r) return;
      const t0 = performance.now();
      const ease = (p) => 1 - Math.pow(1 - p, 3);
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration), e = ease(p);
        this.fills[i].style.width = (r.value * e) + '%';
        this.vals[i].textContent = Math.round(r.value * e) + '%';
        if (p < 1) this._rafs[i] = requestAnimationFrame(step);
      };
      this._rafs[i] = requestAnimationFrame(step);
    }

    fill({ duration = 1500 } = {}) { this.rows.forEach((_, i) => this.fillRow(i, { duration })); }
    pingNote() { if (this.noteEl) this.noteEl.classList.add('show'); }

    showAll() {
      this.el.classList.add('in');
      this.rows.forEach((r, i) => { this.fills[i].style.width = r.value + '%'; this.vals[i].textContent = r.value + '%'; });
      if (this.noteEl) this.noteEl.classList.add('show');
    }

    reset() {
      this._rafs.forEach((h) => h && cancelAnimationFrame(h)); this._rafs = [];
      this.el.classList.remove('in');
      this.rows.forEach((r, i) => { this.fills[i].style.width = '0%'; this.vals[i].textContent = '0%'; });
      if (this.noteEl) this.noteEl.classList.remove('show');
    }
  }
  global.StkGauges = StkGauges;
})(window);
