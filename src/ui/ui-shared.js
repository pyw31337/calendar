/**
 * Shared UI primitives (P4-22)
 */
import { useTabStripGesture } from './tab-strip-gesture.js';
import { registerOverlay, isBatchClosing, getBatchId, noteMarkerConsumed, findDirtyCompanion, confirmMessageFor, OVERLAY_CLOSE_CONFIRM_TITLE } from '../core/overlay-stack.js';

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getActiveParticipants(calendar) {
  const f = __gatherUiDeps().getActiveParticipants || GATHER_APP_UTILS.getActiveParticipants;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPolls(calendar) {
  const f = __gatherUiDeps().getCalendarPolls || GATHER_APP_UTILS.getCalendarPolls;
  return typeof f === 'function' ? f(calendar) : [];
}
function getFooterFamilyLinks() {
  return __gatherUiDeps().FOOTER_FAMILY_LINKS || [];
}

/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

function setStoredChatParticipantId(...args) {
  const fn = (window.GATHER_APP_NOTIFICATIONS || {}).setStoredChatParticipantId;
  return typeof fn === 'function' ? fn(...args) : undefined;
}

function getActivePollOptions(...args) {
  const f = __gatherUiDeps().getActivePollOptions || GATHER_APP_UTILS.getActivePollOptions;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeColorValue(...args) {
  const f = __gatherUiDeps().normalizeColorValue || GATHER_APP_UTILS.normalizeColorValue;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAdminSession(...args) {
  const f = __gatherUiDeps().getAdminSession || GATHER_APP_UTILS.getAdminSession;
  return typeof f === 'function' ? f(...args) : undefined;
}
function setAdminSession(...args) {
  const f = __gatherUiDeps().setAdminSession || GATHER_APP_UTILS.setAdminSession;
  return typeof f === 'function' ? f(...args) : undefined;
}
function verifyAdminPasswordRemote(...args) {
  const f = __gatherUiDeps().verifyAdminPasswordRemote || GATHER_APP_UTILS.verifyAdminPasswordRemote;
  return typeof f === 'function' ? f(...args) : undefined;
}

const PRESET_COLORS = GATHER_APP_CONSTANTS.PRESET_COLORS || [];
function fetchLinkPreview(...args) {
  const f = __gatherUiDeps().fetchLinkPreview || GATHER_APP_UTILS.fetchLinkPreview;
  return typeof f === 'function' ? f(...args) : undefined;
}
function useLinkPreview(url, cachedData) {
  const React = window.React;
  const [state, setState] = React.useState(() => {
    if (cachedData) return { status: 'success', data: cachedData };
    return null;
  });
  React.useEffect(() => {
    if (cachedData) {
      setState({ status: 'success', data: cachedData });
      return;
    }
    if (!url) return;
    let cancelled = false;
    setState({ status: 'loading' });
    const f = __gatherUiDeps().fetchLinkPreview || (typeof fetchLinkPreview === 'function' ? fetchLinkPreview : null);
    if (typeof f === 'function') {
      f(url).then(result => {
        if (!cancelled) setState(result);
      }).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [url, cachedData]);
  return state;
}
function getPollOptionVoterIds(...args) {
  const f = __gatherUiDeps().getPollOptionVoterIds || GATHER_APP_UTILS.getPollOptionVoterIds;
  return typeof f === 'function' ? f(...args) : undefined;
}
export function ResizableModalContainer({ className, style, children, ...props }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const containerRef = React.useRef(null);
  const [dimensions, setDimensions] = React.useState(null); // { width, height }
  const [moved, setMoved] = React.useState(null); // { left, top } after PC drag
  const isDraggingRef = React.useRef(false);
  const dragModeRef = React.useRef(null); // 'se' | 'move' | 'resize-y'
  const startPosRef = React.useRef({ x: 0, y: 0 });
  const startDimRef = React.useRef({ w: 0, h: 0, left: 0, top: 0 });
  const activePointerCleanupRef = React.useRef(null);

  const isPcSheet = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1200px)').matches;

  const getContainingBlockOffset = el => {
    let parent = el ? (el.offsetParent || el.parentElement) : null;
    while (parent && parent !== document.documentElement && parent !== document.body) {
      const cs = window.getComputedStyle(parent);
      if (
        cs.transform !== 'none' ||
        cs.perspective !== 'none' ||
        cs.filter !== 'none' ||
        cs.backdropFilter !== 'none' ||
        cs.webkitBackdropFilter !== 'none' ||
        cs.contain === 'paint' ||
        cs.contain === 'strict' ||
        cs.contain === 'layout'
      ) {
        const pRect = parent.getBoundingClientRect();
        return { left: pRect.left, top: pRect.top };
      }
      parent = parent.parentElement;
    }
    return { left: 0, top: 0 };
  };

  const applyMovedStyle = (left, top) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('position', 'fixed', 'important');
    el.style.setProperty('left', `${left}px`, 'important');
    el.style.setProperty('top', `${top}px`, 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('margin', '0', 'important');
  };
  const applyHeightStyle = (height) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('height', `${height}px`, 'important');
    el.style.setProperty('max-height', 'none', 'important');
  };

  const getVisibleHeight = () => {
    const syncedHeight = Number.parseFloat(document.documentElement.style.getPropertyValue('--app-vv-height'));
    if (syncedHeight) return syncedHeight;
    const vv = window.visualViewport;
    return vv && typeof vv.height === 'number' ? vv.height : window.innerHeight;
  };
  const getResizeMaxHeight = () => {
    const overlay = containerRef.current?.closest('.modal-overlay, .bottom-sheet-overlay');
    const overlayStyle = overlay ? window.getComputedStyle(overlay) : null;
    const topClearance = Number.parseFloat(overlayStyle?.paddingTop || '0') || 0;
    const bottomClearance = Number.parseFloat(overlayStyle?.paddingBottom || '0') || 0;
    return Math.max(220, Math.floor(getVisibleHeight() - topClearance - bottomClearance));
  };

  const handleMouseDown = e => {
    if (e.button !== 0) return; // Only left-click
    isDraggingRef.current = true;
    dragModeRef.current = 'se';
    startPosRef.current = { x: e.clientX, y: e.clientY };
    const rect = containerRef.current.getBoundingClientRect();
    startDimRef.current = { w: rect.width, h: rect.height };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = e => {
    isDraggingRef.current = true;
    startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const rect = containerRef.current.getBoundingClientRect();
    startDimRef.current = { w: rect.width, h: rect.height };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseMove = e => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    if (dragModeRef.current === 'move') {
      applyMovedStyle(startDimRef.current.left + deltaX, startDimRef.current.top + deltaY);
      return;
    }
    if (dragModeRef.current === 'resize-y') {
      const nextH = Math.max(220, Math.min(getResizeMaxHeight(), startDimRef.current.h - deltaY));
      applyHeightStyle(nextH);
      return;
    }
    setDimensions({
      width: Math.max(280, startDimRef.current.w + deltaX),
      height: Math.max(150, startDimRef.current.h + deltaY)
    });
  };

  const handleTouchMove = e => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();
    const deltaX = e.touches[0].clientX - startPosRef.current.x;
    const deltaY = e.touches[0].clientY - startPosRef.current.y;
    if (dragModeRef.current === 'move') {
      applyMovedStyle(startDimRef.current.left + deltaX, startDimRef.current.top + deltaY);
      return;
    }
    if (dragModeRef.current === 'resize-y') {
      const nextH = Math.max(220, Math.min(getResizeMaxHeight(), startDimRef.current.h - deltaY));
      applyHeightStyle(nextH);
      return;
    }
    setDimensions({
      width: Math.max(280, startDimRef.current.w + deltaX),
      height: Math.max(150, startDimRef.current.h + deltaY)
    });
  };

  const handleMouseUp = () => {
    if (dragModeRef.current === 'move' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cb = getContainingBlockOffset(containerRef.current);
      setMoved({ left: rect.left - cb.left, top: rect.top - cb.top });
    }
    if (dragModeRef.current === 'resize-y' && containerRef.current) {
      setDimensions(prev => ({
        width: (prev && prev.width) || containerRef.current.getBoundingClientRect().width,
        height: containerRef.current.getBoundingClientRect().height
      }));
    }
    isDraggingRef.current = false;
    dragModeRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    const blockClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      document.removeEventListener('click', blockClick, true);
    };
    document.addEventListener('click', blockClick, true);
    setTimeout(() => document.removeEventListener('click', blockClick, true), 0);
  };

  const handleTouchEnd = () => {
    if (dragModeRef.current === 'move' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cb = getContainingBlockOffset(containerRef.current);
      setMoved({ left: rect.left - cb.left, top: rect.top - cb.top });
    }
    if (dragModeRef.current === 'resize-y' && containerRef.current) {
      setDimensions(prev => ({
        width: (prev && prev.width) || containerRef.current.getBoundingClientRect().width,
        height: containerRef.current.getBoundingClientRect().height
      }));
    }
    isDraggingRef.current = false;
    dragModeRef.current = null;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    const blockClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      document.removeEventListener('click', blockClick, true);
    };
    document.addEventListener('click', blockClick, true);
    setTimeout(() => document.removeEventListener('click', blockClick, true), 0);
  };

  const startHandleDrag = (clientX, clientY) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cb = getContainingBlockOffset(el);
    const initialLeft = rect.left - cb.left;
    const initialTop = rect.top - cb.top;
    isDraggingRef.current = true;
    startPosRef.current = { x: clientX, y: clientY };
    startDimRef.current = { w: rect.width, h: rect.height, left: initialLeft, top: initialTop };
    if (isPcSheet()) {
      dragModeRef.current = 'move';
      applyMovedStyle(initialLeft, initialTop);
    } else {
      dragModeRef.current = 'resize-y';
    }
  };
  const onHandleMouseDown = e => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    startHandleDrag(e.clientX, e.clientY);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const onHandleTouchStart = e => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    const t = e.touches && e.touches[0];
    if (!t) return;
    startHandleDrag(t.clientX, t.clientY);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  const onHandlePointerDown = e => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    startHandleDrag(e.clientX, e.clientY);
    const handle = e.currentTarget;
    const pointerId = e.pointerId;
    activePointerCleanupRef.current?.();
    try { handle.setPointerCapture?.(pointerId); } catch (_) {}
    const onPointerMove = event => {
      if (!event.isPrimary || event.pointerId !== pointerId) return;
      if (event.cancelable) event.preventDefault();
      handleMouseMove(event);
    };
    const onPointerEnd = event => {
      if (!event.isPrimary || event.pointerId !== pointerId) return;
      cleanupPointer();
      handleMouseUp();
    };
    const cleanupPointer = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerEnd);
      document.removeEventListener('pointercancel', onPointerEnd);
      try { handle.releasePointerCapture?.(pointerId); } catch (_) {}
      if (activePointerCleanupRef.current === cleanupPointer) activePointerCleanupRef.current = null;
    };
    activePointerCleanupRef.current = cleanupPointer;
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', onPointerEnd);
    document.addEventListener('pointercancel', onPointerEnd);
  };

  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;
    const handles = root.querySelectorAll('.bp-sheet-handle, .v2-modal-drag-handle');
    const supportsPointerEvents = typeof window.PointerEvent === 'function';
    handles.forEach(handle => {
      if (supportsPointerEvents) handle.addEventListener('pointerdown', onHandlePointerDown, { passive: false });
      else {
        handle.addEventListener('mousedown', onHandleMouseDown);
        handle.addEventListener('touchstart', onHandleTouchStart, { passive: false });
      }
    });
    return () => {
      handles.forEach(handle => {
        if (supportsPointerEvents) handle.removeEventListener('pointerdown', onHandlePointerDown);
        else {
          handle.removeEventListener('mousedown', onHandleMouseDown);
          handle.removeEventListener('touchstart', onHandleTouchStart);
        }
      });
    };
  }, []);

  React.useEffect(() => {
    return () => {
      activePointerCleanupRef.current?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Fit modal using --app-vv-height; re-run on the same return signals as #870 (no settle fan-out).
  React.useEffect(() => {
    if (dimensions) return undefined;
    const root = document.documentElement;
    const apply = () => {
      const vvH = getVisibleHeight();
      const topRaw = Number.parseFloat(root.style.getPropertyValue('--app-vv-offset-top'));
      const vvTop = Number.isFinite(topRaw) && topRaw > 0 ? topRaw : 0;
      const isMemoEdit = containerRef.current?.classList.contains('memo-edit-modal-container');
      const reserved = window.matchMedia?.('(max-width: 640px)').matches ? 20 : 32;
      const maxPx = Math.max(180, Math.floor(Math.min(isMemoEdit ? 780 : 860, vvH - vvTop - reserved)));
      root.style.setProperty('--gather-vv-modal-max', `${maxPx}px`);
      if (containerRef.current) containerRef.current.style.maxHeight = `${maxPx}px`;
    };
    const onVis = () => { if (document.visibilityState !== 'hidden') apply(); };
    const onSw = (e) => { if (e?.data?.type === 'notification-open') apply(); };
    const vv = window.visualViewport;
    vv?.addEventListener('resize', apply);
    window.addEventListener('resize', apply);
    window.addEventListener('pageshow', apply);
    window.addEventListener('focus', apply);
    document.addEventListener('visibilitychange', onVis);
    try { navigator.serviceWorker?.addEventListener('message', onSw); } catch (_) {}
    apply();
    return () => {
      vv?.removeEventListener('resize', apply);
      window.removeEventListener('resize', apply);
      window.removeEventListener('pageshow', apply);
      window.removeEventListener('focus', apply);
      document.removeEventListener('visibilitychange', onVis);
      try { navigator.serviceWorker?.removeEventListener('message', onSw); } catch (_) {}
    };
  }, [dimensions]);

  const mergedStyle = {
    ...style,
    position: moved ? 'fixed' : 'relative',
    ...(moved ? {
      '--sheet-left': `${moved.left}px`,
      '--sheet-top': `${moved.top}px`,
      left: `${moved.left}px`,
      top: `${moved.top}px`,
      right: 'auto',
      bottom: 'auto',
      margin: 0,
      transform: 'none'
    } : {}),
    ...(dimensions ? {
      '--sheet-height': `${dimensions.height}px`,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      maxWidth: 'none',
      maxHeight: 'none'
    } : {})
  };

  const hasOwnHandle = React.Children.toArray(children).some(child => {
    const className = child?.props?.className;
    return typeof className === 'string' && (className.includes('bp-sheet-handle') || className.includes('v2-modal-drag-handle'));
  });

  return /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    // Every resizable modal opts into the shared V2 responsive overlay module.
    // The class is inert in the legacy shell and lets the V2 stylesheet provide
    // one predictable PC-center/mobile-bottom-sheet contract without rewriting
    // each modal implementation.
    className: ["modal-container", "v2-responsive-modal", moved ? "is-sheet-moved" : "", dimensions ? "is-sheet-resized" : "", className].filter(Boolean).join(" "),
    style: mergedStyle,
    ...props
  },
    hasOwnHandle ? null : /*#__PURE__*/React.createElement("div", {
      className: "bp-sheet-handle v2-modal-drag-handle",
      "aria-hidden": true
    }),
    children,
    /* Resize handle at bottom right */
    /*#__PURE__*/React.createElement("div", {
      onMouseDown: e => { e.preventDefault(); e.stopPropagation(); handleMouseDown(e); },
      onTouchStart: e => { e.stopPropagation(); handleTouchStart(e); },
      onClick: e => { e.preventDefault(); e.stopPropagation(); },
      style: {
        position: 'absolute',
        right: '4px',
        bottom: '4px',
        width: '18px',
        height: '18px',
        cursor: 'se-resize',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        userSelect: 'none',
        touchAction: 'none'
      }
    },
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "1em",
        height: "1em",
        viewBox: "0 0 16 16",
        style: { pointerEvents: 'none' }
      },
        /*#__PURE__*/React.createElement("path", { d: "M0 0h16v16H0z", fill: "none" }),
        /*#__PURE__*/React.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M14.776 4.284a.75.75 0 0 0-1.06-1.06L3.22 13.72a.75.75 0 1 0 1.06 1.06zm0 5a.75.75 0 0 0-1.06-1.06L8.22 13.72a.75.75 0 1 0 1.06 1.06z", clipRule: "evenodd" })
      )
    )
  );
}


