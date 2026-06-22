/* ============================================================
   Stacktags — "How to launder $1.5 billion in crypto"  (depth style)

   One continuous faux-3D DEPTH fly-through on a dynamic moving grid
   (StacktagsDepthTransitionsOptimized). Opens on a bar chart of the
   biggest crypto heists (Bybit towering). The three laundering moves
   (chain hopping · mixers · splitting) use the enumeration element,
   which folds into the stacked Stacktags logo and stays top-left as a
   progress badge. Subtitles mirror the narration verbatim. Every beat
   lands on the spoken word (audio-currentTime cue engine; timings
   force-aligned via Whisper). White + turquoise (#35A292), Inter.
   ============================================================ */
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* the three laundering moves (story order) */
const MOVES = [
  { n: '1', label: 'Chain hopping', sub: 'jump network to network' },
  { n: '2', label: 'Mixers',        sub: 'shuffle with thousands of others' },
  { n: '3', label: 'Splitting',     sub: 'shatter into tiny transfers' },
];

/* ============================================================
   small art helpers (inline SVG, white + turquoise)
   ============================================================ */
function eyeSVG() {
  return `<svg viewBox="0 0 100 60" class="eye" aria-hidden="true">
    <path d="M4 30 Q50 -8 96 30 Q50 68 4 30 Z" fill="#fff" stroke="var(--stk-ink)" stroke-width="5"/>
    <circle cx="50" cy="30" r="15" fill="var(--stk-teal-d)"/>
    <circle cx="50" cy="30" r="6" fill="var(--stk-ink)"/>
  </svg>`;
}
function lockSVG() {
  return `<svg viewBox="0 0 100 110" class="lock" aria-hidden="true">
    <path d="M28 50 V36 a22 22 0 0 1 44 0 V50" fill="none" stroke="var(--stk-ink)" stroke-width="9" stroke-linecap="round"/>
    <rect x="18" y="50" width="64" height="52" rx="12" fill="var(--stk-teal-d)"/>
    <circle cx="50" cy="72" r="7" fill="#fff"/><rect x="46" y="74" width="8" height="16" rx="4" fill="#fff"/>
  </svg>`;
}
const HASH = ['0x7f…a3','0x91…e2','0x4c…0b','0xd2…77','0x18…ff','0xa6…3e','0x53…9c','0xbe…41','0x2f…d8'];
function ledgerHTML(n) {
  let rows = '';
  for (let i = 0; i < n; i++) {
    const a = HASH[i % HASH.length], b = HASH[(i * 3 + 4) % HASH.length];
    const amt = (((i * 137) % 900) + 60);
    const hot = i === 3 ? ' hot' : '';
    rows += `<div class="lg-row${hot}"><span class="lg-w">${a}</span><span class="lg-arr">→</span><span class="lg-w">${b}</span><span class="lg-amt">+${amt.toLocaleString('en-US')} ◎</span></div>`;
  }
  return `<div class="ledger"><div class="ledger-scroll">${rows}${rows}</div></div>`;
}
function coinImg(extra) { return `<img class="coin ${extra || ''}" src="assets/photos/coin.png" alt="" onerror="this.style.display='none'">`; }

/* ============================================================
   BEATS — the depth fly-through steps
   ============================================================ */
