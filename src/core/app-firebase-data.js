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
  withTimeout,
  getMessageImageEntries,
  getMessageDirectMediaEntry,
  sanitizeMessageForFirestore,
  formatBytes,
  getDataUrlInfo,
  omitUndefinedDeep,
} from './app-domain-helpers.js';
import { enqueueWriteOperation } from './app-write-queue.js';
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const FIRESTORE_REQUEST_TIMEOUT_MS = 12000;
const FIRESTORE_WRITE_DEADLINE_MS = 7000;
const FIRESTORE_WRITE_ATTEMPT_TIMEOUT_MS = 4000;

// Bound every REST request. A half-open mobile connection can otherwise leave fetch pending
// forever, which keeps the save overlay and disabled controls visible indefinitely.
async function fetchFirestoreRequest(url, init = {}, timeoutMs = FIRESTORE_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, cache: 'no-store', signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
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
    const { inputValue: _inputValue, ...storedOption } = option || {};
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
  const confirmedMeetings = normalizeConfirmedMeetingsForSave(calendar.confirmedMeeting || []);
	  const deletedActivityLogIds = normalizeDeletedActivityLogIds(calendar.deletedActivityLogIds || []);
	  const expenseCategories = normalizeExpenseCategories(calendar.expenseCategories);
	  if (participants.length > 80) return '참여자가 너무 많습니다.';
	  if (availabilities.length > 5000) return '일정 데이터가 너무 많습니다.';
	  if (activityLogs.length > 5000) return '활동 로그가 너무 많습니다.';
	  if (polls.length > 100) return '투표 데이터가 너무 많습니다.';
	  if (confirmedMeetings.length > 5000) return '확정 모임 데이터가 너무 많습니다.';
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
  const normalizedConfirmedMeetings = normalizeConfirmedMeetingsForSave(cloned.confirmedMeeting || []);
  const deletedActivityLogIds = getDeletedActivityLogIds(cloned);

  return omitUndefinedDeep({
    ...cloned,
	    participants: normalizedParticipants,
	    availabilities: Array.from(availabilityMap.values()),
	    activityLogs: normalizedActivityLogs,
	    polls: normalizedPolls,
	    confirmedMeeting: normalizedConfirmedMeetings,
	    expenseCategories: normalizeExpenseCategories(cloned.expenseCategories),
	    places: normalizePlaces(cloned.places),
	    placeCategories: normalizePlaceCategories(cloned.placeCategories),
	    settlementBaseBudget: Number.isFinite(Number(cloned.settlementBaseBudget)) ? Math.max(0, Math.round(Number(cloned.settlementBaseBudget))) : 0,
	    deletedActivityLogIds
	  });
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
  if (incomingStamp >= existingStamp) {
    return {
      ...existingClone,
      ...incomingClone,
      deletedAt: incomingClone.deletedAt || null
    };
  }
  return existingClone;
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
    confirmedMeeting: mergeConfirmedMeetings(base.confirmedMeeting || [], next.confirmedMeeting || []),
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
    // Preserve unrelated calendar-document fields when an availability-only write is
    // performed. These fields used to disappear from the merged write payload, which was
    // especially damaging for settlement cards because the next realtime snapshot then
    // legitimately contained the previous/empty card set on other devices.
    expenseCategories: incoming.expenseCategories !== undefined ? incoming.expenseCategories : base.expenseCategories,
    settlementCards: incoming.settlementCards !== undefined ? incoming.settlementCards : base.settlementCards,
    places: incoming.places !== undefined ? incoming.places : base.places,
    placeCategories: incoming.placeCategories !== undefined ? incoming.placeCategories : base.placeCategories,
    settlementBaseBudget: incoming.settlementBaseBudget !== undefined ? incoming.settlementBaseBudget : base.settlementBaseBudget,
    updatedAt: Math.max(base.updatedAt || 0, incoming.updatedAt || 0, changedAt || 0),
    revision: Math.max(base.revision || 0, incoming.revision || 0)
  };
}

function mergeConfirmedMeetings(serverList = [], incomingList = []) {
  const byDate = new Map();
  (Array.isArray(serverList) ? serverList : []).forEach(m => {
    const normalized = normalizeConfirmedMeetingRecord(m);
    if (normalized?.date) byDate.set(normalized.date, normalized);
  });
  (Array.isArray(incomingList) ? incomingList : []).forEach(m => {
    const normalized = normalizeConfirmedMeetingRecord(m);
    if (!normalized?.date) return;
    const existing = byDate.get(normalized.date);
    if (!existing) {
      byDate.set(normalized.date, normalized);
      return;
    }
    const existingStamp = Number(existing.updatedAt || existing.confirmedAt || existing.createdAt || 0) || 0;
    const incomingStamp = Number(normalized.updatedAt || normalized.confirmedAt || normalized.createdAt || 0) || 0;
    const base = incomingStamp >= existingStamp ? { ...existing, ...normalized } : { ...normalized, ...existing };
    byDate.set(normalized.date, {
      ...base,
      // The meeting timestamp determines the authoritative snapshot. Unioning arrays here
      // would resurrect an expense/photo that a newer client intentionally deleted.
      photos: base.photos,
      expenses: base.expenses
    });
  });
  return Array.from(byDate.values());
}

// Unlike confirmedMeeting/activityLogs/polls (already keyed-merged above), settlementCards used
// to be carried through mergeCalendarSettingsDelta as a single blind "incoming wins if present"
// value -- fine for the settlement-card handlers themselves, but every OTHER 'settings'-mode save
// (title/description, weather region, notices, places, admin settings, ...) also sends the whole
// activeCal object, settlementCards included. A device whose local settlementCards snapshot was
// even slightly stale (e.g. it hadn't yet received someone else's settlement edit over the
// realtime listener) would silently stomp that edit back to the old value the next time it saved
// anything else in 'settings' mode -- a plausible root cause for "정산 수정이 다른 기기에 반영 안
//됨" reports that recur across unrelated devices/browsers rather than a connectivity issue.
// Merged by id instead, newest `updatedAt` (or `deletedAt` for a tombstoned card -- see
// getCalendarSettlementCards' isTombstone filter) wins per card, same pattern as
// mergeConfirmedMeetings below.
function mergeSettlementCards(serverList = [], incomingList = []) {
  const byId = new Map();
  (Array.isArray(serverList) ? serverList : []).forEach(card => {
    if (card?.id) byId.set(card.id, card);
  });
  (Array.isArray(incomingList) ? incomingList : []).forEach(card => {
    if (!card?.id) return;
    const existing = byId.get(card.id);
    if (!existing) {
      byId.set(card.id, card);
      return;
    }
    const existingStamp = Number(existing.updatedAt || existing.deletedAt || existing.createdAt || 0) || 0;
    const incomingStamp = Number(card.updatedAt || card.deletedAt || card.createdAt || 0) || 0;
    byId.set(card.id, incomingStamp >= existingStamp ? card : existing);
  });
  return Array.from(byId.values());
}

const CALENDAR_SETTINGS_FIELDS = new Set([
  'title',
  'description',
  'accentColor',
  'participants',
  'expenseCategories',
  'placeCategories',
  'settlementBaseBudget',
  'settlementCards',
  'places',
  'confirmedMeeting',
  'weatherLocation',
  'recentLocations',
  'pinnedNotices',
  'pinnedNotice'
]);

function normalizeSettingsFields(settingsFields) {
  return new Set((Array.isArray(settingsFields) ? settingsFields : [])
    .map(field => String(field || '').trim())
    .filter(field => CALENDAR_SETTINGS_FIELDS.has(field)));
}

