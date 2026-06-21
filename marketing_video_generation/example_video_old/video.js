/* ============================================================
   Stacktags Promo Video — animation timeline driver
   ============================================================ */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
// SVG Stacktags logo factory (mirrors StacktagsLogo.jsx geometry)
// ============================================================
function makeStacktagsLogo({ size = 40, theme = 'teal' } = {}) {
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
  // Stacks from bottom (i=3) to top (i=0)
  for (let i = COUNT - 1; i >= 0; i--) {
    const offsetY = (i - (COUNT - 1) / 2) * STEP;
    const topY = CY + offsetY - SIDE_H;
    const isCap = i === 0;
    const fillCap = t.cap;
    const fillLeft = isCap ? fillCap : t.left(i);
    const fillRight = isCap ? fillCap : t.right(i);
    // Left side trapezoid
    svg += `<polygon points="${CX - HALF_W},${topY} ${CX},${topY + HALF_H} ${CX},${topY + HALF_H + SIDE_H} ${CX - HALF_W},${topY + SIDE_H}" fill="${fillLeft}" stroke="${t.stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    // Right side trapezoid
    svg += `<polygon points="${CX},${topY + HALF_H} ${CX + HALF_W},${topY} ${CX + HALF_W},${topY + SIDE_H} ${CX},${topY + HALF_H + SIDE_H}" fill="${fillRight}" stroke="${t.stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    // Top rhombus
    svg += `<polygon points="${CX},${topY - HALF_H} ${CX + HALF_W},${topY} ${CX},${topY + HALF_H} ${CX - HALF_W},${topY}" fill="${fillCap}" stroke="${t.stroke}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  // Chevrons
  const CHEV_BASE = 340, CHEV_W = 70, CHEV_H = 90;
  svg += `<path d="M ${CX - CHEV_BASE + CHEV_W} ${CY - CHEV_H} L ${CX - CHEV_BASE} ${CY} L ${CX - CHEV_BASE + CHEV_W} ${CY + CHEV_H}" fill="none" stroke="${t.chevron}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`;
  svg += `<path d="M ${CX + CHEV_BASE - CHEV_W} ${CY - CHEV_H} L ${CX + CHEV_BASE} ${CY} L ${CX + CHEV_BASE - CHEV_W} ${CY + CHEV_H}" fill="none" stroke="${t.chevron}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`;
  svg += `</svg>`;
  return svg;
}

// ============================================================
// Typewriter
// ============================================================
class Typewriter {
  constructor(el) { this.el = el; this.cancelled = false; }
  cancel() { this.cancelled = true; }
  setText(text) { this.el.innerHTML = text; }
  async type(text, { charDelay = 36, pauseDelay = 700, cursor = true } = {}) {
    this.cancelled = false;
    let display = '';
    const cursorHtml = cursor ? '<span class="cursor"></span>' : '';
    const parts = text.split('--');
    for (let p = 0; p < parts.length; p++) {
      const seg = parts[p];
      for (const ch of seg) {
        if (this.cancelled) return;
        display += ch;
        this.el.innerHTML = display + cursorHtml;
        await sleep(charDelay);
      }
      if (p < parts.length - 1) await sleep(pauseDelay);
    }
    await sleep(300);
    if (!this.cancelled) this.el.innerHTML = display;
  }
  async typeRich(html, { charDelay = 36 } = {}) {
    // Reveal characters of plain text from `html`, but keep <tags> intact.
    this.cancelled = false;
    // Tokenize: each token is either a tag string or a single char.
    const tokens = [];
    let i = 0;
    while (i < html.length) {
      if (html[i] === '<') {
        const end = html.indexOf('>', i);
        tokens.push(html.slice(i, end + 1));
        i = end + 1;
      } else {
        tokens.push(html[i]);
        i++;
      }
    }
    let display = '';
    for (const tok of tokens) {
      if (this.cancelled) return;
      display += tok;
      this.el.innerHTML = display + '<span class="cursor"></span>';
      if (tok.length === 1 && tok !== ' ') await sleep(charDelay);
    }
    await sleep(300);
    if (!this.cancelled) this.el.innerHTML = display;
  }
  clear() { this.el.innerHTML = ''; }
}

// ============================================================
// Fit 1920×1080 stage to viewport
// ============================================================
const stage = $('#stage');
let cleanMode = false;
function fit() {
  // In clean/recording mode the HUD is hidden, so use the FULL viewport
  // height; otherwise reserve 90px at the bottom for the control bar.
  const reserve = cleanMode ? 0 : 90;
  const w = window.innerWidth, h = window.innerHeight - reserve;
  const scale = Math.min(w / 1920, h / 1080) * (cleanMode ? 1 : 0.98);
  stage.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fit);
fit();

// Press "C" to toggle clean/recording mode (hides the control bar and fills
// the viewport). Press again to bring the controls back.
window.addEventListener('keydown', (e) => {
  if (e.key === 'c' || e.key === 'C') {
    cleanMode = !cleanMode;
    document.body.classList.toggle('clean', cleanMode);
    fit();
  }
});

// ============================================================
// Scene state
// ============================================================
let currentScene = 0;
let playing = false;
let cancelPlay = false;

function setScene(n) {
  // Cross-fade by toggling .active on the new and removing it from others.
  $$('.scene').forEach(el => {
    const sn = parseInt(el.dataset.scene, 10);
    if (sn === n) el.classList.add('active');
    else el.classList.remove('active');
  });
  currentScene = n;
  $('#info').textContent = `Scene ${n} / 9`;
  // Pause all videos, then play only the ones tagged for this scene.
  // This keeps the iframe responsive — videos aren't all decoding at once.
  $$('video[data-scene]').forEach(v => {
    const vs = parseInt(v.dataset.scene, 10);
    if (vs === n) {
      v.load();           // trigger metadata fetch (preload=none defers this)
      v.play().catch(() => {});
    } else {
      try { v.pause(); } catch {}
    }
  });
}

// ============================================================
// Build dynamic content (topic grid, sidebar nav, card grid)
// ============================================================
function buildTopicGrid() {
  // Real catalog from PROMO_MOCK in PromoVideo.jsx — same order, same slugs,
  // same image filenames. Labels in German to match the app's default locale.
  const topics = [
    { slug: 'biology',          image: 'biology.png',          label: 'Biology' },
    { slug: 'chemistry',        image: 'chemics.png',          label: 'Chemistry' },
    { slug: 'physics',          image: 'physics.png',          label: 'Physics' },
    { slug: 'mathematics',      image: 'math.png',             label: 'Mathematics' },
    { slug: 'geography',        image: 'geography.png',        label: 'Geography' },
    { slug: 'history',          image: 'history.png',          label: 'History' },
    { slug: 'chinese',          image: 'chinese.png',          label: 'Chinese' },
    { slug: 'english',          image: 'english.png',          label: 'English' },
    { slug: 'spanish',          image: 'spanish.png',          label: 'Spanish' },
    { slug: 'japanese',         image: 'japanese.png',         label: 'Japanese' },
    { slug: 'korean',           image: 'korean.png',           label: 'Korean' },
    { slug: 'french',           image: 'french.png',           label: 'French' },
    { slug: 'german',           image: 'german.png',           label: 'German' },
    { slug: 'italian',          image: 'italian.png',          label: 'Italian' },
    { slug: 'russian',          image: 'russian.png',          label: 'Russian' },
    { slug: 'arabic',           image: 'arabic.png',           label: 'Arabic' },
    { slug: 'turkish',          image: 'turkish.png',          label: 'Turkish' },
    { slug: 'greek',            image: 'greek.png',            label: 'Greek' },
    { slug: 'art',              image: 'art.png',              label: 'Art' },
    { slug: 'architecture',     image: 'architecture.png',     label: 'Architecture' },
    { slug: 'music',            image: 'music.png',            label: 'Music' },
    { slug: 'films',            image: 'films.png',            label: 'Films' },
    { slug: 'cooking',          image: 'cooking.png',          label: 'Cooking' },
    { slug: 'beer',             image: 'beer.png',             label: 'Beer' },
    { slug: 'travel',           image: 'travel.png',           label: 'Travel' },
    { slug: 'sports',           image: 'sports.png',           label: 'Sports' },
    { slug: 'fitness',          image: 'fitness.png',          label: 'Fitness' },
    { slug: 'cars',             image: 'cars.png',             label: 'Cars' },
    { slug: 'brands',           image: 'brands.png',           label: 'Brands' },
    { slug: 'politics',         image: 'politics.png',         label: 'Politics' },
    { slug: 'economics',        image: 'economics.png',        label: 'Economics' },
    { slug: 'engineering',      image: 'engineering.png',      label: 'Engineering' },
    { slug: 'computer_science', image: 'computer_science.png', label: 'Computer Science' },
    { slug: 'ai',               image: 'ai.png',               label: 'AI' },
    { slug: 'robotics',         image: 'robotics.png',         label: 'Robotics' }
  ];
  const grid = $('#tp-grid');
  grid.innerHTML = '';
  topics.forEach((t) => {
    const tile = document.createElement('button');
    tile.className = 'tp-tile tp-tile-with-image';
    tile.dataset.slug = t.slug;
    tile.innerHTML = `
      <div class="tp-tile-img-wrap">
        <img src="assets/topics/${t.image}" alt="" class="tp-tile-img" loading="lazy" draggable="false">
      </div>
      <span class="tp-tile-label">${t.label}</span>
    `;
    grid.appendChild(tile);
  });
}

function buildSidebar() {
  // Real sidebar order from screenshot:
  // Archiv (chevron), Entdecken (active), Erstellen, Wettkampf, Teams,
  // Fortschritt, Herausforderungen, Beiträge
  const nav = [
    { t: 'Archive',          active: false, chevron: true,  svg: '<path d="M12 4 L20 8 L12 12 L4 8 Z"/><path d="M4 12 L12 16 L20 12"/><path d="M4 16 L12 20 L20 16"/>' },
    { t: 'Discover',       active: true,  svg: '<circle cx="11" cy="11" r="6"/><line x1="15.5" y1="15.5" x2="20" y2="20"/>' },
    { t: 'Create',       active: false, svg: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
    { t: 'Compete',       active: false, svg: '<rect x="5" y="14" width="3" height="6" rx="1" fill="currentColor" stroke="none"/><rect x="10.5" y="10" width="3" height="10" rx="1" fill="currentColor" stroke="none"/><rect x="16" y="6" width="3" height="14" rx="1" fill="currentColor" stroke="none"/>' },
    { t: 'Teams',           active: false, svg: '<circle cx="16" cy="9" r="3"/><path d="M16 14c3 0 5.5 2 5.5 5"/><circle cx="10" cy="9" r="3"/><path d="M4.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>' },
    { t: 'Progress',     active: false, svg: '<rect x="5" y="10" width="3" height="10" rx="1" fill="currentColor" stroke="none"/><rect x="10.5" y="13" width="3" height="7" rx="1" fill="currentColor" stroke="none"/><rect x="16" y="7" width="3" height="13" rx="1" fill="currentColor" stroke="none"/>' },
    { t: 'Challenges', active: false, svg: '<line x1="6" y1="3" x2="6" y2="21"/><path d="M6 4 L17 4 L14.5 8 L17 12 L6 12 Z" fill="currentColor" stroke="currentColor" stroke-width="1.4"/>' },
    { t: 'Posts',        active: false, svg: '<g transform="rotate(45 12 12)"><path d="M12 3 L19 19 L12 16 L5 19 Z"/><path d="M12 3 L12 16"/></g>' }
  ];
  $('#s4-nav').innerHTML = nav.map(n => `
    <a class="new-nav-item${n.active ? ' active' : ''}" href="#">
      <div class="new-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${n.svg}</svg></div>
      <span class="new-nav-text">${n.t}</span>
      ${n.chevron ? '<svg class="nav-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' : ''}
    </a>
  `).join('');
  $('#s4-logo-host').innerHTML = makeStacktagsLogo({ size: 40 });
}

function buildCards() {
  // Discover feed built from the 100 curated folders in discover_data.js
  // (real Stacktags content — distinct cover image per card).
  const C = 'assets/content/';
  const folderIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
  const layerIcon  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
  const baseCards = (typeof DISCOVER_CARDS !== 'undefined') ? DISCOVER_CARDS : [];
  // Duplicate the list several times so the accelerating background scroll
  // always has plenty of headroom to keep speeding up until the three views
  // fully cover the Discover screen.
  const cards = baseCards.concat(baseCards, baseCards, baseCards);
  $('#s4-grid').innerHTML = cards.map((c, i) => {
    const [title, g, tags, img] = c;
    const sektionen = 1 + (i % 6);
    const eintraege = 18 + (i * 13) % 260;
    return `
    <div class="new-card">
      <div class="new-card-accent"></div>
      <div class="new-card-head">
        <div class="new-card-head-text">
          <h3 class="new-card-title">${title}</h3>
          <div class="new-card-desc">${DISCOVER_CAT[g] || ''}</div>
          <div class="new-card-tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>
        </div>
        <div class="new-card-thumb" style="background-image:url(${C}${img})"></div>
      </div>
      <div class="new-card-meta">
        <span>${folderIcon} ${sektionen} Sections</span><span>${layerIcon} ${eintraege} Entries</span>
      </div>
    </div>`;
  }).join('');
}

function buildGameMap() {
  const g = $('#game-cells');
  const cells = [
    [0,0,'t'],[1,0,'t'],[2,0,''],[3,0,'e'],
    [0,1,'t'],[1,1,''],[2,1,''],[3,1,'e'],
    [0,2,''],[1,2,''],[2,2,'t'],[3,2,''],
    [0,3,''],[1,3,'e'],[2,3,''],[3,3,''],
    [0,4,'e'],[1,4,''],[2,4,''],[3,4,'t'],
  ];
  g.innerHTML = cells.map(([x,y,k]) => {
    const fill = k === 't' ? '#3EAE93' : k === 'e' ? '#ef6b6b' : '#cfe4dc';
    return `<rect x="${x*50}" y="${y*40}" width="46" height="36" rx="3" ry="3" fill="${fill}" stroke="#fff" stroke-width="1.5"/>`;
  }).join('');
}

function buildProgCal() {
  const cal = $('#prog-cal');
  const levels = [2,3,1,4,2,3,4, 1,2,4,3,2,4,3];
  cal.innerHTML = levels.map(l => `<div class="l${l}"></div>`).join('');
}

function buildS9Logos() {
  const tileHost = $('#s9-logo-tile-host');
  if (tileHost) tileHost.innerHTML = makeStacktagsLogo({ size: 120 });
  const finaleHost = $('#s9-finale-logo');
  if (finaleHost) finaleHost.innerHTML = makeStacktagsLogo({ size: 430 });
}

// Mount the real 3D globe into the scene-9 map tile (lazy — only when
// scene 9 is shown; the grid clone discards any previous canvas first).
function initGlobe() {
  const el = $('#s9-map-globe');
  if (!el) return;
  el.innerHTML = '';
  if (window.mountStacktagsGlobe) {
    // give the CDN libs a tick in case they are still parsing
    window.mountStacktagsGlobe(el);
    if (!el.querySelector('canvas')) setTimeout(() => window.mountStacktagsGlobe(el), 400);
  }
}

// ============================================================
// Confetti for winner screen
// ============================================================
function spawnConfetti() {
  const host = $('#confetti-host');
  if (!host) return;
  host.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    if (i % 4 === 1) c.classList.add('c2');
    else if (i % 4 === 2) c.classList.add('c3');
    else if (i % 4 === 3) c.classList.add('c4');
    c.style.left = (Math.random() * 100) + '%';
    c.style.animationDelay = (Math.random() * 0.7) + 's';
    host.appendChild(c);
    requestAnimationFrame(() => c.classList.add('go'));
  }
}

// ============================================================
// Reset
// ============================================================
function reset() {
  cancelPlay = true;
  if (typewriters) typewriters.forEach(t => t.cancel());

  // Scene 1
  $('#scene-1').classList.remove('intro-on', 'bg-white');
  { const si = $('#s1-intro'); if (si) si.style.opacity = ''; }   // clear stale fade-out inline
  $$('#scene-1 .morph-pane').forEach(el => el.classList.remove('rise'));
  $$('#scene-1 .s1-word').forEach(el => el.classList.remove('show'));
  const s1stg = $('#s1-stage');
  if (s1stg) s1stg.classList.remove('morph', 'cap-in', 'chev-in', 'settled', 'brand-in');
  buildOp3Board(false);   // reset the right-panel leaderboard/chart to its start state
  resetOp1(); resetOp2();
  $('#s1-cap').innerHTML = '';
  $('#s1-cap-top').innerHTML = '';
  resetCaps();   // clear wipe clip-path + teal bar (REVERSIBLE EDIT v8)
  document.querySelectorAll('#scene-1 .s1-caption').forEach(el => el.classList.remove('show', 'fade'));

  // Scene 3
  $$('.tp-tile').forEach(el => el.classList.remove('tp-selected', 'tp-tile-pulsed'));
  const tpWrapReset = $('#tp-grid-wrap');
  if (tpWrapReset) tpWrapReset.scrollTop = 0;
  $$('#scene-3 .new-main-content').forEach(el => { el.scrollTop = 0; });
  const fertigBtn = $('#tp-fertig');
  if (fertigBtn) fertigBtn.classList.remove('clicked');
  // Picker classes live on the .stage now (top-level picker).
  stage.classList.remove('picker-in', 'picker-out', 'morph-lift');
  { const cap = $('#logo-cap'); if (cap) cap.style.opacity = ''; }   // restore lifted top layer (REVERSIBLE EDIT v9)

  // Scene 4 — reset scroll so the next play starts from the top.
  const s4Main = $('#scene-4 .new-main-content');
  if (s4Main) s4Main.scrollTop = 0;
  $('#scene-4').classList.remove('zoom-out');
  $('#s4-cap').innerHTML = '';

  // Scene 5
  $('#scene-5').classList.remove('stage-1', 'stage-2', 'stage-3', 'stage-4', 'kw-in', 'kw-out');
  $$('#scene-5 .trio-col').forEach(el => el.classList.remove('in'));
  $$('.feed-mob .feed-mc-opt').forEach(el => el.classList.remove('correct', 'wrong', 'tap'));
  { const fm = $('.feed-mob'); if (fm) fm.classList.remove('feed-paged'); }
  { const pm = $('.prog-mob'); if (pm) { pm.classList.remove('prog-cal-on', 'prog-cal-scrolled'); const tb = pm.querySelectorAll('.fs-m-toggle-btn'); if (tb[0]) tb[0].classList.add('active'); if (tb[1]) tb[1].classList.remove('active'); } }
  resetDonut();   // REVERSIBLE EDIT v16: donut/graph back to empty for replay
  { const gm = $('.game-mob'); if (gm) gm.classList.remove('qg-next-in'); }
  $$('.qg-nextq-opt').forEach(el => el.classList.remove('correct', 'tap'));
  const progBar = $('#prog-bar'); if (progBar) progBar.style.width = '0';
  const qgFill = $('.qg-progress-fill'); if (qgFill) { qgFill.style.transition = 'none'; qgFill.style.width = '0'; }
  const progRect = $('#prog-reveal-rect'); if (progRect) progRect.setAttribute('width', '0');

  // Scene 9
  $('#scene-9').classList.remove('finale');
  $$('#scene-9 .s9-value').forEach(el => el.classList.remove('switched'));

  // Active scene
  $$('.scene').forEach(el => el.classList.remove('active'));
  currentScene = 0;
  $('#info').textContent = 'Scene 0 / 9';
}

// ============================================================
// Typewriter instances (one per caption element)
// ============================================================
const twS1   = new Typewriter($('#s1-cap'));
const twS1Top= new Typewriter($('#s1-cap-top'));
const twS5   = new Typewriter($('#s5-algo'));
const typewriters = [twS1, twS1Top, twS5];

// ============================================================
// PLAY — the full timeline
// ============================================================
async function play() {
  if (playing) return;
  playing = true;
  reset();
  // CRITICAL: set cancelPlay = false AFTER reset(), because reset() sets it
  // to true to terminate any in-flight playback. Without this order, the
  // first `if (cancelPlay) return done();` check in scene 1 fires and the
  // timeline aborts after the first panel has risen.
  cancelPlay = false;
  $('#play').disabled = true;
  $('#record').disabled = true;

  await sleep(300);

  // ============ SCENE 1 — Intro caption first, THEN panels enter ============
  setScene(1);
  // Clean state
  document.querySelector('.s1-caption-bot').classList.remove('show', 'fade');
  $('#s1-cap').innerHTML = '';
  $('#s1-cap-top').innerHTML = '';
  $('#scene-1').classList.remove('bg-white');

  // --- Intro "What is stacktags?" ---
  const introEl = $('#s1-intro');
  introEl.style.opacity = '';                   // clear any stale inline from a prior run
  introEl.style.transition = 'opacity .55s ease';
  $('#scene-1').classList.add('intro-on');      // fade IN (0 → 1)
  await sleep(984);   // hold the intro caption (fully readable)
  if (cancelPlay) return done();
  // Fade OUT explicitly via inline opacity so the dissolve is GUARANTEED
  // (inline beats the .intro-on opacity:1 rule and forces a clean .55s
  // transition). Nothing else moves during this window, so it clearly
  // "verblasst" before view 1 enters.
  introEl.style.opacity = '0';
  await sleep(700);   // let the fade fully complete — no overlap with panels
  if (cancelPlay) return done();
  $('#scene-1').classList.remove('intro-on');

  // --- Panels rise ---
  $$('#scene-1 video').forEach(v => { try { v.currentTime = 0; v.play(); } catch {} });
  const s1Stage = $('#s1-stage');
  await sleep(50);
  // Each panel flies in; its word label follows ~400ms later so the text
  // lands IN SYNC with the panel arriving (the panel transform is ~1s, the
  // word opacity only .6s, so triggering together made the text pop first).
  const WORD_LAG = 400;
  $('#morph-1').classList.add('rise');
  setTimeout(() => $('#s1-word-1').classList.add('show'), WORD_LAG);
  animateOp1();   // left panel: "tap" the correct answer after it appears
  // View 1 (TikTok) enters at 02:07. View 2 (YouTube) now enters 35f earlier
  // (05:06 → 04:01); this gap shrinks by 35f to pull it in.
  await sleep(1866);
  if (cancelPlay) return done();
  $('#morph-2').classList.add('rise');
  setTimeout(() => $('#s1-word-2').classList.add('show'), WORD_LAG);
  animateOp2();   // middle panel: gentle delayed auto-scroll of the cards
  // View 3 (competition) enters 38f earlier (07:00 → 05:22) — gap shrinks.
  await sleep(1633);
  if (cancelPlay) return done();
  $('#morph-3').classList.add('rise');
  setTimeout(() => $('#s1-word-3').classList.add('show'), WORD_LAG);
  animateOp3();   // right panel: leaderboard climb + week→month chart
  // Transition to the logo pulled 29f earlier (08:13 → 07:14).
  await sleep(2000);  // logo build moved earlier (2967 → 2000, −29f)
  if (cancelPlay) return done();
  // Panels collapse into the stack + "but for learning" descends from above.
  // Word labels fade with the morph (CSS rule).
  s1Stage.classList.add('morph');
  freezeOp2();   // stop the middle-panel scroll the moment panels collapse
  await sleep(220);
  /* REVERSIBLE EDIT v8: smooth left-to-right wipe (was typewriter) + teal bar. */
  wipeReveal($('#s1-cap-top'), 'everything - for learning.', 900);
  revealCapBar(900);
  await sleep(1570);   // REVERSIBLE EDIT v15: "stacktags" wordmark lands ~17f
                       // later (08:19 → 09:06). Was 1000. The same 570ms is
                       // removed from the hold before the picker (below) so the
                       // picker still flies in at 11:28 — total length unchanged.
  if (cancelPlay) return done();
  // All three logo elements now appear SIMULTANEOUSLY — the top layer (cap),
  // the two outer brackets (chevrons) and the Stacktags wordmark — at the
  // moment the top layer alone used to land. (Was: cap → chev → brand, each
  // ~0.5s apart.) settled = halo pulse; bg-white + brand reveal the wordmark.
  s1Stage.classList.add('cap-in', 'chev-in', 'settled', 'brand-in');
  $('#scene-1').classList.add('bg-white');
  await sleep(620);   // caption appears ~10f later (280 → 620)
  document.querySelector('.s1-caption-bot').classList.add('show');
  /* REVERSIBLE EDIT v9: same wipe reveal (no bar), a touch slower (was 1000ms). */
  wipeReveal($('#s1-cap'), 'The most <span class="s1-accent">competitive</span> learning app <span class="s1-accent">in the world</span>.', 1200);
  await sleep(1200);
  await sleep(230);   // REVERSIBLE EDIT v15: 570ms shorter (was 800) to offset the
                      // later "stacktags" reveal above — keeps the picker at 11:28.
  if (cancelPlay) return done();

  // ============ SCENE 3 — Topic picker (top-level zoom-in from logo) ============
  // The popup flies in a tick earlier than before. Mathematics is clicked at
  // +333ms (the moment the popup USED to appear), then the rest hold their
  // exact timecodes: history 13:07 · arabic 13:26 · cooking 14:15 ·
  // computer_science 14:29 · Fertig 15:17.

  // 1. Brief pause on the formed logo so the eye registers it.
  await sleep(260);
  if (cancelPlay) return done();

  // 2. The TOP LAYER lifts off the stack and flies toward the viewer,
  //    enlarging + turning teal→white into a rounded rectangle; the picker
  //    window then forms out of that white rectangle (REVERSIBLE EDIT v9).
  { const cap = $('#logo-cap'); if (cap) { cap.style.transition = 'opacity .25s ease'; cap.style.opacity = '0'; } }
  stage.classList.add('morph-lift');
  await sleep(760);                 // let the rhombus fly + become the white rect
  if (cancelPlay) return done();

  // 3. Picker forms out of the white rectangle.
  stage.classList.add('picker-in');
  const pickerT = Date.now();
  $$('#scene-3 .new-main-content, #scene-4 .new-main-content').forEach(el => { el.scrollTop = 0; });
  const tpWrap = $('#tp-grid-wrap');
  if (tpWrap) tpWrap.scrollTop = 0;

  // 4. Swap the scene underneath the picker (overlay stays on top) so the
  //    Discover backdrop is in place well before the first click.
  await sleep(350);
  if (cancelPlay) return done();
  setScene(3);
  if (tpWrap) tpWrap.scrollTop = 0;

  // Absolute scheduler: resolve once `ms` have elapsed since the popup opened.
  const atPicker = async (ms) => {
    const w = ms - (Date.now() - pickerT);
    if (w > 0) await sleep(w);
  };
  // Pulse-select a topic tile by slug.
  const pickTile = (slug) => {
    const tile = $(`.tp-tile[data-slug="${slug}"]`);
    if (tile) {
      tile.classList.add('tp-tile-pulsed', 'tp-selected');
      setTimeout(() => tile.classList.remove('tp-tile-pulsed'), 320);
    }
  };

  // Mathematics — clicked first, at the moment the popup used to open (+333ms).
  await atPicker(333);
  if (cancelPlay) return done();
  pickTile('mathematics');

  // 1st of the original picks — history @ 13:07 (offset +333 to hold timecode)
  await atPicker(1100);
  if (cancelPlay) return done();
  pickTile('history');

  // 3rd preference — architecture @ 13:26 (was arabic @ 13:11; +15f later)
  await atPicker(1866);
  if (cancelPlay) return done();
  pickTile('architecture');

  // Scroll downward so the lower picks come into view as they're clicked.
  const tpScrollStart = Date.now();
  const tpTarget = tpWrap ? Math.max(200, tpWrap.scrollHeight - tpWrap.clientHeight) : 0;
  const tpTimer = setInterval(() => {
    if (!tpWrap || cancelPlay) { clearInterval(tpTimer); return; }
    const t = Math.min(1, (Date.now() - tpScrollStart) / 1100);
    const eased = 1 - Math.pow(1 - t, 3);
    tpWrap.scrollTop = tpTarget * eased;
    if (t >= 1) clearInterval(tpTimer);
  }, 16);

  // 3rd preference — cooking @ 14:15 (offset +333 to hold timecode)
  await atPicker(2366);
  if (cancelPlay) return done();
  pickTile('cooking');

  // 4th preference — computer_science @ 14:29
  await atPicker(2833);
  if (cancelPlay) return done();
  pickTile('computer_science');

  // Fertig button @ 15:17
  await atPicker(3433);
  if (cancelPlay) return done();
  clearInterval(tpTimer);
  const fertig = $('#tp-fertig');
  if (fertig) {
    fertig.classList.add('clicked');
    await sleep(200);
    fertig.classList.remove('clicked');
  }
  // 5. Picker zoom-OUT (shrinks back toward the logo position; scene 3
  //    backdrop stays visible behind it).
  stage.classList.remove('picker-in');
  stage.classList.remove('morph-lift');   // white rect already replaced by picker
  stage.classList.add('picker-out');     // popup shrinks away…

  // ============ SCENE 4 — Discover (scroll begins IMMEDIATELY as the popup
  //   closes — no dead pause beforehand; the scroll is visible behind the
  //   shrinking popup) ============
  setScene(4);
  const discoverMain = $('#scene-4 .new-main-content');
  if (discoverMain) discoverMain.scrollTop = 0;
  await sleep(60);   // tiny buffer so scene 4 is active before scrolling
  if (cancelPlay) return done();
  // Scroll easing: cubic-IN (slow start, accelerating to fast finish).
  // total duration ~2.6s through ~85% of the card list.
  // Background scroll: starts brisk and ACCELERATES, getting noticeably
  // faster toward the end (peaks ~8000px/s) right as the three views slide up
  // and cover the Discover screen — never stalling. Cards are duplicated x4
  // (buildCards) so the accelerating cruise never runs out of content.
  const scrollStart = Date.now();
  const V0 = 1.7;        // px/ms — initial speed (already moving briskly)
  const ACC = 0.00150;   // px/ms² — acceleration; end speed ≈ 8px/ms (~8000px/s)
  const scrollPos = (ms) => V0 * ms + 0.5 * ACC * ms * ms;
  let scrollTimer = setInterval(() => {
    if (!discoverMain || cancelPlay) { clearInterval(scrollTimer); return; }
    const ms = Date.now() - scrollStart;
    const maxTop = discoverMain.scrollHeight - discoverMain.clientHeight;
    discoverMain.scrollTop = Math.min(maxTop, scrollPos(ms));
    if (ms > 5200) clearInterval(scrollTimer);   // auto-stop once well-covered
  }, 16);

  // Trio columns enter DURING the (still-moving) scroll. First view (feed:
  // shirt/blouse) lands at 17:28 — ~2.04s into the immediate scroll.
  await sleep(2037);
  if (cancelPlay) return done();
  const s5el = $('#scene-5');
  s5el.classList.add('overlay-mode', 'stage-1');
  s5el.classList.add('active');
  $('#trio-col-1').classList.add('in');
  setTimeout(() => animateFeed(), 700);
  await sleep(700);
  if (cancelPlay) return done();
  $('#trio-col-2').classList.add('in');
  setTimeout(() => animateGame(), 800);
  await sleep(700);
  if (cancelPlay) return done();
  $('#trio-col-3').classList.add('in');
  // Progress chart starts animating IMMEDIATELY when its view appears.
  animateProgress();
  // Views are covering the screen now — let the last column settle. The
  // background scroll keeps gliding behind them and auto-stops on its own
  // (hidden), so scene-5 timing stays independent of the scroll length.
  await sleep(800);
  if (cancelPlay) return done();

  // ============ SCENE 5 — Trio fullscreen → phones → algo ============
  // Trio is now fullscreen. Fade scene 4 out, scene 5 becomes the only
  // active scene, and the overlay-mode class is dropped so scene 5's dark
  // background fills in cleanly behind the trio.
  setScene(5);
  s5el.classList.remove('overlay-mode');
  await sleep(1233);  // hold fullscreen — phone transition pulled 35f earlier → 21:11
  if (cancelPlay) return done();
  // Stage 3: shrink into phone bezels, centered on the stage.
  s5el.classList.remove('stage-1');
  s5el.classList.add('stage-3');
  animateProgressCalendar();   // right phone: jump to calendar + donut
  await sleep(1400);
  // Stage 4: keywords fly in one by one and nudge the phones
  // (left up, middle down, right up).
  s5el.classList.add('stage-4');
  await sleep(1000);   // keywords start 12f earlier → "Remembers your strengths" at 24:24
  s5el.classList.add('kw-in');
  await sleep(2700);   // REVERSIBLE EDIT v14: shorter still (was 3500) — phones
                       // fly out very shortly after the donut chart flashes in.
  if (cancelPlay) return done();
  // Blocks fly out: left & right up, middle down.
  s5el.classList.add('kw-out');
  await sleep(1260);   // slide-out is 20% slower (1s→1.2s); wait grows to match
  if (cancelPlay) return done();

  // ============ SCENE 9 — Parallel grid → value tiles → closing logo ============
  setScene(9);
  const s9 = $('#scene-9');
  s9.classList.remove('finale');
  $$('#scene-9 .s9-value').forEach(el => el.classList.remove('switched'));
  // Restart grid fly-in by replacing the grid with a fresh pristine clone
  const grid = $('#s9-grid');
  const fresh = s9GridPristine.cloneNode(true);
  grid.parentNode.replaceChild(fresh, grid);
  initGlobe();
  animateS9Tiles();

  // 1. Tiles fly in (CSS stagger ≈ 1.2s) — all filled with real Stacktags UI.
  //    Hold longer so the grid (incl. the corner tiles' 2nd tasks: vocab
    //  slide, globe → Brazil, image-guess → Great Wall) reads before flips.
  await sleep(5100);   // REVERSIBLE EDIT v14: flip the centre panels earlier
                       // still (was 5500) to trim the closing scene further.
  if (cancelPlay) return done();

  // 2. The three centre tiles flip to their white value faces, one by one,
  //    with a longer beat between each so the cadence is calm and even.
  //    REVERSIBLE EDIT v10: flips now happen WHILE the surrounding cards are
  //    still animating (cards run to ~10s via the TS time-scale), and the
  //    finale logo zoom lands right as they finish — no static tail.
  $('#s9-val-smarter').classList.add('switched');
  await sleep(1300);
  if (cancelPlay) return done();
  $('#s9-val-sharper').classList.add('switched');
  await sleep(1300);
  if (cancelPlay) return done();
  $('#s9-val-logo').classList.add('switched');
  await sleep(1700);   // hold until the corner cards' last transitions land
  if (cancelPlay) return done();

  // 3. Finale: the grid slowly fades out while the centre logo zooms up
  //    to full screen, leaving only the logo + wordmark + stacktags.io.
  s9.classList.add('finale');
  await sleep(3400);

  done();
}

function done() {
  playing = false;
  cancelPlay = false;
  $('#play').disabled = false;
  $('#record').disabled = false;
}

// ============================================================
// Embedded mobile screen mini-animations
// ============================================================
function animateFeed() {
  const feedMob = $('.feed-mob');
  // 1. Tap the correct MC pill on page 1 (衢衫), mark it correct (teal).
  setTimeout(() => {
    const correct = $('.feed-page-1 .feed-mc-opt[data-correct]');
    if (!correct) return;
    correct.classList.add('tap');
    setTimeout(() => correct.classList.add('correct'), 190);
  }, 1100);
  // 2. Scroll DOWN to the next post (financing / fundraising) — page slides up.
  //    Plays 36f later so it lands well after the phones are visible (22:20).
  setTimeout(() => { if (feedMob && !cancelPlay) feedMob.classList.add('feed-paged'); }, 3900);
  // 3. Tap the correct pill on page 2 (融资) once it has scrolled in.
  setTimeout(() => {
    if (cancelPlay) return;
    const correct = $('.feed-page-2 .feed-mc-opt[data-correct]');
    if (!correct) return;
    correct.classList.add('tap');
    setTimeout(() => correct.classList.add('correct'), 190);
  }, 5200);
}

function animateGame() {
  // Teal line at the top starts FULL, then retracts from right to left.
  const fill = $('.qg-progress-fill');
  if (fill) {
    fill.style.transition = 'none';
    fill.style.width = '100%';
    void fill.offsetWidth;
    setTimeout(() => {
      fill.style.transition = 'width 2.6s cubic-bezier(.45,0,.25,1)';
      fill.style.width = '0%';
    }, 500);
  }
  // Next question (capital of Egypt) slides in from the RIGHT, then Cairo
  // gets tapped. Fires SLIGHTLY AFTER the left phone scrolls (feed-paged at
  // 3900) so the two phones move in sequence, not together.
  const gameMob = $('.game-mob');
  setTimeout(() => { if (gameMob && !cancelPlay) gameMob.classList.add('qg-next-in'); }, 4350);
  setTimeout(() => {
    if (cancelPlay) return;
    const correct = $('.qg-nextq-opt[data-correct]');
    if (!correct) return;
    correct.classList.add('tap');
    setTimeout(() => correct.classList.add('correct'), 190);
  }, 5650);
}

function animateProgress() {
  const bar = $('#prog-bar');
  if (bar) bar.style.width = '11%';
  // REVERSIBLE EDIT v8: instead of a left-to-right clip reveal, the chart now
  // SCALES from a 1-week view to a 1-month view (same as the opening right
  // panel). Reuses the op3 data + op3Y mapping (same 280×130 viewBox).
  const rect = $('#prog-reveal-rect'); if (rect) rect.setAttribute('width', '280'); // show all; span drives the visual
  const line = $('#prog-line'), comm = $('#prog-line-comm'), fill = $('#prog-fill-path');
  if (!line) return;
  const sel = $('.prog-mob .fs-chart-select');
  const axis = $('.prog-mob .fs-chart-axis');
  const W = 280, t0 = performance.now(), dur = 3000;
  const easeInOut = t => (t < .5) ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const progTimer = setInterval(() => {
    if (cancelPlay) { clearInterval(progTimer); return; }
    const p = Math.min(1, (performance.now() - t0) / dur);
    const span = 7 + (OP3_DAYS - 7) * easeInOut(p);
    const n = Math.max(2, Math.min(OP3_DAYS, Math.round(span)));
    const denom = Math.max(1, span - 1);
    const pu = [], pc = []; let lastX = 0;
    for (let i = 0; i < n; i++) {
      const x = (i / denom) * W;
      pu.push(x.toFixed(1) + ',' + op3Y(op3User[i]).toFixed(1));
      pc.push(x.toFixed(1) + ',' + op3Y(op3Comm[i]).toFixed(1));
      lastX = x;
    }
    line.setAttribute('points', pu.join(' '));
    comm.setAttribute('points', pc.join(' '));
    if (fill) fill.setAttribute('d', 'M' + pu.join(' L') + ' L' + lastX.toFixed(1) + ',130 L0,130 Z');
    if (sel && sel.firstChild) sel.firstChild.textContent = (span < 10.5 ? '1W ' : (span < 21 ? '3W ' : '1M '));
    if (axis) {
      let labels;
      if (span <= 9.2) labels = ['Mi', 'Do', 'Fr', 'Sa', 'So', 'Mo', 'Di'];
      else { labels = []; const tot = Math.round(span); for (let k = 0; k < 5; k++) labels.push(String(Math.max(1, Math.round(tot * k / 4) || 1))); labels[0] = '1'; }
      axis.innerHTML = labels.map(l => '<span>' + l + '</span>').join('');
    }
    if (p >= 1) clearInterval(progTimer);
  }, 40);
}

// REVERSIBLE EDIT v8: right phone jumps to the calendar toggle, reveals the
// calendar, then scrolls down to expose the donut chart.
function animateProgressCalendar() {
  const pm = $('.prog-mob'); if (!pm) return;
  const btns = pm.querySelectorAll('.fs-m-toggle-btn');
  setTimeout(() => {
    if (cancelPlay) return;
    if (btns[0]) btns[0].classList.remove('active');
    if (btns[1]) {
      btns[1].classList.add('active', 'prog-cal-tap');
      setTimeout(() => btns[1].classList.remove('prog-cal-tap'), 340);
    }
    pm.classList.add('prog-cal-on');
  }, 3800);
  // scroll down to reveal the donut — REVERSIBLE EDIT v14: even snappier (was
  // 4400) and a faster scroll, so the donut flashes briefly before the phones go.
  setTimeout(() => {
    if (cancelPlay) return;
    pm.classList.add('prog-cal-scrolled');
    // REVERSIBLE EDIT v16: dynamically build the donut + line chart as they
    // scroll into view (ring fills 0→full, % count up, graph draws L→R).
    setTimeout(() => { if (!cancelPlay) animateDonut(); }, 280);
  }, 4150);
}

// REVERSIBLE EDIT v16: donut ring fills from empty, legend percentages count
// up from 0, and the line chart below draws itself left-to-right.
const PC_DONUT = { C: 251.3, fV: 0.48, fQ: 0.32, fG: 0.20, days: 28,
  vals: [10, 26, 20, 38, 32, 50, 44, 62, 55, 70, 82, 96], totalMin: 1240,
  bars: [92, 78, 64] };
function resetDonut() {
  const sv = $('#pc-seg-vocab'), sq = $('#pc-seg-quiz'), sg = $('#pc-seg-games');
  if (!sv) return;
  sv.setAttribute('stroke-dasharray', '0 ' + PC_DONUT.C);
  sq.setAttribute('stroke-dasharray', '0 ' + PC_DONUT.C);
  sg.setAttribute('stroke-dasharray', '0 ' + PC_DONUT.C);
  const ids = ['#pc-pct-vocab', '#pc-pct-quiz', '#pc-pct-games', '#pc-donut-days', '#pc-graph-total'];
  ids.forEach(id => { const e = $(id); if (e) e.textContent = '0'; });
  const ln = $('#pc-graph-line'), ar = $('#pc-graph-area');
  if (ln) ln.setAttribute('points', '');
  if (ar) ar.setAttribute('d', '');
  // REVERSIBLE EDIT v17: reset the Top-topics bars
  [1, 2, 3].forEach(i => {
    const f = $('#pc-bar-' + i), v = $('#pc-bval-' + i);
    if (f) f.style.width = '0%';
    if (v) v.textContent = '0%';
  });
}
function animateDonut() {
  const sv = $('#pc-seg-vocab'), sq = $('#pc-seg-quiz'), sg = $('#pc-seg-games');
  if (!sv) return;
  const { C, fV, fQ, fG, days, vals, totalMin } = PC_DONUT;
  const W = 280, H = 110, maxV = Math.max(...vals);
  const xs = vals.map((v, i) => (i / (vals.length - 1)) * W);
  const ys = vals.map(v => H - 8 - (v / maxV) * (H - 18));
  const line = $('#pc-graph-line'), area = $('#pc-graph-area');
  const pV = $('#pc-pct-vocab'), pQ = $('#pc-pct-quiz'), pG = $('#pc-pct-games');
  const dEl = $('#pc-donut-days'), tEl = $('#pc-graph-total');
  const t0 = performance.now(), dur = 820, ease = t => 1 - Math.pow(1 - t, 3);
  const timer = setInterval(() => {
    if (cancelPlay) { clearInterval(timer); return; }
    const p = ease(Math.min(1, (performance.now() - t0) / dur));
    sv.setAttribute('stroke-dasharray', (C * fV * p).toFixed(1) + ' ' + C);
    sq.setAttribute('stroke-dasharray', (C * fQ * p).toFixed(1) + ' ' + C);
    sg.setAttribute('stroke-dasharray', (C * fG * p).toFixed(1) + ' ' + C);
    if (pV) pV.textContent = Math.round(48 * p);
    if (pQ) pQ.textContent = Math.round(32 * p);
    if (pG) pG.textContent = Math.round(20 * p);
    if (dEl) dEl.textContent = Math.round(days * p);
    if (tEl) tEl.textContent = Math.round(totalMin * p).toLocaleString('en-US');
    // line chart draws left-to-right (continuous, interpolated head point)
    const fIdx = p * (vals.length - 1), full = Math.floor(fIdx), px = [];
    for (let i = 0; i <= full; i++) px.push(xs[i].toFixed(1) + ',' + ys[i].toFixed(1));
    if (full < vals.length - 1) {
      const f = fIdx - full;
      px.push((xs[full] + (xs[full + 1] - xs[full]) * f).toFixed(1) + ',' +
              (ys[full] + (ys[full + 1] - ys[full]) * f).toFixed(1));
    }
    if (line) line.setAttribute('points', px.join(' '));
    if (area && px.length) {
      const lastX = px[px.length - 1].split(',')[0];
      area.setAttribute('d', 'M' + px.join(' L') + ' L' + lastX + ',' + H + ' L0,' + H + ' Z');
    }
    // REVERSIBLE EDIT v17: Top-topics bars grow + values count up
    PC_DONUT.bars.forEach((target, i) => {
      const f = $('#pc-bar-' + (i + 1)), v = $('#pc-bval-' + (i + 1));
      const cur = target * p;
      if (f) f.style.width = cur.toFixed(1) + '%';
      if (v) v.textContent = Math.round(cur) + '%';
    });
    if (p >= 1) clearInterval(timer);
  }, 24);
}

// ============================================================
// Scene 9 — dynamic tile interactions (answers get tapped, the
// sentence is assembled, items drop into buckets, pairs connect…)
// Runs on the freshly-cloned #s9-grid each time scene 9 opens.
// ============================================================
function animateS9Tiles() {
  const grid = $('#s9-grid');
  if (!grid) return;
  const q  = (s) => grid.querySelector(s);
  const qa = (s) => Array.from(grid.querySelectorAll(s));

  // REVERSIBLE EDIT v10: spread the in-tile interactions across the WHOLE end
  // sequence (TS time-scale) so the cards keep animating right up until the
  // finale logo zoom — instead of all finishing before the first value flip.
  // To revert: set TS = 1 (and restore the play() flip/finale timing below).
  const TS = 1.85;
  const T = (ms) => ms * TS;

  // MC (smarter): tap the correct option, then mark it.
  setTimeout(() => {
    const opt = q('#s9-val-smarter .mc-opt[data-correct]');
    if (!opt) return;
    opt.classList.add('s9-tap');
    setTimeout(() => {
      opt.classList.add('mc-correct');
      if (!opt.querySelector('.mc-icon')) {
        const ic = document.createElement('span');
        ic.className = 'mc-icon'; ic.textContent = '✓';
        opt.appendChild(ic);
      }
    }, 260);
  }, T(1100));

  // Sort (sharper): pop the order badges in one by one.
  qa('#s9-val-sharper .srt-row').forEach((row, i) => {
    setTimeout(() => {
      const n = row.querySelector('.srt-n');
      if (n) { n.textContent = String(i + 1); n.classList.add('srt-pop'); }
      row.classList.add('srt-lit');
      setTimeout(() => row.classList.remove('srt-lit'), 460);
    }, T(1000 + i * 430));
  });

  // Fill-blank (logo): reveal the answers one by one.
  qa('#s9-val-logo .fb-blank').forEach((b, i) => {
    setTimeout(() => {
      b.textContent = b.dataset.answer || '';
      b.classList.add('fb-show');
    }, T(1100 + i * 560));
  });

  // Sentence build: place the Chinese chips into the dropzone in order.
  const sbBank = q('#sb-bank'), sbDrop = q('#sb-drop'), sbBtn = q('#sb-btn');
  if (sbBank && sbDrop) {
    const chips = Array.from(sbBank.querySelectorAll('.sb-chip-bank'))
      .sort((a, b) => (+a.dataset.pos) - (+b.dataset.pos));
    chips.forEach((chip, i) => {
      setTimeout(() => {
        if (i === 0) sbDrop.innerHTML = '';
        chip.classList.add('s9-tap');
        setTimeout(() => {
          chip.classList.add('sb-used');
          const placed = document.createElement('span');
          placed.className = 'sb-chip-placed';
          placed.textContent = chip.textContent;
          sbDrop.appendChild(placed);
          if (i === chips.length - 1) {
            sbDrop.classList.add('sb-filled');
            if (sbBtn) {
              sbBtn.classList.add('sb-ready');
              setTimeout(() => {
                sbBtn.classList.add('s9-tap', 'sb-correct');
                sbBtn.textContent = 'Correct ✓';
              }, 520);
            }
          }
        }, 220);
      }, T(1300 + i * 720));
    });
  }

  // Categorize: tap the correct label, drop the chip into its bucket.
  qa('#cat-pool .cat-chip').forEach((chip, i) => {
    setTimeout(() => {
      const target = chip.dataset.cat;
      const btn = chip.querySelector('.cat-mini-btn[data-correct]');
      if (btn) btn.classList.add('cat-picked');
      setTimeout(() => {
        const bucket = grid.querySelector(`.cat-bucket[data-bucket="${target}"] .cat-bucket-items`);
        if (bucket) {
          const empty = bucket.querySelector('.cat-bucket-empty');
          if (empty) empty.remove();
          const item = document.createElement('div');
          item.className = 'cat-bucket-item cat-drop';
          item.textContent = chip.querySelector('span').textContent;
          bucket.appendChild(item);
        }
        chip.classList.add('cat-gone');
        setTimeout(() => { chip.style.display = 'none'; }, 420);
      }, 460);
    }, T(1200 + i * 1000));
  });

  // Matching: connect each country/capital pair in turn.
  ['1', '2', '3', '4'].forEach((p, i) => {
    setTimeout(() => {
      const items = qa(`.s9-match2 .match-item[data-pair="${p}"]`);
      items.forEach(it => it.classList.add('match-pick'));
      setTimeout(() => items.forEach(it => {
        it.classList.remove('match-pick');
        it.classList.add('match-done');
      }), 460);
    }, T(1150 + i * 820));
  });

  // Image guess: select the correct palace (page 1), then advance to a 2nd
  // question (Great Wall) that slides in from the right, and tap that too.
  // REVERSIBLE EDIT v16: starts earlier (was 2200/3550/4500) so the bottom-right
  // card isn't static at the open.
  setTimeout(() => {
    const opt = q('.s9-ig > .ig-options .ig-opt[data-correct]');
    if (!opt) return;
    opt.classList.add('s9-tap');
    setTimeout(() => opt.classList.add('ig-correct'), 260);
  }, T(1300));
  setTimeout(() => {
    const ig = q('.s9-ig');
    if (ig) ig.classList.add('ig-advanced');
  }, T(2900));
  setTimeout(() => {
    const opt = q('.s9-ig .ig-next .ig-opt[data-correct]');
    if (!opt) return;
    opt.classList.add('tap');
    setTimeout(() => opt.classList.add('ig-correct'), 260);
  }, T(4100));

  // Vocab (top-left): slide to a 2nd (茶) then a 3rd (山) vocab card.
  // REVERSIBLE EDIT v16: first slide pulled earlier (was 3000/5200).
  setTimeout(() => {
    const pager = q('#bv-pager');
    if (pager) pager.classList.add('bv-paged');
  }, T(1600));
  setTimeout(() => {
    const pager = q('#bv-pager');
    if (pager) pager.classList.add('bv-paged-2');
  }, T(4000));

  // Map (top-right): advance through 3 trivia tasks — Germany, Brazil, Canada.
  setTimeout(() => {
    const num = q('#mb-task-num'), qel = q('#mb-task-q');
    if (num) num.textContent = 'Question 2 / 3';
    if (qel) qel.textContent = 'Find the most biodiverse country on Earth.';
    const dots = qa('.s9-map2 .mb-dot-wrap');
    if (dots[1]) dots[1].classList.add('is-active');
    const fill = q('.s9-map2 .mb-line-fill');
    if (fill) fill.style.width = '50%';
    const globeEl = q('#s9-map-globe');
    if (globeEl && globeEl.__globeCtrl) globeEl.__globeCtrl.focusCountry('brazil', -12, -52, 2.5);
  }, T(1900));
  setTimeout(() => {
    const num = q('#mb-task-num'), qel = q('#mb-task-q');
    if (num) num.textContent = 'Question 3 / 3';
    if (qel) qel.textContent = 'Find the country with the most lakes.';
    const dots = qa('.s9-map2 .mb-dot-wrap');
    if (dots[2]) dots[2].classList.add('is-active');
    const fill = q('.s9-map2 .mb-line-fill');
    if (fill) fill.style.width = '100%';
    const globeEl = q('#s9-map-globe');
    if (globeEl && globeEl.__globeCtrl) globeEl.__globeCtrl.focusCountry('canada', 56, -100, 2.6);
  }, T(4300));
}

function animateNumber(sel, from, to, duration, suffix = '') {
  const el = $(sel);
  if (!el) return;
  const start = performance.now();
  function frame(t) {
    const p = Math.min(1, (t - start) / duration);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * ease) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
// ============================================================
// Recording via MediaRecorder + getDisplayMedia
// ============================================================
async function record() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 60, displaySurface: 'browser' },
      audio: false
    });
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 14_000_000
    });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'stacktags-promo.webm';
      a.click();
    };
    await sleep(500);
    recorder.start();
    await play();
    await sleep(400);
    recorder.stop();
  } catch (err) {
    alert('Recording cancelled or not supported.');
  }
}

