import { spawnSync } from 'node:child_process';

const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const stamp = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const calendarId = `test_full_${stamp}`;
const isolationCalendarId = `test_isolation_${stamp}`;
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents`;
const RETAIN = process.env.KEEP_TEST_CALENDAR === '1';
function sampleImage(label, color = '#2563EB') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${color}"/><text x="4" y="34" fill="white" font-size="9">${label}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
const GALLERY_IMAGE = sampleImage('gallery', '#2563EB');
const MEETING_IMAGE = sampleImage('meeting', '#DC2626');
const MEMO_IMAGE = sampleImage('memo', '#059669');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function testUrl(id) {
  return `https://pyw31337.github.io/calendar/?id=${id}`;
}

globalThis.window = {
  __ALLOW_INTERNAL_TEST_CALENDARS__: true,
  location: {
    hostname: 'pyw31337.github.io', search: `?id=${calendarId}`, href: testUrl(calendarId),
    origin: 'https://pyw31337.github.io', pathname: '/calendar/'
  },
  localStorage: {
    getItem() { return null; }, setItem() {}, removeItem() {}, key() { return null; }, length: 0
  },
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {}
};
await import('../src/core/app-constants.js');
await import('../src/core/app-config.js');
await import('../src/core/app-utils.js');
const {
  pushSingleCalendarWithRest,
  writeCollectionDocumentWithFallback,
  writeConfirmedMeetingsToFirestore,
  firestoreDocumentToJs
} = await import('../src/core/app-firebase-data.js');
const { getPhotoAssetCommentKey } = await import('../src/core/app-domain-helpers.js');

async function getDocument(path) {
  const response = await fetch(`${ROOT}/${path}`, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GET ${path} failed: ${response.status} ${await response.text()}`);
  return firestoreDocumentToJs(await response.json());
}

async function listCollection(id, collection) {
  const docs = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(`${ROOT}/calendars/cal_${id}/${collection}?${query}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`LIST ${id}/${collection} failed: ${response.status} ${await response.text()}`);
    const body = await response.json();
    docs.push(...(body.documents || []).map(doc => ({ id: doc.name.split('/').pop(), data: firestoreDocumentToJs(doc) })));
    pageToken = body.nextPageToken || '';
  } while (pageToken);
  return docs;
}

async function write(collection, id, data, method = 'set') {
  const result = await writeCollectionDocumentWithFallback(collection, calendarId, id, data, method, `full CRUD ${collection}`, { skipQueue: true });
  assert(result?.success, `${method} ${collection}/${id} failed`);
  return result;
}

function recursiveDelete(id) {
  assert(/^test_[A-Za-z0-9_-]{1,59}$/.test(id), `refusing unsafe cleanup id: ${id}`);
  const result = spawnSync('firebase', [
    'firestore:delete', `calendars/cal_${id}`, '--recursive', '--force', '--project', PROJECT_ID
  ], { encoding: 'utf8' });
  assert(result.status === 0, `recursive cleanup failed for ${id}: ${result.stderr || result.stdout || result.status}`);
}

const now = Date.now();
const participants = [
  { id: 'tester_a', name: 'CRUD 사용자 A', color: '#2563EB', updatedAt: now },
  { id: 'tester_b', name: 'CRUD 사용자 B', color: '#DC2626', updatedAt: now + 1 }
];
const baseCalendar = {
  id: calendarId,
  title: '전체 기능 CRUD 검증',
  description: '자동 삭제되는 격리 테스트 캘린더',
  participants,
  availabilities: [{ date: '2026-09-20', participantId: 'tester_a', note: '생성 상태', updatedAt: now }],
  polls: [{
    id: 'poll_full_1', title: '샘플 투표', status: 'open', createdAt: now, updatedAt: now,
    options: [{ id: 'option_a', text: '선택 A', createdAt: now }, { id: 'option_b', text: '선택 B', createdAt: now + 1 }],
    votes: { tester_a: 'option_a' }
  }],
  settlementCards: [{
    id: 'settlement_full_1', title: '샘플 정산', totalAmount: 12000, status: 'open', updatedAt: now,
    participantRows: [{ id: 'settlement_row_a', participantId: 'CRUD 사용자 A', memo: '선결제' }]
  }],
  updatedAt: now,
  revision: 1
};

