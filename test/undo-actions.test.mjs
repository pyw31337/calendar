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
  assert.ok(!toasts[6].actionLabel);
  assert.equal(toasts[6].duration, 3000, 'a toast without undo keeps the normal length');
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

test('설정 저장 (공지·태그·정산 카드): 되돌리기 writes back only what that save changed', async () => {
  const before = { id: 'demo', customPersonTags: ['삼촌'], settlementCards: [{ id: 'c1', status: 'active', updatedAt: 1 }, { id: 'c2', status: 'active', updatedAt: 1 }] };
  const saved = { ...before, customPersonTags: ['삼촌', '이모'], pinnedNotices: [{ id: 'n1', text: '공지' }], settlementCards: [{ id: 'c1', status: 'closed', updatedAt: 5 }, before.settlementCards[1]] };
  const state = { calendars: [JSON.parse(JSON.stringify(saved)), { id: 'other' }] };
  const writes = [];
  window.__gatherUndoDeps = {
    getCalendars: () => state.calendars,
    updateCalendars: async (next, message, type, calendarId, mode, logs, aux) => { writes.push({ next, message, calendarId, mode, aux }); return true; },
  };
  assert.equal(undo.settingsSaveUndo('demo', ['participants'], before, saved), null, 'participants have their own merge: no 되돌리기');
  assert.equal(undo.settingsSaveUndo('demo', ['places'], before, saved), null);

  assert.equal(await undo.settingsSaveUndo('demo', ['customPersonTags'], before, saved)(), true);
  assert.deepEqual(writes[0].next[0].customPersonTags, ['삼촌']);
  assert.equal(writes[0].message, null, 'the outcome toast comes from the 되돌리기 helper');
  assert.deepEqual(writes[0].aux, { settingsFields: ['customPersonTags'] });
  assert.equal(writes[0].next[1], state.calendars[1], 'other calendars are untouched');

  await undo.settingsSaveUndo('demo', ['pinnedNotices', 'pinnedNotice'], before, saved)();
  assert.deepEqual(writes[1].next[0].pinnedNotices, [], 'a field that did not exist before goes back to empty');

  await undo.settingsSaveUndo('demo', ['settlementCards'], before, saved)();
  const cards = writes[2].next[0].settlementCards;
  assert.equal(cards[0].status, 'active', 'the changed card gets its previous version');
  assert.ok(cards[0].updatedAt > 5, 'with a newer stamp so the by-id merge keeps it');
  assert.equal(cards[1], state.calendars[0].settlementCards[1], 'an untouched card stays as it is');

  const addedSaved = { ...before, settlementCards: [{ id: 'c3', title: '새 정산', updatedAt: 9 }, ...before.settlementCards] };
  state.calendars = [JSON.parse(JSON.stringify(addedSaved))];
  await undo.settingsSaveUndo('demo', ['settlementCards'], before, addedSaved)();
  assert.ok(writes[3].next[0].settlementCards[0].deletedAt, 'a card the save created is tombstoned');

  state.calendars = [{ ...JSON.parse(JSON.stringify(saved)), customPersonTags: ['삼촌', '이모', '고모'] }];
  assert.equal(await undo.settingsSaveUndo('demo', ['customPersonTags'], before, saved)(), false, 'changed again since: someone else\'s newer change is kept');
  assert.equal(writes.length, 4);
});

