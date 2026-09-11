import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSettlementRows } from '../src/core/settlement-calculator.js';

test('splits evenly across participants with no owner', () => {
  const rows = calculateSettlementRows(90000, ['A', 'B', 'C']);
  assert.equal(rows.length, 3);
  for (const row of rows) assert.equal(row.share, 30000);
  // Every row's amount should equal its share when there is no owner and no prepayment.
  for (const row of rows) assert.equal(row.amount, 30000);
});

test('rounding remainder is absorbed by the settlement owner, not lost', () => {
  // 536,000 / 3 = 178,666.67 -- the two non-owner rows round to 178,667 each and the
  // owner absorbs whatever is left so the three rows sum back to the exact total.
  const rows = calculateSettlementRows(536000, ['A', 'B', 'C'], new Map(), 'A');
  const total = rows.reduce((sum, r) => sum + r.share, 0);
  assert.equal(total, 536000, 'shares must sum exactly to the total expense, no won lost or gained to rounding');
  const owner = rows.find(r => r.name === 'A');
  const others = rows.filter(r => r.name !== 'A');
  for (const row of others) assert.equal(row.share, Math.round(536000 / 3));
  assert.equal(owner.share, 536000 - Math.round(536000 / 3) * 2);
});

test('rounding remainder is absorbed by the last participant when there is no owner', () => {
  const rows = calculateSettlementRows(100000, ['A', 'B', 'C']);
  const total = rows.reduce((sum, r) => sum + r.share, 0);
  assert.equal(total, 100000);
  // 100000 / 3 = 33333.33 -> rounds to 33333; last row absorbs the +1 remainder.
  assert.equal(rows[0].share, 33333);
  assert.equal(rows[1].share, 33333);
  assert.equal(rows[2].share, 100000 - 33333 * 2);
});

test('a participant who already paid their own way shows a negative (refund-due) amount', () => {
  // Personal prepayments are recorded as negative numbers in personalTotals by convention.
  const personalTotals = new Map([['B', -10000]]);
  const rows = calculateSettlementRows(90000, ['A', 'B', 'C'], personalTotals);
  const b = rows.find(r => r.name === 'B');
  assert.equal(b.personalPaid, 10000);
  // amount = share + personalAdjustment - ownerPayment = 30000 + (-10000) - 0 = 20000
  assert.equal(b.amount, 20000);
});

test('the settlement owner is credited for covering the remainder after prepayments', () => {
  const personalTotals = new Map([['B', -10000]]);
  const rows = calculateSettlementRows(90000, ['A', 'B', 'C'], personalTotals, 'A');
  const owner = rows.find(r => r.name === 'A');
  // ownerRemainderPaid = total(90000) - prepaidTotal(10000) = 80000
  assert.equal(owner.ownerPayment, 80000);
  // amount = share + 0 - 80000 -- the owner's amount goes deeply negative (they're owed back
  // nearly everything they fronted beyond their own share).
  assert.equal(owner.amount, owner.share - 80000);
});

test('duplicate participant names collapse to one row instead of double-charging', () => {
  const rows = calculateSettlementRows(90000, ['A', 'A', 'B', 'C']);
  assert.equal(rows.length, 3);
});

test('empty participant list returns no rows rather than throwing', () => {
  assert.deepEqual(calculateSettlementRows(90000, []), []);
  assert.deepEqual(calculateSettlementRows(90000, null), []);
});

test('a settlementOwnerName that is not actually a participant is ignored, not silently trusted', () => {
  const rows = calculateSettlementRows(90000, ['A', 'B', 'C'], new Map(), 'someone-else');
  // Falls back to "last participant absorbs the remainder" behavior, same as no owner at all.
  const total = rows.reduce((sum, r) => sum + r.share, 0);
  assert.equal(total, 90000);
  assert.equal(rows.every(r => r.ownerPayment === 0), true);
});

test('negative or non-numeric totalExpense is clamped to 0, never produces negative shares', () => {
  const negative = calculateSettlementRows(-50000, ['A', 'B']);
  for (const row of negative) assert.equal(row.share, 0);
  const nonNumeric = calculateSettlementRows('not-a-number', ['A', 'B']);
  for (const row of nonNumeric) assert.equal(row.share, 0);
});
