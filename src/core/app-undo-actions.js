/**
 * Undo for one finished change (core/undo-toast.js shows the 되돌리기 button).
 *
 * A screen snapshots the records its save can touch just before saving. Undo then compares that
 * snapshot with the latest data and reverses exactly the one record the save added or changed,
 * through the app's own save/delete handlers (window.__gatherUndoDeps, refreshed by app-main on
 * every render, so this works after the screen closed and never acts on stale state). When the
 * comparison is ambiguous -- nothing changed, or more than one record changed meanwhile -- it
 * reverses nothing and returns false rather than guess.
 */

import { showUndoableToast } from './undo-toast.js';

const live = () => (typeof window !== 'undefined' && window.__gatherUndoDeps) || {};
const clone = value => (value == null ? value : JSON.parse(JSON.stringify(value)));
// Key order differs between an optimistic local record and the same record read back from the
// server, so compare with sorted keys.
const stable = value => JSON.stringify(value, (key, inner) => (inner && typeof inner === 'object' && !Array.isArray(inner)
  ? Object.keys(inner).sort().reduce((out, k) => { out[k] = inner[k]; return out; }, {})
  : inner));

/** Snapshot of records by key, for revertSingleChange below. */
export function snapshotRecords(records, keyOf = record => record && record.id) {
  const map = new Map();
  (Array.isArray(records) ? records : []).forEach(record => {
    const key = keyOf(record);
    if (key) map.set(key, clone(record));
  });
  return map;
}

/**
 * The one record that differs between `before` (a snapshotRecords map) and `latest`:
 * `{ kind: 'added', record }` or `{ kind: 'changed', record, previous }`, else null.
 */
export function findSingleChange(before, latest, keyOf = record => record && record.id) {
  const changes = [];
  (Array.isArray(latest) ? latest : []).forEach(record => {
    const key = keyOf(record);
    if (!key) return;
    if (!before.has(key)) changes.push({ kind: 'added', record });
    else if (stable(before.get(key)) !== stable(record)) changes.push({ kind: 'changed', record, previous: before.get(key) });
  });
  return changes.length === 1 ? changes[0] : null;
}

const isLive = record => record && !record.deletedAt;
const attendanceKey = entry => (entry && entry.participantId ? entry.participantId : '');

function latestAttendance(dateStr) {
  const cal = live().getActiveCalendar?.();
  return (cal?.availabilities || []).filter(entry => entry && entry.date === dateStr && isLive(entry));
}

/** 참석 추가/수정 for one date: remove the added entry, or put the previous note back. */
export async function revertAttendanceSave(dateStr, before) {
  const deps = live();
  const change = findSingleChange(before, latestAttendance(dateStr), attendanceKey);
  if (!change) return false;
  const participantId = change.record.participantId;
  if (change.kind === 'added') return (await deps.handleDeleteAvailability?.(dateStr, participantId)) !== false;
  return (await deps.handleSaveAvailability?.(dateStr, participantId, change.previous.note || '')) !== false;
}

function latestExpenses(dateStr) {
  const deps = live();
  const meeting = (deps.getConfirmedMeetings?.(deps.getActiveCalendar?.()) || []).find(m => m && m.date === dateStr);
  return (meeting?.expenses || []).filter(isLive);
}

/** 정산 내역 추가/수정 for one date: remove the added expense, or restore its previous fields. */
export async function revertExpenseSave(dateStr, before) {
  const deps = live();
  const change = findSingleChange(before, latestExpenses(dateStr));
  if (!change) return false;
  if (change.kind === 'added') return (await deps.handleDeleteExpense?.(dateStr, change.record.id)) !== false;
  const previous = change.previous;
  return (await deps.handleSaveExpense?.(dateStr, {
    id: previous.id,
    label: previous.label || '',
    url: previous.url || '',
    amount: Number(previous.amount) || 0,
    categoryId: previous.categoryId,
    payerId: previous.payerId || '',
    isSelfPay: !!previous.isSelfPay,
  })) !== false;
}

