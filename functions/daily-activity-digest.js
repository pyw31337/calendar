'use strict';
// "어제 새로 올라온 기록" for the morning brief (sendDailyMediaAnalysisBrief): what people added
// to each calendar since the last brief went out -- chat, photos, 참석 가능 날짜, confirmed
// meetings, settlements, memos, places, 기념일, photo comments, polls. Read-only: it only reads
// documents created inside the window, so a quiet day costs one read per query.

const { getPhotoAssetKey } = require('./media-commands');

const KST_OFFSET_MS = 9 * 3600000;
const DAY_MS = 24 * 3600000;
const MAX_WINDOW_DAYS = 7;
const DEFAULT_MAX_ROWS = 10;
const QUERY_LIMIT = 500;
// Fixture calendars made by the stress and smoke tests (stress_*, test_*, smoke_*).
const FIXTURE_CALENDAR = /^(?:stress|test|smoke)_/;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const BASE_APP_URL = 'https://pyw31337.github.io/calendar/?shell=v2';

function activityItemUrl(calendarId, query = {}) {
  const cal = String(calendarId || '').replace(/^cal_/, '').trim();
  const url = new URL(BASE_APP_URL);
  if (cal) url.searchParams.set('id', cal);
  Object.entries(query).forEach(([k, v]) => {
    if (v != null && String(v).trim() !== '') url.searchParams.set(k, String(v).trim());
  });
  return url.toString();
}

const kstParts = ms => {
  const date = new Date(Number(ms) + KST_OFFSET_MS);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate(), w: date.getUTCDay(), hh: date.getUTCHours(), mm: date.getUTCMinutes() };
};
const pad = value => String(value).padStart(2, '0');
const kstDayStart = ms => { const p = kstParts(ms); return Date.UTC(p.y, p.m - 1, p.d) - KST_OFFSET_MS; };
const dateKeyStart = key => Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10))) - KST_OFFSET_MS;
const dayLabel = ms => { const p = kstParts(ms); return `${p.m}월 ${p.d}일 (${WEEKDAYS[p.w]})`; };
const timeLabel = ms => { const p = kstParts(ms); return `${p.m}/${p.d} ${pad(p.hh)}:${pad(p.mm)}`; };
// Table cells use the short form so a phone-width table keeps every column visible.
const dateKeyLabel = key => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key || ''))) return String(key || '');
  const p = kstParts(dateKeyStart(key) + 12 * 3600000);
  return `${p.m}/${p.d}(${WEEKDAYS[p.w]})`;
};

// Whole KST days ending before today. It starts on the day the last brief went out (that brief
// covered the day before it), so Monday's brief also covers the weekend, which has no brief.
function activityWindow({ now = Date.now(), lastSentDateKey = '' } = {}) {
  const end = kstDayStart(now);
  let start = end - DAY_MS;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(lastSentDateKey || ''))) {
    const lastSent = dateKeyStart(lastSentDateKey);
    if (lastSent < end && lastSent >= end - MAX_WINDOW_DAYS * DAY_MS) start = Math.min(start, lastSent);
  }
  const days = Math.round((end - start) / DAY_MS);
  return { start, end, days, label: days > 1 ? `${dayLabel(start)} ~ ${dayLabel(end - DAY_MS)}` : dayLabel(start) };
}

// The newest brief that was actually delivered in the 7 days before today (one point read each).
async function findLastSentBriefDateKey(db, todayKey) {
  const today = dateKeyStart(todayKey);
  const keys = Array.from({ length: MAX_WINDOW_DAYS }, (_, i) => {
    const p = kstParts(today - (i + 1) * DAY_MS + 12 * 3600000);
    return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
  });
  const snaps = await db.getAll(...keys.map(key => db.collection('operationsMediaBriefs').doc(`media-analysis-${key}`)));
  const sent = snaps.find(snap => snap.exists && snap.data()?.deliveryStatus === 'sent');
  return sent ? sent.id.replace('media-analysis-', '') : '';
}

const isGone = row => Boolean(row?.deletedAt || row?.removedAt || row?.isDeleted || row?.deleted);
const inWindow = (value, window) => {
  const ms = typeof value === 'string' ? Date.parse(value) : Number(value);
  return Number.isFinite(ms) && ms >= window.start && ms < window.end;
};
const clip = (value, max = 60) => {
  const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};
