import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CALENDAR_SWIPE_MIN_PX,
  getCalendarSwipeAxis,
  getCalendarSwipeDirection,
  getCalendarSwipeThreshold
} from '../src/ui/calendar-month-swipe.js';

test('calendar month swipe recognises only deliberate horizontal movement', () => {
  assert.equal(getCalendarSwipeAxis(8, 1), '');
  assert.equal(getCalendarSwipeAxis(64, 18), 'horizontal');
  assert.equal(getCalendarSwipeAxis(18, 64), 'vertical');
  assert.equal(getCalendarSwipeDirection(-90, 12, 393), 1);
  assert.equal(getCalendarSwipeDirection(90, 12, 393), -1);
  assert.equal(getCalendarSwipeDirection(-90, 100, 393), 0);
});

test('calendar month swipe threshold stays reachable on phones and bounded on wide screens', () => {
  assert.equal(getCalendarSwipeThreshold(240), CALENDAR_SWIPE_MIN_PX);
  assert.equal(getCalendarSwipeThreshold(393), 63);
  assert.ok(getCalendarSwipeThreshold(2400) < 100);
});

test('calendar month swipe preserves clicks on date cells and defers pointer capture to drag', async () => {
  const fs = await import('node:fs/promises');
  const swipeSource = await fs.readFile(new URL('../src/ui/calendar-month-swipe.js', import.meta.url), 'utf8');

  // Verify onPointerDown does NOT call setPointerCapture
  const onPointerDownMatch = swipeSource.match(/onPointerDown:\s*event\s*=>\s*\{([^}]+)\}/);
  assert.ok(onPointerDownMatch, 'onPointerDown must exist');
  assert.ok(
    !onPointerDownMatch[1].includes('setPointerCapture'),
    'onPointerDown must NOT call setPointerCapture, so date cell clicks are not swallowed'
  );

  // Verify pointer capture is only acquired in moveGesture after horizontal drag is confirmed
  assert.ok(
    swipeSource.includes('gesture.currentTarget?.setPointerCapture?.(pointerId)'),
    'pointer capture must be deferred until horizontal dragging begins'
  );
  assert.ok(
    swipeSource.includes('gesture.currentTarget?.releasePointerCapture'),
    'pointer capture must be released on gesture end or cancel'
  );
});

