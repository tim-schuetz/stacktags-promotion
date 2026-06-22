/* ============================================================
   Stacktags — "Learn Chinese from brand names"  (v2)
   New style: faux-3D camera + dynamic moving grid (the depth
   element) as the backbone, driven manually by an audio-synced
   cue engine. Continuous full-text subtitles mirror the speech;
   the SCREEN never just echoes the line — it shows the logo→hanzi
   flips and cut-out illustrations instead. White + turquoise.
   ============================================================ */
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DURATION = 114.05;

/* ---------- brand logos (stylised SVG/CSS approximations) ---------- */
const LOGOS = {
  bmw: `<div class="logo logo-bmw"><svg class="brand-svg" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="#0b0b0d"/><circle cx="100" cy="100" r="78" fill="#fff"/>
      <path d="M100 100 L100 22 A78 78 0 0 1 178 100 Z" fill="#1c69d4"/>
      <path d="M100 100 L100 178 A78 78 0 0 1 22 100 Z" fill="#1c69d4"/>
      <circle cx="100" cy="100" r="78" fill="none" stroke="#0b0b0d" stroke-width="2"/>
      <text x="100" y="19" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="21" fill="#fff" letter-spacing="2.5">BMW</text></svg></div>`,
  benz: `<div class="logo logo-benz"><svg class="brand-svg" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="none" stroke="#0d141a" stroke-width="7"/>
      <circle cx="100" cy="100" r="84" fill="#eef2f4"/><circle cx="100" cy="100" r="84" fill="none" stroke="#c3cdd4" stroke-width="2"/>
      <g fill="#1b2730"><polygon points="100,18 90,100 110,100"/><polygon points="30,141 95,91.4 105,108.6"/><polygon points="170,141 95,108.6 105,91.4"/></g>
      <circle cx="100" cy="100" r="13" fill="#1b2730"/></svg></div>`,
  coke: `<div class="logo logo-coke">Coca-Cola</div>`,
  li: `<div class="logo logo-li"><div class="li-han">理想</div><div class="li-tag">Li&nbsp;Auto</div></div>`,
  nio: `<div class="logo logo-nio"><img class="nio-img" src="assets/nio-logo.png" alt=""></div>`,
  byd: `<div class="logo logo-byd"><svg class="byd-badge" viewBox="0 0 260 150" aria-hidden="true">
      <ellipse cx="130" cy="75" rx="124" ry="64" fill="#0e4c9a" stroke="#0a3a86" stroke-width="3"/>
      <ellipse cx="130" cy="54" rx="110" ry="34" fill="rgba(255,255,255,.14)"/>
      <text x="130" y="99" text-anchor="middle" font-family="Inter,sans-serif" font-style="italic" font-weight="900" font-size="70" fill="#fff" letter-spacing="3">BYD</text></svg></div>`,
};

/* ---------- data ---------- */
const HOOK = [
  { key:'bmw',  name:'BMW',       han:'宝马',     en:'<b>Treasure&nbsp;Horse</b>' },
  { key:'benz', name:'Mercedes',  han:'奔驰',     en:'<b>Galloping&nbsp;Speed</b>' },
  { key:'coke', name:'Coca-Cola', han:'可口可乐', en:'<b>Delicious&nbsp;Happiness</b>' },
];

const WEST = {
  bmw:  { name:'BMW', sound:'≈ “BMW”', han:'宝马', py:'bǎomǎ', img:'treasure-horse',
          chips:[{c:'宝',m:'treasure'},{c:'马',m:'horse'}], gloss:'宝马 = a <b>treasure horse</b>' },
  benz: { name:'Mercedes-Benz', sound:'≈ “Benz”', han:'奔驰', py:'bēnchí', img:'galloping-horse',
          chips:[{c:'奔',m:'to run'},{c:'驰',m:'to speed'}], gloss:'奔驰 = <b>“to gallop, to speed”</b>' },
  coke: { name:'Coca-Cola', sound:'≈ “Coca-Cola”', han:'可口可乐', py:'kěkǒu kělè', img:'cola-splash',
          chips:[{c:'可口',m:'tasty'},{c:'可乐',m:'enjoyable'}], gloss:'A soda named <b>“delicious happiness”</b>' },
};

