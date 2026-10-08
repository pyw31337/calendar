import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildSettlementCategoryView, buildSettlementCategoryTotals, sortSettlementEntriesNewestFirst,
  formatSettlementShare, SETTLEMENT_CATEGORY_ALL,
} from '../src/core/settlement-category.js';

const food = { id: 'food', name: '식품', color: '#F97316' };
const goods = { id: 'goods', name: '물품', color: '#3B82F6' };
const stay = { id: 'stay', name: '숙박', color: '#8B5CF6' };
const etc = { id: 'etc', name: '기타', color: '#64748B' };
const categories = [food, goods, stay, etc];
const items = [
  { id: 'a', date: '2026-10-09', amount: -60000, category: stay, createdAt: 1 },
  { id: 'b', date: '2026-10-10', amount: -130000, category: stay, createdAt: 2 },
  { id: 'c', date: '2026-10-10', amount: -20000, category: food, createdAt: 3 },
  { id: 'd', date: '2026-10-10', amount: -5000, category: food, createdAt: 4, isSelfPay: true },
  { id: 'e', date: '2026-10-11', amount: 100000, category: etc, createdAt: 5, isIncome: true },
  { id: 'f', date: '2026-09-01', amount: -10000, category: goods, createdAt: 6 },
];

test('totals use the 누적보기 bar basis: 공금 expenses only, calendar category order', () => {
  const totals = buildSettlementCategoryTotals(items, categories);
  assert.deepEqual(totals.map(r => [r.category.id, r.total, r.count]), [['food', 20000, 1], ['goods', 10000, 1], ['stay', 190000, 2]]);
});

test('one category: total, count, share of all spending, newest first', () => {
  const view = buildSettlementCategoryView(items, categories, 'stay');
  assert.equal(view.selected, 'stay');
  assert.equal(view.summary.total, 190000);
  assert.equal(view.summary.count, 2);
  assert.equal(view.grandTotal, 220000);
  assert.equal(formatSettlementShare(view.summary.share), '86.4%');
  assert.deepEqual(view.entries.map(i => i.id), ['b', 'a']);
});

test('전체: every 공금 expense newest first, never income or 자비부담', () => {
  const view = buildSettlementCategoryView(items, categories, SETTLEMENT_CATEGORY_ALL);
  assert.equal(view.summary.category, null);
  assert.equal(view.summary.total, 220000);
  assert.equal(view.summary.count, 4);
  assert.deepEqual(view.entries.map(i => i.id), ['c', 'b', 'a', 'f']);
});

test('a selected category with no entries (filtered out by search) falls back to 전체', () => {
  const view = buildSettlementCategoryView(items.filter(i => i.category !== goods), categories, 'goods');
  assert.equal(view.selected, SETTLEMENT_CATEGORY_ALL);
  assert.equal(view.entries.length, 3);
  const empty = buildSettlementCategoryView([], categories, 'food');
  assert.equal(empty.summary.total, 0);
  assert.equal(empty.summary.share, 0);
});

test('same-day ordering: later createdAt first, then later ledger position', () => {
  const sorted = sortSettlementEntriesNewestFirst([
    { id: 1, date: '2026-10-10', createdAt: 5 }, { id: 2, date: '2026-10-10', createdAt: 9 },
    { id: 3, date: '2026-10-10' }, { id: 4, date: '2026-10-10' }, { id: 5, date: '2026-10-12' },
  ]);
  assert.deepEqual(sorted.map(i => i.id), [5, 2, 1, 4, 3]);
});

test('share labels', () => {
  assert.equal(formatSettlementShare(1), '100%');
  assert.equal(formatSettlementShare(0.0423), '4.2%');
  assert.equal(formatSettlementShare(NaN), '0%');
  assert.equal(formatSettlementShare(0.5), '50%');
});

test('정산 page wires three tabs, tappable category rows and a Back marker outside the dialog stack', async () => {
  const src = await readFile(new URL('../src/ui/ui-event-modals.js', import.meta.url), 'utf8');
  assert.match(src, /\{ value: 'total', label: '누적보기' \}, \{ value: 'daily', label: '월별보기' \}, \{ value: 'category', label: '카테고리별보기' \}/);
  assert.match(src, /React\.createElement\(SettlementCategoryBarRow, \{[\s\S]{0,200}onOpen: openSettlementCategoryFromTotal/);
  assert.match(src, /useOverlayHistory\([\s\S]{0,200}\{ enabled: categoryBackArmed, key: 'settlement-category', stack: false \}\)/);
  assert.match(src, /onChange: handleSettlementTabChange/);
  const view = await readFile(new URL('../src/ui/settlement-category-view.js', import.meta.url), 'utf8');
  assert.match(view, /className: 'settle-cat-row'[\s\S]{0,40}|type: 'button',\s*className: 'settle-cat-row'/);
  const css = await readFile(new URL('../src/ui/v2/settlement-category.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /!important/, 'no new !important');
});