// ============================================================
// Init
// ============================================================
buildTopicGrid();
buildSidebar();
buildCards();
buildS9Logos();

// Snapshot the pristine scene-9 grid AFTER logos are injected, so every
// replay restores the un-animated tiles (chips back in the bank, buckets
// empty, blanks hidden, nothing matched yet).
const s9GridPristine = $('#s9-grid').cloneNode(true);

// Clone Scene 4's Discover frame into Scene 3's backdrop so the picker
// sits over a real Discover view with ALL cards already populated.
// (No truncation — the user wants the full grid visible behind the picker.)
(function cloneDiscoverBackdrop() {
  const s4 = document.querySelector('#scene-4 .s4-frame');
  const host = document.querySelector('#s3-backdrop');
  if (!s4 || !host) return;
  host.innerHTML = '';
  host.classList.add('s-4');
  host.appendChild(s4.cloneNode(true));
})();

// ============================================================
// REVERSIBLE EDIT v3 — Scene-1 RIGHT panel (op3): animated leaderboard
// climb (you start last and slide up over everyone) + a chart that grows
// from a 1-week view to a 1-month view (more days enter from the right).
// To revert the panel entirely, see the <template> in index.html.
// ============================================================
const OP3_ROW_H = 46;     // px per leaderboard slot
const OP3_VISIBLE = 7;    // rows visible in the board window
let op3State = [];
let op3Timer = null, op3Raf = null;