const won = value => (Number.isFinite(Number(value)) ? `${Math.round(Number(value)).toLocaleString('en-US')}원` : '');
// Uploads have existed in a few shapes over the life of the app.  In particular, older
// records can retain only thumbUrls/thumbUrl after a storage migration.  The digest must use
// the same first available asset identity as photoIndex, otherwise a perfectly valid upload is
// reported but its mail link falls back to the gallery home page.
const photoUrls = row => {
  const fulls = Array.isArray(row?.imageUrls) ? row.imageUrls : (row?.imageUrl ? [row.imageUrl] : []);
  const thumbs = Array.isArray(row?.thumbUrls) ? row.thumbUrls : (row?.thumbUrl ? [row.thumbUrl] : []);
  const smalls = Array.isArray(row?.smallThumbUrls) ? row.smallThumbUrls : (row?.smallThumbUrl ? [row.smallThumbUrl] : []);
  const count = Math.max(fulls.length, thumbs.length, smalls.length);
  return Array.from({ length: count }, (_, index) => String(fulls[index] || thumbs[index] || smalls[index] || '').trim()).filter(Boolean);
};
const photoCount = row => photoUrls(row).length;
const firstPhotoUrl = row => photoUrls(row)[0] || String(row?.full || row?.url || row?.directMediaUrl || '').trim();
const PHOTO_PLACE = { chat: '채팅', gallery: '갤러리', meeting: '모임 앨범' };

// `wrap`: the one free-text column that may wrap; the others stay on one line.
const SECTIONS = [
  { key: 'chat', title: '채팅', columns: ['시간', '보낸 사람', '내용'], wrap: 2 },
  { key: 'photo', title: '사진', columns: ['시간', '올린 사람', '사진', '위치'], wrap: -1 },
  { key: 'availability', title: '참석 가능 날짜', columns: ['날짜', '참여자', '메모', '상태'], wrap: 2 },
  { key: 'meeting', title: '모임 확정', columns: ['모임 날짜', '메모'], wrap: 1 },
  { key: 'expense', title: '정산', columns: ['모임 날짜', '항목', '금액', '결제'], wrap: 1 },
  { key: 'memo', title: '메모', columns: ['시간', '작성자', '제목·내용'], wrap: 2 },
  { key: 'place', title: '장소', columns: ['이름', '주소', '방문일'], wrap: 1 },
  { key: 'anniversary', title: '기념일', columns: ['날짜', '제목'], wrap: 1 },
  { key: 'comment', title: '사진 댓글', columns: ['시간', '작성자', '내용'], wrap: 2 },
  { key: 'poll', title: '투표', columns: ['시간', '제목'], wrap: 1 }
];

