/**
 * 정산 카테고리별보기 UI pieces (React via window.React, like the other ui-* modules):
 *  - SettlementCategoryBarRow: a 누적보기 "카테고리별 지출" row as a real button (opens 카테고리별보기)
 *  - SettlementCategoryChips: 전체 + used categories, horizontally scrollable
 *  - SettlementCategorySummary: the top summary for 전체 / one category
 * Data comes from core/settlement-category.js. Styling: ./v2/settlement-category.css on the
 * existing tokens and the existing settlement-metric-* cards.
 */
import './v2/settlement-category.css';
import { SETTLEMENT_CATEGORY_ALL, formatSettlementShare } from '../core/settlement-category.js';

const wonText = amount => `${Math.abs(Number(amount) || 0).toLocaleString()}원`;

function Chevron() {
  const React = window.React;
  return React.createElement('svg', {
    className: 'settle-cat-row-chevron', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  }, React.createElement('path', { d: 'm9 6 6 6-6 6' }));
}

export function SettlementCategoryBarRow({ row, grandTotal, badge, onOpen }) {
  const React = window.React;
  const { category, total, count } = row;
  const width = grandTotal ? Math.max(4, (total / grandTotal) * 100) : 0;
  return React.createElement('button', {
    type: 'button',
    className: 'settle-cat-row',
    style: { '--settle-cat-color': category.color },
    onClick: () => onOpen(category.id),
    'aria-label': `${category.name} ${wonText(total)}, ${count}건 · 카테고리별보기에서 보기`,
  },
  badge,
  React.createElement('span', { className: 'settle-cat-track', 'aria-hidden': true },
    React.createElement('span', { className: 'settle-cat-fill', style: { width: `${width}%` } })),
  React.createElement('strong', { className: 'settle-cat-row-amount' }, wonText(total)),
  React.createElement(Chevron));
}

export function SettlementCategoryChips({ totals, selected, onSelect }) {
  const React = window.React;
  const chip = (id, label, color, count) => {
    const active = selected === id;
    return React.createElement('button', {
      key: id,
      type: 'button',
      className: `settle-cat-chip${active ? ' is-active' : ''}${id === SETTLEMENT_CATEGORY_ALL ? ' is-all' : ''}`,
      style: color ? { '--settle-cat-color': color } : undefined,
      'aria-pressed': active,
      onClick: () => onSelect(id),
    },
    color ? React.createElement('span', { className: 'settle-cat-chip-dot', 'aria-hidden': true }) : null,
    React.createElement('span', { className: 'settle-cat-chip-label' }, label),
    count != null ? React.createElement('span', { className: 'settle-cat-chip-count' }, count) : null);
  };
  return React.createElement('div', { className: 'settle-cat-chips', role: 'group', 'aria-label': '카테고리 선택' },
    chip(SETTLEMENT_CATEGORY_ALL, '전체', null, null),
    (totals || []).map(row => chip(row.category.id, row.category.name, row.category.color, row.count)));
}

function MetricCard({ label, value, color, children }) {
  const React = window.React;
  return React.createElement('div', { className: 'settlement-metric-card settle-cat-metric' },
    React.createElement('div', { className: 'settlement-metric-card-label' }, label),
    React.createElement('div', { className: 'settlement-metric-card-value', style: color ? { color } : undefined }, value),
    children || null);
}

export function SettlementCategorySummary({ view, onSelect }) {
  const React = window.React;
  const { summary, totals, grandTotal } = view;
  if (summary.category) {
    const color = summary.category.color;
    return React.createElement('div', { className: 'settlement-metric-grid settle-cat-summary', style: { '--settle-cat-color': color } },
      React.createElement(MetricCard, { label: `${summary.category.name} 지출`, value: wonText(summary.total), color }),
      React.createElement(MetricCard, { label: '건수', value: `${summary.count.toLocaleString()}건` }),
      React.createElement(MetricCard, { label: '전체 지출 중', value: formatSettlementShare(summary.share) },
        React.createElement('span', {
          className: 'settle-cat-share', role: 'img',
          'aria-label': `전체 지출 ${wonText(grandTotal)} 중 ${formatSettlementShare(summary.share)}`,
        }, React.createElement('span', { className: 'settle-cat-share-fill', style: { width: `${Math.max(2, summary.share * 100)}%` } }))));
  }
  return React.createElement('div', { className: 'settle-cat-overview' },
    React.createElement('div', { className: 'settlement-metric-grid settle-cat-summary' },
      React.createElement(MetricCard, { label: '총 지출', value: wonText(summary.total), color: '#DC2626' }),
      React.createElement(MetricCard, { label: '건수', value: `${summary.count.toLocaleString()}건` }),
      React.createElement(MetricCard, { label: '카테고리', value: `${totals.length}개` })),
    totals.length > 0 && React.createElement('div', { className: 'settle-cat-breakdown' },
      React.createElement('div', { className: 'settle-cat-stack', role: 'img', 'aria-label': totals.map(r => `${r.category.name} ${formatSettlementShare(grandTotal ? r.total / grandTotal : 0)}`).join(', ') },
        totals.map(row => React.createElement('span', {
          key: row.category.id,
          className: 'settle-cat-stack-seg',
          style: { width: `${grandTotal ? (row.total / grandTotal) * 100 : 0}%`, background: row.category.color },
        }))),
      React.createElement('div', { className: 'settle-cat-legend' },
        totals.map(row => React.createElement('button', {
          key: row.category.id,
          type: 'button',
          className: 'settle-cat-legend-item',
          style: { '--settle-cat-color': row.category.color },
          onClick: () => onSelect(row.category.id),
          'aria-label': `${row.category.name} ${wonText(row.total)}, ${formatSettlementShare(grandTotal ? row.total / grandTotal : 0)} · 이 카테고리 보기`,
        },
        React.createElement('span', { className: 'settle-cat-chip-dot', 'aria-hidden': true }),
        React.createElement('span', { className: 'settle-cat-legend-name' }, row.category.name),
        React.createElement('span', { className: 'settle-cat-legend-pct' }, formatSettlementShare(grandTotal ? row.total / grandTotal : 0)),
        React.createElement('strong', { className: 'settle-cat-legend-amount' }, wonText(row.total)))))));
}
