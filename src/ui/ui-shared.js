/**
 * Shared UI primitives (P4-22)
 */
(function () {
function ResizableModalContainer({ className, style, children, ...props }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const containerRef = React.useRef(null);
  const [dimensions, setDimensions] = React.useState(null); // { width, height }
  const isDraggingRef = React.useRef(false);
  const startPosRef = React.useRef({ x: 0, y: 0 });
  const startDimRef = React.useRef({ w: 0, h: 0 });

  const handleMouseDown = e => {
    if (e.button !== 0) return; // Only left-click
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    const rect = containerRef.current.getBoundingClientRect();
    startDimRef.current = { w: rect.width, h: rect.height };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = e => {
    isDraggingRef.current = true;
    startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const rect = containerRef.current.getBoundingClientRect();
    startDimRef.current = { w: rect.width, h: rect.height };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseMove = e => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    setDimensions({
      width: Math.max(280, startDimRef.current.w + deltaX),
      height: Math.max(150, startDimRef.current.h + deltaY)
    });
  };

  const handleTouchMove = e => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();
    const deltaX = e.touches[0].clientX - startPosRef.current.x;
    const deltaY = e.touches[0].clientY - startPosRef.current.y;
    setDimensions({
      width: Math.max(280, startDimRef.current.w + deltaX),
      height: Math.max(150, startDimRef.current.h + deltaY)
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    const blockClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      document.removeEventListener('click', blockClick, true);
    };
    document.addEventListener('click', blockClick, true);
    setTimeout(() => document.removeEventListener('click', blockClick, true), 0);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    const blockClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      document.removeEventListener('click', blockClick, true);
    };
    document.addEventListener('click', blockClick, true);
    setTimeout(() => document.removeEventListener('click', blockClick, true), 0);
  };

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const mergedStyle = {
    ...style,
    position: 'relative',
    ...(dimensions ? { width: `${dimensions.width}px`, height: `${dimensions.height}px`, maxWidth: 'none', maxHeight: 'none' } : {})
  };

  return /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    className: className || "modal-container",
    style: mergedStyle,
    ...props
  },
    children,
    /* Resize handle at bottom right */
    /*#__PURE__*/React.createElement("div", {
      onMouseDown: e => { e.preventDefault(); e.stopPropagation(); handleMouseDown(e); },
      onTouchStart: e => { e.stopPropagation(); handleTouchStart(e); },
      onClick: e => { e.preventDefault(); e.stopPropagation(); },
      style: {
        position: 'absolute',
        right: '4px',
        bottom: '4px',
        width: '18px',
        height: '18px',
        cursor: 'se-resize',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        userSelect: 'none',
        touchAction: 'none'
      }
    },
      /*#__PURE__*/React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "1em",
        height: "1em",
        viewBox: "0 0 16 16",
        style: { pointerEvents: 'none' }
      },
        /*#__PURE__*/React.createElement("path", { d: "M0 0h16v16H0z", fill: "none" }),
        /*#__PURE__*/React.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M14.776 4.284a.75.75 0 0 0-1.06-1.06L3.22 13.72a.75.75 0 1 0 1.06 1.06zm0 5a.75.75 0 0 0-1.06-1.06L8.22 13.72a.75.75 0 1 0 1.06 1.06z", clipRule: "evenodd" })
      )
    )
  );
}