// Pure: what was added to one calendar inside the window, as display-ready table rows.
function summarizeCalendarActivity({ id, calendar = {}, messages = [], memos = [], places = [], anniversaries = [], comments = [], meetings = [] }, window, { maxRows = DEFAULT_MAX_ROWS } = {}) {
  const names = new Map((Array.isArray(calendar.participants) ? calendar.participants : []).map(p => [String(p?.id || ''), String(p?.name || '')]));
  const who = participantId => names.get(String(participantId || '')) || (participantId ? '참여자' : '-');
  const rows = Object.fromEntries(SECTIONS.map(section => [section.key, []]));

  messages.filter(m => !isGone(m) && inWindow(m.timestamp, window)).sort((a, b) => a.timestamp - b.timestamp).forEach(m => {
    const source = String(m.uploadSource || 'chat');
    const photos = source === 'meme' ? 0 : photoCount(m);
    const files = Array.isArray(m.fileAttachments) ? m.fileAttachments.length : 0;
    if (source === 'chat' || source === 'meme') {
      const text = clip(m.text) || (source === 'meme' ? '(이모티콘)' : photos ? `(사진 ${photos}장)` : files ? `(파일 ${files}개)` : '');
      if (text) rows.chat.push({ at: m.timestamp, cells: [timeLabel(m.timestamp), who(m.participantId), text], url: activityItemUrl(id, { view: 'chat', msg: m.id }) });
    }
    if (photos) {
      const firstUrl = firstPhotoUrl(m);
      const assetKey = firstUrl ? getPhotoAssetKey(firstUrl) : '';
      const photoUrl = assetKey
        ? activityItemUrl(id, { view: 'gallery', img: assetKey })
        : (source === 'chat' ? activityItemUrl(id, { view: 'chat', msg: m.id, img: 0 }) : activityItemUrl(id, { view: 'gallery' }));
      rows.photo.push({ at: m.timestamp, count: photos, cells: [timeLabel(m.timestamp), who(m.participantId), `${photos}장`, PHOTO_PLACE[source] || '채팅'], url: photoUrl });
    }
  });
  memos.filter(m => !isGone(m) && inWindow(m.createdAt, window)).sort((a, b) => a.createdAt - b.createdAt).forEach(m => {
    rows.memo.push({ at: m.createdAt, cells: [timeLabel(m.createdAt), who(m.participantId), clip([m.title, m.text].filter(Boolean).join(' · ')) || '(내용 없음)'], url: activityItemUrl(id, { view: 'memo', memo: m.id }) });
    const photos = photoCount(m);
    if (photos) {
      const firstUrl = firstPhotoUrl(m);
      const assetKey = firstUrl ? getPhotoAssetKey(firstUrl) : '';
      const photoUrl = assetKey
        ? activityItemUrl(id, { view: 'gallery', img: assetKey })
        : activityItemUrl(id, { view: 'memo', memo: m.id });
      rows.photo.push({ at: m.createdAt, count: photos, cells: [timeLabel(m.createdAt), who(m.participantId), `${photos}장`, '메모'], url: photoUrl });
    }
  });
  rows.photo.sort((a, b) => a.at - b.at);

  (Array.isArray(calendar.availabilities) ? calendar.availabilities : [])
    .filter(a => inWindow(a?.deletedAt || a?.updatedAt, window))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .forEach(a => rows.availability.push({
      cells: [dateKeyLabel(a.date), who(a.participantId), clip(a.note, 40) || '-', a.deletedAt ? '취소' : '등록'],
      url: a.date ? activityItemUrl(id, { tab: 'calendar', date: a.date }) : activityItemUrl(id, { tab: 'calendar' })
    }));

  meetings.forEach(meeting => {
    const meetingDate = meeting.date || meeting.id;
    if (meeting.confirmed === true && inWindow(meeting.confirmedAt, window)) {
      rows.meeting.push({
        cells: [dateKeyLabel(meetingDate), clip(meeting.note, 50) || '-'],
        url: meetingDate ? activityItemUrl(id, { tab: 'calendar', date: meetingDate }) : activityItemUrl(id, { tab: 'calendar' })
      });
    }
    (Array.isArray(meeting.expenses) ? meeting.expenses : []).filter(e => !isGone(e) && inWindow(e.createdAt, window)).forEach(e => {
      rows.expense.push({
        cells: [dateKeyLabel(meetingDate), clip(e.label, 30) || '-', won(e.amount), e.isSelfPay ? '각자' : who(e.payerId)],
        url: meetingDate ? activityItemUrl(id, { tab: 'calendar', date: meetingDate }) : activityItemUrl(id, { view: 'settlement' })
      });
    });
  });
  (Array.isArray(calendar.settlementCards) ? calendar.settlementCards : []).filter(card => !isGone(card) && inWindow(card.createdAt, window)).forEach(card => {
    rows.expense.push({
      cells: [String(card.monthStr || '-'), `정산 카드: ${clip(card.title, 24)}`, won(card.amount), card.perPersonAmount ? `1인 ${won(card.perPersonAmount)}` : '-'],
      url: activityItemUrl(id, { view: 'settlement' })
    });
  });

  places.filter(p => !isGone(p) && inWindow(p.createdAt, window)).sort((a, b) => a.createdAt - b.createdAt)
    .forEach(p => rows.place.push({
      cells: [clip(p.name || p.alias, 30) || '-', clip(p.address, 40) || '-', p.visitDate ? dateKeyLabel(p.visitDate) : '-'],
      url: p.visitDate ? activityItemUrl(id, { tab: 'calendar', date: p.visitDate }) : activityItemUrl(id, { view: 'places' })
    }));
  anniversaries.filter(a => !isGone(a) && inWindow(a.createdAt, window)).sort((a, b) => a.createdAt - b.createdAt)
    .forEach(a => {
      const annDate = a.date || a.startDate;
      rows.anniversary.push({
        cells: [a.startDate && a.endDate ? `${dateKeyLabel(a.startDate)} ~ ${dateKeyLabel(a.endDate)}` : `${dateKeyLabel(a.date)}${a.isLunar ? ' (음력)' : ''}`, clip(a.title, 40) || '-'],
        url: annDate ? activityItemUrl(id, { tab: 'calendar', date: annDate }) : activityItemUrl(id, { tab: 'calendar' })
      });
    });
  comments.filter(c => !isGone(c) && inWindow(c.createdAt, window)).sort((a, b) => a.createdAt - b.createdAt)
    .forEach(c => rows.comment.push({
      cells: [timeLabel(c.createdAt), who(c.participantId), clip(c.text) || '-'],
      url: c.assetKey ? activityItemUrl(id, { view: 'gallery', img: c.assetKey, comment: c.id }) : activityItemUrl(id, { view: 'gallery' })
    }));
  (Array.isArray(calendar.polls) ? calendar.polls : []).filter(p => !isGone(p) && inWindow(p.createdAt, window))
    .forEach(p => rows.poll.push({
      cells: [timeLabel(p.createdAt), clip(p.title, 50) || '-'],
      url: p.id ? activityItemUrl(id, { tab: 'calendar', poll: p.id }) : activityItemUrl(id, { tab: 'calendar' })
    }));

  const counts = Object.fromEntries(SECTIONS.map(section => [section.key, section.key === 'photo'
    ? rows.photo.reduce((sum, row) => sum + row.count, 0)
    : rows[section.key].length]));
  const sections = SECTIONS.filter(section => rows[section.key].length).map(section => {
    const list = rows[section.key].slice(0, maxRows);
    const resultRows = list.map(row => {
      const cells = row.cells.slice();
      if (row.url) Object.defineProperty(cells, 'url', { value: row.url, enumerable: false, writable: true });
      return cells;
    });
    const urls = list.map(row => row.url || '');
    return {
      key: section.key,
      title: section.title,
      count: counts[section.key],
      columns: section.columns,
      wrap: section.wrap,
      rows: resultRows,
      urls,
      more: Math.max(0, rows[section.key].length - maxRows)
    };
  });
  return {
    id: String(id || calendar.id || ''),
    name: String(calendar.title || calendar.name || id || '캘린더'),
    counts,
    total: Object.values(counts).reduce((sum, value) => sum + value, 0),
    sections
  };
}

