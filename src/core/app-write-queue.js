/* Durable client-side write queue.
 *
 * This module stores pending mutations only. It is intentionally never used as a source for
 * rendering collaborative calendar data; Firestore remains the sole read authority. IndexedDB
 * is used instead of localStorage because writes can contain structured calendar payloads and
 * must survive a mobile tab being suspended without blocking the main thread.
 */
const DB_NAME = 'gather-calendar-write-queue';
const DB_VERSION = 2;
const STORE_NAME = 'operations';
const LOCK_STORE_NAME = 'locks';
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
      if (!db.objectStoreNames.contains(LOCK_STORE_NAME)) db.createObjectStore(LOCK_STORE_NAME, { keyPath: 'id' });
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
  if (!operation || !operation.id || !operation.type || (!operation.calendarId && operation.type !== 'root-collection-write')) return false;
  const db = await openQueueDb();
  if (!db) return false;
  const record = {
    id: String(operation.id),
    type: String(operation.type),
    calendarId: String(operation.calendarId),
    payload: operation.payload || null,
    queuedAt: Number(operation.queuedAt) || Date.now(),
    attempts: Number(operation.attempts) || 0,
    nextAttemptAt: Number(operation.nextAttemptAt) || 0,
    lastError: String(operation.lastError || '').slice(0, 240)
  };
  const payloadBytes = estimateValueBytes(record.payload);
  if (payloadBytes > MAX_OPERATION_PAYLOAD_BYTES) {
    console.warn(`[write-queue] payload too large: ${payloadBytes} bytes`);
    return false;
  }
  try {
    const current = await getAllOperations();
    const supersededCalendarWrites = record.type === 'calendar-snapshot'
      ? current.filter(item => item.type === 'calendar-snapshot' && item.calendarId === record.calendarId && item.id !== record.id)
      : [];
    const effectiveCount = current.length - supersededCalendarWrites.length;
    if (!current.some(item => item.id === record.id) && effectiveCount >= MAX_PENDING_OPERATIONS) {
      console.warn('[write-queue] pending operation limit reached');
      return false;
    }
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // A calendar-snapshot contains the complete latest calendar state. Keeping older
    // snapshots for the same calendar would replay stale data after reconnect and can
    // undo a newer offline edit. Auxiliary/media operations remain independent.
    supersededCalendarWrites.forEach(item => store.delete(item.id));
    store.put(record);
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

async function deferOperation(operation, error = null) {
  const attempts = (Number(operation?.attempts) || 0) + 1;
  return enqueueWriteOperation({
    ...operation,
    attempts,
    lastError: String(error?.message || error || operation?.lastError || '대기 저장 실패').slice(0, 240),
    nextAttemptAt: Date.now() + Math.min(
      RETRY_BACKOFF_MAX_MS,
      RETRY_BACKOFF_BASE_MS * (2 ** Math.min(6, attempts - 1))
    )
  });
}

async function acquireFlushLease() {
  const db = await openQueueDb();
  if (!db || !db.objectStoreNames.contains(LOCK_STORE_NAME)) return null;
  const owner = `flush_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  try {
    const tx = db.transaction(LOCK_STORE_NAME, 'readwrite');
    const store = tx.objectStore(LOCK_STORE_NAME);
    const current = await requestToPromise(store.get('write-queue'));
    if (current && Number(current.expiresAt) > now) return null;
    store.put({ id: 'write-queue', owner, expiresAt: now + 30000 });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('write queue lease failed'));
      tx.onabort = () => reject(tx.error || new Error('write queue lease aborted'));
    });
    return owner;
  } catch (error) {
    console.warn('[write-queue] lease acquire failed:', error);
    return null;
  }
}

async function releaseFlushLease(owner) {
  if (!owner) return;
  const db = await openQueueDb();
  if (!db || !db.objectStoreNames.contains(LOCK_STORE_NAME)) return;
  try {
    const tx = db.transaction(LOCK_STORE_NAME, 'readwrite');
    const store = tx.objectStore(LOCK_STORE_NAME);
    const current = await requestToPromise(store.get('write-queue'));
    if (current?.owner === owner) store.delete('write-queue');
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('write queue lease release failed'));
      tx.onabort = () => reject(tx.error || new Error('write queue lease release aborted'));
    });
  } catch (error) {
    console.warn('[write-queue] lease release failed:', error);
  }
}

async function renewFlushLease(owner) {
  if (!owner) return;
  const db = await openQueueDb();
  if (!db || !db.objectStoreNames.contains(LOCK_STORE_NAME)) return;
  try {
    const tx = db.transaction(LOCK_STORE_NAME, 'readwrite');
    const store = tx.objectStore(LOCK_STORE_NAME);
    const current = await requestToPromise(store.get('write-queue'));
    if (current?.owner === owner) store.put({ ...current, expiresAt: Date.now() + 30000 });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('write queue lease renewal failed'));
      tx.onabort = () => reject(tx.error || new Error('write queue lease renewal aborted'));
    });
  } catch (error) {
    console.warn('[write-queue] lease renewal failed:', error);
  }
}

export async function flushWriteQueue(handler) {
  if (typeof handler !== 'function') return { processed: 0, remaining: 0 };
  if (flushPromise) return flushPromise;
  flushPromise = (async () => {
    const leaseOwner = await acquireFlushLease();
    if (!leaseOwner) return { processed: 0, remaining: await getPendingWriteCount() };
    let processed = 0;
    const renewalTimer = setInterval(() => { void renewFlushLease(leaseOwner); }, 10000);
    try {
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
            await deferOperation(operation, new Error('대기 저장이 완료되지 않았습니다.'));
            break;
          }
        } catch (error) {
          await deferOperation(operation, error);
          break;
        }
      }
      return { processed, remaining: Math.max(0, operations.length - processed) };
    } finally {
      clearInterval(renewalTimer);
      await releaseFlushLease(leaseOwner);
    }
  })().finally(() => {
    flushPromise = null;
  });
  return flushPromise;
}

export async function getPendingWriteCount() {
  return (await getAllOperations()).length;
}
