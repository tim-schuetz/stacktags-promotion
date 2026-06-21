/* ============================================================
   Stacktags default element — ENUMERATION (logic)
   Reusable numbered line-up that cascades in and then zooms the
   "camera" into one item to hand off into a detail view.

   USAGE
     const enum = new StacktagsEnumeration(hostEl, {
       title: 'The 10 characters',          // optional, supports <b>
       items: [{ glyph:'人', label:'rén', sub:'person' }, ...],
     });
     enum.showTitle();                        // fade the title in
     enum.revealAll({ stagger: 120 });        // cascade rows in
     enum.revealUpTo(k);                       // (alt) show rows 0..k
     await enum.zoomTo(0, { scale: 3.0 });     // zoom into item 0
     enum.handoff();                           // fade element away
     enum.reset();                             // back to blank state

   Pure DOM/CSS; no dependencies. Works with enumeration.css.
   ============================================================ */
(function (global) {
  class StacktagsEnumeration {
    constructor(host, opts = {}) {
      this.host = host;
      this.opts = opts;
      this.el = document.createElement('div');
      this.el.className = 'stk-enum';
      this.titleEl = document.createElement('div');
      this.titleEl.className = 'stk-enum-title';
      this.titleEl.innerHTML = opts.title || '';
      this.listEl = document.createElement('div');
      this.listEl.className = 'stk-enum-list';
      if (opts.title) this.el.appendChild(this.titleEl);
      this.el.appendChild(this.listEl);
      host.appendChild(this.el);

      this.rows = (opts.items || []).map((it, i) => {
        const row = document.createElement('div');
        row.className = 'stk-enum-row';
        row.innerHTML =
          `<div class="stk-enum-num">${it.n != null ? it.n : i + 1}</div>` +
          `<div class="stk-enum-glyph">${it.glyph || ''}</div>` +
          `<div class="stk-enum-labels">` +
            `<div class="stk-enum-label">${it.label || ''}</div>` +
            (it.sub ? `<div class="stk-enum-sub">${it.sub}</div>` : '') +
          `</div>`;
        this.listEl.appendChild(row);
        return row;
      });
    }

    showTitle() { this.el.classList.add('title-in'); }

    revealAll({ stagger = 110 } = {}) {
      this.rows.forEach((row, i) => setTimeout(() => row.classList.add('in'), i * stagger));
    }

    // Show rows 0..k instantly (no stagger) — handy for seeking/screenshots.
    revealUpTo(k) {
      this.rows.forEach((row, i) => row.classList.toggle('in', i <= k));
    }

    revealRow(i) { if (this.rows[i]) this.rows[i].classList.add('in'); }

    /* Zoom the list so item `index` enlarges and centers, then resolve.
       Computes the transform from the row's offset within the list so the
       chosen row ends up centered and scaled. */
    zoomTo(index, { scale = 3.0, duration = 1000 } = {}) {
      const row = this.rows[index];
      if (!row) return Promise.resolve();
      this.rows.forEach((r, i) => r.classList.toggle('target', i === index));
      // center of the list box vs center of the chosen row (in list-local px)
      const listH = this.listEl.offsetHeight;
      const rowMid = row.offsetTop + row.offsetHeight / 2;
      const dy = (listH / 2 - rowMid);
      // translate so row centers, then scale up about that center
      this.listEl.style.transition = `transform ${duration}ms cubic-bezier(.7,0,.25,1)`;
      this.listEl.style.transform = `translateY(${dy}px) scale(${scale})`;
      // fade non-target rows as we zoom
      this.rows.forEach((r, i) => { if (i !== index) r.style.opacity = '0'; });
      return new Promise(res => setTimeout(res, duration));
    }

    handoff() { this.el.classList.add('handoff'); }

    reset() {
      this.el.classList.remove('title-in', 'handoff');
      this.listEl.style.transition = 'none';
      this.listEl.style.transform = 'none';
      this.rows.forEach(r => {
        r.classList.remove('in', 'target');
        r.style.opacity = '';
      });
      // force reflow so a subsequent reveal animates cleanly
      void this.listEl.offsetWidth;
      this.listEl.style.transition = '';
    }
  }

  global.StacktagsEnumeration = StacktagsEnumeration;
})(window);
