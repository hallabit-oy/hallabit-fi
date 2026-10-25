/* Vieritys valitsee vaiheen. Uusi kuva tulee päälle, vanha pysyy peittävänä kunnes uusi on valmis. */
(function () {
  document.querySelectorAll('.story').forEach(function (story) {
    var shots = story.querySelectorAll('.body img'), steps = story.querySelectorAll('.steps article'), dotsBox = story.querySelector('.dots');
    if (!shots.length || !steps.length) return;
    shots.forEach(function () { if (dotsBox) dotsBox.appendChild(document.createElement('i')); });
    var cur = -1;
    function show(n) {
      if (n === cur) return;
      shots.forEach(function (s, i) { s.classList.remove('prev'); if (i === cur) s.classList.add('prev'); s.classList.toggle('on', i === n); });
      var old = cur; cur = n;
      setTimeout(function () { if (cur === n && shots[old]) shots[old].classList.remove('prev'); }, 380);
      steps.forEach(function (a, i) { a.classList.toggle('on', i === n); });
      if (dotsBox) for (var i = 0; i < dotsBox.children.length; i++) dotsBox.children[i].classList.toggle('on', i === n);
    }
    show(0);
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (l) { l.forEach(function (x) { if (x.isIntersecting) show(+x.target.getAttribute('data-i')); }); }, { rootMargin: '-42% 0px -42% 0px' });
    steps.forEach(function (a) { io.observe(a); });
  });
})();
