/** WP-01 rollout flag for the renewal app shell (product-renewal-master-plan.md's 5-tab IA:
 * 캘린더/대화/기록/정산/더보기). Deliberately NOT persisted to localStorage/sessionStorage --
 * CLAUDE.md forbids adding a new browser-storage persistence path.
 *
 * The normal build remains V1 until the release build explicitly sets
 * VITE_DEFAULT_SHELL=v2. During and after cutover, ?shell=v1 is an always-available, URL-only
 * rollback hatch; ?shell=v2 remains an explicit opt-in for preview links. */
export function isRenewalShellEnabled() {
  if (typeof window === 'undefined' || !window.location) return false;
  try {
    const requestedShell = new URLSearchParams(window.location.search).get('shell');
    if (requestedShell === 'v1') return false;
    if (requestedShell === 'v2') return true;
    return typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEFAULT_SHELL === 'v2';
  } catch (_) {
    return false;
  }
}
