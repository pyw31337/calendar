/* Durable client-side write queue.
 *
 * This module stores pending mutations only. It is intentionally never used as a source for
 * rendering collaborative calendar data; Firestore remains the sole read authority. IndexedDB
 * is used instead of localStorage because writes can contain structured calendar payloads and
 * must survive a mobile tab being suspended without blocking the main thread.
 */
const DB_NAME = 'gather-calendar-write-queue';
const DB_VERSION = 1;
const STORE_NAME = 'operations';
const MAX_PENDING_OPERATIONS = 100;
const MAX_OPERATION_PAYLOAD_BYTES = 8 * 1024 * 1024;
const RETRY_BACKOFF_BASE_MS = 3000;
const RETRY_BACKOFF_MAX_MS = 120000;

let dbPromise = null;
let flushPromise = null;

function canUseIndexedDb() {
  return typeof indexedDB !== 'undefined';
}

function estimateValueBytes(value, seen = new Set()) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string') return value.length * 2;
  if (typeof value !== 'object') return 8;
  if (seen.has(value)) return 0;
  seen.add(value);
  if (typeof Blob !== 'undefined' && value instanceof Blob) return Number(value.size) || 0;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (ArrayBuffer.isView(value)) return value.byteLength;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + estimateValueBytes(item, seen), 0);
  return Object.entries(value).reduce((sum, [key, item]) => sum + key.length * 2 + estimateValueBytes(item, seen), 0);
}

function openQueueDb() {
  if (!canUseIndexedDb()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('queuedAt', 'queuedAt', { unique: false });
        store.createIndex('calendarId', 'calendarId', { unique: false });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error || new Error('write queue database open failed'));
    request.onblocked = () => console.warn('[write-queue] database upgrade blocked');
  }).catch(error => {
    dbPromise = null;
    console.warn('[write-queue] IndexedDB unavailable:', error);
    return null;
  });
  return dbPromise;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('write queue request failed'));
  });
}

async function getAllOperations() {
  const db = await openQueueDb();
  if (!db) return [];
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const rows = await requestToPromise(tx.objectStore(STORE_NAME).index('queuedAt').getAll());
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.warn('[write-queue] read failed:', error);
    return [];
  }
}

export async function enqueueWriteOperation(operation) {
  if (!operation || !operation.id || !operation.type || !operation.calendarId) return false;
  const db = await openQueueDb();
  if (!db) return false;
  const record = {
    id: String(operation.id),
    type: String(operation.type),
    calendarId: String(operation.calendarId),
    payload: operation.payload || null,
    queuedAt: Number(operation.queuedAt) || Date.now(),
    attempts: Number(operation.attempts) || 0,
    lastError: String(operation.lastError || '').slice(0, 240)
  };
  const payloadBytes = estimateValueBytes(record.payload);
  if (payloadBytes > MAX_OPERATION_PAYLOAD_BYTES) {
    console.warn(`[write-queue] payload too large: ${payloadBytes} bytes`);
    return false;
  }
  try {
    const current = await getAllOperations();
    if (!current.some(item => item.id === record.id) && current.length >= MAX_PENDING_OPERATIONS) {
      console.warn('[write-queue] pending operation limit reached');
      return false;
    }
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('write queue transaction failed'));
      tx.onabort = () => reject(tx.error || new Error('write queue transaction aborted'));
    });
    return true;
  } catch (error) {
    console.warn('[write-queue] enqueue failed:', error);
    return false;
  }
}

async function removeOperation(id) {
  const db = await openQueueDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('write queue delete failed'));
      tx.onabort = () => reject(tx.error || new Error('write queue delete aborted'));
    });
  } catch (error) {
    console.warn('[write-queue] remove failed:', error);
  }
}

export async function flushWriteQueue(handler) {
  if (typeof handler !== 'function') return { processed: 0, remaining: 0 };
  if (flushPromise) return flushPromise;
  flushPromise = (async () => {
    let processed = 0;
    const operations = await getAllOperations();
    for (const operation of operations) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) break;
      if ((Number(operation.nextAttemptAt) || 0) > Date.now()) continue;
      try {
        const success = await handler(operation);
        if (success) {
          await removeOperation(operation.id);
          processed += 1;
        } else {
          break;
        }
      } catch (error) {
        const next = {
          ...operation,
          attempts: (Number(operation.attempts) || 0) + 1,
          lastError: String(error?.message || error || '').slice(0, 240),
          nextAttemptAt: Date.now() + Math.min(
            RETRY_BACKOFF_MAX_MS,
            RETRY_BACKOFF_BASE_MS * (2 ** Math.min(6, Number(operation.attempts) || 0))
          )
        };
        await enqueueWriteOperation(next);
        break;
      }
    }
    return { processed, remaining: Math.max(0, operations.length - processed) };
  })().finally(() => {
    flushPromise = null;
  });
  return flushPromise;
}

export async function getPendingWriteCount() {
  return (await getAllOperations()).length;
}
