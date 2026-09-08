/**
 * Lightbox + LightboxInfoPanel (P4-3).
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getTodayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
/* __fb() bridge */
function __fb() {
  const deps = __gatherUiDeps();
  if (deps && typeof deps.getDb === 'function') {
    try { const d = deps.getDb(); if (d) return d; } catch (e) {}
  }
  return (typeof window !== 'undefined' && window.__gatherFirebaseDb) || null;
}

function getStoredChatParticipantId(...args) {
  const fn = (window.GATHER_APP_NOTIFICATIONS || {}).getStoredChatParticipantId;
  return typeof fn === 'function' ? fn(...args) : '';
}
function isValidDateString(...args) {
  const f = __gatherUiDeps().isValidDateString || GATHER_APP_UTILS.isValidDateString;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getImageFilesFromClipboardEvent(...args) {
  const f = __gatherUiDeps().getImageFilesFromClipboardEvent || GATHER_APP_UTILS.getImageFilesFromClipboardEvent;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getMediaIdentityKeys(...args) {
  const f = __gatherUiDeps().getMediaIdentityKeys || GATHER_APP_UTILS.getMediaIdentityKeys;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPhotoCommentIdentity(...args) {
  const f = __gatherUiDeps().getPhotoCommentIdentity || GATHER_APP_UTILS.getPhotoCommentIdentity;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getLegacyMeetingMediaKey(...args) {
  const f = __gatherUiDeps().getLegacyMeetingMediaKey || GATHER_APP_UTILS.getLegacyMeetingMediaKey;
  return typeof f === 'function' ? f(...args) : undefined;
}
// 메모 카드(MemoCard, ui-calendar-core.js)가 쓰는 것과 똑같은 댓글 스레드 UI/로직(참여자
// 선택 + 입력 + 편집/삭제, 3개 초과 시 접기)을 그대로 재현한 라이트박스 전용 버전. 데이터
// 모양도 동일하다 -- comments: [{id, participantId, text, createdAt, updatedAt?}],
// onCommentsChange(nextComments) 하나로 저장을 위임한다. MemoCard 쪽 로직은 이미 검증되어
// 실사용 중이라 건드리지 않았다(회귀 위험 최소화).
//
// 처음엔 ui-calendar-core.js에서 export해서 Lightbox가 window.GATHER_UI_COMPONENTS로 가져다
// 쓰게 했었는데, 실제 배포본에서는 이 두 파일이 서로 다른 코드 스플릿 청크로 나뉘어 있어서
// Lightbox가 먼저(또는 ui-calendar-core.js 청크가 아직 로드되기 전에) 렌더링되는 경로에서는
// CommentThread가 아예 없어 조용히 렌더링을 건너뛰었다 -- 라이트박스를 열어도 댓글 UI 자체가
// 통째로 안 보이는 버그였다. Lightbox와 항상 같은 청크에 있도록 이 파일로 옮겨서 그 문제를
// 원천적으로 없앴다.
function CommentThread({ comments = [], onCommentsChange, calendar, showToast, onRequestConfirm }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ChatParticipantSheet = __comp.ChatParticipantSheet || __deps.ChatParticipantSheet;
  const ParticipantPickerButton = __comp.ParticipantPickerButton || __deps.ParticipantPickerButton;
  const PencilIcon = __comp.PencilIcon || __deps.PencilIcon;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const AutoGrowTextarea = __comp.AutoGrowTextarea || __deps.AutoGrowTextarea;
  const sanitizeText = __deps.sanitizeText;

  const [commentText, setCommentText] = React.useState('');
  const [commentParticipantId, setCommentParticipantId] = React.useState(() => getStoredChatParticipantId(calendar?.id, calendar));
  const [isCommentPartOpen, setIsCommentPartOpen] = React.useState(false);
  const [editingCommentId, setEditingCommentId] = React.useState(null);
  const [isSavingComment, setIsSavingComment] = React.useState(false);
  const commentPart = (calendar?.participants || []).find(p => p.id === commentParticipantId);
  const COMMENT_COLLAPSE_LIMIT = 3;
  const [isCommentsExpanded, setIsCommentsExpanded] = React.useState(false);
  const hasMoreComments = comments.length > COMMENT_COLLAPSE_LIMIT;
  const visibleComments = (!hasMoreComments || isCommentsExpanded) ? comments : comments.slice(-COMMENT_COLLAPSE_LIMIT);

  const handleSaveComment = async (e) => {
    if (e) e.stopPropagation();
    const text = commentText.trim();
    if (!text || !commentParticipantId || isSavingComment) return;
    const now = Date.now();
    const wasEditing = !!editingCommentId;
    const nextComments = editingCommentId
      ? comments.map(c => c.id === editingCommentId ? { ...c, text, participantId: commentParticipantId, updatedAt: now } : c)
      : [...comments, { id: `cmt_${now}_${Math.random().toString(36).slice(2, 8)}`, participantId: commentParticipantId, text, createdAt: now }];
    setIsSavingComment(true);
    try {
      const saved = await Promise.resolve(onCommentsChange(nextComments));
      if (saved === false) return;
      setCommentText('');
      setEditingCommentId(null);
      if (typeof showToast === 'function') {
        showToast(wasEditing ? '댓글이 수정되었습니다' : '댓글이 등록되었습니다', 'success');
      }
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleCancelComment = e => {
    if (e) e.stopPropagation();
    setEditingCommentId(null);
    setCommentText('');
  };

  const handleStartEditComment = (e, comment) => {
    if (e) e.stopPropagation();
    setEditingCommentId(comment.id);
    setCommentText(comment.text);
    setCommentParticipantId(comment.participantId);
  };

  const handleDeleteComment = (e, comment) => {
    if (e) e.stopPropagation();
    const commentId = typeof comment === 'string' ? comment : comment?.id;
    if (!commentId) return;
    const target = typeof comment === 'object' && comment ? comment : comments.find(c => c.id === commentId);
    const author = (calendar?.participants || []).find(p => p.id === (target?.participantId || ''));
    const authorName = author?.name || '참여자';
    const snippet = sanitizeText(String(target?.text || ''), 40);
    const message = snippet
      ? `${authorName}님의 '${snippet}' 댓글을 삭제하시겠습니까?`
      : `${authorName}님의 댓글을 삭제하시겠습니까?`;
    const doDelete = async () => {
      const previousComments = comments.slice();
      const saved = await Promise.resolve(onCommentsChange(previousComments.filter(c => c.id !== commentId)));
      if (saved === false) return;
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setCommentText('');
      }
      if (typeof showToast === 'function') {
        showToast('댓글이 삭제되었습니다', 'delete', 5000, async () => {
          const restored = await Promise.resolve(onCommentsChange(previousComments));
          if (restored !== false && typeof showToast === 'function') showToast('댓글 삭제를 되돌렸습니다', 'success', 3000);
        });
      }
    };
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('댓글 삭제', message, doDelete);
    }
  };

  return /*#__PURE__*/React.createElement("div", { className: "lightbox-comment-thread", onClick: e => e.stopPropagation() },
    comments.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }
    },
      hasMoreComments && /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: e => { e.stopPropagation(); setIsCommentsExpanded(v => !v); },
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          alignSelf: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
          fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#94A3B8'
        }
      },
        /*#__PURE__*/React.createElement("svg", {
          width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2",
          strokeLinecap: "round", strokeLinejoin: "round",
          style: { transform: isCommentsExpanded ? 'none' : 'rotate(180deg)' }
        }, /*#__PURE__*/React.createElement("path", { d: "M6 9l6 6l6 -6" })),
        isCommentsExpanded ? '댓글 접기' : `댓글 더보기 (${comments.length - COMMENT_COLLAPSE_LIMIT}개)`
      ),
      visibleComments.map((comment, commentIdx) => {
        const author = (calendar?.participants || []).find(p => p.id === comment.participantId);
        return /*#__PURE__*/React.createElement("div", {
          key: comment.id,
          onClick: e => e.stopPropagation(),
          style: {
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 2px',
            borderTop: commentIdx > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none'
          }
        },
          /*#__PURE__*/React.createElement("span", {
            className: "memo-comment-author-dot",
            role: "img",
            tabIndex: 0,
            "aria-label": `${author?.name || '알 수 없는 작성자'} 작성자`,
            "data-author-name": author?.name || '알 수 없는 작성자',
            title: author?.name || '알 수 없는 작성자',
            style: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: author?.color || '#94A3B8', flexShrink: 0 }
          }),
          /*#__PURE__*/React.createElement("span", {
            style: { flex: 1, minWidth: 0, fontSize: 'var(--font-size-md)', color: '#E2E8F0', wordBreak: 'break-word' }
          }, comment.text),
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: e => handleStartEditComment(e, comment), title: "편집", "aria-label": "댓글 편집",
            style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#94A3B8', flexShrink: 0 }
          }, /*#__PURE__*/React.createElement(PencilIcon, { size: 12 })),
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: e => handleDeleteComment(e, comment), title: "삭제", "aria-label": "댓글 삭제",
            style: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#94A3B8', flexShrink: 0 }
          }, /*#__PURE__*/React.createElement(TrashIcon, { size: 12 }))
        );
      })
    ),

    /*#__PURE__*/React.createElement("div", {
      className: "comment-composer",
      onClick: e => e.stopPropagation(),
      style: { marginTop: comments.length > 0 ? '8px' : '0' }
    },
      AutoGrowTextarea && /*#__PURE__*/React.createElement(AutoGrowTextarea, {
        className: "comment-composer-input",
        value: commentText,
        onChange: e => setCommentText(e.target.value),
        onClick: e => e.stopPropagation(),
        onKeyDown: e => {
          e.stopPropagation();
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (e.nativeEvent && e.nativeEvent.isComposing) return;
            e.preventDefault();
            handleSaveComment(e);
          }
        },
        placeholder: "댓글을 입력하세요...",
        rows: 1,
        minHeight: 30,
        maxHeight: 200,
        style: {
          width: '100%',
          fontSize: '0.8rem',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 8px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          color: '#E2E8F0',
          outline: 'none',
          boxSizing: 'border-box'
        }
      }),
      /*#__PURE__*/React.createElement("div", { className: "comment-composer-footer" },
        /*#__PURE__*/React.createElement(ParticipantPickerButton, {
          participant: commentPart,
          onClick: () => setIsCommentPartOpen(true)
        }),
        /*#__PURE__*/React.createElement("div", { className: "comment-composer-buttons" },
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: handleCancelComment,
            style: {
              flexShrink: 0, height: '30px', padding: '0 12px', borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#CBD5E1',
              fontSize: 'var(--font-size-md)', fontWeight: 'bold', cursor: 'pointer'
            }
          }, "취소"),
          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: handleSaveComment,
            disabled: !commentText.trim() || !commentParticipantId || isSavingComment,
            style: {
              flexShrink: 0, height: '30px', padding: '0 12px', borderRadius: 'var(--radius-sm)', border: 'none',
              backgroundColor: 'var(--accent-primary)', color: '#FFFFFF', fontSize: 'var(--font-size-md)', fontWeight: 'bold',
              cursor: isSavingComment ? 'wait' : 'pointer', opacity: (commentText.trim() && commentParticipantId && !isSavingComment) ? 1 : 0.5
            }
          }, isSavingComment ? "저장 중…" : "저장")
        )
      )
    ),

    isCommentPartOpen && /*#__PURE__*/React.createElement(ChatParticipantSheet, {
      calendar: calendar,
      selectedId: commentParticipantId,
      onSelect: id => { setCommentParticipantId(id); setIsCommentPartOpen(false); },
      onClose: () => setIsCommentPartOpen(false)
    })
  );
}


