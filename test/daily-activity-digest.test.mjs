import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { activityWindow, summarizeCalendarActivity, FIXTURE_CALENDAR } = require('../functions/daily-activity-digest.js');
const { buildBrief } = require('../functions/media-analysis-brief.js');

const kst = text => Date.parse(`${text}+09:00`);

test('the window is yesterday, and Monday also covers the weekend since Friday’s brief', () => {
  const tuesday = activityWindow({ now: kst('2026-10-27T08:05:00'), lastSentDateKey: '2026-10-26' });
  assert.equal(tuesday.start, kst('2026-10-26T00:00:00'));
  assert.equal(tuesday.end, kst('2026-10-27T00:00:00'));
  assert.equal(tuesday.label, '10월 26일 (월)');

  const monday = activityWindow({ now: kst('2026-10-26T08:00:00'), lastSentDateKey: '2026-10-23' });
  assert.equal(monday.start, kst('2026-10-23T00:00:00'));
  assert.equal(monday.days, 3);
  assert.equal(monday.label, '10월 23일 (금) ~ 10월 25일 (일)');

  assert.equal(activityWindow({ now: kst('2026-10-26T08:00:00') }).days, 1, 'no earlier brief: yesterday');
  assert.equal(activityWindow({ now: kst('2026-10-26T08:00:00'), lastSentDateKey: '2026-09-01' }).days, 1, 'a brief older than a week is ignored');
  assert.equal(activityWindow({ now: kst('2026-10-26T00:30:00'), lastSentDateKey: '2026-10-25' }).start, kst('2026-10-25T00:00:00'));
});

