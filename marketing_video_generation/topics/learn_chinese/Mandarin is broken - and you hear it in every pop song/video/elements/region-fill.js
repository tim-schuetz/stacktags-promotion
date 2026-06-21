/* ============================================================
   Stacktags element — REGION FILL (flat 2D country, fills in)
   Draws one country (e.g. China) as a flat filled silhouette on a
   canvas (cropped to the country's bounding box) and "fills it in"
   bottom-to-top on reveal(). Cheap — one canvas, a short rAF fill,
   then static. No WebGL (so it never stalls the capture).
   Uses the same world-atlas + equirectangular projection as the globe.

     const ctrl = mountRegionFill(host, { name:'China' });
     ctrl.reveal(900);   // sweep the turquoise fill up
   ============================================================ */
(function (global) {
  let worldCache = null;
  async function loadWorld() {
    if (worldCache) return worldCache;
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json');
    const topo = await res.json();
    worldCache = window.topojson.feature(topo, topo.objects.countries);
    return worldCache;
  }
  function ringsOf(feat) {
    const g = feat.geometry, out = [];
    if (!g) return out;
    if (g.type === 'Polygon') g.coordinates.forEach(r => out.push(r));
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => p.forEach(r => out.push(r)));
    return out;
  }

  global.mountRegionFill = function (host, opts = {}) {
    const NAME = String(opts.name || 'China').toLowerCase();
    const canvas = document.createElement('canvas');
    canvas.className = 'region-canvas';
    host.appendChild(canvas);
    const W = Math.max(host.offsetWidth || 760, 200);
    const H = Math.max(host.offsetHeight || 760, 200);
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const state = { rings: null, ready: false, fillP: 0, raf: 0 };
    const FILL = opts.fill || '#35A292';
    const OUTLINE = opts.outline || '#119271';

    let project = null;
    function build(world) {
      const feat = (world.features || []).find(f => {
        const n = String((f.properties && (f.properties.name || f.properties.NAME)) || '').toLowerCase();
        return n === NAME;
      });
      if (!feat) return;
      const rings = ringsOf(feat);
      // bbox (drop tiny far-flung islands by weighting to the largest ring's box)
      let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
      let biggest = rings[0], bA = 0;
      rings.forEach(r => { if (r.length > bA) { bA = r.length; biggest = r; } });
      biggest.forEach(([lon, lat]) => { minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon); minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat); });
      const pad = 0.06, dLon = (maxLon - minLon), dLat = (maxLat - minLat);
      minLon -= dLon * pad; maxLon += dLon * pad; minLat -= dLat * pad; maxLat += dLat * pad;
      // fit bbox into canvas preserving aspect (latitude already ~ vertical)
      const bw = maxLon - minLon, bh = maxLat - minLat;
      const s = Math.min(W / bw, H / bh) * 0.94;
      const ox = (W - bw * s) / 2, oy = (H - bh * s) / 2;
      project = (lon, lat) => [ox + (lon - minLon) * s, oy + (maxLat - lat) * s];
      state.rings = rings.filter(r => r.length > 8);  // skip slivers
      state.ready = true;
      draw(0);
    }

    function trace() {
      ctx.beginPath();
      state.rings.forEach(ring => {
        ring.forEach((pt, i) => { const [x, y] = project(pt[0], pt[1]); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
        ctx.closePath();
      });
    }
    function draw(p) {
      ctx.clearRect(0, 0, W, H);
      if (!state.ready) return;
      // faint resting silhouette
      trace(); ctx.fillStyle = 'rgba(35,162,146,0.12)'; ctx.fill('evenodd');
      // the turquoise fill, clipped to a bottom-up sweep
      if (p > 0) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, H * (1 - p), W, H * p); ctx.clip();
        trace(); ctx.fillStyle = FILL; ctx.fill('evenodd');
        ctx.restore();
      }
      // crisp outline on top
      trace(); ctx.lineWidth = 3; ctx.strokeStyle = OUTLINE; ctx.lineJoin = 'round'; ctx.stroke();
    }

    loadWorld().then(build).catch(() => {});

    return {
      reveal(dur = 900) {
        if (!state.ready) { setTimeout(() => this.reveal(dur), 120); return; }
        const t0 = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          draw(e);
          if (p < 1) state.raf = requestAnimationFrame(step);
        };
        state.raf = requestAnimationFrame(step);
      },
      showAll() { if (state.ready) draw(1); },
      reset() { if (state.raf) cancelAnimationFrame(state.raf); draw(0); },
    };
  };
})(window);
