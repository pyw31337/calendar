/**
 * PhotoBulkActionBar: Common multi-selection & batch operations component for Gallery and Archive.
 *
 * Supports:
 * - Multi-person candidates (select multiple people at once)
 * - Quick object/scene tags (#바다, #전망대, #풍경, #음식, #카페, #숙소)
 * - Custom tag input (arbitrary new person or object tags)
 * - Group moving (moving between person, place, or memory groups)
 * - Bulk delete with confirmation
 * - Clipboard tag copy & paste with Lucide ClipboardPasteIcon
 * - Keyboard shortcuts: Ctrl/Cmd+A (select all), Shift+Click (range select), Ctrl/Cmd+C (copy tags), Ctrl/Cmd+V (paste tags)
 */

import { ClipboardPasteIcon, TrashIcon } from './ui-icons.js';
import { normalizePhotoTagTokens, buildBulkPhotoTagChanges } from '../core/bulk-photo-tags.js';

let tagClipboardBuffer = [];

export function setTagClipboard(tags) {
  const normalized = normalizePhotoTagTokens(Array.isArray(tags) ? tags.join(' ') : tags);
  tagClipboardBuffer = normalized;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(normalized.map(t => `#${t}`).join(' ')).catch(() => {});
    }
  } catch (_) {}
  return normalized;
}

export function getTagClipboard() {
  return tagClipboardBuffer.slice();
}

export const DEFAULT_OBJECT_TAG_RECOMMENDATIONS = Object.freeze([
  '바다', '전망대', '풍경', '음식', '카페', '숙소', '산', '야경'
]);

