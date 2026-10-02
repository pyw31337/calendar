#!/usr/bin/env node
/**
 * Put back photos a 보관함 bulk action removed from chat messages and memos. DRY RUN by default.
 *
 *   BACKUP=path/to/calendar-prod-backup-*.json MANIFEST=scripts/data/restore-2026-10-02-bulk-delete.json \
 *     [APPLY=1] node scripts/restore-bulk-deleted-photos.mjs
 *
 * The manifest names each document and the Storage path of every original that was removed; the
 * document content comes from the backup taken before the action (ops:export format).
 *   - Storage: an original/thumb/small that is gone is restored from Cloud Storage soft delete.
 *   - A message the action deleted is recreated exactly as backed up.
 *   - A document that still exists gets only the removed slots back, at their old positions; the
 *     slots it still has keep their current values (tags edited since stay as they are).
 * Before each write the push that write would trigger is claimed (push_delivery_claims, the same
 * key the trigger computes), so a restore never notifies anyone. Needs admin credentials, so it
 * runs from the "Deploy Firebase backend" workflow right after a fresh ops:export backup.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const admin = require('firebase-admin');
const policy = require('./push-notify-policy.js');

const APPLY = process.env.APPLY === '1';
const PROJECT = process.env.GCLOUD_PROJECT || 'metro-live-2918e';
const BUCKET = process.env.STORAGE_BUCKET || `${PROJECT}.firebasestorage.app`;
const backup = JSON.parse(fs.readFileSync(process.env.BACKUP, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(process.env.MANIFEST, 'utf8'));

admin.initializeApp({ projectId: PROJECT, storageBucket: BUCKET });
const db = admin.firestore();
const bucket = admin.storage().bucket();

const SLOT_FIELDS = ['imageUrls', 'thumbUrls', 'imageTags', 'imageFingerprints'];
const pathOf = url => {
  const match = String(url || '').match(/\/o\/([^?]+)/);
  return match ? decodeURIComponent(match[1]) : '';
};
// Every variant of one upload shares the name up to "_original_" / "_thumb_" / "_small".
const stemOf = path => path.replace(/_(original|thumb)_[^/]*$|_small\.[a-z0-9]+$/i, '_');

function backedUpDoc(calendar, collection, docId) {
  const cal = backup.calendars.find(entry => entry.docId === `cal_${calendar}`);
  const raw = cal?.collections?.[collection];
  const list = Array.isArray(raw) ? raw : (raw?.documents || Object.values(raw || {}));
  return list.find(doc => (doc.docId || doc.id) === docId)?.data || null;
}

function slots(data) {
  const urls = Array.isArray(data?.imageUrls) ? data.imageUrls : [];
  const fields = SLOT_FIELDS.filter(field => Array.isArray(data[field]) && data[field].length === urls.length);
  return urls.map((_url, index) => Object.fromEntries(fields.map(field => [field, data[field][index]])));
}

// Old order; a slot still present keeps its current values, a removed one listed in the
// manifest comes back from the backup, anything newer stays at the end.
function mergedFields(current, old, lostPaths) {
  const currentSlots = slots(current);
  const byPath = new Map(currentSlots.map(slot => [pathOf(slot.imageUrls), slot]));
  const used = new Set();
  const next = [];
  for (const slot of slots(old)) {
    const path = pathOf(slot.imageUrls);
    if (byPath.has(path)) { next.push(byPath.get(path)); used.add(path); }
    else if (lostPaths.has(path)) next.push(slot);
  }
  currentSlots.forEach(slot => { if (!used.has(pathOf(slot.imageUrls))) next.push(slot); });
  const fields = {};
  // A field one side never had (memos rarely carry fingerprints) is padded so lengths stay equal.
  const present = SLOT_FIELDS.filter(field => next.some(slot => field in slot));
  present.forEach(field => { fields[field] = next.map(slot => slot[field] ?? ''); });
  if (!fields.imageUrls) return null;
  fields.imageUrl = fields.imageUrls[0] || '';
  if (fields.thumbUrls) fields.thumbUrl = fields.thumbUrls[0] || '';
  const tagMap = { ...(current.imageTagMap || {}) };
  Object.entries(old.imageTagMap || {}).forEach(([key, value]) => { if (!(key in tagMap)) tagMap[key] = value; });
  if (Object.keys(tagMap).length) fields.imageTagMap = tagMap;
  return fields;
}

async function claim(calendarDocId, claimKey) {
  const ref = db.collection('calendars').doc(calendarDocId).collection('push_delivery_claims').doc(claimKey);
  if (!APPLY) return 'would-claim';
  try {
    await ref.create({ createdAt: Date.now(), claimKey, reason: 'restore-bulk-deleted-photos' });
    return 'claimed';
  } catch (err) {
    if (err.code === 6) return 'already-claimed';
    throw err;
  }
}

async function restoreStorage(paths) {
  const result = [];
  for (const stem of [...new Set(paths.map(stemOf))]) {
    const [live] = await bucket.getFiles({ prefix: stem });
    const [deleted] = await bucket.getFiles({ prefix: stem, softDeleted: true });
    const livePaths = new Set(live.map(file => file.name));
    for (const file of deleted) {
      if (livePaths.has(file.name)) continue;
      livePaths.add(file.name);
      if (APPLY) await file.restore({ generation: file.metadata.generation });
      result.push({ path: file.name, restored: APPLY });
    }
    result.push(...live.map(file => ({ path: file.name, alreadyThere: true })));
  }
  return result;
}

const report = [];
for (const entry of manifest.docs) {
  const { calendar, collection, docId } = entry;
  const calendarDocId = `cal_${calendar}`;
  const ref = db.collection('calendars').doc(calendarDocId).collection(collection).doc(docId);
  const old = backedUpDoc(calendar, collection, docId);
  const row = { calendar, collection, docId };
  report.push(row);
  if (!old) { row.skipped = 'not in backup'; continue; }

  row.storage = await restoreStorage(entry.files);
  const available = new Set(row.storage.map(item => item.path));
  const lostPaths = new Set(entry.files.filter(path => available.has(path)));
  row.missingFiles = entry.files.filter(path => !available.has(path));
  if (!lostPaths.size) { row.skipped = 'no file left to point at'; continue; }

  const snap = await ref.get();
  if (!snap.exists) {
    if (collection !== 'messages') { row.skipped = 'memo is gone; not recreating'; continue; }
    const decision = policy.decideChatNotification(old, { messageId: docId });
    if (decision) row.claim = await claim(calendarDocId, decision.claimKey);
    if (APPLY) await ref.create(old);
    row.action = 'recreated';
    row.slots = (old.imageUrls || []).length;
    continue;
  }

  const current = snap.data();
  const fields = mergedFields(current, old, lostPaths);
  if (!fields) {
    row.skipped = 'no slot matched';
    row.debug = { lostPaths: [...lostPaths], oldUrls: (old.imageUrls || []).map(pathOf), currentUrls: (current.imageUrls || []).map(pathOf) };
    continue;
  }
  row.slotsBefore = (current.imageUrls || []).length;
  row.slotsAfter = fields.imageUrls.length;
  if (row.slotsAfter === row.slotsBefore) { row.skipped = 'nothing to put back'; continue; }
  if (collection === 'memos') {
    const decision = policy.decideMemoNotification(current, { ...current, ...fields }, { memoId: docId });
    if (decision) row.claim = await claim(calendarDocId, decision.claimKey);
  }
  if (APPLY) await ref.update({ ...fields, updatedAt: Date.now() }, { lastUpdateTime: snap.updateTime });
  row.action = 'slots-restored';
}

console.log(JSON.stringify({ apply: APPLY, report }, null, 2));