function AutoGrowTextarea({
  maxHeight = 480,
  value,
  onChange,
  style = null,
  className = 'form-input',
  minHeight = 44,
  textareaRef = null,
  ...rest
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const autoGrowTextarea = __deps.autoGrowTextarea;

  const innerRef = React.useRef(null);
  const setRefs = React.useCallback(el => {
    innerRef.current = el;
    if (typeof textareaRef === 'function') textareaRef(el);
    else if (textareaRef && typeof textareaRef === 'object') textareaRef.current = el;
  }, [textareaRef]);
  React.useLayoutEffect(() => {
    autoGrowTextarea(innerRef.current, maxHeight);
  }, [value, maxHeight]);
  return /*#__PURE__*/React.createElement("textarea", Object.assign({
    ref: setRefs,
    className: className,
    value: value,
    onChange: e => {
      if (typeof onChange === 'function') onChange(e);
      autoGrowTextarea(e.target, maxHeight);
    },
    onInput: e => autoGrowTextarea(e.target, maxHeight),
    style: Object.assign({
      resize: 'none',
      overflow: 'hidden',
      boxSizing: 'border-box',
      minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      fontFamily: 'inherit',
      lineHeight: 1.45
    }, style || {})
  }, rest));
}

function FormAddEditActionButtons({ isEditing, isSaving, onCancel, onSubmit, disabled = false, savingLabel = '저장 중...', alignSelf = null, flexGrow = false }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const base = {
    flexShrink: flexGrow ? 1 : 0,
    height: '44px',
    minHeight: '44px',
    whiteSpace: 'nowrap',
    justifyContent: 'center'
  };
  if (flexGrow) base.flex = 1;
  if (alignSelf) base.alignSelf = alignSelf;
  const primaryStyle = isEditing
    ? { ...base, backgroundColor: '#0F172A', borderColor: '#0F172A', color: '#FFFFFF' }
    : base;
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    isEditing && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary",
      style: base,
      disabled: !!isSaving,
      onClick: e => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (typeof onCancel === 'function') onCancel(e);
      }
    }, "취소"),
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary",
      style: primaryStyle,
      disabled: !!isSaving || !!disabled,
      onClick: e => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (typeof onSubmit === 'function') onSubmit(e);
      }
    }, isSaving ? savingLabel : (isEditing ? '수정' : '추가'))
  );
}

function SegmentedToggle({ options, value, onChange, disabled, style, ariaLabel }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const safeOptions = Array.isArray(options) ? options : [];
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": ariaLabel,
    style: {
      display: 'flex', alignItems: 'stretch', padding: '3px', boxSizing: 'border-box',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', flexShrink: 0,
      ...style
    }
  }, safeOptions.flatMap((opt, i) => [
    i > 0 ? /*#__PURE__*/React.createElement("span", {
      key: `div-${opt.value}`, "aria-hidden": "true",
      style: { width: '1px', margin: '6px 2px', backgroundColor: 'var(--border-subtle)' }
    }) : null,
    /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      type: "button", role: "tab", "aria-selected": value === opt.value,
      disabled,
      onClick: () => onChange(opt.value),
      style: {
        flex: 1, minWidth: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        padding: '12px 16px', border: 'none', cursor: disabled ? 'default' : 'pointer', borderRadius: 'var(--radius-sm)',
        fontSize: '0.78rem', fontWeight: value === opt.value ? 900 : 500, whiteSpace: 'nowrap',
        backgroundColor: value === opt.value ? (opt.activeColor || 'var(--accent-primary)') : 'transparent',
        color: value === opt.value ? '#FFFFFF' : 'var(--text-muted)'
      }
    }, opt.label)
  ]).filter(Boolean));
}

function ItemEditDeleteActions({ onEdit, onDelete, editTitle = '수정', deleteTitle = '삭제', showEdit = true, showDelete = true }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;

  return /*#__PURE__*/React.createElement("div", {
    className: "item-edit-delete-actions",
    style: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }
  },
    showEdit && typeof onEdit === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => { e.preventDefault(); e.stopPropagation(); onEdit(e); },
      title: editTitle, "aria-label": editTitle,
      style: {
        width: '22px', height: '22px', border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-card)', borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, color: '#64748B'
      }
    }, /*#__PURE__*/React.createElement(PencilIcon, { size: 12 })),
    showDelete && typeof onDelete === 'function' && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => { e.preventDefault(); e.stopPropagation(); onDelete(e); },
      title: deleteTitle, "aria-label": deleteTitle,
      style: {
        width: '22px', height: '22px', border: 'none', background: 'none',
        padding: 0, cursor: 'pointer', color: '#94A3B8',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }))
  );
}

