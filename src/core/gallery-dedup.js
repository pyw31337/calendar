/** Duplicate-photo detection for the gallery/lightbox.
 *
 * Pure logic, no Firebase/React dependency, so it can run against a snapshot of the gallery
 * photo index (see photo-index.js) and be unit tested with plain objects.
 *
 * Why "filename" isn't a literal field: uploaded photos are never stored under their original
 * client filename -- Storage paths are generated (`chatImages/<calId>/<stamp>_<rand>_<index>_
 * original_<sizeBytes>b.<ext>`, see uploadChatImageAssets in app-image-pipeline.js), and the
 * only "filename" a user ever sees is synthesized from the message timestamp + extension
 * (buildLightboxImageInfo in app-chat-render.js: `moyeora_YYYYMMDD_HHMMSS.ext`). So "same
 * filename" as a user would judge it by eye is already equivalent to "same extension + same
 * timestamp (to the second)" -- this module treats it that way, and adds byte size (embedded in
 * every Storage URL, parsed with no extra network request) as the fourth, independent signal
 * the user asked for.
 *
 * A network retry that creates a genuinely duplicate upload does NOT land at the exact same
 * second, though -- the retry takes time. Exact-second matching (true "same filename") is kept
 * as its own bucket for the visually-obvious case; a wider time-proximity + same-uploader
 * grouping catches the retry case too. Both are exposed so a caller (the admin scan UI) can
 * show which kind of match it found.
 */

