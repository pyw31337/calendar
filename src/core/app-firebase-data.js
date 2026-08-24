/** app-main.js에서 분리된 Firestore/로컬 데이터 계층 로직 (React/JSX 의존성 없음).
 * 투표(poll) 정규화·병합, 캘린더 레코드 병합, 로컬 캐시, Firebase REST 폴백, 채팅/장소/
 * 활동로그/확정일정/이미지공유 Firestore CRUD, 관리자 대시보드 메트릭·백업·ICS 내보내기
 * 등 App() 컴포넌트 클로저와 무관한 데이터 계층 함수/상수 모음. app-main.js가 정적 import로
 * 불러오며, Vite manualChunks(vite.config.js)에서 별도 청크로 분리.
 */
import {
  PRESET_COLORS,
  DEFAULT_EXPENSE_CATEGORIES,
  normalizeExpenseCategories,
  DEFAULT_PLACE_CATEGORIES,
  normalizePlaceCategories,
  normalizePlaces,
  readConfigNumber,
  ENABLE_FIRESTORE_SYNC,
  ENABLE_FIRESTORE_WRITES,
  ENABLE_PLACES_SUBCOLLECTION_MIGRATION,
  PUBLIC_CALENDAR_IDS,
  FIREBASE_LOAD_TIMEOUT_MS,
  FIREBASE_LOAD_MAX_ATTEMPTS,
  FIRESTORE_FREE_LIMITS,
  GITHUB_PAGES_FREE_LIMITS,
  CHAT_LIVE_MESSAGE_LIMIT,
  slimMessageForClient,
  CALENDAR_DOC_SAFE_BYTE_LIMIT,
  getConfirmedMeetings,
  getTrulyConfirmedMeetings,
  isValidCalendarId,
  isAllowedCalendarId,
  sanitizeText,
  normalizeColorValue,
  isValidDateString,
  cloneParticipant,
  cloneAvailability,
  cloneActivityLog,
  clonePoll,
  getItemStamp,
  isTombstone,
  normalizeParticipantName,
  getActiveParticipants,
  getActiveAvailabilities,
  getCalendarActivityLogs,
  getCalendarPolls,
  getActivePollOptions,
  normalizeDeletedActivityLogIds,
  getDeletedActivityLogIds,
  mergeDeletedActivityLogIds,
  getActivityLogStamp,
  normalizeActivityLog,
  mergeActivityLogs,
  extractFirstUrl,
  removeFirstUrl,
  getDirectChatMediaInfo,
  withTimeout,
  getMessageImageEntries,
  getDirectMediaTagKey,
  getDirectMediaTagsForUrl,
  getMessageDirectMediaEntry,
  formatBytes,
  getDataUrlInfo,
} from './app-domain-helpers.js';
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
function normalizePollOptionInput(value = '') {
  const source = sanitizeText(value, 220);
  const url = extractFirstUrl(source);
  const text = sanitizeText(url ? removeFirstUrl(source) : source, 120);
  return {
    text: text || source,
    url
  };
}

function normalizePollVotes(rawVotes, optionIds = new Set(), participantIds = null) {
  const votes = {};
  optionIds.forEach(optionId => {
    votes[optionId] = [];
  });
  if (!rawVotes || typeof rawVotes !== 'object') return votes;
  const addVote = (optionId, participantId) => {
    const cleanOptionId = sanitizeText(optionId, 140);
    const cleanParticipantId = sanitizeText(participantId, 120);
    if (!optionIds.has(cleanOptionId)) return;
    if (!cleanParticipantId || participantIds && !participantIds.has(cleanParticipantId)) return;
    const list = votes[cleanOptionId] || [];
    if (!list.includes(cleanParticipantId)) list.push(cleanParticipantId);
    votes[cleanOptionId] = list;
  };
  Object.entries(rawVotes).forEach(([key, value]) => {
    const cleanKey = sanitizeText(key, 140);
    if (optionIds.has(cleanKey)) {
      if (Array.isArray(value)) {
        value.forEach(participantId => addVote(cleanKey, participantId));
        return;
      }
      if (value && typeof value === 'object') {
        Object.entries(value).forEach(([participantId, selected]) => {
          if (selected) addVote(cleanKey, participantId);
        });
        return;
      }
    }
    if (typeof value === 'string') {
      addVote(value, cleanKey);
    }
  });
  return votes;
}

function getPollOptionVoterIds(poll, optionId) {
  const optionIds = new Set(getActivePollOptions(poll).map(option => option.id));
  return normalizePollVotes(poll?.votes || {}, optionIds)[optionId] || [];
}

function getPollTotalVoteCount(poll) {
  const optionIds = new Set(getActivePollOptions(poll).map(option => option.id));
  const votes = normalizePollVotes(poll?.votes || {}, optionIds);
  return Object.values(votes).reduce((total, voterIds) => total + voterIds.length, 0);
}

const isPollClosed = GATHER_APP_UTILS.isPollClosed
  ? GATHER_APP_UTILS.isPollClosed
  : function isPollClosed(poll) {
  return !!(poll?.deadline && Date.now() >= Number(poll.deadline));
};

const formatPollDeadline = GATHER_APP_UTILS.formatPollDeadline
  ? GATHER_APP_UTILS.formatPollDeadline
  : function formatPollDeadline(deadline) {
  if (!deadline) return '';
  const date = new Date(Number(deadline));
  if (Number.isNaN(date.getTime())) return '';
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${m}/${d} (${dayNames[date.getDay()]}) ${hh}:${mm}`;
};

function normalizePoll(calendarId, poll, participantIds = null) {
  if (!poll || typeof poll !== 'object') return null;
  if (poll.calendarId && poll.calendarId !== calendarId) return null;
  const id = sanitizeText(poll.id || `${calendarId}_poll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, 120);
  const title = sanitizeText(poll.title, 80);
  const description = sanitizeText(poll.description || '', 160);
  const updatedAt = Number(poll.updatedAt || poll.createdAt || Date.now()) || Date.now();
  if (!id || !title) return null;
  const optionIds = new Set();
  const options = (Array.isArray(poll.options) ? poll.options : []).map((option, index) => {
    const normalizedInput = normalizePollOptionInput(option?.text || '');
    const optionUrl = sanitizeText(option?.url || normalizedInput.url || '', 220);
    const optionText = sanitizeText(normalizedInput.text || option?.text || '', 120);
    const optionId = sanitizeText(option?.id || `${id}_opt_${index + 1}_${Date.now()}`, 140);
    if (!optionId || !optionText || optionIds.has(optionId)) return null;
    optionIds.add(optionId);
    const { inputValue, ...storedOption } = option || {};
    return {
      ...storedOption,
      id: optionId,
      text: optionText,
      url: optionUrl,
      updatedAt: Number(option?.updatedAt || updatedAt) || updatedAt
    };
  }).filter(Boolean).slice(0, 30);
  if (options.length === 0) return null;
  const votes = normalizePollVotes(poll.votes || {}, optionIds, participantIds);
  return {
    ...poll,
    id,
    calendarId,
    title,
    description,
    options,
    votes,
    createdAt: Number(poll.createdAt || updatedAt) || updatedAt,
    updatedAt
  };
}

function mergePollRecord(existing, incoming) {
  const existingClone = clonePoll(existing);
  const incomingClone = clonePoll(incoming);
  if (!existingClone) return incomingClone;
  if (!incomingClone) return existingClone;
  const existingStamp = getItemStamp(existingClone);
  const incomingStamp = getItemStamp(incomingClone);
  const scalarSource = incomingStamp >= existingStamp ? incomingClone : existingClone;
  const optionMap = new Map();
  (existingClone.options || []).forEach(option => {
    if (option?.id) optionMap.set(option.id, option);
  });
  (incomingClone.options || []).forEach(option => {
    if (!option?.id) return;
    const current = optionMap.get(option.id);
    optionMap.set(option.id, !current || getItemStamp(option) >= getItemStamp(current) ? option : current);
  });
  const orderSource = incomingStamp >= existingStamp ? incomingClone : existingClone;
  const orderedOptions = [];
  const usedOptionIds = new Set();
  (orderSource.options || []).forEach(option => {
    const mergedOption = optionMap.get(option?.id);
    if (!mergedOption || usedOptionIds.has(mergedOption.id)) return;
    orderedOptions.push(mergedOption);
    usedOptionIds.add(mergedOption.id);
  });
  optionMap.forEach(option => {
    if (!option?.id || usedOptionIds.has(option.id)) return;
    orderedOptions.push(option);
  });
  return {
    ...existingClone,
    ...incomingClone,
    title: scalarSource.title || incomingClone.title || existingClone.title,
    description: scalarSource.description || incomingClone.description || existingClone.description || '',
    options: orderedOptions,
    votes: scalarSource === incomingClone ? incomingClone.votes || {} : existingClone.votes || {},
    updatedAt: Math.max(existingClone.updatedAt || 0, incomingClone.updatedAt || 0),
    deletedAt: incomingClone.deletedAt || existingClone.deletedAt || null
  };
}

