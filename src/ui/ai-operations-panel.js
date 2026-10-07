import React from 'react';
import { buildAiOperationsInbox } from '../core/ai-operations.js';
import { getCalendarPlaces, doesPlaceMatchDate } from '../core/app-domain-helpers.js';

const cls = value => String(value).split(/\s+/).map(name => `bp-${name}`).join(' ');
const empty = { calendarId: '', items: [], workers: [], loading: true, error: '' };

export function AiOperationsSummary({ calendar, onOpenDate, onChangeView, onOpenGalleryAnalysis }) {
  const calendarId = String(calendar?.id || '');
  const [media, setMedia] = React.useState(empty);
  const [refresh, setRefresh] = React.useState(0);
  const [expanded, setExpanded] = React.useState(false);
  // Scope results even before the effect cleanup runs: another calendar's errors/suggestions
  // must never flash during navigation or become that calendar's actionable tasks.
  const scoped = media.calendarId === calendarId ? media : empty;
  React.useEffect(() => {
    let cancelled = false;
    setExpanded(false);
    setMedia({ ...empty, calendarId });
    const projectId = String(window.__gatherFirebaseConfig?.projectId || '');
    if (!calendarId || !projectId) {
      setMedia({ ...empty, calendarId, loading: false, error: '사진 분석 연결 정보를 확인할 수 없습니다.' });
      return undefined;
    }
    const load = async () => {
      try {
        const { fetchMediaAnalysisFeed, fetchMediaAnalysisWorkerStates } = await import('../core/media-analysis-feed.js');
        const [items, workers] = await Promise.allSettled([
          fetchMediaAnalysisFeed({ calendarId, projectId, limit: 80, summaryOnly: true, force: refresh > 0 }),
          fetchMediaAnalysisWorkerStates({ calendarId, projectId, force: refresh > 0 })
        ]);
        if (!cancelled) setMedia({ calendarId, loading: false,
          items: items.status === 'fulfilled' ? items.value : [],
          workers: workers.status === 'fulfilled' ? workers.value : [],
          error: [items, workers].some(result => result.status === 'rejected') ? '사진 분석 일부를 확인하지 못했습니다. 다시 확인해 주세요.' : '' });
      } catch (_) {
        if (!cancelled) setMedia({ ...empty, calendarId, loading: false, error: '사진 분석을 불러오지 못했습니다.' });
      }
    };
    const id = window.setTimeout(load, refresh ? 0 : 900);
    return () => { cancelled = true; window.clearTimeout(id); };
  }, [calendarId, refresh]);
  const tasks = React.useMemo(() => buildAiOperationsInbox({ calendar,
    mediaAnalysis: scoped.items, workerStates: scoped.workers,
    hasPlaceForDate: date => getCalendarPlaces(calendar).some(place => !place.removedAt && !place.deletedAt && doesPlaceMatchDate(place, date))
  }), [calendar, scoped.items, scoped.workers]);
  const visible = expanded ? tasks : tasks.slice(0, 3);
  const autoCompleted = scoped.items.filter(item => item.automatic?.status === 'applied').length;
  const run = task => {
    const action = task.action || {};
    if (action.type === 'open-gallery-analysis') {
      if (onOpenGalleryAnalysis) onOpenGalleryAnalysis();
      else onChangeView?.('gallery');
    } else if (action.date) onOpenDate?.(action.date, action.type === 'open-settlement' ? 'settlement' : action.tab);
    else if (action.type === 'open-settlement') onChangeView?.('settlement');
  };
  return React.createElement('section', { className: cls('ai-operations-card'), 'aria-label': '운영 우선순위' },
    React.createElement('div', { className: cls('ai-operations-heading') },
      React.createElement('div', null,
        React.createElement('span', { className: cls('ai-operations-kicker') }, '운영 도우미'),
        React.createElement('h2', null, '지금 처리하면 좋은 일'),
        React.createElement('p', null, '일정·정산은 근거를 확인한 뒤 처리합니다. 위치 태그 자동 보완은 별도 활성화 후 새 사진에만 적용됩니다.')
      ),
      React.createElement('span', { className: cls('ai-operations-count'), role: 'status' },
        tasks.length ? `${tasks.length}건` : scoped.loading ? '확인 중' : scoped.error ? '일부 미확인' : '점검 범위 내 없음')
    ),
    React.createElement('div', { className: cls('ai-operations-status'), role: 'status' },
      scoped.error || (scoped.loading ? '사진 분석 상태를 확인하고 있습니다.' : `최근 사진 분석 ${scoped.items.length}건 중 위치 태그 자동 보완 ${autoCompleted}건 · 전체 사진 통계가 아닙니다.`),
      React.createElement('button', { type: 'button', disabled: scoped.loading, onClick: () => setRefresh(value => value + 1) }, '다시 확인')
    ),
    visible.length ? React.createElement('div', { className: cls('ai-operations-list') }, visible.map(task =>
      React.createElement('article', { key: task.id, className: cls(`ai-operations-row is-${task.priority}`) },
        React.createElement('span', { className: cls('ai-operations-priority') }, ['urgent', 'high'].includes(task.priority) ? '우선' : '확인'),
        React.createElement('div', { className: cls('ai-operations-copy') },
          React.createElement('strong', null, task.title), React.createElement('span', null, task.detail),
          React.createElement('small', null, `근거: ${task.evidence.join(' · ')}`)),
        React.createElement('button', { type: 'button', onClick: () => run(task) }, task.action.type === 'open-gallery-analysis' ? '사진 검토' : '열기')
      ))) : React.createElement('p', { className: cls('ai-operations-empty') }, scoped.loading || scoped.error ? '확인된 일정·지출 범위에서는 처리할 항목이 없습니다.' : '점검 범위에서 확인이 필요한 항목이 없습니다.'),
    tasks.length > 3 && React.createElement('button', { className: cls('ai-operations-expand'), type: 'button', 'aria-expanded': expanded, onClick: () => setExpanded(value => !value) }, expanded ? '접기' : `전체 ${tasks.length}건 보기`)
  );
}
