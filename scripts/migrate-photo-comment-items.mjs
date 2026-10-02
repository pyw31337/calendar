#!/usr/bin/env node
/**
 * One-time (and safe to repeat) migration: old photo comment threads -> photo comments v2.
 *
 *   photoComments/{key}.comments[]  ->  photoCommentItems/{commentId}  (+ photoCommentSummary/counts)
 *
 * Create-only and idempotent (functions/photo-comment-items.js): an item that already exists is
 * never touched, and the old photoComments collection is left exactly as it is. Dry-run unless
 * APPLY=1. Needs admin credentials (GOOGLE_APPLICATION_CREDENTIALS), so it runs from the
 * "Deploy Firebase backend" workflow, right after a fresh `ops:export` backup.
 *
 *   node scripts/migrate-photo-comment-items.mjs            # report only
 *   APPLY=1 node scripts/migrate-photo-comment-items.mjs    # write
 *   CALENDARS=cw,kkot APPLY=1 node scripts/migrate-photo-comment-items.mjs
 */
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const admin = require('firebase-admin');
const items = require('./photo-comment-items.js');

const APPLY = process.env.APPLY === '1';
const ONLY = String(process.env.CALENDARS || '').split(',').map(s => s.trim()).filter(Boolean);
const PROJECT = process.env.GCLOUD_PROJECT || 'metro-live-2918e';

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

async function calendarDocIds() {
  if (ONLY.length) return ONLY.map(id => `cal_${id}`);
  const refs = await db.collection('calendars').listDocuments();
  return refs.map(ref => ref.id).filter(id => /^cal_[A-Za-z0-9_-]{1,64}$/.test(id));
}

async function migrateCalendar(calendarDocId) {
  const root = db.collection('calendars').doc(calendarDocId);
  const threads = await root.collection('photoComments').get();
  const report = { calendar: calendarDocId, threads: threads.size, comments: 0, created: 0, existing: 0, unresolvedKeys: [] };
  const touched = new Set();
  for (const doc of threads.docs) {
    const comments = Array.isArray(doc.data()?.comments) ? doc.data().comments : [];
    report.comments += comments.length;
    const result = await items.mirrorLegacyThread(db, calendarDocId, doc.id, comments, { dryRun: !APPLY });
    report.created += result.created;
    report.existing += result.existing;
    if (result.assetKey) touched.add(result.assetKey);
    if (result.assetKey && !result.assetKey.startsWith('asset:')) report.unresolvedKeys.push(doc.id);
  }
  if (APPLY) {
    // The item trigger recounts too; doing it here as well makes the result final when this ends.
    for (const key of touched) await items.recountAsset(db, admin, calendarDocId, key);
    const live = await root.collection(items.ITEMS).where('deletedAt', '==', null).count().get();
    report.liveItemsAfter = Number(live.data().count) || 0;
  }
  return report;
}

const reports = [];
for (const id of await calendarDocIds()) {
  const report = await migrateCalendar(id);
  if (report.threads) reports.push(report);
  if (report.threads) console.log(JSON.stringify(report));
}
const total = reports.reduce((acc, r) => ({ comments: acc.comments + r.comments, created: acc.created + r.created, existing: acc.existing + r.existing }), { comments: 0, created: 0, existing: 0 });
console.log(`${APPLY ? 'APPLIED' : 'DRY-RUN'}: ${reports.length} calendars, ${total.comments} old comments, ${total.created} ${APPLY ? 'created' : 'to create'}, ${total.existing} already migrated.`);