/** Keep mobile keyboard open after tag/comment save by restoring focus ASAP (incl. remounts). */
export function refocusComposerField(inputRef) {
  const resolve = () => {
    if (!inputRef) return null;
    if (typeof inputRef === 'object') return inputRef.current || null;
    return null;
  };
  const focusNow = () => {
    const el = resolve();
    if (!el || typeof el.focus !== 'function') return false;
    try { el.focus({ preventScroll: true }); } catch (_) {
      try { el.focus(); } catch (__) { return false; }
    }
    return true;
  };
  focusNow();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      focusNow();
      requestAnimationFrame(focusNow);
    });
  } else if (typeof setTimeout === 'function') {
    setTimeout(focusNow, 0);
    setTimeout(focusNow, 50);
  }
}

export function AutoGrowTextarea({
  maxHeight = 480,
  value,
  onChange,
  style = null,
  className = 'form-input',
  minHeight = 44,
  textareaRef = null,
  ...rest
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const autoGrowTextarea = __deps.autoGrowTextarea;

  const innerRef = React.useRef(null);
  const setRefs = React.useCallback(el => {
    innerRef.current = el;
    if (typeof textareaRef === 'function') textareaRef(el);
    else if (textareaRef && typeof textareaRef === 'object') textareaRef.current = el;
  }, [textareaRef]);
  React.useLayoutEffect(() => {
    autoGrowTextarea(innerRef.current, maxHeight);
  }, [value, maxHeight]);
  return /*#__PURE__*/React.createElement("textarea", Object.assign({
    ref: setRefs,
    className: className,
    value: value,
    onChange: e => {
      if (typeof onChange === 'function') onChange(e);
      autoGrowTextarea(e.target, maxHeight);
    },
    onInput: e => autoGrowTextarea(e.target, maxHeight),
    style: Object.assign({
      resize: 'none',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: '100%',
      minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      fontFamily: 'inherit',
      lineHeight: 1.45,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere'
    }, style || {})
  }, rest));
}

export function FormAddEditActionButtons({ isEditing, isSaving, onCancel, onSubmit, disabled = false, savingLabel = '저장 중...', alignSelf = null, flexGrow = false }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const base = {
    flexShrink: flexGrow ? 1 : 0,
    height: '44px',
    minHeight: '44px',
    minWidth: '44px',
    padding: '0 16px',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    justifyContent: 'center'
  };
  if (flexGrow) base.flex = 1;
  if (alignSelf) base.alignSelf = alignSelf;
  const primaryStyle = isEditing
    ? { ...base, backgroundColor: '#0F172A', borderColor: '#0F172A', color: '#FFFFFF' }
    : base;
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    isEditing && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary",
      style: base,
      disabled: !!isSaving,
      onClick: e => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (typeof onCancel === 'function') onCancel(e);
      }
    }, "취소"),
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary",
      style: primaryStyle,
      disabled: !!isSaving || !!disabled,
      onClick: e => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (typeof onSubmit === 'function') onSubmit(e);
      }
    }, isSaving ? savingLabel : (isEditing ? '수정' : '추가'))
  );
}

