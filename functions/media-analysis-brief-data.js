'use strict';
const { buildCalendarOperations } = require('./ai-operations');
const rows = value => Array.isArray(value) ? value : value ? [value] : [];
const key = value => String(value?.date || value?.targetDate || value?.id || '');
const stamp = row => Number(row?.updatedAt || row?.deletedAt || row?.confirmedAt || row?.createdAt) || 0;

function mergeMeeting(previous, incoming) {
  const base = stamp(incoming) >= stamp(previous) ? { ...previous, ...incoming } : { ...incoming, ...previous };
  const expenses = new Map();
  [...rows(previous.expenses), ...rows(incoming.expenses)].filter(Boolean).forEach(expense => {
    const id = expense.id || `${expense.label || ''}|${expense.url || ''}|${expense.amount ?? ''}|${expense.categoryId || ''}|${expense.createdAt ?? ''}`;
    const current = expenses.get(id);
    if (!current || stamp(expense) >= stamp(current)) expenses.set(id, { ...current, ...expense });
  });
  return { ...base, confirmed: previous.confirmed === true || incoming.confirmed === true ? true : base.confirmed, expenses: [...expenses.values()] };
}

function mergeCanonical(embedded, documents, identify = key, merge = null) {
  const result = new Map(rows(embedded).map(row => [identify(row), row]));
  documents.forEach(doc => {
    const row = { ...doc.data(), id: doc.id };
    const previous = result.get(identify(row));
    result.set(identify(row), merge && previous && !row.deletedAt && !row.removedAt && !row.isDeleted ? merge(previous, row) : row);
  });
  // Keep tombstones to override legacy copies, then remove them before analysis.
  return [...result.values()].filter(row => row && !row.deletedAt && !row.removedAt && !row.isDeleted);
}

async function loadOperationsCalendar(calendarDoc, dateKey) {
  const calendar = calendarDoc.data()?.calendar || {};
  const from = new Date(`${dateKey}T00:00:00Z`);
  const until = new Date(from);
  from.setUTCDate(from.getUTCDate() - 60);
  until.setUTCDate(until.getUTCDate() + 21);
  const [meetings, places] = await Promise.allSettled([
    calendarDoc.ref.collection('confirmedMeetings')
      .where('__name__', '>=', from.toISOString().slice(0, 10)).where('__name__', '<=', until.toISOString().slice(0, 10))
      .select('date', 'confirmed', 'confirmedAt', 'createdAt', 'updatedAt', 'note', 'title', 'name', 'expenses', 'place', 'placeName', 'location', 'address', 'venue', 'removedAt', 'deletedAt', 'isDeleted').limit(100).get(),
    calendarDoc.ref.collection('places').select('name', 'title', 'date', 'visitDate', 'meetingDate', 'targetDate', 'memo', 'visitStatus', 'removedAt', 'deletedAt', 'isDeleted').limit(501).get()
  ]);
  const missing = [];
  if (meetings.status !== 'fulfilled' || meetings.value.docs.length >= 100) missing.push('일정');
  if (places.status !== 'fulfilled' || places.value.docs.length > 500) missing.push('장소');
  return {
    calendar: { ...calendar,
      confirmedMeeting: meetings.status === 'fulfilled' ? mergeCanonical(calendar.confirmedMeeting, meetings.value.docs, key, mergeMeeting) : [],
      places: places.status === 'fulfilled' ? mergeCanonical(calendar.places, places.value.docs.slice(0, 500), row => String(row.id || '')) : [] },
    missing
  };
}

async function collectMediaBriefCalendars(db, dateKey, now = Date.now()) {
  const snapshot = await db.collection('calendars').select('calendar').get();
  const results = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(4, snapshot.docs.length) }, async () => {
    while (cursor < snapshot.docs.length) {
      const doc = snapshot.docs[cursor++];
      const id = doc.id.replace(/^cal_/, '');
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) continue;
      const [workerSnap, runSnap] = await Promise.all([
        doc.ref.collection('mediaAnalysisWorkerState').doc('macos-vision-m2').get(),
        doc.ref.collection('mediaAnalysisRuns').doc(`macos_${id}_${dateKey.replaceAll('-', '')}`).get()
      ]);
      if (!workerSnap.exists && !runSnap.exists) continue;
      const worker = workerSnap.data() || {};
      const { calendar, missing } = await loadOperationsCalendar(doc, dateKey);
      const stale = !worker.lastHeartbeatAt || now - Number(worker.lastHeartbeatAt) > 26 * 3600000;
      // Yesterday's analysis count is NOT today's activity. Preserve health separately.
      const summary = runSnap.exists ? runSnap.data()?.summary || {} : {};
      const operations = buildCalendarOperations({ calendar, dateKey, summary, stale }).filter(item =>
        !(missing.includes('일정') && /^(place|attendance|settlement):/.test(item.id))
        && !(missing.includes('장소') && item.id.startsWith('place:')));
      if (missing.length) operations.unshift({ id: 'data-incomplete', priority: 'high', title: '운영 데이터 일부 미확인', detail: `${missing.join('·')} 데이터를 모두 확인하지 못했습니다. 정상 상태로 판정하지 않습니다.` });
      const workerFailed = ['failed', 'error'].includes(worker.status);
      if (workerFailed) operations.unshift({ id: 'worker-failed', priority: 'high', title: '사진 분석 작업 오류', detail: '기기는 연결되어 있지만 최근 작업이 실패했습니다. 작업 로그를 확인해 주세요.' });
      results.push({ id, name: String(calendar.title || calendar.name || id), summary, stale,
        healthLabel: missing.length ? '일부 미확인' : workerFailed ? '작업 오류' : stale ? '생존 신호 확인' : worker.status === 'idle' ? '대기' : '정상', operations });
    }
  }));
  return results.sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = { collectMediaBriefCalendars, loadOperationsCalendar, mergeCanonical };
