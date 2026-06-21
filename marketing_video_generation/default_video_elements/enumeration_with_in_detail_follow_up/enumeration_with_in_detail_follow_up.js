/* ============================================================
   Stacktags default element — ENUMERATION → IN-DETAIL FOLLOW-UP (logic)

   A line-up of tall cards (text left, image right) cascades in, then each
   card's IMAGE morphs in a transition: rounded rectangle → diamond (Raute)
   → it grows a 3D side (height) and slides into the stack, becoming one
   layer of the stacked Stacktags logo. All four images become the four
   layers. The stack then slides to the top-left, and only at that point
   does the top layer turn turquoise, in parallel with the first item's
   label appearing beside it — ready to lead into its detail view.

   USAGE
     const en = new StacktagsEnumerationDetail(hostEl, {
       title: 'Vier <b>Bausteine</b>',
       items: [{ label:'Anleihen', sub:'…' }, …]   // 2–6 items
     });
     en.showTitle();
     en.revealAll({ stagger: 340 });
     en.collapseToLogo();   // images morph → diamonds → layers of the stack
     en.dockToTop();        // stack slides top-left; top layer teal + label
     en.reset();

   Pure DOM/CSS; no dependencies. Works with the matching .css.
   ============================================================ */
(function (global) {
  // stage design-space + stack geometry (unscaled 1080×1920 box)
  const STAGE_W = 1080, STAGE_H = 1920;
  const TOP_W = 244, TOP_H = 122;   // diamond top-face size, in stage px
  const SIDE = 30;                   // 3D side height, in stage px
  const OFFSET = 66;                 // vertical step between layers
  const DOCK_X = 190, DOCK_Y = 188;  // where the stack centre lands (top-left)
  const DOCK_SCALE = 0.66;           // shrink the stack into a top-left logo

  class StacktagsEnumerationDetail {
    constructor(host, opts = {}) {
      this.host = host;
      this.opts = opts;
      this.items = opts.items || [];

      this.el = document.createElement('div');
      this.el.className = 'se2';

      this.topText = document.createElement('div');
      this.topText.className = 'se2-toptext';

      const stage = document.createElement('div');
      stage.className = 'se2-stage';
      this.titleEl = document.createElement('div');
      this.titleEl.className = 'se2-title';
      this.titleEl.innerHTML = opts.title || '';
      if (opts.title) stage.appendChild(this.titleEl);

      this.listEl = document.createElement('div');
      this.listEl.className = 'se2-list';
      stage.appendChild(this.listEl);

      this.rows = this.items.map((it) => {
        const row = document.createElement('div');
        row.className = 'se2-row';
        row.innerHTML =
          `<div class="se2-text">` +
            `<div class="se2-label">${it.label || ''}</div>` +
            (it.sub ? `<div class="se2-sub">${it.sub}</div>` : '') +
          `</div>` +
          `<div class="se2-tile">` +
            `<div class="se2-tile-side"></div>` +
            `<div class="se2-tile-top"><span>Bild</span></div>` +
          `</div>`;
        this.listEl.appendChild(row);
        return row;
      });
      this.tiles = this.rows.map(r => r.querySelector('.se2-tile'));

      this.el.appendChild(this.topText);
      this.el.appendChild(stage);
      host.appendChild(this.el);
    }

    showTitle() { this.el.classList.add('title-in'); }

    revealAll({ stagger = 110 } = {}) {
      this.rows.forEach((row, i) => setTimeout(() => row.classList.add('in'), i * stagger));
    }
    revealUpTo(k) { this.rows.forEach((r, i) => r.classList.toggle('in', i <= k)); }

    /* Morph each card's image into a stack layer: rectangle → diamond →
       grow the 3D side, sliding into the stack slot. Item i → layer i (top
       first). Measured in stage-local space so it survives the preview's
       fit-to-screen scaling. Colours stay neutral — teal is set on docking. */
    collapseToLogo({ delay = 0, stagger = 0 } = {}) {
      const n = this.rows.length;
      const logoH = (n - 1) * OFFSET + TOP_H + SIDE;
      const stackTop = STAGE_H / 2 - logoH / 2;
      const run = () => {
        this.el.classList.add('collapsing');
        const elRect = this.el.getBoundingClientRect();
        const scale = elRect.width / (this.el.offsetWidth || STAGE_W);

        this.rows.forEach((row, i) => {
          const tile = this.tiles[i];
          const rect = tile.getBoundingClientRect();
          const cx = (rect.left + rect.width / 2 - elRect.left) / scale;
          const cy = (rect.top + rect.height / 2 - elRect.top) / scale;
          const sx = TOP_W / (tile.offsetWidth || 1);
          const sy = TOP_H / (tile.offsetHeight || 1);
          const slotX = STAGE_W / 2;
          const slotY = stackTop + i * OFFSET + TOP_H / 2;   // diamond centre
          const dx = slotX - cx;
          const dy = slotY - cy;
          const order = (n - 1) - i;   // fold the base layer first

          setTimeout(() => {
            row.style.zIndex = String(60 + (n - i));   // top layer on top
            row.classList.add('fold');
            tile.classList.add('diamond');             // 1) become a Raute
            tile.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
            setTimeout(() => tile.classList.add('height'), 430);  // 2) gain height
          }, order * stagger);
        });
      };
      if (delay) setTimeout(run, delay); else run();
      return delay + (n - 1) * stagger + 980;
    }

    /* Slide the assembled stack to the top-left; only now does the top layer
       turn turquoise, in parallel with the first item's label appearing. */
    dockToTop() {
      const tx = DOCK_X - STAGE_W / 2;
      const ty = DOCK_Y - STAGE_H / 2;
      this.listEl.style.transition = 'transform .95s cubic-bezier(.55,0,.18,1)';
      this.listEl.style.transform = `translate(${tx}px, ${ty}px) scale(${DOCK_SCALE})`;
      setTimeout(() => this.setActive(0), 640);
    }

    /* Make layer `index` the active (turquoise) one — only ever one at a time —
       and surface its label as the running title beside the stack. */
    setActive(index) {
      this.tiles.forEach((t, k) => t.classList.toggle('active', k === index));
      const it = this.items[index];
      if (!it) return;
      this.topText.classList.remove('in');
      setTimeout(() => {
        this.topText.innerHTML = it.label || '';
        this.topText.classList.add('in');
      }, 150);
    }

    reset() {
      this.el.classList.remove('title-in', 'collapsing');
      this.listEl.style.transition = '';
      this.listEl.style.transform = '';
      this.topText.classList.remove('in');
      this.topText.innerHTML = '';
      this.rows.forEach(r => { r.classList.remove('in', 'fold'); r.style.zIndex = ''; });
      this.tiles.forEach(t => { t.classList.remove('diamond', 'height', 'active'); t.style.transform = ''; });
      void this.listEl.offsetWidth;
    }
  }

  global.StacktagsEnumerationDetail = StacktagsEnumerationDetail;
})(window);
