/* ============================================================
   Stacktags video — flat illustration library (this topic)
   Clean white+turquoise, Inter, no borders. Each entry is an inline
   SVG string used as a depth-transition beat ({ svg }) so the big
   on-screen image ILLUSTRATES the idea instead of repeating the
   spoken words (subtitles carry the words).
   ============================================================ */
(function (global) {
  const INK = '#232B33', T = '#35A292', TD = '#119271', MID = '#7fcabb', SOFT = '#e7f4ef', W = '#fff';

  // flat-top hexagon polygon points centred at (cx,cy)
  function hex(cx, cy, r) {
    let p = [];
    for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); }
    return p.join(' ');
  }
  // a simple person glyph (head + shoulders), origin = head centre
  function person(x, y, s, fill) {
    return `<g transform="translate(${x},${y}) scale(${s})">
      <circle cx="0" cy="0" r="15" fill="${fill}"/>
      <path d="M-22 52 C-22 24 -12 16 0 16 C12 16 22 24 22 52 Z" fill="${fill}"/>
    </g>`;
  }
  // rounded speech bubble with a tail at bottom-left, origin top-left
  function bubble(x, y, w, h, fill, tail) {
    const t = tail !== false ? `<path d="M${x + 26} ${y + h} l0 26 l26 -26 z" fill="${fill}"/>` : '';
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${fill}"/>${t}`;
  }
  const S = (vb, body) => `<svg viewBox="0 0 ${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

  const ILLUS = {};

  // ---- WARRING STATES: scattered territories (hexes) + banners + clashing swords
  (() => {
    const tiles = [
      [150, 200, 92, T, -6], [330, 150, 86, MID, 7], [495, 230, 90, TD, -4],
      [200, 400, 88, MID, 5], [400, 360, 96, T, -8], [520, 470, 82, MID, 6], [270, 560, 84, TD, 4],
    ];
    let g = '';
    tiles.forEach(([x, y, r, c, rot], i) => {
      g += `<g transform="rotate(${rot} ${x} ${y})">
        <polygon points="${hex(x, y, r)}" fill="${c}" stroke="${INK}" stroke-width="6"/>
        <line x1="${x}" y1="${y - r - 6}" x2="${x}" y2="${y - r - 54}" stroke="${INK}" stroke-width="6"/>
        <path d="M${x} ${y - r - 54} l34 11 l-34 13 z" fill="${i % 2 ? TD : T}" stroke="${INK}" stroke-width="5"/>
      </g>`;
    });
    // two crossed-sword marks in the gaps
    const sword = (cx, cy, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">
      <line x1="${cx - 30}" y1="${cy + 30}" x2="${cx + 30}" y2="${cy - 30}" stroke="${INK}" stroke-width="8"/>
      <line x1="${cx + 30}" y1="${cy + 30}" x2="${cx - 30}" y2="${cy - 30}" stroke="${INK}" stroke-width="8"/>
      <circle cx="${cx}" cy="${cy}" r="9" fill="${INK}"/></g>`;
    g += sword(330, 300, 0) + sword(430, 520, 0);
    ILLUS.warring = S('640 700', g);
  })();

  // ---- UNIFIED EMPIRE: the same tiles snapped into one tight honeycomb, one colour
  (() => {
    const cx = 320, cy = 350, r = 96, dx = r * Math.cos(Math.PI / 6) * 2, dy = r * 1.5;
    const centers = [
      [cx, cy - dy], [cx - dx / 2, cy - dy / 2 + 6], [cx + dx / 2, cy - dy / 2 + 6],
      [cx, cy + 12], [cx - dx / 2, cy + dy / 2 + 18], [cx + dx / 2, cy + dy / 2 + 18], [cx, cy + dy + 24],
    ];
    let g = '';
    centers.forEach(([x, y]) => { g += `<polygon points="${hex(x, y, r - 2)}" fill="${T}" stroke="${INK}" stroke-width="6"/>`; });
    // a unifying ring + check seal
    g += `<circle cx="${cx}" cy="${cy + 6}" r="250" stroke="${TD}" stroke-width="10" stroke-dasharray="2 26"/>`;
    ILLUS.unified = S('640 720', g);
  })();

  // ---- WRITING STANDARDISED: mismatched marks -> arrow -> identical clean glyphs
  (() => {
    const glyph = (x, y, variant, c) => {
      const v = [
        `<path d="M${x - 34} ${y - 30} h68 M${x} ${y - 44} v88 M${x - 26} ${y + 30} h52" stroke="${c}" stroke-width="9"/>`,
        `<path d="M${x - 30} ${y - 36} l60 12 M${x - 6} ${y - 40} v84 M${x - 32} ${y + 26} l64 8" stroke="${c}" stroke-width="9"/>`,
        `<path d="M${x - 28} ${y - 34} h56 M${x - 28} ${y} h56 M${x - 4} ${y - 44} v88 M${x - 34} ${y + 34} l68 -6" stroke="${c}" stroke-width="9"/>`,
      ][variant];
      return `<g>${v}</g>`;
    };
    let g = '';
    // top: three different scribbles in soft tile boxes
    [[140, 0], [320, 1], [500, 2]].forEach(([x, vv]) => {
      g += `<rect x="${x - 70}" y="80" width="140" height="140" rx="22" fill="${SOFT}"/>` + glyph(x, 150, vv, INK);
    });
    // arrow down
    g += `<path d="M320 250 v70" stroke="${TD}" stroke-width="12"/><path d="M320 336 l-22 -28 h44 z" fill="${TD}"/>`;
    // bottom: three identical clean teal glyphs
    [140, 320, 500].forEach((x) => {
      g += `<rect x="${x - 70}" y="380" width="140" height="140" rx="22" fill="${T}"/>` + glyph(x, 450, 0, W);
    });
    ILLUS.script = S('640 560', g);
  })();

  // ---- WRITING ISN'T SPEECH: one written tablet, many different spoken sounds
  (() => {
    let g = '';
    // central tablet/scroll with one identical glyph
    g += `<rect x="270" y="210" width="160" height="190" rx="20" fill="${W}" stroke="${INK}" stroke-width="7"/>`;
    g += `<path d="M312 250 h76 M350 240 v120 M300 330 h100" stroke="${INK}" stroke-width="9"/>`;
    // three speech bubbles around it, each a DIFFERENT sound wave
    const wave = (x, y, k) => {
      const paths = [
        `M${x - 34} ${y} q12 -26 24 0 q12 26 24 0`,
        `M${x - 36} ${y} h14 l8 -20 l10 36 l8 -16 h16`,
        `M${x - 34} ${y - 12} v24 M${x - 16} ${y - 20} v40 M${x + 2} ${y - 10} v20 M${x + 20} ${y - 22} v44`,
      ][k];
      return `<path d="${paths}" stroke="${TD}" stroke-width="7"/>`;
    };
    const bub = (x, y, k) => bubble(x, y, 150, 96, SOFT) + wave(x + 75, y + 48, k);
    g += bub(40, 70, 0) + bub(450, 110, 1) + bub(70, 440, 2);
    // little people under bubbles
    g += person(115, 250, 1, MID) + person(525, 290, 1, MID) + person(145, 470, 1, MID);
    ILLUS.speech = S('700 620', g);
  })();

  // ---- MANDARIN OFFICIAL: gauze cap + robe + rank badge
  (() => {
    let g = '';
    // robe
    g += `<path d="M240 600 L150 600 C150 470 175 360 240 330 L240 600 Z" fill="${MID}" stroke="${INK}" stroke-width="7"/>`;
    g += `<path d="M240 330 C305 360 330 470 330 600 L240 600 Z" fill="${T}" stroke="${INK}" stroke-width="7"/>`;
    g += `<path d="M240 330 C212 360 205 600 205 600 M240 330 C268 360 275 600 275 600" stroke="${INK}" stroke-width="5" opacity=".5"/>`;
    // rank badge
    g += `<rect x="210" y="400" width="60" height="60" rx="8" fill="${SOFT}" stroke="${INK}" stroke-width="5"/><circle cx="240" cy="430" r="16" fill="${TD}"/>`;
    // head
    g += `<circle cx="240" cy="250" r="58" fill="${W}" stroke="${INK}" stroke-width="7"/>`;
    // gauze cap (wu sha mao): dome + two wide wings
    g += `<path d="M180 205 C180 150 300 150 300 205 Z" fill="${INK}"/>`;
    g += `<rect x="95" y="183" width="70" height="26" rx="13" fill="${INK}"/><rect x="315" y="183" width="70" height="26" rx="13" fill="${INK}"/>`;
    g += `<circle cx="240" cy="150" r="12" fill="${TD}"/>`;
    ILLUS.official = S('480 640', g);
  })();

  // ---- PORTUGUESE CARAVEL: hull + sails + pennant on the sea
  (() => {
    let g = '';
    // sea
    g += `<path d="M0 470 q70 -34 140 0 t140 0 t140 0 t140 0 t140 0" stroke="${T}" stroke-width="9"/>`;
    g += `<path d="M0 510 q70 -34 140 0 t140 0 t140 0 t140 0 t140 0" stroke="${MID}" stroke-width="9" opacity=".8"/>`;
    // hull
    g += `<path d="M150 400 L530 400 L470 480 L210 480 Z" fill="${TD}" stroke="${INK}" stroke-width="7"/>`;
    g += `<path d="M150 400 L530 400" stroke="${INK}" stroke-width="7"/>`;
    // masts
    g += `<line x1="270" y1="104" x2="270" y2="400" stroke="${INK}" stroke-width="7"/>`;
    g += `<line x1="410" y1="160" x2="410" y2="400" stroke="${INK}" stroke-width="7"/>`;
    // billowing square sails (curved belly)
    g += `<path d="M186 170 Q270 150 354 170 Q332 304 270 316 Q208 304 186 170 Z" fill="${W}" stroke="${INK}" stroke-width="6"/>`;
    g += `<path d="M270 158 Q300 240 270 316" stroke="${INK}" stroke-width="4" opacity=".35"/>`;
    g += `<path d="M340 196 Q410 178 480 196 Q462 308 410 318 Q372 308 340 196 Z" fill="${SOFT}" stroke="${INK}" stroke-width="6"/>`;
    // pennant
    g += `<path d="M270 104 l44 11 l-44 13 z" fill="${TD}" stroke="${INK}" stroke-width="5"/>`;
    ILLUS.ship = S('680 560', g);
  })();

  // ---- MODERN MEDIA: school cap + radio + TV
  (() => {
    let g = '';
    // graduation cap
    g += `<g transform="translate(130,150)"><polygon points="0,-30 95,5 0,40 -95,5" fill="${T}" stroke="${INK}" stroke-width="7"/><path d="M0 40 L0 80 M-50 18 v52 q50 34 100 0 v-52" stroke="${INK}" stroke-width="7"/><circle cx="0" cy="84" r="9" fill="${TD}"/></g>`;
    // radio
    g += `<g transform="translate(300,70)"><rect x="0" y="40" width="170" height="150" rx="18" fill="${SOFT}" stroke="${INK}" stroke-width="7"/><line x1="135" y1="44" x2="180" y2="-6" stroke="${INK}" stroke-width="7"/><circle cx="180" cy="-8" r="9" fill="${TD}"/><rect x="20" y="70" width="80" height="90" rx="10" fill="${W}" stroke="${INK}" stroke-width="5"/><line x1="34" y1="92" x2="86" y2="92" stroke="${INK}" stroke-width="5"/><line x1="34" y1="116" x2="86" y2="116" stroke="${INK}" stroke-width="5"/><line x1="34" y1="140" x2="86" y2="140" stroke="${INK}" stroke-width="5"/><circle cx="135" cy="100" r="16" fill="${T}"/><circle cx="135" cy="150" r="12" fill="${TD}"/></g>`;
    // TV
    g += `<g transform="translate(560,80)"><rect x="0" y="20" width="180" height="140" rx="16" fill="${T}" stroke="${INK}" stroke-width="7"/><path d="M70 60 L70 120 L120 90 Z" fill="${W}"/><line x1="60" y1="160" x2="40" y2="200" stroke="${INK}" stroke-width="7"/><line x1="120" y1="160" x2="140" y2="200" stroke="${INK}" stroke-width="7"/></g>`;
    ILLUS.media = S('780 320', g);
  })();

  // ---- CROWD: a dense field of people (a billion voices)
  (() => {
    let g = '';
    const cols = 11, rows = 7, gx = 66, gy = 84, x0 = 40, y0 = 40;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = x0 + c * gx + (r % 2 ? 33 : 0), y = y0 + r * gy;
      const fill = ((r + c) % 5 === 0) ? TD : ((r * c) % 3 === 0 ? MID : T);
      g += person(x, y, 0.92, fill);
    }
    ILLUS.crowd = S('780 660', g);
  })();

  // ---- EVERYDAY CHAT: two people, casual speech bubbles ("common speech")
  (() => {
    let g = '';
    g += bubble(70, 80, 230, 130, SOFT);
    g += `<circle cx="150" cy="145" r="13" fill="${TD}"/><circle cx="190" cy="145" r="13" fill="${TD}"/><circle cx="230" cy="145" r="13" fill="${TD}"/>`;
    g += bubble(400, 150, 230, 120, T, false) + `<path d="M426 270 l0 26 l-26 -26 z" fill="${T}"/>`;
    g += `<rect x="432" y="190" width="166" height="15" rx="7.5" fill="${W}"/><rect x="432" y="226" width="112" height="15" rx="7.5" fill="${W}"/>`;
    // two people facing each other
    g += `<g transform="translate(150,360) scale(2.0)">${person(0, 0, 1, MID)}</g>`;
    g += `<g transform="translate(520,360) scale(2.0)">${person(0, 0, 1, T)}</g>`;
    ILLUS.chat = S('700 560', g);
  })();

  // ---- PHOTO / COMPOSITION OVERRIDES (Imagen cartoons, cut out with rembg) ----
  // "writing isn't speech": a parchment (same script) flanked by two CUT-OUT
  // figures who SPEAK differently — gibberish speech bubbles.
  const parch = S('240 320',
    `<rect x="40" y="46" width="160" height="232" rx="8" fill="#f4ecd4" stroke="${INK}" stroke-width="6"/>`
    + `<rect x="26" y="32" width="188" height="30" rx="15" fill="#decba0" stroke="${INK}" stroke-width="6"/>`
    + `<rect x="26" y="266" width="188" height="30" rx="15" fill="#decba0" stroke="${INK}" stroke-width="6"/>`
    + `<text x="120" y="190" text-anchor="middle" font-family="'Noto Sans SC',sans-serif" font-weight="900" font-size="118" fill="${INK}">字</text>`);
  ILLUS.speech =
    `<div class="speech-compo">`
    + `<span class="sp-parch">${parch}</span>`
    + `<img class="sp-fig sp-fig-l" src="assets/photos/speaker_north_cut.png" alt="">`
    + `<img class="sp-fig sp-fig-r" src="assets/photos/speaker_south_cut.png" alt="">`
    + `<div class="sp-bub sp-bub-l">%$#!</div>`
    + `<div class="sp-bub sp-bub-r">#@¿!</div>`
    + `</div>`;

  // official: a generated cut-out figure (drops in from the top) WITH a bold
  // gibberish speech bubble — the official imposes one spoken standard.
  ILLUS.official =
    `<div class="official-compo">`
    + `<div class="off-bub">#$°%!</div>`
    + `<img class="illu-official" src="assets/photos/official_cut.png" alt="">`
    + `</div>`;

  // "standardized the writing": picture → the SAME character. Three cut-out
  // pictures (house · horse · person), slightly offset, each with its hanzi.
  const pictRow = (img, ch, ox) =>
    `<div class="pict-row" style="--ox:${ox}px">`
    + `<img class="pict-img" src="assets/photos/${img}" alt="">`
    + `<span class="pict-arrow">→</span><span class="pict-char">${ch}</span></div>`;
  // wonky, deliberately-bad black-line doodles (image-gen, keyed transparent).
  // (the old photo cut-outs pict_*_cut.png are kept but no longer referenced.)
  ILLUS.script =
    `<div class="pict-compo">`
    + pictRow('doodle_house_cut.png', '房', -34)
    + pictRow('doodle_horse_cut.png', '马', 34)
    + pictRow('doodle_person_cut.png', '人', -34)
    + `</div>`;

  // "radio and TV / schools": real cut-out objects, scattered and roughly
  // stacked above each other; they pop in one-by-one (each scales up) on cue.
  ILLUS.media =
    `<div class="media-compo">`
    + `<img class="media-img m1" src="assets/photos/school_cut.png" alt="" style="--mx:-72px;--my:-300px">`
    + `<img class="media-img m2" src="assets/photos/radio_cut.png" alt="" style="--mx:84px;--my:-4px">`
    + `<img class="media-img m3" src="assets/photos/tv_cut.png" alt="" style="--mx:-44px;--my:294px">`
    + `</div>`;

  global.ILLUS = ILLUS;
})(window);
