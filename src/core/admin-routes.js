/* P6-2 copy of admin route helpers from app-main.js
 * Live app still uses assets/app-main.js. Do not delete the originals yet.
 */
function isAdminDashboardRoute() {
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1' || params.get('mode') === 'admin';
}

function isAdminRestoreRoute() {
  const params = new URLSearchParams(window.location.search);
  return isAdminDashboardRoute() && params.get('restore') === '1';
}

function getAdminSelectedCalendarIdFromUrl(fallback = 'kkot') {
  if (!isAdminDashboardRoute()) return fallback;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || '';
  return isValidCalendarId(id) ? id : fallback;
}

function getAdminSearchQueryFromUrl() {
  if (!isAdminDashboardRoute()) return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('search') || null;
}

function getAdminSearchFilterFromUrl() {
  if (!isAdminDashboardRoute()) return { calFilter: 'all', dateStart: '', dateEnd: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    calFilter: params.get('cal') || 'all',
    dateStart: params.get('from') || '',
    dateEnd: params.get('to') || ''
  };
}
