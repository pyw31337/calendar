import test from 'node:test';
import assert from 'node:assert/strict';

const { installDeferredUnsubscribe, watchFirestoreAssertion } = await import('../src/core/firestore-listener-guard.js');

function fakeNamespace() {
  const listeners = new Set();
  class Query {
    onSnapshot(...args) {
      const entry = { args, detached: false };
      listeners.add(entry);
      return () => { entry.detached = true; listeners.delete(entry); };
    }
  }
  class CollectionReference extends Query {}
  class DocumentReference { onSnapshot(...args) { return Query.prototype.onSnapshot.apply(this, args); } }
  return { ns: { Query, CollectionReference, DocumentReference }, listeners };
}

test('unsubscribe stops delivery at once but detaches from Firestore only after the delay', () => {
  const { ns, listeners } = fakeNamespace();
  const pending = [];
  installDeferredUnsubscribe(ns, { delayMs: 2000, schedule: (fn, ms) => pending.push({ fn, ms }) });
  const seen = [];
  const unsub = new ns.CollectionReference().onSnapshot(snap => seen.push(snap), () => seen.push('err'));
  const entry = [...listeners][0];
  entry.args[0]('first');
  unsub();
  entry.args[0]('late snapshot from the previous calendar');
  entry.args[1]('late error');
  assert.deepEqual(seen, ['first']);
  assert.equal(entry.detached, false);
  assert.equal(pending.length, 1);
  assert.equal(pending[0].ms, 2000);
  pending[0].fn();
  assert.equal(entry.detached, true);
  unsub(); // idempotent
  assert.equal(pending.length, 1);
});

test('listen options pass through and observer objects are guarded', () => {
  const { ns, listeners } = fakeNamespace();
  const pending = [];
  installDeferredUnsubscribe(ns, { schedule: fn => pending.push(fn) });
  const seen = [];
  const unsub = new ns.DocumentReference().onSnapshot({ includeMetadataChanges: true }, { next: s => seen.push(s) });
  const entry = [...listeners][0];
  assert.deepEqual(entry.args[0], { includeMetadataChanges: true });
  entry.args[1].next('a');
  unsub();
  entry.args[1].next('b');
  assert.deepEqual(seen, ['a']);
});

test('installing twice does not double-wrap', () => {
  const { ns } = fakeNamespace();
  assert.ok(installDeferredUnsubscribe(ns) >= 1);
  const once = ns.Query.prototype.onSnapshot;
  assert.equal(installDeferredUnsubscribe(ns), 0);
  assert.equal(ns.Query.prototype.onSnapshot, once);
});

test('the SDK internal assertion is reported once, from console.error or thrown errors', () => {
  const logged = [];
  const handlers = {};
  const target = {
    console: { error: (...a) => logged.push(a.join(' ')) },
    addEventListener: (type, fn) => { handlers[type] = fn; }
  };
  const fired = [];
  watchFirestoreAssertion(target, message => fired.push(message));
  target.console.error('unrelated');
  target.console.error('@firebase/firestore: Firestore (10.14.1): FIRESTORE (10.14.1) INTERNAL ASSERTION FAILED: Unexpected state');
  handlers.error({ error: new Error('FIRESTORE (10.14.1) INTERNAL ASSERTION FAILED: Unexpected state') });
  assert.equal(fired.length, 1);
  assert.equal(logged.length, 2); // console output itself is preserved
});