test('everything added inside the window is listed per kind, with names and short text', () => {
  const window = activityWindow({ now: kst('2026-10-27T08:05:00'), lastSentDateKey: '2026-10-26' });
  const at = time => kst(`2026-10-26T${time}`);
  const summary = summarizeCalendarActivity({
    id: 'demo',
    calendar: {
      title: '데모 모임',
      participants: [{ id: 'p1', name: '영우', color: '#EF4444' }, { id: 'p2', name: '유리', color: '#06B6D4' }],
      availabilities: [
        { date: '2026-11-03', participantId: 'p1', note: '저녁 가능', updatedAt: at('09:00:00'), deletedAt: null },
        { date: '2026-11-04', participantId: 'p2', note: '', updatedAt: at('08:00:00'), deletedAt: at('10:00:00') },
        { date: '2026-11-05', participantId: 'p2', note: 'old', updatedAt: kst('2026-10-20T10:00:00'), deletedAt: null }
      ],
      polls: [{ title: '장소 투표', createdAt: at('12:00:00') }],
      settlementCards: [{ title: '10월 정산', monthStr: '2026-10', amount: 120000, perPersonAmount: 30000, createdAt: new Date(at('13:00:00')).toISOString() }]
    },
    messages: [
      { id: 'm1', timestamp: at('14:05:00'), participantId: 'p1', uploadSource: 'chat', text: '내일 <b>캠핑</b>\n가요' },
      { id: 'm2', timestamp: at('14:06:00'), participantId: 'p2', uploadSource: 'chat', text: '', imageUrls: ['a', 'b'] },
      { id: 'm3', timestamp: at('15:00:00'), participantId: 'p1', uploadSource: 'gallery', imageUrls: ['c', 'd', 'e'] },
      { id: 'm4', timestamp: at('15:30:00'), participantId: 'p1', uploadSource: 'meme', imageUrl: 'meme.webp' },
      { id: 'm5', timestamp: kst('2026-10-27T01:00:00'), participantId: 'p1', uploadSource: 'chat', text: '오늘 보낸 것' }
    ],
    memos: [{ id: 'n1', createdAt: at('11:00:00'), participantId: 'p2', title: '준비물', text: '텐트', imageUrls: ['x'] }],
    places: [{ id: 'pl1', createdAt: at('16:00:00'), name: '비발디캠핑파크', address: '강원 홍천군', visitDate: '2026-11-07' }, { id: 'pl2', createdAt: at('16:30:00'), name: '지운 곳', deletedAt: at('17:00:00') }],
    anniversaries: [{ id: 'a1', createdAt: at('18:00:00'), title: '첫 캠핑', date: '2026-11-07' }],
    comments: [{ id: 'c1', createdAt: at('19:00:00'), participantId: 'p2', text: '멋지다', deletedAt: null }],
    meetings: [{ id: '2026-11-07', date: '2026-11-07', confirmed: true, confirmedAt: at('20:00:00'), note: '캠핑', expenses: [{ label: '캠핑장', amount: 85000, payerId: 'p1', createdAt: at('20:10:00') }, { label: '예전 것', amount: 1, createdAt: kst('2026-10-01T10:00:00') }] }]
  }, window);

  assert.deepEqual(summary.counts, { chat: 3, photo: 6, availability: 2, meeting: 1, expense: 2, memo: 1, place: 1, anniversary: 1, comment: 1, poll: 1 });
  const section = key => summary.sections.find(s => s.key === key);
  assert.deepEqual(section('chat').rows[0], ['10/26 14:05', '영우', '내일 <b>캠핑</b> 가요']);
  assert.deepEqual(section('chat').rows[1], ['10/26 14:06', '유리', '(사진 2장)']);
  assert.deepEqual(section('chat').rows[2], ['10/26 15:30', '영우', '(이모티콘)']);
  assert.deepEqual(section('photo').rows.map(row => row[3]), ['메모', '채팅', '갤러리']);
  assert.deepEqual(section('availability').rows, [['11/3(화)', '영우', '저녁 가능', '등록'], ['11/4(수)', '유리', '-', '취소']]);
  assert.deepEqual(section('meeting').rows, [['11/7(토)', '캠핑']]);
  assert.deepEqual(section('expense').rows, [['11/7(토)', '캠핑장', '85,000원', '영우'], ['2026-10', '정산 카드: 10월 정산', '120,000원', '1인 30,000원']]);
  assert.deepEqual(section('place').rows, [['비발디캠핑파크', '강원 홍천군', '11/7(토)']]);
  assert.equal(summary.total, 19);

  const brief = buildBrief({ dateLabel: '2026년 10월 27일 (화)', activity: { window, calendars: [summary], total: summary.total } });
  assert.match(brief.subject, /새 기록 19건$/);
  assert.match(brief.html, /새로 올라온 기록/);
  assert.match(brief.html, /내일 &lt;b&gt;캠핑&lt;\/b&gt; 가요/, 'chat text is escaped');
  assert.doesNotMatch(brief.html, /<b>캠핑/);
  assert.equal(section('chat').rows[0].url, 'https://pyw31337.github.io/calendar/?shell=v2&id=demo&view=chat&msg=m1');
  assert.match(section('photo').rows[1].url, /view=gallery&img=/);
  assert.equal(section('availability').rows[0].url, 'https://pyw31337.github.io/calendar/?shell=v2&id=demo&tab=calendar&date=2026-11-03');
  assert.match(brief.html, /href="https:\/\/pyw31337\.github\.io\/calendar\/\?shell=v2&amp;id=demo&amp;view=chat&amp;msg=m1"/);
  assert.match(brief.html, /href="https:\/\/pyw31337\.github\.io\/calendar\/\?shell=v2&amp;id=demo&amp;tab=calendar&amp;date=2026-11-03"/);
  assert.match(brief.html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(brief.html, /color:#EF4444[^>]*display:block[^>]*>영우/);
  assert.match(brief.html, /color:#06B6D4[^>]*display:block[^>]*>유리/);
  assert.match(brief.text, /\[데모 모임\] 채팅 3 · 사진 6/);
});

test('long tables stop at ten rows and say how many more there are', () => {
  const window = activityWindow({ now: kst('2026-10-27T08:05:00'), lastSentDateKey: '2026-10-26' });
  const messages = Array.from({ length: 13 }, (_, i) => ({ id: `m${i}`, timestamp: kst('2026-10-26T10:00:00') + i * 60000, participantId: 'p', uploadSource: 'chat', text: `안녕 ${i}` }));
  const summary = summarizeCalendarActivity({ id: 'demo', calendar: {}, messages }, window);
  const chat = summary.sections[0];
  assert.equal(chat.rows.length, 10);
  assert.equal(chat.more, 3);
  assert.match(buildBrief({ dateLabel: 'x', activity: { window, calendars: [summary], total: 13 } }).html, /외 3건 더 있어요/);
});

test('thumb-only uploads still get a canonical photo deep link and a visible mail affordance', () => {
  const window = activityWindow({ now: kst('2026-10-27T08:05:00'), lastSentDateKey: '2026-10-26' });
  const summary = summarizeCalendarActivity({
    id: 'demo',
    calendar: { participants: [{ id: 'p1', name: '송은혜' }] },
    messages: [{
      id: 'thumb-only',
      timestamp: kst('2026-10-26T09:30:00'),
      participantId: 'p1',
      uploadSource: 'meeting',
      thumbUrls: ['thumb-a', 'thumb-b', 'thumb-c']
    }]
  }, window);
  const photo = summary.sections.find(section => section.key === 'photo');
  assert.equal(photo.count, 3);
  assert.match(photo.rows[0].url, /view=gallery&img=asset%3Av1%3A/);
  const html = buildBrief({ dateLabel: 'x', activity: { window, calendars: [summary], total: 3 } }).html;
  assert.match(html, /3장[\s\S]*사진 보기/);
  assert.match(html, /송은혜/);
  assert.match(buildBrief({ dateLabel: 'x', activity: { window, calendars: [summary], total: 3 } }).text, /→ https:\/\/pyw31337\.github\.io\/calendar/);
});

test('a quiet day says so, and test fixture calendars are never listed', () => {
  const window = activityWindow({ now: kst('2026-10-27T08:05:00'), lastSentDateKey: '2026-10-26' });
  assert.match(buildBrief({ dateLabel: 'x', activity: { window, calendars: [], total: 0 } }).html, /새로 올라온 채팅·사진·일정·메모·장소가 없습니다/);
  assert.ok(FIXTURE_CALENDAR.test('stress_cw_mtgn9ye8_mnhah'));
  assert.ok(FIXTURE_CALENDAR.test('test_places_msvw494z'));
  assert.ok(!FIXTURE_CALENDAR.test('family'));
});
