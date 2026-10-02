/**
 * 보관함 "추천" tab body (rules: archive-tag-suggestions.js). The parent owns the photo list,
 * the photo grid renderer and the bulk tag save; this only lays the suggestions out.
 *
 *   - 바로 붙일 수 있는 태그: one card per suggestion (장소/날짜) with [적용], plus [모두 적용].
 *   - 인물 추천: per day, the photos without a person tag and that day's people as chips. The reader
 *     picks photos (or 전체 선택) and taps a name; nothing is applied without a pick.
 *   - 얼굴로 찾은 사람: per person, the photos the Mac face worker matched. The reader picks photos and
 *     taps 붙이기, or 아니에요 so those photos are never suggested for that person again.
 */
const React = window.React;
const h = React.createElement;
const PREVIEW_PHOTOS = 8;
const PERSON_DAYS_PAGE = 6;

const RULE_TEXT = {
  registered: '등록 장소의 위치·같은 업로드 묶음·방문 날짜로 장소 탭에 분류된 사진',
  'same-day': '그날 장소 태그가 있는 사진 대부분이 이 장소',
  batch: '같이 올린 사진 대부분에 붙어 있는 태그',
  album: '이 날짜 일정 앨범에 올린 사진',
};

const pillStyle = (filled) => ({
  minHeight: '32px', padding: '0 12px', borderRadius: '999px', cursor: 'pointer', flex: '0 0 auto',
  border: filled ? 'none' : '1px solid var(--border-color)',
  background: filled ? 'var(--brand, #7C3AED)' : 'var(--bg-card, #fff)',
  color: filled ? 'var(--on-brand, #fff)' : 'var(--text-main)',
  fontSize: 'var(--font-size-xs)', fontWeight: 800
});
const cardStyle = {
  display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: 'var(--radius-md, 14px)',
  background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color)'
};
const mutedStyle = { fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' };
const titleStyle = { flex: '1 1 auto', minWidth: 0, fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' };

function SuggestionCard({ group, busy, onApply, renderGrid, formatDate }) {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? group.photos : group.photos.slice(0, PREVIEW_PHOTOS);
  const label = `#${group.tag}`;
  const rules = Array.isArray(group.rules) && group.rules.length ? group.rules : [group.rule];
  const dates = (group.dates || []).slice().sort().reverse();
  const sub = rules.map(rule => RULE_TEXT[rule]).filter(Boolean).join(' · ')
    + (dates.length ? ` (${dates.slice(0, 3).map(date => formatDate(date) || date).join(', ')}${dates.length > 3 ? ` 외 ${dates.length - 3}일` : ''})` : '');
  return h('div', { style: cardStyle },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h('div', { style: titleStyle }, `${label} · ${group.photos.length}장`),
      h('button', { type: 'button', disabled: busy, onClick: () => onApply(group.photos, group.tag), style: pillStyle(true) }, '적용')
    ),
    h('div', { style: mutedStyle }, sub),
    renderGrid(shown, `suggest_${group.id}`),
    group.photos.length > PREVIEW_PHOTOS && h('button', {
      type: 'button', onClick: () => setExpanded(value => !value),
      style: { ...pillStyle(false), alignSelf: 'flex-start' }
    }, expanded ? '접기' : `${group.photos.length - PREVIEW_PHOTOS}장 더 보기`)
  );
}

function PersonDay({ day, busy, onApply, renderGrid, formatDate, selectKeyOf }) {
  // Keys are the photo grid's own select keys, so the grid's checkboxes and this set agree.
  const keyOf = (photo, idx) => selectKeyOf(photo, idx);
  const [selected, setSelected] = React.useState(() => new Set());
  const keys = day.photos.map(keyOf);
  const allSelected = keys.length > 0 && keys.every(key => selected.has(key));
  const picked = day.photos.filter((photo, idx) => selected.has(keyOf(photo, idx)));
  const toggle = key => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  return h('div', { style: cardStyle },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h('div', { style: titleStyle }, `${formatDate(day.date) || day.date} · 인물 태그 없는 ${day.photos.length}장`),
      h('button', {
        type: 'button',
        onClick: () => setSelected(allSelected ? new Set() : new Set(keys)),
        style: { border: 'none', background: 'transparent', color: 'var(--brand, #7C3AED)', fontSize: 'var(--font-size-xs)', fontWeight: 800, cursor: 'pointer', padding: '4px 0' }
      }, allSelected ? '선택 해제' : '전체 선택')
    ),
    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' } },
      h('span', { style: mutedStyle }, picked.length ? `${picked.length}장 선택 · 이름을 누르면 붙어요` : '사진을 고른 뒤 이름을 누르세요'),
      day.candidates.map(candidate => h('button', {
        key: candidate.label,
        type: 'button',
        disabled: busy || !picked.length,
        onClick: async () => {
          const ok = await onApply(picked, candidate.label);
          if (ok) setSelected(new Set());
        },
        style: { ...pillStyle(picked.length > 0), opacity: picked.length ? 1 : 0.55 }
      }, candidate.count ? `#${candidate.label} ${candidate.count}` : `#${candidate.label} · 참석`))
    ),
    renderGrid(day.photos, `suggest_person_${day.date}`, { keys: selected, onToggle: toggle })
  );
}

