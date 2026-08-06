import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';

function jsToFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: value.length ? { values: value.map(jsToFirestoreValue) } : {} };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, jsToFirestoreValue(nested)]))
      }
    };
  }
  return { stringValue: String(value) };
}

async function fetchCurrentDoc(docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars/${docId}`;
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to read current ${docId} before restore: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function restoreCalendar(calData) {
  const docId = calData.docId; // cal_kkot or cal_cw
  const docPath = `projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars/${docId}`;

  const calendarData = calData.data.calendar;
  const lastModified = calData.data.lastModified;

  // The Firestore rules require revision to be exactly (current server revision + 1).
  // Writing the backup's own revision verbatim only works if nothing has touched the
  // document since the backup was taken, so re-derive it from the live document instead.
  const currentDoc = await fetchCurrentDoc(docId);
  const currentRevision = currentDoc?.fields?.revision?.integerValue
    ? Number(currentDoc.fields.revision.integerValue)
    : 0;
  const revision = currentRevision + 1;

  console.log(`Restoring ${docId} to revision ${revision} (current server revision: ${currentRevision}), lastModified: ${lastModified}...`);

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents:commit`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [{
        update: {
          name: docPath,
          fields: {
            calendar: jsToFirestoreValue(calendarData),
            lastModified: jsToFirestoreValue(lastModified),
            revision: jsToFirestoreValue(revision)
          }
        },
        ...(currentDoc?.updateTime ? { currentDocument: { updateTime: currentDoc.updateTime } } : { currentDocument: { exists: false } })
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to restore ${docId}: ${response.status} ${await response.text()}`);
  }
  
  const result = await response.json();
  console.log(`Successfully restored ${docId}. Commit time: ${result.commitTime}`);
}

async function main() {
  const args = process.argv.slice(2);
  const backupFilePath = args[0];
  
  if (!backupFilePath) {
    console.error("Usage: node scripts/firebase-import-prod.mjs <backup-json-file-path>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(backupFilePath);
  console.log(`Reading backup file from: ${resolvedPath}`);
  
  const fileContent = await fs.readFile(resolvedPath, 'utf8');
  const backupData = JSON.parse(fileContent);
  
  if (backupData.projectId !== PROJECT_ID) {
    console.error(`Error: Backup project ID (${backupData.projectId}) does not match expected project ID (${PROJECT_ID})`);
    process.exit(1);
  }

  const calendars = backupData.calendars || [];
  if (calendars.length === 0) {
    console.warn("No calendars found in backup file.");
    return;
  }

  for (const cal of calendars) {
    await restoreCalendar(cal);
  }

  console.log("All calendars successfully restored from backup!");
}

main().catch((err) => {
  console.error("Restore failed:", err);
  process.exit(1);
});
