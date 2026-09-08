export function getInitialDataLoadingState({ firebaseDb, activeCalId, loadLocalCache, isUsableCalendarRecord }) {
  if (!firebaseDb) return false;
  try {
    const cached = loadLocalCache();
    const hit = Array.isArray(cached) && cached.some(calendar => (
      calendar && calendar.id === activeCalId && isUsableCalendarRecord(calendar)
    ));
    return !hit;
  } catch (_) {
    return true;
  }
}

export function subscribeBrowserConnectivity(onChange) {
  if (typeof window === 'undefined') return () => {};
  const readOnline = () => {
    try {
      return typeof navigator === 'undefined' ? true : navigator.onLine !== false;
    } catch (_) {
      return true;
    }
  };
  const handleOnline = () => onChange(true);
  const handleOffline = () => onChange(false);
  onChange(readOnline());
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export function subscribeCalendarBootstrap({
  firebaseDb,
  activeCalId,
  calendarsRef,
  restoreActiveCalendarFromCache,
  isUsableCalendarRecord,
  setIsInitialDataLoading,
  fetchSingleCloudCalendar,
  loadMaxAttempts,
  loadTimeoutMs,
  applyCalendarSnapshot,
  getMetaRevision,
  getMetaLastModified,
  serverRevisionRef,
  isSavingRef,
  pendingRemoteSnapshotRef,
  getCloudDocCalendar,
  setSyncDiag,
  setCloudReloadToken
}) {
  if (!firebaseDb || !activeCalId) {
    setIsInitialDataLoading(false);
    return () => {};
  }
  let mounted = true;
  let loadedFromCloud = false;
  let retryTimeoutId = null;
  const restoredFromCache = restoreActiveCalendarFromCache();
  const cacheHit = restoredFromCache || (calendarsRef.current || []).some(calendar => (
    calendar && calendar.id === activeCalId && isUsableCalendarRecord(calendar)
  ));
  setIsInitialDataLoading(!cacheHit);

  const applyLoadedCalendar = (calendar, lastModified = Date.now(), revision = 0, forceApply = false, markLoaded = true) => {
    if (!mounted || !calendar || calendar.id !== activeCalId) return false;
    const incomingRevision = Number(revision || 0) || 0;
    const currentRevision = getMetaRevision(serverRevisionRef.current, activeCalId);
    if (!forceApply) {
      if (incomingRevision > 0 && currentRevision > 0 && incomingRevision < currentRevision) return false;
      if (incomingRevision <= 0 && lastModified < getMetaLastModified(serverRevisionRef.current, activeCalId)) return false;
    }
    if (markLoaded) loadedFromCloud = true;
    return applyCalendarSnapshot(calendar, lastModified, revision, forceApply);
  };

  const runInitialLoad = async () => {
    for (let attempt = 1; attempt <= loadMaxAttempts && mounted && !loadedFromCloud; attempt += 1) {
      const result = await fetchSingleCloudCalendar(activeCalId, 1, loadTimeoutMs);
      if (result?.calendar && applyLoadedCalendar(
        result.calendar,
        result.lastModified || Date.now(),
        result.revision || result.calendar.revision || 0,
        true
      )) return;
    }
    if (!mounted || loadedFromCloud) return;
    const restored = restoreActiveCalendarFromCache();
    if (restored) {
      setIsInitialDataLoading(false);
      if (!cacheHit) console.warn(`Calendar ${activeCalId} refreshed from local state while waiting for Firestore.`);
    } else {
      setIsInitialDataLoading(true);
      if (!cacheHit) console.warn(`Calendar ${activeCalId} data load is still pending; background retry continues.`);
    }
    retryTimeoutId = setTimeout(() => {
      if (mounted) setCloudReloadToken(token => token + 1);
    }, 3500);
  };

  const unsubscribe = firebaseDb.collection('calendars').doc(`cal_${activeCalId}`).onSnapshot(
    { includeMetadataChanges: true },
    doc => {
      try {
        if (typeof window !== 'undefined') {
          window.__gatherCalendarSyncDiag = {
            calendarId: activeCalId,
            fromCache: doc.metadata.fromCache,
            hasPendingWrites: doc.metadata.hasPendingWrites,
            docUpdatedAt: doc.exists ? (doc.data()?.calendar?.updatedAt || null) : null,
            receivedAt: Date.now()
          };
          setSyncDiag(window.__gatherCalendarSyncDiag);
        }
      } catch (_) {}
      const result = getCloudDocCalendar(doc, activeCalId);
      if (result && isSavingRef.current) {
        if (!doc.metadata.fromCache && !doc.metadata.hasPendingWrites) {
          pendingRemoteSnapshotRef.current = {
            calendar: result.calendar,
            lastModified: result.lastModified || Date.now(),
            revision: result.revision || result.calendar.revision || 0
          };
        }
      } else if (result) {
        applyLoadedCalendar(
          result.calendar,
          result.lastModified || Date.now(),
          result.revision || result.calendar.revision || 0,
          !doc.metadata.fromCache,
          !doc.metadata.fromCache
        );
      }
    },
    error => {
      console.warn(`Firestore realtime sync notice for cal_${activeCalId}:`, error);
      try {
        setSyncDiag(previous => ({
          ...(previous || {}),
          calendarId: activeCalId,
          fromCache: true,
          hasPendingWrites: false,
          docUpdatedAt: previous?.docUpdatedAt || null,
          receivedAt: Date.now(),
          error: error?.message || String(error || 'realtime sync error')
        }));
      } catch (_) {}
      if (!mounted) return;
      restoreActiveCalendarFromCache();
      setIsInitialDataLoading(false);
      retryTimeoutId = setTimeout(() => {
        if (mounted) setCloudReloadToken(token => token + 1);
      }, 2500);
    }
  );

  const fallbackTimeoutId = setTimeout(() => {
    if (mounted && !loadedFromCloud) runInitialLoad();
  }, cacheHit ? 1500 : 2500);

  return () => {
    mounted = false;
    clearTimeout(fallbackTimeoutId);
    if (retryTimeoutId) clearTimeout(retryTimeoutId);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

export function subscribeFirestoreForegroundRecovery({
  activeCalId,
  getFirebaseDb,
  isSavingRef,
  setCloudReloadToken
}) {
  if (typeof document === 'undefined' || !activeCalId) return () => {};
  let lastVisibleAt = 0;
  let deferredRefreshId = null;
  const refresh = (eventName = 'foreground') => {
    if (document.visibilityState !== 'visible' || isSavingRef.current) return;
    const now = Date.now();
    if (now - lastVisibleAt < 1200) return;
    lastVisibleAt = now;
    const firebaseDb = typeof getFirebaseDb === 'function' ? getFirebaseDb() : null;
    if (firebaseDb && typeof firebaseDb.enableNetwork === 'function') {
      firebaseDb.enableNetwork().catch(error => console.warn(`Firestore network resume notice (${eventName}):`, error));
    }
    setCloudReloadToken(token => token + 1);
  };
  const onVisibility = () => refresh('visibilitychange');
  const onPageShow = () => refresh('pageshow');
  const onOnline = () => refresh('online');
  const scheduleDeferredRefresh = () => {
    if (deferredRefreshId) clearTimeout(deferredRefreshId);
    deferredRefreshId = setTimeout(() => {
      deferredRefreshId = null;
      refresh('deferred-resume');
    }, 1800);
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('online', onOnline);
  window.addEventListener('pageshow', scheduleDeferredRefresh);
  window.addEventListener('online', scheduleDeferredRefresh);
  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('online', onOnline);
    window.removeEventListener('pageshow', scheduleDeferredRefresh);
    window.removeEventListener('online', scheduleDeferredRefresh);
    if (deferredRefreshId) clearTimeout(deferredRefreshId);
  };
}

export function watchFirebaseBootstrap({ getFirebaseDb, getRetryExhausted, getInitError }) {
  if (getFirebaseDb()) return () => {};
  const warn = () => {
    const initError = getInitError();
    const detail = initError ? ` (${initError})` : ' (원인 미상)';
    console.warn(`Firebase connection error${detail}`);
  };
  if (getRetryExhausted()) {
    warn();
    return () => {};
  }
  let cancelled = false;
  const pollId = setInterval(() => {
    if (cancelled || getFirebaseDb()) {
      clearInterval(pollId);
      return;
    }
    if (getRetryExhausted()) {
      clearInterval(pollId);
      warn();
    }
  }, 2000);
  return () => {
    cancelled = true;
    clearInterval(pollId);
  };
}

export function subscribeAppResumeRefresh({
  activeCalId,
  activeCalLoaded,
  activeView,
  firebaseDb,
  isAllowedCalendarId,
  isSavingRef,
  localWriteStartedAtRef,
  fetchSingleCalendarWithRest,
  applyCalendarSnapshot,
  fetchMemosRest,
  memosLimit,
  setMemos,
  setHasMoreMemos,
  restoreActiveCalendarFromCache,
  setIsInitialDataLoading,
  setCloudReloadToken
}) {
  if (!firebaseDb || !activeCalId) return () => {};
  let mounted = true;
  let lastRefreshAt = 0;
  const refresh = async () => {
    if ((typeof document !== 'undefined' && document.visibilityState === 'hidden') || isSavingRef.current) return;
    const now = Date.now();
    if (now - lastRefreshAt < 1200) return;
    lastRefreshAt = now;
    if (isAllowedCalendarId(activeCalId)) {
      try {
        const refreshStartedAt = Date.now();
        const fresh = await fetchSingleCalendarWithRest(activeCalId, 5000);
        if (isSavingRef.current || refreshStartedAt <= (localWriteStartedAtRef.current[activeCalId] || 0)) return;
        if (mounted && fresh?.calendar && applyCalendarSnapshot(
          fresh.calendar,
          fresh.lastModified || Date.now(),
          fresh.revision || fresh.calendar.revision || 0,
          true
        )) {
          if (activeView === 'memo') {
            fetchMemosRest(activeCalId, memosLimit).then(list => {
              if (!mounted) return;
              setMemos(list);
              setHasMoreMemos(list.length >= memosLimit);
            }).catch(() => {});
          }
          return;
        }
      } catch (error) {
        console.warn('refreshFromResume REST fetch notice:', error);
      }
    }
    if (!activeCalLoaded) {
      const restored = restoreActiveCalendarFromCache();
      if (mounted && !restored) setIsInitialDataLoading(true);
      if (mounted) setCloudReloadToken(token => token + 1);
    }
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') setTimeout(refresh, 200);
  };
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.update());
    }).catch(() => {});
  }
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', refresh);
  window.addEventListener('online', refresh);
  window.addEventListener('pageshow', refresh);
  return () => {
    mounted = false;
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', refresh);
    window.removeEventListener('online', refresh);
    window.removeEventListener('pageshow', refresh);
  };
}
