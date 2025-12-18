/*! main.min.js – a11y + lightbox + filter + cookie banner */

// ===== A11Y: Focus-Ring nur bei Tastatur-Nutzung =====
(() => {
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);
})();


// ===== Lightbox (klein & eigenständig) =====
(() => {
  const links = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!links.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lb-backdrop';
  overlay.innerHTML = `
    <img class="lb-img" alt="Media preview">
    <button class="lb-close" aria-label="Close">×</button>
    <button class="lb-prev" aria-label="Previous">‹</button>
    <button class="lb-next" aria-label="Next">›</button>`;
  document.body.appendChild(overlay);

  const img = overlay.querySelector('.lb-img');
  const closeBtn = overlay.querySelector('.lb-close');
  const prevBtn = overlay.querySelector('.lb-prev');
  const nextBtn = overlay.querySelector('.lb-next');

  let group = [], index = 0;

  function open(g, i) {
    group = g; index = i; show();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function show() {
    const href = group[index].getAttribute('href');
    img.src = href;
    const mult = group.length > 1;
    prevBtn.style.display = mult ? '' : 'none';
    nextBtn.style.display = mult ? '' : 'none';
  }
  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight' && group.length > 1) { index = (index + 1) % group.length; show(); }
    if (e.key === 'ArrowLeft'  && group.length > 1) { index = (index - 1 + group.length) % group.length; show(); }
  });
  prevBtn.addEventListener('click', () => { index = (index - 1 + group.length) % group.length; show(); });
  nextBtn.addEventListener('click', () => { index = (index + 1) % group.length; show(); });

  const groupsByName = links.reduce((acc, a) => {
    const n = a.dataset.lightbox || 'default';
    (acc[n] = acc[n] || []).push(a);
    return acc;
  }, {});
  Object.values(groupsByName).forEach(g =>
    g.forEach((a, i) => a.addEventListener('click', ev => { ev.preventDefault(); open(g, i); }))
  );
})();



// ===== Portfolio Filter =====
document.addEventListener('DOMContentLoaded', () => {
  const gridItems = Array.from(document.querySelectorAll('.mh-grid > .col'));
  const bar = document.querySelector('.filter-bar');
  if (!bar || !gridItems.length) return;

  // ===== Hero-Carousel: auf Filter reagieren =====
  const heroEl = document.querySelector('#hero');
  const heroCarousel = heroEl ? bootstrap.Carousel.getOrCreateInstance(heroEl) : null;
  const heroItems = heroEl ? Array.from(heroEl.querySelectorAll('.carousel-item')) : [];

  function showHeroForFilter(val) {
    if (!heroCarousel || !heroItems.length) return;
    const f = (val || 'all').toLowerCase();

    if (f === 'all') {
      // Slideshow wieder automatisch laufen lassen
      heroCarousel.cycle();
      return;
    }

    // Slideshow pausieren und zur passenden Slide springen
    heroCarousel.pause();

    // 1) Bevorzugt die als 'repräsentativ' markierte Slide der Kategorie
    let idx = heroItems.findIndex(it => {
      const cats = (it.dataset.cats || '').toLowerCase().split(',').map(s => s.trim());
      return cats.includes(f) && it.dataset.rep === 'true';
    });

    // 2) Fallback: irgendeine Slide der Kategorie
    if (idx === -1) {
      idx = heroItems.findIndex(it => {
        const cats = (it.dataset.cats || '').toLowerCase().split(',').map(s => s.trim());
        return cats.includes(f);
      });
    }

    if (idx >= 0) {
      heroCarousel.to(idx);
    }
  }

  const setActive = (val) => {
    bar.querySelectorAll('[data-filter]').forEach(btn => {
      const isActive = btn.dataset.filter === val || (val === 'all' && btn.dataset.filter === 'all');
      btn.classList.toggle('active', isActive);
      if (isActive) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
  };

  const applyFilter = (val) => {
    const f = (val || 'all').toLowerCase();
    gridItems.forEach(item => {
      const cats = (item.dataset.cats || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      const show = f === 'all' ? true : cats.includes(f);
      item.classList.toggle('d-none', !show);
    });
    setActive(f);
  };

  const updateHash = (val) => {
    const base = location.pathname + location.search;
    const newHash = (val && val !== 'all') ? '#filter=' + encodeURIComponent(val) : '';
    history.replaceState(null, '', base + newHash);
  };

  // Clicks
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    e.preventDefault();
    const val = btn.dataset.filter;
    applyFilter(val);
    updateHash(val);
    showHeroForFilter(val); // <- reacts hero
  });

  // Initial from URL hash (#filter=...)
  const initial = (() => {
    const m = location.hash.match(/filter=([^&]+)/i);
    return m ? decodeURIComponent(m[1]) : 'all';
  })();
  applyFilter(initial);
  showHeroForFilter(initial); // <- set hero on load
});
