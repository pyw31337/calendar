/**
 * Merge server memo snapshots without losing a local write that is still waiting for an
 * acknowledgement.  iOS Safari/PWA can deliver an older query snapshot after the user has
 * typed or after a write has fallen back to the durable queue.  Treating that snapshot as the
 * complete truth made a newly saved memo appear to reset until the next reload.
 */

export const PENDING_MEMO_WRITE_FIELD = '__pendingWriteAt';

export function markMemoWritePending(memo, at = Date.now()) {
  if (!memo || typeof memo !== 'object' || !memo.id) return memo;
  const stamp = Number(at) || Date.now();
  return { ...memo, [PENDING_MEMO_WRITE_FIELD]: stamp };
}

export function clearMemoWritePending(memo) {
  if (!memo || typeof memo !== 'object') return memo;
  if (!(PENDING_MEMO_WRITE_FIELD in memo)) return memo;
  const next = { ...memo };
  delete next[PENDING_MEMO_WRITE_FIELD];
  return next;
}

function stamp(value) {
  const raw = value?.updatedAt ?? value?.createdAt ?? 0;
  const millis = typeof raw?.toMillis === 'function' ? raw.toMillis() : raw;
  const n = Number(millis);
  return Number.isFinite(n) ? n : 0;
}

function sortMemos(list) {
  return list.sort((a, b) => stamp(b) - stamp(a) || String(a?.id || '').localeCompare(String(b?.id || '')));
}

/**
 * Merge a fresh server query union with the previous UI state.  A previous item carrying the
 * private pending marker survives when the server has not caught up yet.  As soon as the server
 * returns an equal/newer updatedAt, the marker is removed and the server copy becomes canonical.
 */
export function mergeMemosPreservingPending(serverMemos = [], previousMemos = []) {
  const server = new Map();
  (Array.isArray(serverMemos) ? serverMemos : []).forEach(memo => {
    if (!memo?.id) return;
    server.set(memo.id, clearMemoWritePending(memo));
  });

  const previous = Array.isArray(previousMemos) ? previousMemos : [];
  previous.forEach(memo => {
    if (!memo?.id) return;
    const pendingAt = Number(memo[PENDING_MEMO_WRITE_FIELD] || 0);
    if (!pendingAt) return;
    const remote = server.get(memo.id);
    if (!remote || stamp(remote) < pendingAt) {
      // Keep the local optimistic copy, but never let the private marker reach Firestore.
      server.set(memo.id, memo);
    }
  });
  return sortMemos(Array.from(server.values()));
}

