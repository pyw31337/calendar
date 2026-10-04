import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSelectableSettlementExpenses,
  getReservedSettlementItemKeys
} from '../src/core/settlement-card-selection.js';

test('settlement item keys used by another card are reserved', () => {
  const reserved = getReservedSettlementItemKeys([
    { id: 'card-current', checkedItemKeys: ['2026-10-03_e1_10000'] },
    { id: 'card-other', checkedItemKeys: ['2026-10-03_e2_20000'], checkedItems: { '2026-10-04_e3_30000': {} } },
    { id: 'card-empty' }
  ], 'card-current');

  assert.deepEqual([...reserved].sort(), ['2026-10-03_e2_20000', '2026-10-04_e3_30000']);
  assert.deepEqual(
    filterSelectableSettlementExpenses([
      { itemKey: '2026-10-03_e1_10000' },
      { itemKey: '2026-10-03_e2_20000' },
      { itemKey: '2026-10-04_e3_30000' }
    ], reserved).map(item => item.itemKey),
    ['2026-10-03_e1_10000']
  );
});

test('a new card reserves every persisted card selection', () => {
  const reserved = getReservedSettlementItemKeys([
    { id: 'a', checkedItemKeys: ['a-key'] },
    { id: 'b', checkedItems: { 'b-key': { amount: 20000 } } }
  ]);

  assert.deepEqual([...reserved].sort(), ['a-key', 'b-key']);
});