export function UnderlineTabs({ options = [], value, onChange, ariaLabel, className = '', style = null, activeColor = 'var(--v2-primary, #7C3AED)', variant = null }) {
  const React = window.React;
  const list = Array.isArray(options) ? options : [];
  const { rootRef, gestureProps } = useTabStripGesture({
    values: list.map(opt => opt.value),
    value,
    onChange,
  });
  // 'flush' sits edge-to-edge on the modal/page width with equal flex children and no extra
  // horizontal padding. The active 2px underline stays inside the tab (margin 0) so it rests
  // on top of the container hairline instead of hanging below it.
  const isFlush = variant === 'flush';
  return /*#__PURE__*/React.createElement('div', {
    ...gestureProps,
    ref: rootRef,
    className: `underline-tabs${isFlush ? ' underline-tabs--flush' : ''}${className ? ' ' + className : ''}`,
    role: 'tablist',
    'aria-label': ariaLabel || undefined,
    style: {
      display: 'flex',
      width: isFlush ? undefined : '100%',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-card)',
      flexShrink: 0,
      boxSizing: 'border-box',
      paddingLeft: isFlush ? 0 : undefined,
      paddingRight: isFlush ? 0 : undefined,
      touchAction: 'pan-y',
      ...(style || {})
    }
  }, list.map(opt => {
    const id = opt.value;
    const isActive = value === id;
    const label = typeof opt.label === 'function' ? opt.label(isActive) : opt.label;
    const badge = opt.badge;
    const isDotBadge = opt.badgeMode === 'dot';
    // Content search (and similar) fades tabs with 0 hits so empty categories read as inactive
    // without removing them from the bar -- mirrors the muted empty-state copy inside those tabs.
    const isFaded = !!opt.faded;
    // A number count shows only on the active tab (every screen); dot badges stay on all tabs.
    const showBadge = (isDotBadge || isActive || opt.badgeAlways === true) && badge != null && badge !== '' && !(isFaded && (badge === 0 || badge === '0')) && (!isDotBadge || Number(badge) > 0);
    // A tab label is not a badge.  Give it its own hook so event-sheet labels can use the
    // readable tab type scale while numeric counts retain the compact badge treatment.
    // The populated-state dot is a CSS pseudo-element; its shared dimensions live in V2
    // tokens instead of inline pixel values, so every event tab stays in sync.
    const labelWithOptionalDot = /*#__PURE__*/React.createElement('span', {
      className: `underline-tabs-label${isDotBadge && showBadge ? ' has-status-dot' : ''}`
    }, label);
    return /*#__PURE__*/React.createElement('button', {
      key: String(id),
      type: 'button',
      role: 'tab',
      'aria-selected': isActive,
      onClick: () => { if (typeof onChange === 'function') onChange(id); },
      style: {
        flex: 1,
        padding: isFlush ? '12px 0' : '12px 0',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--font-size-md)',
        fontWeight: 800,
        color: isFaded ? 'var(--text-light)' : (isActive ? activeColor : 'var(--text-muted)'),
        opacity: isFaded ? 0.45 : 1,
        borderBottom: isActive ? `2px solid ${activeColor}` : '2px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '0',
        minWidth: 0
      }
    },
      labelWithOptionalDot,
      showBadge && !isDotBadge ? (() => {
        const badgeStr = String(badge);
        const isMulti = badgeStr.length > 1;
        return /*#__PURE__*/React.createElement('span', {
          className: 'underline-tabs-count' + (isMulti ? ' is-multi-digit' : ' is-single-digit'),
          'data-digits': isMulti ? 'multi' : 'single',
          style: {
            fontSize: 'var(--font-size-xs)',
            fontWeight: 800,
            padding: isMulti ? '0 5.5px' : '0',
            width: isMulti ? 'auto' : '18px',
            minWidth: '18px',
            height: '18px',
            aspectRatio: isMulti ? 'auto' : '1 / 1',
            borderRadius: '9999px',
            backgroundColor: isActive ? 'rgb(var(--a-brand-rgb, 124 58 237) / 0.12)' : 'var(--border-subtle)',
            color: isActive ? activeColor : 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            textAlign: 'center'
          }
        }, badgeStr);
      })() : null
    );
  }));
}

function getPaginationWindowInline(currentPage, pageCount, windowSize) {
  const f = (window.GATHER_APP_UTILS || {}).getPaginationWindow;
  if (typeof f === 'function') return f(currentPage, pageCount, windowSize);
  const current = Math.min(pageCount, Math.max(1, Number(currentPage) || 1));
  const count = Math.max(1, Number(pageCount) || 1);
  const size = Math.max(1, Number(windowSize) || 10);
  if (count <= size) return Array.from({ length: count }, (_, i) => i + 1);
  const half = Math.floor(size / 2);
  let start = current - half;
  let end = start + size - 1;
  if (start < 1) {
    start = 1;
    end = Math.min(count, size);
  } else if (end > count) {
    end = count;
    start = Math.max(1, count - size + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function CommonPagination({
  currentPage = 1,
  pageCount = 1,
  onChange,
  label = '페이지',
  isMobile: isMobileProp,
  loading = false,
  className = '',
  style = {}
} = {}) {
  const React = window.React;
  const [internalMobile, setInternalMobile] = React.useState(() => {
    return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 640px)').matches : false;
  });
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = () => setInternalMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  const isMobile = isMobileProp != null ? Boolean(isMobileProp) : internalMobile;
  if (pageCount <= 1) return null;

  const windowSize = isMobile ? 5 : 10;
  const curr = Math.min(pageCount, Math.max(1, Number(currentPage) || 1));
  const pages = getPaginationWindowInline(curr, pageCount, windowSize);

  const go = page => {
    if (loading || page < 1 || page > pageCount || page === curr || typeof onChange !== 'function') return;
    onChange(page);
  };

  const chevron = (direction, key) => React.createElement('svg', {
    key,
    xmlns: 'http://www.w3.org/2000/svg', width: isMobile ? '13' : '16', height: isMobile ? '13' : '16', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { transform: direction === 'left' ? 'rotate(90deg)' : 'rotate(-90deg)', display: 'inline-block' },
    className: 'icon icon-tabler icons-tabler-outline icon-tabler-chevron-down', 'aria-hidden': 'true'
  },
    React.createElement('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    React.createElement('path', { d: 'M6 9l6 6l6 -6' })
  );

  const doubleChevron = direction => React.createElement('span', {
    style: { display: 'inline-flex', alignItems: 'center' }
  },
    chevron(direction, `${direction}-a`),
    React.createElement('span', { style: { display: 'inline-flex', marginLeft: isMobile ? '-9px' : '-10px' } },
      chevron(direction, `${direction}-b`)
    )
  );

  const arrow = (btnLabel, targetPage, disabled, glyph) => React.createElement('button', {
    key: btnLabel, type: 'button',
    className: 'gallery-pagination-button gallery-pagination-arrow',
    'aria-label': btnLabel,
    disabled: disabled || loading,
    onClick: () => go(targetPage)
  }, glyph);

  return React.createElement('nav', {
    className: `gallery-pagination${isMobile ? ' is-mobile' : ''}${className ? ` ${className}` : ''}`,
    'aria-label': `${label} 페이지`,
    ref: (el) => {
      if (!el) return;
      // Card rules on grid children use background !important. Inline important
      // is the one thing that still wins if a stale sheet paints the plate.
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('border', '0', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
      el.style.setProperty('border-radius', '0', 'important');
    },
    style
  },
    arrow('첫 페이지', 1, curr <= 1, doubleChevron('left')),
    arrow('이전 페이지', curr - 1, curr <= 1, chevron('left')),
    pages.map(page => React.createElement('button', {
      key: page,
      type: 'button',
      className: `gallery-pagination-button${page === curr ? ' is-active' : ''}`,
      'aria-current': page === curr ? 'page' : undefined,
      disabled: loading,
      onClick: () => go(page)
    }, String(page))),
    arrow('다음 페이지', curr + 1, curr >= pageCount, chevron('right')),
    arrow('마지막 페이지', pageCount, curr >= pageCount, doubleChevron('right'))
  );
}

// Edit-mode selection checkbox. Spec taken from gallery 링크/파일 cards:
// 8px inset, 20×20, radius 5. `onMedia` is the dark chip on photos/thumbnails;
// `onCard` is the light chip on white list cards (장소).
export function EditSelectCheckbox({ checked = false, variant = 'onMedia' } = {}) {
  const React = window.React;
  const onMedia = variant !== 'onCard';
  return React.createElement('span', {
    'aria-hidden': true,
    className: 'edit-select-checkbox',
    style: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      width: '20px',
      height: '20px',
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 4,
      boxShadow: onMedia ? '0 1px 3px rgba(0,0,0,0.35)' : '0 1px 3px rgba(0,0,0,0.15)',
      border: checked ? 'none' : (onMedia ? '2px solid rgba(255,255,255,0.95)' : '2px solid var(--border-strong, #94A3B8)'),
      backgroundColor: checked ? 'var(--accent-primary)' : (onMedia ? 'rgba(0,0,0,0.35)' : 'var(--bg-card)')
    }
  }, checked ? React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24',
    fill: 'none', stroke: '#fff', strokeWidth: '3', strokeLinecap: 'round', strokeLinejoin: 'round'
  }, React.createElement('path', { d: 'M20 6 9 17l-5-5' })) : null);
}

// Idle: 추가/편집 sit on the right. Edit: 제거/붙여넣기/일괄공유/취소.
// Mobile edit fills the row because 전체|일자 is hidden. Desktop stays content-sized
// so the four actions read as buttons, not a stretched bar.
export function getListEditActionWrapStyle(isEdit, isMobile) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '6px',
    flexShrink: 0,
    minWidth: 0,
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
    width: isEdit && isMobile ? '100%' : 'auto'
  };
}

export function getListEditTextBtnStyle(isMobile, isEdit) {
  return {
    height: '44px',
    minHeight: '44px',
    minWidth: '44px',
    padding: isMobile ? '0 8px' : '0 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: isMobile ? 'var(--font-size-sm)' : 'var(--font-size-md)',
    fontWeight: 900,
    cursor: 'pointer',
    flex: isEdit && isMobile ? 1 : '0 0 auto',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box'
  };
}

export const LIST_TOOLBAR_ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  padding: '12px 0 4px',
  minWidth: 0,
  flexWrap: 'nowrap',
  flexShrink: 0
};

export const PAGE_HEADER_ICON_BTN_STYLE = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px',
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

export const PAGE_HEADER_BACK_BTN_STYLE = {
  width: '28px',
  height: '28px',
  borderRadius: 0,
  backgroundColor: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  flexShrink: 0
};

export const PAGE_HEADER_ACTIONS_WRAP_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '4px',
  minWidth: '56px',
  flexShrink: 0
};

export const PAGE_HEADER_TITLE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  fontWeight: 800,
  fontSize: '0.95rem',
  color: 'var(--text-main)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
  flex: '1 1 auto'
};

