/* ============================================================
   Stacktags default element — OUTRO (logic)
   Closing brand card with an assembling stacked-cube logo,
   wordmark, a pulsing CTA / Follow prompt and a folder link.

   USAGE
     const outro = new StacktagsOutro(hostEl, {
       cta: 'Follow',                              // CTA button label
       folderName: 'Chinese Pictographs',
       folderUrl: 'stacktags.com/f/chinese-pictographs',
       tagline: 'The most competitive learning app in the world.',
     });
     outro.assemble();      // logo + wordmark + tagline animate in
     outro.showCta();       // CTA button pops in
     outro.pulseCta();      // CTA starts pulsing
     outro.tapCta();        // one-shot tap ripple on the CTA
     outro.showFolder();    // folder reference link slides in
     outro.reset();

   Namespaced .stk-outro (outro.css). No dependencies.
   ============================================================ */
(function (global) {
  // Build the stacked-cube logo as inline SVG (isometric tiles + chevrons).
  function buildLogoSVG() {
    const cx = 110, w = 66, h = 34, sideH = 20;
    const ink = '#232B33', teal = '#3EAE93', tealD = '#2b8e77', white = '#ffffff';
    const layers = [
      { cy: 150, top: teal,  side: tealD },   // bottom
      { cy: 110, top: white, side: '#dfeae6' },
      { cy: 70,  top: teal,  side: tealD },   // top / cap
    ];
    let g = '';
    layers.forEach((L, idx) => {
      const cy = L.cy;
      const top = `${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`;
      const lft = `${cx - w},${cy} ${cx},${cy + h} ${cx},${cy + h + sideH} ${cx - w},${cy + sideH}`;
      const rgt = `${cx},${cy + h} ${cx + w},${cy} ${cx + w},${cy + sideH} ${cx},${cy + h + sideH}`;
      // i = stagger index (bottom assembles first)
      g += `<g class="stk-logo-layer" style="--i:${idx}">
        <polygon points="${lft}" fill="${L.side}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
        <polygon points="${rgt}" fill="${L.side}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round" opacity=".82"/>
        <polygon points="${top}" fill="${L.top}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
      </g>`;
    });
    const chevL = `<path class="stk-logo-chev stk-logo-chev-l" d="M44 64 L14 118 L44 172" fill="none" stroke="${teal}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`;
    const chevR = `<path class="stk-logo-chev stk-logo-chev-r" d="M176 64 L206 118 L176 172" fill="none" stroke="${teal}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<svg class="stk-outro-logo" viewBox="0 0 220 230" aria-hidden="true">${chevL}${chevR}${g}</svg>`;
  }

  class StacktagsOutro {
    constructor(host, opts = {}) {
      this.host = host;
      this.opts = opts;
      const cta = opts.cta || 'Follow';
      const folderName = opts.folderName || '';
      const folderUrl = opts.folderUrl || '';
      const tagline = opts.tagline || '';
      this.el = document.createElement('div');
      this.el.className = 'stk-outro';
      this.el.innerHTML =
        buildLogoSVG() +
        `<div class="stk-outro-wordmark"><span class="wm-stack">stack</span><span class="wm-tags">tags</span></div>` +
        (tagline ? `<div class="stk-outro-tag">${tagline}</div>` : '') +
        `<div class="stk-outro-cta">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.6 5.6 4.7 4.7 6.9 4 9 5 12 8c3-3 5.1-4 7.3-3.3 3.1.9 4.1 4.3 2.7 7.1C19.5 16.4 12 21 12 21z"/></svg>
            <span class="stk-outro-cta-label">${cta}</span>
            <span class="stk-outro-tap"></span>
         </div>` +
        ((folderName || folderUrl) ?
          `<a class="stk-outro-folder" href="${folderUrl ? 'https://' + folderUrl : '#'}">
             <span class="stk-outro-folder-ic"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span>
             <span class="stk-outro-folder-txt">
               <span class="stk-outro-folder-name">${folderName}</span>
               <span class="stk-outro-folder-url">${folderUrl}</span>
             </span>
           </a>` : '');
      host.appendChild(this.el);
      this.ctaEl = this.el.querySelector('.stk-outro-cta');
    }

    assemble() { this.el.classList.add('assemble'); }
    showCta() { this.el.classList.add('cta-in'); }
    pulseCta() { if (this.ctaEl) this.ctaEl.classList.add('pulse'); }
    tapCta() {
      if (!this.ctaEl) return;
      this.ctaEl.classList.remove('tapped'); void this.ctaEl.offsetWidth;
      this.ctaEl.classList.add('tapped');
    }
    setCtaLabel(t) { const l = this.el.querySelector('.stk-outro-cta-label'); if (l) l.textContent = t; }
    showFolder() { this.el.classList.add('folder-in'); }

    // Show every part instantly (for seeking / screenshots).
    showAll() {
      this.el.classList.add('assemble', 'cta-in', 'folder-in');
      if (this.ctaEl) this.ctaEl.classList.add('pulse');
    }

    reset() {
      this.el.classList.remove('assemble', 'cta-in', 'folder-in', 'reset-hide');
      if (this.ctaEl) this.ctaEl.classList.remove('pulse', 'tapped');
    }
  }

  global.StacktagsOutro = StacktagsOutro;
})(window);