function mergePolls(existingPolls = [], incomingPolls = [], calendarId = '', participantIds = null) {
  const map = new Map();
  [...existingPolls, ...incomingPolls].forEach((poll) => {
    const normalized = normalizePoll(calendarId || poll?.calendarId || '', poll, participantIds);
    if (!normalized) return;
    map.set(normalized.id, mergePollRecord(map.get(normalized.id), normalized));
  });
  return Array.from(map.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function buildActivityLogsFromAvailabilities(calendar) {
  const explicitLogs = getCalendarActivityLogs(calendar);
  const deletedLogIds = new Set(getDeletedActivityLogIds(calendar));
  // Fallback synthesis only exists to backfill legacy availabilities that predate explicit
  // per-action logging (no create/update/delete log was ever written for them). Once a
  // date+participant pair has ANY explicit log, trust that history completely -- matching on
  // date+participant+action+timestamp let a later edit's updatedAt slip through as a brand
  // new synthesized "create" entry (this function has no concept of "update"), producing a
  // phantom duplicate registration log every time an already-tracked entry was edited.
  const explicitPairs = new Set(explicitLogs.map(log => `${log.date}_${log.participantId}`));
  const explicitCreatePairs = new Set(explicitLogs.filter(l => l.action === 'create').map(log => `${log.date}_${log.participantId}`));
  const availabilities = Array.isArray(calendar?.availabilities) ? calendar.availabilities : [];

  // Some tracked pairs have update/delete logs but no create log: their real registration
  // predates activity logging entirely and was never captured. There's no way to recover the
  // true timestamp, but participants who registered in the same batch (the common case --
  // several people added within seconds of each other) give a reasonable estimate. Use the
  // earliest reliable timestamp found for the same date, from either a real create log or an
  // untouched (never-edited) availability, whose own updatedAt is trustworthy as its true
  // creation time.
  const earliestReliableByDate = new Map();
  availabilities.forEach((availability) => {
    if (isTombstone(availability)) return;
    const pairKey = `${availability.date}_${availability.participantId}`;
    let candidate = null;
    if (explicitCreatePairs.has(pairKey)) {
      const createLog = explicitLogs.find(l => l.action === 'create' && l.date === availability.date && l.participantId === availability.participantId);
      candidate = createLog ? getActivityLogStamp(createLog) : null;
    } else if (!explicitPairs.has(pairKey)) {
      candidate = Number(availability.updatedAt) || null;
    }
    if (!candidate) return;
    const current = earliestReliableByDate.get(availability.date);
    if (current === undefined || candidate < current) earliestReliableByDate.set(availability.date, candidate);
  });

  const fallbackLogs = availabilities.map((availability) => {
    const pairKey = `${availability.date}_${availability.participantId}`;
    if (explicitPairs.has(pairKey)) {
      if (explicitCreatePairs.has(pairKey)) return null;
      const estimatedTimestamp = earliestReliableByDate.get(availability.date);
      if (!estimatedTimestamp) return null;
      return normalizeActivityLog(calendar.id, {
        id: `${calendar.id}_${availability.date}_${availability.participantId}_create_${estimatedTimestamp}_estimated`,
        calendarId: calendar.id,
        participantId: availability.participantId,
        date: availability.date,
        action: 'create',
        note: '',
        timestamp: estimatedTimestamp
      });
    }
    const action = availability.deletedAt ? 'delete' : 'create';
    const timestamp = Number(availability.deletedAt || availability.updatedAt || 0) || 0;
    return normalizeActivityLog(calendar.id, {
      id: `${calendar.id}_${availability.date}_${availability.participantId}_${action}_${timestamp}_fallback`,
      calendarId: calendar.id,
      participantId: availability.participantId,
      date: availability.date,
      action,
      note: availability.note || '',
      timestamp
    });
  }).filter(Boolean);
  return mergeActivityLogs(explicitLogs, fallbackLogs, calendar?.id || '').filter(log => !deletedLogIds.has(log.id));
}

function validateCalendarShape(calendar) {
  if (!calendar || !isValidCalendarId(calendar.id)) return '캘린더 ID가 올바르지 않습니다.';
  if (sanitizeText(calendar.title, 80).length === 0) return '캘린더명이 비어 있습니다.';
  const participants = Array.isArray(calendar.participants) ? calendar.participants : [];
  const availabilities = Array.isArray(calendar.availabilities) ? calendar.availabilities : [];
  const activityLogs = Array.isArray(calendar.activityLogs) ? calendar.activityLogs : [];
  const polls = Array.isArray(calendar.polls) ? calendar.polls : [];
	  const deletedActivityLogIds = normalizeDeletedActivityLogIds(calendar.deletedActivityLogIds || []);
	  const expenseCategories = normalizeExpenseCategories(calendar.expenseCategories);
	  if (participants.length > 80) return '참여자가 너무 많습니다.';
	  if (availabilities.length > 5000) return '일정 데이터가 너무 많습니다.';
	  if (activityLogs.length > 5000) return '활동 로그가 너무 많습니다.';
	  if (polls.length > 100) return '투표 데이터가 너무 많습니다.';
	  if (expenseCategories.length > 24) return '지출 카테고리가 너무 많습니다.';
  if (deletedActivityLogIds.length > 5000) return '삭제된 활동 로그 이력이 너무 많습니다.';
  const participantIds = new Set();
  const activeNames = new Set();
  for (const participant of participants) {
    if (!participant?.id || participant.id.length > 96) return '참여자 ID가 올바르지 않습니다.';
    if (participantIds.has(participant.id)) return '참여자 ID가 중복되었습니다.';
    participantIds.add(participant.id);
    if (!isTombstone(participant)) {
      const name = normalizeParticipantName(calendar.id, participant.name);
      if (!name) return '참여자 이름이 비어 있습니다.';
      const nameKey = name.toLowerCase();
      if (activeNames.has(nameKey)) return '참여자 이름이 중복되었습니다.';
      activeNames.add(nameKey);
    }
  }
  for (const availability of availabilities) {
    if (!availability?.date || !isValidDateString(availability.date)) return '일정 날짜가 올바르지 않습니다.';
    if (!participantIds.has(availability.participantId)) return '일정의 참여자 연결이 올바르지 않습니다.';
    if (sanitizeText(availability.note, 500).length > 500) return '메모가 너무 깁니다.';
  }
  for (const log of activityLogs) {
    if (!normalizeActivityLog(calendar.id, log, participantIds)) return '활동 로그 형식이 올바르지 않습니다.';
  }
  for (const poll of polls) {
    if (!normalizePoll(calendar.id, poll, participantIds)) return '투표 형식이 올바르지 않습니다.';
  }
  return '';
}

function normalizeCalendarForSave(calendar) {
  const cloned = cloneCalendar(calendar);
  if (!cloned) return cloned;

  const now = Date.now();
  const participantById = new Map();
  (cloned.participants || []).forEach((participant) => {
    if (!participant?.id) return;
    const current = participantById.get(participant.id);
    participantById.set(participant.id, mergeParticipantRecord(current, participant));
  });

  const idRedirects = new Map();
  const activeByName = new Map();
  const normalizedParticipants = [];
  participantById.forEach((participant) => {
    const nameKey = !isTombstone(participant) ? (participant.name || '').trim().toLowerCase() : '';
    if (nameKey && activeByName.has(nameKey)) {
      const kept = activeByName.get(nameKey);
      idRedirects.set(participant.id, kept.id);
      return;
    }
    if (nameKey) activeByName.set(nameKey, participant);
    normalizedParticipants.push({
      ...participant,
      name: normalizeParticipantName(cloned.id, participant.name),
      color: normalizeColorValue(participant.color, PRESET_COLORS[normalizedParticipants.length % PRESET_COLORS.length]),
      updatedAt: participant.updatedAt || now
    });
  });

  const availabilityMap = new Map();
  (cloned.availabilities || []).forEach((availability) => {
    if (!availability?.date || !availability?.participantId) return;
    if (!isValidDateString(availability.date)) return;
    const participantId = idRedirects.get(availability.participantId) || availability.participantId;
    if (!participantById.has(participantId)) return;
    const normalizedAvailability = {
      ...availability,
      date: availability.date,
      participantId,
      note: sanitizeText(availability.note, 500)
    };
    const key = `${normalizedAvailability.date}_${normalizedAvailability.participantId}`;
    availabilityMap.set(key, mergeAvailabilityRecord(availabilityMap.get(key), normalizedAvailability));
  });
  const participantIds = new Set(normalizedParticipants.map(participant => participant.id));
  const normalizedActivityLogs = mergeActivityLogs([], cloned.activityLogs || [], cloned.id, participantIds, idRedirects);
  const normalizedPolls = mergePolls([], cloned.polls || [], cloned.id, participantIds);
  const deletedActivityLogIds = getDeletedActivityLogIds(cloned);

  return {
    ...cloned,
	    participants: normalizedParticipants,
	    availabilities: Array.from(availabilityMap.values()),
	    activityLogs: normalizedActivityLogs,
	    polls: normalizedPolls,
	    expenseCategories: normalizeExpenseCategories(cloned.expenseCategories),
	    places: normalizePlaces(cloned.places),
	    placeCategories: normalizePlaceCategories(cloned.placeCategories),
	    settlementBaseBudget: Number.isFinite(Number(cloned.settlementBaseBudget)) ? Math.max(0, Math.round(Number(cloned.settlementBaseBudget))) : 0,
	    deletedActivityLogIds
	  };
	}

function assertCalendarLinks(calendar) {
  const participantIds = new Set(getActiveParticipants(calendar).map((participant) => participant.id));
  return getActiveAvailabilities(calendar).every((availability) => participantIds.has(availability.participantId));
}

function mergeParticipantRecord(existing, incoming) {
  const existingClone = cloneParticipant(existing);
  const incomingClone = cloneParticipant(incoming);
  if (!existingClone) return incomingClone;
  if (!incomingClone) return existingClone;
  const existingStamp = getItemStamp(existingClone);
  const incomingStamp = getItemStamp(incomingClone);
  if (incomingStamp > existingStamp) {
    return {
      ...existingClone,
      ...incomingClone,
      removedAt: incomingClone.removedAt || null,
      deletedAt: incomingClone.deletedAt || null
    };
  }
  if (existingStamp > incomingStamp) return existingClone;
  return {
    ...existingClone,
    ...incomingClone,
    removedAt: incomingClone.removedAt || existingClone.removedAt || null,
    deletedAt: incomingClone.deletedAt || existingClone.deletedAt || null
  };
}

function mergeAvailabilityRecord(existing, incoming) {
  const existingClone = cloneAvailability(existing);
  const incomingClone = cloneAvailability(incoming);
  if (incomingClone) {
    incomingClone.note = sanitizeText(incomingClone.note, 500);
  }
  if (!existingClone) return incomingClone;
  if (!incomingClone) return existingClone;
  const existingStamp = getItemStamp(existingClone);
  const incomingStamp = getItemStamp(incomingClone);
  if (incomingStamp > existingStamp) {
    return {
      ...existingClone,
      ...incomingClone,
      deletedAt: incomingClone.deletedAt || null
    };
  }
  if (existingStamp > incomingStamp) return existingClone;
  return {
    ...existingClone,
    ...incomingClone,
    deletedAt: incomingClone.deletedAt || existingClone.deletedAt || null
  };
}

function mergeCalendarRecord(existing, incoming) {
  const base = cloneCalendar(existing) || {};
  const next = cloneCalendar(incoming) || {};
  if (!base.id) return next;
  if (!next.id) return base;
  if (base.id !== next.id) {
    throw new Error(`Calendar ID mismatch: ${base.id} cannot merge with ${next.id}`);
  }

  const participantMap = new Map();
  (base.participants || []).forEach((participant) => {
    if (participant?.id) participantMap.set(participant.id, participant);
  });
  (next.participants || []).forEach((participant) => {
    if (!participant?.id) return;
    const current = participantMap.get(participant.id);
    participantMap.set(participant.id, mergeParticipantRecord(current, participant));
  });

  const availabilityMap = new Map();
  (base.availabilities || []).forEach((availability) => {
    if (availability?.date && availability?.participantId) {
      availabilityMap.set(`${availability.date}_${availability.participantId}`, availability);
    }
  });
  (next.availabilities || []).forEach((availability) => {
    if (!availability?.date || !availability?.participantId) return;
    const key = `${availability.date}_${availability.participantId}`;
    const current = availabilityMap.get(key);
    availabilityMap.set(key, mergeAvailabilityRecord(current, availability));
  });
  const participantIds = new Set(Array.from(participantMap.values()).map(participant => participant.id));

  const mergedUpdatedAt = [base.updatedAt, next.updatedAt].reduce((max, value) => {
    const ts = value ? new Date(value).getTime() : 0;
    return ts > max ? ts : max;
  }, 0);
  const mergedRevision = Math.max(base.revision || 0, next.revision || 0);
  const baseStamp = base.updatedAt ? new Date(base.updatedAt).getTime() : 0;
  const nextStamp = next.updatedAt ? new Date(next.updatedAt).getTime() : 0;
  const scalarSource = nextStamp >= baseStamp ? next : base;

  return {
    ...base,
    ...next,
    title: scalarSource.title || next.title || base.title,
    description: scalarSource.description || next.description || base.description,
    participants: Array.from(participantMap.values()),
    availabilities: Array.from(availabilityMap.values()),
    activityLogs: mergeActivityLogs(base.activityLogs || [], next.activityLogs || [], base.id || next.id, participantIds),
    polls: mergePolls(base.polls || [], next.polls || [], base.id || next.id, participantIds),
    deletedActivityLogIds: mergeDeletedActivityLogIds(base.deletedActivityLogIds || [], next.deletedActivityLogIds || []),
    updatedAt: mergedUpdatedAt || next.updatedAt || base.updatedAt || null,
    revision: mergedRevision
  };
}

function mergeCalendarAvailabilityDelta(serverCalendar, incomingCalendar, changedAt = 0) {
  const base = cloneCalendar(serverCalendar) || cloneCalendar(incomingCalendar) || {};
  const incoming = cloneCalendar(incomingCalendar) || {};
  if (base.id && incoming.id && base.id !== incoming.id) {
    throw new Error(`Calendar ID mismatch: ${base.id} cannot receive ${incoming.id} availability`);
  }
  const participantIds = new Set(getActiveParticipants(base).map(participant => participant.id));
  const availabilityMap = new Map();

  (base.availabilities || []).forEach((availability) => {
    if (availability?.date && availability?.participantId && isValidDateString(availability.date)) {
      availabilityMap.set(`${availability.date}_${availability.participantId}`, availability);
    }
  });

  (incoming.availabilities || []).forEach((availability) => {
    if (!availability?.date || !availability?.participantId) return;
    if (!isValidDateString(availability.date)) return;
    if (participantIds.size > 0 && !participantIds.has(availability.participantId)) return;
    const key = `${availability.date}_${availability.participantId}`;
    availabilityMap.set(key, mergeAvailabilityRecord(availabilityMap.get(key), availability));
  });

  return {
    ...base,
    title: base.title || incoming.title,
    description: base.description || incoming.description,
    participants: base.participants || [],
    availabilities: Array.from(availabilityMap.values()),
    activityLogs: mergeActivityLogs(base.activityLogs || [], incoming.activityLogs || [], base.id || incoming.id, participantIds),
    polls: base.polls || [],
    deletedActivityLogIds: mergeDeletedActivityLogIds(base.deletedActivityLogIds || [], incoming.deletedActivityLogIds || []),
    updatedAt: Math.max(base.updatedAt || 0, incoming.updatedAt || 0, changedAt || 0),
    revision: Math.max(base.revision || 0, incoming.revision || 0)
  };
}

function mergeCalendarSettingsDelta(serverCalendar, incomingCalendar) {
  const server = cloneCalendar(serverCalendar) || {};
  const incoming = cloneCalendar(incomingCalendar) || {};
  if (server.id && incoming.id && server.id !== incoming.id) {
    throw new Error(`Calendar ID mismatch: ${server.id} cannot be saved as ${incoming.id}`);
  }
  const calendarId = incoming.id || server.id;
  const serverActiveCount = getActiveParticipants(server).length;
  const incomingActiveCount = getActiveParticipants(incoming).length;
  if (serverActiveCount > 0 && incomingActiveCount === 0) {
    throw new Error(`Refusing to replace ${calendarId} participants with an empty settings payload`);
  }

  const participantMap = new Map();
  (server.participants || []).forEach((participant) => {
    if (participant?.id) participantMap.set(participant.id, participant);
  });
  (incoming.participants || []).forEach((participant) => {
    if (!participant?.id) return;
    const normalizedParticipant = {
      ...participant,
      name: normalizeParticipantName(calendarId, participant.name)
    };
    participantMap.set(
      normalizedParticipant.id,
      mergeParticipantRecord(participantMap.get(normalizedParticipant.id), normalizedParticipant)
    );
  });

  return {
    ...server,
    ...incoming,
    id: calendarId,
    participants: Array.from(participantMap.values()),
    availabilities: server.availabilities || [],
    activityLogs: mergeActivityLogs(server.activityLogs || [], incoming.activityLogs || [], calendarId, new Set(Array.from(participantMap.values()).map(participant => participant.id))),
    polls: mergePolls(server.polls || [], incoming.polls || [], calendarId, new Set(Array.from(participantMap.values()).map(participant => participant.id))),
    deletedActivityLogIds: mergeDeletedActivityLogIds(server.deletedActivityLogIds || [], incoming.deletedActivityLogIds || []),
    // Explicit rather than relying on the "...incoming" spread above: confirmed-meeting expense
    // edits (category/label/amount) go through this exact saveMode, so an incoming payload that's
    // missing the field for any reason must not silently fall back to dropping the meeting data.
    confirmedMeeting: incoming.confirmedMeeting !== undefined ? incoming.confirmedMeeting : (server.confirmedMeeting || []),
    expenseCategories: incoming.expenseCategories !== undefined ? incoming.expenseCategories : server.expenseCategories,
    places: incoming.places !== undefined ? incoming.places : server.places,
    placeCategories: incoming.placeCategories !== undefined ? incoming.placeCategories : server.placeCategories,
    settlementBaseBudget: incoming.settlementBaseBudget !== undefined ? incoming.settlementBaseBudget : server.settlementBaseBudget
  };
}

function mergeCalendarPollsDelta(serverCalendar, incomingCalendar, changedAt = 0) {
  const base = cloneCalendar(serverCalendar) || cloneCalendar(incomingCalendar) || {};
  const incoming = cloneCalendar(incomingCalendar) || {};
  if (base.id && incoming.id && base.id !== incoming.id) {
    throw new Error(`Calendar ID mismatch: ${base.id} cannot receive ${incoming.id} polls`);
  }
  const participantIds = new Set(getActiveParticipants(base).map(participant => participant.id));
  const calendarId = base.id || incoming.id;
  return {
    ...base,
    polls: mergePolls(base.polls || [], incoming.polls || [], calendarId, participantIds),
    activityLogs: mergeActivityLogs(base.activityLogs || [], incoming.activityLogs || [], calendarId, participantIds),
    deletedActivityLogIds: mergeDeletedActivityLogIds(base.deletedActivityLogIds || [], incoming.deletedActivityLogIds || []),
    updatedAt: Math.max(base.updatedAt || 0, incoming.updatedAt || 0, changedAt || 0),
    revision: Math.max(base.revision || 0, incoming.revision || 0)
  };
}

function cloneCalendar(calendar) {
  if (!calendar) return calendar;
  return {
    ...calendar,
    participants: Array.isArray(calendar.participants) ? calendar.participants.map(cloneParticipant) : [],
    availabilities: Array.isArray(calendar.availabilities) ? calendar.availabilities.map(cloneAvailability) : [],
    activityLogs: Array.isArray(calendar.activityLogs) ? calendar.activityLogs.map(cloneActivityLog) : [],
    polls: Array.isArray(calendar.polls) ? calendar.polls.map(clonePoll) : [],
    deletedActivityLogIds: getDeletedActivityLogIds(calendar)
  };
}

function cloneCalendarList(list) {
  return Array.isArray(list) ? list.map(cloneCalendar).filter(Boolean) : [];
}

// Safety function: Strictly merge calendars by ID without bleeding participant data across different calendars.
// All objects are cloned so the static seed data never gets mutated by live updates.
function mergeCalendarCollections(sourceList, targetList, options = {}) {
  const { replaceMatchingId = false } = options;
  if (!Array.isArray(sourceList)) return cloneCalendarList(targetList || []);
  if (!Array.isArray(targetList)) return cloneCalendarList(sourceList || []);
  const map = new Map();
  cloneCalendarList(sourceList).forEach(c => map.set(c.id, c));
  targetList.forEach(tc => {
    const nextCalendar = cloneCalendar(tc);
    if (!nextCalendar || !nextCalendar.id) return;
    if (!map.has(nextCalendar.id)) {
      map.set(nextCalendar.id, nextCalendar);
    } else {
      const existing = map.get(nextCalendar.id);
      if (replaceMatchingId) {
        map.set(nextCalendar.id, mergeCalendarRecord(existing, nextCalendar));
        return;
      }
      map.set(nextCalendar.id, mergeCalendarRecord(existing, nextCalendar));
    }
  });
  return Array.from(map.values());
}
const INITIAL_CALENDARS = ['kkot', 'cw'].map(id => ({
  id,
  title: '캘린더 불러오는 중...',
  description: 'Firebase에서 실시간 캘린더 데이터를 불러오는 중입니다.',
  participants: [],
  availabilities: [],
  activityLogs: [],
  polls: [],
  deletedActivityLogIds: [],
  revision: 0,
  updatedAt: 0
}));

const GATHER_LOCAL_CACHE_KEY = 'gather_calendars_cache_v2';
const GATHER_LOCAL_META_KEY = 'gather_calendars_meta_v2';

function __gatherSafeLocalStorage() {
  try { return window.localStorage; } catch (_) { return null; }
}

function loadLocalCache() {
  // Instant paint from last successful cloud snapshot. Firestore remains source of truth
  // and replaces this via onSnapshot (revision/lastModified gated).
  try {
    const ls = __gatherSafeLocalStorage();
    if (!ls) return [];
    const raw = ls.getItem(GATHER_LOCAL_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(c => c && typeof c.id === 'string' && isAllowedCalendarId(c.id))
      .map(c => cloneCalendar(c))
      .filter(Boolean);
  } catch (e) {
    console.warn('loadLocalCache notice:', e);
    return [];
  }
}

function saveLocalCache(list) {
  try {
    const ls = __gatherSafeLocalStorage();
    if (!ls || !Array.isArray(list)) return;
    const slim = list
      .filter(c => c && isAllowedCalendarId(c.id))
      .map(c => {
        const next = cloneCalendar(c);
        if (!next) return null;
        if (Array.isArray(next.activityLogs) && next.activityLogs.length > 80) {
          next.activityLogs = next.activityLogs.slice(-80);
        }
        return next;
      })
      .filter(Boolean);
    if (slim.length === 0) return;
    ls.setItem(GATHER_LOCAL_CACHE_KEY, JSON.stringify(slim));
  } catch (e) {
    try {
      const ls = __gatherSafeLocalStorage();
      if (!ls || !Array.isArray(list)) return;
      const tiny = list.filter(c => c && isAllowedCalendarId(c.id)).slice(0, 3).map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        participants: c.participants,
        availabilities: c.availabilities,
        polls: c.polls,
        places: c.places,
        confirmedMeeting: c.confirmedMeeting,
        revision: c.revision,
        updatedAt: c.updatedAt
      }));
      if (tiny.length === 0) return;
      ls.setItem(GATHER_LOCAL_CACHE_KEY, JSON.stringify(tiny));
    } catch (e2) {
      console.warn('saveLocalCache notice:', e2);
    }
  }
}

