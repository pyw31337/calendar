import { SETTLE_DELAYS_MS } from './viewport-height.js';

export function readAppVvHeight(win = typeof window !== 'undefined' ? window : null, doc = typeof document !== 'undefined' ? document : null) {
  try {
    const synced = Number.parseFloat(doc?.documentElement?.style?.getPropertyValue('--app-vv-height') || '');
    if (Number.isFinite(synced) && synced > 0) return synced;
  } catch (_) {}
  const vv = win?.visualViewport;
  if (vv && typeof vv.height === 'number' && vv.height > 0) return vv.height;
  if (win && typeof win.innerHeight === 'number' && win.innerHeight > 0) return win.innerHeight;
  return 0;
}

export function readAppVvWidth(win = typeof window !== 'undefined' ? window : null) {
  const vv = win?.visualViewport;
  if (vv && typeof vv.width === 'number' && vv.width > 0) return vv.width;
  if (win && typeof win.innerWidth === 'number' && win.innerWidth > 0) return win.innerWidth;
  return 0;
}

/** pageshow / visibilitychange / focus / notification-open (+ resize). */
export function subscribeAppVvRemeasure(onRemeasure, win = typeof window !== 'undefined' ? window : null, doc = typeof document !== 'undefined' ? document : null) {
  if (!win || typeof onRemeasure !== 'function') return undefined;
  let raf = null;
  let timers = [];
  const run = () => { raf = null; onRemeasure(); };
  const schedule = () => {
    if (raf && typeof win.cancelAnimationFrame === 'function') win.cancelAnimationFrame(raf);
    raf = typeof win.requestAnimationFrame === 'function' ? win.requestAnimationFrame(run) : (run(), null);
  };
  const clearTimers = () => { timers.forEach(id => win.clearTimeout && win.clearTimeout(id)); timers = []; };
  const settle = () => {
    schedule();
    clearTimers();
    if (typeof win.setTimeout === 'function') timers = SETTLE_DELAYS_MS.map(ms => win.setTimeout(schedule, ms));
  };
  const onVisibility = () => { if (!doc || doc.visibilityState !== 'hidden') settle(); };
  const onSwMessage = (event) => { if (event?.data?.type === 'notification-open') settle(); };
  let sw = null;
  try { sw = win.navigator?.serviceWorker || null; } catch (_) { sw = null; }
  const vv = win.visualViewport;
  const winEvents = [['resize', schedule], ['orientationchange', settle], ['pageshow', settle], ['focus', settle]];
  if (vv?.addEventListener) { vv.addEventListener('resize', schedule); vv.addEventListener('scroll', schedule); }
  winEvents.forEach(([type, fn]) => win.addEventListener(type, fn));
  if (doc?.addEventListener) doc.addEventListener('visibilitychange', onVisibility);
  if (sw?.addEventListener) sw.addEventListener('message', onSwMessage);
  settle();
  return () => {
    if (raf && typeof win.cancelAnimationFrame === 'function') win.cancelAnimationFrame(raf);
    clearTimers();
    if (vv?.removeEventListener) { vv.removeEventListener('resize', schedule); vv.removeEventListener('scroll', schedule); }
    winEvents.forEach(([type, fn]) => win.removeEventListener(type, fn));
    if (doc?.removeEventListener) doc.removeEventListener('visibilitychange', onVisibility);
    if (sw?.removeEventListener) sw.removeEventListener('message', onSwMessage);
  };
}
