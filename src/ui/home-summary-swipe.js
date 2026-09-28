/**
 * Horizontal pager gesture for the non-calendar cards on the V2 home screen.
 *
 * A separate helper keeps the calendar's month timing independent while giving
 * chat, memo, gallery and place summaries the same pointer-first contract:
 * horizontal movement pages, vertical movement remains native scrolling.
 */

export const HOME_SUMMARY_SWIPE_AXIS_START_PX = 12;
export const HOME_SUMMARY_SWIPE_MIN_PX = 48;
export const HOME_SUMMARY_SWIPE_MAX_PX = 88;
export const HOME_SUMMARY_SWIPE_DISTANCE_RATIO = 0.15;
export const HOME_SUMMARY_SWIPE_AXIS_RATIO = 1.2;
export const HOME_SUMMARY_SWIPE_DRAG_RATIO = 0.24;
export const HOME_SUMMARY_SWIPE_EXIT_MS = 140;
export const HOME_SUMMARY_SWIPE_ENTER_MS = 200;
export const HOME_SUMMARY_SWIPE_CLICK_SUPPRESS_MS = 320;

export function getHomeSummarySwipeAxis(deltaX, deltaY) {
  const absX = Math.abs(Number(deltaX) || 0);
  const absY = Math.abs(Number(deltaY) || 0);
  if (Math.max(absX, absY) < HOME_SUMMARY_SWIPE_AXIS_START_PX) return '';
  if (absX >= absY * HOME_SUMMARY_SWIPE_AXIS_RATIO) return 'horizontal';
  if (absY >= absX * HOME_SUMMARY_SWIPE_AXIS_RATIO) return 'vertical';
  return '';
}

export function getHomeSummarySwipeThreshold(width) {
  const safeWidth = Math.max(1, Number(width) || 0);
  return Math.max(
    HOME_SUMMARY_SWIPE_MIN_PX,
    Math.min(HOME_SUMMARY_SWIPE_MAX_PX, Math.round(safeWidth * HOME_SUMMARY_SWIPE_DISTANCE_RATIO))
  );
}

// -1 is a rightward (previous) swipe, +1 is a leftward (next) swipe.
export function getHomeSummarySwipeDirection(deltaX, deltaY, width) {
  if (getHomeSummarySwipeAxis(deltaX, deltaY) !== 'horizontal') return 0;
  if (Math.abs(Number(deltaX) || 0) < getHomeSummarySwipeThreshold(width)) return 0;
  return deltaX < 0 ? 1 : -1;
}