const RECAP = [
  { han:'宝马', brand:'BMW', mean:'treasure horse' },
  { han:'奔驰', brand:'Mercedes', mean:'to gallop' },
  { han:'可口可乐', brand:'Coca-Cola', mean:'delicious happiness' },
  { han:'理想', brand:'Li Auto', mean:'the ideal' },
  { han:'蔚来', brand:'NIO', mean:'the future' },
  { han:'BYD', brand:'BYD', mean:'build your dreams', latin:true },
];

/* ---------- beat indices ---------- */
const B = { HOOK:0, CONCEPT:1, BMW:2, BENZ:3, COKE:4, TWIST:5, LI:6, NIO:7, BYD:8, RECAP:9 };

/* ============================================================
   BEAT CONTENT BUILDERS
   ============================================================ */
function hookHTML() {
  return `<div class="beat hook">` + HOOK.map(c =>
    `<div class="hk-chip flip" data-k="${c.key}"><div class="flip-inner">
        <div class="flip-face flip-front hk-face hk-front"><div class="hk-logo">${LOGOS[c.key]}</div><div class="hk-name">${c.name}</div></div>
        <div class="flip-face flip-back hk-face hk-back"><div class="hk-han${c.han.length>2?' long':''}">${c.han}</div><div class="hk-en">${c.en}</div></div>
      </div></div>`).join('') + `</div>`;
}
function conceptHTML() {
  return `<div class="beat concept">
    <div class="cc-row">
      <div class="cc-pill p1"><div class="cc-hz">音</div><div class="cc-lab">sounds right <span class="cc-chk">✓</span></div></div>
      <div class="cc-op">+</div>
      <div class="cc-pill p2"><div class="cc-hz">义</div><div class="cc-lab">means something <span class="cc-chk">✓</span></div></div>
    </div>
    <div class="cc-result">= a name that <b>flatters</b></div>
  </div>`;
}
function westCardHTML(key) {
  const b = WEST[key];
  const chars = [...b.han].map(c => `<span class="ch">${c}</span>`).join('');
  const chips = b.chips.map(ch => `<div class="bb-chip"><span class="ch-han">${ch.c}</span><span class="ch-mean">${ch.m}</span></div>`).join('');
  return `<div class="beat"><div class="bb">
    <div class="bb-card flip"><div class="flip-inner">
      <div class="flip-face flip-front bb-face bb-front"><div class="bb-logo">${LOGOS[key]}</div><div class="bb-name">${b.name}</div><div class="bb-sound">${b.sound}</div></div>
      <div class="flip-face flip-back bb-face bb-back"><div class="bb-han n${b.han.length}">${chars}</div><div class="bb-py">${b.py}</div></div>
    </div></div>
    <div class="bb-meaning"><div class="bb-chips">${chips}</div><div class="bb-gloss">${b.gloss}</div></div>
    <img class="bb-img" src="assets/${b.img}.png" alt="">
  </div></div>`;
}
function liCardHTML() {
  return `<div class="beat"><div class="bb">
    <div class="bb-card flip"><div class="flip-inner">
      <div class="flip-face flip-front bb-face bb-front"><div class="bb-logo">${LOGOS.li}</div><div class="bb-name">Li Auto</div><div class="bb-sound">lǐxiǎng</div></div>
      <div class="flip-face flip-back bb-face bb-back bb-reveal"><div class="bb-rv-pre">理想</div><div class="bb-rv-arrow">↓</div><div class="bb-rv-en">THE&nbsp;IDEAL</div></div>
    </div></div>
    <div class="bb-meaning"></div>
    <img class="bb-img car" src="assets/li-car.png" alt="">
  </div></div>`;
}
function nioCardHTML() {
  return `<div class="beat"><div class="bb">
    <div class="bb-card flip"><div class="flip-inner">
      <div class="flip-face flip-front bb-face bb-front"><div class="bb-logo">${LOGOS.nio}</div><div class="bb-name">NIO</div><div class="bb-sound">≈ Nio</div></div>
      <div class="flip-face flip-back bb-face bb-back bb-reveal">
        <div class="bb-morph"><span class="mp-a">蔚来</span><span class="mp-eq">≈</span><span class="mp-b">未来</span></div>
        <div class="bb-py">wèilái</div><div class="bb-rv-arrow">↓</div><div class="bb-rv-en">THE&nbsp;FUTURE</div>
      </div>
    </div></div>
    <div class="bb-meaning"></div>
    <img class="bb-img car" src="assets/nio-car.png" alt="">
  </div></div>`;
}
function bydCardHTML() {
  return `<div class="beat"><div class="bb">
    <div class="bb-card flip"><div class="flip-inner">
      <div class="flip-face flip-front bb-face bb-front"><div class="bb-logo">${LOGOS.byd}</div><div class="bb-name">BYD</div><div class="bb-sound">B · Y · D</div></div>
      <div class="flip-face flip-back bb-face bb-back bb-byd">
        <div class="byd-row"><span class="byd-l">B</span><span class="byd-w">Build</span></div>
        <div class="byd-row"><span class="byd-l">Y</span><span class="byd-w">Your</span></div>
        <div class="byd-row"><span class="byd-l">D</span><span class="byd-w">Dreams</span></div>
      </div>
    </div></div>
    <div class="bb-meaning"></div>
    <img class="bb-img car" src="assets/byd-car.png" alt="">
  </div></div>`;
}
function twistHTML() {
  // upper: the Western brands' MEANINGS as scattered cut-outs, each with its
  // Chinese name beneath it; lower: the Chinese EV makers shown as their CARS.
  const west = [
    { img:'treasure-horse',  x:285, y:360, s:.86, r:-6, d:0,   w:440, label:'宝马' },
    { img:'cola-splash',     x:800, y:330, s:.80, r:6,  d:.12, w:430, label:'可口可乐' },
    { img:'galloping-horse', x:545, y:672, s:1.0, r:-3, d:.24, w:460, label:'奔驰' },
  ];
  const east = [
    { img:'li-car',  x:300, y:1190, s:.84, r:0, d:0,   w:460, lead:true },
    { img:'nio-car', x:786, y:1135, s:.86, r:0, d:.12, w:460 },
    { img:'byd-car', x:545, y:1450, s:.92, r:0, d:.24, w:460 },
  ];
  const cut = (it, cls) =>
    `<div class="tw-cut ${cls}${it.lead?' lead':''}" style="left:${it.x}px;top:${it.y}px;--rot:${it.r||0}deg;--sc:${it.s};--sd:${it.d}s">` +
    `<img class="tw-cut-img" src="assets/${it.img}.png" alt="" style="width:${it.w}px">` +
    (it.label ? `<div class="tw-cut-label">${it.label}</div>` : '') +
    `</div>`;
  return `<div class="beat twist"><div class="tw-field">${west.map(w=>cut(w,'w')).join('')}${east.map(e=>cut(e,'car')).join('')}</div></div>`;
}
function recapHTML() {
  const tiles = RECAP.map(t => {
    const cls = (t.latin ? ' latin' : '') + (!t.latin && [...t.han].length > 2 ? ' long' : '');
    return `<div class="rc-tile"><div class="rc-han${cls}">${t.han}</div>
       <div class="rc-txt"><div class="rc-brand">${t.brand}</div><div class="rc-mean">${t.mean}</div></div></div>`;
  }).join('');
  return `<div class="beat recap"><div class="rc-title">Every name, a lesson</div><div class="rc-grid">${tiles}</div></div>`;
}

