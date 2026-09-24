/**
 * Anonymous Firebase Auth for ops scripts (docs/data-architecture-v3.md, phase P2-B).
 *
 * Once the rules require `request.auth != null`, the scripts that read or write production
 * Firestore over REST (backup export, audits, live smoke) need a signed-in user, the same as the
 * app. They sign in anonymously with the public web API key, so they get exactly an app user's
 * access and no service-account secret has to be handed to these workflows.
 *
 * Load it without touching each script:
 *   NODE_OPTIONS="--import ./scripts/lib/firestore-anon-auth.mjs" npm run ops:export
 * It wraps fetch so every https://firestore.googleapis.com/ request carries the ID token (and
 * refreshes it before it expires). While the rules still allow unauthenticated access, a token
 * the server rejects is retried once without it, so importing this never breaks a script.
 * FIRESTORE_ANON_AUTH=0 turns it off.
 */
import { installFirestoreAuthFetch } from '../../src/core/app-auth.js';

// The browser app's public web API key (src/core/app-firebase-data.js); it only identifies the
// project and is safe to embed.
const API_KEY = 'AIzaSyAEtPNOA2IxUwEt62SSEG1FKdv1g2pQVMI';
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

let session = null; // { idToken, refreshToken, expiresAt }
let pending = null;

async function postJson(url, body, baseFetch) {
  const res = await baseFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`anonymous auth failed: ${res.status} ${json?.error?.message || ''}`.trim());
  return json;
}

async function signIn(baseFetch) {
  if (session?.refreshToken) {
    const json = await postJson(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
      { grant_type: 'refresh_token', refresh_token: session.refreshToken }, baseFetch);
    session = { idToken: json.id_token, refreshToken: json.refresh_token, expiresAt: Date.now() + Number(json.expires_in) * 1000 };
  } else {
    const json = await postJson(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { returnSecureToken: true }, baseFetch);
    session = { idToken: json.idToken, refreshToken: json.refreshToken, expiresAt: Date.now() + Number(json.expiresIn) * 1000 };
  }
  return session.idToken;
}

export function createAnonTokenProvider(baseFetch) {
  return async function getToken() {
    if (session && Date.now() < session.expiresAt - REFRESH_MARGIN_MS) return session.idToken;
    if (!pending) pending = signIn(baseFetch).finally(() => { pending = null; });
    try {
      return await pending;
    } catch (err) {
      console.warn(`[firestore-anon-auth] ${err.message}; continuing without a token`);
      return '';
    }
  };
}

if (process.env.FIRESTORE_ANON_AUTH !== '0' && typeof globalThis.fetch === 'function') {
  const baseFetch = globalThis.fetch.bind(globalThis);
  installFirestoreAuthFetch(globalThis, createAnonTokenProvider(baseFetch));
}
