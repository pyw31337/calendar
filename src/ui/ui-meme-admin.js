/**
 * 밈 키보드 이미지 풀 관리 (어드민 전용). 두 단계 작업 흐름:
 *   1) 일괄 업로드 -- 파일을 통으로 선택하면 병렬로 Storage에 올리고 빈 해시태그로 등록한다.
 *   2) 라이트박스 태깅 -- 업로드가 끝난 뒤 그리드에서 사진 하나씩 열어 해시태그를 붙인다.
 * 두 단계를 분리한 건 700장 같은 대량 업로드 도중 태그 입력까지 같이 하려면 각 업로드가
 * 끝날 때마다 관리자가 대기해야 해서 느려지기 때문 -- 사용자가 요청한 순서(전부 올린 뒤 태깅)
 * 그대로다.
 */
import { uploadMemePoolAssets, generateMemePoolId, parseHashtagInput, describeMemeUploadError } from '../core/meme-pool.js';
import { formatChatFileSize } from '../core/chat-file-attachments.js';
import { ImageUploadOverlay } from './ui-overlays.js';

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

// 중복 업로드 판단 키: 파일명 + 포맷(MIME/확장자) + 용량이 전부 같으면 같은 파일로 본다.
// 기존 풀 항목은 fileSize가 이번 변경 이전에는 저장되지 않았을 수 있어(null), 그 경우엔
// 이 키가 서로 달라져 매칭되지 않는다 -- 안전한 방향(과거 항목은 중복판정 못 해도 새로 올라간
// 항목끼리는 확실히 잡는다)의 절충이다.
function buildMemeDedupKey(name, size) {
  const normalizedName = String(name || '').trim().toLowerCase();
  const ext = (normalizedName.match(/\.[a-z0-9]+$/) || [''])[0];
  return `${normalizedName}|${ext}|${Number(size) || 0}`;
}