export function useHomeSummarySwipe({ pageCount = 0, pageIndex = 0, onPageChange } = {}) {
  const React = window.React;
  const onPageChangeRef = React.useRef(onPageChange);
  onPageChangeRef.current = onPageChange;
  const gestureRef = React.useRef(null);
  const transitionRef = React.useRef(null);
  const timerRef = React.useRef([]);
  const justSwipedRef = React.useRef(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [transition, setTransition] = React.useState(null);

  const clearTimers = () => {
    timerRef.current.forEach(timer => clearTimeout(timer));
    timerRef.current = [];
  };
  const queue = (callback, delay) => {
    const timer = setTimeout(() => {
      timerRef.current = timerRef.current.filter(item => item !== timer);
      callback();
    }, delay);
    timerRef.current.push(timer);
  };
  React.useEffect(() => () => clearTimers(), []);

  const markSwipeHandled = () => {
    justSwipedRef.current = true;
    queue(() => { justSwipedRef.current = false; }, HOME_SUMMARY_SWIPE_CLICK_SUPPRESS_MS);
  };
  const cancelGesture = () => {
    gestureRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };
  const changePage = delta => {
    const safeCount = Math.max(0, Number(pageCount) || 0);
    const nextIndex = Math.max(0, Math.min(safeCount - 1, Number(pageIndex) + (delta > 0 ? 1 : -1)));
    if (nextIndex === pageIndex || transitionRef.current || typeof onPageChangeRef.current !== 'function') return;
    const direction = delta > 0 ? 1 : -1;
    transitionRef.current = { direction };
    setTransition({ phase: 'exiting', direction });
    queue(() => {
      onPageChangeRef.current(nextIndex);
      setTransition({ phase: 'entering', direction });
      queue(() => {
        transitionRef.current = null;
        setTransition(null);
      }, HOME_SUMMARY_SWIPE_ENTER_MS);
    }, HOME_SUMMARY_SWIPE_EXIT_MS);
  };
  const beginGesture = (point, pointerId) => {
    if (!point || pageCount < 2 || transitionRef.current) return;
    gestureRef.current = {
      pointerId,
      startX: point.clientX,
      startY: point.clientY,
      width: point.currentTarget?.getBoundingClientRect?.().width || point.currentTarget?.clientWidth || 0,
      axis: ''
    };
  };
  const moveGesture = (point, pointerId) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== pointerId || !point) return;
    const deltaX = point.clientX - gesture.startX;
    const deltaY = point.clientY - gesture.startY;
    if (!gesture.axis) {
      gesture.axis = getHomeSummarySwipeAxis(deltaX, deltaY);
      if (!gesture.axis) return;
      if (gesture.axis === 'vertical') {
        cancelGesture();
        return;
      }
      setIsDragging(true);
    }
    if (gesture.axis !== 'horizontal') return;
    const maxDrag = Math.max(HOME_SUMMARY_SWIPE_MIN_PX, gesture.width * HOME_SUMMARY_SWIPE_DRAG_RATIO);
    setDragOffset(Math.max(-maxDrag, Math.min(maxDrag, deltaX)));
  };
  const endGesture = (point, pointerId) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== pointerId) return;
    const deltaX = point ? point.clientX - gesture.startX : 0;
    const deltaY = point ? point.clientY - gesture.startY : 0;
    const direction = gesture.axis === 'horizontal'
      ? getHomeSummarySwipeDirection(deltaX, deltaY, gesture.width)
      : 0;
    cancelGesture();
    if (direction) {
      markSwipeHandled();
      changePage(direction);
    }
  };

  const supportsPointerEvents = typeof window !== 'undefined' && typeof window.PointerEvent === 'function';
  const surfaceProps = supportsPointerEvents
    ? {
        onPointerDown: event => {
          if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
          if (event.target?.closest?.('.home-summary-pager-nav, button, a, input, textarea')) return;
          beginGesture({ clientX: event.clientX, clientY: event.clientY, currentTarget: event.currentTarget }, event.pointerId);
          try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch (_) {}
        },
        onPointerMove: event => moveGesture({ clientX: event.clientX, clientY: event.clientY }, event.pointerId),
        onPointerUp: event => {
          endGesture({ clientX: event.clientX, clientY: event.clientY }, event.pointerId);
          try { event.currentTarget.releasePointerCapture?.(event.pointerId); } catch (_) {}
        },
        onPointerCancel: cancelGesture
      }
    : {
        onTouchStart: event => {
          if (event.target?.closest?.('.home-summary-pager-nav, button, a, input, textarea')) return;
          const touch = event.touches?.[0];
          if (touch) beginGesture({ clientX: touch.clientX, clientY: touch.clientY, currentTarget: event.currentTarget }, touch.identifier);
        },
        onTouchMove: event => {
          const gesture = gestureRef.current;
          const touch = Array.from(event.touches || []).find(item => item.identifier === gesture?.pointerId);
          if (touch) moveGesture({ clientX: touch.clientX, clientY: touch.clientY }, touch.identifier);
        },
        onTouchEnd: event => {
          const gesture = gestureRef.current;
          const touch = Array.from(event.changedTouches || []).find(item => item.identifier === gesture?.pointerId);
          endGesture(touch ? { clientX: touch.clientX, clientY: touch.clientY } : null, gesture?.pointerId);
        },
        onTouchCancel: cancelGesture
      };
  const motionClassName = transition
    ? `is-${transition.phase} is-${transition.direction > 0 ? 'next' : 'previous'}`
    : '';

  return {
    surfaceProps,
    contentClassName: `home-summary-pager-content${isDragging ? ' is-dragging' : ''}${motionClassName ? ` ${motionClassName}` : ''}`,
    contentStyle: isDragging ? { transform: `translate3d(${dragOffset}px, 0, 0)` } : undefined,
    justSwipedRef,
    changePage,
    isTransitioning: Boolean(transition)
  };
}
