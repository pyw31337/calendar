/** WP-01 rollout flag for the renewal app shell (product-renewal-master-plan.md's 5-tab IA:
 * 캘린더/대화/기록/정산/더보기). Deliberately NOT persisted to localStorage/sessionStorage --
 * CLAUDE.md forbids adding a new browser-storage persistence path, and a URL-only flag has zero
 * footprint once the query param is dropped or the tab closes, so it can never accidentally
 * become one. Testers opt in per-link (`?shell=v2`); nothing is remembered between visits. */
export function isRenewalShellEnabled() {
  if (typeof window === 'undefined' || !window.location) return false;
  try {
    return new URLSearchParams(window.location.search).get('shell') === 'v2';
  } catch (_) {
    return false;
  }
}
