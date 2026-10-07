import test from 'node:test';
import assert from 'node:assert/strict';
import {
  diffCalendarSettingsFields,
  mergeCategoriesById,
} from '../src/core/calendar-settings-diff.js';

test('diffCalendarSettingsFields only lists keys that actually changed', () => {
  const baseline = {
    title: 'A',
    description: '',
    expenseCategories: [{ id: 'food', name: '식비' }],
    placeCategories: [{ id: 'cafe', name: '카페' }],
    settlementBaseBudget: 0,
  };
  const next = {
    ...baseline,
    title: 'B',
    expenseCategories: [{ id: 'food', name: '식비' }],
  };
  assert.deepEqual(
    diffCalendarSettingsFields(baseline, next, ['title', 'description', 'expenseCategories', 'placeCategories', 'settlementBaseBudget']),
    ['title']
  );
});

test('mergeCategoriesById keeps server-only ids and applies incoming updates', () => {
  const server = [
    { id: 'food', name: '식비', color: '#1' },
    { id: 'travel', name: '여행', color: '#2' },
  ];
  const incoming = [
    { id: 'food', name: '밥', color: '#1' },
    { id: 'fun', name: '놀기', color: '#3' },
  ];
  const merged = mergeCategoriesById(server, incoming);
  const byId = Object.fromEntries(merged.map(c => [c.id, c.name]));
  assert.equal(byId.food, '밥');
  assert.equal(byId.travel, '여행');
  assert.equal(byId.fun, '놀기');
});

test('mergeCategoriesById honors deletedIds', () => {
  const merged = mergeCategoriesById(
    [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    [{ id: 'a', name: 'A' }],
    ['b']
  );
  assert.deepEqual(merged.map(c => c.id), ['a']);
});