const OP3_PLAYERS = [
  // REVERSIBLE EDIT v7: real Stacktags characters w/ uploaded avatar art
  // (name → image mapping from the user's reference screenshots).
  { n: 'Pondering Professor', img: 'assets/chars/professor.png',         xp: 2480 },
  { n: 'Crazy Chemist',       img: 'assets/chars/chemics_professor.png', xp: 2360 },
  { n: 'Spicy Spaceman',      img: 'assets/chars/astronaut.png',         xp: 2240 },
  { n: 'Fishy Financier',     img: 'assets/chars/bald_suit.png',         xp: 2120 },
  { n: 'Top Gun',             img: 'assets/chars/fighter_pilot.png',     xp: 1990 },
  { n: 'Bio Hazard',          img: 'assets/chars/biochemist.png',        xp: 1870 },
  { n: 'Salty Skipper',       img: 'assets/chars/sailor.png',            xp: 1740 },
  { n: 'Bumbling Bubbles',    img: 'assets/chars/diver.png',             xp: 1610 },
  { n: 'Daring Diver',        img: 'assets/chars/clumsy_diver.png',      xp: 1470 },
  { n: 'Eager Explorer',      img: 'assets/chars/explorer.png',          xp: 1330 },
  { n: 'Clumsy Croissant',    img: 'assets/chars/anxious_cook.png',      xp: 1180 },
  { n: 'tim (You)',           me: true,                                  xp: 980  },
];

