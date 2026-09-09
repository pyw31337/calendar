// Browser-only UI compatibility effects. Keeping these DOM observers outside CalendarApp
// prevents general shell behavior from consuming the feature coordinator's line budget.
export function useBrowserUiCompatibility(React) {
  React.useEffect(() => {
    if (typeof MutationObserver === 'undefined') return undefined;
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('selector(:has(*))')) return undefined;

    let overlayLocked = false;
    let savedOverflow = '';
    let adminScopeActive = false;
    let savedBackgroundColor = '';
    let savedBackgroundImage = '';
    let savedColorScheme = '';
    let bodyPaddingReset = false;
    let savedPadding = '';

    const sync = () => {
      // Mirrors body:has(.modal-overlay, .bottom-sheet-overlay) for legacy webviews.
      const hasOverlay = !!document.body.querySelector('.modal-overlay, .bottom-sheet-overlay');
      if (hasOverlay !== overlayLocked) {
        overlayLocked = hasOverlay;
        if (overlayLocked) {
          savedOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = savedOverflow;
        }
      }

      const hasAdminScope = !!document.body.querySelector('.admin-scope');
      const hasLoginGate = !!document.body.querySelector('.admin-login-gate');
      const shouldResetPadding = hasAdminScope || hasLoginGate;
      if (shouldResetPadding !== bodyPaddingReset) {
        bodyPaddingReset = shouldResetPadding;
        if (bodyPaddingReset) {
          savedPadding = document.body.style.padding;
          document.body.style.padding = '0';
        } else {
          document.body.style.padding = savedPadding;
        }
      }

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const shouldForceLight = isDark && hasAdminScope;
      if (shouldForceLight !== adminScopeActive) {
        adminScopeActive = shouldForceLight;
        if (adminScopeActive) {
          savedBackgroundColor = document.body.style.backgroundColor;
          savedBackgroundImage = document.body.style.backgroundImage;
          savedColorScheme = document.documentElement.style.colorScheme;
          document.body.style.backgroundColor = '#F8FAFC';
          document.body.style.backgroundImage = 'none';
          document.documentElement.style.colorScheme = 'light';
        } else {
          document.body.style.backgroundColor = savedBackgroundColor;
          document.body.style.backgroundImage = savedBackgroundImage;
          document.documentElement.style.colorScheme = savedColorScheme;
        }
      }
    };

    sync();
    const bodyObserver = new MutationObserver(sync);
    bodyObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    const themeObserver = new MutationObserver(sync);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      bodyObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (!window.visualViewport) return undefined;
    const handleResize = () => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        if (active.closest('.chat-room-container')) return;
        setTimeout(() => active.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
      }
    };
    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);
}
