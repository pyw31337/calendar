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

import { showUndoableToast, UNDO_TOAST_MS } from './undo-toast.js';

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
  const changes = listChanges(before, latest, keyOf);
  return changes.length === 1 ? changes[0] : null;
}

function listChanges(before, latest, keyOf = record => record && record.id) {
  const changes = [];
  (Array.isArray(latest) ? latest : []).forEach(record => {
    const key = keyOf(record);
    if (!key) return;
    if (!before.has(key)) changes.push({ kind: 'added', record });
    else if (stable(before.get(key)) !== stable(record)) changes.push({ kind: 'changed', record, previous: before.get(key) });
  });
  return changes;
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
  return (await deps.handleSavePlace?.(placeFields(change.previous))) !== false;
}

// A plain edit (no memoOp) stores the memo exactly as given, so the per-date memo stack and the
// visit fields come back as they were.
const placeFields = previous => ({
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
});

/**
 * 장소 붙여넣기 (several places in one go): delete the places it added and restore the ones it
 * merged into. Refuses when more places changed than were pasted (someone else saved too).
 */
export async function revertPlaceChanges(before, expectedMax) {
  const changes = listChanges(before, latestPlaces());
  if (!changes.length || changes.length > expectedMax) return false;
  const added = changes.filter(change => change.kind === 'added').map(change => change.record.id);
  if (added.length && (await live().handleDeletePlace?.(added, { silent: true })) === false) return false;
  for (const change of changes.filter(item => item.kind === 'changed')) {
    // live() again: the delete above re-rendered the app with a new handler.
    if ((await live().handleSavePlace?.(placeFields(change.previous))) === false) return false;
  }
  return true;
}

/**
 * 장소 삭제 되돌리기 (one place or a bulk delete): each place document is written back and the
 * places return to the latest place list of that calendar.
 */
