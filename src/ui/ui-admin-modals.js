/**
 * Admin sub-modals (P4-20)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getCalendarPolls(calendar) {
  const f = __gatherUiDeps().getCalendarPolls || GATHER_APP_UTILS.getCalendarPolls;
  return typeof f === 'function' ? f(calendar) : [];
}
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

function formatDateWithDayName(...args) {
  const f = __gatherUiDeps().formatDateWithDayName || GATHER_APP_UTILS.formatDateWithDayName;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatPollDeadline(...args) {
  const f = __gatherUiDeps().formatPollDeadline || GATHER_APP_UTILS.formatPollDeadline;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatRegisteredAt(...args) {
  const f = __gatherUiDeps().formatRegisteredAt || GATHER_APP_UTILS.formatRegisteredAt;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatShortDateWithDayName(...args) {
  const f = __gatherUiDeps().formatShortDateWithDayName || GATHER_APP_UTILS.formatShortDateWithDayName;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getActivePollOptions(...args) {
  const f = __gatherUiDeps().getActivePollOptions || GATHER_APP_UTILS.getActivePollOptions;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isPollClosed(...args) {
  const f = __gatherUiDeps().isPollClosed || GATHER_APP_UTILS.isPollClosed;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isTombstone(...args) {
  const f = __gatherUiDeps().isTombstone || GATHER_APP_UTILS.isTombstone;
  return typeof f === 'function' ? f(...args) : undefined;
}
function isValidDateString(...args) {
  const f = __gatherUiDeps().isValidDateString || GATHER_APP_UTILS.isValidDateString;
  return typeof f === 'function' ? f(...args) : undefined;
}
function normalizeColorValue(...args) {
  const f = __gatherUiDeps().normalizeColorValue || GATHER_APP_UTILS.normalizeColorValue;
  return typeof f === 'function' ? f(...args) : undefined;
}
function buildActivityLogsFromAvailabilities(...args) {
  const f = __gatherUiDeps().buildActivityLogsFromAvailabilities || GATHER_APP_UTILS.buildActivityLogsFromAvailabilities;
  return typeof f === 'function' ? f(...args) : undefined;
}
function computeCalendarSearchMatches(...args) {
  const f = __gatherUiDeps().computeCalendarSearchMatches || GATHER_APP_UTILS.computeCalendarSearchMatches;
  return typeof f === 'function' ? f(...args) : undefined;
}
function createCalendarDataBackupPayload(...args) {
  const f = __gatherUiDeps().createCalendarDataBackupPayload || GATHER_APP_UTILS.createCalendarDataBackupPayload;
  return typeof f === 'function' ? f(...args) : undefined;
}
function createPollActivityLog(...args) {
  const f = __gatherUiDeps().createPollActivityLog || GATHER_APP_UTILS.createPollActivityLog;
  return typeof f === 'function' ? f(...args) : undefined;
}
function deleteActivityLogsAfterTimestamp(...args) {
  const f = __gatherUiDeps().deleteActivityLogsAfterTimestamp || GATHER_APP_UTILS.deleteActivityLogsAfterTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function exportCalendarConfirmedMeetingsToICS(...args) {
  const f = __gatherUiDeps().exportCalendarConfirmedMeetingsToICS || GATHER_APP_UTILS.exportCalendarConfirmedMeetingsToICS;
  return typeof f === 'function' ? f(...args) : undefined;
}
function formatLogTimestamp(...args) {
  const f = __gatherUiDeps().formatLogTimestamp || GATHER_APP_UTILS.formatLogTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getAdminSearchResultTargetUrl(...args) {
  const f = __gatherUiDeps().getAdminSearchResultTargetUrl || GATHER_APP_UTILS.getAdminSearchResultTargetUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function rebuildCalendarToTimestamp(...args) {
  const f = __gatherUiDeps().rebuildCalendarToTimestamp || GATHER_APP_UTILS.rebuildCalendarToTimestamp;
  return typeof f === 'function' ? f(...args) : undefined;
}

const PRESET_COLORS = GATHER_APP_CONSTANTS.PRESET_COLORS || [];
function getTrulyConfirmedMeetings(...args) {
  const f = __gatherUiDeps().getTrulyConfirmedMeetings || GATHER_APP_UTILS.getTrulyConfirmedMeetings;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMessageImageEntries(...args) {
  const f = __gatherUiDeps().getMessageImageEntries || GATHER_APP_UTILS.getMessageImageEntries;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMessageDirectMediaEntry(...args) {
  const f = __gatherUiDeps().getMessageDirectMediaEntry || GATHER_APP_UTILS.getMessageDirectMediaEntry;
  return typeof f === 'function' ? f(...args) : undefined;
}
function highlightKeyword(...args) {
  const f = __gatherUiDeps().highlightKeyword || GATHER_APP_UTILS.highlightKeyword;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPollTotalVoteCount(...args) {
  const f = __gatherUiDeps().getPollTotalVoteCount || GATHER_APP_UTILS.getPollTotalVoteCount;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getCalendarActivityLogs(...args) {
  const f = __gatherUiDeps().getCalendarActivityLogs || GATHER_APP_UTILS.getCalendarActivityLogs;
  return typeof f === 'function' ? f(...args) : undefined;
}
export function AdminModal({
  initialTab = 'settings',
  calendar,
  allCalendars,
  onSelectCalendar,
  onLoadActivityLogs,
  onSave,
  recentMessages = [],
  chatMessages = [],
  onDeleteMessage,
  onDeleteAvailability,
  onDeleteAllForDate,
  onRequestConfirm,
  onClose,
  showToast,
  onDeleteLog,
  chatParticipantId,
  themeChoice,
  toggleTheme,
  isDarkTheme,
  fontScalePercent,
  setFontScalePercent,
  onSelectDate,
  onOpenChatMessage,
  onOpenImage,
  onNotificationPermissionBlocked
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const AlertTriangleIcon = __comp.AlertTriangleIcon || __deps.AlertTriangleIcon;
  const CalendarCogIcon = __comp.CalendarCogIcon || __deps.CalendarCogIcon;
  const CalendarExportIcon = __comp.CalendarExportIcon || __deps.CalendarExportIcon;
    const ColorSwatchPicker = __comp.ColorSwatchPicker || __deps.ColorSwatchPicker;
  const ParticipantBadge = __comp.ParticipantBadge || __deps.ParticipantBadge;
    const HourglassIcon = __comp.HourglassIcon || __deps.HourglassIcon;
  const LogIcon = __comp.LogIcon || __deps.LogIcon;
    const PollModal = __comp.PollModal || __deps.PollModal;
  const PollSectionIcon = __comp.PollSectionIcon || __deps.PollSectionIcon;
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SettingsIcon = __comp.SettingsIcon || __deps.SettingsIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const getActiveParticipants = typeof __deps.getActiveParticipants === 'function'
    ? __deps.getActiveParticipants
    : (typeof GATHER_APP_UTILS !== 'undefined' && typeof GATHER_APP_UTILS.getActiveParticipants === 'function'
      ? GATHER_APP_UTILS.getActiveParticipants
      : function (cal) { return (cal && Array.isArray(cal.participants) ? cal.participants.filter(function (p) { return p && !p.deletedAt; }) : []); });
  const sanitizeText = typeof __deps.sanitizeText === 'function'
    ? __deps.sanitizeText
    : (typeof GATHER_APP_UTILS !== 'undefined' && typeof GATHER_APP_UTILS.sanitizeText === 'function'
      ? GATHER_APP_UTILS.sanitizeText
      : function (s, n) { var v = String(s == null ? '' : s); return typeof n === 'number' ? v.slice(0, n) : v; });

  const [activeTab, setActiveTab] = React.useState(initialTab || 'settings');
  React.useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);

  const [exportCategory, setExportCategory] = React.useState('full');
  const [logCategoryFilter, setLogCategoryFilter] = React.useState('all');
  const [logSearchQuery, setLogSearchQuery] = React.useState('');

  const handleExportSelectedData = async () => {
    if (!calendar) return;
    if (exportCategory === 'calendar') {
      if (getTrulyConfirmedMeetings(calendar).length === 0) {
        if (showToast) showToast('확정된 모임이 없습니다', 'error');
        return;
      }
      exportCalendarConfirmedMeetingsToICS(calendar);
      if (showToast) showToast('캘린더 일정 (.ics) 내보내기가 완료되었습니다.', 'success');
      return;
    }

    let exportData = null;
    let categoryName = '전체 데이터';

    if (exportCategory === 'full') {
      exportData = await createCalendarDataBackupPayload([calendar], calendar.id);
      categoryName = '전체 데이터';
    } else if (exportCategory === 'memo') {
      exportData = Array.isArray(calendar.memos) ? calendar.memos : [];
      categoryName = '메모 데이터';
    } else if (exportCategory === 'gallery') {
      exportData = {
        chatMessagesWithImages: (calendar.chatMessages || []).filter(m => m && (m.imageUrl || m.thumbUrl || (Array.isArray(m.imageUrls) && m.imageUrls.length))),
        memosWithImages: (calendar.memos || []).filter(m => m && (m.imageUrl || m.thumbUrl || (Array.isArray(m.imageUrls) && m.imageUrls.length))),
        meetingPhotos: (calendar.confirmedMeetings || []).flatMap(m => m.photos || [])
      };
      categoryName = '갤러리 사진';
    } else if (exportCategory === 'places') {
      exportData = Array.isArray(calendar.places) ? calendar.places : [];
      categoryName = '장소 데이터';
    } else if (exportCategory === 'expenses') {
      exportData = {
        expenses: Array.isArray(calendar.expenses) ? calendar.expenses : [],
        settlementCards: Array.isArray(calendar.settlementCards) ? calendar.settlementCards : []
      };
      categoryName = '정산 데이터';
    } else if (exportCategory === 'polls') {
      exportData = Array.isArray(calendar.polls) ? calendar.polls : [];
      categoryName = '투표 데이터';
    }

    if (!exportData) {
      if (showToast) showToast('내보낼 데이터가 없습니다.', 'warning');
      return;
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calendar.title || calendar.id}_${exportCategory}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`'${categoryName}' 내보내기가 완료되었습니다!`, 'success');
  };

  // recovery/logs only — avoid loading full activityLogs when opening 일반/설정
  React.useEffect(() => {
    if (activeTab === 'recovery' || activeTab === 'logs') {
      if (typeof onLoadActivityLogs === 'function') onLoadActivityLogs();
    }
  }, [activeTab, onLoadActivityLogs, calendar && calendar.id]);

  // Chat notification permission -- mirrors ChatRoomView's own bell toggle logic (kept as an
  // independent local read of the same browser-level Notification.permission rather than shared
  // React state, since it's not app-owned data). Lets the on/off switch live here too, in 일반
  // tab, alongside the other personal display preferences. Notification.permission itself is
  // origin-wide (the browser has no concept of "per-calendar" permission), but once granted,
  // whether THIS calendar's chat actually shows a notification is its own per-calendar
  // preference (isChatNotifyEnabledForCalendar) -- so the switch reflects both together, and
  // toggling it once permission is already granted flips the per-calendar preference instead of
  // hitting a dead end.
    // Calendar tab: browse dates and delete schedules -- reuses DateModal in adminMode, which
  // hides the normal registration UI and shows only the registered-participant list + delete
  // controls (per-participant and whole-date), same as the 일정 삭제 flow used to live in the
  // regular user-facing modal before it moved here.
  // Settings tab states
  const [title, setTitle] = React.useState(calendar.title);
  const [description, setDescription] = React.useState(calendar.description || '');
  const [participants, setParticipants] = React.useState(() => { try { return getActiveParticipants(calendar) || []; } catch (_) { return []; } });

  const [newName, setNewName] = React.useState('');
  const newNameInputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const adminSettingsDirtySnapshot = () => JSON.stringify([
    title,
    description,
    newName,
    participants.map(p => [p.id, p.name, p.color, p.removedAt ? 1 : 0])
  ]);
  const { requestClose, overlayOnClick } = useModalDirtyGuard(
    onClose,
    onRequestConfirm,
    undefined,
    true,
    adminSettingsDirtySnapshot,
    calendar?.id || 'calendar'
  );

  // Poll sub-modal states inside AdminModal
  const [editingPoll, setEditingPoll] = React.useState(null);
  const [isPollModalOpen, setIsPollModalOpen] = React.useState(false);

  React.useEffect(() => {
    setTitle(calendar.title);
    setDescription(calendar.description || '');
    setParticipants(getActiveParticipants(calendar));
    setNewName('');
    setIsSubmitting(false);
  }, [calendar?.id]);

  const handleAddParticipant = e => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSubmitting) return;
    if (e && e.nativeEvent && e.nativeEvent.isComposing) return;
    const latestName = newNameInputRef.current ? newNameInputRef.current.value : newName;
    const trimmed = sanitizeText(latestName, 40);
    if (!trimmed) {
      if (showToast) showToast('참여자 이름을 입력해 주세요.', 'error');
      return;
    }
    const newParticipant = {
      id: `${calendar.id}_p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
      color: normalizeColorValue(PRESET_COLORS[participants.filter(p => !isTombstone(p)).length % PRESET_COLORS.length]),
      updatedAt: Date.now()
    };
    setParticipants(prev => [...prev, newParticipant]);
    setNewName('');
    if (newNameInputRef.current) newNameInputRef.current.value = '';
  };

  const updateParticipant = (participantId, patch) => {
    if (isSubmitting) return;
    const now = Date.now();
    const cleanPatch = { ...patch };
    if (Object.prototype.hasOwnProperty.call(cleanPatch, 'name')) {
      cleanPatch.name = sanitizeText(cleanPatch.name, 40);
    }
    if (Object.prototype.hasOwnProperty.call(cleanPatch, 'color')) {
      cleanPatch.color = normalizeColorValue(cleanPatch.color);
    }
    setParticipants(prev => prev.map(item => item.id === participantId ? {
      ...item,
      ...cleanPatch,
      updatedAt: now
    } : item));
  };

  const handleSubmitSettings = async e => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const now = Date.now();

    // Validate titles & names
    if (!title.trim()) {
      if (showToast) showToast('캘린더 제목을 입력해 주세요.', 'error'); else console.warn('캘린더 제목을 입력해 주세요.');
      setIsSubmitting(false);
      return;
    }

    const activeParticipantsList = participants.filter(p => !isTombstone(p));
    const activeNames = activeParticipantsList.map(p => p.name.trim().toLowerCase());
    if (new Set(activeNames).size !== activeNames.length) {
      if (showToast) showToast('동일한 참여자 이름이 이미 존재합니다.', 'error'); else console.warn('동일한 참여자 이름이 이미 존재합니다.');
      setIsSubmitting(false);
      return;
    }

    const stampedCal = {
      ...calendar,
      title: title.trim(),
      description: description.trim(),
      updatedAt: now,
      revision: (calendar.revision || 0) + 1,
      participants: participants
    };

    let saved = false;
    try {
      saved = await Promise.resolve(onSave(stampedCal, null));
    } catch (err) {
      console.error('Calendar settings save failed:', err);
    }
    setIsSubmitting(false);
    if (saved !== false) {
      onClose();
    }
  };

  // Poll operations from Admin Dashboard
  const handleSavePollFromAdmin = async (updatedPoll) => {
    const now = Date.now();
    let nextPolls = [...(calendar.polls || [])];
    const index = nextPolls.findIndex(p => p.id === updatedPoll.id);
    if (index >= 0) {
      nextPolls[index] = updatedPoll;
    } else {
      nextPolls.push(updatedPoll);
    }

    const log = createPollActivityLog(
      calendar.id,
      'poll_create',
      '',
      now,
      updatedPoll.title
    );

    const updatedCal = {
      ...calendar,
      polls: nextPolls,
      activityLogs: log ? [...getCalendarActivityLogs(calendar), log] : getCalendarActivityLogs(calendar),
      updatedAt: now,
      revision: (calendar.revision || 0) + 1
    };

    const saved = await onSave(updatedCal, null);
    if (saved !== false) {
      setIsPollModalOpen(false);
      setEditingPoll(null);
    }
  };

  const handleDeletePollFromAdmin = (poll) => {
    onRequestConfirm('투표 삭제', `"${poll.title}" 투표를 삭제하시겠습니까?`, async () => {
      const now = Date.now();
      // Tombstone rather than filter out -- saveMode 'settings' now merges polls via
      // mergePolls, which unions by ID against the server's copy, so a poll simply absent
      // from the outgoing payload reads as "no change" and the server's copy survives.
      const nextPolls = (calendar.polls || []).map(p => p.id === poll.id ? { ...p, deletedAt: now, updatedAt: now } : p);
      const updatedCal = {
        ...calendar,
        polls: nextPolls,
        updatedAt: now,
        revision: (calendar.revision || 0) + 1
      };
      await onSave(updatedCal, null);
    });
  };

  // Log rollback operation
  const handleRestoreToLog = (log) => {
        onRequestConfirm(
      '시점 복구',
      `[${formatRegisteredAt(log.timestamp)}] 시점으로 복구하시겠습니까? 복구 후에는 이 시점 이후 등록된 모든 일정/투표 내역이 복구/롤백 처리됩니다.`,
      async () => {
        const fullLogs = getCalendarActivityLogs(calendar);
        const restoredCal = rebuildCalendarToTimestamp(calendar, log.timestamp, fullLogs);
        const saved = await onSave(restoredCal, null);
        if (saved !== false) {
          await deleteActivityLogsAfterTimestamp(calendar.id, fullLogs, log.timestamp);
          onClose();
        }
      },
      true // showPasswordInput = true
    );
  };

  const handleTimelineRowClick = (log) => {
    onClose(); // Close AdminModal settings popup

    const dateStr = log.date;
    const action = log.action || '';

    if (log.type === 'chat' || action === 'chat_send') {
      onOpenChatMessage && onOpenChatMessage(log.id);
    } else if (action === 'tag_add' || action === 'tag_remove') {
      let found = false;
      const cleanTag = (log.note || '').replace('#', '').trim();
      if (chatMessages && cleanTag) {
        for (const msg of chatMessages) {
          const directEntry = getMessageDirectMediaEntry(msg);
          const entries = directEntry ? [...getMessageImageEntries(msg), directEntry] : getMessageImageEntries(msg);
          const entry = entries.find(e => (e.tags || '').includes(cleanTag));
          if (entry) {
            onOpenImage && onOpenImage(msg.id, entry.imageIndex, entry.directMediaUrl);
            found = true;
            break;
          }
        }
      }
      if (!found) {
        onOpenChatMessage && onOpenChatMessage(log.participantId);
      }
    } else if (dateStr && isValidDateString(dateStr)) {
      onSelectDate && onSelectDate(dateStr);
    }
  };

  // Re-build map of participants for info
  const participantsMap = (calendar.participants || []).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const activityLogsSorted = React.useMemo(
    () => [...getCalendarActivityLogs(calendar)].sort((a, b) => b.timestamp - a.timestamp),
    [calendar.activityLogs]
  );

  if (!calendar || !calendar.id) {
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      onClick: onClose,
      style: { zIndex: 10000 }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-container confirm-dialog-modal",
      style: { maxWidth: '360px', padding: '20px' }
    }, /*#__PURE__*/React.createElement("p", { style: { margin: 0 } }, "캘린더 데이터를 불러오는 중입니다."),
      /*#__PURE__*/React.createElement("button", { type: "button", className: "btn btn-secondary", style: { marginTop: '12px', width: '100%' }, onClick: onClose }, "닫기")));
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: e => { if (!isSubmitting) overlayOnClick(e); },
    style: { zIndex: 10000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container admin-settings-modal",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '760px', width: '95vw', display: 'flex', flexDirection: 'column', height: 'min(90vh, 720px)', maxHeight: 'min(720px, calc(100svh - 24px), calc(100vh - 24px))', borderRadius: 'var(--radius-md)', overflow: 'hidden' }
  },
    /* Header */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-header",
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }
    },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement(SettingsIcon, null), `${calendar.title} 설정`
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => { if (!isSubmitting) requestClose(); },
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
    ),

    /* Tab Menu Bar */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', flexShrink: 0, minWidth: 0 }
    },
      /* Tab 1: General settings */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setActiveTab('settings'),
        style: {
          padding: '12px 8px', fontSize: 'var(--font-size-base)', fontWeight: 'bold', whiteSpace: 'nowrap',
          color: activeTab === 'settings' ? '#2563EB' : 'var(--text-muted)',
          border: 'none', background: 'none',
          borderBottom: activeTab === 'settings' ? '3px solid #2563EB' : '3px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(CalendarCogIcon, null)), "일반"),
      /* Tab 2: Poll management */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setActiveTab('polls'),
        style: {
          padding: '12px 8px', fontSize: 'var(--font-size-base)', fontWeight: 'bold', whiteSpace: 'nowrap',
          color: activeTab === 'polls' ? '#2563EB' : 'var(--text-muted)',
          border: 'none', background: 'none',
          borderBottom: activeTab === 'polls' ? '3px solid #2563EB' : '3px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(PollSectionIcon, null)), "투표"),
      /* Tab 3: Log-based recovery */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setActiveTab('recovery'),
        style: {
          padding: '12px 8px', fontSize: 'var(--font-size-base)', fontWeight: 'bold', whiteSpace: 'nowrap',
          color: activeTab === 'recovery' ? '#2563EB' : 'var(--text-muted)',
          border: 'none', background: 'none',
          borderBottom: activeTab === 'recovery' ? '3px solid #2563EB' : '3px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(HourglassIcon, null)), "복구"),
      /* Tab 3: Logs view list */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => setActiveTab('logs'),
        style: {
          padding: '12px 8px', fontSize: 'var(--font-size-base)', fontWeight: 'bold', whiteSpace: 'nowrap',
          color: activeTab === 'logs' ? '#2563EB' : 'var(--text-muted)',
          border: 'none', background: 'none',
          borderBottom: activeTab === 'logs' ? '3px solid #2563EB' : '3px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("span", { className: "admin-tab-icon" }, /*#__PURE__*/React.createElement(LogIcon, null)), "로그")
    ),

    /* Modal Scrollable Body -- single scroll container shared by every tab, flush against the
       modal's edges (no padding here) so the scrollbar always sits on the true boundary; each
       tab's own content wrapper below carries the visible 16px padding instead. */
    /*#__PURE__*/React.createElement("div", {
      className: "modal-body",
      style: { flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: '0px' }
    },
      /* ========================================== */
      /* TAB 2: CALENDAR & POLLS SETTINGS           */
      /* ========================================== */
      activeTab === 'settings' && /*#__PURE__*/React.createElement(React.Fragment, null,
        /* Grid split: Left is Calendar settings, Right is Poll management */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', gap: '20px', flexDirection: 'column', padding: '16px' }
        },
          /* Section 1: Calendar Profile & Participants */
          /*#__PURE__*/React.createElement("div", {
            style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: 'var(--bg-card)' }
          },
            /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(SettingsIcon, null), "프로필 설정"),

            /* Input: Title */
            /*#__PURE__*/React.createElement("div", { style: { marginBottom: '10px' } },
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "캘린더명"),
              /*#__PURE__*/React.createElement("input", {
                type: "text", className: "form-input", style: { width: '100%' },
                value: title, disabled: isSubmitting, maxLength: 80,
                onChange: e => setTitle(e.target.value)
              })
            ),

            /* Input: Description */
            /*#__PURE__*/React.createElement("div", { style: { marginBottom: '14px' } },
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "캘린더 설명"),
              /*#__PURE__*/React.createElement("input", {
                type: "text", className: "form-input", style: { width: '100%' },
                value: description, disabled: isSubmitting, maxLength: 160,
                onChange: e => setDescription(e.target.value)
              })
            ),

            /* Participant Management */
            /*#__PURE__*/React.createElement("div", {
              style: { borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }
            },
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' } }, `참여자 설정 (${participants.filter(p => !isTombstone(p)).length}명)`),

              /* Add Row */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', gap: '8px', marginBottom: '12px' }
              },
                /*#__PURE__*/React.createElement("input", {
                  type: "text", className: "form-input", style: { flex: 1, minWidth: 0 },
                  placeholder: "새 참여자 이름", value: newName, disabled: isSubmitting, maxLength: 40,
                  ref: newNameInputRef, onChange: e => setNewName(e.target.value),
                  onKeyDown: e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (e.nativeEvent && e.nativeEvent.isComposing) return;
                      handleAddParticipant(e);
                    }
                  }
                }),
                /*#__PURE__*/React.createElement("button", {
                  type: "button", className: "btn btn-secondary", disabled: isSubmitting,
                  style: { whiteSpace: 'nowrap', height: '44px' },
                  onClick: handleAddParticipant
                }, "추가")
              ),

              /* List Row */
              /*#__PURE__*/React.createElement("div", {
                style: { display: 'flex', flexDirection: 'column', gap: '6px' }
              },
                participants.map(p => isTombstone(p) ? null : /*#__PURE__*/React.createElement("div", {
                  key: p.id,
                  style: { display: 'flex', alignItems: 'center', gap: '8px' }
                },
                  /* Color */
                  /*#__PURE__*/React.createElement(ColorSwatchPicker, {
                    value: p.color,
                    disabled: isSubmitting,
                    onChange: color => updateParticipant(p.id, { color }),
                    title: "참여자 색상"
                  }),
                  /* Name input */
                  /*#__PURE__*/React.createElement("input", {
                    type: "text", className: "form-input", style: { flex: 1, minWidth: 0, height: '44px' },
                    value: p.name, disabled: isSubmitting, maxLength: 40,
                    onInput: e => updateParticipant(p.id, { name: e.target.value }),
                    onChange: e => updateParticipant(p.id, { name: e.target.value })
                  }),
                  /* Remove button */
                  /*#__PURE__*/React.createElement("button", {
                    type: "button", className: "btn btn-danger", disabled: isSubmitting, title: "삭제",
                    style: { width: '44px', height: '44px', minWidth: '44px', padding: 0, flexShrink: 0 },
                    onClick: () => onRequestConfirm('참여자 삭제', `"${p.name}" 참여자를 삭제하시겠습니까?`, () => updateParticipant(p.id, { removedAt: Date.now() }))
                  }, /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }))
                ))
              )
            ),

            /* Save Button for Settings */
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-primary", disabled: isSubmitting,
              onClick: handleSubmitSettings,
              style: { marginTop: '16px', width: '100%', height: '44px', fontWeight: 'bold' }
            }, isSubmitting ? "저장 중..." : "설정 저장")
          )
        )
      ),

      /* ========================================== */
      /* TAB: POLL MANAGEMENT                       */
      /* ========================================== */
      activeTab === 'polls' && /*#__PURE__*/React.createElement("div", {
        style: { padding: '16px' }
      },
        /* Polls Creation & List */
        /*#__PURE__*/React.createElement("div", {
          style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: 'var(--bg-card)' }
        },
          /* Header */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }
          },
            /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(PollSectionIcon, null), "투표 설정"),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-poll-create",
              onClick: () => { setEditingPoll(null); setIsPollModalOpen(true); }
            }, "+ 새 투표")
          ),

          /* Poll list container */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          },
            getCalendarPolls(calendar).length === 0 ? /*#__PURE__*/React.createElement("div", { style: { padding: '16px', color: 'var(--text-light)', fontSize: 'var(--font-size-md)', textAlign: 'center' } }, "현재 등록된 투표가 없습니다. 새 투표를 생성해 주세요.") :
            getCalendarPolls(calendar).map(poll => /*#__PURE__*/React.createElement("div", {
              key: poll.id,
              className: 'admin-log-row poll-list-row settings-poll-row',
              style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px 8px', borderRadius: 'var(--radius-md)', padding: '10px 12px' }
            },
              /* Left info */
              /*#__PURE__*/React.createElement("div", { className: "admin-poll-row-main", style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', minWidth: 0, flex: '1 1 160px' } },
                /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' } }, poll.title),
                /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, `${getActivePollOptions(poll).length}개 옵션 · 총 ${getPollTotalVoteCount(poll)}표${poll.deadline ? ` · 마감 ${formatPollDeadline(poll.deadline)}${isPollClosed(poll) ? ' (마감됨)' : ''}` : ''}`)
              ),
              /* Right actions */
              /*#__PURE__*/React.createElement("div", { className: "admin-poll-row-actions", style: { display: 'flex', gap: '6px' } },
                /* Edit button */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  onClick: () => { setEditingPoll(poll); setIsPollModalOpen(true); },
                  style: {
                    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                    padding: '4px 10px', fontSize: 'var(--font-size-sm)', cursor: 'pointer', color: 'var(--text-main)'
                  }
                }, "수정"),
                /* Delete button */
                /*#__PURE__*/React.createElement("button", {
                  type: "button",
                  className: "btn btn-danger",
                  title: "삭제",
                  onClick: () => handleDeletePollFromAdmin(poll),
                  style: { width: '30px', height: '30px', padding: 0, flexShrink: 0 }
                }, /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }))
              )
            ))
          )
        )
      ),

      /* ========================================== */
      /* TAB 3: POINT-IN-TIME LOG RECOVERY         */
      /* ========================================== */
      activeTab === 'recovery' && /*#__PURE__*/React.createElement("div", {
        style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }
      },
        /* Info alert */
        /*#__PURE__*/React.createElement("div", {
          style: { backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: '#92400E', fontSize: 'var(--font-size-md)', lineHeight: '1.5' }
        },
          /*#__PURE__*/React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' } }, /*#__PURE__*/React.createElement(AlertTriangleIcon, null), "시점 복구 안내 (데이터 롤백): "),
          "선택한 마일스톤 시점으로 캘린더 데이터를 되돌립니다. 지정한 복구 시점 이후에 수행된 변경 사항이 해당 상태로 복원됩니다."
        ),

        /* Export Bar: '전체 데이터 내보내기' + Category Select Box + Mobile Responsive */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }
        },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-primary",
            style: { flex: '1 1 180px', justifyContent: 'center', padding: '12px 16px', fontWeight: 800, fontSize: 'var(--font-size-base)' },
            onClick: () => {
              const blob = new Blob([JSON.stringify(calendar, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${calendar.title || calendar.id}_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              if (showToast) showToast('전체 데이터 백업 파일이 다운로드되었습니다!', 'success');
            }
          }, /*#__PURE__*/React.createElement(CalendarExportIcon, null), "전체 데이터 내보내기"),
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', gap: '6px', flex: '1 1 200px', minWidth: 0 }
          },
            /*#__PURE__*/React.createElement("select", {
              className: "form-select",
              value: exportCategory,
              onChange: e => setExportCategory(e.target.value),
              style: { flex: 1, minWidth: 0, fontSize: 'var(--font-size-md)', borderRadius: '8px', padding: '10px' }
            },
              /*#__PURE__*/React.createElement("option", { value: "full" }, "전체 데이터 (JSON)"),
              /*#__PURE__*/React.createElement("option", { value: "calendar" }, "캘린더 일정 (.ics)"),
              /*#__PURE__*/React.createElement("option", { value: "memo" }, "메모 데이터 (JSON)"),
              /*#__PURE__*/React.createElement("option", { value: "gallery" }, "갤러리 사진 (JSON)"),
              /*#__PURE__*/React.createElement("option", { value: "places" }, "장소 데이터 (JSON)"),
              /*#__PURE__*/React.createElement("option", { value: "expenses" }, "정산 데이터 (JSON)"),
              /*#__PURE__*/React.createElement("option", { value: "polls" }, "투표 데이터 (JSON)")
            ),
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-secondary",
              onClick: handleExportSelectedData,
              style: { fontSize: 'var(--font-size-md)', fontWeight: 800, whiteSpace: 'nowrap', borderRadius: '8px', padding: '10px 14px' }
            }, "내보내기")
          )
        ),

        /* Log Timeline for Point-in-Time Rollback */
        /*#__PURE__*/React.createElement("div", {
          style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }
        },
          /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(HourglassIcon, null), "시점 복구 타임라인"),

          /* Timeline scroll container */
          /*#__PURE__*/React.createElement("div", {
            style: { display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '360px', paddingRight: '4px' }
          },
            activityLogsSorted.length === 0 ? /*#__PURE__*/React.createElement("div", { style: { padding: '30px', color: 'var(--text-light)', fontSize: 'var(--font-size-md)', textAlign: 'center' } }, "기록된 활동 로그가 없어 복구 기능을 이용할 수 없습니다.") :
            activityLogsSorted.map(log => {
              const resolveParticipant = __deps.resolveLogParticipant || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.resolveLogParticipant) || ((l, map) => (map && map[l.participantId]) || { name: '시스템', color: '#94A3B8' });
              const formatNote = __deps.formatDetailedLogNote || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.formatDetailedLogNote) || (l => l.note || '');
              const p = resolveParticipant(log, participantsMap);
              const detailedNote = formatNote(log);
              const actionLabel = {
                create: '일정 추가', update: '일정 변경', delete: '일정 삭제',
                poll_create: '투표 생성', poll_vote: '투표 진행', poll_cancel: '투표 취소',
                expense_create: '지출/수입 등록', expense_update: '지출/수입 수정', expense_delete: '지출/수입 삭제',
                tag_add: '사진 태그 추가', tag_remove: '사진 태그 삭제',
                meeting_confirm: '모임 확정', meeting_cancel: '모임 확정 취소',
                memo_create: '메모 추가', memo_update: '메모 변경', memo_delete: '메모 삭제',
                place_create: '장소 등록', place_update: '장소 수정', place_delete: '장소 삭제'
              }[log.action] || '활동';

              const actionBadgeColor = {
                create: 'var(--status-green)', update: '#2563EB', delete: '#EF4444',
                poll_create: '#8B5CF6', poll_vote: '#EC4899', poll_cancel: '#F97316',
                expense_create: '#F59E0B', expense_update: '#F59E0B', expense_delete: '#DC2626',
                tag_add: '#6366F1', tag_remove: '#DC2626',
                meeting_confirm: '#8B5CF6', meeting_cancel: '#EF4444',
                memo_create: '#6366F1', memo_update: '#F59E0B', memo_delete: '#EF4444',
                place_create: 'var(--status-green)', place_update: '#2563EB', place_delete: '#EF4444'
              }[log.action] || 'var(--text-muted)';
              const actionBadgeBg = `${actionBadgeColor}1F`;

              return /*#__PURE__*/React.createElement("div", {
                key: log.id,
                className: "recent-log-row",
                style: { cursor: 'pointer' },
                onClick: () => handleTimelineRowClick(log)
              },
                /* Left: action badge + user + description */
                /*#__PURE__*/React.createElement("div", { className: "recent-log-left" },
                  /* Action Badge */
                  /*#__PURE__*/React.createElement("span", {
                    style: {
                      fontSize: 'var(--font-size-xs)', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: actionBadgeBg, color: actionBadgeColor, border: `1px solid ${actionBadgeColor}30`,
                      whiteSpace: 'nowrap'
                    }
                  }, actionLabel),
                  /* User */
                  /*#__PURE__*/React.createElement(ParticipantBadge, { participant: p }),
                  log.date && /*#__PURE__*/React.createElement("span", {
                    className: "recent-log-date",
                    style: { fontSize: 'var(--font-size-md)' }
                  }, formatShortDateWithDayName(log.date)),
                  /* Description text */
                  detailedNote && /*#__PURE__*/React.createElement("span", {
                    className: "recent-log-note",
                    style: { fontSize: 'var(--font-size-md)' }
                  }, detailedNote)
                ),
                /* Right: registered-at timestamp + rollback button */
                /*#__PURE__*/React.createElement("div", { className: "recent-log-right recovery-restore-footer" },
                  /*#__PURE__*/React.createElement("span", { className: "registered-at-text recent-log-time" }, formatRegisteredAt(log.timestamp)),
                  /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    onClick: (e) => { e.stopPropagation(); handleRestoreToLog(log); },
                    className: "recovery-restore-btn",
                    style: {
                      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px', fontSize: 'var(--font-size-sm)', fontWeight: 'bold', cursor: 'pointer', color: 'var(--accent-primary)', whiteSpace: 'nowrap'
                    }
                  }, "이 시점으로 복구")
                )
              );
            })
          )
        )
      ),

    /* ========================================== */
    /* TAB 4: CHAT/SCHEDULE ACTIVITY AUDIT LOG    */
    /* ========================================== */
    activeTab === 'logs' && /*#__PURE__*/React.createElement("div", {
      style: { padding: '16px' }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '12px' }
      },
        /* Module Filter Chips Bar */
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }
        },
          [
            { id: 'all', label: '전체' },
            { id: 'schedule', label: '일정' },
            { id: 'place', label: '장소' },
            { id: 'tag', label: '사진태그' },
            { id: 'expense', label: '정산' },
            { id: 'poll', label: '투표' },
            { id: 'memo', label: '메모' }
          ].map(chip => /*#__PURE__*/React.createElement("button", {
            key: chip.id,
            type: "button",
            onClick: () => setLogCategoryFilter(chip.id),
            style: {
              padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
              border: logCategoryFilter === chip.id ? '1px solid var(--text-main)' : '1px solid var(--border-subtle)',
              backgroundColor: logCategoryFilter === chip.id ? 'var(--text-main)' : 'var(--bg-card)',
              color: logCategoryFilter === chip.id ? '#FFFFFF' : 'var(--text-muted)'
            }
          }, chip.label))
        ),

        /* Search Input Box */
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: logSearchQuery,
          onChange: e => setLogSearchQuery(e.target.value),
          placeholder: "활동 로그 검색 (참여자, 내용, 일자 등)",
          style: { width: '100%', borderRadius: '8px', fontSize: 'var(--font-size-md)' }
        }),

        (() => {
          const actionLabels = {
            create: '등록', update: '수정', delete: '삭제',
            poll_create: '투표 생성', poll_vote: '투표', poll_cancel: '투표 취소',
            expense_create: '지출/수입 등록', expense_update: '지출/수입 수정', expense_delete: '지출/수입 삭제',
            tag_add: '사진 태그 추가', tag_remove: '사진 태그 삭제',
            meeting_confirm: '모임 확정', meeting_cancel: '모임 확정 취소',
            memo_create: '메모 추가', memo_update: '메모 변경', memo_delete: '메모 삭제',
            place_create: '장소 등록', place_update: '장소 수정', place_delete: '장소 삭제'
          };
          const actionColors = {
            create: '#2563EB', update: '#7C3AED', delete: '#DC2626',
            poll_create: 'var(--text-main)', poll_vote: '#2563EB', poll_cancel: '#DC2626',
            expense_create: '#B45309', expense_update: '#B45309', expense_delete: '#C2410C',
            tag_add: '#4338CA', tag_remove: '#B91C1C',
            meeting_confirm: '#7E22CE', meeting_cancel: '#B91C1C',
            memo_create: '#4338CA', memo_update: '#B45309', memo_delete: '#B91C1C',
            place_create: '#2563EB', place_update: '#7C3AED', place_delete: '#DC2626'
          };
          const logs = buildActivityLogsFromAvailabilities(calendar || {});

          const filteredLogs = logs.filter(log => {
            if (logCategoryFilter !== 'all') {
              const act = log.action || '';
              if (logCategoryFilter === 'schedule' && !['create', 'update', 'delete', 'meeting_confirm', 'meeting_cancel'].includes(act)) return false;
              if (logCategoryFilter === 'place' && !['place_create', 'place_update', 'place_delete'].includes(act)) return false;
              if (logCategoryFilter === 'tag' && !['tag_add', 'tag_remove'].includes(act)) return false;
              if (logCategoryFilter === 'expense' && !['expense_create', 'expense_update', 'expense_delete'].includes(act)) return false;
              if (logCategoryFilter === 'poll' && !['poll_create', 'poll_vote', 'poll_cancel'].includes(act)) return false;
              if (logCategoryFilter === 'memo' && !['memo_create', 'memo_update', 'memo_delete'].includes(act)) return false;
            }
            if (logSearchQuery.trim()) {
              const q = logSearchQuery.toLowerCase().trim();
              const resolveParticipant = __deps.resolveLogParticipant || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.resolveLogParticipant) || ((l, map) => (map && map[l.participantId]) || { name: '시스템', color: '#94A3B8' });
              const formatNote = __deps.formatDetailedLogNote || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.formatDetailedLogNote) || (l => l.note || '');
              const participant = resolveParticipant(log, participantsMap);
              const noteText = formatNote(log) || '';
              const searchTarget = `${participant.name} ${log.action} ${log.date || ''} ${noteText}`.toLowerCase();
              if (!searchTarget.includes(q)) return false;
            }
            return true;
          });

          if (filteredLogs.length === 0) {
            return /*#__PURE__*/React.createElement("div", {
              style: { textAlign: 'center', color: 'var(--text-light)', fontSize: 'var(--font-size-base)', padding: '24px 0' }
            }, "조건에 해당되는 활동 로그가 없습니다.");
          }
          return /*#__PURE__*/React.createElement("div", {
            className: "recent-log-list",
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          }, filteredLogs.map(log => {
            const resolveParticipant = __deps.resolveLogParticipant || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.resolveLogParticipant) || ((l, map) => (map && map[l.participantId]) || { name: '시스템', color: '#94A3B8' });
            const formatNote = __deps.formatDetailedLogNote || (window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.formatDetailedLogNote) || (l => l.note || '');
            const participant = resolveParticipant(log, participantsMap);
            const actionLabel = actionLabels[log.action] || '기록';
            const actionColor = actionColors[log.action] || 'var(--text-muted)';
            const noteText = sanitizeText(formatNote(log) || '', 160);
            const logDateText = log.date ? formatShortDateWithDayName(log.date) : '';
            const logTitleText = [participant.name, `[${actionLabel}]`, logDateText].filter(Boolean).join(' ');
            const confirmText = `${logTitleText} 로그 데이터를 삭제하시겠습니까?`;
            return /*#__PURE__*/React.createElement("div", {
              key: log.id,
              className: "recent-log-row",
              style: { cursor: 'pointer' },
              onClick: () => handleTimelineRowClick(log)
            }, /*#__PURE__*/React.createElement("div", {
              className: "recent-log-left"
            }, /*#__PURE__*/React.createElement(ParticipantBadge, { participant: participant }), /*#__PURE__*/React.createElement("span", {
              className: "recent-log-action",
              style: { color: actionColor, fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }
            }, "[", actionLabel, "]"), /*#__PURE__*/React.createElement("span", {
              className: "recent-log-date",
              style: { fontSize: 'var(--font-size-md)', color: '#475569' }
            }, logDateText || null), noteText && /*#__PURE__*/React.createElement("span", {
              className: "recent-log-note",
              style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', fontStyle: 'italic' }
            }, "\"", noteText, "\"")), /*#__PURE__*/React.createElement("div", {
              className: "recent-log-right"
            }, /*#__PURE__*/React.createElement("span", {
              className: "registered-at-text recent-log-time"
            }, formatRegisteredAt(log.timestamp)), /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-danger",
              title: "로그 삭제",
              style: { width: '30px', height: '30px', padding: 0, flexShrink: 0 },
              onClick: (e) => {
                e.stopPropagation();
                if (typeof onDeleteLog !== 'function') return;
                onRequestConfirm('로그 삭제', confirmText, () => onDeleteLog(log));
              }
            }, /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }))));
          }));
        })()
      )
    )
  ),

    /* ========================================== */
    /* TAB 5: CALENDAR-BASED SCHEDULE DELETION      */
    /* ========================================== */
    /* Inner PollModal to Edit/Create Polls */
    (() => {
      const PollComp = PollModal || (typeof window !== 'undefined' && window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PollModal) || (typeof window !== 'undefined' && window.GATHER_UI_DEPS && window.GATHER_UI_DEPS.PollModal);
      return isPollModalOpen && PollComp ? /*#__PURE__*/React.createElement(PollComp, {
        calendar: calendar,
        poll: editingPoll,
        onRequestConfirm: onRequestConfirm,
        onSave: handleSavePollFromAdmin,
        onClose: () => {
          setIsPollModalOpen(false);
          setEditingPoll(null);
        },
        showToast: showToast
      }) : null;
    })()
  ));
}

