'use strict';
// A photo removed from every record leaves a small note behind: which stored file held it,
// keyed by the sha256 fingerprint of the file the person picked
// (calendars/{cal}/photoTombstones/{hex}). Originals are never deleted (media-commands.js), so
// when the same photo is picked again the app points the new record at that file instead of
// storing a second copy (src/core/app-image-pipeline.js, lookupTombstonedOriginals). The
// thumbnail stays too: sweepStorageGc counts the files named here as still in use.
//
// The note is written by the photoIndex triggers only (functions/index.js); clients may read it
// and never write it (firestore.rules).

const COLLECTION = 'photoTombstones';
const SHA256_FINGERPRINT = /^sha256:([0-9a-f]{64})$/;

function fingerprintId(value) {
  const match = String(value || '').trim().match(SHA256_FINGERPRINT);
  return match ? match[1] : '';
}

// Slot `index`'s fingerprint, only when the record's fingerprint list lines up with its photos.
// A legacy record whose list lost a slot would otherwise name a neighbour's file.
function alignedFingerprint(fingerprints, urls, index) {
  if (!Array.isArray(fingerprints) || !Array.isArray(urls) || !urls.length || fingerprints.length !== urls.length) return '';
  return fingerprintId(fingerprints[index]) ? String(fingerprints[index]).trim() : '';
}

// The fingerprint a photoIndex row keeps for its file: any owner's, else the row's own (an owner
// such as a meeting album copy carries none, so the row remembers it from the source record).
function rowFingerprint(owners, existing) {
  const found = [...(Array.isArray(owners) ? owners : []).map(owner => owner?.fingerprint), existing?.fingerprint]
    .find(value => fingerprintId(value));
  return found ? String(found).trim() : '';
}

// existing: the photoIndex row before its last owner went. removed: that owner's entry, from the
// event's before-data (a row written before rows kept fingerprints has none of its own).
function tombstoneFor({ assetKey, existing, removed, now = Date.now() }) {
  const row = existing && typeof existing === 'object' ? existing : {};
  const id = fingerprintId(rowFingerprint(row.owners, row)) || fingerprintId(removed?.fingerprint);
  const imageUrl = String(row.full || removed?.full || '').trim();
  if (!id || !/^https:\/\//.test(imageUrl)) return null;
  const thumbUrl = String(row.thumb || removed?.thumb || '').trim();
  return {
    id,
    data: {
      fingerprint: `sha256:${id}`,
      imageUrl,
      thumbUrl: /^https:\/\//.test(thumbUrl) ? thumbUrl : imageUrl,
      assetKey: String(assetKey || row.assetKey || ''),
      deletedAt: now,
    },
  };
}

module.exports = { COLLECTION, fingerprintId, alignedFingerprint, rowFingerprint, tombstoneFor };
