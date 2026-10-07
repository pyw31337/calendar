import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { loadOperationsCalendar, mergeCanonical } = require('../functions/media-analysis-brief-data.js');
const { buildCalendarOperations } = require('../functions/ai-operations.js');
const { buildAiOperationsInbox } = await import('../src/core/ai-operations.js');
const { buildBrief } = require('../functions/media-analysis-brief.js');
const doc = (id, data) => ({ id, data: () => data });

test('canonical subcollections override embedded records and tombstones prevent resurrection', async () => {
  const meetingDocs = [doc('2026-10-07', { date: '2026-10-07', note: '실제 일정' }), doc('2026-10-08', { removedAt: 1 })];
  assert.deepEqual(mergeCanonical([{ date: '2026-10-08', title: '삭제된 일정' }], meetingDocs).map(row => row.note), ['실제 일정']);
  const queries = [];
  const calendarDoc = { data: () => ({ calendar: { confirmedMeeting: [{ date: '2026-10-08' }], places: [] } }), ref: {
    collection: name => {
      const query = { where: (...args) => { queries.push(args); return query; }, select: (...fields) => { assert.equal(fields.includes('photos'), false); return query; },
        limit: count => { assert.ok(count <= 501); return query; }, get: async () => ({ docs: name === 'confirmedMeetings' ? meetingDocs : [doc('place1', { name: '숙소', memo: '26.10.07 예약 완료' })] }) };
      return query;
    }
  } };
  const result = await loadOperationsCalendar(calendarDoc, '2026-10-06');
  assert.deepEqual(result.missing, []);
  assert.deepEqual(queries, [['__name__', '>=', '2026-08-07'], ['__name__', '<=', '2026-10-27']]);
  assert.deepEqual(buildCalendarOperations({ calendar: result.calendar, dateKey: '2026-10-06' }), []);
});

test('an unavailable subcollection is marked partial, never silently substituted with stale data', async () => {
  const calendarDoc = { data: () => ({ calendar: {} }), ref: { collection: () => {
    const query = { where: () => query, select: () => query, limit: () => query, get: async () => { throw new Error('unavailable'); } };
    return query;
  } } };
  assert.deepEqual((await loadOperationsCalendar(calendarDoc, '2026-10-06')).missing, ['일정', '장소']);
});

test('brief keeps newer meeting facts and independent expenses when a legacy projection is older', async () => {
  const date = '2026-10-06';
  const calendarDoc = { data: () => ({ calendar: { confirmedMeeting: [{ date, confirmed: true, note: '새 일정', updatedAt: 30,
    expenses: [{ id: 'a', amount: 100 }, { id: 'removed', amount: 500, deletedAt: 20 }] }] } }), ref: { collection: name => {
    const query = { where: () => query, select: () => query, limit: () => query, get: async () => ({ docs: name === 'places' ? [] : [doc(date,
      { date, confirmed: false, updatedAt: 10, note: '', expenses: [{ id: 'b', amount: 200 }, { id: 'removed', amount: 500 }] })] }) };
    return query;
  } } };
  const result = await loadOperationsCalendar(calendarDoc, date);
  const meeting = result.calendar.confirmedMeeting[0];
  assert.equal(meeting.confirmed, true);
  assert.equal(meeting.note, '새 일정');
  assert.deepEqual(meeting.expenses.map(row => row.id), ['a', 'removed', 'b']);
  assert.equal(meeting.expenses[1].deletedAt, 20);
  assert.equal(buildCalendarOperations({ calendar: result.calendar, dateKey: '2026-10-07' }).some(row => row.id.startsWith('settlement:')), true);
});

test('server and client agree on ledger-only, income, deleted rows and duplicate settlement claims', () => {
  const calendar = { confirmedMeeting: [
    { date: '2026-10-05', confirmed: false, expenses: [{ type: 'income', amount: 500 }, { amount: 100 }, { amount: 200 }] },
    { date: '2026-10-07', removedAt: 1 }, { date: '2026-10-08', note: '여행' }
  ], settlementCards: [{ id: '1', checkedItemKeys: ['2026-10-05_1_100'] }, { id: '2', checkedItems: { '2026-10-05_1_100': {} } }] };
  const client = buildAiOperationsInbox({ calendar, today: '2026-10-06' });
  const server = buildCalendarOperations({ calendar, dateKey: '2026-10-06' });
  assert.deepEqual(client.map(({ id, title, detail }) => ({ id, title, detail })), server.map(({ id, title, detail }) => ({ id, title, detail })));
});

test('brief renders all reported tasks and links to the right calendar without a nonexistent gallery route', () => {
  const brief = buildBrief({ calendars: [{ id: 'cw', name: '<가족>', operations: [1, 2, 3, 4].map(i => ({ title: `항목${i}`, detail: '<점검>' })) }] });
  assert.equal(brief.operationCount, 4);
  assert.match(brief.html, /항목4/);
  assert.match(brief.html, /&amp;id=cw/);
  assert.match(brief.html, /&lt;가족&gt;/);
  assert.doesNotMatch(brief.html, /tab=gallery|<점검>/);
});
