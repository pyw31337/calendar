const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const stamp = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const calendarId = `stress_settlement_${stamp}`;
const docPath = `projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars/cal_${calendarId}`;
const docUrl = `https://firestore.googleapis.com/v1/${docPath}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

globalThis.window = {
  __ALLOW_INTERNAL_TEST_CALENDARS__: true,
  location: { hostname: 'pyw31337.github.io', search: `?id=${calendarId}`, href: `https://pyw31337.github.io/calendar/?id=${calendarId}`, origin: 'https://pyw31337.github.io', pathname: '/calendar/' },
  localStorage: { getItem() { throw new Error('production localStorage read'); }, setItem() { throw new Error('production localStorage write'); }, removeItem() {}, key() { return null; }, length: 0 },
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {}
};
await import('../src/core/app-constants.js');
await import('../src/core/app-config.js');
await import('../src/core/app-utils.js');
const { pushSingleCalendarWithRest, firestoreDocumentToJs } = await import('../src/core/app-firebase-data.js');

const base = {
  id: calendarId,
  title: 'Settlement write test',
  participants: [{ id: 'p1', name: '테스트 사용자', color: '#2563EB', updatedAt: Date.now() }],
  availabilities: [],
  settlementCards: [{ id: 'settlement_1', title: '저장 전 제목', totalAmount: 10000, status: 'open', updatedAt: Date.now() }],
  updatedAt: Date.now(),
  revision: 1
};
const firstAt = Date.now();
const updated = { ...base, settlementCards: [{ ...base.settlementCards[0], title: '저장 후 제목', totalAmount: 12500, updatedAt: firstAt + 100 }], updatedAt: firstAt + 100 };
const stale = { ...base, settlementCards: [{ ...base.settlementCards[0], title: '오래된 응답', totalAmount: 1, updatedAt: firstAt - 100 }], updatedAt: firstAt - 100 };
const final = { ...updated, settlementCards: [{ ...updated.settlementCards[0], title: '최종 저장 제목', totalAmount: 13000, updatedAt: firstAt + 200 }], updatedAt: firstAt + 200 };

try {
  assert(await pushSingleCalendarWithRest(base, firstAt, 'settings', 18), 'seed settlement write failed');
  assert(await pushSingleCalendarWithRest(updated, firstAt + 100, 'settings', 18), 'updated settlement write failed');
  const afterUpdate = await (await fetch(docUrl)).json();
  const afterUpdateCalendar = firestoreDocumentToJs(afterUpdate).calendar;
  const updatedCard = afterUpdateCalendar.settlementCards.find((card) => card.id === 'settlement_1');
  assert(updatedCard?.title === '저장 후 제목' && updatedCard?.totalAmount === 12500, 'updated settlement was not persisted');

  assert(await pushSingleCalendarWithRest(stale, firstAt - 100, 'settings', 18), 'stale settlement merge failed');
  const afterStale = await (await fetch(docUrl)).json();
  const staleCheckCard = firestoreDocumentToJs(afterStale).calendar.settlementCards.find((card) => card.id === 'settlement_1');
  assert(staleCheckCard?.title === '저장 후 제목' && staleCheckCard?.totalAmount === 12500, 'stale write regressed settlement data');

  assert(await pushSingleCalendarWithRest(final, firstAt + 200, 'settings', 18), 'final settlement write failed');
  const afterFinal = await (await fetch(docUrl)).json();
  const finalCard = firestoreDocumentToJs(afterFinal).calendar.settlementCards.find((card) => card.id === 'settlement_1');
  assert(finalCard?.title === '최종 저장 제목' && finalCard?.totalAmount === 13000, 'final settlement was not persisted');
  console.log(JSON.stringify({ ok: true, calendarId, card: { title: finalCard.title, totalAmount: finalCard.totalAmount }, docRevision: firestoreDocumentToJs(afterFinal).revision }, null, 2));
} finally {
  const deleted = await fetch(docUrl, { method: 'DELETE' });
  if (!deleted.ok) console.warn(`Cleanup failed for ${calendarId}: ${deleted.status} ${await deleted.text()}`);
}
