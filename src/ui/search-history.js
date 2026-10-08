/**
 * 통합검색 history rules (?tab=search page), aligned with the popup history-marker approach
 * (useOverlayHistory / lightbox): opening search pushes ONE entry that carries a marker key; closing
 * search (X / Esc / Back) pops exactly that entry, so you land back on the tab you came from --
 * never a new 캘린더 entry, never outside the app.
 *
 *  - open: push `?tab=search` with `{ ...state, [SEARCH_MARKER_KEY]: true }`.
 *  - close with the marker on top: `history.back()` (same as a popup's close button).
 *  - close without the marker (cold start / bookmark on ?tab=search): replace with 캘린더.
 *  - cold start on ?tab=search: seed a 캘린더 entry underneath first, so Back closes search
 *    instead of leaving the site.
 *  - a result that navigates to another tab pushes that tab WITHOUT the marker, so Back from the
 *    result returns to search (with its query restored by the shell), and Back again closes it.
 */
export const SEARCH_MARKER_KEY = '__moyeoraOverlay_search';

export function hasSearchMarker(state) {
  return !!(state && typeof state === 'object' && state[SEARCH_MARKER_KEY]);
}

export function withSearchMarker(state) {
  return { ...(state && typeof state === 'object' ? state : {}), [SEARCH_MARKER_KEY]: true };
}

export function withoutSearchMarker(state) {
  if (!hasSearchMarker(state)) return state === undefined ? null : state;
  const next = { ...state };
  delete next[SEARCH_MARKER_KEY];
  return next;
}

/** History state to write for a tab change: only the search tab itself keeps the marker. */
export function stateForTabWrite(tabId, currentState, explicitState) {
  if (explicitState !== undefined) return explicitState;
  return tabId === 'search' ? (currentState === undefined ? null : currentState) : withoutSearchMarker(currentState);
}

/** 'back' when our own pushed search entry is on top, otherwise 'replace' (deep link / cold start). */
export function planSearchClose(state) {
  return hasSearchMarker(state) ? 'back' : 'replace';
}

/** True when the app booted straight onto ?tab=search and needs a 캘린더 entry seeded underneath. */
export function needsSearchColdStartSeed(tabId, state) {
  return tabId === 'search' && !hasSearchMarker(state);
}
