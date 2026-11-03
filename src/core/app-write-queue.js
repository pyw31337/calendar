/* Durable client-side write queue.
 *
 * This module stores pending mutations only. It is intentionally never used as a source for
 * rendering collaborative calendar data; Firestore remains the sole read authority. IndexedDB
 * is used with automatic localStorage fallback so writes survive mobile suspensions, private
 * browsing restrictions, and network drops without data loss.
 */
import { replayQueuedRootCollectionWrite, replayQueuedMemoSave, replayQueuedMediaMessage } from './app-media-outbox.js';
import {
  writeRootCollectionDocumentWithFallback,
  writeCollectionDocumentWithFallback,
  persistCalendarAuxiliaryData,
  pushSingleCloudCalendar
} from './app-firebase-data.js';
import { resolveMemoImageBatch, resolveChatImageBatch, chunkResolvedImagesForMessages } from './app-image-pipeline.js';

const DB_NAME = 'gather-calendar-write-queue';
const DB_VERSION = 2;
const STORE_NAME = 'operations';
const LOCK_STORE_NAME = 'locks';
const MAX_PENDING_OPERATIONS = 100;
const MAX_OPERATION_PAYLOAD_BYTES = 8 * 1024 * 1024;
const RETRY_BACKOFF_BASE_MS = 2000;
const RETRY_BACKOFF_MAX_MS = 60000;
const FALLBACK_STORAGE_KEY = 'gather_calendar_write_queue_fallback';

let dbPromise = null;
let flushPromise = null;
let autoFlushHandler = null;
let autoFlushTimer = null;
const queueListeners = new Set();

function canUseIndexedDb() {
  return typeof indexedDB !== 'undefined';
}

function getFallbackOperations() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

function saveFallbackOperations(list) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (!list || !list.length) {
      window.localStorage.removeItem(FALLBACK_STORAGE_KEY);
    } else {
      window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (_) {}
}

export function subscribeWriteQueue(listener) {
  if (typeof listener !== 'function') return () => {};
  queueListeners.add(listener);
  return () => { queueListeners.delete(listener); };
}

function notifyQueueChange() {
  queueListeners.forEach(listener => {
    try { listener(); } catch (_) {}
  });
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('gather:write-queue-change'));
    } catch (_) {}
  }
}

export function registerWriteQueueHandler(handler) {
  if (typeof handler === 'function') autoFlushHandler = handler;
}

export function triggerImmediateFlush(delayMs = 250) {
  if (autoFlushTimer) clearTimeout(autoFlushTimer);
  autoFlushTimer = setTimeout(() => {
    autoFlushTimer = null;
    if (typeof autoFlushHandler === 'function') {
      void flushWriteQueue(autoFlushHandler);
    }
  }, Math.max(50, delayMs));
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
    console.warn('[write-queue] IndexedDB unavailable, using localStorage fallback:', error);
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
  const fallbackList = getFallbackOperations();
  const db = await openQueueDb();
  if (!db) return fallbackList;
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const rows = await requestToPromise(tx.objectStore(STORE_NAME).index('queuedAt').getAll());
    const idbList = Array.isArray(rows) ? rows : [];
    if (fallbackList.length > 0) {
      const existingIds = new Set(idbList.map(item => item.id));
      const unmerged = fallbackList.filter(item => !existingIds.has(item.id));
      if (unmerged.length > 0) {
        try {
          const writeTx = db.transaction(STORE_NAME, 'readwrite');
          const store = writeTx.objectStore(STORE_NAME);
          unmerged.forEach(item => store.put(item));
          await new Promise((res, rej) => { writeTx.oncomplete = res; writeTx.onerror = rej; });
          saveFallbackOperations([]);
          return [...idbList, ...unmerged].sort((a, b) => (a.queuedAt || 0) - (b.queuedAt || 0));
        } catch (_) {}
      } else {
        saveFallbackOperations([]);
      }
    }
    return idbList;
  } catch (error) {
    console.warn('[write-queue] read failed, using localStorage fallback:', error);
    return fallbackList;
  }
}

