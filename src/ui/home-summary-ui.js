/**
 * Modules the home summary cards render through window.GATHER_UI_COMPONENTS.
 *
 * The home memo card reuses the memo page's MemoCard (ui-calendar-core) together with its icons,
 * capsule badges, link previews, share modal and file attachments. Since boot stopped importing
 * the shared UI modules all at once, nothing loaded them on the home screen, so the card fell
 * back to a bare title button. Load exactly that set once the home summary is on screen (after
 * the first paint, not in the boot path) and re-render when it is ready.
 */
const loaders = [
  () => import('./ui-icons.js'),
  () => import('./ui-widgets.js'),
  () => import('./ui-shared.js'),
  () => import('./ui-misc.js'),
  () => import('./ui-remaining.js'),
  () => import('./ui-chat-sheets.js'),
  () => import('./ui-chat-files.js'),
  () => import('./ui-calendar-core.js'),
];

let loadPromise = null;
let loaded = false;

export function loadHomeSummaryUi() {
  if (!loadPromise) {
    loadPromise = Promise.all(loaders.map(load => load()))
      .then(() => { loaded = true; })
      .catch(error => {
        loadPromise = null;
        console.error('[home] summary UI chunks failed to load', error);
        throw error;
      });
  }
  return loadPromise;
}

function isHomeSummaryUiReady() {
  return loaded || typeof (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.MemoCard) === 'function';
}

export function useHomeSummaryUi(React) {
  const [ready, setReady] = React.useState(isHomeSummaryUiReady);
  React.useEffect(() => {
    if (ready) return undefined;
    let active = true;
    loadHomeSummaryUi().then(() => { if (active) setReady(true); }).catch(() => {});
    return () => { active = false; };
  }, [ready]);
  return ready;
}