const STEPS = [
  { text: hookHTML() },
  { text: conceptHTML(),    via: 'zoom-out' },
  { text: westCardHTML('bmw'),  via: 'zoom-in' },
  { text: westCardHTML('benz'), via: 'lift' },
  { text: westCardHTML('coke'), via: 'pan-left' },
  { text: twistHTML(),      via: 'zoom-in' },
  { text: liCardHTML(),     via: 'zoom-out' },
  { text: nioCardHTML(),    via: 'lift' },
  { text: bydCardHTML(),    via: 'pan-right' },
  { text: recapHTML(),      via: 'zoom-in' },
];

/* ============================================================
   RUNTIME
   ============================================================ */
let depth, enumEl;
let timers = [];
let INSTANT = false;
const later = (fn, ms) => { if (INSTANT) { fn(); return; } const id = setTimeout(fn, ms); timers.push(id); };
const el = i => depth.layers[i];

function showHost(id) {
  ['depth-host', 'enum-host', 'outro-host'].forEach(h => $('#' + h).classList.toggle('show', h === id));
}

/* ---- inner cue helpers ---- */
const go = (i, mode, dur = 1050) => { if (!INSTANT) depth.transitionTo(i, mode, dur); else depth._showFirst(i); };
const hookFlip = k => el(B.HOOK).querySelector(`.hk-chip[data-k="${k}"]`).classList.add('flipped');
const flip = i => el(i).querySelector('.bb-card.flip').classList.add('flipped');
const hot = i => $$('.bb-han .ch', el(i)).forEach(c => c.classList.add('hot'));
const showChips = i => el(i).querySelector('.bb-meaning').classList.add('show');
const showGloss = i => el(i).querySelector('.bb-meaning').classList.add('gloss');
const imgIn = i => el(i).querySelector('.bb').classList.add('img-in');
const rv = i => el(i).querySelector('.bb').classList.add('rv');
const m2 = i => el(i).querySelector('.bb').classList.add('m2');
const concept = s => el(B.CONCEPT).querySelector('.concept').classList.add(s);
const twist = s => el(B.TWIST).querySelector('.twist').classList.add(s);
function bydExpand() {
  flip(B.BYD);
  const rows = $$('.byd-row', el(B.BYD));
  rows.forEach((r, k) => later(() => r.classList.add('in'), 220 + k * 300));
}
function recapShow() {
  const r = el(B.RECAP).querySelector('.recap'); r.classList.add('in');
  $$('.rc-tile', el(B.RECAP)).forEach((t, k) => later(() => t.classList.add('in'), 120 + k * 150));
}
function enumShow() {
  showHost('enum-host'); enumEl.reset(); enumEl.showTitle();
  if (INSTANT) enumEl.rows.forEach(r => r.classList.add('in'));
  else enumEl.revealAll({ stagger: 150 });
}

