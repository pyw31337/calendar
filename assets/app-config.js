(function () {
  window.GATHER_APP_CONFIG = Object.freeze({
    ENABLE_FIRESTORE_SYNC: true,
    ENABLE_FIRESTORE_WRITES: true,
    PUBLIC_CALENDAR_IDS: Object.freeze(['kkot', 'cw']),
    FIREBASE_LOAD_TIMEOUT_MS: 10000,
    FIREBASE_LOAD_MAX_ATTEMPTS: 3,
    MEMOS_PAGE_SIZE: 60,
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
    MAX_CHAT_IMAGE_BASE64_LENGTH: 350000,
    MAX_CHAT_THUMB_BASE64_LENGTH: 90000,
    CALENDAR_DOC_SAFE_BYTE_LIMIT: 900000,
    ADMIN_SESSION_STORAGE_KEY: 'gather_admin_session_v1',
    ADMIN_SESSION_MAX_AGE_MS: 24 * 60 * 60 * 1000,
    DEFAULT_ADMIN_PASSWORD_HASH: '32625be384ed05129315617a65f0b070e7b35a4257bdd11e0d98185c6f0cecfe'
  });
})();