export function AdminUnifiedSearchResultsView({
  query, calendarsList, messagesMap, memosMap,
  calFilter = 'all', dateStart = '', dateEnd = '',
  onCalFilterChange, onDateStartChange, onDateEndChange,
  onBack
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const CalendarSearchIcon = __comp.CalendarSearchIcon || __deps.CalendarSearchIcon;
  const PAGE_HEADER_BACK_BTN_STYLE = __comp.PAGE_HEADER_BACK_BTN_STYLE || __deps.PAGE_HEADER_BACK_BTN_STYLE || {
    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'transparent', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0
  };
  const PAGE_HEADER_ICON_BTN_STYLE = __comp.PAGE_HEADER_ICON_BTN_STYLE || __deps.PAGE_HEADER_ICON_BTN_STYLE || {
    background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  };
  const DeadlineDateTimePicker = __comp.DeadlineDateTimePicker || __deps.DeadlineDateTimePicker;
  const SearchCategoryTabs = __comp.SearchCategoryTabs || __deps.SearchCategoryTabs;
  const SearchResultLogRow = __comp.SearchResultLogRow || __deps.SearchResultLogRow;
  const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker;

  const q = (query || '').trim().toLowerCase();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(true);

  const searchCalendarOptions = React.useMemo(() => {
    const priority = new Map([['kkot', 1], ['cw', 2], ['jhair', 3]]);
    const known = [...(calendarsList || [])].sort((a, b) => {
      const ai = priority.get(a.id) || 99;
      const bi = priority.get(b.id) || 99;
      if (ai !== bi) return ai - bi;
      return (a.title || a.id).localeCompare(b.title || b.id, 'ko');
    });
    return [
      { value: 'all', label: '통합 캘린더' },
      ...known.map(cal => ({ value: cal.id, label: cal.title || cal.id }))
    ];
  }, [calendarsList]);

  const filteredCalendarsList = React.useMemo(() => (
    calFilter === 'all' ? (calendarsList || []) : (calendarsList || []).filter(cal => cal.id === calFilter)
  ), [calendarsList, calFilter]);

  // Timestamp fields (채팅/태그/메모) need epoch bounds derived from the picked YYYY-MM-DD dates;
  // date-string fields (일정/정산) compare directly since ISO YYYY-MM-DD sorts lexicographically.
  const dateRangeMs = React.useMemo(() => ({
    startMs: dateStart ? new Date(`${dateStart}T00:00:00`).getTime() : -Infinity,
    endMs: dateEnd ? new Date(`${dateEnd}T23:59:59.999`).getTime() : Infinity
  }), [dateStart, dateEnd]);

  // Every calendar's matches, tagged with which calendar they came from (results are grouped by
  // category tab now, not by calendar, so each row needs its own calendar label).
  const allMatches = React.useMemo(() => {
    if (!q) return { schedules: [], chat: [], tags: [], expenses: [], memos: [] };
    const merged = { schedules: [], chat: [], tags: [], expenses: [], memos: [] };
    filteredCalendarsList.forEach(cal => {
      const calLabel = cal.title || cal.id;
      const perCal = computeCalendarSearchMatches(cal, messagesMap?.[cal.id], memosMap?.[cal.id], q, 20);
      Object.keys(merged).forEach(key => {
        perCal[key].forEach(item => merged[key].push({ ...item, calendarId: cal.id, calendarLabel: calLabel }));
      });
    });
    if (dateStart) {
      merged.schedules = merged.schedules.filter(item => item.date >= dateStart);
      merged.expenses = merged.expenses.filter(item => item.date >= dateStart);
    }
    if (dateEnd) {
      merged.schedules = merged.schedules.filter(item => item.date <= dateEnd);
      merged.expenses = merged.expenses.filter(item => item.date <= dateEnd);
    }
    if (dateStart || dateEnd) {
      merged.chat = merged.chat.filter(item => item.timestamp >= dateRangeMs.startMs && item.timestamp <= dateRangeMs.endMs);
      merged.tags = merged.tags.filter(item => item.timestamp >= dateRangeMs.startMs && item.timestamp <= dateRangeMs.endMs);
      merged.memos = merged.memos.filter(item => item.createdAt >= dateRangeMs.startMs && item.createdAt <= dateRangeMs.endMs);
    }
    merged.schedules.sort((a, b) => b.date.localeCompare(a.date) || (b.updatedAt || 0) - (a.updatedAt || 0));
    merged.chat.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    merged.tags.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    merged.expenses.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
    merged.memos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return merged;
  }, [q, filteredCalendarsList, messagesMap, memosMap, dateStart, dateEnd, dateRangeMs]);

  const calendarCount = React.useMemo(() => {
    if (!q) return 0;
    const ids = new Set();
    Object.values(allMatches).forEach(list => list.forEach(item => ids.add(item.calendarId)));
    return ids.size;
  }, [q, allMatches]);

  const grandTotal = Object.values(allMatches).reduce((sum, list) => sum + list.length, 0);

  const tabDefs = [
    { key: 'schedules', label: '일정', count: allMatches.schedules.length },
    { key: 'chat', label: '채팅', count: allMatches.chat.length },
    { key: 'tags', label: '태그', count: allMatches.tags.length },
    { key: 'expenses', label: '정산', count: allMatches.expenses.length },
    { key: 'memos', label: '메모', count: allMatches.memos.length }
  ];
  const [activeTab, setActiveTab] = React.useState('schedules');
  React.useEffect(() => {
    const current = tabDefs.find(t => t.key === activeTab);
    if (current && current.count > 0) return;
    const firstNonEmpty = tabDefs.find(t => t.count > 0);
    if (firstNonEmpty) setActiveTab(firstNonEmpty.key);
  }, [q, allMatches]);

  return /*#__PURE__*/React.createElement("div", {
    // admin-scope is what body:has(.admin-scope){padding:0} keys off of -- this view previously
    // rendered as an early return BEFORE AdminDashboard's own admin-scope wrapper, so that CSS
    // rule (and the dark-mode-lock rules that also key off .admin-scope) never matched here no
    // matter how many times the padding fix was reapplied. This class is the actual fix.
    className: "admin-scope",
    style: { backgroundColor: 'var(--bg-primary)', minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'hidden' }
  },
    /* Chat-room-header-style header: left back arrow, centered title, symmetric right spacer */
    /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '56px', padding: '0 16px', borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 'env(safe-area-inset-top, 0px)', backgroundColor: 'var(--bg-card)', zIndex: 5
      }
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: onBack, "aria-label": "뒤로가기",
        style: PAGE_HEADER_BACK_BTN_STYLE
      }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
      /*#__PURE__*/React.createElement("div", {
        style: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }
      },
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' } }, "통합 검색결과"),
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 500, marginLeft: '10px', fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' } },
          `"${query}" · ${grandTotal}건 · 캘린더 ${calendarCount}개`
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button", onClick: () => setIsFilterPanelOpen(prev => !prev),
        "aria-label": "검색 기간/캘린더 필터", title: "검색 기간/캘린더 필터",
        style: {
          ...PAGE_HEADER_ICON_BTN_STYLE,
          color: (calFilter !== 'all' || dateStart || dateEnd) ? '#2563EB' : 'var(--text-muted)'
        }
      }, /*#__PURE__*/React.createElement(CalendarSearchIcon, { size: 22 }))
    ),

    isFilterPanelOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px',
        padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#F8FAFC'
      }
    },
      /*#__PURE__*/React.createElement("div", { style: { minWidth: '140px', flex: '1 1 140px' } },
        /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
          title: "캘린더 선택",
          value: calFilter,
          options: searchCalendarOptions,
          onSelect: onCalFilterChange,
          placeholder: "통합 캘린더",
          className: "form-select admin-calendar-picker-btn",
          style: { minHeight: '44px' }
        })
      ),
      /*#__PURE__*/React.createElement("div", { style: { minWidth: '120px', flex: '1 1 120px' } },
        /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
          value: dateStart, onChange: onDateStartChange, dateOnly: true, placeholder: "시작일"
        })
      ),
      /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-light)', fontWeight: 700 } }, "~"),
      /*#__PURE__*/React.createElement("div", { style: { minWidth: '120px', flex: '1 1 120px' } },
        /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
          value: dateEnd, onChange: onDateEndChange, dateOnly: true, placeholder: "종료일"
        })
      ),
      (calFilter !== 'all' || dateStart || dateEnd) && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => { onCalFilterChange('all'); onDateStartChange(''); onDateEndChange(''); },
        className: "btn btn-secondary",
        style: { height: '44px', boxSizing: 'border-box', padding: '0 12px', fontSize: 'var(--font-size-md)', flexShrink: 0 }
      }, "초기화")
    ),

    /*#__PURE__*/React.createElement(SearchCategoryTabs, { tabs: tabDefs, activeKey: activeTab, onSelect: setActiveTab }),

    /*#__PURE__*/React.createElement("div", { style: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' } },
      grandTotal === 0 ? /*#__PURE__*/React.createElement("div", {
        style: { textAlign: 'center', color: 'var(--text-light)', fontSize: 'var(--font-size-base)', padding: '40px 0' }
      }, "검색 결과가 없습니다.") : null,

      activeTab === 'schedules' && allMatches.schedules.map(item => /*#__PURE__*/React.createElement(SearchResultLogRow, {
        key: `${item.calendarId}_${item.date}_${item.participantId}`,
        badgeName: item.participantName, badgeColor: item.participantColor,
        calendarLabel: item.calendarLabel, timeStr: formatDateWithDayName(item.date),
        onClick: () => window.open(getAdminSearchResultTargetUrl('schedules', item), '_blank', 'noopener')
      }, highlightKeyword(item.note || '', q))),

      activeTab === 'chat' && allMatches.chat.map(msg => /*#__PURE__*/React.createElement(SearchResultLogRow, {
        key: `${msg.calendarId}_${msg.id}`,
        badgeName: msg.participantName, badgeColor: msg.participantColor,
        calendarLabel: msg.calendarLabel, timeStr: formatLogTimestamp(msg.timestamp),
        onClick: () => window.open(getAdminSearchResultTargetUrl('chat', msg), '_blank', 'noopener')
      }, highlightKeyword(msg.text || '', q))),

      activeTab === 'tags' && /*#__PURE__*/React.createElement("div", {
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(88px, 100%), 1fr))', gap: '8px' }
      }, allMatches.tags.map((entry, idx) => /*#__PURE__*/React.createElement("button", {
        key: `${entry.calendarId}_${entry.messageId}_${entry.imageIndex}_${idx}`,
        type: "button",
        title: entry.tags,
        onClick: () => window.open(getAdminSearchResultTargetUrl('tags', entry), '_blank', 'noopener'),
        style: { padding: 0, border: 0, background: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px', font: 'inherit' }
      },
        /*#__PURE__*/React.createElement("img", { src: entry.thumb, loading: 'lazy', decoding: 'async', referrerPolicy: 'no-referrer', style: { width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-sm)' } }),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 700 } }, entry.calendarLabel),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, highlightKeyword(entry.tags || '', q))
      ))),

      activeTab === 'expenses' && allMatches.expenses.map(exp => /*#__PURE__*/React.createElement(SearchResultLogRow, {
        key: `${exp.calendarId}_${exp.id}`,
        badgeName: exp.categoryName, badgeColor: exp.categoryColor,
        calendarLabel: exp.calendarLabel, timeStr: formatDateWithDayName(exp.date),
        onClick: () => window.open(getAdminSearchResultTargetUrl('expenses', exp), '_blank', 'noopener')
      }, highlightKeyword(exp.label || exp.url || '', q), ' · ', /*#__PURE__*/React.createElement("span", {
        style: { fontWeight: 800, color: exp.amount < 0 ? 'var(--status-green)' : '#DC2626' }
      }, `${exp.amount < 0 ? '+' : '-'}${Math.abs(Number(exp.amount)).toLocaleString()}원`))),

      activeTab === 'memos' && allMatches.memos.map(memo => /*#__PURE__*/React.createElement(SearchResultLogRow, {
        key: `${memo.calendarId}_${memo.id}`,
        badgeName: memo.participantName, badgeColor: memo.participantColor,
        calendarLabel: memo.calendarLabel, timeStr: formatLogTimestamp(memo.createdAt),
        onClick: () => window.open(getAdminSearchResultTargetUrl('memos', memo), '_blank', 'noopener')
      },
        memo.title && /*#__PURE__*/React.createElement("div", { style: { fontWeight: 500, marginBottom: '2px' } }, highlightKeyword(memo.title, q)),
        memo.text && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-light)' } }, highlightKeyword(memo.text.length > 100 ? memo.text.slice(0, 100) + '...' : memo.text, q))
      ))
    )
  );
}