/* ============================================================
   CUES (visuals) — fired off audio.currentTime (Whisper-aligned)
   ============================================================ */
const CUES = [
  { t:0.00,   fn:() => { showHost('depth-host'); depth._showFirst(B.HOOK); } },
  { t:3.40,   fn:() => hookFlip('bmw') },
  { t:6.38,   fn:() => hookFlip('benz') },
  { t:9.02,   fn:() => hookFlip('coke') },

  { t:11.68,  fn:() => { go(B.CONCEPT, 'zoom-out'); concept('s1'); } },
  { t:15.58,  fn:() => concept('s2') },

  { t:18.68,  fn:() => enumShow() },

  { t:22.94,  fn:() => { showHost('depth-host'); go(B.BMW, 'zoom-in'); } },
  { t:24.58,  fn:() => flip(B.BMW) },
  { t:26.82,  fn:() => { hot(B.BMW); showChips(B.BMW); } },
  { t:31.72,  fn:() => { showGloss(B.BMW); imgIn(B.BMW); } },

  { t:35.88,  fn:() => go(B.BENZ, 'lift') },
  { t:36.88,  fn:() => flip(B.BENZ) },
  { t:37.90,  fn:() => { hot(B.BENZ); showChips(B.BENZ); } },
  { t:40.44,  fn:() => { showGloss(B.BENZ); imgIn(B.BENZ); } },

  { t:45.00,  fn:() => go(B.COKE, 'pan-left') },
  { t:46.52,  fn:() => { flip(B.COKE); hot(B.COKE); } },
  { t:51.98,  fn:() => showChips(B.COKE) },
  { t:54.52,  fn:() => { showGloss(B.COKE); imgIn(B.COKE); } },

  { t:57.32,  fn:() => { go(B.TWIST, 'zoom-in'); twist('w-in'); } },
  { t:61.74,  fn:() => twist('e-in') },
  { t:67.88,  fn:() => twist('grab') },

  { t:69.98,  fn:() => go(B.LI, 'zoom-out') },
  { t:71.26,  fn:() => { flip(B.LI); rv(B.LI); } },
  { t:73.98,  fn:() => imgIn(B.LI) },

  { t:75.14,  fn:() => go(B.NIO, 'lift') },
  { t:77.78,  fn:() => flip(B.NIO) },
  { t:78.94,  fn:() => m2(B.NIO) },
  { t:80.76,  fn:() => rv(B.NIO) },
  { t:81.52,  fn:() => imgIn(B.NIO) },

  { t:88.04,  fn:() => go(B.BYD, 'pan-right') },
  { t:89.08,  fn:() => bydExpand() },
  { t:91.28,  fn:() => imgIn(B.BYD) },

  { t:97.28,  fn:() => { go(B.RECAP, 'zoom-in'); recapShow(); } },
  { t:104.82, fn:() => el(B.RECAP).querySelector('.recap').classList.add('pulse') },

  { t:107.22, fn:() => { showHost('outro-host'); $('#outro-host').classList.add('play'); } },
];
CUES.sort((a, b) => a.t - b.t);
let fired = new Array(CUES.length).fill(false);

