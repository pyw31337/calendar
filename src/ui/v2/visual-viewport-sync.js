/**
 * Pin V2 chrome to the visual viewport and keep lightbox overlays flush.
 * Side-effect import from chat-bubble-modules.js (loaded with RenewalAppShell).
 */
(function syncVisualViewport() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let raf = 0;
  const root = document.documentElement;

  // iOS home-screen apps (display-mode: standalone + black-translucent status bar) paint edge to
  // edge, yet WebKit reports innerHeight / visualViewport.height one status bar short. Sizing the
  // shell to that number left an empty band at the bottom of every page. In standalone there is
  // no browser chrome, so the screen height for the current orientation is the real app height.
  // Only trusted when the window spans the full screen width and the shortfall is a status bar
  // (<= 100px) -- an iPad split-view window is narrower/shorter and keeps its reported size.
  // iOS WebKit only. Android home-screen apps (Chrome/Samsung Internet/Whale WebAPKs) report
  // innerHeight correctly, and their screen.height also counts the status and navigation bars
  // (~50-100px), so applying this there made the shell taller than the window and pushed the
  // bottom of every page -- the menu FAB, the chat composer -- under the navigation bar.
  const isIOSWebKit = (() => {
    try {
      const nav = window.navigator || {};
      const ua = String(nav.userAgent || '');
      if (/Android/i.test(ua)) return false;
      return /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && Number(nav.maxTouchPoints) > 1);
    } catch (_) {
      return false;
    }
  })();
  const standaloneScreenHeight = (layoutH) => {
    if (!isIOSWebKit) return 0;
    try {
      const standalone = window.navigator.standalone === true
        || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      if (!standalone || !window.screen) return 0;
      const landscape = window.matchMedia && window.matchMedia('(orientation: landscape)').matches;
      const sw = Number(window.screen.width) || 0;
      const sh = Number(window.screen.height) || 0;
      const screenW = landscape ? Math.max(sw, sh) : Math.min(sw, sh);
      const screenH = landscape ? Math.min(sw, sh) : Math.max(sw, sh);
      if (!screenH || Math.abs((window.innerWidth || 0) - screenW) > 2) return 0;
      const shortfall = screenH - layoutH;
      return shortfall > 0 && shortfall <= 100 ? Math.round(screenH) : 0;
    } catch (_) {
      return 0;
    }
  };

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
    const height = keyboard ? vvH : Math.max(vvH, Math.round(layoutH) || vvH, standaloneScreenHeight(layoutH));
    const offsetTop = keyboard ? rawTop : 0;
    // How far the real screen extends past what WebKit reports (iOS standalone only, see
    // standaloneScreenHeight). viewport-shell.css uses the class to stretch fixed layers too.
    const extended = !keyboard && height > Math.round(layoutH) + 1;
    if (root.hasAttribute('data-v2-keyboard') !== keyboard) {
      if (keyboard) root.setAttribute('data-v2-keyboard', '');
      else root.removeAttribute('data-v2-keyboard');
    }
    // A data attribute, not a class: the root's class list is watched below (syncActive) and
    // rewritten by other code, and a class here fed that observer into an endless loop.
    if (root.hasAttribute('data-v2-standalone-extended') !== extended) {
      if (extended) root.setAttribute('data-v2-standalone-extended', '');
      else root.removeAttribute('data-v2-standalone-extended');
    }
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
      overlay.style.setProperty('height', `${keyboard ? vvH : height}px`, 'important');
      overlay.style.setProperty('min-height', `${keyboard ? vvH : height}px`, 'important');
      overlay.style.setProperty('top', `${rawTop}px`, 'important');
      overlay.style.setProperty('left', '0', 'important');
    });
  };

  const onVp = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  };

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    apply();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVp);
      window.visualViewport.addEventListener('scroll', onVp);
    }
    window.addEventListener('resize', onVp);
  };

  const stop = () => {
    if (!started) return;
    started = false;
    if (raf) cancelAnimationFrame(raf);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onVp);
      window.visualViewport.removeEventListener('scroll', onVp);
    }
    window.removeEventListener('resize', onVp);
    root.style.removeProperty('--app-vv-height');
    root.style.removeProperty('--app-vv-offset-top');
    root.style.removeProperty('--app-vv-offset-left');
    root.removeAttribute('data-v2-standalone-extended');
    root.removeAttribute('data-v2-keyboard');
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
    // Our own correction triggers this observer again; only React's writes need rebasing.
    if (transform && transform === track.__gatherSyncedTransform) return;
    const match = transform.match(/translate3d\(\s*(-?[\d.]+)px/);
    const x = match ? Number(match[1]) : -w;
    // React writes translate3d(-stageWidth + drag). Its stageWidth (data-stage-width) can
    // differ from the measured slot width w -- a portrait photo uses 0.92 x viewport while V2
    // stretches the stage to 100% -- so take the drag relative to React's own base; treating
    // the width difference as drag left every portrait photo off-centre (shifted right).
    const reactWidth = Number(track.getAttribute('data-stage-width')) || 0;
    let drag;
    if (reactWidth > 0) {
      drag = x + reactWidth;
    } else {
      // Older markup without the attribute: best effort, residue modulo w.
      drag = x + w;
      while (drag > w / 2) drag -= w;
      while (drag <= -w / 2) drag += w;
    }
    // A completed slide animates to +-reactWidth; scale that to the measured slot width.
    if (reactWidth > 0 && Math.abs(Math.abs(drag) - reactWidth) < 1) drag = Math.sign(drag) * w;
    const next = -w + drag;
    if (!match || Math.abs(x - next) > 0.5) {
      track.style.setProperty('transform', `translate3d(${next}px, 0, 0)`, 'important');
    }
    track.__gatherSyncedTransform = String(track.style.transform || '');
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
