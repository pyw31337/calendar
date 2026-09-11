/**
 * Memo view page (P4-15)
 */

import { enqueueWriteOperation } from '../core/app-write-queue.js';
import { useScrollHideHeader } from '../core/use-scroll-hide-header.js';

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONFIG = window.GATHER_APP_CONFIG || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function useModalDirtyGuard(...args) {
  return __gatherUiDeps().useModalDirtyGuard(...args);
}
/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

function withMemoFirestoreTimeout(promise, timeoutMs = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('메모 저장 시간이 초과되었습니다.')), timeoutMs))
  ]);
}

// "최근 활동" auto-pin: ideally this would only surface memos with an UNREAD comment, but
// participants aren't authenticated individuals here (see getStoredChatParticipantId -- it's a
// per-browser preference, not a login), so there's no reliable way to know who has or hasn't
// seen a given comment. A fixed time window after the most recent comment is the practical
// substitute -- a memo stays pinned for a while after activity regardless of who's looking.
//
// Known gap: this only considers memos already present in the `memos` prop. app-main.js loads
// memos as isPinned-unbounded + createdAt-paginated (see its memo subscription effect) -- there's
// no query keyed on comment recency, so a memo created long ago that just received a comment
// won't surface here on a fresh page load unless it's also within the paginated recent window
// or the user pages back to it. Fixing that would need a denormalized lastCommentAt field (a
// firestore.rules change, deployed separately from the app) rather than a client-only change.
const RECENT_MEMO_ACTIVITY_WINDOW_MS = 6 * 60 * 60 * 1000;

function getLatestMemoCommentTimestamp(memo) {
  const comments = memo?.comments || [];
  let latest = 0;
  for (const c of comments) {
    const t = Number(c?.createdAt) || 0;
    if (t > latest) latest = t;
  }
  return latest;
}

function getMemoRecentActivityDismissalStorageKey(calendarId) {
  return `gather_memo_recent_activity_dismissed_${calendarId || 'default'}`;
}

function parseMemoShareUrl(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  let url;
  try {
    url = new URL(text);
  } catch (_) {
    return null;
  }

  // Only accept this app's public share route. This prevents arbitrary URLs
  // pasted into a memo from becoming a cross-origin data fetch primitive.
  const allowedHosts = new Set([
    window.location.host,
    'pyw31337.github.io'
  ].filter(Boolean));
  if (!allowedHosts.has(url.host)) return null;

  const parts = url.pathname.split('/').filter(Boolean);
  const shareIndex = parts.indexOf('share');
  if (shareIndex < 0 || parts[shareIndex + 2] !== 'memo' || !parts[shareIndex + 3]) return null;
  const calendarId = decodeURIComponent(parts[shareIndex + 1] || '');
  const memoId = decodeURIComponent(parts[shareIndex + 3] || '');
  const publicCalendarIds = GATHER_APP_CONFIG.PUBLIC_CALENDAR_IDS || [];
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(calendarId) || !/^[A-Za-z0-9_-]{1,128}$/.test(memoId)) return null;
  if (publicCalendarIds.length > 0 && !publicCalendarIds.includes(calendarId)) return null;
  return { calendarId, memoId, url: url.toString() };
}

function getMemoShareUrlFromText(value) {
  const text = String(value || '').trim();
  const match = text.match(/https?:\/\/[^\s]+/i);
  if (!match) return null;
  const candidate = match[0].replace(/[),.;!?]+$/, '');
  const parsed = parseMemoShareUrl(candidate);
  return parsed && text === candidate ? parsed : null;
}

async function fetchMemoForClone(share) {
  if (!share) return null;
  const db = __fb();
  if (db) {
    const snapshot = await withMemoFirestoreTimeout(
      db.collection('calendars').doc(`cal_${share.calendarId}`).collection('memos').doc(share.memoId).get(),
      9000
    );
    return snapshot?.exists ? { id: snapshot.id, ...snapshot.data() } : null;
  }

  const projectId = window.GATHER_FIREBASE_DEPS?.projectId || '';
  if (!projectId) return null;
  const response = await withMemoFirestoreTimeout(fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/calendars/cal_${encodeURIComponent(share.calendarId)}/memos/${encodeURIComponent(share.memoId)}`,
    { cache: 'no-store' }
  ), 9000);
  if (!response.ok) return null;
  const json = await response.json();
  const decode = window.GATHER_FIREBASE_DEPS?.firestoreDocumentToJs;
  return { id: share.memoId, ...(typeof decode === 'function' ? decode(json) : {}) };
}

// Cross-calendar memo clone: source participantId is scoped to the SOURCE calendar, so writing
// it into the target calendar leaves MemoCard unable to resolve a writer badge (looks like
// "작성자 없음"). Resolve the source author's display name, then map to a same-named participant
// on the target calendar. Fall back to the composer selection, never keep a foreign id.
function participantsFromCalendarDoc(data) {
  // Calendar shell is { calendar: { participants, ... }, lastModified, revision }.
  // Legacy/top-level participants are accepted as a fallback only.
  if (!data || typeof data !== 'object') return [];
  const nested = data.calendar?.participants;
  const top = data.participants;
  const parts = Array.isArray(nested) ? nested : (Array.isArray(top) ? top : []);
  return parts;
}

async function fetchSourceParticipantName(calendarId, participantId) {
  const pid = String(participantId || '').trim();
  if (!calendarId || !pid || pid === 'anonymous') return '';
  const db = __fb();
  try {
    if (db) {
      const snapshot = await withMemoFirestoreTimeout(
        db.collection('calendars').doc(`cal_${calendarId}`).get(),
        9000
      );
      const parts = snapshot?.exists ? participantsFromCalendarDoc(snapshot.data()) : [];
      const hit = parts.find(p => p && String(p.id || '') === pid);
      return hit ? String(hit.name || '').trim() : '';
    }
    const projectId = window.GATHER_FIREBASE_DEPS?.projectId || '';
    if (!projectId) return '';
    const response = await withMemoFirestoreTimeout(fetch(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/calendars/cal_${encodeURIComponent(calendarId)}`,
      { cache: 'no-store' }
    ), 9000);
    if (!response.ok) return '';
    const json = await response.json();
    const decode = window.GATHER_FIREBASE_DEPS?.firestoreDocumentToJs;
    const data = typeof decode === 'function' ? decode(json) : {};
    const parts = participantsFromCalendarDoc(data);
    const hit = parts.find(p => p && String(p.id || '') === pid);
    return hit ? String(hit.name || '').trim() : '';
  } catch (_) {
    return '';
  }
}

function matchParticipantIdByName(calendar, name) {
  const needle = String(name || '').trim().toLowerCase();
  if (!needle) return '';
  // Prefer active (non-tombstone) participants so clone does not reattach a removed author.
  const parts = Array.isArray(calendar?.participants) ? calendar.participants : [];
  const active = parts.filter(p => p && !p.removedAt && !p.deletedAt);
  const pool = active.length > 0 ? active : parts;
  const hit = pool.find(p => p && String(p.name || '').trim().toLowerCase() === needle);
  return hit && hit.id ? String(hit.id) : '';
}

async function resolveCloneParticipantId(sourceMemo, sourceCalendarId, targetCalendar, composerParticipantId) {
  const sourcePid = String(sourceMemo?.participantId || '').trim();
  const targetId = String(targetCalendar?.id || '').trim();
  // Same calendar: keep the original id.
  if (sourcePid && sourceCalendarId && targetId && sourceCalendarId === targetId) return sourcePid;
  if (sourcePid && sourceCalendarId) {
    const sourceName = await fetchSourceParticipantName(sourceCalendarId, sourcePid);
    const mapped = matchParticipantIdByName(targetCalendar, sourceName);
    if (mapped) return mapped;
  }
  const composer = String(composerParticipantId || '').trim();
  if (composer && (targetCalendar?.participants || []).some(p => p && p.id === composer)) return composer;
  return composer || 'anonymous';
}

function getStoredChatParticipantId(...args) {
  const fn = (window.GATHER_APP_NOTIFICATIONS || {}).getStoredChatParticipantId;
  return typeof fn === 'function' ? fn(...args) : '';
}
function setStoredChatParticipantId(...args) {
  const fn = (window.GATHER_APP_NOTIFICATIONS || {}).setStoredChatParticipantId;
  return typeof fn === 'function' ? fn(...args) : undefined;
}