function latestPlaces() {
  const deps = live();
  return deps.getCalendarPlaces?.(deps.getActiveCalendar?.()) || [];
}

/** 장소 추가/수정 (also a date merged into an existing place): delete the new place, or restore it. */
export async function revertPlaceSave(before) {
  const deps = live();
  const change = findSingleChange(before, latestPlaces());
  if (!change) return false;
  if (change.kind === 'added') return (await deps.handleDeletePlace?.(change.record.id, { silent: true })) !== false;
  const previous = change.previous;
  // A plain edit (no memoOp) stores the memo exactly as given, so the per-date memo stack and
  // the visit fields come back as they were.
  return (await deps.handleSavePlace?.({
    id: previous.id,
    name: previous.name || '',
    alias: previous.alias || '',
    address: previous.address || '',
    lat: previous.lat,
    lng: previous.lng,
    categoryId: previous.categoryId,
    memo: previous.memo || '',
    visitStatus: previous.visitStatus,
    visitDate: previous.visitDate || '',
  })) !== false;
}

/** 순서 변경 on one date: put the previous order back. kind: attendance | expenses | places. */
export async function revertOrder(kind, dateStr, previousIds) {
  const deps = live();
  const handler = { attendance: deps.handleReorderAvailability, expenses: deps.handleReorderExpenses, places: deps.handleReorderPlaces }[kind];
  if (typeof handler !== 'function' || !Array.isArray(previousIds) || previousIds.length < 2) return false;
  return (await handler(dateStr, previousIds.slice())) !== false;
}

function latestSettlementCards() {
  const deps = live();
  return deps.getCalendarSettlementCards?.(deps.getActiveCalendar?.()) || [];
}

/** 정산 카드 생성/수정: tombstone the new card, or save its previous version back. */
export async function revertSettlementCardSave(before) {
  const deps = live();
  const change = findSingleChange(before, latestSettlementCards());
  if (!change) return false;
  if (change.kind === 'added') return (await deps.handleDeleteSettlementCard?.(change.record.id)) !== false;
  return (await deps.handleSaveSettlementCard?.(change.previous)) !== false;
}

/**
 * Toast for one 기념일 document change with 되돌리기: `previous` holds the fields to write back
 * (`mode` 'set' re-creates a removed document); null means the document was just created, so
 * 되돌리기 removes it; undefined shows the toast without 되돌리기.
 */
export function showAnniversaryUndo(message, anniversaryId, previous, mode = 'update') {
  const showToast = live().showToast;
  if (previous === undefined || !anniversaryId) {
    if (typeof showToast === 'function') showToast(message, 'success');
    return;
  }
  showUndoableToast(showToast, message, async () => {
    const deps = live();
    const calendarId = deps.getActiveCalendar?.()?.id;
    if (!calendarId || typeof deps.writeCollectionDocumentWithFallback !== 'function') return false;
    if (previous === null) {
      const removed = await deps.writeCollectionDocumentWithFallback('anniversaries', calendarId, anniversaryId, null, 'delete', '기념일 되돌리기');
      if (!removed?.success) return false;
      deps.handleAnniversaryDeleted?.(anniversaryId);
      return true;
    }
    const restored = await deps.writeCollectionDocumentWithFallback('anniversaries', calendarId, anniversaryId, { ...previous, updatedAt: Date.now() }, mode, '기념일 되돌리기');
    if (!restored?.success) return false;
    deps.handleAnniversarySaved?.({ ...previous, id: anniversaryId });
    return true;
  });
}

// Taken just before a save, from the same source the revert reads afterwards.
export const snapshotAttendance = dateStr => snapshotRecords(latestAttendance(dateStr), attendanceKey);
export const snapshotExpenses = dateStr => snapshotRecords(latestExpenses(dateStr));
export const snapshotPlaces = () => snapshotRecords(latestPlaces());
export const snapshotSettlementCards = () => snapshotRecords(latestSettlementCards());