function isLoadingCalendarShell(calendar) {
  return Boolean(
    calendar &&
    calendar.title === '캘린더 불러오는 중...' &&
    calendar.description === 'Firebase에서 실시간 캘린더 데이터를 불러오는 중입니다.'
  );
}

function isUsableCalendarRecord(calendar) {
  return Boolean(
    calendar &&
    isAllowedCalendarId(calendar.id) &&
    !isLoadingCalendarShell(calendar) &&
    typeof calendar.title === 'string' &&
    calendar.title.trim()
  );
}

// Placeholder shown only until the real Firestore document arrives -- deliberately generic
// (not a real-looking calendar name) so a refresh never flashes stale/outdated text before the
// current title loads. This used to hardcode kkot/cw's actual titles as of whenever this was
// last written, which meant every refresh briefly showed whatever those calendars used to be
// named, however out of date, before snapping to the real (possibly renamed) title.
function getLoadingCalendarTitle(calendarId) {
  return '캘린더 불러오는 중...';
}

function createLoadingCalendarShell(calendarId) {
  const id = isAllowedCalendarId(calendarId) ? calendarId : 'kkot';
  return {
    id,
    title: getLoadingCalendarTitle(id),
    description: 'Firebase에서 실시간 캘린더 데이터를 불러오는 중입니다.',
    participants: [],
    availabilities: [],
    activityLogs: [],
    polls: [],
    deletedActivityLogIds: [],
    revision: 0,
    updatedAt: 0
  };
}

// Firebase Config for Realtime Multi-User Cloud Sync


function bindGatherFirebaseDeps() {
  window.GATHER_FIREBASE_DEPS = {
    getDb: function () { return firebaseDb; },
    projectId: (typeof firebaseConfig !== 'undefined' && firebaseConfig && firebaseConfig.projectId) || '',
    slimMessageForClient: typeof slimMessageForClient === 'function' ? slimMessageForClient : function (m) { return m; },
    firestoreDocumentToJs: typeof firestoreDocumentToJs === 'function' ? firestoreDocumentToJs : function () { return {}; },
    getMessageImageEntries: function (msg) {
      return typeof getMessageImageEntries === 'function' ? getMessageImageEntries(msg) : [];
    },
    getMessageDirectMediaEntry: function (msg) {
      return typeof getMessageDirectMediaEntry === 'function' ? getMessageDirectMediaEntry(msg) : null;
    },
    CHAT_LIVE_MESSAGE_LIMIT: typeof CHAT_LIVE_MESSAGE_LIMIT !== 'undefined' ? CHAT_LIVE_MESSAGE_LIMIT : 30,
    CHAT_OLDER_PAGE_SIZE: typeof CHAT_OLDER_PAGE_SIZE !== 'undefined' ? CHAT_OLDER_PAGE_SIZE : 40
  };
}

function subscribeMessages(calId, options, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeMessages === 'function' && !svc.isScaffold) {
    return svc.subscribeMessages(calId, options, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages');
  const orderBy = (options && options.orderBy) || 'timestamp';
  const direction = (options && options.direction) || 'desc';
  q = q.orderBy(orderBy, direction);
  if (options && options.limit) q = q.limit(options.limit);
  return q.onSnapshot(onSnapshot, onError || function () {});
}
function subscribePlaces(calId, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribePlaces === 'function' && !svc.isScaffold) {
    return svc.subscribePlaces(calId, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  return firebaseDb.collection('calendars').doc('cal_' + calId).collection('places')
    .onSnapshot(onSnapshot, onError || function () {});
}
function subscribeMemos(calId, options, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeMemos === 'function' && !svc.isScaffold) {
    return svc.subscribeMemos(calId, options, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('memos');
  if (options && options.where) q = q.where(options.where[0], options.where[1], options.where[2]);
  if (options && options.orderBy) q = q.orderBy(options.orderBy, options.direction || 'desc');
  if (options && options.limit) q = q.limit(options.limit);
  return q.onSnapshot(onSnapshot, onError || function () {});
}
function subscribeAnniversaries(calId, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeAnniversaries === 'function' && !svc.isScaffold) {
    return svc.subscribeAnniversaries(calId, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  return firebaseDb.collection('calendars').doc('cal_' + calId).collection('anniversaries')
    .orderBy('createdAt', 'desc')
    .onSnapshot(onSnapshot, onError || function () {});
}


const firebaseConfig = {
  apiKey: "AIzaSyAEtPNOA2IxUwEt62SSEG1FKdv1g2pQVMI",
  authDomain: "metro-live-2918e.firebaseapp.com",
  projectId: "metro-live-2918e",
  storageBucket: "metro-live-2918e.firebasestorage.app",
  messagingSenderId: "154827314076",
  appId: "1:154827314076:web:9cf0148e89914033c5ee59",
  measurementId: "G-JF0HTXZVV0"
};
if (typeof window !== "undefined") window.__gatherFirebaseConfig = firebaseConfig;
let firebaseDb = null;
function __setFirebaseDb(v){ firebaseDb = v; if (typeof window!=="undefined") window.__gatherFirebaseDb = v; }

let firebaseStorage = null;

// Set whenever attemptFirebaseInit() ends up NOT producing a usable firebaseDb, with enough
// detail to tell apart "script never loaded" from "loaded but threw" from an actual SDK error
// code/message. Four rounds of guessing at this from code alone (timeouts, retries, a bad API
// key) each failed to actually fix the recurring "연결 오류" report, because none of them were
// backed by the real error -- this exists so the next report carries hard evidence instead of
// another theory. Also mirrored onto window.__gatherFirebaseInitError for direct DevTools
// inspection regardless of how a consumer imports it.
let firebaseInitError = null;
function __setFirebaseInitError(v) { firebaseInitError = v; if (typeof window !== "undefined") window.__gatherFirebaseInitError = v; }

// Pulled into its own function so the background retry loop below can re-run it after a fresh
// SDK load, not just once at module evaluation time. Returns true once firebaseDb is actually
// usable.
function attemptFirebaseInit() {
  if (!ENABLE_FIRESTORE_SYNC) { __setFirebaseInitError('ENABLE_FIRESTORE_SYNC=false'); return false; }
  if (typeof firebase === 'undefined') { __setFirebaseInitError('SDK 스크립트 미로딩 (window.firebase undefined)'); return false; }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    __setFirebaseDb(firebase.firestore());
    try {
      firebase.firestore().enablePersistence({ synchronizeTabs: true }).catch(function (err) {
        console.warn('Firestore persistence notice:', err && err.code || err);
      });
    } catch (persistErr) {
      console.warn('Firestore persistence init notice:', persistErr);
    }
    bindGatherFirebaseDeps();
  } catch (e) {
    const detail = (e && (e.code || e.message)) ? String(e.code || e.message) : String(e);
    __setFirebaseInitError(`initializeApp/firestore() 예외: ${detail}`);
    console.warn('Firebase init notice:', e);
    return false;
  }
  try {
    // Chat images are uploaded here when available (see uploadChatImageAssets); every call site
    // falls back to embedding a compressed base64 image directly in the message document if this
    // is unavailable (bucket not provisioned on this project/plan, offline, etc.), so a Storage
    // outage degrades image quality/cost rather than breaking the chat feature outright.
    if (!firebaseStorage && firebase.apps.length) {
      firebaseStorage = firebase.storage();
    }
  } catch (e) {
    console.warn('Firebase Storage init notice (falling back to inline base64 images):', e);
  }
  if (!firebaseDb) __setFirebaseInitError('firebase.firestore()가 falsy 값을 반환함 (원인 불명)');
  else __setFirebaseInitError(null);
  return Boolean(firebaseDb);
}

const firebaseReadyOnFirstTry = attemptFirebaseInit();

// main.jsx's own boot-time loader (loadFirebaseSdk) already retries a few times before giving up,
// but "gave up" used to mean permanently stuck without Firestore for the rest of that page
// load/session -- realtime data, sends, uploads all silently degrade to the local cache/base64
// fallbacks, recoverable only by the user manually reloading, repeatedly, until a load happens to
// land during a good moment on their connection. On a connection that's degraded rather than
// truly offline, that first attempt can keep failing every single time it's tried right at page
// load while still being perfectly capable of succeeding a little later. This keeps retrying in
// the background on a slow cooldown instead: every consumer of firebaseDb elsewhere in the app
// already depends on its live value (subscriptions re-run, `if (firebaseDb) ...` checks re-read
// it), so once this successfully sets it, the app picks the connection back up on its own with no
// further wiring and no reload required.
if (typeof window !== 'undefined' && typeof document !== 'undefined' && !firebaseReadyOnFirstTry && ENABLE_FIRESTORE_SYNC) {
  const FIREBASE_BG_RETRY_INTERVAL_MS = 20000;
  const FIREBASE_BG_RETRY_MAX_ATTEMPTS = 30; // ~10 minutes before giving up for good this session
  // Same-origin vendored copies -- see the matching note in main.jsx's loadFirebaseSdk for why
  // these no longer point at www.gstatic.com.
  const FIREBASE_SDK_URLS = [
    'vendor/firebase-app-compat.js',
    'vendor/firebase-firestore-compat.js',
    'vendor/firebase-storage-compat.js'
  ];
  const loadFirebaseScriptOnce = (src, timeoutMs) => new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => { if (settled) return; settled = true; reject(new Error('timeout')); }, timeoutMs);
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => { if (settled) return; settled = true; clearTimeout(timer); resolve(); };
    el.onerror = () => { if (settled) return; settled = true; clearTimeout(timer); reject(new Error('load failed')); };
    document.head.appendChild(el);
  });
  let bgAttempts = 0;
  const bgRetryTimer = setInterval(async () => {
    bgAttempts += 1;
    if (firebaseDb || bgAttempts > FIREBASE_BG_RETRY_MAX_ATTEMPTS) {
      clearInterval(bgRetryTimer);
      return;
    }
    try {
      // Reloading an already-loaded script is harmless here (firebase-app-compat.js's own
      // !firebase.apps.length guard, and the browser's own HTTP cache once one attempt actually
      // succeeds) -- always retrying all three keeps this simple and avoids having to detect
      // exactly which of the three partially loaded last time.
      for (const url of FIREBASE_SDK_URLS) {
        await loadFirebaseScriptOnce(url, 15000);
      }
      if (attemptFirebaseInit()) clearInterval(bgRetryTimer);
    } catch (e) {
      // Best-effort background retry -- stay silent and let the next tick try again.
    }
  }, FIREBASE_BG_RETRY_INTERVAL_MS);
}

