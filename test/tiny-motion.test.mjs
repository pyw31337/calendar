import { test } from 'node:test';
import assert from 'node:assert/strict';
import { itemIdentity, isMotionItem, planListExits } from '../src/ui/v2/tiny-motion.js';

function el(attrs = {}, text = '') {
  const attributes = new Map(Object.entries(attrs));
  return {
    nodeType: 1,
    id: attrs.id || '',
    classList: { contains: name => String(attrs.className || '').split(/\s+/).includes(name) },
    getAttribute: name => attributes.has(name) ? attributes.get(name) : null,
    hasAttribute: name => attributes.has(name),
    textContent: text
  };
}

test('a reorder in the same commit is not a leave', () => {
  const row = el({ 'data-msg-row-id': 'm1' }, '안녕');
  const parent = { classList: { contains: () => false } };
  const exits = planListExits([
    { target: parent, removedNodes: [row], addedNodes: [row] }
  ]);
  assert.equal(exits.length, 0);
});

test('a removed chat row leaves, a loader line does not', () => {
  const parent = { classList: { contains: name => name === 'chat-messages-scroll' } };
  const row = el({ 'data-msg-row-id': 'm2' }, '사진');
  const loader = el({ className: 'bp-skel-row' }, '불러오는 중');
  assert.equal(isMotionItem(parent, row), true);
  assert.equal(isMotionItem(parent, loader), false);
  const exits = planListExits([{ target: parent, removedNodes: [row, loader], addedNodes: [] }]);
  assert.equal(exits.length, 1);
  assert.equal(exits[0].delayMs, 0);
  assert.equal(itemIdentity(row), 'm2');
});

test('later leaves stagger and ghosts are ignored', () => {
  const parent = { classList: { contains: () => false } };
  const a = el({ 'data-memo-id': 'a' });
  const b = el({ 'data-memo-id': 'b' });
  const ghost = el({ 'data-bp-leave': '1', 'data-memo-id': 'c' });
  const exits = planListExits([{ target: parent, removedNodes: [a, b, ghost], addedNodes: [] }]);
  assert.deepEqual(exits.map(item => item.delayMs), [0, 28]);
});
