/* HallaLink- (.n.core) ja HallaBit-solmuilla (.n.kt) on yksi yhteinen liukuväri, sama kuin sivun --frost
   (v2b-paletti: #0B2A5B vasemmalla, vaaleampi sininen oikealla). Tausta mitoitetaan molempien solmujen yhteiseen alueeseen ja
   kumpikin solmu näyttää siitä oman kohtansa, joten väri jatkuu saumatta laatikosta toiseen.
   Ajetaan net.js:n jälkeen; lasketaan uudelleen koon muuttuessa ja solmun avautuessa. */
(function () {
  var IMG = 'linear-gradient(100deg,#0B2A5B 0%,#154A8A 55%,#2E6FB5 100%)';
  document.querySelectorAll('.net').forEach(function (net) {
    var core = net.querySelector('.n.core'), kt = net.querySelector('.n.kt');
    if (!core || !kt) return;
    function box(n) {
      var l = parseFloat(n.style.left) || 0, t = parseFloat(n.style.top) || 0;
      var w = Math.max(n._ow || 0, n.offsetWidth), h = Math.max(n._oh || 0, n.offsetHeight);
      return { l: l, t: t, r: l + w, b: t + h };
    }
    function paint() {
      var a = box(core), b = box(kt);
      var L = Math.min(a.l, b.l), T = Math.min(a.t, b.t), W = Math.max(a.r, b.r) - L, H = Math.max(a.b, b.b) - T;
      [core, kt].forEach(function (n) {
        n.style.backgroundImage = IMG;
        n.style.backgroundRepeat = 'no-repeat';
        n.style.backgroundSize = Math.round(W) + 'px ' + Math.round(H) + 'px';
        n.style.backgroundPosition = Math.round(L - (parseFloat(n.style.left) || 0)) + 'px ' + Math.round(T - (parseFloat(n.style.top) || 0)) + 'px';
      });
    }
    paint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(paint); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { requestAnimationFrame(paint); }).observe(net);
    new MutationObserver(function () { requestAnimationFrame(paint); }).observe(net, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
})();
