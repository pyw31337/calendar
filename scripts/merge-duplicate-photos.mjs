#!/usr/bin/env node
/**
 * Merge photos that were uploaded twice (byte-identical Storage files) into one photo. DRY RUN by
 * default; needs admin credentials, so it runs from the "Deploy Firebase backend" workflow after
 * an ops:export backup.
 *
 *   [CALENDARS=cw,kkot] [APPLY=1] node scripts/merge-duplicate-photos.mjs
 *
 * Duplicates are found by the md5 Storage keeps for every object (same md5 = same bytes), per
 * calendar. In each group one copy is kept as the photo (most comments, then most tags, then
 * the oldest) and every other copy is pointed at it:
 *   - message/memo slots that showed the extra file now show the kept file, so the gallery and
 *     보관함 (one row per file) list the photo once; chat and memo history stay as they were;
 *   - meeting album entries of the extra file move to the kept file;
 *   - tags of all copies are merged onto the photo, comments move to it.
 * Nothing is deleted: no message, memo, comment or Storage file. Like documents are reported.
 * Each document write is a transaction that re-checks the slot still shows the extra file.
 * A memo write claims the push it would trigger, so nobody is notified.
 */
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const admin = require('firebase-admin');
const media = require('./media-commands.js');
const policy = require('./push-notify-policy.js');

const APPLY = process.env.APPLY === '1';
const ONLY = String(process.env.CALENDARS || '').split(',').map(s => s.trim()).filter(Boolean);
const PROJECT = process.env.GCLOUD_PROJECT || 'metro-live-2918e';
admin.initializeApp({ projectId: PROJECT, storageBucket: process.env.STORAGE_BUCKET || `${PROJECT}.firebasestorage.app` });
const db = admin.firestore();
const bucket = admin.storage().bucket();

const pathOf = media.storagePathFromUrl;
const tokens = text => String(text || '').split(/\s+/).map(t => t.trim()).filter(Boolean);
function mergeTags(...values) {
  const seen = new Set();
  const out = [];
  values.forEach(value => tokens(value).forEach(token => { if (!seen.has(token)) { seen.add(token); out.push(token); } }));
  return out.join(' ').slice(0, 640);
}

async function md5Of(url) {
  const path = pathOf(url);
  if (!path) return '';
  try { return (await bucket.file(path).getMetadata())[0]?.md5Hash || ''; } catch (_) { return ''; }
}

async function calendarIds() {
  if (ONLY.length) return ONLY;
  const refs = await db.collection('calendars').listDocuments();
  return refs.map(ref => ref.id).filter(id => /^cal_[A-Za-z0-9_-]{1,64}$/.test(id)).map(id => id.slice(4));
}

// Point the slot of `doc` that shows `fromPath` at the kept file, inside a transaction.
async function repointSlot(ref, fromPath, keep, tags, collection, calendarDocId) {
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return 'missing';
    const data = snap.data() || {};
    const urls = Array.isArray(data.imageUrls) && data.imageUrls.length ? data.imageUrls.slice() : (data.imageUrl ? [data.imageUrl] : []);
    const thumbs = Array.isArray(data.thumbUrls) && data.thumbUrls.length ? data.thumbUrls.slice() : (data.thumbUrl ? [data.thumbUrl] : []);
    const slot = urls.findIndex(url => pathOf(url) === fromPath);
    if (slot < 0) return 'slot-gone';
    const imageTags = Array.isArray(data.imageTags) ? data.imageTags.slice() : [];
    while (imageTags.length < urls.length) imageTags.push('');
    while (thumbs.length < urls.length) thumbs.push('');
    urls[slot] = keep.full;
    thumbs[slot] = keep.thumb || keep.full;
    imageTags[slot] = tags;
    const tagMap = { ...(data.imageTagMap && typeof data.imageTagMap === 'object' && !Array.isArray(data.imageTagMap) ? data.imageTagMap : {}) };
    delete tagMap[keep.dropKey];
    tagMap[keep.key] = tags;
    const patch = { imageUrls: urls, thumbUrls: thumbs, imageTags, imageTagMap: tagMap, updatedAt: Date.now() };
    if (slot === 0) { patch.imageUrl = urls[0]; patch.thumbUrl = thumbs[0]; }
    if (collection === 'memos') {
      const decision = policy.decideMemoNotification(data, { ...data, ...patch }, { memoId: ref.id });
      if (decision && APPLY) {
        const claim = db.collection('calendars').doc(calendarDocId).collection('push_delivery_claims').doc(decision.claimKey);
        const claimSnap = await tx.get(claim);
        if (!claimSnap.exists) tx.set(claim, { createdAt: Date.now(), claimKey: decision.claimKey, reason: 'merge-duplicate-photos' });
      }
    }
    if (APPLY) tx.update(ref, patch);
    return 'repointed';
  });
}

