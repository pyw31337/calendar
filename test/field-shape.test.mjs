import test from 'node:test';
import assert from 'node:assert/strict';

const { countPlaceholderLines } = await import('../src/core/field-shape.js');
const tenPxPerChar = text => text.length * 10;

test('placeholder line count drives capsule (1) vs box (2+)', () => {
  assert.equal(countPlaceholderLines('', 300, tenPxPerChar), 1);
  assert.equal(countPlaceholderLines('short', 300, tenPxPerChar), 1);
  assert.equal(countPlaceholderLines('x'.repeat(30), 300, tenPxPerChar), 1, 'exactly fills one line');
  assert.equal(countPlaceholderLines('x'.repeat(31), 300, tenPxPerChar), 2, 'wraps');
  assert.equal(countPlaceholderLines('a\nb', 300, tenPxPerChar), 2, 'explicit newline');
  assert.equal(countPlaceholderLines('text', 0, tenPxPerChar), 1, 'unmeasurable width');
});