export function SegmentedToggle({ options, value, onChange, disabled, style, ariaLabel }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const safeOptions = Array.isArray(options) ? options : [];
  const { rootRef, gestureProps } = useTabStripGesture({
    values: safeOptions.map(opt => opt.value),
    value,
    onChange,
    disabled,
  });
  return /*#__PURE__*/React.createElement("div", {
    ...gestureProps,
    ref: rootRef,
    role: "tablist",
    className: "segmented-toggle",
    "aria-label": ariaLabel,
    style: {
      display: 'flex', alignItems: 'stretch', padding: '3px', boxSizing: 'border-box',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', flexShrink: 0,
      touchAction: 'pan-y',
      ...style
    }
  }, safeOptions.flatMap((opt, i) => [
    i > 0 ? /*#__PURE__*/React.createElement("span", {
      key: `div-${opt.value}`, "aria-hidden": "true",
      style: { width: '1px', margin: '6px 2px', backgroundColor: 'var(--border-subtle)' }
    }) : null,
    /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      type: "button", role: "tab", "aria-selected": value === opt.value,
      disabled,
      onClick: () => onChange(opt.value),
      style: {
        flex: 1, minWidth: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        padding: '12px 16px', border: 'none', cursor: disabled ? 'default' : 'pointer', borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-size-md)', fontWeight: value === opt.value ? 900 : 500, whiteSpace: 'nowrap',
        backgroundColor: value === opt.value ? (opt.activeColor || 'var(--accent-primary)') : 'transparent',
        color: value === opt.value ? '#FFFFFF' : 'var(--text-muted)'
      }
    }, opt.label)
  ]).filter(Boolean));
}

export function ItemEditDeleteActions({ onEdit, onDelete, editTitle = '수정', deleteTitle = '삭제', showEdit = true, showDelete = true }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;

  return /*#__PURE__*/React.createElement("div", {
    className: "item-edit-delete-actions",
    style: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }
  },
    showEdit && typeof onEdit === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => { e.preventDefault(); e.stopPropagation(); onEdit(e); },
      title: editTitle, "aria-label": editTitle,
      style: {
        width: '22px', height: '22px', border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(PencilIcon, { size: 12 })),
    showDelete && typeof onDelete === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => { e.preventDefault(); e.stopPropagation(); onDelete(e); },
      title: deleteTitle, "aria-label": deleteTitle,
      style: {
        width: '22px', height: '22px', border: 'none', background: 'none',
        padding: 0, cursor: 'pointer', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }))
  );
}

export function GamifiedConfirmButtonContent({ label }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const bolt = /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "100%", height: "100%",
    fill: "currentColor", "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", { d: "M13 2 3 14h8l-1 8 10-12h-8l1-8z" }));
  const star = /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "100%", height: "100%",
    fill: "currentColor", "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", { d: "M12 2l2.4 7.2H22l-6 4.8 2.3 7.2L12 16.8 5.7 21.2 8 14 2 9.2h7.6z" }));
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("span", { className: "gamified-shiny-glow-wrapper", "aria-hidden": true },
      /*#__PURE__*/React.createElement("span", { className: "gamified-shiny-glow" })
    ),
    /*#__PURE__*/React.createElement("span", {
      className: "gamified-border-electric",
      "aria-hidden": true
    }),
    /*#__PURE__*/React.createElement("span", {
      className: "gamified-border-electric gamified-border-electric-secondary",
      "aria-hidden": true
    }),
    /*#__PURE__*/React.createElement("span", { className: "gamified-sparks-container", "aria-hidden": true },
      [1,2,3,4,5,6].map(n => /*#__PURE__*/React.createElement("span", {
        key: "sp"+n, className: "gamified-spark gamified-spark-" + n
      }, bolt)),
      [1,2,3,4,5,6].map(n => /*#__PURE__*/React.createElement("span", {
        key: "sl"+n, className: "gamified-sparklet gamified-sparklet-" + n
      }, star))
    ),
    /*#__PURE__*/React.createElement("span", { className: "gamified-confirm-label" }, label)
  );
}

export function LinkPreviewCard({ url, fallbackTitle, cachedData, stretch = false, stretchWidth = null, noBorder = false, onStatusChange = null, marginTop = null, wrapTitle = false }) {
  // Stretch cards (memo/chat full-width) always get intentional 2-line titles so long
  // Korean names are not hard-clipped to ~70px; callers can still pass wrapTitle.
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const preview = useLinkPreview(url, cachedData);
  const hasPreviewData = !!(preview && preview.status === 'success' && preview.data);
  // Keep every hook before the conditional empty-state return below. Link previews resolve
  // asynchronously: the first render often has no data (and returns null), while a later render
  // has data. Calling this hook only after the return changes the hook count and triggers React
  // invariant #310 ("Rendered more hooks than during the previous render") in chat bubbles.
  const [imgFailed, setImgFailed] = React.useState(false);

  // Notify parents (e.g. DirectChatMediaText) when preview settles so they can hide the raw URL
  // from bubble text once a card is successfully showing -- while loading/failed the URL stays
  // visible/clickable. Fire on every preview.status change, including the cachedData success
  // path that useLinkPreview returns synchronously on mount. Keep the callback in a ref so a
  // fresh inline onStatusChange from the parent doesn't re-fire this effect every render.
  const onStatusChangeRef = React.useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;
  React.useEffect(() => {
    const cb = onStatusChangeRef.current;
    if (typeof cb !== 'function') return;
    if (preview && preview.status) {
      cb(preview.status);
    } else if (cachedData) {
      cb('success');
    }
  }, [preview, cachedData]);

  if (!hasPreviewData && !fallbackTitle) return null;

  const { title, description, image, siteName } = (hasPreviewData ? preview.data : {}) || {};
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./i, '');
  } catch (_) {}

  // Cached OpenGraph data is user/content supplied and older records may contain a malformed
  // image value. Do not let it become an invalid <img src>, which produces noisy browser errors
  // and can break page smoke checks. Valid network/data URLs still use the normal thumbnail.
  const imageSrc = (() => {
    if (imgFailed) return '';
    const candidate = typeof image === 'string' ? image.trim() : '';
    const validator = GATHER_APP_UTILS.isRenderableImageUrl;
    if (typeof validator === 'function' && validator(candidate)) return candidate;
    // A missing preview used to trigger Google's favicon proxy as a decorative fallback.
    // That endpoint can redirect to a 404 (notably in WebKit) and turns an otherwise valid text
    // card into a console/network failure. Keep the deterministic text-only card instead.
    return '';
  })();
  const isGenericTitle = !title || title === 'map.naver.com' || title === 'naver.me' || title.startsWith('map.naver');
  const displayTitle = (isGenericTitle && fallbackTitle) ? fallbackTitle : (title || fallbackTitle || siteName || host);
  const displayHost = (siteName && siteName !== displayTitle) ? siteName : host;

  if (!displayTitle && !description) return null;

  return /*#__PURE__*/React.createElement('a', {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: e => e.stopPropagation(),
    'data-no-press-feedback': true,
    className: 'link-preview-card',
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      width: stretchWidth || (stretch ? '100%' : 'fit-content'),
      // min(100%, 280px), not a plain 280px: the bubble this card sits in is fit-content-sized
      // and can end up narrower than 280px (long participant badge, narrow phone, reply context),
      // and overflow below is 'hidden' now specifically so a too-wide title/description gets
      // truncated INSIDE whichever of the two is actually smaller instead of visually spilling
      // out past the card's own right edge.
      maxWidth: stretchWidth || (stretch ? '100%' : 'min(100%, 280px)'),
      boxSizing: 'border-box',
      gap: '10px',
      marginTop: marginTop != null ? (typeof marginTop === 'number' ? `${marginTop}px` : marginTop) : (stretch ? '0px' : '6px'),
      border: noBorder ? 'none' : '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      // Was 'visible' -- with a nowrap+ellipsis title inside a flex child, 'visible' let the
      // untruncated text render past this box's own edge (and the bubble's) instead of actually
      // being clipped/ellipsized at it. 'hidden' is what makes the title/description's own
      // overflow:hidden + text-overflow:ellipsis further down actually take effect.
      overflow: 'hidden',
      textDecoration: 'none',
      color: 'inherit',
      backgroundColor: 'var(--bg-card)'
    }
  },
      imageSrc && /*#__PURE__*/React.createElement('img', {
      src: imageSrc,
      alt: '',
      loading: 'lazy',
      decoding: 'async',
      referrerPolicy: 'no-referrer',
      onError: () => setImgFailed(true),
      style: {
        width: '72px',
        height: '72px',
        objectFit: 'cover',
        flexShrink: 0,
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'calc(var(--radius-md) - 1px) 0 0 calc(var(--radius-md) - 1px)'
      }
    }),
    /*#__PURE__*/React.createElement('div', {
      style: {
        padding: imageSrc ? '8px 10px 8px 0' : '8px 10px',
        minWidth: 0,
        maxWidth: stretch ? 'none' : (imageSrc ? '198px' : '270px'),
        flex: stretch ? '1 1 0%' : '0 1 auto',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'stretch',
        gap: '4px',
        minHeight: imageSrc ? '72px' : 'auto'
      }
    },
      displayTitle && /*#__PURE__*/React.createElement('div', {
        className: (stretch || wrapTitle) ? 'link-preview-card-title is-wrap' : 'link-preview-card-title',
        style: {
          fontSize: 'var(--font-size-md)',
          fontWeight: 700,
          lineHeight: 1.25,
          color: 'var(--text-main)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: (stretch || wrapTitle) ? 'normal' : 'nowrap',
          wordBreak: (stretch || wrapTitle) ? 'keep-all' : undefined,
          overflowWrap: (stretch || wrapTitle) ? 'anywhere' : undefined,
          display: (stretch || wrapTitle) ? '-webkit-box' : undefined,
          WebkitLineClamp: (stretch || wrapTitle) ? 2 : undefined,
          WebkitBoxOrient: (stretch || wrapTitle) ? 'vertical' : undefined
        }
      }, displayTitle),
      description && /*#__PURE__*/React.createElement('div', {
        style: {
          fontSize: 'var(--font-size-sm)',
          lineHeight: 1.3,
          color: 'var(--text-muted)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }
      }, description),
      displayHost && /*#__PURE__*/React.createElement('div', {
        style: {
          fontSize: 'var(--font-size-2xs)',
          lineHeight: 1.2,
          color: 'var(--text-light)'
        }
      }, displayHost)
    )
  );
}