function mergeCalendarSettingsDelta(serverCalendar, incomingCalendar, settingsFields = []) {
  const server = cloneCalendar(serverCalendar) || {};
  const incoming = cloneCalendar(incomingCalendar) || {};
  if (server.id && incoming.id && server.id !== incoming.id) {
    throw new Error(`Calendar ID mismatch: ${server.id} cannot be saved as ${incoming.id}`);
  }
  const calendarId = incoming.id || server.id;
  const serverActiveCount = getActiveParticipants(server).length;
  const incomingActiveCount = getActiveParticipants(incoming).length;
  const intendedFields = normalizeSettingsFields(settingsFields);
  if (intendedFields.has('participants') && serverActiveCount > 0 && incomingActiveCount === 0) {
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

  const merged = {
    ...server,
    id: calendarId,
    participants: intendedFields.has('participants') ? Array.from(participantMap.values()) : (server.participants || []),
    availabilities: server.availabilities || [],
    activityLogs: mergeActivityLogs(server.activityLogs || [], incoming.activityLogs || [], calendarId, new Set(Array.from(participantMap.values()).map(participant => participant.id))),
    polls: mergePolls(server.polls || [], incoming.polls || [], calendarId, new Set(Array.from(participantMap.values()).map(participant => participant.id))),
    deletedActivityLogIds: mergeDeletedActivityLogIds(server.deletedActivityLogIds || [], incoming.deletedActivityLogIds || []),
    confirmedMeeting: intendedFields.has('confirmedMeeting')
      ? mergeConfirmedMeetings(server.confirmedMeeting || [], incoming.confirmedMeeting || [])
      : (server.confirmedMeeting || []),
    settlementCards: intendedFields.has('settlementCards')
      ? mergeSettlementCards(server.settlementCards || [], incoming.settlementCards || [])
      : (server.settlementCards || []),
    places: intendedFields.has('places') && incoming.places !== undefined ? incoming.places : server.places,
    updatedAt: Math.max(Number(server.updatedAt || 0) || 0, Number(incoming.updatedAt || 0) || 0),
    revision: Math.max(Number(server.revision || 0) || 0, Number(incoming.revision || 0) || 0)
  };
  intendedFields.forEach(field => {
    if (field === 'participants' || field === 'confirmedMeeting' || field === 'settlementCards' || field === 'places') return;
    if (Object.prototype.hasOwnProperty.call(incoming, field)) merged[field] = incoming[field];
  });
  return merged;
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
    settlementCards: Array.isArray(calendar.settlementCards) ? calendar.settlementCards.map(card => ({ ...card })) : [],
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
const INITIAL_CALENDARS = ['kkot', 'cw', 'jhair'].map(id => ({
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

const GATHER_LOCAL_CACHE_KEY = 'gather_calendars_cache_v5';
const GATHER_LOCAL_META_KEY = 'gather_calendars_meta_v5';

function __gatherSafeLocalStorage() {
  try { return window.localStorage; } catch (_) { return null; }
}

function loadLocalCache() {
  // Deliberately disabled. Calendar data is collaborative and must never render from a
  // previous browser session before the server snapshot arrives. Remove the old keys once so
  // an upgrade also stops retaining the legacy full-calendar payload on the device.
  try {
    const ls = __gatherSafeLocalStorage();
    if (!ls) return [];
    ['v1', 'cache_v1', 'cache_v2', 'cache_v3', 'cache_v4', 'cache_v5'].forEach(v => {
      try { ls.removeItem(`gather_calendars_${v}`); } catch (_) {}
    });
  } catch (e) {
    // Storage may be unavailable in private browsing; that is fine because the cache is not
    // required for the server-first loading path.
  }
  return [];
}

function saveLocalCache(list) {
  // Intentionally no-op: localStorage is not a source of truth for collaborative calendar data.
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
    // This binding runs before the module-level page-size constant is initialized. Read the
    // config directly here instead of touching the later lexical binding (which is in TDZ).
    CHAT_OLDER_PAGE_SIZE: readConfigNumber('CHAT_OLDER_PAGE_SIZE', 40)
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
if (typeof window !== 'undefined' && window.__GATHER_FIREBASE_STATE_VERSION == null) window.__GATHER_FIREBASE_STATE_VERSION = 0;
function getFirebaseSdkVersion() {
  if (typeof window !== 'undefined' && window.__GATHER_FIREBASE_SDK_VERSION) return window.__GATHER_FIREBASE_SDK_VERSION;
  let version;
  try {
    const url = new URL(import.meta.url, window.location.href);
    version = `${url.pathname.split('/').pop() || ''}${url.search || ''}`;
  } catch (_) {
    version = String(Date.now());
  }
  if (typeof window !== 'undefined') window.__GATHER_FIREBASE_SDK_VERSION = version;
  return version;
}
function resolveFirebaseSdkUrl(src) {
  const absolute = new URL(src, window.location.href);
  absolute.searchParams.set('v', getFirebaseSdkVersion());
  return absolute.toString();
}
function notifyFirebaseStateChange() {
  if (typeof window === 'undefined') return;
  window.__GATHER_FIREBASE_STATE_VERSION = Number(window.__GATHER_FIREBASE_STATE_VERSION || 0) + 1;
  try {
    window.dispatchEvent(new Event('gather-firebase-state-change'));
  } catch (_) {}
}
function __setFirebaseDb(v){
  if (firebaseDb === v) return;
  firebaseDb = v;
  if (typeof window!=="undefined") window.__gatherFirebaseDb = v;
  notifyFirebaseStateChange();
}

let firebaseStorage = null;

// Set whenever attemptFirebaseInit() ends up NOT producing a usable firebaseDb, with enough
// detail to tell apart "script never loaded" from "loaded but threw" from an actual SDK error
// code/message. Four rounds of guessing at this from code alone (timeouts, retries, a bad API
// key) each failed to actually fix the recurring "연결 오류" report, because none of them were
// backed by the real error -- this exists so the next report carries hard evidence instead of
// another theory. Also mirrored onto window.__gatherFirebaseInitError for direct DevTools
// inspection regardless of how a consumer imports it.
let firebaseInitError = null;
function __setFirebaseInitError(v) {
  if (firebaseInitError === v) return;
  firebaseInitError = v;
  if (typeof window !== "undefined") window.__gatherFirebaseInitError = v;
  notifyFirebaseStateChange();
}

// PC 웨일 실사용자 콘솔에서 확인된 실제 원인: attemptFirebaseInit()이 백그라운드 재시도 루프를 통해
// 두 번째로 실행되면 firebase.firestore().settings(...)도 다시 호출되는데, Firestore SDK는 같은
// 인스턴스에 settings()가 두 번째로 호출되는 걸 merge:true로 감싸도 "experimentalForceLongPolling
// and experimentalAutoDetectLongPolling cannot be used together"로 거부한다 (이미 시작된 스트림에
// 대해 재적용을 시도하면서 내부적으로 두 옵션이 동시에 해석되는 경우). 이 예외가 나면 그 재시도에서
// 실시간 리스너가 아예 붙지 못한 채로 firestoreDb 참조만 재사용되어, onSnapshot이 평생 한 번도
// 호출되지 않는 상태로 남는다. settings()는 세션당 정확히 한 번만 적용되면 되므로 여기서 막는다.
let firestoreSettingsApplied = false;

// Pulled into its own function so the background retry loop below can re-run it after a fresh
// SDK load, not just once at module evaluation time. Returns true once firebaseDb is actually
// usable.
function attemptFirebaseInit() {
  // Already have a live instance from an earlier successful call -- nothing left to do. Without
  // this, a late-executing duplicate SDK script (see the loadScriptOnce fix in main.jsx) that
  // resets window.firebase to a brand-new object would make a later re-run of this function call
  // firebase.initializeApp()/firebase.firestore() again and silently swap firebaseDb out from
  // under any already-attached onSnapshot listeners.
  if (firebaseDb) return true;
  if (!ENABLE_FIRESTORE_SYNC) { __setFirebaseInitError('ENABLE_FIRESTORE_SYNC=false'); return false; }
  if (typeof firebase === 'undefined') { __setFirebaseInitError('SDK 스크립트 미로딩 (window.firebase undefined)'); return false; }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    __setFirebaseDb(firebase.firestore());
    try {
      // Some networks/browsers (corporate proxies, privacy-hardened browsers like Whale with
      // built-in ad/tracker blocking) allow a single request-response call (the initial doc
      // read, a write) through but silently break Firestore's persistent WebChannel streaming
      // connection -- the one onSnapshot() depends on to push other clients' writes back down.
      // That produces exactly this failure shape: edits save fine and even read back correctly
      // on the very next reload, but a live onSnapshot listener on another device never fires
      // for them, so calendars drift apart until something forces a fresh read.
      //
      // experimentalAutoDetectLongPolling (probe once, fall back to long-polling only if the
      // streaming transport looks unreliable) was tried first and confirmed still not enough on
      // the actually-affected PC Whale browser -- its auto-detection heuristic apparently doesn't
      // catch whatever Whale is doing to the connection. experimentalForceLongPolling skips that
      // heuristic and always uses long-polling, which is slower to establish and slightly
      // chattier per update than native streaming, but works through far more proxies/
      // ad-blockers/browser quirks since it's just repeated plain HTTP requests instead of a
      // persistent bidirectional connection. Worth the small latency cost everywhere given
      // auto-detect's false negative here. Must be called before any other Firestore operation.
      //
      // A live PC Whale console showed this exact call throwing "experimentalForceLongPolling and
      // experimentalAutoDetectLongPolling cannot be used together" on every single page load, not
      // just on a retried/duplicate call -- merge:true was merging our forceLongPolling on top of
      // the SDK's own baked-in default of experimentalAutoDetectLongPolling:true, so the two
      // always collided. Caught by the try/catch below, so this silently never took effect on ANY
      // browser (mobile just happened to work fine on Firestore's untouched default transport;
      // PC Whale didn't). Passing both flags explicitly, without merge, is what actually applies
      // forced long-polling instead of just failing quietly.
      if (!firestoreSettingsApplied) {
        // Safari/WebKit intermittently rejects the forced WebChannel XHR as an access-control
        // failure on image-heavy pages. Let its SDK select the transport automatically; keep the
        // proven forced-long-polling workaround for Whale/Chromium and Firefox.
        const userAgent = typeof navigator !== 'undefined' ? String(navigator.userAgent || '') : '';
        const isAppleWebKit = /AppleWebKit/i.test(userAgent)
          && !/(Chrome|Chromium|Edg|OPR|Whale|SamsungBrowser)/i.test(userAgent);
        firebase.firestore().settings({
          experimentalForceLongPolling: !isAppleWebKit,
          experimentalAutoDetectLongPolling: isAppleWebKit
        });
        firestoreSettingsApplied = true;
      }
    } catch (settingsErr) {
      console.warn('Firestore settings init notice:', settingsErr);
    }
    // Do not enable Firestore IndexedDB persistence. A stale persistent snapshot can survive
    // browser restarts and keep a broken/restricted realtime transport looking healthy while
    // displaying old collaborative data. This app prioritizes server freshness over offline
    // calendar access; Firestore still keeps its normal in-memory state for the live listener.
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
    if (firebaseStorage && typeof window !== 'undefined') {
      window.__gatherFirebaseStorage = firebaseStorage;
      notifyFirebaseStateChange();
    }
  } catch (e) {
    console.warn('Firebase Storage init notice (falling back to inline base64 images):', e);
  }
  if (!firebaseDb) __setFirebaseInitError('firebase.firestore()가 falsy 값을 반환함 (원인 불명)');
  else __setFirebaseInitError(null);
  return Boolean(firebaseDb);
}

const firebaseReadyOnFirstTry = attemptFirebaseInit();

// Set true only once every recovery path has genuinely given up (or, if the background retry
// loop below never even starts, immediately -- nothing will ever bring firebaseDb back up in
// that case). Lets consumers (the "연결 오류" toast in app-main.js) tell a REAL, final failure
// apart from a merely-still-retrying first attempt -- see the note above __setFirebaseInitError
// for why that distinction turned out to matter: a live report showed the toast firing on the
// very first attempt while the app had already (or was about to) recover in the background,
// making a normal transient hiccup look like a persistent outage.
let firebaseRetryExhausted = false;
function __setFirebaseRetryExhausted(v) {
  if (firebaseRetryExhausted === v) return;
  firebaseRetryExhausted = v;
  if (typeof window !== "undefined") window.__gatherFirebaseRetryExhausted = v;
  notifyFirebaseStateChange();
}

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
    const resolvedSrc = resolveFirebaseSdkUrl(src);
    const timer = setTimeout(() => { if (settled) return; settled = true; reject(new Error('timeout')); }, timeoutMs);
    const el = document.createElement('script');
    el.src = resolvedSrc;
    el.onload = () => { if (settled) return; settled = true; clearTimeout(timer); resolve(); };
    el.onerror = () => { if (settled) return; settled = true; clearTimeout(timer); reject(new Error('load failed')); };
    document.head.appendChild(el);
  });
  const needsFirebaseSdkReload = () => (
    typeof firebase === 'undefined' ||
    typeof firebase.firestore !== 'function' ||
    typeof firebase.storage !== 'function'
  );
  let bgAttempts = 0;
  const bgRetryTimer = setInterval(async () => {
    bgAttempts += 1;
    if (firebaseDb) {
      clearInterval(bgRetryTimer);
      return;
    }
    if (bgAttempts > FIREBASE_BG_RETRY_MAX_ATTEMPTS) {
      clearInterval(bgRetryTimer);
      __setFirebaseRetryExhausted(true);
      return;
    }
    try {
      // If the Firebase compat globals are missing OR incomplete, reload all three vendor files.
      // A partial previous load (app-compat attached but firestore/storage did not, or a cached
      // stale copy of one script survived a deploy) is exactly the kind of half-broken state that
      // left the app stuck showing local cache with `연결 안 됨` forever: `firebase` existed, so
      // the retry loop skipped reloading, but `firebase.firestore()` still failed every time.
      if (needsFirebaseSdkReload()) {
        for (const url of FIREBASE_SDK_URLS) {
          await loadFirebaseScriptOnce(url, 15000);
        }
      }
      if (attemptFirebaseInit()) clearInterval(bgRetryTimer);
    } catch (e) {
      // Best-effort background retry -- stay silent and let the next tick try again.
    }
  }, FIREBASE_BG_RETRY_INTERVAL_MS);
} else if (!firebaseReadyOnFirstTry) {
  // No retry loop will ever run here (SSR/non-browser context, or ENABLE_FIRESTORE_SYNC off) --
  // nothing more is coming, so this is already the final state.
  __setFirebaseRetryExhausted(true);
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
    const probeTask = probeRef.put(blob);
    let probeTimeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      probeTimeoutId = setTimeout(() => {
        try { probeTask.cancel(); } catch (_) {}
        reject(new Error('PROBE_TIMEOUT'));
      }, 5000);
    });
    try {
      await Promise.race([probeTask, timeoutPromise]);
    } finally {
      clearTimeout(probeTimeoutId);
    }
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
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !firebaseDb) return;
    firebaseDb.enableNetwork().catch(() => {});
  });
}

