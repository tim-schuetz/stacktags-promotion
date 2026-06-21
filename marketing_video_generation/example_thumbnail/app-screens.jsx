// app-screens.jsx — reusable stacktags brand + app-UI pieces for thumbnails.
// Exports to window: StackLogo, Wordmark, Phone, FeedScreen, GameScreen,
// ProgressScreen, RisingChart, Chevrons.

const TEAL    = '#3EAE93';
const TEAL_APP= '#46AC94';   // exact app chart/teal
const TEAL_D  = '#2C8F76';
const TEAL_DD = '#0f4f42';
const WHITE   = '#ffffff';
const WHITE_D = '#dceae5';
const STROKE  = '#1d2225';

/* ---------- Iso-stack logo (exact video geometry) ---------- */
function isoLayer(cy, depth) {
  const cx = 260, hw = 240, hh = 120;
  return {
    top:   `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`,
    left:  `${cx - hw},${cy} ${cx},${cy + hh} ${cx},${cy + hh + depth} ${cx - hw},${cy + depth}`,
    right: `${cx},${cy + hh} ${cx + hw},${cy} ${cx + hw},${cy + depth} ${cx},${cy + hh + depth}`,
  };
}
function StackLogo({ height = 360, glow = false }) {
  const layers = [
    { cy: 360, top: WHITE, left: WHITE_D, right: TEAL,   depth: 42 },
    { cy: 280, top: TEAL,  left: TEAL_D,  right: WHITE,  depth: 42 },
    { cy: 200, top: WHITE, left: WHITE_D, right: TEAL,   depth: 42 },
    { cy: 120, top: TEAL,  left: TEAL_D,  right: TEAL_D, depth: 42 },
  ].map(l => ({ ...l, p: isoLayer(l.cy, l.depth) }));
  const sw = 3.2;
  return (
    <svg viewBox="0 0 520 540" height={height} style={{ display: 'block', overflow: 'visible',
      filter: glow ? 'drop-shadow(0 0 55px rgba(62,174,147,.5)) drop-shadow(0 22px 40px rgba(0,0,0,.4))'
                   : 'drop-shadow(0 18px 30px rgba(20,40,32,.18))' }}>
      {layers.map((l, i) => (
        <g key={i}>
          <polygon points={l.p.left}  fill={l.left}  stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />
          <polygon points={l.p.right} fill={l.right} stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />
          <polygon points={l.p.top}   fill={l.top}   stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
}

function Wordmark({ size = 120, onDark = false, tagColor }) {
  return (
    <div style={{ fontFamily: "'Nunito', system-ui, sans-serif", fontWeight: 900, lineHeight: 1,
        letterSpacing: '-0.04em', whiteSpace: 'nowrap', fontSize: size }}>
      <span style={{ color: onDark ? '#fff' : '#141a1e' }}>stack</span>
      <span style={{ color: tagColor || TEAL }}>tags</span>
    </div>
  );
}

function Chevrons({ color = TEAL, h = 120, gap = 560 }) {
  const Ch = ({ flip }) => (
    <svg viewBox="0 0 100 200" height={h} style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path d="M 70 24 L 22 100 L 70 176" fill="none" stroke={color} strokeWidth="20"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap, pointerEvents: 'none' }}>
      <Ch /><Ch flip />
    </div>
  );
}

/* ---------- Phone bezel ---------- */
function Phone({ w = 320, h = 680, children, style }) {
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.15, background: '#0b1310',
        padding: w * 0.035, boxShadow: '0 50px 90px rgba(8,24,18,.45), 0 0 0 2px rgba(255,255,255,.05)',
        flexShrink: 0, ...style }}>
      <div style={{ width: '100%', height: '100%', borderRadius: w * 0.115, overflow: 'hidden',
          position: 'relative', background: '#000' }}>
        {children}
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: w * 0.32, height: w * 0.075, background: '#000', borderRadius: 99, zIndex: 40 }} />
      </div>
    </div>
  );
}

