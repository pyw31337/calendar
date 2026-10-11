import assert from 'node:assert/strict';
import test from 'node:test';
import { orderCultureEventItems } from '../src/core/culture-event-order.js';

const TODAY = '2026-10-01';

test('culture events show 행사중, then 이번주, then a deterministic random remainder', () => {
  const items = [
    { id: 'later', startDate: '2026-10-12', endDate: '2026-10-13' },
    { id: 'this-week', startDate: '2026-10-03', endDate: '2026-10-08' },
    { id: 'ongoing', startDate: '2026-09-28', endDate: '2026-10-05' },
    { id: 'undated' },
    { id: 'future', startDate: '2026-10-22', endDate: '2026-10-24' },
  ];

  const first = orderCultureEventItems(items, { today: TODAY, seed: 73 });
  const repeated = orderCultureEventItems(items, { today: TODAY, seed: 73 });

  assert.deepEqual(first.map(item => item.id).slice(0, 2), ['ongoing', 'this-week']);
  assert.deepEqual(first.map(item => item.id), repeated.map(item => item.id));
  assert.deepEqual(new Set(first.slice(2).map(item => item.id)), new Set(['later', 'undated', 'future']));
  assert.notDeepEqual(first.slice(2).map(item => item.id), ['later', 'undated', 'future']);
});
