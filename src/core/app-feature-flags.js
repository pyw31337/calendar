/** WP-01 rollout flag for the renewal app shell (product-renewal-master-plan.md's 5-tab IA:
 * 캘린더/대화/기록/정산/더보기). Deliberately NOT persisted to localStorage/sessionStorage --
 * CLAUDE.md forbids adding a new browser-storage persistence path, and a URL-only flag has zero
 * footprint once the query param is dropped or the tab closes, so it can never accidentally
 * become one. V2 is now the default shell (cutover, see docs/v2-default-cutover-handoff.md
 * section 5); `?shell=v1` is the one-release escape hatch back to the legacy shell. */
export function isRenewalShellEnabled() {
  if (typeof window === 'undefined' || !window.location) return true;
  try {
    return new URLSearchParams(window.location.search).get('shell') !== 'v1';
  } catch (_) {
    return true;
  }
}