function readClipboardImageFiles(...args) {
  const f = __gatherUiDeps().readClipboardImageFiles || GATHER_APP_UTILS.readClipboardImageFiles;
  return typeof f === 'function' ? f(...args) : Promise.resolve([]);
}
function buildFieldChangeNote(...args) {
  const f = __gatherUiDeps().buildFieldChangeNote || GATHER_APP_UTILS.buildFieldChangeNote;
  return typeof f === 'function' ? f(...args) : undefined;
}
function createMemoActivityLog(...args) {
  const f = __gatherUiDeps().createMemoActivityLog || GATHER_APP_UTILS.createMemoActivityLog;
  return typeof f === 'function' ? f(...args) : undefined;
}
function describeImageProcessingFailures(...args) {
  const f = __gatherUiDeps().describeImageProcessingFailures || GATHER_APP_UTILS.describeImageProcessingFailures;
  return typeof f === 'function' ? f(...args) : undefined;
}
function processImageFilesSequentially(...args) {
  const f = __gatherUiDeps().processImageFilesSequentially || GATHER_APP_UTILS.processImageFilesSequentially;
  return typeof f === 'function' ? f(...args) : undefined;
}
function pushSingleCloudCalendar(...args) {
  const f = __gatherUiDeps().pushSingleCloudCalendar || GATHER_APP_UTILS.pushSingleCloudCalendar;
  return typeof f === 'function' ? f(...args) : undefined;
}
function resolveMemoImageBatch(...args) {
  const f = __gatherUiDeps().resolveMemoImageBatch || GATHER_APP_UTILS.resolveMemoImageBatch;
  return typeof f === 'function' ? f(...args) : undefined;
}
function sanitizeMemoForFirestore(...args) {
  const f = __gatherUiDeps().sanitizeMemoForFirestore || GATHER_APP_UTILS.sanitizeMemoForFirestore;
  return typeof f === 'function' ? f(...args) : undefined;
}
function writeMemoDocument(...args) {
  const f = __gatherUiDeps().writeCollectionDocumentWithFallback;
  return typeof f === 'function' ? f(...args) : null;
}
function memoImagesCanBeQueued(images) {
  return Array.isArray(images) && images.length > 0 && images.every(image => image?.isExisting || (image?.originalBlob && image?.thumbnailBlob));
}
function enqueueMemoMediaSave(...args) {
  const f = __gatherUiDeps().enqueueMemoMediaSave || GATHER_APP_UTILS.enqueueMemoMediaSave;
  return typeof f === 'function' ? f(...args) : enqueueWriteOperation(...args);
}
export function MemoView({ calendar, memos, hasMoreMemos, totalMemoCount, onLoadMoreMemos, onBack, showToast, isDarkTheme, onRequestConfirm, sharedMemo, onDismissSharedMemo, chatMessages, setActiveLightbox, onOpenShare, onOpenAppSettings, onChangeView, onUpdateMemo, onUpsertMemo, onDeleteMemo, memoInitialTag, setMemoInitialTag, chatCount = 0, settlementBadge = null, galleryCount = 0, placeCount = 0, memoCount = 0, historyCount = 0, chatLastAuthor = null, settlementLastDate = null, galleryLastDate = null, placeLastName = null, memoLastTitleWord = null }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const ChatGalleryModal = __comp.ChatGalleryModal || __deps.ChatGalleryModal;
  const ChatParticipantSheet = __comp.ChatParticipantSheet || __deps.ChatParticipantSheet;
  const EmojiPickerIcon = __comp.EmojiPickerIcon || __deps.EmojiPickerIcon;
  const EmojiPickerSheet = __comp.EmojiPickerSheet || __deps.EmojiPickerSheet;
  const ImageProcessingOverlay = __comp.ImageProcessingOverlay || __deps.ImageProcessingOverlay;
  const ImageThumbRemoveButton = __comp.ImageThumbRemoveButton || __deps.ImageThumbRemoveButton;
  const ImageUploadOverlay = __comp.ImageUploadOverlay || __deps.ImageUploadOverlay;
  const InlineSearchBar = __comp.InlineSearchBar || __deps.InlineSearchBar;
  const SearchIcon = ({ size = 20 }) => /*#__PURE__*/React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-4.3-4.3" }));
  const LinkPreviewCard = __deps.LinkPreviewCard || __comp.LinkPreviewCard;
  const LinkPreviewProgressOverlay = __deps.LinkPreviewProgressOverlay;
  const MemoCard = __deps.MemoCard;
  const MemoShareModal = __comp.MemoShareModal || __deps.MemoShareModal;
  const ParticipantPickerButton = __deps.ParticipantPickerButton;
  const extractFirstUrl = __deps.extractFirstUrl;
  const extractAllUrlInfosLoose = __deps.extractAllUrlInfosLoose || __deps.extractAllUrlInfos;
  const fetchLinkPreview = __deps.fetchLinkPreview;
  const collectMemoPreviewUrls = (text) => {
    const first = extractFirstUrl(text || '');
    const list = first ? [first] : [];
    const infos = typeof extractAllUrlInfosLoose === 'function' ? extractAllUrlInfosLoose(text || '') : [];
    infos.forEach(info => { if (info && info.url && !list.includes(info.url)) list.push(info.url); });
    return list;
  };
  const buildMemoLinkPreviews = (text, existingMemo = null) => {
    const urls = collectMemoPreviewUrls(text);
    const existingList = Array.isArray(existingMemo?.linkPreviews) ? existingMemo.linkPreviews : [];
    const existingByUrl = new Map(existingList.filter(p => p && p.url).map(p => [p.url, p]));
    if (existingMemo?.linkPreview?.url) existingByUrl.set(existingMemo.linkPreview.url, existingMemo.linkPreview);
    else if (existingMemo?.linkPreview && urls[0]) existingByUrl.set(urls[0], existingMemo.linkPreview);
    const linkPreviews = urls.map(url => existingByUrl.get(url) || null).filter(Boolean);
    return { urls, linkPreview: linkPreviews[0] || null, linkPreviews };
  };
  const hydrateMemoLinkPreviewsInBackground = (calendarId, memoId, text, existingMemo = null) => {
    if (typeof fetchLinkPreview !== 'function' || !calendarId || !memoId) return;
    const { urls } = buildMemoLinkPreviews(text, existingMemo);
    if (!urls.length) return;
    void Promise.all(urls.map(async url => {
      try {
        const result = await fetchLinkPreview(url, calendarId);
        if (result?.status === 'success' && result.data) return { ...result.data, url: result.data.url || url };
      } catch (_) {}
      return null;
    })).then(async results => {
      const linkPreviews = results.filter(Boolean);
      if (!linkPreviews.length) return;
      const patch = sanitizeMemoForFirestore({ linkPreview: linkPreviews[0] || null, linkPreviews });
      const updated = await writeMemoDocument('memos', calendarId, memoId, patch, 'update', '메모 링크 미리보기 후처리');
      if (updated?.success && typeof onUpdateMemo === 'function') onUpdateMemo(memoId, patch);
      else if (updated?.success && typeof onUpsertMemo === 'function') {
        /* best-effort local patch via upsert if only upsert is wired */
      }
    }).catch(err => console.warn('Background memo link preview failed:', err));
  };
  const autoGrowTextarea = __deps.autoGrowTextarea;
      const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  // A hashtag clicked on the main-screen memo preview (see MemoPreviewSection's onSelectTag in
  // app-main.js) carries the tag straight into this page's own filter instead of the unrelated
  // cross-content global search overlay.
  React.useEffect(() => {
    if (!memoInitialTag) return;
    setSelectedTag(memoInitialTag);
    if (typeof setMemoInitialTag === 'function') setMemoInitialTag('');
  }, [memoInitialTag, setMemoInitialTag]);
  // Header hides on scroll-down / reappears on scroll-up, matching the chat room header exactly.
  const { isHeaderVisible, onScroll: handleMemoScroll } = useScrollHideHeader();

  // "최근 활동" auto-pin (see RECENT_MEMO_ACTIVITY_WINDOW_MS above). recentActivityNow ticks
  // every minute purely so a memo whose 6-hour window lapses with no other interaction on the
  // page still drops out of the section on its own, instead of only re-evaluating on the next
  // unrelated re-render.
  const [recentActivityNow, setRecentActivityNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setRecentActivityNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  // Turning a "최근 활동" auto-pin off doesn't have a real isPinned field to flip (that would
  // re-pin every browser looking at this calendar, not just dismiss it for this one) -- it's
  // remembered locally instead, keyed by the exact comment timestamp that triggered the pin, so
  // a genuinely new comment afterward (different timestamp) naturally re-pins it.
  const [dismissedRecentActivity, setDismissedRecentActivity] = React.useState(() => {
    try {
      const raw = localStorage.getItem(getMemoRecentActivityDismissalStorageKey(calendar?.id));
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  });
  const dismissRecentActivity = (memoId, timestamp) => {
    setDismissedRecentActivity(prev => {
      const next = { ...prev, [memoId]: timestamp };
      try {
        localStorage.setItem(getMemoRecentActivityDismissalStorageKey(calendar?.id), JSON.stringify(next));
      } catch (e) { /* best-effort only */ }
      return next;
    });
  };
    const SharedSideMenuFooter = (__comp && __comp.SharedSideMenuFooter) || (window.GATHER_UI_DEPS || {}).SharedSideMenuFooter;
  const SharedAppNavBlock = (__comp && __comp.SharedAppNavBlock) || (window.GATHER_UI_DEPS || {}).SharedAppNavBlock;
  const ThreeLinesIcon = (__comp && __comp.ThreeLinesIcon) || (window.GATHER_UI_DEPS || {}).ThreeLinesIcon;
  const PAGE_HEADER_ICON_BTN_STYLE = (__comp && __comp.PAGE_HEADER_ICON_BTN_STYLE) || (window.GATHER_UI_DEPS || {}).PAGE_HEADER_ICON_BTN_STYLE || {
    background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  };
  const PAGE_HEADER_ACTIONS_WRAP_STYLE = (__comp && __comp.PAGE_HEADER_ACTIONS_WRAP_STYLE) || (window.GATHER_UI_DEPS || {}).PAGE_HEADER_ACTIONS_WRAP_STYLE || {
    display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
  };
  const PAGE_HEADER_TITLE_STYLE = (__comp && __comp.PAGE_HEADER_TITLE_STYLE) || (window.GATHER_UI_DEPS || {}).PAGE_HEADER_TITLE_STYLE || {
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '0.95rem',
    color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    maxWidth: 'calc(100vw - 120px)', pointerEvents: 'none'
  };
  const WeatherBadge = (__comp && __comp.WeatherBadge) || (window.GATHER_UI_DEPS || {}).WeatherBadge;
  const [isMemoMenuOpen, setIsMemoMenuOpen] = React.useState(false);
const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const memoSearchInputRef = React.useRef(null);
  React.useEffect(() => {
    if (isSearchOpen) memoSearchInputRef.current?.focus();
  }, [isSearchOpen]);
  const [isComposerExpanded, setIsComposerExpanded] = React.useState(false);
  const newTitleInputRef = React.useRef(null);
  React.useEffect(() => {
    if (isComposerExpanded) newTitleInputRef.current?.focus();
  }, [isComposerExpanded]);

  // New Memo Composer State
  const [newTitle, setNewTitle] = React.useState('');
  const [newText, setNewText] = React.useState('');
  const [newColor, setNewColor] = React.useState('var(--bg-card)');
  const [newIsPinned, setNewIsPinned] = React.useState(false);
  const [newTags, setNewTags] = React.useState([]); // array of strings (tag tokens)
  const [newTagInput, setNewTagInput] = React.useState('');
  const newTagInputRef = React.useRef(null);
  const editTagInputRef = React.useRef(null);
  const [newImages, setNewImages] = React.useState([]); // array of { original, thumbnail, originalBlob, thumbnailBlob } (same shape chat uses)
  const [imageProcessingNew, setImageProcessingNew] = React.useState(null); // compression phase, mirrors chat's imageProcessing
  const [newUploadProgress, setNewUploadProgress] = React.useState(null); // upload phase: { pct, remainingSec }

  // Editing Memo State
  const [editingMemo, setEditingMemo] = React.useState(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editText, setEditText] = React.useState('');
  const editMemoTextareaRef = React.useRef(null);
  // editText gets set from an existing memo's text when 수정 is clicked (not just from typing),
  // so sizing needs to run on every editText change, not just once on mount.
  React.useEffect(() => autoGrowTextarea(editMemoTextareaRef.current, 400), [editText]);
  const [editColor, setEditColor] = React.useState('');
  const [editIsPinned, setEditIsPinned] = React.useState(false);
  const [editTags, setEditTags] = React.useState([]); // array of strings (tag tokens)
  const [editTagInput, setEditTagInput] = React.useState('');
  const [editImages, setEditImages] = React.useState([]); // { original, thumbnail, isExisting } for kept photos, { original, thumbnail, originalBlob, thumbnailBlob } for new ones
  const [imageProcessingEdit, setImageProcessingEdit] = React.useState(null); // compression phase, mirrors chat's imageProcessingEdit
  const [editUploadProgress, setEditUploadProgress] = React.useState(null); // upload phase: { pct, remainingSec }

  // Participant Picker States
  const [composerParticipantId, setComposerParticipantId] = React.useState(() => {
    return getStoredChatParticipantId(calendar?.id, calendar);
  });
  const [isComposerPartOpen, setIsComposerPartOpen] = React.useState(false);
  const [editParticipantId, setEditParticipantId] = React.useState('');
  const [isEditPartOpen, setIsEditPartOpen] = React.useState(false);
  const memoEditorDirtySnapshot = () => JSON.stringify([
    editTitle,
    editText,
    editColor,
    editIsPinned,
    editTags,
    editTagInput,
    editParticipantId,
    editImages.map(img => [img.original, img.thumbnail, img.isExisting ? 1 : 0])
  ]);
  // MemoView stays mounted while the inline editor is open, so pass the active flag and the
  // current memo id as a baseline reset key to keep dirty tracking scoped to the memo being
  // edited rather than the page's surrounding composer/search state.
  const memoEditorDirtyGuard = useModalDirtyGuard(
    () => setEditingMemo(null),
    onRequestConfirm,
    undefined,
    !!editingMemo,
    memoEditorDirtySnapshot,
    editingMemo?.id || 'new'
  );

  // Emoji Picker States
  const [isComposerEmojiOpen, setIsComposerEmojiOpen] = React.useState(false);
  const [isEditEmojiOpen, setIsEditEmojiOpen] = React.useState(false);

  // Curated RGBA pastel background colors that work perfectly in both Light and Dark mode
  const MEMO_COLORS = [
    { name: '기본', value: 'var(--bg-card)', border: 'var(--border-subtle)' },
    { name: '빨강', value: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
    { name: '오렌지', value: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
    { name: '노랑', value: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.3)' },
    { name: '초록', value: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
    { name: '하늘', value: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
    { name: '파랑', value: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
    { name: '보라', value: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' },
    { name: '핑크', value: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.3)' }
  ];

  const getBorderColor = (colorVal) => {
    const matched = MEMO_COLORS.find(c => c.value === colorVal);
    return matched ? matched.border : 'var(--border-subtle)';
  };

  // Reuses the exact same compression/thumbnail pipeline chat attachments use
  // (processImageFilesSequentially -> compressImageToDataUrls), so memo photos get
  // identical quality handling, HEIC support, and a { original, thumbnail, originalBlob,
  // thumbnailBlob } shape that resolveMemoImageBatch and the thumbnail <img> below expect.
  const attachComposerFiles = async (files) => {
    if (!files || files.length === 0) return;
    try {
      const remainingSlots = 50 - newImages.length;
      if (remainingSlots <= 0) {
        if (showToast) showToast('사진 최대 50장', 'error');
        return;
      }
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      if (files.length > remainingSlots && showToast) {
        showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
      }

      setImageProcessingNew({ current: 0, total: filesToProcess.length });
      const { succeeded, failed } = await processImageFilesSequentially(
        filesToProcess,
        progress => setImageProcessingNew(progress)
      );

      if (succeeded.length > 0) setNewImages(prev => [...prev, ...succeeded]);
      if (failed.length > 0) {
        console.error('Image compression failed for:', failed.map(f => f.fileName));
        if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
      } else if (succeeded.length > 0 && showToast) {
        showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
      }
    } catch (err) {
      console.error('attachComposerFiles unexpected error:', err);
      if (showToast) showToast('사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingNew(null);
    }
  };
  const handleComposerFileSelect = async (e) => {
    const files = e.target.files;
    await attachComposerFiles(files);
    e.target.value = '';
  };
  const handleComposerPasteClick = async () => {
    const files = await readClipboardImageFiles(showToast);
    if (files && files.length > 0) await attachComposerFiles(files);
  };

  const attachEditFiles = async (files) => {
    if (!files || files.length === 0) return;
    try {
      const remainingSlots = 50 - editImages.length;
      if (remainingSlots <= 0) {
        if (showToast) showToast('사진 최대 50장', 'error');
        return;
      }
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      if (files.length > remainingSlots && showToast) {
        showToast(`${remainingSlots}장만 추가됨 (최대 50장)`, 'info');
      }

      setImageProcessingEdit({ current: 0, total: filesToProcess.length });
      const { succeeded, failed } = await processImageFilesSequentially(
        filesToProcess,
        progress => setImageProcessingEdit(progress)
      );

      if (succeeded.length > 0) setEditImages(prev => [...prev, ...succeeded]);
      if (failed.length > 0) {
        console.error('Image compression failed for:', failed.map(f => f.fileName));
        if (showToast) showToast(describeImageProcessingFailures(failed), 'error', 5000);
      } else if (succeeded.length > 0 && showToast) {
        showToast(`${succeeded.length}장 첨부완료`, 'success', 3000);
      }
    } catch (err) {
      console.error('attachEditFiles unexpected error:', err);
      if (showToast) showToast('사진 첨부 중 오류', 'error', 5000);
    } finally {
      setImageProcessingEdit(null);
    }
  };
  const handleEditFileSelect = async (e) => {
    const files = e.target.files;
    await attachEditFiles(files);
    e.target.value = '';
  };
  const handleEditPasteClick = async () => {
    const files = await readClipboardImageFiles(showToast);
    if (files && files.length > 0) await attachEditFiles(files);
  };

  const handleSaveMemo = async () => {
    let memoId = null;
    try {
      const calendarId = calendar.id;
      // A share URL is accepted in either the title or body field. Once detected, the source
      // memo is cloned as a complete record so users do not have to paste the link into the body.
      const sharedMemoShare = getMemoShareUrlFromText(newText) || getMemoShareUrlFromText(newTitle);
      let sourceMemo = null;
      if (sharedMemoShare) {
        showToast('공유 메모를 불러오는 중...', 'info', 12000);
        sourceMemo = await fetchMemoForClone(sharedMemoShare);
        if (!sourceMemo) {
          showToast('공유 메모를 찾지 못했습니다. 링크가 만료되었거나 접근할 수 없습니다.', 'error', 5000);
          return;
        }
      }

      const title = sourceMemo ? String(sourceMemo.title || '') : newTitle.trim();
      const text = sourceMemo ? String(sourceMemo.text || '') : newText.trim();
      const sourceTags = sourceMemo
        ? (Array.isArray(sourceMemo.tags) ? sourceMemo.tags : (sourceMemo.tags ? [sourceMemo.tags] : []))
        : newTags;
      const tagsArray = sourceTags
        .map(tag => String(tag || '').trim())
        .filter(Boolean)
        .map(tag => tag.startsWith('#') ? tag : '#' + tag)
        .slice(0, 10);
      if (!title && !text && newImages.length === 0) {
        showToast('복제할 제목이나 내용이 없는 메모입니다.', 'error');
        return;
      }

      const stamp = Date.now();
      memoId = 'memo_' + stamp + '_' + Math.random().toString(36).slice(2, 8);
      const participantId = sourceMemo
        ? await resolveCloneParticipantId(sourceMemo, sharedMemoShare?.calendarId, calendar, composerParticipantId)
        : (composerParticipantId || 'anonymous');
      if (typeof navigator !== 'undefined' && navigator.onLine === false && memoImagesCanBeQueued(newImages)) {
        const queued = await enqueueMemoMediaSave({
          id: `memo_media_${calendarId}_${memoId}`,
          type: 'media-memo-save',
          calendarId,
          payload: {
            memoId,
            memoData: sanitizeMemoForFirestore({ id: memoId, participantId, title, text, imageUrls: sourceMemo?.imageUrls || [], thumbUrls: sourceMemo?.thumbUrls || [], color: sourceMemo?.color || newColor, isPinned: sourceMemo?.isPinned ?? newIsPinned, tags: tagsArray, createdAt: stamp, updatedAt: stamp, ...((() => { const p = buildMemoLinkPreviews(text, sourceMemo); return { linkPreview: p.linkPreview, linkPreviews: p.linkPreviews }; })()) }),
            images: newImages.map(image => ({ originalBlob: image.originalBlob, thumbnailBlob: image.thumbnailBlob }))
          }
        });
        if (queued) {
          showToast('오프라인입니다. 연결되면 메모와 사진을 자동 저장합니다.', 'info', 5000);
          setNewTitle(''); setNewText(''); setNewColor('var(--bg-card)'); setNewIsPinned(false); setNewTags([]); setNewTagInput(''); setNewImages([]); setIsComposerExpanded(false);
          return;
        }
      }

      // 1. Upload attachments (Storage upload with inline-base64 fallback + progress,
      // exactly the same module chat uses -- see resolveMemoImageBatch/resolveImageBatch)
      let uploadedUrls = Array.isArray(sourceMemo?.imageUrls) ? sourceMemo.imageUrls.slice() : [];
      let uploadedThumbs = Array.isArray(sourceMemo?.thumbUrls) ? sourceMemo.thumbUrls.slice() : [];
      if (newImages.length > 0) {
        setNewUploadProgress({ pct: 0, remainingSec: null });
        const resolved = await resolveMemoImageBatch(calendarId, newImages, setNewUploadProgress);
        uploadedUrls = resolved.map(r => r.imageUrl);
        uploadedThumbs = resolved.map(r => r.thumbUrl);
      }

      // Link previews are hydrated in the background; a third-party scraper must not delay save.
      const previewPack = buildMemoLinkPreviews(text, sourceMemo);

      // 2. Write to Firestore
      const memoData = {
        id: memoId,
        participantId,
        title,
        text,
        imageUrls: uploadedUrls,
        thumbUrls: uploadedThumbs,
        color: sourceMemo?.color || newColor,
        isPinned: sourceMemo?.isPinned ?? newIsPinned,
        tags: tagsArray,
        createdAt: stamp,
        updatedAt: stamp,
        linkPreview: previewPack.linkPreview,
        linkPreviews: previewPack.linkPreviews,
        ...(Array.isArray(sourceMemo?.imageTags) ? { imageTags: sourceMemo.imageTags.slice() } : {})
      };

      if (typeof onUpsertMemo === 'function') onUpsertMemo(memoData);

      const saved = await writeMemoDocument('memos', calendarId, memoId, sanitizeMemoForFirestore(memoData), 'set', '메모 저장');
      if (!saved?.success) throw new Error('Memo save failed');
      hydrateMemoLinkPreviewsInBackground(calendarId, memoId, text, memoData);

      // 3. Write Activity Log
      const logNote = title ? `제목: ${title}` : (text ? text.slice(0, 30) + '...' : '사진 첨부');
      const activityLog = createMemoActivityLog(calendarId, 'memo_create', participantId, stamp, logNote);
      if (activityLog) {
        const nextCal = {
          ...calendar,
          updatedAt: stamp,
          revision: (calendar.revision || 0) + 1
        };
        await pushSingleCloudCalendar(nextCal, stamp, 4, null, 'settings', [activityLog]);
      }

      showToast('메모가 저장되었습니다.', 'success');
      
      // Reset composer
      setNewTitle('');
      setNewText('');
      setNewColor('var(--bg-card)');
      setNewIsPinned(false);
      setNewTags([]);
      setNewTagInput('');
      setNewImages([]);
      setIsComposerExpanded(false);
    } catch (err) {
      console.error('Failed to save memo:', err);
      if (memoId && typeof onDeleteMemo === 'function') onDeleteMemo(memoId);
      showToast('메모 저장 실패', 'error');
    } finally {
      setNewUploadProgress(null);
    }
  };

  const handleUpdateMemo = async () => {
    if (!editTitle.trim() && !editText.trim() && editImages.length === 0) {
      showToast('제목, 내용, 사진 중 하나 이상 입력해 주세요.', 'error');
      return;
    }

    try {
      const calendarId = calendar.id;
      const stamp = Date.now();
      const hasNewEditImages = editImages.some(image => !image.isExisting);
      if (typeof navigator !== 'undefined' && navigator.onLine === false && hasNewEditImages && memoImagesCanBeQueued(editImages)) {
        const tagsArray = editTags.map(t => t.startsWith('#') ? t : '#' + t);
        const participantId = editParticipantId || 'anonymous';
        const previewPack = buildMemoLinkPreviews(editText.trim(), editingMemo);
        const queued = await enqueueMemoMediaSave({
          id: `memo_media_${calendarId}_${editingMemo.id}_${stamp}`,
          type: 'media-memo-save',
          calendarId,
          payload: {
            memoId: editingMemo.id,
            memoData: sanitizeMemoForFirestore({ ...editingMemo, participantId, title: editTitle.trim(), text: editText.trim(), imageUrls: [], thumbUrls: [], color: editColor, isPinned: editIsPinned, tags: tagsArray, updatedAt: stamp, linkPreview: previewPack.linkPreview, linkPreviews: previewPack.linkPreviews }),
            images: editImages.map(image => ({ original: image.original, thumbnail: image.thumbnail, isExisting: !!image.isExisting, originalBlob: image.originalBlob, thumbnailBlob: image.thumbnailBlob }))
          }
        });
        if (queued) {
          showToast('오프라인입니다. 연결되면 메모 수정을 자동 저장합니다.', 'info', 5000);
          setEditingMemo(null);
          return;
        }
      }

      // Kept photos carry isExisting (pass through as-is) and new ones get uploaded, same
      // module chat's edit flow uses (see resolveMemoImageBatch/resolveImageBatch).
      let uploadedUrls = [];
      let uploadedThumbs = [];
      if (editImages.length > 0) {
        setEditUploadProgress({ pct: 0, remainingSec: null });
        const resolved = await resolveMemoImageBatch(calendarId, editImages, setEditUploadProgress);
        uploadedUrls = resolved.map(r => r.imageUrl);
        uploadedThumbs = resolved.map(r => r.thumbUrl);
      }

      // Save tags formatted back to database (prepend '#' prefix if needed)
      const tagsArray = editTags.map(t => t.startsWith('#') ? t : '#' + t);

      const participantId = editParticipantId || 'anonymous';

      const previewPack = buildMemoLinkPreviews(editText.trim(), editingMemo);

      const createdAt = editingMemo.createdAt || editingMemo.updatedAt || stamp;
      const memoData = {
        ...editingMemo,
        participantId,
        title: editTitle.trim(),
        text: editText.trim(),
        imageUrls: uploadedUrls,
        thumbUrls: uploadedThumbs,
        color: editColor,
        isPinned: editIsPinned,
        tags: tagsArray,
        createdAt,
        updatedAt: stamp,
        linkPreview: previewPack.linkPreview,
        linkPreviews: previewPack.linkPreviews
      };

      if (typeof onUpsertMemo === 'function') onUpsertMemo(memoData);
      else if (typeof onUpdateMemo === 'function') onUpdateMemo(editingMemo.id, memoData);

      const saved = await writeMemoDocument('memos', calendarId, editingMemo.id, sanitizeMemoForFirestore(memoData), 'set', '메모 수정');
      if (!saved?.success) throw new Error('Memo update failed');
      hydrateMemoLinkPreviewsInBackground(calendarId, editingMemo.id, editText.trim(), memoData);

      // Log Memo Update — before→after detail
      const logNote = buildFieldChangeNote(editTitle.trim() || '메모', [
        { key: '제목', before: editingMemo.title || '', after: editTitle.trim() },
        { key: '내용', before: editingMemo.text || '', after: editText.trim() },
        { key: '색상', before: editingMemo.color || '', after: editColor || '' },
        { key: '고정', before: editingMemo.isPinned ? 'Y' : 'N', after: editIsPinned ? 'Y' : 'N' }
      ]) || (editTitle.trim() || (editText.trim().slice(0, 40) + '...'));
      const activityLog = createMemoActivityLog(calendarId, 'memo_update', participantId, stamp, logNote);
      if (activityLog) {
        const nextCal = {
          ...calendar,
          updatedAt: stamp,
          revision: (calendar.revision || 0) + 1
        };
        await pushSingleCloudCalendar(nextCal, stamp, 4, null, 'settings', [activityLog]);
      }

      showToast('메모가 수정되었습니다.', 'success');
      setEditingMemo(null);
    } catch (err) {
      console.error('Failed to update memo:', err);
      if (typeof onUpsertMemo === 'function') onUpsertMemo(editingMemo);
      else if (typeof onUpdateMemo === 'function') onUpdateMemo(editingMemo.id, editingMemo);
      showToast('메모 수정 실패', 'error');
    } finally {
      setEditUploadProgress(null);
    }
  };

  const handleDeleteMemo = async (memo) => {
    const action = async () => {
      const memoSnapshot = JSON.parse(JSON.stringify(memo));
      try {
        const calendarId = calendar.id;
        const stamp = Date.now();
        const participantId = getStoredChatParticipantId(calendarId, calendar) || 'anonymous';

        if (typeof onDeleteMemo === 'function') onDeleteMemo(memo.id);

        const deleted = await writeMemoDocument('memos', calendarId, memo.id, null, 'delete', '메모 삭제');
        if (!deleted?.success) throw new Error('Memo delete failed');

        // Log Memo Delete
        const logNote = memo.title ? `제목: ${memo.title}` : (memo.text.slice(0, 30) + '...');
        const activityLog = createMemoActivityLog(calendarId, 'memo_delete', participantId, stamp, logNote);
        if (activityLog) {
          const nextCal = {
            ...calendar,
            updatedAt: stamp,
            revision: (calendar.revision || 0) + 1
          };
          await pushSingleCloudCalendar(nextCal, stamp, 4, null, 'settings', [activityLog]);
        }

        showToast('메모가 삭제되었습니다.', 'delete', 5000, async () => {
          try {
            const restoreStamp = Date.now();
            if (typeof onUpsertMemo === 'function') onUpsertMemo(memoSnapshot);
            const restored = await writeMemoDocument('memos', calendarId, memo.id, sanitizeMemoForFirestore(memoSnapshot), 'set', '메모 복원');
            if (!restored?.success) throw new Error('Memo restore failed');
            const restoreNote = memoSnapshot.title
              ? `복원: 제목: ${memoSnapshot.title}`
              : `복원: ${String(memoSnapshot.text || '').slice(0, 30)}...`;
            const restoreActivityLog = createMemoActivityLog(calendarId, 'memo_update', participantId, restoreStamp, restoreNote);
            if (restoreActivityLog) {
              const nextCal = {
                ...calendar,
                updatedAt: restoreStamp,
                revision: (calendar.revision || 0) + 1
              };
              await pushSingleCloudCalendar(nextCal, restoreStamp, 4, null, 'settings', [restoreActivityLog]);
            }
            setEditingMemo(null);
            showToast('메모 삭제를 되돌렸습니다.', 'success', 3000);
          } catch (err) {
            console.error('Failed to restore deleted memo:', err);
            if (typeof onDeleteMemo === 'function') onDeleteMemo(memo.id);
            showToast('메모 복원 실패', 'error', 4000);
          }
        });
        setEditingMemo(null);
      } catch (err) {
        console.error('Failed to delete memo:', err);
        if (typeof onUpsertMemo === 'function') onUpsertMemo(memoSnapshot);
        showToast('메모 삭제 실패', 'error');
      }
    };

    if (onRequestConfirm) {
      onRequestConfirm('메모 삭제', '이 메모를 삭제하시겠습니까?', action);
    }
  };

  const handleOpenEdit = (memo) => {
    setEditingMemo(memo);
    setEditTitle(memo.title || '');
    setEditText(memo.text || '');
    setEditColor(memo.color || 'var(--bg-card)');
    setEditIsPinned(!!memo.isPinned);
    
    // Parse tag tokens (strip '#' prefix for local state management)
    const rawTags = memo.tags || [];
    const cleanTags = rawTags.map(t => t.startsWith('#') ? t.slice(1).trim() : t).filter(Boolean);
    setEditTags(cleanTags);
    setEditTagInput('');

    // Reconstruct list of images for editing (same { original, thumbnail, isExisting }
    // shape chat's edit flow uses, so resolveMemoImageBatch passes these through untouched)
    const currentImgs = (memo.imageUrls || []).map((url, idx) => ({
      original: url,
      thumbnail: memo.thumbUrls?.[idx] || url,
      isExisting: true
    }));
    setEditImages(currentImgs);
    setEditParticipantId(memo.participantId || '');
  };

  // A memo counts as auto-pinned by recent activity only when it isn't ALSO manually pinned
  // (manual pin already puts it in 고정됨, so 최근 활동 would be a redundant, confusing second
  // reason) and its window hasn't lapsed or been locally dismissed.
  const isMemoRecentlyActive = (memo) => {
    if (memo.isPinned) return false;
    const latest = getLatestMemoCommentTimestamp(memo);
    if (!latest) return false;
    if (recentActivityNow - latest >= RECENT_MEMO_ACTIVITY_WINDOW_MS) return false;
    if (dismissedRecentActivity[memo.id] === latest) return false;
    return true;
  };
  const isMemoEffectivelyPinned = (memo) => !!memo.isPinned || isMemoRecentlyActive(memo);

  const handleTogglePin = async (memo) => {
    // Turning off a 최근 활동 auto-pin (memo isn't actually isPinned) is a local-only dismissal,
    // not a write -- there's nothing in Firestore to flip back, and writing isPinned:false would
    // be a no-op that could race with another device's own read of the same untouched field.
    if (isMemoRecentlyActive(memo)) {
      dismissRecentActivity(memo.id, getLatestMemoCommentTimestamp(memo));
      return;
    }
    const nextPinned = !memo.isPinned;
    if (typeof onUpdateMemo === 'function') onUpdateMemo(memo.id, { isPinned: nextPinned });
    try {
      const updated = await writeMemoDocument('memos', calendar.id, memo.id, { isPinned: nextPinned }, 'update', '메모 고정 변경');
      if (!updated?.success) throw new Error('Memo pin update failed');
    } catch (err) {
      console.error('Failed to toggle memo pin:', err);
      if (typeof onUpdateMemo === 'function') onUpdateMemo(memo.id, { isPinned: memo.isPinned });
      showToast('고정 상태 변경 실패', 'error');
    }
  };

  const handleMemoCommentsChange = async (memo, nextComments) => {
    // lastCommentAt is a denormalized copy of the newest comment's createdAt (0 once every
    // comment is deleted). It exists purely so app-main.js's memo subscription can load an old
    // memo that just received a comment even when it's well outside the paginated recent-by-
    // createdAt window -- see the lastCommentAt-ordered query there. Comparing memo.comments
    // itself (the array) isn't queryable in Firestore the way a plain field is.
    const nextLastCommentAt = getLatestMemoCommentTimestamp({ comments: nextComments });
    if (typeof onUpdateMemo === 'function') onUpdateMemo(memo.id, { comments: nextComments, lastCommentAt: nextLastCommentAt });
    try {
      const updated = await writeMemoDocument('memos', calendar.id, memo.id, { comments: nextComments, lastCommentAt: nextLastCommentAt }, 'update', '메모 댓글 저장');
      if (!updated?.success) throw new Error('Memo comment update failed');
      return true;
    } catch (err) {
      console.error('Failed to update memo comments:', err);
      if (typeof onUpdateMemo === 'function') onUpdateMemo(memo.id, { comments: memo.comments, lastCommentAt: memo.lastCommentAt });
      showToast('댓글 저장 실패', 'error');
      return false;
    }
  };

  // Layer-popup share link for a single memo -- opens MemoShareModal, which builds the
  // ?id=<calendar>&view=memo&memo=<id> URL (same deep-link convention chat/tag search results
  // already use) and offers a one-tap copy.
  const [sharingMemo, setSharingMemo] = React.useState(null);

  // Gallery modal state -- opens the ChatGalleryModal (photo grid) from this view's own
  // header gallery icon or side-menu entry. Previously these variables were only declared
  // in App scope and were never in scope inside MemoView, causing a ReferenceError crash.
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  // Link-preview progress overlay state -- shown while a memo link-preview is being fetched.
  // Same crash root cause as isGalleryOpen above (declared only in App, used here).
  const [linkPreviewProgressState] = React.useState(null);

  const removeComposerImage = (idx) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeEditImage = (idx) => {
    setEditImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddNewTag = () => {
    const val = newTagInput.trim();
    if (!val) return;

    const cleanTag = val.startsWith('#') ? val.slice(1).trim() : val;
    if (!cleanTag) return;

    if (newTags.includes(cleanTag)) {
      showToast('이미 등록된 태그입니다.', 'error');
      return;
    }
    if (newTags.length >= 10) {
      showToast('태그는 최대 10개까지 등록 가능합니다.', 'error');
      return;
    }
    setNewTags(prev => [...prev, cleanTag]);
    setNewTagInput('');
    const refocus = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.refocusComposerField);
    if (typeof refocus === 'function') refocus(newTagInputRef);
    else if (newTagInputRef.current) { try { newTagInputRef.current.focus({ preventScroll: true }); } catch (_) { newTagInputRef.current.focus(); } }
  };

  const handleAddEditTag = async () => {
    const val = editTagInput.trim();
    if (!val) return;

    const cleanTag = val.startsWith('#') ? val.slice(1).trim() : val;
    if (!cleanTag) return;

    if (editTags.includes(cleanTag)) {
      showToast('이미 등록된 태그입니다.', 'error');
      return;
    }
    if (editTags.length >= 10) {
      showToast('태그는 최대 10개까지 등록 가능합니다.', 'error');
      return;
    }
    
    const nextTags = [...editTags, cleanTag];

    // Real-time Save to Firestore immediately for edit modal
    if (editingMemo) {
      const calendarId = calendar.id;
      const tagsArray = nextTags.map(t => t.startsWith('#') ? t : '#' + t);
      if (typeof onUpdateMemo === 'function') onUpdateMemo(editingMemo.id, { tags: tagsArray });
      try {
        const updated = await writeMemoDocument('memos', calendarId, editingMemo.id, { tags: tagsArray }, 'update', '태그 저장');
        if (!updated?.success) throw new Error('Memo tag update failed');
      } catch (err) {
        console.error('Failed to update tags in Firestore:', err);
        if (typeof onUpdateMemo === 'function') onUpdateMemo(editingMemo.id, { tags: editTags });
        showToast('태그 저장 실패', 'error');
        return;
      }
    }

    setEditTags(nextTags);
    setEditTagInput('');
    const refocus = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.refocusComposerField);
    if (typeof refocus === 'function') refocus(editTagInputRef);
    else if (editTagInputRef.current) { try { editTagInputRef.current.focus({ preventScroll: true }); } catch (_) { editTagInputRef.current.focus(); } }
  };

  const filteredMemos = (memos || []).filter(memo => {
    const query = searchQuery.trim().toLowerCase();
    
    // Live Search Matcher
    let searchMatch = true;
    if (query) {
      const titleMatch = memo.title ? memo.title.toLowerCase().includes(query) : false;
      const textMatch = memo.text ? memo.text.toLowerCase().includes(query) : false;
      const tagsMatch = memo.tags ? memo.tags.some(tag => tag.toLowerCase().includes(query)) : false;
      searchMatch = titleMatch || textMatch || tagsMatch;
    }

    // Filter by Tag Clicked Matcher
    const filterTagMatch = selectedTag ? (memo.tags || []).includes(selectedTag) : true;

    return searchMatch && filterTagMatch;
  });

  const pinnedMemos = filteredMemos.filter(m => m.isPinned);
  const recentActivityMemos = filteredMemos.filter(m => isMemoRecentlyActive(m));
  const otherMemos = filteredMemos.filter(m => !m.isPinned && !isMemoRecentlyActive(m));

  const composerPart = (calendar.participants || []).find(p => p.id === composerParticipantId);
  const editPart = (calendar.participants || []).find(p => p.id === editParticipantId);

  // FLIP animation for memos moving between/within the 고정됨/최근 활동/메모 목록 sections (pin
  // toggled, or a memo's 최근 활동 window starts/lapses). Each MemoCard's root div already has a
  // stable `id="memo-<id>"` (used elsewhere for deep-link scrolling), so this reads positions
  // straight off the DOM instead of needing a separate ref-registration prop threaded through
  // MemoCard. useLayoutEffect runs after the DOM reflects the new grouping but before the browser
  // paints: cardRectsRef still holds each card's position from the end of the *previous* run, so
  // comparing against it and animating the delta is a standard FLIP with no separate "before"
  // measurement pass.
  const cardRectsRef = React.useRef({});
  const memoSectionOrderKey = [...pinnedMemos, ...recentActivityMemos, ...otherMemos].map(m => m.id).join(',');
  React.useLayoutEffect(() => {
    const prevRects = cardRectsRef.current;
    const nextRects = {};
    filteredMemos.forEach(memo => {
      const node = document.getElementById(`memo-${memo.id}`);
      if (!node) return;
      const rect = node.getBoundingClientRect();
      nextRects[memo.id] = rect;
      const prev = prevRects[memo.id];
      if (!prev) return;
      const dx = prev.left - rect.left;
      const dy = prev.top - rect.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      node.style.transition = 'none';
      node.style.transform = `translate(${dx}px, ${dy}px)`;
      // Force a reflow so the browser registers the jump-back transform above before the
      // transition-enabled reset below is applied, otherwise the two writes get batched into one
      // and there's nothing to animate from.
      void node.offsetHeight;
      node.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease';
      node.style.transform = '';
      window.setTimeout(() => {
        if (node.isConnected) node.style.transition = 'box-shadow 0.2s ease';
      }, 360);
    });
    cardRectsRef.current = nextRects;
  }, [memoSectionOrderKey]);

  return /*#__PURE__*/React.createElement("div", {
    className: "memo-view-container",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflowX: 'hidden'
    }
  },
    /* Floating back button -- always fixed in place; gains a shadow once the header itself
       has scrolled out of view, exactly like the chat room's back button. */
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onBack,
      "aria-label": "뒤로가기",
      style: {
        // env(safe-area-inset-top): iOS 홈화면 설치 상태에서 상태바 아래로 밀어내 겹침/터치
        // 불가 문제를 막는다. 일반 브라우저 탭에서는 0이라 기존 10px 그대로.
        position: 'fixed', top: 'calc(10px + env(safe-area-inset-top, 0px))', left: '10px', width: '36px', height: '36px',
        borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: 'none',
        boxShadow: isHeaderVisible ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--text-muted)', zIndex: 1020
      }
    }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),

    /* Chat-room-header-style header: left spacer (back button floats over it), centered
       title, right search-toggle button. */
    /*#__PURE__*/React.createElement("div", {
      className: "memo-view-header",
      style: {
        position: 'fixed', top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0, height: '56px',
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 1010,
        transition: 'transform 0.3s ease',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
      }
    },
      /*#__PURE__*/React.createElement("div", { style: { width: '32px', flexShrink: 0 } }),
      /*#__PURE__*/React.createElement("div", {
        style: PAGE_HEADER_TITLE_STYLE
      }, calendar.title, " 메모"),
      /*#__PURE__*/React.createElement("div", { style: PAGE_HEADER_ACTIONS_WRAP_STYLE },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setIsSearchOpen(value => !value),
          title: "메모 검색",
          "aria-label": "메모 검색",
          style: PAGE_HEADER_ICON_BTN_STYLE
        }, /*#__PURE__*/React.createElement(SearchIcon, { size: 20 })),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: () => setIsMemoMenuOpen(true),
          title: "메모 메뉴",
          "aria-label": "메모 메뉴 열기",
          style: PAGE_HEADER_ICON_BTN_STYLE
        }, ThreeLinesIcon ? /*#__PURE__*/React.createElement(ThreeLinesIcon, { size: 22 }) : /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
          fill: "none", stroke: "currentColor", strokeWidth: "2"
        }, /*#__PURE__*/React.createElement("path", { d: "M4 6h16" }), /*#__PURE__*/React.createElement("path", { d: "M4 12h16" }), /*#__PURE__*/React.createElement("path", { d: "M4 18h16" })))
      )
    ),

    /* Search bar -- hidden by default, slides in below the header when the search button is
       tapped (same slot/z-index the chat room's own search bar uses). */
    isSearchOpen && /*#__PURE__*/React.createElement(InlineSearchBar, {
      fixed: true,
      inputRef: memoSearchInputRef,
      value: searchQuery,
      placeholder: "메모 제목, 내용, 해시태그 검색...",
      onChange: e => setSearchQuery(e.target.value),
      trailing: selectedTag ? /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setSelectedTag(''),
        title: selectedTag,
        style: {
          padding: '6px 12px', borderRadius: '16px', backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)', color: '#3B82F6', fontSize: 'var(--font-size-sm)',
          fontWeight: 'bold', cursor: 'pointer', flexShrink: 0,
          maxWidth: '35vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          display: 'inline-flex', alignItems: 'center', gap: '4px'
        }
      }, selectedTag, /*#__PURE__*/React.createElement(TrashIcon, { size: 12 })) : null,
      onClose: () => { setIsSearchOpen(false); setSearchQuery(''); setSelectedTag(''); }
    }),

    isMemoMenuOpen && typeof document !== 'undefined' && window.ReactDOM && window.ReactDOM.createPortal
      ? window.ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
      className: "admin-side-menu-overlay",
      onClick: () => setIsMemoMenuOpen(false)
    }, /*#__PURE__*/React.createElement("nav", {
      className: "admin-side-menu",
      "aria-label": "메모",
      onClick: e => e.stopPropagation()
    },
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-header" },
        /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-brand" },
          /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-copy" },
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "admin-side-menu-title",
              title: "메인 화면으로 이동",
              "aria-label": "메인 화면으로 이동",
              onClick: () => { setIsMemoMenuOpen(false); if (typeof onChangeView === 'function') onChangeView('calendar'); else if (typeof onBack === 'function') onBack(); },
              style: {
                background: 'none', border: 'none', padding: 0, margin: 0,
                color: 'inherit',
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '6px'
              }
            }, BackArrowIcon && /*#__PURE__*/React.createElement(BackArrowIcon, { size: 18 }), "메모")
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } },
          WeatherBadge ? /*#__PURE__*/React.createElement(WeatherBadge, { weatherLocation: calendar && calendar.weatherLocation }) : null,
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "admin-side-menu-close-btn", onClick: () => setIsMemoMenuOpen(false), "aria-label": "닫기"
          }, "✕")
        )
      ),
      /*#__PURE__*/React.createElement("div", { className: "admin-side-menu-list", style: { borderBottom: 'none', paddingTop: '6px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "admin-side-menu-item",
          onClick: () => { setIsMemoMenuOpen(false); setIsSearchOpen(true); }
        },
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-icon" }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24",
            fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1" }), /*#__PURE__*/React.createElement("path", { d: "m21 21-1.9-1.9" }), /*#__PURE__*/React.createElement("circle", { cx: "17", cy: "17", r: "3" }))),
          /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-copy" },
            /*#__PURE__*/React.createElement("span", { className: "admin-side-menu-item-title" }, "메모 검색")
          )
        )
      ),
      typeof SharedAppNavBlock === 'function' && /*#__PURE__*/React.createElement(SharedAppNavBlock, {
        onClose: () => setIsMemoMenuOpen(false),
        onChangeView: onChangeView,
        chatCount: chatCount,
        settlementBadge: settlementBadge,
        galleryCount: galleryCount,
        placeCount: placeCount,
        memoCount: memoCount,
        historyCount: historyCount,
        chatLastAuthor: chatLastAuthor,
        settlementLastDate: settlementLastDate,
        galleryLastDate: galleryLastDate,
        placeLastName: placeLastName,
        memoLastTitleWord: memoLastTitleWord
      }),
      typeof SharedSideMenuFooter === 'function' && /*#__PURE__*/React.createElement(SharedSideMenuFooter, {
        onClose: () => setIsMemoMenuOpen(false),
        onOpenShare: onOpenShare,
        onOpenSettings: onOpenAppSettings,
        shareLabel: '공유'
      })
    )), document.body)
      : null,

    /* Main Scrollable Body */
    /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, position: 'relative', minHeight: 0 }
    }, /*#__PURE__*/React.createElement("div", {
      onScroll: handleMemoScroll,
      style: { position: 'absolute', inset: 0, overflowY: 'auto', padding: '16px', paddingTop: `calc(${isSearchOpen ? '116px' : '72px'} + env(safe-area-inset-top, 0px))`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }
    },
      /* Shared-memo banner -- when this page was opened via a memo's own share link
         (?view=memo&memo=<id>), show that memo prominently as a single full-width row above
         everything else (composer included), then the normal composer/list continue exactly
         as before below it. The memo may be older than the paginated `memos` window, hence the
         separate direct-by-id fetch (see sharedMemo in App()) rather than searching the list. */
      sharedMemo && /*#__PURE__*/React.createElement("div", {
        // Same purple-border + up/down-shake "you were just brought here" treatment used
        // everywhere else in the app (see chat-search-focused-bubble/chat-search-shake) --
        // keyed by memo id so navigating between two different shared-memo links replays it.
        key: sharedMemo.id,
        className: "chat-search-focused-bubble",
        style: {
          width: '100%', maxWidth: '520px', margin: '0 auto', boxSizing: 'border-box',
          borderRadius: 'var(--radius-md)', padding: '10px',
          boxShadow: '0 6px 18px rgba(79, 70, 229, 0.14)',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0 4px' }
        },
          /*#__PURE__*/React.createElement("span", {
            style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.05em', textTransform: 'uppercase' }
          }, "공유된 메모"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => { if (onDismissSharedMemo) onDismissSharedMemo(); },
            title: "닫기",
            style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }
          }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 18 }))
        ),
        /* Reuses MemoCard itself (same images/link-preview/text/pin/comments rendering as the
           normal grid below) instead of a bespoke one-line teaser -- "크게" (prominently) here
           means full-width and its own row, not a stripped-down summary. */
        /*#__PURE__*/React.createElement(MemoCard, {
          memo: sharedMemo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(sharedMemo),
          onShare: () => setSharingMemo(sharedMemo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(sharedMemo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast,
          setActiveLightbox: setActiveLightbox,
          effectivePinned: isMemoEffectivelyPinned(sharedMemo)
        })
      ),

      /* Rich Memo Input Composer (Google Keep style) */
      /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto',
          backgroundColor: newColor,
          border: '1px solid ' + getBorderColor(newColor),
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }
      },
        !isComposerExpanded ? 
          /* Collapsed state */
          /*#__PURE__*/React.createElement("div", {
            onClick: () => setIsComposerExpanded(true),
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text-muted)' }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-base)' } }, "새로운 메모를 남겨보세요..."),
            /*#__PURE__*/React.createElement("span", { style: { display: 'flex', gap: '8px', color: 'var(--text-muted)', marginLeft: 'auto' } }, 
              /* Photo icon shortcut */
              /*#__PURE__*/React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
              }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
            )
          )
        :
          /* Expanded state */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          },
            /* Title & Pin row */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
            },
              /* Title input - Styled precisely as user requested */
              /*#__PURE__*/React.createElement("input", {
                type: "text",
                ref: newTitleInputRef,
                placeholder: "제목",
                value: newTitle,
                onChange: e => setNewTitle(e.target.value),
                style: {
                  padding: '8px 8px',
                  background: 'transparent',
                  borderWidth: 'medium',
                  borderStyle: 'none',
                  borderColor: 'currentcolor',
                  borderImage: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: 'var(--text-main)',
                  width: '100%',
                  borderBottom: '1px solid var(--border-subtle)',
                  boxSizing: 'border-box'
                }
              }),
              /* Pin Toggle button (Custom pin SVGs for ON/OFF) */
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => setNewIsPinned(!newIsPinned),
                style: { background: 'none', border: 'none', cursor: 'pointer', color: newIsPinned ? '#F59E0B' : '#94A3B8', padding: '4px' }
              }, newIsPinned ? 
                /*#__PURE__*/React.createElement("svg", {
                  xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", className: "icon icon-tabler icon-tabler-filled icon-tabler-pin"
                }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15.113 3.21l.094 .083l5.5 5.5a1 1 0 0 1 -1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1 -.158 .277l-.07 .08l-1.5 1.5a1 1 0 0 1 -1.32 .082l-.095 -.083l-2.793 -2.792l-3.793 3.792a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.792 -3.793l-2.792 -2.793a1 1 0 0 1 -.083 -1.32l.083 -.094l1.5 -1.5a1 1 0 0 1 .258 -.187l.098 -.042l3.796 -1.425l3.171 -3.17a1 1 0 0 1 1.497 -1.26z" }))
              :
                /*#__PURE__*/React.createElement("svg", {
                  xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-pin"
                }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" }), /*#__PURE__*/React.createElement("path", { d: "M9 15l-4.5 4.5" }), /*#__PURE__*/React.createElement("path", { d: "M14.5 4l5.5 5.5" }))
              )
            ),

            /* Body Textarea wrapped relatively with bottom-right emoji & file picker icons - Styled precisely as user requested */
            /*#__PURE__*/React.createElement("div", {
              style: { position: 'relative', width: '100%' }
            },
              /* Textarea */
              /*#__PURE__*/React.createElement("textarea", {
                placeholder: "메모 입력...",
                value: newText,
                onChange: e => { setNewText(e.target.value); autoGrowTextarea(e.target, 400); },
                rows: "4",
                style: {
                  padding: '8px 4px',
                  background: 'transparent',
                  borderWidth: 'medium',
                  borderStyle: 'none',
                  borderColor: 'currentcolor',
                  borderImage: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--text-main)',
                  width: '100%',
                  paddingBottom: '28px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }
              }),
              /* Bottom-right emoji/photo buttons wrapper */
              /*#__PURE__*/React.createElement("div", {
                style: {
                  position: 'absolute',
                  right: '4px',
                  bottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 2
                }
              },
                /* Emoji picker trigger */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  onClick: () => setIsComposerEmojiOpen(true),
                  style: { background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
                  title: "이모티콘 추가"
                }, /*#__PURE__*/React.createElement(EmojiPickerIcon, null)),
                
                /* File Upload label icon */
                /*#__PURE__*/React.createElement("label", {
                  style: { display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' },
                  title: "사진 첨부"
                }, 
                  /*#__PURE__*/React.createElement("input", {
                    type: "file",
                    multiple: true,
                    accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
                    onChange: handleComposerFileSelect,
                    style: { display: 'none' }
                  }),
                  /*#__PURE__*/React.createElement("svg", {
                    xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
                  }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
                ),

                /* Clipboard paste trigger (mobile has no Ctrl+V, so this reads the OS clipboard directly) */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  onClick: handleComposerPasteClick,
                  style: { background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
                  title: "붙여넣기"
                }, /*#__PURE__*/React.createElement("svg", {
                  xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
                }, /*#__PURE__*/React.createElement("path", { d: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" }), /*#__PURE__*/React.createElement("rect", { x: "9", y: "3", width: "6", height: "4", rx: "1" })))
              )
            ),

            /* Live Link Preview Area inside input (one card per distinct URL) */
            collectMemoPreviewUrls(newText).map((url, idx) => /*#__PURE__*/React.createElement("div", {
              key: url,
              style: { marginTop: idx === 0 ? '4px' : '8px', marginBottom: '4px' }
            }, /*#__PURE__*/React.createElement(LinkPreviewCard, { url: url, stretch: true }))),

            /* Images previews list */
            newImages.length > 0 && /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }
            }, newImages.map((img, idx) => /*#__PURE__*/React.createElement("div", {
              key: idx,
              style: { position: 'relative', width: '60px', height: '60px' }
            }, 
              /* Image element */
              /*#__PURE__*/React.createElement("img", {
                src: img.thumbnail,
                decoding: 'async',
                style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }
              }),
              /* Remove button (shared with chat's attachment thumbnail) */
              /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
                onClick: () => removeComposerImage(idx)
              })
            ))),

            /* Tag Input Module (from Lightbox, with IME composition prevention) */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
            },
              /* Shared participant-select pill (ui-widgets.js) sits to the left of the tag
                 input row. */
              /*#__PURE__*/React.createElement(ParticipantPickerButton, {
                participant: composerPart,
                onClick: () => setIsComposerPartOpen(true)
              }),
              /*#__PURE__*/React.createElement("input", {
                type: "text",
                ref: newTagInputRef,
                enterKeyHint: "enter",
                placeholder: newTags.length >= 10 ? "태그 최대 10개 도달" : `태그 입력 (${newTags.length}/10)`,
                value: newTagInput,
                onChange: e => setNewTagInput(e.target.value),
                onKeyDown: e => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag();
                  }
                },
                maxLength: 100,
                style: {
                  flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                  color: 'var(--text-main)', fontSize: 'var(--font-size-sm)'
                }
              }),
              /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: handleAddNewTag,
                disabled: newTags.length >= 10,
                style: {
                  flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)', background: 'var(--border-subtle)',
                  color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 800, cursor: 'pointer',
                  opacity: newTags.length >= 10 ? 0.45 : 1
                }
              }, "저장")
            ),

            /* Actions Row */
            /*#__PURE__*/React.createElement("div", {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px', flexWrap: 'wrap' }
            },
              /* Tag badges list */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }
              },
                /* Active tag capsule badges (Responsive white background style: (#레시피 (✕))) */
                newTags.map(tag => /*#__PURE__*/React.createElement("span", {
                  key: tag,
                  style: {
                    display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-full)',
                    padding: '3px 4px 3px 10px', fontSize: 'var(--font-size-sm)', fontWeight: 900, lineHeight: 1,
                    border: '1px solid var(--border-subtle)', color: 'var(--text-main)', background: 'var(--bg-primary)'
                  }
                }, `#${tag}`, /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  title: `#${tag} 태그 삭제`,
                  onClick: e => {
                    e.stopPropagation();
                    setNewTags(prev => prev.filter(t => t !== tag));
                  },
                  style: {
                    width: '17px', height: '17px', border: 0, borderRadius: '50%',
                    background: 'var(--border-subtle)', color: 'var(--text-main)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer',
                    flexShrink: 0
                  }
                }, /*#__PURE__*/React.createElement(TrashIcon, { size: 12 }))))
              ),

              /* Save & Close buttons formatted using DateModal styles */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', gap: '8px', marginLeft: 'auto' }
              },
                /* Close without saving */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-secondary",
                  onClick: () => setIsComposerExpanded(false),
                  style: {
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: 'none'
                  }
                }, "닫기"),
                /* Save memo */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-primary",
                  onClick: handleSaveMemo,
                  disabled: newUploadProgress !== null,
                  style: {
                    padding: '10px 28px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }
                }, newUploadProgress !== null ? `업로드 (${newUploadProgress.pct}%)` : "저장")
              )
            )
          )
      ),

      /* MEMOS SECTIONS (Pinned / Recent Activity / Normal) */

      /* 1. Pinned Memos Section */
      pinnedMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px' }
      },
        /* Label */
        /*#__PURE__*/React.createElement("div", {
          style: { fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }
        }, "고정됨"),
        /* Grid */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }
        }, pinnedMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
          key: memo.id,
          memo: memo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(memo),
          onShare: () => setSharingMemo(memo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(memo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast,
          setActiveLightbox: setActiveLightbox,
          searchQuery: searchQuery,
          effectivePinned: true
        })))
      ),

      /* 2. Recent Activity Section -- memos with a comment in the last 6h, auto-pinned the same
         way as 고정됨 above (pin icon shows ON) but toggling it off just dismisses this one
         activity window locally instead of writing isPinned (see isMemoRecentlyActive). */
      recentActivityMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: pinnedMemos.length > 0 ? '12px' : '0' }
      },
        /* Label */
        /*#__PURE__*/React.createElement("div", {
          style: { fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }
        }, "최근 활동"),
        /* Grid */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }
        }, recentActivityMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
          key: memo.id,
          memo: memo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(memo),
          onShare: () => setSharingMemo(memo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(memo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast,
          setActiveLightbox: setActiveLightbox,
          searchQuery: searchQuery,
          effectivePinned: true
        })))
      ),

      /* 3. Other Memos Section */
      otherMemos.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: (pinnedMemos.length > 0 || recentActivityMemos.length > 0) ? '12px' : '0' }
      },
        /* Label */
        (pinnedMemos.length > 0 || recentActivityMemos.length > 0) && /*#__PURE__*/React.createElement("div", {
          style: { fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }
        }, "메모 목록"),
        /* Grid */
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }
        }, otherMemos.map(memo => /*#__PURE__*/React.createElement(MemoCard, {
          key: memo.id,
          memo: memo,
          calendar: calendar,
          onOpenEdit: handleOpenEdit,
          onTogglePin: () => handleTogglePin(memo),
          onShare: () => setSharingMemo(memo),
          onSelectTag: (tag) => { setSelectedTag(tag); setIsSearchOpen(true); },
          onCommentsChange: (nextComments) => handleMemoCommentsChange(memo, nextComments),
          getBorderColor: getBorderColor,
          onRequestConfirm: onRequestConfirm,
          showToast: showToast,
          setActiveLightbox: setActiveLightbox,
          searchQuery: searchQuery,
          effectivePinned: false
        })))
      ),

      /* "메모 더 보기" -- memos load newest-first in pages rather than all at once, so this
         fetches the next page of older memos (mirrors chat room's "이전 채팅 더보기"). Pinned
         memos are always fully loaded regardless of this button, so pinning an old memo never
         depends on paging back to it first. */
      hasMoreMemos && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onLoadMoreMemos,
        style: {
          width: '100%',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 0',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'bold',
          color: 'var(--text-main)',
          cursor: 'pointer',
          textAlign: 'center',
          marginTop: '4px'
        }
      }, "메모 더 보기"),

      /* Empty State */
      filteredMemos.length === 0 && /*#__PURE__*/React.createElement("div", {
        style: { padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-base)' }
      }, "등록된 메모가 없거나 검색 조건과 일치하는 메모가 없습니다. 📝")
    ),

    /* Memo Editor Modal Overlay */
    editingMemo && /*#__PURE__*/React.createElement("div", {
      onClick: memoEditorDirtyGuard.overlayOnClick,
      style: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }
    },
      /* Modal Container */
      /*#__PURE__*/React.createElement(ResizableModalContainer, {
        className: "modal-container memo-edit-modal-container",
        style: {
          width: '100%', maxWidth: '520px',
          backgroundColor: editColor,
          border: '1px solid ' + getBorderColor(editColor),
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: '12px',
          padding: '16px', boxSizing: 'border-box',
        }
      },
        /* Header: Title & Pin */
        /*#__PURE__*/React.createElement("div", {
          className: "memo-edit-modal-header",
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }
        },
          /* Title input - Styled precisely as user requested */
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            placeholder: "제목",
            value: editTitle,
            onChange: e => setEditTitle(e.target.value),
            style: {
              padding: '8px 8px',
              background: 'transparent',
              borderWidth: 'medium',
              borderStyle: 'none',
              borderColor: 'currentcolor',
              borderImage: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              color: 'var(--text-main)',
              width: '100%',
              borderBottom: '1px solid var(--border-subtle)',
              boxSizing: 'border-box'
            }
          }),
          /* Share button in Memo edit popup */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setSharingMemo(editingMemo),
            title: "메모 공유",
            style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px', marginRight: '6px' }
          }, /*#__PURE__*/React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }), /*#__PURE__*/React.createElement("polyline", { points: "16 6 12 2 8 6" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "15" }))),
          /* Pin Toggle button (Custom pin SVGs for ON/OFF) */
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: () => setEditIsPinned(!editIsPinned),
            style: { background: 'none', border: 'none', cursor: 'pointer', color: editIsPinned ? '#F59E0B' : '#94A3B8', padding: '4px' }
          }, editIsPinned ? 
            /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", className: "icon icon-tabler icon-tabler-filled icon-tabler-pin"
            }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15.113 3.21l.094 .083l5.5 5.5a1 1 0 0 1 -1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1 -.158 .277l-.07 .08l-1.5 1.5a1 1 0 0 1 -1.32 .082l-.095 -.083l-2.793 -2.792l-3.793 3.792a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.792 -3.793l-2.792 -2.793a1 1 0 0 1 -.083 -1.32l.083 -.094l1.5 -1.5a1 1 0 0 1 .258 -.187l.098 -.042l3.796 -1.425l3.171 -3.17a1 1 0 0 1 1.497 -1.26z" }))
          :
            /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "icon icon-tabler icons-tabler-outline icon-tabler-pin"
            }, /*#__PURE__*/React.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /*#__PURE__*/React.createElement("path", { d: "M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" }), /*#__PURE__*/React.createElement("path", { d: "M9 15l-4.5 4.5" }), /*#__PURE__*/React.createElement("path", { d: "M14.5 4l5.5 5.5" }))
          )
        ),

        /*#__PURE__*/React.createElement("div", {
          className: "memo-edit-modal-body"
        },
        /* Textarea wrapped relatively with bottom-right emoji & file picker icons - Styled precisely as user requested */
        /*#__PURE__*/React.createElement("div", {
          style: { position: 'relative', width: '100%' }
        },
          /* Body Textarea */
          /*#__PURE__*/React.createElement("textarea", {
            ref: editMemoTextareaRef,
            className: "memo-edit-textarea",
            placeholder: "메모 입력...",
            value: editText,
            onChange: e => { setEditText(e.target.value); autoGrowTextarea(e.target, 480); },
            rows: "6",
            style: {
              padding: '8px 4px',
              background: 'transparent',
              borderWidth: 'medium',
              borderStyle: 'none',
              borderColor: 'currentcolor',
              borderImage: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 'var(--font-size-md)',
              color: 'var(--text-main)',
              width: '100%',
              paddingBottom: '28px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }
          }),
          /* Bottom-right emoji/photo buttons wrapper */
          /*#__PURE__*/React.createElement("div", {
            style: {
              position: 'absolute',
              right: '4px',
              bottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 2
            }
          },
            /* Emoji picker trigger */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: () => setIsEditEmojiOpen(true),
              style: { background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
              title: "이모티콘 추가"
            }, /*#__PURE__*/React.createElement(EmojiPickerIcon, null)),
            
            /* File Upload label icon */
            /*#__PURE__*/React.createElement("label", {
              style: { display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' },
              title: "사진 추가"
            }, 
              /*#__PURE__*/React.createElement("input", {
                type: "file",
                multiple: true,
                accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
                onChange: handleEditFileSelect,
                style: { display: 'none' }
              }),
              /*#__PURE__*/React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
              }, /*#__PURE__*/React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), /*#__PURE__*/React.createElement("circle", { cx: "9", cy: "9", r: "2" }), /*#__PURE__*/React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }))
            ),

            /* Clipboard paste trigger (mobile has no Ctrl+V, so this reads the OS clipboard directly) */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              onClick: handleEditPasteClick,
              style: { background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
              title: "붙여넣기"
            }, /*#__PURE__*/React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
            }, /*#__PURE__*/React.createElement("path", { d: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" }), /*#__PURE__*/React.createElement("rect", { x: "9", y: "3", width: "6", height: "4", rx: "1" })))
          )
        ),

        /* Links Card Preview inside edit modal (one card per distinct URL) */
        collectMemoPreviewUrls(editText).map((url, idx) => {
          const pack = buildMemoLinkPreviews(editText, editingMemo);
          const cachedData = pack.linkPreviews.find(p => p && p.url === url)
            || (editingMemo?.linkPreview && (editingMemo.linkPreview.url === url || idx === 0) ? editingMemo.linkPreview : null);
          return /*#__PURE__*/React.createElement("div", {
            key: url,
            style: { marginTop: idx === 0 ? '4px' : '8px', marginBottom: '4px' }
          }, /*#__PURE__*/React.createElement(LinkPreviewCard, { url: url, cachedData: cachedData, stretch: true }));
        }),

        /* Images previews list */
        editImages.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }
        }, editImages.map((img, idx) => /*#__PURE__*/React.createElement("div", {
          key: idx,
          style: { position: 'relative', width: '60px', height: '60px' }
        }, 
          /* Image element */
          /*#__PURE__*/React.createElement("img", {
            src: img.thumbnail,
            decoding: 'async',
            style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }
          }),
          /* Remove button (shared with chat's attachment thumbnail) */
          /*#__PURE__*/React.createElement(ImageThumbRemoveButton, {
            onClick: () => removeEditImage(idx)
          })
        ))),

        /* Tag Input Module (migrated directly from Lightbox component, white background responsive, IME composition protected) */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
        },
          /* Shared participant-select pill (ui-widgets.js) sits to the left of the tag input row. */
          /*#__PURE__*/React.createElement(ParticipantPickerButton, {
            participant: editPart,
            onClick: () => setIsEditPartOpen(true)
          }),
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            placeholder: editTags.length >= 10 ? "태그 최대 10개 도달" : `태그 입력 (${editTags.length}/10)`,
            value: editTagInput,
            onChange: e => setEditTagInput(e.target.value),
            onKeyDown: e => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEditTag();
              }
            },
            maxLength: 100,
            style: {
              flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
              color: 'var(--text-main)', fontSize: 'var(--font-size-sm)'
            }
          }),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: handleAddEditTag,
            disabled: editTags.length >= 10,
            style: {
              flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)', background: 'var(--border-subtle)',
              color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 800, cursor: 'pointer',
              opacity: editTags.length >= 10 ? 0.45 : 1
            }
          }, "저장")
        )),

        /* Footer Controls: Tag Badges row */
        /*#__PURE__*/React.createElement("div", {
          className: "memo-edit-modal-footer",
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', gap: '8px', flexWrap: 'wrap' }
        },
          /* Tag badges list */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }
          },
            /* Active tag capsule badges (Responsive white background style: (#레시피 (✕))) */
            editTags.map(tag => /*#__PURE__*/React.createElement("span", {
              key: tag,
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: 'var(--radius-full)',
                padding: '3px 4px 3px 10px',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 900,
                lineHeight: 1,
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                background: 'var(--bg-primary)'
              }
            }, `#${tag}`, /*#__PURE__*/React.createElement("button", {
              type: "button",
              title: `#${tag} 태그 삭제`,
              onClick: async e => {
                e.stopPropagation();
                const nextTags = editTags.filter(t => t !== tag);
                if (editingMemo) {
                  const calendarId = calendar.id;
                  const tagsArray = nextTags.map(t => t.startsWith('#') ? t : '#' + t);
                  if (typeof onUpdateMemo === 'function') onUpdateMemo(editingMemo.id, { tags: tagsArray });
                  try {
                    const updated = await writeMemoDocument('memos', calendarId, editingMemo.id, { tags: tagsArray }, 'update', '태그 삭제');
                    if (!updated?.success) throw new Error('Memo tag delete failed');
                  } catch (err) {
                    console.error('Failed to delete tag in Firestore:', err);
                    if (typeof onUpdateMemo === 'function') onUpdateMemo(editingMemo.id, { tags: editTags });
                    showToast('태그 삭제 실패', 'error');
                    return;
                  }
                }
                setEditTags(nextTags);
              },
              style: {
                width: '17px',
                height: '17px',
                border: 0,
                borderRadius: '50%',
                background: 'var(--border-subtle)',
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0
              }
            }, /*#__PURE__*/React.createElement(TrashIcon, { size: 12 }))))
          ),

          /* Save / Delete / Cancel Actions using DateModal layout styles */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end', marginTop: '6px' }
          },
            /* Delete Memo Button (Pushed to the far left) */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-danger",
              onClick: () => handleDeleteMemo(editingMemo),
              style: {
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                padding: '10px 20px',
                marginRight: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }
            }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }), "삭제"),
            
            /* Cancel */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-secondary",
              onClick: memoEditorDirtyGuard.requestClose,
              style: {
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none'
              }
            }, "닫기"),
            
            /* Update */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-primary",
              onClick: handleUpdateMemo,
              disabled: editUploadProgress !== null,
              style: {
                padding: '10px 28px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }
            }, editUploadProgress !== null ? `업로드 (${editUploadProgress.pct}%)` : "저장")
          )
        )
      )
    )),

    /* Emoji Picker Overlay & Bottom Sheets for selector sheets */
    isComposerEmojiOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
      onSelect: (emoji) => {
        setNewText(prev => prev + emoji);
        setIsComposerEmojiOpen(false);
      },
      onClose: () => setIsComposerEmojiOpen(false)
    }),
    isEditEmojiOpen && /*#__PURE__*/React.createElement(EmojiPickerSheet, {
      onSelect: (emoji) => {
        setEditText(prev => prev + emoji);
        setIsEditEmojiOpen(false);
      },
      onClose: () => setIsEditEmojiOpen(false)
    }),

    isComposerPartOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: calendar,
      selectedId: composerParticipantId,
      onSelect: id => {
        setComposerParticipantId(id);
        // Mirrors the chat composer's own onSelect (app-main.js) -- this is the same kind of
        // "who am I posting as" pick, so it should update the remembered device default the
        // same way. (The edit modal's picker just below is a one-off reassignment, like chat's
        // own message-edit picker, and intentionally does not persist.)
        setStoredChatParticipantId(calendar.id, id);
        setIsComposerPartOpen(false);
      },
      onClose: () => setIsComposerPartOpen(false)
    }),
    isEditPartOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: calendar,
      selectedId: editParticipantId,
      onSelect: id => {
        setEditParticipantId(id);
        setIsEditPartOpen(false);
      },
      onClose: () => setIsEditPartOpen(false)
    }),

    imageProcessingNew && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingNew),
    newUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, newUploadProgress),
    imageProcessingEdit && /*#__PURE__*/React.createElement(ImageProcessingOverlay, imageProcessingEdit),
    linkPreviewProgressState && /*#__PURE__*/React.createElement(LinkPreviewProgressOverlay, { progress: linkPreviewProgressState.pct, remainingSec: linkPreviewProgressState.remainingSec }),
    isGalleryOpen && /*#__PURE__*/React.createElement(ChatGalleryModal, { chatMessages, onClose: () => setIsGalleryOpen(false), setActiveLightbox }),
    editUploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, editUploadProgress),

    sharingMemo && /*#__PURE__*/React.createElement(MemoShareModal, {
      memo: sharingMemo,
      calendarId: calendar.id,
      onClose: () => setSharingMemo(null),
      showToast: showToast
    })
  );
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    MemoView: MemoView,
  });
}
