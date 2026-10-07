import { getReservedSettlementItemKeys } from './settlement-card-selection.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function asDateKey(value) {
  const match = String(value || '').match(/^(\d{4}-\d{2}-\d{2})$/);
  if (!match) return '';
  const date = new Date(`${match[1]}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === match[1] ? match[1] : '';
}

function utcDay(key) {
  const valid = asDateKey(key);
  if (!valid) return Number.NaN;
  const [year, month, day] = valid.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function nowDateKey(now) {
  if (typeof now === 'string') return asDateKey(now);
  const date = now instanceof Date ? now : new Date(now || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function meetingRows(calendar) {
  const candidates = [calendar?.confirmedMeeting, calendar?.meetings, calendar?.events]
    .flatMap(value => Array.isArray(value) ? value : [value]);
  const seen = new Set();
  return candidates.filter(row => {
    const date = asDateKey(row?.date || row?.targetDate || row?.id);
    if (!date || row?.deletedAt || row?.removedAt || row?.isDeleted || seen.has(date)) return false;
    seen.add(date);
    return true;
  });
}

function activeRows(value) {
  return (Array.isArray(value) ? value : []).filter(row => row && !row.deletedAt && !row.removedAt && !row.isDeleted);
}

function meetingTitle(meeting) {
  return String(meeting?.title || meeting?.name || meeting?.note || meeting?.label || '일정').trim() || '일정';
}

function hasInlinePlace(meeting) {
  return ['place', 'placeName', 'location', 'address', 'venue']
    .some(key => String(meeting?.[key] || '').trim().length > 0);
}

function expenseItemKey(date, expense, index) {
  return `${date}_${expense?.id || index}_${expense?.amount || 0}`;
}

function isSharedExpense(expense) {
  const amount = Number(expense?.amount || 0);
  return !expense?.deletedAt && !expense?.removedAt && !expense?.isDeleted && !expense?.isSelfPay
    && !['income', 'carryover'].includes(expense?.type) && !expense?.isCarryover
    && Number.isFinite(amount) && amount > 0;
}

function asTask({ id, priority, kind, title, detail, action, evidence = [], requiresReview = true }) {
  return { id, priority, kind, title, detail, action, evidence, requiresReview };
}

const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };

/**
 * Produces only evidence-backed operational suggestions.  It never modifies a calendar, sends
 * a message, or calls a model.  Every action stays user-confirmed in the appropriate existing
 * screen, which is crucial for shared family schedules and money records.
 */
export function buildAiOperationsInbox({ calendar = {}, today, now = Date.now(), mediaAnalysis = [], workerStates = [], hasPlaceForDate } = {}) {
  const referenceDate = nowDateKey(today || now);
  const referenceDay = utcDay(referenceDate);
  if (!referenceDate || Number.isNaN(referenceDay)) return [];

  const tasks = [];
  const participants = activeRows(calendar.participants);
  const participantIds = new Set(participants.map(person => String(typeof person === 'string' ? person : person.id || person.name || '').trim()).filter(Boolean));
  const availabilityByDate = new Map();
  activeRows(calendar.availabilities).forEach(row => {
    const date = asDateKey(row?.date);
    const personId = String(row?.participantId || row?.participant || row?.name || '').trim();
    if (!date || !personId) return;
    if (!availabilityByDate.has(date)) availabilityByDate.set(date, new Set());
    availabilityByDate.get(date).add(personId);
  });

  const placeMatcher = typeof hasPlaceForDate === 'function' ? hasPlaceForDate : () => false;
  const cards = activeRows(calendar.settlementCards);
  const reservedKeys = getReservedSettlementItemKeys(cards);
  const claims = new Map();
  cards.forEach((card, index) => {
    getReservedSettlementItemKeys([card]).forEach(key => {
      if (!claims.has(key)) claims.set(key, new Set());
      claims.get(key).add(String(card.id || index));
    });
  });
  const duplicateClaims = [...claims].filter(([, ids]) => ids.size > 1);
  if (duplicateClaims.length) tasks.push(asTask({
    id: 'settlement-duplicate-claims', priority: 'urgent', kind: 'settlement-conflict',
    title: '중복 정산 항목 확인', detail: `동일한 지출 ${duplicateClaims.length}건이 여러 정산 카드에 포함되어 있습니다. 삭제 전 카드를 비교해 주세요.`,
    action: { type: 'open-settlement' }, evidence: duplicateClaims.slice(0, 3).map(([key]) => key)
  }));

  meetingRows(calendar).forEach(meeting => {
    const date = asDateKey(meeting?.date || meeting?.targetDate || meeting?.id);
    const daysAway = utcDay(date) - referenceDay;
    const title = meetingTitle(meeting);

    if (meeting.confirmed !== false && daysAway >= 0 && daysAway <= 21 && !hasInlinePlace(meeting) && !placeMatcher(date)) {
      tasks.push(asTask({
        id: `place:${date}`,
        priority: daysAway <= 7 ? 'high' : 'medium',
        kind: 'meeting-place',
        title: `${title} 장소 확인`,
        detail: `${date} 일정에 연결된 장소가 없습니다. 장소를 등록하거나 일정에 연결해 주세요.`,
        action: { type: 'open-date', date, tab: 'meeting' },
        evidence: [date, title]
      }));
    }

    if (meeting.confirmed !== false && daysAway >= 0 && daysAway <= 14 && participantIds.size >= 2) {
      const answered = availabilityByDate.get(date) || new Set();
      const missingCount = [...participantIds].filter(id => !answered.has(id)).length;
      if (missingCount > 0) {
        tasks.push(asTask({
          id: `attendance:${date}`,
          priority: daysAway <= 3 ? 'high' : 'medium',
          kind: 'attendance',
          title: `${title} 참여 일정 확인`,
          detail: `참여자 ${missingCount}명의 해당 날짜 일정이 등록되지 않았습니다. 불참을 뜻하지는 않습니다.`,
          action: { type: 'open-date', date, tab: 'participant' },
          evidence: [date, `${participantIds.size - missingCount}/${participantIds.size}명 등록`]
        }));
      }
    }

    if (daysAway < 0 && daysAway >= -60) {
      const unreserved = (Array.isArray(meeting?.expenses) ? meeting.expenses : [])
        .map((expense, index) => ({ expense, index, key: expenseItemKey(date, expense, index) }))
        .filter(row => isSharedExpense(row.expense))
        .filter(row => !reservedKeys.has(row.key));
      const amount = unreserved.reduce((sum, row) => sum + Number(row.expense.amount || 0), 0);
      if (unreserved.length && amount > 0) {
        tasks.push(asTask({
          id: `settlement:${date}`,
          priority: daysAway >= -14 ? 'high' : 'medium',
          kind: 'settlement',
          title: `${title} 정산 만들기`,
          detail: `정산 카드에 포함되지 않은 공동 지출 ${unreserved.length}건(${Math.round(amount).toLocaleString()}원)이 있습니다.`,
          action: { type: 'open-settlement', date },
          evidence: [date, ...unreserved.slice(0, 2).map(row => String(row.expense.label || '지출 항목'))]
        }));
      }
    }
  });

  const failedAnalysis = (Array.isArray(mediaAnalysis) ? mediaAnalysis : [])
    .filter(item => item && ['failed', 'error'].includes(item.status));
  if (failedAnalysis.length) {
    tasks.push(asTask({
      id: 'media-analysis-failures',
      priority: 'high',
      kind: 'media-analysis',
      title: '사진 분석 재확인',
      detail: `사진 분석 ${failedAnalysis.length}건이 완료되지 않았습니다. 원본과 오류를 확인한 뒤 재시도해 주세요.`,
      action: { type: 'open-gallery-analysis' },
      evidence: failedAnalysis.slice(0, 2).map(item => String(item.error || '분석 실패'))
    }));
  }

  const strongSuggestions = (Array.isArray(mediaAnalysis) ? mediaAnalysis : [])
    .filter(item => item && !item.review && item.status === 'suggested')
    .filter(item => Number(item.analysisVersion) >= 5 ? item.suggestedTags?.length : item.suggestedTags?.length || item.people?.length || item.places?.length || item.meetings?.length);
  if (strongSuggestions.length) {
    tasks.push(asTask({
      id: 'media-analysis-review',
      priority: 'low',
      kind: 'media-review',
      title: '사진 태그 추정 검토',
      detail: `최근 불러온 분석에서 미검토 추천 ${strongSuggestions.length}건이 있습니다. 인물·장소 추정은 사진을 확인한 뒤 적용하세요.`,
      action: { type: 'open-gallery-analysis' },
      evidence: strongSuggestions.slice(0, 3).flatMap(item => [...(item.people || []), ...(item.places || []), ...(item.meetings || [])]).slice(0, 3)
    }));
  }

  const autoFailed = mediaAnalysis.filter(item => item?.automatic?.status === 'failed');
  if (autoFailed.length) tasks.push(asTask({
    id: 'media-auto-tags-failed', priority: 'high', kind: 'media-analysis', title: '위치 태그 자동 보완 확인',
    detail: `최근 분석 ${autoFailed.length}건의 GPS 주소 확인이 실패했습니다. 재시도 이력을 확인해 주세요.`,
    action: { type: 'open-gallery-analysis' }, evidence: autoFailed.slice(0, 2).map(item => `${item.automatic.attempts || 0}회 시도`)
  }));

  const staleWorkers = (Array.isArray(workerStates) ? workerStates : [])
    .filter(state => Number(state?.lastHeartbeatAt || 0) <= 0 || Number(now) - Number(state.lastHeartbeatAt) > 26 * 60 * 60 * 1000);
  if (staleWorkers.length) {
    tasks.push(asTask({
      id: 'media-worker-stale',
      priority: 'high',
      kind: 'worker-health',
      title: '사진 분석 기기 연결 확인',
      detail: `사진 분석 기기 ${staleWorkers.length}대의 최근 상태가 26시간 이상 갱신되지 않았습니다.`,
      action: { type: 'open-gallery-analysis' },
      evidence: staleWorkers.slice(0, 2).map(state => String(state.workerId || state.id || '분석 기기'))
    }));
  }
  const failedWorkers = (Array.isArray(workerStates) ? workerStates : []).filter(state => ['failed', 'error'].includes(state?.status));
  if (failedWorkers.length) tasks.push(asTask({
    id: 'media-worker-failed', priority: 'high', kind: 'worker-health', title: '사진 분석 작업 오류',
    detail: '기기는 연결되어 있지만 최근 작업이 실패했습니다. 작업 로그를 확인해 주세요.',
    action: { type: 'open-gallery-analysis' }, evidence: failedWorkers.slice(0, 2).map(state => String(state.workerId || state.id || '분석 기기'))
  }));

  return tasks.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.id.localeCompare(b.id));
}