function GamifiedConfirmButtonContent({ label }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const bolt = /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "100%", height: "100%",
    fill: "currentColor", "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", { d: "M13 2 3 14h8l-1 8 10-12h-8l1-8z" }));
  const star = /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "100%", height: "100%",
    fill: "currentColor", "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", { d: "M12 2l2.4 7.2H22l-6 4.8 2.3 7.2L12 16.8 5.7 21.2 8 14 2 9.2h7.6z" }));
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("span", { className: "gamified-shiny-glow-wrapper", "aria-hidden": true },
      /*#__PURE__*/React.createElement("span", { className: "gamified-shiny-glow" })
    ),
    /*#__PURE__*/React.createElement("span", {
      className: "gamified-border-electric",
      "aria-hidden": true
    }),
    /*#__PURE__*/React.createElement("span", {
      className: "gamified-border-electric gamified-border-electric-secondary",
      "aria-hidden": true
    }),
    /*#__PURE__*/React.createElement("span", { className: "gamified-sparks-container", "aria-hidden": true },
      [1,2,3,4,5,6].map(n => /*#__PURE__*/React.createElement("span", {
        key: "sp"+n, className: "gamified-spark gamified-spark-" + n
      }, bolt)),
      [1,2,3,4,5,6].map(n => /*#__PURE__*/React.createElement("span", {
        key: "sl"+n, className: "gamified-sparklet gamified-sparklet-" + n
      }, star))
    ),
    /*#__PURE__*/React.createElement("span", { className: "gamified-confirm-label" }, label)
  );
}

function LinkPreviewCard({ url, fallbackTitle, cachedData }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const preview = useLinkPreview(url, cachedData);
  if (!preview || preview.status === 'loading' || preview.status === 'error' || preview.status === 'empty') return null;
  const { title, description, image, siteName } = preview.data;
  const isGenericTitle = !title || title === 'map.naver.com' || title === 'naver.me' || title.startsWith('map.naver');
  const displayTitle = (isGenericTitle && fallbackTitle) ? fallbackTitle : (title || siteName);
  return /*#__PURE__*/React.createElement('a', {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: e => e.stopPropagation(),
    style: {
      display: 'flex',
      gap: '8px',
      marginTop: '6px',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      overflow: 'hidden',
      textDecoration: 'none',
      color: 'inherit',
      backgroundColor: 'var(--bg-card)'
    }
  },
    image && /*#__PURE__*/React.createElement('img', {
      src: image,
      alt: '',
      referrerPolicy: 'no-referrer',
      style: { width: '72px', height: '72px', objectFit: 'cover', flexShrink: 0, backgroundColor: 'var(--bg-primary)' }
    }),
    /*#__PURE__*/React.createElement('div', {
      style: { padding: '6px 8px', minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' }
    },
      displayTitle && /*#__PURE__*/React.createElement('div', {
      style: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      }, displayTitle),
      description && /*#__PURE__*/React.createElement('div', {
      style: { fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }
      }, description),
      siteName && /*#__PURE__*/React.createElement('div', {
        style: { fontSize: '0.65rem', color: 'var(--text-light)' }
      }, siteName)
    )
  );
}

function LinkPreviewProgressOverlay({ progress, remainingSec }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return ReactDOM.createPortal(
    /*#__PURE__*/React.createElement("div", {
      className: "modal-overlay",
      style: { zIndex: 12000, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
      /*#__PURE__*/React.createElement("div", {
        className: "modal-container",
        style: { width: '100%', maxWidth: '360px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }
      },
        /*#__PURE__*/React.createElement("h3", { style: { fontSize: '1rem', fontWeight: 800, textAlign: 'center', margin: 0, color: 'var(--text-main)' } }, "링크 미리보기 가져오는 중"),
        /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' } }, "웹페이지 정보를 분석하고 있습니다."),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700 }
        },
          /*#__PURE__*/React.createElement("span", { style: { color: 'var(--text-muted)' } }, "진행 상태"),
          /*#__PURE__*/React.createElement("span", { style: { color: 'var(--accent-primary)' } }, `${progress}% (약 ${remainingSec}초 남음)`)
        ),
        /*#__PURE__*/React.createElement("div", {
          style: { width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }
        },
          /*#__PURE__*/React.createElement("div", {
            style: {
              width: `${progress}%`,
              height: '100%',
              backgroundColor: 'var(--accent-primary)',
              borderRadius: '999px',
              transition: 'width 0.1s linear'
            }
          })
        )
      )
    ),
    document.body
  );
}

function DeleteConfirmModal({
  message,
  calendar,
  onConfirm,
  onCancel
}) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer;

  const participants = getActiveParticipants(calendar);
  const p = participants.find(part => part.id === message.participantId);
  const name = p?.name || '알수없음';

  let contentText = message.text || '';
  if (contentText.length > 20) {
    contentText = contentText.substring(0, 20) + '...';
  } else if (!contentText && message.imageUrl) {
    contentText = '사진';
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onCancel,
    style: { zIndex: 30000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    onClick: e => e.stopPropagation(),
    style: { maxWidth: '320px', padding: '20px', borderRadius: '12px' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { textAlign: 'center', marginBottom: '20px' }
  }, /*#__PURE__*/React.createElement("h3", {
    style: { fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }
  }, "채팅 삭제"), /*#__PURE__*/React.createElement("p", {
    style: { fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }
  }, `${name}님의 "${contentText}" 내용을 삭제하시겠습니까?`)), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', gap: '8px', justifyContent: 'center' }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: onCancel,
    style: { flex: 1, height: '36px', fontSize: '0.85rem' }
  }, "취소"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-danger",
    onClick: onConfirm,
    style: { flex: 1, height: '36px', fontSize: '0.85rem', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
  }, "확인"))));
}

