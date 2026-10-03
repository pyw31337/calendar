import { canonicalPhotoAssetKey } from './photo-asset.js';

export const BULK_TAG_CHUNK_SIZE = 80;
export const MAX_BULK_PHOTO_TAGS = 20;

export function normalizePhotoTagTokens(value) {
  const seen = new Set();
  return String(value || '').split(/[\s,#]+/)
    .map(token => token.trim().replace(/^#+/, '').slice(0, 30))
    .filter(token => token && !seen.has(token) && (seen.add(token) || true))
    .slice(0, MAX_BULK_PHOTO_TAGS);
}

export function joinPhotoTagTokens(tokens) {
  return normalizePhotoTagTokens(Array.isArray(tokens) ? tokens.join(' ') : tokens).join(' ');
}

export function applyPhotoTagOperation(currentTags, operation, tagText) {
  const current = normalizePhotoTagTokens(currentTags);
  const targets = normalizePhotoTagTokens(tagText);
  if (!targets.length) return { tags: current.join(' '), changed: false, reason: 'empty' };
  const targetSet = new Set(targets);
  const next = operation === 'remove'
    ? current.filter(tag => !targetSet.has(tag))
    : normalizePhotoTagTokens([...current, ...targets].join(' '));
  const tags = next.join(' ');
  return { tags, changed: tags !== current.join(' '), reason: next.length >= MAX_BULK_PHOTO_TAGS && operation !== 'remove' ? 'limit' : '' };
}

export function buildBulkPhotoTagChanges(photos, operation, tagText) {
  const seen = new Set();
  const changes = [];
  (Array.isArray(photos) ? photos : []).forEach(photo => {
    const assetKey = String(photo?.assetKey || photo?.mediaKey || photo?.refKey || canonicalPhotoAssetKey(photo || {}));
    if (!assetKey || seen.has(assetKey)) return;
    seen.add(assetKey);
    const result = applyPhotoTagOperation(photo?.tags || '', operation, tagText);
    if (!result.changed) return;
    changes.push({
      photo,
      assetKey,
      beforeTags: joinPhotoTagTokens(photo?.tags || ''),
      tags: result.tags,
    });
  });
  return changes;
}

function toCommandItem(change) {
  const photo = change?.photo || change || {};
  return {
    imageUrl: String(photo.full || photo.imageUrl || photo.url || photo.directMediaUrl || photo.thumb || photo.thumbUrl || ''),
    thumbUrl: String(photo.thumb || photo.thumbUrl || photo.full || photo.imageUrl || ''),
    messageId: String(photo.messageId || photo.sourceMessageId || ''),
    memoId: String(photo.memoId || (photo.source === 'memo' ? photo.messageId || '' : '')),
    directMediaUrl: String(photo.directMediaUrl || ''),
    tags: joinPhotoTagTokens(change?.tags ?? photo.tags),
  };
}

// mediaCommand runs next to Firestore in Seoul (the us-central1 copy is gone).
const MEDIA_COMMAND_REGIONS = ['asia-northeast3'];
async function postMediaCommand(fetchImpl, projectId, body) {
  let error = null;
  for (const region of MEDIA_COMMAND_REGIONS) {
    try {
      const response = await fetchImpl(`https://${region}-${encodeURIComponent(projectId)}.cloudfunctions.net/mediaCommand`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (response.status !== 404 && response.status < 500) return response;
      error = new Error(response.status);
    } catch (e) { error = e; }
  }
  throw error;
}

// 보관함 추천 "중복 사진 정리": the server checks the copies are the same bytes, then points
// every place showing a copy at the kept file, merges tags and moves comments. Nothing is
// deleted. Returns the server's report ({ merged, notIdentical, ... }).
export async function mergeDuplicatePhotosRemote({ calendarId, projectId, keep, extras, tags, fetchImpl = fetch } = {}) {
  const ref = photo => {
    const item = toCommandItem(photo);
    return { imageUrl: item.imageUrl, thumbUrl: item.thumbUrl, messageId: item.messageId, memoId: item.memoId };
  };
  const list = (Array.isArray(extras) ? extras : []).map(ref);
  if (!calendarId || !projectId || !keep || !list.length) return { ok: false, reason: 'invalid' };
  const response = await postMediaCommand(fetchImpl, projectId, {
    calendarId, op: 'mergeAssets', asset: ref(keep), extras: list, tags: joinPhotoTagTokens(tags),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) throw new Error(payload?.reason || `merge failed (${response.status})`);
  return payload;
}

export async function saveBulkPhotoTagsRemote({ calendarId, projectId, changes, fetchImpl = fetch } = {}) {
  const list = (Array.isArray(changes) ? changes : []).map(toCommandItem)
    .filter(item => /^https?:\/\//i.test(item.imageUrl || item.thumbUrl));
  if (!calendarId || !projectId || !list.length) return { ok: false, changed: 0, results: [], reason: 'invalid' };
  const results = [];
  for (let offset = 0; offset < list.length; offset += BULK_TAG_CHUNK_SIZE) {
    const items = list.slice(offset, offset + BULK_TAG_CHUNK_SIZE);
    const response = await postMediaCommand(fetchImpl, projectId, { calendarId, op: 'bulkTagAssets', items });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.message || `사진 태그 일괄 저장 실패 (${response.status})`);
    }
    results.push(payload);
  }
  return {
    ok: true,
    changed: list.length,
    results,
    sourceDocumentsTouched: results.reduce((count, result) => count + (Number(result.sourceDocumentsTouched) || 0), 0),
  };
}