async function fetchSingleCalendarWithRest(calId, timeoutMs = FIREBASE_LOAD_TIMEOUT_MS) {
  if (!isAllowedCalendarId(calId)) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const docUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}`;
    // This endpoint is our last-resort server-truth path. Explicitly bypass the browser HTTP
    // cache: a normal tab must not be able to replay an older Firestore REST response while an
    // incognito tab sees the current document.
    const response = await fetch(docUrl, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) return null;
    const decoded = firestoreDocumentToJs(await response.json());
    if (decoded?.calendar?.id !== calId) return null;
    return {
      calendar: decoded.calendar,
      lastModified: decoded.lastModified || decoded.calendar.updatedAt || 0,
      revision: Number(decoded.revision || decoded.calendar.revision || 0) || 0
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
    const res = await fetchFirestoreRequest(url);
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

async function fetchAllChatMessagesRest() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchAllChatMessagesRest === 'function' && !svc.isScaffold) {
    return svc.fetchAllChatMessagesRest.apply(null, arguments);
  }
  console.warn('fetchAllChatMessagesRest: GATHER_FIREBASE_SERVICES missing');
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

async function fetchMessagesByImageTag() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchMessagesByImageTag === 'function' && !svc.isScaffold) {
    return svc.fetchMessagesByImageTag.apply(null, arguments);
  }
  console.warn('fetchMessagesByImageTag: GATHER_FIREBASE_SERVICES missing');
  return [];
}

async function fetchMeetingPhotoIndex() {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.fetchMeetingPhotoIndex === 'function' && !svc.isScaffold) {
    return svc.fetchMeetingPhotoIndex.apply(null, arguments);
  }
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

function invalidateGalleryItemCount(calId) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.invalidateGalleryItemCount === 'function' && !svc.isScaffold) {
    return svc.invalidateGalleryItemCount(calId);
  }
}

async function fetchMemosRest(calId, recentLimit = null) {
  try {
    const pageSizePart = recentLimit ? `&pageSize=${recentLimit}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/memos?orderBy=createdAt%20desc${pageSizePart}`;
    const res = await fetchFirestoreRequest(url);
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
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/anniversaries`;
    const res = await fetchFirestoreRequest(url);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    const list = docs.map(doc => ({
      id: doc.name.split('/').pop(),
      ...firestoreDocumentToJs(doc)
    }));
    list.sort((a, b) => (Number(b.createdAt) || Number(b.updatedAt) || 0) - (Number(a.createdAt) || Number(a.updatedAt) || 0));
    return list;
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
    const res = await fetchFirestoreRequest(url, {
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

async function writeCollectionDocumentRest(collectionName, calId, docId, data, method = 'update', deletePaths = [], timeoutMs = FIRESTORE_REQUEST_TIMEOUT_MS) {
  try {
    const cleanCollection = sanitizeText(collectionName || '', 80);
    const cleanCalId = sanitizeText(calId || '', 64);
    const cleanDocId = sanitizeText(docId || '', 180);
    const cleanDeletePaths = Array.isArray(deletePaths)
      ? [...new Set(deletePaths.map(path => sanitizeText(path || '', 120)).filter(Boolean))]
      : [];
    if (!cleanCollection || !isValidCalendarId(cleanCalId)) return false;
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${cleanCalId}/${cleanCollection}`;
    if (method === 'delete') {
      if (!cleanDocId) return false;
      const delRes = await fetchFirestoreRequest(`${baseUrl}/${cleanDocId}`, { method: 'DELETE' }, timeoutMs);
      return delRes.ok ? { success: true, id: cleanDocId, transport: 'rest' } : false;
    }

    const cleanData = sanitizeMessageForFirestore(data);
    const deleteSet = new Set(cleanDeletePaths);
    const fields = Object.fromEntries(
      Object.entries(cleanData || {})
        .filter(([key]) => !deleteSet.has(key))
        .map(([key, value]) => [key, jsToFirestoreValue(value)])
    );
    if (method === 'add') {
      const addRes = await fetchFirestoreRequest(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      }, timeoutMs);
      if (!addRes.ok) return false;
      const addData = await addRes.json().catch(() => null);
      const id = typeof addData?.name === 'string' ? addData.name.split('/').pop() : '';
      return { success: true, id: id || null, transport: 'rest' };
    }

    if (!cleanDocId) return false;
    const query = method === 'update'
      ? `?${Array.from(new Set([...Object.keys(fields), ...cleanDeletePaths])).map(key => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&')}`
      : '';
    const patchRes = await fetchFirestoreRequest(`${baseUrl}/${cleanDocId}${query}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    }, timeoutMs);
    return patchRes.ok ? { success: true, id: cleanDocId, transport: 'rest' } : false;
  } catch (err) {
    console.warn('writeCollectionDocumentRest error:', err);
    return { success: false, retryable: true, error: err };
  }
}

async function writeCollectionDocumentWithFallback(collectionName, calId, docId, data, method = 'update', warnLabel = 'write', options = {}) {
  const cleanCollection = sanitizeText(collectionName || '', 80);
  const cleanData = method === 'delete' ? null : sanitizeMessageForFirestore(data);
  // An add() can time out after Firestore has already committed it. Give every
  // add attempt one shared id so SDK -> REST -> queue retries remain idempotent,
  // including future callers that do not provide their own operation id.
  const addDocumentId = method === 'add'
    ? sanitizeText(options?.documentId || `add_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`, 120)
    : '';
  const writeStartedAt = Date.now();
  const remainingWriteTime = () => Math.max(250, FIRESTORE_WRITE_DEADLINE_MS - (Date.now() - writeStartedAt));
  const attemptTimeout = () => Math.min(FIRESTORE_WRITE_ATTEMPT_TIMEOUT_MS, remainingWriteTime());
  let sdkError = null;
  const cleanDeletePaths = Array.isArray(options?.deletePaths)
    ? [...new Set(options.deletePaths.map(path => sanitizeText(path || '', 120)).filter(Boolean))]
    : [];
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calId}`).collection(cleanCollection);
      if (method === 'add') {
        await withTimeout(colRef.doc(addDocumentId).set(cleanData), attemptTimeout(), `${warnLabel} timeout`);
        return { success: true, id: addDocumentId, transport: 'sdk' };
      }
      if (method === 'delete') {
        await withTimeout(colRef.doc(docId).delete(), attemptTimeout(), `${warnLabel} timeout`);
        return { success: true, id: docId, transport: 'sdk' };
      }
      if (method === 'set') {
        await withTimeout(colRef.doc(docId).set(cleanData), attemptTimeout(), `${warnLabel} timeout`);
        return { success: true, id: docId, transport: 'sdk' };
      }
      let updateData = cleanData;
      if (cleanDeletePaths.length > 0) {
        const fieldDelete = typeof firebase !== 'undefined'
          && firebase.firestore
          && firebase.firestore.FieldValue
          && typeof firebase.firestore.FieldValue.delete === 'function'
          ? firebase.firestore.FieldValue.delete()
          : null;
        if (!fieldDelete) {
          throw new Error('Firestore field delete sentinel unavailable');
        }
        updateData = { ...cleanData };
        cleanDeletePaths.forEach(path => {
          updateData[path] = fieldDelete;
        });
      }
      await withTimeout(colRef.doc(docId).update(updateData), attemptTimeout(), `${warnLabel} timeout`);
      return { success: true, id: docId, transport: 'sdk' };
    } catch (err) {
      sdkError = err;
      console.warn(`Failed to ${warnLabel} for ${calId} via SDK, trying REST:`, err);
    }
  }
  const restMethod = method === 'add' ? 'set' : method;
  const restDocId = method === 'add' ? addDocumentId : docId;
  const restResult = await writeCollectionDocumentRest(cleanCollection, calId, restDocId, data, restMethod, cleanDeletePaths, remainingWriteTime());
  if (restResult?.success || options?.skipQueue || !shouldQueueCollectionWrite(restResult?.error || null, sdkError)) {
    return restResult?.success ? restResult : false;
  }
  const operationId = options?.queueId || `collection_${cleanCollection}_${calId}_${restDocId || Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const queued = await enqueueWriteOperation({
    id: operationId,
    type: 'collection-write',
    calendarId: calId,
    payload: {
      collectionName: cleanCollection,
      docId: restDocId,
      data,
      merge: Boolean(options?.merge),
      method: restMethod,
      deletePaths: cleanDeletePaths,
      warnLabel
    },
    lastError: `${warnLabel} network failure`
  });
  return queued ? { success: true, queued: true, id: restDocId || operationId, transport: 'queue' } : restResult;
}

function shouldQueueCollectionWrite(...errors) {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  } catch (_) {}
  return errors.some(error => /timeout|network|fetch|offline|연결|상태를 확인/i.test(String(error?.message || error || '')));
}

async function deleteMessageRest(calId, messageId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages/${messageId}`;
    const res = await fetchFirestoreRequest(url, { method: 'DELETE' });
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
    const res = await fetchFirestoreRequest(url);
    if (!res.ok) return null;
    const doc = await res.json();
    return { ...firestoreDocumentToJs(doc), id: messageId };
  } catch (err) {
    console.warn('fetchMessageRest error:', err);
    return null;
  }
}

async function updateMessageRest(calId, messageId, data, deletePaths = []) {
  try {
    const fields = {};
    const cleanDeletePaths = Array.isArray(deletePaths)
      ? new Set(deletePaths.map(path => sanitizeText(path || '', 120)).filter(Boolean))
      : new Set();
    if (data.text !== undefined) fields.text = jsToFirestoreValue(data.text);
    if (data.imageUrl !== undefined && !cleanDeletePaths.has('imageUrl')) fields.imageUrl = jsToFirestoreValue(data.imageUrl);
    if (data.thumbUrl !== undefined && !cleanDeletePaths.has('thumbUrl')) fields.thumbUrl = jsToFirestoreValue(data.thumbUrl);
    if (data.imageUrls !== undefined && !cleanDeletePaths.has('imageUrls')) fields.imageUrls = jsToFirestoreValue(data.imageUrls);
    if (data.thumbUrls !== undefined && !cleanDeletePaths.has('thumbUrls')) fields.thumbUrls = jsToFirestoreValue(data.thumbUrls);
    if (data.imageShareUrls !== undefined && !cleanDeletePaths.has('imageShareUrls')) fields.imageShareUrls = jsToFirestoreValue(data.imageShareUrls);
    if (data.imageTags !== undefined && !cleanDeletePaths.has('imageTags')) fields.imageTags = jsToFirestoreValue(data.imageTags);
    if (data.directMediaTags !== undefined && !cleanDeletePaths.has('directMediaTags')) fields.directMediaTags = jsToFirestoreValue(data.directMediaTags);
    if (data.linkPreview !== undefined && !cleanDeletePaths.has('linkPreview')) fields.linkPreview = jsToFirestoreValue(data.linkPreview);
    if (data.participantId !== undefined && !cleanDeletePaths.has('participantId')) fields.participantId = jsToFirestoreValue(data.participantId);
    if (data.uploadSource !== undefined && !cleanDeletePaths.has('uploadSource')) fields.uploadSource = jsToFirestoreValue(data.uploadSource);
    if (Object.keys(fields).length === 0) return false;
    const updateMask = Array.from(new Set([...Object.keys(fields), ...cleanDeletePaths])).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${calId}/messages/${messageId}?${updateMask}`;
    const res = await fetchFirestoreRequest(url, {
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

// Returns { calendar, lastModified, revision } or null with 10s timeout, retries, and REST fallback.
async function fetchSingleCloudCalendar(calId, retryCount = FIREBASE_LOAD_MAX_ATTEMPTS, timeoutMs = FIREBASE_LOAD_TIMEOUT_MS) {
  if (!isAllowedCalendarId(calId)) return null;
  const attempts = Math.max(1, retryCount);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      // Prefer the uncached REST read for the initial/foreground refresh. Firestore's SDK
      // listener is still the realtime transport, but when a browser's persistent SDK cache or
      // transport is unhealthy, returning its first value here can permanently bless stale data
      // and prevent the REST fallback from ever running. The REST read is also the same server
      // truth that makes the private/incognito comparison useful during diagnosis.
      const restResult = await fetchSingleCalendarWithRest(calId, timeoutMs);
      if (restResult) return restResult;
      if (firebaseDb) {
        try {
          const doc = await Promise.race([
            firebaseDb.collection('calendars').doc(`cal_${calId}`).get({ source: 'server' }),
            waitForTimeout(timeoutMs, `Firestore fetch timeout after ${timeoutMs}ms`)
          ]);
          if (doc && doc.exists) {
            const data = doc.data();
            if (data && data.calendar && data.calendar.id === calId) {
              return {
                calendar: data.calendar,
                lastModified: data.lastModified || data.calendar.updatedAt || 0,
                revision: Number(data.revision || data.calendar.revision || 0) || 0
              };
            }
          }
        } catch (e) {
          console.warn(`Firestore SDK server fetch notice for cal_${calId}, trying REST fallback:`, e);
        }
      }
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
    lastModified: data.lastModified || data.calendar.updatedAt || 0,
    revision: Number(data.revision || data.calendar.revision || 0) || 0
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

async function writeRootCollectionDocumentWithFallback(collectionName, docId, data, warnLabel = 'write', options = {}) {
  const cleanCollection = sanitizeText(collectionName || '', 80);
  const cleanDocId = sanitizeText(docId || '', 180);
  if (!cleanCollection || !cleanDocId) return false;
  try {
    if (firebaseDb) {
      await withTimeout(firebaseDb.collection(cleanCollection).doc(cleanDocId).set(data, options?.merge ? { merge: true } : undefined), FIRESTORE_WRITE_DEADLINE_MS, `${warnLabel} timeout`);
      return { success: true, id: cleanDocId, transport: 'sdk' };
    }
    const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${cleanCollection}/${cleanDocId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data || {}).map(([key, value]) => [key, jsToFirestoreValue(value)])) })
    }, FIRESTORE_WRITE_DEADLINE_MS);
    if (res.ok) return { success: true, id: cleanDocId, transport: 'rest' };
    return false;
  } catch (error) {
    if (options?.skipQueue || !shouldQueueCollectionWrite(error)) return false;
    const queued = await enqueueWriteOperation({ id: `root_${cleanCollection}_${cleanDocId}`, type: 'root-collection-write', calendarId: '', payload: { collectionName: cleanCollection, docId: cleanDocId, data, merge: Boolean(options?.merge), warnLabel } });
    return queued ? { success: true, queued: true, id: cleanDocId, transport: 'queue' } : false;
  }
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
    const saved = await writeRootCollectionDocumentWithFallback('imageShares', shareId, payload, 'image share pointer write', { merge: true });
    if (!saved?.success) throw new Error('Image share pointer write failed');
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
  const saved = await writeRootCollectionDocumentWithFallback('imageShares', shareId, payload, 'image share fallback write');
  if (!saved?.success) throw new Error('Image share fallback write failed');
  return getImageSharePageUrl(shareId);
}

async function fetchImageShareDocument(shareId) {
  if (!shareId || !/^img_[A-Za-z0-9_-]{3,180}$/.test(shareId)) return null;
  const resolveMessageShare = async share => {
    if (!share || share.imageUrl || share.source !== 'message' || !share.calendarId || !share.messageId) return share;
    let msg;
    if (firebaseDb) {
      const snap = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${share.calendarId}`).collection('messages').doc(share.messageId).get(), FIRESTORE_REQUEST_TIMEOUT_MS, 'image share message read timeout');
      msg = snap.exists ? snap.data() : null;
    } else {
      const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/calendars/cal_${share.calendarId}/messages/${share.messageId}`);
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
    const snap = await withTimeout(firebaseDb.collection('imageShares').doc(shareId).get(), FIRESTORE_REQUEST_TIMEOUT_MS, 'image share read timeout');
    return snap.exists ? resolveMessageShare(snap.data()) : null;
  }
  const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/imageShares/${shareId}`);
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
  const { activityLogs: _activityLogs, ...rest } = calendar;
  return rest;
}