const FACE_PAGE = 24;

function FacePersonCard({ group, busy, onApply, onReject, renderGrid, selectKeyOf }) {
  const [shown, setShown] = React.useState(FACE_PAGE);
  const [selected, setSelected] = React.useState(() => new Set());
  const [working, setWorking] = React.useState(false);
  const photos = group.photos.slice(0, shown);
  const keyOf = (photo, idx) => selectKeyOf(photo, idx);
  const keys = photos.map(keyOf);
  const allSelected = keys.length > 0 && keys.every(key => selected.has(key));
  const picked = photos.filter((photo, idx) => selected.has(keyOf(photo, idx)));
  const toggle = key => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const run = async action => {
    setWorking(true);
    try {
      const ok = await action(picked, group.tag);
      if (ok !== false) setSelected(new Set());
    } finally {
      setWorking(false);
    }
  };
  const disabled = busy || working || !picked.length;
  return h('div', { style: cardStyle },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h('div', { style: titleStyle }, `#${group.tag} · ${group.photos.length}장`),
      h('button', {
        type: 'button',
        onClick: () => setSelected(allSelected ? new Set() : new Set(keys)),
        style: { border: 'none', background: 'transparent', color: 'var(--brand, #7C3AED)', fontSize: 'var(--font-size-xs)', fontWeight: 800, cursor: 'pointer', padding: '4px 0' }
      }, allSelected ? '선택 해제' : '전체 선택')
    ),
    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' } },
      h('span', { style: { ...mutedStyle, flex: '1 1 auto' } }, picked.length ? `${picked.length}장 선택` : '맞는 사진을 고르세요. 확실한 사진이 앞에 있어요.'),
      h('button', { type: 'button', disabled, onClick: () => run(onApply), style: { ...pillStyle(picked.length > 0), opacity: picked.length ? 1 : 0.55 } }, `#${group.tag} 붙이기`),
      typeof onReject === 'function' && h('button', { type: 'button', disabled, onClick: () => run(onReject), style: { ...pillStyle(false), opacity: picked.length ? 1 : 0.55 } }, '아니에요')
    ),
    renderGrid(photos, `suggest_face_${group.tag}`, { keys: selected, onToggle: toggle }),
    group.photos.length > shown && h('button', {
      type: 'button', onClick: () => setShown(count => count + FACE_PAGE),
      style: { ...pillStyle(false), alignSelf: 'flex-start' }
    }, `${group.photos.length - shown}장 더 보기`)
  );
}

