/**
 * User manual overlay (P4-6)
 */
export function UserManualOverlay({ calendar, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const SmallXIcon = __deps.SmallXIcon;
  const MenuIcon = __deps.MenuIcon;

  const participants = getActiveParticipants(calendar || {});
  const sampleParticipant = participants[0] || { name: '박영우', color: '#EF4444' };
  const sampleParticipant2 = participants[1] || { name: '김유리', color: '#F97316' };
  const sampleParticipant3 = participants[2] || { name: '송은혜', color: '#06B6D4' };
  const participantBadge = (participant, text) => /*#__PURE__*/React.createElement("span", {
    className: "participant-badge",
    style: {
      backgroundColor: participant.color,
      color: getContrastTextColor(participant.color),
      boxShadow: 'none'
    }
  }, text || participant.name);
  const StepIcon = ({ children }) => /*#__PURE__*/React.createElement("div", {
    style: {
      width: '42px',
      height: '42px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #EEF2FF, #FDF2F8)',
      color: '#4F46E5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 10px 24px rgba(79, 70, 229, 0.16)'
    }
  }, children);
  const stepCards = [
    {
      title: '1. 가능한 날짜를 선택해요',
      desc: '캘린더에서 내가 참석 가능한 날짜를 눌러 일정 팝업을 엽니다. 여러 날짜를 등록해둘수록 모두가 만날 수 있는 날을 찾기 쉬워져요.',
      icon: /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z", "M16 3v4", "M8 3v4", "M4 11h16"] }),
      preview: /*#__PURE__*/React.createElement("div", {
        style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }
      }, [15, 16, 17, 22, 23, 30].map(day => /*#__PURE__*/React.createElement("div", {
        key: day,
        style: {
          minHeight: '74px',
          borderRadius: '14px',
          border: day === 22 ? '1px solid #10B981' : day === 15 ? '1px solid #7C3AED' : '1px solid var(--border-subtle)',
          background: day === 22 ? '#ECFDF5' : day === 15 ? '#FAF5FF' : 'var(--bg-primary)',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: day === 15 ? '#EF4444' : 'var(--text-main)',
          fontWeight: 900,
          fontSize: '0.86rem'
        }
      }, day, day === 15 && /*#__PURE__*/React.createElement("span", { style: { color: '#7C3AED', fontSize: '0.62rem' } }, "확정")), day === 22 ? /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
        participantBadge(sampleParticipant),
        participantBadge(sampleParticipant2)
      ) : day === 15 ? /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
        participantBadge(sampleParticipant),
        participantBadge(sampleParticipant2),
        participantBadge(sampleParticipant3)
      ) : /*#__PURE__*/React.createElement("span", { style: { color: '#CBD5E1', fontSize: '0.75rem', fontWeight: 800 } }, "선택 가능"))))
    },
    {
      title: '2. 참여자와 메모를 등록해요',
      desc: '일정 팝업에서 참여자(본인)를 선택하면 메모 입력칸이 열립니다. 시간, 장소, 차량 여부처럼 같이 보면 좋은 내용을 적고 등록하면 바로 저장됩니다.',
      icon: /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0", "M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"] }),
      preview: /*#__PURE__*/React.createElement("div", {
        style: { border: '1px solid var(--border-subtle)', borderRadius: '18px', overflow: 'hidden', background: 'var(--bg-card)' }
      }, /*#__PURE__*/React.createElement("div", {
        style: { padding: '13px 16px', background: '#F5EAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900 }
      }, "26.08.22(토)", /*#__PURE__*/React.createElement("span", { style: { color: '#64748B' } }, "×")), /*#__PURE__*/React.createElement("div", {
        style: { padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }
      }, /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.75rem', fontWeight: 900, color: '#64748B' } }, "참여자 선택"), /*#__PURE__*/React.createElement("div", {
        style: { height: '42px', border: '1px solid var(--border-subtle)', borderRadius: '999px', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '8px', fontWeight: 800 }
      }, /*#__PURE__*/React.createElement("span", { style: { width: 9, height: 9, borderRadius: '50%', backgroundColor: sampleParticipant.color } }), sampleParticipant.name), /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.75rem', fontWeight: 900, color: '#64748B' } }, "메모 입력"), /*#__PURE__*/React.createElement("div", {
        style: { border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '11px 12px', color: '#64748B', fontSize: '0.82rem' }
      }, "예: 1시 이후 가능, 차량 운전 가능"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        style: { width: '100%', pointerEvents: 'none' }
      }, "등록")))
    },
    {
      title: '3. 많이 모인 날을 모임일자로 채택해요',
      desc: '참여자가 많이 겹치는 날짜는 캘린더와 요약 영역에서 바로 확인할 수 있습니다. 운영자는 좋은 날짜를 모임확정으로 채택하고 정산/투표/채팅까지 이어갈 수 있어요.',
      icon: /*#__PURE__*/React.createElement(MenuIcon, { paths: ["M9 12l2 2l4 -4", "M12 22a10 10 0 1 0 0 -20a10 10 0 0 0 0 20"] }),
      preview: /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '8px' }
      }, /*#__PURE__*/React.createElement("div", {
        style: { border: '1px solid #10B981', background: '#ECFDF5', borderRadius: '16px', padding: '12px', display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", { style: { color: '#10B981', fontWeight: 900, marginBottom: '7px' } }, "전원 참석 가능"), /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '5px' } }, participantBadge(sampleParticipant), participantBadge(sampleParticipant2), participantBadge(sampleParticipant3))), /*#__PURE__*/React.createElement("span", {
        style: { padding: '6px 10px', borderRadius: '999px', background: '#10B981', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap' }
      }, "전원")), /*#__PURE__*/React.createElement("div", {
        style: { border: '1px solid transparent', background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, var(--accent-gradient) border-box', borderRadius: '16px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }
      }, /*#__PURE__*/React.createElement("strong", { style: { color: '#4F46E5' } }, "[모임확정] 26.08.22 (토)"), /*#__PURE__*/React.createElement("span", {
        style: { padding: '5px 10px', borderRadius: '999px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: '#FFFFFF', fontWeight: 900, fontSize: '0.75rem' }
      }, "D-11")))
    }
  ];
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "manual-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "사용자 매뉴얼",
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 10040,
      background: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(9px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(14px, 4vw, 34px)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("section", {
    className: "manual-panel",
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(1080px, 100%)',
      maxHeight: 'min(860px, calc(100vh - 28px))',
      overflowY: 'auto',
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '28px',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.32)',
      padding: 'clamp(18px, 3vw, 30px)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '999px', background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', fontSize: '0.78rem', fontWeight: 900, marginBottom: '10px' }
  }, "첫 사용자를 위한 빠른 안내"), /*#__PURE__*/React.createElement("h2", {
    style: { margin: 0, fontSize: 'clamp(1.45rem, 4vw, 2.2rem)', lineHeight: 1.12, letterSpacing: '-0.04em', fontWeight: 950 }
  }, "모여라 캘린더 사용법"), /*#__PURE__*/React.createElement("p", {
    style: { margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', lineHeight: 1.55 }
  }, calendar?.title ? `${calendar.title}에서 날짜를 고르고, 본인 일정을 등록하고, 모두가 좋은 날짜를 확정하는 흐름입니다.` : "날짜를 고르고, 본인 일정을 등록하고, 모두가 좋은 날짜를 확정하는 흐름입니다.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "사용자 매뉴얼 닫기",
    style: { width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }
  }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 20 }))), /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }
  }, stepCards.map(step => /*#__PURE__*/React.createElement("article", {
    key: step.title,
    style: { border: '1px solid var(--border-subtle)', borderRadius: '22px', background: 'linear-gradient(180deg, var(--bg-card), var(--bg-primary))', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '100%' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'flex-start', gap: '12px' }
  }, /*#__PURE__*/React.createElement(StepIcon, null, step.icon), /*#__PURE__*/React.createElement("div", {
    style: { minWidth: 0 }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { margin: 0, fontSize: '1rem', fontWeight: 950, letterSpacing: '-0.02em' }
  }, step.title), /*#__PURE__*/React.createElement("p", {
    style: { margin: '7px 0 0', color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.55 }
  }, step.desc))), /*#__PURE__*/React.createElement("div", {
    style: { marginTop: 'auto', borderRadius: '18px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', padding: '12px', overflow: 'hidden' }
  }, step.preview)))), /*#__PURE__*/React.createElement("div", {
    style: { marginTop: '16px', padding: '14px 16px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5 }
  }, "팁: 가능한 날짜를 하나만 고르기보다 여러 날짜를 미리 등록해두면, 공통으로 참석 가능한 날짜를 훨씬 빠르게 찾을 수 있습니다."))), document.body);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    UserManualOverlay: UserManualOverlay,
  });
}