// Retries a legacy subcollection migration write (activityLogs/places/confirmedMeetings) a few
// times before giving up. The primary calendar document is committed first, then callers await
// the result so the UI can distinguish a complete save from a save whose auxiliary data needs a
// later retry. Each underlying write function is idempotent (documents are keyed by their own id),
// so retrying is always safe.
async function retryLegacySubcollectionWrite(writeFn, calendarId, items, label, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const ok = await writeFn(calendarId, items);
      if (ok) return true;
    } catch (e) {
      if (attempt === attempts) {
        console.error(`${label} persist failed for ${calendarId} after ${attempts} attempts:`, e);
        return false;
      }
    }
    if (attempt < attempts) {
      await new Promise(resolve => setTimeout(resolve, 400 * attempt));
    }
  }
  console.error(`${label} persist failed for ${calendarId} after ${attempts} attempts`);
  return false;
}

// Activity logs only -- places and confirmedMeetings are each awaited directly by the caller
// (persistPlacesSubcollection / persistConfirmedMeetingsSubcollection below) since both are
// user-visible source-of-truth data that must be confirmed before a save resolves. Activity logs
// stay fire-and-forget: they're an audit trail, not something a refresh needs to see immediately.
async function persistLegacySubcollections(calendarId, activityLogs) {
  if (!Array.isArray(activityLogs) || !activityLogs.length) return [];
  const ok = await retryLegacySubcollectionWrite(writeActivityLogsToFirestore, calendarId, activityLogs, 'Activity log');
  return ok ? [] : [0];
}

// Place reads are merged from this subcollection on every page load. A place save therefore
// cannot report success while this write is still running: a refresh in that window would merge
// the previous memo back into the UI. Activity logs may remain best-effort, but places are part
// of the user-visible source of truth and must be confirmed before the save resolves.
async function persistPlacesSubcollection(calendarId, places) {
  if (!Array.isArray(places) || !places.length) return true;
  return retryLegacySubcollectionWrite(writePlacesToFirestore, calendarId, places, 'Places');
}