const BEATS = [
  /* 0 — HACKER WITH THE LOOT (the heist) */
  { cls: 'beat-loot', via: 'zoom-in', text:
    `<div class="loot">
       <img class="loot-hacker" src="assets/photos/hacker_loot.png" alt="" onerror="this.style.display='none'">
       <div class="loot-tag">$1.5B<span>stolen</span></div>
     </div>` },

  /* 1 — PUBLIC LEDGER: every coin visible to everyone */
  { cls: 'beat-ledger beat-ledger1', via: 'zoom-in', text:
    `<div class="ldscene">
       <div class="ld-cap">EVERY COIN — ON A <b>PUBLIC LEDGER</b></div>
       ${ledgerHTML(9)}
       <div class="ld-watch">open · permanent · public</div>
     </div>` },

  /* 2 — "100% ANONYMOUS?" stamped FALSE */
  { cls: 'beat-anon', via: 'lift', text:
    `<div class="anon">
       <div class="anon-q">100%<br>ANONYMOUS<span class="qm">?</span></div>
       <div class="anon-stamp">FALSE</div>
     </div>` },

  /* 3 — LEDGER detail: every transaction / wallet / movement, forever */
  { cls: 'beat-ledger beat-ledger2', via: 'zoom-out', text:
    `<div class="ldscene">
       ${ledgerHTML(9)}
       <div class="ld-chips">
         <span class="chip" data-c="0">every transaction</span>
         <span class="chip" data-c="1">every wallet</span>
         <span class="chip" data-c="2">every movement</span>
         <span class="chip" data-c="3">recorded forever</span>
       </div>
     </div>` },

  /* 4 — LAZARUS wallet, the whole world watching */
  { cls: 'beat-watch', via: 'pan-left', text:
    `<div class="watch">
       <div class="eyes">
         <span class="ey e0">${eyeSVG()}</span><span class="ey e1">${eyeSVG()}</span>
         <span class="ey e2">${eyeSVG()}</span><span class="ey e3">${eyeSVG()}</span>
         <span class="ey e4">${eyeSVG()}</span><span class="ey e5">${eyeSVG()}</span>
       </div>
       <div class="wallet">
         <div class="wl-top">LAZARUS GROUP · wallet</div>
         <div class="wl-bal">1,500,000,000 ◎</div>
         <div class="wl-tag">stolen · in plain sight</div>
       </div>
     </div>` },

  /* 5 — STEALING easy / SPENDING hard */
  { cls: 'beat-easyhard', via: 'zoom-in', text:
    `<div class="eh">
       <div class="eh-row r1"><span class="eh-k">Stealing it</span><span class="eh-v ok">easy ✓</span></div>
       <div class="eh-row r2"><span class="eh-k">Spending it</span><span class="eh-v no">hard ✕</span></div>
     </div>` },

  /* 6 — try to cash out at an exchange → FLAGGED & FROZEN */
  { cls: 'beat-frozen', via: 'pan-right', text:
    `<div class="frz">
       <img class="frz-hacker" src="assets/photos/hacker_stuck.png" alt="" onerror="this.style.display='none'">
       <div class="frz-gate">
         <div class="frz-sign">EXCHANGE</div>
         <div class="frz-shutter"></div>
         <div class="frz-lock">${lockSVG()}</div>
       </div>
       <div class="frz-flag">FLAGGED</div>
       <div class="frz-stamp">FROZEN</div>
     </div>` },

  /* 7 — MOVE 1 · chain hopping */
  { cls: 'beat-move beat-m1', via: 'zoom-in', text:
    `<div class="mv">
       <div class="mv-head"><span class="mv-n">1</span><span class="mv-t">Chain hopping</span></div>
       <div class="hop">
         <span class="chain c0">BTC</span><span class="chain c1">ETH</span>
         <span class="chain c2">TRON</span><span class="chain c3">SOL</span>
         ${coinImg('hopper')}
       </div>
     </div>` },

  /* 8 — MOVE 2 · mixers */
  { cls: 'beat-move beat-m2', via: 'pan-left', text:
    `<div class="mv">
       <div class="mv-head"><span class="mv-n">2</span><span class="mv-t">Mixers</span></div>
       <div class="mix">
         <div class="mix-swirl">
           ${[...Array(10)].map((_, i) => `<img class="mc mc${i}" src="assets/photos/coin.png" alt="" onerror="this.style.display='none'">`).join('')}
         </div>
         <img class="tumbler" src="assets/photos/tumbler_dash.png" alt="" onerror="this.style.display='none'">
       </div>
     </div>` },

  /* 9 — MOVE 3 · splitting */
  { cls: 'beat-move beat-m3', via: 'pan-right', text:
    `<div class="mv">
       <div class="mv-head"><span class="mv-n">3</span><span class="mv-t">Splitting</span></div>
       <div class="split">
         <img class="big-coin" src="assets/photos/coin.png" alt="" onerror="this.style.display='none'">
         ${[...Array(16)].map((_, i) => `<img class="sc sc${i}" src="assets/photos/coin.png" alt="" onerror="this.style.display='none'">`).join('')}
       </div>
     </div>` },

  /* 10 — the irony: the most transparent money ever made */
  { cls: 'beat-trans', via: 'zoom-out', text:
    `<div class="trans">
       ${ledgerHTML(9)}
       <div class="trans-card">
         <div class="trans-head">The most <span class="key">transparent</span><br>money ever made.</div>
         <div class="trans-sub">a permanent, public record</div>
       </div>
     </div>` },

  /* 11 — callback: stealing a billion = easy, spending it = the real problem */
  { cls: 'beat-callback', via: 'lift', text:
    `<div class="cb">
       <img class="cb-hacker" src="assets/photos/hacker_stuck.png" alt="" onerror="this.style.display='none'">
       <div class="cb-lines">
         <div class="cb-l l1">Stealing a billion?<br><b>Easy.</b></div>
         <div class="cb-l l2">Spending it?<br><span class="key">The real problem.</span></div>
       </div>
     </div>` },

  /* 12 — BLANK: clear to bare moving grid; the outro endcard assembles on top */
  { cls: 'beat-blank', via: 'zoom-in', text: '' },
];