/* ============================================================
   SUBTITLES — mirror EXACTLY what is spoken, one line at a time
   ============================================================ */
const SUBS = [
  { t:0.00,   h:'In China, BMW isn’t “BMW” —' },
  { t:3.22,   h:'it’s <b>Bǎomǎ</b>, “<b>Treasure Horse</b>.”' },
  { t:5.70,   h:'Mercedes is <b>Bēnchí</b>, “<b>galloping speed</b>.”' },
  { t:8.68,   h:'And Coca-Cola? —' },
  { t:10.16,  h:'“<b>delicious happiness</b>.”' },
  { t:11.68,  h:'None of those are accidents.' },
  { t:13.04,  h:'When a brand enters China,' },
  { t:14.06,  h:'it doesn’t just <b>copy the sound</b>.' },
  { t:15.48,  h:'It picks characters that <b>sound right</b>' },
  { t:16.98,  h:'and <b>mean something</b> flattering.' },
  { t:18.68,  h:'Here’s how the biggest names did it,' },
  { t:20.02,  h:'and how Chinese brands now play' },
  { t:21.46,  h:'the same game even <b>harder</b>.' },
  { t:22.94,  h:'Start with the cars.' },
  { t:24.58,  h:'BMW became <b>Bǎomǎ</b>.' },
  { t:26.82,  h:'<b>Bǎo</b> means “treasure,”' },
  { t:28.36,  h:'<b>mǎ</b> means “horse.”' },
  { t:29.50,  h:'It still sounds like “BMW,”' },
  { t:31.72,  h:'but now it also promises you' },
  { t:33.28,  h:'a <b>prized, powerful steed</b>.' },
  { t:35.88,  h:'Mercedes-Benz became <b>Bēnchí</b>.' },
  { t:37.90,  h:'It means “<b>to gallop, to speed</b>.”' },
  { t:40.44,  h:'Sounds like Benz — means <b>pure motion</b>.' },
  { t:42.84,  h:'The name is the marketing.' },
  { t:44.16,  h:'And the all-time masterpiece —' },
  { t:46.52,  h:'Coca-Cola, <b>Kěkǒu kělè</b>.' },
  { t:48.52,  h:'It copies the sound almost perfectly,' },
  { t:50.88,  h:'and it means “<b>tasty and enjoyable</b>.”' },
  { t:53.92,  h:'A soda literally named' },
  { t:55.32,  h:'“<b>delicious happiness</b>.”' },
  { t:57.32,  h:'Plenty of brands pick a name for their image,' },
  { t:59.30,  h:'but Chinese brands take it to <b>another level</b> —' },
  { t:61.74,  h:'especially the new <b>electric-car makers</b>.' },
  { t:63.66,  h:'They’re not translating a foreign sound at all.' },
  { t:66.30,  h:'They just <b>reach into the language</b>' },
  { t:67.58,  h:'and grab a word that <b>is their mission</b>.' },
  { t:69.98,  h:'One brand is simply called <b>Lǐxiǎng</b>.' },
  { t:72.54,  h:'The whole name just means “<b>the ideal</b>.”' },
  { t:75.14,  h:'Another you know in the West as <b>Nio</b>.' },
  { t:77.00,  h:'In Chinese it’s <b>Wèilái</b>,' },
  { t:78.60,  h:'which sounds exactly like <b>wèilái</b> —' },
  { t:80.60,  h:'“<b>the future</b>.”' },
  { t:81.52,  h:'A car company named, literally, <b>the future</b>.' },
  { t:84.76,  h:'And here’s the kicker —' },
  { t:85.74,  h:'they run the same play in <b>English</b>, too.' },
  { t:88.04,  h:'Take BYD.' },
  { t:89.08,  h:'It actually stands for “<b>Build Your Dreams</b>.”' },
  { t:91.28,  h:'An entire aspiration,' },
  { t:92.40,  h:'baked right into the logo.' },
  { t:94.58,  h:'Bold? A bit much?' },
  { t:95.94,  h:'We’ll let you be the judge.' },
  { t:97.28,  h:'A treasure horse, a galloping star,' },
  { t:99.84,  h:'building your dreams —' },
  { t:100.98, h:'every one of these names' },
  { t:101.84, h:'is a tiny <b>Chinese lesson</b>' },
  { t:103.24, h:'hiding in <b>plain sight</b>.' },
  { t:104.82, h:'That’s branding as a <b>free language lesson</b>.' },
  { t:107.22, h:'Want to actually start <b>learning Chinese</b>?' },
  { t:109.24, h:'Discover thousands of <b>free exercises</b>' },
  { t:110.92, h:'and more learning content on <b>stacktags.io</b>.' },
];
SUBS.sort((a, b) => a.t - b.t);
let subShown = -1;
function setSub(idx) {
  if (idx === subShown) return;
  subShown = idx;
  const line = $('#subs-line');
  line.classList.remove('in'); void line.offsetWidth;
  line.innerHTML = idx >= 0 ? SUBS[idx].h : '';
  if (idx >= 0) line.classList.add('in');
}
function subIndexAt(t) {
  let k = -1;
  for (let i = 0; i < SUBS.length; i++) { if (SUBS[i].t <= t + 1e-3) k = i; else break; }
  return k;
}

