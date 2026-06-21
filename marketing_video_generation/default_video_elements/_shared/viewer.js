/* ============================================================
   Stacktags video elements — STANDALONE VIEWER
   Drop <script src=".../_shared/viewer.js"></script> at the END of any
   element's demo.html. It adds a ▶ Play / ↻ Replay button — the demo does
   NOT play on its own. Clicking reloads the page and plays once (a clean
   reset every time), playing the demo's declared sounds (window.DEMO.sfx)
   in sync. Each sfx entry: { sound:'swoosh'|'ticking', t:<sec>, vol:<0..1> }.

   The MP4 render pipeline calls window.__demoPlay() directly (no ?play
   param) and ignores this button.
   ============================================================ */
(function () {
  var me = document.currentScript;
  var base = (me && me.src ? me.src : '').replace(/[^/]+$/, '');   // …/_shared/
  var SND = { swoosh: base + 'sound/swoosh.ogg', ticking: base + 'sound/tickingtimeline.mp3' };

  function playSfx() {
    var demo = window.DEMO || {};
    (demo.sfx || []).forEach(function (s) {
      var url = s.sound ? SND[s.sound] : s.src;
      if (!url) return;
      setTimeout(function () {
        try { var a = new Audio(url); a.volume = (s.vol != null ? s.vol : 0.8); a.play().catch(function () {}); } catch (e) {}
      }, (s.t || 0) * 1000);
    });
  }

  function runPlay() {
    var demo = window.DEMO || {};
    var settle = demo.settleMs != null ? demo.settleMs : 300;
    Promise.race([
      (window.__demoReady || Promise.resolve()),
      new Promise(function (r) { setTimeout(r, 9000); })
    ]).then(function () {
      setTimeout(function () { try { if (window.__demoPlay) window.__demoPlay(); } catch (e) {} playSfx(); }, settle);
    });
  }

  var playing = new URLSearchParams(location.search).has('play');
  var btn = document.createElement('button');
  btn.textContent = playing ? '↻ Replay' : '▶ Play';
  btn.style.cssText = [
    'position:fixed', 'left:50%', 'bottom:30px', 'transform:translateX(-50%)',
    'z-index:99999', 'border:0', 'cursor:pointer', 'background:#35A292', 'color:#fff',
    'font-family:Inter,system-ui,sans-serif', 'font-weight:700', 'font-size:19px',
    'padding:15px 38px', 'border-radius:999px', 'box-shadow:0 12px 26px rgba(53,162,146,.42)'
  ].join(';');
  btn.onclick = function () { var u = new URL(location.href); u.searchParams.set('play', Date.now()); location.href = u.href; };

  function mount() { (document.body || document.documentElement).appendChild(btn); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  if (playing) runPlay();
})();
