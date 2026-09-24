/**
 * Invisible per-device sign-in (docs/data-architecture-v3.md, phase P2-A).
 *
 * Every browser signs in anonymously with Firebase Auth, so each request the app makes can say
 * "this is the real app on a device", which is what the P2-B rules will require. Nothing about
 * the calendar changes for the person using it: no login screen, same links.
 *
 * P2-A is deliberately harmless on its own. The Firestore/Storage rules still accept
 * unauthenticated requests, so:
 *   - the auth SDK loads after boot, off the critical path;
 *   - if it fails to load, the provider is disabled, or the network is down, the app keeps
 *     working exactly as before, only without the header;
 *   - a Firestore REST call that carries the token and gets 401/403 back is retried once
 *     without it, so a bad token can never break a read that works today.
 *
 * The Firestore/Storage SDKs pick the signed-in user up by themselves once the auth component
 * is registered; the app's direct REST calls (firestore.googleapis.com) get the ID token via a
 * fetch wrapper installed here, so none of the ~50 call sites need to change.
 */

const FIRESTORE_REST_PREFIX = 'https://firestore.googleapis.com/';
// A REST call made while sign-in is still in flight waits at most this long for the token.
const TOKEN_WAIT_MS = 1500;

const state = {
  status: 'idle', // idle | loading | signed-in | unavailable
  ready: null,
  auth: null
};

function withTimeout(promise, ms) {
  let timer = null;
  return Promise.race([
    promise,
    new Promise(resolve => { timer = setTimeout(() => resolve(null), ms); })
  ]).finally(() => clearTimeout(timer));
}

export function getAuthStatus() {
  return state.status;
}

/** Current ID token, or '' when there is no signed-in user (never throws). */
export async function getIdTokenSafe() {
  try {
    if (state.status === 'loading' && state.ready) await withTimeout(state.ready, TOKEN_WAIT_MS);
    const user = state.auth && state.auth.currentUser;
    if (!user) return '';
    return (await withTimeout(user.getIdToken(), TOKEN_WAIT_MS)) || '';
  } catch (_) {
    return '';
  }
}

function isFirestoreRestRequest(input) {
  const url = typeof input === 'string' ? input : (input && typeof input.url === 'string' ? input.url : '');
  return url.startsWith(FIRESTORE_REST_PREFIX);
}

function hasAuthorizationHeader(init) {
  const headers = init && init.headers;
  if (!headers) return false;
  if (typeof headers.has === 'function') return headers.has('Authorization');
  return Object.keys(headers).some(key => key.toLowerCase() === 'authorization');
}

function withAuthorization(init, token) {
  const next = { ...(init || {}) };
  const headers = init && init.headers;
  if (headers && typeof headers.set === 'function') {
    const copy = new Headers(headers);
    copy.set('Authorization', `Bearer ${token}`);
    next.headers = copy;
  } else {
    next.headers = { ...(headers || {}), Authorization: `Bearer ${token}` };
  }
  return next;
}

/**
 * Wrap `target.fetch` so Firestore REST calls carry the signed-in user's ID token. Other
 * requests (Storage download URLs, map tiles, the app's own chunks) pass through untouched.
 */
export function installFirestoreAuthFetch(target = globalThis, getToken = getIdTokenSafe) {
  if (!target || typeof target.fetch !== 'function' || target.fetch.__gatherAuthWrapped) return;
  const baseFetch = target.fetch.bind(target);
  const wrapped = async (input, init) => {
    if (!isFirestoreRestRequest(input) || hasAuthorizationHeader(init) || typeof input !== 'string') {
      return baseFetch(input, init);
    }
    const token = await getToken();
    if (!token) return baseFetch(input, init);
    const response = await baseFetch(input, withAuthorization(init, token));
    // While the rules still allow unauthenticated access, a rejected token must not turn a
    // working request into a failure. The body of a POST init is a string here, so it can be
    // sent again as is.
    if (response && (response.status === 401 || response.status === 403) && state.status !== 'required') {
      return baseFetch(input, init);
    }
    return response;
  };
  wrapped.__gatherAuthWrapped = true;
  target.fetch = wrapped;
}

/**
 * Load the auth SDK (lazily) and sign in anonymously. Resolves to the status; never rejects.
 * `loadScript(src)` loads a same-origin vendor script (the app's existing retrying loader).
 */
export function startAnonymousAuth({ loadScript, firebaseGlobal = () => globalThis.firebase } = {}) {
  if (state.ready) return state.ready;
  state.status = 'loading';
  state.ready = (async () => {
    try {
      let fb = firebaseGlobal();
      if (!fb || !fb.apps || !fb.apps.length) throw new Error('firebase app not initialized');
      if (typeof fb.auth !== 'function') {
        if (typeof loadScript !== 'function') throw new Error('no script loader');
        await loadScript('vendor/firebase-auth-compat.js');
        fb = firebaseGlobal();
      }
      if (!fb || typeof fb.auth !== 'function') throw new Error('auth sdk unavailable');
      const auth = fb.auth();
      state.auth = auth;
      // The SDK keeps the anonymous session on this device, so the same user comes back on
      // every visit instead of a new one per page load.
      if (!auth.currentUser) {
        await new Promise(resolve => {
          const stop = auth.onAuthStateChanged(() => { stop(); resolve(); });
        });
      }
      if (!auth.currentUser) await auth.signInAnonymously();
      state.status = auth.currentUser ? 'signed-in' : 'unavailable';
    } catch (err) {
      state.status = 'unavailable';
      try { console.info('[auth] anonymous sign-in unavailable, continuing without it:', err && (err.code || err.message)); } catch (_) {}
    }
    return state.status;
  })();
  return state.ready;
}

// Test-only reset.
export function __resetAuthStateForTests() {
  state.status = 'idle';
  state.ready = null;
  state.auth = null;
}
