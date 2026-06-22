/* ============================================================
   Stacktags element — SOUND COLLAPSE (Three.js particle field)
   A cloud of drifting teal points that, on collapse(), all rush
   inward and merge into a single bright point at the centre.
   Visual metaphor for "a whole range of older sounds melted into
   one." Purely decorative — if Three.js / WebGL is unavailable it
   no-ops, and the CSS sound-chips on top still carry the meaning.

   USAGE
     const c = mountSoundCollapse(hostEl);
     c.collapse();   // start the convergence
     c.reset();      // scatter back out
   ============================================================ */
(function (global) {
  function noop() { return { collapse() {}, reset() {}, dispose() {} }; }

  function mountSoundCollapse(host) {
    if (!global.THREE || !host) return noop();
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch (e) { console.warn('collapse: no WebGL', e); return noop(); }

    const W = host.clientWidth || 700, H = host.clientHeight || 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    cam.position.z = 15;

    // round sprite texture (PointsMaterial draws squares without one)
    const dot = document.createElement('canvas');
    dot.width = dot.height = 64;
    const dctx = dot.getContext('2d');
    const grd = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.45, 'rgba(255,255,255,1)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    dctx.fillStyle = grd;
    dctx.beginPath(); dctx.arc(32, 32, 32, 0, Math.PI * 2); dctx.fill();
    const dotTex = new THREE.CanvasTexture(dot);

    const N = 110;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const home = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 4.5 + (i % 7) * 0.9 + (i * 13 % 5) * 0.4;
      const th = (i * 2.39996);            // golden-angle spread (deterministic)
      const ph = Math.acos(1 - 2 * ((i + 0.5) / N));
      const x = r * Math.sin(ph) * Math.cos(th);
      const y = r * Math.sin(ph) * Math.sin(th) * 0.72;
      const z = r * Math.cos(ph) * 0.6;
      home[i * 3] = x; home[i * 3 + 1] = y; home[i * 3 + 2] = z;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x3EAE93, size: 0.34, transparent: true, opacity: 0.85,
      map: dotTex, alphaTest: 0.02, sizeAttenuation: true, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    let collapseAt = 0, raf = 0, t0 = null;
    const DUR = 2400;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (t0 == null) t0 = now;
      const t = (now - t0) / 1000;
      const k = collapseAt ? Math.min(1, (now - collapseAt) / DUR) : 0;
      const e = 1 - Math.pow(1 - k, 3);
      const arr = geo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        const dx = Math.sin(t * 0.6 + i) * 0.18;
        const dy = Math.cos(t * 0.5 + i * 1.3) * 0.18;
        arr[i * 3]     = (home[i * 3] + dx) * (1 - e);
        arr[i * 3 + 1] = (home[i * 3 + 1] + dy) * (1 - e);
        arr[i * 3 + 2] = (home[i * 3 + 2]) * (1 - e);
      }
      geo.attributes.position.needsUpdate = true;
      pts.rotation.y = t * 0.14;
      // converge → fade the cloud out so it doesn't sit behind the result text
      mat.opacity = 0.85 * (1 - 0.92 * e);
      mat.size = 0.34 + e * 0.22;
      renderer.render(scene, cam);
    }
    raf = requestAnimationFrame(frame);

    return {
      collapse() { if (!collapseAt) collapseAt = performance.now(); },
      reset() { collapseAt = 0; },
      dispose() { cancelAnimationFrame(raf); try { renderer.dispose(); } catch (e) {} host.innerHTML = ''; },
    };
  }
  global.mountSoundCollapse = mountSoundCollapse;
})(window);