/* ============================================================
   SFX — swoosh on every depth transition / flip / flying-in cut-out /
   enum / outro; pop on items appearing (chips, BYD letters, recap tiles).
   Tied to the REAL cue times. Played live for preview AND exported via
   window.SFX so capture.js → mix_sfx.js bake them into the MP4 (headless
   Chromium can't record Web-Audio, so the track is rebuilt deterministically).
   ============================================================ */
const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav' };
const SFX = [
  { t:3.40,  s:'swoosh', v:.5 },   // hook — BMW flip
  { t:6.38,  s:'swoosh', v:.5 },   // hook — Mercedes flip
  { t:9.02,  s:'swoosh', v:.5 },   // hook — Coca-Cola flip
  { t:11.68, s:'swoosh', v:.5 },   // → concept
  { t:15.58, s:'pop',    v:.5 },   // concept — meaning pill
  { t:18.68, s:'swoosh', v:.5 },   // → enumeration roster
  { t:22.94, s:'swoosh', v:.5 },   // → BMW card
  { t:24.58, s:'swoosh', v:.45 },  // BMW flip
  { t:26.82, s:'pop',    v:.5 },   // BMW chips 宝/马
  { t:31.72, s:'swoosh', v:.5 },   // treasure-horse rises
  { t:35.88, s:'swoosh', v:.5 },   // → Mercedes card (lift)
  { t:36.88, s:'swoosh', v:.45 },  // Mercedes flip
  { t:37.90, s:'pop',    v:.5 },   // Mercedes chips
  { t:40.44, s:'swoosh', v:.5 },   // galloping-horse rises
  { t:45.00, s:'swoosh', v:.5 },   // → Coca-Cola card (pan)
  { t:46.52, s:'swoosh', v:.45 },  // Coca-Cola flip
  { t:51.98, s:'pop',    v:.5 },   // Coca-Cola chips
  { t:54.52, s:'swoosh', v:.5 },   // cola-splash rises
  { t:57.32, s:'swoosh', v:.55 },  // → twist (western cut-outs)
  { t:61.74, s:'swoosh', v:.55 },  // EV cars rise
  { t:69.98, s:'swoosh', v:.5 },   // → Li Auto card
  { t:71.26, s:'swoosh', v:.45 },  // Li flip
  { t:73.98, s:'swoosh', v:.5 },   // Li car rises
  { t:75.14, s:'swoosh', v:.5 },   // → NIO card (lift)
  { t:77.78, s:'swoosh', v:.45 },  // NIO flip
  { t:78.94, s:'pop',    v:.55 },  // NIO 未来 homophone
  { t:81.52, s:'swoosh', v:.5 },   // NIO car rises
  { t:88.04, s:'swoosh', v:.5 },   // → BYD card (pan)
  { t:89.08, s:'swoosh', v:.45 },  // BYD flip / expand
  { t:89.30, s:'pop',    v:.5 },   // B
  { t:89.60, s:'pop',    v:.5 },   // Y
  { t:89.90, s:'pop',    v:.5 },   // D
  { t:91.28, s:'swoosh', v:.5 },   // BYD car rises
  { t:97.28, s:'swoosh', v:.5 },   // → recap montage
  { t:97.40, s:'pop',    v:.4 },   // recap tile 1
  { t:97.55, s:'pop',    v:.4 },   // recap tile 2
  { t:97.70, s:'pop',    v:.4 },   // recap tile 3
  { t:97.85, s:'pop',    v:.4 },   // recap tile 4
  { t:98.00, s:'pop',    v:.4 },   // recap tile 5
  { t:98.15, s:'pop',    v:.4 },   // recap tile 6
  { t:107.22,s:'swoosh', v:.55 },  // outro assembles
];
SFX.sort((a, b) => a.t - b.t);
window.SFX = SFX.map(e => ({ t: e.t, sound: e.s, vol: e.v }));
let firedSfx = new Array(SFX.length).fill(false);
function playSfx(i) {
  const e = SFX[i]; if (!e) return;
  try { const a = new Audio(SND[e.s]); a.volume = e.v; a.play().catch(() => {}); } catch (_) {}
}

