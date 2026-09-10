/**
 * 밈 키보드 이미지 풀 관리 (어드민 전용). 두 단계 작업 흐름:
 *   1) 일괄 업로드 -- 파일을 통으로 선택하면 병렬로 Storage에 올리고 빈 해시태그로 등록한다.
 *   2) 라이트박스 태깅 -- 업로드가 끝난 뒤 그리드에서 사진 하나씩 열어 해시태그를 붙인다.
 * 두 단계를 분리한 건 700장 같은 대량 업로드 도중 태그 입력까지 같이 하려면 각 업로드가
 * 끝날 때마다 관리자가 대기해야 해서 느려지기 때문 -- 사용자가 요청한 순서(전부 올린 뒤 태깅)
 * 그대로다.
 */
import { uploadMemePoolAssets, generateMemePoolId, parseHashtagInput } from '../core/meme-pool.js';

// 브라우저당 동시 연결 제한(HTTP/1.1 기준 6개)은 Firebase Storage가 HTTP/2로 응답해 실제로는
// 훨씬 많이 동시에 보낼 수 있다. 이전 "5장씩"은 700장을 올리는 데 140번의 대기 라운드가
// 필요해 체감상 느렸다 -- 24로 올려 라운드 수를 1/5 수준으로 줄인다.
const UPLOAD_CONCURRENCY = 24;

async function runWithConcurrency(items, worker, concurrency, onProgress) {
  let cursor = 0;
  let done = 0;
  const results = new Array(items.length);
  async function runOne() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i], i).catch(err => ({ error: err }));
      done += 1;
      if (typeof onProgress === 'function') onProgress(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runOne));
  return results;
}

