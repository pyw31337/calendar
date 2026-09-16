export function getInitialAppView(locationLike, parseSharePath) {
  const share = typeof parseSharePath === 'function' ? parseSharePath(locationLike?.pathname) : null;
  if (share?.view && share.view !== 'calendar') return share.view;
  const params = new URLSearchParams(locationLike?.search || '');
  // Opt-in V2 shell maps tab/sub onto the existing data views without changing default routes.
  if (params.get('shell') === 'v2' && params.has('tab')) {
    const tab = params.get('tab');
    if (tab === 'records') {
      return ({ memo: 'memo', places: 'places', media: 'gallery', archive: 'history', content: 'content' })[params.get('sub')] || 'calendar';
    }
    return ['chat', 'settlement'].includes(tab) ? tab : 'calendar';
  }
  return params.get('view') || 'calendar';
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
  if (params.get('shell') === 'v2') {
    const sub = { memo: 'memo', places: 'places', gallery: 'media', history: 'archive', content: 'content' }[view];
    if (sub) {
      params.set('tab', 'records');
      params.set('sub', sub);
    } else {
      params.delete('sub');
      if (view === 'calendar') params.delete('tab');
      else params.set('tab', view);
    }
  }
  const query = params.toString();
  const pathname = locationLike?.pathname || '/';
  return query ? `${pathname}?${query}` : pathname;
}
