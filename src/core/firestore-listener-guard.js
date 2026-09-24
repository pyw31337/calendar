/**
 * Guards around Firestore realtime listeners (compat SDK).
 *
 * Production client_error logs showed bursts of "FIRESTORE (10.14.1) INTERNAL ASSERTION FAILED:
 * Unexpected state" (599 in ~33h, Android Chrome and iOS Safari), together with realtime
 * listener errors whose code was `already-exists` (messages, memos, places, confirmedMeetings).
 * The app re-attaches identical queries constantly: every view switch re-runs the chat listener
 * effect, the gallery opens a second listener on the same query, and the reconnect bump
 * re-attaches everything at once. React runs the old effect's cleanup (unlisten) and the new
 * effect (listen) in the same tick, so the SDK removes a watch target and re-adds the very same
 * one before the backend has acknowledged the removal. That race is a known trigger of the
 * SDK's `already-exists` / "Unexpected state" failures, which are still open upstream
 * (firebase-js-sdk #8250, #9267), so upgrading the SDK alone does not fix it.
 *
 * installDeferredUnsubscribe(): every onSnapshot unsubscribe stops delivering callbacks at once
 * (so a listener for a previous calendar can never write into the current one) but detaches
 * from Firestore only after `delayMs`. An identical query re-attached inside that window shares
 * the still-active target instead of racing a remove/add.
 *
 * watchFirestoreAssertion(): once the SDK hits that assertion its async queue is permanently
 * failed and realtime updates stop for the rest of the page's life, so tell the app once.
 */

const INSTALLED = Symbol.for('gather.firestore.deferredUnsubscribe');
export const FIRESTORE_ASSERTION_PATTERN = /FIRESTORE \([^)]*\) INTERNAL ASSERTION FAILED/;

function guardCallbacks(args, isStopped) {
  return args.map(arg => {
    if (typeof arg === 'function') {
      return (...values) => { if (!isStopped()) arg(...values); };
    }
    if (arg && typeof arg === 'object' && ['next', 'error', 'complete'].some(key => typeof arg[key] === 'function')) {
      const observer = { ...arg };
      ['next', 'error', 'complete'].forEach(key => {
        if (typeof arg[key] === 'function') observer[key] = (...values) => { if (!isStopped()) arg[key](...values); };
      });
      return observer;
    }
    return arg; // SnapshotListenOptions such as { includeMetadataChanges: true }
  });
}

function patchOnSnapshot(proto, delayMs, schedule) {
  if (!proto || typeof proto.onSnapshot !== 'function' || proto.onSnapshot[INSTALLED]) return false;
  const original = proto.onSnapshot;
  const patched = function onSnapshotWithDeferredUnsubscribe(...args) {
    let stopped = false;
    const unsubscribe = original.apply(this, guardCallbacks(args, () => stopped));
    return function deferredUnsubscribe() {
      if (stopped) return;
      stopped = true;
      schedule(() => { try { unsubscribe(); } catch (_) {} }, delayMs);
    };
  };
  patched[INSTALLED] = true;
  proto.onSnapshot = patched;
  return true;
}

/** Patch Query/DocumentReference onSnapshot of a compat `firebase.firestore` namespace. */
export function installDeferredUnsubscribe(firestoreNamespace, { delayMs = 2000, schedule = (fn, ms) => setTimeout(fn, ms) } = {}) {
  if (!firestoreNamespace) return 0;
  let patched = 0;
  // CollectionReference inherits from Query in the compat SDK; patch both in case a build
  // defines its own onSnapshot on the subclass.
  ['Query', 'CollectionReference', 'DocumentReference'].forEach(name => {
    const ctor = firestoreNamespace[name];
    if (ctor && patchOnSnapshot(ctor.prototype, delayMs, schedule)) patched += 1;
  });
  return patched;
}

/** Call `onBroken(message)` once when the SDK reports its internal assertion failure. */
export function watchFirestoreAssertion(target, onBroken) {
  if (!target || target.__gatherFirestoreAssertionWatch) return;
  target.__gatherFirestoreAssertionWatch = true;
  let fired = false;
  const check = value => {
    if (fired) return;
    const text = value instanceof Error ? `${value.message}` : String(value || '');
    if (!FIRESTORE_ASSERTION_PATTERN.test(text)) return;
    fired = true;
    try { onBroken(text); } catch (_) {}
  };
  const consoleRef = target.console;
  if (consoleRef && typeof consoleRef.error === 'function') {
    const originalError = consoleRef.error.bind(consoleRef);
    consoleRef.error = (...args) => { args.forEach(check); originalError(...args); };
  }
  if (typeof target.addEventListener === 'function') {
    target.addEventListener('error', event => check(event?.error || event?.message));
    target.addEventListener('unhandledrejection', event => check(event?.reason));
  }
}