/* index map */
const IDX = { loot:0, ledger1:1, anon:2, ledger2:3, watch:4, easyhard:5, frozen:6, m1:7, m2:8, m3:9, trans:10, callback:11, blank:12 };

/* ============================================================
   ELEMENTS
   ============================================================ */
let depth = null, enumEl = null, chart = null;
const L = i => depth.layers[i];
const onBeat = (i, c) => { const el = L(i); if (el) el.classList.add(c); };

function mountElements() {
  depth = new StacktagsDepthTransitionsOptimized('#depth-host', { steps: BEATS });
  BEATS.forEach((b, i) => { if (b.cls) depth.layers[i].className += ' ' + b.cls; });

  // opening bar chart — biggest crypto heists (US$ millions)
  chart = new StacktagsGraphChart('#chart-mount', {
    data: [
      { label: 'Mt. Gox',   value: 470 },
      { label: 'Coincheck', value: 530 },
      { label: 'Ronin',     value: 620 },
      { label: 'Bybit',     value: 1505 },
    ],
  });

  // enumeration → stacked logo (the 3 laundering moves) → docked progress badge
  enumEl = new StacktagsEnumerationDetail($('#enum-host'), {
    title: 'They try to <b>break the trail</b> — 3 ways',
    items: MOVES.map(m => ({ label: m.label, sub: m.sub })),
  });
  // put the move number onto each enumeration tile
  $$('#enum-host .se2-tile-top span').forEach((s, i) => {
    if (MOVES[i]) { s.textContent = MOVES[i].n; s.classList.add('glyph'); }
  });

  // closing endcard — default `outro` element (makeStacktagsLogo)
  const ec = document.createElement('div');
  ec.className = 'ec';
  ec.innerHTML =
    `<div id="ec-logo"></div>
     <div class="wm"><span class="s">stack</span><span class="t">tags</span></div>
     <div class="url">stacktags.io</div>
     <div class="ec-folder">More of <b>how crypto really works</b> — follow Stacktags</div>`;
  $('#outro-host').appendChild(ec);
  $('#ec-logo').innerHTML = window.makeStacktagsLogo({ size: 560 });
}

/* ============================================================
   PHASE helpers
   ============================================================ */
const chartHost = () => $('#chart-host');
const depthHost = () => $('#depth-host');
const enumHost  = () => $('#enum-host');

function showChart() {
  chartHost().classList.remove('hide');
  depthHost().classList.add('hide');
  enumHost().classList.remove('show', 'grid');
  chart.reset();
}
function drawChart() { chart.draw({ duration: 4000 }); }

function enterDepthFromChart() {
  chartHost().classList.add('hide');
  depthHost().classList.remove('hide');
  depth.reset();
  depth._showFirst(IDX.loot);
}

