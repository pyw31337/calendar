const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const CALENDARS_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars?pageSize=300`;
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
  const response = await fetch(CALENDARS_URL);
  if (!response.ok) {
    throw new Error(`Firestore audit failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()).documents || [];
}

const docs = await fetchAllCalendarDocs();
const summaries = docs.map((doc) => {
  const decoded = docToJs(doc);
  const calendar = decoded.calendar || {};
  const participants = Array.isArray(calendar.participants) ? calendar.participants : [];
  const availabilities = Array.isArray(calendar.availabilities) ? calendar.availabilities : [];
  const activityLogs = Array.isArray(calendar.activityLogs) ? calendar.activityLogs : [];
  const deletedActivityLogIds = Array.isArray(calendar.deletedActivityLogIds) ? calendar.deletedActivityLogIds : [];
  const polls = Array.isArray(calendar.polls) ? calendar.polls : [];
  const activePolls = polls.filter((item) => !isDeleted(item));
  const pollOptions = activePolls.reduce((sum, poll) => sum + (Array.isArray(poll.options) ? poll.options.filter((item) => !isDeleted(item)).length : 0), 0);
  const pollVotes = activePolls.reduce((sum, poll) => sum + (poll.votes && typeof poll.votes === 'object' ? Object.keys(poll.votes).length : 0), 0);
  const sizeBytes = Buffer.byteLength(JSON.stringify(doc));
  return {
    docId: doc.name.split('/').pop(),
    calendarId: calendar.id || '',
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
    updateTime: doc.updateTime || ''
  };
}).sort((a, b) => a.docId.localeCompare(b.docId));

const production = summaries.filter((item) => item.docId === 'cal_kkot' || item.docId === 'cal_cw');
const stressDocs = summaries.filter((item) => item.docId.startsWith('cal_stress_') || item.docId.startsWith('cal_test_'));
const unexpectedDocs = summaries.filter((item) => !production.includes(item) && !stressDocs.includes(item));
const warnings = [];

for (const item of production) {
  if (item.sizeBytes > DOCUMENT_LIMIT_BYTES * WARNING_RATIO) {
    warnings.push(`${item.docId} is ${item.sizePercentOfLimit}% of Firestore's 1MiB document limit.`);
  }
  if (item.activityLogs > 3000 || item.hiddenActivityLogs > 3000) {
    warnings.push(`${item.docId} activity log volume is high: ${item.activityLogs} logs, ${item.hiddenActivityLogs} hidden logs.`);
  }
}
if (stressDocs.length > 0) {
  warnings.push(`${stressDocs.length} internal stress/test documents remain in Firestore.`);
}
if (unexpectedDocs.length > 0) {
  warnings.push(`${unexpectedDocs.length} unexpected calendar documents exist: ${unexpectedDocs.map((item) => item.docId).join(', ')}`);
}

console.log(JSON.stringify({
  ok: warnings.length === 0,
  production,
  stressDocCount: stressDocs.length,
  stressDocs: stressDocs.map((item) => item.docId),
  unexpectedDocs,
  warnings
}, null, 2));

if (warnings.length > 0) process.exitCode = 1;
