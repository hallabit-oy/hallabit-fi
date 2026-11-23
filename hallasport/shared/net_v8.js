/* Final-2 24.10.2026 (net_v8): himmennys kuten Toimialat-korteissa (koko kortti sumenee 1,5 px ja himmenee .6). Jotta viivat eivät silti näy himmennetyn kortin läpi, jokaisen kortin alla on peittävä taustavärinen alusta (.np), joka on kortin suljetun koon ja paikan kokoinen, leijuu samalla animaatiolla eikä sumene. Avatun kortin alusta piilotetaan.
   Karuselli-v7 24.10.2026: yhdysviivat piirretään SVG-kerrokseen korttien alle (z-index 0). Näkyvä viiva alkaa HallaLink-laatikon reunalta, koska laatikon alue (1 px reunavaralla) on lisäksi maskattu pois viivakerroksesta, joten viivaa ei voi näkyä laatikon sisällä missään tilassa. Keskilaatikko ei leiju, jotta reuna pysyy viivan alkupisteessä.
   Solmut asetellaan kokonaisille pikseleille kerran ja koon muuttuessa (ei murtopikseleitä, joten teksti ja reunat pysyvät terävinä).
   Liike: kaksi erillistä akselia eri jaksolla (.nw = y, .n = x), sinikäyrämäinen ease-in-out, ei pysähdyksiä. Kaikki CSS:ää.
   Kapeassa näkymässä (alle kahden kortin levyinen kaavio) kortit pinotaan yhteen sarakkeeseen, ks. setPino. */
