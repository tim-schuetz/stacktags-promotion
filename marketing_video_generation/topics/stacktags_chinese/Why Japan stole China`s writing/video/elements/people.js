/* ============================================================
   Stacktags — cartoon PEOPLE (SVG), v2: a bit more realistic
   Standing figures with natural proportions, a real face (almond
   eyes, brows, nose, mouth), styled hair, and a wide-sleeve robe
   with a soft shade. Brand palette + skin/hair tones.
     window.makePerson({ robe, robeShade, collar, obi, skin, hair, style, arm, w })
   style: 'scholar' | 'short' | 'side' | 'bun' | 'headband'
   arm:   'down' | 'up'
   ============================================================ */
(function (global) {
  const INK = '#2a323a';

  function hair(style, c) {
    // head: oval cx120 cy96 rx46 ry50  (top ~46, sides ~74..166)
    const base = `<path d="M70,104 C66,58 92,38 120,38 C148,38 174,58 170,104
      C172,86 168,72 160,64 C150,72 138,64 120,64 C102,64 90,72 80,64 C72,72 68,86 70,104 Z"
      fill="${c}"/>`;
    let ex = '';
    if (style === 'scholar' || style === 'bun') {
      ex += `<ellipse cx="120" cy="40" rx="17" ry="15" fill="${c}"/>`;
      if (style === 'scholar') ex += `<line x1="101" y1="33" x2="139" y2="47" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (style === 'side') ex = `<path d="M74,86 C92,52 150,52 166,92 C150,68 150,70 120,70 C98,70 84,72 74,86 Z" fill="${c}"/>` + ex;
    if (style === 'headband') ex += `<path d="M72,84 q48,-24 96,0 l0,15 q-48,-22 -96,0 Z" fill="#35A292"/>
      <path d="M163,88 l26,10 -8,5 -22,-9 Z" fill="#35A292"/>`;
    if (style === 'short') ex = `<path d="M76,80 C96,58 144,58 164,80 C150,66 90,66 76,80 Z" fill="${c}"/>` + ex;
    return base + ex;
  }

  function makePerson(opts = {}) {
    const o = Object.assign({
      robe: '#d8e0de', robeShade: 'rgba(20,40,33,.10)', collar: '#ffffff', obi: '#119271',
      skin: '#f1c9a3', hair: '#241f1d', style: 'short', arm: 'down', w: 230,
    }, opts);

    // raised right sleeve + hand (speaker) or a resting right sleeve
    const rightArm = o.arm === 'up'
      ? `<path d="M150,166 C176,150 196,128 198,104 C199,95 192,90 184,94 C168,102 156,138 138,150 Z"
            fill="${o.robe}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
         <path d="M150,166 C176,150 196,128 198,104" fill="none" stroke="${o.robeShade}" stroke-width="10"/>
         <circle cx="196" cy="98" r="13" fill="${o.skin}" stroke="${INK}" stroke-width="4.5"/>`
      : `<path d="M158,168 C176,176 182,214 176,250 L156,246 C160,214 152,186 142,172 Z"
            fill="${o.robe}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`;

    return `
    <svg class="person" viewBox="0 0 240 470" width="${o.w}" height="${o.w * 470 / 240}"
         xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="120" cy="452" rx="80" ry="16" fill="rgba(20,40,33,.13)"/>
      <!-- feet -->
      <path d="M96,430 h22 v18 q0,8 -11,8 q-11,0 -11,-8 Z" fill="${INK}"/>
      <path d="M122,430 h22 v18 q0,8 -11,8 q-11,0 -11,-8 Z" fill="${INK}"/>
      <!-- left sleeve (hangs) -->
      <path d="M82,168 C64,176 58,214 64,250 L84,246 C80,214 88,186 98,172 Z"
            fill="${o.robe}" stroke="${INK}" stroke-width="4.5"/>
      ${o.arm === 'down' ? rightArm : ''}
      <!-- robe body -->
      <path d="M92,150 C78,154 72,180 70,210 L60,420 Q59,436 76,436 L164,436 Q181,436 180,420
               L170,210 C168,180 162,154 148,150 Z"
            fill="${o.robe}" stroke="${INK}" stroke-width="5.5"/>
      <!-- soft side shade -->
      <path d="M120,150 L148,150 C162,154 168,180 170,210 L180,420 Q181,436 164,436 L120,436 Z"
            fill="${o.robeShade}"/>
      <!-- crossed collar -->
      <path d="M120,150 L96,158 L112,214 L120,182 L128,214 L144,158 Z" fill="${o.collar}" stroke="${INK}" stroke-width="4.5"/>
      <path d="M120,182 L120,150" stroke="${INK}" stroke-width="3"/>
      <!-- obi -->
      <rect x="66" y="244" width="108" height="30" rx="8" fill="${o.obi}" stroke="${INK}" stroke-width="4.5"/>
      <rect x="150" y="244" width="16" height="30" fill="rgba(20,40,33,.12)"/>
      ${o.arm === 'up' ? rightArm : ''}
      <!-- neck -->
      <path d="M104,128 q16,14 32,0 l0,18 q-16,12 -32,0 Z" fill="${o.skin}" stroke="${INK}" stroke-width="4"/>
      <path d="M104,140 q16,12 32,0" stroke="rgba(20,40,33,.12)" stroke-width="5" fill="none"/>
      <!-- head -->
      <ellipse cx="120" cy="96" rx="46" ry="50" fill="${o.skin}" stroke="${INK}" stroke-width="5"/>
      <!-- ears -->
      <ellipse cx="74" cy="100" rx="7" ry="11" fill="${o.skin}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="166" cy="100" rx="7" ry="11" fill="${o.skin}" stroke="${INK}" stroke-width="4"/>
      <!-- hair -->
      ${hair(o.style, o.hair)}
      <!-- brows -->
      <path d="M92,90 q12,-7 22,-2" stroke="${INK}" stroke-width="4" fill="none"/>
      <path d="M126,88 q12,-5 22,2" stroke="${INK}" stroke-width="4" fill="none"/>
      <!-- eyes (almond + iris + highlight) -->
      <path d="M92,104 q12,-11 24,0 q-12,9 -24,0 Z" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <path d="M124,104 q12,-11 24,0 q-12,9 -24,0 Z" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <circle cx="105" cy="104" r="5.5" fill="${INK}"/><circle cx="136" cy="104" r="5.5" fill="${INK}"/>
      <circle cx="107" cy="102" r="1.8" fill="#fff"/><circle cx="138" cy="102" r="1.8" fill="#fff"/>
      <!-- nose + mouth -->
      <path d="M118,110 q5,8 -2,13" stroke="rgba(20,40,33,.35)" stroke-width="3" fill="none"/>
      <path d="M106,128 q14,11 28,0" stroke="${INK}" stroke-width="4" fill="none"/>
      <!-- cheeks -->
      <ellipse cx="92" cy="120" rx="9" ry="6" fill="rgba(216,120,90,.18)"/>
      <ellipse cx="148" cy="120" rx="9" ry="6" fill="rgba(216,120,90,.18)"/>
    </svg>`;
  }
  global.makePerson = makePerson;
})(window);