const fixtures = {
  messages: [
    ['msg_chat', { participantId: 'tester_a', text: '채팅 생성 샘플', timestamp: now, uploadSource: 'chat' }],
    ['msg_gallery', { participantId: 'tester_a', text: '', timestamp: now + 1, imageUrl: GALLERY_IMAGE, thumbUrl: GALLERY_IMAGE, imageTags: ['갤러리 샘플'], uploadSource: 'gallery' }],
    ['msg_meeting', { participantId: 'tester_b', text: '', timestamp: now + 2, imageUrl: MEETING_IMAGE, thumbUrl: MEETING_IMAGE, imageTags: ['일정 샘플'], uploadSource: 'meeting' }]
  ],
  memos: [['memo_full_1', {
    id: 'memo_full_1', participantId: 'tester_a', title: '메모 생성 샘플', text: '메모 본문 #260920',
    tags: ['검증'], imageUrls: [MEMO_IMAGE], thumbUrls: [MEMO_IMAGE], comments: [], createdAt: now, updatedAt: now
  }]],
  anniversaries: [['ann_full_1', { id: 'ann_full_1', title: '기념일 생성 샘플', date: '2026-09-20', targetDate: '2026-09-20', createdAt: now, updatedAt: now }]],
  customCultureItems: [['culture_full_1', { id: 'culture_full_1', title: '콘텐츠 생성 샘플', startDate: '2026-09-20', endDate: '2026-09-21', kind: 'festival', description: '콘텐츠 CRUD 검증', createdAt: now, updatedAt: now }]],
  places: [['place_full_1', { id: 'place_full_1', name: '장소 생성 샘플', address: '서울 테스트로 1', memo: '장소 메모', categoryId: 'etc', lat: 37.5, lng: 127.0, createdAt: now, updatedAt: now }]],
  confirmedMeetings: [['2026-09-20', {
    date: '2026-09-20', confirmed: true, note: '일정 생성 샘플', confirmedAt: now, updatedAt: now,
    expenses: [{ id: 'expense_full_1', label: '식사', amount: 12000, payerId: 'tester_a', createdAt: now }],
    photos: [{ id: 'photo_full_meeting', imageUrl: MEETING_IMAGE, thumbUrl: MEETING_IMAGE, sourceMessageId: 'msg_meeting', sourceImageIndex: 0, createdAt: now }]
  }]],
  photoComments: [
    [getPhotoAssetCommentKey({ imageUrl: GALLERY_IMAGE }), { comments: [{ id: 'comment_gallery', participantId: 'tester_a', text: '갤러리 사진 댓글', createdAt: now }], updatedAt: now }],
    [getPhotoAssetCommentKey({ imageUrl: MEETING_IMAGE }), { comments: [{ id: 'comment_meeting', participantId: 'tester_b', text: '일정 사진 댓글', createdAt: now + 1 }], updatedAt: now + 1 }]
  ],
  activityLogs: [['log_full_1', {
    id: 'log_full_1', calendarId, participantId: 'tester_a', date: '2026-09-20', action: 'create', note: 'CRUD 감사 로그', timestamp: now,
    actor: { actorId: 'tester_a', sessionId: 'full-crud', client: 'automated-test' },
    resource: { resourceType: 'test', resourceId: 'fixture', source: 'automation', sourceMessageId: '', imageIndex: 0, before: '', after: 'created' }
  }]]
};