// Chart data — 28 days. User climbs steadily and crosses above the
// (steadier) community average; values are 0..100 (higher = better).
const OP3_DAYS = 28;
const op3User = [], op3Comm = [];
(function genOp3Data() {
  let u = 16;
  for (let i = 0; i < OP3_DAYS; i++) {
    u += 2.3 + Math.sin(i * 0.6) * 1.5 + (Math.sin(i * 2.3) * 1.1);
    op3User.push(Math.max(6, Math.min(96, u)));
    op3Comm.push(46 + Math.sin(i * 0.5) * 5 + Math.cos(i * 1.3) * 2);
  }
})();

function op3Y(val) { return 122 - (val / 100) * 108; }

function renderOp3Axis(span) {
  const ax = $('#op3-axis'); if (!ax) return;
  let labels;
  if (span <= 9.2) {
    labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  } else {
    const total = Math.round(span);
    labels = [];
    for (let k = 0; k < 5; k++) labels.push(String(Math.max(1, Math.round(total * k / 4) || 1)));
    labels[0] = '1';
  }
  ax.innerHTML = labels.map(l => '<span>' + l + '</span>').join('');
}

function renderOp3Chart(span) {
  const line = $('#op3-line'), comm = $('#op3-comm'), fill = $('#op3-fill');
  if (!line) return;
  const W = 280;
  const n = Math.max(2, Math.min(OP3_DAYS, Math.round(span)));
  const denom = Math.max(1, span - 1);
  const pUser = [], pComm = []; let lastX = 0;
  for (let i = 0; i < n; i++) {
    const x = (i / denom) * W;
    pUser.push(x.toFixed(1) + ',' + op3Y(op3User[i]).toFixed(1));
    pComm.push(x.toFixed(1) + ',' + op3Y(op3Comm[i]).toFixed(1));
    lastX = x;
  }
  line.setAttribute('points', pUser.join(' '));
  comm.setAttribute('points', pComm.join(' '));
  if (fill) fill.setAttribute('d', 'M' + pUser.join(' L') + ' L' + lastX.toFixed(1) + ',130 L0,130 Z');
  renderOp3Axis(span);
  const r = $('#op3-range'); if (r) r.textContent = span < 10.5 ? '1W' : (span < 21 ? '3W' : '1M');
}