let isStorageDisabled = false;
let lastStorageHealthCheckAt = 0;
let lastStorageHealthOk = null; // null = never checked yet

// A success is trusted for the rest of the session (Storage being reachable once means the
// SDK/network path itself is fine), but a failure is retried after a cooldown instead of
// latching forever -- this runs automatically ~1s after script load, so a single transient
// hiccup at that exact moment (slow initial connection competing with other startup requests,
// SDK not fully warmed up yet, etc.) would otherwise permanently degrade every image for the
// rest of the session even though Storage is actually fine moments later.
const STORAGE_HEALTH_RECHECK_COOLDOWN_MS = 20000;

async function checkFirebaseStorageHealth() {
  const now = Date.now();
  if (lastStorageHealthOk === true) return true;
  if (lastStorageHealthOk === false && (now - lastStorageHealthCheckAt) < STORAGE_HEALTH_RECHECK_COOLDOWN_MS) {
    return false;
  }
  if (!firebaseStorage) {
    lastStorageHealthOk = false;
    lastStorageHealthCheckAt = now;
    isStorageDisabled = true;
    return false;
  }
  try {
    // Path must satisfy storage.rules' chatImages/{calendarId}/{fileName} shape (two segments
    // after chatImages/) or it falls through to the deny-all catch-all rule, and the blob's
    // contentType must match storage.rules' `image/.*` requirement for this path -- either one
    // being wrong makes this probe always "fail" even when Storage itself is perfectly healthy,
    // silently capping every chat/memo image at the low-res inline-base64 fallback instead of
    // the high-quality upload.
    const probeRef = firebaseStorage.ref('chatImages/_health/probe.png');
    const blob = new Blob(['1'], { type: 'image/png' });
    const probePromise = probeRef.put(blob);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('PROBE_TIMEOUT')), 5000));
    await Promise.race([probePromise, timeoutPromise]);
    isStorageDisabled = false;
    lastStorageHealthOk = true;
  } catch (e) {
    console.warn('Firebase Storage health check failed (will retry after cooldown):', e);
    isStorageDisabled = true;
    lastStorageHealthOk = false;
  }
  lastStorageHealthCheckAt = now;
  return !isStorageDisabled;
}

// Run health check early
setTimeout(() => {
  checkFirebaseStorageHealth().catch(() => {});
}, 1000);

// Mobile browsers aggressively suspend a backgrounded tab's network activity, and Firestore's
// realtime "listen" stream can come back stale/dead when the tab is foregrounded again. We only
// force a reconnect after the tab returns to the foreground. Do NOT disable Firestore while the
// tab is hidden: in Safari/Whale/Samsung-style mobile lifecycles, the browser can freeze before
// the matching enableNetwork() runs, which briefly makes the app look like every calendar record
// vanished. Keeping the last usable snapshot visible is more important than background thrift.
const VISIBILITY_RECONNECT_THRESHOLD_MS = 60000;
let lastHiddenAt = 0;
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      lastHiddenAt = Date.now();
      return;
    }
    if (document.visibilityState !== 'visible' || !firebaseDb) return;
    const hiddenFor = lastHiddenAt ? (Date.now() - lastHiddenAt) : 0;
    if (hiddenFor >= VISIBILITY_RECONNECT_THRESHOLD_MS) {
      firebaseDb.disableNetwork()
        .catch(() => {})
        .then(() => firebaseDb.enableNetwork())
        .catch(e => { console.warn('Firestore reconnect notice:', e); });
      return;
    }
  });
}

async function fetchSingleCalendarWithRest(calId, timeoutMs = FIREBASE_LOAD_TIMEOUT_MS) {
  if (!isAllowedCalendarId(calId)) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const docUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}`;
    const response = await fetch(docUrl, { signal: controller.signal });
    if (!response.ok) return null;
    const decoded = firestoreDocumentToJs(await response.json());
    if (decoded?.calendar?.id !== calId) return null;
    return {
      calendar: decoded.calendar,
      lastModified: decoded.lastModified || decoded.calendar.updatedAt || 0
    };
  } catch (error) {
    console.warn(`Firestore REST fetch notice for cal_${calId}:`, error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchRecentMessagesRest(calId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages?orderBy=timestamp%20desc&pageSize=5`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => ({
      id: doc.name.split('/').pop(),
      ...firestoreDocumentToJs(doc)
    }));
  } catch (err) {
    console.warn('fetchRecentMessagesRest error:', err);
    return [];
  }
}

async function fetchChatMessagesRest() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchChatMessagesRest === 'function' && !svc.isScaffold) {
    return svc.fetchChatMessagesRest.apply(null, arguments);
  }
  console.warn('fetchChatMessagesRest: GATHER_FIREBASE_SERVICES missing');
  return [];
}

async function fetchRecentChatMessages() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchRecentChatMessages === 'function' && !svc.isScaffold) {
    return svc.fetchRecentChatMessages.apply(null, arguments);
  }
  console.warn('fetchRecentChatMessages: GATHER_FIREBASE_SERVICES missing');
  return [];
}

async function fetchRecentGalleryMessages() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchRecentGalleryMessages === 'function' && !svc.isScaffold) {
    return svc.fetchRecentGalleryMessages.apply(null, arguments);
  }
  console.warn('fetchRecentGalleryMessages: GATHER_FIREBASE_SERVICES missing');
  return [];
}

const CHAT_OLDER_PAGE_SIZE = readConfigNumber('CHAT_OLDER_PAGE_SIZE', 40);
// olderChatMessages otherwise grows without any upper bound for the rest of the browser tab's
// life -- every "load more" while scrolling up prepends another page and nothing ever trims it,
// so a long session with a lot of upward scrolling keeps adding more message rows (images
// included) to the DOM for every remaining re-render of the chat room, not just the one that
// loaded them. This stops the *fetching* once a generous amount of history is already loaded in
// this tab -- a plain page refresh resets olderChatMessages back to empty (see the `[]` reset
// keyed on activeCalId) if someone genuinely needs to keep scrolling back further than this.
const MAX_OLDER_CHAT_MESSAGES = readConfigNumber('MAX_OLDER_CHAT_MESSAGES', 1000);
bindGatherFirebaseDeps();

async function fetchSubcollectionCount() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchSubcollectionCount === 'function' && !svc.isScaffold) {
    return svc.fetchSubcollectionCount.apply(null, arguments);
  }
  console.warn('fetchSubcollectionCount: GATHER_FIREBASE_SERVICES missing');
  return null;
}

async function fetchOlderChatMessages() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchOlderChatMessages === 'function' && !svc.isScaffold) {
    return svc.fetchOlderChatMessages.apply(null, arguments);
  }
  console.warn('fetchOlderChatMessages: GATHER_FIREBASE_SERVICES missing');
  return [];
}

async function fetchMessageOrdinal() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchMessageOrdinal === 'function' && !svc.isScaffold) {
    return svc.fetchMessageOrdinal.apply(null, arguments);
  }
  console.warn('fetchMessageOrdinal: GATHER_FIREBASE_SERVICES missing');
  return null;
}

async function fetchGalleryPhotoOrdinal() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchGalleryPhotoOrdinal === 'function' && !svc.isScaffold) {
    return svc.fetchGalleryPhotoOrdinal.apply(null, arguments);
  }
  console.warn('fetchGalleryPhotoOrdinal: GATHER_FIREBASE_SERVICES missing');
  return null;
}

async function fetchGalleryItemCount() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchGalleryItemCount === 'function' && !svc.isScaffold) {
    return svc.fetchGalleryItemCount.apply(null, arguments);
  }
  console.warn('fetchGalleryItemCount: GATHER_FIREBASE_SERVICES missing');
  return null;
}

async function fetchMemosRest(calId, recentLimit = null) {
  try {
    const pageSizePart = recentLimit ? `&pageSize=${recentLimit}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/memos?orderBy=createdAt%20desc${pageSizePart}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => ({
      id: doc.name.split('/').pop(),
      ...firestoreDocumentToJs(doc)
    }));
  } catch (err) {
    console.warn('fetchMemosRest error:', err);
    return [];
  }
}

async function fetchAnniversariesRest(calId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/anniversaries?orderBy=createdAt%20desc`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => ({
      id: doc.name.split('/').pop(),
      ...firestoreDocumentToJs(doc)
    }));
  } catch (err) {
    console.warn('fetchAnniversariesRest error:', err);
    return [];
  }
}

async function sendChatMessageRest(calId, message) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages`;
    const fields = {
      participantId: jsToFirestoreValue(message.participantId),
      text: jsToFirestoreValue(message.text),
      timestamp: jsToFirestoreValue(message.timestamp)
    };
    if (message.imageUrl) fields.imageUrl = jsToFirestoreValue(message.imageUrl);
    if (message.thumbUrl) fields.thumbUrl = jsToFirestoreValue(message.thumbUrl);
    if (Array.isArray(message.imageUrls) && message.imageUrls.length > 0) fields.imageUrls = jsToFirestoreValue(message.imageUrls);
    if (Array.isArray(message.thumbUrls) && message.thumbUrls.length > 0) fields.thumbUrls = jsToFirestoreValue(message.thumbUrls);
    if (Array.isArray(message.imageTags) && message.imageTags.length > 0) fields.imageTags = jsToFirestoreValue(message.imageTags);
    if (message.uploadSource) fields.uploadSource = jsToFirestoreValue(message.uploadSource);
    const payload = { fields };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return false;
    // The create-document REST response's `name` is the full resource path
    // (.../messages/{id}) -- callers that need to reference the new message right away (e.g.
    // linking a freshly-uploaded photo into confirmedMeeting.photos) read `.id` off this object.
    const data = await res.json().catch(() => null);
    const id = typeof data?.name === 'string' ? data.name.split('/').pop() : null;
    return { success: true, id };
  } catch (err) {
    console.warn('sendChatMessageRest error:', err);
    return false;
  }
}

async function deleteMessageRest(calId, messageId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages/${messageId}`;
    const res = await fetch(url, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('deleteMessageRest error:', err);
    return false;
  }
}

