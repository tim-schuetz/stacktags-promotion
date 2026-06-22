/* ============================================================
   Stacktags video element — OUTRO / ENDCARD
   Builds the Stacktags logo as a stack of grouped layers so the
   demo can animate each layer (and the chevrons) independently.
   Mirrors the geometry of the static endcard.
   ============================================================ */
(function () {
  function makeStacktagsLogo({ size = 600, theme = 'teal' } = {}) {
    const CX = 500, CY = 320, STEP = 56, COUNT = 4, HALF_W = 170, HALF_H = 85, SIDE_H = 30;
    const themes = {
      teal: {
        cap: '#3EAE93',
        left:  (i) => i % 2 === 0 ? '#FFFFFF' : '#3EAE93',
        right: (i) => i % 2 === 0 ? '#3EAE93' : '#FFFFFF',
        stroke: '#262A2E',
        chevron: '#3EAE93'
      }
    };
    const t = themes[theme];
    let svg = `<svg viewBox="0 0 1000 700" width="${size}" height="${size * 0.7}" xmlns="http://www.w3.org/2000/svg">`;
    // bottom layer (i = COUNT-1) drawn first → top cap (i = 0) drawn last.
    for (let i = COUNT - 1; i >= 0; i--) {
      const offsetY = (i - (COUNT - 1) / 2) * STEP;
      const topY = CY + offsetY - SIDE_H;
      const isCap = i === 0;
      const fillCap = t.cap;
      const fillLeft = isCap ? fillCap : t.left(i);
      const fillRight = isCap ? fillCap : t.right(i);
      // stagger: bottom layer lands first, then each one stacks on top.
      const delay = ((COUNT - 1 - i) * 0.09).toFixed(3);
      svg += `<g class="lyr" style="--d:${delay}s">`;
      svg += `<polygon points="${CX - HALF_W},${topY} ${CX},${topY + HALF_H} ${CX},${topY + HALF_H + SIDE_H} ${CX - HALF_W},${topY + SIDE_H}" fill="${fillLeft}" stroke="${t.stroke}" stroke-width="2" stroke-linejoin="round"/>`;
      svg += `<polygon points="${CX},${topY + HALF_H} ${CX + HALF_W},${topY} ${CX + HALF_W},${topY + SIDE_H} ${CX},${topY + HALF_H + SIDE_H}" fill="${fillRight}" stroke="${t.stroke}" stroke-width="2" stroke-linejoin="round"/>`;
      svg += `<polygon points="${CX},${topY - HALF_H} ${CX + HALF_W},${topY} ${CX},${topY + HALF_H} ${CX - HALF_W},${topY}" fill="${fillCap}" stroke="${t.stroke}" stroke-width="2" stroke-linejoin="round"/>`;
      svg += `</g>`;
    }
    const CHEV_BASE = 340, CHEV_W = 70, CHEV_H = 90;
    svg += `<g class="chev">`;
    svg += `<path d="M ${CX - CHEV_BASE + CHEV_W} ${CY - CHEV_H} L ${CX - CHEV_BASE} ${CY} L ${CX - CHEV_BASE + CHEV_W} ${CY + CHEV_H}" fill="none" stroke="${t.chevron}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`;
    svg += `<path d="M ${CX + CHEV_BASE - CHEV_W} ${CY - CHEV_H} L ${CX + CHEV_BASE} ${CY} L ${CX + CHEV_BASE - CHEV_W} ${CY + CHEV_H}" fill="none" stroke="${t.chevron}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`;
    svg += `</g>`;
    svg += `</svg>`;
    return svg;
  }
  window.makeStacktagsLogo = makeStacktagsLogo;
})();
