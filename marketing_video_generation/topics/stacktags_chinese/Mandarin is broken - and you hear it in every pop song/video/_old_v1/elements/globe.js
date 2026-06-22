// ============================================================
// Stacktags 3D globe — configurable port (Three.js).
// Renders the real world-atlas geometry as a white globe with country
// outlines. Zooms the "camera" in from far away onto a focus region,
// highlights a country teal and drops a pulsing city marker — used here
// as the "head south to Hong Kong / Guangdong" transition into a photo.
//
// Depends on globals: THREE, earcut, topojson (loaded via CDN <script>).
// Mount with: window.mountStacktagsGlobe(el, {
//   focus:{lat,lon,cam}, startCam, highlight:'China',
//   marker:{lat,lon,label} })
// ============================================================
(function () {
  const GLOBE_RADIUS = 1;
  const TEXTURE_SIZE = 2048;

  let worldGeoCache = null;
  async function loadWorldGeo() {
    if (worldGeoCache) return worldGeoCache;
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const topo = await res.json();
    const fc = window.topojson.feature(topo, topo.objects.countries);
    fc.features = (fc.features || []).filter(f => {
      const n = (f.properties && (f.properties.name || f.properties.NAME)) || '';
      return !/antarctic/i.test(n);
    });
    worldGeoCache = fc;
    return fc;
  }

  function latLonToVec3(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function forEachRing(geojson, cb) {
    if (!geojson) return;
    const features = geojson.type === 'FeatureCollection' ? geojson.features
      : (geojson.type === 'Feature' ? [geojson] : []);
    features.forEach(f => {
      const g = f.geometry; if (!g) return;
      const props = f.properties || {};
      if (g.type === 'Polygon') g.coordinates.forEach((ring, i) => cb(ring, props, i === 0));
      else if (g.type === 'MultiPolygon') g.coordinates.forEach(poly => poly.forEach((ring, i) => cb(ring, props, i === 0)));
    });
  }

  function drawGeo(ctx, geojson, W, H, opts) {
    forEachRing(geojson, (ring) => {
      const subRings = [[]];
      for (let i = 0; i < ring.length; i++) {
        const cur = ring[i];
        if (i > 0 && Math.abs(cur[0] - ring[i - 1][0]) > 180) subRings.push([]);
        subRings[subRings.length - 1].push(cur);
      }
      subRings.forEach(sub => {
        if (sub.length < 2) return;
        ctx.beginPath();
        sub.forEach((pt, i) => {
          const x = ((pt[0] + 180) / 360) * W;
          const y = ((90 - pt[1]) / 180) * H;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        if (opts.fill && subRings.length === 1) { ctx.closePath(); ctx.fillStyle = opts.fill; ctx.fill(); }
        if (opts.stroke) { ctx.strokeStyle = opts.stroke; ctx.lineWidth = opts.lineWidth || 1; ctx.lineJoin = 'round'; ctx.stroke(); }
      });
    });
  }

  function triangulatePolygon(outerRing, holeRings) {
    if (!outerRing || outerRing.length < 4) return null;
    const outer = outerRing.slice(0, -1);
    const holes = (holeRings || []).filter(h => h && h.length >= 4).map(h => h.slice(0, -1));
    const coords = [];
    outer.forEach(p => coords.push(p[0], p[1]));
    const holeIndices = []; let cursor = outer.length;
    holes.forEach(h => { holeIndices.push(cursor); h.forEach(p => coords.push(p[0], p[1])); cursor += h.length; });
    const triFlat = window.earcut(coords, holeIndices.length ? holeIndices : null, 2);
    if (!triFlat || !triFlat.length) return null;
    const pts = outer.slice(); holes.forEach(h => h.forEach(p => pts.push(p)));
    const tris = [];
    for (let i = 0; i < triFlat.length; i += 3) tris.push([triFlat[i], triFlat[i + 1], triFlat[i + 2]]);
    return { pts, tris };
  }

  window.mountStacktagsGlobe = function (el, opts = {}) {
    if (!el || el.querySelector('canvas')) return;
    if (!window.THREE || !window.earcut || !window.topojson) return; // CDN not ready

    const FOCUS = opts.focus || { lat: 24, lon: 113, cam: 1.95 };
    const START_CAM = opts.startCam || 3.8;
    const HIGHLIGHT = (opts.highlight || 'China');
    const MARKER = opts.marker || null;

    let renderer, scene, camera, globe;
    const state = { lat: 6, lon: FOCUS.lon - 26, camDist: START_CAM, tLat: FOCUS.lat, tLon: FOCUS.lon, tCam: FOCUS.cam };
    function size() {
      const r = el.getBoundingClientRect();
      const side = Math.max(Math.min(r.width || 600, r.height || 600), 200);
      return { w: side, h: side };
    }

    function paintTexture(world, ctx, canvas) {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      drawGeo(ctx, world, W, H, { fill: '#ffffff', stroke: 'rgba(0,0,0,0.28)', lineWidth: 1.1 });
    }

    function buildHighlight(world, name) {
      const target = String(name || HIGHLIGHT).toLowerCase();
      const grp = new THREE.Group();
      const feat = (world.features || []).find(f => {
        const n = String((f.properties && (f.properties.name || f.properties.NAME)) || '').toLowerCase();
        return n === target;
      });
      if (!feat) return grp;
      const polys = feat.geometry.type === 'Polygon' ? [feat.geometry.coordinates] : feat.geometry.coordinates;
      const fillPositions = [];
      polys.forEach(rings => {
        const outer = rings[0];
        rings.forEach(r => {
          if (r.length < 2) return;
          const pts = r.map(p => latLonToVec3(p[1], p[0], GLOBE_RADIUS * 1.002));
          const g = new THREE.BufferGeometry().setFromPoints(pts);
          grp.add(new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0x2e9e7f, transparent: true, opacity: 0.95, depthWrite: false })));
        });
        const tri = triangulatePolygon(outer, rings.slice(1));
        if (tri) tri.tris.forEach(([a, b, c]) => {
          [a, b, c].forEach(idx => {
            const v = latLonToVec3(tri.pts[idx][1], tri.pts[idx][0], GLOBE_RADIUS * 1.0012);
            fillPositions.push(v.x, v.y, v.z);
          });
        });
      });
      if (fillPositions.length) {
        const fg = new THREE.BufferGeometry();
        fg.setAttribute('position', new THREE.Float32BufferAttribute(fillPositions, 3));
        fg.computeVertexNormals();
        grp.add(new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0x3eae93, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })));
      }
      return grp;
    }

    let markerRing = null;
    function buildMarker(lat, lon) {
      const grp = new THREE.Group();
      const pos = latLonToVec3(lat, lon, GLOBE_RADIUS * 1.012);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0xd8443b })
      );
      dot.position.copy(pos);
      grp.add(dot);
      // pulsing ring lying flat on the surface
      const ringGeo = new THREE.RingGeometry(0.02, 0.032, 32);
      markerRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xd8443b, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
      markerRing.position.copy(pos);
      markerRing.lookAt(pos.clone().multiplyScalar(2));
      grp.add(markerRing);
      return grp;
    }

    async function init() {
      const { w, h } = size();
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);
      camera.position.set(0, 0, state.camDist);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      el.appendChild(renderer.domElement);

      globe = new THREE.Group(); scene.add(globe);
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));

      const canvas = document.createElement('canvas');
      canvas.width = TEXTURE_SIZE; canvas.height = TEXTURE_SIZE / 2;
      const ctx = canvas.getContext('2d');
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;

      const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96), new THREE.MeshBasicMaterial({ map: tex }));
      globe.add(earth);

      // subtle dark rim
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(GLOBE_RADIUS * 1.015, 64, 64),
        new THREE.ShaderMaterial({
          transparent: true, side: THREE.BackSide,
          uniforms: { uAlpha: { value: 0.10 } },
          vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
          fragmentShader: 'varying vec3 vN; uniform float uAlpha; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 2.0); gl_FragColor = vec4(0.0,0.0,0.0, i*uAlpha); }'
        })
      );
      scene.add(atmo);

      try {
        const world = await loadWorldGeo();
        paintTexture(world, ctx, canvas);
        tex.needsUpdate = true;

        const hl = buildHighlight(world, HIGHLIGHT);
        hl.visible = false;
        const mats = [];
        hl.traverse(o => { if (o.material) { mats.push({ m: o.material, target: o.material.opacity }); o.material.opacity = 0; } });
        globe.add(hl);
        // fade the country highlight in once the camera has begun to settle
        setTimeout(() => {
          hl.visible = true;
          const t0 = performance.now();
          (function pop(t) {
            const p = Math.min(1, (t - t0) / 600);
            const e = 1 - Math.pow(1 - p, 3);
            mats.forEach(({ m, target }) => { m.opacity = target * e; });
            if (p < 1) requestAnimationFrame(pop);
          })(performance.now());
        }, 900);

        if (MARKER) globe.add(buildMarker(MARKER.lat, MARKER.lon));
      } catch (e) { /* leave plain white sphere on failure */ }

      animate(performance.now());
    }

    function lerp(a, b, t) { return a + (b - a) * t; }
    function animate(now) {
      requestAnimationFrame(animate);
      state.lat = lerp(state.lat, state.tLat, 0.045);
      state.lon = lerp(state.lon, state.tLon, 0.045);
      state.camDist = lerp(state.camDist, state.tCam, 0.045);
      if (globe) {
        globe.rotation.y = -Math.PI / 2 - state.lon * Math.PI / 180;
        globe.rotation.x = state.lat * Math.PI / 180;
      }
      if (markerRing) {
        const p = (Math.sin(now / 380) + 1) / 2;
        markerRing.scale.setScalar(1 + p * 1.4);
        markerRing.material.opacity = 0.85 * (1 - p);
      }
      camera.position.set(0, 0, state.camDist);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    init();
  };
})();