async function fetchMessageRest(calId, messageId) {
  try {
    if (!calId || !messageId) return null;
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages/${messageId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = await res.json();
    return { ...firestoreDocumentToJs(doc), id: messageId };
  } catch (err) {
    console.warn('fetchMessageRest error:', err);
    return null;
  }
}

async function updateMessageRest(calId, messageId, data) {
  try {
    const fields = {};
    if (data.text !== undefined) fields.text = jsToFirestoreValue(data.text);
    if (data.imageUrl !== undefined) fields.imageUrl = jsToFirestoreValue(data.imageUrl);
    if (data.thumbUrl !== undefined) fields.thumbUrl = jsToFirestoreValue(data.thumbUrl);
    if (data.imageUrls !== undefined) fields.imageUrls = jsToFirestoreValue(data.imageUrls);
    if (data.thumbUrls !== undefined) fields.thumbUrls = jsToFirestoreValue(data.thumbUrls);
    if (data.imageShareUrls !== undefined) fields.imageShareUrls = jsToFirestoreValue(data.imageShareUrls);
    if (data.imageTags !== undefined) fields.imageTags = jsToFirestoreValue(data.imageTags);
    if (data.directMediaTags !== undefined) fields.directMediaTags = jsToFirestoreValue(data.directMediaTags);
    if (data.linkPreview !== undefined) fields.linkPreview = jsToFirestoreValue(data.linkPreview);
    if (data.participantId !== undefined) fields.participantId = jsToFirestoreValue(data.participantId);
    if (Object.keys(fields).length === 0) return false;
    const updateMask = Object.keys(fields).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages/${messageId}?${updateMask}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    return res.ok;
  } catch (err) {
    console.warn('updateMessageRest error:', err);
    return false;
  }
}

function waitForTimeout(ms, message = 'timeout') {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

// Returns { calendar, lastModified } or null with 10s timeout, retries, and REST fallback.
async function fetchSingleCloudCalendar(calId, retryCount = FIREBASE_LOAD_MAX_ATTEMPTS, timeoutMs = FIREBASE_LOAD_TIMEOUT_MS) {
  if (!isAllowedCalendarId(calId)) return null;
  const attempts = Math.max(1, retryCount);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      if (firebaseDb) {
        const doc = await Promise.race([
          firebaseDb.collection('calendars').doc(`cal_${calId}`).get(),
          waitForTimeout(timeoutMs, `Firestore fetch timeout after ${timeoutMs}ms`)
        ]);
        if (doc.exists) {
          const data = doc.data();
          if (data && data.calendar && data.calendar.id === calId) {
            return {
              calendar: data.calendar,
              lastModified: data.lastModified || data.calendar.updatedAt || 0
            };
          }
        }
      }
      const restResult = await fetchSingleCalendarWithRest(calId, timeoutMs);
      if (restResult) return restResult;
    } catch (e) {
      console.warn(`Firestore fetch notice for cal_${calId}, attempt ${attempt}/${attempts}:`, e);
      const restResult = await fetchSingleCalendarWithRest(calId, timeoutMs);
      if (restResult) return restResult;
    }
    if (attempt < attempts) {
      await new Promise(resolve => setTimeout(resolve, 350 * attempt));
    }
  }
  return null;
}

function isUsableCloudCalendarPayload(data, expectedCalendarId) {
  return Boolean(data && data.calendar && data.calendar.id === expectedCalendarId);
}

function getCloudDocCalendar(doc, expectedCalendarId) {
  if (!doc?.exists) return null;
  const data = doc.data();
  if (!isUsableCloudCalendarPayload(data, expectedCalendarId)) return null;
  return {
    calendar: data.calendar,
    lastModified: data.lastModified || data.calendar.updatedAt || 0
  };
}

function firestoreValueToJs(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {};
    return Object.fromEntries(Object.entries(fields).map(([key, nested]) => [key, firestoreValueToJs(nested)]));
  }
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
  return undefined;
}

function jsToFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: value.length ? { values: value.map(jsToFirestoreValue) } : {} };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, jsToFirestoreValue(nested)]))
      }
    };
  }
  return { stringValue: String(value) };
}

function firestoreDocumentToJs(doc) {
  const fields = doc?.fields || {};
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, firestoreValueToJs(value)]));
}

function getImageSharePageUrl(shareId) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('image', shareId);
  return url.toString();
}

function sanitizeShareIdPart(value, fallback = 'item') {
  const clean = String(value || '')
    .replace(/[^A-Za-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return clean || fallback;
}

async function createImageShareDocument(calendarId, imageUrl, meta = {}) {
  const messageId = sanitizeText(meta?.messageId || '', 180);
  const imageIndex = Number.isFinite(Number(meta?.imageIndex)) ? Math.max(0, Math.round(Number(meta.imageIndex))) : 0;
  if (messageId) {
    const shareId = `img_${sanitizeShareIdPart(calendarId, 'cal')}_${sanitizeShareIdPart(messageId, 'msg')}_${imageIndex}`;
    const payload = {
      id: shareId,
      calendarId,
      source: 'message',
      messageId,
      imageIndex,
      thumbUrl: typeof meta?.thumb === 'string' && meta.thumb.startsWith('data:image/') ? meta.thumb : '',
      createdAt: Date.now()
    };
    try {
      const existing = await fetchImageShareDocument(shareId);
      if (existing?.imageUrl || existing?.source === 'message') return getImageSharePageUrl(shareId);
    } catch (e) {
      console.warn('Image share cache lookup skipped:', e);
    }
    if (firebaseDb) {
      await withTimeout(firebaseDb.collection('imageShares').doc(shareId).set(payload, { merge: true }), 9000, 'image share pointer write');
    } else {
      const res = await withTimeout(fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/imageShares/${shareId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, jsToFirestoreValue(value)])) })
      }), 9000, 'image share pointer REST write');
      if (!res.ok) throw new Error(`Image share REST write failed: ${res.status}`);
    }
    return getImageSharePageUrl(shareId);
  }

  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('data:image/')) {
    throw new Error('Only inline image data URLs can be shared with the fallback document route');
  }
  const dataInfo = getDataUrlInfo(imageUrl);
  if (dataInfo?.sizeBytes && dataInfo.sizeBytes > 900 * 1024) {
    throw new Error('Inline image is too large for Firestore image share document');
  }
  const shareId = `img_${calendarId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const payload = {
    id: shareId,
    calendarId,
    imageUrl,
    thumbUrl: typeof meta?.thumb === 'string' && meta.thumb.startsWith('data:image/') ? meta.thumb : '',
    messageId,
    imageIndex,
    createdAt: Date.now()
  };
  if (firebaseDb) {
    await withTimeout(firebaseDb.collection('imageShares').doc(shareId).set(payload), 9000, 'image share fallback write');
  } else {
    const res = await withTimeout(fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/imageShares/${shareId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, jsToFirestoreValue(value)])) })
    }), 9000, 'image share fallback REST write');
    if (!res.ok) throw new Error(`Image share REST write failed: ${res.status}`);
  }
  return getImageSharePageUrl(shareId);
}

async function fetchImageShareDocument(shareId) {
  if (!shareId || !/^img_[A-Za-z0-9_-]{3,180}$/.test(shareId)) return null;
  const resolveMessageShare = async share => {
    if (!share || share.imageUrl || share.source !== 'message' || !share.calendarId || !share.messageId) return share;
    let msg;
    if (firebaseDb) {
      const snap = await firebaseDb.collection('calendars').doc(`cal_${share.calendarId}`).collection('messages').doc(share.messageId).get();
      msg = snap.exists ? snap.data() : null;
    } else {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${share.calendarId}/messages/${share.messageId}`);
      msg = res.ok ? firestoreDocumentToJs(await res.json()) : null;
    }
    if (!msg) return share;
    const imageUrls = Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0 ? msg.imageUrls : (msg.imageUrl ? [msg.imageUrl] : []);
    const thumbUrls = Array.isArray(msg.thumbUrls) && msg.thumbUrls.length > 0 ? msg.thumbUrls : (msg.thumbUrl ? [msg.thumbUrl] : []);
    const index = Number.isFinite(Number(share.imageIndex)) ? Math.max(0, Math.round(Number(share.imageIndex))) : 0;
    return {
      ...share,
      imageUrl: imageUrls[index] || imageUrls[0] || '',
      thumbUrl: thumbUrls[index] || thumbUrls[0] || '',
      timestamp: msg.timestamp || share.createdAt
    };
  };
  if (firebaseDb) {
    const snap = await firebaseDb.collection('imageShares').doc(shareId).get();
    return snap.exists ? resolveMessageShare(snap.data()) : null;
  }
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/imageShares/${shareId}`);
  if (!res.ok) return null;
  return resolveMessageShare(firestoreDocumentToJs(await res.json()));
}

// Estimates the actual Firestore wire-format byte size of a calendar payload (the same
// typed-value shape jsToFirestoreValue produces for the REST commit body), so a save can be
// refused with a clear message before it gets anywhere near Firestore's real 1MiB/doc limit.
function estimateCalendarDocWireBytes(calendar) {
  try {
    const wireValue = jsToFirestoreValue(calendar);
    return new TextEncoder().encode(JSON.stringify(wireValue)).length;
  } catch (e) {
    return 0;
  }
}

// --- Activity log subcollection (calendars/cal_{id}/activityLogs/{logId}) ---
// activityLogs used to be an embedded array on the calendar document, growing forever with
// zero de-duplication (unlike availabilities, which de-dupes by date+participant). That made
// it the single biggest long-term threat to the calendar document's 1MiB size limit. It now
// lives in its own subcollection, one document per log entry (same pattern as `messages`),
// which has no per-document array-size ceiling to worry about.

// Strips the legacy embedded activityLogs array from a calendar payload right before it is
// written to Firestore. deletedActivityLogIds is NOT touched here -- it's a short list of
// hidden log IDs added one at a time by a manual user action, not an auto-growing log, so it
// stays embedded on the calendar document as before.
function stripEmbeddedActivityLogsField(calendar) {
  if (!calendar || typeof calendar !== 'object') return calendar;
  const { activityLogs, ...rest } = calendar;
  return rest;
}

// Writes a batch of activity log entries as individual documents, keyed by each log's own
// `id` so retries/re-copies of the same entry are idempotent no-ops rather than duplicates.
async function writeActivityLogsToFirestore(calendarId, logs) {
  const validLogs = Array.isArray(logs) ? logs.filter(log => log && typeof log.id === 'string' && log.id) : [];
  if (!validLogs.length) return true;
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('activityLogs');
      const batch = firebaseDb.batch();
      validLogs.forEach(log => batch.set(colRef.doc(log.id), log));
      await batch.commit();
      return true;
    } catch (e) {
      console.warn(`Failed to write activity logs for ${calendarId} via SDK, trying REST:`, e);
    }
  }
  try {
    const writes = validLogs.map(log => ({
      update: {
        name: `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/activityLogs/${log.id}`,
        fields: Object.fromEntries(Object.entries(log).map(([key, value]) => [key, jsToFirestoreValue(value)]))
      }
    }));
    const res = await fetch('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes })
    });
    if (!res.ok) console.warn(`Activity log REST write failed for ${calendarId}:`, await res.text());
    return res.ok;
  } catch (e) {
    console.warn(`Failed to write activity logs for ${calendarId} via REST:`, e);
    return false;
  }
}

// Fetches activity log documents for a calendar. Pass `recentLimit` for a display feed
// (ordered newest-first); omit it to fetch the full history (unordered), which point-in-time
// recovery needs to correctly replay every action up to a cutoff timestamp.
async function fetchActivityLogsFromFirestore(calendarId, recentLimit = null) {
  const basePath = `calendars/cal_${calendarId}/activityLogs`;
  try {
    if (firebaseDb) {
      let query = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('activityLogs');
      if (recentLimit) query = query.orderBy('timestamp', 'desc').limit(recentLimit);
      const snap = await query.get();
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch activity logs for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const orderPart = recentLimit ? '?orderBy=timestamp%20desc&pageSize=' + recentLimit : '?pageSize=1000';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}${orderPart}`);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => firestoreDocumentToJs(doc));
  } catch (e) {
    console.warn(`Failed to fetch activity logs for ${calendarId} via REST:`, e);
    return [];
  }
}

