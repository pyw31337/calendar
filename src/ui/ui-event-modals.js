/**
 * Anniversary / Settlement / Poll modals (P4-18)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_CALENDAR_DATA = window.GATHER_APP_CALENDAR_DATA || {};
const GATHER_APP_CHAT_DATA = window.GATHER_APP_CHAT_DATA || {};
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};
const GATHER_APP_CONFIG = window.GATHER_APP_CONFIG || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getActiveAvailabilities(calendar) {
  const f = __gatherUiDeps().getActiveAvailabilities || GATHER_APP_UTILS.getActiveAvailabilities;
  return typeof f === 'function' ? f(calendar) : [];
}
function getActiveParticipants(calendar) {
  const f = __gatherUiDeps().getActiveParticipants || GATHER_APP_UTILS.getActiveParticipants;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPolls(calendar) {
  const f = __gatherUiDeps().getCalendarPolls || GATHER_APP_UTILS.getCalendarPolls;
  return typeof f === 'function' ? f(calendar) : [];
}
function getCalendarPlaces(calendar) {
  const f = __gatherUiDeps().getCalendarPlaces || GATHER_APP_UTILS.getCalendarPlaces;
  return typeof f === 'function' ? f(calendar) : [];
}
function useChatSendGuard(onSend, canSend) {
  const f = __gatherUiDeps().useChatSendGuard;
  return typeof f === 'function' ? f(onSend, canSend) : onSend;
}
function computeKoreanHolidaysForYear(year) {
  const f = __gatherUiDeps().computeKoreanHolidaysForYear;
  return typeof f === 'function' ? f(year) : [];
}
function getFooterFamilyLinks() {
  return __gatherUiDeps().FOOTER_FAMILY_LINKS || [];
}


export function AnniversaryModal({
  calendar,
  anniversaries,
  onClose,
  showToast,
  onRequestConfirm,
  onBulkRegister,
  isDarkTheme
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const DeadlineDateTimePicker = __comp.DeadlineDateTimePicker || __deps.DeadlineDateTimePicker;
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer;
  const SegmentedToggle = __comp.SegmentedToggle || __deps.SegmentedToggle;
  const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const getActiveParticipants = __deps.getActiveParticipants;

  const [activeTab, setActiveTab] = React.useState('list'); // 'list', 'add', 'bulk'
  const [editingId, setEditingId] = React.useState(null); // null when registering a new anniversary
  
  // Add Anniversary form states
  const [newTitle, setNewTitle] = React.useState('');
  const [newType, setNewType] = React.useState('yearly'); // 'yearly', 'dday'
  // Yearly options
  const [yearlyMonth, setYearlyMonth] = React.useState(1);
  const [yearlyDay, setYearlyDay] = React.useState(1);
  const [isLunar, setIsLunar] = React.useState(false);
  const [isLeap, setIsLeap] = React.useState(false);
  // D-Day options
  const [targetDate, setTargetDate] = React.useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [ddayMode, setDdayMode] = React.useState('countdown'); // 'countdown', 'milestone'

  // Migrated bulk register availability states
  const [bulkParticipantId, setBulkParticipantId] = React.useState('');
  const [bulkWeekday, setBulkWeekday] = React.useState(1);
  const [bulkNote, setBulkNote] = React.useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = React.useState(false);
  const [bulkStartDate, setBulkStartDate] = React.useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [bulkEndDate, setBulkEndDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 56); // 8 weeks ahead
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const participants = getActiveParticipants(calendar);

  // Years option range
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleEditClick = (ann) => {
    setEditingId(ann.id);
    setNewTitle(ann.title || '');
    setNewType(ann.type || 'yearly');
    if (ann.type === 'yearly') {
      const parts = (ann.date || '01-01').split('-');
      setYearlyMonth(Number(parts[0]) || 1);
      setYearlyDay(Number(parts[1]) || 1);
      setIsLunar(!!ann.isLunar);
      setIsLeap(!!ann.isLeap);
    } else {
      setTargetDate(ann.targetDate || '');
      setDdayMode(ann.isCountDown ? 'countdown' : 'milestone');
    }
    setActiveTab('add');
  };

  const handleSaveAnniversary = async () => {
    if (!newTitle.trim()) {
      showToast('기념일 제목을 입력해 주세요.', 'error');
      return;
    }

    try {
      const stamp = Date.now();
      const anniversaryId = editingId || ('anniversary_' + stamp + '_' + Math.random().toString(36).slice(2, 8));
      const calendarId = calendar.id;

      const oldAnn = anniversaries.find(a => a.id === editingId);
      const createdAt = oldAnn ? (oldAnn.createdAt || stamp) : stamp;

      let annData = {
        id: anniversaryId,
        calendarId,
        title: newTitle.trim(),
        type: newType,
        createdAt: createdAt,
        updatedAt: stamp
      };

      if (newType === 'yearly') {
        annData.date = `${String(yearlyMonth).padStart(2, '0')}-${String(yearlyDay).padStart(2, '0')}`;
        annData.isLunar = isLunar;
        annData.isLeap = isLunar ? isLeap : false;
      } else {
        annData.targetDate = targetDate;
        annData.isCountDown = ddayMode === 'countdown';
      }

      await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('anniversaries').doc(anniversaryId).set(annData);
      showToast(editingId ? '기념일이 수정되었습니다.' : '기념일이 등록되었습니다.', 'success');
      
      // Reset form
      setNewTitle('');
      setIsLunar(false);
      setIsLeap(false);
      setEditingId(null);
      setActiveTab('list');
    } catch (err) {
      console.error('Anniversary save error:', err);
      showToast('기념일 저장 실패', 'error');
    }
  };

  const handleDeleteAnniversary = (ann) => {
    onRequestConfirm('기념일 삭제', `"${ann.title}" 기념일을 삭제하시겠습니까?`, async () => {
      try {
        const calendarId = calendar.id;
        await firebaseDb.collection('calendars').doc('cal_' + calendarId).collection('anniversaries').doc(ann.id).delete();
        showToast('기념일이 삭제되었습니다.', 'success');
        if (editingId === ann.id) {
          setEditingId(null);
          setNewTitle('');
        }
      } catch (err) {
        console.error('Anniversary delete error:', err);
        showToast('기념일 삭제 실패', 'error');
      }
    });
  };

  const handleApplyBulkRegister = async () => {
    if (isBulkSubmitting || !onBulkRegister) return;
    if (!bulkParticipantId) {
      showToast('참여자를 선택해 주세요.', 'error');
      return;
    }
    const start = new Date(`${bulkStartDate}T00:00:00`);
    const end = new Date(`${bulkEndDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      showToast('시작일자가 종료일자보다 늦습니다.', 'error');
      return;
    }

    const dates = [];
    const cursor = new Date(start);
    const maxLimit = 104; // Hard cap
    while (cursor <= end && dates.length < maxLimit) {
      if (cursor.getDay() === bulkWeekday) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (dates.length === 0) {
      showToast('선택한 기간 동안 해당 요일이 존재하지 않습니다.', 'error');
      return;
    }

    onRequestConfirm(
      '일괄 등록 확인',
      `총 ${dates.length}개의 요일 일정을 일괄 등록하시겠습니까?`,
      async () => {
        setIsBulkSubmitting(true);
        try {
          const successCount = await onBulkRegister(bulkParticipantId, dates, bulkNote);
          showToast(`${successCount}개의 반복 일정이 등록되었습니다.`, 'success');
          setBulkNote('');
          setActiveTab('list');
          onClose();
        } catch (err) {
          console.error('Bulk register error:', err);
          showToast('일괄 등록에 실패했습니다.', 'error');
        } finally {
          setIsBulkSubmitting(false);
        }
      }
    );
  };

  const getYearlyDisplay = (ann) => {
    const parts = (ann.date || '01-01').split('-');
    const m = Number(parts[0]) || 1;
    const d = Number(parts[1]) || 1;
    const label = `${m}월 ${d}일`;
    if (ann.isLunar) {
      const typeStr = ann.isLeap ? '(윤달 음력)' : '(음력)';
      // Calc dynamic solar equivalent date for current year
      const curYear = new Date().getFullYear();
      const solarDate = getSolarFromLunar(curYear, m, d, !!ann.isLeap);
      const solarLabel = solarDate ? ` → 올해 ${Number(solarDate.slice(5, 7))}/${Number(solarDate.slice(8, 10))}` : '';
      return `매년 ${label} ${typeStr}${solarLabel}`;
    }
    return `매년 ${label} (양력)`;
  };

  const getDdayDisplay = (ann) => {
    if (!ann.targetDate) return '';
    const diff = calculateDday(ann.targetDate);
    const ddayLabel = diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff) + 1}`;
    
    if (ann.isCountDown) {
      return `${ann.targetDate} (${ddayLabel})`;
    } else {
      // Milestone auto progress label
      const passed = Math.abs(diff) + 1;
      return `${ann.targetDate} 기준 ${passed}일째`;
    }
  };

  const portalContent = /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    style: { maxWidth: '440px', width: '90%', animation: 'modalFadeIn 0.2s ease', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' },
    onClick: e => e.stopPropagation()
  },
    /* Modal Header */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }
    },
      /* Title */
      /*#__PURE__*/React.createElement("span", {
        style: { fontSize: '0.96rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }
      }, /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2"
      }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /*#__PURE__*/React.createElement("polyline", { points: "12 6 12 12 16 14" })), "기념일 & 반복 일정 설정"),
      
      /* Close button */
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClose,
        style: { width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'var(--border-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 16 }))
    ),

    /* Modal Navigation Tabs */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--border-subtle)' }
    },
      /* Tab list */
      [['list', '기념일 목록'], ['add', '기념일 등록'], ['bulk', '반복 일정']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
        key: id,
        type: "button",
        onClick: () => {
          setActiveTab(id);
          if (id === 'add') {
            setEditingId(null);
            setNewTitle('');
            setIsLunar(false);
            setIsLeap(false);
            setNewType('yearly');
          }
        },
        style: {
          padding: '12px 6px',
          border: 'none',
          background: 'none',
          fontSize: '0.82rem',
          fontWeight: activeTab === id ? '900' : '600',
          color: activeTab === id ? '#3B82F6' : 'var(--text-muted)',
          borderBottom: activeTab === id ? '2px solid #3B82F6' : 'none',
          cursor: 'pointer'
        }
      }, label))
    ),

    /* Modal Scrollable Body */
    /*#__PURE__*/React.createElement("div", {
      style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto' }
    },
      /* TAB 1: Anniversaries List */
      activeTab === 'list' && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '10px' }
      },
        anniversaries.length === 0 ? 
          /*#__PURE__*/React.createElement("div", {
            style: { padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }
          }, "등록된 기념일이 없습니다. 매년 돌아오는 생일이나 D-Day를 등록해 보세요. 🎂")
        :
          anniversaries.map(ann => /*#__PURE__*/React.createElement("div", {
            key: ann.id,
            onClick: () => handleEditClick(ann),
            style: {
              padding: '10px 12px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              cursor: 'pointer'
            }
          },
            /* Left: text details */
            /*#__PURE__*/React.createElement("div", { style: { minWidth: 0 } },
              /* Title & Badge */
              /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' } },
                /* Icon */
                /*#__PURE__*/React.createElement("span", null, ann.type === 'yearly' ? '🎂' : '🎁'),
                /* Title */
                /*#__PURE__*/React.createElement("span", { style: { fontSize: '0.84rem', fontWeight: 'bold', color: 'var(--text-main)' } }, ann.title),
                /* Type Badge */
                /*#__PURE__*/React.createElement("span", {
                  style: {
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: ann.type === 'yearly' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                    color: ann.type === 'yearly' ? '#EF4444' : '#3B82F6'
                  }
                }, ann.type === 'yearly' ? '매년 반복' : '디데이')
              ),
              /* Details descriptor */
              /*#__PURE__*/React.createElement("div", {
                style: { fontSize: '0.74rem', color: 'var(--text-muted)' }
              }, ann.type === 'yearly' ? getYearlyDisplay(ann) : getDdayDisplay(ann))
            ),
            /* Right: delete button */
            /*#__PURE__*/React.createElement("button", {
              type: "button",
              className: "btn btn-danger",
              onClick: (e) => {
                e.stopPropagation();
                handleDeleteAnniversary(ann);
              },
              style: { width: '28px', height: '28px', padding: 0, flexShrink: 0 }
            }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }))
          ))
      ),

      /* TAB 2: Add Anniversary Form */
      activeTab === 'add' && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '12px' }
      },
        /* Title input */
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "기념일 이름"),
          /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-input",
            style: { width: '100%' },
            placeholder: "예: 홍길동 생일, 커플 1주년",
            value: newTitle,
            onChange: e => setNewTitle(e.target.value),
            maxLength: 50
          })
        ),

        /* Type switcher */
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "종류"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
            [['yearly', '매년 특정일자 반복 (생일 등)'], ['dday', '기준일 D-Day (커플, 시험 등)']].map(([typeVal, label]) => /*#__PURE__*/React.createElement("label", {
              key: typeVal,
              style: {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                backgroundColor: newType === typeVal ? 'rgba(59,130,246,0.06)' : 'var(--bg-primary)',
                border: '1px solid ' + (newType === typeVal ? '#3B82F6' : 'var(--border-subtle)'),
                borderRadius: '8px',
                fontSize: '0.76rem',
                cursor: 'pointer',
                fontWeight: newType === typeVal ? 'bold' : 'normal'
              }
            },
              /*#__PURE__*/React.createElement("input", {
                type: "radio",
                name: "annType",
                value: typeVal,
                checked: newType === typeVal,
                onChange: () => setNewType(typeVal),
                style: { margin: 0 }
              }),
              label
            ))
          )
        ),

        /* Cond 1: Yearly details fields */
        newType === 'yearly' && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }
        },
          /* Month / Day Selectors Row */
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
            /* Month */
            /*#__PURE__*/React.createElement("div", { style: { flex: 1 } },
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' } }, "월"),
              /*#__PURE__*/React.createElement("select", {
                className: "form-input",
                value: yearlyMonth,
                onChange: e => setYearlyMonth(Number(e.target.value)),
                style: { width: '100%' }
              }, months.map(m => /*#__PURE__*/React.createElement("option", { key: m, value: m }, `${m}월`)))
            ),
            /* Day */
            /*#__PURE__*/React.createElement("div", { style: { flex: 1 } },
              /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' } }, "일"),
              /*#__PURE__*/React.createElement("select", {
                className: "form-input",
                value: yearlyDay,
                onChange: e => setYearlyDay(Number(e.target.value)),
                style: { width: '100%' }
              }, days.map(d => /*#__PURE__*/React.createElement("option", { key: d, value: d }, `${d}일`)))
            )
          ),
          /* Lunar / Leap month settings */
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', flexWrap: 'wrap' } },
            /* Solar/lunar toggle -- same SegmentedToggle used for 방문/예정 (PlaceRegisterModal) rather
               than a native checkbox, so this is an exclusive A/B choice styled consistently with the
               rest of the app instead of the odd-one-out checkbox it used to be. */
            /*#__PURE__*/React.createElement(SegmentedToggle, {
              ariaLabel: "양력/음력 전환",
              value: isLunar ? 'lunar' : 'solar',
              onChange: v => setIsLunar(v === 'lunar'),
              options: [{ value: 'solar', label: '양력' }, { value: 'lunar', label: '음력' }]
            }),
            /* Leap month toggle (shows only if Lunar) -- standalone on/off button matching
               SegmentedToggle's own per-segment sizing/style (padding, font, border-radius) rather
               than a native checkbox, since this one has no second option to pair it with. */
            isLunar && /*#__PURE__*/React.createElement("button", {
              type: "button",
              role: "switch",
              "aria-checked": isLeap,
              onClick: () => setIsLeap(!isLeap),
              style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                padding: '12px 16px', border: '1px solid var(--border-subtle)', cursor: 'pointer',
                borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: isLeap ? 900 : 500,
                whiteSpace: 'nowrap', backgroundColor: isLeap ? 'var(--accent-primary)' : 'transparent',
                color: isLeap ? '#FFFFFF' : 'var(--text-muted)'
              }
            }, "윤달")
          )
        ),

        /* Cond 2: D-Day details fields */
        newType === 'dday' && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }
        },
          /* Target date picker */
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' } }, "시작일자 / 기준일자"),
            /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
              value: `${targetDate}T00:00`,
              onChange: v => setTargetDate(v.slice(0, 10))
            })
          ),
          /* Mode Selector Radio */
          /*#__PURE__*/React.createElement("div", null,
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' } }, "디데이 표기방식"),
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px' } },
              [['countdown', 'D-Day 카운트다운 (D-100)'], ['milestone', '날짜수 자동경과 (100일째)']].map(([modeVal, modeLabel]) => /*#__PURE__*/React.createElement("label", {
                key: modeVal,
                style: {
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }
              },
                /*#__PURE__*/React.createElement("input", {
                  type: "radio",
                  name: "ddayMode",
                  value: modeVal,
                  checked: ddayMode === modeVal,
                  onChange: () => setDdayMode(modeVal)
                }),
                modeLabel
              ))
            )
          )
        ),

        /* Save Button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn btn-primary",
          onClick: handleSaveAnniversary,
          style: { width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.82rem', marginTop: '6px' }
        }, editingId ? "기념일 수정 완료" : "기념일 등록")
      ),

      /* TAB 3: Bulk Repeating Schedule Register */
      activeTab === 'bulk' && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '12px' }
      },
        /* User instructions */
        /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.45', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' } },
          "매주 특정 요일에 반복되는 사용자의 스케줄을 한 번에 일괄 등록합니다."
        ),

        /* Participant & Weekday Select row */
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          /* Participant picker */
          /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
            title: "참여자 선택",
            placeholder: "참여자 선택",
            value: bulkParticipantId,
            disabled: isBulkSubmitting,
            onSelect: setBulkParticipantId,
            options: participants.map(p => ({ value: p.id, label: p.name })),
            style: { flex: '1 1 140px' }
          }),
          /* Weekday picker */
          /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
            title: "요일 선택",
            placeholder: "요일 선택",
            value: bulkWeekday,
            disabled: isBulkSubmitting,
            onSelect: v => setBulkWeekday(Number(v)),
            options: ['일', '월', '화', '수', '목', '금', '토'].map((label, idx) => ({ value: idx, label: `매주 ${label}요일` })),
            style: { flex: '1 1 100px' }
          })
        ),

        /* Start / End dates selectors */
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          /* Start */
          /*#__PURE__*/React.createElement("div", { style: { flex: '1 1 130px' } },
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "시작일자"),
            /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
              value: `${bulkStartDate}T00:00`,
              disabled: isBulkSubmitting,
              onChange: v => setBulkStartDate(v.slice(0, 10))
            })
          ),
          /* End */
          /*#__PURE__*/React.createElement("div", { style: { flex: '1 1 130px' } },
            /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "종료일자"),
            /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
              value: `${bulkEndDate}T00:00`,
              disabled: isBulkSubmitting,
              onChange: v => setBulkEndDate(v.slice(0, 10))
            })
          )
        ),

        /* Bulk Note */
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "반복 일정 메모 (선택)",
          maxLength: 120,
          value: bulkNote,
          onChange: e => setBulkNote(e.target.value),
          disabled: isBulkSubmitting,
          style: { width: '100%', fontSize: '0.8rem' }
        }),

        /* Apply button */
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "btn btn-primary",
          onClick: handleApplyBulkRegister,
          disabled: isBulkSubmitting,
          style: { width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.82rem', marginTop: '4px' }
        }, isBulkSubmitting ? "등록 진행 중..." : "반복 일정 일괄 등록")
      )
    )
  ));

  return ReactDOM.createPortal(portalContent, document.body);
}

