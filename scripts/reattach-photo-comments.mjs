#!/usr/bin/env node
/**
 * Re-attach photo comments that are filed under a key no photo has (an old album key naming a
 * message, or an album entry that was removed) to the photo they were written on. DRY RUN by
 * default; needs admin credentials, so it runs from the "Deploy Firebase backend" workflow after
 * an ops:export backup.
 *
 *   MANIFEST=scripts/reattach-photo-comments.json [APPLY=1] node scripts/reattach-photo-comments.mjs
 *
 * Each move names the comment, the key it has now and the photo (photoIndex asset key) it goes
 * to. Only assetKey changes; the text, author and times stay. A comment whose key is no longer
 * the expected one, or a target with no photoIndex row, is left alone and reported. The
 * onPhotoCommentItemWrite trigger recounts both keys; an update sends no push.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const admin = require('firebase-admin');

const APPLY = process.env.APPLY === '1';
const manifest = JSON.parse(fs.readFileSync(process.env.MANIFEST || 'scripts/reattach-photo-comments.json', 'utf8'));
admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'metro-live-2918e' });
const root = admin.firestore().collection('calendars').doc(`cal_${manifest.calendar}`);

const report = [];
for (const move of manifest.moves) {
  const ref = root.collection('photoCommentItems').doc(move.commentId);
  const [snap, target] = await Promise.all([ref.get(), root.collection('photoIndex').doc(move.to).get()]);
  const row = { commentId: move.commentId, to: move.to };
  report.push(row);
  if (!snap.exists) { row.skipped = 'comment not found'; continue; }
  if (snap.data().assetKey === move.to) { row.skipped = 'already attached'; continue; }
  if (snap.data().assetKey !== move.from) { row.skipped = `key changed to ${snap.data().assetKey}`; continue; }
  if (!target.exists) { row.skipped = 'target photo has no photoIndex row'; continue; }
  row.text = String(snap.data().text || '').slice(0, 40);
  if (APPLY) await ref.update({ assetKey: move.to, reattachedFrom: move.from }, { lastUpdateTime: snap.updateTime });
  row.action = APPLY ? 'reattached' : 'would reattach';
}
console.log(JSON.stringify({ apply: APPLY, report }, null, 2));
