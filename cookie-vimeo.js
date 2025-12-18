/*! cookie-vimeo.js – Injected banner + consent + Vimeo toggling (EN/DE, fallback via <noscript> only on index) */
(function () {
  'use strict';

  var CONSENT_KEY = 'cookie-consent';

  function byId(id) { return document.getElementById(id); }

  function loadVimeoIframes() {
    document.querySelectorAll('.vimeo-embed').forEach(function (div) {
      var src    = div.getAttribute('data-src');
      if (!src) return;
      var width  = div.getAttribute('data-width')  || '100%';
      var height = div.getAttribute('data-height') || '360';

      var iframe = document.createElement('iframe');
      iframe.setAttribute('src', src);
      iframe.setAttribute('width', width);
      iframe.setAttribute('height', height);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
      // iframe.setAttribute('allowfullscreen', '');
      div.replaceWith(iframe);
    });
  }

  function hideBanner() {
    var banner = byId('cookie-banner');
    if (banner) banner.remove();
  }

  function createBanner() {
    // Root
    var wrapper = document.createElement('div');
    wrapper.id = 'cookie-banner';
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Cookie notice');

    // Language radios (default based on browser)
    var isDE = (navigator.language || navigator.userLanguage || '').toLowerCase().startsWith('de');

    var rEn = document.createElement('input');
    rEn.type = 'radio';
    rEn.name = 'cb-lang';
    rEn.id = 'cb-lang-en';
    rEn.className = 'cb-lang-input';
    if (!isDE) rEn.checked = true;

    var rDe = document.createElement('input');
    rDe.type = 'radio';
    rDe.name = 'cb-lang';
    rDe.id = 'cb-lang-de';
    rDe.className = 'cb-lang-input';
    if (isDE) rDe.checked = true;

    var inner = document.createElement('div');
    inner.className = 'cb-inner';

    // Language switch UI
    var langWrap = document.createElement('div');
    langWrap.className = 'cb-lang';
    langWrap.setAttribute('role', 'group');
    langWrap.setAttribute('aria-label', 'Language');

    var lblEn = document.createElement('label');
    lblEn.className = 'cb-lang-option';
    lblEn.setAttribute('for', 'cb-lang-en');
    var pillEn = document.createElement('span');
    pillEn.className = 'cb-pill';
    pillEn.textContent = 'EN';
    lblEn.appendChild(pillEn);

    var lblDe = document.createElement('label');
    lblDe.className = 'cb-lang-option';
    lblDe.setAttribute('for', 'cb-lang-de');
    var pillDe = document.createElement('span');
    pillDe.className = 'cb-pill';
    pillDe.textContent = 'DE';
    lblDe.appendChild(pillDe);

    langWrap.appendChild(lblEn);
    langWrap.appendChild(lblDe);

    // Text
    var p = document.createElement('p');
    p.className = 'cb-text';

    var spanEn = document.createElement('span');
    spanEn.setAttribute('lang', 'en');
    spanEn.innerHTML = 'We use cookies and embed third-party services (e.g. Vimeo for video playback). ' +
      'These contents will only be loaded after you give your consent. ' +
      'For more information, please see our <a href="datenschutz.html">privacy policy</a>.';

    var spanDe = document.createElement('span');
    spanDe.setAttribute('lang', 'de');
    spanDe.innerHTML = 'Wir verwenden Cookies und binden Dienste Dritter ein (z. B. Vimeo für Videowiedergabe). ' +
      'Erst nach Ihrer Zustimmung werden diese Inhalte geladen. ' +
      'Weitere Infos finden Sie in unserer <a href="datenschutz.html">Datenschutzerklärung</a>.';

    p.appendChild(spanEn);
    p.appendChild(spanDe);

    // Actions
    var actions = document.createElement('div');
    actions.className = 'cb-actions';

    var btnAccept = document.createElement('button');
    btnAccept.id = 'cb-accept';
    btnAccept.className = 'cb-btn accept';
    var accEn = document.createElement('span');
    accEn.setAttribute('lang', 'en');
    accEn.textContent = 'Accept';
    var accDe = document.createElement('span');
    accDe.setAttribute('lang', 'de');
    accDe.textContent = 'Zustimmen';
    btnAccept.appendChild(accEn);
    btnAccept.appendChild(accDe);

    var btnDecline = document.createElement('button');
    btnDecline.id = 'cb-decline';
    btnDecline.className = 'cb-btn decline';
    var decEn = document.createElement('span');
    decEn.setAttribute('lang', 'en');
    decEn.textContent = 'Decline';
    var decDe = document.createElement('span');
    decDe.setAttribute('lang', 'de');
    decDe.textContent = 'Ablehnen';
    btnDecline.appendChild(decEn);
    btnDecline.appendChild(decDe);

    actions.appendChild(btnAccept);
    actions.appendChild(btnDecline);

    inner.appendChild(langWrap);
    inner.appendChild(p);
    inner.appendChild(actions);

    // Compose
    wrapper.appendChild(rEn);
    wrapper.appendChild(rDe);
    wrapper.appendChild(inner);

    // Wire buttons
    btnAccept.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'accept'); } catch (e) {}
      hideBanner();
      loadVimeoIframes();
    });

    btnDecline.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'decline'); } catch (e) {}
      hideBanner();
      // Keep placeholders; nothing else to do
    });

    return wrapper;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var consent = null;
    try { consent = localStorage.getItem(CONSENT_KEY); } catch (e) {}

    if (consent === 'accept') {
      loadVimeoIframes();
      hideBanner(); // In case a server-side fallback was output on non-index by accident
      return;
    }
    if (consent === 'decline') {
      hideBanner();
      return;
    }

    // No decision yet -> inject banner
    // Ensure we don't add two banners if HTML fallback was accidentally kept outside <noscript>.
    if (!document.getElementById('cookie-banner')) {
      document.body.appendChild(createBanner());
    }
  });

  // Direkt-Buttons in Vimeo-Platzhaltern
document.querySelectorAll('.vimeo-embed [data-consent="accept"]').forEach(btn => {
  btn.addEventListener('click', function(e){
    e.preventDefault();
    localStorage.setItem(CONSENT_KEY, 'accept');
    loadVimeoIframes();
  });
});


})();