export function LinkPreviewProgressOverlay({ progress, remainingSec }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return ReactDOM.createPortal(
    /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      style: { zIndex: 12000, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
      /*#__PURE__*/React.createElement((window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ResizableModalContainer) || "div", {
        className: "modal-container",
        style: { width: '100%', maxWidth: '360px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }
      },
        /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1rem', fontWeight: 800, textAlign: 'center', margin: 0, color: 'var(--text-main)' } }, "링크 미리보기 가져오는 중"),
        /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', textAlign: 'center' } }, "웹페이지 정보를 분석하고 있습니다."),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', fontWeight: 700 }
        },
          /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)' } }, "진행 상태"),
          /*#__PURE__*/React.createElement("span", { style: { color: 'var(--accent-primary)' } }, `${progress}% (약 ${remainingSec}초 남음)`)
        ),
        /*#__PURE__*/React.createElement("div", {
          style: { width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }
        },
          /*#__PURE__*/React.createElement("div", {
            style: {
              width: `${progress}%`,
              height: '100%',
              backgroundColor: 'var(--accent-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.1s linear'
            }
          })
        )
      )
    ),
    document.body
  );
}

export function AdminLoginGate({ children }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const LockIcon = __comp.LockIcon || __deps.LockIcon;

  const [status, setStatus] = React.useState('checking'); // 'checking' | 'locked' | 'unlocked'
  const [passwordInput, setPasswordInput] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.fontSize = '';
    setStatus(getAdminSession() ? 'unlocked' : 'locked');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = passwordInput.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const ok = await verifyAdminPasswordRemote(trimmed);
      if (ok) {
        setAdminSession(trimmed);
        setPasswordInput('');
        setStatus('unlocked');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.warn('Admin auth check failed:', err);
      setError(err?.message || '인증 확인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'checking') return null;
  if (status === 'unlocked') return children;

  return /*#__PURE__*/React.createElement("div", {
    className: "admin-login-gate",
    style: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)', padding: '20px'
    }
  },
    /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "modal-container",
      style: { maxWidth: '320px', padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '14px' }
    },
      /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(LockIcon, null), "관리자 인증"),
      /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' } }, "비밀번호를 입력해 주세요."),
      /*#__PURE__*/React.createElement("input", {
        type: "password",
        className: "form-input",
        style: { width: '100%' },
        autoFocus: true,
        value: passwordInput,
        onChange: e => setPasswordInput(e.target.value),
        placeholder: "비밀번호"
      }),
      error && /*#__PURE__*/React.createElement("div", { style: { color: '#DC2626', fontSize: 'var(--font-size-md)' } }, error),
      /*#__PURE__*/React.createElement("button", {
        type: "submit",
        className: "btn btn-primary",
        disabled: isSubmitting || !passwordInput.trim(),
        style: { opacity: isSubmitting || !passwordInput.trim() ? 0.6 : 1 }
      }, isSubmitting ? '확인 중...' : '입장')
    )
  );
}

export function DonutChart({ segments, size = 84, strokeWidth = 14 }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [activeIndex, setActiveIndex] = React.useState(null);
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const positiveSegments = segments.filter(seg => seg.value > 0);
  const activeSeg = activeIndex != null ? positiveSegments[activeIndex] : null;
  let dashOffsetAcc = 0;
  return /*#__PURE__*/React.createElement("div", { style: { position: 'relative', display: 'inline-flex', flexShrink: 0 } },
    /*#__PURE__*/React.createElement("svg", {
      width: size, height: size, viewBox: `0 0 ${size} ${size}`, style: { flexShrink: 0 },
      onMouseLeave: () => setActiveIndex(null)
    },
      total === 0 ?
        /*#__PURE__*/React.createElement("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "#E2E8F0", strokeWidth }) :
        positiveSegments.map((seg, idx) => {
          const dash = seg.value / total * circumference;
          const el = /*#__PURE__*/React.createElement("circle", {
            key: seg.label, cx: size / 2, cy: size / 2, r: radius, fill: "none",
            stroke: seg.color, strokeWidth,
            strokeDasharray: `${dash} ${circumference - dash}`,
            strokeDashoffset: -dashOffsetAcc,
            transform: `rotate(-90 ${size / 2} ${size / 2})`,
            strokeLinecap: positiveSegments.length > 1 ? 'butt' : 'round',
            style: {
              cursor: 'pointer',
              opacity: activeIndex == null || activeIndex === idx ? 1 : 0.4,
              transition: 'opacity 0.12s ease'
            },
            onMouseEnter: () => setActiveIndex(idx),
            onClick: event => {
              event.stopPropagation();
              setActiveIndex(prev => prev === idx ? null : idx);
            }
          });
          dashOffsetAcc += dash;
          return el;
        })
    ),
    activeSeg && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute', bottom: `calc(100% + 6px)`, left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(15, 23, 42, 0.94)', color: '#FFFFFF', borderRadius: 'var(--radius-sm)',
        padding: '4px 8px', fontSize: 'var(--font-size-2xs)', fontWeight: 700, whiteSpace: 'nowrap',
        pointerEvents: 'none', zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
      }
    }, `${activeSeg.label} · ${activeSeg.value}${activeSeg.unit || '건'} (${total > 0 ? Math.round(activeSeg.value / total * 100) : 0}%)`)
  );
}

export function ColorSwatchPicker({ value, onChange, disabled, title = "색상 선택" }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [isOpen, setIsOpen] = React.useState(false);
  const normalized = normalizeColorValue(value, '#64748B').toUpperCase();
  const swatchColors = PRESET_COLORS.map(c => c.toUpperCase()).includes(normalized)
    ? PRESET_COLORS
    : [normalized, ...PRESET_COLORS];
  const sheet = isOpen && /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    onClick: () => setIsOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, title),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' },
        onClick: () => setIsOpen(false)
      }, "✕")
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
      /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' } },
        swatchColors.map(color => {
          const isSelected = color.toUpperCase() === normalized;
          return /*#__PURE__*/React.createElement("button", {
            key: color,
            type: "button",
            "aria-label": color,
            onClick: () => { onChange(color); setIsOpen(false); },
            style: {
              width: '44px', height: '44px', borderRadius: '50%', backgroundColor: color,
              border: isSelected ? '3px solid var(--text-main)' : '1px solid var(--border-subtle)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 900, fontSize: '1rem'
            }
          }, isSelected && "✓");
        })
      )
    )
  ));
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "color-swatch-trigger",
      disabled,
      title,
      "aria-label": title,
      onClick: () => setIsOpen(true),
      style: { backgroundColor: normalized }
    }),
    sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet
  );
}

// Height (px) of the "채팅으로 이동 / ✕" controls bar shown below the video when floating --
// shared between the resize-drag math and the container height calc below so they can't drift
// apart.
const STICKY_VIDEO_CONTROLS_HEIGHT = 38;

// The single persistent chat-video player: one <iframe> DOM node, kept alive (same React `key`)
// for as long as `stickyVideo` is set, regardless of which app view is showing -- so playback is
// genuinely uninterrupted once a video is promoted. Always renders as a small resizable floating
// PIP fixed to the bottom-right corner, in every view including chat (the owning chat message
// shows a "playing in PIP" placeholder instead -- see DirectChatMediaText's isThisSticky branch --
// rather than a second, competing inline iframe).
//
// An earlier version tried portaling into the owning chat message's own placeholder box while it
// was mounted, so the video would look inline there instead of floating -- and before that, an
// even earlier version always portaled into document.body but used position:fixed + a transform
// continuously recalculated from the anchor's getBoundingClientRect() on every animation frame to
// make the fixed box visually track the anchor's position. Both were abandoned: the cross-origin
// iframe frequently failed to actually paint under the constant reparenting/re-transform. The
// portal here always targets one stable, never-recreated host div (see hostRef below) appended
// directly to document.body, so the iframe DOM node itself is never moved or recreated.
export function StickyVideoBox({ stickyVideo, onClose, onGoToChat }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  // User's drag-resized floating width (px), null until they've actually dragged the resize
  // handle -- falls back to the orientation-based default below. Persists only for as long as
  // this particular video stays active; a newly-activated video starts back at the default.
  const [floatWidth, setFloatWidth] = React.useState(null);
  const dragStateRef = React.useRef(null);

  // Host container div in document.body for persistent PIP player.
  // Always kept inside document.body so browsers never reload or reset the iframe browsing context
  // during view transitions or sequential video switches.
  const hostRef = React.useRef(null);
  if (!hostRef.current && typeof document !== 'undefined') {
    hostRef.current = document.createElement('div');
    hostRef.current.style.display = 'contents';
  }
  React.useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || typeof document === 'undefined') return undefined;
    if (host.parentNode !== document.body) document.body.appendChild(host);
  }, [!!stickyVideo]);
  React.useEffect(() => () => {
    const host = hostRef.current;
    if (host && host.parentNode) host.parentNode.removeChild(host);
  }, []);

  const isPortrait = !!(stickyVideo && stickyVideo.orientation === 'portrait');
  const defaultFloatWidth = isPortrait ? 172 : 260;
  const effectiveFloatWidth = floatWidth || defaultFloatWidth;
  const effectiveFloatHeight = isPortrait ? Math.round(effectiveFloatWidth * 16 / 9) : Math.round(effectiveFloatWidth * 9 / 16);

  // Drag-to-resize the floating mini player -- pointer events cover mouse and touch alike.
  const handleResizePointerDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = effectiveFloatWidth;
    dragStateRef.current = { startX, startWidth };
    const handleMove = moveEvent => {
      if (!dragStateRef.current) return;
      const dx = dragStateRef.current.startX - moveEvent.clientX;
      const maxWidthByViewportWidth = window.innerWidth - 28;
      const availableHeight = window.innerHeight - 28 - STICKY_VIDEO_CONTROLS_HEIGHT;
      const maxWidthByViewportHeight = isPortrait ? availableHeight * 9 / 16 : availableHeight * 16 / 9;
      const maxWidth = Math.max(120, Math.min(maxWidthByViewportWidth, maxWidthByViewportHeight));
      const next = Math.max(120, Math.min(maxWidth, dragStateRef.current.startWidth + dx));
      setFloatWidth(next);
    };
    const handleUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  if (!stickyVideo || typeof document === 'undefined' || !ReactDOM.createPortal || !hostRef.current) return null;
  const autoplaySrc = stickyVideo.embedUrl + (stickyVideo.embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';

  return ReactDOM.createPortal(/*#__PURE__*/React.createElement('div', {
    style: {
      position: 'fixed',
      right: '14px',
      bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
      left: 'auto',
      top: 'auto',
      width: `${effectiveFloatWidth}px`,
      height: `${effectiveFloatHeight + STICKY_VIDEO_CONTROLS_HEIGHT}px`,
      zIndex: 40000,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      background: '#000',
      boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
    }
  }, /*#__PURE__*/React.createElement('iframe', {
    key: stickyVideo.key,
    src: autoplaySrc,
    title: stickyVideo.title || '미니플레이어',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowFullScreen: true,
    style: { display: 'block', width: '100%', height: `${effectiveFloatHeight}px`, border: '0' }
  }), /*#__PURE__*/React.createElement('div', {
    onPointerDown: handleResizePointerDown,
    'aria-label': '미니플레이어 크기 조절',
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '22px',
      height: '22px',
      cursor: 'nwse-resize',
      touchAction: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.85)',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.55) 45%, transparent 46%)'
    }
  }, /*#__PURE__*/React.createElement('svg', {
    width: '10', height: '10', viewBox: '0 0 10 10', fill: 'none', stroke: 'currentColor', strokeWidth: '1.4', strokeLinecap: 'round'
  }, /*#__PURE__*/React.createElement('path', { d: 'M1 9 L9 1 M4.5 9 L9 4.5 M8 9 L9 8' }))), /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px',
      height: `${STICKY_VIDEO_CONTROLS_HEIGHT}px`,
      boxSizing: 'border-box',
      backgroundColor: 'rgba(15,23,42,0.94)'
    }
  }, /*#__PURE__*/React.createElement('button', {
    type: 'button',
    onClick: onGoToChat,
    style: {
      flex: 1,
      padding: '6px 8px',
      fontSize: 'var(--font-size-sm)',
      fontWeight: '700',
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.14)',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer'
    }
  }, '채팅으로 이동'), /*#__PURE__*/React.createElement('button', {
    type: 'button',
    onClick: onClose,
    'aria-label': '미니플레이어 닫기',
    style: {
      width: '26px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'var(--font-size-base)',
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.14)',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer'
    }
  }, '✕'))), hostRef.current);
}

