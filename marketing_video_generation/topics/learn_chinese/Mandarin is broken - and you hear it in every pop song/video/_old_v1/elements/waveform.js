/* ============================================================
   Stacktags element — WAVEFORM (canvas)
   A teal audio waveform that animates by itself. Two modes:
     'pop'  — energetic, many short bars (a lively pop track)
     'open' — a few long, held, smooth open-vowel lobes
   USAGE
     const wf = mountWaveform(hostEl);
     wf.setMode('pop'); wf.setActive(true);
   ============================================================ */
(function (global) {
  function mountWaveform(host) {
    const canvas = document.createElement('canvas');
    canvas.className = 'wf-canvas';
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const r = host.getBoundingClientRect();
      W = Math.max(r.width, 10); H = Math.max(r.height, 10);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    let mode = 'pop';
    let active = false;
    let env = 0;            // 0..1 amplitude envelope (eases in/out)
    let raf = 0, t0 = null;

    const TEAL = '#3EAE93';
    const TEAL_D = '#2b8e77';

    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (t0 == null) t0 = now;
      const t = (now - t0) / 1000;
      env += ((active ? 1 : 0) - env) * 0.08;
      ctx.clearRect(0, 0, W, H);
      if (env < 0.01) return;
      const midY = H / 2;

      if (mode === 'pop') {
        const N = Math.max(28, Math.floor(W / 26));
        const gap = W / N;
        const bw = gap * 0.46;
        for (let i = 0; i < N; i++) {
          const x = i * gap + gap / 2;
          // layered sines → busy, energetic motion
          let a = Math.sin(t * 6.0 + i * 0.7) * 0.5
                + Math.sin(t * 11.0 + i * 1.9) * 0.3
                + Math.sin(t * 3.0 + i * 0.35) * 0.4;
          a = Math.abs(a) / 1.2;
          // taper the ends down a touch
          const edge = Math.sin((i / (N - 1)) * Math.PI);
          const h = (8 + a * (H * 0.42)) * (0.45 + 0.55 * edge) * env;
          const g = ctx.createLinearGradient(0, midY - h, 0, midY + h);
          g.addColorStop(0, TEAL); g.addColorStop(1, TEAL_D);
          ctx.fillStyle = g;
          roundRect(ctx, x - bw / 2, midY - h, bw, h * 2, bw / 2);
        }
      } else { // 'open' — long held lobes
        const N = 7;
        const seg = W / N;
        for (let i = 0; i < N; i++) {
          const cx = i * seg + seg / 2;
          // slow, wide swell → "ahh / eyy / ohh / wayy"
          const swell = 0.55 + 0.45 * Math.sin(t * 1.4 + i * 1.1);
          const h = (H * 0.30) * swell * env;
          const lobeW = seg * 0.82;
          ctx.fillStyle = i % 2 ? TEAL_D : TEAL;
          ctx.globalAlpha = 0.92;
          // a smooth vertical lobe (rounded pill)
          roundRect(ctx, cx - lobeW / 2, midY - h, lobeW, h * 2, lobeW / 2);
          ctx.globalAlpha = 1;
        }
      }
      // soft center line
      ctx.strokeStyle = 'rgba(62,174,147,0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
    }

    function roundRect(c, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath(); c.fill();
    }

    raf = requestAnimationFrame(draw);

    return {
      canvas,
      setMode(m) { mode = m; },
      setActive(v) { active = !!v; },
      dispose() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); host.innerHTML = ''; },
    };
  }
  global.mountWaveform = mountWaveform;
})(window);