export async function restoreDeletedPlaces(calendarId, snapshots) {
  const deps = live();
  const list = (Array.isArray(snapshots) ? snapshots : []).filter(place => place && place.id);
  if (!calendarId || !list.length || typeof deps.updateCalendars !== 'function') return false;
  const now = Date.now();
  for (const { id, ...body } of list) {
    await deps.writeCollectionDocumentWithFallback?.('places', calendarId, id, { ...body, updatedAt: now }, 'set', '장소 복원');
  }
  const calendars = deps.getCalendars?.() || [];
  const active = deps.getActiveCalendar?.();
  // The active calendar carries the merged place list (calendar document + places collection).
  const latest = active && active.id === calendarId ? active : calendars.find(cal => cal && cal.id === calendarId);
  if (!latest) return false;
  const back = new Map(list.map(place => [place.id, { ...place, updatedAt: now }]));
  const current = deps.getCalendarPlaces?.(latest) || [];
  const places = current.map(place => back.get(place.id) || place)
    .concat([...back.values()].filter(place => !current.some(item => item.id === place.id)));
  if (active && active.id === calendarId) deps.setPlacesSubcollection?.(places);
  const restored = { ...latest, places, updatedAt: now, revision: (latest.revision || 0) + 1 };
  const next = calendars.map(cal => (cal && cal.id === calendarId ? restored : cal));
  return (await deps.updateCalendars(next, null, null, calendarId, 'settings', [], { places, settingsFields: ['places'] })) !== false;
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

/**
 * 일정 이동 (one participant's entry dragged to another date): put it back on its source date
 * and restore what the target date held before (its earlier note, or nothing). The second step
 * reads the handlers again, after the first save re-rendered the app.
 */
export function showAttendanceMoveUndo(message, sourceDate, targetDate, participantId, note, targetBefore) {
  showUndoableToast(live().showToast, message, async () => {
    if ((await live().handleSaveAvailability?.(sourceDate, participantId, note || '')) === false) return false;
    const second = targetBefore
      ? live().handleSaveAvailability?.(targetDate, participantId, targetBefore.note || '')
      : live().handleDeleteAvailability?.(targetDate, participantId);
    return (await second) !== false ? '일정 이동을 되돌렸습니다.' : false;
  });
}

/** 모임 확정 / 확정 취소: 되돌리기 flips it back through the latest handler. */
export function showMeetingConfirmUndo(message, dateStr, note, extraActions = []) {
  showUndoableToast(live().showToast, message, async () => (await live().handleConfirmMeeting?.(dateStr, note)) !== false, {
    duration: extraActions.length ? 8000 : UNDO_TOAST_MS,
    extraActions,
  });
}

// A 'settings' save: the server (mergeCalendarSettingsDelta) replaces these fields whole, so the
// previous value written back is the exact reverse.
const WHOLE_SETTINGS_FIELDS = new Set(['title', 'description', 'accentColor', 'settlementBaseBudget', 'weatherLocation', 'recentLocations', 'pinnedNotices', 'pinnedNotice', 'customPersonTags']);
// ...and merges this one by id and stamp, so only the cards this save touched go back.
const BY_ID_SETTINGS_FIELDS = new Set(['settlementCards']);
const emptyLike = value => (Array.isArray(value) ? [] : typeof value === 'string' ? '' : null);
const byId = list => new Map((Array.isArray(list) ? list : []).filter(item => item && item.id).map(item => [item.id, item]));

/**
 * 되돌리기 for one 'settings' save of `fields` (null when a field is not safely reversible:
 * participants, places, categories and confirmed meetings have their own merges and undos).
 * `before` and `saved` are the calendar just before and as written by that save. It refuses when
 * a field changed again since, so nobody else's newer change is overwritten.
 */
export function settingsSaveUndo(calendarId, fields, before, saved) {
  const list = Array.isArray(fields) ? fields.filter(Boolean) : [];
  if (!calendarId || !before || !saved || !list.length) return null;
  if (list.length === 1 && list[0] === 'places') {
    // 장소 등록/수정: exactly one place differs, reversed like the date screen's place save.
    const placesOf = cal => live().getCalendarPlaces?.(cal) || [];
    const placesBefore = snapshotRecords(placesOf(before));
    return findSingleChange(placesBefore, placesOf(saved)) ? () => revertPlaceSave(placesBefore) : null;
  }
  if (!list.every(field => WHOLE_SETTINGS_FIELDS.has(field) || BY_ID_SETTINGS_FIELDS.has(field))) return null;
  const savedClone = clone(saved);
  const beforeClone = clone(before);
  return async () => {
    const deps = live();
    const calendars = deps.getCalendars?.() || [];
    const latest = calendars.find(cal => cal && cal.id === calendarId);
    if (!latest || typeof deps.updateCalendars !== 'function') return false;
    const now = Date.now();
    const restored = { ...latest, updatedAt: now, revision: (latest.revision || 0) + 1 };
    for (const field of list) {
      if (WHOLE_SETTINGS_FIELDS.has(field)) {
        if (stable(latest[field] ?? null) !== stable(savedClone[field] ?? null)) return false;
        restored[field] = beforeClone[field] === undefined ? emptyLike(savedClone[field]) : beforeClone[field];
        continue;
      }
      const previous = byId(beforeClone[field]);
      const written = byId(savedClone[field]);
      const current = byId(latest[field]);
      const touched = [...written.keys()].filter(id => stable(written.get(id)) !== stable(previous.get(id)));
      if (!touched.length || touched.some(id => stable(current.get(id)) !== stable(written.get(id)))) return false;
      restored[field] = (latest[field] || []).map(item => {
        if (!item || !touched.includes(item.id)) return item;
        return previous.has(item.id) ? { ...previous.get(item.id), updatedAt: now } : { ...item, deletedAt: now, updatedAt: now };
      });
    }
    const next = calendars.map(cal => (cal && cal.id === calendarId ? restored : cal));
    return (await deps.updateCalendars(next, null, null, calendarId, 'settings', [], { settingsFields: list })) !== false;
  };
}

/** updateCalendars' own success toast, with 되돌리기 when it was a reversible 'settings' save. */
export function showCalendarSaveToast(message, type, saveMode, calendarId, fields, before, saved) {
  const undo = saveMode === 'settings' && type !== 'error' ? settingsSaveUndo(calendarId, fields, before, saved) : null;
  showUndoableToast(live().showToast, message, undo, { type });
}

// Taken just before a save, from the same source the revert reads afterwards.
export const snapshotAttendance = dateStr => snapshotRecords(latestAttendance(dateStr), attendanceKey);
export const snapshotExpenses = dateStr => snapshotRecords(latestExpenses(dateStr));
export const snapshotPlaces = () => snapshotRecords(latestPlaces());
export const snapshotSettlementCards = () => snapshotRecords(latestSettlementCards());

/**
 * 되돌리기 for one document a screen just wrote whole ('set'): 컨텐츠 등록/수정, 문화공연 메모.
 * `previous` is the document before the save (null: the save created it, so 되돌리기 removes
 * it). `current()` reads the latest copy; when it no longer equals `saved` someone changed it
 * again, and 되돌리기 refuses rather than overwrite that. `after(previous)` updates the screen.
 */
export function showDocumentUndo(message, { calendarId, collection, docId, previous, saved, current, after, label = '되돌리기' }) {
  const savedClone = clone(saved);
  const previousClone = clone(previous);
  const undo = calendarId && collection && docId ? async () => {
    const deps = live();
    if (typeof deps.writeCollectionDocumentWithFallback !== 'function') return false;
    if (typeof current === 'function' && savedClone && stable(current() ?? null) !== stable(savedClone)) return false;
    const result = previousClone
      ? await deps.writeCollectionDocumentWithFallback(collection, calendarId, docId, previousClone, 'set', label)
      : await deps.writeCollectionDocumentWithFallback(collection, calendarId, docId, null, 'delete', label);
    if (!result?.success) return false;
    if (typeof after === 'function') await after(previousClone);
    return true;
  } : null;
  showUndoableToast(live().showToast, message, undo);
}

/**
 * 갤러리 사진 추가 / 사진 붙여넣기 되돌리기: remove the message documents that action created.
 * Only those records go -- the photo files stay, exactly like deleting the message (another
 * record may show the same original, and a re-upload reuses it).
 */
export async function revertCreatedMessages(calendarId, messageIds) {
  const deps = live();
  const ids = (Array.isArray(messageIds) ? messageIds : []).filter(Boolean);
  if (!calendarId || !ids.length || typeof deps.writeCollectionDocumentWithFallback !== 'function') return false;
  for (const id of ids) {
    const removed = await deps.writeCollectionDocumentWithFallback('messages', calendarId, id, null, 'delete', '사진 추가 되돌리기');
    if (!removed) return false;
    deps.removeLocalChatMessage?.(id);
    await deps.unlinkMeetingPhotoReferences?.(id, null);
  }
  return true;
}

/** One participant's entries on these dates, just before a 반복 일정 save (null = none). */
export function snapshotAvailabilityFor(participantId, dates) {
  const cal = live().getActiveCalendar?.();
  const list = Array.isArray(cal?.availabilities) ? cal.availabilities : [];
  const out = new Map();
  (Array.isArray(dates) ? dates : []).forEach(date => {
    const entry = list.find(item => item && item.date === date && item.participantId === participantId && isLive(item));
    out.set(date, entry ? clone(entry) : null);
  });
  return { calendarId: cal?.id || '', participantId, entries: out };
}

/**
 * 반복 일정 되돌리기, in one save: dates the save created go back to empty, dates it overwrote get
 * their earlier note. A date whose entry no longer holds the note this save wrote (`writtenNote`)
 * changed again since and is left alone, so nobody else's newer change is lost.
 */
export async function revertBulkAvailability(snapshot, writtenNote) {
  const deps = live();
  const calendars = deps.getCalendars?.() || [];
  const latest = calendars.find(cal => cal && cal.id === snapshot?.calendarId);
  if (!latest || typeof deps.updateCalendars !== 'function' || !snapshot.entries?.size) return false;
  const now = Date.now();
  let changed = 0;
  const availabilities = (latest.availabilities || []).map(entry => {
    if (!entry || entry.participantId !== snapshot.participantId || !snapshot.entries.has(entry.date)) return entry;
    if (!isLive(entry) || String(entry.note || '') !== String(writtenNote || '')) return entry;
    const before = snapshot.entries.get(entry.date);
    changed += 1;
    return before
      ? { ...entry, note: before.note || '', updatedAt: now, deletedAt: null }
      : { ...entry, updatedAt: now, deletedAt: now };
  });
  if (!changed) return false;
  const restored = { ...latest, availabilities, updatedAt: now, revision: (latest.revision || 0) + 1 };
  const next = calendars.map(cal => (cal && cal.id === latest.id ? restored : cal));
  return (await deps.updateCalendars(next, null, null, latest.id, 'availability', [])) !== false;
}
