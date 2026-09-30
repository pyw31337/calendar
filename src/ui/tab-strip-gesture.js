/**
 * Horizontal swipe / drag between underline and segmented tabs.
 *
 * A tap stays a click. Pointer capture and click suppression start only after
 * the pointer moves farther than TAB_STRIP_DRAG_THRESHOLD_PX and more
 * horizontally than vertically. Vertical movement is left to the page.
 */

export const TAB_STRIP_DRAG_THRESHOLD_PX = 10;

export function classifyTabStripGesture(deltaX, deltaY, threshold = TAB_STRIP_DRAG_THRESHOLD_PX) {
  const absX = Math.abs(Number(deltaX) || 0);
  const absY = Math.abs(Number(deltaY) || 0);
  const limit = Math.max(1, Number(threshold) || TAB_STRIP_DRAG_THRESHOLD_PX);
  if (absX < limit && absY < limit) return 'tap';
  if (absX >= limit && absX > absY) return 'drag';
  return 'scroll';
}

/**
 * @param {{ currentIndex: number, count: number, deltaX: number, deltaY: number, pointerX?: number, rects?: {left:number,right:number}[], threshold?: number }} input
 */
export function resolveTabStripDrag({
  currentIndex,
  count,
  deltaX,
  deltaY,
  pointerX,
  rects,
  threshold = TAB_STRIP_DRAG_THRESHOLD_PX,
}) {
  const kind = classifyTabStripGesture(deltaX, deltaY, threshold);
  const safeCount = Math.max(0, Number(count) || 0);
  const indexNow = Math.max(0, Math.min(Math.max(0, safeCount - 1), Number(currentIndex) || 0));
  if (kind !== 'drag' || safeCount < 2) {
    return { kind, suppressClick: false, index: indexNow };
  }
  let index = indexNow;
  const bands = Array.isArray(rects) ? rects : [];
  if (bands.length === safeCount && Number.isFinite(Number(pointerX))) {
    const x = Number(pointerX);
    const hit = bands.findIndex(rect => x >= rect.left && x <= rect.right);
    if (hit >= 0) index = hit;
  }
  // A short swipe that never leaves the starting tab still moves one step.
  // Landing on a different tab selects that tab, including non-adjacent ones.
  if (index === indexNow) {
    const step = Number(deltaX) < 0 ? 1 : -1;
    index = Math.max(0, Math.min(safeCount - 1, indexNow + step));
  }
  return { kind: 'drag', suppressClick: true, index };
}

export function shouldSuppressTabClick(kind) {
  return kind === 'drag';
}

export function useTabStripGesture({ values, value, onChange, disabled = false } = {}) {
  const React = window.React;
  const rootRef = React.useRef(null);
  const gestureRef = React.useRef(null);
  const suppressRef = React.useRef(false);
  const valuesRef = React.useRef(values);
  const valueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);
  const disabledRef = React.useRef(disabled);
  valuesRef.current = Array.isArray(values) ? values : [];
  valueRef.current = value;
  onChangeRef.current = onChange;
  disabledRef.current = disabled;

  const readRects = () => {
    const root = rootRef.current;
    if (!root || typeof root.querySelectorAll !== 'function') return [];
    return Array.from(root.querySelectorAll('[role="tab"]')).map(el => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    });
  };

  const onPointerDown = (event) => {
    if (disabledRef.current || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      kind: 'tap',
      captured: false,
    };
  };

  const onPointerMove = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.kind !== 'tap') return;
    const kind = classifyTabStripGesture(event.clientX - gesture.startX, event.clientY - gesture.startY);
    if (kind === 'tap') return;
    gesture.kind = kind;
    if (kind !== 'drag') return;
    try {
      rootRef.current?.setPointerCapture?.(event.pointerId);
      gesture.captured = true;
    } catch (_) {}
  };

  const finish = (event, cancelled) => {
    const gesture = gestureRef.current;
    if (!gesture || !event || gesture.pointerId !== event.pointerId) return;
    if (gesture.captured) {
      try { rootRef.current?.releasePointerCapture?.(event.pointerId); } catch (_) {}
    }
    gestureRef.current = null;
    if (cancelled || gesture.kind !== 'drag') return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const list = valuesRef.current;
    const currentIndex = list.indexOf(valueRef.current);
    const result = resolveTabStripDrag({
      currentIndex: currentIndex < 0 ? 0 : currentIndex,
      count: list.length,
      deltaX,
      deltaY,
      pointerX: event.clientX,
      rects: readRects(),
    });
    if (result.suppressClick) suppressRef.current = true;
    if (result.suppressClick && result.index !== currentIndex && typeof onChangeRef.current === 'function') {
      const next = list[result.index];
      if (next !== undefined) onChangeRef.current(next);
    }
  };

  const onClickCapture = (event) => {
    if (!suppressRef.current) return;
    suppressRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    rootRef,
    gestureProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event) => finish(event, false),
      onPointerCancel: (event) => finish(event, true),
      onClickCapture,
    },
  };
}
