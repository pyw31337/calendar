import { diffDaysFromSeoulToday } from '../core/seoul-date.js';
/**
 * One date title for the popups that open on a single day (날씨 상세, 일정 상세):
 *   [내일] 26.10.03 (토) [개천절]
 * - The leading badge is shown only for 어제/오늘/내일/모레; any other day would just repeat the date.
 * - On a confirmed meeting day the "10.03 (토)" part is the brand colour (green when every
 *   participant is free, in the 일정 popup).
 * - Holiday names sit in a red badge on the right and shrink with an ellipsis when space runs out.
 */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const RELATIVE_LABELS = { '-1': '어제', 0: '오늘', 1: '내일', 2: '모레' };

function parseDateStr(dateStr) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || ''));
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : { date, year: match[1], month: match[2], day: match[3] };
}

/** '어제' | '오늘' | '내일' | '모레' | '' */
export function relativeDayLabel(dateStr, now = new Date()) {
  const parsed = parseDateStr(dateStr);
  if (!parsed) return '';
  const diff = diffDaysFromSeoulToday(dateStr, now);
  if (diff == null) return '';
  return RELATIVE_LABELS[String(diff)] || '';
}

/** { year: '26.', rest: '10.03 (토)' }, or null for an invalid date. */
export function shortDateTitleParts(dateStr) {
  const parsed = parseDateStr(dateStr);
  if (!parsed) return null;
  return { year: `${parsed.year.slice(2)}.`, rest: `${parsed.month}.${parsed.day} (${WEEKDAYS[parsed.date.getDay()]})` };
}

export function DateTitle({ dateStr, isConfirmed = false, isAllAvailable = false, holidayText = '', now, className = '' }) {
  const React = window.React;
  const parts = shortDateTitleParts(dateStr);
  const relative = relativeDayLabel(dateStr, now || new Date());
  return React.createElement('span', { className: `v2-date-title${className ? ` ${className}` : ''}` },
    relative ? React.createElement('span', { className: 'v2-date-title-rel' }, relative) : null,
    React.createElement('strong', { className: 'v2-date-title-date' },
      parts
        ? React.createElement(React.Fragment, null,
            React.createElement('span', { className: 'v2-date-title-year' }, parts.year),
            React.createElement('span', { className: `v2-date-title-md${isConfirmed ? ' is-confirmed' : (isAllAvailable ? ' is-all-available' : '')}` }, parts.rest))
        : String(dateStr || '')),
    holidayText ? React.createElement('span', { className: 'v2-date-title-holiday holiday-tag', title: holidayText }, holidayText) : null
  );
}
