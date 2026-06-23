/* ============================================================
   Stacktags video — CLOCK / SUN / TIME-ZONE kit (custom for
   "Why all of China runs on one clock"). All factory functions on
   window, white + turquoise, Inter, no borders (the stamp is a solid
   filled object, the sun a single semantic accent like the map pin).
   Every component has an instant path so seeking re-renders end-states.
   ============================================================ */
(function (global) {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (cls, tag) => { const d = document.createElement(tag || 'div'); if (cls) d.className = cls; return d; };

  /* ---------- AnalogClock ---------------------------------------------------
     makeAnalogClock({ size, h, m, theme:'official'|'local'|'ghost', label })
     -> { el, setTime(h,m,{animate,ms}), snap(h,m), setLabel(s) }            */
  global.makeAnalogClock = function (opts = {}) {
    const size = opts.size || 260, theme = opts.theme || 'official';
    let h = opts.h != null ? opts.h : 10, m = opts.m != null ? opts.m : 8;
    const wrap = el('clk clk-' + theme);
    wrap.style.width = size + 'px'; wrap.style.height = size + 'px';
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = i * 30 * Math.PI / 180, maj = i % 3 === 0, r2 = 44, r1 = maj ? 37 : 40;
      ticks += `<line x1="${(50 + Math.sin(a) * r1).toFixed(1)}" y1="${(50 - Math.cos(a) * r1).toFixed(1)}" x2="${(50 + Math.sin(a) * r2).toFixed(1)}" y2="${(50 - Math.cos(a) * r2).toFixed(1)}" class="clk-tick ${maj ? 'maj' : ''}"/>`;
    }
    wrap.innerHTML =
      `<svg viewBox="0 0 100 100" class="clk-svg">
         <circle cx="50" cy="50" r="47.5" class="clk-face"/>
         ${ticks}
         <g class="clk-hour"><line x1="50" y1="54" x2="50" y2="28" class="clk-hand clk-hh"/></g>
         <g class="clk-min"><line x1="50" y1="56" x2="50" y2="17" class="clk-hand clk-mh"/></g>
         <circle cx="50" cy="50" r="3" class="clk-hub"/>
       </svg>` + (opts.label ? `<div class="clk-label">${opts.label}</div>` : '');
    const hG = wrap.querySelector('.clk-hour'), mG = wrap.querySelector('.clk-min');
    function render(animate, ms) {
      const ha = ((h % 12) + m / 60) * 30, ma = (m % 60) * 6;
      [hG, mG].forEach((g) => { g.style.transition = animate ? `transform ${ms}ms cubic-bezier(.2,.8,.2,1)` : 'none'; });
      hG.style.transform = `rotate(${ha}deg)`; mG.style.transform = `rotate(${ma}deg)`;
      if (!animate) void wrap.offsetWidth;
    }
    render(false);
    return {
      el: wrap,
      setTime(nh, nm, o = {}) { h = nh; m = nm == null ? 0 : nm; render(o.animate !== false, o.ms || 650); },
      snap(nh, nm) { h = nh; m = nm == null ? 0 : nm; render(false); },
      setLabel(s) { let l = wrap.querySelector('.clk-label'); if (!l) { l = el('clk-label'); wrap.appendChild(l); } l.textContent = s; },
      setTheme(t) { wrap.classList.remove('clk-official', 'clk-local', 'clk-ghost'); wrap.classList.add('clk-' + t); },
    };
  };

  /* ---------- BeijingStamp --------------------------------------------------
     makeBeijingStamp({ text, sub }) -> { el, slam({onImpact,ms}), showStamped(), reset() } */
  global.makeBeijingStamp = function (opts = {}) {
    const wrap = el('stamp');
    wrap.innerHTML = `<div class="stamp-inner"><div class="stamp-zh cjk">${opts.text || '北京时间'}</div><div class="stamp-sub">${opts.sub || 'UTC+8'}</div></div>`;
    return {
      el: wrap,
      reset() { wrap.classList.remove('slam', 'landed'); },
      showStamped() { wrap.classList.add('slam', 'landed'); },
      slam(o = {}) {
        const ms = o.ms || 520;
        wrap.classList.remove('slam', 'landed'); void wrap.offsetWidth;
        wrap.classList.add('slam');
        setTimeout(() => { wrap.classList.add('landed'); if (o.onImpact) o.onImpact(); }, Math.round(ms * 0.62));
      },
    };
  };

  /* ---------- Caliper (width measure) --------------------------------------
     makeCaliper({ label }) -> { el, open({ms}), showOpen() }                */
  global.makeCaliper = function (opts = {}) {
    const wrap = el('caliper');
    wrap.innerHTML = `<span class="cal-end l"></span><span class="cal-bar"></span><span class="cal-lab">${opts.label || ''}</span><span class="cal-bar"></span><span class="cal-end r"></span>`;
    return {
      el: wrap,
      showOpen() { wrap.classList.add('open'); },
      open() { wrap.classList.remove('open'); void wrap.offsetWidth; wrap.classList.add('open'); },
    };
  };

  /* ---------- TimeZoneBands -------------------------------------------------
     makeTimeZoneBands(mapCtrl, { bands:[{lon0,lon1,h,m}], ghost:true })
     bands span the map's drawn height; each can carry a tiny ghost clock.
     -> { host, wipeIn({stagger}), flushToOne({h,m,ms}), showInstant(), showFlushedInstant() } */
  global.makeTimeZoneBands = function (mapCtrl, opts = {}) {
    const host = el('tzbands');
    const W = mapCtrl.W, H = mapCtrl.H, bb = mapCtrl.bbox;
    const topPct = (bb.oy / H * 100), hPct = (bb.drawH / H * 100);
    const clocks = [];
    const bandEls = [];
    (opts.bands || []).forEach((b, i) => {
      const x0 = mapCtrl.xOfLon(b.lon0), x1 = mapCtrl.xOfLon(b.lon1);
      const band = el('tzband' + (i % 2 ? ' alt' : ''));
      band.style.left = (x0 / W * 100) + '%';
      band.style.width = ((x1 - x0) / W * 100) + '%';
      band.style.top = topPct + '%';
      band.style.height = hPct + '%';
      host.appendChild(band); bandEls.push(band);
      if (opts.ghost) {
        const ck = global.makeAnalogClock({ size: opts.clockSize || 96, theme: 'ghost', h: b.h, m: b.m || 0 });
        ck.el.classList.add('tz-ghost-clk');
        const lp = ((x0 + x1) / 2 / W * 100) + '%';
        const tp = (Math.max(0, bb.oy - (opts.clockSize || 96) * 0.62) / H * 100) + '%';
        ck.el.style.left = lp; ck.el.style.top = tp;
        ck.el.dataset.ol = lp; ck.el.dataset.ot = tp;   // home position, for reset
        host.appendChild(ck.el); clocks.push(ck);
      }
    });
    return {
      host, bands: bandEls, clocks,
      showInstant() { bandEls.forEach((b) => b.classList.add('in')); clocks.forEach((c) => c.el.classList.add('in')); },
      wipeIn(o = {}) {
        const st = o.stagger != null ? o.stagger : 130;
        bandEls.forEach((b, i) => setTimeout(() => b.classList.add('in'), i * st));
        clocks.forEach((c, i) => setTimeout(() => c.el.classList.add('in'), 120 + i * st));
      },
      flushToOne(o = {}) {
        host.classList.add('flush');
        bandEls.forEach((b) => b.classList.add('in', 'one'));
        clocks.forEach((c) => { c.el.classList.add('in'); c.setTime(o.h != null ? o.h : 12, o.m || 0, { animate: o.ms !== 0, ms: o.ms || 420 }); });
      },
      showFlushedInstant(o = {}) {
        host.classList.add('flush');
        bandEls.forEach((b) => b.classList.add('in', 'one'));
        clocks.forEach((c) => { c.el.classList.add('in'); c.snap(o.h != null ? o.h : 12, o.m || 0); });
      },
    };
  };

  /* ---------- Day/Night fill on a country map ------------------------------
     addDayNight(mapCtrl) clips a bright(east)->dark(west) gradient to the
     silhouette. -> { setInstant() } (static; represents one Beijing-noon instant) */
  global.addDayNight = function (mapCtrl, o = {}) {
    const d = mapCtrl.fill.getAttribute('d');
    const gid = 'dn-' + Math.round(performance.now() % 1e6) + '-' + (o.seed || 0);
    const defs = document.createElementNS(NS, 'defs');
    const east = o.brightX != null ? o.brightX : 0.86;   // fraction across the bbox (east bright)
    const west = o.darkX != null ? o.darkX : 0.12;
    defs.innerHTML =
      `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">
         <stop offset="${west}" class="dn-night"/>
         <stop offset="${(west + east) / 2}" class="dn-dusk"/>
         <stop offset="${east}" class="dn-day"/>
       </linearGradient>`;
    mapCtrl.svg.insertBefore(defs, mapCtrl.svg.firstChild);
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('class', 'cn-map-dn'); p.setAttribute('fill', `url(#${gid})`);
    mapCtrl.svg.appendChild(p);                 // above fill, below line
    mapCtrl.svg.appendChild(mapCtrl.line);      // keep outline on top
    return { el: p, setInstant() { p.style.opacity = '1'; } };
  };

  /* ---------- Sun (a turquoise disc you place / glide) ----------------------
     makeSun({ size }) -> { el, place(x,y), glide(x,y,{ms}), setGlow(0..1) }
     x,y are percentages of the host box.                                     */
  global.makeSun = function (opts = {}) {
    const s = opts.size || 120;
    const wrap = el('sun');
    wrap.style.width = s + 'px'; wrap.style.height = s + 'px';
    wrap.innerHTML = `<span class="sun-core"></span><span class="sun-glow"></span>`;
    return {
      el: wrap,
      place(xPct, yPct) { wrap.style.transition = 'none'; wrap.style.left = xPct + '%'; wrap.style.top = yPct + '%'; void wrap.offsetWidth; },
      glide(xPct, yPct, o = {}) {
        const ms = o.ms || 1400;
        wrap.style.transition = `left ${ms}ms cubic-bezier(.45,.05,.3,1), top ${ms}ms cubic-bezier(.45,.05,.3,1)`;
        wrap.style.left = xPct + '%'; wrap.style.top = yPct + '%';
      },
    };
  };

  /* ---------- SunArc — a sky "card" (horizon + sun + day/night) -------------
     makeSunArc({ width, height }) -> { el, setSun(t,{animate,ms}), showInstant(t) }
     t: altitude -0.3..1 (0 = on the horizon, 1 = zenith, <0 below). Sky goes
     night(ink)->dawn->day(white+teal) as t rises. Stars fade out in daylight. */
  global.makeSunArc = function (opts = {}) {
    const wrap = el('sky');
    let stars = '';
    const SP = [[14, 22], [30, 12], [46, 28], [62, 16], [78, 24], [88, 12], [22, 38], [70, 40], [54, 8], [36, 44], [84, 36], [8, 33]];
    SP.forEach(([x, y]) => { stars += `<span class="star" style="left:${x}%;top:${y}%"></span>`; });
    wrap.innerHTML =
      `<div class="sky-grad"></div><div class="sky-stars">${stars}</div>
       <div class="sky-glow"></div><div class="sun-disc"></div><div class="sky-horizon"></div>`;
    const grad = wrap.querySelector('.sky-grad'), sun = wrap.querySelector('.sun-disc'),
      glow = wrap.querySelector('.sky-glow'), starWrap = wrap.querySelector('.sky-stars');
    function apply(t, animate, ms) {
      const lit = Math.max(0, Math.min(1, t));
      // sun rides a shallow arc near centre; below horizon when t<0 (clipped by horizon)
      const yPct = 70 - Math.max(-0.25, t) * 64;     // 0 -> 70% (horizon), 1 -> 6%
      const xPct = 50 + t * 8;
      sun.style.transition = animate ? `top ${ms}ms cubic-bezier(.2,.7,.3,1), left ${ms}ms ease, opacity ${ms}ms ease` : 'none';
      grad.style.transition = glow.style.transition = starWrap.style.transition = animate ? `opacity ${ms}ms ease` : 'none';
      sun.style.left = xPct + '%'; sun.style.top = yPct + '%';
      sun.style.opacity = t < -0.18 ? 0 : 1;
      grad.style.setProperty('--lit', lit.toFixed(3));
      glow.style.opacity = (Math.max(0, 0.5 - Math.abs(t)) * 1.6).toFixed(3);   // brightest near the horizon (dawn)
      starWrap.style.opacity = (1 - lit * 1.4).toFixed(3);
      if (!animate) void wrap.offsetWidth;
    }
    return {
      el: wrap,
      setSun(t, o = {}) { apply(t, o.animate !== false, o.ms || 1500); },
      showInstant(t) { apply(t, false); },
    };
  };
})(window);
