/**
 * 정산 카테고리별보기 (pure, no React): which categories are in use, the per-category totals, and
 * the entry list for the selected chip.
 *
 * Basis is the same as the 누적보기 "카테고리별 지출" bars: 공금 expenses only -- income and
 * 자비부담 (isSelfPay) entries are left out of the totals, counts and list, so the numbers on both
 * views always agree.
 */

export const SETTLEMENT_CATEGORY_ALL = 'all';

function amountOf(item) {
  return Math.abs(Number(item && item.amount) || 0);
}

export function isCategoryViewExpense(item) {
  return !!item && !item.isIncome && !item.isSelfPay && amountOf(item) > 0;
}

/** Used categories in the calendar's own category order (same order/colors as the bars). */
export function buildSettlementCategoryTotals(items, categories) {
  const expenses = (Array.isArray(items) ? items : []).filter(isCategoryViewExpense);
  return (Array.isArray(categories) ? categories : [])
    .map(category => {
      const own = expenses.filter(item => item.category && item.category.id === category.id);
      return { category, total: own.reduce((sum, item) => sum + amountOf(item), 0), count: own.length };
    })
    .filter(row => row.total > 0 || row.count > 0);
}

function timeOf(item) {
  const n = Number(item && item.createdAt);
  if (Number.isFinite(n)) return n;
  const parsed = Date.parse(item && item.createdAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Newest first: entry date (YYYY-MM-DD), then createdAt, then the later position in the ledger. */
export function sortSettlementEntriesNewestFirst(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const byDate = String(b.item.date || '').localeCompare(String(a.item.date || ''));
      if (byDate) return byDate;
      const byTime = timeOf(b.item) - timeOf(a.item);
      if (byTime) return byTime;
      return b.index - a.index;
    })
    .map(row => row.item);
}

/** Share as a short percentage label: 36.5% / 4.2% / 100%, never "NaN%". */
export function formatSettlementShare(share) {
  const pct = Number.isFinite(share) ? Math.max(0, Math.min(1, share)) * 100 : 0;
  const rounded = Math.round(pct * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

/**
 * @returns {{ selected: string, totals: Array, grandTotal: number, entries: Array,
 *   summary: { total: number, count: number, share: number, category: object|null } }}
 * A selected category that has no entries (search filtered it out, or it was emptied) shows 전체.
 */
export function buildSettlementCategoryView(items, categories, selectedId = SETTLEMENT_CATEGORY_ALL) {
  const totals = buildSettlementCategoryTotals(items, categories);
  const grandTotal = totals.reduce((sum, row) => sum + row.total, 0);
  const grandCount = totals.reduce((sum, row) => sum + row.count, 0);
  const picked = totals.find(row => row.category.id === selectedId) || null;
  const selected = picked ? selectedId : SETTLEMENT_CATEGORY_ALL;
  const expenses = (Array.isArray(items) ? items : []).filter(isCategoryViewExpense);
  const usedIds = new Set(totals.map(row => row.category.id));
  const pool = picked
    ? expenses.filter(item => item.category && item.category.id === selected)
    : expenses.filter(item => item.category && usedIds.has(item.category.id));
  return {
    selected,
    totals,
    grandTotal,
    entries: sortSettlementEntriesNewestFirst(pool),
    summary: picked
      ? { total: picked.total, count: picked.count, share: grandTotal ? picked.total / grandTotal : 0, category: picked.category }
      : { total: grandTotal, count: grandCount, share: grandTotal ? 1 : 0, category: null },
  };
}
