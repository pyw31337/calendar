import test from 'node:test';
import assert from 'node:assert/strict';

// Set up browser-like globals for node test runner
const storageMap = new Map();
globalThis.window = globalThis.window || {
  GATHER_APP_CONSTANTS: {},
  GATHER_APP_UTILS: {},
  localStorage: {
    getItem: key => storageMap.get(key) || null,
    setItem: (key, val) => storageMap.set(key, String(val)),
    removeItem: key => storageMap.delete(key),
    clear: () => storageMap.clear()
  },
  dispatchEvent: () => true
};
globalThis.localStorage = globalThis.window.localStorage;

const {
  enqueueWriteOperation,
  flushWriteQueue,
  getPendingWriteCount,
  shouldQueueCalendarWriteFailure,
  subscribeWriteQueue
} = await import('../src/core/app-write-queue.js');

test('shouldQueueCalendarWriteFailure: queues transient network, iOS load failed, and server errors', () => {
  assert.equal(shouldQueueCalendarWriteFailure(new TypeError('Load failed')), true, 'iOS Safari Load failed should be queued');
  assert.equal(shouldQueueCalendarWriteFailure(new TypeError('Failed to fetch')), true, 'Fetch failure should be queued');
  assert.equal(shouldQueueCalendarWriteFailure(new Error('Network request failed')), true, 'Network error should be queued');
  assert.equal(shouldQueueCalendarWriteFailure(new Error('FirebaseError: [code=unavailable]')), true, 'Unavailable code should be queued');
  assert.equal(shouldQueueCalendarWriteFailure(new Error('REST patch failed (503)')), true, 'HTTP 503 should be queued');
  assert.equal(shouldQueueCalendarWriteFailure(new Error('REST add failed (429)')), true, 'HTTP 429 should be queued');
  assert.equal(shouldQueueCalendarWriteFailure(null), true, 'Null error should be safely queued');

  // Permanent permission errors should not be queued
  assert.equal(shouldQueueCalendarWriteFailure({ code: 'permission-denied', message: 'Missing or insufficient permissions' }), false);
  assert.equal(shouldQueueCalendarWriteFailure({ nonRetryable: true }), false);
});

test('app-write-queue: enqueues and flushes operations safely', async () => {
  const testOp = {
    id: `test_memo_${Date.now()}`,
    type: 'collection-write',
    calendarId: 'test_cal',
    payload: {
      collectionName: 'memos',
      docId: 'memo_123',
      data: { title: '테스트 메모', text: '오프라인 동기화 테스트' },
      method: 'set'
    }
  };

  let notifyCalled = false;
  const unsubscribe = subscribeWriteQueue(() => {
    notifyCalled = true;
  });

  const queued = await enqueueWriteOperation(testOp);
  assert.equal(queued, true, 'Operation should be enqueued');
  assert.equal(notifyCalled, true, 'Subscriber should be notified on enqueue');

  const count = await getPendingWriteCount();
  assert.ok(count >= 1, 'Pending write count should be at least 1');

  // Mock handler that processes the operation
  let handledId = null;
  const handler = async (op) => {
    handledId = op.id;
    return true;
  };

  const flushResult = await flushWriteQueue(handler);
  assert.ok(flushResult.processed >= 1, 'At least 1 operation should be processed');
  assert.equal(handledId, testOp.id, 'Handler should receive the queued operation');

  unsubscribe();
});
