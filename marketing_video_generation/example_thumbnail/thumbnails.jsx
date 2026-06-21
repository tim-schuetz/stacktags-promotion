/* ============================================================
   Thumbnail compositions (A, E, F, G) — shared by the gallery
   (Thumbnail.html) and the single-frame export page (Export.html).
   Relies on globals from app-screens.jsx (StackLogo, Wordmark, Phone,
   FeedScreen, ProgressScreen, RisingChart, StockChart) and svg_globe.js.
   ============================================================ */

const MOTTO_PARTS = ['The most ', 'competitive', ' learning app in the world'];

// Motto on light bg, two lines
function Motto({ size = 32, onDark = false }) {
  const base = onDark ? 'rgba(255,255,255,.92)' : '#46535d';
  return (
    <div style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.12, color: base }}>
      The most <span className="accent">competitive</span><br/>learning app in the world
    </div>
  );
}

/* Static orthographic SVG globe centred on Brazil (vector, integrated) */
function SvgGlobe({ size = 340 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let tries = 0;
    const t = setInterval(() => {
      if (window.mountSvgGlobe && window.topojson) {
        clearInterval(t);
        try { window.mountSvgGlobe(ref.current, { size, highlight: 'brazil', lon0: -55, lat0: -8 }); } catch (e) {}
      } else if (++tries > 200) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, [size]);
  return <div ref={ref} style={{ width: size, height: size }} />;
}

/* ============ A — Light, Feed phone ============ */
function ThumbA() {
  return (
    <div className="thumb" style={{ background: '#ffffff' }}>
      {/* rising chart — sweeps up to the right, fill fades downward */}
      <div style={{ position: 'absolute', left: 56, bottom: 0, width: 880, height: 366 }}>
        <RisingChart width={880} height={366} stroke="#3EAE93" sw={9} dots id="chartA" />
      </div>
      {/* heading top-left: logo LEFT of the wordmark */}
      <div style={{ position: 'absolute', left: 88, top: 70,
          display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <StackLogo height={138} />
          <Wordmark size={116} />
        </div>
        <Motto size={34} />
      </div>
      {/* feed phone right */}
      <div style={{ position: 'absolute', right: 96, top: 152, transform: 'rotate(-6deg)' }}>
        <Phone w={284} h={548}><FeedScreen /></Phone>
      </div>
    </div>
  );
}

/* ============ E — Most. Competitive. Learning. (C-based) ============ */
function ThumbE() {
  return (
    <div className="thumb" style={{ background: '#f4f7f6', display: 'flex', overflow: 'hidden' }}>
      {/* left text: headline + logo/wordmark below */}
      <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 40px 0 72px', gap: 26, position: 'relative', zIndex: 4 }}>
        <h1 className="hl" style={{ fontSize: 92, lineHeight: 0.96 }}>
          Most.<br/><span className="accent">Competitive.</span><br/>Learning.
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <StackLogo height={70} />
          <Wordmark size={64} />
        </div>
      </div>
      {/* right teal panel with Feed phone */}
      <div style={{ width: 520, position: 'relative', flexShrink: 0,
          background: 'linear-gradient(160deg, #3EAE93, #0d6e54)',
          clipPath: 'polygon(16% 0, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="glow" style={{ width: 560, height: 560, left: 60, top: 70,
          background: 'radial-gradient(circle, rgba(255,255,255,.22), rgba(255,255,255,0) 62%)' }} />
        <div style={{ position: 'absolute', right: 52, top: '50%',
            transform: 'translateY(-38%) rotate(6deg)' }}>
          <Phone w={284} h={560}><FeedScreen /></Phone>
        </div>
      </div>
      {/* Japanese image, upper-right on the light area */}
      <div style={{ position: 'absolute', right: 486, top: 30, width: 200, transform: 'rotate(8deg)',
          zIndex: 6, filter: 'drop-shadow(0 16px 30px rgba(20,40,32,.20))' }}>
        <img src="assets/japanese_cut.png" alt="Japanese" style={{ width: '100%', display: 'block' }} />
      </div>
      {/* globe, bottom-left */}
      <div style={{ position: 'absolute', left: 232, bottom: -140, zIndex: 1 }}>
        <SvgGlobe size={300} />
      </div>
    </div>
  );
}

/* ============ F — Rising chart variant ============ */
function ThumbF() {
  return (
    <div className="thumb" style={{ background: '#f4f7f6', overflow: 'hidden' }}>
      {/* stock-style rising line — starts at the bottom-left edge, exits off the right */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1280, height: 580, zIndex: 1 }}>
        <StockChart width={1280} height={580} stroke="#3EAE93" sw={7} startX={0.16} startY={0.99} endY={0.14} id="chartF" />
      </div>
      {/* headline, upper-left */}
      <div style={{ position: 'absolute', left: 76, top: 86, zIndex: 7 }}>
        <h1 className="hl" style={{ fontSize: 98, lineHeight: 0.94 }}>
          Most.<br/><span className="accent">Competitive.</span><br/>Learning.
        </h1>
      </div>
      {/* Brazil globe — vector SVG, pokes up from the bottom */}
      <div style={{ position: 'absolute', left: 432, bottom: -118, zIndex: 3 }}>
        <SvgGlobe size={360} />
      </div>
      {/* Progress phone on the right (brand inside it) */}
      <div style={{ position: 'absolute', right: 110, top: 104, transform: 'rotate(-5deg)', zIndex: 5 }}>
        <Phone w={262} h={524}><ProgressScreen /></Phone>
      </div>
      {/* Japanese topic tile — no frame, bottom-left (raised) */}
      <div style={{ position: 'absolute', left: -22, bottom: 84, transform: 'rotate(-8deg)', zIndex: 8,
          width: 236, filter: 'drop-shadow(0 16px 30px rgba(20,40,32,.22))' }}>
        <img src="assets/japanese_cut.png" alt="Japanese" style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  );
}

/* ============ G — exact copy of F, but the phone shows A's Feed screen ============ */
function ThumbG() {
  return (
    <div className="thumb" style={{ background: '#f4f7f6', overflow: 'hidden' }}>
      {/* stock-style rising line — starts at the bottom-left edge, exits off the right */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1280, height: 580, zIndex: 1 }}>
        <StockChart width={1280} height={580} stroke="#3EAE93" sw={7} startX={0.16} startY={0.99} endY={0.14} id="chartG" />
      </div>
      {/* headline, upper-left */}
      <div style={{ position: 'absolute', left: 76, top: 86, zIndex: 7 }}>
        <h1 className="hl" style={{ fontSize: 98, lineHeight: 0.94 }}>
          Most.<br/><span className="accent">Competitive.</span><br/>Learning.
        </h1>
      </div>
      {/* Brazil globe — vector SVG, pokes up from the bottom */}
      <div style={{ position: 'absolute', left: 432, bottom: -118, zIndex: 3 }}>
        <SvgGlobe size={360} />
      </div>
      {/* Phone on the right — shows the Feed screen (as in design A) */}
      <div style={{ position: 'absolute', right: 110, top: 104, transform: 'rotate(-5deg)', zIndex: 5 }}>
        <Phone w={262} h={524}><FeedScreen prompt="shirt" optShift={-11} /></Phone>
      </div>
      {/* Japanese topic tile — no frame, bottom-left (raised) */}
      <div style={{ position: 'absolute', left: -22, bottom: 84, transform: 'rotate(-8deg)', zIndex: 8,
          width: 236, filter: 'drop-shadow(0 16px 30px rgba(20,40,32,.22))' }}>
        <img src="assets/japanese_cut.png" alt="Japanese" style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  );
}

/* ============ H — exact copy of G, but the phone shows a chess (HSK 4) task ============ */
function ThumbH() {
  return (
    <div className="thumb" style={{ background: '#f4f7f6', overflow: 'hidden' }}>
      {/* stock-style rising line — starts at the bottom-left edge, exits off the right */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1280, height: 580, zIndex: 1 }}>
        <StockChart width={1280} height={580} stroke="#3EAE93" sw={7} startX={0.16} startY={0.99} endY={0.14} id="chartH" />
      </div>
      {/* headline, upper-left */}
      <div style={{ position: 'absolute', left: 76, top: 86, zIndex: 7 }}>
        <h1 className="hl" style={{ fontSize: 98, lineHeight: 0.94 }}>
          Most.<br/><span className="accent">Competitive.</span><br/>Learning.
        </h1>
      </div>
      {/* Brazil globe — vector SVG, pokes up from the bottom */}
      <div style={{ position: 'absolute', left: 432, bottom: -118, zIndex: 3 }}>
        <SvgGlobe size={360} />
      </div>
      {/* Phone on the right — chess vocab task (HSK 4) */}
      <div style={{ position: 'absolute', right: 110, top: 104, transform: 'rotate(-5deg)', zIndex: 5 }}>
        <Phone w={262} h={524}>
          <FeedScreen
            label="Chinese HSK 4" labelInitial="C"
            prompt="Check!"
            img="assets/q-chess.png" imgAlt="chess" imgScale={1.5}
            options={[['将军 (jiāng jūn)', true], ['平局 (píng jú)', false], ['弃权 (qì quán)', false]]}
            optShift={-11} />
        </Phone>
      </div>
      {/* Japanese topic tile — no frame, bottom-left (raised) */}
      <div style={{ position: 'absolute', left: -22, bottom: 84, transform: 'rotate(-8deg)', zIndex: 8,
          width: 236, filter: 'drop-shadow(0 16px 30px rgba(20,40,32,.22))' }}>
        <img src="assets/japanese_cut.png" alt="Japanese" style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  );
}

const THUMBS = { a: ThumbA, e: ThumbE, f: ThumbF, g: ThumbG, h: ThumbH };
Object.assign(window, { Motto, SvgGlobe, ThumbA, ThumbE, ThumbF, ThumbG, ThumbH, THUMBS });
