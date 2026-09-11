/**
 * docs/app-main-split-units.md U3: keyword-highlight and cross-surface search helpers.
 * highlightTextWithYellowMarker/highlightKeyword are byte-identical copies used by two
 * different call sites in app-main.js (one for the culture/place highlight path, one for
 * GlobalSearchModal/AdminUnifiedSearchResultsView) -- kept as two functions rather than merged,
 * matching how they were already duplicated before this split.
 */
import {
  getExpenseCategories,
  isExpenseIncomeEntry,
  getAppBaseUrl,
  getActiveParticipants,
  getActiveAvailabilities,
  getMessageImageEntries,
  getMessageDirectMediaEntry
} from './app-domain-helpers.js';

export function highlightTextWithYellowMarker(text, keyword) {
  const React = window.React;
  if (!text) return '';
  if (!keyword) return text;
  const cleanKeyword = keyword.trim().toLowerCase();
  if (!cleanKeyword) return text;

  const parts = [];
  let remaining = text;
  const lowerRemaining = () => remaining.toLowerCase();

  while (remaining) {
    const idx = lowerRemaining().indexOf(cleanKeyword);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }
    const matchText = remaining.substring(idx, idx + cleanKeyword.length);
    parts.push(
      React.createElement("mark", {
        key: remaining.length + idx,
        style: { backgroundColor: '#FEF08A', color: '#1E293B', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }
      }, matchText)
    );
    remaining = remaining.substring(idx + cleanKeyword.length);
  }
  return React.createElement(React.Fragment, null, ...parts);
}

// Wraps every case-insensitive match of `keyword` inside `text` in a <mark>. Shared by
// GlobalSearchModal (single-calendar) and AdminUnifiedSearchResultsView (cross-calendar).
export function highlightKeyword(text, keyword) {
  const React = window.React;
  if (!text) return '';
  if (!keyword) return text;
  const cleanKeyword = keyword.trim().toLowerCase();
  if (!cleanKeyword) return text;

  const parts = [];
  let remaining = text;
  const lowerRemaining = () => remaining.toLowerCase();

  while (remaining) {
    const idx = lowerRemaining().indexOf(cleanKeyword);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }
    const matchText = remaining.substring(idx, idx + cleanKeyword.length);
    parts.push(
      React.createElement("mark", {
        key: remaining.length,
        style: { backgroundColor: '#FEF08A', color: '#1E293B', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }
      }, matchText)
    );
    remaining = remaining.substring(idx + cleanKeyword.length);
  }
  return React.createElement(React.Fragment, null, ...parts);
}

// Formats a timestamp the same way the admin 로그 tab does, so every search result row (and the
// admin chat log itself) reads identically: "8/13 오후 2:05:31" style, ko-KR locale.
export function formatLogTimestamp(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// One keyword-search pass over a single calendar's 일정/채팅/태그/정산/메모 data. Shared by
// GlobalSearchModal (single active calendar) and AdminUnifiedSearchResultsView (looped across
// every calendar) so the two search surfaces can never drift out of sync on matching rules.
export function computeCalendarSearchMatches(cal, chatMessages, memoList, q, limit = Infinity) {
  if (!cal || !q) return { schedules: [], chat: [], photos: [], places: [], expenses: [], memos: [] };
  const take = items => Number.isFinite(limit) ? items.slice(0, limit) : items;
  const participantsMap = getActiveParticipants(cal).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
  const expenseCategoriesMap = getExpenseCategories(cal).reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const schedules = take(getActiveAvailabilities(cal)
    .filter(item => (item.note || '').toLowerCase().includes(q) || (participantsMap[item.participantId]?.name || '').toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date)))
    .map(item => ({ ...item, participantName: participantsMap[item.participantId]?.name || '알수없음', participantColor: participantsMap[item.participantId]?.color || '#94A3B8' }));

  const chat = take((chatMessages || [])
    .filter(msg => (msg.text || '').toLowerCase().includes(q))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    )
    .map(msg => ({ ...msg, participantName: participantsMap[msg.participantId]?.name || '알수없음', participantColor: participantsMap[msg.participantId]?.color || '#94A3B8' }));

  const photos = [];
  (cal.confirmedMeeting || []).forEach(meeting => {
    (meeting.photos || []).forEach(photo => {
      if ((photo.tags || '').toLowerCase().includes(q) || (meeting.date || '').toLowerCase().includes(q)) {
        photos.push({ ...photo, date: meeting.date });
      }
    });
  });

  const getCalendarPlaces = typeof window !== 'undefined' && window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.getCalendarPlaces ? window.GATHER_APP_UTILS.getCalendarPlaces : (() => []);
  const places = take((getCalendarPlaces(cal) || [])
    .filter(place => (place.name || '').toLowerCase().includes(q) || (place.alias || '').toLowerCase().includes(q) || (place.address || '').toLowerCase().includes(q) || (place.memo || '').toLowerCase().includes(q))
    );

  const tags = [];
  (chatMessages || []).forEach(msg => {
    const directEntry = getMessageDirectMediaEntry(msg);
    const imageEntries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
    imageEntries.forEach(entry => {
      if ((entry.tags || '').toLowerCase().includes(q)) {
        tags.push({ ...entry, participantName: participantsMap[msg.participantId]?.name || '알수없음', participantColor: participantsMap[msg.participantId]?.color || '#94A3B8' });
      }
    });
  });
  tags.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const expenses = [];
  (cal.confirmedMeeting || []).forEach(meeting => {
    (meeting.expenses || []).forEach(exp => {
      const isIncome = isExpenseIncomeEntry(exp);
      const category = expenseCategoriesMap[exp.categoryId];
      const categoryName = isIncome ? '수입' : (category?.name || '기타');
      const categoryColor = isIncome ? '#16A34A' : (category?.color || '#94A3B8');
      if ((exp.label || '').toLowerCase().includes(q) || (exp.url || '').toLowerCase().includes(q) || categoryName.toLowerCase().includes(q)) {
        expenses.push({ ...exp, date: meeting.date, categoryName, categoryColor });
      }
    });
  });
  expenses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const memos = take((memoList || [])
    .filter(memo => (memo.title || '').toLowerCase().includes(q) || (memo.text || '').toLowerCase().includes(q) || (memo.tags || []).some(t => (t || '').toLowerCase().includes(q)))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    )
    .map(memo => ({ ...memo, participantName: participantsMap[memo.participantId]?.name || '알수없음', participantColor: participantsMap[memo.participantId]?.color || '#94A3B8' }));

  return { schedules, chat, photos: take(photos), places, tags: take(tags), expenses: take(expenses), memos };
}

// Builds the citizen-facing calendar URL that actually shows a given search result's real
// content, so a click can open it in a new tab instead of just linking back to admin state.
// Mirrors the deep-link params App reads on load (date / view=chat&msg=&img= / view=memo).
export function getAdminSearchResultTargetUrl(type, item) {
  const params = new URLSearchParams({ id: item.calendarId });
  if (type === 'schedules' || type === 'expenses') {
    params.set('date', item.date);
  } else if (type === 'chat') {
    params.set('view', 'chat');
    params.set('msg', item.id);
  } else if (type === 'tags') {
    params.set('view', 'chat');
    params.set('msg', item.messageId);
    params.set('img', String(item.imageIndex));
  } else if (type === 'memos') {
    params.set('view', 'memo');
  }
  return `${getAppBaseUrl()}?${params.toString()}`;
}
