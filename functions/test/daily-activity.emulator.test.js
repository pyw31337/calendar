'use strict';
// The morning brief's "새로 올라온 기록" (functions/daily-activity-digest.js) against real
// Firestore range queries in the emulator: only documents created inside the window are read,
// fixture calendars are skipped, and the last delivered brief sets where the window starts.
//   npm run test:functions:emulator   (from the repo root)
const test = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { activityWindow, findLastSentBriefDateKey, collectDailyActivity } = require('../daily-activity-digest');

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');
const app = initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-moyeora' }, 'daily-activity-test');
const db = getFirestore(app);
// A far-future week, so documents other emulator tests write never fall inside it.
const kst = text => Date.parse(`${text}+09:00`);
const at = time => kst(`2030-01-07T${time}`);

test('the digest reads only what was added in the window, per real calendar', async () => {
  const root = db.collection('calendars').doc('cal_dailydigest');
  await root.set({ calendar: {
    id: 'dailydigest', title: '아침 브리핑 모임',
    participants: [{ id: 'p1', name: '영우' }],
    availabilities: [{ date: '2030-01-12', participantId: 'p1', note: '오후', updatedAt: at('09:00:00'), deletedAt: null }]
  } });
  await Promise.all([
    root.collection('messages').doc('in').set({ timestamp: at('10:00:00'), participantId: 'p1', uploadSource: 'chat', text: '안녕', imageUrls: ['https://x/a.jpg'] }),
    root.collection('messages').doc('before').set({ timestamp: kst('2030-01-06T23:59:59'), participantId: 'p1', uploadSource: 'chat', text: '그저께' }),
    root.collection('messages').doc('after').set({ timestamp: kst('2030-01-08T00:00:00'), participantId: 'p1', uploadSource: 'chat', text: '오늘' }),
    root.collection('memos').doc('n1').set({ createdAt: at('11:00:00'), participantId: 'p1', title: '메모', text: '내용' }),
    root.collection('places').doc('pl1').set({ createdAt: at('12:00:00'), name: '공원', address: '서울' }),
    root.collection('anniversaries').doc('a1').set({ createdAt: at('13:00:00'), title: '기념일', date: '2030-02-01' }),
    root.collection('photoCommentItems').doc('c1').set({ createdAt: at('14:00:00'), participantId: 'p1', text: '좋아요', deletedAt: null }),
    root.collection('confirmedMeetings').doc('2030-01-12').set({ date: '2030-01-12', confirmed: true, confirmedAt: at('15:00:00'), updatedAt: at('15:05:00'), note: '모임', expenses: [{ label: '식비', amount: 40000, payerId: 'p1', createdAt: at('15:05:00') }] })
  ]);
  const fixture = db.collection('calendars').doc('cal_stress_dailydigest');
  await fixture.set({ calendar: { id: 'stress_dailydigest', title: 'fixture' } });
  await fixture.collection('messages').doc('m').set({ timestamp: at('10:00:00'), participantId: 'p', uploadSource: 'chat', text: 'fixture' });

  const window = activityWindow({ now: kst('2030-01-08T08:00:00'), lastSentDateKey: '2030-01-07' });
  const activity = await collectDailyActivity(db, window);
  assert.deepEqual(activity.calendars.map(calendar => calendar.id), ['dailydigest'], 'fixtures and quiet calendars are left out');
  const [calendar] = activity.calendars;
  assert.deepEqual(calendar.counts, { chat: 1, photo: 1, availability: 1, meeting: 1, expense: 1, memo: 1, place: 1, anniversary: 1, comment: 1, poll: 0 });
  assert.deepEqual(calendar.sections.find(section => section.key === 'chat').rows, [['1/7 10:00', '영우', '안녕']]);
  assert.equal(activity.total, 9);
});

test('the window starts on the day of the last delivered brief', async () => {
  const briefs = db.collection('operationsMediaBriefs');
  await Promise.all([
    briefs.doc('media-analysis-2030-01-11').set({ deliveryStatus: 'sent' }),
    briefs.doc('media-analysis-2030-01-13').set({ deliveryStatus: 'failed' })
  ]);
  const lastSent = await findLastSentBriefDateKey(db, '2030-01-14');
  assert.equal(lastSent, '2030-01-11', 'a failed brief does not count');
  const window = activityWindow({ now: kst('2030-01-14T08:00:00'), lastSentDateKey: lastSent });
  assert.equal(window.label, '1월 11일 (금) ~ 1월 13일 (일)');
  assert.equal(await findLastSentBriefDateKey(db, '2030-03-01'), '', 'nothing in the week before');
});
