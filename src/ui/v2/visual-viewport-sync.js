import './tiny-motion.js';
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
  // The correction is deliberately limited to the normal iPhone status-bar-sized
  // shortfall.  A focused sub-16px field can make iOS temporarily zoom the visual
  // viewport, which changes `innerWidth`; do not let that transient width change
  // turn the correction off and strand the composer/drawer below the screen.
  // iPad split-view remains protected by retaining the full-width check on wide
  // screens, where a large non-fullscreen window is a legitimate layout.
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
  const isIPhoneOrIPod = (() => {
    try {
      return /iP(hone|od)/.test(String(window.navigator?.userAgent || ''));
    } catch (_) {
      return false;
    }
  })();
  const MAX_STANDALONE_SHORTFALL_PX = 140;
  const COMPACT_IOS_SCREEN_WIDTH_PX = 600;

  const standaloneScreenHeight = (layoutH) => {
    if (!isIOSWebKit) return 0;
    try {
      const standalone = window.navigator.standalone === true
        || (window.matchMedia && (
          window.matchMedia('(display-mode: standalone)').matches
          || window.matchMedia('(display-mode: fullscreen)').matches
        ));
      if (!standalone || !window.screen) return 0;
      const landscape = window.matchMedia && window.matchMedia('(orientation: landscape)').matches;
      const sw = Number(window.screen.width) || 0;
      const sh = Number(window.screen.height) || 0;
      const screenW = landscape ? Math.max(sw, sh) : Math.min(sw, sh);
      const screenH = landscape ? Math.min(sw, sh) : Math.max(sw, sh);
      const hasFullWidth = Math.abs((window.innerWidth || 0) - screenW) <= 2;
      // On compact iPhones, the page may already be temporarily zoomed by a
      // focused control when this runs.  That only changes the reported width,
      // not the fact that a standalone app owns the physical screen.
      if (!screenH || (!isIPhoneOrIPod && screenW > COMPACT_IOS_SCREEN_WIDTH_PX && !hasFullWidth)) return 0;
      const shortfall = screenH - layoutH;
      return shortfall > 0 && shortfall <= MAX_STANDALONE_SHORTFALL_PX ? Math.round(screenH) : 0;
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
    // Do not mistake Safari's automatic input zoom for the keyboard.  A real
    // keyboard keeps visualViewport.scale at 1; an auto/manual zoom does not.
    const viewportScale = Number(vv?.scale || 1);
    const chromeShrink = layoutH - vvH - rawTop;
    // A real keyboard is most of the screen. Samsung/Safari toolbars can shrink
    // ~140px; treating that as a keyboard jumps the shell. Address bars under
    // ~8px are noise (scrollbar, rounding).
    const keyboard = viewportScale <= 1.01 && chromeShrink > 180;
    const browserChrome = !keyboard && viewportScale <= 1.01 && chromeShrink > 8;
    const height = keyboard || browserChrome
      ? vvH
      : Math.max(vvH, Math.round(layoutH) || vvH, standaloneScreenHeight(layoutH));
    const offsetTop = keyboard ? rawTop : 0;
    // How far the real screen extends past what WebKit reports (iOS standalone only, see
    // standaloneScreenHeight). viewport-shell.css uses the class to stretch fixed layers too.
    const extended = !keyboard && height > Math.round(layoutH) + 1;
    // When standalone WebKit needs the physical-screen correction, the extra
    // pixels represent the status-bar strip above the layout viewport.  Keep
    // that fact as a separate token: fixed sheets and drawers must reserve it
    // even on installations where env(safe-area-inset-top) incorrectly
    // resolves to zero.
    const standaloneTopInset = extended ? Math.max(0, height - Math.round(layoutH)) : 0;
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
    const keyboardInset = keyboard ? Math.max(0, Math.round(layoutH) - vvH - rawTop) : 0;
    const offsetLeft = keyboard ? rawLeft : 0;
    const heightPx = `${height}px`;
    const topPx = `${offsetTop}px`;
    const leftPx = `${offsetLeft}px`;
    const standaloneTopInsetPx = `${standaloneTopInset}px`;
    const keyboardInsetPx = `${keyboardInset}px`;
    if (root.style.getPropertyValue('--app-vv-height') !== heightPx) {
      root.style.setProperty('--app-vv-height', heightPx);
    }
    if (root.style.getPropertyValue('--app-vv-offset-top') !== topPx) {
      root.style.setProperty('--app-vv-offset-top', topPx);
    }
    if (root.style.getPropertyValue('--app-vv-offset-left') !== leftPx) {
      root.style.setProperty('--app-vv-offset-left', leftPx);
    }
    if (root.style.getPropertyValue('--app-vv-standalone-top-inset') !== standaloneTopInsetPx) {
      root.style.setProperty('--app-vv-standalone-top-inset', standaloneTopInsetPx);
    }
    if (root.style.getPropertyValue('--app-vv-keyboard-inset') !== keyboardInsetPx) {
      root.style.setProperty('--app-vv-keyboard-inset', keyboardInsetPx);
    }

    if (typeof window.scrollTo === 'function' && window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }

    // Keep portaled lightbox overlays inside the visual viewport.
    document.body.querySelectorAll(':scope > .lightbox-overlay').forEach(overlay => {
      const overlayW = Math.max(1, Math.round(vv?.width || window.innerWidth || 0));
      overlay.style.setProperty('width', `${overlayW}px`, 'important');
      overlay.style.setProperty('max-width', `${overlayW}px`, 'important');
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

  const isTextControl = (el) => {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el.isContentEditable) return true;
    const tag = String(el.tagName || '');
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (tag !== 'INPUT') return false;
    const type = String(el.type || 'text').toLowerCase();
    return !['checkbox', 'radio', 'range', 'color', 'file', 'hidden', 'button', 'submit', 'reset'].includes(type);
  };

  // iOS scrolls the layout viewport to reveal a focused field, which fights the
  // pinned shell. Nudge only the nearest overflow ancestor, and skip fixed
  // chrome (the field would not move, but the page behind it would).
  const revealFocusedControl = () => {
    const el = document.activeElement;
    if (!isTextControl(el) || typeof el.getBoundingClientRect !== 'function' || typeof window.getComputedStyle !== 'function') return;
    const vv = window.visualViewport;
    const topLimit = Math.round(vv?.offsetTop || 0) + 8;
    const bottomLimit = Math.round((vv?.offsetTop || 0) + (vv?.height || window.innerHeight || 0)) - 12;
    const rect = el.getBoundingClientRect();
    let delta = 0;
    if (rect.bottom > bottomLimit) delta = rect.bottom - bottomLimit;
    else if (rect.top < topLimit) delta = rect.top - topLimit;
    if (!delta) return;
    let node = el.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      const style = window.getComputedStyle(node);
      if (style.position === 'fixed') return;
      const canScroll = /(auto|scroll|overlay)/.test(`${style.overflowY} ${style.overflow}`)
        && node.scrollHeight > node.clientHeight + 1;
      if (canScroll) {
        node.scrollTop += delta;
        return;
      }
      node = node.parentElement;
    }
  };

  const onFocusIn = () => {
    onVp();
    setTimeout(onVp, 50);
    setTimeout(revealFocusedControl, 50);
    setTimeout(onVp, 300);
    setTimeout(revealFocusedControl, 320);
  };

  const onFocusOut = () => {
    onVp();
    setTimeout(onVp, 100);
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
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('focusin', onFocusIn);
      document.addEventListener('focusout', onFocusOut);
    }
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
    if (typeof document !== 'undefined' && document.removeEventListener) {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    }
    root.style.removeProperty('--app-vv-height');
    root.style.removeProperty('--app-vv-offset-top');
    root.style.removeProperty('--app-vv-offset-left');
    root.style.removeProperty('--app-vv-standalone-top-inset');
    root.style.removeProperty('--app-vv-keyboard-inset');
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

/*
 * Most legacy pickers render only a decorative ::before drag pill.  A pseudo
 * element cannot receive pointer input, which made those sheets look
 * resizable while doing nothing on touch devices.  Add one real, inert DOM
 * handle to every un-managed sheet and resize it with pointer capture.
 * ResizableModalContainer and the emoji picker own their respective handles,
 * so they are intentionally left alone.
 */
(function installSheetResizeHandles() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body || typeof document.addEventListener !== 'function') return;

  const HANDLE_CLASS = 'bp-sheet-handle v2-modal-drag-handle';
  const MIN_SHEET_HEIGHT = 180;
  const SHEET_SELECTOR = [
    '.bottom-sheet-overlay:not(.emoji-sheet-overlay) > .bottom-sheet',
    '.modal-overlay:not(.meme-preview-overlay) > .modal-container',
    '.modal-overlay:not(.meme-preview-overlay) > .modal',
    '.modal-overlay:not(.meme-preview-overlay) > .bp-event-sheet',
  ].join(', ');

  let activeResize = null;

  const isV2Active = () => document.documentElement.classList.contains('v2-html-active');
  const hasDirectHandle = sheet => Array.from(sheet.children).some(child =>
    child.classList && (child.classList.contains('bp-sheet-handle') || child.classList.contains('v2-modal-drag-handle'))
  );
  const isEligibleSheet = sheet => sheet instanceof Element && (
    (sheet.matches('.bottom-sheet') && sheet.parentElement?.matches('.bottom-sheet-overlay:not(.emoji-sheet-overlay)'))
    || (sheet.matches('.modal-container, .modal, .bp-event-sheet') && sheet.parentElement?.matches('.modal-overlay:not(.meme-preview-overlay)'))
  );
  const enhanceSheet = sheet => {
    if (!isV2Active() || !isEligibleSheet(sheet) || hasDirectHandle(sheet)) return;
    const handle = document.createElement('div');
    handle.className = HANDLE_CLASS;
    handle.dataset.v2InjectedSheetHandle = 'true';
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-label', '위아래로 드래그해서 크기 조절');
    handle.setAttribute('aria-orientation', 'horizontal');
    sheet.insertBefore(handle, sheet.firstChild);
  };
  const enhance = () => {
    if (!isV2Active()) return;
    document.querySelectorAll(SHEET_SELECTOR).forEach(enhanceSheet);
  };
  const viewportHeight = () => {
    const rootHeight = Number.parseFloat(document.documentElement.style.getPropertyValue('--app-vv-height'));
    return rootHeight || window.visualViewport?.height || window.innerHeight || 0;
  };
  const availableHeight = sheet => {
    const overlay = sheet.closest('.modal-overlay, .bottom-sheet-overlay');
    const overlayStyle = overlay ? window.getComputedStyle(overlay) : null;
    const topClearance = Number.parseFloat(overlayStyle?.paddingTop || '0') || 0;
    const bottomClearance = Number.parseFloat(overlayStyle?.paddingBottom || '0') || 0;
    return Math.max(MIN_SHEET_HEIGHT, Math.floor(viewportHeight() - topClearance - bottomClearance));
  };
  const endResize = () => {
    if (!activeResize) return;
    const { handle, pointerId, onMove, onEnd } = activeResize;
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onEnd);
    document.removeEventListener('pointercancel', onEnd);
    try { handle.releasePointerCapture?.(pointerId); } catch (_) {}
    activeResize = null;
  };
  const onPointerDown = event => {
    const handle = event.target?.closest?.('[data-v2-injected-sheet-handle="true"]');
    if (!handle || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const sheet = handle.parentElement;
    if (!sheet) return;
    event.preventDefault();
    event.stopPropagation();
    endResize();
    const pointerId = event.pointerId;
    const startY = event.clientY;
    const startHeight = sheet.getBoundingClientRect().height;
    const maxHeight = availableHeight(sheet);
    const onMove = moveEvent => {
      if (!moveEvent.isPrimary || moveEvent.pointerId !== pointerId) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      const nextHeight = Math.max(MIN_SHEET_HEIGHT, Math.min(maxHeight, Math.round(startHeight - (moveEvent.clientY - startY))));
      sheet.style.setProperty('height', `${nextHeight}px`, 'important');
      sheet.style.setProperty('max-height', `${maxHeight}px`, 'important');
      sheet.style.setProperty('min-height', `${MIN_SHEET_HEIGHT}px`, 'important');
    };
    const onEnd = endEvent => {
      if (!endEvent.isPrimary || endEvent.pointerId !== pointerId) return;
      endResize();
    };
    activeResize = { handle, pointerId, onMove, onEnd };
    try { handle.setPointerCapture?.(pointerId); } catch (_) {}
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onEnd);
    document.addEventListener('pointercancel', onEnd);
  };

  document.addEventListener('pointerdown', onPointerDown, true);
  // Chat rows and live data can mutate thousands of descendants. Inspect only
  // newly mounted sheet roots instead of querying the whole document per row.
  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (isEligibleSheet(node)) enhanceSheet(node);
      node.querySelectorAll?.('.bottom-sheet, .modal-container, .modal, .bp-event-sheet').forEach(enhanceSheet);
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  new MutationObserver(enhance).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  enhance();
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
  const styleObservers = new WeakSet();
  const watch = () => {
    scan();
    document.querySelectorAll('.lightbox-overlay').forEach(overlay => {
      if (ro) overlay.querySelectorAll('.lightbox-stage').forEach(el => ro.observe(el));
      if (styleObservers.has(overlay)) return;
      styleObservers.add(overlay);
      // React rewrites the track transform while dragging. Watching the overlay
      // (not every style change in the document) is enough to rebase the slots.
      new MutationObserver(scan).observe(overlay, {
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
      });
    });
  };
  new MutationObserver(watch).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', scan);
  window.visualViewport?.addEventListener('resize', scan);
})();