const MESSAGE_FIELDS = [
  'timestamp', 'participantId', 'text',
  'imageUrls', 'imageUrl', 'thumbUrls', 'thumbUrl', 'smallThumbUrls', 'smallThumbUrl',
  'uploadSource', 'fileAttachments', 'deletedAt', 'isDeleted'
];
async function rangeRows(ref, field, window, fields) {
  const snap = await ref.where(field, '>=', window.start).where(field, '<', window.end).orderBy(field).limit(QUERY_LIMIT).select(...fields).get();
  return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

// Every real calendar's activity in the window; calendars with nothing new are left out.
async function collectDailyActivity(db, window, options = {}) {
  const snapshot = await db.collection('calendars').select('calendar').get();
  const results = [];
  for (const doc of snapshot.docs) {
    const id = doc.id.replace(/^cal_/, '');
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || FIXTURE_CALENDAR.test(id)) continue;
    const calendar = doc.data()?.calendar || {};
    const [messages, memos, places, anniversaries, comments, confirmed, updated] = await Promise.all([
      rangeRows(doc.ref.collection('messages'), 'timestamp', window, MESSAGE_FIELDS),
      rangeRows(doc.ref.collection('memos'), 'createdAt', window, ['createdAt', 'participantId', 'title', 'text', 'imageUrls', 'imageUrl', 'thumbUrls', 'thumbUrl', 'smallThumbUrls', 'smallThumbUrl', 'deletedAt', 'removedAt', 'isDeleted']),
      rangeRows(doc.ref.collection('places'), 'createdAt', window, ['createdAt', 'name', 'alias', 'address', 'visitDate', 'deletedAt', 'removedAt']),
      rangeRows(doc.ref.collection('anniversaries'), 'createdAt', window, ['createdAt', 'title', 'date', 'startDate', 'endDate', 'isLunar', 'deletedAt']),
      rangeRows(doc.ref.collection('photoCommentItems'), 'createdAt', window, ['createdAt', 'participantId', 'text', 'assetKey', 'deletedAt']),
      rangeRows(doc.ref.collection('confirmedMeetings'), 'confirmedAt', window, ['date', 'confirmed', 'confirmedAt', 'note', 'expenses']),
      rangeRows(doc.ref.collection('confirmedMeetings'), 'updatedAt', window, ['date', 'confirmed', 'confirmedAt', 'note', 'expenses'])
    ]);
    const meetings = [...new Map([...confirmed, ...updated].map(row => [row.id, row])).values()];
    const summary = summarizeCalendarActivity({ id, calendar, messages, memos, places, anniversaries, comments, meetings }, window, options);
    if (summary.total) results.push(summary);
  }
  results.sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));
  return { window, calendars: results, total: results.reduce((sum, calendar) => sum + calendar.total, 0) };
}

module.exports = { activityWindow, findLastSentBriefDateKey, summarizeCalendarActivity, collectDailyActivity, SECTIONS, FIXTURE_CALENDAR, activityItemUrl };
