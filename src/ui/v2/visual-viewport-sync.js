/**
 * Pin V2 chrome to the visual viewport and keep lightbox overlays flush.
 * Side-effect import from chat-bubble-modules.js (loaded with RenewalAppShell).
 */
(function syncVisualViewport() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let raf = 0;
  const root = document.documentElement;

  const apply = () => {
    const vv = window.visualViewport;
    const layoutH = window.innerHeight || root.clientHeight || 0;
    const vvH = Math.max(1, Math.round(vv?.height || layoutH));
    const rawTop = Math.max(0, Math.round(vv?.offsetTop || 0));
    const rawLeft = Math.round(vv?.offsetLeft || 0);
    // A real keyboard is tall. Smaller offsetTop/height drift (scrollbar, address
    // bar, our own fixed shell moving) must not be written back onto the shell:
    // that feedback makes the chat header and composer jump in and out.
    const keyboard = layoutH - vvH - rawTop > 120;
    const height = keyboard ? vvH : Math.max(vvH, Math.round(layoutH) || vvH);
    const offsetTop = keyboard ? rawTop : 0;
    const offsetLeft = keyboard ? rawLeft : 0;
    const heightPx = `${height}px`;
    const topPx = `${offsetTop}px`;
    const leftPx = `${offsetLeft}px`;
    if (root.style.getPropertyValue('--app-vv-height') !== heightPx) {
      root.style.setProperty('--app-vv-height', heightPx);
    }
    if (root.style.getPropertyValue('--app-vv-offset-top') !== topPx) {
      root.style.setProperty('--app-vv-offset-top', topPx);
    }
    if (root.style.getPropertyValue('--app-vv-offset-left') !== leftPx) {
      root.style.setProperty('--app-vv-offset-left', leftPx);
    }

    // Keep portaled lightbox overlays inside the visual viewport.
    document.body.querySelectorAll(':scope > .lightbox-overlay').forEach(overlay => {
      overlay.style.setProperty('width', '100vw', 'important');
      overlay.style.setProperty('max-width', 'none', 'important');
      overlay.style.setProperty('height', `${vvH}px`, 'important');
      overlay.style.setProperty('min-height', `${vvH}px`, 'important');
      overlay.style.setProperty('top', `${rawTop}px`, 'important');
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


(function fixLightboxSlideWidths() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const applyStage = (stage) => {
    const w = Math.round(stage.getBoundingClientRect().width || 0);
    if (w < 1) return;
    stage.querySelectorAll('.lightbox-slide').forEach(slide => {
      slide.style.setProperty('flex', `0 0 ${w}px`, 'important');
      slide.style.setProperty('width', `${w}px`, 'important');
      slide.style.setProperty('max-width', `${w}px`, 'important');
    });
    const track = stage.querySelector('.lightbox-track');
    if (!track) return;
    track.style.setProperty('width', `${w * 3}px`, 'important');
    const transform = String(track.style.transform || '');
    const match = transform.match(/translate3d\(\s*(-?[\d.]+)px/);
    const x = match ? Number(match[1]) : -w;
    // Extract drag relative to React's intended -stageWidth base by taking residue mod w
    // after shifting by +w (idle position).
    let drag = x + w;
    // If React used a larger stageWidth (0.92*vw), x is more negative; normalize into (-w/2, w/2].
    while (drag > w / 2) drag -= w;
    while (drag <= -w / 2) drag += w;
    const next = -w + drag;
    if (!match || Math.abs(x - next) > 0.5) {
      track.style.setProperty('transform', `translate3d(${next}px, 0, 0)`, 'important');
    }
  };

  const scan = () => {
    document.querySelectorAll('.lightbox-overlay .lightbox-stage').forEach(applyStage);
  };

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => scan()) : null;
  const watch = () => {
    scan();
    if (ro) {
      document.querySelectorAll('.lightbox-overlay .lightbox-stage').forEach(el => ro.observe(el));
    }
  };
  new MutationObserver(watch).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', scan);
  window.visualViewport?.addEventListener('resize', scan);
  // Re-assert after React writes inline transform during drag/nav.
  new MutationObserver(scan).observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  });
})();