function sortAndPlaceOp3() {
  const inner = $('#op3-board-inner'); if (!inner) return;
  const sorted = [...op3State].sort((a, b) => b.xp - a.xp);
  let youRank = 0;
  sorted.forEach((p, idx) => {
    if (p.el) {
      p.el.style.transform = 'translateY(' + (idx * OP3_ROW_H) + 'px)';
      const rn = p.el.querySelector('.op3-rank-n');
      if (rn) rn.innerHTML = (p.me && p._arrow ? '<span class="op3-arrow">↑</span>' : '') + (idx + 1);
      const xpEl = p.el.querySelector('.op3-xp-pts');
      if (xpEl) xpEl.textContent = Math.round(p.xp).toLocaleString('en-US');
    }
    if (p.me) youRank = idx;
  });
  const maxScroll = Math.max(0, op3State.length - OP3_VISIBLE);
  const scrollIndex = Math.max(0, Math.min(maxScroll, youRank - 3));
  inner.style.transform = 'translateY(' + (-scrollIndex * OP3_ROW_H) + 'px)';
}

function buildOp3Board(finalState) {
  const inner = $('#op3-board-inner'); if (!inner) return;
  cancelOp3();
  inner.innerHTML = '';
  op3State = OP3_PLAYERS.map(p => ({ ...p }));
  if (finalState) { const y = op3State.find(p => p.me); if (y) { y.xp = 2600; y._arrow = false; } }
  op3State.forEach(p => {
    const row = document.createElement('div');
    row.className = 'op3-row' + (p.me ? ' op3-me' : '');
    // REVERSIBLE EDIT v7: character art used as a cover BACKGROUND image on the
    // round avatar; "you" stays a teal initial; coloured initial as fallback.
    const avInner = p.img ? '' : (p.me ? 'T' : p.n[0]);
    let avStyle = '';
    if (p.img) avStyle = ' style="background-image:url(' + p.img + ');background-size:cover;background-position:center"';
    else if (!p.me && p.col) avStyle = ' style="background:' + p.col + ';color:#fff"';
    row.innerHTML =
      '<div class="op3-rank-n"></div>' +
      '<div class="op3-av' + (p.me ? ' op3-av-me' : '') + '"' + avStyle + '>' + avInner + '</div>' +
      '<div class="op3-name">' + p.n + '</div>' +
      '<div class="op3-xp-pts"></div>';
    inner.appendChild(row);
    p.el = row;
  });
  // Place instantly (no transition) for the initial frame.
  inner.style.transition = 'none';
  op3State.forEach(p => { if (p.el) p.el.style.transition = 'none'; });
  sortAndPlaceOp3();
  void inner.offsetWidth;            // force reflow
  inner.style.transition = '';
  op3State.forEach(p => { if (p.el) p.el.style.transition = ''; });
  renderOp3Chart(finalState ? OP3_DAYS : 7);
  // XP progress bar + number (REVERSIBLE EDIT v4: now fills dynamically).
  const bar0 = document.querySelector('.op3 .op3-xp-bar-fill');
  if (bar0) { bar0.style.transition = 'none'; bar0.style.width = finalState ? '82%' : '18%'; }
  const num0 = document.querySelector('.op3 .op3-xp-num');
  if (num0) num0.textContent = (finalState ? '2,480' : '540') + ' / 3,000 XP';
}

