/* Shared Firebase Storage upload watchdog. The Firebase compat UploadTask is cancellable,
 * so a stalled mobile transfer can be stopped without leaving a promise hanging forever. */

export function uploadBlobWithWatchdog({
  ref,
  blob,
  contentType,
  taskKey,
  onBytes,
  timeoutMs = 45000,
  stallTimeoutMs = 20000
} = {}) {
  if (!ref || !blob) return Promise.resolve(null);
  return new Promise(resolve => {
    let settled = false;
    let task = null;
    let timeoutId = null;
    let stallTimeoutId = null;
    let hiddenSince = null;
    let pausedByLifecycle = false;
    const settle = value => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      clearTimeout(stallTimeoutId);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      resolve(value);
    };
    const cancelAndFail = () => {
      try { task?.cancel(); } catch (_) {}
      settle(null);
    };
    const resetStallTimeout = () => {
      clearTimeout(stallTimeoutId);
      if (pausedByLifecycle || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
      stallTimeoutId = setTimeout(cancelAndFail, stallTimeoutMs);
    };
    // The page lifecycle is not a network failure. Mobile browsers routinely suspend timers
    // and Firebase's UploadTask while the screen is locked; counting that period against the
    // watchdog turns a recoverable pause into a failed upload.
    const pauseForLifecycle = () => {
      if (settled || !task || pausedByLifecycle) return;
      pausedByLifecycle = true;
      hiddenSince = Date.now();
      clearTimeout(timeoutId);
      clearTimeout(stallTimeoutId);
      try { task.pause(); } catch (_) {}
    };
    const resumeFromLifecycle = () => {
      if (settled || !task || !pausedByLifecycle) return;
      const pausedMs = hiddenSince ? Math.max(0, Date.now() - hiddenSince) : 0;
      pausedByLifecycle = false;
      hiddenSince = null;
      // Restart the total watchdog after the lifecycle pause; the paused interval is not
      // useful evidence that the transfer is stuck.
      timeoutId = setTimeout(cancelAndFail, timeoutMs);
      try { task.resume(); } catch (_) {}
      resetStallTimeout();
      if (onBytes && pausedMs > 0) onBytes(`${taskKey}-resume`, 0, Number(blob.size) || 0);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' || (typeof navigator !== 'undefined' && navigator.onLine === false)) pauseForLifecycle();
      else resumeFromLifecycle();
    };
    const handleOffline = () => pauseForLifecycle();
    const handleOnline = () => resumeFromLifecycle();
    timeoutId = setTimeout(cancelAndFail, timeoutMs);
    task = ref.put(blob, { contentType });
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      if (document.visibilityState === 'hidden') pauseForLifecycle();
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    resetStallTimeout();
    task.on('state_changed', snapshot => {
      if (pausedByLifecycle || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
      resetStallTimeout();
      if (onBytes) onBytes(taskKey, snapshot.bytesTransferred, snapshot.totalBytes);
    }, () => settle(null), async () => {
      try {
        settle(await task.snapshot.ref.getDownloadURL());
      } catch (_) {
        settle(null);
      }
    });
  });
}