function AdminLoginGate({ children }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const LockIcon = __comp.LockIcon || __deps.LockIcon;

  const [status, setStatus] = React.useState('checking'); // 'checking' | 'locked' | 'unlocked'
  const [passwordInput, setPasswordInput] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.fontSize = '';
    setStatus(getAdminSession() ? 'unlocked' : 'locked');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = passwordInput.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const ok = await verifyAdminPasswordRemote(trimmed);
      if (ok) {
        setAdminSession(trimmed);
        setPasswordInput('');
        setStatus('unlocked');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.warn('Admin auth check failed:', err);
      setError(err?.message || '인증 확인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'checking') return null;
  if (status === 'unlocked') return children;

  return /*#__PURE__*/React.createElement("div", {
    className: "admin-login-gate",
    style: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F8FAFC', padding: '20px'
    }
  },
    /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit,
      className: "modal-container",
      style: { maxWidth: '320px', padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }
    },
      /*#__PURE__*/React.createElement("div", { style: { fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/React.createElement(LockIcon, null), "관리자 인증"),
      /*#__PURE__*/React.createElement("div", { style: { fontSize: '0.82rem', color: '#64748B' } }, "비밀번호를 입력해 주세요."),
      /*#__PURE__*/React.createElement("input", {
        type: "password",
        className: "form-input",
        style: { width: '100%' },
        autoFocus: true,
        value: passwordInput,
        onChange: e => setPasswordInput(e.target.value),
        placeholder: "비밀번호"
      }),
      error && /*#__PURE__*/React.createElement("div", { style: { color: '#DC2626', fontSize: '0.82rem' } }, error),
      /*#__PURE__*/React.createElement("button", {
        type: "submit",
        className: "btn btn-primary",
        disabled: isSubmitting || !passwordInput.trim(),
        style: { opacity: isSubmitting || !passwordInput.trim() ? 0.6 : 1 }
      }, isSubmitting ? '확인 중...' : '입장')
    )
  );
}

function DonutChart({ segments, size = 84, strokeWidth = 14 }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [activeIndex, setActiveIndex] = React.useState(null);
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const positiveSegments = segments.filter(seg => seg.value > 0);
  const activeSeg = activeIndex != null ? positiveSegments[activeIndex] : null;
  let dashOffsetAcc = 0;
  return /*#__PURE__*/React.createElement("div", { style: { position: 'relative', display: 'inline-flex', flexShrink: 0 } },
    /*#__PURE__*/React.createElement("svg", {
      width: size, height: size, viewBox: `0 0 ${size} ${size}`, style: { flexShrink: 0 },
      onMouseLeave: () => setActiveIndex(null)
    },
      total === 0 ?
        /*#__PURE__*/React.createElement("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "#E2E8F0", strokeWidth }) :
        positiveSegments.map((seg, idx) => {
          const dash = seg.value / total * circumference;
          const el = /*#__PURE__*/React.createElement("circle", {
            key: seg.label, cx: size / 2, cy: size / 2, r: radius, fill: "none",
            stroke: seg.color, strokeWidth,
            strokeDasharray: `${dash} ${circumference - dash}`,
            strokeDashoffset: -dashOffsetAcc,
            transform: `rotate(-90 ${size / 2} ${size / 2})`,
            strokeLinecap: positiveSegments.length > 1 ? 'butt' : 'round',
            style: {
              cursor: 'pointer',
              opacity: activeIndex == null || activeIndex === idx ? 1 : 0.4,
              transition: 'opacity 0.12s ease'
            },
            onMouseEnter: () => setActiveIndex(idx),
            onClick: event => {
              event.stopPropagation();
              setActiveIndex(prev => prev === idx ? null : idx);
            }
          });
          dashOffsetAcc += dash;
          return el;
        })
    ),
    activeSeg && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute', bottom: `calc(100% + 6px)`, left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(15, 23, 42, 0.94)', color: '#FFFFFF', borderRadius: '6px',
        padding: '4px 8px', fontSize: '0.66rem', fontWeight: 700, whiteSpace: 'nowrap',
        pointerEvents: 'none', zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
      }
    }, `${activeSeg.label} · ${activeSeg.value}${activeSeg.unit || '건'} (${total > 0 ? Math.round(activeSeg.value / total * 100) : 0}%)`)
  );
}

