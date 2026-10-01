/*
 * Durable, versioned cache for the server-maintained photo index.
 *
 * This intentionally contains metadata and Storage URLs only, never photo Blobs.  The service
 * worker owns the immutable Storage bytes cache; separating the two keeps this cache small and
 * lets a photo index revision invalidate list data without re-downloading an unchanged image.
 * Firestore remains the authority: callers only use an entry after comparing its server-issued
 * revision from calendars/{id}/photoIndexMeta/summary.
 */

const DB_NAME = 'moyeora-photo-index-cache';
const DB_VERSION = 1;
const STORE_NAME = 'entries';
const MAX_ENTRIES_PER_CALENDAR = 12;
const MAX_ENTRY_AGE_MS = 30 * 24 * 60 * 60 * 1000;

let dbPromise = null;

function canUseIndexedDb() {
  return typeof indexedDB !== 'undefined';
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('photo index cache request failed'));
  });
}

function waitForTransaction(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('photo index cache transaction failed'));
    transaction.onabort = () => reject(transaction.error || new Error('photo index cache transaction aborted'));
  });
}

function openCacheDb() {
  if (!canUseIndexedDb()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('calendarId', 'calendarId', { unique: false });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error || new Error('photo index cache database open failed'));
  }).catch(error => {
    dbPromise = null;
    console.warn('[photo-index-cache] IndexedDB unavailable:', error);
    return null;
  });
  return dbPromise;
}

function normalizeRevision(value) {
  const revision = String(value || '').trim();
  return revision.slice(0, 80);
}

function entryId(calendarId, revision, kind, page = '') {
  return [String(calendarId || ''), normalizeRevision(revision), String(kind || ''), String(page || '')].join(':');
}

async function readEntriesForCalendar(db, calendarId) {
  const tx = db.transaction(STORE_NAME, 'readonly');
  const entries = await requestToPromise(tx.objectStore(STORE_NAME).index('calendarId').getAll(String(calendarId || '')));
  return Array.isArray(entries) ? entries : [];
}

async function pruneCalendarEntries(db, calendarId) {
  const entries = await readEntriesForCalendar(db, calendarId);
  const now = Date.now();
  const stale = entries.filter(entry => now - Number(entry?.savedAt || 0) > MAX_ENTRY_AGE_MS);
  const newest = entries
    .filter(entry => !stale.includes(entry))
    .sort((a, b) => Number(b?.savedAt || 0) - Number(a?.savedAt || 0));
  const overflow = newest.slice(MAX_ENTRIES_PER_CALENDAR);
  const remove = [...stale, ...overflow];
  if (!remove.length) return;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  remove.forEach(entry => store.delete(entry.id));
  await waitForTransaction(tx);
}

export async function readPhotoIndexPersistentEntry({ calendarId, revision, kind, page = '' } = {}) {
  if (!calendarId || !normalizeRevision(revision) || !kind) return null;
  const db = await openCacheDb();
  if (!db) return null;
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const entry = await requestToPromise(tx.objectStore(STORE_NAME).get(entryId(calendarId, revision, kind, page)));
    if (!entry || Date.now() - Number(entry.savedAt || 0) > MAX_ENTRY_AGE_MS) return null;
    return entry.value ?? null;
  } catch (error) {
    console.warn('[photo-index-cache] read failed:', error);
    return null;
  }
}

export async function writePhotoIndexPersistentEntry({ calendarId, revision, kind, page = '', value } = {}) {
  if (!calendarId || !normalizeRevision(revision) || !kind || value == null) return false;
  const db = await openCacheDb();
  if (!db) return false;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      id: entryId(calendarId, revision, kind, page),
      calendarId: String(calendarId),
      revision: normalizeRevision(revision),
      kind: String(kind),
      page: String(page || ''),
      savedAt: Date.now(),
      value
    });
    await waitForTransaction(tx);
    await pruneCalendarEntries(db, calendarId);
    return true;
  } catch (error) {
    console.warn('[photo-index-cache] write failed:', error);
    return false;
  }
}

export async function clearPhotoIndexPersistentEntries(calendarId = '') {
  const db = await openCacheDb();
  if (!db) return false;
  try {
    if (!calendarId) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      await waitForTransaction(tx);
      return true;
    }
    const entries = await readEntriesForCalendar(db, calendarId);
    if (!entries.length) return true;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    entries.forEach(entry => store.delete(entry.id));
    await waitForTransaction(tx);
    return true;
  } catch (error) {
    console.warn('[photo-index-cache] clear failed:', error);
    return false;
  }
}

export const PHOTO_INDEX_PERSISTENT_CACHE_LIMITS = Object.freeze({
  maxEntriesPerCalendar: MAX_ENTRIES_PER_CALENDAR,
  maxEntryAgeMs: MAX_ENTRY_AGE_MS
});