export function MemeAdminPanel({ pool = [], onPoolChange, password, showToast }) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
  const upsertRemote = __deps.memePoolUpsertRemote || GATHER_APP_UTILS.memePoolUpsertRemote;
  const deleteRemote = __deps.memePoolDeleteRemote || GATHER_APP_UTILS.memePoolDeleteRemote;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const fileInputRef = React.useRef(null);
  const [uploadProgress, setUploadProgress] = React.useState(null); // { done, total } | null
  const [selected, setSelected] = React.useState(null); // one pool item, opened in the lightbox
  const [tagDraft, setTagDraft] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [filterUntaggedOnly, setFilterUntaggedOnly] = React.useState(false);

  const notify = (msg, kind) => { if (typeof showToast === 'function') showToast(msg, kind); };

  const handleFilesSelected = async (fileList) => {
    const files = Array.from(fileList || []).filter(f => /^image\//i.test(f.type || '') || /\.(gif|jpg|jpeg|png|webp)$/i.test(f.name || ''));
    if (files.length === 0) return;
    setUploadProgress({ done: 0, total: files.length });
    const uploaded = [];
    await runWithConcurrency(files, async file => {
      const id = generateMemePoolId();
      const assets = await uploadMemePoolAssets(id, file);
      if (!assets) return null;
      const ok = await upsertRemote(password, {
        id, thumbUrl: assets.thumbUrl, fullUrl: assets.fullUrl, fileName: file.name,
        width: assets.width, height: assets.height, hashtags: []
      });
      if (!ok) return null;
      const item = { id, thumbUrl: assets.thumbUrl, fullUrl: assets.fullUrl, fileName: file.name, hashtags: [], width: assets.width, height: assets.height };
      uploaded.push(item);
      return item;
    }, UPLOAD_CONCURRENCY, (done, total) => setUploadProgress({ done, total }));
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (uploaded.length > 0 && typeof onPoolChange === 'function') onPoolChange(prev => [...uploaded, ...prev]);
    const failCount = files.length - uploaded.length;
    notify(failCount > 0 ? `${uploaded.length}장 업로드 완료, ${failCount}장 실패` : `${uploaded.length}장 업로드 완료`, failCount > 0 ? 'error' : 'success');
  };

  const openLightbox = (item) => { setSelected(item); setTagDraft((item.hashtags || []).map(t => `#${t}`).join(' ')); };
  const closeLightbox = () => { setSelected(null); setTagDraft(''); };

  const untaggedList = React.useMemo(() => pool.filter(p => !(p.hashtags || []).length), [pool]);
  const visibleList = filterUntaggedOnly ? untaggedList : pool;

  const handleSaveTags = async (advanceToNextUntagged) => {
    if (!selected || isSaving) return;
    setIsSaving(true);
    try {
      const hashtags = parseHashtagInput(tagDraft);
      const ok = await upsertRemote(password, { id: selected.id, hashtags });
      if (!ok) { notify('저장 실패', 'error'); return; }
      if (typeof onPoolChange === 'function') {
        onPoolChange(prev => prev.map(p => p.id === selected.id ? { ...p, hashtags } : p));
      }
      if (advanceToNextUntagged) {
        const next = untaggedList.find(p => p.id !== selected.id);
        if (next) openLightbox(next);
        else closeLightbox();
      } else {
        closeLightbox();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const ok = await deleteRemote(password, selected.id);
    if (!ok) { notify('삭제 실패', 'error'); return; }
    if (typeof onPoolChange === 'function') onPoolChange(prev => prev.filter(p => p.id !== selected.id));
    closeLightbox();
  };

  return /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' } },
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.96rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 } }, `밈 이미지 풀 (${pool.length}장, 미태그 ${untaggedList.length}장)`),
        /*#__PURE__*/React.createElement("p", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', margin: '2px 0 0 0' } }, "여러 장을 한 번에 선택해 올린 뒤, 아래 그리드에서 사진을 눌러 해시태그를 입력하세요.")
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-secondary",
          onClick: () => setFilterUntaggedOnly(v => !v),
          style: { height: '44px', padding: '0 14px', fontWeight: 800 }
        }, filterUntaggedOnly ? "전체 보기" : "미태그만 보기"),
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-poll-create",
          onClick: () => fileInputRef.current && fileInputRef.current.click(),
          disabled: !!uploadProgress,
          style: { height: '44px', padding: '0 16px', whiteSpace: 'nowrap' }
        }, uploadProgress ? `업로드 중 ${uploadProgress.done}/${uploadProgress.total}` : "+ 일괄 업로드")
      ),
      /*#__PURE__*/React.createElement("input", {
        ref: fileInputRef, type: "file", accept: "image/*,image/gif", multiple: true, style: { display: 'none' },
        onChange: e => handleFilesSelected(e.target.files)
      })
    ),
    visibleList.length === 0
      ? /*#__PURE__*/React.createElement("div", { style: { padding: '30px', color: 'var(--text-muted)', fontSize: 'var(--font-size-md)', textAlign: 'center' } }, "표시할 이미지가 없습니다.")
      : /*#__PURE__*/React.createElement("div", {
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: '6px' }
        }, visibleList.map(item => /*#__PURE__*/React.createElement("button", {
          key: item.id, type: "button", onClick: () => openLightbox(item),
          style: {
            position: 'relative', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
            aspectRatio: '1 / 1', cursor: 'pointer', backgroundColor: 'var(--bg-primary)'
          }
        },
          /*#__PURE__*/React.createElement("img", {
            src: item.thumbUrl || item.fullUrl, alt: item.fileName || '', loading: "lazy",
            style: { width: '100%', height: '100%', objectFit: 'cover' }
          }),
          !(item.hashtags || []).length && /*#__PURE__*/React.createElement("span", {
            "aria-hidden": true,
            style: {
              position: 'absolute', top: '4px', left: '4px', padding: '1px 6px', borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(220,38,38,0.9)', color: '#fff', fontSize: 'var(--font-size-2xs)', fontWeight: 800
            }
          }, "미태그")
        ))),
    selected && /*#__PURE__*/React.createElement("div", {
      onClick: closeLightbox,
      style: {
        position: 'fixed', inset: 0, zIndex: 20700, backgroundColor: 'rgba(15,23,42,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }
    },
      /*#__PURE__*/React.createElement("div", {
        onClick: e => e.stopPropagation(),
        style: {
          width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto',
          backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }
      },
        /*#__PURE__*/React.createElement("img", {
          src: selected.fullUrl || selected.thumbUrl, alt: selected.fileName || '',
          style: { width: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }
        }),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' } }, selected.fileName || selected.id),
        /*#__PURE__*/React.createElement("input", {
          type: "text", value: tagDraft, onChange: e => setTagDraft(e.target.value),
          placeholder: "해시태그 입력 (예: #눈물 #화남 짜증)", autoFocus: true,
          className: "form-input", style: { fontSize: '16px' }
        }),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-danger", onClick: handleDelete,
            style: { height: '44px', width: '44px', padding: 0, flexShrink: 0 }
          }, TrashIcon ? /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }) : "삭제"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-secondary", onClick: closeLightbox, disabled: isSaving,
            style: { height: '44px', padding: '0 14px', fontWeight: 800 }
          }, "취소"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-secondary", onClick: () => handleSaveTags(false), disabled: isSaving,
            style: { height: '44px', padding: '0 14px', fontWeight: 800, flex: 1 }
          }, "저장"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-primary", onClick: () => handleSaveTags(true), disabled: isSaving,
            style: { height: '44px', padding: '0 14px', fontWeight: 800, flex: 1 }
          }, "저장하고 다음 미태그")
        )
      )
    )
  );
}
