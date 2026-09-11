import { firebaseConfig } from './app-firebase-data.js';
import { sanitizeText, withTimeout, getDirectChatMediaInfo } from './app-domain-helpers.js';

const React = window.React;
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
// window.GATHER_APP_FIREBASE_DATA is never assigned anywhere in this codebase, so this was a
// permanently-null dead snapshot -- the shared linkPreviews cache silently never read/wrote to
// Firestore at all, on every client, for this file's entire life. The real, live-updated global
// is window.__gatherFirebaseDb (set by __setFirebaseDb in app-firebase-data.js and already used
// correctly by every ui-*.js file); kept in sync via the same 'gather-firebase-state-change'
// event app-firebase-data.js dispatches on every connection-state change (see app-main.js's own
// firebaseDb declaration for the matching fix).
var firebaseDb = (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('gather-firebase-state-change', () => {
    if (window.__gatherFirebaseDb) firebaseDb = window.__gatherFirebaseDb;
  });
}

// Link preview (OpenGraph via peekalink.io's API), fetched through the peekalinkProxy Cloud
// Function (functions/index.js) instead of calling api.peekalink.io directly from the browser.
// This is a static site with no backend of its own, so the Peekalink API key previously had to
// live in this client-shipped file (visible to anyone via view-source) -- it now lives ONLY in
// the Cloud Function's source, which never reaches the browser, and the proxy forwards requests
// server-side with it. Cached at module scope (by URL) so re-renders and repeated occurrences of
// the same link don't refetch, and in-flight requests are deduped across simultaneously-mounting
// message bubbles.
const PEEKALINK_PROXY_URL = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/peekalinkProxy`;
const linkPreviewCache = new Map();
const linkPreviewInflight = new Map();
const LINK_PREVIEW_CACHE_MAX_ENTRIES = 300;
// Evict oldest cache entries (Map insertion order) once past the ceiling.
function cacheLinkPreview(url, result) {
  linkPreviewCache.set(url, result);
  if (linkPreviewCache.size > LINK_PREVIEW_CACHE_MAX_ENTRIES) {
    const oldestKey = linkPreviewCache.keys().next().value;
    if (oldestKey !== undefined) linkPreviewCache.delete(oldestKey);
  }
}
// Peekalink free plan: 50 req/hour bucket.
const PEEKALINK_HOUR_BUCKET_MS = Number.isFinite(GATHER_APP_CHAT_DATA.PEEKALINK_HOUR_BUCKET_MS) ? GATHER_APP_CHAT_DATA.PEEKALINK_HOUR_BUCKET_MS : 3600000;

// FNV-1a hash as Firestore linkPreviews doc ID (URLs contain '/'; works without Web Crypto).
function hashUrlForCache(url) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < url.length; i++) {
    hash ^= BigInt(url.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).padStart(16, '0');
}

function normalizeLinkPreviewData(url, data = {}, fetchedAt = Date.now()) {
  return {
    url: sanitizeText(url || data.url || '', 2000),
    title: sanitizeText(data.title || '', 300),
    description: sanitizeText(data.description || '', 500),
    image: sanitizeText(data.image || '', 2000),
    siteName: sanitizeText(data.siteName || '', 200),
    fetchedAt: Number(data.fetchedAt || fetchedAt || Date.now())
  };
}

// Best-effort counter so the admin dashboard can show shared-cache size without ever needing
// list access on the linkPreviews collection itself (see firestore.rules).
// Uses set({merge:true}) since incrementPeekalinkApiCallStat below writes to the same doc --
// a plain overwriting set() here would wipe its hourlyUsage fields (and vice versa).
async function incrementLinkPreviewStat() {
  if (!firebaseDb) return;
  try {
    await firebaseDb.runTransaction(async (tx) => {
      const ref = firebaseDb.collection('appConfig').doc('linkPreviewStats');
      const snap = await tx.get(ref);
      const current = snap.exists ? (snap.data().cachedCount || 0) : 0;
      tx.set(ref, { cachedCount: current + 1, updatedAt: Date.now() }, { merge: true });
    });
  } catch (e) {
    // Non-critical stat -- ignore failures
  }
}

// Tracks actual outbound calls to Peekalink's API (cache hits never reach this point) against
// its 50/hour free-plan rate limit, bucketed by clock hour -- an approximation of the rolling
// window Peekalink itself enforces, close enough for the admin dashboard's usage gauge. Powers
// the "외부 서비스 연동 현황" 통계 tab card.
async function incrementPeekalinkApiCallStat() {
  if (!firebaseDb) return;
  try {
    await firebaseDb.runTransaction(async (tx) => {
      const ref = firebaseDb.collection('appConfig').doc('linkPreviewStats');
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : {};
      const currentBucket = Math.floor(Date.now() / PEEKALINK_HOUR_BUCKET_MS);
      const sameBucket = data.hourlyUsageBucket === currentBucket;
      tx.set(ref, {
        hourlyUsageBucket: currentBucket,
        hourlyUsageCount: sameBucket ? (data.hourlyUsageCount || 0) + 1 : 1
      }, { merge: true });
    });
  } catch (e) {
    // Non-critical stat -- ignore failures
  }
}

// Mirrors functions/index.js's looksLikeBlockedPreviewTitle -- some sites (Coupang among
// them) answer a scraper with a 200 OK "Access Denied"/bot-check interstitial instead of a real
// error status, which used to get cached and shown to users as if it were the link's actual
// preview. Used here to skip (and let the fetch below silently refresh) any doc that was cached
// by the proxy BEFORE that server-side fix existed, so already-broken cache entries self-heal
// instead of staying wrong forever.
function looksLikeBlockedPreviewTitle(title) {
  const t = String(title || '').trim().toLowerCase();
  if (!t) return false;
  const blockedPatterns = [
    'access denied', 'forbidden', '403 forbidden', 'attention required',
    'just a moment', 'are you a human', 'bot detection', 'unusual traffic',
    'captcha', 'request blocked', 'error 1020'
  ];
  return blockedPatterns.some(p => t === p || t.includes(p));
}

async function fetchLinkPreview(url) {
  if (linkPreviewCache.has(url)) return linkPreviewCache.get(url);
  if (linkPreviewInflight.has(url)) return linkPreviewInflight.get(url);
  const promise = (async () => {
    const urlHash = hashUrlForCache(url);
    try {
      // Check the shared, service-wide cache first -- every calendar/user reuses the same
      // Peekalink fetch for a given URL instead of each calendar re-fetching it independently.
      if (firebaseDb) {
        try {
          const sharedDoc = await firebaseDb.collection('linkPreviews').doc(urlHash).get();
          if (sharedDoc.exists && !looksLikeBlockedPreviewTitle(sharedDoc.data()?.title)) {
            const d = sharedDoc.data();
            const result = { status: 'success', data: normalizeLinkPreviewData(url, d, d.fetchedAt) };
            cacheLinkPreview(url, result);
            return result;
          }
        } catch (e) {
          // Shared cache read failed (offline, rules mismatch, etc.) -- fall through to a direct fetch.
        }
      }

      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;
      const res = await withTimeout(fetch(PEEKALINK_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ link: url }),
        signal: controller?.signal
      }), 9000, 'link preview timed out').finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
      const json = await withTimeout(res.json(), 4000, 'link preview json timed out');
      // Counts against the free-plan quota regardless of json.ok -- the request still reached
      // Peekalink's server and consumed the hourly allowance either way.
      incrementPeekalinkApiCallStat();
      if (!json.ok) throw new Error(json.message || 'peekalink request failed');
      const image = json.image?.medium?.url || json.image?.large?.url || json.image?.thumbnail?.url || json.icon?.url || '';
      const hasContent = !!(json.title || image || json.description);
      const data = normalizeLinkPreviewData(url, {
        title: json.title || (json.redirected && json.redirectionUrl ? new URL(json.redirectionUrl).hostname.replace('www.','') : '') || json.domain || '',
        description: json.description || '',
        image,
        siteName: json.siteName || json.domain || ''
      });
      const result = { status: hasContent ? 'success' : 'empty', data };
      // Only cache successful results; let empty/failed results be retried on next render
      if (hasContent) {
        cacheLinkPreview(url, result);
        if (firebaseDb) {
          firebaseDb.collection('linkPreviews').doc(urlHash).set(data).then(() => incrementLinkPreviewStat()).catch(() => {});
        }
      }
      return result;
    } catch (e) {
      const result = { status: 'error' };
      // Don't cache errors -- let them be retried when the component remounts or page reloads
      return result;
    } finally {
      linkPreviewInflight.delete(url);
    }
  })();
  linkPreviewInflight.set(url, promise);
  return promise;
}
// Render-time link previews are intentionally read-only.  A missing preview must not cause every
// visitor (or every remount on a slow mobile connection) to fan out into Firestore + the external
// Peekalink proxy.  Preview metadata is hydrated by the write paths below when a link is created
// or explicitly changed; older records stay useful through the deterministic title/host fallback
// in LinkPreviewCard.  `fetchLinkPreview` remains available to those explicit write paths.
function useLinkPreview(url, cachedData) {
  const [state, setState] = React.useState(() => {
    if (cachedData) return { status: 'success', data: cachedData };
    return (url ? linkPreviewCache.get(url) : null) || null;
  });
  React.useEffect(() => {
    if (cachedData) {
      setState({ status: 'success', data: cachedData });
      return;
    }
    if (!url) return;
    const cached = linkPreviewCache.get(url);
    if (cached) {
      setState(cached);
      return;
    }
    // No network work here.  This effect deliberately leaves the state empty so cards render
    // immediately with their persisted data (when present) or their local fallback title.
    // Calling fetchLinkPreview from this hook would multiply API/Firestore reads by every
    // rendered link and was the dominant source of avoidable billing on read-heavy screens.
  }, [url, cachedData]);
  return state;
}

const CHAT_LINK_PREVIEW_SKIP_HOSTS = new Set([
  'leisure-web.yanolja.com',
  'naver.me',
  'nid.naver.com'
]);

function getUrlHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch (_) {
    return '';
  }
}

function shouldFetchLinkPreviewForChatUrl(url) {
  if (!url) return false;
  const mediaInfo = getDirectChatMediaInfo(url);
  if (mediaInfo) return false;
  const host = getUrlHostname(url);
  if (host && CHAT_LINK_PREVIEW_SKIP_HOSTS.has(host)) return false;
  return true;
}

export {
  PEEKALINK_PROXY_URL,
  fetchLinkPreview,
  useLinkPreview,
  shouldFetchLinkPreviewForChatUrl
};
