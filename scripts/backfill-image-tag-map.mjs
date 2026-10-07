#!/usr/bin/env node
/**
 * Give every message/memo photo its tag by photo, not by position. DRY RUN by default; needs
 * admin credentials, so it runs from the "Deploy Firebase backend" workflow after a backup.
 *
 *   [CALENDARS=cw,kkot] [APPLY=1] node scripts/backfill-image-tag-map.mjs
 *
 * Older records keep tags only in imageTags[], aligned to imageUrls[] by position: delete the
 * first photo and every later tag would shift onto its neighbour. imageTagMap keys the same tag
 * by the photo's asset key, which is what survives deletes and reordering. This fills
 * imageTagMap for each slot that has a positional tag and no map entry yet. A record whose
 * imageTags length differs from imageUrls is reported, never guessed. Tag values are unchanged;
 * each write re-checks the document (updateTime precondition).
 */
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const media = require('./media-commands.js');

const APPLY = process.env.APPLY === '1';
const ONLY = String(process.env.CALENDARS || '').split(',').map(s => s.trim()).filter(Boolean);
initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'metro-live-2918e' });
const db = getFirestore();

async function calendarIds() {
  if (ONLY.length) return ONLY;
  const refs = await db.collection('calendars').listDocuments();
  return refs.map(ref => ref.id).filter(id => /^cal_[A-Za-z0-9_-]{1,64}$/.test(id)).map(id => id.slice(4));
}

function plan(data) {
  const urls = Array.isArray(data.imageUrls) && data.imageUrls.length ? data.imageUrls : (data.imageUrl ? [data.imageUrl] : []);
  const tags = Array.isArray(data.imageTags) ? data.imageTags : [];
  if (!urls.length || !tags.some(tag => String(tag || '').trim())) return null;
  if (tags.length !== urls.length) return { misaligned: true };
  const map = { ...(data.imageTagMap && typeof data.imageTagMap === 'object' && !Array.isArray(data.imageTagMap) ? data.imageTagMap : {}) };
  let added = 0;
  urls.forEach((url, index) => {
    const key = media.getPhotoAssetKey(url);
    const tag = String(tags[index] || '').trim();
    if (!key || !tag || Object.prototype.hasOwnProperty.call(map, key)) return;
    map[key] = tag.slice(0, 640);
    added += 1;
  });
  return added ? { map, added } : null;
}

const reports = [];
for (const calendarId of await calendarIds()) {
  const root = db.collection('calendars').doc(`cal_${calendarId}`);
  const report = { calendarId, documents: 0, slotsKeyed: 0, misaligned: [] };
  for (const collection of ['messages', 'memos']) {
    const snap = await root.collection(collection).get();
    for (const doc of snap.docs) {
      const result = plan(doc.data() || {});
      if (!result) continue;
      if (result.misaligned) { report.misaligned.push(`${collection}/${doc.id}`); continue; }
      report.documents += 1;
      report.slotsKeyed += result.added;
      if (APPLY) await doc.ref.update({ imageTagMap: result.map }, { lastUpdateTime: doc.updateTime });
    }
  }
  reports.push(report);
}
console.log(JSON.stringify({ apply: APPLY, reports: reports.filter(r => r.documents || r.misaligned.length) }, null, 2));