/* ============================================================
   ENGINE
   ============================================================ */
const audio = $('#vo');
let raf = 0, lastT = -1;

function tick() {
  const t = audio.currentTime;
  if (t < lastT - 0.25) applyUpTo(t);
  else {
    for (let i = 0; i < CUES.length; i++)
      if (!fired[i] && CUES[i].t <= t + 1e-3) { fired[i] = true; CUES[i].fn(); }
    for (let i = 0; i < SFX.length; i++)
      if (!firedSfx[i] && SFX[i].t <= t + 1e-3) { firedSfx[i] = true; playSfx(i); }
    setSub(subIndexAt(t));
  }
  lastT = t;
  $('#vprogress').style.width = (100 * t / (audio.duration || DURATION)) + '%';
  $('#info').textContent = t.toFixed(1) + 's';
  raf = requestAnimationFrame(tick);
}

function applyUpTo(t) {
  hardReset();
  INSTANT = true;
  for (let i = 0; i < CUES.length; i++)
    if (CUES[i].t <= t + 1e-3) { fired[i] = true; CUES[i].fn(); }
  for (let i = 0; i < SFX.length; i++) if (SFX[i].t <= t + 1e-3) firedSfx[i] = true;  // mark only, don't play on seek
  setSub(subIndexAt(t));
  INSTANT = false;
  lastT = t;
}

