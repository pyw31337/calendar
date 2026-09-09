export function useAppFeedbackState({ React, createToastLifecycle }) {
  const [toast, setToast] = React.useState(null);
  const [operationProgress, setOperationProgress] = React.useState(null);
  const toastControllerRef = React.useRef(null);
  if (!toastControllerRef.current) toastControllerRef.current = createToastLifecycle(setToast);
  const operationTimersRef = React.useRef({ delay: null, interval: null, hide: null });

  const clearOperationTimers = () => {
    const timers = operationTimersRef.current;
    if (timers.delay) clearTimeout(timers.delay);
    if (timers.interval) clearInterval(timers.interval);
    if (timers.hide) clearTimeout(timers.hide);
    operationTimersRef.current = { delay: null, interval: null, hide: null };
  };

  React.useEffect(() => () => {
    toastControllerRef.current.clearToastTimers();
    clearOperationTimers();
  }, []);

  const showToast = toastControllerRef.current.showToast;
  const dismissToast = toastControllerRef.current.dismissToast;
  const showUndoableDeleteToast = (message, onUndo, onExpire, duration = 5000) =>
    showToast(message, 'delete', duration, onUndo, onExpire, '되돌리기');
  const showRetryableUploadToast = (message, onRetry, duration = 5000) =>
    showToast(message, 'error', duration, onRetry, null, '다시 시도');

  const runWithOperationProgress = async ({ title, detail, delay = 1000 } = {}, task) => {
    if (typeof task !== 'function') return undefined;
    const id = `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    let shown = false;
    let pct = 12;
    const finishSoon = () => {
      clearOperationTimers();
      if (!shown) return;
      setOperationProgress(previous => previous?.id === id
        ? { ...previous, pct: 100, detail: '마무리 중입니다...' }
        : previous);
      operationTimersRef.current.hide = setTimeout(() => {
        setOperationProgress(previous => previous?.id === id ? null : previous);
      }, 350);
    };
    clearOperationTimers();
    operationTimersRef.current.delay = setTimeout(() => {
      shown = true;
      setOperationProgress({ id, title: title || '작업 처리 중...', detail: detail || '서버에 반영하고 있습니다.', pct });
      operationTimersRef.current.interval = setInterval(() => {
        pct = Math.min(96, pct + (pct < 55 ? 9 : pct < 80 ? 5 : 2));
        setOperationProgress(previous => previous?.id === id ? { ...previous, pct } : previous);
      }, 650);
    }, delay);
    try {
      return await task();
    } finally {
      finishSoon();
    }
  };

  const [confirmDialog, setConfirmDialog] = React.useState(null);
  const showConfirmDialog = (title, message, onConfirm, showPasswordInput = false) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        setConfirmDialog(null);
        onConfirm();
      },
      showPasswordInput
    });
  };
  const showAlert = (title, message) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => setConfirmDialog(null),
      alertOnly: true
    });
  };

  return {
    toast,
    operationProgress,
    showToast,
    dismissToast,
    showUndoableDeleteToast,
    showRetryableUploadToast,
    runWithOperationProgress,
    confirmDialog,
    setConfirmDialog,
    showConfirmDialog,
    showAlert
  };
}
