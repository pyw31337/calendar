import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.process.env.FIRESTORE_ANON_AUTH = '0'; // do not wrap the real global fetch in the test process
const { createAnonTokenProvider } = await import('../scripts/lib/firestore-anon-auth.mjs');

test('ops scripts sign up once, reuse the token, and refresh it before expiry', async () => {
  const calls = [];
  let now = 1_000_000;
  const realNow = Date.now;
  Date.now = () => now;
  try {
    const baseFetch = async (url) => {
      calls.push(url.split('?')[0]);
      if (url.includes('accounts:signUp')) return { ok: true, json: async () => ({ idToken: 't1', refreshToken: 'r1', expiresIn: '3600' }) };
      return { ok: true, json: async () => ({ id_token: 't2', refresh_token: 'r2', expires_in: '3600' }) };
    };
    const getToken = createAnonTokenProvider(baseFetch);
    assert.equal(await getToken(), 't1');
    assert.equal(await getToken(), 't1');
    now += 56 * 60 * 1000; // inside the 5-minute refresh margin
    assert.equal(await getToken(), 't2');
    assert.deepEqual(calls, [
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp',
      'https://securetoken.googleapis.com/v1/token'
    ]);
  } finally {
    Date.now = realNow;
  }
});