export function AdminCreateCalendarModal({ onCreate, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [id, setId] = React.useState('cal_' + Date.now().toString().slice(-4));
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const result = await onCreate(id, title);
      if (result) setError(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 10000 }
  },
    /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      onClick: e => e.stopPropagation(),
      className: "modal-container",
      style: { maxWidth: '360px', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }
    },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' } }, "+ 새 캘린더 생성"),
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "캘린더 ID (예: kkot, cw, trip)"),
        /*#__PURE__*/React.createElement("input", {
          type: "text", className: "form-input", style: { width: '100%' }, autoFocus: true,
          value: id, onChange: e => setId(e.target.value), disabled: isSubmitting
        })
      ),
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "캘린더 제목"),
        /*#__PURE__*/React.createElement("input", {
          type: "text", className: "form-input", style: { width: '100%' }, placeholder: `${id} 모임 캘린더`,
          value: title, onChange: e => setTitle(e.target.value), disabled: isSubmitting
        })
      ),
      error && /*#__PURE__*/React.createElement("div", { style: { color: '#DC2626', fontSize: 'var(--font-size-md)' } }, error),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-secondary", style: { flex: 1, height: '44px' },
          onClick: onClose, disabled: isSubmitting
        }, "취소"),
        /*#__PURE__*/React.createElement("button", {
          type: "submit", className: "btn btn-primary", style: { flex: 1, height: '44px' },
          disabled: isSubmitting
        }, isSubmitting ? '생성 중...' : '생성')
      )
    )
  );
}

