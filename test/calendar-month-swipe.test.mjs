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
