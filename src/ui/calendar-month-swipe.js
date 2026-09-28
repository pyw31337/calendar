/**
 * Calendar month navigation gesture.
 *
 * This is deliberately pointer-first: current iOS Safari, Chrome, Samsung Internet,
 * Whale, and Edge all support Pointer Events, while the touch fallback keeps older
 * WebKit builds usable.  The hook never calls preventDefault(), so a vertical page
 * scroll remains native; its surface's `touch-action: pan-y` advertises that contract
 * before JavaScript gets involved.
 */

export const CALENDAR_SWIPE_AXIS_START_PX = 12;
export const CALENDAR_SWIPE_MIN_PX = 52;
export const CALENDAR_SWIPE_MAX_PX = 96;
export const CALENDAR_SWIPE_DISTANCE_RATIO = 0.16;
export const CALENDAR_SWIPE_AXIS_RATIO = 1.2;
export const CALENDAR_SWIPE_DRAG_RATIO = 0.28;
export const CALENDAR_MONTH_EXIT_MS = 150;
export const CALENDAR_MONTH_ENTER_MS = 210;
export const CALENDAR_SWIPE_CLICK_SUPPRESS_MS = 340;

export function getCalendarSwipeAxis(deltaX, deltaY) {
  const absX = Math.abs(Number(deltaX) || 0);
  const absY = Math.abs(Number(deltaY) || 0);
  if (Math.max(absX, absY) < CALENDAR_SWIPE_AXIS_START_PX) return '';
  if (absX >= absY * CALENDAR_SWIPE_AXIS_RATIO) return 'horizontal';
  if (absY >= absX * CALENDAR_SWIPE_AXIS_RATIO) return 'vertical';
  return '';
}

export function getCalendarSwipeThreshold(width) {
  const safeWidth = Math.max(1, Number(width) || 0);
  return Math.max(CALENDAR_SWIPE_MIN_PX, Math.min(CALENDAR_SWIPE_MAX_PX, Math.round(safeWidth * CALENDAR_SWIPE_DISTANCE_RATIO)));
}

// -1 represents a rightward swipe (previous month); +1 represents a leftward swipe
// (next month). Keeping this as a pure helper makes the mobile threshold contract testable.
export function getCalendarSwipeDirection(deltaX, deltaY, width) {
  if (getCalendarSwipeAxis(deltaX, deltaY) !== 'horizontal') return 0;
  if (Math.abs(Number(deltaX) || 0) < getCalendarSwipeThreshold(width)) return 0;
  return deltaX < 0 ? 1 : -1;
}

export function useCalendarMonthSwipe({ onMonthDelta, isInteractionLocked = () => false } = {}) {
  const React = window.React;
  const onMonthDeltaRef = React.useRef(onMonthDelta);
  const interactionLockedRef = React.useRef(isInteractionLocked);
  onMonthDeltaRef.current = onMonthDelta;
  interactionLockedRef.current = isInteractionLocked;

  const gestureRef = React.useRef(null);
  const transitionRef = React.useRef(null);
  const timersRef = React.useRef([]);
  const justSwipedRef = React.useRef(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [transition, setTransition] = React.useState(null);

  const clearTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };
  const queueTimer = (callback, delay) => {
    const timer = setTimeout(() => {
      timersRef.current = timersRef.current.filter(item => item !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
  };

  React.useEffect(() => () => clearTimers(), []);

  const markSwipeHandled = () => {
    justSwipedRef.current = true;
    queueTimer(() => { justSwipedRef.current = false; }, CALENDAR_SWIPE_CLICK_SUPPRESS_MS);
  };

  const navigateByMonth = delta => {
    const direction = Number(delta) > 0 ? 1 : -1;
    if (transitionRef.current || typeof onMonthDeltaRef.current !== 'function') return;
    transitionRef.current = { direction };
    setTransition({ phase: 'exiting', direction });
    queueTimer(() => {
      onMonthDeltaRef.current(direction);
      setTransition({ phase: 'entering', direction });
      queueTimer(() => {
        transitionRef.current = null;
        setTransition(null);
      }, CALENDAR_MONTH_ENTER_MS);
    }, CALENDAR_MONTH_EXIT_MS);
  };

  const cancelGesture = () => {
    gestureRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const beginGesture = (point, pointerId) => {
    if (!point || transitionRef.current || interactionLockedRef.current?.()) return;
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
    if (interactionLockedRef.current?.()) {
      cancelGesture();
      return;
    }
    const deltaX = point.clientX - gesture.startX;
    const deltaY = point.clientY - gesture.startY;
    if (!gesture.axis) {
      gesture.axis = getCalendarSwipeAxis(deltaX, deltaY);
      if (!gesture.axis) return;
      if (gesture.axis === 'vertical') {
        cancelGesture();
        return;
      }
      setIsDragging(true);
    }
    if (gesture.axis !== 'horizontal') return;
    const maxDrag = Math.max(CALENDAR_SWIPE_MIN_PX, gesture.width * CALENDAR_SWIPE_DRAG_RATIO);
    setDragOffset(Math.max(-maxDrag, Math.min(maxDrag, deltaX)));
  };

  const endGesture = (point, pointerId) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== pointerId) return;
    const deltaX = point ? point.clientX - gesture.startX : 0;
    const deltaY = point ? point.clientY - gesture.startY : 0;
    const direction = gesture.axis === 'horizontal'
      ? getCalendarSwipeDirection(deltaX, deltaY, gesture.width)
      : 0;
    cancelGesture();
    if (direction) {
      markSwipeHandled();
      navigateByMonth(direction);
    }
  };

  const supportsPointerEvents = typeof window !== 'undefined' && typeof window.PointerEvent === 'function';
  const surfaceProps = supportsPointerEvents
    ? {
        onPointerDown: event => {
          if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
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
    contentClassName: `calendar-month-swipe-content${isDragging ? ' is-dragging' : ''}${motionClassName ? ` ${motionClassName}` : ''}`,
    contentStyle: isDragging ? { transform: `translate3d(${dragOffset}px, 0, 0)` } : undefined,
    justSwipedRef,
    navigateByMonth,
    isTransitioning: Boolean(transition)
  };
}