function ColorSwatchPicker({ value, onChange, disabled, title = "색상 선택" }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const [isOpen, setIsOpen] = React.useState(false);
  const normalized = normalizeColorValue(value, '#64748B').toUpperCase();
  const swatchColors = PRESET_COLORS.map(c => c.toUpperCase()).includes(normalized)
    ? PRESET_COLORS
    : [normalized, ...PRESET_COLORS];
  const sheet = isOpen && /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet-overlay",
    onClick: () => setIsOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bottom-sheet",
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-header" },
      /*#__PURE__*/React.createElement("h4", null, title),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        style: { background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' },
        onClick: () => setIsOpen(false)
      }, "✕")
    ),
    /*#__PURE__*/React.createElement("div", { className: "bottom-sheet-body" },
      /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' } },
        swatchColors.map(color => {
          const isSelected = color.toUpperCase() === normalized;
          return /*#__PURE__*/React.createElement("button", {
            key: color,
            type: "button",
            "aria-label": color,
            onClick: () => { onChange(color); setIsOpen(false); },
            style: {
              width: '44px', height: '44px', borderRadius: '50%', backgroundColor: color,
              border: isSelected ? '3px solid var(--text-main)' : '1px solid var(--border-subtle)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 900, fontSize: '1rem'
            }
          }, isSelected && "✓");
        })
      )
    )
  ));
  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "color-swatch-trigger",
      disabled,
      title,
      "aria-label": title,
      onClick: () => setIsOpen(true),
      style: { backgroundColor: normalized }
    }),
    sheet && typeof document !== 'undefined' && ReactDOM.createPortal ? ReactDOM.createPortal(sheet, document.body) : sheet
  );
}

function StickyVideoBox({ stickyVideo, onClose, onGoToChat }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  if (!stickyVideo || typeof document === 'undefined' || !ReactDOM.createPortal) return null;
  const isPortrait = stickyVideo.orientation === 'portrait';
  const width = isPortrait ? 172 : 260;
  const height = isPortrait ? Math.round(width * 16 / 9) : Math.round(width * 9 / 16);
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement('div', {
    style: {
      position: 'fixed',
      right: '14px',
      bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
      width: `${width}px`,
      zIndex: 40000,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
      backgroundColor: '#000'
    }
  }, /*#__PURE__*/React.createElement('iframe', {
    key: stickyVideo.key,
    src: stickyVideo.embedUrl,
    title: stickyVideo.title || '미니플레이어',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowFullScreen: true,
    style: { display: 'block', width: '100%', height: `${height}px`, border: '0' }
  }), /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px',
      backgroundColor: 'rgba(15,23,42,0.94)'
    }
  }, /*#__PURE__*/React.createElement('button', {
    type: 'button',
    onClick: onGoToChat,
    style: {
      flex: 1,
      padding: '6px 8px',
      fontSize: '0.72rem',
      fontWeight: '700',
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.14)',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }, '채팅으로 이동'), /*#__PURE__*/React.createElement('button', {
    type: 'button',
    onClick: onClose,
    'aria-label': '미니플레이어 닫기',
    style: {
      width: '26px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.14)',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }, '✕'))), document.body);
}

