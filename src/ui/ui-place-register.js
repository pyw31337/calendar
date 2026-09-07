/**
 * Place register/edit modal (P4-12)
 */

/* P6 ESM classic-compat: free names that live scripts shared via global lexical scope */
const GATHER_APP_UTILS = window.GATHER_APP_UTILS || {};
function __gatherUiDeps() { return window.GATHER_UI_DEPS || {}; }
function getCalendarPlaces(calendar) {
  const f = __gatherUiDeps().getCalendarPlaces || GATHER_APP_UTILS.getCalendarPlaces;
  return typeof f === 'function' ? f(calendar) : [];
}
function arePlacesSameLocation(a, b) {
  const f = __gatherUiDeps().arePlacesSameLocation || GATHER_APP_UTILS.arePlacesSameLocation;
  return typeof f === 'function' ? f(a, b) : false;
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

function extractFirstUrl(...args) {
  const f = __gatherUiDeps().extractFirstUrl || GATHER_APP_UTILS.extractFirstUrl;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getDisplayPlaceAddress(...args) {
  const f = __gatherUiDeps().getDisplayPlaceAddress || GATHER_APP_UTILS.getDisplayPlaceAddress;
  return typeof f === 'function' ? f(...args) : undefined;
}
function getPlaceCategoryLabel(...args) {
  const f = __gatherUiDeps().getPlaceCategoryLabel || GATHER_APP_UTILS.getPlaceCategoryLabel;
  return typeof f === 'function' ? f(...args) : undefined;
}
function reformatMemoIntoDateLines(...args) {
  const f = __gatherUiDeps().reformatMemoIntoDateLines || GATHER_APP_UTILS.reformatMemoIntoDateLines;
  return typeof f === 'function' ? f(...args) : undefined;
}
function renderTextWithUrlBadge(...args) {
  const f = __gatherUiDeps().renderTextWithUrlBadge || GATHER_APP_UTILS.renderTextWithUrlBadge;
  return typeof f === 'function' ? f(...args) : undefined;
}
function sanitizeText(...args) {
  const f = __gatherUiDeps().sanitizeText || GATHER_APP_UTILS.sanitizeText;
  return typeof f === 'function' ? f(...args) : undefined;
}
export function PlaceRegisterModal({ calendar, editingPlace, onClose, onSave, onDelete, showToast, onRequestConfirm }) {
  const React = window.React;
  const __deps = window.GATHER_UI_DEPS || {};
  const __comp = window.GATHER_UI_COMPONENTS || {};
  const ResizableModalContainer = __comp.ResizableModalContainer || __deps.ResizableModalContainer || function Shell(p) { return React.createElement('div', p, p.children); };
  const SmallXIcon = __comp.SmallXIcon || __deps.SmallXIcon || function () { return '×'; };
  const TrashIcon = __comp.TrashIcon || __deps.TrashIcon || function () { return '🗑'; };
  const AutoGrowTextarea = __comp.AutoGrowTextarea || __deps.AutoGrowTextarea;
  const FormAddEditActionButtons = __comp.FormAddEditActionButtons || __deps.FormAddEditActionButtons;
  const PlaceSectionIcon = __comp.PlaceSectionIcon || __deps.PlaceSectionIcon;
    const SimpleBottomSheetPicker = __comp.SimpleBottomSheetPicker || __deps.SimpleBottomSheetPicker;
  const getPlaceCategories = __deps.getPlaceCategories || (window.GATHER_APP_UTILS || {}).getPlaceCategories || (() => []);
    const normalizePlaceDateForSort = __deps.normalizePlaceDateForSort || (window.GATHER_APP_UTILS || {}).normalizePlaceDateForSort || (d => d);
  const extractLeadingMemoDate = __deps.extractLeadingMemoDate || (window.GATHER_APP_UTILS || {}).extractLeadingMemoDate || (() => '');
  const autoGrowTextarea = __deps.autoGrowTextarea || (window.GATHER_APP_UTILS || {}).autoGrowTextarea || (() => {});
    const firebaseConfig = __deps.firebaseConfig || window.firebaseConfig;
  const KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY = __deps.KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY || {};

  const categories = getPlaceCategories(calendar);
  const [query, setQuery] = React.useState(editingPlace ? (editingPlace.name || '') : '');
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState(editingPlace ? {
    name: editingPlace.name, address: editingPlace.address, lat: editingPlace.lat, lng: editingPlace.lng,
    categoryLabel: '', phone: '', url: ''
  } : null);
  const [tourItems, setTourItems] = React.useState([]);
  const [tourLoading, setTourLoading] = React.useState(false);
  const tourGroups = React.useMemo(() => {
    const api = window.GATHER_APP_PLACE_SEARCH;
    return api && typeof api.groupTourItemsByType === 'function'
      ? api.groupTourItemsByType(tourItems)
      : (tourItems.length ? [{ key: 'etc', label: '주변 여행정보', items: tourItems }] : []);
  }, [tourItems]);
  // Display alias (별칭) -- optional nickname shown in lists while official search name stays on the place record.
  const [alias, setAlias] = React.useState(editingPlace ? (editingPlace.alias || '') : '');
  // Reformats an existing multi-visit memo into one line per date entry on open (see
  // reformatMemoIntoDateLines) -- a bulk-imported memo saved as one long run-on line otherwise
  // shows up exactly that way here, making it hard to find/edit any one visit's note.
  const [memo, setMemo] = React.useState(editingPlace ? reformatMemoIntoDateLines(editingPlace.memo || '') : '');
  const memoTextareaRef = React.useRef(null);
  // This modal remounts fresh each time it opens (isRegisterOpen && <PlaceRegisterModal .../>),
  // so a mount-only effect is enough to size an existing place's memo correctly on open.
  React.useEffect(() => autoGrowTextarea(memoTextareaRef.current, 480), []);
  const [categoryId, setCategoryId] = React.useState(editingPlace ? editingPlace.categoryId : (categories[0]?.id || 'etc'));
  const [visitStatus, setVisitStatus] = React.useState(editingPlace ? editingPlace.visitStatus : 'visited');
  const [visitDate, setVisitDate] = React.useState(() => {
    if (editingPlace) return editingPlace.visitDate || '';
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [saving, setSaving] = React.useState(false);
  const placeDirtySnapshot = () => JSON.stringify([
    query,
    selected ? [selected.id || '', selected.name || '', selected.address || '', selected.lat || '', selected.lng || ''] : '',
    alias,
    memo,
    categoryId,
    visitStatus,
    visitDate
  ]);
  const { requestClose, overlayOnClick } = useModalDirtyGuard(
    onClose,
    onRequestConfirm,
    undefined,
    true,
    placeDirtySnapshot,
    editingPlace?.id || 'new'
  );
  // Which tier of the fallback chain a manual (non-auto) search is currently waiting on --
  // null outside of a manual search. Drives the progress indicator below the search field so a
  // slow tier (e.g. a cold-started googlePlacesSearchProxy) reads as "still working", not frozen.
  const [searchStage, setSearchStage] = React.useState(null);
  const SEARCH_TIER_LABELS = { kakao: '카카오에서 검색 중...', google: '해외 장소 데이터베이스 확인 중...', nominatim: '지도 데이터에서 주소 확인 중...' };

  const searchPlacesWithProviders = async (cleanQuery, options = {}) => {
    const api = window.GATHER_APP_PLACE_SEARCH;
    if (!api || typeof api.searchPlaces !== 'function') return { provider: null, results: [] };
    return api.searchPlaces(cleanQuery, {
      ...options,
      firebaseConfig,
      categoryMap: KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY,
      onStage: setSearchStage
    });
  };

  // Tourism enrichment is deliberately read-only and never blocks place saving.
  // If the optional TourAPI secret is absent or the service is unavailable, the
  // normal place workflow remains unchanged.
  React.useEffect(() => {
    const api = window.GATHER_APP_PLACE_SEARCH;
    const lat = Number(selected?.lat);
    const lng = Number(selected?.lng);
    if (!api || typeof api.searchTourInfo !== 'function' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setTourItems([]);
      setTourLoading(false);
      return undefined;
    }
    let active = true;
    setTourLoading(true);
    api.searchTourInfo(firebaseConfig, { lat, lng, radius: 5000 })
      .then(items => { if (active) setTourItems(Array.isArray(items) ? items.slice(0, 6) : []); })
      .catch(() => { if (active) setTourItems([]); })
      .finally(() => { if (active) setTourLoading(false); });
    return () => { active = false; };
  }, [selected?.lat, selected?.lng, firebaseConfig?.projectId]);

  // Three-tier fallback chain, cheapest/most-reliable first: Kakao Local (키워드 검색) covers
  // domestic businesses very well and is effectively free at this app's scale, so it's tried
  // first for every search. Kakao is Korea-only, so an empty result there usually means either a
  // typo or (increasingly relevant now that 장소 등록 covers overseas trips too) a place outside
  // Korea -- Google Places picks up that case, since its POI coverage abroad (e.g. Vietnam) is
  // far better than Kakao's or Nominatim's. Nominatim/OSM stays as the last, always-free safety
  // net in case Google Places itself errors or comes up empty too. Kakao and Google both proxy
  // through a Cloud Function (kakaoLocalSearchProxy / googlePlacesSearchProxy) so neither API key
  // ships to the browser, same reasoning as the existing peekalinkProxy for link previews.
  // `auto` distinguishes a debounced as-you-type search (see the effect below) from an explicit
  // button/Enter submit -- an auto search only ever tries Kakao (fast, free, safe to fire on
  // every keystroke pause) and stays quiet on empty query / no-results, since the Google/Nominatim
  // tiers add real latency (and, for Google, real cost) that a live-typing dropdown shouldn't pay
  // on every partial fragment. Explicit submits get the full chain.
  const handleSearch = async (e, auto = false) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      if (!auto) showToast('검색할 주소나 업체명을 입력해 주세요.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { results: mapped } = await searchPlacesWithProviders(cleanQuery, { auto });
      setResults(mapped);
      if (mapped.length === 0 && !auto) showToast('검색 결과가 없습니다.', 'info');
    } catch (err) {
      console.error('Place search failed:', err);
      if (!auto) showToast('장소 검색에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
      setSearchStage(null);
    }
  };

  // Live-search-as-you-type, matching how Naver/Kakao map search behaves, instead of requiring an
  // explicit "검색" submit for every query change. Debounced so a fast typist doesn't fire one
  // request per keystroke, skipped entirely right after handleSelectResult fills the field with
  // the chosen result's own name (nothing new to search for at that point).
  const existingPlaceSuggestions = React.useMemo(() => {
    const trimmed = query.trim();
    if (selected && selected.name === trimmed) return [];
    if (trimmed.length < 2) return [];
    const q = trimmed.toLowerCase();
    return getCalendarPlaces(calendar)
      .filter(p => !editingPlace || p.id !== editingPlace.id)
      .filter(p => (p.name || '').toLowerCase().includes(q) || (p.alias || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, selected, calendar, editingPlace]);

  const duplicatePlace = React.useMemo(() => {
    if (!selected || selected.isExistingPlace || selected.mergeTargetId || selected.duplicateDismissed || editingPlace) return null;
    return getCalendarPlaces(calendar).find(place => place.id !== editingPlace?.id && arePlacesSameLocation(place, selected)) || null;
  }, [selected, calendar, editingPlace]);

  const handleSelectExistingPlace = place => {
    const name = place.alias || place.name;
    setSelected({
      id: place.id,
      name,
      address: getDisplayPlaceAddress(place) || place.name || '',
      lat: place.lat,
      lng: place.lng,
      duplicateDismissed: true,
      isExistingPlace: true
    });
    setQuery(name);
    setResults([]);
    if (place.alias) setAlias(place.alias);
    if (place.categoryId) setCategoryId(place.categoryId);
  };

  React.useEffect(() => {
    const trimmed = query.trim();
    if (selected && selected.name === trimmed) return undefined;
    if (trimmed.length < 2) {
      setResults([]);
      return undefined;
    }
    const timer = setTimeout(() => { handleSearch(null, true); }, 380);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = result => {
    setSelected({
      name: result.name, address: result.address, lat: result.lat, lng: result.lng,
      categoryLabel: result.categoryLabel || '', phone: result.phone || '', url: result.url || '',
      duplicateDismissed: false, mergeTargetId: '', isExistingPlace: false
    });
    setQuery(result.name);
    setResults([]);
    // Kakao's category_group_code lets a search result suggest 식당/카페/놀이/숙박 up front, so the
    // user usually doesn't have to touch the category picker at all -- only auto-selects when the
    // result actually carries a mapped category, otherwise leaves whatever was already chosen.
    if (result.categoryId) setCategoryId(result.categoryId);
  };

  const handleSubmit = async () => {
    if (!selected || !Number.isFinite(selected.lat) || !Number.isFinite(selected.lng)) {
      showToast('검색 결과에서 장소를 선택해 주세요.', 'error');
      return;
    }
    setSaving(true);
    try {
      const ok = await onSave({
        id: editingPlace ? editingPlace.id : undefined,
        name: selected.name || query.trim(),
        alias: sanitizeText(alias.trim(), 80),
        address: selected.address || '',
        lat: selected.lat,
        lng: selected.lng,
        categoryId,
        memo: memo.trim(),
        visitStatus,
        visitDate: visitStatus === 'visited' ? visitDate : '',
        sourcePlaceId: selected.mergeTargetId || selected.id || ''
      });
      if (ok !== false) onClose();
    } catch (err) {
      console.error('[PlaceRegisterModal] Save failed:', err);
      showToast('장소 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (!editingPlace) return;
    if (typeof onRequestConfirm === 'function') {
      onRequestConfirm('장소 삭제', `"${editingPlace.name || '이 장소'}"를 삭제하시겠습니까?`, async () => {
        setSaving(true);
        try {
          const deleted = await Promise.resolve(onDelete(editingPlace.id));
          if (deleted !== false) onClose();
        } catch (err) {
          console.error('[PlaceRegisterModal] Delete failed:', err);
          showToast('장소 삭제 중 오류가 발생했습니다.', 'error');
        } finally {
          setSaving(false);
        }
      });
    }
  };

  // Bulk-imported places carry their memo written as "YY.MM.DD 누구랑 뭐했는지" -- typing that same
  // shorthand here auto-fills the 방문일자 field (and flips the toggle to 방문 if it was left on
  // 예정) instead of making the user re-enter the same date twice in two different fields.
  const handleMemoChange = e => {
    const value = e.target.value;
    setMemo(value);
    autoGrowTextarea(e.target, 480);
    const detectedDate = normalizePlaceDateForSort(extractLeadingMemoDate(value));
    if (detectedDate) {
      setVisitDate(detectedDate);
      setVisitStatus('visited');
    }
  };

  // Pasting a fresh bulk export (another Google My Maps-style run-on block) hits the same
  // one-long-line problem the mount-time reformat above fixes for existing places -- reformat
  // just the pasted chunk before splicing it in, so it's readable immediately instead of only
  // after the next save+reopen. Left alone (native paste proceeds) when the pasted text doesn't
  // look like a multi-visit block, so pasting a single URL/sentence isn't affected.
  const handleMemoPaste = e => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;
    const reformatted = reformatMemoIntoDateLines(pasted);
    if (reformatted === pasted) return;
    e.preventDefault();
    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = memo.slice(0, start) + reformatted + memo.slice(end);
    setMemo(nextValue);
    const cursorPos = start + reformatted.length;
    requestAnimationFrame(() => {
      if (!memoTextareaRef.current) return;
      memoTextareaRef.current.setSelectionRange(cursorPos, cursorPos);
      autoGrowTextarea(memoTextareaRef.current, 480);
    });
    const detectedDate = normalizePlaceDateForSort(extractLeadingMemoDate(nextValue));
    if (detectedDate) {
      setVisitDate(detectedDate);
      setVisitStatus('visited');
    }
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: getPlaceCategoryLabel(c) }));

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: overlayOnClick,
    style: { zIndex: 12000 }
  }, /*#__PURE__*/React.createElement(ResizableModalContainer, {
    className: "modal-container",
    style: { maxWidth: '400px', width: '90%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' },
    onClick: e => e.stopPropagation()
  },
    /* Header */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }
    },
      /*#__PURE__*/React.createElement("span", {
        style: { fontSize: '0.92rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }
      }, /*#__PURE__*/React.createElement(PlaceSectionIcon, { size: 16 }), editingPlace ? '장소 수정' : '장소 등록'),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: requestClose,
        style: { width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--border-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
      }, /*#__PURE__*/React.createElement(SmallXIcon, { size: 14 }))
    ),

    /* Body */
    /*#__PURE__*/React.createElement("div", {
      style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto' }
    },
      /* Search field */
      /*#__PURE__*/React.createElement("form", { onSubmit: handleSearch, style: { display: 'flex', gap: '8px' } },
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          style: { flex: 1, minWidth: 0 },
          placeholder: "주소 또는 업체명 검색",
          value: query,
          onChange: e => { setQuery(e.target.value); setSelected(null); }
        }),
        /*#__PURE__*/React.createElement("button", {
          type: "submit",
          className: "btn btn-poll-create",
          style: { height: '44px', whiteSpace: 'nowrap' },
          disabled: loading
        }, loading ? '검색중' : '검색')
      ),
      /* Search progress -- only for a manual (non-auto) submit, see searchStage above. Google
         Places in particular can take several seconds on a cold start, so this exists to make
         that wait read as "still working" instead of a frozen button label. */
      searchStage && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.06)' }
      },
        /*#__PURE__*/React.createElement("span", { className: "calendar-spinner", style: { flexShrink: 0 } }),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' } }, SEARCH_TIER_LABELS[searchStage] || '검색 중...')
      ),

      /* Already registered places section */
      existingPlaceSuggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '6px',
          backgroundColor: 'var(--bg-primary)'
        }
      },
        /*#__PURE__*/React.createElement("div", {
          style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--accent-primary)', padding: '2px 6px' }
        }, "이미 등록된 장소"),
        existingPlaceSuggestions.map(p => /*#__PURE__*/React.createElement("button", {
          key: p.id,
          type: "button",
          onClick: () => handleSelectExistingPlace(p),
          style: { textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' },
          className: "place-result-item"
        },
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' } }, p.alias || p.name),
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, getDisplayPlaceAddress(p) || p.name)
        ))
      ),

      /* Search results */
      results.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '4px' }
      }, results.map(r => /*#__PURE__*/React.createElement("button", {
        key: r.id,
        type: "button",
        onClick: () => handleSelectResult(r),
        style: { textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }
      },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' } }, r.name),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, r.address)
      ))),

      /* Selected place confirmation -- shows whatever business info the search result actually
         carried (주소/전화/URL), not just a bare "선택됨: 이름" line, so the user can confirm
         they picked the right branch/listing before saving. */
      selected && /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', flexDirection: 'column', gap: '4px'
        }
      },
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--text-main)' } }, selected.name),
          selected.categoryLabel && /*#__PURE__*/React.createElement("span", { style: { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' } }, selected.categoryLabel)
        ),
        selected.address && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, selected.address),
        selected.phone && /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, `☎ ${selected.phone}`),
        duplicatePlace && /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '6px', padding: '9px 10px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)' }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-md)', fontWeight: 700, color: '#92400E', lineHeight: 1.45 } }, `기존 ${duplicatePlace.alias || duplicatePlace.name} 과 동일한 업체입니다. 병합하시겠습니까?`),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: '6px', marginTop: '7px' } },
            /*#__PURE__*/React.createElement("button", { type: 'button', onClick: () => setSelected(prev => ({ ...prev, mergeTargetId: duplicatePlace.id })), style: { border: 0, borderRadius: 'var(--radius-sm)', padding: '5px 10px', background: 'var(--accent-primary)', color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 700, cursor: 'pointer' } }, '병합'),
            /*#__PURE__*/React.createElement("button", { type: 'button', onClick: () => setSelected(prev => ({ ...prev, duplicateDismissed: true })), style: { border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '5px 10px', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' } }, '별도 등록')
          )
        ),
        selected.url && /*#__PURE__*/React.createElement("button", {
          type: "button",
          title: selected.url,
          onClick: e => { e.stopPropagation(); window.open(selected.url, '_blank', 'noopener,noreferrer'); },
          style: {
            alignSelf: 'flex-start', border: 0, cursor: 'pointer', textAlign: 'left',
            padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: 400,
            backgroundColor: 'var(--border-subtle)', color: 'var(--text-muted)', wordBreak: 'break-all', maxWidth: '100%'
          }
        }, selected.url)
        , tourLoading && /*#__PURE__*/React.createElement("div", { style: { marginTop: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, '주변 투어 정보 불러오는 중...')
        , tourItems.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(59,130,246,0.16)', display: 'flex', flexDirection: 'column', gap: '5px' }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--accent-primary)' } }, '주변 투어 정보 (TourAPI)'),
          tourGroups.map(group => /*#__PURE__*/React.createElement("div", { key: group.key, style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
            /*#__PURE__*/React.createElement("div", { style: { fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-muted)', marginTop: '2px' } }, group.label),
            group.items.map(item => /*#__PURE__*/React.createElement("a", {
              key: item.id,
              href: item.homepage || `https://map.kakao.com/?q=${encodeURIComponent(item.title)}`,
              target: '_blank',
              rel: 'noreferrer',
              style: { display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-main)', textDecoration: 'none', fontSize: 'var(--font-size-sm)' }
            },
              item.imageUrl && /*#__PURE__*/React.createElement('img', { src: item.imageUrl, alt: '', loading: 'lazy', style: { width: '34px', height: '34px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 } }),
              /*#__PURE__*/React.createElement('span', { style: { minWidth: 0 } },
                /*#__PURE__*/React.createElement('span', { style: { display: 'block', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.title),
                /*#__PURE__*/React.createElement('span', { style: { display: 'block', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.address)
              )
            ))
          ))
        )
      ),

      /* Alias (별칭) -- optional nickname; official search name stays as place.name */
      selected && /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", {
          style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }
        }, "별칭 (선택)"),
        /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "목록에 표시할 별칭 (예: 도은네 집)",
          maxLength: 80,
          value: alias,
          onChange: e => setAlias(e.target.value),
          style: { width: '100%', boxSizing: 'border-box' }
        }),
        /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '4px', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }
        }, "비우면 검색된 공식 명칭이 그대로 표시됩니다.")
      ),

      /* Category picker */
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "카테고리"),
        /*#__PURE__*/React.createElement("div", { style: { width: '100%' } },
          /*#__PURE__*/React.createElement(SimpleBottomSheetPicker, {
            title: "카테고리 선택",
            value: categoryId,
            options: categoryOptions,
            onSelect: setCategoryId,
            placeholder: "카테고리 선택"
          })
        )
      ),

      /* Memo field */
      /*#__PURE__*/React.createElement("div", null,
        /*#__PURE__*/React.createElement("label", { style: { display: 'block', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' } }, "메모"),
        /*#__PURE__*/React.createElement(AutoGrowTextarea, {
          textareaRef: memoTextareaRef,
          className: "form-input",
          style: { width: '100%' },
          minHeight: 60,
          maxHeight: 480,
          placeholder: "메모를 남겨보세요 (선택, URL을 입력하면 캡슐 뱃지로 표시됩니다. '26.02.12'처럼 날짜를 적으면 방문일자에 자동 반영됩니다)",
          value: memo,
          maxLength: 2000,
          onChange: handleMemoChange,
          onPaste: handleMemoPaste
        }),
        extractFirstUrl(memo) && /*#__PURE__*/React.createElement("div", {
          style: { marginTop: '6px', fontSize: 'var(--font-size-md)', color: 'var(--text-main)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }
        }, renderTextWithUrlBadge(memo))
      )
    ),

    /* Footer — 추가/취소·수정 공통 모듈 (FormAddEditActionButtons) */
    /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }
    },
      editingPlace && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-danger",
        style: { height: '44px', minHeight: '44px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' },
        onClick: handleDeleteClick,
        disabled: saving
      }, /*#__PURE__*/React.createElement(TrashIcon, { size: 14 }), "삭제"),
      /*#__PURE__*/React.createElement(FormAddEditActionButtons, {
        isEditing: !!editingPlace,
        isSaving: saving,
        flexGrow: true,
        onCancel: onClose,
        onSubmit: handleSubmit
      })
    )
  ));
}

  if (typeof window !== 'undefined') {
  window.GATHER_UI_COMPONENTS = Object.assign({}, window.GATHER_UI_COMPONENTS || {}, {
    PlaceRegisterModal: PlaceRegisterModal,
  });
}