function enterEnum() {
  depthHost().classList.add('hide');
  enumHost().classList.add('show', 'grid');
  enumEl.reset();
  enumEl.showTitle();
  enumEl.revealAll({ stagger: 220 });
}
function enterMoves() {
  enumHost().classList.remove('grid');     // keep the docked logo, drop its grid
  depthHost().classList.remove('hide');
  depth.reset();
  depth._showFirst(IDX.m1);
}
function leaveEnumBadge() { enumHost().classList.remove('show'); }
function enterOutro() { $('#outro-host').classList.add('show', 'play'); }

/* a depth transition (guarded so re-entrancy is impossible during forward play) */
function go(i, mode) { depth.transitionTo(i, mode || BEATS[i].via || 'zoom-in', 850); }

/* intra-beat helpers */
function chip(i) { const el = L(IDX.ledger2); const c = el && el.querySelector(`.chip[data-c="${i}"]`); if (c) c.classList.add('in'); }

/* ============================================================
   CUES — fired off audio.currentTime (seconds)
   ============================================================ */
const CUES = [
  // ---------- HOOK: bar chart of biggest crypto heists ----------
  { t: 0.00, fn: () => showChart() },
  { t: 0.45, fn: () => drawChart() },                                   // bars climb to Bybit ($1,500M)

  // ---------- the heist: hacker with the loot ----------
  { t: 5.20, fn: () => { enterDepthFromChart(); } },                    // "they ran straight into a problem"

  // ---------- public ledger: you can't hide it ----------
  { t: 8.88, fn: () => go(IDX.ledger1, 'zoom-in') },                    // "you can't actually hide the money"
  { t: 11.30, fn: () => onBeat(IDX.ledger1, 'lit') },                   // "every coin… visible to the entire world"

  // ---------- the myth: anonymous? FALSE ----------
  { t: 14.42, fn: () => go(IDX.anon, 'lift') },                         // "Here's what most people get wrong"
  { t: 18.55, fn: () => onBeat(IDX.anon, 'stamp') },                    // "it's almost the opposite"

  // ---------- ledger detail: every transaction/wallet/movement, forever ----------
  { t: 19.80, fn: () => go(IDX.ledger2, 'zoom-out') },                  // "Most blockchains are a public ledger"
  { t: 21.50, fn: () => chip(0) },                                      // every transaction
  { t: 22.52, fn: () => chip(1) },                                      // every wallet
  { t: 23.28, fn: () => chip(2) },                                      // every movement
  { t: 24.04, fn: () => chip(3) },                                      // recorded forever

  // ---------- Lazarus wallet, the whole world watching ----------
  { t: 26.40, fn: () => go(IDX.watch, 'pan-left') },                    // "when the group known as Lazarus drained that exchange"
  { t: 29.40, fn: () => onBeat(IDX.watch, 'seen') },                    // "the whole world could watch the stolen funds"

  // ---------- stealing easy / spending hard ----------
  { t: 32.68, fn: () => go(IDX.easyhard, 'zoom-in') },                  // "Stealing it was the easy part"
  { t: 34.48, fn: () => onBeat(IDX.easyhard, 'hard') },                 // "Spending it is the hard part"

  // ---------- cash out blocked: flagged & frozen ----------
  { t: 36.05, fn: () => go(IDX.frozen, 'pan-right') },                  // "the moment they try to send that money to an exchange"
  { t: 39.78, fn: () => onBeat(IDX.frozen, 'flag') },                   // "flagged"
  { t: 40.28, fn: () => onBeat(IDX.frozen, 'froze') },                  // "and frozen"

  // ---------- ENUMERATION: break the trail, 3 ways ----------
  { t: 41.00, fn: () => enterEnum() },                                  // "to break the trail"
  { t: 44.28, fn: () => enumEl.collapseToLogo({ delay: 0 }) },          // "they do it three ways"
  { t: 45.10, fn: () => enumEl.dockToTop() },

  // ---------- MOVE 1 — chain hopping ----------
  { t: 45.78, fn: () => { enterMoves(); } },                            // "One. Chain hopping."

  // ---------- MOVE 2 — mixers ----------
  { t: 53.06, fn: () => { go(IDX.m2, 'pan-left'); enumEl.setActive(1); } }, // "Two. Mixers."

  // ---------- MOVE 3 — splitting ----------
  { t: 59.92, fn: () => { go(IDX.m3, 'pan-right'); enumEl.setActive(2); } }, // "Three. Splitting."
  { t: 61.00, fn: () => onBeat(IDX.m3, 'burst') },                      // "they chop the haul into thousands of tiny transfers"

  // ---------- the irony: most transparent money ever made ----------
  { t: 66.92, fn: () => { leaveEnumBadge(); go(IDX.trans, 'zoom-out'); } }, // "And that's the irony"
  { t: 71.62, fn: () => onBeat(IDX.trans, 'lit') },                     // "the most transparent money ever made"

  // ---------- callback ----------
  { t: 75.54, fn: () => go(IDX.callback, 'lift') },                     // "stealing a billion is the easy part"
  { t: 77.80, fn: () => onBeat(IDX.callback, 'l2') },                   // "Actually spending it is a problem"

  // ---------- OUTRO ----------
  { t: 81.28, fn: () => { go(IDX.blank, 'zoom-in'); enterOutro(); } },  // "Want more of how crypto really works?"
  { t: 82.82, fn: () => $('#outro-host').classList.add('folder-in') },  // "Follow Stacktags."
];
CUES.sort((a, b) => a.t - b.t);
let fired = new Array(CUES.length).fill(false);