// Deletes activity log documents strictly after a cutoff timestamp, used by point-in-time
// recovery to match the "future" chat messages it already deletes on restore.
async function deleteActivityLogsAfterTimestamp(calendarId, logs, cutoffTimestamp) {
  const toDelete = (logs || []).filter(log => getActivityLogStamp(log) > cutoffTimestamp && log.id);
  for (const log of toDelete) {
    try {
      if (firebaseDb) {
        await firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('activityLogs').doc(log.id).delete();
      } else {
        await fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/activityLogs/${log.id}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn(`Failed to delete activity log ${log.id} for ${calendarId}:`, e);
    }
  }
}

// --- Places subcollection (calendars/cal_{id}/places/{placeId}) ---
// Same migration reasoning as activityLogs above: `places` used to be an embedded array on the
// calendar document (still count-capped at 500 there for calendars not yet migrated -- see
// firestore.rules), so every registered place was re-downloaded on every single realtime update
// to the calendar doc, for every connected client, regardless of relevance. Moved to its own
// subcollection, one document per place, keyed by the place's own client-generated `id` (same
// keyed-by-own-id pattern as memos).
function stripEmbeddedPlacesField(calendar) {
  if (!calendar || typeof calendar !== 'object') return calendar;
  const { places, ...rest } = calendar;
  return rest;
}
async function writePlacesToFirestore(calendarId, places) {
  const validPlaces = Array.isArray(places) ? places.filter(p => p && typeof p.id === 'string' && p.id) : [];
  if (!validPlaces.length) return true;
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('places');
      const batch = firebaseDb.batch();
      validPlaces.forEach(place => batch.set(colRef.doc(place.id), place));
      await batch.commit();
      return true;
    } catch (e) {
      console.warn(`Failed to write places for ${calendarId} via SDK, trying REST:`, e);
    }
  }
  try {
    const writes = validPlaces.map(place => ({
      update: {
        name: `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/places/${place.id}`,
        fields: Object.fromEntries(Object.entries(place).map(([key, value]) => [key, jsToFirestoreValue(value)]))
      }
    }));
    const res = await fetch('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes })
    });
    if (!res.ok) console.warn(`Places REST write failed for ${calendarId}:`, await res.text());
    return res.ok;
  } catch (e) {
    console.warn(`Failed to write places for ${calendarId} via REST:`, e);
    return false;
  }
}
async function fetchPlacesFromFirestore(calendarId) {
  const basePath = `calendars/cal_${calendarId}/places`;
  try {
    if (firebaseDb) {
      const snap = await firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('places').get();
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch places for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}?pageSize=500`);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => firestoreDocumentToJs(doc));
  } catch (e) {
    console.warn(`Failed to fetch places for ${calendarId} via REST:`, e);
    return [];
  }
}

// --- Confirmed meetings subcollection (calendars/cal_{id}/confirmedMeetings/{date}) ---
// Same migration reasoning, keyed by the entry's own `date` string (already the unique key
// getConfirmedMeetings/handleConfirmMeeting use to find/update/delete an entry) rather than a
// generated id.
function stripEmbeddedConfirmedMeetingField(calendar) {
  if (!calendar || typeof calendar !== 'object') return calendar;
  const { confirmedMeeting, ...rest } = calendar;
  return rest;
}
async function writeConfirmedMeetingsToFirestore(calendarId, meetings) {
  const validMeetings = Array.isArray(meetings) ? meetings.filter(m => m && typeof m.date === 'string' && m.date) : [];
  if (!validMeetings.length) return true;
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('confirmedMeetings');
      const batch = firebaseDb.batch();
      validMeetings.forEach(meeting => batch.set(colRef.doc(meeting.date), meeting));
      await batch.commit();
      return true;
    } catch (e) {
      console.warn(`Failed to write confirmed meetings for ${calendarId} via SDK, trying REST:`, e);
    }
  }
  try {
    const writes = validMeetings.map(meeting => ({
      update: {
        name: `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/confirmedMeetings/${meeting.date}`,
        fields: Object.fromEntries(Object.entries(meeting).map(([key, value]) => [key, jsToFirestoreValue(value)]))
      }
    }));
    const res = await fetch('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes })
    });
    if (!res.ok) console.warn(`Confirmed meetings REST write failed for ${calendarId}:`, await res.text());
    return res.ok;
  } catch (e) {
    console.warn(`Failed to write confirmed meetings for ${calendarId} via REST:`, e);
    return false;
  }
}
async function fetchConfirmedMeetingsFromFirestore(calendarId) {
  const basePath = `calendars/cal_${calendarId}/confirmedMeetings`;
  try {
    if (firebaseDb) {
      const snap = await firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('confirmedMeetings').get();
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch confirmed meetings for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}?pageSize=500`);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    return docs.map(doc => firestoreDocumentToJs(doc));
  } catch (e) {
    console.warn(`Failed to fetch confirmed meetings for ${calendarId} via REST:`, e);
    return [];
  }
}

function isRetryableFirestoreConflict(errorText) {
  return /ABORTED|FAILED_PRECONDITION|409|stored version|base version/i.test(String(errorText || ''));
}

// updateCalendars' catch block used to always show a generic "저장 실패" toast, no matter what
// actually went wrong -- including for deterministic, specific failures like the calendar doc
// size guard (estimateCalendarDocWireBytes > CALENDAR_DOC_SAFE_BYTE_LIMIT) or a
// validateCalendarShape rejection, both of which throw their own clear Korean message but had it
// swallowed. That made a save that will keep failing on every retry (the underlying data problem
// doesn't go away on its own) look identical to a one-off network hiccup, with the real reason
// visible only in the browser console -- which is exactly the kind of bug that gets reported
// repeatedly without ever getting fixed, since nobody debugging it from the outside can see why.
// Only surface err.message directly when it looks like one of our own crafted user-facing
// strings (Korean text, short, no braces/brackets that would mean it's raw JSON or a stack
// trace) -- anything else (a bare Firestore REST error body, an English internal assertion)
// falls back to the generic message rather than dumping something confusing/technical at the user.
function describeUpdateCalendarsFailure(err) {
  const message = err && err.message;
  if (typeof message === 'string' && message.length > 0 && message.length <= 200 && !/[{}[\]]/.test(message) && /[가-힣]/.test(message)) {
    return message;
  }
  return '저장 실패';
}

function getFirestoreRetryDelay(attempt) {
  const baseDelay = Math.min(3000, 180 * Math.pow(1.55, attempt));
  const jitter = Math.floor(Math.random() * 180);
  return baseDelay + jitter;
}

async function pushSingleCalendarWithRest(normalizedCal, lastModified, saveMode, retryCount = 18, newActivityLogs = []) {
  const docPath = `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${normalizedCal.id}`;
  const docUrl = `https://firestore.googleapis.com/v1/${docPath}`;
  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const getRes = await fetch(docUrl);
      const currentDoc = getRes.ok ? await getRes.json() : null;
      const currentData = currentDoc ? firestoreDocumentToJs(currentDoc) : null;
      const serverCalendar = currentData?.calendar || null;
      let nextCalendar;
      if (!serverCalendar) {
        nextCalendar = normalizedCal;
      } else if (saveMode === 'restore') {
        nextCalendar = normalizedCal;
      } else if (saveMode === 'replace') {
        const err = new Error(`Refusing to replace existing calendar ${normalizedCal.id}`);
        err.nonRetryable = true;
        throw err;
      } else if (saveMode === 'settings') {
        nextCalendar = mergeCalendarSettingsDelta(serverCalendar, normalizedCal);
      } else if (saveMode === 'polls') {
        nextCalendar = mergeCalendarPollsDelta(serverCalendar, normalizedCal, lastModified);
      } else {
        nextCalendar = mergeCalendarAvailabilityDelta(serverCalendar, normalizedCal, lastModified);
      }
      const mergedCalendar = normalizeCalendarForSave(nextCalendar);
      mergedCalendar.revision = Math.max(serverCalendar?.revision || 0, normalizedCal.revision || 0) + 1;
      mergedCalendar.updatedAt = Math.max(mergedCalendar.updatedAt || 0, lastModified || 0);
      const nextDocRevision = (currentData?.revision || 0) + 1;
      // activityLogs lives in its own subcollection now (see writeActivityLogsToFirestore) and
      // is never part of the calendar document itself. Any still-present legacy embedded
      // entries (from before this migration) are copied over the first time this calendar is
      // saved, self-healing without needing a separate one-off migration script. Validation and
      // the size guard below run against docCalendar (the actual write payload), not
      // mergedCalendar, so a large legacy activityLogs array being migrated away doesn't count
      // against the size limit it's no longer part of.
      const legacyActivityLogs = [
        ...(Array.isArray(serverCalendar?.activityLogs) ? serverCalendar.activityLogs : []),
        ...(Array.isArray(normalizedCal?.activityLogs) ? normalizedCal.activityLogs : [])
      ];
      // places/confirmedMeeting get the exact same self-healing subcollection migration as
      // activityLogs above, but gated behind ENABLE_PLACES_SUBCOLLECTION_MIGRATION (off by
      // default -- see its declaration) since it depends on firestore.rules' places/
      // confirmedMeetings subcollection rules actually being deployed first. Deduped by their own
      // key (id for places, date for meetings) since serverCalendar/normalizedCal can both still
      // carry legacy-embedded copies of an entry already migrated on a previous save.
      let legacyPlaces = [];
      let legacyConfirmedMeetings = [];
      let docCalendar = stripEmbeddedActivityLogsField(mergedCalendar);
      if (ENABLE_PLACES_SUBCOLLECTION_MIGRATION) {
        const legacyPlacesById = new Map();
        [...(Array.isArray(serverCalendar?.places) ? serverCalendar.places : []), ...(Array.isArray(normalizedCal?.places) ? normalizedCal.places : [])]
          .forEach(p => { if (p?.id) legacyPlacesById.set(p.id, p); });
        legacyPlaces = Array.from(legacyPlacesById.values());
        const legacyMeetingsByDate = new Map();
        [...(Array.isArray(serverCalendar?.confirmedMeeting) ? serverCalendar.confirmedMeeting : []), ...(Array.isArray(normalizedCal?.confirmedMeeting) ? normalizedCal.confirmedMeeting : [])]
          .forEach(m => { if (m?.date) legacyMeetingsByDate.set(m.date, m); });
        legacyConfirmedMeetings = Array.from(legacyMeetingsByDate.values());
        docCalendar = stripEmbeddedConfirmedMeetingField(stripEmbeddedPlacesField(docCalendar));
      }
      const validationError = validateCalendarShape(docCalendar);
      if (validationError) {
        const err = new Error(validationError);
        err.nonRetryable = true;
        throw err;
      }
      if (estimateCalendarDocWireBytes(docCalendar) > CALENDAR_DOC_SAFE_BYTE_LIMIT) {
        const err = new Error('캘린더 데이터가 너무 커져 더 이상 저장할 수 없습니다. 관리자에게 문의해 주세요.');
        err.nonRetryable = true;
        throw err;
      }
      const commitRes = await fetch('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: [{
            update: {
              name: docPath,
              fields: {
                calendar: jsToFirestoreValue(docCalendar),
                lastModified: jsToFirestoreValue(lastModified),
                revision: jsToFirestoreValue(nextDocRevision)
              }
            },
            ...(currentDoc?.updateTime ? { currentDocument: { updateTime: currentDoc.updateTime } } : { currentDocument: { exists: false } })
          }]
        })
      });
      if (commitRes.ok) {
        const logsToPersist = [...legacyActivityLogs, ...(Array.isArray(newActivityLogs) ? newActivityLogs : [])];
        if (logsToPersist.length) {
          writeActivityLogsToFirestore(normalizedCal.id, logsToPersist).catch(e => console.warn('Activity log persist failed:', e));
        }
        if (legacyPlaces.length) {
          writePlacesToFirestore(normalizedCal.id, legacyPlaces).catch(e => console.warn('Places persist failed:', e));
        }
        if (legacyConfirmedMeetings.length) {
          writeConfirmedMeetingsToFirestore(normalizedCal.id, legacyConfirmedMeetings).catch(e => console.warn('Confirmed meetings persist failed:', e));
        }
        return true;
      }
      const errorText = await commitRes.text();
      if (!isRetryableFirestoreConflict(errorText) || attempt === retryCount) {
        throw new Error(errorText.slice(0, 500));
      }
      await new Promise(resolve => setTimeout(resolve, getFirestoreRetryDelay(attempt)));
    } catch (error) {
      if (error?.nonRetryable || attempt === retryCount) {
        console.warn(`Firestore REST fallback failed for cal_${normalizedCal.id}:`, error);
        // Rethrow (rather than just returning false) so the real reason -- a specific,
        // user-facing message for a nonRetryable failure like the size guard below, or the raw
        // Firestore error text otherwise -- reaches updateCalendars' catch block and can be
        // shown to the user instead of a generic "저장 실패" that gives no clue why a save keeps
        // failing every single time.
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, getFirestoreRetryDelay(attempt)));
    }
  }
  throw new Error('캘린더 저장에 반복적으로 실패했습니다.');
}

