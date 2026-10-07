/* Replay helpers for media messages kept in the durable write queue. Firebase-specific work is
 * injected by app-main so this module remains small and independently testable. */

import { buildMetadataTags, todayUploadTagOptions } from './photo-metadata-tags.js';
import { storedPhotoPayload } from './upload-intake.js';

export async function replayQueuedMediaMessage(operation, { resolveImages, chunkImages, writeMessage } = {}) {
  const payload = operation?.payload;
  if (!payload || typeof resolveImages !== 'function' || typeof chunkImages !== 'function' || typeof writeMessage !== 'function') return false;
  const compressed = (Array.isArray(payload.images) ? payload.images : []).map(image => ({
    original: '',
    thumbnail: '',
    originalBlob: image.originalBlob,
    thumbnailBlob: image.thumbnailBlob,
    smallThumbBlob: image.smallThumbBlob || null,
    metadata: image.metadata || null,
    // Kept through the queue so the replay still reuses an already stored original.
    fingerprint: image.fingerprint || '',
    fingerprintStrength: image.fingerprintStrength || '',
    intakeSource: image.intakeSource || '',
    intakeClient: image.intakeClient || '',
    intakeName: image.intakeName || '',
    intakeMime: image.intakeMime || '',
    variantProfile: payload.variantProfile || (payload.uploadSource && payload.uploadSource !== 'chat' ? 'grid' : 'chat')
  }));
  if (compressed.length === 0) return false;
  const chunks = chunkImages(await resolveImages(operation.calendarId, compressed, null, {
    profile: payload.variantProfile || (payload.uploadSource && payload.uploadSource !== 'chat' ? 'grid' : 'chat'),
    // Queued chat photos must land in Storage too. A data URL is not a successful send.
    requireStorage: true
  }));
  const tagOptions = todayUploadTagOptions(new Date(Number(payload.timestamp) || Date.now()));
  for (let i = 0; i < chunks.length; i += 1) {
    const images = chunks[i];
    const message = storedPhotoPayload({
      participantId: payload.participantId || '',
      text: i === 0 ? (payload.text || '') : '',
      imageUrl: images[0].imageUrl,
      thumbUrl: images[0].thumbUrl,
      imageUrls: images.map(image => image.imageUrl),
      thumbUrls: images.map(image => image.thumbUrl),
      imageTags: images.map(image => buildMetadataTags(image.metadata, tagOptions)),
      imageFingerprints: images.map(image => image.fingerprint || ''),
      timestamp: (Number(payload.timestamp) || Date.now()) + i,
      ...(payload.uploadSource ? { uploadSource: payload.uploadSource } : {}),
      ...(i === 0 && payload.replyTo ? { replyTo: payload.replyTo } : {})
    }, images);
    if (!message) return false;
    const result = await writeMessage(operation.calendarId, message, `${operation.id}_${i}`);
    if (!result?.success) return false;
  }
  return true;
}

export async function replayQueuedMemoSave(operation, { resolveImages, writeMemo } = {}) {
  const payload = operation?.payload;
  if (!payload?.memoData || !Array.isArray(payload.images) || typeof resolveImages !== 'function' || typeof writeMemo !== 'function') return false;
  const pending = payload.images.filter(image => !image.isExisting);
  const resolved = pending.length > 0
    ? await resolveImages(operation.calendarId, pending.map(image => ({ original: '', thumbnail: '', originalBlob: image.originalBlob, thumbnailBlob: image.thumbnailBlob, smallThumbBlob: image.smallThumbBlob || null, fingerprint: image.fingerprint || '', fingerprintStrength: image.fingerprintStrength || '' })))
    : [];
  let next = 0;
  // One entry per photo so urls, thumbs and fingerprints stay aligned slot by slot.
  const slots = payload.images.map(image => {
    if (image.isExisting) return { url: image.original, thumb: image.thumbnail || image.original, fingerprint: image.fingerprint || '', intake: null };
    const item = resolved[next++];
    if (!item || typeof item.imageUrl !== 'string' || !item.imageUrl.startsWith('https://')) return null;
    return { url: item.imageUrl, thumb: item.thumbUrl || item.imageUrl, fingerprint: item.fingerprint || '', intake: item.intake || null };
  });
  if (slots.some(slot => !slot || !slot.url || !String(slot.url).startsWith('https://'))) return false;
  const imageUrls = slots.map(slot => slot.url);
  const thumbUrls = slots.map(slot => slot.thumb);
  // Never replay comments from a queued snapshot — those belong to concurrent writers.
  const { comments: _dropComments, id: _dropId, ...memoFields } = payload.memoData || {};
  const result = await writeMemo(operation.calendarId, payload.memoId, {
    ...memoFields,
    imageUrls,
    thumbUrls,
    imageFingerprints: slots.map(slot => slot.fingerprint),
    imageUrl: imageUrls[0] || null,
    thumbUrl: thumbUrls[0] || null,
    ...(slots.some(slot => slot.intake) ? { imageIntake: slots.map(slot => slot.intake || { source: 'other', client: 'other', name: '', mime: '' }) } : {})
  });
  return Boolean(result?.success ?? result);
}

export async function replayQueuedRootCollectionWrite(operation, { writeDocument } = {}) {
  const payload = operation?.payload;
  if (!payload?.collectionName || !payload.docId || typeof writeDocument !== 'function') return false;
  const result = await writeDocument(payload.collectionName, payload.docId, payload.data, payload.warnLabel || '대기 저장', { merge: Boolean(payload.merge) });
  return Boolean(result?.success ?? result);
}
