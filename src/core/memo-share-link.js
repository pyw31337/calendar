/**
 * Public memo-share URLs have a stable shape:
 *   /calendar/share/{calendarId}/memo/{memoId}/
 *
 * Keep the parser free of Firestore/UI dependencies so memo compose, chat cards and
 * tests all apply the same origin and identifier guard before attempting a read.
 */
function runtimeLocation(locationLike) {
  if (locationLike) return locationLike;
  if (typeof window !== 'undefined') return window.location;
  return null;
}

function configuredPublicCalendarIds(publicCalendarIds) {
  if (Array.isArray(publicCalendarIds)) return publicCalendarIds;
  if (typeof window !== 'undefined') {
    const ids = window.GATHER_APP_CONFIG?.PUBLIC_CALENDAR_IDS;
    if (Array.isArray(ids)) return ids;
  }
  return [];
}

export function parseMemoShareUrl(value, options = {}) {
  const text = String(value || '').trim();
  if (!text) return null;

  let url;
  try {
    url = new URL(text);
  } catch (_) {
    return null;
  }

  const locationLike = runtimeLocation(options.locationLike);
  const allowedHosts = new Set([
    locationLike?.host,
    'pyw31337.github.io',
    ...(Array.isArray(options.allowedHosts) ? options.allowedHosts : []),
  ].filter(Boolean));
  if (!allowedHosts.has(url.host)) return null;

  let calendarId = '';
  let memoId = '';

  const parts = url.pathname.split('/').filter(Boolean);
  const shareIndex = parts.indexOf('share');
  if (shareIndex >= 0 && parts[shareIndex + 2] === 'memo' && parts[shareIndex + 3]) {
    calendarId = decodeURIComponent(parts[shareIndex + 1] || '');
    memoId = decodeURIComponent(parts[shareIndex + 3] || '');
  } else {
    const qCal = url.searchParams.get('id') || url.searchParams.get('cal');
    const qMemo = url.searchParams.get('memo');
    if (qCal && qMemo) {
      calendarId = decodeURIComponent(qCal);
      memoId = decodeURIComponent(qMemo);
    }
  }

  if (!calendarId || !memoId) return null;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(calendarId) || !/^[A-Za-z0-9_-]{1,128}$/.test(memoId)) return null;

  const publicCalendarIds = configuredPublicCalendarIds(options.publicCalendarIds);
  if (publicCalendarIds.length > 0 && !publicCalendarIds.includes(calendarId)) return null;
  return { calendarId, memoId, url: url.toString() };
}

/**
 * Finds the first safely-recognised memo share URL in text. `isOnlyUrl` lets a
 * chat bubble replace a pasted URL with a rich memo card without swallowing a
 * surrounding sentence that happens to contain the link.
 */
export function findMemoShareUrlInText(value, options = {}) {
  const text = String(value || '').trim();
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/i);
  if (!match) return null;
  const candidate = match[0].replace(/[),.;!?]+$/, '');
  const share = parseMemoShareUrl(candidate, options);
  if (!share) return null;
  const remainingText = `${text.slice(0, match.index)}${text.slice((match.index || 0) + match[0].length)}`.trim();
  return { ...share, isOnlyUrl: remainingText.length === 0, rawUrl: candidate, remainingText };
}

/**
 * Determines if a given URL or text candidate points to an internal service
 * (such as a memo share, calendar share, app page, or local/hosted app origin).
 * Used to ensure only external service URLs (YouTube, Naver, Kakao, blogs, etc.)
 * appear in the gallery's 링크 (links) tab.
 */
export function isInternalServiceUrl(value, options = {}) {
  const text = String(value || '').trim();
  if (!text) return false;

  // Relative URLs, internal paths, or fragments
  if (text.startsWith('/') || text.startsWith('#')) return true;

  // Memo share URL (e.g. /share/{cal}/memo/{memoId} or ?memo=...)
  if (parseMemoShareUrl(text, options)) return true;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch (_) {
    return false;
  }

  const hostname = (url.hostname || '').toLowerCase();
  const host = (url.host || '').toLowerCase();
  const locationLike = runtimeLocation(options.locationLike);
  const currentHostname = (locationLike?.hostname || (typeof window !== 'undefined' ? window.location?.hostname : '') || '').toLowerCase();
  const currentHost = (locationLike?.host || (typeof window !== 'undefined' ? window.location?.host : '') || '').toLowerCase();

  const internalHosts = new Set([
    'pyw31337.github.io',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    currentHostname,
    currentHost,
    ...(Array.isArray(options.allowedHosts) ? options.allowedHosts.map(h => String(h).toLowerCase()) : []),
  ].filter(Boolean));

  if (internalHosts.has(hostname) || internalHosts.has(host)) {
    return true;
  }

  // Firebase hosting domains for this project
  if (hostname.endsWith('.web.app') || hostname.endsWith('.firebaseapp.com')) {
    if (
      hostname.includes('demo-moyeora') ||
      hostname.includes('metro-live') ||
      hostname.includes('moyeora') ||
      (currentHostname && hostname === currentHostname)
    ) {
      return true;
    }
  }

  // Internal app route patterns on any host
  const pathname = url.pathname.toLowerCase();
  if (
    pathname.startsWith('/calendar/share/') ||
    pathname.startsWith('/calendar/app/') ||
    pathname.startsWith('/share/') ||
    pathname.startsWith('/app/')
  ) {
    if (url.searchParams.has('cal') || url.searchParams.has('memo') || url.searchParams.has('id')) {
      return true;
    }
  }

  // Fragments representing internal app shares
  if (url.hash && /#(?:gatherPhoto|gatherPhotos|gatherLinks|places|gallery|memo|links)=/i.test(url.hash)) {
    return true;
  }

  return false;
}

export function isExternalServiceUrl(value, options = {}) {
  const text = String(value || '').trim();
  if (!text) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (!url.hostname || !url.hostname.includes('.')) return false;
  } catch (_) {
    return false;
  }
  return !isInternalServiceUrl(text, options);
}