function cancelOp3() {
  if (op3Timer) { clearInterval(op3Timer); op3Timer = null; }
  if (op3Raf) { cancelAnimationFrame(op3Raf); op3Raf = null; }
}

function animateOp3() {
  buildOp3Board(false);
  cancelOp3();
  const me = op3State.find(p => p.me); if (!me) return;
  // Time-based interval drives the leaderboard climb (last → #1), the chart
  // growth (1 week → 1 month, evenly across 7→28) and the XP bar fill. An
  // interval (not rAF) so it still advances + lands on the end state even if
  // the tab is briefly backgrounded.
  const startXp = 980, endXp = 2600, dur = 1950, t0 = performance.now();
  const easeInOut = t => (t < .5) ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const bar = document.querySelector('.op3 .op3-xp-bar-fill');
  const xpNum = document.querySelector('.op3 .op3-xp-num');
  if (bar) bar.style.transition = 'width .12s linear';
  me._arrow = true;
  op3Timer = setInterval(() => {
    const p = Math.min(1, (performance.now() - t0) / dur);
    me.xp = startXp + (endXp - startXp) * easeInOut(p);
    if (p >= 1) me._arrow = false;
    sortAndPlaceOp3();
    renderOp3Chart(7 + (OP3_DAYS - 7) * easeInOut(p));   // 7 → 28, evenly visible
    const e = easeOut(p);
    if (bar) bar.style.width = (18 + (82 - 18) * e).toFixed(1) + '%';
    if (xpNum) xpNum.textContent = Math.round(540 + (2480 - 540) * e).toLocaleString('en-US') + ' / 3,000 XP';
    if (p >= 1) { clearInterval(op3Timer); op3Timer = null; }
  }, 40);
}

