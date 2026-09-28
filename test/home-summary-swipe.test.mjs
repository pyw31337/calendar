import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOME_SUMMARY_SWIPE_MIN_PX,
  getHomeSummarySwipeAxis,
  getHomeSummarySwipeDirection,
  getHomeSummarySwipeThreshold
} from '../src/ui/home-summary-swipe.js';

test('home summary pager accepts deliberate horizontal swipes only', () => {
  assert.equal(getHomeSummarySwipeAxis(6, 4), '');
  assert.equal(getHomeSummarySwipeAxis(72, 20), 'horizontal');
  assert.equal(getHomeSummarySwipeAxis(20, 72), 'vertical');
  assert.equal(getHomeSummarySwipeDirection(-88, 10, 390), 1);
  assert.equal(getHomeSummarySwipeDirection(88, 10, 390), -1);
  assert.equal(getHomeSummarySwipeDirection(-88, 98, 390), 0);
});

test('home summary swipe threshold remains reachable on narrow displays', () => {
  assert.equal(getHomeSummarySwipeThreshold(220), HOME_SUMMARY_SWIPE_MIN_PX);
  assert.equal(getHomeSummarySwipeThreshold(390), 59);
  assert.ok(getHomeSummarySwipeThreshold(2400) < 100);
});
