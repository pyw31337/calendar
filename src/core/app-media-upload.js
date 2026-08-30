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
    const settle = value => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      clearTimeout(stallTimeoutId);
      resolve(value);
    };
    const cancelAndFail = () => {
      try { task?.cancel(); } catch (_) {}
      settle(null);
    };
    const resetStallTimeout = () => {
      clearTimeout(stallTimeoutId);
      stallTimeoutId = setTimeout(cancelAndFail, stallTimeoutMs);
    };
    timeoutId = setTimeout(cancelAndFail, timeoutMs);
    task = ref.put(blob, { contentType });
    resetStallTimeout();
    task.on('state_changed', snapshot => {
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
