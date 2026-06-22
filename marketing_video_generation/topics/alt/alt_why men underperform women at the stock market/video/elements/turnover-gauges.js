/* ============================================================
   Custom element — TURNOVER GAUGES
   Two horizontal "turnover meters" that fill up and count up:
   Men ~80% (grey, busy) vs Women ~50% (teal, calm). Consistent with
   the video's grey=busy / teal=patient colour language.

   USAGE
     const g = new StacktagsTurnoverGauges(host, {
       title: 'Portfolio turnover / year',
       rows: [
         { key:'men',   label:'Men',   value:80, color:'#8a949d', icon:'♂' },
         { key:'women', label:'Women', value:50, color:'#119271', icon:'♀' },
       ],
     });
     g.fill({ duration: 1600 });  g.showAll();  g.reset();
   ============================================================ */
(function (global) {
  class StacktagsTurnoverGauges {
    constructor(host, opts = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.opts = opts;
      this.rows = opts.rows || [];
      this.el = document.createElement('div');
      this.el.className = 'stk-gauge';
      this.el.innerHTML =
        `${opts.title ? `<div class="stk-gauge-title">${opts.title}</div>` : ''}` +
        this.rows.map((r, i) => `
          <div class="stk-gauge-row ${r.key}" data-i="${i}" style="--d:${i * 0.14}s">
            <div class="stk-gauge-head">
              <span class="stk-gauge-label">${r.icon ? `<span class="stk-gauge-icon">${r.icon}</span>` : ''}${r.label}</span>
              <span class="stk-gauge-val">0%</span>
            </div>
            <div class="stk-gauge-track"><div class="stk-gauge-fill" style="background:${r.color}"></div></div>
            ${r.sub ? `<div class="stk-gauge-sub">${r.sub}</div>` : ''}
          </div>`).join('');
      (this.host || document.body).appendChild(this.el);
      this.fills = Array.from(this.el.querySelectorAll('.stk-gauge-fill'));
      this.vals = Array.from(this.el.querySelectorAll('.stk-gauge-val'));
      this._raf = 0;
    }

    fill({ duration = 1600 } = {}) {
      this.el.classList.add('in');
      const t0 = performance.now();
      const ease = (p) => 1 - Math.pow(1 - p, 3);
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const e = ease(p);
        this.rows.forEach((r, i) => {
          this.fills[i].style.width = (r.value * e) + '%';
          this.vals[i].textContent = Math.round(r.value * e) + '%';
        });
        if (p < 1) this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    }

    showAll() {
      this.el.classList.add('in');
      this.rows.forEach((r, i) => { this.fills[i].style.width = r.value + '%'; this.vals[i].textContent = r.value + '%'; });
    }

    reset() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this.el.classList.remove('in');
      this.rows.forEach((r, i) => { this.fills[i].style.width = '0%'; this.vals[i].textContent = '0%'; });
    }
  }
  global.StacktagsTurnoverGauges = StacktagsTurnoverGauges;
})(window);
