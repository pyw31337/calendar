import { getCulturePosterBadge } from './culture-poster-badge.js';

// 문화행사는 상태가 가장 중요한 탐색 단서다. 행사중과 이번주 시작 행사를 먼저 보이게
// 하고, 나머지는 한 번의 탭 방문 동안에는 순서가 흔들리지 않는 결정적 셔플을 사용한다.
// 따라서 페이지네이션/필터 재렌더링에서도 카드가 중복되거나 건너뛰지 않는다.
export function orderCultureEventItems(items, { today, seed = 0 } = {}) {
  const ongoing = [];
  const thisWeek = [];
  const rest = [];

  (items || []).forEach(item => {
    const badge = getCulturePosterBadge(item, { today, isOngoingKind: true });
    if (badge?.label === '행사중') ongoing.push(item);
    else if (badge?.label === '이번주') thisWeek.push(item);
    else rest.push(item);
  });

  const rank = item => {
    let hash = (seed ^ 0x9e3779b9) >>> 0;
    const key = String(item && (item.id || item.title) || '');
    for (let index = 0; index < key.length; index += 1) {
      hash = Math.imul(hash ^ key.charCodeAt(index), 16777619) >>> 0;
    }
    return hash;
  };
  const shuffledRest = rest
    .map((item, index) => ({ item, index, rank: rank(item) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(entry => entry.item);

  return ongoing.concat(thisWeek, shuffledRest);
}