// 공통 하단 패널 래퍼 -- 라이트박스 전체에서 표준으로 쓰는 배경/그라디언트/모양을 한 곳에
// 모아둔다(모듈화). LightboxInfoPanel(메타데이터)과 LightboxTagPanel(태그) 둘 다 이 래퍼를
// 그대로 재사용해 두 패널이 서로 다른 시점에 열려도 항상 같은 모양으로 보이게 한다.
function LightboxBottomPanel({ children }) {
  const React = window.React;
  return /*#__PURE__*/React.createElement("div", {
    className: "lightbox-info-panel",
    style: {
      position: 'absolute', left: 0, right: 0, bottom: 0, minWidth: '190px',
      padding: '34px 14px 12px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.84) 55%, rgba(0,0,0,0.5) 82%, transparent)',
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      color: '#FFFFFF', fontSize: 'var(--font-size-sm)', lineHeight: 1.7,
      display: 'flex', flexDirection: 'column', gap: '4px',
      pointerEvents: 'auto'
    },
    onClick: e => e.stopPropagation(),
    onMouseDown: e => e.stopPropagation(),
    onTouchStart: e => e.stopPropagation()
  }, children);
}

// "i" 버튼으로 여는 메타데이터 패널 -- 업로드 날짜/출처/파일정보와 (추억 상세에서 열린 경우)
// "이 추억에서 제거" 버튼만 보여준다. 태그와 URL 버튼은 각각 LightboxTagPanel과 좌측 상단
// 상시 노출 URL 버튼으로 옮겨갔다.
export function LightboxInfoPanel({ info, sourceInfo = null, onRemoveFromMemory = null, isRemovingFromMemory = false }) {
  const React = window.React;
  if (!info.dateLabel && !info.typeLabel && !sourceInfo && !onRemoveFromMemory) return null;
  const labelStyle = { opacity: 0.7, flexShrink: 0, minWidth: '52px' };
  return /*#__PURE__*/React.createElement(LightboxBottomPanel, null,
    info.dateLabel && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
      /*#__PURE__*/React.createElement("span", { style: labelStyle }, "업로드"),
      /*#__PURE__*/React.createElement("span", { style: { wordBreak: 'break-all' } }, info.dateLabel)
    ),
    sourceInfo && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      /*#__PURE__*/React.createElement("span", { style: labelStyle }, "출처"),
      sourceInfo.onClick
        ? /*#__PURE__*/React.createElement("button", {
          type: "button",
          onClick: e => { e.stopPropagation(); sourceInfo.onClick(); },
          style: {
            border: 'none', background: 'none', padding: 0, color: '#93C5FD', fontSize: 'inherit',
            fontWeight: 800, textDecoration: 'underline', cursor: 'pointer'
          }
        }, sourceInfo.label)
        : /*#__PURE__*/React.createElement("span", null, sourceInfo.label)
    ),
    info.typeLabel && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }
    },
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 } },
        info.typeLabel && /*#__PURE__*/React.createElement(React.Fragment, null,
          /*#__PURE__*/React.createElement("span", { style: labelStyle }, "파일정보"),
          /*#__PURE__*/React.createElement("span", {
            style: {
              display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: 'var(--radius-full)',
              border: '1px solid #FFFFFF', color: '#FFFFFF', fontSize: 'var(--font-size-xs)', fontWeight: 800
            }
          }, info.typeLabel),
          /*#__PURE__*/React.createElement("span", null, "/"),
          /*#__PURE__*/React.createElement("span", null, info.sizeLabel || '-'),
          /*#__PURE__*/React.createElement("span", null, "/"),
          /*#__PURE__*/React.createElement("span", null, info.dimensionLabel || '-')
        )
      ),
    ),
    onRemoveFromMemory && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => { e.stopPropagation(); onRemoveFromMemory(); },
      disabled: isRemovingFromMemory,
      style: {
        marginTop: '6px', width: '100%', height: '32px', borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(255,255,255,0.32)', background: 'rgba(255,255,255,0.1)',
        color: '#FFFFFF', fontSize: 'var(--font-size-sm)', fontWeight: 800, cursor: 'pointer',
        opacity: isRemovingFromMemory ? 0.55 : 1
      }
    }, isRemovingFromMemory ? '제거 중...' : '이 추억에서 제거')
  );
}

// 사진을 탭하면 여는 태그 패널 -- 해시태그 목록과 태그입력만 보여준다. URL 버튼은 좌측 상단
// 상시 노출 URL 버튼으로 옮겨갔으므로 여기서는 렌더링하지 않는다.
export function LightboxTagPanel({ tags = '', onSaveTags, onSearchTag, showToast }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const TrashIcon = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrashIcon) || __deps.TrashIcon;
  const ConfirmDialog = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.ConfirmDialog) || __deps.ConfirmDialog;

  const tagTokens = String(tags || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean);
  const [tagInput, setTagInput] = React.useState('');
  const [isSavingTags, setIsSavingTags] = React.useState(false);
  const [confirmDeleteTag, setConfirmDeleteTag] = React.useState(null);
  const [isDeletingTag, setIsDeletingTag] = React.useState(false);
  const tagInputRef = React.useRef(null);
  // Keep the draft while navigating between photos. The lightbox intentionally reuses this
  // panel so a user can tap a photo once, then enter tags continuously with previous/next.
  if (tagTokens.length === 0 && !onSaveTags) return null;
  const MAX_TAGS = 10;
  const handleSaveTags = async () => {
    if (isSavingTags) return;
    if (!onSaveTags) {
      if (typeof showToast === 'function') showToast('이 사진에는 태그를 저장할 수 없습니다.', 'error');
      return;
    }
    // Prefer controlled state, but fall back to the DOM value so a Korean IME composition that
    // has not yet flushed through onChange (common when tapping 저장 mid-composition) still saves.
    const rawInput = String(tagInput || (tagInputRef.current && tagInputRef.current.value) || '');
    const newTokens = rawInput.split(/[,\s#]+/).map(t => t.trim()).filter(Boolean);
    if (newTokens.length === 0) {
      if (typeof showToast === 'function') showToast('태그를 입력해 주세요.', 'error');
      return;
    }
    // Merge with existing, deduplicate, enforce limit
    const merged = Array.from(new Set([...tagTokens, ...newTokens]));
    if (merged.length > MAX_TAGS) {
      // Check if any of the new tokens would actually be added
      const wouldAdd = newTokens.filter(t => !tagTokens.includes(t));
      if (tagTokens.length >= MAX_TAGS || (tagTokens.length + wouldAdd.length) > MAX_TAGS) {
        if (typeof showToast === 'function') showToast('태그는 최대 10개 저장 가능', 'error');
        return;
      }
    }
    const finalTags = merged.slice(0, MAX_TAGS);
    setIsSavingTags(true);
    try {
      const saved = await onSaveTags(finalTags.join(' '));
      if (saved === false) {
        if (typeof showToast === 'function') showToast('태그 저장 실패', 'error');
        return;
      }
      setTagInput('');
    } catch (err) {
      console.error('Lightbox tag save failed:', err);
      if (typeof showToast === 'function') showToast('태그 저장 실패', 'error');
    } finally {
      setIsSavingTags(false);
    }
  };
  const handleConfirmDeleteTag = async () => {
    if (!onSaveTags || !confirmDeleteTag || isDeletingTag) return;
    setIsDeletingTag(true);
    try {
      const saved = await onSaveTags(tagTokens.filter(t => t !== confirmDeleteTag).join(' '));
      if (saved !== false) setConfirmDeleteTag(null);
    } catch (err) {
      console.error('Lightbox tag delete failed:', err);
      if (typeof showToast === 'function') showToast('태그 삭제 실패', 'error');
    } finally {
      setIsDeletingTag(false);
    }
  };
  const labelStyle = { opacity: 0.7, flexShrink: 0, minWidth: '52px' };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(LightboxBottomPanel, null,
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 } },
      /*#__PURE__*/React.createElement("span", { style: labelStyle }, "해시태그"),
      tagTokens.map(tag => /*#__PURE__*/React.createElement("span", {
        key: tag,
        className: "lightbox-tag-badge",
        onClick: () => onSearchTag && onSearchTag(tag),
        style: {
          display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-full)',
          padding: '3px 4px 3px 10px', fontSize: 'var(--font-size-sm)', fontWeight: 900, lineHeight: 1,
          border: '1px solid #FFFFFF', color: '#FFFFFF', background: 'transparent',
          cursor: onSearchTag ? 'pointer' : 'default'
        }
      }, `#${tag}`, onSaveTags && /*#__PURE__*/React.createElement("button", {
        type: "button",
        title: `#${tag} 태그 삭제`,
        "aria-label": `#${tag} 태그 삭제`,
        onClick: e => { e.stopPropagation(); setConfirmDeleteTag(tag); },
        style: {
          width: '22px', height: '22px', minWidth: '22px', border: 0, borderRadius: '50%',
          background: '#FFFFFF', color: 'var(--text-main)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer',
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement(TrashIcon, { size: 13 }))))
    ),
    onSaveTags && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }
    },
      /*#__PURE__*/React.createElement("span", { style: labelStyle }, "태그입력"),
      /*#__PURE__*/React.createElement("input", {
        type: "text",
        className: "lightbox-tag-input",
        ref: tagInputRef,
        value: tagInput,
        onChange: e => setTagInput(e.target.value),
        onCompositionEnd: e => setTagInput(e.target.value),
        onKeyDown: e => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveTags();
          }
        },
        // 모바일 가상 키보드가 이 입력을 "다음(next)" 필드로 넘어가는 것으로 오인해, 리턴키를
        // 누르면 태그가 저장되기 전에 포커스가 아래 댓글 입력창으로 넘어가버리는 문제가 있었다.
        // 태그는 한 번에 짧게 입력하고 바로 저장하는 용도라 "완료"로 명시해 다음 필드로 넘어가지
        // 않게 한다.
        enterKeyHint: "done",
        placeholder: tagTokens.length >= 10 ? "태그 최대 10개 도달" : `태그 입력 (${tagTokens.length}/10)`,
        maxLength: 100,
        style: {
          flex: 1, minWidth: 0, height: '28px', padding: '0 8px', borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255,255,255,0.32)', background: 'rgba(255,255,255,0.14)',
          color: '#FFFFFF', fontSize: 'var(--font-size-sm)'
        }
      }),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onMouseDown: e => e.stopPropagation(),
        onTouchStart: e => e.stopPropagation(),
        onClick: e => { e.stopPropagation(); handleSaveTags(); },
        disabled: isSavingTags || tagTokens.length >= 10,
        style: {
          flexShrink: 0, height: '28px', padding: '0 10px', borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255,255,255,0.32)', background: 'rgba(255,255,255,0.22)',
          color: '#FFFFFF', fontSize: 'var(--font-size-sm)', fontWeight: 800, cursor: 'pointer',
          opacity: (isSavingTags || tagTokens.length >= 10) ? 0.45 : 1
        }
      }, isSavingTags ? '...' : '저장')
    )
  ), confirmDeleteTag && /*#__PURE__*/React.createElement(ConfirmDialog, {
    title: "해시태그 삭제",
    message: `#${confirmDeleteTag} 태그를 삭제하시겠습니까?`,
    onConfirm: handleConfirmDeleteTag,
    onCancel: () => setConfirmDeleteTag(null)
  }));
}