const TabBar = ({ accent = TEAL }) => {
  const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.1, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const off = '#aeb8b3';
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, background: '#fff',
        borderTop: '1px solid #eef2f1', display: 'flex', alignItems: 'center',
        justifyContent: 'space-around', padding: '0 18px', zIndex: 6 }}>
      {/* stats / bar chart */}
      <svg viewBox="0 0 24 24" width="23" height="23" style={{ color: off }} {...base}>
        <line x1="5" y1="20" x2="5" y2="13" /><line x1="12" y1="20" x2="12" y2="8" /><line x1="19" y1="20" x2="19" y2="4" /></svg>
      {/* stacked layers — active (teal) */}
      <svg viewBox="0 0 24 24" width="24" height="24" style={{ color: accent }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M12 3 21 8 12 13 3 8 12 3Z" /><path d="M3 12 12 17 21 12" /><path d="M3 16 12 21 21 16" /></svg>
      {/* search */}
      <svg viewBox="0 0 24 24" width="23" height="23" style={{ color: off }} {...base}>
        <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.7" y2="16.7" /></svg>
      {/* friends / people */}
      <svg viewBox="0 0 24 24" width="24" height="24" style={{ color: off }} {...base}>
        <circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <circle cx="17" cy="8.5" r="2.6" /><path d="M16 13.4a4.8 4.8 0 0 1 4.5 5" /></svg>
      {/* profile avatar (far right) */}
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: accent, color: '#fff',
          fontSize: 12, fontWeight: 800, display: 'grid', placeItems: 'center' }}>T</div>
    </div>
  );
};

