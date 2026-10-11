import assert from 'node:assert/strict';
import test from 'node:test';
import { CULTURE_EVENT_STATUS_FILTERS, orderCultureEventItems } from '../src/core/culture-event-order.js';

const TODAY = '2026-10-01';

test('culture events shuffle the entire default set deterministically for one tab visit', () => {
  const items = [
    { id: 'later', startDate: '2026-10-12', endDate: '2026-10-13' },
    { id: 'this-week', startDate: '2026-10-03', endDate: '2026-10-08' },
    { id: 'ongoing', startDate: '2026-09-28', endDate: '2026-10-05' },
    { id: 'undated' },
    { id: 'future', startDate: '2026-10-22', endDate: '2026-10-24' },
  ];

  const first = orderCultureEventItems(items, { today: TODAY, seed: 73 });
  const repeated = orderCultureEventItems(items, { today: TODAY, seed: 73 });

  assert.deepEqual(first.map(item => item.id), repeated.map(item => item.id));
  assert.deepEqual(new Set(first.map(item => item.id)), new Set(items.map(item => item.id)));
  assert.notDeepEqual(first.map(item => item.id), items.map(item => item.id));
});

test('culture event status filter returns only the badge selected on a poster', () => {
  const items = [
    { id: 'ongoing-one', startDate: '2026-09-28', endDate: '2026-10-05' },
    { id: 'ongoing-two', startDate: '2026-10-01', endDate: '2026-10-02' },
    { id: 'this-week', startDate: '2026-10-03', endDate: '2026-10-08' },
    { id: 'later', startDate: '2026-10-12', endDate: '2026-10-13' },
  ];

  const ongoing = orderCultureEventItems(items, { today: TODAY, seed: 73, statusFilter: 'ongoing' });
  const thisWeek = orderCultureEventItems(items, { today: TODAY, seed: 73, statusFilter: 'thisWeek' });

  assert.equal(CULTURE_EVENT_STATUS_FILTERS.ongoing, '행사중');
  assert.equal(CULTURE_EVENT_STATUS_FILTERS.thisWeek, '이번주');
  assert.deepEqual(new Set(ongoing.map(item => item.id)), new Set(['ongoing-one', 'ongoing-two']));
  assert.deepEqual(thisWeek.map(item => item.id), ['this-week']);
});
