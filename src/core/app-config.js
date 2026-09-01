export const GATHER_APP_CONFIG = Object.freeze({
  ENABLE_FIRESTORE_SYNC: true,
  ENABLE_FIRESTORE_WRITES: true,
  // firestore.rules' places/{placeId} and confirmedMeetings/{date} subcollection rules were
  // deployed on 2026-08-16 (firebase deploy --only firestore:rules) -- safe to turn the
  // migration on now that the subcollection writes it performs will actually be accepted
  // instead of failing closed with a silent-data-loss 403 (see assets/app-main.js's
  // stripEmbeddedPlacesField/stripEmbeddedConfirmedMeetingField call sites).
  ENABLE_PLACES_SUBCOLLECTION_MIGRATION: true,
  PUBLIC_CALENDAR_IDS: Object.freeze(['kkot', 'cw', 'jhair']),
  SETTLEMENT_ENABLED_CALENDAR_IDS: Object.freeze(['kkot', 'cw', 'jhair']),
  FIREBASE_LOAD_TIMEOUT_MS: 10000,
  FIREBASE_LOAD_MAX_ATTEMPTS: 3,
  MEMOS_PAGE_SIZE: 20,
  // Keep the first realtime read tiny so chat becomes interactive quickly on old/3G devices.
  // A healthy connection expands this window shortly after first paint; older history remains
  // cursor-paginated and is never downloaded as one unbounded collection read.
  CHAT_INITIAL_MESSAGE_LIMIT: 5,
  CHAT_LIVE_MESSAGE_LIMIT: 20,
  CHAT_OLDER_PAGE_SIZE: 20,
  ADMIN_MESSAGE_LIVE_LIMIT: 50,
  ADMIN_MEMO_LIVE_LIMIT: 50,
  GLOBAL_SEARCH_HISTORY_LIMIT: 100,
  MAX_FIRESTORE_DATA_URL_CHARS: 6000,
  FIRESTORE_FREE_LIMITS: Object.freeze({
    storageBytes: 1024 * 1024 * 1024,
    documentBytes: 1024 * 1024,
    readsPerDay: 50000,
    writesPerDay: 20000,
    deletesPerDay: 20000,
    outboundBytesPerMonth: 10 * 1024 * 1024 * 1024
  }),
  GITHUB_PAGES_FREE_LIMITS: Object.freeze({
    siteBytes: 1024 * 1024 * 1024,
    bandwidthBytesPerMonth: 100 * 1024 * 1024 * 1024,
    buildsPerHour: 10
  }),
  // Firestore's messages/{id} rule caps the singular thumbUrl field at 50,000 chars (see
  // firestore.rules hasValidMessageImages) -- this is the base64-fallback thumbnail budget used
  // when Storage upload fails, so it must stay safely under that cap or the fallback write gets
  // rejected exactly when it's needed most (Storage outage/network failure).
  MAX_CHAT_THUMB_BASE64_LENGTH: 8000,
  CALENDAR_DOC_SAFE_BYTE_LIMIT: 900000,
  ADMIN_SESSION_STORAGE_KEY: 'gather_admin_session_v1',
  ADMIN_SESSION_MAX_AGE_MS: 24 * 60 * 60 * 1000
});

if (typeof window !== 'undefined') {
  window.GATHER_APP_CONFIG = GATHER_APP_CONFIG;
}