/* ---------- Feed screen (vocab MC card) ---------- */
function FeedScreen({
    prompt = 'shirt / blouse', optShift = 0,
    label = 'Chinese HSK 2', labelInitial = 'C',
    img = 'assets/q-shirt.png', imgAlt = 'shirt', imgScale = 1,
    options = [['衬衫 (chèn shān)', true], ['裙子 (qún zi)', false], ['外套 (wài tào)', false]]
  }) {
  const opt = (txt, correct, key) => (
    <div key={key} style={{ width: '100%', textAlign: 'center', padding: '11px 14px', borderRadius: 14,
        background: correct ? TEAL : 'rgba(255,255,255,.96)', color: correct ? '#fff' : '#111',
        fontSize: 15, fontWeight: 700, boxShadow: '0 2px 10px rgba(0,0,0,.18)' }}>{txt}</div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, color: '#fff',
        background: 'linear-gradient(180deg, #0f4f42 0%, #16695a 60%, #1a7d6c 100%)',
        display: 'flex', flexDirection: 'column' }}>
      {/* folder chip */}
      <div style={{ position: 'absolute', top: 20, left: 14, display: 'inline-flex', alignItems: 'center',
          gap: 9, padding: '5px 16px 5px 5px', borderRadius: 999, background: 'rgba(0,0,0,.4)',
          fontSize: 15, fontWeight: 700, zIndex: 5 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: TEAL_D, display: 'grid',
            placeItems: 'center', fontSize: 15, fontWeight: 800 }}>{labelInitial}</div>
        {label}
      </div>
      {/* content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 11, padding: '56px 22px 60px' }}>
        <div style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.75)' }}>Translation</div>
        <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,.25)' }}>
          {prompt}</div>
        <div style={{ width: '100%', background: '#fff', borderRadius: 16, padding: 10, overflow: 'hidden',
            boxShadow: '0 8px 22px rgba(0,0,0,.28)', display: 'flex', justifyContent: 'center' }}>
          <img src={img} alt={imgAlt} style={{ width: '100%', height: 120,
            objectFit: 'contain', borderRadius: 6, transform: 'scale(' + imgScale + ')' }} />
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2,
            transform: 'translateX(' + optShift + 'px)' }}>
          {options.map((o, i) => opt(o[0], o[1], i))}
        </div>
      </div>
      <TabBar />
    </div>
  );
}

/* ---------- Game screen (competition leaderboard) ---------- */
function GameScreen() {
  const row = (rank, img, name, delta, total, me) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12,
        background: me ? TEAL : '#fff', color: me ? '#fff' : '#16202b',
        boxShadow: me ? '0 6px 16px rgba(62,174,147,.4)' : '0 2px 8px rgba(0,0,0,.06)' }}>
      <div style={{ width: 22, fontWeight: 800, fontSize: 16, opacity: .9 }}>{rank}</div>
      <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', background: me ? 'rgba(255,255,255,.25)' : '#e7efec',
          display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14 }}>
        {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'T'}</div>
      <div style={{ flex: 1, fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden',
          textOverflow: 'ellipsis' }}>{name}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: me ? '#eafff7' : TEAL }}>{delta}</div>
      <div style={{ fontSize: 16, fontWeight: 800, width: 30, textAlign: 'right' }}>{total}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef3f1', display: 'flex', flexDirection: 'column' }}>
      {/* black header */}
      <div style={{ background: '#0c1411', padding: '40px 16px 16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>
          {['assets/professor.png', null, 'assets/anxious_cook.png', 'assets/bald_suit.png'].map((s, i) => (
            <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden',
                marginLeft: i ? -8 : 0, border: '2px solid ' + (i===1 ? TEAL : '#0c1411'),
                background: i===1 ? TEAL : '#2a3a34', display: 'grid', placeItems: 'center',
                color: '#fff', fontWeight: 800, fontSize: 15 }}>
              {s ? <img src={s} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'T'}</div>
          ))}
        </div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>3/10</div>
      </div>
      <div style={{ height: 5, background: '#d4dcd9' }}><div style={{ width: '32%', height: '100%', background: TEAL }} /></div>
      {/* question image */}
      <div style={{ margin: '14px 16px 0', height: 150, borderRadius: 14, backgroundImage: 'url(assets/q-potala.png)',
          backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 6px 18px rgba(0,0,0,.15)' }} />
      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 18, color: '#16202b', margin: '12px 0 6px' }}>Which landmark?</div>
      {/* answer */}
      <div style={{ margin: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
          borderRadius: 12, background: TEAL, color: '#fff', boxShadow: '0 6px 16px rgba(62,174,147,.4)' }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,.25)', display: 'grid',
            placeItems: 'center', fontWeight: 800 }}>B</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Potala Palace</div>
      </div>
      {/* leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
        {row('1', 'assets/professor.png', 'Pondering Prof…', '+15', 42, false)}
        {row('2', null, 'tim (You)', '+13', 38, true)}
        {row('3', 'assets/anxious_cook.png', 'Clumsy Croissant', '+8', 22, false)}
      </div>
    </div>
  );
}

/* ---------- Rising chart (area + line) — app's progress chart styling ----------
   p0..p1 across [0,1]; rises from lower-left to upper-right. Fill fades down. */
function RisingChart({ width = 900, height = 520, stroke = TEAL_APP, sw = 7, dots = true, id = 'rc', x0 = 0.04, x1 = 0.96 }) {
  const W = width, H = height;
  // control points (normalized) rising bottom-left → top-right with gentle ease
  const ys = [0.86, 0.8, 0.66, 0.6, 0.42, 0.3, 0.12];
  const xs = ys.map((_, i) => x0 + (i / (ys.length - 1)) * (x1 - x0));
  const pts = xs.map((x, i) => [x * W, ys[i] * H]);
  // smooth path (Catmull-Rom → bezier)
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  const area = `${d} L ${pts[pts.length-1][0]},${H} L ${pts[0][0]},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={id + '-fill'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.34" />
          <stop offset="55%" stopColor={stroke} stopOpacity="0.12" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id}-fill)`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {dots && pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1).map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={sw * 1.5} fill="#fff" stroke={stroke} strokeWidth={sw * 0.7} />
      ))}
    </svg>
  );
}

