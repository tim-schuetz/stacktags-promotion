// ============================================================
// Stacktags default element — 3D GLOBE (configurable, Three.js).
//
// A white world-atlas globe with country outlines. It can:
//   - highlight a country in turquoise (filled, no border),
//   - drop a pulsing RED CIRCLE marker on a city,
//   - dolly the camera from far away onto a focus region, and
//   - ZOOM INTO the marker and hand off to a photo (zoomToMarker),
//     firing a swoosh as it dives in.
//
// Depends on globals THREE, earcut, topojson (CDN <script>).
// See demo.html in this folder for the full country→marker→zoom→photo
// example (Hong Kong). White + turquoise; red only for the map pin.
//
//   window.mountStacktagsGlobe(el, {
//     focus:{lat,lon,cam}, startCam, highlight:'China',
//     marker:{lat,lon}, onReady })
//   // then, to dive in:
//   el.__globeCtrl.zoomToMarker({cam:1.07, duration:1300},
//     { onStart(){...}, onArrive(){...} });
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
    const state = { lat: opts.startLat != null ? opts.startLat : 6, lon: opts.startLon != null ? opts.startLon : FOCUS.lon - 26, camDist: START_CAM, tLat: FOCUS.lat, tLon: FOCUS.lon, tCam: FOCUS.cam };
    const zoom = { active: false, t0: 0, dur: 1300, fromLat: 0, fromLon: 0, fromCam: 0, toLat: 0, toLon: 0, toCam: 1.07, onArrive: null, arrived: false };
    let pingActive = false, pingT0 = 0;
    let halted = false;   // stop the render loop once the globe has handed off (frees CPU)
    let routeMesh = null, routeTotal = 0, routePts3 = null, routeProg = 0;  // a turquoise DASHED route ON the surface
    let shipEl3 = null;                              // a DOM ship driven to ride the route's tip
    const route = { active: false, t0: 0, dur: 3100 };
    let idleK = 0.045;                               // idle slew speed (lower = slower travel)
    const pins = [];                                 // DOM elements pinned to lat/lon on the surface

    function size() {
      // Use the layout (unscaled) size — the stage is CSS-transform scaled to
      // fit the preview, so getBoundingClientRect would return the shrunken
      // size and the canvas would only cover a small rectangle of the stage.
      const w = Math.max(el.offsetWidth || 1080, 200);
      const h = Math.max(el.offsetHeight || 1920, 200);
      return { w, h };
    }

    function paintTexture(world, ctx, canvas) {
      // Plain white sphere — country borders are drawn as crisp 3D ribbon
      // geometry (buildBorders) so they stay sharp and even at any zoom.
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    }

    // All country outlines as 3D geometry: constant-width segment quads with
    // round caps at every vertex — uniform thickness, crisp at any zoom, no
    // white wedges at corners. Opaque so shared (double-drawn) borders never
    // stack into a darker tone.
    function buildBorders(world) {
      const positions = [];
      const halfW = 0.0026;
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
      const mat = new THREE.MeshBasicMaterial({ color: 0x6a6f74, side: THREE.DoubleSide, depthWrite: false });
      return new THREE.Mesh(g, mat);
    }

    // A DASHED turquoise route ON the sphere surface, following [lat,lon]
    // waypoints. Points are densely interpolated so the line hugs the globe
    // (not straight chords). Dash quads are emitted in path order so
    // setDrawRange(0,n) reveals it progressively. Sits just above the country
    // fill, added to the globe group so it rotates with it. Returns the dense
    // point list too, so the ship can ride the exact tip.
    function buildRoute(waypoints) {
      const pts = [];
      for (let k = 0; k < waypoints.length - 1; k++) {
        const a = waypoints[k], b = waypoints[k + 1], STEPS = 12;
        for (let s = 0; s < STEPS; s++) { const u = s / STEPS; pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
      }
      pts.push(waypoints[waypoints.length - 1]);
      const P = pts.map(p => latLonToVec3(p[0], p[1], GLOBE_RADIUS * 1.011));
      const positions = [];
      const halfW = 0.0056, up = new THREE.Vector3();
      const perpOf = (p, dir) => up.copy(p).normalize().cross(dir).normalize();
      const DASH = 0.040, GAP = 0.026;   // even dashes along the sphere arc
      let dist = 0;
      for (let i = 0; i < P.length - 1; i++) {
        const a = P[i], b = P[i + 1];
        const seg = b.clone().sub(a); const segLen = seg.length();
        if (segLen < 1e-9) continue;
        const on = (dist % (DASH + GAP)) < DASH;   // this sub-segment is part of a dash?
        dist += segLen;
        if (!on) continue;
        const dir = seg.clone().normalize();
        const sa = perpOf(a, dir).multiplyScalar(halfW), sb = perpOf(b, dir).multiplyScalar(halfW);
        const a1 = a.clone().add(sa), a2 = a.clone().sub(sa), b1 = b.clone().add(sb), b2 = b.clone().sub(sb);
        positions.push(a1.x, a1.y, a1.z, b1.x, b1.y, b1.z, a2.x, a2.y, a2.z);
        positions.push(a2.x, a2.y, a2.z, b1.x, b1.y, b1.z, b2.x, b2.y, b2.z);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setDrawRange(0, 0);
      const mat = new THREE.MeshBasicMaterial({ color: 0x119271, side: THREE.DoubleSide, depthWrite: false });
      return { mesh: new THREE.Mesh(g, mat), total: positions.length / 3, points: P };
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
        // Fill: subdivide each triangle and project every sub-vertex onto the
        // sphere. Flat chords across a big country (China) sag BELOW the white
        // sphere and get hidden — leaving only the edges visible. Small
        // sub-triangles hug the surface so the whole country fills solidly.
        const tri = triangulatePolygon(outer, rings.slice(1));
        if (tri) {
          const R = GLOBE_RADIUS * 1.004, L = 7;
          tri.tris.forEach(([a, b, c]) => {
            const A = tri.pts[a], B = tri.pts[b], C = tri.pts[c];
            const P = (i, j) => {
              const k = L - i - j;
              const lon = (i * A[0] + j * B[0] + k * C[0]) / L;
              const lat = (i * A[1] + j * B[1] + k * C[1]) / L;
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

    let markerRing = null, markerDot = null;
    function buildMarker(lat, lon) {
      const grp = new THREE.Group();
      const pos = latLonToVec3(lat, lon, GLOBE_RADIUS * 1.012);
      markerDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x5b646d })
      );
      markerDot.position.copy(pos);
      markerDot.scale.setScalar(0.0001);   // hidden until it pops in
      grp.add(markerDot);
      // ring starts AT the dot, then expands outward and fades — a single ping
      const ringGeo = new THREE.RingGeometry(0.026, 0.03, 56);
      markerRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x5b646d, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      markerRing.position.copy(pos);
      markerRing.lookAt(pos.clone().multiplyScalar(2));
      grp.add(markerRing);
      return grp;
    }

    async function init() {
      const { w, h } = size();
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, w / h, 0.001, 100);
      camera.position.set(0, 0, state.camDist);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      // optional render-scale (CSS-stretched) to keep a headless capture real-time;
      // default 1 = full sharpness.
      const RS = window.__GLOBE_RS || 1;
      renderer.setPixelRatio(1);
      renderer.setSize(Math.round(w * RS), Math.round(h * RS), false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
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

      let hlMats = [], markerGroup = null, revealed = false;
      function doReveal() {
        if (revealed) return; revealed = true;
        // fade the turquoise country fill in (gentle, slightly slower)
        const t0 = performance.now();
        (function pop(t) {
          const p = Math.min(1, (t - t0) / 1050);
          const e = 1 - Math.pow(1 - p, 3);
          hlMats.forEach(({ m, target }) => { m.opacity = target * e; });
          if (p < 1) requestAnimationFrame(pop);
        })(performance.now());
        // pop ONLY the red dot in; the ring pings outward from it
        if (markerDot) {
          const s0 = performance.now();
          (function popM(t) {
            const p = Math.min(1, (t - s0) / 440);
            const e = p < 1 ? 1 + (2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2)) : 1; // back-ease
            markerDot.scale.setScalar(Math.max(0.0001, e));
            if (p < 1) requestAnimationFrame(popM);
          })(performance.now());
        }
        pingActive = true; pingT0 = performance.now() + 220;   // one ping, just after the dot
      }

      try {
        const world = await loadWorldGeo();
        paintTexture(world, ctx, canvas);
        tex.needsUpdate = true;

        // crisp vector country borders (replaces the old baked-in texture lines)
        globe.add(buildBorders(world));

        const hl = buildHighlight(world, HIGHLIGHT);
        hl.visible = true;
        hl.traverse(o => { if (o.material) { hlMats.push({ m: o.material, target: o.material.opacity }); o.material.opacity = 0; } });
        globe.add(hl);

        if (MARKER) {
          markerGroup = buildMarker(MARKER.lat, MARKER.lon);
          markerGroup.scale.setScalar(1);
          globe.add(markerGroup);
        }
        // auto-reveal unless the host wants to trigger it on cue
        if (opts.autoReveal !== false) setTimeout(doReveal, 700);
      } catch (e) { /* leave plain white sphere on failure */ }

      // controller exposed for the host to drive the dive-in
      el.__globeCtrl = {
        reveal() { doReveal(); },
        zoomToMarker(o = {}, cb = {}) {
          const m = MARKER || { lat: FOCUS.lat, lon: FOCUS.lon };
          zoom.fromLat = state.lat; zoom.fromLon = state.lon; zoom.fromCam = state.camDist;
          zoom.toLat = o.lat != null ? o.lat : m.lat;
          zoom.toLon = o.lon != null ? o.lon : m.lon;
          zoom.toCam = o.cam != null ? o.cam : 1.07;
          zoom.dur = o.duration != null ? o.duration : 1300;
          zoom.onArrive = cb.onArrive || null;
          zoom.arrived = false;
          zoom.active = true;
          zoom.t0 = performance.now();
          // pin the idle targets to the dive destination so the camera
          // never springs back out once the dive finishes (no bounce).
          state.tLat = zoom.toLat; state.tLon = zoom.toLon; state.tCam = zoom.toCam;
          if (cb.onStart) cb.onStart();
        },
        halt() { halted = true; },
        resume() { if (halted) { halted = false; animate(performance.now()); } },
        // slew the idle camera target (the globe rotates smoothly toward it)
        setFocus(lat, lon, cam) { state.tLat = lat; state.tLon = lon; if (cam != null) state.tCam = cam; },
        // draw a turquoise route ON the globe from [lat,lon] waypoints (hidden until revealed)
        setRoute(waypoints) {
          if (routeMesh) { globe.remove(routeMesh); routeMesh.geometry.dispose(); }
          const r = buildRoute(waypoints); routeMesh = r.mesh; routeTotal = r.total; routePts3 = r.points; routeProg = 0;
          globe.add(routeMesh);
        },
        // a DOM element to drive onto the route's tip (so it rides the line exactly)
        attachShip(elm) { shipEl3 = elm; },
        revealRoute(dur) { route.active = true; route.t0 = performance.now(); route.dur = dur || 3100; if (halted) { halted = false; animate(performance.now()); } },
        // pop a standalone dot (red map-pin by default) onto the surface — for A→B routes
        addDot(lat, lon, o = {}) {
          const pos = latLonToVec3(lat, lon, GLOBE_RADIUS * 1.013);
          const dot = new THREE.Mesh(new THREE.SphereGeometry(o.size || 0.015, 22, 22),
            new THREE.MeshBasicMaterial({ color: o.color != null ? o.color : 0xd8443b }));
          dot.position.copy(pos); dot.scale.setScalar(0.0001); globe.add(dot);
          const s0 = performance.now() + (o.delay || 0);
          (function pop(t) { const p = Math.min(1, Math.max(0, (t - s0) / 380)); const e = p <= 0 ? 0.0001 : (p < 1 ? 1 + (2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2)) : 1); dot.scale.setScalar(Math.max(0.0001, e)); if (p < 1) requestAnimationFrame(pop); })(performance.now());
          return dot;
        },
        // idle travel speed (lower = slower); restore with no arg
        setSlew(k) { idleK = (k != null ? k : 0.045); },
        // fill another country turquoise on the fly (e.g. colour the USA after travelling)
        async addHighlight(name, dur) {
          let world; try { world = await loadWorldGeo(); } catch (e) { return null; }
          const hl = buildHighlight(world, name);
          const mats = [];
          hl.traverse((o) => { if (o.material) { mats.push({ m: o.material, target: o.material.opacity }); o.material.opacity = 0; } });
          globe.add(hl);
          if (halted) { halted = false; animate(performance.now()); }
          const t0 = performance.now();
          (function fade(t) { const p = Math.min(1, (t - t0) / (dur || 900)); const e = 1 - Math.pow(1 - p, 3); mats.forEach(({ m, target }) => { m.opacity = target * e; }); if (p < 1) requestAnimationFrame(fade); })(performance.now());
          return hl;
        },
        // pin a DOM element to a lat/lon on the surface (kept on screen each frame, hidden on the far side)
        pinElement(elm, lat, lon) { pins.push({ elm, p: latLonToVec3(lat, lon, GLOBE_RADIUS * 1.012) }); },
      };
      if (opts.onReady) opts.onReady(el.__globeCtrl);

      animate(performance.now());
    }

    const lerp = (a, b, t) => a + (b - a) * t;
    // dive easing with a non-zero initial velocity (starts with a bit of speed
    // instead of crawling from a standstill), then accelerates in.
    const easeDive = p => 0.32 * p + 0.68 * p * p * p;

    function animate(now) {
      if (halted) return;
      requestAnimationFrame(animate);
      if (zoom.active) {
        const p = Math.min(1, Math.max(0, (now - zoom.t0) / zoom.dur));
        const e = easeDive(p);      // brisk start, then accelerate into the dive
        state.lat = lerp(zoom.fromLat, zoom.toLat, e);
        state.lon = lerp(zoom.fromLon, zoom.toLon, e);
        state.camDist = lerp(zoom.fromCam, zoom.toCam, e);
        if (!zoom.arrived && p >= 0.96) { zoom.arrived = true; if (zoom.onArrive) zoom.onArrive(); }
        if (p >= 1) zoom.active = false;
      } else {
        state.lat = lerp(state.lat, state.tLat, idleK);
        state.lon = lerp(state.lon, state.tLon, idleK);
        state.camDist = lerp(state.camDist, state.tCam, idleK);
      }
      if (globe) {
        globe.rotation.y = -Math.PI / 2 - state.lon * Math.PI / 180;
        globe.rotation.x = state.lat * Math.PI / 180;
      }
      if (markerRing && pingActive) {
        // a SINGLE ring that expands outward from the dot and fades, once
        const PING = 720;
        const pp = (now - pingT0) / PING;
        if (pp < 0) {
          markerRing.material.opacity = 0;
        } else if (pp >= 1) {
          markerRing.material.opacity = 0; pingActive = false;
        } else {
          markerRing.scale.setScalar(0.3 + pp * 3.0);
          markerRing.material.opacity = 0.9 * Math.pow(1 - pp, 1.5);
        }
      }
      if (routeMesh && routePts3) {
        if (route.active) {
          const p = Math.min(1, (now - route.t0) / route.dur);
          routeProg = 1 - Math.pow(1 - p, 2);   // ease-out reveal, in step with the ship
          routeMesh.geometry.setDrawRange(0, Math.floor(routeTotal * routeProg));
          if (p >= 1) route.active = false;
        }
        // drive the ship DOM element onto the current tip of the route (project
        // the 3D surface point to screen) so it rides exactly on the line
        if (shipEl3) {
          const N = routePts3.length;
          const tip = routePts3[Math.max(0, Math.min(N - 1, Math.round(routeProg * (N - 1))))];
          const w = tip.clone(); globe.localToWorld(w); w.project(camera);
          const HW = el.offsetWidth || 1080, HH = el.offsetHeight || 1080;
          shipEl3.style.left = (el.offsetLeft + (w.x * 0.5 + 0.5) * HW) + 'px';
          shipEl3.style.top = (el.offsetTop + (-w.y * 0.5 + 0.5) * HH) + 'px';
        }
      }
      if (pins.length) {
        const HW = el.offsetWidth || 1080, HH = el.offsetHeight || 1920;
        pins.forEach((pin) => {
          const w = pin.p.clone(); globe.localToWorld(w); const front = w.z > 0; w.project(camera);
          pin.elm.style.left = (el.offsetLeft + (w.x * 0.5 + 0.5) * HW) + 'px';
          pin.elm.style.top = (el.offsetTop + (-w.y * 0.5 + 0.5) * HH) + 'px';
          pin.elm.style.visibility = front ? 'visible' : 'hidden';
        });
      }
      camera.position.set(0, 0, state.camDist);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    init();
  };
})();