export function AdminRestorePhraseModal({ onConfirm, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [phrase, setPhrase] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onConfirm(phrase);
    if (result) setError(result);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 10000 }
  },
    /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      onClick: e => e.stopPropagation(),
      className: "modal-container",
      style: { maxWidth: '380px', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }
    },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' } }, "운영 데이터 복구 확인"),
      /*#__PURE__*/React.createElement("p", { style: { fontSize: 'var(--font-size-base)', color: '#475569', lineHeight: '1.5' } },
        '백업 JSON 복구는 현재 운영 데이터를 교체합니다. 계속하려면 아래에 "운영 데이터 복구"를 정확히 입력하세요.'
      ),
      /*#__PURE__*/React.createElement("input", {
        type: "text", className: "form-input", style: { width: '100%' }, autoFocus: true,
        value: phrase, onChange: e => setPhrase(e.target.value), placeholder: "운영 데이터 복구"
      }),
      error && /*#__PURE__*/React.createElement("div", { style: { color: '#DC2626', fontSize: 'var(--font-size-md)' } }, error),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-secondary", style: { flex: 1, height: '44px' }, onClick: onClose
        }, "취소"),
        /*#__PURE__*/React.createElement("button", {
          type: "submit", className: "btn btn-danger", style: { flex: 1, height: '44px' }
        }, "복구 진행")
      )
    )
  );
}

