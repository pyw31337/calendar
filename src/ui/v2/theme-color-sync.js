// Keeps <meta name="theme-color"> in step with what sits right under the status bar.
//
// index.html ships a single static purple (#4F46E5). Safari (iOS 15+) and Android Chrome tint
// the status-bar / top browser strip with it, so in dark mode the strip stayed purple above a
// lime hero or a black page header. The color now follows the theme and the page: the home tab
// opens on the hero slab (purple in light, Theme 2 lime in dark), every other tab on its own
// page header (white in light, near-black in dark).
// The hero color also follows the color theme's point color (<html data-accent>, color-themes.css).
const THEME_COLORS = {
  light: { home: '#4F46E5', page: '#FFFFFF', accents: { orange: '#F0601A', blue: '#2257E0' } },
  dark: { home: '#C9FD58', page: '#0D0D0D', accents: { orange: '#FF7A1A', blue: '#4DA3FF' } }
};

export function resolveThemeColor(theme, isHome, accent = '') {
  const palette = THEME_COLORS[theme === 'dark' ? 'dark' : 'light'];
  if (!isHome) return palette.page;
  return palette.accents[accent] || palette.home;
}

function currentTheme(doc) {
  return doc.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function currentAccent(doc) {
  return doc.documentElement.getAttribute('data-accent') || '';
}

function writeThemeColor(doc, color) {
  const metas = doc.querySelectorAll('meta[name="theme-color"]');
  if (metas.length === 0) {
    const meta = doc.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    doc.head.appendChild(meta);
    return;
  }
  metas.forEach(meta => {
    if (meta.getAttribute('content') !== color) meta.setAttribute('content', color);
  });
}

// Applies now and again whenever <html data-theme> or data-accent flips. Returns a cleanup function.
export function syncThemeColor(isHome, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || !doc.documentElement) return () => {};
  const apply = () => writeThemeColor(doc, resolveThemeColor(currentTheme(doc), isHome, currentAccent(doc)));
  apply();
  if (typeof MutationObserver !== 'function') return () => {};
  const observer = new MutationObserver(apply);
  observer.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] });
  return () => observer.disconnect();
}
