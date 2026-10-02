const CACHE_TTL_MS = 60 * 1000;
const cache = new Map();

function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return String(value.stringValue || '');
  if ('integerValue' in value) return Number(value.integerValue) || 0;
  if ('doubleValue' in value) return Number(value.doubleValue) || 0;
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue?.fields || {}).map(([key, child]) => [key, decodeFirestoreValue(child)]));
  if ('nullValue' in value) return null;
  return null;
}

function decodeDocument(document) {
  return Object.fromEntries(Object.entries(document?.fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

function firestoreDocumentUrl(projectId, calendarId, collectionId, documentId) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/calendars/cal_${encodeURIComponent(calendarId)}/${collectionId}/${encodeURIComponent(documentId)}`;
}

export async function fetchMediaAnalysisFeed({ calendarId, projectId, force = false, limit = 80 } = {}) {
  if (!calendarId || !projectId) return [];
  const queryLimit = Math.max(10, Math.min(200, Number(limit) || 80));
  const key = `${projectId}:${calendarId}:${queryLimit}`;
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.items;
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'mediaAnalysis' }],
      orderBy: [{ field: { fieldPath: 'lastReceivedAt' }, direction: 'DESCENDING' }],
      limit: queryLimit
    } })
  });
  if (!response.ok) throw new Error(`AI 분석 목록 요청 실패 (${response.status})`);
  const rows = await response.json();
  const items = (Array.isArray(rows) ? rows : []).filter(row => row?.document).map(row => ({
    ...decodeDocument(row.document),
    id: row.document.name.split('/').pop()
  }));
  cache.set(key, { savedAt: Date.now(), items });
  return items;
}

// The AI feed intentionally stores no image URL. Read the canonical row only when the user
// chooses an action, so opening the review tab remains one bounded query rather than 40 reads.
export async function fetchMediaAnalysisPhoto({ calendarId, projectId, assetKey } = {}) {
  if (!calendarId || !projectId || !assetKey) throw new Error('사진 분석 대상을 찾을 수 없습니다.');
  const response = await fetch(firestoreDocumentUrl(projectId, calendarId, 'photoIndex', assetKey));
  if (!response.ok) throw new Error(response.status === 404 ? '원본 사진이 삭제되었어요.' : `사진 정보 요청 실패 (${response.status})`);
  const document = await response.json();
  return { ...decodeDocument(document), assetKey: document.name.split('/').pop() };
}

export async function recordMediaAnalysisFeedback({ calendarId, projectId, assetKey, decision, proposedTags = [], acceptedTags = [], finalTags = [] } = {}) {
  if (!calendarId || !projectId || !assetKey) throw new Error('분석 피드백 대상을 찾을 수 없습니다.');
  const response = await fetch(`https://us-central1-${encodeURIComponent(projectId)}.cloudfunctions.net/recordMediaAnalysisFeedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calendarId, assetKey, decision, proposedTags, acceptedTags, finalTags })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) throw new Error(payload?.message || `AI 피드백 저장 실패 (${response.status})`);
  const prefix = `${projectId}:${calendarId}`;
  for (const [k, cached] of cache.entries()) {
    if (k === prefix || k.startsWith(`${prefix}:`)) {
      cache.set(k, {
        ...cached,
        items: cached.items.map(item => item.assetKey === assetKey ? { ...item, review: payload.review || item.review } : item)
      });
    }
  }
  return payload.review || null;
}

export function formatMediaAnalysisTime(timestamp) {
  const date = new Date(Number(timestamp) || 0);
  if (Number.isNaN(date.getTime()) || date.getTime() <= 0) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

// 얼굴로 찾은 사람 (tools/local-media-worker/face-tags.py): only photos that currently carry a face
// suggestion. A single equality filter needs no composite index; the 보관함 추천 tab opens this
// at most once a minute.
export async function fetchFaceSuggestions({ calendarId, projectId, force = false, limit = 1000 } = {}) {
  if (!calendarId || !projectId) return [];
  const key = `faces:${projectId}:${calendarId}`;
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.items;
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'mediaAnalysis' }],
      where: { fieldFilter: { field: { fieldPath: 'faceSuggested' }, op: 'EQUAL', value: { booleanValue: true } } },
      select: { fields: ['assetKey', 'facePeople', 'faceRejected'].map(fieldPath => ({ fieldPath })) },
      limit: Math.max(10, Math.min(2000, Number(limit) || 1000))
    } })
  });
  if (!response.ok) throw new Error(`얼굴 추천 요청 실패 (${response.status})`);
  const rows = await response.json();
  const items = (Array.isArray(rows) ? rows : []).filter(row => row?.document).map(row => decodeDocument(row.document));
  cache.set(key, { savedAt: Date.now(), items });
  return items;
}

/** "아니에요": this person is not in these photos; never suggest them for these photos again. */
export async function rejectFaceSuggestions({ calendarId, projectId, name, assetKeys = [] } = {}) {
  const keys = Array.from(new Set((Array.isArray(assetKeys) ? assetKeys : []).filter(Boolean)));
  if (!calendarId || !projectId || !name || !keys.length) return 0;
  let updated = 0;
  for (let start = 0; start < keys.length; start += 60) {
    const response = await fetch(`https://us-central1-${encodeURIComponent(projectId)}.cloudfunctions.net/recordFaceFeedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId, name, assetKeys: keys.slice(start, start + 60) })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.ok === false) throw new Error(payload?.message || `얼굴 추천 피드백 저장 실패 (${response.status})`);
    updated += Number(payload.updated) || 0;
  }
  cache.delete(`faces:${projectId}:${calendarId}`);
  return updated;
}