// PC-only zoom controls for the photo action row -- scoped to this file since they're not part
// of the shared icon set used elsewhere. Zoom-out is the same lucide zoom-in glyph minus its
// vertical stroke (matching lucide's own zoom-in/zoom-out pair).
function ZoomInIcon({ size = 15 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
    /*#__PURE__*/React.createElement("line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }),
    /*#__PURE__*/React.createElement("line", { x1: "11", x2: "11", y1: "8", y2: "14" }),
    /*#__PURE__*/React.createElement("line", { x1: "8", x2: "14", y1: "11", y2: "11" })
  );
}
function ZoomOutIcon({ size = 15 } = {}) {
  const React = window.React;
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: String(size), height: String(size), viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  },
    /*#__PURE__*/React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
    /*#__PURE__*/React.createElement("line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }),
    /*#__PURE__*/React.createElement("line", { x1: "8", x2: "14", y1: "11", y2: "11" })
  );
}

// Must match the `transform ${LIGHTBOX_TRANSITION_MS}ms ease` set on the slide track below.
// handleTrackTransitionEnd already commits the pending nav exactly when that CSS transition
// finishes -- the setTimeout fallbacks (for the rare case a transitionend event never fires,
// e.g. the element is hidden mid-transition) used to fire at a shorter, unrelated 240ms, which
// beat transitionend every time and cut the slide animation short by ~40ms on every single
// navigation. Giving the timeout a safety margin past the real duration means transitionend
// normally wins and the timeout is only ever a backstop.
const LIGHTBOX_TRANSITION_MS = 230;
const LIGHTBOX_TRANSITION_FALLBACK_MS = LIGHTBOX_TRANSITION_MS + 90;
const LIGHTBOX_TRANSITION_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

