// Keeps <meta name="theme-color"> in step with what sits right under the status bar.
//
// index.html ships a single static purple (#4F46E5). Safari (iOS 15+) and Android Chrome tint
// the status-bar / top browser strip with it, so in dark mode the strip stayed purple above a
// lime hero or a black page header. The color now follows the theme and the page: the home tab
// opens on the hero slab (purple in light, Theme 2 lime in dark), every other tab on its own
// page header (white in light, near-black in dark).
const THEME_COLORS = {
  light: { home: '#4F46E5', page: '#FFFFFF' },
  dark: { home: '#C9FD58', page: '#0D0D0D' }
};

export function resolveThemeColor(theme, isHome) {
  const palette = THEME_COLORS[theme === 'dark' ? 'dark' : 'light'];
  return isHome ? palette.home : palette.page;
}

function currentTheme(doc) {
  return doc.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
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

// Applies now and again whenever <html data-theme> flips. Returns a cleanup function.
export function syncThemeColor(isHome, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || !doc.documentElement) return () => {};
  const apply = () => writeThemeColor(doc, resolveThemeColor(currentTheme(doc), isHome));
  apply();
  if (typeof MutationObserver !== 'function') return () => {};
  const observer = new MutationObserver(apply);
  observer.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
