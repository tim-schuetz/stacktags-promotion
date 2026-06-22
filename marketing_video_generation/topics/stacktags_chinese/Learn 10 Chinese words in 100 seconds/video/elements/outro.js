/* ============================================================
   Stacktags OUTRO (logic) — updated brand card.
   Ported from promotion/instagram/defaults/outro-animation: a teal
   isometric stack bracketed by two chevrons, the two-tone
   "stacktags" wordmark and a grey "stacktags.io" line. The stack +
   chevrons spring in, the wordmark drops in, the url settles.

   USAGE
     const outro = new StacktagsOutro(hostEl);
     outro.assemble();   // logo → wordmark → url animate in (staggered)
     outro.showAll();    // same end-state instantly (for seeking)
     outro.reset();

   Namespaced .stk-outro (outro.css). No dependencies.
   ============================================================ */
(function (global) {
  function buildLogoSVG() {
    const T = '#35A292', W = '#FFFFFF', S = '#262A2E';   // teal / white side / ink stroke
    // paint order matters for the isometric overlap (bottom layer first);
    // entries flagged W are the white side faces. Coords from the default export.
    const polys = [
      '330,374 500,459 500,489 330,404',
      '500,289 670,374 500,459 330,374',
      ['500,459 670,374 670,404 500,489', W],
      '500,403 670,318 670,348 500,433',
      '500,233 670,318 500,403 330,318',
      ['330,318 500,403 500,433 330,348', W],
      '330,262 500,347 500,377 330,292',
      '500,177 670,262 500,347 330,262',
      ['500,347 670,262 670,292 500,377', W],
      '330,206 500,291 500,321 330,236',
      '500,291 670,206 670,236 500,321',
      '500,121 670,206 500,291 330,206',
    ];
    const stack = polys.map(p => {
      const pts = Array.isArray(p) ? p[0] : p;
      const fill = Array.isArray(p) ? p[1] : T;
      return `<polygon points="${pts}" fill="${fill}" stroke="${S}" stroke-width="2" stroke-linejoin="round"/>`;
    }).join('');
    return `<svg class="stk-outro-logo" viewBox="100 80 800 480" aria-hidden="true">
      <path class="stk-logo-chev stk-logo-chev-l" d="M 230 230 L 160 320 L 230 410" fill="none" stroke="${T}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="stk-logo-chev stk-logo-chev-r" d="M 770 230 L 840 320 L 770 410" fill="none" stroke="${T}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="stk-logo-stack">${stack}</g>
    </svg>`;
  }

  class StacktagsOutro {
    constructor(host) {
      this.host = host;
      this.el = document.createElement('div');
      this.el.className = 'stk-outro';
      this.el.innerHTML =
        buildLogoSVG() +
        `<div class="stk-outro-wordmark"><span class="wm-stack">stack</span><span class="wm-tags">tags</span></div>` +
        `<div class="stk-outro-url">stacktags.io</div>`;
      host.appendChild(this.el);
    }

    assemble() { this.el.classList.add('assemble'); }
    showAll()  { this.el.classList.add('assemble'); }   // same end-state (for seeking)

    // back-compat no-ops (older cue code may still reference these)
    showCta() {} pulseCta() {} tapCta() {} setCtaLabel() {} showFolder() {}

    reset() { this.el.classList.remove('assemble', 'reset-hide'); }
  }

  global.StacktagsOutro = StacktagsOutro;
})(window);
