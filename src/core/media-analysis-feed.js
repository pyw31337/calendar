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

export async function fetchMediaAnalysisFeed({ calendarId, projectId, force = false } = {}) {
  if (!calendarId || !projectId) return [];
  const key = `${projectId}:${calendarId}`;
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.items;
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/calendars/cal_${calendarId}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'mediaAnalysis' }],
      orderBy: [{ field: { fieldPath: 'lastReceivedAt' }, direction: 'DESCENDING' }],
      limit: 40
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

export function formatMediaAnalysisTime(timestamp) {
  const date = new Date(Number(timestamp) || 0);
  if (Number.isNaN(date.getTime()) || date.getTime() <= 0) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}
