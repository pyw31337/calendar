import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ID = 'metro-live-2918e';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const TARGETS = {
  '2026-09-19': [
    { labelIncludes: '추사고택', amount: 140000, payerId: '송은혜' }
  ],
  '2026-10-09': [
    { labelIncludes: '도은네 / 파쇄석 12 캠핑사이트', amount: 60000, payerId: '송은혜' },
    { labelIncludes: '도은네 / 파쇄석 12 캠핑사이트 (자비부담)', amount: -60000, participantId: '송은혜' },
    { labelIncludes: '서준네 / 타요 카라반', amount: 130000, payerId: '박영우' },
    { labelIncludes: '서준네 / 타요 카라반 (자비부담)', amount: -130000, participantId: '박영우' }
  ],
  '2026-10-10': [
    { labelIncludes: '도은네 / 파쇄석 12 캠핑사이트', amount: 60000, payerId: '송은혜' },
    { labelIncludes: '도은네 / 파쇄석 12 캠핑사이트 (자비부담)', amount: -60000, participantId: '송은혜' },
    { labelIncludes: '서준네 / 타요 카라반', amount: 130000, payerId: '박영우' },
    { labelIncludes: '서준네 / 타요 카라반 (자비부담)', amount: -130000, participantId: '박영우' }
  ]
};

function fromFirestore(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestore);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, nested]) => [key, fromFirestore(nested)]));
  return undefined;
}

function toFirestore(value) {
  if (value == null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: value.length ? { values: value.map(toFirestore) } : {} };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, toFirestore(nested)])) } };
}

function decodeDocument(document) {
  return Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, fromFirestore(value)]));
}

async function fetchMeeting(date) {
  const url = `${BASE}/calendars/cal_cw/confirmedMeetings/${date}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to read ${date}: ${response.status} ${await response.text()}`);
  return response.json();
}

function migrateExpenses(date, meeting) {
  const expected = TARGETS[date];
  const expenses = Array.isArray(meeting.expenses) ? meeting.expenses.map(item => ({ ...item })) : [];
  expected.forEach(target => {
    const matches = expenses.filter(item => Number(item.amount) === target.amount && String(item.label || '').includes(target.labelIncludes));
    if (matches.length !== 1) throw new Error(`${date}: expected exactly one ${target.labelIncludes} ${target.amount}, found ${matches.length}`);
    const item = matches[0];
    item.fundingType = 'personal';
    item.flowType = '';
    if (target.amount < 0) {
      item.payerId = '';
      item.participantId = target.participantId;
    } else {
      item.payerId = target.payerId;
      item.participantId = '';
    }
  });
  return expenses;
}

const apply = process.argv.includes('--apply');
const rawDocuments = await Promise.all(Object.keys(TARGETS).map(fetchMeeting));
const decoded = rawDocuments.map(decodeDocument);
const migrated = decoded.map((meeting, index) => ({
  ...meeting,
  expenses: migrateExpenses(meeting.date, meeting),
  updatedAt: apply ? Date.now() + index : meeting.updatedAt
}));

if (!apply) {
  console.log(JSON.stringify({ ok: true, mode: 'dry-run', meetings: migrated.map(meeting => ({ date: meeting.date, expenses: meeting.expenses })) }, null, 2));
  process.exit(0);
}

const backupDir = path.resolve('ops-backups');
await fs.mkdir(backupDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `cw-settlement-funding-before-${timestamp}.json`);
await fs.writeFile(backupPath, `${JSON.stringify({ backedUpAt: new Date().toISOString(), documents: rawDocuments }, null, 2)}\n`, 'utf8');

const writes = migrated.map((meeting, index) => ({
  update: {
    name: rawDocuments[index].name,
    fields: Object.fromEntries(Object.entries(meeting).map(([key, value]) => [key, toFirestore(value)]))
  },
  currentDocument: { updateTime: rawDocuments[index].updateTime }
}));
const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ writes })
});
if (!response.ok) throw new Error(`Migration commit failed: ${response.status} ${await response.text()}`);
console.log(JSON.stringify({ ok: true, mode: 'applied', backupPath, dates: migrated.map(meeting => meeting.date), result: await response.json() }, null, 2));
