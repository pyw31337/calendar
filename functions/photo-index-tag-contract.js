'use strict';

function countTagTokens(value) {
  return Array.from(new Set(String(value || '')
    .split(/[,\s#]+/)
    .map(token => token.trim())
    .filter(Boolean))).length;
}

function editableOwnerRank(owner) {
  const sourceOwner = String(owner?.sourceOwner || '');
  if (sourceOwner.startsWith('message:')) return 0;
  if (sourceOwner.startsWith('memo:')) return 1;
  return 2;
}

// An explicit imageTags/directMediaTags slot is the editable source of truth, including when
// its value is intentionally empty after a user deletes every tag. Richer album copies are a
// migration fallback only when no editable source has ever stored a per-image tag value.
function pickCanonicalPhotoIndexTagState(owners, fallback = '', fallbackSourceOwner = '') {
  const candidates = Array.isArray(owners) ? owners.filter(Boolean) : [];
  const authoritative = candidates
    .filter(owner => owner.tagAuthority === 'editable')
    .sort((a, b) => editableOwnerRank(a) - editableOwnerRank(b)
      || Number(b.timestamp || 0) - Number(a.timestamp || 0))[0];
  if (authoritative) {
    return {
      tags: String(authoritative.tags || ''),
      sourceOwner: String(authoritative.sourceOwner || fallbackSourceOwner || ''),
      authoritative: true
    };
  }

  let best = { tags: String(fallback || ''), sourceOwner: String(fallbackSourceOwner || '') };
  let bestCount = countTagTokens(best.tags);
  candidates.forEach(owner => {
    const tags = String(owner.tags || '');
    const count = countTagTokens(tags);
    if (count > bestCount) {
      best = { tags, sourceOwner: String(owner.sourceOwner || fallbackSourceOwner || '') };
      bestCount = count;
    }
  });
  return { ...best, authoritative: false };
}

module.exports = { countTagTokens, pickCanonicalPhotoIndexTagState };
