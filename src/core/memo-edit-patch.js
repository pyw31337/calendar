/**
 * Memo edit patches: only the fields the editor actually changes.
 * Never include `comments` — those are owned by concurrent comment writers
 * (see memo-comments.js). A full-document set from a stale editor snapshot would wipe them.
 */

const MEMO_EDIT_FIELDS = [
  'participantId',
  'title',
  'text',
  'imageUrls',
  'thumbUrls',
  'imageFingerprints',
  'imageIntake',
  'imageUrl',
  'thumbUrl',
  'imageTags',
  'imageTagMap',
  'color',
  'isPinned',
  'tags',
  'createdAt',
  'updatedAt',
  'linkPreview',
  'linkPreviews',
  'fileAttachments',
];

/** Build an update-only patch from editor state. Strips comments/id and unknown keys. */
export function buildMemoEditPatch(fields = {}) {
  const patch = {};
  for (const key of MEMO_EDIT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
      patch[key] = fields[key];
    }
  }
  return patch;
}

/** Image-slot-only patch for undo of a memo photo delete (never rewrite comments). */
export function buildMemoImageRestorePatch(memoSnapshot = {}) {
  return buildMemoEditPatch({
    imageUrls: memoSnapshot.imageUrls,
    thumbUrls: memoSnapshot.thumbUrls,
    imageFingerprints: memoSnapshot.imageFingerprints,
    imageIntake: memoSnapshot.imageIntake,
    imageUrl: memoSnapshot.imageUrl,
    thumbUrl: memoSnapshot.thumbUrl,
    imageTags: memoSnapshot.imageTags,
    imageTagMap: memoSnapshot.imageTagMap,
    updatedAt: memoSnapshot.updatedAt,
  });
}

export { MEMO_EDIT_FIELDS };
