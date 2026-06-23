/* ============================================================
   Stacktags video element — COUNTRY MAP (flat, geo-accurate)
   Generalises the china-map element to ANY country in the world-atlas
   (countries-110m). Clean teal silhouette on white + an accurate
   lat/lon -> pixel projection so pins/bands/suns land at the right
   longitude. Supports a shared `fixedScale` so two countries can be
   drawn at TRUE relative size (China vs the US).

   USAGE
     const m = await mountCountryMap(host, { country:'China', width:900, height:760 });
     const { x, y } = m.project(31.23, 121.47);
     m.xOfLon(120.4);          // pixel x of a longitude (for time-zone bands)
     m.drawIn(1300);           // animate the outline drawing
     m.lonRange;               // [minLon, maxLon] of the drawn silhouette

   Depends on global: topojson (topojson-client, via CDN), cached once.
   Namespaced .cn-map.
   ============================================================ */
(function (global) {
  const ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
  const SVGNS = 'http://www.w3.org/2000/svg';
  let FC = null;

  async function getFC() {
    if (FC) return FC;
    const res = await fetch(ATLAS);
    if (!res.ok) throw new Error('atlas HTTP ' + res.status);
    const topo = await res.json();
    FC = window.topojson.feature(topo, topo.objects.countries);
    return FC;
  }
  async function getCountry(name) {
    const fc = await getFC();
    const key = String(name).toLowerCase();
    const feat = (fc.features || []).find((f) => {
      const n = String((f.properties && (f.properties.name || f.properties.NAME)) || '').toLowerCase();
      return n === key || n.includes(key) || key.includes(n);
    });
    if (!feat) throw new Error('country not found: ' + name);
    return feat;
  }
  function polysOf(feat) {
    const g = feat.geometry;
    return g.type === 'Polygon' ? [g.coordinates] : g.coordinates; // [poly][ring][pt]
  }
  function ringArea(ring) {
    let a = 0;
    for (let i = 0, n = ring.length; i < n; i++) {
      const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % n];
      a += x1 * y2 - x2 * y1;
    }
    return Math.abs(a) / 2;
  }

  global.mountCountryMap = async function (host, opts = {}) {
    const W = opts.width || 900, H = opts.height || 1180;
    const PAD = opts.pad != null ? opts.pad : 120;
    const feat = await getCountry(opts.country || 'China');
    let P = polysOf(feat);
    // for countries that wrap the antimeridian (USA = Alaska/Aleutians), keep only
    // the single largest polygon so the bbox stays on the mainland.
    if (opts.mainlandOnly) {
      let best = null, bestA = -1;
      P.forEach((rings) => { const a = ringArea(rings[0]); if (a > bestA) { bestA = a; best = rings; } });
      P = [best];
    }

    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
    P.forEach((rings) => rings[0].forEach(([lon, lat]) => {
      if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
    }));
    const meanLat = (minLat + maxLat) / 2;
    const kx = Math.cos(meanLat * Math.PI / 180);          // equirectangular x-correction
    const spanLon = (maxLon - minLon) * kx, spanLat = (maxLat - minLat);
    const scale = opts.fixedScale != null ? opts.fixedScale
      : Math.min((W - 2 * PAD) / spanLon, (H - 2 * PAD) / spanLat);
    const drawW = spanLon * scale, drawH = spanLat * scale;
    const ox = (W - drawW) / 2, oy = (H - drawH) / 2;

    function project(lat, lon) {
      return { x: ox + (lon - minLon) * kx * scale, y: oy + (maxLat - lat) * scale };
    }
    const xOfLon = (lon) => ox + (lon - minLon) * kx * scale;

    let d = '';
    P.forEach((rings) => rings.forEach((ring) => {
      ring.forEach(([lon, lat], i) => {
        const { x, y } = project(lat, lon);
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      });
      d += 'Z ';
    }));

    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('class', 'cn-map-svg');
    const fill = document.createElementNS(SVGNS, 'path');
    fill.setAttribute('d', d); fill.setAttribute('class', 'cn-map-fill');
    const line = document.createElementNS(SVGNS, 'path');
    line.setAttribute('d', d); line.setAttribute('class', 'cn-map-line');
    svg.appendChild(fill); svg.appendChild(line);
    host.appendChild(svg);

    const len = line.getTotalLength ? line.getTotalLength() : 6000;

    return {
      project, xOfLon, svg, fill, line, W, H,
      lonRange: [minLon, maxLon], latRange: [minLat, maxLat],
      bbox: { minLon, maxLon, minLat, maxLat, ox, oy, drawW, drawH, scale, kx },
      drawIn(ms = 1400) {
        line.style.transition = 'none';
        line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
        fill.style.transition = 'none'; fill.style.opacity = '0';
        void line.getBoundingClientRect();
        line.style.transition = `stroke-dashoffset ${ms}ms cubic-bezier(.6,0,.2,1)`;
        line.style.strokeDashoffset = '0';
        fill.style.transition = `opacity ${Math.round(ms * 0.7)}ms ease ${Math.round(ms * 0.45)}ms`;
        fill.style.opacity = '1';
      },
      showInstant() {
        line.style.transition = 'none'; line.style.strokeDasharray = 'none'; line.style.strokeDashoffset = '0';
        fill.style.transition = 'none'; fill.style.opacity = '1';
      },
    };
  };

  // back-compat alias used by older videos
  global.mountChinaMap = function (host, opts = {}) {
    return global.mountCountryMap(host, Object.assign({ country: 'China' }, opts));
  };
})(window);
