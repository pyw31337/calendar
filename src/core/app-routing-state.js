export function getInitialAppView(locationLike, parseSharePath) {
  const share = typeof parseSharePath === 'function' ? parseSharePath(locationLike?.pathname) : null;
  if (share?.view && share.view !== 'calendar') return share.view;
  return new URLSearchParams(locationLike?.search || '').get('view') || 'calendar';
}

export function buildAppViewUrl(locationLike, view, currentMonthDate) {
  const params = new URLSearchParams(locationLike?.search || '');
  const keepId = params.get('id') || params.get('cal');
  ['id', 'cal', 'date', 'msg', 'img', 'memo', 'place'].forEach(key => params.delete(key));
  if (keepId) params.set('id', keepId);
  if (currentMonthDate instanceof Date && !Number.isNaN(currentMonthDate.getTime())) {
    params.set('year', String(currentMonthDate.getFullYear()));
    params.set('month', String(currentMonthDate.getMonth() + 1).padStart(2, '0'));
  } else {
    params.delete('year');
    params.delete('month');
  }
  if (view === 'calendar') params.delete('view'); else params.set('view', view);
  const query = params.toString();
  const pathname = locationLike?.pathname || '/';
  return query ? `${pathname}?${query}` : pathname;
}
