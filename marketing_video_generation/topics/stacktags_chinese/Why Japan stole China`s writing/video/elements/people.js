/* ============================================================
   Stacktags — flat cartoon PEOPLE (SVG)
   Clean, friendly standing figures in the brand palette (ink outline,
   teal/white/grey robes, simple faces). Parameterised so a scene can
   make several distinct people. No external assets.
     window.makePerson({ robe, collar, obi, skin, hair, style, arm, w })
   style: 'scholar' | 'short' | 'side' | 'topknot' | 'headband'
   arm:   'down' | 'up'
   ============================================================ */
(function (global) {
  const INK = '#232B33';

  function hairShape(style, hair) {
    // base cap that hugs the top of the head (head: circle cx100 cy94 r48)
    const cap = `<path d="M52,96 C52,54 72,40 100,40 C128,40 148,54 148,96
      C150,84 146,74 140,69 C131,62 116,58 100,58 C84,58 69,62 60,69
      C54,74 50,84 52,96 Z" fill="${hair}" stroke="${INK}" stroke-width="4"/>`;
    let extra = '';
    if (style === 'scholar' || style === 'topknot') {
      // top knot (+ a little hairpin for the scholar)
      extra += `<circle cx="100" cy="40" r="15" fill="${hair}" stroke="${INK}" stroke-width="4"/>`;
      if (style === 'scholar')
        extra += `<line x1="84" y1="34" x2="116" y2="46" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (style === 'side') {
      // a side sweep across the forehead
      extra += `<path d="M58,72 C78,52 128,52 142,74 C120,64 92,64 58,84 Z" fill="${hair}"/>`;
    }
    if (style === 'headband') {
      extra += `<path d="M50,84 q50,-26 100,0 l0,12 q-50,-22 -100,0 Z" fill="#35A292" stroke="${INK}" stroke-width="3"/>`;
    }
    return cap + extra;
  }

  function makePerson(opts = {}) {
    const o = Object.assign({
      robe: '#d8e0de', collar: '#ffffff', obi: '#119271',
      skin: '#f3c9a0', hair: '#2a2622', style: 'short', arm: 'down', w: 200,
    }, opts);

    const armUp = o.arm === 'up'
      ? `<path d="M124,158 C150,150 172,140 178,116 C180,108 173,103 165,107
           C150,114 138,140 122,150 Z" fill="${o.robe}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
         <circle cx="176" cy="112" r="11" fill="${o.skin}" stroke="${INK}" stroke-width="4"/>`
      : '';

    const svg = `
    <svg class="person" viewBox="0 0 200 340" width="${o.w}" height="${o.w * 1.7}"
         xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="100" cy="324" rx="70" ry="15" fill="rgba(20,40,33,.13)"/>
      <!-- hanging sleeves / robe sides -->
      <path d="M60,196 C48,202 46,234 54,256 L70,250 C64,226 66,208 72,198 Z"
            fill="${o.robe}" stroke="${INK}" stroke-width="4"/>
      ${o.arm === 'down' ? `<path d="M140,196 C152,202 154,234 146,256 L130,250 C136,226 134,208 128,198 Z"
            fill="${o.robe}" stroke="${INK}" stroke-width="4"/>` : ''}
      <!-- neck -->
      <rect x="91" y="124" width="18" height="30" fill="${o.skin}" stroke="${INK}" stroke-width="4"/>
      <!-- robe body -->
      <path d="M76,150 C60,152 54,178 50,212 L41,300 Q39,316 56,316 L144,316 Q161,316 159,300
               L150,212 C146,178 140,152 124,150 Z"
            fill="${o.robe}" stroke="${INK}" stroke-width="5"/>
      <!-- collar (crossed V) -->
      <path d="M100,150 L80,157 L96,206 L100,176 L104,206 L120,157 Z" fill="${o.collar}" stroke="${INK}" stroke-width="4"/>
      <!-- obi / belt -->
      <rect x="55" y="212" width="90" height="26" rx="9" fill="${o.obi}" stroke="${INK}" stroke-width="4"/>
      ${armUp}
      <!-- head -->
      <circle cx="100" cy="94" r="48" fill="${o.skin}" stroke="${INK}" stroke-width="5"/>
      <!-- hair -->
      ${hairShape(o.style, o.hair)}
      <!-- face -->
      <ellipse cx="84" cy="98" rx="4" ry="5.5" fill="${INK}"/>
      <ellipse cx="116" cy="98" rx="4" ry="5.5" fill="${INK}"/>
      <path d="M88,116 Q100,127 112,116" stroke="${INK}" stroke-width="4" fill="none"/>
      <ellipse cx="70" cy="112" rx="8" ry="5" fill="rgba(53,162,146,.18)"/>
      <ellipse cx="130" cy="112" rx="8" ry="5" fill="rgba(53,162,146,.18)"/>
    </svg>`;
    return svg;
  }

  global.makePerson = makePerson;
})(window);
