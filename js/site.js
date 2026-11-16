// Apply the saved choice before the page paints; light is the default.
(() => {
  const root = document.documentElement;
  let theme = 'light';
  try {
    theme = localStorage.getItem('portfolio-theme') === 'dark' ? 'dark' : 'light';
  } catch { /* Storage can be unavailable in private or local-file sessions. */ }
  root.dataset.theme = theme;

  document.addEventListener('DOMContentLoaded', () => {
    // Configure each case study's URLs on its <body> element.
    const projectUrls = {
      demo: document.body.dataset.demoUrl,
      repository: document.body.dataset.repositoryUrl,
    };
    let hasProjectLinks = false;
    for (const [kind, value] of Object.entries(projectUrls)) {
      let url = '';
      try {
        const parsed = new URL(value?.trim());
        if (['https:', 'http:'].includes(parsed.protocol)) url = parsed.href;
      } catch { /* Empty or invalid URLs leave their controls hidden. */ }
      for (const link of document.querySelectorAll(`[data-project-link="${kind}"]`)) {
        if (url) link.href = url;
        else link.removeAttribute('href');
        link.hidden = !url;
      }
      const card = document.querySelector(`[data-project-resource="${kind}"]`);
      if (card) card.hidden = !url;
      hasProjectLinks ||= Boolean(url);
    }
    for (const container of document.querySelectorAll('[data-project-links]')) {
      container.hidden = !hasProjectLinks;
    }
    const resourceGrid = document.querySelector('[data-project-resource-grid]');
    if (resourceGrid) resourceGrid.classList.toggle('single-resource',
      resourceGrid.querySelectorAll('[data-project-resource]:not([hidden])').length === 1);

    const toggle = document.querySelector('.theme-toggle');
    const topLink = document.querySelector('.back-to-top');
    const navLinks = [...document.querySelectorAll('.portfolio-nav .nav-link')];
    const sections = ['top', 'projects', 'client-work', 'about', 'contact']
      .map(id => document.getElementById(id)).filter(Boolean);
    const header = document.querySelector('.site-header');

    function updateToggle() {
      const dark = root.dataset.theme === 'dark';
      toggle?.setAttribute('aria-pressed', String(dark));
      toggle?.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
      if (toggle) toggle.title = `Switch to ${dark ? 'light' : 'dark'} mode`;
    }
    toggle?.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch { }
      updateToggle();
    });
    window.addEventListener('storage', event => {
      if (event.key === 'portfolio-theme') {
        root.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light';
        updateToggle();
      }
    });
    updateToggle();

    function updateScroll() {
      if (topLink) topLink.hidden = window.scrollY <= 200;
      const threshold = (header?.getBoundingClientRect().height || 0) + 100;
      let active = sections[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= threshold) active = section.id;
      }
      if (window.scrollY > 200 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        active = sections.at(-1)?.id;
      }
      for (const link of navLinks) {
        if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
    let pending = false;
    function scheduleScroll() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { updateScroll(); pending = false; });
    }
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll);
    window.addEventListener('pageshow', scheduleScroll);
    updateScroll();
  });
})();
