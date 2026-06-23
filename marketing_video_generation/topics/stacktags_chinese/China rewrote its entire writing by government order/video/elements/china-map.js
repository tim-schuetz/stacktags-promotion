/* ============================================================
   Stacktags video element — CHINA MAP (flat, geo-accurate)
   Draws mainland China from the same world-atlas geometry the app's
   3D globe uses, as a clean teal silhouette on white, and exposes an
   accurate lat/lon -> pixel projection so city pins land exactly right.

   USAGE
     const map = await mountChinaMap(hostEl, { width:900, height:1180, pad:150 });
     const { x, y } = map.project(31.23, 121.47);   // Shanghai
     map.drawIn(1400);                               // animate the outline drawing

   Depends on global: topojson (topojson-client, via CDN). Country geometry
   fetched once and cached. White + turquoise. Namespaced .cn-map.
   ============================================================ */
(function (global) {
  const ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
  const SVGNS = 'http://www.w3.org/2000/svg';
  let chinaFeat = null;

  async function getChina() {
    if (chinaFeat) return chinaFeat;
    const res = await fetch(ATLAS);
    if (!res.ok) throw new Error('atlas HTTP ' + res.status);
    const topo = await res.json();
    const fc = window.topojson.feature(topo, topo.objects.countries);
    chinaFeat = (fc.features || []).find(f => {
      const n = String((f.properties && (f.properties.name || f.properties.NAME)) || '').toLowerCase();
      return n === 'china';
    });
    if (!chinaFeat) throw new Error('china not found in atlas');
    return chinaFeat;
  }

  function polysOf(feat) {
    const g = feat.geometry;
    return g.type === 'Polygon' ? [g.coordinates] : g.coordinates; // [poly][ring][pt]
  }

  global.mountChinaMap = async function (host, opts = {}) {
    const W = opts.width || 900, H = opts.height || 1180;
    const PAD = opts.pad != null ? opts.pad : 150;
    const feat = await getChina();
    const P = polysOf(feat);

    // bbox over outer rings only (mainland dominates; ignore tiny far islands
    // for framing so China fills the box).
    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
    P.forEach(rings => rings[0].forEach(([lon, lat]) => {
      if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
    }));
    const meanLat = (minLat + maxLat) / 2;
    const kx = Math.cos(meanLat * Math.PI / 180);   // equirectangular x-correction
    const spanLon = (maxLon - minLon) * kx, spanLat = (maxLat - minLat);
    const scale = Math.min((W - 2 * PAD) / spanLon, (H - 2 * PAD) / spanLat);
    const drawW = spanLon * scale, drawH = spanLat * scale;
    const ox = (W - drawW) / 2, oy = (H - drawH) / 2;

    function project(lat, lon) {
      return { x: ox + (lon - minLon) * kx * scale, y: oy + (maxLat - lat) * scale };
    }

    // build the silhouette path
    let d = '';
    P.forEach(rings => rings.forEach(ring => {
      ring.forEach(([lon, lat], i) => {
        const { x, y } = project(lat, lon);
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      });
      d += 'Z ';
    }));

    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('class', 'cn-map-svg');
    // fill silhouette
    const fill = document.createElementNS(SVGNS, 'path');
    fill.setAttribute('d', d); fill.setAttribute('class', 'cn-map-fill');
    // stroked outline (for the draw-in animation)
    const line = document.createElementNS(SVGNS, 'path');
    line.setAttribute('d', d); line.setAttribute('class', 'cn-map-line');
    svg.appendChild(fill); svg.appendChild(line);
    host.appendChild(svg);

    const len = line.getTotalLength ? line.getTotalLength() : 6000;

    const ctrl = {
      project, svg, fill, line, W, H,
      // animate the outline being drawn + the fill fading in
      drawIn(ms = 1400) {
        line.style.transition = 'none';
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        fill.style.transition = 'none';
        fill.style.opacity = '0';
        void line.getBoundingClientRect();
        line.style.transition = `stroke-dashoffset ${ms}ms cubic-bezier(.6,0,.2,1)`;
        line.style.strokeDashoffset = '0';
        fill.style.transition = `opacity ${Math.round(ms * 0.7)}ms ease ${Math.round(ms * 0.45)}ms`;
        fill.style.opacity = '1';
      },
      // show fully drawn instantly (for seeking / screenshots)
      showInstant() {
        line.style.transition = 'none';
        line.style.strokeDasharray = 'none';
        line.style.strokeDashoffset = '0';
        fill.style.transition = 'none';
        fill.style.opacity = '1';
      },
    };
    return ctrl;
  };
})(window);