function PollVoterSheet({ calendar, pollId, optionId, onSelect, onClose }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;

  const participants = getActiveParticipants(calendar);
  const poll = getCalendarPolls(calendar).find(item => item.id === pollId);
  const option = getActivePollOptions(poll).find(item => item.id === optionId);
  if (!poll || !option) return null;
  const selectedIds = new Set(getPollOptionVoterIds(poll, option.id));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose,
    style: {
      alignItems: 'flex-end',
      backgroundColor: 'rgba(15, 23, 42, 0.68)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "poll-voter-sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "poll-voter-sheet-header"
  }, /*#__PURE__*/React.createElement("span", null, "\uD22C\uD45C\uC790 \uC120\uD0DD"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: { background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }
  }, /*#__PURE__*/React.createElement(SmallXIcon, null))), /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gap: '8px', padding: '14px 20px 24px' }
  }, participants.map(participant => /*#__PURE__*/React.createElement("button", {
    key: participant.id,
    type: "button",
    className: "poll-voter-option",
    onClick: () => {
      setStoredChatParticipantId(calendar?.id, participant.id);
      onSelect(participant.id);
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { display: 'inline-flex', alignItems: 'center', gap: '10px' }
  }, /*#__PURE__*/React.createElement("span", {
    className: "color-dot",
    style: { backgroundColor: participant.color }
  }), participant.name), selectedIds.has(participant.id) && /*#__PURE__*/React.createElement("span", {
    style: { color: '#2563EB', fontWeight: 900 }
  }, "\u2713"))))));
}

function OperationProgressOverlay({ title, detail, pct }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  const clamped = Math.max(0, Math.min(100, pct || 0));
  return /*#__PURE__*/React.createElement('div', {
    style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.48)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  }, /*#__PURE__*/React.createElement('div', {
    style: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px 28px', width: '300px', maxWidth: '100%', textAlign: 'center', boxShadow: '0 16px 42px rgba(0,0,0,0.28)' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '6px' } }, title || '작업 처리 중...'),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.45 } }, detail || '서버 응답을 기다리고 있습니다.'),
    /*#__PURE__*/React.createElement('div', { style: { height: '9px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' } },
      /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: `${clamped}%`, background: 'linear-gradient(90deg, #4F46E5, #EC4899)', transition: 'width 0.35s ease', borderRadius: 'var(--radius-full)' } })
    ),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 800 } }, `${Math.round(clamped)}%`)
  ));
}

function ToggleSwitch({ checked, onChange, label }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    onClick: onChange,
    style: {
      width: '44px', height: '24px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
      backgroundColor: checked ? 'var(--accent-primary)' : '#CBD5E1',
      position: 'relative', transition: 'background-color 0.2s ease', padding: 0, flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
      width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFFFFF',
      transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }
  }));
}

function Footer() {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};

  return /*#__PURE__*/React.createElement('footer', { className: 'app-footer' },
    /*#__PURE__*/React.createElement('p', { className: 'app-footer-copyright' }, 'Copyright © 2026 모여라 캘린더. All Rights Reserved.'),
    /*#__PURE__*/React.createElement('div', { className: 'app-footer-family' },
      /*#__PURE__*/React.createElement('span', { className: 'app-footer-family-label' }, 'FAMILY LINK'),
      /*#__PURE__*/React.createElement('div', { className: 'app-footer-family-links' },
        FOOTER_FAMILY_LINKS.map(link => /*#__PURE__*/React.createElement('a', {
          key: link.url,
          href: link.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'app-footer-link'
        }, /*#__PURE__*/React.createElement(link.Icon, { size: 14 }), link.label))
      )
    )
  );
}

  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    ResizableModalContainer: ResizableModalContainer,
    AutoGrowTextarea: AutoGrowTextarea,
    FormAddEditActionButtons: FormAddEditActionButtons,
    SegmentedToggle: SegmentedToggle,
    ItemEditDeleteActions: ItemEditDeleteActions,
    GamifiedConfirmButtonContent: GamifiedConfirmButtonContent,
    LinkPreviewCard: LinkPreviewCard,
    LinkPreviewProgressOverlay: LinkPreviewProgressOverlay,
    DeleteConfirmModal: DeleteConfirmModal,
    AdminLoginGate: AdminLoginGate,
    DonutChart: DonutChart,
    ColorSwatchPicker: ColorSwatchPicker,
    StickyVideoBox: StickyVideoBox,
    PollVoterSheet: PollVoterSheet,
    OperationProgressOverlay: OperationProgressOverlay,
    ToggleSwitch: ToggleSwitch,
    Footer: Footer
  });
})();