export async function enqueueWriteOperation(operation) {
  if (!operation || !operation.id || !operation.type || (!operation.calendarId && operation.type !== 'root-collection-write')) return false;
  const record = {
    id: String(operation.id),
    type: String(operation.type),
    calendarId: String(operation.calendarId || ''),
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
  const db = await openQueueDb();
  if (!db) {
    try {
      const current = getFallbackOperations();
      const supersededCalendarWrites = record.type === 'calendar-snapshot'
        ? current.filter(item => item.type === 'calendar-snapshot' && item.calendarId === record.calendarId && item.id !== record.id)
        : [];
      const supersededIds = new Set(supersededCalendarWrites.map(s => s.id));
      const filtered = current.filter(item => item.id !== record.id && !supersededIds.has(item.id));
      filtered.push(record);
      saveFallbackOperations(filtered.slice(-MAX_PENDING_OPERATIONS));
      notifyQueueChange();
      triggerImmediateFlush(200);
      return true;
    } catch (fallbackErr) {
      console.warn('[write-queue] localStorage fallback enqueue failed:', fallbackErr);
      return false;
    }
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
    notifyQueueChange();
    triggerImmediateFlush(200);
    return true;
  } catch (error) {
    console.warn('[write-queue] enqueue failed, falling back to localStorage:', error);
    try {
      const current = getFallbackOperations().filter(item => item.id !== record.id);
      current.push(record);
      saveFallbackOperations(current.slice(-MAX_PENDING_OPERATIONS));
      notifyQueueChange();
      triggerImmediateFlush(200);
      return true;
    } catch (_) {
      return false;
    }
  }
}

async function removeOperation(id) {
  const fallback = getFallbackOperations();
  if (fallback.some(item => item.id === id)) {
    saveFallbackOperations(fallback.filter(item => item.id !== id));
  }
  const db = await openQueueDb();
  if (!db) {
    notifyQueueChange();
    return;
  }
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
  } finally {
    notifyQueueChange();
  }
}

async function deferOperation(operation, error = null) {
  const attempts = (Number(operation?.attempts) || 0) + 1;
  const backoff = Math.min(
    RETRY_BACKOFF_MAX_MS,
    RETRY_BACKOFF_BASE_MS * (2 ** Math.min(5, attempts - 1))
  );
  return enqueueWriteOperation({
    ...operation,
    attempts,
    lastError: String(error?.message || error || operation?.lastError || '대기 저장 실패').slice(0, 240),
    nextAttemptAt: Date.now() + backoff
  });
}

async function acquireFlushLease() {
  const db = await openQueueDb();
  if (!db || !db.objectStoreNames.contains(LOCK_STORE_NAME)) return 'fallback_lease';
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
    return 'fallback_lease';
  }
}

async function releaseFlushLease(owner) {
  if (!owner || owner === 'fallback_lease') return;
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
  if (!owner || owner === 'fallback_lease') return;
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

export function shouldQueueCalendarWriteFailure(error) {
  if (!error) return true;
  if (error?.nonRetryable) return false;
  const message = String(error?.message || error || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();
  if (/permission-denied|insufficient permissions|관리자에게 문의/i.test(message) || code === 'permission-denied') {
    return false;
  }
  return true;
}

export async function replayQueuedCalendarWrite(operation) {
  if (operation?.type === 'root-collection-write' && operation.payload) return replayQueuedRootCollectionWrite(operation, { writeDocument: (collectionName, docId, data, label, options) => writeRootCollectionDocumentWithFallback(collectionName, docId, data, label, { ...options, skipQueue: true }) });
  if (operation?.type === 'media-memo-save' && operation.payload) {
    const memoWriteMethod = operation.payload.writeMethod === 'update' ? 'update' : 'set';
    return replayQueuedMemoSave(operation, {
      resolveImages: resolveMemoImageBatch,
      writeMemo: (calendarId, memoId, data) => writeCollectionDocumentWithFallback('memos', calendarId, memoId, data, memoWriteMethod, '메모 사진 대기 저장', { skipQueue: true })
    });
  }
  if (operation?.type === 'media-chat-send' && operation.payload) {
    return replayQueuedMediaMessage(operation, {
      resolveImages: resolveChatImageBatch,
      chunkImages: chunkResolvedImagesForMessages,
      writeMessage: (calendarId, data, documentId) => writeCollectionDocumentWithFallback('messages', calendarId, '', data, 'add', '사진 대기 저장', { documentId, skipQueue: true })
    });
  }
  if (operation?.type === 'collection-write' && operation.payload) {
    const payload = operation.payload;
    const result = await writeCollectionDocumentWithFallback(
      payload.collectionName,
      operation.calendarId,
      payload.docId || '',
      payload.data,
      payload.method || 'update',
      payload.warnLabel || '대기 저장',
      { deletePaths: payload.deletePaths || [], skipQueue: true, merge: Boolean(payload.merge) }
    );
    return Boolean(result?.success);
  }
  if (operation?.type === 'calendar-auxiliary-sync' && operation.payload) {
    return persistCalendarAuxiliaryData(
      operation.calendarId,
      Array.isArray(operation.payload.places) ? operation.payload.places : [],
      Array.isArray(operation.payload.meetings) ? operation.payload.meetings : []
    );
  }
  if (operation?.type !== 'calendar-snapshot' || !operation.payload?.calendar) return false;
  const payload = operation.payload;
  const result = await pushSingleCloudCalendar(
    payload.calendar,
    payload.lastModified,
    4,
    null,
    payload.saveMode || 'availability',
    Array.isArray(payload.newActivityLogs) ? payload.newActivityLogs : [],
    payload.auxiliaryData || {}
  );
  return Boolean(result?.ok);
}
