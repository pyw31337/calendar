/**
 * Exit motion for modal / bottom-sheet overlays.
 *
 * Every overlay in the app is unmounted by React the moment it closes, so the entrance could
 * animate (CSS keyframes on mount) but the exit was a one-frame disappearance. Changing each of
 * the ~50 overlay call sites to delay its unmount would touch the date modal, lightbox, chat and
 * settlement flows one by one; instead this watches the DOM and, when an overlay element is
 * removed, puts that same (already detached) element back for one short exit animation, then
 * removes it for good.
 *
 * The returned "ghost" is inert (no clicks, no focus, hidden from assistive tech), so the
 * unmounted component's handlers can never run again, and it never outlives `durationMs`.
 * Nothing happens when the user asks for reduced motion, when the overlay was replaced by an
 * identical one in the same commit (a re-key would otherwise double the backdrop), or when the
 * overlay went away together with its parent (a page switch).
 */

export const EXIT_OVERLAY_SELECTOR = '.modal-overlay, .bottom-sheet-overlay, .lightbox-overlay';
const GHOST_CLASS = 'is-exit-ghost';
const RECENT_SCROLL_LIMIT = 24;

export function installOverlayExitMotion(doc = typeof document !== 'undefined' ? document : null, {
  durationMs = 240,
  isEnabled = () => true,
  schedule = (fn, ms) => setTimeout(fn, ms),
} = {}) {
  if (!doc || !doc.body || typeof MutationObserver === 'undefined') return () => {};
  const view = doc.defaultView || null;
  const reducedMotion = view && typeof view.matchMedia === 'function'
    ? view.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  // A detached element forgets its scroll offset, so the ghost would jump back to the top of a
  // long sheet while it fades. Remember the last few scrolled elements and restore them.
  const recentScroll = [];
  const onScroll = (event) => {
    const target = event.target;
    if (!target || target.nodeType !== 1) return;
    const existing = recentScroll.findIndex(entry => entry.el === target);
    if (existing >= 0) recentScroll.splice(existing, 1);
    recentScroll.push({ el: target, top: target.scrollTop, left: target.scrollLeft });
    if (recentScroll.length > RECENT_SCROLL_LIMIT) recentScroll.shift();
  };
  doc.addEventListener('scroll', onScroll, { capture: true, passive: true });

  const showGhost = (node, parent, nextSibling) => {
    node.classList.add(GHOST_CLASS);
    node.setAttribute('aria-hidden', 'true');
    node.inert = true;
    const anchor = nextSibling && nextSibling.parentNode === parent ? nextSibling : null;
    parent.insertBefore(node, anchor);
    // Only the dim layer fades; the sheet itself slides out opaque (CSS, .is-exit-ghost).
    // Overlay backgrounds are pinned with !important in the stylesheets, which beats a CSS
    // animation but not an inline !important declaration.
    if (!node.classList.contains('lightbox-overlay') && view && typeof view.getComputedStyle === 'function') {
      const bg = view.getComputedStyle(node).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        node.style.setProperty('background-color', bg, 'important');
        node.style.setProperty('transition', `background-color ${durationMs - 20}ms ease-out`, 'important');
        void node.offsetWidth;
        node.style.setProperty('background-color', 'transparent', 'important');
      }
    }
    recentScroll.forEach(entry => {
      if (entry.el !== node && node.contains(entry.el)) {
        entry.el.scrollTop = entry.top;
        entry.el.scrollLeft = entry.left;
      }
    });
    schedule(() => { if (node.parentNode) node.parentNode.removeChild(node); }, durationMs);
  };

  const observer = new MutationObserver((mutations) => {
    if ((reducedMotion && reducedMotion.matches) || !isEnabled()) return;
    const added = [];
    mutations.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) added.push(n); }));
    mutations.forEach((m) => {
      if (!m.target || !m.target.isConnected) return;
      m.removedNodes.forEach((node) => {
        if (node.nodeType !== 1 || node.classList.contains(GHOST_CLASS)) return;
        if (typeof node.matches !== 'function' || !node.matches(EXIT_OVERLAY_SELECTOR)) return;
        if (node.isConnected) return; // moved, not removed
        if (added.some(el => el !== node && el.className === node.className && el.parentNode === m.target)) return;
        showGhost(node, m.target, m.nextSibling);
      });
    });
  });
  observer.observe(doc.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    doc.removeEventListener('scroll', onScroll, { capture: true });
  };
}
