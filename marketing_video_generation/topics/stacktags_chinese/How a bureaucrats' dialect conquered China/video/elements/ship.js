/* ============================================================
   Stacktags video element (this topic) — PORTUGUESE SHIP → CHINA
   A cut-out caravel sails over a live 3D globe: out of the Indian
   Ocean, through the Strait of Malacca, on to South China. The globe
   (mounted by app.js) rotates so India faces the viewer first, then
   China — and the turquoise route is drawn ON the globe surface itself
   (globe.js drawRoute/revealRoute), so it rotates with the globe.
   When the ship reaches China it scales down and disappears, and a
   Portuguese building rises in its place at China. Then MANDARIN slides
   in from the top while the whole globe stage slides down.
   Cue-driven: show() · sail() · arrive() · mandarin().
   ============================================================ */
(function (global) {
  class StacktagsShip {
    constructor(host) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.el = document.createElement('div');
      this.el.className = 'ship-scene';
      this.el.innerHTML =
        `<div class="ship-stage">`
        + `<div class="ship-globe-host"></div>`     // live globe (route is drawn on it)
        + `<img class="ship-img" src="assets/photos/caravel_cut.png" alt="">`
        + `<img class="ship-building" src="assets/photos/portuguese_building_cut.png" alt="">`
        + `</div>`
        + `<div class="ship-mandarin"><span class="mand-word">MANDARIN</span></div>`;
      (this.host || document.body).appendChild(this.el);
    }
    show() { this.el.classList.remove('sail', 'arrived', 'mandarin'); void this.el.offsetWidth; this.el.classList.add('in'); }
    sail() { this.el.classList.add('sail'); }
    arrive() { this.el.classList.add('arrived'); }    // ship shrinks + vanishes, building rises at China
    mandarin() { this.el.classList.add('mandarin'); } // globe stage slides down, MANDARIN drops from top
    showArrived() { this.el.classList.add('in', 'sail', 'arrived'); }
    reset() { this.el.classList.remove('in', 'sail', 'arrived', 'mandarin'); }
  }
  global.StacktagsShip = StacktagsShip;
})(window);
