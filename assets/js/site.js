const Site = (() => {
  const languages = [
    { code: 'en', label: 'EN', name: 'English', href: '/en/' },
    { code: 'de', label: 'DE', name: 'Deutsch', href: '/de/' }
  ];

  const sections = [
    { id: 'about', label: 'About', href: '/en/about.html' },
    { id: 'research', label: 'Research', href: '/en/research.html' },
    { id: 'publications', label: 'Publications', href: '/en/publications.html' },
    { id: 'talks', label: 'Talks', href: '/en/talks.html' },
    { id: 'teaching', label: 'Teaching', href: '/en/teaching.html' },
    { id: 'service', label: 'Service', href: '/en/service.html' },
    { id: 'notes', label: 'Notes', href: '/en/notes.html' }
  ];

  function currentLang() {
    return document.body.dataset.lang || 'en';
  }

  function currentPage() {
    return document.body.dataset.page || 'home';
  }

  function pathPrefix() {
    const depth = (window.location.pathname.match(/\//g) || []).length;
    if (window.location.pathname.endsWith('/')) return '../';
    return '../';
  }

  function makeHeader() {
    const headerTarget = document.getElementById('site-header');
    if (!headerTarget) return;

    const lang = currentLang();
    const page = currentPage();
    const navLinks = sections.map(section => {
      const current = page === section.id ? ' aria-current="page"' : '';
      return `<a href="${section.href}"${current}>${section.label}</a>`;
    }).join('');

    const languageLinks = languages.map(item => {
      const current = lang === item.code ? ' aria-current="page"' : '';
      return `<a href="${item.href}" lang="${item.code}" title="${item.name}"${current}>${item.label}</a>`;
    }).join('');

    headerTarget.outerHTML = `
      <header class="site-header" id="site-header">
        <div class="header-inner">
          <a class="brand" href="/en/" aria-label="Edgar Onea homepage">
            <strong>Edgar Onea</strong>
            <span>Semantics · Pragmatics · Discourse</span>
          </a>
          <button class="menu-button" type="button" aria-expanded="false" aria-controls="nav-wrap">Menu</button>
          <div class="nav-wrap" id="nav-wrap">
            <nav class="primary-nav" aria-label="Main navigation">${navLinks}</nav>
            <nav class="language-nav" aria-label="Language navigation">${languageLinks}</nav>
          </div>
        </div>
      </header>`;
  }

  function makeFooter() {
    const footerTarget = document.getElementById('site-footer');
    if (!footerTarget) return;
    const year = new Date().getFullYear();
    footerTarget.outerHTML = `
      <footer class="site-footer" id="site-footer">
        <div class="footer-inner">
          <div>© ${year} Edgar Onea. Static website prototype.</div>
          <div><a href="mailto:edgar.onea@uni-graz.at">edgar.onea@uni-graz.at</a> · <a href="https://homepage.uni-graz.at/de/edgar.onea-gaspar/">University profile</a></div>
        </div>
      </footer>`;
  }

  function setupMenu() {
    const header = document.querySelector('.site-header');
    const button = document.querySelector('.menu-button');
    if (!header || !button) return;
    button.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function init() {
    makeHeader();
    makeFooter();
    setupMenu();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Site.init);
