// svg_globe.js — static orthographic SVG globe (vector), centred on Brazil.
// Renders country outlines as the app's map does, with Brazil filled teal,
// on a transparent/faint ocean so it integrates into the page (no white disc).
// Depends on window.topojson + world-atlas (fetched here).
(function () {
  const D2R = Math.PI / 180;
  let cache = null;
  async function loadWorld() {
    if (cache) return cache;
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const topo = await res.json();
    cache = window.topojson.feature(topo, topo.objects.countries);
    return cache;
  }
  function proj(lon, lat, lon0, lat0, R, cx, cy) {
    const p = lat * D2R, l = (lon - lon0) * D2R, p0 = lat0 * D2R;
    const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
    if (cosc < 0) return null;                       // back hemisphere → clip
    const x = Math.cos(p) * Math.sin(l);
    const y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
    return [cx + R * x, cy - R * y];
  }
  function ringSegs(ring, lon0, lat0, R, cx, cy) {
    const segs = []; let cur = [];
    for (let i = 0; i < ring.length; i++) {
      const xy = proj(ring[i][0], ring[i][1], lon0, lat0, R, cx, cy);
      if (xy) cur.push(xy[0].toFixed(1) + ',' + xy[1].toFixed(1));
      else { if (cur.length > 1) segs.push(cur); cur = []; }
    }
    if (cur.length > 1) segs.push(cur);
    return segs;
  }
  function eachRing(feat, cb) {
    const g = feat.geometry; if (!g) return;
    if (g.type === 'Polygon') g.coordinates.forEach(cb);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(poly => poly.forEach(cb));
  }
  window.mountSvgGlobe = async function (el, opts) {
    if (!el) return;
    opts = opts || {};
    const size = opts.size || 340;
    const lon0 = opts.lon0 != null ? opts.lon0 : -55;
    const lat0 = opts.lat0 != null ? opts.lat0 : -8;
    const hi = String(opts.highlight || 'brazil').toLowerCase();
    const R = size * 0.47, cx = size / 2, cy = size / 2;
    let world;
    try { world = await loadWorld(); } catch (e) { return; }
    let outline = '', fill = '';
    (world.features || []).forEach(f => {
      const name = String((f.properties && (f.properties.name || f.properties.NAME)) || '').toLowerCase();
      eachRing(f, ring => {
        const segs = ringSegs(ring, lon0, lat0, R, cx, cy);
        segs.forEach(s => { outline += 'M' + s.join('L') + ' '; });
        if (name === hi) segs.forEach(s => { fill += 'M' + s.join('L') + 'Z '; });
      });
    });
    el.innerHTML =
      '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" style="display:block;overflow:visible">' +
        '<defs><radialGradient id="globeOcean" cx="42%" cy="36%" r="70%">' +
          '<stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>' +
          '<stop offset="100%" stop-color="#3EAE93" stop-opacity="0.10"/>' +
        '</radialGradient></defs>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#globeOcean)" stroke="#1f7a63" stroke-opacity="0.38" stroke-width="1.5"/>' +
        '<path d="' + outline + '" fill="none" stroke="rgba(20,40,32,0.30)" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="' + fill + '" fill="#3EAE93" fill-rule="evenodd" stroke="#1f7a63" stroke-width="1.8" stroke-linejoin="round"/>' +
      '</svg>';
  };
})();
