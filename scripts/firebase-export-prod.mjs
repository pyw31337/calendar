import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const PRODUCTION_DOC_IDS = ['cal_kkot', 'cal_cw', 'cal_jhair'];
const DOCUMENT_LIMIT_BYTES = 1048576;

function parseArgs(argv) {
  const options = {
    dir: 'ops-backups',
    stdout: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--stdout') {
      options.stdout = true;
    } else if (arg === '--dir') {
      const value = argv[index + 1];
      if (!value) throw new Error('--dir requires a directory path');
      options.dir = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function firestoreValueToJs(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
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

function summarizeDocument(doc, decoded) {
  const calendar = decoded.calendar || {};
  const participants = Array.isArray(calendar.participants) ? calendar.participants : [];
  const availabilities = Array.isArray(calendar.availabilities) ? calendar.availabilities : [];
  const sizeBytes = Buffer.byteLength(JSON.stringify(doc));

  return {
    docId: doc.name.split('/').pop(),
    calendarId: calendar.id || '',
    title: calendar.title || '',
    revision: decoded.revision || calendar.revision || 0,
    lastModified: decoded.lastModified || calendar.updatedAt || 0,
    updateTime: doc.updateTime || '',
    createTime: doc.createTime || '',
    sizeBytes,
    sizePercentOfLimit: Number(((sizeBytes / DOCUMENT_LIMIT_BYTES) * 100).toFixed(2)),
    participants: participants.filter((item) => !isDeleted(item)).length,
    storedParticipants: participants.length,
    activeAvailabilities: availabilities.filter((item) => !isDeleted(item)).length,
    storedAvailabilities: availabilities.length,
    deletedAvailabilities: availabilities.filter(isDeleted).length
  };
}

async function fetchDocument(docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars/${docId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to export ${docId}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function createExportPayload(documents) {
  const calendars = documents.map((doc) => {
    const decoded = docToJs(doc);
    return {
      docId: doc.name.split('/').pop(),
      firestoreName: doc.name,
      createTime: doc.createTime || '',
      updateTime: doc.updateTime || '',
      summary: summarizeDocument(doc, decoded),
      data: decoded
    };
  });

  return {
    exportedAt: new Date().toISOString(),
    projectId: PROJECT_ID,
    database: DATABASE,
    calendarDocIds: PRODUCTION_DOC_IDS,
    summary: calendars.map((item) => item.summary),
    calendars
  };
}

function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

const options = parseArgs(process.argv.slice(2));
const documents = await Promise.all(PRODUCTION_DOC_IDS.map(fetchDocument));
const payload = createExportPayload(documents);
const json = `${JSON.stringify(payload, null, 2)}\n`;

if (options.stdout) {
  process.stdout.write(json);
} else {
  const outDir = path.resolve(options.dir);
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `calendar-prod-backup-${timestampForFile()}.json`);
  await fs.writeFile(outFile, json, 'utf8');
  console.log(JSON.stringify({
    ok: true,
    output: outFile,
    calendars: payload.summary
  }, null, 2));
}
