#!/usr/bin/env node

// One-time legacy migration: every message without uploadSource predates the channel marker and
// is a chat message. Gallery/meeting uploads already carry their source and are left untouched.
// Run with GOOGLE_OAUTH_ACCESS_TOKEN=... node scripts/migrate-chat-upload-sources.mjs --apply

const projectId = 'metro-live-2918e';
const calendars = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const apply = process.argv.includes('--apply');
const token = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || '';
if (apply && !token) throw new Error('GOOGLE_OAUTH_ACCESS_TOKEN is required with --apply');
const ids = calendars.length ? calendars : ['cw', 'kkot', 'jhair'];
const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};

async function migrateCalendar(calId) {
  let pageToken = '';
  let scanned = 0;
  let migrated = 0;
  do {
    const url = `${base}/calendars/cal_${encodeURIComponent(calId)}/messages?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`${calId}: list failed ${response.status}`);
    const data = await response.json();
    for (const doc of data.documents || []) {
      scanned += 1;
      if (doc.fields?.uploadSource) continue;
      migrated += 1;
      if (!apply) continue;
      const patchUrl = `${base}/${doc.name.split('/documents/')[1]}?updateMask.fieldPaths=uploadSource`;
      const patchResponse = await fetch(patchUrl, {
        method: 'PATCH', headers,
        body: JSON.stringify({ fields: { uploadSource: { stringValue: 'chat' } } })
      });
      if (!patchResponse.ok) throw new Error(`${calId}/${doc.name.split('/').pop()}: patch failed ${patchResponse.status}`);
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  console.log(JSON.stringify({ calendar: calId, scanned, migrated, applied: apply }));
}

for (const id of ids) await migrateCalendar(id);
