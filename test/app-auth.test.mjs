import test from 'node:test';
import assert from 'node:assert/strict';

const auth = await import('../src/core/app-auth.js');

function fakeTarget(statusFor = () => 200) {
  const calls = [];
  const target = {
    fetch: async (input, init) => {
      calls.push({ input, headers: { ...((init && init.headers) || {}) } });
      return { status: statusFor(input, init) };
    }
  };
  return { target, calls };
}

const FS = 'https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents/calendars/cal_x:runQuery';

test('Firestore REST calls get the ID token; everything else passes through untouched', async () => {
  const { target, calls } = fakeTarget();
  auth.installFirestoreAuthFetch(target, async () => 'tok');
  await target.fetch(FS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  await target.fetch('https://firebasestorage.googleapis.com/v0/b/x/o/a.jpg?alt=media&token=t');
  await target.fetch('/calendar/assets/app.js');
  assert.equal(calls[0].headers.Authorization, 'Bearer tok');
  assert.equal(calls[0].headers['Content-Type'], 'application/json');
  assert.equal(calls[1].headers.Authorization, undefined);
  assert.equal(calls[2].headers.Authorization, undefined);
});

test('no signed-in user: the request is sent exactly as before', async () => {
  const { target, calls } = fakeTarget();
  auth.installFirestoreAuthFetch(target, async () => '');
  await target.fetch(FS, { method: 'POST', body: '{}' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].headers.Authorization, undefined);
});

test('a rejected token never breaks a request that works without it (P2-A)', async () => {
  const { target, calls } = fakeTarget((input, init) => (init && init.headers && init.headers.Authorization ? 401 : 200));
  auth.installFirestoreAuthFetch(target, async () => 'expired');
  const res = await target.fetch(FS, { method: 'POST', body: '{}' });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].headers.Authorization, undefined);
});

test('the wrapper installs once and keeps caller-provided Authorization headers', async () => {
  const { target, calls } = fakeTarget();
  auth.installFirestoreAuthFetch(target, async () => 'tok');
  const first = target.fetch;
  auth.installFirestoreAuthFetch(target, async () => 'other');
  assert.equal(target.fetch, first);
  await target.fetch(FS, { headers: { Authorization: 'Bearer admin' } });
  assert.equal(calls[0].headers.Authorization, 'Bearer admin');
});

test('sign-in failure resolves to "unavailable" instead of throwing', async () => {
  auth.__resetAuthStateForTests();
  const status = await auth.startAnonymousAuth({ firebaseGlobal: () => undefined });
  assert.equal(status, 'unavailable');
  assert.equal(await auth.getIdTokenSafe(), '');
});

test('anonymous sign-in reuses the persisted user and signs in only when there is none', async () => {
  auth.__resetAuthStateForTests();
  let signIns = 0;
  const fakeAuth = {
    currentUser: null,
    onAuthStateChanged(cb) { Promise.resolve().then(cb); return () => {}; },
    async signInAnonymously() { signIns += 1; this.currentUser = { getIdToken: async () => 'anon-token' }; }
  };
  const fb = { apps: [{}], auth: () => fakeAuth };
  const status = await auth.startAnonymousAuth({ firebaseGlobal: () => fb });
  assert.equal(status, 'signed-in');
  assert.equal(signIns, 1);
  assert.equal(await auth.getIdTokenSafe(), 'anon-token');
});