const EXT_PATTERN = /\.([a-zA-Z0-9]+)(?:[?#]|$)/;
const SIZE_PATTERN = /_(\d+)b\.[a-zA-Z0-9]+(?:[?#]|$)/;

/** Byte size embedded in a Storage upload URL by uploadChatImageAssets/uploadMemoImageAssets/
 * uploadAnniversaryImageAssets, or null if the URL doesn't carry one (e.g. a legacy base64
 * data: URI, or a URL from before this convention existed). */
export function getStorageUrlFileSize(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(SIZE_PATTERN);
  return match ? Number(match[1]) : null;
}

/** Lowercased file extension from a Storage URL's path, or '' if none is found. */
export function getStorageUrlExt(url) {
  if (typeof url !== 'string') return '';
  const withoutQuery = url.split(/[?#]/)[0];
  const match = withoutQuery.match(EXT_PATTERN);
  return match ? match[1].toLowerCase() : '';
}

/** Normalizes one gallery photo-index entry (see photo-index.js) into the fields dedup needs.
 * `photo.full`/`photo.thumb` are the Storage URLs; `photo.timestamp` is the owning message's
 * (or memo's/anniversary's) createdAt in epoch ms. Anything not a real uploaded Storage image
 * (no parseable size) is excluded -- inline base64 photos, still-uploading placeholders, and
 * legacy pre-convention URLs can't be sized without a network request this module never makes,
 * so they are never eligible to be flagged as a duplicate (a missed duplicate is safe; a false
 * one that deletes a real photo is not). */
export function toDedupCandidate(photo) {
  if (!photo || typeof photo !== 'object') return null;
  const url = String(photo.full || photo.url || photo.imageUrl || '');
  const sizeBytes = getStorageUrlFileSize(url) ?? getStorageUrlFileSize(String(photo.thumb || photo.thumbUrl || ''));
  if (!url || sizeBytes == null) return null;
  const ext = getStorageUrlExt(url) || getStorageUrlExt(String(photo.thumb || photo.thumbUrl || ''));
  const timestamp = Number(photo.timestamp ?? photo.createdAt ?? photo.updatedAt ?? NaN);
  if (!Number.isFinite(timestamp)) return null;
  return {
    photo,
    url,
    sizeBytes,
    ext,
    timestamp,
    participantId: photo.participantId || photo.senderId || photo.authorId || '',
    tags: String(photo.tags || '').trim(),
    commentCount: Number.isFinite(Number(photo.commentCount)) ? Number(photo.commentCount) : 0
  };
}

/** Groups candidates that look like the same upload. Two tiers, from strictest to loosest:
 * - "exact": identical ext + size + same second -- what a user comparing filenames would see
 *   as literally the same name (the same case ui-lightbox.js's synthesized filename produces).
 * - "retry": identical ext + size + same uploader, within `windowMs` of each other (default 15
 *   minutes) -- covers a resend/retry that re-compressed the same source file into a
 *   byte-identical asset moments to minutes later.
 * Every candidate appears in at most one group; "exact" matches are never also reported as a
 * separate "retry" group. Groups of size 1 (no actual duplicate) are dropped. */
export function findDuplicatePhotoGroups(photos, options = {}) {
  const windowMs = Number.isFinite(options.windowMs) ? options.windowMs : 15 * 60 * 1000;
  const candidates = (Array.isArray(photos) ? photos : [])
    .map(toDedupCandidate)
    .filter(Boolean);

  const exactKey = c => `${c.ext}::${c.sizeBytes}::${Math.floor(c.timestamp / 1000)}`;
  const exactGroupsByKey = new Map();
  candidates.forEach(c => {
    const key = exactKey(c);
    if (!exactGroupsByKey.has(key)) exactGroupsByKey.set(key, []);
    exactGroupsByKey.get(key).push(c);
  });

  const exactGroups = [];
  const claimed = new Set();
  exactGroupsByKey.forEach(group => {
    if (group.length < 2) return;
    exactGroups.push({ kind: 'exact', candidates: group });
    group.forEach(c => claimed.add(c));
  });

  // Retry tier: same ext+size+uploader, sorted by time, greedily chained so a run of near-in-time
  // duplicates (e.g. three retries of the same failed send) becomes one group instead of a chain
  // of overlapping pairs.
  const remaining = candidates.filter(c => !claimed.has(c));
  const bySignature = new Map();
  remaining.forEach(c => {
    const key = `${c.ext}::${c.sizeBytes}::${c.participantId}`;
    if (!bySignature.has(key)) bySignature.set(key, []);
    bySignature.get(key).push(c);
  });
  const retryGroups = [];
  bySignature.forEach(group => {
    if (group.length < 2) return;
    const sorted = [...group].sort((a, b) => a.timestamp - b.timestamp);
    let chain = [sorted[0]];
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].timestamp - chain[chain.length - 1].timestamp <= windowMs) {
        chain.push(sorted[i]);
      } else {
        if (chain.length > 1) retryGroups.push({ kind: 'retry', candidates: chain });
        chain = [sorted[i]];
      }
    }
    if (chain.length > 1) retryGroups.push({ kind: 'retry', candidates: chain });
  });

  return [...exactGroups, ...retryGroups];
}

/** Picks which candidate in a duplicate group to keep. Preference order: has tags > more
 * comments > earliest upload (the original, not the retry). Everything else in the group is
 * the "losers" to merge into the winner and then remove. Ties are broken by earliest timestamp
 * so the result is deterministic. */
export function chooseDedupWinner(group) {
  const candidates = Array.isArray(group?.candidates) ? group.candidates : Array.isArray(group) ? group : [];
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => {
    const aHasTags = a.tags ? 1 : 0;
    const bHasTags = b.tags ? 1 : 0;
    if (aHasTags !== bHasTags) return bHasTags - aHasTags;
    if (a.commentCount !== b.commentCount) return b.commentCount - a.commentCount;
    return a.timestamp - b.timestamp;
  });
  const [winner, ...losers] = sorted;
  // A loser's own tags/comment count may still be non-empty (both sides had data) -- the winner
  // only won on a stronger signal (e.g. more comments), not necessarily because the loser had
  // nothing. Callers must still merge the loser's tags/comments into the winner before deleting
  // it, never assume the loser is empty.
  return { winner, losers };
}