/* ============================================================
   SFX — default-element sounds rebuilt at the real CUE times.
   RULE: swoosh ONLY when the background GRID actually MOVES (a depth
   `go()` transition — camera pans/zooms/lifts) OR a DEFAULT ELEMENT
   animates (bar-chart draw, enumeration fold/dock, outro assemble),
   regardless of the grid. NO swoosh for intra-beat fly-ins where the
   grid is static. pop = a word / chip / stamp / row appearing.
   ticking = a value counting up (the chart). [t, sound, vol]
   ============================================================ */
const SFX = [
  // chart hook: ticking while bars climb (default element)
  [0.45, 'ticking', 0.8],
  // leave chart → depth (scene change, grid changes)
  [5.20, 'swoosh', 0.5],
  // ledger (grid zoom)
  [8.88, 'swoosh', 0.5],
  // anonymous? (grid lifts) + FALSE stamp pop
  [14.42, 'swoosh', 0.5], [18.55, 'pop', 0.6],
  // ledger detail (grid zoom-out) + 4 chip pops
  [19.80, 'swoosh', 0.5],
  [21.50, 'pop', 0.5], [22.52, 'pop', 0.5], [23.28, 'pop', 0.5], [24.04, 'pop', 0.5],
  // lazarus watch (grid pan)
  [26.40, 'swoosh', 0.5],
  // stealing/spending (grid zoom) + hard pop
  [32.68, 'swoosh', 0.5], [34.48, 'pop', 0.6],
  // frozen (grid pan) + flagged + frozen pops
  [36.05, 'swoosh', 0.5], [39.78, 'pop', 0.5], [40.28, 'pop', 0.6],
  // enumeration DEFAULT ELEMENT: appear → fold → dock (swoosh regardless of grid)
  [41.00, 'swoosh', 0.5], [44.28, 'swoosh', 0.5], [45.10, 'swoosh', 0.5],
  // move reveals = depth transitions (grid moves)
  [45.78, 'swoosh', 0.55], [53.06, 'swoosh', 0.5], [59.92, 'swoosh', 0.5],
  [61.00, 'pop', 0.55],                          // splitting burst
  // irony (grid zoom-out)
  [66.92, 'swoosh', 0.55],
  // callback (grid lift) + line 2 pop
  [75.54, 'swoosh', 0.5], [77.80, 'pop', 0.55],
  // outro DEFAULT ELEMENT assemble + follow line
  [81.28, 'swoosh', 0.55], [82.82, 'pop', 0.5],
];
SFX.sort((a, b) => a[0] - b[0]);
window.SFX = SFX;
const SND = { swoosh: 'assets/sound/swoosh.ogg', pop: 'assets/sound/pop.wav', ticking: 'assets/sound/ticking.mp3' };
let firedSfx = new Array(SFX.length).fill(false);
function playSfx(e) {
  try { const a = new Audio(SND[e[1]]); a.volume = e[2] != null ? e[2] : 0.5; a.play().catch(() => {}); } catch {}
}

