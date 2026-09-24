/**
 * Placeholder components for UI chunks that are not needed to paint the first screen.
 *
 * UI modules register their components on window.GATHER_UI_COMPONENTS and render sites look
 * them up by name. registerLazyUiComponents() puts a small proxy under each name before the
 * boot imports run; the first time a proxy renders it loads the real chunk, then renders the
 * real component with the same props. When the chunk registers itself it replaces the proxy in
 * the registry, so later lookups get the real component directly. main.jsx also prefetches the
 * chunks when the browser is idle, so by the time someone taps a date or a photo the proxy is
 * usually already bypassed.
 */
export function createLazyComponent(React, name, loadChunk, registry = () => window.GATHER_UI_COMPONENTS || {}) {
  function LazyUiComponent(props) {
    const resolve = () => {
      const current = registry()[name];
      return typeof current === 'function' && current !== LazyUiComponent ? current : null;
    };
    const [Real, setReal] = React.useState(() => resolve());
    React.useEffect(() => {
      if (Real) return undefined;
      let alive = true;
      Promise.resolve(loadChunk())
        .then(() => { if (alive) { const next = resolve(); if (next) setReal(() => next); } })
        .catch(err => { try { console.warn(`[lazy-ui] ${name} failed to load:`, err); } catch (_) {} });
      return () => { alive = false; };
    }, [Real]);
    return Real ? React.createElement(Real, props) : null;
  }
  LazyUiComponent.displayName = `Lazy(${name})`;
  LazyUiComponent.__lazyUiProxy = true;
  return LazyUiComponent;
}

/**
 * `specs`: { chunkKey: { load: () => import(...), components: ['DateModal', ...] } }.
 * Returns a prefetch() that loads every chunk once.
 */
export function registerLazyUiComponents(React, specs, target = window) {
  const loaders = {};
  Object.entries(specs).forEach(([key, spec]) => {
    let promise = null;
    loaders[key] = () => {
      if (!promise) promise = spec.load().catch(err => { promise = null; throw err; });
      return promise;
    };
  });
  const proxies = {};
  Object.entries(specs).forEach(([key, spec]) => {
    spec.components.forEach(name => {
      const existing = target.GATHER_UI_COMPONENTS && target.GATHER_UI_COMPONENTS[name];
      if (typeof existing === 'function') return;
      proxies[name] = createLazyComponent(React, name, loaders[key], () => target.GATHER_UI_COMPONENTS || {});
    });
  });
  target.GATHER_UI_COMPONENTS = Object.assign({}, target.GATHER_UI_COMPONENTS || {}, proxies);
  return function prefetchLazyUi() {
    return Promise.allSettled(Object.values(loaders).map(load => load()));
  };
}
