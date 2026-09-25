import test from 'node:test';
import assert from 'node:assert/strict';

const { isStaleChunkError, installStaleChunkRecovery } = await import('../src/core/stale-chunk-recovery.js');

test('recognises the stale-chunk errors of Chromium, Safari and Firefox only', () => {
  assert.ok(isStaleChunkError(new TypeError('Failed to fetch dynamically imported module: https://x/calendar/assets/ui-memo-view-OEt1.js')));
  assert.ok(isStaleChunkError('Importing a module script failed.'));
  assert.ok(isStaleChunkError({ message: 'error loading dynamically imported module: https://x/a.js' }));
  assert.equal(isStaleChunkError(new Error('FIRESTORE (10.14.1) INTERNAL ASSERTION FAILED')), false);
  assert.equal(isStaleChunkError(undefined), false);
});

function harness({ online = true } = {}) {
  const store = new Map();
  const handlers = {};
  let clock = 1_000_000;
  let reloads = 0;
  const target = { addEventListener: (t, fn) => { handlers[t] = fn; } };
  const recover = installStaleChunkRecovery(target, {
    storage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    now: () => clock,
    reload: () => { reloads += 1; },
    isOnline: () => online
  });
  return { recover, target, handlers, advance: ms => { clock += ms; }, reloads: () => reloads };
}

test('reloads once for a stale chunk, then waits out the cooldown', () => {
  const h = harness();
  const err = new TypeError('Failed to fetch dynamically imported module: https://x/assets/ui-chat-room-Dk.js');
  assert.equal(h.recover(err), true);
  assert.equal(h.recover(err), false);
  h.handlers.unhandledrejection({ reason: err });
  assert.equal(h.reloads(), 1);
  h.advance(11 * 60 * 1000);
  let prevented = false;
  h.handlers['vite:preloadError']({ payload: err, preventDefault: () => { prevented = true; } });
  assert.equal(h.reloads(), 2);
  assert.equal(prevented, true);
});

test('ignores unrelated errors and never reloads while offline', () => {
  const h = harness({ online: false });
  h.handlers.error({ error: new TypeError('Failed to fetch dynamically imported module: x') });
  h.handlers.error({ error: new Error('something else') });
  assert.equal(h.reloads(), 0);
});
