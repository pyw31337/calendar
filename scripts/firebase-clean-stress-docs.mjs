import { spawnSync } from 'node:child_process';

const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const COLLECTION_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars?pageSize=300`;
const EXPLICIT_IDS = (process.env.STRESS_CALENDAR_IDS || '')
  .split(',').map((value) => value.trim()).filter((value) => /^cal_(stress|test)_/.test(value));

async function listStressDocs() {
  if (EXPLICIT_IDS.length > 0) {
    return EXPLICIT_IDS.map((id) => `projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars/${id}`);
  }
  const response = await fetch(COLLECTION_URL);
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Calendar listing is intentionally blocked by Firestore rules. Set STRESS_CALENDAR_IDS to the exact comma-separated cal_test_*/cal_stress_* document IDs.');
    }
    throw new Error(`Failed to list calendars: ${response.status} ${await response.text()}`);
  }
  const docs = (await response.json()).documents || [];
  return docs
    .map((doc) => doc.name)
    .filter((name) => /\/cal_(stress|test)_/.test(name))
    .sort();
}

function deleteDoc(name) {
  const docId = name.split('/').pop();
  if (!/^cal_(stress|test)_[A-Za-z0-9_-]{1,70}$/.test(docId)) {
    return { ok: false, status: 'unsafe-target', body: `Refusing ${docId}` };
  }
  // Firestore's REST document DELETE does not delete nested subcollections. Use the
  // authenticated CLI's exact-path recursive deletion so repeated test runs cannot leave
  // orphan messages/comments behind after the parent test calendar disappears.
  const result = spawnSync('firebase', [
    'firestore:delete', `calendars/${docId}`, '--recursive', '--force',
    '--project', PROJECT_ID, '--non-interactive'
  ], { encoding: 'utf8' });
  return {
    ok: result.status === 0,
    status: result.status,
    body: result.status === 0 ? '' : (result.stderr || result.stdout || '')
  };
}

const stressDocs = await listStressDocs();
if (stressDocs.length === 0) {
  console.log('No cal_stress_* or cal_test_* documents found.');
  process.exit(0);
}

console.log(`Found ${stressDocs.length} stress/test documents:`);
for (const name of stressDocs) {
  console.log(`- ${name.split('/').pop()}`);
}

const results = [];
for (const name of stressDocs) {
  results.push({ name, ...deleteDoc(name) });
}

const failed = results.filter((result) => !result.ok);
if (failed.length === 0) {
  console.log(`Deleted ${results.length} stress/test documents.`);
  process.exit(0);
}

console.error(`Could not delete ${failed.length} documents with the current credentials/rules.`);
console.error('The authenticated Firebase CLI could not recursively delete these exact test paths.');
console.error('Document IDs to delete:');
for (const result of failed) {
  console.error(`- ${result.name.split('/').pop()} (${result.status})`);
}
process.exit(1);