let retained = false;
try {
  assert(await pushSingleCalendarWithRest(baseCalendar, now, 'settings', 18, [], { settingsFields: ['title', 'description', 'participants', 'availabilities', 'polls', 'settlementCards'] }), 'calendar seed failed');
  assert(await pushSingleCalendarWithRest({ ...baseCalendar, id: isolationCalendarId, title: '격리 대조 캘린더', availabilities: [], polls: [], settlementCards: [], updatedAt: now + 1 }, now + 1, 'settings', 18), 'isolation calendar seed failed');

  for (const [collection, entries] of Object.entries(fixtures)) {
    for (const [id, data] of entries) await write(collection, id, data);
  }

  const parent = await getDocument(`calendars/cal_${calendarId}`);
  assert(parent?.calendar?.title === baseCalendar.title, 'calendar parent read mismatch');
  assert(parent.calendar.availabilities?.[0]?.note === '생성 상태', 'availability create mismatch');
  assert(parent.calendar.polls?.[0]?.votes?.option_a?.includes('tester_a'), 'poll create mismatch');
  assert(parent.calendar.settlementCards?.[0]?.totalAmount === 12000, 'settlement create mismatch');

  for (const [collection, entries] of Object.entries(fixtures)) {
    const stored = await listCollection(calendarId, collection);
    assert(entries.every(([id]) => stored.some(doc => doc.id === id)), `${collection} create/read mismatch`);
    const isolated = await listCollection(isolationCalendarId, collection);
    assert(isolated.length === 0, `${collection} leaked into isolation calendar`);
  }

  const normalizedMeetingId = '2026-09-21';
  const corruptInlineImage = `data:image/jpeg;base64,${'A'.repeat(1977)}`;
  assert(await writeConfirmedMeetingsToFirestore(calendarId, [{
    date: normalizedMeetingId,
    confirmed: true,
    photos: [{ id: 'photo_normalization_probe', imageUrl: corruptInlineImage, thumbUrl: corruptInlineImage, sourceMessageId: 'msg_meeting', sourceImageIndex: 0 }],
    expenses: [],
    updatedAt: now + 50
  }]), 'meeting photo normalization write failed');
  const normalizedMeeting = await getDocument(`calendars/cal_${calendarId}/confirmedMeetings/${normalizedMeetingId}`);
  assert(normalizedMeeting?.photos?.[0]?.sourceMessageId === 'msg_meeting', 'meeting normalization dropped the canonical source reference');
  assert(!normalizedMeeting?.photos?.[0]?.imageUrl && !normalizedMeeting?.photos?.[0]?.thumbUrl, 'meeting normalization persisted a truncated data URL');

  await write('messages', 'msg_chat', { text: '채팅 수정 샘플' }, 'update');
  await write('memos', 'memo_full_1', { title: '메모 수정 샘플', updatedAt: now + 100 }, 'update');
  await write('anniversaries', 'ann_full_1', { title: '기념일 수정 샘플', updatedAt: now + 100 }, 'update');
  await write('customCultureItems', 'culture_full_1', { title: '콘텐츠 수정 샘플', updatedAt: now + 100 }, 'update');
  await write('places', 'place_full_1', { name: '장소 수정 샘플', updatedAt: now + 100 }, 'update');
  await write('confirmedMeetings', '2026-09-20', { note: '일정 수정 샘플', updatedAt: now + 100 }, 'update');
  const galleryCommentKey = getPhotoAssetCommentKey({ imageUrl: GALLERY_IMAGE });
  await write('photoComments', galleryCommentKey, { comments: [{ id: 'comment_gallery', participantId: 'tester_a', text: '갤러리 댓글 수정', createdAt: now }], updatedAt: now + 100 }, 'update');

  const updateChecks = [
    ['messages', 'msg_chat', 'text', '채팅 수정 샘플'], ['memos', 'memo_full_1', 'title', '메모 수정 샘플'],
    ['anniversaries', 'ann_full_1', 'title', '기념일 수정 샘플'], ['customCultureItems', 'culture_full_1', 'title', '콘텐츠 수정 샘플'],
    ['places', 'place_full_1', 'name', '장소 수정 샘플'], ['confirmedMeetings', '2026-09-20', 'note', '일정 수정 샘플']
  ];
  for (const [collection, id, field, expected] of updateChecks) {
    const doc = await getDocument(`calendars/cal_${calendarId}/${collection}/${id}`);
    assert(doc?.[field] === expected, `${collection}/${id} update mismatch`);
  }
  const updatedComments = await getDocument(`calendars/cal_${calendarId}/photoComments/${galleryCommentKey}`);
  assert(updatedComments?.comments?.[0]?.text === '갤러리 댓글 수정', 'photo comment update mismatch');

  const rejectedLogUpdate = await writeCollectionDocumentWithFallback('activityLogs', calendarId, 'log_full_1', { note: '변조' }, 'update', 'immutable log probe', { skipQueue: true });
  assert(!rejectedLogUpdate, 'immutable activity log unexpectedly accepted an update');

  const concurrentIds = Array.from({ length: 48 }, (_, index) => `burst_${String(index).padStart(2, '0')}`);
  await Promise.all(concurrentIds.map((id, index) => write('messages', id, {
    participantId: index % 2 ? 'tester_a' : 'tester_b', text: `동시 메시지 ${index}`, timestamp: now + 1000 + index,
    uploadSource: index % 3 === 0 ? 'gallery' : index % 3 === 1 ? 'meeting' : 'chat', ...(index % 3 ? { imageUrl: sampleImage(`burst-${index}`, index % 3 === 1 ? '#7C3AED' : '#0891B2'), thumbUrl: sampleImage(`burst-${index}`, index % 3 === 1 ? '#7C3AED' : '#0891B2') } : {})
  })));
  const burst = await listCollection(calendarId, 'messages');
  assert(concurrentIds.every(id => burst.some(doc => doc.id === id)), `concurrent message writes lost data (${burst.length})`);

  if (RETAIN) {
    retained = true;
    console.log(JSON.stringify({ ok: true, retained: true, calendarId, isolationCalendarId, browserUrl: `${testUrl(calendarId)}&view=gallery` }, null, 2));
  } else {
    for (const id of concurrentIds) await write('messages', id, null, 'delete');
    await write('confirmedMeetings', normalizedMeetingId, null, 'delete');
    for (const [collection, entries] of Object.entries(fixtures)) {
      for (const [id] of entries) await write(collection, id, null, 'delete');
      assert((await listCollection(calendarId, collection)).length === 0, `${collection} delete verification failed`);
    }
    console.log(JSON.stringify({ ok: true, retained: false, calendarId, collections: Object.keys(fixtures), concurrentWrites: concurrentIds.length }, null, 2));
  }
} finally {
  if (!retained) {
    recursiveDelete(calendarId);
    recursiveDelete(isolationCalendarId);
  }
}