export function SettlementSummaryModal({ calendar, onBack, onSelectDate }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const BackArrowIcon = __comp.BackArrowIcon || __deps.BackArrowIcon;
  const BanknoteArrowDownIcon = __comp.BanknoteArrowDownIcon || __deps.BanknoteArrowDownIcon;
  const BanknoteArrowUpIcon = __comp.BanknoteArrowUpIcon || __deps.BanknoteArrowUpIcon;
  const CalendarCheckIcon = __comp.CalendarCheckIcon || __deps.CalendarCheckIcon;
  const ChartBarIcon = __comp.ChartBarIcon || __deps.ChartBarIcon;
  const PiggyBankIcon = __comp.PiggyBankIcon || __deps.PiggyBankIcon;
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer;
  const SectionToggleButton = __comp.SectionToggleButton || __deps.SectionToggleButton;
  const SegmentedToggle = __comp.SegmentedToggle || __deps.SegmentedToggle;
  const ShareIcon = __comp.ShareIcon || __deps.ShareIcon;
  const sanitizeText = __deps.sanitizeText;
  const extractFirstUrl = __deps.extractFirstUrl;
  const formatChatHeaderTitle = __deps.formatChatHeaderTitle;

  const { isHeaderVisible, onScroll: handleSettlementScroll } = useScrollHideHeader();
  const [activeTab, setActiveTab] = React.useState('total');
  const [collapsedDailyRows, setCollapsedDailyRows] = React.useState({});
  const categories = getExpenseCategories(calendar);
  const baseBudget = Number.isFinite(Number(calendar?.settlementBaseBudget)) ? Math.max(0, Math.round(Number(calendar.settlementBaseBudget))) : 0;
  // Income entries have no meaningful expense category of their own (their categoryId is
  // whatever was selected/defaulted at entry time, usually '기타') -- badge them as 수입 instead
  // of showing a misleading expense category, and keep them out of "카테고리별 지출" entirely
  // since that section is specifically about expense breakdown, not income. INCOME_EXPENSE_CATEGORY
  // is the shared module-level constant (see isExpenseIncomeEntry/getDisplayExpenseCategory).
  const getDisplayCategory = item => (item.isIncome ? INCOME_EXPENSE_CATEGORY : item.category);
  const getExpenseUrl = expense => sanitizeText(expense?.url || extractFirstUrl(expense?.label || ''), 220);
  const getExpenseLabel = expense => {
    const label = sanitizeText(expense?.label || '', 120);
    const url = getExpenseUrl(expense);
    return url ? sanitizeText(removeFirstUrl(label), 120) : label;
  };

  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth()); // 0-indexed
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = React.useState(today.getMonth());
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const handleOpenPicker = () => {
    setPickerYear(year);
    setPickerMonth(month);
    setIsPickerOpen(true);
  };
  const onPrevMonth = () => {
    if (month === 0) {
      setYear(y => y - 1);
      setMonth(11);
    } else {
      setMonth(m => m - 1);
    }
  };
  const onNextMonth = () => {
    if (month === 11) {
      setYear(y => y + 1);
      setMonth(0);
    } else {
      setMonth(m => m + 1);
    }
  };
  const onToday = () => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const handlePickerApply = () => {
    setYear(pickerYear);
    setMonth(pickerMonth);
    setIsPickerOpen(false);
  };
  const toggleDailyRow = date => {
    setCollapsedDailyRows(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const allTimeRows = getConfirmedMeetings(calendar).slice().sort((a, b) => b.date.localeCompare(a.date))
    .map(meeting => {
      const items = (Array.isArray(meeting.expenses) ? meeting.expenses : [])
        .filter(expense => Number.isFinite(Number(expense.amount)) && Number(expense.amount) !== 0)
        .map(expense => {
          const amount = Number(expense.amount || 0);
          const isIncome = isExpenseIncomeEntry(expense);
          return {
            ...expense,
            amount,
            isIncome,
            category: getExpenseCategory(calendar, expense.categoryId),
            label: getExpenseLabel(expense) || '정산 항목',
            url: getExpenseUrl(expense)
          };
        });
      const expenseTotal = items.filter(item => !item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
      const incomeTotal = items.filter(item => item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
      return { meeting, items, expenseTotal, incomeTotal, net: incomeTotal - expenseTotal };
    })
    .filter(row => row.items.length > 0);
  const allTimeItems = allTimeRows.flatMap(row => row.items.map(item => ({ ...item, date: row.meeting.date, meetingNote: row.meeting.note || '' })));
  const allTimeIncome = baseBudget + allTimeItems.filter(item => item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const allTimeExpense = allTimeItems.filter(item => !item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const overallBalance = allTimeIncome - allTimeExpense;

  const targetPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const rows = getConfirmedMeetings(calendar).slice().sort((a, b) => b.date.localeCompare(a.date))
    .filter(meeting => activeTab === 'total' || meeting.date.startsWith(targetPrefix))
    .map(meeting => {
      const items = (Array.isArray(meeting.expenses) ? meeting.expenses : [])
        .filter(expense => Number.isFinite(Number(expense.amount)) && Number(expense.amount) !== 0)
        .sort((a, b) => {
          const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.POSITIVE_INFINITY;
          const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.POSITIVE_INFINITY;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return (a.createdAt || 0) - (b.createdAt || 0);
        })
        .map(expense => {
          const amount = Number(expense.amount || 0);
          const isIncome = isExpenseIncomeEntry(expense);
          return {
            ...expense,
            amount,
            isIncome,
            category: getExpenseCategory(calendar, expense.categoryId),
            label: getExpenseLabel(expense) || '정산 항목',
            url: getExpenseUrl(expense)
          };
        });
      const expenseTotal = items.filter(item => !item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
      const incomeTotal = items.filter(item => item.isIncome).reduce((sum, item) => sum + Math.abs(item.amount), 0);
      return { meeting, items, expenseTotal, incomeTotal, net: incomeTotal - expenseTotal };
    })
    .filter(row => row.items.length > 0);

  const allItems = rows.flatMap(row => row.items.map(item => ({ ...item, date: row.meeting.date, meetingNote: row.meeting.note || '' })));
  const incomeItems = allItems.filter(item => item.isIncome);
  const expenseItems = allItems.filter(item => !item.isIncome);

  const displayIncome = activeTab === 'total'
    ? allTimeIncome
    : incomeItems.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const displayExpense = activeTab === 'total'
    ? allTimeExpense
    : expenseItems.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  // 일자별보기(선택된 월)일 때는 그 달의 수입-지출 순액을, 누적보기일 때는 baseBudget까지 포함한
  // 전체 기간 잔액을 보여준다 -- displayIncome/displayExpense가 이미 탭에 따라 그 값들을 계산해
  // 두므로 둘의 차만 내면 두 경우 모두 올바른 값이 나온다.
  const displayBalance = activeTab === 'total' ? overallBalance : (displayIncome - displayExpense);

  const allTimeExpenseItems = allTimeItems.filter(item => !item.isIncome);
  const categoryTotals = categories.map(category => ({
    category,
    total: allTimeExpenseItems.filter(item => item.category.id === category.id).reduce((sum, item) => sum + Math.abs(item.amount), 0),
    count: allTimeExpenseItems.filter(item => item.category.id === category.id).length
  })).filter(item => item.total > 0 || item.count > 0);

  const monthLabelPrefix = `${month + 1}월`;
  const metricCards = [
    { label: activeTab === 'total' ? '총 수입' : `${monthLabelPrefix} 수입`, value: displayIncome, color: '#16A34A', icon: React.createElement(BanknoteArrowUpIcon, { size: 16 }) },
    { label: activeTab === 'total' ? '총 지출' : `${monthLabelPrefix} 지출`, value: displayExpense, color: '#DC2626', icon: React.createElement(BanknoteArrowDownIcon, { size: 16 }) },
    { label: activeTab === 'total' ? '현재 잔액' : `${monthLabelPrefix} 잔액`, value: displayBalance, color: 'var(--text-main)', icon: React.createElement(PiggyBankIcon, { size: 16 }) }
  ];

  // Shareable result card -- rendered client-side onto an offscreen canvas so it can be saved
  // as a plain image and pasted into KakaoTalk/문자 without anyone needing app access. Shown in
  // an overlay (not auto-downloaded) since a direct file download is unreliable on iOS Safari;
  // long-pressing the image to save works everywhere, and the download link below it covers
  // desktop/Android.
  const [shareImageUrl, setShareImageUrl] = React.useState(null);
  const periodLabel = activeTab === 'total' ? '전체 기간' : `${year}년 ${month + 1}월`;
  const handleGenerateShareImage = () => {
    const canvas = document.createElement('canvas');
    const W = 720, H = 960;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, W, 160);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 22px sans-serif';
    ctx.fillText(calendar?.title || '모여라 캘린더', 40, 60);
    ctx.font = '900 34px sans-serif';
    ctx.fillText('회비 정산 결과', 40, 105);
    ctx.font = '500 18px sans-serif';
    ctx.fillText(periodLabel, 40, 138);

    const rowsStats = [
      { label: activeTab === 'total' ? '총 수입' : `${monthLabelPrefix} 수입`, value: displayIncome, color: '#16A34A' },
      { label: activeTab === 'total' ? '총 지출' : `${monthLabelPrefix} 지출`, value: displayExpense, color: '#DC2626' },
      { label: activeTab === 'total' ? '현재 잔액' : `${monthLabelPrefix} 잔액`, value: displayBalance, color: '#0F172A' }
    ];
    let y = 230;
    rowsStats.forEach(stat => {
      ctx.fillStyle = '#64748B';
      ctx.font = '600 18px sans-serif';
      ctx.fillText(stat.label, 40, y);
      ctx.fillStyle = stat.color;
      ctx.font = '900 30px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${stat.value < 0 ? '-' : ''}${Math.abs(stat.value).toLocaleString()}원`, W - 40, y + 2);
      ctx.textAlign = 'left';
      y += 56;
    });

    y += 16;
    ctx.strokeStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(W - 40, y);
    ctx.stroke();
    y += 40;

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 18px sans-serif';
    ctx.fillText('카테고리별 지출', 40, y);
    y += 30;

    const topCategories = categoryTotals.slice().sort((a, b) => b.total - a.total).slice(0, 6);
    const maxCategoryTotal = Math.max(1, ...topCategories.map(c => c.total));
    topCategories.forEach(item => {
      ctx.fillStyle = '#334155';
      ctx.font = '600 15px sans-serif';
      ctx.fillText(item.category.name, 40, y);
      ctx.textAlign = 'right';
      ctx.fillText(`${item.total.toLocaleString()}원`, W - 40, y);
      ctx.textAlign = 'left';
      y += 10;
      const barW = Math.max(6, Math.round((item.total / maxCategoryTotal) * (W - 80)));
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(40, y, W - 80, 8);
      ctx.fillStyle = item.category.color || '#6366F1';
      ctx.fillRect(40, y, barW, 8);
      y += 34;
    });
    if (topCategories.length === 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 15px sans-serif';
      ctx.fillText('등록된 지출 항목이 없습니다.', 40, y);
      y += 34;
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 13px sans-serif';
    ctx.fillText(`모여라 캘린더 · ${new Date().toLocaleDateString('ko-KR')} 생성`, 40, H - 30);

    setShareImageUrl(canvas.toDataURL('image/png'));
  };

  const categoryBadge = category => /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 9px',
      borderRadius: '999px',
      backgroundColor: `${category.color}18`,
      color: category.color,
      fontSize: '0.68rem',
      fontWeight: 900,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: category.color }
  }), category.name);

  const renderItemRow = (item, showDate = false) => /*#__PURE__*/React.createElement("div", {
    key: item.id || `${item.date}_${item.createdAt}_${item.amount}`,
    onClick: () => onSelectDate && onSelectDate(item.date),
    style: { display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px 12px', border: '0', borderRadius: '12px', backgroundColor: 'var(--bg-card)', cursor: onSelectDate ? 'pointer' : 'default' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }
  }, categoryBadge(getDisplayCategory(item)), showDate && /*#__PURE__*/React.createElement("span", { className: "registered-at-text" }, formatDateWithDayName(item.date))), /*#__PURE__*/React.createElement("strong", {
    style: { fontSize: '0.9rem', color: item.isIncome ? '#16A34A' : '#DC2626', whiteSpace: 'nowrap' }
  }, item.isIncome ? '+' : '-', Math.abs(item.amount).toLocaleString(), "원")), /*#__PURE__*/React.createElement("span", {
    style: { fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 500, overflowWrap: 'anywhere' }
  }, item.label), item.url && /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: item.url,
    style: {
      alignSelf: 'flex-start',
      border: 0,
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.72rem',
      fontWeight: 400,
      backgroundColor: 'var(--border-subtle)',
      color: 'var(--text-muted)',
      wordBreak: 'break-all',
      maxWidth: '100%',
      textAlign: 'left'
    },
    onClick: e => { e.stopPropagation(); window.open(item.url, '_blank', 'noopener,noreferrer'); }
  }, item.url));

  const emptyContent = /*#__PURE__*/React.createElement("div", {
    style: { padding: '30px 12px', color: '#94A3B8', fontSize: '0.88rem', textAlign: 'center' }
  }, "등록된 정산 내역이 없습니다.");

  const totalContent = /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '12px' }
  }, /*#__PURE__*/React.createElement("section", {
    style: { border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '12px', background: 'var(--bg-primary)' }
  }, /*#__PURE__*/React.createElement("h4", {
    style: { margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }
  }, /*#__PURE__*/React.createElement(ChartBarIcon, null), "카테고리별 지출"), categoryTotals.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: { color: '#94A3B8', fontSize: '0.82rem' }
  }, "아직 지출 항목이 없습니다.") : categoryTotals.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.category.id,
    style: { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '8px', alignItems: 'center', marginTop: '8px' }
  }, categoryBadge(item.category), /*#__PURE__*/React.createElement("div", {
    style: { height: '8px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { width: `${allTimeExpense ? Math.max(4, item.total / allTimeExpense * 100) : 0}%`, height: '100%', background: item.category.color, borderRadius: '999px' }
  })), /*#__PURE__*/React.createElement("strong", {
    style: { fontSize: '0.8rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }
  }, item.total.toLocaleString(), "원")))), /*#__PURE__*/React.createElement("section", {
    style: { display: 'flex', flexDirection: 'column', gap: '8px' }
  }, baseBudget > 0 && /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '10px', alignItems: 'center', padding: '10px 12px', border: '1px solid #BBF7D0', borderRadius: '12px', background: '#F0FDF4' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '4px' }
  }, /*#__PURE__*/React.createElement("strong", {
    style: { color: '#15803D', fontSize: '0.86rem' }
  }, "기초 예산"), /*#__PURE__*/React.createElement("span", {
    className: "registered-at-text"
  }, "어드민에서 설정한 누적 잔액")), /*#__PURE__*/React.createElement("strong", {
    style: { color: '#16A34A', whiteSpace: 'nowrap' }
  }, "+", baseBudget.toLocaleString(), "원")), allTimeItems.map(item => renderItemRow(item, true))));

  const monthEmptyContent = /*#__PURE__*/React.createElement("div", {
    style: { padding: '40px 12px', color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center' }
  }, `${year}년 ${month + 1}월 정산 내역이 없습니다.`);

  const dailyContent = rows.length === 0 ? monthEmptyContent : /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', gap: '10px' }
  }, rows.map(row => {
    const isCollapsed = !!collapsedDailyRows[row.meeting.date];
    return /*#__PURE__*/React.createElement("section", {
      key: row.meeting.date,
      style: { border: '0', borderRadius: '14px', padding: '12px', backgroundColor: 'var(--bg-primary)' }
    }, /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: isCollapsed ? 0 : '10px' }
    }, /*#__PURE__*/React.createElement("strong", {
      style: { fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }
    }, /*#__PURE__*/React.createElement(CalendarCheckIcon, null), formatDateWithDayName(row.meeting.date)), /*#__PURE__*/React.createElement("span", {
      style: { display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', whiteSpace: 'nowrap' }
    }, /*#__PURE__*/React.createElement("span", {
      // Capsule badge (not plain colored text) so this per-date total reads distinctly from the
      // plain +/- colored amounts on the expense rows below it.
      style: {
        fontSize: '0.8rem', fontWeight: 900, color: '#FFFFFF',
        backgroundColor: row.net < 0 ? '#DC2626' : '#16A34A',
        padding: '4px 10px', borderRadius: '999px'
      }
    }, row.net >= 0 ? '+' : '-', Math.abs(row.net).toLocaleString(), "원"), /*#__PURE__*/React.createElement(SectionToggleButton, {
      collapsed: isCollapsed,
      onToggle: () => toggleDailyRow(row.meeting.date),
      label: `${formatDateWithDayName(row.meeting.date)} 정산`
    }))), !isCollapsed && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '8px' }
    }, row.items.map(item => renderItemRow({ ...item, date: row.meeting.date }, false))));
  }));

  const bodyContent = allTimeItems.length === 0 && baseBudget === 0 ? emptyContent : activeTab === 'total' ? totalContent : dailyContent;

  return /*#__PURE__*/React.createElement("div", {
    className: "settlement-page-container",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflow: 'hidden', zIndex: 1005
    }
  },
    /* Floating back button -- always fixed in place; gains a shadow once the header itself
       has scrolled out of view, matching the chat room / memo page back button behavior. */
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onBack,
      "aria-label": "뒤로가기",
      style: {
        position: 'fixed', top: '10px', left: '10px', width: '36px', height: '36px',
        borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: 'none',
        boxShadow: isHeaderVisible ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748B', zIndex: 1020
      }
    }, /*#__PURE__*/React.createElement(BackArrowIcon, { size: 22 })),
    /*#__PURE__*/React.createElement("div", {
    className: "settlement-page-header",
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
      display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px',
      backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
      zIndex: 1010, transition: 'transform 0.3s ease',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
    }
  }, /*#__PURE__*/React.createElement("div", { style: { width: '22px', flexShrink: 0 } }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '1.05rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-main)',
      position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'
    }
  }, formatChatHeaderTitle(calendar?.title), " 정산"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleGenerateShareImage,
    title: "정산 결과 공유 이미지 생성",
    style: {
      position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
      width: '32px', height: '32px', borderRadius: '50%', border: 'none',
      backgroundColor: 'transparent', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#64748B', padding: 0
    }
  }, /*#__PURE__*/React.createElement(ShareIcon, { size: 16 }))), /*#__PURE__*/React.createElement("div", {
    className: "settlement-page-body",
    onScroll: handleSettlementScroll,
    style: { flex: '1 1 auto', overflowY: 'auto', padding: '72px 16px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }
  }, /*#__PURE__*/React.createElement("div", {
    className: "settlement-metric-grid"
  }, metricCards.map(card => /*#__PURE__*/React.createElement("div", {
    key: card.label,
    className: "settlement-metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "settlement-metric-card-label"
  }, /*#__PURE__*/React.createElement("span", { style: { color: card.color, display: 'inline-flex' } }, card.icon), card.label), /*#__PURE__*/React.createElement("div", {
    className: "settlement-metric-card-value",
    style: { color: card.color }
  }, card.value.toLocaleString(), "원")))), /*#__PURE__*/React.createElement(SegmentedToggle, {
    ariaLabel: "누적보기/일자별보기 전환",
    value: activeTab,
    onChange: v => setActiveTab(v),
    style: { width: '100%', flexShrink: 0 },
    options: [{ value: 'total', label: '누적보기' }, { value: 'daily', label: '일자별보기' }]
  }),
  activeTab === 'daily' && /*#__PURE__*/React.createElement("div", {
    className: "calendar-nav",
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', marginBottom: '2px', flexShrink: 0 }
  }, /*#__PURE__*/React.createElement("div", {
    className: "month-display",
    style: {
      cursor: 'pointer',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    onClick: handleOpenPicker,
    title: "클릭하여 년월 이동"
  }, /*#__PURE__*/React.createElement("span", {
    className: "month-display-year-full"
  }, `${year}년 `), /*#__PURE__*/React.createElement("span", {
    className: "month-display-year-short"
  }, `${String(year).slice(2)}년 `), `${month + 1}월`, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#94A3B8',
      display: 'inline-flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary calendar-month-nav-btn",
    title: "이전달",
    "aria-label": "이전달",
    style: { padding: '8px' },
    onClick: onPrevMonth
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { transform: 'rotate(90deg)' },
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary calendar-month-nav-btn",
    title: "오늘",
    "aria-label": "오늘",
    style: { padding: '8px' },
    onClick: onToday
  }, /*#__PURE__*/React.createElement(CalendarCheckIcon, null)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary calendar-month-nav-btn",
    title: "다음달",
    "aria-label": "다음달",
    style: { padding: '8px' },
    onClick: onNextMonth
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { transform: 'rotate(-90deg)' },
    className: "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6l6 -6"
  }))))),
  bodyContent,
  (() => {
    const sheet = isPickerOpen && /*#__PURE__*/React.createElement("div", {
      className: "bottom-sheet-overlay",
      onClick: () => setIsPickerOpen(false),
      style: { zIndex: 12000 }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bottom-sheet",
      onClick: e => e.stopPropagation()
    },
      /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
        /*#__PURE__*/React.createElement("h4", null, "연월 선택"),
        /*#__PURE__*/React.createElement("button", {
          type: "button",
          style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' },
          onClick: () => setIsPickerOpen(false)
        }, "✕")
      ),
      /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
        /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }
          }, "년도"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: '0.85rem' },
              onClick: () => setPickerYear(y => y - 1)
            }, "◀"),
            /*#__PURE__*/React.createElement("span", {
              style: { fontWeight: 800, fontSize: '1.1rem', minWidth: '60px', textAlign: 'center' }
            }, pickerYear, "년"),
            /*#__PURE__*/React.createElement("button", {
              type: "button", className: "btn btn-secondary", style: { padding: '4px 10px', fontSize: '0.85rem' },
              onClick: () => setPickerYear(y => y + 1)
            }, "▶")
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { marginBottom: '16px' } },
          /*#__PURE__*/React.createElement("label", {
            style: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }
          }, "월"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' } },
            monthNames.map((name, idx) => /*#__PURE__*/React.createElement("button", {
              key: idx, type: "button", onClick: () => setPickerMonth(idx),
              style: {
                padding: '6px 4px', borderRadius: '8px',
                border: pickerMonth === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: pickerMonth === idx ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                color: pickerMonth === idx ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: pickerMonth === idx ? 800 : 500, fontSize: '0.82rem', cursor: 'pointer'
              }
            }, name))
          )
        ),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-primary", style: { width: '100%' },
          onClick: handlePickerApply
        }, pickerYear, "년 ", pickerMonth + 1, "월로 이동")
      )
    ));
    return sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet;
  })(),
  /* Generated share-image overlay -- shown instead of auto-downloading since a triggered file
     download is unreliable on iOS Safari; long-pressing the <img> to save works on every
     mobile browser, and the explicit 다운로드 link below covers desktop. */
  shareImageUrl && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: () => setShareImageUrl(null),
    style: { zIndex: 12000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation(),
    style: { width: '90%', maxWidth: '360px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }
  },
    /*#__PURE__*/React.createElement("img", { src: shareImageUrl, alt: "정산 결과 공유 이미지", style: { width: '100%', borderRadius: '10px', border: '1px solid var(--border-subtle)' } }),
    /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' } }, "이미지를 길게 눌러 저장하거나, 아래 버튼으로 다운로드하세요"),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', width: '100%' } },
      /*#__PURE__*/React.createElement("button", {
        type: "button", className: "btn btn-secondary", style: { flex: 1 },
        onClick: () => setShareImageUrl(null)
      }, "닫기"),
      /*#__PURE__*/React.createElement("a", {
        href: shareImageUrl,
        download: `${calendar?.title || '정산'}_정산결과.png`,
        className: "btn btn-primary",
        style: { flex: 1, textAlign: 'center', textDecoration: 'none' }
      }, "다운로드")
    )
  ))
  ));
}