export function PhotoBulkActionBar({
  selectedKeys = new Set(),
  allKeys = [],
  selectedPhotos = [],
  onToggleAll = null,
  onClearSelection = null,
  personCandidates = [],
  groupOptions = [],
  onMoveToGroup = null,
  onApplyTags = null,
  onDeletePhotos = null,
  showToast = null,
  onRequestConfirm = null,
  isSaving = false,
  isDeleting = false,
  mode = 'people', // 'people' | 'places' | 'memories' | 'gallery'
  style = {}
}) {
  const React = window.React;

  // Selected candidate person tags
  const [selectedPersonTags, setSelectedPersonTags] = React.useState(() => new Set());
  // Selected quick object tags
  const [selectedObjectTags, setSelectedObjectTags] = React.useState(() => new Set());
  // User typed custom tags
  const [customTags, setCustomTags] = React.useState([]);
  const [customTagInput, setCustomTagInput] = React.useState('');
  // Copied tags for paste
  const [copiedTags, setCopiedTags] = React.useState(() => getTagClipboard());

  const selectedCount = selectedKeys.size;
  const allSelected = allKeys.length > 0 && allKeys.every(k => selectedKeys.has(k));

  const togglePersonTag = tag => {
    setSelectedPersonTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const toggleObjectTag = tag => {
    setSelectedObjectTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const handleAddCustomTag = () => {
    const raw = customTagInput.trim().replace(/^#+/, '');
    if (!raw) return;
    const tokens = normalizePhotoTagTokens(raw);
    if (!tokens.length) return;
    setCustomTags(prev => Array.from(new Set([...prev, ...tokens])));
    setCustomTagInput('');
  };

  const handleRemoveCustomTag = tag => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  // Collect all tags to apply
  const allTagsToApply = React.useMemo(() => {
    const set = new Set();
    selectedPersonTags.forEach(t => set.add(t));
    selectedObjectTags.forEach(t => set.add(t));
    customTags.forEach(t => set.add(t));
    return Array.from(set);
  }, [selectedPersonTags, selectedObjectTags, customTags]);

  // Copy tags from selected photos
  const handleCopyTags = React.useCallback(() => {
    if (!selectedPhotos.length) {
      showToast?.('태그를 복사할 사진을 먼저 선택해 주세요.', 'info');
      return;
    }
    const tags = [];
    selectedPhotos.forEach(p => {
      const tokens = normalizePhotoTagTokens(p.tags || '');
      tokens.forEach(t => { if (!tags.includes(t)) tags.push(t); });
    });
    if (!tags.length) {
      showToast?.('선택한 사진에 등록된 태그가 없습니다.', 'info');
      return;
    }
    setTagClipboard(tags);
    setCopiedTags(tags);
    showToast?.(`태그 ${tags.length}개(${tags.map(t => '#' + t).join(' ')})를 복사했습니다.`, 'success');
  }, [selectedPhotos, showToast]);

  // Paste copied tags to selected photos
  const handlePasteTags = React.useCallback(async () => {
    const tags = getTagClipboard();
    if (!tags.length) {
      showToast?.('복사된 태그가 없습니다. 사진 선택 후 태그 복사를 먼저 진행해 주세요.', 'info');
      return;
    }
    if (!selectedPhotos.length) {
      showToast?.('태그를 붙여넣을 사진을 먼저 선택해 주세요.', 'info');
      return;
    }
    if (typeof onApplyTags === 'function') {
      await onApplyTags(tags.map(t => `#${t}`).join(' '));
    }
  }, [selectedPhotos, onApplyTags, showToast]);

  // Handle Tag Apply
  const handleApply = async () => {
    if (!allTagsToApply.length) {
      showToast?.('적용할 인물 또는 사물 태그를 하나 이상 선택해 주세요.', 'info');
      return;
    }
    if (!selectedPhotos.length) {
      showToast?.('태그를 적용할 사진을 선택해 주세요.', 'info');
      return;
    }
    if (typeof onApplyTags === 'function') {
      const tagString = allTagsToApply.map(t => `#${t}`).join(' ');
      await onApplyTags(tagString);
      // Reset selections
      setSelectedPersonTags(new Set());
      setSelectedObjectTags(new Set());
      setCustomTags([]);
    }
  };

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = e => {
      const target = e.target;
      if (target && ((target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) || target.isContentEditable)) {
        return;
      }
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        onToggleAll?.();
      } else if (isCmdOrCtrl && (e.key === 'c' || e.key === 'C')) {
        if (selectedPhotos.length > 0) {
          e.preventDefault();
          handleCopyTags();
        }
      } else if (isCmdOrCtrl && (e.key === 'v' || e.key === 'V')) {
        if (selectedPhotos.length > 0 && copiedTags.length > 0) {
          e.preventDefault();
          void handlePasteTags();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleAll, handleCopyTags, handlePasteTags, selectedPhotos.length, copiedTags.length]);

  if (selectedCount === 0) return null;

  return /*#__PURE__*/React.createElement('div', {
    className: 'photo-bulk-action-bar v2-photo-bulk-bar',
    role: 'region',
    'aria-label': '사진 일괄 편집 바',
    style: {
      position: 'sticky',
      bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-lg, 16px)',
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
      width: '100%',
      maxWidth: '820px',
      margin: '0 auto',
      boxSizing: 'border-box',
      ...style
    }
  },
    // Top Row: Count & Quick Selection Controls
    /*#__PURE__*/React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }
    },
      /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        /*#__PURE__*/React.createElement('span', {
          style: {
            fontSize: 'var(--font-size-sm)',
            fontWeight: 800,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        },
          /*#__PURE__*/React.createElement('span', {
            style: {
              background: 'var(--brand, #7C3AED)',
              color: 'var(--on-brand, #fff)',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: 'var(--font-size-xs)'
            }
          }, `${selectedCount}장 선택`),
          /*#__PURE__*/React.createElement('span', { style: { color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' } },
            allKeys.length > 0 ? `(전체 ${allKeys.length}장 중)` : ''
          )
        ),
        onToggleAll && /*#__PURE__*/React.createElement('button', {
          type: 'button',
          onClick: onToggleAll,
          style: {
            border: 'none', background: 'transparent', color: 'var(--brand, #7C3AED)',
            fontSize: 'var(--font-size-xs)', fontWeight: 700, cursor: 'pointer', padding: '2px 6px'
          }
        }, allSelected ? '전체 해제' : '전체 선택 (Ctrl+A)')
      ),
      /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
        // Copy tags button
        /*#__PURE__*/React.createElement('button', {
          type: 'button',
          onClick: handleCopyTags,
          title: '선택한 사진 태그 복사 (Ctrl+C)',
          style: {
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            height: '30px', padding: '0 10px', borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
            color: 'var(--text-main)', fontSize: 'var(--font-size-xs)', fontWeight: 700, cursor: 'pointer'
          }
        }, '태그 복사'),
        // Paste tags button with Lucide SVG
        /*#__PURE__*/React.createElement('button', {
          type: 'button',
          onClick: handlePasteTags,
          disabled: isSaving || copiedTags.length === 0,
          title: copiedTags.length > 0 ? `복사된 태그(${copiedTags.map(t => '#' + t).join(' ')}) 붙여넣기 (Ctrl+V)` : '복사된 태그가 없습니다',
          style: {
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            height: '30px', padding: '0 10px', borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border-color)',
            background: copiedTags.length > 0 ? 'var(--brand-soft, rgba(124,58,237,0.08))' : 'var(--bg-secondary)',
            color: copiedTags.length > 0 ? 'var(--brand, #7C3AED)' : 'var(--text-muted)',
            fontSize: 'var(--font-size-xs)', fontWeight: 700,
            cursor: copiedTags.length > 0 ? 'pointer' : 'not-allowed',
            opacity: copiedTags.length > 0 ? 1 : 0.6
          }
        },
          /*#__PURE__*/React.createElement(ClipboardPasteIcon, { size: 14 }),
          `붙여넣기${copiedTags.length > 0 ? ` (${copiedTags.length})` : ''}`
        ),
        // Delete button
        onDeletePhotos && /*#__PURE__*/React.createElement('button', {
          type: 'button',
          onClick: () => {
            const run = () => { void onDeletePhotos(); };
            if (typeof onRequestConfirm === 'function') {
              onRequestConfirm('사진 삭제', `선택한 ${selectedCount}장의 사진을 삭제할까요?`, run);
            } else {
              run();
            }
          },
          disabled: isDeleting,
          title: '선택한 사진 삭제',
          style: {
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            height: '30px', padding: '0 10px', borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid #FCA5A5', background: 'rgba(239,68,68,0.08)',
            color: '#EF4444', fontSize: 'var(--font-size-xs)', fontWeight: 700, cursor: 'pointer'
          }
        },
          /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }),
          isDeleting ? '삭제 중…' : '삭제'
        ),
        // Clear selection button
        onClearSelection && /*#__PURE__*/React.createElement('button', {
          type: 'button',
          onClick: onClearSelection,
          style: {
            border: 'none', background: 'transparent', color: 'var(--text-muted)',
            fontSize: 'var(--font-size-xs)', cursor: 'pointer', padding: '2px 6px'
          }
        }, '선택 취소')
      )
    ),

    // Middle Row: Multi-person Candidates (Check multiple people simultaneously)
    personCandidates.length > 0 && /*#__PURE__*/React.createElement('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '4px' }
    },
      /*#__PURE__*/React.createElement('div', {
        style: { fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)' }
      }, '인물 태그 지정 (복수 선택 가능):'),
      /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto' }
      },
        personCandidates.map(candidate => {
          const label = candidate.label || candidate.name || candidate;
          const isChecked = selectedPersonTags.has(label);
          return /*#__PURE__*/React.createElement('button', {
            key: label,
            type: 'button',
            onClick: () => togglePersonTag(label),
            'aria-pressed': isChecked,
            style: {
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              minHeight: '28px', padding: '0 10px', borderRadius: '999px',
              border: isChecked ? '1px solid var(--brand, #7C3AED)' : '1px solid var(--border-color)',
              background: isChecked ? 'var(--brand, #7C3AED)' : 'var(--bg-secondary)',
              color: isChecked ? 'var(--on-brand, #fff)' : 'var(--text-main)',
              fontSize: 'var(--font-size-xs)', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s ease'
            }
          },
            isChecked ? '✓ ' : '+ ',
            label
          );
        })
      )
    ),

    // Group Move Row (e.g. for Places or Memory groups)
    groupOptions.length > 0 && onMoveToGroup && /*#__PURE__*/React.createElement('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '4px' }
    },
      /*#__PURE__*/React.createElement('div', {
        style: { fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)' }
      }, '그룹 이동 / 장소 지정:'),
      /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '80px', overflowY: 'auto' }
      },
        groupOptions.map(opt => /*#__PURE__*/React.createElement('button', {
          key: opt.id || opt.label,
          type: 'button',
          onClick: () => onMoveToGroup(opt),
          style: {
            minHeight: '28px', padding: '0 10px', borderRadius: '999px', border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: 'var(--font-size-xs)',
            fontWeight: 700, cursor: 'pointer'
          }
        }, `#${opt.label || opt.name}`))
      )
    ),

    // Quick Object Tags Row
    /*#__PURE__*/React.createElement('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '4px' }
    },
      /*#__PURE__*/React.createElement('div', {
        style: { fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)' }
      }, '사물/배경 추천 태그:'),
      /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }
      },
        DEFAULT_OBJECT_TAG_RECOMMENDATIONS.map(tag => {
          const isChecked = selectedObjectTags.has(tag);
          return /*#__PURE__*/React.createElement('button', {
            key: tag,
            type: 'button',
            onClick: () => toggleObjectTag(tag),
            style: {
              minHeight: '26px', padding: '0 8px', borderRadius: '999px',
              border: isChecked ? '1px solid #2563EB' : '1px solid var(--border-color)',
              background: isChecked ? '#2563EB' : 'var(--bg-secondary)',
              color: isChecked ? '#fff' : 'var(--text-main)',
              fontSize: 'var(--font-size-2xs)', fontWeight: 700, cursor: 'pointer'
            }
          }, isChecked ? `✓ #${tag}` : `#${tag}`);
        })
      )
    ),

    // Custom Tag Input & Action Row
    /*#__PURE__*/React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }
    },
      /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '220px' }
      },
        /*#__PURE__*/React.createElement('input', {
          type: 'text',
          placeholder: '직접 태그 입력 (예: #바다, #삼촌)',
          value: customTagInput,
          onChange: e => setCustomTagInput(e.target.value),
          onKeyDown: e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomTag();
            }
          },
          style: {
            flex: 1, height: '34px', padding: '0 10px', borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
            color: 'var(--text-main)', fontSize: 'var(--font-size-xs)'
          }
        }),
        /*#__PURE__*/React.createElement('button', {
          type: 'button',
          onClick: handleAddCustomTag,
          disabled: !customTagInput.trim(),
          style: {
            height: '34px', padding: '0 12px', borderRadius: 'var(--radius-sm, 6px)',
            border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)',
            fontSize: 'var(--font-size-xs)', fontWeight: 700, cursor: 'pointer',
            opacity: customTagInput.trim() ? 1 : 0.5
          }
        }, '추가')
      ),
      // Applied Custom Tag Chips
      customTags.length > 0 && /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }
      },
        customTags.map(tag => /*#__PURE__*/React.createElement('span', {
          key: tag,
          style: {
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'var(--brand-soft, rgba(124,58,237,0.1))', color: 'var(--brand, #7C3AED)',
            padding: '2px 8px', borderRadius: '999px', fontSize: 'var(--font-size-2xs)', fontWeight: 700
          }
        },
          `#${tag}`,
          /*#__PURE__*/React.createElement('button', {
            type: 'button',
            onClick: () => handleRemoveCustomTag(tag),
            style: { border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0 }
          }, '×')
        ))
      ),
      // Apply Save Button
      onApplyTags && /*#__PURE__*/React.createElement('button', {
        type: 'button',
        onClick: handleApply,
        disabled: isSaving || allTagsToApply.length === 0,
        style: {
          marginLeft: 'auto',
          height: '34px', padding: '0 18px', borderRadius: 'var(--radius-sm, 6px)',
          border: 'none',
          background: allTagsToApply.length > 0 ? 'var(--brand, #7C3AED)' : 'var(--bg-secondary)',
          color: allTagsToApply.length > 0 ? 'var(--on-brand, #fff)' : 'var(--text-muted)',
          fontSize: 'var(--font-size-xs)', fontWeight: 800,
          cursor: allTagsToApply.length > 0 ? 'pointer' : 'default',
          opacity: isSaving ? 0.6 : 1,
          transition: 'all 0.15s ease'
        }
      },
        isSaving
          ? '저장 중…'
          : (allTagsToApply.length > 0 ? `선택한 ${selectedCount}장에 태그(${allTagsToApply.length}개) 저장` : '태그를 선택해 주세요')
      )
    )
  );
}