// Shared "\uCC38\uC5EC\uC790 \uC120\uD0DD" bottom sheet -- portaled to document.body (see stopPropagation comment
// below), lists active participants as color-dot + name rows with a checkmark on the selected
// one(s). ChatParticipantSheet (ui-chat-sheets.js, single-select "\uC791\uC131\uC790 \uC120\uD0DD") and PollVoterSheet
// (below, multi-voter "\uD22C\uD45C\uC790 \uC120\uD0DD") used to each hand-roll this exact same sheet -- differing only
// in title text and selection semantics -- so this is the one place their shared chrome lives.
export function ParticipantSelectSheet({
  calendar,
  participants,
  title,
  isOptionSelected = () => false,
  onSelect,
  onClose,
  selectedLabel = '선택됨',
  disableSelected = false,
  getOptionStatus = null,
  isOptionDisabled = null
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const ParticipantBackdrop = __comp.ParticipantBackdrop || __deps.ParticipantBackdrop;

  const list = participants || getActiveParticipants(calendar);
  // Bottom-sheet rule: portal to document.body so a `position: fixed` sheet never gets trapped
  // by a transformed ancestor (e.g. a poll card's hover lift, or a memo card's :hover lift).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    // Portaled elements replay their synthetic events through the React component tree, not
    // the DOM tree, so this click would otherwise still bubble up to whatever ancestor
    // component (e.g. a poll card's or memo card's "tap to open" handler) rendered this sheet.
    onClick: e => { e.stopPropagation(); onClose(); },
    style: {
      alignItems: 'flex-end',
      backgroundColor: 'rgba(15, 23, 42, 0.68)',
      // Above the Lightbox's own overlay (ui-lightbox.js, zIndex: 50000) -- this sheet is also
      // opened from inside the Lightbox's comment composer (ParticipantPickerButton), and at
      // 11000 it rendered fully behind the Lightbox, making its options unclickable. Still well
      // below the toast/confirm-dialog layer (100000+) everywhere else this sheet is used.
      zIndex: 51000
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "poll-voter-sheet",
    style: { zIndex: 51001 }
  }, /*#__PURE__*/React.createElement("div", {
    className: "poll-voter-sheet-header"
  }, /*#__PURE__*/React.createElement("span", null, title), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, null))), /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gap: '8px', padding: '14px 20px 24px' }
  }, list.map(participant => {
    const selected = Boolean(isOptionSelected(participant.id));
    const status = typeof getOptionStatus === 'function'
      ? getOptionStatus(participant, { selected })
      : (selected ? selectedLabel : '');
    const disabled = Boolean((disableSelected && selected) || (typeof isOptionDisabled === 'function' && isOptionDisabled(participant, { selected, status })));
    return /*#__PURE__*/React.createElement("button", {
      key: participant.id,
      type: "button",
      className: "poll-voter-option",
      disabled: disabled,
      "aria-label": `${participant.name}${status ? `, ${status}` : ''}`,
      onClick: () => {
        if (!disabled && typeof onSelect === 'function') onSelect(participant.id);
      },
      style: disabled ? { cursor: 'not-allowed', opacity: 0.58 } : undefined
    }, /*#__PURE__*/React.createElement(ParticipantBackdrop, { participant: participant, name: participant.name, dotSize: 10, style: { gap: '10px' } }),
    status && /*#__PURE__*/React.createElement("span", {
      style: { marginLeft: 'auto', flexShrink: 0, color: 'var(--accent-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 900 }
    }, status));
  })))), document.body);
}

export function PollVoterSheet({ calendar, pollId, optionId, onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SharedParticipantSelectSheet = __comp.ParticipantSelectSheet || __deps.ParticipantSelectSheet || ParticipantSelectSheet;

  const participants = getActiveParticipants(calendar);
  const poll = getCalendarPolls(calendar).find(item => item.id === pollId);
  const option = getActivePollOptions(poll).find(item => item.id === optionId);
  if (!poll || !option) return null;
  const selectedIds = new Set(getPollOptionVoterIds(poll, option.id));
  return /*#__PURE__*/React.createElement(SharedParticipantSelectSheet, {
    calendar: calendar,
    participants: participants,
    title: "\uD22C\uD45C\uC790 \uC120\uD0DD",
    isOptionSelected: id => selectedIds.has(id),
    selectedLabel: '투표함',
    onSelect: id => {
      setStoredChatParticipantId(calendar?.id, id);
      onSelect(id);
    },
    onClose: onClose
  });
}

export function OperationProgressOverlay({ title, detail, pct }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const clamped = Math.max(0, Math.min(100, pct || 0));
  return /*#__PURE__*/React.createElement('div', {
    role: 'status',
    'aria-live': 'polite',
    style: { position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: '16px', zIndex: 100000, width: '300px', maxWidth: 'calc(100vw - 32px)', pointerEvents: 'none' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 18px', width: '100%', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px' } }, title || '작업 처리 중...'),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 } }, detail || '서버에 반영하고 있습니다.'),
    /*#__PURE__*/React.createElement('div', { style: { height: '9px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, background: 'var(--cta-fill, linear-gradient(90deg, #4F46E5, #EC4899))', transition: 'width 0.35s ease', borderRadius: 'var(--radius-full)' } })
    ),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: '6px', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', fontWeight: 800 } }, `${Math.round(clamped)}% · 다른 화면은 계속 사용할 수 있습니다.`)
  ));
}

export function ToggleSwitch({ checked, onChange, label }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    onClick: onChange,
    // The track is exactly the 20px knob + 2px on each side. Generic touch-target rules
    // (e.g. `.modal-body button { min-height: 36px }`) stretched it into an oval on phones, so
    // the size is pinned here and in the .toggle-switch CSS guard.
    className: "toggle-switch",
    style: {
      width: '44px', height: '24px', minHeight: '24px', maxHeight: '24px', minWidth: '44px',
      boxSizing: 'border-box', lineHeight: 0, alignSelf: 'center', WebkitAppearance: 'none', appearance: 'none',
      borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
      backgroundColor: checked ? 'var(--accent-primary)' : '#CBD5E1',
      position: 'relative', transition: 'background-color 0.2s ease', padding: 0, flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
      width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFFFFF',
      transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }
  }));
}

function getSyncStatusMeta(syncStatus = null) {
  const status = String(syncStatus?.status || 'live');
  const label = String(syncStatus?.label || '동기화됨');
  const lastSyncedText = String(syncStatus?.lastSyncedText || '').trim();
  const detail = String(syncStatus?.detail || '').trim();
  const title = [label, lastSyncedText ? `최근 ${lastSyncedText}` : '', detail].filter(Boolean).join(' · ') || label;
  return { status, label, lastSyncedText, detail, title };
}

export function SyncStatusChip({ syncStatus = null, className = '', style = null }) {
  const React = window.React;
  const { status, label, lastSyncedText, title } = getSyncStatusMeta(syncStatus);
  if (!syncStatus || !['offline', 'saving', 'error'].includes(status)) return null;
  const mergedClassName = ['sync-status-chip', `is-${status}`, className].filter(Boolean).join(' ');

  return /*#__PURE__*/React.createElement("span", {
    role: "status",
    className: mergedClassName,
    title: title,
    style: style || undefined
  },
    /*#__PURE__*/React.createElement("span", {
      className: "sync-status-chip__dot",
      "aria-hidden": "true"
    }),
    /*#__PURE__*/React.createElement("span", {
      className: "sync-status-chip__text"
    },
      /*#__PURE__*/React.createElement("span", {
        className: "sync-status-chip__label"
      }, label),
      lastSyncedText && /*#__PURE__*/React.createElement("span", {
        className: "sync-status-chip__time"
      }, `· ${lastSyncedText}`)
    )
  );
}