export function AdminUnifiedSearchModal({ onClose, onSearch }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || (function Shell(p) { return React.createElement('div', p, p.children); });
  const SearchIcon = __comp.SearchIcon || __deps.SearchIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;

  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '440px' }
  },
    /*#__PURE__*/React.createElement("div", { className: "modal-header" },
      /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement(SearchIcon, null), "통합검색"
      ),
      /*#__PURE__*/React.createElement("button", {
        onClick: onClose,
        style: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))
    ),
    /*#__PURE__*/React.createElement("div", { className: "modal-body" },
      /*#__PURE__*/React.createElement("p", { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', margin: '0 0 10px' } },
        "모든 캘린더의 일정, 대화, 투표, 사진 태그를 한번에 검색합니다."
      ),
      /*#__PURE__*/React.createElement("input", {
        ref: inputRef,
        type: "text",
        className: "form-input",
        style: { width: '100%' },
        placeholder: "검색어를 입력하세요...",
        value: query,
        onChange: e => setQuery(e.target.value),
        onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }
      }),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        style: { width: '100%', marginTop: '10px' },
        disabled: !query.trim(),
        onClick: submit
      }, "검색")
    )
  ));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    AdminModal: AdminModal,
    AdminUnifiedSearchResultsView: AdminUnifiedSearchResultsView,
    AdminCreateCalendarModal: AdminCreateCalendarModal,
    AdminRestorePhraseModal: AdminRestorePhraseModal,
    AdminUnifiedSearchModal: AdminUnifiedSearchModal,
  });
}
