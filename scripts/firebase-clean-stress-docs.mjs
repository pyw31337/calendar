const PROJECT_ID = 'metro-live-2918e';
const DATABASE = '(default)';
const COLLECTION_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/calendars?pageSize=300`;

async function listStressDocs() {
  const response = await fetch(COLLECTION_URL);
  if (!response.ok) {
    throw new Error(`Failed to list calendars: ${response.status} ${await response.text()}`);
  }
  const docs = (await response.json()).documents || [];
  return docs
    .map((doc) => doc.name)
    .filter((name) => /\/cal_(stress|test)_/.test(name))
    .sort();
}

async function deleteDoc(name) {
  const response = await fetch(`https://firestore.googleapis.com/v1/${name}`, { method: 'DELETE' });
  return {
    ok: response.ok,
    status: response.status,
    body: response.ok ? '' : await response.text()
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
  results.push({ name, ...(await deleteDoc(name)) });
}

const failed = results.filter((result) => !result.ok);
if (failed.length === 0) {
  console.log(`Deleted ${results.length} stress/test documents.`);
  process.exit(0);
}

console.error(`Could not delete ${failed.length} documents with the current credentials/rules.`);
console.error('This is expected when Firestore rules block anonymous deletes.');
console.error('Delete these documents from Firebase Console, or run an authenticated admin delete with Firebase CLI/Admin SDK.');
console.error('Document IDs to delete:');
for (const result of failed) {
  console.error(`- ${result.name.split('/').pop()} (${result.status})`);
}
process.exit(1);