function formatUploadedAt(item) {
  const ts = Number(item?.updatedAt || item?.createdAt);
  if (!Number.isFinite(ts) || ts <= 0) return '';
  try {
    return new Date(ts).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}

export function MemeAdminPanel({ pool = [], onPoolChange, password, showToast }) {
  const React = window.React;
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const __deps = window.GATHER_UI_DEPS || {};
  const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
  const upsertRemote = __deps.memePoolUpsertRemote || GATHER_APP_UTILS.memePoolUpsertRemote;
  const deleteRemote = __deps.memePoolDeleteRemote || GATHER_APP_UTILS.memePoolDeleteRemote;
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon;
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon;
  const ConfirmDialog = __comp.ConfirmDialog || __deps.ConfirmDialog;
  const fileInputRef = React.useRef(null);
  const [uploadProgress, setUploadProgress] = React.useState(null); // { done, total } | null
  const [resetProgress, setResetProgress] = React.useState(null); // { done, total } | null
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [selected, setSelected] = React.useState(null); // one pool item, opened in the lightbox
  const [tagDraft, setTagDraft] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [filterUntaggedOnly, setFilterUntaggedOnly] = React.useState(false);

  const notify = (msg, kind) => { if (typeof showToast === 'function') showToast(msg, kind); };

  const handleFilesSelected = async (fileList) => {
    const rawFiles = Array.from(fileList || []).filter(f => {
      const type = f.type || '';
      const name = f.name || '';
      if (/^image\//i.test(type)) return true;
      if (/\.(gif|jpg|jpeg|png|webp|heic|heif)$/i.test(name)) return true;
      // iOS Files 등이 MIME/확장자를 비우는 경우가 있어 바이트 스니프에 맡긴다.
      return !type;
    });
    if (rawFiles.length === 0) return;
    if (!password) {
      notify('관리자 세션이 없습니다. 다시 로그인해 주세요.', 'error');
      return;
    }
    if (typeof upsertRemote !== 'function') {
      notify('등록 함수를 찾지 못했습니다. 새로고침 후 다시 시도해 주세요.', 'error');
      return;
    }

    // 이미 풀에 있거나, 이번에 고른 파일들 사이에서 이름+포맷+용량이 겹치는 항목은 건너뛴다.
    const existingKeys = new Set(pool.map(p => buildMemeDedupKey(p.fileName, p.fileSize)));
    const seenInBatch = new Set();
    const files = [];
    let duplicateCount = 0;
    rawFiles.forEach(file => {
      const key = buildMemeDedupKey(file.name, file.size);
      if (existingKeys.has(key) || seenInBatch.has(key)) {
        duplicateCount += 1;
        return;
      }
      seenInBatch.add(key);
      files.push(file);
    });
    if (files.length === 0) {
      notify(`이미 등록된 이미지와 동일해 ${duplicateCount}장 모두 건너뛰었습니다.`, 'error');
      return;
    }

    setUploadProgress({ done: 0, total: files.length });
    const uploaded = [];
    const failures = [];
    await runWithConcurrency(files, async file => {
      try {
        const id = generateMemePoolId();
        const assets = await uploadMemePoolAssets(id, file);
        if (!assets) {
          failures.push({ file, error: new Error('업로드 결과가 비었습니다') });
          return null;
        }
        const ok = await upsertRemote(password, {
          id, thumbUrl: assets.thumbUrl, fullUrl: assets.fullUrl, fileName: file.name,
          fileSize: file.size, width: assets.width, height: assets.height, hashtags: []
        });
        if (!ok) {
          failures.push({ file, error: new Error('등록 함수가 거절했습니다') });
          return null;
        }
        const now = Date.now();
        const item = {
          id, thumbUrl: assets.thumbUrl, fullUrl: assets.fullUrl, fileName: file.name,
          fileSize: file.size, hashtags: [], width: assets.width, height: assets.height,
          createdAt: now, updatedAt: now
        };
        uploaded.push(item);
        return item;
      } catch (error) {
        failures.push({ file, error });
        return null;
      }
    }, UPLOAD_CONCURRENCY, (done, total) => setUploadProgress({ done, total }));
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (uploaded.length > 0 && typeof onPoolChange === 'function') onPoolChange(prev => [...uploaded, ...prev]);
    const failCount = files.length - uploaded.length;
    const reason = failures[0]?.error ? describeMemeUploadError(failures[0].error) : '';
    const dupSuffix = duplicateCount > 0 ? ` (중복 ${duplicateCount}장 제외)` : '';
    notify(
      failCount > 0
        ? `${uploaded.length}장 업로드 완료, ${failCount}장 실패${reason ? ` — ${reason}` : ''}${dupSuffix}`
        : `${uploaded.length}장 업로드 완료${dupSuffix}`,
      failCount > 0 ? 'error' : 'success'
    );
    // 업로드가 끝나면 바로 태깅을 시작할 수 있도록 방금 올린 첫 사진의 라이트박스를 자동으로 연다.
    if (uploaded.length > 0) openLightbox(uploaded[0]);
  };

  // 태그가 없는 openLightbox: 입력창은 "새 태그 추가"용이지 기존 태그 편집용이 아니다 (기존
  // 태그는 아래에서 칩으로 보여주고 하나씩 지운다) -- 다시 열 때마다 비워서 시작한다.
  const openLightbox = (item) => { setSelected(item); setTagDraft(''); };
  const closeLightbox = () => { setSelected(null); setTagDraft(''); };

  const untaggedList = React.useMemo(() => pool.filter(p => !(p.hashtags || []).length), [pool]);
  const visibleList = filterUntaggedOnly ? untaggedList : pool;
  const pendingTags = React.useMemo(() => parseHashtagInput(tagDraft), [tagDraft]);
  // 미태그만 보기 상태에서 태그를 추가하면 그 사진이 곧바로 목록에서 빠져버려 findIndex가 -1을
  // 반환한다 -- Tab/이전·다음이 그 순간 먹통이 되는 원인이었다. 마지막으로 목록에 있었던 위치를
  // 기억해뒀다가, 사라진 뒤에는 그 자리를 "다음" 앵커로 쓴다: 뒤 항목들이 한 칸씩 당겨와서
  // 원래 자리에 있던 항목이 곧 다음 사진이기 때문에, 이 경우 다음은 +1이 아니라 앵커 그 자체다.
  const lastKnownIndexRef = React.useRef(-1);
  const rawSelectedIndex = selected ? visibleList.findIndex(p => p.id === selected.id) : -1;
  if (rawSelectedIndex !== -1) lastKnownIndexRef.current = rawSelectedIndex;
  else if (!selected) lastKnownIndexRef.current = -1;

  // 낙관적 저장 + 서버 반영 공통 로직: Cloud Function 호출(콜드 스타트 시 몇 초씩 걸릴 수 있음)을
  // 기다리지 않고 로컬 상태를 즉시 갱신한 뒤, 실패했을 때만 원래 태그로 되돌리고 알린다.
  const commitHashtags = (target, hashtags, previousHashtags) => {
    if (typeof onPoolChange === 'function') {
      onPoolChange(prev => prev.map(p => p.id === target.id ? { ...p, hashtags } : p));
    }
    setSelected(prev => (prev && prev.id === target.id ? { ...prev, hashtags } : prev));

    upsertRemote(password, { id: target.id, hashtags }).then(ok => {
      if (ok) return;
      throw new Error('저장 실패');
    }).catch(err => {
      if (typeof onPoolChange === 'function') {
        onPoolChange(prev => prev.map(p => p.id === target.id ? { ...p, hashtags: previousHashtags } : p));
      }
      setSelected(prev => (prev && prev.id === target.id ? { ...prev, hashtags: previousHashtags } : prev));
      notify(`"${target.fileName || target.id}" 태그 저장 실패 — ${describeMemeUploadError(err)}`, 'error');
    });
  };

  // Enter(또는 버튼)는 입력창의 태그를 기존 태그 목록에 "추가"한다 (한 장에 태그가 하나만
  // 저장되던 문제 -- 이전엔 매번 입력값 전체로 교체했었다). 저장 후 입력창을 비워서 바로
  // 이어서 다음 태그를 타이핑할 수 있게 한다. 같은 사진에 머무르는 동작은 그대로 유지.
  const handleAddTags = () => {
    if (!selected) return;
    const target = selected;
    const previousHashtags = target.hashtags || [];
    const newTags = parseHashtagInput(tagDraft);
    if (newTags.length === 0) return;
    const hashtags = Array.from(new Set([...previousHashtags, ...newTags]));
    setTagDraft('');
    commitHashtags(target, hashtags, previousHashtags);
  };

  const handleRemoveTag = (tag) => {
    if (!selected) return;
    const target = selected;
    const previousHashtags = target.hashtags || [];
    const hashtags = previousHashtags.filter(t => t !== tag);
    commitHashtags(target, hashtags, previousHashtags);
  };

  // Tab/Shift+Tab, 이전/다음 버튼이 공유하는 이동 로직. 저장(추가) 여부와 무관하게 현재 필터로
  // 보이는 목록(visibleList) 순서를 그대로 따라간다 -- 아직 추가하지 않은 입력창 내용은
  // openLightbox가 비워서 자연히 버려진다.
  const computeAdjacentIndex = (direction) => {
    if (visibleList.length === 0) return -1;
    const itemStillPresent = rawSelectedIndex !== -1;
    const anchor = itemStillPresent ? rawSelectedIndex : Math.min(lastKnownIndexRef.current, visibleList.length - 1);
    if (anchor < 0) return -1;
    // "다음"은 사진이 아직 목록에 있으면 +1, 방금 사라졌으면(=태그 추가로 필터에서 빠짐) 그
    // 빈자리로 밀려온 항목이 이미 "다음"이므로 앵커 그대로. "이전"은 두 경우 모두 앵커-1.
    const targetIndex = direction > 0 ? (itemStillPresent ? anchor + 1 : anchor) : anchor - 1;
    return (targetIndex < 0 || targetIndex >= visibleList.length) ? -1 : targetIndex;
  };
  const goToAdjacent = (direction) => {
    const targetIndex = computeAdjacentIndex(direction);
    if (targetIndex === -1) return;
    openLightbox(visibleList[targetIndex]);
  };

  const handleDelete = async () => {
    if (!selected || isDeleting) return;
    setIsDeleting(true);
    try {
      const ok = await deleteRemote(password, selected.id);
      if (!ok) { notify('삭제 실패', 'error'); return; }
      if (typeof onPoolChange === 'function') onPoolChange(prev => prev.filter(p => p.id !== selected.id));
      closeLightbox();
    } catch (err) {
      notify(describeMemeUploadError(err), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // 한글 IME 조합 중 Enter가 조합 확정으로 오인돼 잘린 텍스트("#먹방" 대신 "#먹")가 저장되고
  // 바로 다음 사진으로 넘어가버리던 버그(입력창에 isComposing 체크가 없었음)가 있었다 -- 이미
  // 그렇게 잘못 붙어버린 태그들을 사진 하나하나 열어 지우게 하는 대신, 한 번에 전부 비우고
  // 고쳐진 입력으로 다시 태깅할 수 있게 하는 복구용 되돌리기.
  const handleResetAllTags = async () => {
    setShowResetConfirm(false);
    const targets = pool.filter(p => (p.hashtags || []).length > 0);
    if (targets.length === 0) return;
    if (typeof onPoolChange === 'function') {
      onPoolChange(prev => prev.map(p => ({ ...p, hashtags: [] })));
    }
    setResetProgress({ done: 0, total: targets.length });
    let failCount = 0;
    await runWithConcurrency(targets, async item => {
      const ok = await upsertRemote(password, { id: item.id, hashtags: [] }).catch(() => false);
      if (!ok) failCount += 1;
    }, UPLOAD_CONCURRENCY, (done, total) => setResetProgress({ done, total }));
    setResetProgress(null);
    notify(
      failCount > 0
        ? `${targets.length - failCount}장 초기화 완료, ${failCount}장 실패 (새로고침 후 다시 시도해 주세요)`
        : `${targets.length}장의 태그를 모두 초기화했습니다.`,
      failCount > 0 ? 'error' : 'success'
    );
  };

  return /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    showResetConfirm && ConfirmDialog && /*#__PURE__*/React.createElement(ConfirmDialog, {
      title: "전체 태그 초기화",
      message: `현재 태그가 붙어 있는 ${pool.filter(p => (p.hashtags || []).length > 0).length}장의 해시태그를 모두 지웁니다. 되돌릴 수 없습니다. 계속할까요?`,
      onConfirm: handleResetAllTags,
      onCancel: () => setShowResetConfirm(false)
    }),
    resetProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, {
      label: '태그 초기화 중...',
      pct: resetProgress.total ? Math.round((resetProgress.done / resetProgress.total) * 100) : 0,
      current: resetProgress.done,
      total: resetProgress.total
    }),
    uploadProgress && /*#__PURE__*/React.createElement(ImageUploadOverlay, {
      label: '밈 이미지 업로드 중...',
      pct: uploadProgress.total ? Math.round((uploadProgress.done / uploadProgress.total) * 100) : 0,
      current: uploadProgress.done,
      total: uploadProgress.total
    }),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' } },
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("h4", { style: { fontSize: '0.96rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 } }, `밈 이미지 풀 (${pool.length}장, 미태그 ${untaggedList.length}장)`),
        /*#__PURE__*/React.createElement("p", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', margin: '2px 0 0 0' } }, "여러 장을 한 번에 선택해 올린 뒤, 아래 그리드에서 사진을 눌러 해시태그를 입력하세요. 같은 파일명·포맷·용량의 이미지는 자동으로 건너뜁니다.")
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
        /*#__PURE__*/React.createElement("button", {
          type: "button", className: "btn btn-danger",
          onClick: () => setShowResetConfirm(true),
          disabled: !!resetProgress || untaggedList.length === pool.length,
          title: "잘못 붙은 태그를 한 번에 지우고 다시 태깅할 때 사용하세요.",
          style: { height: '44px', padding: '0 14px', fontWeight: 800 }
        }, "전체 태그 초기화"),
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
        ref: fileInputRef, type: "file", accept: "image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,image/*", multiple: true, style: { display: 'none' },
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
        position: 'fixed', inset: 0, zIndex: 20700, backgroundColor: 'rgba(0,0,0,0.55)',
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
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end' } },
          /*#__PURE__*/React.createElement("button", {
            type: "button", onClick: closeLightbox, "aria-label": "닫기",
            style: {
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0
            }
          }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }) : "✕")
        ),
        /*#__PURE__*/React.createElement("img", {
          src: selected.fullUrl || selected.thumbUrl, alt: selected.fileName || '',
          style: { width: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }
        }),
        /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 10px',
            backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)'
          }
        },
          /*#__PURE__*/React.createElement("span", { style: { fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all' } }, selected.fileName || selected.id),
          /*#__PURE__*/React.createElement("span", null, [
            selected.width && selected.height ? `${selected.width}×${selected.height}px` : '',
            typeof selected.fileSize === 'number' ? formatChatFileSize(selected.fileSize) : '',
            formatUploadedAt(selected)
          ].filter(Boolean).join(' · ') || '상세 정보 없음')
        ),
        /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '26px' }
        }, (selected.hashtags || []).length === 0
          ? /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-light)' } }, "아직 태그가 없습니다. 아래에서 추가하세요.")
          : (selected.hashtags || []).map(tag => /*#__PURE__*/React.createElement("span", {
              key: tag,
              style: {
                display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 4px 3px 10px',
                borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-primary-soft, #EEF2FF)',
                color: 'var(--accent-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 800
              }
            }, `#${tag}`, /*#__PURE__*/React.createElement("button", {
              type: "button", onClick: () => handleRemoveTag(tag), "aria-label": `#${tag} 삭제`,
              style: {
                width: '18px', height: '18px', border: 0, borderRadius: '50%', padding: 0, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'var(--accent-primary)', color: '#fff', flexShrink: 0
              }
            }, SmallXIcon ? /*#__PURE__*/React.createElement(SmallXIcon, { size: 9 }) : "×")))
        ),
        /*#__PURE__*/React.createElement("input", {
          type: "text", value: tagDraft, onChange: e => setTagDraft(e.target.value),
          onKeyDown: e => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') { e.preventDefault(); handleAddTags(); return; }
            if (e.key === 'Tab') { e.preventDefault(); goToAdjacent(e.shiftKey ? -1 : 1); }
          },
          placeholder: "새 태그 입력 후 Enter로 추가 (Tab: 다음, Shift+Tab: 이전)", autoFocus: true,
          className: "form-input", style: { fontSize: '16px' }
        }),
        pendingTags.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', alignItems: 'center' }
        },
          "추가 예정: ",
          pendingTags.map(tag => /*#__PURE__*/React.createElement("span", {
            key: tag,
            style: {
              padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px dashed var(--border-subtle)',
              color: 'var(--text-muted)', fontWeight: 700
            }
          }, `#${tag}`))
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-danger", onClick: handleDelete, disabled: isDeleting,
            style: { height: '44px', width: '44px', padding: 0, flexShrink: 0 }
          }, TrashIcon ? /*#__PURE__*/React.createElement(TrashIcon, { size: 16 }) : "삭제"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-secondary", onClick: closeLightbox,
            style: { height: '44px', padding: '0 14px', fontWeight: 800 }
          }, "닫기"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-primary", onClick: handleAddTags, disabled: pendingTags.length === 0,
            style: { height: '44px', padding: '0 14px', fontWeight: 800, flex: 1 }
          }, "태그 추가 (Enter)")
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '8px' } },
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-secondary", onClick: () => goToAdjacent(-1),
            disabled: computeAdjacentIndex(-1) === -1,
            style: { height: '40px', padding: '0 14px', fontWeight: 800, flex: 1 }
          }, "◀ 이전 (Shift+Tab)"),
          /*#__PURE__*/React.createElement("button", {
            type: "button", className: "btn btn-secondary", onClick: () => goToAdjacent(1),
            disabled: computeAdjacentIndex(1) === -1,
            style: { height: '40px', padding: '0 14px', fontWeight: 800, flex: 1 }
          }, "다음 (Tab) ▶")
        )
      )
    )
  );
}