export function SyncStatusBanner({ syncStatus = null, className = '', style = null }) {
  const React = window.React;
  const { status, label, lastSyncedText, detail, title } = getSyncStatusMeta(syncStatus);
  if (!syncStatus || !['offline', 'saving', 'error'].includes(status)) return null;
  const mergedClassName = ['sync-status-banner', `is-${status}`, className].filter(Boolean).join(' ');

  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    className: mergedClassName,
    title: title,
    style: style || undefined
  },
    /*#__PURE__*/React.createElement("span", {
      className: "sync-status-banner__dot",
      "aria-hidden": "true"
    }),
    /*#__PURE__*/React.createElement("div", {
      className: "sync-status-banner__content"
    },
      /*#__PURE__*/React.createElement("div", {
        className: "sync-status-banner__headline"
      },
        /*#__PURE__*/React.createElement("span", {
          className: "sync-status-banner__label"
        }, label),
        lastSyncedText && /*#__PURE__*/React.createElement("span", {
          className: "sync-status-banner__time"
        }, `최근 ${lastSyncedText}`)
      ),
      detail && /*#__PURE__*/React.createElement("div", {
        className: "sync-status-banner__detail"
      }, detail)
    )
  );
}

export function Footer() {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return /*#__PURE__*/React.createElement('footer', { className: 'app-footer' },
    /*#__PURE__*/React.createElement('p', { className: 'app-footer-copyright' }, 'Copyright © 2026 모여라 캘린더. All Rights Reserved.'),
    /*#__PURE__*/React.createElement('div', { className: 'app-footer-family' },
      /*#__PURE__*/React.createElement('span', { className: 'app-footer-family-label' }, 'FAMILY LINK'),
      /*#__PURE__*/React.createElement('div', { className: 'app-footer-family-links' },
        getFooterFamilyLinks().map(link => /*#__PURE__*/React.createElement('a', {
          key: link.url,
          href: link.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'app-footer-link'
        }, /*#__PURE__*/React.createElement(link.Icon, { size: 14 }), link.label))
      )
    )
  );
}

export function MemoTagInputRow({
  participant,
  onOpenParticipant,
  tags = [],
  tagInput = '',
  onTagInputChange,
  onAddTag,
  maxTags = 20
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const ParticipantPickerButton = __deps.ParticipantPickerButton;

  return /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
  },
    ParticipantPickerButton && /*#__PURE__*/React.createElement(ParticipantPickerButton, {
      participant: participant,
      onClick: onOpenParticipant
    }),
    /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: tags.length >= maxTags ? `태그 최대 ${maxTags}개 도달` : `태그 입력 (${tags.length}/${maxTags})`,
      value: tagInput,
      onChange: e => onTagInputChange && onTagInputChange(e.target.value),
      onKeyDown: e => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          onAddTag && onAddTag();
        }
      },
      maxLength: 100,
      style: {
        flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
        color: 'var(--text-main)', fontSize: 'var(--font-size-sm)'
      }
    }),
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onAddTag,
      disabled: tags.length >= maxTags,
      style: {
        flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)', background: 'var(--border-subtle)',
        color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 800, cursor: 'pointer',
        opacity: tags.length >= maxTags ? 0.45 : 1
      }
    }, "태그저장")
  );
}

export function ClickToPlayVideoCard({ url, mediaInfo = null, fallbackTitle = '', cachedData = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
    const [isPlaying, setIsPlaying] = React.useState(false);

  const preview = useLinkPreview(url, cachedData);
  const previewData = (preview && preview.status === 'success' && preview.data) ? preview.data : (cachedData || {});

  const info = mediaInfo || (typeof GATHER_APP_UTILS !== 'undefined' && typeof GATHER_APP_UTILS.getDirectChatMediaInfo === 'function' ? GATHER_APP_UTILS.getDirectChatMediaInfo(url) : null);
  const isTikTok = !!(info && info.type === 'tiktok-widget');
  const isEmbed = !!(info && info.type === 'embed');
  const isDirectVideo = !!(info && info.type === 'video');
  const isPortrait = (isEmbed && info?.orientation === 'portrait') || isTikTok;

  const title = previewData?.title || fallbackTitle || (isTikTok ? 'TikTok 영상' : '영상 재생');
  const thumbnailUrl = previewData?.image || '';

  // Active playing state for YouTube / direct video
  if (isPlaying || (isDirectVideo && info.autoPlay)) {
    if (isEmbed) {
      const embedUrl = info.url + (info.url.includes('?') ? '&autoplay=1&playsinline=1' : '?autoplay=1&playsinline=1');
      return /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          maxWidth: isPortrait ? '320px' : '100%',
          margin: '0 auto',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxSizing: 'border-box'
        }
      }, /*#__PURE__*/React.createElement("iframe", {
        src: embedUrl,
        title: title,
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowFullScreen: true,
        style: {
          display: 'block',
          width: '100%',
          aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
          maxHeight: isPortrait ? 'min(72vh, 480px)' : 'min(54vh, 360px)',
          border: '0',
          borderRadius: 'var(--radius-md)'
        }
      }));
    }
    if (isDirectVideo) {
      return /*#__PURE__*/React.createElement("video", {
        src: info.url,
        controls: true,
        autoPlay: true,
        muted: !!info.autoPlay,
        loop: !!info.autoPlay,
        playsInline: true,
        style: {
          display: 'block',
          width: '100%',
          maxHeight: '360px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#000000',
          boxSizing: 'border-box'
        }
      });
    }
  }

  // Click-to-Play Façade (Lightweight, zero iframes on load, perfectly sized)
  const handlePlayClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (isTikTok) {
      // Direct open in TikTok for immediate high-res playback with audio
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setIsPlaying(true);
    }
  };
  const handlePlayKeyDown = e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    handlePlayClick(e);
  };
  const playLabel = isTikTok ? 'TikTok에서 영상 보기' : `${title} 재생`;

  return /*#__PURE__*/React.createElement("div", {
    onClick: handlePlayClick,
    onKeyDown: handlePlayKeyDown,
    role: "button",
    tabIndex: 0,
    "aria-label": playLabel,
    title: isTikTok ? 'TikTok에서 영상 보기 (새 탭에서 바로 재생)' : `${title} 재생`,
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
      aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
      maxHeight: isPortrait ? 'min(62vh, 400px)' : 'min(45vh, 260px)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      backgroundColor: '#0F172A',
      cursor: 'pointer',
      boxSizing: 'border-box',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
    /* Thumbnail Image */
    thumbnailUrl ? /*#__PURE__*/React.createElement("img", {
      src: thumbnailUrl,
      alt: title,
      loading: "lazy",
      decoding: "async",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1E293B, #0F172A)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        textAlign: 'center',
        color: 'var(--text-light)',
        fontSize: 'var(--font-size-md)',
        fontWeight: 600
      }
    }, title),

    /* Dark gradient scrim at bottom */
    /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 45%, transparent 70%)',
        pointerEvents: 'none'
      }
    }),

    /* Platform Badge at Top-Left */
    /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isTikTok ? 'rgba(0,0,0,0.78)' : 'rgba(220, 38, 38, 0.92)',
        color: '#FFFFFF',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 800,
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
        pointerEvents: 'none'
      }
    }, isTikTok ? 'TikTok' : (isPortrait ? 'Shorts' : 'YouTube')),

    /* Center Play Button */
    /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        backgroundColor: isTikTok ? '#FE2C55' : '#FF0000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "22",
      height: "22",
      fill: "#FFFFFF",
      style: { marginLeft: '3px' }
    }, /*#__PURE__*/React.createElement("path", { d: "M8 5v14l11-7z" }))),

    /* Bottom Info Bar */
    /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: '8px',
        left: '10px',
        right: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }
    },
      /* Video title preview */
      /*#__PURE__*/React.createElement("div", {
        style: {
          color: '#FFFFFF',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textShadow: '0 1px 3px rgba(0,0,0,0.9)'
        }
      }, isTikTok ? 'TikTok에서 바로 시청하기 ↗' : (title || '영상 재생'))
    )
  );
}

