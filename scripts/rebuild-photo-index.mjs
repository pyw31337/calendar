#!/usr/bin/env node
/**
 * Dry-run or apply photoIndex rebuild for one calendar via the admin CF.
 *
 * Usage:
 *   node scripts/rebuild-photo-index.mjs --calendar jhair
 *   node scripts/rebuild-photo-index.mjs --calendar jhair --apply
 *
 * Env:
 *   GATHER_ADMIN_PASSWORD  (required)
 *   GATHER_PROJECT_ID      (default: metro-live-2918e)
 */
const args = process.argv.slice(2);
const calendarId = args.includes('--calendar') ? args[args.indexOf('--calendar') + 1] : '';
const apply = args.includes('--apply');
const password = process.env.GATHER_ADMIN_PASSWORD || '';
const projectId = process.env.GATHER_PROJECT_ID || 'metro-live-2918e';

if (!calendarId || !/^[A-Za-z0-9_-]{1,64}$/.test(calendarId)) {
  console.error('Usage: node scripts/rebuild-photo-index.mjs --calendar <id> [--apply]');
  process.exit(1);
}
if (!password) {
  console.error('Set GATHER_ADMIN_PASSWORD');
  process.exit(1);
}

const url = `https://us-central1-${projectId}.cloudfunctions.net/rebuildPhotoIndex`;
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password, calendarId, apply })
});
const json = await res.json().catch(() => ({}));
if (!res.ok || json?.ok === false) {
  console.error('Failed', res.status, json);
  process.exit(1);
}
console.log(JSON.stringify(json, null, 2));