const sectionTitle = text => h('div', { className: 'archive-detail-title', style: { fontSize: 'var(--font-size-md, 15px)', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' } }, text);

function DuplicateCard({ dup, busy, onRemove, renderGrid }) {
  return h('div', { style: cardStyle },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h('div', { style: titleStyle }, `같은 사진 ${dup.extra.length + 1}장`),
      dup.removable
        ? h('button', { type: 'button', disabled: busy, onClick: () => onRemove(dup), style: pillStyle(true) }, '1장만 남기기')
        : h('span', { style: mutedStyle }, '댓글이 있어 관리자 화면에서 정리')
    ),
    renderGrid([dup.keep, ...dup.extra], `suggest_${dup.id}`)
  );
}

function PlaceVisitCard({ visit, busy, onApply, formatDate }) {
  const [saving, setSaving] = React.useState(false);
  const shown = visit.dates.slice(-4).map(date => formatDate(date) || date).join(', ');
  return h('div', { style: cardStyle },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h('div', { style: titleStyle }, `${visit.place.alias || visit.place.name}`),
      h('button', {
        type: 'button', disabled: busy || saving,
        onClick: async () => { setSaving(true); await onApply(visit); setSaving(false); },
        style: pillStyle(true)
      }, '기록 추가')
    ),
    h('div', { style: mutedStyle }, `${shown}${visit.dates.length > 4 ? ` 외 ${visit.dates.length - 4}일` : ''} · 사진 ${visit.photoCount}장이 있지만 방문 기록에 없는 날짜예요.`)
  );
}

export function ArchiveTagSuggestions({ suggestions, loading, busy, onApply, onApplyAll, renderGrid, formatDate, selectKeyOf, duplicates = [], onRemoveDuplicate, placeVisits = [], onApplyPlaceVisit, faceGroups = [], onRejectFaces }) {
  const [personDaysShown, setPersonDaysShown] = React.useState(PERSON_DAYS_PAGE);
  const groups = suggestions?.groups || [];
  const personDays = suggestions?.personDays || [];
  const fmt = typeof formatDate === 'function' ? formatDate : (value => value);
  return h('div', { className: 'v2-archive-tag-suggestions', style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    loading && h('div', { style: mutedStyle }, '전체 사진을 불러오는 중이에요. 다 불러오면 추천이 늘어날 수 있어요.'),
    h('div', { style: { ...cardStyle, background: 'var(--bg-secondary)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('div', { style: titleStyle }, groups.length
          ? `바로 붙일 수 있는 태그 ${suggestions.autoPhotoCount}장`
          : '바로 붙일 수 있는 태그가 없어요'),
        groups.length > 0 && h('button', { type: 'button', disabled: busy, onClick: onApplyAll, style: pillStyle(true) }, '모두 적용')
      ),
      h('div', { style: mutedStyle }, '사진에 이미 있는 위치·날짜·같이 올린 사진 정보로 찾은 태그예요. 적용해도 기존 태그는 지우지 않고, 직후에 되돌릴 수 있어요.')
    ),
    groups.map(group => h(SuggestionCard, { key: group.id, group, busy, onApply, renderGrid, formatDate: fmt })),
    faceGroups.length > 0 && sectionTitle('얼굴로 찾은 사람'),
    faceGroups.length > 0 && h('div', { style: mutedStyle }, '인물 태그가 붙은 사진으로 이 맥에서 얼굴을 배워 찾은 사진이에요. 얼굴 정보는 맥 밖으로 나가지 않아요.'),
    faceGroups.map(group => h(FacePersonCard, { key: group.id, group, busy, onApply, onReject: onRejectFaces, renderGrid, selectKeyOf })),
    personDays.length > 0 && sectionTitle('인물 추천'),
    personDays.length > 0 && h('div', { style: mutedStyle }, '같은 날 다른 사진에 태그된 사람, 그날 모임에 참석한 사람이에요. 사진 속 인물은 직접 골라 주세요.'),
    personDays.slice(0, personDaysShown).map(day => h(PersonDay, { key: day.date, day, busy, onApply, renderGrid, formatDate: fmt, selectKeyOf })),
    personDays.length > personDaysShown && h('button', {
      type: 'button', onClick: () => setPersonDaysShown(count => count + PERSON_DAYS_PAGE),
      style: { ...pillStyle(false), alignSelf: 'center' }
    }, `다른 날짜 더 보기 (${personDays.length - personDaysShown})`),
    placeVisits.length > 0 && typeof onApplyPlaceVisit === 'function' && sectionTitle('장소 방문 기록'),
    placeVisits.length > 0 && typeof onApplyPlaceVisit === 'function' && h('div', { style: mutedStyle }, '이 장소 태그가 붙은 사진의 날짜를 장소 방문 기록에 더해요. 방문 예정 장소는 방문으로 바뀌어요.'),
    typeof onApplyPlaceVisit === 'function' && placeVisits.map(visit => h(PlaceVisitCard, { key: visit.id, visit, busy, onApply: onApplyPlaceVisit, formatDate: fmt })),
    duplicates.length > 0 && typeof onRemoveDuplicate === 'function' && sectionTitle(`중복 의심 사진 ${duplicates.length}묶음`),
    duplicates.length > 0 && typeof onRemoveDuplicate === 'function' && h('div', { style: mutedStyle }, '같은 파일 크기로 몇 분 안에 다시 올라간 사진이에요. 태그를 합쳐 1장만 남겨요.'),
    typeof onRemoveDuplicate === 'function' && duplicates.slice(0, 12).map(dup => h(DuplicateCard, { key: dup.id, dup, busy, onRemove: onRemoveDuplicate, renderGrid }))
  );
}
