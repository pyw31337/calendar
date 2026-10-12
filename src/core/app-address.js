/**
 * One rule for the address bar. A calendar is identified only by its path, and each page has a
 * short, readable path of its own, so a refresh reopens the same page:
 *
 *   /calendar/app/cw/                  캘린더 (another month: ?month=2026-11)
 *   /calendar/app/cw/chat/             채팅 (deep links keep ?msg= etc.)
 *   /calendar/app/cw/content/          컨텐츠
 *
 * Never shown: ?id= / ?cal= on an app path (another calendar's id must not appear in, or be
 * guessable from, this calendar's address), ?shell= (the V1/V2 switch is gone) and ?_update=
 * (the new-version reload's cache buster), plus tab/sub/view, which the path now carries.
 *
 * The app still reads and writes pages as ?tab=&sub= internally:
 * - writes: installCanonicalAddress() wraps history.pushState/replaceState with toDisplayUrl().
 * - reads: routeSearchParams(location) turns the path's page back into tab/sub.
 * The build publishes app/<id>/<page>/index.html for every APP_PAGE_SLUGS entry
 * (scripts/copy-static-to-dist.mjs), so these paths load directly on GitHub Pages.
 */

const PAGES = [
  { page: 'chat', tab: 'chat' },
  { page: 'settlement', tab: 'settlement' },
  { page: 'memo', tab: 'memo' },
  { page: 'places', tab: 'places' },
  { page: 'gallery', tab: 'records', sub: 'media' },
  { page: 'content', tab: 'records', sub: 'content' },
  { page: 'archive', tab: 'records', sub: 'archive' },
  { page: 'search', tab: 'search' },
  { page: 'more', tab: 'more' },
];
const VIEW_PAGES = {
  calendar: 'calendar', chat: 'chat', settlement: 'settlement', memo: 'memo', places: 'places',
  gallery: 'gallery', history: 'archive', content: 'content',
};

export const APP_PAGE_SLUGS = Object.freeze(PAGES.map(item => item.page));

const APP_PATH_RE = /^(.*?\/)app\/([A-Za-z0-9_-]+)(?:\/([a-z]+))?\/?$/;
const CALENDAR_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

/** `{ prefix, calendarId, page }` for /…/app/<id>/[<page>/], else null. */
export function parseAppPath(pathname) {
  const match = String(pathname || '').match(APP_PATH_RE);
  if (!match) return null;
  const slug = match[3] || '';
  if (slug && !APP_PAGE_SLUGS.includes(slug)) return null;
  return { prefix: match[1], calendarId: match[2], page: slug || 'calendar' };
}

/**
 * The page named by tab/sub/view: a page id, 'calendar', '' when the query names no page, or
 * null for a view this table does not know (that query is then left as it is).
 */
export function pageFromParams(params) {
  const tab = params.get('tab');
  if (tab) {
    if (tab === 'records') {
      const sub = params.get('sub');
      if (sub === 'memo' || sub === 'places') return sub;
      const hit = PAGES.find(item => item.tab === 'records' && item.sub === sub);
      // The bare records hub is no destination any more; the shell shows the calendar for it.
      return hit ? hit.page : 'calendar';
    }
    const hit = PAGES.find(item => item.tab === tab && !item.sub);
    return hit ? hit.page : 'calendar';
  }
  const view = params.get('view');
  if (view) return VIEW_PAGES[view] || null;
  return '';
}

function readMonthParam(params) {
  const raw = String(params.get('month') || '');
  let year;
  let month;
  const compact = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (compact) {
    year = Number(compact[1]);
    month = Number(compact[2]);
  } else {
    year = Number(params.get('year'));
    month = Number(raw);
    if (year > 0 && year < 100) year += 2000;
  }
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
  if (year < 2000 || year > 2099 || month < 1 || month > 12) return null;
  return { year, month };
}

/** The calendar month in the address (?month=2026-11, or the older ?year=2026&month=11). */
export function readAddressMonth(locationLike) {
  return readMonthParam(new URLSearchParams(locationLike?.search || ''));
}

/** Query params with the path's page restored as tab/sub, for code that routes on them. */
export function routeSearchParams(locationLike) {
  const params = new URLSearchParams(locationLike?.search || '');
  const app = parseAppPath(locationLike?.pathname);
  if (app && app.page !== 'calendar' && !params.has('tab') && !params.has('view')) {
    const page = PAGES.find(item => item.page === app.page);
    params.set('tab', page.tab);
    if (page.sub) params.set('sub', page.sub);
  }
  return params;
}

