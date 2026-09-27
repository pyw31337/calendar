// Asset failures fall into two different classes. A missing/deleted Storage object will never
// succeed by retrying, while a network, rate-limit, or Vision failure can recover on the next
// scheduled pass. Keeping that distinction here prevents one stale photo URL from pinning an
// entire photo-index page forever.
const RETRYABLE_HTTP_STATUSES = new Set([408, 425, 429]);

export function isRetryableAssetFailure(error) {
  const message = String(error?.message || error || '');
  const statusMatch = message.match(/(?:download|request) failed:\s*(\d{3})/i);
  if (statusMatch) {
    const status = Number(statusMatch[1]);
    return status >= 500 || RETRYABLE_HTTP_STATUSES.has(status);
  }
  if (/missing firebase storage url|exceeds local analysis limit/i.test(message)) return false;
  return true;
}
