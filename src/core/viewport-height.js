// Bottom toolbar / FAB keyboard-gap offset (--v2-toolbar-bottom-offset, consumed by .bp-fab).
// Right after an app switch -- opening the installed iOS app from a push notification, coming
// back from the background, a rotation -- WebKit can report a stale, short visualViewport
// (WebKit bug 254868) and may fire no resize once it settles. Measuring that as a keyboard gap
// floated the FAB halfway up the screen. So: only follow a keyboard-sized gap while a text
// control is focused, ignore any unfocused gap in an installed app (it has no browser chrome),
// and re-measure on every "the app is back" signal plus a few late passes while it settles.

export const KEYBOARD_GAP_MIN_PX = 180;
export const SETTLE_DELAYS_MS = [100, 350, 800, 1500];
const NON_TEXT_INPUTS = ['checkbox', 'radio', 'range', 'color', 'file', 'hidden', 'button', 'submit', 'reset', 'image'];

// True when the focused element can hold the software keyboard.
export function isTextEntryFocused(el, body = null) {
  if (!el || el === body) return false;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName || '');
  if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'IFRAME') return true;
  if (tag !== 'INPUT') return false;
  return !NON_TEXT_INPUTS.includes(String(el.type || 'text').toLowerCase());
}

// Pure decision: how far the visible viewport's bottom sits above the layout viewport's.
export function toolbarKeyboardGap({ innerHeight, vvHeight, offsetTop = 0, textFocused = false, standalone = false }) {
  const gap = Math.max(0, (Number(innerHeight) || 0) - (Number(vvHeight) || 0) - (Number(offsetTop) || 0));
  if (textFocused) return Math.round(gap);
  // Unfocused: never a keyboard. A browser tab may still show a bottom toolbar (Android
  // Chrome/Samsung, < KEYBOARD_GAP_MIN_PX); an installed app has none, so any gap is stale.
  if (standalone || gap > KEYBOARD_GAP_MIN_PX) return 0;
  return Math.round(gap);
}

export function isStandaloneDisplay(win) {
  try {
    return win.navigator?.standalone === true || !!(win.matchMedia && (
      win.matchMedia('(display-mode: standalone)').matches || win.matchMedia('(display-mode: fullscreen)').matches
    ));
  } catch (_) {
    return false;
  }
}

// Wires the offset to the DOM; returns a cleanup function (React effect friendly).
export function installToolbarOffsetSync(win, doc) {
  const vv = win && win.visualViewport;
  if (!vv || !doc) return undefined;
  let raf = null;
  let timers = [];
  const measure = () => {
    raf = null;
    const gap = toolbarKeyboardGap({
      innerHeight: win.innerHeight, vvHeight: vv.height, offsetTop: vv.offsetTop,
      textFocused: isTextEntryFocused(doc.activeElement, doc.body), standalone: isStandaloneDisplay(win),
    });
    doc.documentElement.style.setProperty('--v2-toolbar-bottom-offset', `${gap}px`);
  };
  const onChange = () => {
    if (raf) win.cancelAnimationFrame(raf);
    raf = win.requestAnimationFrame(measure);
  };
  const clearTimers = () => { timers.forEach(id => win.clearTimeout(id)); timers = []; };
  const settle = () => {
    onChange();
    clearTimers();
    timers = SETTLE_DELAYS_MS.map(ms => win.setTimeout(onChange, ms));
  };
  const onVisibility = () => { if (doc.visibilityState !== 'hidden') settle(); };
  // sw.js posts this to an already-open window when a notification is tapped.
  const onSwMessage = (event) => { if (event?.data?.type === 'notification-open') settle(); };
  let sw = null;
  try { sw = win.navigator?.serviceWorker || null; } catch (_) { sw = null; }
  const winEvents = [['resize', onChange], ['orientationchange', settle], ['pageshow', settle], ['focus', settle]];
  const docEvents = [['focusout', settle], ['visibilitychange', onVisibility]];
  vv.addEventListener('resize', onChange);
  vv.addEventListener('scroll', onChange);
  winEvents.forEach(([type, fn]) => win.addEventListener(type, fn));
  docEvents.forEach(([type, fn]) => doc.addEventListener(type, fn));
  if (sw && typeof sw.addEventListener === 'function') sw.addEventListener('message', onSwMessage);
  measure();
  settle();
  return () => {
    if (raf) win.cancelAnimationFrame(raf);
    clearTimers();
    vv.removeEventListener('resize', onChange);
    vv.removeEventListener('scroll', onChange);
    winEvents.forEach(([type, fn]) => win.removeEventListener(type, fn));
    docEvents.forEach(([type, fn]) => doc.removeEventListener(type, fn));
    if (sw && typeof sw.removeEventListener === 'function') sw.removeEventListener('message', onSwMessage);
  };
}
