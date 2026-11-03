import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PENDING_MEMO_WRITE_FIELD,
  markMemoWritePending,
  clearMemoWritePending,
  mergeMemosPreservingPending,
} from '../src/core/memo-sync-state.js';

test('an older iOS snapshot cannot overwrite a pending local memo', () => {
  const local = markMemoWritePending({ id: 'm1', title: '새 제목', updatedAt: 200 }, 200);
  const merged = mergeMemosPreservingPending([{ id: 'm1', title: '이전 제목', updatedAt: 100 }], [local]);
  assert.equal(merged[0].title, '새 제목');
  assert.equal(merged[0][PENDING_MEMO_WRITE_FIELD], 200);
});

test('a newer server acknowledgement clears the private pending marker', () => {
  const local = markMemoWritePending({ id: 'm1', title: '새 제목', updatedAt: 200 }, 200);
  const merged = mergeMemosPreservingPending([{ id: 'm1', title: '새 제목', updatedAt: 201 }], [local]);
  assert.equal(merged[0].title, '새 제목');
  assert.equal(PENDING_MEMO_WRITE_FIELD in merged[0], false);
});

test('marker helpers are immutable', () => {
  const memo = { id: 'm1', title: 'x' };
  const pending = markMemoWritePending(memo, 7);
  assert.equal(memo[PENDING_MEMO_WRITE_FIELD], undefined);
  assert.equal(clearMemoWritePending(pending)[PENDING_MEMO_WRITE_FIELD], undefined);
});
