'use strict';
/**
 * Photo comments v2: one Firestore document per comment.
 *
 *   calendars/cal_{id}/photoCommentItems/{commentId}
 *     { id, assetKey, participantId, text, createdAt, updatedAt, deletedAt: null|number,
 *       legacyKey?, migratedFrom? }
 *   calendars/cal_{id}/photoCommentSummary/counts
 *     { counts: { [assetKey]: number }, updatedAt }   <- one small doc the app listens to
 *
 * Why: the old model stored a photo's whole thread as one array in photoComments/{key}. Every
 * save rewrote the full array from whatever the device had in memory, and the key depended on
 * where the lightbox was opened, so threads filed under a legacy key were counted on the
 * thumbnail but never shown in the lightbox. Here a comment is created once, edited in place,
 * and only ever soft-deleted (deletedAt); nothing rewrites another person's comment.
 *
 * This module is shared by the Cloud Functions triggers (index.js) and the one-time migration
 * (scripts/migrate-photo-comment-items.mjs). The old photoComments collection is kept, untouched,
 * as the read-only record of the old threads.
 */

const ITEMS = 'photoCommentItems';
const SUMMARY = 'photoCommentSummary';
const SUMMARY_DOC = 'counts';
const COMMENT_ID_RE = /^[A-Za-z0-9_-]{1,120}$/;

function fnv1a(value) {
  let hash = 0x811c9dc5;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** The item id for a comment from an old thread: its own id when usable, else a stable hash. */
function itemIdForLegacyComment(comment, legacyDocId) {
  const own = String(comment?.id || '');
  if (COMMENT_ID_RE.test(own)) return own;
  return `cmt_m_${fnv1a(`${legacyDocId}|${comment?.createdAt || ''}|${comment?.participantId || ''}|${comment?.text || ''}`)}`;
}

function cleanText(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

/** Item document for one comment of an old thread. Never carries anything the old one lacked. */
function buildItemFromLegacy(comment, { assetKey, legacyDocId }) {
  const createdAt = Number(comment?.createdAt) || Date.now();
  const item = {
    id: itemIdForLegacyComment(comment, legacyDocId),
    assetKey,
    participantId: cleanText(comment?.participantId, 120),
    text: cleanText(comment?.text, 2000),
    createdAt,
    updatedAt: Number(comment?.updatedAt) || createdAt,
    deletedAt: null,
    migratedFrom: 'photoComments'
  };
  if (legacyDocId && legacyDocId !== assetKey) item.legacyKey = legacyDocId;
  return item;
}

/**
 * Which photo an old thread belongs to. Asset keys are already canonical. A legacy key
 * (chat:<messageId>:<index>, meeting:…, anniversary:…) belongs to the photo whose photoIndex row
 * lists it in legacyKeys -- only when exactly one photo claims it. Otherwise the key itself is
 * kept, so the thread still exists and the integrity report can show it.
 */
async function resolveAssetKeyForLegacyDoc(root, docId) {
  if (docId.startsWith('asset:')) return docId;
  const index = root.collection('photoIndex');
  const exact = await index.doc(docId).get();
  if (exact.exists) return docId;
  const claims = await index.where('legacyKeys', 'array-contains', docId).limit(3).get();
  const ids = Array.from(new Set(claims.docs.map(doc => doc.id)));
  return ids.length === 1 ? ids[0] : docId;
}

/**
 * Copy the comments of one old thread into items. Create-only: an item that already exists
 * (migrated before, or written by the new app) is left exactly as it is, so a stale old-app
 * array can never undo an edit or a delete made in the new app.
 */
async function mirrorLegacyThread(db, calendarDocId, docId, comments, { dryRun = false } = {}) {
  const list = Array.isArray(comments) ? comments.filter(c => c && typeof c === 'object' && String(c.text || '').trim()) : [];
  if (!list.length) return { created: 0, existing: 0, assetKey: '' };
  const root = db.collection('calendars').doc(calendarDocId);
  const assetKey = await resolveAssetKeyForLegacyDoc(root, docId);
  const items = list.map(comment => buildItemFromLegacy(comment, { assetKey, legacyDocId: docId }));
  const refs = items.map(item => root.collection(ITEMS).doc(item.id));
  const snaps = await db.getAll(...refs);
  const missing = items.filter((_, index) => !snaps[index].exists);
  if (!dryRun && missing.length) {
    const batch = db.batch();
    missing.forEach(item => batch.create(root.collection(ITEMS).doc(item.id), item));
    await batch.commit();
  }
  return { created: missing.length, existing: items.length - missing.length, assetKey };
}

/**
 * Recount one photo's live comments and publish the number to the summary doc (what every
 * thumbnail badge reads) and to the photo's photoIndex row(s).
 */
async function recountAsset(db, admin, calendarDocId, assetKey) {
  if (!assetKey) return 0;
  const root = db.collection('calendars').doc(calendarDocId);
  const agg = await root.collection(ITEMS)
    .where('assetKey', '==', assetKey)
    .where('deletedAt', '==', null)
    .count()
    .get();
  const count = Number(agg.data().count) || 0;
  const now = Date.now();
  const FieldValue = admin.firestore.FieldValue;
  await root.collection(SUMMARY).doc(SUMMARY_DOC).set({
    counts: { [assetKey]: count > 0 ? count : FieldValue.delete() },
    updatedAt: now
  }, { merge: true });
  const index = root.collection('photoIndex');
  const batch = db.batch();
  let writes = 0;
  const canonical = await index.doc(assetKey).get();
  if (canonical.exists) {
    batch.set(canonical.ref, { commentCount: count, updatedAt: now }, { merge: true });
    writes += 1;
  }
  // A thread still filed under a legacy key (no single owning photo) also shows on any row
  // that lists that key.
  if (!assetKey.startsWith('asset:')) {
    const aliases = await index.where('legacyKeys', 'array-contains', assetKey).limit(50).get();
    aliases.forEach(doc => {
      if (doc.id === assetKey) return;
      batch.set(doc.ref, { commentCount: count, updatedAt: now }, { merge: true });
      writes += 1;
    });
  }
  if (writes) await batch.commit();
  return count;
}

/** Which photos' counts a change to one item can affect (none for a plain text edit). */
function assetKeysToRecount(before, after) {
  const b = before || null;
  const a = after || null;
  if (b && a && b.assetKey === a.assetKey && (b.deletedAt == null) === (a.deletedAt == null)) return [];
  return Array.from(new Set([b?.assetKey, a?.assetKey].filter(Boolean)));
}

module.exports = {
  ITEMS,
  SUMMARY,
  SUMMARY_DOC,
  fnv1a,
  itemIdForLegacyComment,
  buildItemFromLegacy,
  resolveAssetKeyForLegacyDoc,
  mirrorLegacyThread,
  recountAsset,
  assetKeysToRecount
};