test('장소: 일괄 삭제·붙여넣기·등록 되돌리기', async () => {
  const state = { calendar: { id: 'demo', places: [{ id: 'p1', name: '카페' }, { id: 'p2', name: '식당' }] }, other: { id: 'other' } };
  const calls = [];
  window.__gatherUndoDeps = {
    getActiveCalendar: () => state.calendar,
    getCalendars: () => [state.calendar, state.other],
    getCalendarPlaces: cal => cal.places || [],
    setPlacesSubcollection: places => calls.push(['setPlaces', places.map(p => p.id)]),
    writeCollectionDocumentWithFallback: async (...args) => { calls.push(['write', ...args.slice(0, 5)]); return { success: true }; },
    updateCalendars: async (next, message, type, calendarId, mode, logs, aux) => { calls.push(['update', calendarId, aux.places.map(p => p.id), aux.settingsFields]); return true; },
    handleDeletePlace: async (ids, options) => { calls.push(['deletePlace', ids, options]); return true; },
    handleSavePlace: async place => { calls.push(['savePlace', place.id, place.memo]); return true; },
  };
  // A bulk delete removed p3 and p4; undo writes both documents back and returns them to the list.
  assert.equal(await undo.restoreDeletedPlaces('demo', [{ id: 'p3', name: 'A' }, { id: 'p4', name: 'B' }]), true);
  assert.deepEqual(calls.filter(c => c[0] === 'write').map(c => [c[2], c[3], c[5]]), [['demo', 'p3', 'set'], ['demo', 'p4', 'set']]);
  assert.equal(calls.find(c => c[0] === 'write')[4].id, undefined, 'the id is the document id, not a field');
  assert.deepEqual(calls.at(-1), ['update', 'demo', ['p1', 'p2', 'p3', 'p4'], ['places']]);

  // A paste added p5 and merged a memo into p1: undo deletes p5 in one call and restores p1.
  const before = undo.snapshotPlaces();
  state.calendar = { ...state.calendar, places: [{ id: 'p1', name: '카페', memo: '붙여넣은 메모' }, state.calendar.places[1], { id: 'p5', name: '새 장소' }] };
  calls.length = 0;
  assert.equal(await undo.revertPlaceChanges(before, 2), true);
  assert.deepEqual(calls[0], ['deletePlace', ['p5'], { silent: true }]);
  assert.deepEqual(calls[1], ['savePlace', 'p1', '']);
  assert.equal(await undo.revertPlaceChanges(before, 1), false, 'more changes than pasted: refuse');

  // 장소 등록완료 (a 'places' settings save) offers undo only when exactly one place differs.
  const beforeCal = { id: 'demo', places: [{ id: 'p1', name: '카페' }] };
  assert.equal(typeof undo.settingsSaveUndo('demo', ['places'], beforeCal, { id: 'demo', places: [{ id: 'p1', name: '카페' }, { id: 'p9', name: '새' }] }), 'function');
  assert.equal(undo.settingsSaveUndo('demo', ['places'], beforeCal, { id: 'demo', places: [{ id: 'p8' }, { id: 'p9' }] }), null);
});

test('갤러리 링크·파일 일괄 삭제: 되돌리기 re-creates removed messages and puts files back', async () => {
  const { deleteGalleryLinkItems, deleteGalleryFilesWithUndo } = await import('../src/core/gallery-bulk-delete.js');
  const messages = new Map([
    ['m1', { id: 'm1', participantId: 'p1', text: 'https://a.example', timestamp: 1, uploadSource: 'gallery', linkPreview: null, localOnly: true, directMediaTags: { h: '#여행' } }],
    ['m2', { id: 'm2', participantId: 'p1', text: 'https://b.example 설명', timestamp: 2, uploadSource: 'gallery' }],
    ['m3', { id: 'm3', participantId: 'p1', text: '', timestamp: 3, uploadSource: 'gallery', fileAttachments: [{ id: 'f1', storagePath: 'chatFiles/demo/a.pdf' }, { id: 'f2', storagePath: 'chatFiles/demo/b.pdf' }] }],
  ]);
  const writes = [];
  const local = [];
  const deps = {
    activeCal: { id: 'demo' },
    guardLoadedCalendar: () => true,
    findChatMessageById: async id => messages.get(id) || null,
    getMessageImageEntries: () => [],
    writeCollectionDocumentWithFallback: async (collection, calId, id, data, method) => {
      writes.push({ id, data, method });
      if (method === 'delete') messages.delete(id);
      else if (method === 'set') messages.set(id, { ...data, id });
      else messages.set(id, { ...messages.get(id), ...data });
      return { success: true };
    },
    removeLocalChatMessage: id => local.push(['remove', id]),
    patchLocalChatMessage: (id, patch) => local.push(['patch', id, patch]),
    upsertLocalChatMessage: message => local.push(['upsert', message.id]),
    fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true, queued: 1 }) }),
    projectId: 'demo-project',
  };
  const links = await deleteGalleryLinkItems([{ messageId: 'm1', url: 'https://a.example' }, { messageId: 'm2', url: 'https://b.example' }], deps);
  assert.equal(links.deleted, 2);
  assert.equal(messages.has('m1'), false);
  assert.equal(await links.undo(), true);
  const recreated = writes.find(w => w.id === 'm1' && w.method === 'set');
  assert.deepEqual(Object.keys(recreated.data).sort(), ['linkPreview', 'participantId', 'text', 'timestamp', 'uploadSource'], 'only fields the create rule allows');
  assert.ok(writes.some(w => w.id === 'm1' && w.method === 'update' && w.data.directMediaTags), 'update-only metadata follows in a second write');
  assert.equal(messages.get('m2').text, 'https://b.example 설명');

  const files = await deleteGalleryFilesWithUndo([{ messageId: 'm3', id: 'f1' }], deps);
  assert.equal(files.deleted, 1);
  messages.set('m3', { ...messages.get('m3'), fileAttachments: [...messages.get('m3').fileAttachments, { id: 'f3' }] });
  assert.equal(await files.undo(), true);
  assert.deepEqual(messages.get('m3').fileAttachments.map(f => f.id), ['f1', 'f2', 'f3'], 'the removed file returns in place; a file added since stays');
});
