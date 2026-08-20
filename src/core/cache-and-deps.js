/* P6-2 copy of cache + firebase deps from app-main.js
 * Live app still uses assets/app-main.js. Do not delete the originals yet.
 */
function loadLocalCache() {
  // Firestore is the only source of truth. Start empty so seed/demo data can never flash on screen.
  return [];
}

function saveLocalCache() {}

function bindGatherFirebaseDeps() {
  window.GATHER_FIREBASE_DEPS = {
    getDb: function () { return firebaseDb; },
    projectId: (typeof firebaseConfig !== 'undefined' && firebaseConfig && firebaseConfig.projectId) || '',
    slimMessageForClient: typeof slimMessageForClient === 'function' ? slimMessageForClient : function (m) { return m; },
    firestoreDocumentToJs: typeof firestoreDocumentToJs === 'function' ? firestoreDocumentToJs : function () { return {}; },
    getMessageImageEntries: function (msg) {
      return typeof getMessageImageEntries === 'function' ? getMessageImageEntries(msg) : [];
    },
    getMessageDirectMediaEntry: function (msg) {
      return typeof getMessageDirectMediaEntry === 'function' ? getMessageDirectMediaEntry(msg) : null;
    },
    CHAT_LIVE_MESSAGE_LIMIT: typeof CHAT_LIVE_MESSAGE_LIMIT !== 'undefined' ? CHAT_LIVE_MESSAGE_LIMIT : 30,
    CHAT_OLDER_PAGE_SIZE: typeof CHAT_OLDER_PAGE_SIZE !== 'undefined' ? CHAT_OLDER_PAGE_SIZE : 40
  };
}