function hardReset() {
  timers.forEach(clearTimeout); timers = [];
  fired.fill(false);
  firedSfx.fill(false);
  subShown = -2; setSub(-1);
  if (depth) depth.reset();
  if (enumEl) enumEl.reset();
  $('#outro-host').classList.remove('play');
  // wipe every inner state class we toggle
  $$('.flip').forEach(f => f.classList.remove('flipped'));
  $$('.bb').forEach(b => b.classList.remove('img-in', 'rv', 'm2'));
  $$('.bb-meaning').forEach(m => m.classList.remove('show', 'gloss'));
  $$('.bb-han .ch').forEach(c => c.classList.remove('hot'));
  $$('.byd-row').forEach(r => r.classList.remove('in'));
  $$('.concept').forEach(c => c.classList.remove('s1', 's2'));
  $$('.twist').forEach(c => c.classList.remove('w-in', 'e-in', 'grab'));
  $$('.recap').forEach(c => c.classList.remove('in', 'pulse'));
  $$('.rc-tile').forEach(t => t.classList.remove('in'));
  showHost('depth-host');
}

function play() { hardReset(); lastT = -1; audio.currentTime = 0; audio.play(); if (!raf) raf = requestAnimationFrame(tick); }

/* ---------- fit + init ---------- */
function fit() {
  const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
  $('#stage').style.transform = `scale(${s})`;
}
window.addEventListener('resize', fit);

window.addEventListener('DOMContentLoaded', () => {
  // depth backbone
  depth = new StacktagsDepthTransitionsOptimized('#depth-host', { steps: STEPS });
  $$('.stk-depth2-text', $('#depth-host')).forEach(n => n.classList.add('asbeat'));

  // enumeration roster (own static grid)
  enumEl = new StacktagsEnumerationDetail($('#enum-host'), {
    title: 'Six brands, <b>one trick</b>',
    items: [
      { label:'BMW',           sub:'bǎomǎ · treasure horse' },
      { label:'Mercedes-Benz', sub:'bēnchí · to gallop' },
      { label:'Coca-Cola',     sub:'kěkǒu kělè · delicious happiness' },
      { label:'Li Auto',       sub:'lǐxiǎng · the ideal' },
      { label:'NIO',           sub:'wèilái · the future' },
      { label:'BYD',           sub:'Build Your Dreams' },
    ],
  });
  // put the brand hanzi into each roster tile (instead of the "Bild" placeholder)
  const tileGlyphs = ['宝马','奔驰','可口可乐','理想','蔚来','BYD'];
  enumEl.tiles.forEach((tile, i) => {
    const span = tile.querySelector('.se2-tile-top span');
    if (span) { span.textContent = tileGlyphs[i]; span.classList.add('han'); if (i === 5) span.classList.add('latin'); }
  });

  // closing endcard — the default OUTRO element (makeStacktagsLogo)
  $('#outro-host').innerHTML =
    `<div class="ec"><div class="ec-logo">${makeStacktagsLogo({ size: 640 })}</div>` +
    `<div class="wm"><span class="s">stack</span><span class="t">tags</span></div>` +
    `<div class="url">stacktags.io</div></div>`;

  fit();
  showHost('depth-host');
  depth._showFirst(B.HOOK);

  $('#play').addEventListener('click', play);
  $('#restart').addEventListener('click', play);
  $('#cleanbtn').addEventListener('click', () => { document.body.classList.toggle('clean'); fit(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'c' || e.key === 'C') { document.body.classList.toggle('clean'); fit(); }
    if (e.key === ' ') { e.preventDefault(); audio.paused ? play() : audio.pause(); }
  });

  // headless capture / seeking hooks
  window.__seek = (t) => { audio.pause(); audio.currentTime = t; applyUpTo(t); };
  window.__play = play;
  raf = requestAnimationFrame(tick);
});
