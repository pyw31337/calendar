import { getCulturePosterBadge } from './culture-poster-badge.js';

export const CULTURE_EVENT_STATUS_FILTERS = Object.freeze({
  ongoing: '행사중',
  thisWeek: '이번주',
});

// 기본 목록은 모든 행사를 한 번의 탭 방문 동안 안정적으로 섞는다. 포스터 상태 뱃지를
// 선택했을 때에만 그 상태와 일치하는 카드로 범위를 좁힌다. 따라서 "행사중"이 많은 날에도
// 기본 그리드가 한 상태에 쏠리지 않고, 페이지네이션/재렌더링 중에는 순서가 흔들리지 않는다.
export function orderCultureEventItems(items, { today, seed = 0, statusFilter = '' } = {}) {
  const statusLabel = CULTURE_EVENT_STATUS_FILTERS[statusFilter] || '';
  const candidates = statusLabel
    ? (items || []).filter(item => getCulturePosterBadge(item, { today, isOngoingKind: true })?.label === statusLabel)
    : [...(items || [])];

  const rank = item => {
    let hash = (seed ^ 0x9e3779b9) >>> 0;
    const key = String(item && (item.id || item.title) || '');
    for (let index = 0; index < key.length; index += 1) {
      hash = Math.imul(hash ^ key.charCodeAt(index), 16777619) >>> 0;
    }
    return hash;
  };
  return candidates
    .map((item, index) => ({ item, index, rank: rank(item) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(entry => entry.item);
}