async function mergeCalendar(calendarId) {
  const calendarDocId = `cal_${calendarId}`;
  const root = db.collection('calendars').doc(calendarDocId);
  const [indexSnap, commentSnap, likeSnap] = await Promise.all([
    root.collection('photoIndex').get(),
    root.collection('photoCommentItems').get(),
    root.collection('likes').get(),
  ]);
  const commentsByKey = new Map();
  commentSnap.docs.forEach(doc => {
    const data = doc.data() || {};
    if (data.deletedAt != null) return;
    if (!commentsByKey.has(data.assetKey)) commentsByKey.set(data.assetKey, []);
    commentsByKey.get(data.assetKey).push(doc);
  });
  const rows = indexSnap.docs
    .map(doc => ({ id: doc.id, ...(doc.data() || {}) }))
    .filter(row => !row.mergedInto && pathOf(row.full));
  for (let i = 0; i < rows.length; i += 25) {
    await Promise.all(rows.slice(i, i + 25).map(async row => { row.md5 = await md5Of(row.full); }));
  }
  const groups = new Map();
  rows.filter(row => row.md5).forEach(row => {
    if (!groups.has(row.md5)) groups.set(row.md5, []);
    groups.get(row.md5).push(row);
  });
  const report = { calendarId, photos: rows.length, groups: 0, copiesMerged: 0, slotsRepointed: 0, albumEntriesMoved: 0, commentsMoved: 0, likesOnMergedCopies: 0, skipped: [], samples: [] };
  const meetings = (await root.collection('confirmedMeetings').get()).docs;

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    report.groups += 1;
    const ranked = group.slice().sort((a, b) =>
      (commentsByKey.get(b.id)?.length || 0) - (commentsByKey.get(a.id)?.length || 0)
      || tokens(b.tags).length - tokens(a.tags).length
      || Number(a.timestamp || a.createdAt || 0) - Number(b.timestamp || b.createdAt || 0));
    const kept = ranked[0];
    const extras = ranked.slice(1);
    const tags = mergeTags(kept.tags, ...extras.map(row => row.tags));
    const keep = { full: kept.full, thumb: kept.thumb || kept.full, key: kept.id };
    if (report.samples.length < 8) report.samples.push({ kept: kept.id, extras: extras.map(row => row.id), tags });

    for (const extra of extras) {
      const fromPath = pathOf(extra.full);
      keep.dropKey = extra.id;
      const owners = (Array.isArray(extra.owners) ? extra.owners : []).map(owner => String(owner?.sourceOwner || ''));
      for (const owner of owners) {
        const match = owner.match(/^(message|memo):(.+):\d+$/);
        if (!match) continue;
        const collection = match[1] === 'message' ? 'messages' : 'memos';
        const result = await repointSlot(root.collection(collection).doc(match[2]), fromPath, keep, tags, collection, calendarDocId);
        if (result === 'repointed') report.slotsRepointed += 1;
        else report.skipped.push(`${owner}: ${result}`);
      }
      for (const meetingDoc of meetings) {
        await db.runTransaction(async tx => {
          const snap = await tx.get(meetingDoc.ref);
          const photos = Array.isArray(snap.data()?.photos) ? snap.data().photos : [];
          let moved = 0;
          const next = photos.map(photo => {
            if (pathOf(photo?.imageUrl || photo?.full || photo?.url) !== fromPath) return photo;
            moved += 1;
            const patched = { ...photo, imageUrl: keep.full, thumbUrl: keep.thumb, tags, updatedAt: Date.now() };
            if ('full' in photo) patched.full = keep.full;
            if ('url' in photo) patched.url = keep.full;
            if ('thumb' in photo) patched.thumb = keep.thumb;
            return patched;
          });
          if (!moved) return;
          report.albumEntriesMoved += moved;
          if (APPLY) tx.update(meetingDoc.ref, { photos: next, updatedAt: Date.now() });
        });
      }
      for (const comment of commentsByKey.get(extra.id) || []) {
        report.commentsMoved += 1;
        if (APPLY) await comment.ref.update({ assetKey: kept.id, mergedFrom: extra.id });
      }
      report.likesOnMergedCopies += likeSnap.docs.filter(doc => doc.data()?.kind === 'photo' && doc.data()?.ref === extra.id).length;
      report.copiesMerged += 1;
    }
    // Every place the kept photo already appears gets the merged tags too.
    if (APPLY) await media.tagAsset({ db, calendarDocId, asset: { imageUrl: kept.full, thumbUrl: keep.thumb }, tags });
  }
  return report;
}

const reports = [];
for (const id of await calendarIds()) reports.push(await mergeCalendar(id));
console.log(JSON.stringify({ apply: APPLY, reports }, null, 2));