export function Lightbox({ urls, index, onClose, onNavigate, meta, calendar = null, showToast, onPromoteImageUrl, onSaveImageTags, onSearchTag, onDeletePhoto, onReplacePhoto, onJumpToChatMessage, onJumpToMemo, onJumpToMeetingDate, onJumpToGallery, onGetChatMessageOrdinal, onGetGalleryPhotoOrdinal, onRequestConfirm, onRemoveFromMemory = null, onFetchPhotoComments = null, onSavePhotoComments = null, preloadedPhotoComments = {}, preloadedPhotoCommentsReady = false }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const TrashIcon = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.TrashIcon) || __deps.TrashIcon;
  const PencilIcon = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.PencilIcon) || __deps.PencilIcon;
  const LinkIcon = (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LinkIcon) || __deps.LinkIcon;
  const ImageUrlModal = __deps.ImageUrlModal;
  const LightboxInfoPanel = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.LightboxInfoPanel;
  const buildLightboxImageInfo = __deps.buildLightboxImageInfo;

  const total = urls.length;
  // Two independent bottom panels, each with its own trigger -- the "i" button opens the
  // metadata panel (업로드/출처/파일정보), tapping the photo opens the tag panel (해시태그/태그
  // 입력). Both anchor to the same bottom-of-image spot, so opening one closes the other instead
  // of letting them stack on top of each other.
  const [showInfo, setShowInfo] = React.useState(false);
  const [showTags, setShowTags] = React.useState(false);
  const toggleShowInfo = () => setShowInfo(prev => {
    const next = !prev;
    if (next) setShowTags(false);
    return next;
  });
  const toggleShowTags = () => setShowTags(prev => {
    const next = !prev;
    if (next) setShowInfo(false);
    return next;
  });
  const [imageUrlModalOpen, setImageUrlModalOpen] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState({});
  const [displayUrls, setDisplayUrls] = React.useState(urls);
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);
  // Zoom is PC-only -- mobile already has native pinch-to-zoom on the image, and a live
  // matchMedia listener (not a one-time read) so the buttons correctly appear/disappear if a
  // desktop window is resized narrow or a tablet is rotated while the lightbox is open.
  const [isDesktop, setIsDesktop] = React.useState(() => typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(max-width: 640px)').matches);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsDesktop(!mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);
  // ZOOM_DEFAULT (100%, fit-view) is the neutral/reset value -- ZOOM_MIN lets the user zoom
  // further OUT than that too (shrinking the photo within its frame), so it's no longer the
  // floor the way it was when 100% was both the minimum and the default.
  const ZOOM_MIN = 50;
  const ZOOM_MAX = 300;
  const ZOOM_STEP = 25;
  const ZOOM_DEFAULT = 100;
  const [zoomLevel, setZoomLevel] = React.useState(ZOOM_DEFAULT);
  // Drag-to-pan once zoomed past fit-view -- panOffset is a screen-pixel translate applied
  // before the scale (see zoomImageStyle below), so it stays 1:1 with cursor movement regardless
  // of zoom level. Reset to {0,0} on every zoom-button click rather than trying to re-clamp the
  // existing offset against the new scale -- simpler and avoids the image appearing to jump to
  // an now-invalid position when zooming out.
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const zoomedImgRef = React.useRef(null);
  const panStartRef = React.useRef(null);
  const isPanningRef = React.useRef(false);
  // Reset to 100% whenever the visible photo changes, so zoom never carries over onto a
  // different image (which would show it pre-cropped/enlarged with no visual cue why).
  React.useEffect(() => { setZoomLevel(ZOOM_DEFAULT); setPanOffset({ x: 0, y: 0 }); }, [index]);
  const handleZoomIn = e => {
    e.stopPropagation();
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(prev => Math.min(ZOOM_MAX, prev + ZOOM_STEP));
  };
  const handleZoomOut = e => {
    e.stopPropagation();
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(prev => Math.max(ZOOM_MIN, prev - ZOOM_STEP));
  };
  // Clicking the percentage readout itself jumps straight back to 100%, regardless of which
  // direction it was zoomed.
  const handleZoomReset = e => {
    e.stopPropagation();
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(ZOOM_DEFAULT);
  };
  // Clamped so the image can't be dragged entirely off-screen -- bounds come from the actual
  // rendered (post-scale) image box vs. the lightbox's own viewport cap (92vw / 82vh, matching
  // the maxWidth/maxHeight used everywhere below), not a fixed guess, so it works the same at
  // any zoom level or original photo aspect ratio. Gated on ZOOM_DEFAULT rather than ZOOM_MIN --
  // below 100% the photo is smaller than its frame with nothing to pan to, so panning only makes
  // sense once zoomed in past fit-view.
  const handlePanStart = (clientX, clientY) => {
    if (zoomLevel <= ZOOM_DEFAULT) return;
    panStartRef.current = { x: clientX, y: clientY, startX: panOffset.x, startY: panOffset.y };
    isPanningRef.current = true;
    wasDraggedRef.current = false;
    setIsPanning(true);
  };
  const handlePanMove = (clientX, clientY) => {
    if (!isPanningRef.current || !panStartRef.current) return;
    if (Math.abs(clientX - panStartRef.current.x) > 5 || Math.abs(clientY - panStartRef.current.y) > 5) {
      // Reuses the same ref handleImageTap already checks to distinguish a drag from a tap, so
      // releasing the mouse after panning doesn't also toggle the info panel off.
      wasDraggedRef.current = true;
    }
    const el = zoomedImgRef.current;
    const rect = el ? el.getBoundingClientRect() : null;
    const area = imgAreaRef.current;
    const areaRect = area ? area.getBoundingClientRect() : null;
    const maxOffsetX = rect ? Math.max(0, (rect.width - (areaRect?.width || window.innerWidth * 0.92)) / 2) : 0;
    const maxOffsetY = rect ? Math.max(0, (rect.height - (areaRect?.height || window.innerHeight * 0.82)) / 2) : 0;
    const rawX = panStartRef.current.startX + (clientX - panStartRef.current.x);
    const rawY = panStartRef.current.startY + (clientY - panStartRef.current.y);
    setPanOffset({
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, rawX)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, rawY))
    });
  };
  const handlePanEnd = () => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    panStartRef.current = null;
    setIsPanning(false);
  };
  const handleZoomedImageMouseDown = e => {
    if (!isDesktop || zoomLevel <= ZOOM_DEFAULT) return;
    e.stopPropagation();
    handlePanStart(e.clientX, e.clientY);
  };
  const zoomImageStyle = zoomLevel !== ZOOM_DEFAULT
    ? {
        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
        transition: isPanning ? 'none' : 'transform 150ms ease',
        cursor: isPanning ? 'grabbing' : 'grab'
      }
    : undefined;
  const lightboxHistoryRef = React.useRef(false);
  React.useEffect(() => {
    try {
      window.history.pushState({ ...(window.history.state || {}), __moyeoraLightbox: true }, '', window.location.href);
      lightboxHistoryRef.current = true;
    } catch (e) {
      lightboxHistoryRef.current = false;
    }
    const handlePopState = () => {
      lightboxHistoryRef.current = false;
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      lightboxHistoryRef.current = false;
    };
  }, []);
  const closeLightbox = () => {
    if (lightboxHistoryRef.current && window.history.state && window.history.state.__moyeoraLightbox) {
      window.history.back();
      return;
    }
    onClose();
  };
  React.useEffect(() => { setDisplayUrls(urls); }, [urls]);
  // Metadata is photo-specific, but tag editing stays active while moving through the lightbox
  // so consecutive photos can be tagged without reopening the panel each time.
  React.useEffect(() => { setShowInfo(false); setImageLoadFailed(false); }, [index]);
  const currentUrl = displayUrls[index] || urls[index];
  React.useEffect(() => {
    setImageLoadFailed(false);
  }, [currentUrl]);
  const currentInfo = React.useMemo(
    () => {
      const base = buildLightboxImageInfo(currentUrl, meta && meta[index] && meta[index].timestamp);
      const size = imageDimensions[currentUrl];
      return {
        ...base,
        dimensionLabel: size ? `${size.width} × ${size.height}px` : null
      };
    },
    [currentUrl, index, meta, imageDimensions]
  );
  // meta is a static snapshot handed in when the Lightbox was opened (built once from
  // chatMessages at click time), so it never reflects a tag save/delete that happens while the
  // Lightbox stays open on the same image -- track successful saves here so the info panel
  // shows the result immediately instead of only after the Lightbox is closed and reopened.
  const [tagOverrides, setTagOverrides] = React.useState({});
  const currentMeta = Array.isArray(meta) ? (meta[index] || {}) : (meta || {});
  // Never trust a duplicated legacy identity when the rendered assets are different.  A few
  // upload/import paths historically copied the first image's messageId/imageIndex into every
  // metadata row; using that key here made one Firestore comment document appear on the whole
  // batch.  Qualify such collisions with the rendered URL so each visible asset has its own
  // deterministic thread until the source metadata is repaired.
  const identityInput = { ...currentMeta, full: currentMeta.full || currentUrl, imageUrl: currentMeta.imageUrl || currentUrl };
  const identityItems = Array.isArray(meta)
    ? meta.map((item, itemIndex) => ({ ...(item || {}), full: item?.full || displayUrls[itemIndex] || urls[itemIndex] || item?.imageUrl || item?.thumb || '' }))
    : [];
  const currentIdentity = getPhotoCommentIdentity(identityInput, identityItems, { source: currentMeta.source, meetingDate: currentMeta.meetingDate })
    || getMediaIdentityKeys(identityInput, { source: currentMeta.source, meetingDate: currentMeta.meetingDate }) || {};
  // 사진 댓글 -- mediaKey/refKey(currentIdentity, 항상 값이 있음)를 사진의 안정적인 식별자로
  // 써서 calendars/cal_{id}/photoComments 문서 하나에 매칭한다(app-main.js의
  // handleFetchPhotoComments/handleSavePhotoComments). 여러 장을 스와이프해도 슬라이드별로
  // 따로 캐싱해서, 이미 한 번 불러온 사진은 다시 불러오지 않는다. 초기화면에서부터 기존 댓글이
  // 바로 보여야 하므로(showInfo 토글과 무관하게) 현재 사진이 바뀔 때마다 불러온다.
  const photoCommentKey = currentIdentity.mediaKey || currentIdentity.refKey || '';
  const legacyPhotoCommentKeys = Array.from(new Set([
    ...(Array.isArray(currentIdentity.legacyKeys) ? currentIdentity.legacyKeys : []),
    ...(Array.isArray(currentMeta.legacyKeys) ? currentMeta.legacyKeys : []),
    currentMeta ? (getLegacyMeetingMediaKey(currentMeta, { meetingDate: currentMeta.meetingDate }) || '') : ''
  ].filter(key => key && key !== photoCommentKey)));
  const legacyPhotoCommentKeysToken = legacyPhotoCommentKeys.join('|');
  const getPreloadedComments = () => {
    const keys = [photoCommentKey, ...legacyPhotoCommentKeys].filter(Boolean);
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(preloadedPhotoComments || {}, key)) continue;
      const comments = preloadedPhotoComments[key];
      if (Array.isArray(comments) && comments.length > 0) return comments;
    }
    return preloadedPhotoCommentsReady ? [] : null;
  };
  // A meeting photo whose comment thread predates photoId/sourceImageIndex being part of the
  // key (see getLegacyMeetingMediaKey) is filed under this coarser key instead -- checked only
  // when the current key comes up empty, so its existing comments still surface here.
  const initialPreloadedComments = getPreloadedComments();
  const [photoCommentsByKey, setPhotoCommentsByKey] = React.useState(() => initialPreloadedComments !== null
    ? { [photoCommentKey]: initialPreloadedComments }
    : {});
  const [photoCommentsStatusByKey, setPhotoCommentsStatusByKey] = React.useState(() => initialPreloadedComments !== null
    ? { [photoCommentKey]: 'ready' }
    : {});
  const photoCommentsFetchedRef = React.useRef(new Set());
  const photoCommentsFetchRef = React.useRef(onFetchPhotoComments);
  const [photoCommentsRetryToken, setPhotoCommentsRetryToken] = React.useState(0);
  React.useEffect(() => { photoCommentsFetchRef.current = onFetchPhotoComments; }, [onFetchPhotoComments]);
  React.useEffect(() => {
    if (!photoCommentKey) return;
    const preloaded = getPreloadedComments();
    if (preloaded !== null) {
      setPhotoCommentsByKey(prev => ({ ...prev, [photoCommentKey]: preloaded }));
      setPhotoCommentsStatusByKey(prev => ({ ...prev, [photoCommentKey]: 'ready' }));
      return;
    }
    if (typeof photoCommentsFetchRef.current !== 'function') {
      setPhotoCommentsStatusByKey(prev => ({ ...prev, [photoCommentKey]: 'ready' }));
      return;
    }
    if (photoCommentsFetchedRef.current.has(photoCommentKey)) return;
    photoCommentsFetchedRef.current.add(photoCommentKey);
    setPhotoCommentsStatusByKey(prev => ({ ...prev, [photoCommentKey]: 'loading' }));
    let cancelled = false;
    let completed = false;
    const normalizeCommentsResult = value => {
      if (Array.isArray(value)) return { success: true, comments: value };
      if (value && typeof value === 'object') {
        return { success: value.success !== false, comments: Array.isArray(value.comments) ? value.comments : [] };
      }
      return { success: false, comments: [] };
    };
    const fetchWithTimeout = key => Promise.race([
      Promise.resolve(photoCommentsFetchRef.current(key)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('photo comments timeout')), 8000))
    ]);
    fetchWithTimeout(photoCommentKey).then(async result => {
      const normalized = normalizeCommentsResult(result);
      const success = normalized.success;
      if (!success) {
        if (!cancelled) setPhotoCommentsStatusByKey(prev => ({ ...prev, [photoCommentKey]: 'error' }));
        return;
      }
      let resolved = normalized.comments;
      if (resolved.length === 0) {
        for (const legacyKey of legacyPhotoCommentKeys) {
          const legacyResult = await fetchWithTimeout(legacyKey);
          const legacyNormalized = normalizeCommentsResult(legacyResult);
          if (legacyNormalized.success && legacyNormalized.comments.length > 0) {
            resolved = legacyNormalized.comments;
            break;
          }
        }
      }
      if (!cancelled && Array.isArray(resolved)) {
        completed = true;
        setPhotoCommentsByKey(prev => ({ ...prev, [photoCommentKey]: resolved }));
        setPhotoCommentsStatusByKey(prev => ({ ...prev, [photoCommentKey]: 'ready' }));
      }
    }).catch(() => {
      if (!cancelled) {
        photoCommentsFetchedRef.current.delete(photoCommentKey);
        setPhotoCommentsStatusByKey(prev => ({ ...prev, [photoCommentKey]: 'error' }));
      }
    });
    return () => {
      cancelled = true;
      if (!completed) photoCommentsFetchedRef.current.delete(photoCommentKey);
    };
  }, [photoCommentKey, legacyPhotoCommentKeysToken, preloadedPhotoComments, preloadedPhotoCommentsReady, photoCommentsRetryToken]);
  const handlePhotoCommentsChange = async nextComments => {
    if (!photoCommentKey || typeof onSavePhotoComments !== 'function') return false;
    if (photoCommentsStatusByKey[photoCommentKey] !== 'ready') {
      if (typeof showToast === 'function') showToast('댓글을 불러오는 중이거나 조회에 실패했습니다. 다시 열어주세요.', 'error');
      return false;
    }
    const previous = photoCommentsByKey[photoCommentKey] || [];
    setPhotoCommentsByKey(prev => ({ ...prev, [photoCommentKey]: nextComments }));
    try {
      const saved = await Promise.resolve(onSavePhotoComments(photoCommentKey, nextComments));
      if (saved === false) {
        setPhotoCommentsByKey(prev => ({ ...prev, [photoCommentKey]: previous }));
        return false;
      }
      return saved;
    } catch (err) {
      setPhotoCommentsByKey(prev => ({ ...prev, [photoCommentKey]: previous }));
      throw err;
    }
  };
  // 댓글은 라이트박스 안에서만 쓰고 볼 수 있어야 한다는 요구사항에 맞춰 여기서만 렌더링하지만,
  // "초기화면에서 바로 보여야 한다"는 요구에 맞춰 showInfo(정보 패널) 토글과는 무관하게 사진 박스와
  // 페이지네이션 사이에 항상 자리를 갖는다 -- 기본 라이트박스가 어둡기 때문에 배경/글자색도 별도로
  // 어둡게 강제한다(라이트박스 전용으로 완전히 분리된 컴포넌트라 memo 쪽 라이트 테마와 무관).
  const renderCommentThread = () => {
    if (zoomLevel !== ZOOM_DEFAULT) return null;
    const commentStatus = photoCommentsStatusByKey[photoCommentKey];
    return /*#__PURE__*/React.createElement("div", {
      key: `comments-${photoCommentKey}`,
      className: "lightbox-comment-thread lightbox-comment-thread-dark",
      style: {
        width: '92vw',
        // Ready threads size to their comment count + composer. A fixed minHeight here used to
        // keep a tall empty band under sparse threads; only loading/error keep a tap target floor.
        minHeight: commentStatus === 'ready' ? undefined : (isDesktop ? '64px' : '58px'),
        maxHeight: isDesktop ? '55vh' : 'none',
        overflowY: isDesktop ? 'auto' : 'visible', resize: isDesktop ? 'vertical' : 'none',
        marginTop: isDesktop ? '4px' : '0', padding: isDesktop ? '10px 14px' : '6px 10px',
        flexShrink: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 'var(--radius-md)', boxSizing: 'border-box'
      }
    }, commentStatus === 'ready' ? /*#__PURE__*/React.createElement(CommentThread, {
      key: `comment-thread-${photoCommentKey}`,
      comments: photoCommentsByKey[photoCommentKey] || [],
      onCommentsChange: handlePhotoCommentsChange,
      calendar: calendar,
      showToast: showToast,
      onRequestConfirm: onRequestConfirm
    }) : /*#__PURE__*/React.createElement("div", {
      style: { minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 'var(--font-size-sm)' }
    }, commentStatus === 'error' ? /*#__PURE__*/React.createElement("button", {
      type: "button", onClick: () => setPhotoCommentsRetryToken(value => value + 1),
      style: { minHeight: '44px', padding: '0 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontWeight: 700, cursor: 'pointer' }
    }, '댓글 다시 불러오기') : '댓글을 불러오는 중입니다...'));
  };
  // 'meeting' entries never carry a messageId (they're archival copies stored on the
  // confirmedMeeting record, not a chat message -- see linkTaggedImageToMeetingDates in
  // app-main.js), so they need meetingDate+photoId to identify which photo instead. 'memo'
  // entries DO carry a truthy messageId (the memo's own id), but that id only resolves against
  // memos via memo.imageTags[imageIndex] (see handleSaveImageTags memo branch in app-main.js).
  const isMeetingPhoto = currentMeta?.source === 'meeting' && !!currentMeta?.meetingDate && !!currentMeta?.photoId;
  const isMeetingTagTarget = currentMeta?.source === 'meeting' && !!currentMeta?.meetingDate && (
    (!!currentMeta?.sourceMessageId && Number.isInteger(currentMeta?.sourceImageIndex))
    || !!currentMeta?.photoId
  );
  // A photo uploaded from the meeting composer is still stored as a normal messages document.
  // It has source="meeting" but no meetingDate/photoId until (and unless) it is linked into a
  // confirmed meeting. Treat its own messageId/index as the editable tag target.
  // Photo-index / REST payloads sometimes deliver imageIndex as a numeric string. Coerce once so
  // canEditTags and the save path agree (strict Number.isInteger used to enable 저장 via
  // messageId, then handleSaveImageTags returned false with no toast).
  const toTagImageIndex = value => {
    if (Number.isInteger(value)) return value;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
  };
  const currentImageIndex = toTagImageIndex(currentMeta?.imageIndex);
  const currentSourceImageIndex = toTagImageIndex(currentMeta?.sourceImageIndex);
  const isMeetingMessageTagTarget = currentMeta?.source === 'meeting'
    && !!currentMeta?.messageId
    && currentImageIndex != null;
  // Anniversary photos live on the anniversary doc's photos[] array (not a chat message), so
  // they identify by anniversaryId + imageIndex -- same shape handleSaveAnniversaryPhotoTags
  // expects in app-main.js.
  const isAnniversaryPhoto = currentMeta?.source === 'anniversary' && !!currentMeta?.anniversaryId && currentImageIndex != null;
  // meeting / anniversary / memo have explicit targets; chat + gallery (+ untagged directMedia)
  // need a real messageId. Gallery photo-index rows use source:'gallery' but still store tags on
  // the underlying messages document.
  const canEditTags = currentMeta && (
    currentMeta.source === 'meeting' ? (isMeetingTagTarget || isMeetingMessageTagTarget) :
    currentMeta.source === 'anniversary' ? isAnniversaryPhoto :
    currentMeta.source === 'memo' ? (!!currentMeta.messageId && currentImageIndex != null) :
    currentMeta.messageId != null
  );
  const tagOverrideKey = currentMeta
    ? [
        'lb',
        currentMeta.messageId || currentMeta.sourceMessageId || currentMeta.anniversaryId || '',
        currentImageIndex != null
          ? currentImageIndex
          : (currentSourceImageIndex != null ? currentSourceImageIndex : ''),
        currentUrl || currentMeta.directMediaUrl || currentMeta.thumb || '',
        currentMeta.photoId || currentMeta.meetingDate || currentMeta.anniversaryId || ''
      ].join('::')
    : null;
  const currentTags = (tagOverrideKey && Object.prototype.hasOwnProperty.call(tagOverrides, tagOverrideKey))
    ? tagOverrides[tagOverrideKey]
    : (currentMeta?.tags || '');
  // Mirrors handleSaveImageTags' own parse/dedupe/limit rules so the optimistic override shown
  // here matches what actually got persisted, without needing the save call to round-trip it.
  const normalizeTagsForDisplay = text => Array.from(new Set(
    String(text || '').split(/[,\s#]+/).map(t => t.trim()).filter(Boolean)
  )).slice(0, 10).join(' ');
  const saveCurrentTags = onSaveImageTags && canEditTags
    ? async tagsText => {
        const ok = await onSaveImageTags(currentMeta.messageId, currentImageIndex, tagsText, {
          ...currentMeta,
          imageIndex: currentImageIndex,
          sourceImageIndex: currentSourceImageIndex,
          imageUrl: currentUrl
        });
        if (ok && tagOverrideKey) setTagOverrides(prev => ({ ...prev, [tagOverrideKey]: normalizeTagsForDisplay(tagsText) }));
        return ok;
      }
    : null;
  // Memo photos support delete/replace and per-photo tags (imageTags[imageIndex]).
  const canEditPhoto = !!(currentMeta && !currentMeta.directMediaUrl && (
    currentMeta.source === 'meeting' ? isMeetingPhoto : currentMeta.messageId != null
  ));
  // "채팅 #117" -- the message's 1-based position in the calendar's full chat history, fetched
  // on demand (Firestore count() aggregate, independent of how much chat history the client has
  // paginated in) and cached per messageId so revisiting the same photo doesn't refetch it.
  const chatOrdinalFetchedRef = React.useRef(new Set());
  const [chatOrdinalCache, setChatOrdinalCache] = React.useState({});
  React.useEffect(() => {
    // Only fetch once the info panel is actually open -- it's the only place the label shows,
    // and eagerly firing a count() query for every photo as the user swipes past it (most of
    // which never get a second look) added real extra Firestore traffic for no visible benefit.
    if (!showInfo) return;
    if (!currentMeta || currentMeta.source === 'meeting' || currentMeta.source === 'memo' || currentMeta.meetingDate) return;
    if (currentMeta.uploadSource === 'gallery') return; // uses the photo-ordinal fetch below instead
    // 'meeting'-uploadSource photos are hidden from the chat feed (see ChatRoomView's render
    // filter), so a chat ordinal for them is never shown/clickable -- no point fetching it.
    if (currentMeta.uploadSource === 'meeting') return;
    if (typeof onGetChatMessageOrdinal !== 'function') return;
    const key = currentMeta.messageId;
    const ts = currentMeta.timestamp;
    if (!key || !ts || chatOrdinalFetchedRef.current.has(key)) return;
    chatOrdinalFetchedRef.current.add(key);
    let cancelled = false;
    Promise.resolve(onGetChatMessageOrdinal(ts)).then(n => {
      if (!cancelled && typeof n === 'number') setChatOrdinalCache(prev => ({ ...prev, [key]: n }));
    });
    return () => { cancelled = true; };
  }, [showInfo, currentMeta, onGetChatMessageOrdinal]);
  // "갤러리 #20" -- the photo's 1-based position among every photo ever uploaded through the
  // gallery's own "이미지 업로드" action, counted (and cached) the same on-demand way as the
  // chat ordinal above, but by photo rather than by message (see fetchGalleryPhotoOrdinal).
  const galleryOrdinalFetchedRef = React.useRef(new Set());
  const [galleryOrdinalCache, setGalleryOrdinalCache] = React.useState({});
  React.useEffect(() => {
    if (!showInfo) return;
    if (!currentMeta || currentMeta.uploadSource !== 'gallery') return;
    if (typeof onGetGalleryPhotoOrdinal !== 'function') return;
    const messageId = currentMeta.messageId;
    if (!messageId) return;
    // 이 key는 아래 sourceInfo의 galleryOrdinalCache 조회 키(`${messageId}_${imageIndex||0}`)와
    // 반드시 똑같아야 한다 -- currentIdentity.assetKey/refKey/mediaKey는 "gallery:msgId:0" 같은
    // 형식이라 조회 쪽의 단순 "msgId_0" 형식과 전혀 달라서 캐시가 항상 miss였다. 그 결과 갤러리로
    // 올린 사진은 순번을 절대 못 받아와서 "출처"에 늘 "갤러리"만 보이고 "갤러리 #17" 같은 순번이
    // 절대 안 나오는 버그였다.
    const key = `${messageId}_${currentMeta.imageIndex || 0}`;
    if (galleryOrdinalFetchedRef.current.has(key)) return;
    galleryOrdinalFetchedRef.current.add(key);
    let cancelled = false;
    Promise.resolve(onGetGalleryPhotoOrdinal(messageId, currentMeta.imageIndex)).then(n => {
      if (!cancelled && typeof n === 'number') setGalleryOrdinalCache(prev => ({ ...prev, [key]: n }));
    });
    return () => { cancelled = true; };
  }, [showInfo, currentMeta, onGetGalleryPhotoOrdinal]);
  const sourceInfo = React.useMemo(() => {
    if (!currentMeta) return null;

    if (currentMeta.source === 'anniversary') {
      const n = Number(currentMeta.anniversaryIndex);
      return {
        label: Number.isFinite(n) && n > 0 ? `기념일#${n}` : '기념일',
        onClick: null
      };
    }

    const formatScheduleLabel = (dateStr) => {
      if (!dateStr || !isValidDateString(dateStr)) return '';
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const yy = String(y).slice(-2);
      const mm = String(m).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dayName = dayNames[dt.getDay()];
      return `일정 ${yy}.${mm}.${dd}(${dayName})`;
    };

    let targetMeetingDate = currentMeta.meetingDate || (currentMeta.photoId && currentMeta.photoId.match(/\d{4}-\d{2}-\d{2}/)?.[0]);
    if (!targetMeetingDate && currentMeta.tags) {
      const dateMatch = String(currentMeta.tags).match(/(?:#|^|\s)(20\d{2}-\d{2}-\d{2}|\d{6})(?:\s|$)/);
      if (dateMatch) {
        const rawToken = dateMatch[1];
        if (rawToken.length === 6) {
          targetMeetingDate = `20${rawToken.slice(0, 2)}-${rawToken.slice(2, 4)}-${rawToken.slice(4, 6)}`;
        } else {
          targetMeetingDate = rawToken;
        }
      }
    }

    if (currentMeta.source === 'meeting' || currentMeta.uploadSource === 'meeting' || targetMeetingDate) {
      const dateStr = targetMeetingDate || (currentMeta.timestamp ? new Date(currentMeta.timestamp).toISOString().slice(0, 10) : (typeof getTodayYmd === 'function' ? getTodayYmd() : ''));
      const label = formatScheduleLabel(dateStr) || `일정 ${dateStr || ''}`;
      return {
        label: label,
        onClick: (onJumpToMeetingDate && dateStr) ? () => { closeLightbox(); onJumpToMeetingDate(dateStr, 'photo'); } : null
      };
    }

    if (currentMeta.source === 'memo') {
      const msgId = currentMeta.messageId || currentMeta.sourceMessageId;
      return {
        label: '메모',
        onClick: (onJumpToMemo && msgId) ? () => { closeLightbox(); onJumpToMemo(msgId); } : null
      };
    }

    if (currentMeta.uploadSource === 'gallery' || currentMeta.source === 'gallery') {
      const galleryKey = currentMeta.messageId != null ? `${currentMeta.messageId}_${currentMeta.imageIndex || 0}` : null;
      const galleryOrdinal = galleryKey != null ? galleryOrdinalCache[galleryKey] : null;
      const msgId = currentMeta.messageId != null ? currentMeta.messageId : currentMeta.sourceMessageId;
      return {
        label: typeof galleryOrdinal === 'number' ? `갤러리 #${galleryOrdinal}` : '갤러리',
        onClick: (onJumpToGallery && (msgId != null || currentUrl)) ? () => { closeLightbox(); onJumpToGallery(msgId, currentMeta.imageIndex, currentUrl); } : null
      };
    }

    const msgId = currentMeta.messageId != null ? currentMeta.messageId : currentMeta.sourceMessageId;
    const ordinal = msgId != null ? chatOrdinalCache[msgId] : null;
    return {
      label: typeof ordinal === 'number' ? `채팅 #${ordinal}` : '채팅',
      onClick: (onJumpToChatMessage && msgId) ? () => { closeLightbox(); onJumpToChatMessage(msgId); } : null
    };
  }, [currentMeta, currentUrl, closeLightbox, onJumpToChatMessage, onJumpToMemo, onJumpToMeetingDate, onJumpToGallery, chatOrdinalCache, galleryOrdinalCache]);
  const replacePhotoInputRef = React.useRef(null);
  const [isReplacingPhoto, setIsReplacingPhoto] = React.useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = React.useState(false);
  const [isRemovingFromMemory, setIsRemovingFromMemory] = React.useState(false);
  const replacePhotoWithFile = async file => {
    if (!file || !onReplacePhoto || !currentMeta || isReplacingPhoto) return;
    setIsReplacingPhoto(true);
    try {
      const nextUrl = await onReplacePhoto({ ...currentMeta, imageUrl: currentUrl }, file);
      if (nextUrl && typeof nextUrl === 'string') {
        setDisplayUrls(prev => prev.map((item, i) => i === index ? nextUrl : item));
      }
    } finally {
      setIsReplacingPhoto(false);
    }
  };
  const handleReplacePhotoFile = async event => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    await replacePhotoWithFile(file);
  };
  // Lets 사진 교체 accept a clipboard-pasted image too, not just the file picker -- active
  // whenever this photo is editable, so Ctrl+V while the Lightbox is open replaces the photo
  // currently on screen directly (no need to click the pencil button first).
  React.useEffect(() => {
    if (!canEditPhoto || !onReplacePhoto) return;
    const handlePaste = e => {
      const files = getImageFilesFromClipboardEvent(e);
      if (!files.length) return;
      e.preventDefault();
      replacePhotoWithFile(files[0]);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [canEditPhoto, onReplacePhoto, currentMeta, currentUrl, index, isReplacingPhoto]);
  const handleDeletePhotoClick = () => {
    if (!onDeletePhoto || !currentMeta || isDeletingPhoto) return;
    const confirmAction = async () => {
      setIsDeletingPhoto(true);
      try {
        const ok = await onDeletePhoto({ ...currentMeta, imageUrl: currentUrl });
        // No good way to remove just this one entry from the static urls/meta snapshot the
        // parent handed in -- close and let the next open reflect live data instead.
        if (ok) closeLightbox();
      } finally {
        setIsDeletingPhoto(false);
      }
    };
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('사진 삭제', '이 사진을 삭제하시겠습니까?', confirmAction);
    }
  };
  // 추억(여행) 사진 모음은 날짜 구간으로 자동으로 모아지는 목록이라, 같이 찍혔지만 그 여행과
  // 상관없는 사진이 섞여 들어올 수 있다 -- 원본 사진 자체는 지우지 않고 그 추억 모음에서만
  // 빼는 조작. onRemoveFromMemory가 전달된 경우(추억 탭에서 연 라이트박스)에만 버튼이 뜬다.
  const handleRemoveFromMemoryClick = () => {
    if (!onRemoveFromMemory || !currentMeta || isRemovingFromMemory) return;
    const confirmAction = async () => {
      setIsRemovingFromMemory(true);
      try {
        const ok = await onRemoveFromMemory({ ...currentMeta, imageUrl: currentUrl });
        if (ok) closeLightbox();
      } finally {
        setIsRemovingFromMemory(false);
      }
    };
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('추억에서 제거', '이 사진을 이 추억 모음에서 제거하시겠습니까? (사진 자체는 삭제되지 않습니다)', confirmAction);
    } else {
      void confirmAction();
    }
  };
  const ensureCurrentShareUrl = async url => {
    if (typeof url !== 'string' || !url.startsWith('data:')) return url;
    if (typeof onPromoteImageUrl !== 'function') throw new Error('No image URL promotion handler');
    const result = await onPromoteImageUrl({ url, meta: meta && meta[index], index });
    const nextShareUrl = typeof result === 'string' ? result : result?.shareUrl;
    const nextImageUrl = typeof result === 'string' ? result : result?.imageUrl;
    if (nextImageUrl && /^https?:\/\//.test(nextImageUrl)) {
      setDisplayUrls(prev => prev.map((item, i) => i === index ? nextImageUrl : item));
    }
    if (nextShareUrl && /^https?:\/\//.test(nextShareUrl)) {
      if (showToast) showToast('공유 URL 생성완료', 'success', 3000);
      return nextShareUrl;
    }
    throw new Error('Image URL promotion failed');
  };
  const recordImageDimensions = (url, e) => {
    const img = e.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!url || !width || !height) return;
    setImageDimensions(prev => prev[url] ? prev : { ...prev, [url]: { width, height } });
  };
  const handleImageTap = e => {
    e.stopPropagation();
    if (wasDraggedRef.current) { wasDraggedRef.current = false; return; }
    toggleShowTags();
  };
  const imgAreaRef = React.useRef(null);
  const widthRef = React.useRef(0);
  const dragStartXRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const wasDraggedRef = React.useRef(false);
  const pendingNavRef = React.useRef(null);
  const transitionTimerRef = React.useRef(null);
  const touchGestureRef = React.useRef(null);
  const [dragPx, setDragPx] = React.useState(0);
  const [transitionOn, setTransitionOn] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const clearTransitionTimer = () => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  const commitPendingNav = React.useCallback(() => {
    clearTransitionTimer();
    if (pendingNavRef.current != null) {
      const next = pendingNavRef.current;
      pendingNavRef.current = null;
      setTransitionOn(false);
      setDragPx(0);
      onNavigate(next);
      return next;
    }
    return null;
  }, [onNavigate]);

  React.useEffect(() => {
    clearTransitionTimer();
    pendingNavRef.current = null;
    touchGestureRef.current = null;
    isPanningRef.current = false;
    panStartRef.current = null;
    setTransitionOn(false);
    setDragPx(0);
    setPanOffset({ x: 0, y: 0 });
    setIsPanning(false);
    isDraggingRef.current = false;
    setIsDragging(false);
  }, [index]);

  const goTo = i => {
    if (i < 0 || i >= total || i === index) return;
    setShowInfo(false);
    onNavigate(i);
  };
  // Adjacent (±1) navigation slides the track by exactly one container-width, same visual
  // motion as a completed drag -- used by the arrow buttons and arrow keys so every way of
  // moving between photos feels like the same carousel, not just the drag gesture.
  const animateToAdjacent = newIndex => {
    // While a transition is already in flight, `index` (the last *committed* photo) is stale --
    // pendingNavRef already holds the photo this is animating toward, so that's the real
    // "current position" a second rapid click should be measured against. Used to just commit
    // whatever was already pending and drop the new click's target entirely, which made fast
    // repeated taps (exactly the "빠르게 작동하는 환경" case) feel like every other press did
    // nothing.
    const from = pendingNavRef.current != null ? pendingNavRef.current : index;
    if (newIndex < 0 || newIndex >= total || newIndex === from) return;
    setShowInfo(false);
    if (pendingNavRef.current != null) {
      // Commit the in-flight nav immediately (skipping its remaining animation) so the new one
      // starts from a clean, consistent state instead of stacking on top of it.
      commitPendingNav();
    }
    const el = imgAreaRef.current;
    const width = (el && el.getBoundingClientRect().width) || window.innerWidth * 0.92 || 1;
    widthRef.current = width;
    pendingNavRef.current = newIndex;
    setTransitionOn(true);
    setDragPx(newIndex > from ? -width : width);

    clearTransitionTimer();
    transitionTimerRef.current = setTimeout(() => {
      commitPendingNav();
    }, LIGHTBOX_TRANSITION_FALLBACK_MS);
  };
  React.useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') animateToAdjacent(index - 1);
      else if (e.key === 'ArrowRight') animateToAdjacent(index + 1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [index, total]);

  // Carousel drag: the track visually follows the finger/cursor 1:1 while dragging (dragPx is
  // the live pixel offset added on top of the centered baseline), then on release either
  // completes the slide to the adjacent photo or springs back -- both animated the same way,
  // via a CSS transition on transform. The reset back to dragPx:0 after a completed slide
  // happens in the same handler as the index change (onTransitionEnd), so the swap is
  // invisible: the outgoing frame and the reset frame show the same photo in the same spot.
  const SWIPE_THRESHOLD_RATIO = 0.18;
  const EDGE_RESISTANCE = 0.35;
  const dampedDelta = raw => {
    if (raw > 0 && index === 0) return raw * EDGE_RESISTANCE;
    if (raw < 0 && index === total - 1) return raw * EDGE_RESISTANCE;
    return raw;
  };
  const handleDragStart = clientX => {
    if (total <= 1) return;
    if (pendingNavRef.current != null) {
      commitPendingNav();
    }
    const el = imgAreaRef.current;
    widthRef.current = el ? el.getBoundingClientRect().width : window.innerWidth * 0.92;
    dragStartXRef.current = clientX;
    isDraggingRef.current = true;
    wasDraggedRef.current = false;
    setTransitionOn(false);
    setIsDragging(true);
  };
  const handleDragMove = clientX => {
    if (!isDraggingRef.current || dragStartXRef.current == null) return;
    const raw = clientX - dragStartXRef.current;
    if (Math.abs(raw) > 5) wasDraggedRef.current = true;
    setDragPx(dampedDelta(raw));
  };
  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStartXRef.current = null;
    const width = widthRef.current || window.innerWidth * 0.92 || 1;
    const threshold = width * SWIPE_THRESHOLD_RATIO;
    if (Math.abs(dragPx) >= threshold) { setShowInfo(false); }
    setTransitionOn(true);
    setDragPx(current => {
      if (current <= -threshold && index < total - 1) {
        pendingNavRef.current = index + 1;
        clearTransitionTimer();
        transitionTimerRef.current = setTimeout(() => {
          commitPendingNav();
        }, LIGHTBOX_TRANSITION_FALLBACK_MS);
        return -width;
      }
      if (current >= threshold && index > 0) {
        pendingNavRef.current = index - 1;
        clearTransitionTimer();
        transitionTimerRef.current = setTimeout(() => {
          commitPendingNav();
        }, LIGHTBOX_TRANSITION_FALLBACK_MS);
        return width;
      }
      pendingNavRef.current = null;
      return 0;
    });
  };
  const getTouchDistance = touches => {
    const a = touches[0];
    const b = touches[1];
    return Math.max(1, Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY));
  };
  const getTouchCenter = touches => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  });
  const clampPanOffset = (x, y) => {
    const image = zoomedImgRef.current;
    const area = imgAreaRef.current;
    const imageRect = image ? image.getBoundingClientRect() : null;
    const areaRect = area ? area.getBoundingClientRect() : null;
    const maxX = imageRect ? Math.max(0, (imageRect.width - (areaRect?.width || window.innerWidth)) / 2) : 0;
    const maxY = imageRect ? Math.max(0, (imageRect.height - (areaRect?.height || window.innerHeight)) / 2) : 0;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y))
    };
  };
  // On mobile, one finger swipes the carousel at 100%, while a pinch enters a
  // zoom-and-pan mode. This avoids native image gestures competing with the carousel.
  const handleTouchStart = e => {
    if (e.touches.length >= 2) {
      e.preventDefault();
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragStartXRef.current = null;
        setIsDragging(false);
        setDragPx(0);
      }
      touchGestureRef.current = {
        mode: 'pinch',
        distance: getTouchDistance(e.touches),
        center: getTouchCenter(e.touches),
        zoom: Math.max(ZOOM_DEFAULT, zoomLevel),
        pan: { ...panOffset }
      };
      isPanningRef.current = true;
      setIsPanning(true);
      wasDraggedRef.current = true;
      setShowInfo(false); setShowTags(false);
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    if (zoomLevel > ZOOM_DEFAULT) {
      e.preventDefault();
      touchGestureRef.current = { mode: 'pan' };
      handlePanStart(touch.clientX, touch.clientY);
      return;
    }
    touchGestureRef.current = { mode: 'carousel' };
    handleDragStart(touch.clientX);
  };
  const handleTouchMove = e => {
    const gesture = touchGestureRef.current;
    if (!gesture) return;
    if (e.touches.length >= 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_DEFAULT, gesture.zoom * distance / gesture.distance));
      setZoomLevel(nextZoom);
      setPanOffset(clampPanOffset(
        gesture.pan.x + center.x - gesture.center.x,
        gesture.pan.y + center.y - gesture.center.y
      ));
      wasDraggedRef.current = true;
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    if (gesture.mode === 'pan') {
      e.preventDefault();
      handlePanMove(touch.clientX, touch.clientY);
    } else if (gesture.mode === 'carousel') {
      e.preventDefault();
      handleDragMove(touch.clientX);
    }
  };
  const handleTouchEnd = e => {
    const gesture = touchGestureRef.current;
    if (!gesture || e.touches.length >= 2) return;
    if (gesture.mode === 'pinch' && e.touches.length === 1 && zoomLevel > ZOOM_DEFAULT) {
      const touch = e.touches[0];
      touchGestureRef.current = { mode: 'pan' };
      handlePanStart(touch.clientX, touch.clientY);
      return;
    }
    touchGestureRef.current = null;
    if (gesture.mode === 'pan') handlePanEnd();
    else if (gesture.mode === 'pinch') handlePanEnd();
    else if (gesture.mode === 'carousel') handleDragEnd();
  };
  // Mouse move/up are tracked at the document level (unlike touchmove/touchend, which keep
  // firing on their original target even once the finger leaves it) so the drag keeps working
  // if the cursor leaves the image area mid-drag. Pan-dragging (zoomed image) and slide-nav
  // dragging (carousel) are mutually exclusive -- handleZoomedImageMouseDown stops the mousedown
  // from ever reaching the carousel container while zoomed, so isPanningRef alone is enough to
  // route move/up to the right handler here.
  React.useEffect(() => {
    const onMouseMove = e => {
      if (isPanningRef.current) { handlePanMove(e.clientX, e.clientY); return; }
      handleDragMove(e.clientX);
    };
    const onMouseUp = () => {
      if (isPanningRef.current) { handlePanEnd(); return; }
      handleDragEnd();
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [index, total]);
  const handleTrackTransitionEnd = e => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    commitPendingNav();
  };
  const handleOverlayClick = () => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    closeLightbox();
  };
  const handleCurrentImageError = () => {
    const thumbUrl = String(currentMeta && currentMeta.thumb || '').trim();
    const current = String(currentUrl || '').trim();
    if (thumbUrl && thumbUrl !== current) {
      setDisplayUrls(prev => prev.map((item, i) => i === index ? thumbUrl : item));
      return;
    }
    setImageLoadFailed(true);
  };

  // 정보 토글 버튼("i") -- 좌측 상단 기본 화면에 항상 떠 있는 버튼. 누르면 편집/삭제 버튼이
  // 함께 나타나고 하단에 업로드/출처/파일정보 패널이 열린다. 다시 누르면 i/url 두 개만 남는다.
  const renderInfoToggleButton = () => zoomLevel === ZOOM_DEFAULT && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => { e.stopPropagation(); toggleShowInfo(); },
    "aria-label": showInfo ? "사진 정보 닫기" : "사진 정보 보기",
    title: showInfo ? "사진 정보 닫기" : "사진 정보 보기",
    style: {
      width: '30px', height: '30px', borderRadius: '50%', border: 'none',
      background: showInfo ? 'var(--accent-primary)' : 'rgba(15,23,42,0.62)', color: '#FFFFFF', display: 'flex',
      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto', flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
    /*#__PURE__*/React.createElement("line", { x1: "12", y1: "11", x2: "12", y2: "16" }),
    /*#__PURE__*/React.createElement("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })));
  // URL 버튼 -- i 버튼과 나란히 항상 보이는 아이콘 전용 버튼으로 둬서 정보 패널을 열지 않고도
  // 바로 URL 공유 레이어를 열 수 있게 한다.
  const renderUrlButton = () => zoomLevel === ZOOM_DEFAULT && LinkIcon && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => { e.stopPropagation(); setImageUrlModalOpen(true); },
    "aria-label": "이미지 URL",
    title: "이미지 URL",
    style: {
      width: '30px', height: '30px', borderRadius: '50%', border: 'none',
      background: 'rgba(15,23,42,0.62)', color: '#FFFFFF', display: 'flex',
      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto', flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(LinkIcon, { size: 15 }));
  // 편집(교체)/삭제 버튼 -- i 버튼을 눌러 정보 패널이 열려 있을 때만 i/url 옆에 나타난다.
  const renderReplaceButton = () => canEditPhoto && onReplacePhoto && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => replacePhotoInputRef.current && replacePhotoInputRef.current.click(),
    disabled: isReplacingPhoto || isDeletingPhoto,
    "aria-label": "사진 편집",
    title: "사진 교체",
    style: {
      width: '30px', height: '30px', borderRadius: '50%', border: 'none',
      background: 'rgba(15,23,42,0.62)', color: '#FFFFFF', display: 'flex',
      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 'var(--font-size-sm)',
      opacity: (isReplacingPhoto || isDeletingPhoto) ? 0.5 : 1
    }
  }, isReplacingPhoto ? '...' : /*#__PURE__*/React.createElement(PencilIcon, { size: 15 }));
  const renderDeleteButton = () => canEditPhoto && onDeletePhoto && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleDeletePhotoClick,
    disabled: isReplacingPhoto || isDeletingPhoto,
    "aria-label": "사진 삭제",
    title: "사진 삭제",
    style: {
      width: '30px', height: '30px', borderRadius: '50%', border: 'none',
      background: 'rgba(15,23,42,0.62)', color: '#FFFFFF', display: 'flex',
      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 'var(--font-size-sm)',
      opacity: (isReplacingPhoto || isDeletingPhoto) ? 0.5 : 1
    }
  }, isDeletingPhoto ? '...' : /*#__PURE__*/React.createElement(TrashIcon, { size: 15 }));
  // Shared by both the carousel's "current" slot and the single-image layout below --
  // left-aligned i/url(/편집/삭제) buttons plus centered zoom controls on the same row.
  const renderPhotoActions = () => /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      right: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
      pointerEvents: 'none'
    },
    onClick: e => e.stopPropagation()
  },
    zoomLevel === ZOOM_DEFAULT && /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'auto' }
    },
      renderInfoToggleButton(),
      renderUrlButton(),
      showInfo && renderReplaceButton(),
      showInfo && renderDeleteButton()
    ),
    isDesktop && /*#__PURE__*/React.createElement("div", {
      // top: 0 pins this to the row's own top edge explicitly -- without it, this absolutely
      // positioned group has no top of its own, so its vertical position falls back to the
      // flex row's alignItems:center "static position", which is computed against the row's
      // in-flow content. The edit/delete button group (this row's only in-flow child) only
      // renders at 100% zoom, so the row's effective height collapses to 0 the moment you zoom
      // away from 100% -- shifting where "centered" lands and making this group visibly jump.
      style: {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'auto'
      }
    },
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleZoomOut,
        disabled: zoomLevel <= ZOOM_MIN,
        "aria-label": "축소",
        title: "축소",
        style: {
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(15,23,42,0.62)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)',
          opacity: zoomLevel <= ZOOM_MIN ? 0.5 : 1
        }
      }, /*#__PURE__*/React.createElement(ZoomOutIcon, { size: 14 })),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleZoomReset,
        disabled: zoomLevel === ZOOM_DEFAULT,
        "aria-label": "100%로 초기화",
        title: "100%로 초기화",
        style: {
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(15,23,42,0.62)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: zoomLevel === ZOOM_DEFAULT ? 'default' : 'pointer',
          fontSize: 'var(--font-size-2xs)',
          fontWeight: 900,
          opacity: zoomLevel === ZOOM_DEFAULT ? 0.7 : 1
        }
      }, `${zoomLevel}%`),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: handleZoomIn,
        disabled: zoomLevel >= ZOOM_MAX,
        "aria-label": "확대",
        title: "확대",
        style: {
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(15,23,42,0.62)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)',
          opacity: zoomLevel >= ZOOM_MAX ? 0.5 : 1
        }
      }, /*#__PURE__*/React.createElement(ZoomInIcon, { size: 14 }))
    )
  );

  // Mobile multi-image stage used to reserve a fixed 56dvh frame. Landscape photos only fill
  // part of that frame, so the leftover dark band read as a large gap between the photo and the
  // comments card (flex-end only tucked the photo to the bottom of the empty frame — it did not
  // reclaim the space). Size the stage to the fitted image height (capped at 56dvh) so comments
  // sit directly under the photo and a short comment list no longer needs an inner/outer scroll
  // just to bridge empty stage space.
  const mobileImageMaxPx = !isDesktop && typeof window !== 'undefined'
    ? Math.round((window.visualViewport?.height || window.innerHeight) * 0.56)
    : null;
  const mobileStageHeightPx = (() => {
    if (isDesktop || mobileImageMaxPx == null) return null;
    const maxW = Math.min(window.innerWidth * 0.92, window.innerWidth);
    const size = imageDimensions[currentUrl];
    if (size?.width && size?.height) {
      const fitted = maxW * (size.height / size.width);
      return Math.max(1, Math.min(mobileImageMaxPx, Math.round(fitted)));
    }
    // Pre-load placeholder: prefer a compact 4:3 guess over a full 56dvh hole that jumps away.
    return Math.max(1, Math.min(mobileImageMaxPx, Math.round(maxW * 0.75)));
  })();
  const mobileImageStageStyle = isDesktop
    ? { width: '92vw', height: '82vh', overflow: 'hidden' }
    : {
        width: '92vw',
        height: `${mobileStageHeightPx}px`,
        maxHeight: '56dvh',
        overflow: 'hidden',
        flexShrink: 0
      };

  const renderSlide = (url, slot) => {
    const wrapperStyle = { width: '33.3333%', flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
    if (!url) return /*#__PURE__*/React.createElement("div", { style: wrapperStyle });

    if (slot === 'current') {
      if (imageLoadFailed) {
        return /*#__PURE__*/React.createElement("div", { style: wrapperStyle }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 700
          }
        }, "이미지를 불러오지 못했습니다."));
      }

      return /*#__PURE__*/React.createElement("div", { style: wrapperStyle }, /*#__PURE__*/React.createElement("div", {
        style: { position: 'relative', display: 'inline-flex', maxWidth: '100%', maxHeight: '100%' },
        onClick: handleImageTap
      }, /*#__PURE__*/React.createElement("img", {
        ref: zoomedImgRef,
        src: url,
        alt: "원본 이미지",
        "data-slide": slot,
        draggable: false,
        decoding: 'async',
        referrerPolicy: 'no-referrer',
        onLoad: e => recordImageDimensions(url, e),
        onError: handleCurrentImageError,
        onMouseDown: handleZoomedImageMouseDown,
        style: {
          maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)',
          display: 'block', ...zoomImageStyle
        }
      }), renderPhotoActions(),
        showInfo && zoomLevel === ZOOM_DEFAULT && /*#__PURE__*/React.createElement(LightboxInfoPanel, {
          key: `meta-${tagOverrideKey || String(currentUrl || index)}`,
          info: currentInfo,
          sourceInfo: sourceInfo,
          onRemoveFromMemory: onRemoveFromMemory ? handleRemoveFromMemoryClick : null,
          isRemovingFromMemory: isRemovingFromMemory
        }),
        showTags && zoomLevel === ZOOM_DEFAULT && /*#__PURE__*/React.createElement(LightboxTagPanel, {
          tags: currentTags,
          onSaveTags: saveCurrentTags,
          onSearchTag: onSearchTag,
          showToast: showToast
        })));
    }

    return /*#__PURE__*/React.createElement("div", { style: wrapperStyle }, /*#__PURE__*/React.createElement("img", {
      src: url,
      alt: "원본 이미지",
      "data-slide": slot,
      draggable: false,
      decoding: 'async',
      referrerPolicy: 'no-referrer',
      onLoad: e => recordImageDimensions(url, e),
      onClick: e => e.stopPropagation(),
      style: {
        maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)'
      }
    }));
  };

  const lightboxNode = /*#__PURE__*/React.createElement("div", {
    className: "lightbox-overlay",
    onClick: handleOverlayClick,
    style: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.92)', WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)', zIndex: 50000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isDesktop ? 'center' : 'flex-start',
      width: '100%', maxWidth: '100%', overflowX: 'hidden', overflowY: isDesktop ? 'hidden' : 'auto',
      paddingTop: isDesktop ? 0 : 'max(52px, calc(env(safe-area-inset-top, 0px) + 44px))',
      paddingBottom: isDesktop ? 0 : '8px', boxSizing: 'border-box',
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: replacePhotoInputRef,
    type: "file",
    accept: "image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif, image/*",
    onClick: e => e.stopPropagation(),
    onChange: handleReplacePhotoFile,
    style: { display: 'none' }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => { e.stopPropagation(); closeLightbox(); },
    "aria-label": "닫기",
    style: {
      // iOS standalone PWAs overlay the status indicators on the viewport. Keep the close
      // target below the safe-area inset instead of letting the battery/network UI swallow it.
      position: 'absolute', top: 'max(16px, calc(env(safe-area-inset-top, 0px) + 12px))', right: 'max(16px, env(safe-area-inset-right, 0px) + 12px)',
      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', zIndex: 9001
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /*#__PURE__*/React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }))),
  total > 1 && index > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => { e.stopPropagation(); animateToAdjacent(index - 1); },
    "aria-label": "이전 이미지",
    // The shared global press/hover rules (button:active, [data-no-press-feedback]:hover, ...)
    // all set their own `transform` value, which -- being the same CSS property as this button's
    // own centering `transform: translateY(-50%)` -- replaces it outright rather than combining
    // with it. That used to yank the button away from its vertically-centered position on press
    // (and, with the data-no-press-feedback attempt at a fix, on hover too), so by release the
    // pointer was no longer over the button and the click could miss it entirely. .lightbox-nav-arrow
    // (app.css) pins `transform: translateY(-50%) !important` across every state instead, so no
    // interaction ever moves it.
    className: "lightbox-nav-arrow",
    style: {
      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', zIndex: 9001
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M15 6l-6 6l6 6" }))),
  total > 1 && index < total - 1 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => { e.stopPropagation(); animateToAdjacent(index + 1); },
    "aria-label": "다음 이미지",
    className: "lightbox-nav-arrow",
    style: {
      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', zIndex: 9001
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M9 6l6 6l-6 6" }))),
  total > 1 ? /*#__PURE__*/React.createElement("div", {
    ref: imgAreaRef,
    onMouseDown: e => handleDragStart(e.clientX),
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    style: {
      ...mobileImageStageStyle,
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onTransitionEnd: handleTrackTransitionEnd,
    style: {
      display: 'flex', width: '300%', height: '100%',
      transform: `translateX(calc(-33.3333% + ${dragPx}px))`,
      transition: transitionOn ? `transform ${LIGHTBOX_TRANSITION_MS}ms ${LIGHTBOX_TRANSITION_EASING}` : 'none',
      willChange: 'transform'
    }
  }, renderSlide(index > 0 ? displayUrls[index - 1] : null, 'prev'), renderSlide(currentUrl, 'current'), renderSlide(index < total - 1 ? displayUrls[index + 1] : null, 'next')))
    : /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative', display: 'inline-flex', maxWidth: '92vw', maxHeight: isDesktop ? '82vh' : '56dvh', touchAction: 'none' },
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    onClick: handleImageTap
  }, /*#__PURE__*/React.createElement("img", {
    ref: zoomedImgRef,
    src: currentUrl,
    alt: "원본 이미지",
    draggable: false,
    decoding: 'async',
    referrerPolicy: 'no-referrer',
    onLoad: e => recordImageDimensions(currentUrl, e),
    onMouseDown: handleZoomedImageMouseDown,
    style: {
      maxWidth: '92vw', maxHeight: isDesktop ? '82vh' : '56dvh', borderRadius: 'var(--radius-md)', objectFit: 'contain',
      display: 'block', ...zoomImageStyle
    }
  }), renderPhotoActions(),
    showInfo && zoomLevel === ZOOM_DEFAULT && /*#__PURE__*/React.createElement(LightboxInfoPanel, {
      key: `meta-${tagOverrideKey || String(currentUrl || index)}`,
      info: currentInfo,
      sourceInfo: sourceInfo,
      onRemoveFromMemory: onRemoveFromMemory ? handleRemoveFromMemoryClick : null,
      isRemovingFromMemory: isRemovingFromMemory
    }),
    showTags && zoomLevel === ZOOM_DEFAULT && /*#__PURE__*/React.createElement(LightboxTagPanel, {
      tags: currentTags,
      onSaveTags: saveCurrentTags,
      onSearchTag: onSearchTag,
      showToast: showToast
    })),
  renderCommentThread(),
  total > 1 && (() => {
    const maxVisibleDots = 10;
    const startIdx = total <= maxVisibleDots
      ? 0
      : Math.max(0, Math.min(index - Math.floor(maxVisibleDots / 2), total - maxVisibleDots));
    const endIdx = startIdx + Math.min(total, maxVisibleDots);
    const visibleIndices = Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i);

    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isDesktop ? '6px' : '2px',
        marginTop: isDesktop ? '16px' : '4px',
        zIndex: 9001
      }
    },
      /* Text indicator */
      /*#__PURE__*/React.createElement("span", {
        style: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 'var(--font-size-md)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }
      }, `${index + 1} / ${total}`),
      /* Dots container -- 모바일에서는 숫자 표시("1 / 9")만으로 충분해 점은 생략한다 */
      isDesktop && /*#__PURE__*/React.createElement("div", {
        onClick: e => e.stopPropagation(),
        style: { display: 'flex', alignItems: 'center', gap: '7px' }
      },
        startIdx > 0 && /*#__PURE__*/React.createElement("span", {
          style: { width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }
        }),
        visibleIndices.map(i => /*#__PURE__*/React.createElement("span", {
          key: i,
          onClick: () => goTo(i),
          style: {
            width: i === index ? '8px' : '6px',
            height: i === index ? '8px' : '6px',
            borderRadius: '50%',
            cursor: 'pointer',
            backgroundColor: i === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
            transition: 'all 0.15s'
          }
        })),
        endIdx < total && /*#__PURE__*/React.createElement("span", {
          style: { width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }
        })
      )
    );
  })(), imageUrlModalOpen && /*#__PURE__*/React.createElement(ImageUrlModal, {
    imageUrl: currentUrl,
    tags: currentTags,
    onClose: () => setImageUrlModalOpen(false),
    showToast,
    onEnsureShareUrl: ensureCurrentShareUrl
  }));
  return ReactDOM.createPortal(lightboxNode, document.body);
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    LightboxInfoPanel: LightboxInfoPanel,
    LightboxTagPanel: LightboxTagPanel,
    Lightbox: Lightbox,
  });
}