// Wraps a fixed-height, independently-scrolling list (e.g. a participant roster or an expense
// breakdown) that lives inside a modal body which itself scrolls -- without this, the list's own
// scrollbar and the modal's outer scrollbar fight each other ("이중 스크롤"). Renders the list
// (via `children`) at a user-adjustable height with a drag handle docked to its bottom edge, so
// the list can be expanded to avoid the double-scroll instead of always defaulting to a fixed cap.
export function ResizableListSection({
  children,
  initialHeight = 160,
  minHeight = 96,
  maxHeight = 480,
  step = 24,
  listClassName = '',
  listStyle = {},
  handleTitle = '드래그하여 목록 높이 조절',
  handleAriaLabel = '목록 높이 조절'
}) {
  const React = window.React;
  // initialHeight: 'auto' sizes the list to however tall its content actually is on first
  // mount (clamped to [minHeight, maxHeight]) instead of always opening at the same fixed
  // guess -- a 1-row list opens compact, an 8-row one opens tall enough to show everyone
  // without immediately needing the drag handle. Only measured once on mount (not on every
  // content change) so it never fights a resize the user has already made by hand.
  const isAutoInitial = initialHeight === 'auto';
  const [height, setHeight] = React.useState(isAutoInitial ? minHeight : initialHeight);
  const listRef = React.useRef(null);
  const resizeRef = React.useRef(null);
  // Once the user drags (or keyboard-resizes) the handle, their choice is final -- auto-growth
  // below stops re-measuring so it never fights a height they picked on purpose.
  const hasManuallyResizedRef = React.useRef(false);
  const clampHeight = h => Math.min(maxHeight, Math.max(minHeight, h));
  // Re-measures whenever the number of list items changes (e.g. a participant/expense/place is
  // added or removed), not just once on mount -- otherwise a new row lands below the already-
  // fixed height and is hidden behind a scrollbar instead of being visible immediately. Still
  // gated on hasManuallyResizedRef so it never overrides a resize the user already made by hand.
  const childCount = React.Children.count(children);
  React.useLayoutEffect(() => {
    if (!isAutoInitial || !listRef.current || hasManuallyResizedRef.current) return;
    const el = listRef.current;
    // scrollHeight never includes border width (only padding + content), but this element's
    // own box-sizing is border-box (global `* { box-sizing: border-box }`), so setting height
    // straight from scrollHeight leaves exactly the border's width too little room -- content
    // that fits exactly still overflows by a pixel or two and shows a needless scrollbar.
    // offsetHeight - clientHeight isolates that border width (both already reflect the same
    // border regardless of the element's current, possibly still-clamped, height) so it can be
    // added back to get a height that actually fits the measured content with no scroll.
    const borderHeight = el.offsetHeight - el.clientHeight;
    setHeight(clampHeight(el.scrollHeight + borderHeight));
  }, [childCount]);

  const handleResizeStart = event => {
    event.preventDefault();
    event.stopPropagation();
    hasManuallyResizedRef.current = true;
    resizeRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: height };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handleResizeMove = event => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    event.preventDefault();
    setHeight(clampHeight(resize.startHeight + event.clientY - resize.startY));
  };
  const handleResizeEnd = event => {
    if (resizeRef.current?.pointerId === event.pointerId) resizeRef.current = null;
  };
  const handleResizeKeyDown = event => {
    const stepSize = event.shiftKey ? step * 2 : step;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    hasManuallyResizedRef.current = true;
    const next = event.key === 'Home' ? minHeight : event.key === 'End' ? maxHeight : height + (event.key === 'ArrowDown' ? stepSize : -stepSize);
    setHeight(clampHeight(next));
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement('div', {
      ref: listRef,
      className: listClassName,
      style: { ...listStyle, height: `${height}px`, overflowY: 'auto', transition: resizeRef.current ? 'none' : 'height 120ms ease' }
    }, children),
    /*#__PURE__*/React.createElement('div', {
      className: 'resizable-list-handle-row',
      // Row height itself is left to CSS (see .resizable-list-handle-row in app.css) so it can
      // track the handle button's actual rendered height at each breakpoint -- 24px on desktop,
      // 36px under the mobile `.modal-body button { min-height: 36px }` touch-target rule.
      style: { display: 'flex', justifyContent: 'center', marginTop: '-8px', backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: '0 0 6px 6px', marginBottom: '8px' }
    },
      /*#__PURE__*/React.createElement('button', {
        type: 'button',
        className: 'resizable-list-handle',
        title: handleTitle,
        'aria-label': handleAriaLabel,
        onPointerDown: handleResizeStart,
        onPointerMove: handleResizeMove,
        onPointerUp: handleResizeEnd,
        onPointerCancel: handleResizeEnd,
        onKeyDown: handleResizeKeyDown
      },
        /*#__PURE__*/React.createElement('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
          /*#__PURE__*/React.createElement('path', { d: 'M8 9l4-4 4 4' }),
          /*#__PURE__*/React.createElement('path', { d: 'M16 15l-4 4-4-4' })
        )
      )
    )
  );
}


/**
 * Browser Back closes the top overlay first (same pattern as the gallery lightbox).
 * Pushes a same-URL history marker when the overlay mounts; popstate calls onClose.
 * Closing via UI closes right away and calls history.back() when our marker is still on top,
 * so the marker entry is consumed and PWA Back never exits the app unexpectedly.
 * Ephemeral dialogs should pass enabled:false.
 * Deep links (?memory=, notification ?tab=) keep their own URL entries unchanged.
 *
 * Stacked overlays: each marker is `{ ...history.state, [stateKey]: true, [instanceKey]: true }`, so a real Back that
 * pops the overlay ABOVE this one lands on an entry that still carries this overlay's key -- this
 * one stays open. (Before, every open overlay closed on any popstate.)
 * Every instance also registers in the overlay stack (overlay-stack.js) so one Esc / a new
 * top-level dialog from navigation can close the whole stack in one go.
 */
let overlayHistoryInstanceSeq = 0;
export function useOverlayHistory(onClose, { enabled = true, key = 'overlay' } = {}) {
  const React = window.React;
  const instanceRef = React.useRef(0);
  if (!instanceRef.current) { overlayHistoryInstanceSeq += 1; instanceRef.current = overlayHistoryInstanceSeq; }
  // Per-instance key: two stacked overlays that share `key` (e.g. two layer popups) still tell
  // their own markers apart.
  const instanceKey = `__moyeoraOverlayI_${instanceRef.current}`;
  const markerRef = React.useRef(false);
  const closingViaBackRef = React.useRef(false);
  const closedInBatchRef = React.useRef(0);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  const stateKey = `__moyeoraOverlay_${key}`;

  const runClose = React.useCallback(() => {
    const batchId = getBatchId();
    if (batchId) {
      if (closedInBatchRef.current === batchId) return;
      closedInBatchRef.current = batchId;
    }
    if (typeof onCloseRef.current === 'function') onCloseRef.current();
  }, []);

  const requestClose = React.useCallback(() => {
    if (closingViaBackRef.current) {
      runClose();
      return;
    }
    const markerOnTop = markerRef.current && window.history.state && window.history.state[instanceKey];
    if (markerOnTop && isBatchClosing()) {
      // closeAllOverlays() pops every consumed marker with a single history.go(-n).
      markerRef.current = false;
      noteMarkerConsumed();
      runClose();
      return;
    }
    if (markerOnTop) {
      markerRef.current = false;
      runClose();
      try { window.history.back(); } catch (_) { /* best-effort */ }
      return;
    }
    runClose();
  }, [instanceKey, runClose]);

  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.history) return undefined;
    try {
      window.history.pushState({ ...(window.history.state || {}), [stateKey]: true, [instanceKey]: true }, '', window.location.href);
      markerRef.current = true;
    } catch (_) {
      markerRef.current = false;
    }
    let stackEntry = null;
    const handlePopState = (event) => {
      if (!markerRef.current) return;
      // A real traversal that left our marker in place popped an overlay stacked above us.
      if (event && event.isTrusted && window.history.state && window.history.state[instanceKey]) return;
      // Back on a dialog with unsaved edits asks first, exactly like its X / Esc: restore the
      // marker we just lost and close only once the user confirms.
      const dirty = event && event.isTrusted ? findDirtyCompanion(stackEntry) : null;
      if (dirty && typeof dirty.confirm === 'function') {
        try {
          window.history.pushState({ ...(window.history.state || {}), [stateKey]: true, [instanceKey]: true }, '', window.location.href);
        } catch (_) { /* best-effort */ }
        dirty.confirm(OVERLAY_CLOSE_CONFIRM_TITLE, confirmMessageFor(dirty), () => requestClose());
        return;
      }
      markerRef.current = false;
      closingViaBackRef.current = true;
      try {
        runClose();
      } finally {
        closingViaBackRef.current = false;
      }
    };
    window.addEventListener('popstate', handlePopState);
    const unregister = registerOverlay({ key, close: () => requestClose() });
    stackEntry = unregister.entry || null;
    return () => {
      unregister();
      window.removeEventListener('popstate', handlePopState);
      // If the overlay unmounts without going through history.back (parent navigated),
      // drop the marker quietly so a later Back does not reopen a ghost close.
      if (markerRef.current && window.history.state && window.history.state[instanceKey]) {
        markerRef.current = false;
        try {
          const next = { ...(window.history.state || {}) };
          delete next[instanceKey];
          delete next[stateKey];
          window.history.replaceState(next, '', window.location.href);
        } catch (_) { /* best-effort */ }
      } else {
        markerRef.current = false;
      }
    };
  }, [enabled, stateKey, instanceKey, key, requestClose, runClose]);

  return requestClose;
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ResizableModalContainer: ResizableModalContainer,
    ResizableListSection: ResizableListSection,
    AutoGrowTextarea: AutoGrowTextarea,
    refocusComposerField: refocusComposerField,
    FormAddEditActionButtons: FormAddEditActionButtons,
    SegmentedToggle: SegmentedToggle,
    UnderlineTabs: UnderlineTabs,
    EditSelectCheckbox: EditSelectCheckbox,
    getListEditActionWrapStyle: getListEditActionWrapStyle,
    getListEditTextBtnStyle: getListEditTextBtnStyle,
    LIST_TOOLBAR_ROW_STYLE: LIST_TOOLBAR_ROW_STYLE,
    PAGE_HEADER_ICON_BTN_STYLE: PAGE_HEADER_ICON_BTN_STYLE,
    PAGE_HEADER_BACK_BTN_STYLE: PAGE_HEADER_BACK_BTN_STYLE,
    PAGE_HEADER_ACTIONS_WRAP_STYLE: PAGE_HEADER_ACTIONS_WRAP_STYLE,
    PAGE_HEADER_TITLE_STYLE: PAGE_HEADER_TITLE_STYLE,
    ItemEditDeleteActions: ItemEditDeleteActions,
    GamifiedConfirmButtonContent: GamifiedConfirmButtonContent,
    SyncStatusChip: SyncStatusChip,
    SyncStatusBanner: SyncStatusBanner,
    LinkPreviewCard: LinkPreviewCard,
    useOverlayHistory: useOverlayHistory,
    LinkPreviewProgressOverlay: LinkPreviewProgressOverlay,
    AdminLoginGate: AdminLoginGate,
    DonutChart: DonutChart,
    ColorSwatchPicker: ColorSwatchPicker,
    StickyVideoBox: StickyVideoBox,
    PollVoterSheet: PollVoterSheet,
    ParticipantSelectSheet: ParticipantSelectSheet,
    OperationProgressOverlay: OperationProgressOverlay,
    ToggleSwitch: ToggleSwitch,
    Footer: Footer,
    MemoTagInputRow: MemoTagInputRow,
    ClickToPlayVideoCard: ClickToPlayVideoCard,
    CommonPagination: CommonPagination,
  });
}