// Pushes isolated calendar data to the durable master store and Firestore when available.
async function pushSingleCloudCalendar(targetCal, lastModified, retryCount = 18, allCalendars = null, saveMode = 'availability', newActivityLogs = []) {
  const normalizedCal = normalizeCalendarForSave(targetCal);
  if (!normalizedCal || !normalizedCal.id) return false;
  if (!isAllowedCalendarId(normalizedCal.id)) return false;
  if (!ENABLE_FIRESTORE_WRITES) {
    console.warn(`Blocked Firestore write for ${normalizedCal.id}: recovery read-only mode`);
    return false;
  }
  if (!ENABLE_FIRESTORE_SYNC) return false;
  if (firebaseDb) {
    let legacyActivityLogs = [];
    let legacyPlaces = [];
    let legacyConfirmedMeetings = [];
    // Set the instant the 8s timeout below fires, so a transaction that's still stuck on a slow
    // tx.get() (rather than genuinely offline) bails out cleanly instead of committing anyway
    // sometime after we've already moved on to the REST fallback below -- without this, both
    // writes could land (an orphaned transaction has no way to be cancelled once started), each
    // independently bumping revision and racing the other's optimistic-concurrency check.
    let raceLost = false;
    try {
      const ref = firebaseDb.collection('calendars').doc(`cal_${normalizedCal.id}`);
      await Promise.race([
	        firebaseDb.runTransaction(async tx => {
	          const snap = await tx.get(ref);
	          if (raceLost) throw new Error('Superseded by REST fallback after Firestore push timeout');
	          const currentData = snap.exists && snap.data() ? snap.data() : null;
	          const serverCalendar = currentData ? currentData.calendar : null;
	          let nextCalendar;
	          if (!serverCalendar) {
	            nextCalendar = normalizedCal;
	          } else if (saveMode === 'restore') {
	            nextCalendar = normalizedCal;
	          } else if (saveMode === 'replace') {
	            throw new Error(`Refusing to replace existing calendar ${normalizedCal.id}`);
	          } else if (saveMode === 'settings') {
	            nextCalendar = mergeCalendarSettingsDelta(serverCalendar, normalizedCal);
	          } else if (saveMode === 'polls') {
	            nextCalendar = mergeCalendarPollsDelta(serverCalendar, normalizedCal, lastModified);
	          } else {
	            nextCalendar = mergeCalendarAvailabilityDelta(serverCalendar, normalizedCal, lastModified);
	          }
	          const mergedCalendar = normalizeCalendarForSave(nextCalendar);
	          const nextDocRevision = (currentData?.revision || 0) + 1;
	          mergedCalendar.revision = Math.max(serverCalendar?.revision || 0, normalizedCal.revision || 0) + 1;
	          mergedCalendar.updatedAt = Math.max(mergedCalendar.updatedAt || 0, lastModified || 0);
	          // activityLogs lives in its own subcollection now -- see writeActivityLogsToFirestore
	          // below. Capture any still-present legacy embedded entries so they get copied over
	          // (self-healing migration) instead of silently disappearing on this overwrite.
	          // Validation and the size guard run against the stripped payload (the actual write),
	          // not mergedCalendar, so a legacy activityLogs array being migrated away doesn't
	          // count against a size limit it's no longer part of.
	          legacyActivityLogs = [
	            ...(Array.isArray(serverCalendar?.activityLogs) ? serverCalendar.activityLogs : []),
	            ...(Array.isArray(normalizedCal?.activityLogs) ? normalizedCal.activityLogs : [])
	          ];
	          // places/confirmedMeeting get the same self-healing subcollection migration as
	          // activityLogs above, gated behind ENABLE_PLACES_SUBCOLLECTION_MIGRATION (see its
	          // declaration) -- deduped by their own key since server/normalized can both still
	          // carry legacy-embedded copies of an entry already migrated on a prior save.
	          let docCalendar = stripEmbeddedActivityLogsField(mergedCalendar);
	          if (ENABLE_PLACES_SUBCOLLECTION_MIGRATION) {
	            const legacyPlacesById = new Map();
	            [...(Array.isArray(serverCalendar?.places) ? serverCalendar.places : []), ...(Array.isArray(normalizedCal?.places) ? normalizedCal.places : [])]
	              .forEach(p => { if (p?.id) legacyPlacesById.set(p.id, p); });
	            legacyPlaces = Array.from(legacyPlacesById.values());
	            const legacyMeetingsByDate = new Map();
	            [...(Array.isArray(serverCalendar?.confirmedMeeting) ? serverCalendar.confirmedMeeting : []), ...(Array.isArray(normalizedCal?.confirmedMeeting) ? normalizedCal.confirmedMeeting : [])]
	              .forEach(m => { if (m?.date) legacyMeetingsByDate.set(m.date, m); });
	            legacyConfirmedMeetings = Array.from(legacyMeetingsByDate.values());
	            docCalendar = stripEmbeddedConfirmedMeetingField(stripEmbeddedPlacesField(docCalendar));
	          }
	          const validationError = validateCalendarShape(docCalendar);
	          if (validationError) throw new Error(validationError);
	          if (estimateCalendarDocWireBytes(docCalendar) > CALENDAR_DOC_SAFE_BYTE_LIMIT) {
	            throw new Error('캘린더 데이터가 너무 커져 더 이상 저장할 수 없습니다. 관리자에게 문의해 주세요.');
	          }
	          tx.set(ref, {
	            calendar: docCalendar,
	            lastModified,
	            revision: nextDocRevision
	          });
	        }),
	        new Promise((_, reject) => setTimeout(() => { raceLost = true; reject(new Error('Firestore push timeout')); }, 8000))
	      ]);
	      const logsToPersist = [...legacyActivityLogs, ...(Array.isArray(newActivityLogs) ? newActivityLogs : [])];
	      if (logsToPersist.length) {
	        writeActivityLogsToFirestore(normalizedCal.id, logsToPersist).catch(e => console.warn('Activity log persist failed:', e));
	      }
	      if (legacyPlaces.length) {
	        writePlacesToFirestore(normalizedCal.id, legacyPlaces).catch(e => console.warn('Places persist failed:', e));
	      }
	      if (legacyConfirmedMeetings.length) {
	        writeConfirmedMeetingsToFirestore(normalizedCal.id, legacyConfirmedMeetings).catch(e => console.warn('Confirmed meetings persist failed:', e));
	      }
	      return true;
    } catch (e) {
      console.warn(`Firestore push notice for cal_${normalizedCal.id}:`, e);
    }
  }
  return pushSingleCalendarWithRest(normalizedCal, lastModified, saveMode, retryCount, newActivityLogs);
}
function loadLocalMeta() {
  try {
    const ls = __gatherSafeLocalStorage();
    if (!ls) return { lastModified: 0, byCalendar: {} };
    const raw = ls.getItem(GATHER_LOCAL_META_KEY);
    if (!raw) return { lastModified: 0, byCalendar: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { lastModified: 0, byCalendar: {} };
    return {
      lastModified: typeof parsed.lastModified === 'number' ? parsed.lastModified : 0,
      byCalendar: parsed.byCalendar && typeof parsed.byCalendar === 'object' ? parsed.byCalendar : {}
    };
  } catch (_) {
    return { lastModified: 0, byCalendar: {} };
  }
}
function saveLocalMeta(meta) {
  try {
    const ls = __gatherSafeLocalStorage();
    if (!ls || !meta) return;
    ls.setItem(GATHER_LOCAL_META_KEY, JSON.stringify({
      lastModified: typeof meta.lastModified === 'number' ? meta.lastModified : 0,
      byCalendar: meta.byCalendar && typeof meta.byCalendar === 'object' ? meta.byCalendar : {}
    }));
  } catch (e) {
    console.warn('saveLocalMeta notice:', e);
  }
}

function getMetaLastModified(meta, calendarId) {
  if (!meta) return 0;
  if (calendarId && meta.byCalendar && typeof meta.byCalendar[calendarId] === 'number') {
    return meta.byCalendar[calendarId];
  }
  return typeof meta.lastModified === 'number' ? meta.lastModified : 0;
}

function updateMetaLastModified(meta, calendarId, lastModified) {
  const next = {
    ...(meta || {}),
    lastModified: Math.max(getMetaLastModified(meta), lastModified || 0),
    byCalendar: {
      ...((meta && meta.byCalendar) || {})
    }
  };
  if (calendarId) next.byCalendar[calendarId] = lastModified || 0;
  return next;
}

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

// Makes the admin 통합검색결과 page addressable/bookmarkable/back-button-navigable as its own
// URL (?admin=1&search=<query>) instead of only existing as in-memory component state.
function getAdminSearchQueryFromUrl() {
  if (!isAdminDashboardRoute()) return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('search') || null;
}

// Same idea as getAdminSearchQueryFromUrl, for the 통합검색결과 page's 캘린더/기간 filters
// (?cal=<id|all>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>).
function getAdminSearchFilterFromUrl() {
  if (!isAdminDashboardRoute()) return { calFilter: 'all', dateStart: '', dateEnd: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    calFilter: params.get('cal') || 'all',
    dateStart: params.get('from') || '',
    dateEnd: params.get('to') || ''
  };
}

function createDefaultCalendar(id) {
  const now = Date.now();
  return {
    id,
    title: `${id} 사모임 캘린더`,
    description: `${id} 멤버들의 참석 가능 일자를 표기해 주세요`,
    updatedAt: now,
    revision: 1,
    participants: [{
      id: `${id}_p1`,
      name: '참여자 1',
      color: '#EF4444',
      updatedAt: now
    }, {
      id: `${id}_p2`,
      name: '참여자 2',
      color: '#3B82F6',
      updatedAt: now
    }, {
      id: `${id}_p3`,
      name: '참여자 3',
      color: '#10B981',
      updatedAt: now
    }],
	    availabilities: [],
	    activityLogs: [],
	    polls: [],
	    expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
	    places: [],
	    placeCategories: DEFAULT_PLACE_CATEGORIES,
	    settlementBaseBudget: 0,
	    deletedActivityLogIds: []
	  };
	}

function getMonthKey(dateStr) {
  return isValidDateString(dateStr) ? dateStr.slice(0, 7) : 'unknown';
}

function estimateFirestoreDocumentSize(calendar) {
  return new Blob([JSON.stringify({
    calendar,
    lastModified: calendar?.updatedAt || 0,
    revision: calendar?.revision || 0
  })]).size;
}

function estimateMonthlyOutboundBytes(calendarStats) {
  const totalDocBytes = calendarStats.reduce((sum, stat) => sum + stat.sizeBytes, 0);
  // 현재 앱은 접속 시 해당 캘린더 문서 1개와 관리자 화면의 전체 문서를 읽습니다.
  // 여유 산정을 위해 하루 60회 전체 로드 + 동시 편집 동기화 여유분을 더한 보수적 추정치입니다.
  return Math.round(totalDocBytes * 60 * 30 * 1.5);
}

function buildServiceUsageMetrics(calendarStats) {
  const totalStorageBytes = calendarStats.reduce((sum, stat) => sum + stat.sizeBytes, 0);
  const totalWritesPerFullRound = calendarStats.reduce((sum, stat) => sum + stat.schedules.length, 0);
  const monthlyOutboundBytes = estimateMonthlyOutboundBytes(calendarStats);
  return [{
    label: 'Firestore 저장공간',
    used: formatBytes(totalStorageBytes),
    limit: formatBytes(FIRESTORE_FREE_LIMITS.storageBytes),
    remaining: formatBytes(Math.max(0, FIRESTORE_FREE_LIMITS.storageBytes - totalStorageBytes)),
    percent: totalStorageBytes / FIRESTORE_FREE_LIMITS.storageBytes * 100,
    note: '운영 캘린더 문서 2개의 현재 JSON 크기 기준'
  }, {
    label: '단일 문서 최대치',
    used: `${Math.max(0, ...calendarStats.map(stat => stat.sizePercent)).toFixed(1)}%`,
    limit: formatBytes(FIRESTORE_FREE_LIMITS.documentBytes),
    remaining: '75% 이상부터 경고',
    percent: Math.max(0, ...calendarStats.map(stat => stat.sizePercent)),
    note: '캘린더 1개 문서가 커질수록 저장 실패 위험 증가'
  }, {
    label: 'Firestore 읽기',
    used: '접속당 1~2회',
    limit: `${FIRESTORE_FREE_LIMITS.readsPerDay.toLocaleString('ko-KR')}회/일`,
    remaining: '현재 규모 여유',
    percent: 0.2,
    note: '관리자 화면은 전체 캘린더 문서를 한 번에 읽음'
  }, {
    label: 'Firestore 쓰기',
    used: '저장당 1회',
    limit: `${FIRESTORE_FREE_LIMITS.writesPerDay.toLocaleString('ko-KR')}회/일`,
    remaining: '현재 규모 여유',
    percent: Math.min(100, totalWritesPerFullRound / FIRESTORE_FREE_LIMITS.writesPerDay * 100),
    note: '참여자 8명이 자주 입력해도 일 2만 회까지는 큰 여유'
  }, {
    label: 'Firestore 전송량',
    used: formatBytes(monthlyOutboundBytes),
    limit: `${formatBytes(FIRESTORE_FREE_LIMITS.outboundBytesPerMonth)}/월`,
    remaining: formatBytes(Math.max(0, FIRESTORE_FREE_LIMITS.outboundBytesPerMonth - monthlyOutboundBytes)),
    percent: monthlyOutboundBytes / FIRESTORE_FREE_LIMITS.outboundBytesPerMonth * 100,
    note: '보수적 월간 사용 추정치'
  }, {
    label: 'GitHub Pages',
    used: '정적 파일 배포',
    limit: `${formatBytes(GITHUB_PAGES_FREE_LIMITS.bandwidthBytesPerMonth)}/월`,
    remaining: '현재 규모 여유',
    percent: 0.1,
    note: `사이트 1GB, 기본 빌드 ${GITHUB_PAGES_FREE_LIMITS.buildsPerHour}회/시간 제한 기준`
  }];
}

function createCalendarBackupPayload(calendarsList, targetCalendarId = '') {
  const selected = targetCalendarId
    ? calendarsList.filter(calendar => calendar.id === targetCalendarId)
    : calendarsList.filter(calendar => isValidCalendarId(calendar.id));
  return {
    type: 'gather-calendar-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    projectId: firebaseConfig.projectId,
    calendarIds: selected.map(calendar => calendar.id),
    calendars: selected.map(calendar => ({
      docId: `cal_${calendar.id}`,
      data: {
        calendar: normalizeCalendarForSave(calendar),
        lastModified: calendar.updatedAt || Date.now(),
        revision: calendar.revision || 0
      }
    }))
  };
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Minimal RFC 5545 (.ics) export for a single confirmed-meeting date -- an all-day VEVENT with
// the calendar's title as SUMMARY and any admin note / participant memos folded into
// DESCRIPTION, so a confirmed date can be dropped straight into Google/Apple/Outlook Calendar.
function escapeICSText(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function formatICSDateOnly(dateStr) {
  return dateStr.replace(/-/g, '');
}

// 'YYYY-MM-DD' -> '260802' -- the app's own hashtag convention for meeting dates (see the
// \d{6} case in linkTaggedImageToMeetingDates' date-token parser), so a photo auto-tagged with
// its meeting date links up exactly the same way a manually typed "#260802" tag would.
function dateStrToHashtag(dateStr) {
  return isValidDateString(dateStr) ? dateStr.replace(/-/g, '').slice(2) : '';
}

function addDaysToDateStr(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildICSTimestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

// Wraps one VEVENT per {dateStr, description} entry in a single VCALENDAR, so every confirmed
// meeting for a calendar can be imported at once instead of one file per date.
function buildCalendarConfirmedMeetingsICS(calendar, events) {
  const dtstamp = buildICSTimestamp();
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//모여라 캘린더//KO', 'CALSCALE:GREGORIAN'];
  events.forEach(({ dateStr, description }) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${calendar.id}_${dateStr}@moyeora-calendar`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${formatICSDateOnly(dateStr)}`,
      `DTEND;VALUE=DATE:${formatICSDateOnly(addDaysToDateStr(dateStr, 1))}`,
      `SUMMARY:${escapeICSText(`${calendar.title} 모임`)}`
    );
    if (description) lines.push(`DESCRIPTION:${escapeICSText(description)}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Per-date description: the admin's own confirmation note plus every participant's memo for
// that date, same content the old per-row export used to show.
function buildConfirmedMeetingDescription(calendar, dateStr) {
  const meeting = getTrulyConfirmedMeetings(calendar).find(m => m.date === dateStr);
  const participantsMap = getActiveParticipants(calendar).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  const memoLines = getActiveAvailabilities(calendar)
    .filter(item => item.date === dateStr && item.note && item.note.trim())
    .map(item => `${participantsMap[item.participantId]?.name || ''}: ${item.note}`.trim())
    .join('\n');
  return [meeting?.note, memoLines].filter(Boolean).join('\n\n');
}

function exportCalendarConfirmedMeetingsToICS(calendar) {
  const dates = getTrulyConfirmedMeetings(calendar).map(m => m.date).sort();
  const events = dates.map(dateStr => ({ dateStr, description: buildConfirmedMeetingDescription(calendar, dateStr) }));
  const ics = buildCalendarConfirmedMeetingsICS(calendar, events);
  downloadTextFile(`${calendar.id}_confirmed_meetings.ics`, ics, 'text/calendar');
}

function extractCalendarsFromBackup(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.calendar) return [payload.calendar];
  if (payload.data?.calendar) return [payload.data.calendar];
  if (Array.isArray(payload.calendars)) {
    return payload.calendars.map(item => item?.data?.calendar || item?.calendar || item).filter(Boolean);
  }
  return [];
}

function validateBackupCalendars(calendarsList) {
  const normalized = calendarsList
    .map(normalizeCalendarForSave)
    .filter(calendar => calendar && isValidCalendarId(calendar.id));
  const uniqueById = new Map();
  normalized.forEach(calendar => uniqueById.set(calendar.id, calendar));
  const result = Array.from(uniqueById.values());
  if (result.length === 0) return { calendars: [], error: '복구 가능한 데이터 없음' };
  for (const calendar of result) {
    const validationError = validateCalendarShape(calendar);
    if (validationError) return { calendars: [], error: `${calendar.id}: ${validationError}` };
    if (!assertCalendarLinks(calendar)) return { calendars: [], error: `${calendar.id}: 참여자·일정 연결 오류` };
  }
  return { calendars: result, error: '' };
}

function buildAdminDashboardMetrics(calendarsList) {
  // Built from local date components (not toISOString, which is always UTC) so "today"
  // matches the browser's local calendar day -- toISOString() would be a day behind for
  // roughly 9 hours every day for KST users (UTC+9), wrongly counting yesterday's
  // schedules as still upcoming during that window.
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const calendarStats = calendarsList.map(cal => {
    const participants = getActiveParticipants(cal);
    const participantIds = new Set(participants.map(participant => participant.id));
    const schedules = getActiveAvailabilities(cal);
    const polls = getCalendarPolls(cal);
    const pollMetrics = polls.reduce((acc, poll) => {
      const options = getActivePollOptions(poll);
      const optionIds = new Set(options.map(option => option.id));
      const votes = normalizePollVotes(poll.votes || {}, optionIds, participantIds);
      acc.optionCount += options.length;
      Object.values(votes).forEach(voterIds => {
        acc.voteCount += voterIds.length;
        voterIds.forEach(participantId => acc.voterIds.add(participantId));
      });
      return acc;
    }, { optionCount: 0, voteCount: 0, voterIds: new Set() });
    const dateBuckets = new Map();
    const monthBuckets = new Map();
    const participantBuckets = new Map(participants.map(participant => [participant.id, {
      ...participant,
      count: 0,
      memoCount: 0,
      upcomingCount: 0,
      latestDate: ''
    }]));
    let memoCount = 0;
    schedules.forEach(item => {
      if (!dateBuckets.has(item.date)) dateBuckets.set(item.date, []);
      dateBuckets.get(item.date).push(item);
      const monthKey = getMonthKey(item.date);
      monthBuckets.set(monthKey, (monthBuckets.get(monthKey) || 0) + 1);
      const participantStat = participantBuckets.get(item.participantId);
      if (participantStat) {
        participantStat.count += 1;
        if (item.date >= todayStr) participantStat.upcomingCount += 1;
        if (!participantStat.latestDate || item.date > participantStat.latestDate) participantStat.latestDate = item.date;
        if (item.note) participantStat.memoCount += 1;
      }
      if (item.note) memoCount += 1;
    });
    const fullDates = Array.from(dateBuckets.entries())
      .filter(([, items]) => participants.length > 0 && new Set(items.map(item => item.participantId)).size >= participants.length)
      .map(([date, items]) => ({ date, count: items.length }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const popularDates = Array.from(dateBuckets.entries())
      .map(([date, items]) => ({ date, count: new Set(items.map(item => item.participantId)).size }))
      .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))
      .slice(0, 8);
    const participantStats = Array.from(participantBuckets.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const monthStats = Array.from(monthBuckets.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    const storedAvailabilities = Array.isArray(cal.availabilities) ? cal.availabilities.length : 0;
    const deletedCount = storedAvailabilities - schedules.length;
    const sizeBytes = estimateFirestoreDocumentSize(cal);
    const confirmedCount = getTrulyConfirmedMeetings(cal).length;
    return {
      calendar: cal,
      participants,
      schedules,
      pollCount: polls.length,
      pollOptionCount: pollMetrics.optionCount,
      pollVoteCount: pollMetrics.voteCount,
      pollVoterCount: pollMetrics.voterIds.size,
      confirmedCount,
      dateCount: dateBuckets.size,
      upcomingCount: schedules.filter(item => item.date >= todayStr).length,
      pastCount: schedules.filter(item => item.date < todayStr).length,
      memoCount,
      fullDates,
      popularDates,
      participantStats,
      monthStats,
      storedAvailabilities,
      deletedCount,
      sizeBytes,
      sizePercent: Math.round(sizeBytes / 1048576 * 1000) / 10
    };
  });
  const allSchedules = calendarStats.flatMap(stat => stat.schedules.map(item => ({ ...item, calendarId: stat.calendar.id })));
  const totalParticipants = calendarStats.reduce((sum, stat) => sum + stat.participants.length, 0);
  const totalSchedules = allSchedules.length;
  const totalPolls = calendarStats.reduce((sum, stat) => sum + stat.pollCount, 0);
  const totalPollOptions = calendarStats.reduce((sum, stat) => sum + stat.pollOptionCount, 0);
  const totalPollVotes = calendarStats.reduce((sum, stat) => sum + stat.pollVoteCount, 0);
  const totalConfirmedMeetings = calendarStats.reduce((sum, stat) => sum + stat.confirmedCount, 0);
  const uniqueDateCount = new Set(allSchedules.map(item => `${item.calendarId}_${item.date}`)).size;
  const upcomingCount = allSchedules.filter(item => item.date >= todayStr).length;
  const memoCount = allSchedules.filter(item => item.note).length;
  const maxSchedules = Math.max(1, ...calendarStats.map(stat => stat.schedules.length));
  const maxMonthCount = Math.max(1, ...calendarStats.flatMap(stat => stat.monthStats.map(item => item.count)));
  const qualityWarnings = calendarStats.flatMap(stat => {
    const warnings = [];
    if (stat.sizePercent >= 75) warnings.push(`${stat.calendar.id}: Firestore 문서 크기 ${stat.sizePercent}%`);
    if (stat.deletedCount > 200) warnings.push(`${stat.calendar.id}: 삭제 이력 ${stat.deletedCount}건 보존 중`);
    if (stat.participants.length === 0) warnings.push(`${stat.calendar.id}: 활성 참여자 없음`);
    if (stat.schedules.some(item => !stat.participants.some(participant => participant.id === item.participantId))) {
      warnings.push(`${stat.calendar.id}: 참여자와 연결되지 않은 일정 존재`);
    }
    return warnings;
  });
  return {
    calendarStats,
    totalParticipants,
    totalSchedules,
    totalPolls,
    totalPollOptions,
    totalPollVotes,
    totalConfirmedMeetings,
    uniqueDateCount,
    upcomingCount,
    memoCount,
    maxSchedules,
    maxMonthCount,
    qualityWarnings,
    serviceUsage: buildServiceUsageMetrics(calendarStats)
  };
}

const CALENDAR_ACCENT_PALETTE = Array.isArray(GATHER_APP_CONSTANTS.CALENDAR_ACCENT_PALETTE) ? GATHER_APP_CONSTANTS.CALENDAR_ACCENT_PALETTE : ['#F97316', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#F59E0B'];
function getCalendarAccentColor(calOrId, indexInList) {
  const cal = calOrId && typeof calOrId === 'object' ? calOrId : null;
  if (cal && typeof cal.accentColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(cal.accentColor)) {
    return cal.accentColor;
  }
  const calId = cal ? cal.id : calOrId;
  const knownIndex = PUBLIC_CALENDAR_IDS.indexOf(calId);
  const idx = knownIndex >= 0 ? knownIndex : indexInList;
  return CALENDAR_ACCENT_PALETTE[idx % CALENDAR_ACCENT_PALETTE.length];
}

export {
  normalizePollOptionInput,
  normalizePollVotes,
  getPollOptionVoterIds,
  getPollTotalVoteCount,
  isPollClosed,
  formatPollDeadline,
  normalizePoll,
  mergePollRecord,
  mergePolls,
  buildActivityLogsFromAvailabilities,
  validateCalendarShape,
  normalizeCalendarForSave,
  assertCalendarLinks,
  mergeParticipantRecord,
  mergeAvailabilityRecord,
  mergeCalendarRecord,
  mergeCalendarAvailabilityDelta,
  mergeCalendarSettingsDelta,
  mergeCalendarPollsDelta,
  cloneCalendar,
  cloneCalendarList,
  mergeCalendarCollections,
  INITIAL_CALENDARS,
  GATHER_LOCAL_CACHE_KEY,
  GATHER_LOCAL_META_KEY,
  __gatherSafeLocalStorage,
  loadLocalCache,
  saveLocalCache,
  isLoadingCalendarShell,
  isUsableCalendarRecord,
  getLoadingCalendarTitle,
  createLoadingCalendarShell,
  bindGatherFirebaseDeps,
  subscribeMessages,
  subscribePlaces,
  subscribeMemos,
  subscribeAnniversaries,
  firebaseConfig,
  firebaseDb,
  __setFirebaseDb,
  firebaseInitError,
  firebaseStorage,
  isStorageDisabled,
  lastStorageHealthCheckAt,
  lastStorageHealthOk,
  STORAGE_HEALTH_RECHECK_COOLDOWN_MS,
  checkFirebaseStorageHealth,
  VISIBILITY_RECONNECT_THRESHOLD_MS,
  lastHiddenAt,
  fetchSingleCalendarWithRest,
  fetchRecentMessagesRest,
  fetchChatMessagesRest,
  fetchRecentChatMessages,
  fetchRecentGalleryMessages,
  CHAT_OLDER_PAGE_SIZE,
  MAX_OLDER_CHAT_MESSAGES,
  fetchSubcollectionCount,
  fetchOlderChatMessages,
  fetchMessageOrdinal,
  fetchGalleryPhotoOrdinal,
  fetchGalleryItemCount,
  fetchMemosRest,
  fetchAnniversariesRest,
  sendChatMessageRest,
  deleteMessageRest,
  fetchMessageRest,
  updateMessageRest,
  waitForTimeout,
  fetchSingleCloudCalendar,
  isUsableCloudCalendarPayload,
  getCloudDocCalendar,
  firestoreValueToJs,
  jsToFirestoreValue,
  firestoreDocumentToJs,
  getImageSharePageUrl,
  sanitizeShareIdPart,
  createImageShareDocument,
  fetchImageShareDocument,
  estimateCalendarDocWireBytes,
  stripEmbeddedActivityLogsField,
  writeActivityLogsToFirestore,
  fetchActivityLogsFromFirestore,
  deleteActivityLogsAfterTimestamp,
  stripEmbeddedPlacesField,
  writePlacesToFirestore,
  fetchPlacesFromFirestore,
  stripEmbeddedConfirmedMeetingField,
  writeConfirmedMeetingsToFirestore,
  fetchConfirmedMeetingsFromFirestore,
  isRetryableFirestoreConflict,
  describeUpdateCalendarsFailure,
  getFirestoreRetryDelay,
  pushSingleCalendarWithRest,
  pushSingleCloudCalendar,
  loadLocalMeta,
  saveLocalMeta,
  getMetaLastModified,
  updateMetaLastModified,
  isAdminDashboardRoute,
  isAdminRestoreRoute,
  getAdminSelectedCalendarIdFromUrl,
  getAdminSearchQueryFromUrl,
  getAdminSearchFilterFromUrl,
  createDefaultCalendar,
  getMonthKey,
  estimateFirestoreDocumentSize,
  estimateMonthlyOutboundBytes,
  buildServiceUsageMetrics,
  createCalendarBackupPayload,
  downloadJsonFile,
  downloadTextFile,
  escapeICSText,
  formatICSDateOnly,
  dateStrToHashtag,
  addDaysToDateStr,
  buildICSTimestamp,
  buildCalendarConfirmedMeetingsICS,
  buildConfirmedMeetingDescription,
  exportCalendarConfirmedMeetingsToICS,
  extractCalendarsFromBackup,
  validateBackupCalendars,
  buildAdminDashboardMetrics,
  CALENDAR_ACCENT_PALETTE,
  getCalendarAccentColor
};
