const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const CALENDAR_IDS = (process.env.AUDIT_CALENDAR_IDS || 'kkot,cw,jhair')
  .split(',').map((value) => value.trim()).filter(Boolean);
const DOCUMENT_LIMIT_BYTES = 1048576;
const WARNING_RATIO = 0.75;

function firestoreValueToJs(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {};
    return Object.fromEntries(Object.entries(fields).map(([key, nested]) => [key, firestoreValueToJs(nested)]));
  }
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
  return undefined;
}

function docToJs(doc) {
  const fields = doc?.fields || {};
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, firestoreValueToJs(value)]));
}

function isDeleted(item) {
  return Boolean(item && (item.deletedAt || item.removedAt));
}

async function fetchAllCalendarDocs() {
  const documents = [];
  for (const calendarId of CALENDAR_IDS) {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars/cal_${encodeURIComponent(calendarId)}`);
    if (response.status === 404) continue;
    if (!response.ok) {
      throw new Error(`Firestore audit failed for ${calendarId}: ${response.status} ${await response.text()}`);
    }
    documents.push(await response.json());
  }
  return documents;
}

async function fetchSubcollection(calendarId, collectionName) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars/cal_${encodeURIComponent(calendarId)}/${collectionName}?pageSize=500`;
  const response = await fetch(url);
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Firestore audit failed for ${calendarId}/${collectionName}: ${response.status}`);
  const body = await response.json();
  return Array.isArray(body.documents) ? body.documents : [];
}

const docs = await fetchAllCalendarDocs();
const summaryRows = await Promise.all(docs.map(async (doc) => {
  const decoded = docToJs(doc);
  const calendar = decoded.calendar || {};
  const participants = Array.isArray(calendar.participants) ? calendar.participants : [];
  const availabilities = Array.isArray(calendar.availabilities) ? calendar.availabilities : [];
  const activityLogs = Array.isArray(calendar.activityLogs) ? calendar.activityLogs : [];
  const deletedActivityLogIds = Array.isArray(calendar.deletedActivityLogIds) ? calendar.deletedActivityLogIds : [];
  const polls = Array.isArray(calendar.polls) ? calendar.polls : [];
  const embeddedPlaces = Array.isArray(calendar.places) ? calendar.places.filter((item) => !isDeleted(item)) : [];
  const embeddedMeetings = Array.isArray(calendar.confirmedMeeting) ? calendar.confirmedMeeting.filter((item) => !isDeleted(item)) : [];
  const calendarId = calendar.id || '';
  const [placeDocs, meetingDocs] = calendarId
    ? await Promise.all([fetchSubcollection(calendarId, 'places'), fetchSubcollection(calendarId, 'confirmedMeetings')])
    : [[], []];
  const placeIds = new Set(placeDocs.map((doc) => doc.name.split('/').pop()).filter(Boolean));
  const meetingDates = new Set(meetingDocs.map((doc) => doc.name.split('/').pop()).filter(Boolean));
  const embeddedPlaceIds = new Set(embeddedPlaces.map((item) => item.id).filter(Boolean));
  const embeddedMeetingDates = new Set(embeddedMeetings.map((item) => item.date).filter(Boolean));
  const parityWarnings = [];
  if (placeDocs.length && embeddedPlaceIds.size && [...embeddedPlaceIds].some((id) => !placeIds.has(id))) parityWarnings.push('embedded place missing from subcollection');
  if (meetingDocs.length && embeddedMeetingDates.size && [...embeddedMeetingDates].some((date) => !meetingDates.has(date))) parityWarnings.push('embedded meeting missing from subcollection');
  const activePolls = polls.filter((item) => !isDeleted(item));
  const pollOptions = activePolls.reduce((sum, poll) => sum + (Array.isArray(poll.options) ? poll.options.filter((item) => !isDeleted(item)).length : 0), 0);
  const pollVotes = activePolls.reduce((sum, poll) => sum + (poll.votes && typeof poll.votes === 'object' ? Object.keys(poll.votes).length : 0), 0);
  const sizeBytes = Buffer.byteLength(JSON.stringify(doc));
  return {
    docId: doc.name.split('/').pop(),
    calendarId,
    sizeBytes,
    sizePercentOfLimit: Number((sizeBytes / DOCUMENT_LIMIT_BYTES * 100).toFixed(1)),
    participants: participants.filter((item) => !isDeleted(item)).length,
    activeAvailabilities: availabilities.filter((item) => !isDeleted(item)).length,
    storedAvailabilities: availabilities.length,
    activityLogs: activityLogs.length,
    hiddenActivityLogs: deletedActivityLogIds.length,
    polls: activePolls.length,
    pollOptions,
    pollVotes,
    revision: decoded.revision || 0,
    updateTime: doc.updateTime || '',
    placesSubcollection: placeDocs.length,
    meetingsSubcollection: meetingDocs.length,
    parityWarnings
  };
}));
const summaries = summaryRows.sort((a, b) => a.docId.localeCompare(b.docId));

const stressDocs = summaries.filter((item) => item.docId.startsWith('cal_stress_') || item.docId.startsWith('cal_test_'));
const production = summaries.filter((item) => !stressDocs.includes(item) && /^cal_[A-Za-z0-9_-]{1,64}$/.test(item.docId) && item.calendarId && item.docId === `cal_${item.calendarId}`);
const unexpectedDocs = summaries.filter((item) => !production.includes(item) && !stressDocs.includes(item));
const warnings = [];

for (const item of production) {
  if (item.sizeBytes > DOCUMENT_LIMIT_BYTES * WARNING_RATIO) {
    warnings.push(`${item.docId} is ${item.sizePercentOfLimit}% of Firestore's 1MiB document limit.`);
  }
  if (item.activityLogs > 3000 || item.hiddenActivityLogs > 3000) {
    warnings.push(`${item.docId} activity log volume is high: ${item.activityLogs} logs, ${item.hiddenActivityLogs} hidden logs.`);
  }
  item.parityWarnings.forEach((warning) => warnings.push(`${item.docId}: ${warning}`));
}
if (stressDocs.length > 0) {
  warnings.push(`${stressDocs.length} internal stress/test documents remain in Firestore.`);
}
if (unexpectedDocs.length > 0) {
  warnings.push(`${unexpectedDocs.length} unexpected calendar documents exist: ${unexpectedDocs.map((item) => item.docId).join(', ')}`);
}

console.log(JSON.stringify({
  ok: warnings.length === 0,
  scope: CALENDAR_IDS,
  production,
  stressDocCount: stressDocs.length,
  stressDocs: stressDocs.map((item) => item.docId),
  unexpectedDocs,
  warnings
}, null, 2));

if (warnings.length > 0) process.exitCode = 1;