/* ---------- Progress screen (mini, for phone) ---------- */
function ProgressScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f4f7f6', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '56px 16px 8px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <StackLogo height={28} />
        <Wordmark size={27} />
      </div>
      {/* XP card */}
      <div style={{ margin: '9px 16px', background: '#fff', borderRadius: 16, padding: 14, display: 'flex',
          alignItems: 'center', gap: 14, boxShadow: '0 4px 14px rgba(0,0,0,.05)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'conic-gradient(' + TEAL_APP + ' 70%, #e9efed 0)',
            display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'grid',
              placeItems: 'center', fontWeight: 800, color: '#16202b' }}>1</div></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: '#16202b', fontSize: 17 }}>Level 1</div>
          <div style={{ height: 8, borderRadius: 99, background: '#e9efed', marginTop: 7 }}>
            <div style={{ width: '38%', height: '100%', borderRadius: 99, background: TEAL_APP }} /></div>
          <div style={{ fontSize: 13, color: '#6b7680', marginTop: 5 }}>111 / 1000 XP</div>
        </div>
      </div>
      {/* line chart card */}
      <div style={{ margin: '9px 16px', background: '#fff', borderRadius: 16, padding: '14px 2px 10px 14px',
          boxShadow: '0 4px 14px rgba(0,0,0,.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: 12 }}>
          <div style={{ fontWeight: 800, color: '#16202b', fontSize: 15 }}>Minutes learned</div>
          <div style={{ fontWeight: 800, color: TEAL_APP, fontSize: 15 }}>1,240 min</div>
        </div>
        <div style={{ height: 104, marginTop: 8, overflow: 'hidden' }}>
          <RisingChart width={206} height={104} sw={4} dots={false} id="prog-mini" x0={0.02} x1={1.0} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9aa4a0', fontSize: 12, fontWeight: 600, paddingRight: 8 }}>
          <span>W1</span><span>W2</span><span>W3</span><span>W4</span></div>
      </div>
      {/* donut row */}
      <div style={{ margin: '9px 16px', background: '#fff', borderRadius: 16, padding: 14, display: 'flex',
          alignItems: 'center', gap: 16, boxShadow: '0 4px 14px rgba(0,0,0,.05)' }}>
        <div style={{ flexShrink: 0, width: 68, height: 68, borderRadius: '50%',
            background: `conic-gradient(${TEAL_APP} 0 48%, #c7d3cf 48% 80%, #eef4f1 80% 100%)`,
            display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 43, height: 43, borderRadius: '50%', background: '#fff', display: 'grid',
              placeItems: 'center', fontWeight: 800, color: '#16202b', fontSize: 14 }}>28d</div></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 700, color: '#46505a' }}>
          <div><span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: TEAL_APP, marginRight: 8 }} />Vocab · 48%</div>
          <div><span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: '#c7d3cf', marginRight: 8 }} />Quizzes · 32%</div>
          <div><span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: '#eef4f1', marginRight: 8 }} />Games · 20%</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Stock-style jagged rising line (area + line, no dots) ----------
   Overall trends up from a low-left start to an off-frame right exit, with
   stock-chart-like jitter. Fill fades downward. */
function StockChart({ width = 1280, height = 560, stroke = TEAL, sw = 7,
    startX = 0.16, startY = 0.99, endY = 0.16, id = 'sc' }) {
  const W = width, H = height, N = 30;
  let seed = 1337;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const x = startX + t * (1 - startX);
    const trend = startY + t * (endY - startY);
    const amp = 0.12 * (1 - t * 0.25);
    let y = trend + (rnd() - 0.5) * 2 * amp;
    y = Math.max(0.04, Math.min(1, y));
    pts.push([x * W, y * H]);
  }
  pts[0] = [startX * W, H * 0.995];     // anchor: bottom edge, left side
  pts[N - 1] = [W, endY * H];           // anchor: exits the right edge
  const line = 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L');
  const area = line + ' L ' + W + ',' + H + ' L ' + (startX * W).toFixed(1) + ',' + H + ' Z';
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={id + '-fill'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.30" />
          <stop offset="55%" stopColor={stroke} stopOpacity="0.10" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={'url(#' + id + '-fill)'} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

Object.assign(window, { StackLogo, Wordmark, Chevrons, Phone, FeedScreen, GameScreen, ProgressScreen, RisingChart, StockChart,
  TEAL, TEAL_APP, TEAL_D, TEAL_DD });