(function () {
  var DUR = [[9.3, 12.1], [10.7, 8.9], [8.1, 11.3], [12.7, 9.7], [9.9, 13.1], [11.1, 8.3], [10.3, 12.9]];
  document.querySelectorAll('.net').forEach(function (net) {
    var nodes = [].slice.call(net.querySelectorAll('.n')), core = net.querySelector('.core');
    var ring = nodes.filter(function (n) { return n !== core; }), lines = [], first = net.querySelector('svg');
    var team = net.classList.contains('team'), TP = [[.2,.26],[.5,.26],[.8,.26],[.35,.76],[.65,.76]], TPN = [[.27,.15],[.73,.15],[.27,.45],[.73,.45],[.5,.8]], free = team || net.classList.contains('free'), FP = [[.1,.3],[.3,.22],[.5,.32],[.7,.22],[.9,.3],[.2,.76],[.4,.82],[.6,.76],[.8,.82]], FPN = [[.27,.07],[.73,.17],[.27,.27],[.73,.37],[.27,.47],[.73,.57],[.27,.67],[.73,.77],[.27,.87]];
    var nd = parseFloat(getComputedStyle(net).getPropertyValue('--nd')) || 1;
    var NS = 'http://www.w3.org/2000/svg', svg = first, mrect = null, uid = 'lnm' + Math.random().toString(36).slice(2, 8);
    if (svg && core && !net.classList.contains('free') && !net.classList.contains('team')) {
      svg.setAttribute('class', 'lnl'); svg.setAttribute('focusable', 'false');
      var defs = document.createElementNS(NS, 'defs'), mask = document.createElementNS(NS, 'mask'), mall = document.createElementNS(NS, 'rect');
      mask.setAttribute('id', uid); mask.setAttribute('maskUnits', 'userSpaceOnUse');
      mall.setAttribute('x', '-2000'); mall.setAttribute('y', '-2000'); mall.setAttribute('width', '6000'); mall.setAttribute('height', '6000'); mall.setAttribute('fill', '#fff');
      mrect = document.createElementNS(NS, 'rect'); mrect.setAttribute('fill', '#000');
      mask.appendChild(mall); mask.appendChild(mrect); defs.appendChild(mask); svg.appendChild(defs);
      var g = document.createElementNS(NS, 'g'); g.setAttribute('mask', 'url(#' + uid + ')'); svg.appendChild(g);
      ring.forEach(function () { var l = document.createElementNS(NS, 'line'); g.appendChild(l); lines.push(l); });
    } else { ring.forEach(function () { lines.push(null); }); }
    nodes.forEach(function (n, i) {
      /* .more-sisältö on valmiiksi omassa div-kääreessään (rivin korkeus 0fr -> 1fr) */
      var w = document.createElement('div'); w.className = n === core ? 'nw nw-core' : 'nw'; net.insertBefore(w, n); w.appendChild(n);
      var d = DUR[i % DUR.length]; n.style.setProperty('--dx', (d[0] * nd).toFixed(1) + 's'); n.style.setProperty('--ox', (-i * 2.3).toFixed(1) + 's');
      w.style.setProperty('--dy', (d[1] * nd).toFixed(1) + 's'); w.style.setProperty('--oy', (-i * 3.1).toFixed(1) + 's');
      if (mrect) { var pl = document.createElement('i'); pl.className = 'np'; pl.setAttribute('aria-hidden', 'true'); pl.style.setProperty('--dx', n.style.getPropertyValue('--dx')); pl.style.setProperty('--ox', n.style.getPropertyValue('--ox')); w.insertBefore(pl, n); n._np = pl; }
    });
    function plates() {
      nodes.forEach(function (n) { var pl = n._np; if (!pl || n.classList.contains('open')) return;
        if (pino) { pl.style.display = 'none'; return; } pl.style.display = '';
        pl.style.left = n.offsetLeft + 'px'; pl.style.top = n.offsetTop + 'px'; var br = n.getBoundingClientRect(); pl.style.width = br.width + 'px'; pl.style.height = br.height + 'px';
        pl.style.borderRadius = getComputedStyle(n).borderTopLeftRadius; });
    }
    var W = 0, H = 0;
    function px(v) { return Math.round(v); }
    var pino = false;
    /* Kapea näkymä (esim. puhelin 200 % zoomilla): kun kaksi korttia ei mahdu rinnakkain, kortit pinotaan yhteen sarakkeeseen (HallaLink ensin), jotta ne eivät mene päällekkäin eivätkä leikkaudu reunoilta. Viivat piilotetaan pinossa. */
    function setPino(on) {
      if (on === pino) return; pino = on; net.classList.toggle('pino', on);
      
    }
    function layout() {
      if (!free && core) {
        var W0 = net.clientWidth;
        if (!pino) { var sw = parseFloat(getComputedStyle(ring[0]).getPropertyValue('--w')) || ring[0].offsetWidth; net._pinoRaja = 2 * sw + 3 * 12; }
        setPino(W0 < (net._pinoRaja || 300));
      }
      if (pino) { layoutPino(); return; }
      W = net.clientWidth; H = net.clientHeight;
      var narrow = W < 640, SL = [[.5,.05],[.72,.2],[.72,.36],[.72,.64],[.72,.8],[.3,.8],[.3,.64],[.3,.36],[.3,.2]], rx = W * (narrow ? .32 : .38), ry = H * (narrow ? .42 : .38);
      nodes.forEach(function (n, i) {
        var cx, cy;
        if (n === core) { cx = W / 2; cy = H / 2; } else { var k = ring.indexOf(n), a = -Math.PI / 2 + (k + (narrow ? .5 : 0)) * 2 * Math.PI / ring.length; cx = W / 2 + Math.cos(a) * rx; cy = H / 2 + Math.sin(a) * ry; if (narrow && ring.length === 9) { cx = W * SL[k][0]; cy = H * SL[k][1]; } }
        if (free) { var P = team ? (narrow ? TPN : TP) : (narrow ? FPN : FP); cx = W * P[k][0]; cy = H * P[k][1]; }
        var cs = getComputedStyle(n), w = parseFloat(cs.getPropertyValue('--w')) || n.offsetWidth, ow = parseFloat(cs.getPropertyValue('--ow')) || w;
        var h = n.offsetHeight;
        n._cx = cx; n._cy = cy; n._w = w; n._ow = ow; n._h = h;
        n.style.left = px(cx - w / 2) + 'px'; n.style.top = px(cy - h / 2) + 'px';
        var g = n.cloneNode(true); g.classList.add('ghost', 'open'); g.removeAttribute('tabindex'); g.style.width = ow + 'px'; g.style.left = '0'; g.style.top = '0'; net.appendChild(g);
        n._oh = g.offsetHeight; net.removeChild(g);
      });
      /* viivat: alku keskilaatikon reunalla (laatikon todellinen reunalaatikko), loppu kortin keskellä kortin alla (offsetLeft sisältää sivun margin-left-siirrot) */
      if (mrect && core) {
        var cl = parseFloat(core.style.left) || 0, ct = parseFloat(core.style.top) || 0, cw = core.offsetWidth, ch = core.offsetHeight, ccx = cl + cw / 2, ccy = ct + ch / 2;
        var rr = parseFloat(getComputedStyle(core).borderTopLeftRadius) || 0;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
        /* maski 1 px laatikkoa suurempi: viiva päättyy reunan ulkopuolelle, joten edes reunan reunanpehmennyspikseleissä ei ole viivaa */
        mrect.setAttribute('x', cl - 1); mrect.setAttribute('y', ct - 1); mrect.setAttribute('width', cw + 2); mrect.setAttribute('height', ch + 2); mrect.setAttribute('rx', rr + 1);
        ring.forEach(function (n, k) {
          var l = lines[k]; if (!l) return;
          var ex = n.offsetLeft + n.offsetWidth / 2, ey = n.offsetTop + n.offsetHeight / 2, dx = ex - ccx, dy = ey - ccy, t = Math.min(dx ? (cw / 2 - rr) / Math.abs(dx) : 1e9, dy ? (ch / 2 - rr) / Math.abs(dy) : 1e9); t = Math.max(t, 0); /* alku laatikon sisällä (maskin alla), näkyvä viiva alkaa maskin reunalta */
          l.setAttribute('x1', (ccx + dx * t).toFixed(1)); l.setAttribute('y1', (ccy + dy * t).toFixed(1)); l.setAttribute('x2', ex.toFixed(1)); l.setAttribute('y2', ey.toFixed(1));
        });
      }
      plates();
    }
    function layoutPino() {
      /* pinossa kortit ovat tavallisessa sarakevirrassa (CSS .net.pino), joten avattu kortti työntää seuraavia alas ilman laskentaa */
      W = net.clientWidth; nodes.forEach(function (n) { n.style.left = ''; n.style.top = ''; n.style.translate = ''; }); plates();
    }
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(net); else addEventListener('resize', layout);
    function open(n) {
      nodes.forEach(function (o) { if (o !== n) close(o); });
      if (pino) {
        var wp = n.parentNode; clearTimeout(wp._t); wp.classList.remove('fall'); wp.classList.add('top');
        n.classList.add('open'); if (n._np) n._np.classList.add('auki'); net.classList.add('has-open'); return;
      }
      var dw = n._ow - n._w, dx = -dw / 2, pad = 26, left = n._cx - n._ow / 2, right = n._cx + n._ow / 2;
      var nr = net.getBoundingClientRect(), lo = Math.max(-pad, 28 - nr.left), hi = Math.min(W + pad, document.documentElement.clientWidth - 28 - nr.left);
      if (left < lo) dx += lo - left; else if (right > hi) dx -= right - hi;
      var dy = -(n._oh - n._h) / 2, top = n._cy - n._oh / 2, bot = n._cy + n._oh / 2;
      if (top < pad) dy += pad - top; else if (bot > H - pad) dy -= bot - H + pad;
      var wr = n.parentNode; clearTimeout(wr._t); wr.classList.remove('fall'); wr.classList.add('top');
      n.style.translate = px(dx) + 'px ' + px(dy) + 'px'; n.classList.add('open'); if (n._np) n._np.classList.add('auki'); net.classList.add('has-open');
    }
    function close(n) {
      if (!n.classList.contains('open')) return;
      var wr = n.parentNode; wr.classList.remove('top'); wr.classList.add('fall'); wr._t = setTimeout(function () { wr.classList.remove('fall'); }, 600);
      n.classList.remove('open'); n.style.translate = ''; if (n._np) n._np.classList.remove('auki');
      if (!net.querySelector('.n.open')) { net.classList.remove('has-open'); }
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
