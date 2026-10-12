import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};
const { showUndoableToast, UNDO_TOAST_MS } = await import('../src/core/undo-toast.js');
const undo = await import('../src/core/app-undo-actions.js');

function recorder() {
  const toasts = [];
  const showToast = (message, type, duration, onAction, onExpire, actionLabel) => toasts.push({ message, type, duration, onAction, actionLabel });
  return { toasts, showToast };
}

test('a success toast gets 되돌리기 at its end, runs the undo once and reports the outcome', async () => {
  const { toasts, showToast } = recorder();
  let runs = 0;
  showUndoableToast(showToast, '메모가 저장되었습니다.', async () => { runs += 1; return '메모 저장을 되돌렸습니다.'; });
  assert.equal(toasts[0].actionLabel, '되돌리기');
  assert.equal(toasts[0].type, 'success');
  assert.equal(toasts[0].duration, UNDO_TOAST_MS);
  await toasts[0].onAction();
  await toasts[0].onAction();
  assert.equal(runs, 1);
  assert.equal(toasts[1].message, '메모 저장을 되돌렸습니다.');
  assert.equal(toasts[1].onAction, undefined, 'the outcome toast has no second 되돌리기');

  showUndoableToast(showToast, 'x', async () => false);
  await toasts[2].onAction();
  assert.equal(toasts[3].type, 'error');
  showUndoableToast(showToast, 'y', async () => { throw new Error('boom'); });
  await toasts[4].onAction();
  assert.equal(toasts[5].message, '되돌리지 못했습니다.');
  showUndoableToast(showToast, 'plain', null);
  assert.equal(toasts[6].actionLabel, undefined);
});

test('findSingleChange reverses exactly one record and refuses when it is ambiguous', () => {
  const before = undo.snapshotRecords([{ id: 'a', n: 1 }, { id: 'b', n: 2 }]);
  assert.deepEqual(undo.findSingleChange(before, [{ id: 'a', n: 1 }, { id: 'b', n: 2 }, { id: 'c', n: 3 }]), { kind: 'added', record: { id: 'c', n: 3 } });
  assert.equal(undo.findSingleChange(before, [{ n: 1, id: 'a' }, { id: 'b', n: 9 }]).kind, 'changed', 'key order alone is not a change');
  assert.equal(undo.findSingleChange(before, [{ id: 'a', n: 1 }, { id: 'b', n: 2 }]), null, 'nothing changed');
  assert.equal(undo.findSingleChange(before, [{ id: 'a', n: 5 }, { id: 'b', n: 9 }]), null, 'two changed: someone else saved too');
});

function fakeApp(initial) {
  const state = JSON.parse(JSON.stringify(initial));
  const calls = [];
  window.__gatherUndoDeps = {
    getActiveCalendar: () => state.calendar,
    getConfirmedMeetings: cal => cal.confirmedMeeting || [],
    getCalendarPlaces: cal => cal.places || [],
    getCalendarSettlementCards: cal => (cal.settlementCards || []).filter(card => !card.deletedAt),
    handleSaveAvailability: (date, participantId, note) => { calls.push(['saveAvailability', date, participantId, note]); return true; },
    handleDeleteAvailability: (date, participantId) => { calls.push(['deleteAvailability', date, participantId]); return true; },
    handleSaveExpense: (date, expense) => { calls.push(['saveExpense', date, expense]); return true; },
    handleDeleteExpense: (date, id) => { calls.push(['deleteExpense', date, id]); return true; },
    handleSavePlace: place => { calls.push(['savePlace', place]); return true; },
    handleDeletePlace: (id, options) => { calls.push(['deletePlace', id, options]); return true; },
    handleReorderExpenses: (date, ids) => { calls.push(['reorderExpenses', date, ids]); return true; },
    handleSaveSettlementCard: card => { calls.push(['saveCard', card]); return true; },
    handleDeleteSettlementCard: id => { calls.push(['deleteCard', id]); return true; },
    writeCollectionDocumentWithFallback: async (...args) => { calls.push(['write', ...args]); return { success: true }; },
    handleAnniversarySaved: ann => calls.push(['annSaved', ann]),
    handleAnniversaryDeleted: id => calls.push(['annDeleted', id]),
  };
  return { state, calls };
}

test('참석: an added entry is deleted again, an edited one gets its previous note back', async () => {
  const app = fakeApp({ calendar: { id: 'demo', availabilities: [{ date: '2026-10-12', participantId: 'p1', note: '' }] } });
  const before = undo.snapshotAttendance('2026-10-12');
  app.state.calendar.availabilities.push({ date: '2026-10-12', participantId: 'p2', note: '저녁' });
  assert.equal(await undo.revertAttendanceSave('2026-10-12', before), true);
  assert.deepEqual(app.calls.at(-1), ['deleteAvailability', '2026-10-12', 'p2']);

  const editBefore = undo.snapshotAttendance('2026-10-12');
  app.state.calendar.availabilities[1].note = '점심';
  await undo.revertAttendanceSave('2026-10-12', editBefore);
  assert.deepEqual(app.calls.at(-1), ['saveAvailability', '2026-10-12', 'p2', '저녁']);
});