/* ============================================================
   SUBTITLES — mirror the narration verbatim, one line at a time
   ============================================================ */
const SUBS = [
  { t: 0.00,  h: 'When North Korean hackers pulled off' },
  { t: 1.68,  h: 'the biggest <b>crypto heist</b> in history —' },
  { t: 3.50,  h: 'around <b>$1.5 billion</b> —' },
  { t: 5.34,  h: 'they ran straight into a problem' },
  { t: 6.96,  h: 'most people never expect.' },
  { t: 8.88,  h: "In crypto, you can't actually hide the money." },
  { t: 11.30, h: 'Every coin they stole was <b>visible to the entire world</b>.' },
  { t: 14.42, h: "Here's what most people get wrong." },
  { t: 15.86, h: 'They think crypto is <b>anonymous</b> — perfect for crime.' },
  { t: 18.46, h: "It's almost the opposite." },
  { t: 19.80, h: 'Most blockchains are a <b>public ledger</b>:' },
  { t: 21.50, h: 'every transaction, every wallet, every movement,' },
  { t: 24.04, h: 'recorded forever, for anyone on Earth to read.' },
  { t: 26.40, h: 'So when the group known as <b>Lazarus</b> drained that exchange,' },
  { t: 29.48, h: 'the whole world could watch the stolen funds' },
  { t: 31.20, h: 'sitting in their wallets.' },
  { t: 32.68, h: 'Stealing it was the <b>easy</b> part.' },
  { t: 34.48, h: 'Spending it is the <b>hard</b> part.' },
  { t: 36.08, h: 'Because the moment they try to send that money' },
  { t: 38.08, h: 'to an exchange to cash out,' },
  { t: 39.52, h: 'it gets <b>flagged and frozen</b>.' },
  { t: 41.00, h: 'So to have any hope of using it,' },
  { t: 42.86, h: 'they try to <b>break the trail</b>.' },
  { t: 44.28, h: 'They do it three ways.' },
  { t: 45.78, h: 'One. <b>Chain hopping</b>.' },
  { t: 47.14, h: 'They bounce the money across different blockchains,' },
  { t: 49.60, h: 'again and again,' },
  { t: 50.74, h: 'so the trail has to keep jumping networks.' },
  { t: 53.06, h: 'Two. <b>Mixers</b>.' },
  { t: 54.02, h: 'They throw the coins into a pot with thousands of others' },
  { t: 56.94, h: 'and shuffle them,' },
  { t: 57.80, h: 'blurring which coins came from where.' },
  { t: 59.92, h: 'Three. <b>Splitting</b>.' },
  { t: 61.00, h: 'They chop the haul into thousands of tiny transfers' },
  { t: 63.30, h: 'across countless wallets,' },
  { t: 64.78, h: "so there's no single stream left to follow." },
  { t: 66.92, h: "And that's the irony." },
  { t: 68.18, h: 'The only reason they need all of this' },
  { t: 69.86, h: "is that crypto isn't <b>anonymous</b> at all." },
  { t: 71.62, h: "It's the <b>most transparent money</b> ever made —" },
  { t: 73.66, h: 'a permanent, public record.' },
  { t: 75.54, h: 'So stealing a billion is the easy part.' },
  { t: 77.80, h: 'Actually spending it is a problem' },
  { t: 79.36, h: 'most criminals never saw coming.' },
  { t: 81.28, h: 'Want more of how crypto really works?' },
  { t: 82.82, h: 'Follow <b>Stacktags</b>.' },
  { t: 84.40, h: '' },
];
SUBS.sort((a, b) => a.t - b.t);
let subIdx = -1;
function updateSubs(t) {
  let k = -1;
  for (let i = 0; i < SUBS.length; i++) { if (SUBS[i].t <= t + 1e-3) k = i; else break; }
  if (k === subIdx) return;
  subIdx = k;
  const line = $('#subline');
  const h = k >= 0 ? SUBS[k].h : '';
  line.classList.remove('in');
  void line.offsetWidth;
  line.innerHTML = h;
  if (h) line.classList.add('in');
}

