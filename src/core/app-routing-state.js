import { routeSearchParams, displayAddress } from './app-address.js';

export function getInitialAppView(locationLike, parseSharePath) {
  const share = typeof parseSharePath === 'function' ? parseSharePath(locationLike?.pathname) : null;
  if (share?.view && share.view !== 'calendar') return share.view;
  // /app/<id>/<page>/ carries the page in its path (app-address.js).
  const params = routeSearchParams(locationLike);
  // The V2 shell maps tab/sub onto the existing data views.
  if (params.has('tab')) {
    const tab = params.get('tab');
    // First-class destinations (post shell-structure upgrade).
    if (tab === 'memo' || tab === 'places' || tab === 'chat' || tab === 'settlement') return tab;
    if (tab === 'records') {
      return ({ memo: 'memo', places: 'places', media: 'gallery', archive: 'history', content: 'content' })[params.get('sub')] || 'calendar';
    }
    return 'calendar';
  }
  return params.get('view') || 'calendar';
}

// Returns the address to show (app-address.js displayAddress): on /app/<id>/ that is the
// page's short path, e.g. /calendar/app/cw/content/.
export function buildAppViewUrl(locationLike, view, currentMonthDate) {
  const params = new URLSearchParams(locationLike?.search || '');
  // `/app/<id>/` and `/share/<id>/` are canonical calendar-scoped URLs. Keeping an
  // old `?id=` here would let a normal tab switch recreate a conflicting identity.
  const isScopedCalendarPath = /\/(?:app|share)\/[A-Za-z0-9_-]+(?:\/|$)/.test(locationLike?.pathname || '');
  const keepId = isScopedCalendarPath ? '' : (params.get('id') || params.get('cal'));
  // Notification and search deep links (?msg=&memo=&comment=) must survive the
  // view switch that opens them. Leaving the destination drops them.
  const keepMsg = view === 'chat' ? params.get('msg') : null;
  // Chat deep links use img as a numeric message image index; gallery photo-comment pushes use
  // img as an assetKey. Do not carry a gallery assetKey into chat (Number(assetKey)||0 => 0).
  const rawImg = params.get('img');
  const keepImg = view === 'gallery'
    ? rawImg
    : (view === 'chat' && rawImg != null && /^\d+$/.test(rawImg) ? rawImg : null);
  const keepMemo = view === 'memo' ? params.get('memo') : null;
  const keepMemoFocus = view === 'memo' ? params.get('memoFocus') : null;
  const keepComment = view === 'memo' ? params.get('comment') : null;
  ['id', 'cal', 'date', 'msg', 'img', 'memo', 'memoFocus', 'comment', 'place'].forEach(key => params.delete(key));
  if (keepId) params.set('id', keepId);
  if (keepMsg) params.set('msg', keepMsg);
  if (keepImg) params.set('img', keepImg);
  if (keepMemo) params.set('memo', keepMemo);
  if (keepMemoFocus) params.set('memoFocus', keepMemoFocus);
  if (keepComment) params.set('comment', keepComment);
  if (currentMonthDate instanceof Date && !Number.isNaN(currentMonthDate.getTime())) {
    params.set('year', String(currentMonthDate.getFullYear()));
    params.set('month', String(currentMonthDate.getMonth() + 1).padStart(2, '0'));
  } else {
    params.delete('year');
    params.delete('month');
  }
  if (view === 'calendar') params.delete('view'); else params.set('view', view);
  {
    // First-class: memo/places/chat/settlement use ?tab=<dest> (no records sub).
    // Gallery/history/content remain under records + sub.
    const recordsSub = { gallery: 'media', history: 'archive', content: 'content' }[view];
    if (view === 'memo' || view === 'places' || view === 'chat' || view === 'settlement') {
      params.delete('sub');
      params.set('tab', view);
    } else if (recordsSub) {
      params.set('tab', 'records');
      params.set('sub', recordsSub);
    } else {
      params.delete('sub');
      // tab=calendar tells displayAddress to leave a /<page>/ path; it never reaches the address.
      params.set('tab', view === 'calendar' ? 'calendar' : view);
    }
  }
  return displayAddress({ pathname: locationLike?.pathname || '/', search: `?${params.toString()}` });
}

// The current address with the calendar month changed (app-address.js keeps it short:
// ?month=2026-11 on the calendar page only). null for an invalid date.
export function buildMonthUrl(locationLike, nextDate) {
  if (!(nextDate instanceof Date) || Number.isNaN(nextDate.getTime())) return null;
  const params = new URLSearchParams(locationLike?.search || '');
  // A /share/<id>/ path is the calendar identity too: never put a stale ?id= back beside it.
  if (/\/share\/[A-Za-z0-9_-]+(?:\/|$)/.test(locationLike?.pathname || '')) ['id', 'cal'].forEach(key => params.delete(key));
  params.set('year', String(nextDate.getFullYear()));
  params.set('month', String(nextDate.getMonth() + 1).padStart(2, '0'));
  return displayAddress({ pathname: locationLike?.pathname || '/', search: `?${params}` });
}