// ---- op1 (left): "tap" the correct answer a beat after the card appears ----
let op1Timers = [];
function resetOp1() {
  op1Timers.forEach(t => clearTimeout(t)); op1Timers = [];
  $$('.op1-opt').forEach(b => b.classList.remove('op1-picked', 'op1-tap'));
  const op1 = document.querySelector('.op1'); if (op1) op1.classList.remove('op1-paged');
}
function animateOp1() {
  resetOp1();
  const opts = $$('.op1-page .op1-opt.op1-correct');   // [page1 correct, page2 correct]
  const op1 = document.querySelector('.op1');
  // 1. tap the correct answer on page 1
  op1Timers.push(setTimeout(() => { if (opts[0]) opts[0].classList.add('op1-tap', 'op1-picked'); }, 820));
  // 2. slide up to the 2nd card (REVERSIBLE EDIT v9: a tick earlier, was 2300)
  op1Timers.push(setTimeout(() => { if (op1 && !cancelPlay) op1.classList.add('op1-paged'); }, 1950));
  // 3. tap the correct answer on page 2
  op1Timers.push(setTimeout(() => { if (opts[1] && !cancelPlay) opts[1].classList.add('op1-tap', 'op1-picked'); }, 3050));
}

// ---- op2 (middle): gentle auto-scroll of the card grid after a short delay ----
let op2Timer = null;
function resetOp2() {
  if (op2Timer) { clearTimeout(op2Timer); op2Timer = null; }
  const g = $('#op2-grid-inner');
  if (g) { g.style.transition = 'none'; g.style.transform = 'translateY(0)'; }
}
function animateOp2() {
  resetOp2();
  const g = $('#op2-grid-inner'); if (!g) return;
  op2Timer = setTimeout(() => {
    // REVERSIBLE EDIT v8: longer travel + duration so the scroll is STILL
    // accelerating when it freezes at the morph (no early stop). (v6b was 2.2s
    // → -480px). Still a hard ease-in.
    g.style.transition = 'transform 4s cubic-bezier(.55, 0, 1, 1)';
    g.style.transform = 'translateY(-640px)';
  }, 650);
}
// Freeze the middle-panel scroll wherever it is (called the instant the
// panels start collapsing into the logo stack).
function freezeOp2() {
  if (op2Timer) { clearTimeout(op2Timer); op2Timer = null; }
  const g = $('#op2-grid-inner'); if (!g) return;
  const cur = getComputedStyle(g).transform;
  g.style.transition = 'none';
  if (cur && cur !== 'none') g.style.transform = cur;
}