export function PollModal({ calendar, poll, onSave, onClose, showToast, onRequestConfirm }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const DeadlineDateTimePicker = __comp.DeadlineDateTimePicker || __deps.DeadlineDateTimePicker;
  const LineHeightIcon = __comp.LineHeightIcon || __deps.LineHeightIcon;
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer;
  const SectionToggleButton = __comp.SectionToggleButton || __deps.SectionToggleButton;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const sanitizeText = __deps.sanitizeText;

  const now = Date.now();
  const isEditing = Boolean(poll?.id);
  // Once a poll's deadline has passed, adding new candidates no longer makes sense (voting is
  // already over) -- lock just the add input/button below, leaving the existing option list
  // viewable/editable so stray typos etc. can still be cleaned up.
  const isClosed = isPollClosed(poll);
  const createdAtText = isEditing ? formatRegisteredAt(poll?.createdAt) : '';
  const [title, setTitle] = React.useState(poll?.title || '');
  const [description, setDescription] = React.useState(poll?.description || '');
  // <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in the viewer's local time, not a
  // raw epoch -- convert via the timezone offset rather than toISOString (which is UTC).
  const [deadlineInput, setDeadlineInput] = React.useState(() => {
    if (!poll?.deadline) return '';
    const d = new Date(Number(poll.deadline));
    if (Number.isNaN(d.getTime())) return '';
    const tzOffsetMs = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  });
  const [isDeadlineCollapsed, setIsDeadlineCollapsed] = React.useState(true);
  const [newOption, setNewOption] = React.useState('');
  const [options, setOptions] = React.useState(getActivePollOptions(poll).map(option => ({
    ...option,
    inputValue: `${option.text}${option.url ? ' ' + option.url : ''}`
  })));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [draggingOptionId, setDraggingOptionId] = React.useState('');
  const [dragOverOptionId, setDragOverOptionId] = React.useState('');
  const newOptionInputRef = React.useRef(null);
  const pointerSortRef = React.useRef({ sourceId: '', targetId: '', startX: 0, startY: 0, active: false });
  const handleAddOption = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSubmitting || isClosed) return;
    const latest = newOptionInputRef.current ? newOptionInputRef.current.value : newOption;
    const parsed = normalizePollOptionInput(latest);
    if (!parsed.text) return;
    setOptions(prev => [...prev, {
      id: `${poll?.id || calendar.id + '_poll'}_opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text: parsed.text,
      url: parsed.url,
      inputValue: latest,
      updatedAt: Date.now()
    }]);
    setNewOption('');
    if (newOptionInputRef.current) newOptionInputRef.current.value = '';
  };
  const updateOption = (optionId, value) => {
    const parsed = normalizePollOptionInput(value);
    setOptions(prev => prev.map(option => option.id === optionId ? {
      ...option,
      inputValue: value,
      text: parsed.text || value,
      url: parsed.url,
      updatedAt: Date.now()
    } : option));
  };
  const moveOption = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId || isSubmitting) return;
    setOptions(prev => {
      const fromIndex = prev.findIndex(option => option.id === sourceId);
      const toIndex = prev.findIndex(option => option.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, { ...moved, updatedAt: Date.now() });
      return next;
    });
  };
  const resetPointerSort = () => {
    pointerSortRef.current = { sourceId: '', targetId: '', startX: 0, startY: 0, active: false };
    setDraggingOptionId('');
    setDragOverOptionId('');
  };
  const beginPointerSort = (event, optionId) => {
    if (isSubmitting) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerSortRef.current = {
      sourceId: optionId,
      targetId: '',
      startX: event.clientX,
      startY: event.clientY,
      active: false
    };
    setDraggingOptionId(optionId);
    setDragOverOptionId('');
    if (event.currentTarget.setPointerCapture && event.pointerId !== undefined) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch (e) {}
    }
    event.preventDefault();
  };
  const updatePointerSort = event => {
    const session = pointerSortRef.current;
    if (!session.sourceId || isSubmitting) return;
    const moved = Math.abs(event.clientX - session.startX) > 6 || Math.abs(event.clientY - session.startY) > 6;
    if (!moved && !session.active) return;
    session.active = true;
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const targetRow = element && element.closest ? element.closest('.poll-sortable-row') : null;
    const targetId = targetRow ? targetRow.getAttribute('data-option-id') : '';
    session.targetId = targetId && targetId !== session.sourceId ? targetId : '';
    setDragOverOptionId(session.targetId);
    event.preventDefault();
  };
  const finishPointerSort = event => {
    const session = pointerSortRef.current;
    if (!session.sourceId) return;
    if (session.active && session.targetId) {
      moveOption(session.sourceId, session.targetId);
    }
    resetPointerSort();
    if (event && event.currentTarget && event.currentTarget.releasePointerCapture && event.pointerId !== undefined) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch (e) {}
    }
    if (event) event.preventDefault();
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    const cleanTitle = sanitizeText(title, 80);
    const cleanDescription = sanitizeText(description, 160);
    // Deleted options must still be SENT to onSave with their removedAt tombstone intact, not
    // dropped from the array -- mergePollRecord (see its definition) merges this calendar's
    // saved poll against whatever the server currently has by unioning option IDs from both
    // sides, keyed by whichever copy has the newer timestamp. If a deleted option is simply
    // omitted here instead of tombstoned, the merge has no way to tell "this option was removed"
    // apart from "this save just never mentioned it" -- the server's still-existing copy of that
    // option ID wins the union and the deletion silently reverts on the next merge (which is
    // exactly what a concurrent-edit-safe merge needs to do for options nobody touched).
    const normalizedOptions = options.map(option => {
      if (isTombstone(option)) return option;
      const inputValue = option.inputValue ?? `${option.text}${option.url ? ' ' + option.url : ''}`;
      const parsed = normalizePollOptionInput(inputValue);
      return {
        ...option,
        text: parsed.text,
        url: parsed.url
      };
    }).filter(option => isTombstone(option) || sanitizeText(option.text, 120));
    const activeOptionCount = normalizedOptions.filter(option => !isTombstone(option)).length;
    if (!cleanTitle || activeOptionCount === 0) {
      if (showToast) showToast('투표명·옵션 필요', 'error'); else alert('투표명·옵션 필요');
      return;
    }
    setIsSubmitting(true);
    let saved = false;
    try {
      saved = await Promise.resolve(onSave({
        ...(poll || {}),
        id: poll?.id || `${calendar.id}_poll_${now}_${Math.random().toString(36).slice(2, 7)}`,
        calendarId: calendar.id,
        title: cleanTitle,
        description: cleanDescription,
        deadline: deadlineInput ? new Date(deadlineInput).getTime() : null,
        options: normalizedOptions,
        votes: poll?.votes || {},
        createdAt: poll?.createdAt || now,
        updatedAt: Date.now()
      }));
    } catch (err) {
      console.error('Poll save failed:', err);
    }
    if (saved === false) {
      setIsSubmitting(false);
      return;
    }
    onClose();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: () => {
      if (!isSubmitting) onClose();
    },
    style: { zIndex: 11000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header",
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { fontSize: '1.1rem', fontWeight: 800 }
  }, isEditing ? "\uD22C\uD45C \uC218\uC815" : "\uD22C\uD45C \uC0DD\uC131"), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }
  }, createdAtText && /*#__PURE__*/React.createElement("span", {
    className: "registered-at-text",
    style: { fontSize: '0.6rem', whiteSpace: 'nowrap' }
  }, "\uC0DD\uC131\uC77C\uC790 ", createdAtText), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (!isSubmitting) onClose();
    },
    style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 })))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }
  }, "\uD22C\uD45C\uBA85"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    style: { width: '100%' },
    value: title,
    disabled: isSubmitting,
    maxLength: 80,
    onChange: e => setTitle(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }
  }, "\uD22C\uD45C \uC124\uBA85"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    style: { width: '100%' },
    value: description,
    disabled: isSubmitting,
    maxLength: 160,
    onChange: e => setDescription(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setIsDeadlineCollapsed(prev => !prev),
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: isDeadlineCollapsed ? 0 : '6px', cursor: 'pointer' }
  }, /*#__PURE__*/React.createElement("label", {
    style: { fontSize: '0.85rem', fontWeight: 700, color: '#64748B', cursor: 'pointer' }
  }, "\uB9C8\uAC10\uAE30\uD55C (\uC120\uD0DD)"), /*#__PURE__*/React.createElement(SectionToggleButton, {
    collapsed: isDeadlineCollapsed,
    onToggle: () => setIsDeadlineCollapsed(prev => !prev),
    label: isDeadlineCollapsed ? "\uB9C8\uAC10\uC2DC\uD55C \uD3BC\uCE58\uAE30" : "\uB9C8\uAC10\uC2DC\uD55C \uC811\uAE30"
  })), !isDeadlineCollapsed && /*#__PURE__*/React.createElement(DeadlineDateTimePicker, {
    value: deadlineInput,
    onChange: setDeadlineInput,
    disabled: isSubmitting
  })), /*#__PURE__*/React.createElement("div", {
    style: { borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }
  }, /*#__PURE__*/React.createElement("label", {
    style: { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }
  }, "\uD22C\uD45C \uC124\uC815"), /*#__PURE__*/React.createElement("div", {
    className: "participant-add-row",
    style: { display: 'flex', gap: '8px', marginBottom: '12px' }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input participant-add-input",
    style: { flex: 1, minWidth: 0 },
    placeholder: isClosed ? "\uB9C8\uAC10\uB41C \uD22C\uD45C\uC5D0\uB294 \uD6C4\uBCF4\uB97C \uCD94\uAC00\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" : "\uC608: \uCC9C\uC655\uC5ED\uBAA8\uC544\uC5D8\uAC00 https://naver.me/54LbfTLU",
    value: newOption,
    disabled: isSubmitting || isClosed,
    maxLength: 220,
    ref: newOptionInputRef,
    onChange: e => setNewOption(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.nativeEvent && e.nativeEvent.isComposing) return;
        handleAddOption(e);
      }
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary participant-action-btn",
    disabled: isSubmitting || isClosed,
    title: isClosed ? "\uB9C8\uAC10\uB41C \uD22C\uD45C\uC5D0\uB294 \uD6C4\uBCF4\uB97C \uCD94\uAC00\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" : undefined,
    style: { whiteSpace: 'nowrap', minWidth: '52px', flexShrink: 0 },
    onClick: handleAddOption
  }, "\uCD94\uAC00")), options.map(option => isTombstone(option) ? null : /*#__PURE__*/React.createElement("div", {
    key: option.id,
    "data-option-id": option.id,
    className: `participant-edit-row poll-sortable-row${draggingOptionId === option.id ? ' is-dragging' : ''}${dragOverOptionId === option.id ? ' is-drop-target' : ''}`,
    onDragOver: event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (draggingOptionId && draggingOptionId !== option.id) setDragOverOptionId(option.id);
    },
    onDragEnter: event => {
      event.preventDefault();
      if (draggingOptionId && draggingOptionId !== option.id) setDragOverOptionId(option.id);
    },
    onDragLeave: event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setDragOverOptionId('');
    },
    onDrop: event => {
      event.preventDefault();
      const sourceId = event.dataTransfer.getData('text/plain') || draggingOptionId;
      moveOption(sourceId, option.id);
      setDraggingOptionId('');
      setDragOverOptionId('');
    },
    onDragEnd: () => {
      setDraggingOptionId('');
      setDragOverOptionId('');
    },
    style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "poll-drag-handle",
    disabled: isSubmitting,
    draggable: !isSubmitting,
    title: "\uB4DC\uB798\uADF8\uD558\uC5EC \uC21C\uC11C \uBCC0\uACBD",
    onPointerDown: event => beginPointerSort(event, option.id),
    onPointerMove: updatePointerSort,
    onPointerUp: finishPointerSort,
    onPointerCancel: resetPointerSort,
    onDragStart: event => {
      if (isSubmitting) return;
      setDraggingOptionId(option.id);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', option.id);
      const row = event.currentTarget.closest('.poll-sortable-row');
      if (row && event.dataTransfer.setDragImage) {
        const rect = row.getBoundingClientRect();
        event.dataTransfer.setDragImage(row, Math.min(rect.width - 12, Math.max(24, event.clientX - rect.left)), Math.max(16, event.clientY - rect.top));
      }
    },
    onDragEnd: () => {
      setDraggingOptionId('');
      setDragOverOptionId('');
    }
  }, /*#__PURE__*/React.createElement(LineHeightIcon, null)), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input participant-name-input",
    style: { flex: 1, minWidth: 0 },
    value: option.inputValue ?? `${option.text}${option.url ? ' ' + option.url : ''}`,
    disabled: isSubmitting,
    maxLength: 220,
    onKeyDown: e => e.stopPropagation(),
    onInput: e => updateOption(option.id, e.target.value),
    onChange: e => updateOption(option.id, e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-danger participant-remove-btn",
    disabled: isSubmitting,
    onClick: () => {
      const performDelete = () => setOptions(prev => prev.map(item => item.id === option.id ? { ...item, removedAt: Date.now(), updatedAt: Date.now() } : item));
      if (onRequestConfirm) {
        onRequestConfirm('투표 항목 삭제', `"${option.text || '빈 항목'}" 항목을 삭제하시겠습니까?`, performDelete);
      } else if (window.confirm(`"${option.text || '빈 항목'}" 항목을 삭제하시겠습니까?`)) {
        performDelete();
      }
    }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 })))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    disabled: isSubmitting,
    onClick: () => {
      if (!isSubmitting) onClose();
    }
  }, "\uCDE8\uC18C"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    disabled: isSubmitting,
    style: { opacity: isSubmitting ? 0.75 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }
  }, isSubmitting ? "\uC800\uC7A5 \uC911..." : "\uD22C\uD45C \uC800\uC7A5")))));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    AnniversaryModal: AnniversaryModal,
    SettlementSummaryModal: SettlementSummaryModal,
    PollModal: PollModal,
  });
}