/**
 * The address to show for an app URL given as `{ pathname, search, hash }`. On an app path the
 * calendar comes from the path, unless the URL deliberately names a different calendar with
 * ?id= (a calendar switch), which then moves into the path; the page comes from tab/sub/view
 * when given (tab=calendar means the calendar), else it stays the path's page. Admin URLs and
 * non-app paths only lose ?shell=/?_update= (and the internal tab=calendar marker).
 */
export function displayAddress({ pathname = '/', search = '', hash = '' } = {}, { now = new Date() } = {}) {
  const params = new URLSearchParams(search);
  params.delete('shell');
  params.delete('_update');
  const app = parseAppPath(pathname);
  const isAdmin = params.get('admin') === '1' || params.get('mode') === 'admin';
  const named = app && !isAdmin ? pageFromParams(params) : '';
  let path = pathname;
  if (!app || isAdmin || named === null) {
    if (params.get('tab') === 'calendar') {
      params.delete('tab');
      params.delete('sub');
    }
  } else {
    const page = named || app.page;
    const queryId = params.get('id') || params.get('cal') || '';
    const calendarId = CALENDAR_ID_RE.test(queryId) ? queryId : app.calendarId;
    ['tab', 'sub', 'view', 'id', 'cal'].forEach(key => params.delete(key));
    const month = readMonthParam(params);
    params.delete('year');
    params.delete('month');
    const isThisMonth = month && month.year === now.getFullYear() && month.month === now.getMonth() + 1;
    if (page === 'calendar' && month && !isThisMonth) {
      params.set('month', `${month.year}-${String(month.month).padStart(2, '0')}`);
    }
    path = `${app.prefix}app/${calendarId}/${page === 'calendar' ? '' : `${page}/`}`;
  }
  const query = params.toString();
  return `${path}${query ? `?${query}` : ''}${hash || ''}`;
}

/** displayAddress() for a URL string (absolute or relative to `baseHref`); other origins pass through. */
export function toDisplayUrl(input, baseHref, options) {
  const url = new URL(String(input), String(baseHref));
  if (url.origin !== new URL(String(baseHref)).origin) return String(input);
  return displayAddress(url, options);
}

/**
 * Makes every history write show the short address, and tidies the current one (an old
 * bookmark's ?shell=v2&id=…&tab=records&sub=content becomes /app/<id>/content/). Idempotent.
 */
export function installCanonicalAddress(win = typeof window !== 'undefined' ? window : null) {
  const history = win && win.history;
  if (!history || history.__gatherCanonicalAddress) return;
  const wrap = original => function canonicalHistoryWrite(state, title, url) {
    if (url === undefined || url === null) return original.call(this, state, title);
    let next = url;
    try { next = toDisplayUrl(url instanceof URL ? url.href : String(url), win.location.href); } catch (_) { /* keep the given url */ }
    return original.call(this, state, title, next);
  };
  history.pushState = wrap(history.pushState);
  history.replaceState = wrap(history.replaceState);
  history.__gatherCanonicalAddress = true;
  try { history.replaceState(history.state, '', win.location.href); } catch (_) { /* best-effort */ }
}

/** The address for the same page in another calendar, or null off an app path. Item links
 * (?msg=, ?memo=, ...) belong to the previous calendar and are dropped. */
export function calendarSwitchAddress(calendarId, locationLike) {
  const app = parseAppPath(locationLike?.pathname);
  if (!app || !CALENDAR_ID_RE.test(String(calendarId || ''))) return null;
  const route = routeSearchParams(locationLike);
  const params = new URLSearchParams({ id: calendarId });
  ['tab', 'sub'].forEach(key => { if (route.get(key)) params.set(key, route.get(key)); });
  return displayAddress({ pathname: locationLike.pathname, search: `?${params}` });
}

/** Opens an app page the way a tab tap does (history entry + popstate for the listeners). */
export function pushAppPage(tab, sub = '', win = window) {
  const url = new URL(win.location.href);
  url.searchParams.set('tab', tab);
  if (sub) url.searchParams.set('sub', sub); else url.searchParams.delete('sub');
  win.history.pushState(win.history.state, '', toDisplayUrl(url.href, win.location.href));
  win.dispatchEvent(new PopStateEvent('popstate'));
}

/** A content card shared as #gatherContent=<base64 JSON> (컨텐츠 상세 "공유"), else null. */
export function readSharedContentFromHash(hash) {
  try {
    const marker = '#gatherContent=';
    const idx = String(hash || '').indexOf(marker);
    if (idx === -1) return null;
    const json = decodeURIComponent(escape(atob(String(hash).slice(idx + marker.length))));
    const payload = JSON.parse(json);
    if (!payload || payload.kind !== 'gather-content' || !payload.item || !payload.item.title) return null;
    return payload.item;
  } catch (_) { return null; }
}
