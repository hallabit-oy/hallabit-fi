/* HallaBit evästesuostumus ja Meta Pixel, v1 26.10.2026.
   Oma skripti, ei kolmannen osapuolen suostumustyökalua.
   Metan pikseli (fbevents.js) ladataan VAIN, kun kävijä on hyväksynyt markkinointievästeet.
   Ei noscript-kuvapikseliä. Ainoa tapahtuma on PageView kerran sivunäyttöä kohden.
   Valinta tallennetaan localStorageen avaimella hb_consent: {"v":1,"valinta":"hyvaksytty"|"hylatty","pvm":"YYYY-MM-DD"}.
   Valinta kysytään uudelleen 12 kuukauden kuluttua.
   Kieli: tekstit valitaan <html lang> mukaan (fi tai en). Suomenkielinen tuloste on sama kuin ennen. */
(function () {
  'use strict';
  var PIXEL_ID = '1134712148925126';
  var AVAIN = 'hb_consent';
  var VOIMASSA_PV = 365;
  var skripti = document.currentScript;
  var tietosuojaUrl = (skripti && skripti.getAttribute('data-tietosuoja')) || 'tietosuoja.html';
  var pikseliLadattu = false;
  var banneri = null;
  var edellinenFokus = null;
  var KIELI = String(document.documentElement.getAttribute('lang') || 'fi').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'fi';
  var KUUKAUDET_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var T = {
    fi: {
      otsikko: 'Evästeet',
      teksti: 'Sivusto toimii ilman evästeitä. Jos hyväksyt markkinointievästeet, sivu lataa Metan pikselin, jolla kohdistamme markkinointia Facebookissa ja Instagramissa sivuilla käyneille. ' +
        'Voit muuttaa valintaa sivun alareunan Evästeasetukset-linkistä. ',
      linkki: 'Lue tietosuojasta',
      hyvaksy: 'Hyväksy markkinointievästeet',
      hylkaa: 'Vain välttämättömät',
      nykyinen: 'Nykyinen valinta: ',
      hyvaksytty: 'markkinointievästeet hyväksytty',
      hylatty: 'vain välttämättömät'
    },
    en: {
      otsikko: 'Cookies',
      teksti: 'The website works without cookies. If you accept marketing cookies, the page loads the Meta Pixel, which we use to target marketing on Facebook and Instagram to people who have visited the website. ' +
        'You can change your choice using the Cookie settings link at the bottom of the page. ',
      linkki: 'Read the privacy notice',
      hyvaksy: 'Accept marketing cookies',
      hylkaa: 'Necessary only',
      nykyinen: 'Current choice: ',
      hyvaksytty: 'marketing cookies accepted',
      hylatty: 'necessary only'
    }
  }[KIELI];

  function lue() {
    try {
      var o = JSON.parse(localStorage.getItem(AVAIN) || 'null');
      if (!o || (o.valinta !== 'hyvaksytty' && o.valinta !== 'hylatty') || !o.pvm) return null;
      var ika = (Date.now() - new Date(o.pvm + 'T00:00:00').getTime()) / 864e5;
      if (!(ika >= 0 && ika <= VOIMASSA_PV)) return null;
      return o;
    } catch (e) { return null; }
  }
  function tallenna(valinta) {
    var d = new Date();
    var pvm = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var o = { v: 1, valinta: valinta, pvm: pvm };
    try { localStorage.setItem(AVAIN, JSON.stringify(o)); } catch (e) {}
    return o;
  }

  /* Metan virallinen peruskoodi ilman noscript-kuvaa. Ajetaan vain hyväksynnän jälkeen. */
  function lataaPikseli() {
    if (pikseliLadattu) return;
    pikseliLadattu = true;
    if (!window.fbq) {
      var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      var t = document.createElement('script');
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(t, s);
    }
    /* Ei automaattisia lisätapahtumia (painikeklikkaukset, sivun rakennetiedot). */
    window.fbq('set', 'autoConfig', false, PIXEL_ID);
    window.fbq('consent', 'grant');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function poistaMetanEvasteet() {
    var nimet = ['_fbp', '_fbc'];
    var osat = location.hostname.split('.');
    var domainit = [''];
    for (var i = 0; i < osat.length - 1; i++) domainit.push('; domain=.' + osat.slice(i).join('.'));
    nimet.forEach(function (nimi) {
      domainit.forEach(function (dom) {
        document.cookie = nimi + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + dom;
      });
    });
  }

  function lopetaSeuranta() {
    if (pikseliLadattu && window.fbq) {
      try { window.fbq('consent', 'revoke'); } catch (e) {}
    }
    poistaMetanEvasteet();
  }

  function muotoilePvm(iso) {
    var p = iso.split('-');
    if (KIELI === 'en') return parseInt(p[2], 10) + ' ' + KUUKAUDET_EN[parseInt(p[1], 10) - 1] + ' ' + p[0];
    return parseInt(p[2], 10) + '.' + parseInt(p[1], 10) + '.' + p[0];
  }

  var CSS =
    '.hbs{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));max-width:640px;margin:0 auto;' +
    'background:#FFFFFF;color:#24323B;border:1px solid #C5D0CD;border-radius:14px;box-shadow:0 18px 40px -18px rgba(11,42,91,.45),0 4px 12px -6px rgba(11,42,91,.25);' +
    'padding:20px 20px 18px;font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:15px;line-height:1.5;max-height:calc(100vh - 32px);overflow:auto}' +
    '.hbs[hidden]{display:none}' +
    '.hbs h2{margin:0 0 6px;font-size:17px;line-height:1.3;font-weight:700;color:#0B2A5B}' +
    '.hbs h2:focus{outline:none}' +
    '.hbs p{margin:0 0 14px;color:#24323B}' +
    '.hbs .hbs-tila{font-size:14px;color:#4A5A64;margin:-6px 0 14px}' +
    '.hbs a{color:#1B5596;text-decoration:underline;text-underline-offset:3px;font-weight:600}' +
    '.hbs a:focus-visible,.hbs button:focus-visible{outline:3px solid #2E6FB5;outline-offset:2px;border-radius:8px}' +
    '.hbs-napit{display:flex;gap:10px;flex-wrap:wrap}' +
    '.hbs-napit button{flex:1 1 200px;min-height:44px;padding:10px 16px;border-radius:10px;border:2px solid #0B2A5B;background:#0B2A5B;color:#FFFFFF;' +
    'font:inherit;font-weight:700;font-size:15px;cursor:pointer;transition:background-color 160ms,border-color 160ms}' +
    '@media (hover:hover) and (pointer:fine){.hbs-napit button:hover{background:#154A8A;border-color:#154A8A}}' +
    '.hbs-napit button:active{transform:scale(.98)}' +
    '@media (max-width:480px){.hbs{left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));padding:16px 16px 14px;font-size:14px}.hbs h2{font-size:16px}.hbs p{margin-bottom:12px}.hbs-napit{gap:8px}.hbs-napit button{flex-basis:100%}}' +
    '@media (prefers-reduced-motion:reduce){.hbs-napit button{transition:none}.hbs-napit button:active{transform:none}}' +
    'button.hbs-avaa{background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;min-height:44px;min-width:44px;opacity:.85}' +
    'footer.f button.hbs-avaa{color:inherit;text-decoration:underline}' +
    'button.hbs-avaa:hover{text-decoration:underline;text-decoration-thickness:2px}' +
    'button.hbs-avaa:focus-visible{outline:3px solid #7CC0FF;outline-offset:3px;border-radius:2px;opacity:1}' +
    'main button.hbs-avaa{color:#1B5596;font-weight:600;text-decoration:underline;text-underline-offset:3px;opacity:1}' +
    'main button.hbs-avaa:focus-visible{outline-color:#2E6FB5}';

  function lisaaTyyli() {
    if (document.getElementById('hbs-tyyli')) return;
    var st = document.createElement('style');
    st.id = 'hbs-tyyli';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function rakenna() {
    lisaaTyyli();

    banneri = document.createElement('section');
    banneri.className = 'hbs';
    banneri.id = 'hb-evasteet';
    banneri.setAttribute('role', 'region');
    banneri.setAttribute('aria-labelledby', 'hbs-otsikko');
    banneri.setAttribute('aria-describedby', 'hbs-teksti');
    banneri.hidden = true;
    banneri.innerHTML =
      '<h2 id="hbs-otsikko" tabindex="-1">' + T.otsikko + '</h2>' +
      '<p id="hbs-teksti">' + T.teksti + '<a href="' + tietosuojaUrl + '">' + T.linkki + '</a></p>' +
      '<p class="hbs-tila" id="hbs-tila" hidden></p>' +
      '<div class="hbs-napit">' +
      '<button type="button" data-hbs="hyvaksy">' + T.hyvaksy + '</button>' +
      '<button type="button" data-hbs="hylkaa">' + T.hylkaa + '</button>' +
      '</div>';
    /* Ensimmäiseksi bodyyn, jotta näppäimistön käyttäjä tavoittaa sen heti. */
    document.body.insertBefore(banneri, document.body.firstChild);

    banneri.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-hbs]') : null;
      if (!b) return;
      if (b.getAttribute('data-hbs') === 'hyvaksy') {
        tallenna('hyvaksytty');
        lataaPikseli();
      } else {
        tallenna('hylatty');
        lopetaSeuranta();
      }
      sulje();
    });
    banneri.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lue()) { e.preventDefault(); sulje(); }
    });
  }

  function nayta(siirraFokus) {
    if (!banneri) rakenna();
    var o = lue();
    var tila = banneri.querySelector('#hbs-tila');
    if (o) {
      tila.textContent = T.nykyinen + (o.valinta === 'hyvaksytty' ? T.hyvaksytty : T.hylatty) + ' ' + muotoilePvm(o.pvm) + '.';
      tila.hidden = false;
    } else {
      tila.hidden = true;
    }
    banneri.hidden = false;
    if (siirraFokus) {
      edellinenFokus = document.activeElement;
      banneri.querySelector('#hbs-otsikko').focus({ preventScroll: true });
    }
  }
  function sulje() {
    if (!banneri) return;
    var fokusSisalla = banneri.contains(document.activeElement);
    banneri.hidden = true;
    if (fokusSisalla) {
      if (edellinenFokus && document.contains(edellinenFokus)) edellinenFokus.focus({ preventScroll: true });
      else document.body.focus();
    }
    edellinenFokus = null;
  }

  function kaynnista() {
    lisaaTyyli();
    var o = lue();
    if (o && o.valinta === 'hyvaksytty') lataaPikseli();
    else if (o && o.valinta === 'hylatty') poistaMetanEvasteet();
    if (!o) nayta(false);
    var avaajat = document.querySelectorAll('[data-hbs-avaa]');
    for (var i = 0; i < avaajat.length; i++) {
      avaajat[i].setAttribute('aria-controls', 'hb-evasteet');
      avaajat[i].addEventListener('click', function () { nayta(true); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kaynnista);
  else kaynnista();
})();
