/* Solmut asetellaan kokonaisille pikseleille kerran ja koon muuttuessa (ei murtopikseleitä, joten teksti ja reunat pysyvät terävinä).
   Liike: kaksi erillistä akselia eri jaksolla (.nw = y, .n = x), sinikäyrämäinen ease-in-out, ei pysähdyksiä. Kaikki CSS:ää. */
(function () {
  var DUR = [[9.3, 12.1], [10.7, 8.9], [8.1, 11.3], [12.7, 9.7], [9.9, 13.1], [11.1, 8.3], [10.3, 12.9]];
  document.querySelectorAll('.net').forEach(function (net) {
    var nodes = [].slice.call(net.querySelectorAll('.n')), core = net.querySelector('.core');
    var ring = nodes.filter(function (n) { return n !== core; }), lines = [], first = net.querySelector('svg');
    var team = net.classList.contains('team'), TP = [[.2,.26],[.5,.26],[.8,.26],[.35,.76],[.65,.76]], TPN = [[.27,.15],[.73,.15],[.27,.45],[.73,.45],[.5,.8]], free = team || net.classList.contains('free'), FP = [[.1,.3],[.3,.22],[.5,.32],[.7,.22],[.9,.3],[.2,.76],[.4,.82],[.6,.76],[.8,.82]], FPN = [[.27,.07],[.73,.17],[.27,.27],[.73,.37],[.27,.47],[.73,.57],[.27,.67],[.73,.77],[.27,.87]];
    var nd = parseFloat(getComputedStyle(net).getPropertyValue('--nd')) || 1;
    ring.forEach(function () { var l = document.createElement('i'); l.className = 'ln'; net.insertBefore(l, first); lines.push(l); });
    nodes.forEach(function (n, i) {
      /* .more-sisältö on valmiiksi omassa div-kääreessään (rivin korkeus 0fr -> 1fr) */
      var w = document.createElement('div'); w.className = 'nw'; net.insertBefore(w, n); w.appendChild(n);
      var d = DUR[i % DUR.length]; n.style.setProperty('--dx', (d[0] * nd).toFixed(1) + 's'); n.style.setProperty('--ox', (-i * 2.3).toFixed(1) + 's');
      w.style.setProperty('--dy', (d[1] * nd).toFixed(1) + 's'); w.style.setProperty('--oy', (-i * 3.1).toFixed(1) + 's');
    });
    var W = 0, H = 0;
    function px(v) { return Math.round(v); }
    function layout() {
      W = net.clientWidth; H = net.clientHeight;
      var narrow = W < 640, SL = [[.5,.05],[.72,.2],[.72,.36],[.72,.64],[.72,.8],[.3,.8],[.3,.64],[.3,.36],[.3,.2]], rx = W * (narrow ? .32 : .38), ry = H * (narrow ? .42 : .38);
      nodes.forEach(function (n, i) {
        var cx, cy;
        if (n === core) { cx = W / 2; cy = H / 2; } else { var k = ring.indexOf(n), a = -Math.PI / 2 + (k + (narrow ? .5 : 0)) * 2 * Math.PI / ring.length; cx = W / 2 + Math.cos(a) * rx; cy = H / 2 + Math.sin(a) * ry; if (narrow && ring.length === 9) { cx = W * SL[k][0]; cy = H * SL[k][1]; } lines[k].style.transform = 'translate3d(' + px(W / 2) + 'px,' + px(H / 2) + 'px,0) rotate(' + Math.atan2(cy - H / 2, cx - W / 2).toFixed(4) + 'rad) scaleX(' + Math.hypot(cx - W / 2, cy - H / 2).toFixed(1) + ')'; }
        if (free) { var P = team ? (narrow ? TPN : TP) : (narrow ? FPN : FP); cx = W * P[k][0]; cy = H * P[k][1]; }
        var cs = getComputedStyle(n), w = parseFloat(cs.getPropertyValue('--w')) || n.offsetWidth, ow = parseFloat(cs.getPropertyValue('--ow')) || w;
        var h = n.offsetHeight;
        n._cx = cx; n._cy = cy; n._w = w; n._ow = ow; n._h = h;
        n.style.left = px(cx - w / 2) + 'px'; n.style.top = px(cy - h / 2) + 'px';
        var g = n.cloneNode(true); g.classList.add('ghost', 'open'); g.removeAttribute('tabindex'); g.style.width = ow + 'px'; g.style.left = '0'; g.style.top = '0'; net.appendChild(g);
        n._oh = g.offsetHeight; net.removeChild(g);
      });
    }
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(net); else addEventListener('resize', layout);
    function open(n) {
      nodes.forEach(function (o) { if (o !== n) close(o); });
      var dw = n._ow - n._w, dx = -dw / 2, pad = 26, left = n._cx - n._ow / 2, right = n._cx + n._ow / 2;
      var nr = net.getBoundingClientRect(), lo = Math.max(-pad, 28 - nr.left), hi = Math.min(W + pad, document.documentElement.clientWidth - 28 - nr.left);
      if (left < lo) dx += lo - left; else if (right > hi) dx -= right - hi;
      var dy = -(n._oh - n._h) / 2, top = n._cy - n._oh / 2, bot = n._cy + n._oh / 2;
      if (top < pad) dy += pad - top; else if (bot > H - pad) dy -= bot - H + pad;
      var wr = n.parentNode; clearTimeout(wr._t); wr.classList.remove('fall'); wr.classList.add('top');
      n.style.translate = px(dx) + 'px ' + px(dy) + 'px'; n.classList.add('open'); net.classList.add('has-open');
    }
    function close(n) {
      if (!n.classList.contains('open')) return;
      var wr = n.parentNode; wr.classList.remove('top'); wr.classList.add('fall'); wr._t = setTimeout(function () { wr.classList.remove('fall'); }, 600);
      n.classList.remove('open'); n.style.translate = '';
      if (!net.querySelector('.n.open')) net.classList.remove('has-open');
    }
    nodes.forEach(function (n) {
      n.tabIndex = 0;
      n.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') open(n); });
      n.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') close(n); });
      n.addEventListener('focus', function () { if (n.matches(':focus-visible')) open(n); }); n.addEventListener('blur', function () { close(n); });
      /* kosketus: napautus avaa ja sulkee (hover puuttuu, eikä Safari kohdista div-elementtiä napautuksella) */
      n.addEventListener('pointerdown', function (e) { n._pt = e.pointerType; });
      n.addEventListener('click', function () { if (n._pt === 'mouse') return; if (n.classList.contains('open')) close(n); else open(n); });
    });
    document.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && !e.target.closest('.net .n')) nodes.forEach(close); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (l) { net.classList.toggle('off', !l[0].isIntersecting); }).observe(net);
  });
})();

/* Tekijäkortit: paikallaan oleva ruudukko, kortti kasvaa auki hoverilla, kohdistuksella tai napautuksella */
(function () {
  document.querySelectorAll('.tgrid').forEach(function (g) {
    var cs = [].slice.call(g.querySelectorAll('.tc'));
    function open(c) { cs.forEach(function (o) { if (o !== c) o.classList.remove('open'); }); c.classList.add('open'); g.classList.add('has-open'); }
    function close(c) { c.classList.remove('open'); if (!g.querySelector('.tc.open')) g.classList.remove('has-open'); }
    cs.forEach(function (c) {
      c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') open(c); });
      c.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') close(c); });
      c.addEventListener('focus', function () { if (c.matches(':focus-visible')) open(c); });
      c.addEventListener('blur', function () { close(c); });
      c.addEventListener('pointerdown', function (e) { c._pt = e.pointerType; });
      c.addEventListener('click', function () { if (c._pt === 'mouse') return; if (c.classList.contains('open')) close(c); else open(c); });
    });
    document.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && !e.target.closest('.tgrid .tc')) cs.forEach(close); });
  });
})();
