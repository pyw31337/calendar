function resolveThemeChoice(choice) {
  if (choice === 'dark' || choice === 'light') return choice;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (_) {
    return 'light';
  }
}

function applyThemeChoice(choice) {
  document.documentElement.setAttribute('data-theme', resolveThemeChoice(choice));
}

export function useDisplayPreferences({
  React,
  activeCalId,
  isAdminDashboardRoute,
  getLocalStorage
}) {
  const readThemeForCalendar = React.useCallback((calId) => {
    if (!calId) return 'system';
    try {
      const saved = getLocalStorage().getItem(`gather_theme_preference_${calId}_v1`);
      return saved === 'dark' || saved === 'light' ? saved : 'system';
    } catch (_) {
      return 'system';
    }
  }, [getLocalStorage]);

  const [themeChoice, setThemeChoice] = React.useState(() => (
    isAdminDashboardRoute() ? 'light' : readThemeForCalendar(activeCalId)
  ));

  const toggleTheme = React.useCallback(() => {
    if (isAdminDashboardRoute() || !activeCalId) return;
    const next = resolveThemeChoice(themeChoice) === 'dark' ? 'light' : 'dark';
    getLocalStorage().setItem(`gather_theme_preference_${activeCalId}_v1`, next);
    applyThemeChoice(next);
    setThemeChoice(next);
  }, [activeCalId, getLocalStorage, isAdminDashboardRoute, themeChoice]);

  const isDarkTheme = !isAdminDashboardRoute() && resolveThemeChoice(themeChoice) === 'dark';

  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      applyThemeChoice('light');
      setThemeChoice('light');
      return;
    }
    const next = readThemeForCalendar(activeCalId);
    applyThemeChoice(next);
    setThemeChoice(next);
  }, [activeCalId, isAdminDashboardRoute, readThemeForCalendar]);

  React.useEffect(() => {
    if (isAdminDashboardRoute() || themeChoice === 'dark' || themeChoice === 'light') return undefined;
    let mediaQuery;
    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    } catch (_) {
      return undefined;
    }
    const onChange = () => applyThemeChoice('system');
    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', onChange);
    else if (mediaQuery.addListener) mediaQuery.addListener(onChange);
    applyThemeChoice('system');
    return () => {
      if (mediaQuery.removeEventListener) mediaQuery.removeEventListener('change', onChange);
      else if (mediaQuery.removeListener) mediaQuery.removeListener(onChange);
    };
  }, [isAdminDashboardRoute, themeChoice]);

  const readFontScaleForCalendar = React.useCallback((calId) => {
    if (!calId) return 100;
    const saved = getLocalStorage().getItem(`gather_font_scale_${calId}_v1`);
    return saved ? Number(saved) || 100 : 100;
  }, [getLocalStorage]);

  const [fontScalePercent, setFontScalePercent] = React.useState(() => (
    isAdminDashboardRoute() ? 100 : readFontScaleForCalendar(activeCalId)
  ));
  const skipNextFontWriteRef = React.useRef(false);

  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      document.documentElement.style.fontSize = '';
      return;
    }
    document.documentElement.style.fontSize = `${fontScalePercent}%`;
    if (skipNextFontWriteRef.current) {
      skipNextFontWriteRef.current = false;
      return;
    }
    if (activeCalId) {
      getLocalStorage().setItem(`gather_font_scale_${activeCalId}_v1`, String(fontScalePercent));
    }
  }, [activeCalId, fontScalePercent, getLocalStorage, isAdminDashboardRoute]);

  React.useEffect(() => {
    if (isAdminDashboardRoute()) {
      document.documentElement.style.fontSize = '';
      setFontScalePercent(100);
      return;
    }
    skipNextFontWriteRef.current = true;
    setFontScalePercent(readFontScaleForCalendar(activeCalId));
  }, [activeCalId, isAdminDashboardRoute, readFontScaleForCalendar]);

  return {
    themeChoice,
    toggleTheme,
    isDarkTheme,
    fontScalePercent,
    setFontScalePercent
  };
}

export function useMainHeaderState({ React, activeView, isMainSideMenuOpen }) {
  const [isMainHeaderVisible, setIsMainHeaderVisible] = React.useState(true);
  const [mainHeaderHeight, setMainHeaderHeight] = React.useState(0);
  const [pollsExpandSignal, setPollsExpandSignal] = React.useState(0);
  const mainHeaderRef = React.useRef(null);
  const calendarSectionRef = React.useRef(null);
  const pollsSectionRef = React.useRef(null);
  const lastMainScrollTopRef = React.useRef(0);

  React.useEffect(() => {
    const handleMainScroll = () => {
      const scrollTop = window.scrollY;
      const lastScrollTop = lastMainScrollTopRef.current;
      if (scrollTop < 10) setIsMainHeaderVisible(true);
      else if (scrollTop > lastScrollTop && scrollTop > 56) setIsMainHeaderVisible(false);
      else if (scrollTop < lastScrollTop) setIsMainHeaderVisible(true);
      lastMainScrollTopRef.current = scrollTop;
    };
    window.addEventListener('scroll', handleMainScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleMainScroll);
  }, []);

  React.useEffect(() => {
    if (!mainHeaderRef.current) return undefined;
    const measure = () => {
      if (mainHeaderRef.current) setMainHeaderHeight(mainHeaderRef.current.offsetHeight);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(mainHeaderRef.current);
    return () => observer.disconnect();
  }, [activeView]);

  React.useEffect(() => {
    if (!isMainSideMenuOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isMainSideMenuOpen]);

  const scrollToSection = React.useCallback((ref) => {
    if (!ref.current) return;
    const headerHeight = mainHeaderRef.current ? mainHeaderRef.current.offsetHeight : 0;
    const top = ref.current.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const resetMainHeader = React.useCallback(() => {
    setIsMainHeaderVisible(true);
    lastMainScrollTopRef.current = 0;
  }, []);

  return {
    isMainHeaderVisible,
    mainHeaderHeight,
    mainHeaderRef,
    calendarSectionRef,
    pollsSectionRef,
    pollsExpandSignal,
    setPollsExpandSignal,
    scrollToSection,
    resetMainHeader
  };
}