/* ============================================================
   ENGINE — forward, audio-driven
   ============================================================ */
const audio = $('#vo');
let raf = 0;
const DUR = 84.71;

function tick() {
  const t = audio.currentTime;
  for (let i = 0; i < CUES.length; i++) {
    if (!fired[i] && CUES[i].t <= t + 1e-3) { fired[i] = true; try { CUES[i].fn(); } catch (e) { console.error('cue', CUES[i].t, e); } }
  }
  for (let i = 0; i < SFX.length; i++) {
    if (!firedSfx[i] && SFX[i][0] <= t + 1e-3) { firedSfx[i] = true; playSfx(SFX[i]); }
  }
  updateSubs(t);
  $('#vprogress').style.width = (100 * t / (audio.duration || DUR)) + '%';
  $('#info').textContent = t.toFixed(1) + 's';
  raf = requestAnimationFrame(tick);
}

function hardReset() {
  fired.fill(false);
  firedSfx.fill(false);
  subIdx = -1;
  $('#subline').classList.remove('in');
  $('#subline').innerHTML = '';
  if (enumEl) enumEl.reset();
  enumHost().classList.remove('show', 'grid');
  $('#outro-host').classList.remove('show', 'play', 'folder-in');
  // clear intra-beat state classes
  ['lit','stamp','seen','hard','flag','froze','burst','l2']
    .forEach(c => BEATS.forEach((_, i) => L(i) && L(i).classList.remove(c)));
  $$('.chip').forEach(e => e.classList.remove('in'));
  if (chart) chart.reset();
  if (depth) depth.reset();
}

function play() {
  hardReset();
  showChart();
  audio.currentTime = 0;
  audio.play();
  if (!raf) raf = requestAnimationFrame(tick);
}
function restart() { play(); }

/* ============================================================
   FIT + INIT
   ============================================================ */
function fit() {
  const stage = $('#stage');
  const sx = window.innerWidth / 1080, sy = window.innerHeight / 1920;
  stage.style.transform = `scale(${Math.min(sx, sy)})`;
}
window.addEventListener('resize', fit);

window.addEventListener('DOMContentLoaded', () => {
  mountElements();
  fit();
  showChart();

  $('#play').addEventListener('click', play);
  $('#restart').addEventListener('click', restart);
  $('#cleanbtn').addEventListener('click', () => { document.body.classList.toggle('clean'); fit(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'c' || e.key === 'C') { document.body.classList.toggle('clean'); fit(); }
    if (e.key === ' ') { e.preventDefault(); audio.paused ? play() : audio.pause(); }
  });

  // expose for headless capture
  window.__play = play;
  // QA: show one depth beat cleanly (+ optional state classes)
  window.__showBeat = (idx, classes) => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    audio.pause();
    hardReset();
    chartHost().classList.add('hide');
    depthHost().classList.remove('hide');
    enumHost().classList.remove('show', 'grid');
    depth.reset(); depth._showFirst(idx);
    const el = L(idx); if (!el) return;
    (classes || []).forEach(c => el.classList.add(c));
    el.querySelectorAll('.chip').forEach(e => e.classList.add('in'));
  };
  window.__showChart = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } audio.pause(); hardReset(); showChart(); chart.showAll(); };
  window.__showEnum = (active) => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    audio.pause(); hardReset();
    depthHost().classList.add('hide');
    enumHost().classList.add('show');
    enumEl.reset(); enumEl.showTitle(); enumEl.revealAll({ stagger: 0 });
    enumEl.collapseToLogo({ delay: 0 });
    setTimeout(() => { enumEl.dockToTop(); enumEl.setActive(active || 0); }, 1000);
  };
  window.__showOutro = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } audio.pause(); hardReset(); enterOutro(); $('#outro-host').classList.add('folder-in'); };

  raf = requestAnimationFrame(tick);
});
