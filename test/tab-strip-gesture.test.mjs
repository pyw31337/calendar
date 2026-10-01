import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {
  TAB_STRIP_DRAG_THRESHOLD_PX,
  classifyTabStripGesture,
  resolveTabStripDrag,
  shouldSuppressTabClick,
} from '../src/ui/tab-strip-gesture.js';

const rects = [
  { left: 0, right: 100 },
  { left: 100, right: 200 },
  { left: 200, right: 300 },
  { left: 300, right: 400 },
];

test('a tap under the movement threshold stays a click', () => {
  assert.equal(TAB_STRIP_DRAG_THRESHOLD_PX, 10);
  assert.equal(classifyTabStripGesture(0, 0), 'tap');
  assert.equal(classifyTabStripGesture(9, 4), 'tap');
  assert.equal(shouldSuppressTabClick('tap'), false);
  const result = resolveTabStripDrag({
    currentIndex: 1,
    count: 4,
    deltaX: 9,
    deltaY: 3,
    pointerX: 140,
    rects,
  });
  assert.equal(result.kind, 'tap');
  assert.equal(result.suppressClick, false);
  assert.equal(result.index, 1);
});

test('a horizontal drag past the threshold changes tabs and suppresses the click', () => {
  assert.equal(classifyTabStripGesture(-12, 4), 'drag');
  assert.equal(shouldSuppressTabClick('drag'), true);
  const stepped = resolveTabStripDrag({
    currentIndex: 0,
    count: 4,
    deltaX: -12,
    deltaY: 2,
    pointerX: 40,
    rects,
  });
  assert.equal(stepped.suppressClick, true);
  assert.equal(stepped.index, 1);

  const landed = resolveTabStripDrag({
    currentIndex: 0,
    count: 4,
    deltaX: -180,
    deltaY: 8,
    pointerX: 340,
    rects,
  });
  assert.equal(landed.suppressClick, true);
  assert.equal(landed.index, 3);
});

test('vertical movement is not a tab drag, so the click is left alone', () => {
  assert.equal(classifyTabStripGesture(6, 24), 'scroll');
  const result = resolveTabStripDrag({
    currentIndex: 2,
    count: 4,
    deltaX: 6,
    deltaY: 24,
    pointerX: 250,
    rects,
  });
  assert.equal(result.kind, 'scroll');
  assert.equal(result.suppressClick, false);
  assert.equal(result.index, 2);
});

test('pointer capture is not taken on pointer down', async () => {
  const source = await fs.readFile(new URL('../src/ui/tab-strip-gesture.js', import.meta.url), 'utf8');
  const down = source.match(/const onPointerDown = \(event\) => \{([\s\S]*?)\n {2}\};/);
  assert.ok(down, 'onPointerDown must exist');
  assert.equal(down[1].includes('setPointerCapture'), false);
  assert.equal(down[1].includes('preventDefault'), false);
  assert.match(source, /kind !== 'drag'\) return/);
  assert.match(source, /setPointerCapture\?\.\(event\.pointerId\)/);
});
