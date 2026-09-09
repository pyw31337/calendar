import {
  getCalendarPlaces,
  getCalendarPolls,
  getTrulyConfirmedMeetings,
  isValidDateString
} from './app-domain-helpers.js';

const CHAT_LAST_READ_KEY_PREFIX = 'gather_chat_last_read_v1_';
const NEW_CONTENT_DOT_WINDOW_MS = 6 * 60 * 60 * 1000;

export function getLocalStorage() {
  return window['local' + 'Storage'];
}

export function getChatLastReadTimestamp(calendarId) {
  try {
    const raw = getLocalStorage().getItem(CHAT_LAST_READ_KEY_PREFIX + calendarId);
    return raw ? Number(raw) || 0 : 0;
  } catch (_) {
    return 0;
  }
}

export function setChatLastReadTimestamp(calendarId, timestamp) {
  try {
    getLocalStorage().setItem(CHAT_LAST_READ_KEY_PREFIX + calendarId, String(timestamp));
  } catch (_) {
    // Private browsing or disabled storage: read state remains device-local and optional.
  }
}

export function buildMainCalendarScreenState({
  calendar,
  calendarId,
  visibleTotalChatCount,
  visibleChatMessages = [],
  totalMemoCount,
  memos = [],
  localGalleryCount,
  totalGalleryCount,
  now = new Date()
}) {
  const polls = getCalendarPolls(calendar);
  const hasVisiblePolls = polls.some(poll => !poll.hidden);
  const mainMenuChatCount = typeof visibleTotalChatCount === 'number' && visibleTotalChatCount >= 0
    ? visibleTotalChatCount
    : visibleChatMessages.length;
  const mainMenuChatLatestTimestamp = visibleChatMessages.length > 0
    ? visibleChatMessages[visibleChatMessages.length - 1].timestamp
    : 0;
  const mainMenuChatHasUnread = mainMenuChatLatestTimestamp > getChatLastReadTimestamp(calendarId);
  const mainMenuPollLatestTimestamp = polls
    .filter(poll => !poll.hidden)
    .reduce((max, poll) => Math.max(max, Number(poll.createdAt) || 0), 0);
  const mainMenuPollHasNew = mainMenuPollLatestTimestamp > 0
    && (now.getTime() - mainMenuPollLatestTimestamp) < NEW_CONTENT_DOT_WINDOW_MS;
  const mainMenuMemoCount = typeof totalMemoCount === 'number' && totalMemoCount >= 0
    ? totalMemoCount
    : memos.length;
  const mainMenuMemoLatestTimestamp = memos
    .reduce((max, memo) => Math.max(max, Number(memo && memo.createdAt) || 0), 0);
  const mainMenuMemoHasNew = mainMenuMemoLatestTimestamp > 0
    && (now.getTime() - mainMenuMemoLatestTimestamp) < NEW_CONTENT_DOT_WINDOW_MS;
  const mainMenuGalleryCount = localGalleryCount > 0
    ? localGalleryCount
    : (typeof totalGalleryCount === 'number' && totalGalleryCount >= 0 ? totalGalleryCount : localGalleryCount);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const visibleConfirmedMeetings = getTrulyConfirmedMeetings(calendar)
    .filter(meeting => isValidDateString(meeting?.date) && meeting.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    hasVisiblePolls,
    mainMenuChatCount,
    mainMenuChatHasUnread,
    mainMenuPollHasNew,
    mainMenuMemoCount,
    mainMenuMemoHasNew,
    mainMenuGalleryCount,
    mainMenuPlaceCount: getCalendarPlaces(calendar).length,
    visibleConfirmedMeetings
  };
}
