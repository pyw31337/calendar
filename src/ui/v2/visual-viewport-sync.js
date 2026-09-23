/**
 * Pin V2 chrome to the visual viewport and keep lightbox overlays flush.
 * Side-effect import from view-data.js (loaded with RenewalAppShell).
 */
(function syncVisualViewport() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let raf = 0;
  const root = document.documentElement;

  const apply = () => {
    const vv = window.visualViewport;
    const height = Math.max(1, Math.round(vv?.height || window.innerHeight || root.clientHeight || 0));
    const offsetTop = Math.max(0, Math.round(vv?.offsetTop || 0));
    const offsetLeft = Math.round(vv?.offsetLeft || 0);
    root.style.setProperty('--app-vv-height', `${height}px`);
    root.style.setProperty('--app-vv-offset-top', `${offsetTop}px`);
    root.style.setProperty('--app-vv-offset-left', `${offsetLeft}px`);

    // Keep portaled lightbox overlays inside the visual viewport.
    document.body.querySelectorAll(':scope > .lightbox-overlay').forEach(overlay => {
      overlay.style.setProperty('width', '100vw', 'important');
      overlay.style.setProperty('max-width', 'none', 'important');
      overlay.style.setProperty('height', `${height}px`, 'important');
      overlay.style.setProperty('min-height', `${height}px`, 'important');
      overlay.style.setProperty('top', `${offsetTop}px`, 'important');
      overlay.style.setProperty('left', '0', 'important');
    });
  };

  const onVp = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  };

  const start = () => {
    apply();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVp);
      window.visualViewport.addEventListener('scroll', onVp);
    }
    window.addEventListener('resize', onVp);
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onVp);
      window.visualViewport.removeEventListener('scroll', onVp);
    }
    window.removeEventListener('resize', onVp);
    root.style.removeProperty('--app-vv-height');
    root.style.removeProperty('--app-vv-offset-top');
    root.style.removeProperty('--app-vv-offset-left');
  };

  const syncActive = () => {
    if (root.classList.contains('v2-html-active')) start();
    else stop();
  };

  syncActive();
  new MutationObserver(syncActive).observe(root, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(apply).observe(document.body, { childList: true });
})();