// Same reasoning as persistPlacesSubcollection immediately above -- confirmedMeetings.expenses
// (settlement amounts) are merged from this subcollection on every page load exactly like
// places are, so this write must also be confirmed before the save resolves. This used to be
// folded into persistLegacySubcollections and fired off unawaited alongside activity logs (truly
// best-effort audit data), which let a settlement edit report "저장완료" and then silently lose
// the edit on refresh whenever this write was still in flight or failed.
async function persistConfirmedMeetingsSubcollection(calendarId, meetings) {
  if (!Array.isArray(meetings) || !meetings.length) return true;
  return retryLegacySubcollectionWrite(writeConfirmedMeetingsToFirestore, calendarId, meetings, 'Confirmed meetings');
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
      await withTimeout(batch.commit(), FIRESTORE_REQUEST_TIMEOUT_MS, 'activityLogs write timeout');
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
    const res = await fetchFirestoreRequest('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
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
      const snap = await withTimeout(query.get(), FIRESTORE_REQUEST_TIMEOUT_MS, 'activity logs read timeout');
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch activity logs for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const orderPart = recentLimit ? '?orderBy=timestamp%20desc&pageSize=' + recentLimit : '?pageSize=1000';
    const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}${orderPart}`);
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
  const failed = [];
  for (const log of toDelete) {
    try {
      if (firebaseDb) {
        await withTimeout(firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('activityLogs').doc(log.id).delete(), FIRESTORE_REQUEST_TIMEOUT_MS, 'activity log delete timeout');
      } else {
        const response = await withTimeout(fetch(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/activityLogs/${log.id}`, { method: 'DELETE' }), FIRESTORE_REQUEST_TIMEOUT_MS, 'activity log REST delete timeout');
        if (!response.ok) throw new Error(`activity log REST delete failed (${response.status})`);
      }
    } catch (e) {
      console.warn(`Failed to delete activity log ${log.id} for ${calendarId}:`, e);
      failed.push(log.id);
    }
  }
  return { attempted: toDelete.length, deleted: toDelete.length - failed.length, failed };
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
  const { places: _places, ...rest } = calendar;
  return rest;
}
async function writePlacesToFirestore(calendarId, places) {
  const validPlaces = Array.isArray(places) ? places.filter(p => p && typeof p.id === 'string' && p.id) : [];
  if (!validPlaces.length) return true;
  try {
    const writes = validPlaces.map(place => ({
      update: {
        name: `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${calendarId}/places/${place.id}`,
        fields: Object.fromEntries(Object.entries(place).map(([key, value]) => [key, jsToFirestoreValue(value)]))
      }
    }));
    const res = await fetchFirestoreRequest('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes })
    });
    if (!res.ok) console.warn(`Places REST write failed for ${calendarId}:`, await res.text());
    return res.ok;
  } catch (e) {
    console.warn(`Failed to write places for ${calendarId} via REST:`, e);
  }
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('places');
      const batch = firebaseDb.batch();
      validPlaces.forEach(place => batch.set(colRef.doc(place.id), place));
      await withTimeout(batch.commit(), FIRESTORE_REQUEST_TIMEOUT_MS, 'places write timeout');
      return true;
    } catch (e) {
      console.warn(`Failed to write places for ${calendarId} via SDK:`, e);
    }
  }
  return false;
}
async function fetchPlacesFromFirestore(calendarId) {
  const basePath = `calendars/cal_${calendarId}/places`;
  try {
    if (firebaseDb) {
      const snap = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('places').get({ source: 'server' }), FIRESTORE_REQUEST_TIMEOUT_MS, 'places read timeout');
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch places for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}?pageSize=500`);
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
  const { confirmedMeeting: _confirmedMeeting, ...rest } = calendar;
  return rest;
}
function normalizeConfirmedMeetingPhoto(photo) {
  if (!photo || typeof photo !== 'object') return null;
  const normalized = {};
  const id = sanitizeText(photo.id || photo.photoId || '', 120);
  const imageUrl = sanitizeText(photo.imageUrl || '', 2000);
  const thumbUrl = sanitizeText(photo.thumbUrl || '', 2000);
  const refKey = sanitizeText(photo.refKey || '', 220);
  const mediaKey = sanitizeText(photo.mediaKey || '', 220);
  const assetKey = sanitizeText(photo.assetKey || '', 220);
  const source = sanitizeText(photo.source || '', 60);
  const uploadSource = sanitizeText(photo.uploadSource || '', 60);
  const tags = sanitizeText(photo.tags || '', 500);
  const sourceMessageId = sanitizeText(photo.sourceMessageId || '', 180);
  const sourceImageIndex = Number(photo.sourceImageIndex);
  const imageIndex = Number(photo.imageIndex);
  const createdAt = Number(photo.createdAt);
  const updatedAt = Number(photo.updatedAt);
  const meetingDate = sanitizeText(photo.meetingDate || '', 20);
  if (id) normalized.id = id;
  if (imageUrl) normalized.imageUrl = imageUrl;
  if (thumbUrl) normalized.thumbUrl = thumbUrl;
  if (refKey) normalized.refKey = refKey;
  if (mediaKey) normalized.mediaKey = mediaKey;
  if (assetKey) normalized.assetKey = assetKey;
  if (source) normalized.source = source;
  if (uploadSource) normalized.uploadSource = uploadSource;
  if (tags) normalized.tags = tags;
  if (sourceMessageId) normalized.sourceMessageId = sourceMessageId;
  if (Number.isFinite(sourceImageIndex)) normalized.sourceImageIndex = Math.max(0, Math.round(sourceImageIndex));
  if (Number.isFinite(imageIndex)) normalized.imageIndex = Math.max(0, Math.round(imageIndex));
  if (Number.isFinite(createdAt)) normalized.createdAt = Math.max(0, Math.round(createdAt));
  if (Number.isFinite(updatedAt)) normalized.updatedAt = Math.max(0, Math.round(updatedAt));
  if (meetingDate && isValidDateString(meetingDate)) normalized.meetingDate = meetingDate;
  return Object.keys(normalized).length ? normalized : null;
}
function normalizeConfirmedMeetingExpense(expense) {
  if (!expense || typeof expense !== 'object') return null;
  const normalized = {};
  const id = sanitizeText(expense.id || '', 120);
  const label = sanitizeText(expense.label || '', 120);
  const url = sanitizeText(expense.url || '', 220);
  const categoryId = sanitizeText(expense.categoryId || '', 80);
  const amount = Number(expense.amount);
  const order = Number(expense.order);
  const createdAt = Number(expense.createdAt);
  const updatedAt = Number(expense.updatedAt);
  if (id) normalized.id = id;
  if (label) normalized.label = label;
  if (url) normalized.url = url;
  if (categoryId) normalized.categoryId = categoryId;
  if (Number.isFinite(amount)) normalized.amount = Math.round(amount);
  if (Number.isFinite(order)) normalized.order = Math.max(0, Math.round(order));
  if (Number.isFinite(createdAt)) normalized.createdAt = Math.max(0, Math.round(createdAt));
  if (Number.isFinite(updatedAt)) normalized.updatedAt = Math.max(0, Math.round(updatedAt));
  if (expense.linkPreview && typeof expense.linkPreview === 'object') {
    const lp = { ...expense.linkPreview };
    if (typeof lp.description === 'string' && lp.description.length > 280) lp.description = lp.description.slice(0, 280);
    if (typeof lp.title === 'string' && lp.title.length > 120) lp.title = lp.title.slice(0, 120);
    if (typeof lp.html === 'string') delete lp.html;
    if (typeof lp.content === 'string') delete lp.content;
    if (typeof lp.image === 'string' && lp.image.startsWith('data:') && lp.image.length > 2000) delete lp.image;
    normalized.linkPreview = lp;
  }
  return Object.keys(normalized).length ? normalized : null;
}
function mergeConfirmedMeetingItems(existingItems, incomingItems, keyGetter) {
  const byKey = new Map();
  const addItem = (item) => {
    if (!item) return;
    const key = typeof keyGetter === 'function' ? keyGetter(item) : '';
    if (!key) return;
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, item);
      return;
    }
    const currentStamp = Number(current.updatedAt || current.deletedAt || current.createdAt || 0) || 0;
    const incomingStamp = Number(item.updatedAt || item.deletedAt || item.createdAt || 0) || 0;
    byKey.set(key, incomingStamp >= currentStamp ? { ...current, ...item } : current);
  };
  (Array.isArray(existingItems) ? existingItems : []).forEach(addItem);
  (Array.isArray(incomingItems) ? incomingItems : []).forEach(addItem);
  return Array.from(byKey.values());
}
function normalizeConfirmedMeetingRecord(meeting) {
  if (!meeting || typeof meeting !== 'object') return null;
  const date = sanitizeText(meeting.date || '', 20);
  if (!isValidDateString(date)) return null;
  const normalized = {
    date,
    note: sanitizeText(meeting.note || '', 500),
    photos: normalizeConfirmedMeetingPhotos(meeting.photos),
    expenses: normalizeConfirmedMeetingExpenses(meeting.expenses)
  };
  if (meeting.confirmed === false) normalized.confirmed = false;
  else if (meeting.confirmed === true) normalized.confirmed = true;
  const confirmedAt = Number(meeting.confirmedAt);
  const createdAt = Number(meeting.createdAt);
  const updatedAt = Number(meeting.updatedAt);
  if (Number.isFinite(confirmedAt)) normalized.confirmedAt = Math.max(0, Math.round(confirmedAt));
  if (Number.isFinite(createdAt)) normalized.createdAt = Math.max(0, Math.round(createdAt));
  if (Number.isFinite(updatedAt)) normalized.updatedAt = Math.max(0, Math.round(updatedAt));
  if (meeting.amount === null) {
    normalized.amount = null;
  } else if (Number.isFinite(Number(meeting.amount))) {
    normalized.amount = Math.round(Number(meeting.amount));
  }
  return normalized;
}
function normalizeConfirmedMeetingPhotos(photos) {
  return mergeConfirmedMeetingItems(
    [],
    Array.isArray(photos) ? photos.map(normalizeConfirmedMeetingPhoto).filter(Boolean) : [],
    photo => photo.id || photo.refKey || photo.mediaKey || photo.assetKey || photo.imageUrl || photo.thumbUrl
  );
}
function normalizeConfirmedMeetingExpenses(expenses) {
  return mergeConfirmedMeetingItems(
    [],
    Array.isArray(expenses) ? expenses.map(normalizeConfirmedMeetingExpense).filter(Boolean) : [],
    expense => expense.id || `${expense.label || ''}|${expense.url || ''}|${expense.amount ?? ''}|${expense.categoryId || ''}|${expense.createdAt ?? ''}`
  );
}
function normalizeConfirmedMeetingsForSave(meetings) {
  return mergeConfirmedMeetings([], meetings);
}
async function writeConfirmedMeetingsToFirestore(calendarId, meetings) {
  // Fallback contract: if (res.ok) return true; otherwise use if (firebaseDb) SDK fallback.
  const validMeetings = normalizeConfirmedMeetingsForSave(meetings);
  try {
    const configuredProjectId = firebaseConfig.projectId;
    if (!configuredProjectId) throw new Error('Firebase project id is unavailable');
    const collectionUrl = `https://firestore.googleapis.com/v1/projects/${configuredProjectId}/databases/(default)/documents/calendars/cal_${calendarId}/confirmedMeetings`;
    const validDates = new Set(validMeetings.map(meeting => meeting.date));
    const appendStaleDeletes = existingDocuments => existingDocuments.forEach(document => {
      const documentName = typeof document?.name === 'string' ? document.name : '';
      const date = documentName.split('/').pop();
      if (date && !validDates.has(date)) writes.push({ delete: documentName });
    });
    const writes = validMeetings.map(meeting => ({
      update: {
        name: `projects/${configuredProjectId}/databases/(default)/documents/calendars/cal_${calendarId}/confirmedMeetings/${meeting.date}`,
        fields: Object.fromEntries(Object.entries(meeting).map(([key, value]) => [key, jsToFirestoreValue(value)]))
      }
    }));
    // Date-keyed settlement edits normally update existing documents. Avoid a full collection
    // read on every save; only an empty desired collection needs a deletion sweep.
    if (validMeetings.length === 0) {
      const existingResponse = await fetchFirestoreRequest(`${collectionUrl}?pageSize=500`);
      const existingDocuments = existingResponse.ok ? ((await existingResponse.json()).documents || []) : [];
      appendStaleDeletes(existingDocuments);
    }
    if (writes.length === 0) return true;
    const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/${configuredProjectId}/databases/(default)/documents:commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes })
    });
    if (res.ok) return true;
    // REST failure must continue to the `if (firebaseDb)` SDK fallback below.
    console.warn(`Confirmed meetings REST write failed for ${calendarId}:`, await res.text());
  } catch (e) {
    console.warn(`Failed to write confirmed meetings for ${calendarId} via REST:`, e);
  }
  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('confirmedMeetings');
      const batch = firebaseDb.batch();
      validMeetings.forEach(meeting => batch.set(colRef.doc(meeting.date), meeting));
      // A stale Firestore persistence session can fail while reading the collection even though
      // a write batch is still usable. Do not let that cleanup-only read block the actual meeting
      // update; the next successful sync will remove any stale documents.
      try {
        if (validMeetings.length === 0) {
          const existingSnapshot = await withTimeout(colRef.get({ source: 'server' }), FIRESTORE_REQUEST_TIMEOUT_MS, 'confirmedMeetings read timeout');
          existingSnapshot.forEach(document => batch.delete(document.ref));
        }
      } catch (readError) {
        console.warn(`Failed to inspect stale confirmed meetings for ${calendarId}; applying valid writes only:`, readError);
        if (validMeetings.length === 0) return false;
      }
      await withTimeout(batch.commit(), FIRESTORE_REQUEST_TIMEOUT_MS, 'confirmedMeetings write timeout');
      return true;
    } catch (e) {
      console.warn(`Failed to write confirmed meetings for ${calendarId} via SDK:`, e);
    }
  }
  return false;
}
async function fetchConfirmedMeetingsFromFirestore(calendarId) {
  const basePath = `calendars/cal_${calendarId}/confirmedMeetings`;
  try {
    if (firebaseDb) {
      const snap = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${calendarId}`).collection('confirmedMeetings').get({ source: 'server' }), FIRESTORE_REQUEST_TIMEOUT_MS, 'confirmed meetings read timeout');
      return snap.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn(`Failed to fetch confirmed meetings for ${calendarId} via SDK, trying REST:`, e);
  }
  try {
    const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents/${basePath}?pageSize=500`);
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

async function pushSingleCalendarWithRest(normalizedCal, lastModified, saveMode, retryCount = 4, newActivityLogs = [], auxiliaryData = {}) {
  const docPath = `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${normalizedCal.id}`;
  const docUrl = `https://firestore.googleapis.com/v1/${docPath}`;
  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const getRes = await fetchFirestoreRequest(docUrl);
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
        nextCalendar = mergeCalendarSettingsDelta(serverCalendar, normalizedCal, auxiliaryData?.settingsFields);
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
      const legacyActivityLogs = Array.isArray(serverCalendar?.activityLogs) ? serverCalendar.activityLogs : [];
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
        // Build legacyPlaces with mergedCalendar.places as the highest-priority source:
        // server (oldest) → auxiliaryData (caller-supplied delta) → mergedCalendar (final
        // merged state). Last-writer-wins by id, so the most up-to-date version of each
        // place always ends up in the subcollection write — fixes the bug where a new or
        // edited place was stripped by stripEmbeddedPlacesField and never written to
        // the subcollection because mergedCalendar.places was ignored entirely.
        const legacyPlacesById = new Map();
        [...(Array.isArray(serverCalendar?.places) ? serverCalendar.places : []),
          ...(Array.isArray(auxiliaryData?.places) ? auxiliaryData.places : []),
          ...(Array.isArray(mergedCalendar?.places) ? mergedCalendar.places : [])]
          .forEach(p => { if (p?.id) legacyPlacesById.set(p.id, p); });
        legacyPlaces = Array.from(legacyPlacesById.values());
        // Build legacyConfirmedMeetings with mergedCalendar.confirmedMeeting as the
        // highest-priority source for the same reason — ensures newly added or edited
        // expenses/notes are actually written to the subcollection instead of being
        // overwritten by the stale serverCalendar or auxiliaryData arrays.
        const legacyMeetingsByDate = new Map();
        [...(Array.isArray(serverCalendar?.confirmedMeeting) ? serverCalendar.confirmedMeeting : []),
          ...(Array.isArray(auxiliaryData?.confirmedMeetings) ? auxiliaryData.confirmedMeetings : []),
          ...(Array.isArray(mergedCalendar?.confirmedMeeting) ? mergedCalendar.confirmedMeeting : [])]
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
      const commitRes = await fetchFirestoreRequest('https://firestore.googleapis.com/v1/projects/metro-live-2918e/databases/(default)/documents:commit', {
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
        // Places and confirmedMeetings are both merged into the live UI on read, so confirm both
        // writes before reporting success. Activity logs remain a best-effort auxiliary write.
        const [placesPersisted, meetingsPersisted] = await Promise.all([
          persistPlacesSubcollection(normalizedCal.id, legacyPlaces),
          persistConfirmedMeetingsSubcollection(normalizedCal.id, legacyConfirmedMeetings)
        ]);
        void persistLegacySubcollections(normalizedCal.id, logsToPersist)
          .catch(error => console.warn(`Auxiliary sync failed for ${normalizedCal.id}:`, error));
        const auxOk = placesPersisted && meetingsPersisted;
        return { ok: auxOk, revision: nextDocRevision, auxiliaryPersistenceFailed: !auxOk };
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
// Returns `false` on failure; on success returns `{ ok: true, revision }` where `revision` is the
// doc-level revision Firestore actually committed -- NOT the same number as normalizedCal.revision
// (the nested calendar.revision field), which the caller bumps client-side once per local edit and
// which can run well ahead of how many writes have actually landed. updateCalendars must record
// this doc-level value as its "last known good" revision, because that's the same number every
// future onSnapshot/get() delivers for comparison -- recording the nested counter instead made a
// device's local revision permanently outrun the server's, so the local revision-gate rejected
// every later genuine update (a plain refresh included) as "older" than what it already had.
async function pushSingleCloudCalendar(targetCal, lastModified, retryCount = 4, allCalendars = null, saveMode = 'availability', newActivityLogs = [], auxiliaryData = {}) {
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
    // Set by the transaction below to the doc-level `revision` it actually committed, so the
    // caller can record the real server-confirmed value instead of guessing from its own
    // optimistic calendar.revision counter (see the note above pushSingleCloudCalendar's return).
    let committedRevision = null;
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
	            nextCalendar = mergeCalendarSettingsDelta(serverCalendar, normalizedCal, auxiliaryData?.settingsFields);
	          } else if (saveMode === 'polls') {
	            nextCalendar = mergeCalendarPollsDelta(serverCalendar, normalizedCal, lastModified);
	          } else {
	            nextCalendar = mergeCalendarAvailabilityDelta(serverCalendar, normalizedCal, lastModified);
	          }
	          const mergedCalendar = normalizeCalendarForSave(nextCalendar);
	          const nextDocRevision = (currentData?.revision || 0) + 1;
	          committedRevision = nextDocRevision;
	          mergedCalendar.revision = Math.max(serverCalendar?.revision || 0, normalizedCal.revision || 0) + 1;
	          mergedCalendar.updatedAt = Math.max(mergedCalendar.updatedAt || 0, lastModified || 0);
	          // activityLogs lives in its own subcollection now -- see writeActivityLogsToFirestore
	          // below. Capture any still-present legacy embedded entries so they get copied over
	          // (self-healing migration) instead of silently disappearing on this overwrite.
	          // Validation and the size guard run against the stripped payload (the actual write),
	          // not mergedCalendar, so a legacy activityLogs array being migrated away doesn't
	          // count against a size limit it's no longer part of.
          legacyActivityLogs = Array.isArray(serverCalendar?.activityLogs) ? serverCalendar.activityLogs : [];
	          // places/confirmedMeeting get the same self-healing subcollection migration as
	          // activityLogs above, gated behind ENABLE_PLACES_SUBCOLLECTION_MIGRATION (see its
	          // declaration) -- deduped by their own key since server/normalized can both still
	          // carry legacy-embedded copies of an entry already migrated on a prior save.
	          let docCalendar = stripEmbeddedActivityLogsField(mergedCalendar);
	          if (ENABLE_PLACES_SUBCOLLECTION_MIGRATION) {
	            // Build legacyPlaces with mergedCalendar.places as the highest-priority source:
	            // server (oldest) → auxiliaryData (caller-supplied delta) → mergedCalendar (final
	            // merged state). Last-writer-wins by id, so the most up-to-date version of each
	            // place always ends up in the subcollection write — fixes the bug where a new or
	            // edited place was stripped by stripEmbeddedPlacesField and never written to
	            // the subcollection because mergedCalendar.places was ignored entirely.
	            const legacyPlacesById = new Map();
            [...(Array.isArray(serverCalendar?.places) ? serverCalendar.places : []),
              ...(Array.isArray(auxiliaryData?.places) ? auxiliaryData.places : []),
              ...(Array.isArray(mergedCalendar?.places) ? mergedCalendar.places : [])]
	              .forEach(p => { if (p?.id) legacyPlacesById.set(p.id, p); });
	            legacyPlaces = Array.from(legacyPlacesById.values());
	            // Build legacyConfirmedMeetings with mergedCalendar.confirmedMeeting as the
	            // highest-priority source for the same reason — ensures newly added or edited
	            // expenses/notes are actually written to the subcollection instead of being
	            // overwritten by the stale serverCalendar or auxiliaryData arrays.
	            const legacyMeetingsByDate = new Map();
            [...(Array.isArray(serverCalendar?.confirmedMeeting) ? serverCalendar.confirmedMeeting : []),
              ...(Array.isArray(auxiliaryData?.confirmedMeetings) ? auxiliaryData.confirmedMeetings : []),
              ...(Array.isArray(mergedCalendar?.confirmedMeeting) ? mergedCalendar.confirmedMeeting : [])]
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
      // Places and confirmedMeetings are both merged into the live UI on read, so confirm both
      // writes before reporting success. Activity logs remain a best-effort auxiliary write.
      const [placesPersisted, meetingsPersisted] = await Promise.all([
        persistPlacesSubcollection(normalizedCal.id, legacyPlaces),
        persistConfirmedMeetingsSubcollection(normalizedCal.id, legacyConfirmedMeetings)
      ]);
      void persistLegacySubcollections(normalizedCal.id, logsToPersist)
        .catch(error => console.warn(`Auxiliary sync failed for ${normalizedCal.id}:`, error));
      const auxOk = placesPersisted && meetingsPersisted;
      return { ok: auxOk, revision: committedRevision, auxiliaryPersistenceFailed: !auxOk };
    } catch (e) {
      console.warn(`Firestore push notice for cal_${normalizedCal.id}:`, e);
      // The transaction above has no cancellation hook, so on a timeout it can still land after
      // we've moved on. Give it a brief grace period, then check whether it actually committed
      // before starting a second, independent REST write -- avoids the common case of both
      // writes landing and double-bumping revision when the transaction was merely slow, not
      // actually stuck offline.
      if (raceLost) {
        let checkError = null;
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const docPath = `projects/metro-live-2918e/databases/(default)/documents/calendars/cal_${normalizedCal.id}`;
          const checkRes = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/${docPath}`);
          if (checkRes.ok) {
            const checkData = firestoreDocumentToJs(await checkRes.json());
            if ((checkData?.calendar?.updatedAt || 0) >= (lastModified || 0) && (checkData?.lastModified || 0) >= (lastModified || 0)) {
              return { ok: true, revision: checkData?.revision || null };
            }
          }
        } catch (checkErr) {
          checkError = checkErr;
          console.warn(`Firestore push timeout follow-up check failed for cal_${normalizedCal.id}:`, checkErr);
        }
        // Do not start an independent REST write when the SDK transaction may still be alive.
        // The caller can retry safely after this explicit unknown-state result; launching a
        // second read-modify-write here is what used to create late duplicate revisions.
        const statusError = new Error('저장 상태를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.');
        if (checkError) statusError.cause = checkError;
        throw statusError;
      }
    }
  }
  return pushSingleCalendarWithRest(normalizedCal, lastModified, saveMode, retryCount, newActivityLogs, auxiliaryData);
}
function loadLocalMeta() {
  // Revision metadata must not outlive the page that received it. Persistent metadata can
  // reject a valid server snapshot after a restore/import or data migration.
  try {
    const ls = __gatherSafeLocalStorage();
    if (ls) ls.removeItem(GATHER_LOCAL_META_KEY);
  } catch (_) {}
  return { lastModified: 0, byCalendar: {}, revision: 0, byCalendarRevision: {} };
}
function saveLocalMeta(meta) {
  // Intentionally no-op: revision guards are session-local only.
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

function getMetaRevision(meta, calendarId) {
  if (!meta) return 0;
  if (calendarId && meta.byCalendarRevision && typeof meta.byCalendarRevision[calendarId] === 'number') {
    return meta.byCalendarRevision[calendarId];
  }
  return typeof meta.revision === 'number' ? meta.revision : 0;
}

function updateMetaRevision(meta, calendarId, revision) {
  const cleanRevision = Number.isFinite(Number(revision)) ? Math.max(0, Math.round(Number(revision))) : 0;
  const next = {
    ...(meta || {}),
    revision: Math.max(getMetaRevision(meta), cleanRevision),
    byCalendarRevision: {
      ...((meta && meta.byCalendarRevision) || {})
    }
  };
  if (calendarId) next.byCalendarRevision[calendarId] = cleanRevision;
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
  const nowDate = new Date(now);
  const monthStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`;
  const settlementCards = id === 'jhair'
    ? [{
      id: `${id}_settlement_seed`,
      title: '1/N 간편 송금',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      participants: ['참여자 1', '참여자 2', '참여자 3'],
      participantCount: 3,
      amount: 1616600,
      totalIncome: 2681691,
      perPersonAmount: 404150,
      bankName: '우리은행',
      depositorName: '박영우',
      accountNumber: '1002-355-955722',
      monthStr,
      checkedItemKeys: []
    }]
    : [];
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
    settlementCards,
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

const CALENDAR_BACKUP_COLLECTION_NAMES = [
  'messages',
  'memos',
  'places',
  'confirmedMeetings',
  'activityLogs',
  'anniversaries'
];

function cloneJsonSafe(value) {
  if (value == null) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return value;
  }
}

function stripBackupCollectionsFromCalendar(calendar) {
  const cloned = normalizeCalendarForSave(calendar);
  if (!cloned || typeof cloned !== 'object') return cloned;
  const cleaned = { ...cloned };
  delete cleaned.activityLogs;
  delete cleaned.places;
  delete cleaned.confirmedMeeting;
  delete cleaned.messages;
  delete cleaned.memos;
  delete cleaned.anniversaries;
  delete cleaned.push_subscriptions;
  return cleaned;
}

function normalizeBackupCollectionDoc(collectionName, doc, index = 0) {
  if (!doc || typeof doc !== 'object') return null;
  const rawData = doc.data && typeof doc.data === 'object'
    ? doc.data
    : (doc.document && typeof doc.document === 'object' ? doc.document : doc);
  const docId = sanitizeText(doc.docId || doc.id || rawData.id || `${collectionName}_${index + 1}`, 180);
  if (!docId) return null;
  const data = cloneJsonSafe(rawData);
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return { docId, data };
}

function normalizeBackupCollectionDocs(collectionName, docs) {
  if (!Array.isArray(docs)) return [];
  return docs
    .map((doc, index) => normalizeBackupCollectionDoc(collectionName, doc, index))
    .filter(Boolean);
}

function normalizeBackupCollections(collections) {
  if (!collections || typeof collections !== 'object' || Array.isArray(collections)) return null;
  const normalized = {};
  let hasAny = false;
  CALENDAR_BACKUP_COLLECTION_NAMES.forEach(collectionName => {
    if (!Object.prototype.hasOwnProperty.call(collections, collectionName)) return;
    normalized[collectionName] = normalizeBackupCollectionDocs(collectionName, collections[collectionName]);
    hasAny = true;
  });
  if (!hasAny) return null;
  Object.keys(collections).forEach(collectionName => {
    if (CALENDAR_BACKUP_COLLECTION_NAMES.includes(collectionName)) return;
    const docs = normalizeBackupCollectionDocs(collectionName, collections[collectionName]);
    if (docs.length > 0) normalized[collectionName] = docs;
  });
  return normalized;
}

function getCalendarBackupCollectionBasePath(calendarId, collectionName) {
  return `calendars/cal_${calendarId}/${collectionName}`;
}

function compareBackupDocs(collectionName, a, b) {
  const aData = a?.data || {};
  const bData = b?.data || {};
  switch (collectionName) {
    case 'messages':
      return (Number(bData.timestamp) || 0) - (Number(aData.timestamp) || 0) || String(a.docId || '').localeCompare(String(b.docId || ''));
    case 'memos':
      return (Number(bData.createdAt) || 0) - (Number(aData.createdAt) || 0) || String(a.docId || '').localeCompare(String(b.docId || ''));
    case 'places':
      return (Number(bData.updatedAt) || 0) - (Number(aData.updatedAt) || 0) || String(a.docId || '').localeCompare(String(b.docId || ''));
    case 'confirmedMeetings':
      return String(aData.date || '').localeCompare(String(bData.date || '')) || String(a.docId || '').localeCompare(String(b.docId || ''));
    case 'activityLogs':
      return (Number(aData.timestamp) || 0) - (Number(bData.timestamp) || 0) || String(a.docId || '').localeCompare(String(b.docId || ''));
    case 'anniversaries':
      return (Number(bData.createdAt) || 0) - (Number(aData.createdAt) || 0) || String(a.docId || '').localeCompare(String(b.docId || ''));
    default:
      return String(a.docId || '').localeCompare(String(b.docId || ''));
  }
}

async function fetchCalendarCollectionDocs(calendarId, collectionName) {
  const cleanCalId = sanitizeText(calendarId || '', 64);
  const cleanCollection = sanitizeText(collectionName || '', 80);
  if (!cleanCalId || !cleanCollection) return [];
  const results = [];
  if (firebaseDb) {
    try {
      const snap = await withTimeout(firebaseDb.collection('calendars').doc(`cal_${cleanCalId}`).collection(cleanCollection).get({ source: 'server' }), FIRESTORE_REQUEST_TIMEOUT_MS, `${cleanCollection} read timeout`);
      snap.forEach(doc => {
        results.push({ docId: doc.id, data: cloneJsonSafe(doc.data() || {}) });
      });
    } catch (e) {
      console.warn(`Failed to fetch ${cleanCollection} for ${cleanCalId} via SDK, trying REST:`, e);
    }
  }
  if (results.length === 0) {
    try {
      let pageToken = '';
      do {
        const query = pageToken ? `?pageSize=300&pageToken=${encodeURIComponent(pageToken)}` : '?pageSize=300';
        const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${getCalendarBackupCollectionBasePath(cleanCalId, cleanCollection)}${query}`);
        if (!res.ok) break;
        const data = await res.json();
        const docs = data.documents || [];
        docs.forEach(doc => {
          results.push({
            docId: String(doc.name || '').split('/').pop(),
            data: cloneJsonSafe(firestoreDocumentToJs(doc) || {})
          });
        });
        pageToken = data.nextPageToken || '';
      } while (pageToken);
    } catch (e) {
      console.warn(`Failed to fetch ${cleanCollection} for ${cleanCalId} via REST:`, e);
    }
  }
  results.sort((a, b) => compareBackupDocs(cleanCollection, a, b));
  return results;
}

async function createCalendarDataBackupPayload(calendarsList, targetCalendarId = '') {
  const selected = targetCalendarId
    ? calendarsList.filter(calendar => calendar.id === targetCalendarId)
    : calendarsList.filter(calendar => isValidCalendarId(calendar.id));
  const bundle = {
    type: 'gather-calendar-data-backup',
    version: 2,
    exportedAt: new Date().toISOString(),
    projectId: firebaseConfig.projectId,
    calendarIds: selected.map(calendar => calendar.id),
    calendars: []
  };
  for (const calendar of selected) {
    const sanitizedCalendar = stripBackupCollectionsFromCalendar(calendar);
    const collections = {};
    for (const collectionName of CALENDAR_BACKUP_COLLECTION_NAMES) {
      collections[collectionName] = await fetchCalendarCollectionDocs(calendar.id, collectionName);
    }
    bundle.calendars.push({
      docId: `cal_${calendar.id}`,
      data: {
        calendar: sanitizedCalendar,
        lastModified: calendar.updatedAt || Date.now(),
        revision: calendar.revision || 0
      },
      collections,
      counts: Object.fromEntries(Object.entries(collections).map(([name, docs]) => [name, docs.length]))
    });
  }
  return bundle;
}

function extractCalendarBackupEntries(payload) {
  if (!payload) return [];
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.calendars)
      ? payload.calendars
      : payload.calendar
        ? [payload]
        : payload.data?.calendar
          ? [payload]
          : [];
  return rawItems.map((item) => {
    const data = item?.data && typeof item.data === 'object' ? item.data : item;
    const calendar = data?.calendar || item?.calendar || item;
    const collections = item?.collections || data?.collections || null;
    const backupEntry = {
      docId: sanitizeText(item?.docId || (calendar?.id ? `cal_${calendar.id}` : ''), 180),
      calendar: stripBackupCollectionsFromCalendar(calendar),
      lastModified: Number(data?.lastModified || item?.lastModified || calendar?.updatedAt || 0) || 0,
      revision: Number(data?.revision || item?.revision || calendar?.revision || 0) || 0,
      collections: normalizeBackupCollections(collections)
    };
    return backupEntry.calendar && isValidCalendarId(backupEntry.calendar.id) ? backupEntry : null;
  }).filter(Boolean);
}

function validateCalendarBackupEntries(entries) {
  const normalized = Array.isArray(entries) ? entries.filter(Boolean) : [];
  const calendars = normalized.map(entry => entry.calendar).filter(Boolean);
  const baseValidation = validateBackupCalendars(calendars);
  if (baseValidation.error) {
    return { calendars: [], entries: [], error: baseValidation.error };
  }
  for (const entry of normalized) {
    if (!entry || !entry.calendar || !isValidCalendarId(entry.calendar.id)) {
      return { calendars: [], entries: [], error: '복구 가능한 데이터 없음' };
    }
    if (entry.collections && typeof entry.collections === 'object') {
      for (const [collectionName, docs] of Object.entries(entry.collections)) {
        if (!Array.isArray(docs)) {
          return { calendars: [], entries: [], error: `${entry.calendar.id}: ${collectionName} 백업 형식 오류` };
        }
        for (const doc of docs) {
          if (!doc || typeof doc !== 'object' || typeof doc.docId !== 'string' || !doc.docId.trim() || !doc.data || typeof doc.data !== 'object') {
            return { calendars: [], entries: [], error: `${entry.calendar.id}: ${collectionName} 문서 형식 오류` };
          }
        }
      }
    }
  }
  return { calendars: baseValidation.calendars, entries: normalized, error: '' };
}

function splitIntoChunks(list, size) {
  const chunks = [];
  const input = Array.isArray(list) ? list : [];
  const chunkSize = Math.max(1, Math.floor(size || 1));
  for (let index = 0; index < input.length; index += chunkSize) {
    chunks.push(input.slice(index, index + chunkSize));
  }
  return chunks;
}

async function applyCalendarCollectionDocs(calendarId, collectionName, docs) {
  const cleanCalId = sanitizeText(calendarId || '', 64);
  const cleanCollection = sanitizeText(collectionName || '', 80);
  if (!cleanCalId || !cleanCollection) return false;
  const normalizedDocs = normalizeBackupCollectionDocs(cleanCollection, docs);
  const existingDocs = await fetchCalendarCollectionDocs(cleanCalId, cleanCollection);
  const ops = [
    ...existingDocs.map(doc => ({ type: 'delete', docId: doc.docId })),
    ...normalizedDocs.map(doc => ({ type: 'set', docId: doc.docId, data: doc.data }))
  ];
  if (ops.length === 0) return true;
  const chunks = splitIntoChunks(ops, 350);
  const collectionPath = getCalendarBackupCollectionBasePath(cleanCalId, cleanCollection);

  if (firebaseDb) {
    try {
      const colRef = firebaseDb.collection('calendars').doc(`cal_${cleanCalId}`).collection(cleanCollection);
      for (const chunk of chunks) {
        const batch = firebaseDb.batch();
        chunk.forEach(op => {
          const docRef = colRef.doc(op.docId);
          if (op.type === 'delete') batch.delete(docRef);
          else batch.set(docRef, cloneJsonSafe(op.data) || {});
        });
        await batch.commit();
      }
      return true;
    } catch (e) {
      console.warn(`Failed to apply ${cleanCollection} for ${cleanCalId} via SDK, trying REST:`, e);
    }
  }

  try {
    for (const chunk of chunks) {
      const writes = chunk.map(op => {
        const name = `projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionPath}/${op.docId}`;
        if (op.type === 'delete') {
          return { delete: name };
        }
        return {
          update: {
            name,
            fields: Object.fromEntries(Object.entries(cloneJsonSafe(op.data) || {}).map(([key, value]) => [key, jsToFirestoreValue(value)]))
          }
        };
      });
      const res = await fetchFirestoreRequest(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents:commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ writes })
      });
      if (!res.ok) {
        console.warn(`Failed to apply ${cleanCollection} for ${cleanCalId} via REST:`, await res.text());
        return false;
      }
    }
    return true;
  } catch (e) {
    console.warn(`Failed to apply ${cleanCollection} for ${cleanCalId} via REST:`, e);
    return false;
  }
}

async function restoreCalendarBackupEntries(entries) {
  const normalizedEntries = Array.isArray(entries) ? entries.filter(Boolean) : [];
  const results = [];
  const now = Date.now();
  for (const entry of normalizedEntries) {
    const calendar = stripBackupCollectionsFromCalendar(entry.calendar);
    if (!calendar || !calendar.id) {
      results.push({ id: '', saved: false, reason: 'invalid-calendar' });
      continue;
    }
    const restoredCalendar = {
      ...calendar,
      updatedAt: now,
      revision: (calendar.revision || 0) + 1
    };
    const saved = await pushSingleCloudCalendar(restoredCalendar, now, 18, null, 'restore');
    if (!saved) {
      results.push({ id: calendar.id, saved: false, reason: 'calendar-write-failed' });
      continue;
    }
    if (entry.collections && typeof entry.collections === 'object') {
      let collectionFailed = '';
      for (const collectionName of CALENDAR_BACKUP_COLLECTION_NAMES) {
        if (!Object.prototype.hasOwnProperty.call(entry.collections, collectionName)) continue;
        const ok = await applyCalendarCollectionDocs(calendar.id, collectionName, entry.collections[collectionName]);
        if (!ok) {
          collectionFailed = collectionName;
          break;
        }
      }
      if (collectionFailed) {
        results.push({ id: calendar.id, saved: false, reason: `${collectionFailed}-restore-failed` });
        continue;
      }
    }
    results.push({ id: calendar.id, saved: true, calendar: restoredCalendar });
  }
  const failed = results.filter(result => !result.saved);
  if (failed.length > 0) {
    return { ok: false, results, failed };
  }
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gather-firebase-state-change'));
    }
  } catch (_) {}
  return { ok: true, results, failed: [] };
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
    const meetings = getConfirmedMeetings(cal);
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
    const photoDateBuckets = [];
    let photoCount = 0;
    meetings.forEach(meeting => {
      const photos = Array.isArray(meeting.photos) ? meeting.photos : [];
      if (photos.length === 0) return;
      photoCount += photos.length;
      photoDateBuckets.push({ date: meeting.date, count: photos.length });
    });
    const photoTopDates = photoDateBuckets
      .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))
      .slice(0, 5);
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
      sizePercent: Math.round(sizeBytes / 1048576 * 1000) / 10,
      photoCount,
      photoTopDates
    };
  });
  const allSchedules = calendarStats.flatMap(stat => stat.schedules.map(item => ({ ...item, calendarId: stat.calendar.id })));
  const totalParticipants = calendarStats.reduce((sum, stat) => sum + stat.participants.length, 0);
  const totalSchedules = allSchedules.length;
  const totalPolls = calendarStats.reduce((sum, stat) => sum + stat.pollCount, 0);
  const totalPollOptions = calendarStats.reduce((sum, stat) => sum + stat.pollOptionCount, 0);
  const totalPollVotes = calendarStats.reduce((sum, stat) => sum + stat.pollVoteCount, 0);
  const totalConfirmedMeetings = calendarStats.reduce((sum, stat) => sum + stat.confirmedCount, 0);
  const totalPhotos = calendarStats.reduce((sum, stat) => sum + stat.photoCount, 0);
  const uniqueDateCount = new Set(allSchedules.map(item => `${item.calendarId}_${item.date}`)).size;
  const upcomingCount = allSchedules.filter(item => item.date >= todayStr).length;
  const memoCount = allSchedules.filter(item => item.note).length;
  const maxSchedules = Math.max(1, ...calendarStats.map(stat => stat.schedules.length));
  const maxMonthCount = Math.max(1, ...calendarStats.flatMap(stat => stat.monthStats.map(item => item.count)));
  const latestCalendarUpdatedAt = Math.max(0, ...calendarStats.map(stat => Number(stat.calendar?.updatedAt || 0)));
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
    totalPhotos,
    uniqueDateCount,
    upcomingCount,
    memoCount,
    maxSchedules,
    maxMonthCount,
    latestCalendarUpdatedAt,
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
  firebaseRetryExhausted,
  firebaseStorage,
  isStorageDisabled,
  lastStorageHealthCheckAt,
  lastStorageHealthOk,
  STORAGE_HEALTH_RECHECK_COOLDOWN_MS,
  checkFirebaseStorageHealth,
  fetchSingleCalendarWithRest,
  fetchRecentMessagesRest,
  fetchChatMessagesRest,
  fetchAllChatMessagesRest,
  fetchRecentChatMessages,
  fetchRecentGalleryMessages,
  fetchMessagesByImageTag,
  fetchMeetingPhotoIndex,
  CHAT_OLDER_PAGE_SIZE,
  MAX_OLDER_CHAT_MESSAGES,
  fetchSubcollectionCount,
  fetchOlderChatMessages,
  fetchMessageOrdinal,
  fetchGalleryPhotoOrdinal,
  fetchGalleryItemCount,
  invalidateGalleryItemCount,
  fetchMemosRest,
  fetchAnniversariesRest,
  sendChatMessageRest,
  writeCollectionDocumentWithFallback,
  writeRootCollectionDocumentWithFallback,
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
  getMetaRevision,
  updateMetaRevision,
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
  createCalendarDataBackupPayload,
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
  extractCalendarBackupEntries,
  validateCalendarBackupEntries,
  restoreCalendarBackupEntries,
  validateBackupCalendars,
  buildAdminDashboardMetrics,
  CALENDAR_ACCENT_PALETTE,
  getCalendarAccentColor
};
