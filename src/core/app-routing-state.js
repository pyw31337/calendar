export function getInitialAppView(locationLike, parseSharePath) {
  const share = typeof parseSharePath === 'function' ? parseSharePath(locationLike?.pathname) : null;
  if (share?.view && share.view !== 'calendar') return share.view;
  const params = new URLSearchParams(locationLike?.search || '');
  // V2 shell (default; `?shell=v1` opts back out) maps tab/sub onto the existing data views.
  if (params.get('shell') !== 'v1' && params.has('tab')) {
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
  if (params.get('shell') !== 'v1') {
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
      if (view === 'calendar') params.delete('tab');
      else params.set('tab', view);
    }
  }
  const query = params.toString();
  const pathname = locationLike?.pathname || '/';
  return query ? `${pathname}?${query}` : pathname;
}