// ---- Smooth left-to-right "wipe" reveal for the scene-1 captions
//      (REVERSIBLE EDIT v8: replaces the per-character typewriter). ----
function wipeReveal(el, html, dur) {
  if (!el) return;
  el.style.display = 'inline-block';
  el.style.paddingRight = '2px';
  el.innerHTML = html;
  el.style.transition = 'none';
  el.style.webkitClipPath = el.style.clipPath = 'inset(0 100% 0 0)';
  void el.offsetWidth;
  const t = 'clip-path ' + dur + 'ms cubic-bezier(.45,0,.12,1), -webkit-clip-path ' + dur + 'ms cubic-bezier(.45,0,.12,1)';
  el.style.transition = t;
  el.style.webkitClipPath = el.style.clipPath = 'inset(0 -8px 0 0)';
}
function revealCapBar(dur) {
  const bar = $('#s1-cap-bar'), fill = $('#s1-cap-bar-fill');
  if (!bar || !fill) return;
  bar.style.opacity = '1';
  fill.style.transition = 'none'; fill.style.width = '0';
  void fill.offsetWidth;
  fill.style.transition = 'width ' + dur + 'ms cubic-bezier(.45,0,.12,1)';
  fill.style.width = '100%';
}
function resetCaps() {
  ['#s1-cap', '#s1-cap-top'].forEach(id => {
    const el = $(id);
    if (el) { el.innerHTML = ''; el.style.clipPath = el.style.webkitClipPath = ''; el.style.transition = 'none'; el.style.display = ''; }
  });
  const bar = $('#s1-cap-bar'), fill = $('#s1-cap-bar-fill');
  if (bar) bar.style.opacity = '0';
  if (fill) { fill.style.transition = 'none'; fill.style.width = '0'; }
}

// Initial build so the panel reads correctly before/without playback.
buildOp3Board(false);

// Wire HUD
$('#play').addEventListener('click', play);
$('#reset').addEventListener('click', reset);
$('#record').addEventListener('click', record);
$('#prev').addEventListener('click', () => {
  if (currentScene > 1) jumpTo(currentScene - 1);
  else if (currentScene === 0) jumpTo(1);
});
$('#next').addEventListener('click', () => {
  const order = [1, 3, 4, 5, 9];
  const idx = order.indexOf(currentScene);
  if (idx >= 0 && idx < order.length - 1) jumpTo(order[idx + 1]);
  else if (currentScene === 0) jumpTo(1);
});

function jumpTo(n) {
  cancelPlay = true;
  playing = false;
  typewriters.forEach(t => t.cancel());
  // Set scene flags to "settled" state for inspection
  if (n === 1) {
    $('#scene-1').classList.remove('intro-on');
    $('#scene-1').classList.add('bg-white');
    $('#morph-1').classList.add('rise');
    $('#morph-2').classList.add('rise');
    $('#morph-3').classList.add('rise');
    $$('#scene-1 .s1-word').forEach(el => el.classList.remove('show'));
    const s1stg2 = $('#s1-stage');
    if (s1stg2) s1stg2.classList.add('morph', 'cap-in', 'chev-in', 'settled', 'brand-in');
    { const cap = $('#logo-cap'); if (cap) cap.style.opacity = ''; }   // restore lifted top layer
    buildOp3Board(true);   // show the right panel in its finished state
    { const op1 = document.querySelector('.op1'); if (op1) op1.classList.add('op1-paged'); const cs = document.querySelectorAll('.op1-page .op1-opt.op1-correct'); cs.forEach(c => c.classList.add('op1-picked')); }
    { const g = $('#op2-grid-inner'); if (g) { g.style.transition = 'none'; g.style.transform = 'translateY(-150px)'; } }
    /* REVERSIBLE EDIT: was 'but for learning.' */
    $('#s1-cap-top').innerHTML = 'everything - for learning.';
    document.querySelector('.s1-caption-bot').classList.add('show');
    $('#s1-cap').innerHTML = 'The most <span class="s1-accent">competitive</span> learning app <span class="s1-accent">in the world</span>.';
    // wipe captions fully revealed + bar filled for the static jump state
    ['#s1-cap', '#s1-cap-top'].forEach(id => { const e = $(id); if (e) { e.style.clipPath = e.style.webkitClipPath = 'inset(0 -8px 0 0)'; e.style.display = 'inline-block'; } });
    { const bar = $('#s1-cap-bar'), fill = $('#s1-cap-bar-fill'); if (bar) bar.style.opacity = '1'; if (fill) { fill.style.transition = 'none'; fill.style.width = '100%'; } }
  }
  if (n === 3) {
    ['history','arabic','cooking','computer_science'].forEach(s => {
      const t = $(`.tp-tile[data-slug="${s}"]`); if (t) t.classList.add('tp-selected');
    });
    stage.classList.remove('picker-out', 'morph-lift');
    stage.classList.add('picker-in');
  } else {
    stage.classList.remove('picker-in', 'morph-lift');
  }
  if (n === 4) {
    $('#scene-4').classList.remove('zoom-out');
    $('#s4-cap').textContent = 'Then start discovering.';
  }
  if (n === 5) {
    $('#scene-5').classList.remove('stage-1', 'stage-3', 'kw-out');
    $('#scene-5').classList.add('stage-4', 'kw-in');
    $$('#scene-5 .trio-col').forEach(el => el.classList.add('in'));
    // Show a representative settled state: correct feed answer + revealed chart.
    $$('.feed-mob .feed-mc-opt').forEach(el => el.classList.remove('tap'));
    const fc = $$('.feed-mob .feed-mc-opt').find(o => o.dataset.correct === 'true');
    if (fc) fc.classList.add('correct');
    const qgFill = $('.qg-progress-fill'); if (qgFill) { qgFill.style.transition = 'none'; qgFill.style.width = '0'; }
    const progRect = $('#prog-reveal-rect'); if (progRect) progRect.setAttribute('width', '280');
  }
  if (n === 9) {
    const s9j = $('#scene-9');
    s9j.classList.remove('finale');
    $$('#scene-9 .s9-value').forEach(el => el.classList.add('switched'));
    initGlobe();
    animateS9Tiles();
  }
  if (n !== 1) {
    $('#scene-1').classList.remove('intro-on', 'bg-white');
  }
  setScene(n);
  done();
}

// Expose for debugging
window.__promo = { play, reset, jumpTo, record };