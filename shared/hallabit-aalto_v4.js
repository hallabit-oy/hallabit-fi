/*
HallaBit aalto v4, HAL-25 27.11.2026 (Halla). Luonnos, go: ei vielä.
Pystysuora koodisade utuaallon sisällä, ylhäältä alas. Ei ulkoisia riippuvuuksia.
- kaksi syvyystasoa: taaempi himmeä pienempi merkistö ja etummainen terävämpi
- jokaisella jonolla kirkas jäänvalkoinen kärkimerkki ja tasaisesti hiipuva häntä
- merkit pysyvät sarakkeen riveillä ja vaihtuvat välillä, kärki liukuu portaattomasti
- sade syttyy navy-yläreunasta ja liukenee alareunan aaltomaiseen utuun
- prefers-reduced-motion: reduce piirtää yhden pysäytyskuvan, ei animaatiosilmukkaa
- v4 (Ville 27.11.2026 klo 22.05): ylä- ja alareunassa merkit tulevat esiin ja liukenevat pehmeästi sumeina.
  Jokainen merkki jaetaan kahdelle kankaalle: terävälle ja sen alla olevalle sumealle (CSS blur).
  Osuus sumealle kasvaa yläreunaa ja alareunan aaltoutua kohti, joten merkki tarkentuu tullessaan ja sumenee lähtiessään.
*/
(function () {
  'use strict';
  var kankaat = document.querySelectorAll('canvas.hb4-sade');
  if (!kankaat.length || !window.requestAnimationFrame) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var TAU = Math.PI * 2;
  var FONTTI = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace';
  var MERKIT = '01010101010101010101' + '0123456789ABCDEF' + '{}[]<>/=+*;:#';

  function satunnainen(siemen) {
    var a = siemen >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function sstep(a, b, x) { var t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

  /* koko px, rako = sarakeväli, rivi = rivikorkeus, v = nopeus px/s, hanta = hännän pituus riveinä */
  var TASOT = [
    { koko: 10, rako: 12, rivi: 12, v: [22, 40], hanta: [8, 16], a: 0.36, karki: [188, 218, 250], vari: [92, 144, 206], tasa: [66, 114, 180] },
    { koko: 12, rako: 17, rivi: 15, v: [38, 70], hanta: [9, 19], a: 0.64, karki: [214, 234, 254], vari: [118, 176, 236], tasa: [78, 132, 200] },
    { koko: 15, rako: 23, rivi: 18, v: [60, 115], hanta: [12, 24], a: 1.0, karki: [246, 251, 255], vari: [156, 208, 255], tasa: [92, 152, 222] }
  ];

  function Sade(kangas) {
    this.c = kangas; this.ctx = kangas.getContext('2d');
    /* v4: sumea sisarkangas terävän alle */
    var su = document.createElement('canvas');
    su.className = 'hb4-sade hb4-sade-sumea';
    su.setAttribute('aria-hidden', 'true');
    kangas.parentNode.insertBefore(su, kangas);
    this.cs = su; this.ctxS = su.getContext('2d');
    this.W = 0; this.H = 0; this.tasot = []; this.nakyy = true; this.kaynnissa = false;
  }
  Sade.prototype.rakenna = function () {
    var rect = this.c.getBoundingClientRect();
    var W = Math.max(1, Math.round(rect.width)), H = Math.max(1, Math.round(rect.height));
    if (W === this.W && H === this.H) return false;
    this.W = W; this.H = H;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.c.width = Math.round(W * dpr); this.c.height = Math.round(H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cs.width = this.c.width; this.cs.height = this.c.height;
    this.ctxS.setTransform(dpr, 0, 0, dpr, 0, 0);
    var r = satunnainen(4049 + W);
    this.r = r;
    this.tasot = [];
    for (var ti = 0; ti < TASOT.length; ti++) {
      var T = TASOT[ti], n = Math.ceil(W / T.rako) + 1, sar = [];
      var rivit = Math.ceil(H / T.rivi) + 3;
      for (var i = 0; i < n; i++) {
        var s = {
          x: (i + [0.2, 0.55, 0.4][ti]) * T.rako,
          siirto: r() * T.rivi,
          merkit: new Uint8Array(rivit),
          rivit: rivit
        };
        for (var q = 0; q < rivit; q++) s.merkit[q] = (r() * MERKIT.length) | 0;
        this.uusiJono(s, T, true);
        sar.push(s);
      }
      this.tasot.push({ T: T, sar: sar });
    }
    return true;
  };
  Sade.prototype.uusiJono = function (s, T, alku) {
    var r = this.r, H = this.H;
    s.v = T.v[0] + r() * (T.v[1] - T.v[0]);
    s.hanta = Math.round(T.hanta[0] + r() * (T.hanta[1] - T.hanta[0]));
    s.y = alku ? (r() * (H * 1.5 + s.hanta * T.rivi) - H * 0.4) : -(r() * H * 0.35) - T.rivi;
    s.viimeRivi = Math.floor((s.y - s.siirto) / T.rivi);
  };
  /* Alareunan aaltomainen uturaja: sade liukenee tähän, utu peittää sen alle */
  Sade.prototype.utuRaja = function (x, t) {
    var H = this.H, W = this.W;
    var l1 = Math.max(W * 0.9, 560), l2 = Math.max(W * 0.38, 260);
    return H * (0.70 + 0.055 * Math.sin(TAU * x / l1 + 0.9 + t * 0.21) + 0.032 * Math.sin(TAU * x / l2 + 2.3 - t * 0.17));
  };
  Sade.prototype.piirraUtu = function (t) {
    var ctx = this.ctx, W = this.W, H = this.H, N = 36, leveys = Math.max(52, H * 0.22), aste = 20;
    var pisteet = [];
    for (var x = -aste; x <= W + aste; x += aste) pisteet.push([x, this.utuRaja(x, t) + H * 0.02]);
    var g = ctx.createLinearGradient(0, H * 0.45, 0, H);
    g.addColorStop(0, 'rgb(214,231,248)');
    g.addColorStop(0.6, 'rgb(230,239,250)');
    g.addColorStop(1, 'rgb(238,244,251)');
    ctx.fillStyle = g;
    var edellinen = 0;
    for (var k = 1; k <= N; k++) {
      var C = sstep(0, 1, k / N), a = (C - edellinen) / (1 - edellinen);
      edellinen = C;
      var dy = -leveys * 0.65 + (k / N) * leveys;
      ctx.globalAlpha = Math.min(1, a);
      ctx.beginPath();
      ctx.moveTo(pisteet[0][0], pisteet[0][1] + dy);
      for (var i = 1; i < pisteet.length - 1; i++) {
        var mx = (pisteet[i][0] + pisteet[i + 1][0]) / 2, my = (pisteet[i][1] + pisteet[i + 1][1]) / 2 + dy;
        ctx.quadraticCurveTo(pisteet[i][0], pisteet[i][1] + dy, mx, my);
      }
      ctx.lineTo(W + aste, H + 2); ctx.lineTo(-aste, H + 2); ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  Sade.prototype.piirra = function (t, dt) {
    var ctx = this.ctx, W = this.W, H = this.H, r = this.r;
    var cs = this.ctxS;
    ctx.clearRect(0, 0, W, H); cs.clearRect(0, 0, W, H);
    ctx.textAlign = cs.textAlign = 'center';
    ctx.textBaseline = cs.textBaseline = 'middle';
    for (var ti = 0; ti < this.tasot.length; ti++) {
      var taso = this.tasot[ti], T = taso.T;
      ctx.font = cs.font = (ti === 2 ? '500 ' : '400 ') + T.koko + 'px ' + FONTTI;
      for (var c = 0; c < taso.sar.length; c++) {
        var s = taso.sar[c];
        if (dt > 0) {
          s.y += s.v * dt;
          var nyt = Math.floor((s.y - s.siirto) / T.rivi);
          while (s.viimeRivi < nyt) {
            s.viimeRivi++;
            if (s.viimeRivi >= 0 && s.viimeRivi < s.rivit) s.merkit[s.viimeRivi] = (r() * MERKIT.length) | 0;
          }
          if (r() < dt * 2.2) {
            var mr = nyt - 1 - ((r() * s.hanta) | 0);
            if (mr >= 0 && mr < s.rivit) s.merkit[mr] = (r() * MERKIT.length) | 0;
          }
          if (s.y - s.hanta * T.rivi > H + T.rivi) this.uusiJono(s, T, false);
        }
        var raja = this.utuRaja(s.x, t);
        var karkiRivi = Math.floor((s.y - s.siirto) / T.rivi);
        for (var h = 0; h <= s.hanta + 1; h++) {
          var rivi = karkiRivi - h;
          if (rivi < 0 || rivi >= s.rivit) continue;
          var y = rivi * T.rivi + s.siirto + T.rivi * 0.5;
          if (y < -T.rivi || y > H + T.rivi) continue;
          var ika = (s.y - s.siirto - rivi * T.rivi) / T.rivi;
          var hanta = 1 - ika / (s.hanta + 1);
          if (hanta <= 0) continue;
          var verho = sstep(H * 0.01, H * 0.27, y) * (1 - sstep(raja - H * 0.26, raja + H * 0.03, y));
          /* sumeus 0..1: yläreunan 25 %:n vyöhyke ja alareunan aaltoudun edessä oleva vyöhyke */
          var sumeus = Math.max(1 - sstep(H * 0.05, H * 0.27, y), sstep(raja - H * 0.30, raja - H * 0.04, y));
          var al = T.a * Math.pow(hanta, 1.5) * verho;
          if (al < 0.012) continue;
          var col;
          if (ika < 1) { col = T.karki; al = T.a * verho * Math.min(1, 0.35 + ika); }
          else if (ika < 2.2) { var u = (ika - 1) / 1.2; col = [T.karki[0] + (T.vari[0] - T.karki[0]) * u, T.karki[1] + (T.vari[1] - T.karki[1]) * u, T.karki[2] + (T.vari[2] - T.karki[2]) * u]; }
          else { var w = Math.min(1, (ika - 2.2) / (s.hanta * 0.6)); col = [T.vari[0] + (T.tasa[0] - T.vari[0]) * w, T.vari[1] + (T.tasa[1] - T.vari[1]) * w, T.vari[2] + (T.tasa[2] - T.vari[2]) * w]; }
          var rgb = 'rgba(' + (col[0] | 0) + ',' + (col[1] | 0) + ',' + (col[2] | 0) + ',', mk = MERKIT.charAt(s.merkit[rivi]);
          var aT = al * (1 - sumeus), aS = al * Math.min(1, sumeus * 1.15);
          if (aT > 0.012) { ctx.fillStyle = rgb + aT.toFixed(3) + ')'; ctx.fillText(mk, s.x, y); }
          if (aS > 0.012) { cs.fillStyle = rgb + aS.toFixed(3) + ')'; cs.fillText(mk, s.x, y); }
        }
      }
    }
    this.piirraUtu(t);
  };
  Sade.prototype.aja = function () {
    var self = this;
    if (this.kaynnissa) return;
    this.kaynnissa = true;
    var edel = 0;
    function askel(ms) {
      if (!self.kaynnissa) return;
      var t = ms / 1000, dt = edel ? Math.min(0.05, t - edel) : 0;
      edel = t;
      self.piirra(t, dt);
      requestAnimationFrame(askel);
    }
    requestAnimationFrame(askel);
  };
  Sade.prototype.paivita = function () {
    var liike = !(mq && mq.matches);
    if (liike && this.nakyy && !document.hidden) this.aja();
    else { this.kaynnissa = false; this.piirra(liike ? performance.now() / 1000 : 0, 0); }
  };

  var sateet = [];
  for (var i = 0; i < kankaat.length; i++) { var s = new Sade(kankaat[i]); s.rakenna(); sateet.push(s); }
  function kaikki() { for (var i = 0; i < sateet.length; i++) sateet[i].paivita(); }
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () {
      for (var i = 0; i < sateet.length; i++) if (sateet[i].rakenna() && !sateet[i].kaynnissa) sateet[i].paivita();
    });
    for (i = 0; i < sateet.length; i++) ro.observe(sateet[i].c);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ent) {
      for (var i = 0; i < ent.length; i++) for (var j = 0; j < sateet.length; j++) if (sateet[j].c === ent[i].target) { sateet[j].nakyy = ent[i].isIntersecting; sateet[j].paivita(); }
    }, { rootMargin: '120px 0px' });
    for (i = 0; i < sateet.length; i++) io.observe(sateet[i].c);
  }
  document.addEventListener('visibilitychange', kaikki);
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', kaikki); else if (mq.addListener) mq.addListener(kaikki); }
  kaikki();
})();
