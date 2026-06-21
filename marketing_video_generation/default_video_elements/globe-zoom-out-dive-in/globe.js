// ============================================================
// Stacktags default element — 3D GLOBE v2 (DIVE OUT → DIVE IN).
//
// Starts ZOOMED IN on city A (a photo fills the screen). On cue it:
//   1. pulls the camera back OUT to an overview of the region,
//   2. rotates across to city B and DIVES back IN,
//   3. hands off to city B's photo (burst reveal).
//
// White + turquoise globe, grey city dots with a single ping each.
// Depends on globals THREE, earcut, topojson (CDN <script>).
//
//   window.mountStacktagsGlobeV2(el, {
//     highlight:'China',
//     markers:[ {lat,lon}, {lat,lon} ],   // [A = origin, B = destination]
//     startCam, overviewCam, closeCam,
//     onReady })
//   // then:
//   el.__globeCtrl.outIn(
//     { durOut, hold, durIn },
//     { onLeave(){...}, onOverview(){...}, onArrive(){...} });
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

  window.mountStacktagsGlobeV2 = function (el, opts = {}) {
    if (!el || el.querySelector('canvas')) return;
    if (!window.THREE || !window.earcut || !window.topojson) return; // CDN not ready

    const HIGHLIGHT = (opts.highlight || 'China');
    const MARKERS = (opts.markers && opts.markers.length) ? opts.markers : [{ lat: 39.9, lon: 116.4 }, { lat: 22.3, lon: 114.17 }];
    const A = MARKERS[0], B = MARKERS[1] || MARKERS[0];
    const CLOSE_CAM = opts.closeCam || 1.02;
    const OVERVIEW_CAM = opts.overviewCam || 3.5;
    const START_CAM = opts.startCam || CLOSE_CAM;

    let renderer, scene, camera, globe;
    // start zoomed IN on city A
    const state = { lat: A.lat, lon: A.lon, camDist: START_CAM, tLat: A.lat, tLon: A.lon, tCam: START_CAM };
    const tween = { active: false, t0: 0, dur: 1000, from: null, to: null, ease: null, onDone: null };

    // per-marker ping animations driven from the render loop
    const pings = []; // {ring, t0, dur}

    function size() {
      const w = Math.max(el.offsetWidth || 1080, 200);
      const h = Math.max(el.offsetHeight || 1920, 200);
      return { w, h };
    }

    function paintTexture(world, ctx, canvas) {
      // The sphere is now just a plain white surface — country borders are
      // drawn as crisp 3D vector lines (buildBorders) instead of being baked
      // into this texture, so they stay sharp at any zoom level.
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    }

    // All country outlines as real 3D ribbon geometry — vector-crisp at any
    // zoom AND with a genuine, controllable thickness (WebGL ignores line
    // width, so each border is built as a thin double-sided strip).
    function buildBorders(world) {
      const positions = [];
      const halfW = 0.0026;   // half the border width, in world units
      const up = new THREE.Vector3();
      forEachRing(world, (ring) => {
        const subs = [[]];
        for (let i = 0; i < ring.length; i++) {
          if (i > 0 && Math.abs(ring[i][0] - ring[i - 1][0]) > 180) subs.push([]);
          subs[subs.length - 1].push(ring[i]);
        }
        subs.forEach(s => {
          if (s.length < 2) return;
          const P = s.map(p => latLonToVec3(p[1], p[0], GLOBE_RADIUS * 1.0015));
          const N = P.length;
          const perpOf = (p, dir) => up.copy(p).normalize().cross(dir).normalize();
          // CONSTANT-WIDTH segment quads — uniform thickness, no miter scaling
          for (let i = 0; i < N - 1; i++) {
            const a = P[i], b = P[i + 1];
            const dir = b.clone().sub(a);
            if (dir.lengthSq() < 1e-12) continue;
            dir.normalize();
            const sa = perpOf(a, dir).multiplyScalar(halfW);
            const sb = perpOf(b, dir).multiplyScalar(halfW);
            const a1 = a.clone().add(sa), a2 = a.clone().sub(sa);
            const b1 = b.clone().add(sb), b2 = b.clone().sub(sb);
            positions.push(a1.x, a1.y, a1.z, b1.x, b1.y, b1.z, a2.x, a2.y, a2.z);
            positions.push(a2.x, a2.y, a2.z, b1.x, b1.y, b1.z, b2.x, b2.y, b2.z);
          }
          // ROUND joins/caps at every vertex fill the wedge gaps at turns
          // without changing the line's thickness anywhere.
          const JOIN = 9;
          for (let i = 0; i < N; i++) {
            const c = P[i];
            const n = up.copy(c).normalize();
            const ref = Math.abs(n.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
            const uAx = new THREE.Vector3().crossVectors(n, ref).normalize();
            const vAx = new THREE.Vector3().crossVectors(n, uAx).normalize();
            let prev = null;
            for (let k = 0; k <= JOIN; k++) {
              const t = (k / JOIN) * Math.PI * 2;
              const p = c.clone()
                .add(uAx.clone().multiplyScalar(Math.cos(t) * halfW))
                .add(vAx.clone().multiplyScalar(Math.sin(t) * halfW));
              if (prev) positions.push(c.x, c.y, c.z, prev.x, prev.y, prev.z, p.x, p.y, p.z);
              prev = p;
            }
          }
        });
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      // OPAQUE: shared borders are drawn twice (once per neighbouring country);
      // a translucent material would stack those into a darker line. Opaque +
      // depthWrite:false keeps every line one uniform tone, overlap or not.
      const mat = new THREE.MeshBasicMaterial({ color: 0x6a6f74, side: THREE.DoubleSide, depthWrite: false });
      return new THREE.Mesh(g, mat);
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
        if (tri) {
          const R = GLOBE_RADIUS * 1.004, L = 7;
          tri.tris.forEach(([a, b, c]) => {
            const A2 = tri.pts[a], B2 = tri.pts[b], C2 = tri.pts[c];
            const P = (i, j) => {
              const k = L - i - j;
              const lon = (i * A2[0] + j * B2[0] + k * C2[0]) / L;
              const lat = (i * A2[1] + j * B2[1] + k * C2[1]) / L;
              return latLonToVec3(lat, lon, R);
            };
            for (let i = 0; i < L; i++) for (let j = 0; j < L - i; j++) {
              const v0 = P(i, j), v1 = P(i + 1, j), v2 = P(i, j + 1);
              fillPositions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
              if (i + j < L - 1) {
                const v3 = P(i + 1, j + 1);
                fillPositions.push(v1.x, v1.y, v1.z, v3.x, v3.y, v3.z, v2.x, v2.y, v2.z);
              }
            }
          });
        }
      });
      if (fillPositions.length) {
        const fg = new THREE.BufferGeometry();
        fg.setAttribute('position', new THREE.Float32BufferAttribute(fillPositions, 3));
        fg.computeVertexNormals();
        grp.add(new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0x35a292, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false })));
      }
      return grp;
    }

    function buildMarker(lat, lon) {
      const grp = new THREE.Group();
      const pos = latLonToVec3(lat, lon, GLOBE_RADIUS * 1.012);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x5b646d })
      );
      dot.position.copy(pos);
      const ringGeo = new THREE.RingGeometry(0.026, 0.03, 56);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x5b646d, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      ring.position.copy(pos);
      ring.lookAt(pos.clone().multiplyScalar(2));
      grp.add(dot); grp.add(ring);
      return { grp, dot, ring };
    }

    function pingRing(ring) { pings.push({ ring, t0: performance.now(), dur: 760 }); }

    async function init() {
      const { w, h } = size();
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, w / h, 0.001, 100);
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

        // crisp vector country borders (replaces the old baked-in texture lines)
        globe.add(buildBorders(world));

        // highlight is shown solid from the start (we open zoomed in)
        const hl = buildHighlight(world, HIGHLIGHT);
        globe.add(hl);

        const mA = buildMarker(A.lat, A.lon);
        const mB = buildMarker(B.lat, B.lon);
        globe.add(mA.grp); globe.add(mB.grp);
        el.__markers = { A: mA, B: mB };
      } catch (e) { /* leave plain white sphere on failure */ }

      el.__globeCtrl = {
        // one continuous move: dive OUT to an overview, then dive IN to B
        outIn(cfg = {}, cb = {}) {
          // ONE continuous arc: pull out, glide across, dive back in — no
          // pause at the apex. The camera never fully stops because the
          // pan (lat/lon) keeps its momentum through the middle while the
          // distance rises and falls on a smooth sine curve.
          const total = cfg.total != null ? cfg.total : 2400;
          const fromLat = state.lat, fromLon = state.lon;
          const toLat = B.lat, toLon = B.lon;
          // easeInOut for the pan: gentle start/end, full momentum mid-flight
          const eIO = p => (p < 0.5) ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          let pinged = false;
          if (cb.onLeave) cb.onLeave();
          startTweenCustom(total, (p) => {
            const e = eIO(p);
            // distance dips OUT then back IN; sin peaks at p=0.5 with no flat hold
            const cam = CLOSE_CAM + (OVERVIEW_CAM - CLOSE_CAM) * Math.sin(Math.PI * p);
            if (!pinged && p >= 0.30) {
              pinged = true;
              if (el.__markers) pingRing(el.__markers.B.ring);
              if (cb.onOverview) cb.onOverview();
            }
            return { lat: lerp(fromLat, toLat, e), lon: lerp(fromLon, toLon, e), cam };
          }, () => { if (cb.onArrive) cb.onArrive(); });
        },
        pingA() { if (el.__markers) pingRing(el.__markers.A.ring); },
      };
      if (opts.onReady) opts.onReady(el.__globeCtrl);

      animate(performance.now());
    }

    function startTween(to, dur, ease, onDone) {
      tween.from = { lat: state.lat, lon: state.lon, cam: state.camDist };
      tween.to = to;
      tween.compute = null;
      tween.dur = dur;
      tween.ease = ease || (p => p);
      tween.onDone = onDone || null;
      tween.t0 = performance.now();
      tween.active = true;
      // pin idle targets to the destination so nothing springs back
      state.tLat = to.lat; state.tLon = to.lon; state.tCam = to.cam;
    }

    // a tween whose lat/lon/cam are produced by a custom compute(p) function
    function startTweenCustom(dur, compute, onDone) {
      tween.compute = compute;
      tween.dur = dur;
      tween.onDone = onDone || null;
      tween.t0 = performance.now();
      tween.active = true;
      const end = compute(1);
      state.tLat = end.lat; state.tLon = end.lon; state.tCam = end.cam;
    }

    const lerp = (a, b, t) => a + (b - a) * t;

    function animate(now) {
      requestAnimationFrame(animate);
      if (tween.active) {
        const p = Math.min(1, Math.max(0, (now - tween.t0) / tween.dur));
        if (tween.compute) {
          const v = tween.compute(p);
          state.lat = v.lat; state.lon = v.lon; state.camDist = v.cam;
        } else {
          const e = tween.ease(p);
          state.lat = lerp(tween.from.lat, tween.to.lat, e);
          state.lon = lerp(tween.from.lon, tween.to.lon, e);
          state.camDist = lerp(tween.from.cam, tween.to.cam, e);
        }
        if (p >= 1) {
          tween.active = false;
          const done = tween.onDone; tween.onDone = null;
          if (done) done();
        }
      } else {
        state.lat = lerp(state.lat, state.tLat, 0.05);
        state.lon = lerp(state.lon, state.tLon, 0.05);
        state.camDist = lerp(state.camDist, state.tCam, 0.05);
      }
      if (globe) {
        globe.rotation.y = -Math.PI / 2 - state.lon * Math.PI / 180;
        globe.rotation.x = state.lat * Math.PI / 180;
      }
      // ring pings
      for (let i = pings.length - 1; i >= 0; i--) {
        const pg = pings[i];
        const pp = (now - pg.t0) / pg.dur;
        if (pp >= 1) { pg.ring.material.opacity = 0; pings.splice(i, 1); continue; }
        pg.ring.scale.setScalar(0.3 + pp * 3.0);
        pg.ring.material.opacity = 0.9 * Math.pow(1 - pp, 1.5);
      }
      camera.position.set(0, 0, state.camDist);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    init();
  };
})();
