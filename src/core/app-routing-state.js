export function getInitialAppView(locationLike, parseSharePath) {
  const share = typeof parseSharePath === 'function' ? parseSharePath(locationLike?.pathname) : null;
  if (share?.view && share.view !== 'calendar') return share.view;
  const params = new URLSearchParams(locationLike?.search || '');
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

export function buildAppViewUrl(locationLike, view, currentMonthDate) {
  const params = new URLSearchParams(locationLike?.search || '');
  const keepId = params.get('id') || params.get('cal');
  // Notification and search deep links (?msg=&memo=&comment=) must survive the
  // view switch that opens them. Leaving the destination drops them.
  const keepMsg = view === 'chat' ? params.get('msg') : null;
  const keepImg = view === 'chat' ? params.get('img') : null;
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
      if (view === 'calendar') params.delete('tab');
      else params.set('tab', view);
    }
  }
  const query = params.toString();
  const pathname = locationLike?.pathname || '/';
  return query ? `${pathname}?${query}` : pathname;
}