test('정산 내역 and 장소: undo removes what was added or restores the previous fields', async () => {
  const app = fakeApp({ calendar: { id: 'demo', confirmedMeeting: [{ date: '2026-10-12', expenses: [{ id: 'e1', label: '식비', amount: 1000, categoryId: 'food' }] }], places: [{ id: 'pl1', name: '카페', memo: '26.10.01 커피', lat: 1, lng: 2, categoryId: 'cafe' }] } });
  const expensesBefore = undo.snapshotExpenses('2026-10-12');
  app.state.calendar.confirmedMeeting[0].expenses.push({ id: 'e2', label: '간식', amount: 500 });
  await undo.revertExpenseSave('2026-10-12', expensesBefore);
  assert.deepEqual(app.calls.at(-1), ['deleteExpense', '2026-10-12', 'e2']);
  const editBefore = undo.snapshotExpenses('2026-10-12');
  app.state.calendar.confirmedMeeting[0].expenses[0].amount = 3000;
  await undo.revertExpenseSave('2026-10-12', editBefore);
  assert.equal(app.calls.at(-1)[0], 'saveExpense');
  assert.equal(app.calls.at(-1)[2].amount, 1000);

  const placesBefore = undo.snapshotPlaces();
  app.state.calendar.places[0].memo = '26.10.01 커피\n26.10.12 케이크';
  await undo.revertPlaceSave(placesBefore);
  assert.equal(app.calls.at(-1)[0], 'savePlace');
  assert.equal(app.calls.at(-1)[1].memo, '26.10.01 커피', 'the whole per-date memo stack comes back as it was');
  assert.equal(app.calls.at(-1)[1].memoOp, undefined, 'a plain edit, not an upsert');
  const addBefore = undo.snapshotPlaces();
  app.state.calendar.places.push({ id: 'pl2', name: '새 장소', lat: 3, lng: 4 });
  await undo.revertPlaceSave(addBefore);
  assert.deepEqual(app.calls.at(-1), ['deletePlace', 'pl2', { silent: true }]);
});

test('정산 카드, 순서 and 기념일 undo go through the app handlers', async () => {
  const app = fakeApp({ calendar: { id: 'demo', settlementCards: [{ id: 'c1', title: '10월', amount: 1 }] } });
  const cardsBefore = undo.snapshotSettlementCards();
  app.state.calendar.settlementCards.unshift({ id: 'c2', title: '11월' });
  await undo.revertSettlementCardSave(cardsBefore);
  assert.deepEqual(app.calls.at(-1), ['deleteCard', 'c2']);
  assert.equal(await undo.revertOrder('expenses', '2026-10-12', ['b', 'a']), true);
  assert.deepEqual(app.calls.at(-1), ['reorderExpenses', '2026-10-12', ['b', 'a']]);
  assert.equal(await undo.revertOrder('unknown', '2026-10-12', ['b', 'a']), false);

  const { toasts, showToast } = recorder();
  window.__gatherUndoDeps.showToast = showToast;
  undo.showAnniversaryUndo('추억에서 제거했습니다.', 'ann1', { excludedMemoryPhotoKeys: ['k0'] });
  await toasts[0].onAction();
  const write = app.calls.find(call => call[0] === 'write');
  assert.deepEqual(write.slice(1, 4), ['anniversaries', 'demo', 'ann1']);
  assert.deepEqual(write[4].excludedMemoryPhotoKeys, ['k0']);
  assert.equal(write[5], 'update');
  undo.showAnniversaryUndo('캘린더에 등록되었습니다.', 'ann2', null);
  await toasts.at(-1).onAction();
  assert.deepEqual(app.calls.at(-1), ['annDeleted', 'ann2']);
  undo.showAnniversaryUndo('x', 'ann3', undefined);
  assert.equal(toasts.at(-1).actionLabel, undefined, 'unknown previous state: no 되돌리기');
});

test('the shared screens show their success toasts through the 되돌리기 helper', async () => {
  const { readFileSync } = await import('node:fs');
  const read = file => readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
  const expectations = {
    'ui/ui-date-modal.js': ['참석이 추가되었습니다.', '정산 내역이 추가되었습니다.', '장소가 추가되었습니다.', '장소 순서가 변경되었습니다.'],
    'ui/ui-memo-view.js': ['메모가 저장되었습니다.', '메모가 수정되었습니다.'],
    'ui/ui-event-modals.js': ['기념일이 등록되었습니다.', '정산 카드가 생성되었습니다!'],
    'ui/ui-lightbox.js': ['댓글이 등록되었습니다'],
    'ui/ui-calendar-core.js': ['댓글이 등록되었습니다'],
    'ui/ui-places.js': ['메모가 수정되었습니다.'],
    'core/app-image-tag-save.js': ['태그 저장완료'],
    'core/notification-pwa-state.js': ['알림이 켜졌습니다.'],
  };
  for (const [file, messages] of Object.entries(expectations)) {
    const src = read(file);
    for (const message of messages) {
      const at = src.indexOf(message);
      assert.ok(at > 0, `${file}: ${message}`);
      assert.match(src.slice(Math.max(0, at - 160), at), /showUndoableToast\(showToast,/, `${file}: "${message}" offers 되돌리기`);
    }
  }
  const main = read('core/app-main.js');
  for (const message of ['캘린더에 등록되었습니다.', '추억에서 제거했습니다.', '기념일 날짜를 옮겼습니다.']) {
    assert.match(main, new RegExp(`showAnniversaryUndo\\('${message.replace('.', '\\.')}'`));
  }
});
