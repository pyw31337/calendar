/* Replay helpers for media messages kept in the durable write queue. Firebase-specific work is
 * injected by app-main so this module remains small and independently testable. */

export async function replayQueuedMediaMessage(operation, { resolveImages, chunkImages, writeMessage } = {}) {
  const payload = operation?.payload;
  if (!payload || typeof resolveImages !== 'function' || typeof chunkImages !== 'function' || typeof writeMessage !== 'function') return false;
  const compressed = (Array.isArray(payload.images) ? payload.images : []).map(image => ({ original: '', thumbnail: '', originalBlob: image.originalBlob, thumbnailBlob: image.thumbnailBlob }));
  if (compressed.length === 0) return false;
  const chunks = chunkImages(await resolveImages(operation.calendarId, compressed));
  for (let i = 0; i < chunks.length; i += 1) {
    const images = chunks[i];
    const result = await writeMessage(operation.calendarId, {
      participantId: payload.participantId || '',
      text: i === 0 ? (payload.text || '') : '',
      imageUrl: images[0].imageUrl,
      thumbUrl: images[0].thumbUrl,
      imageUrls: images.map(image => image.imageUrl),
      thumbUrls: images.map(image => image.thumbUrl),
      timestamp: (Number(payload.timestamp) || Date.now()) + i,
      ...(payload.uploadSource ? { uploadSource: payload.uploadSource } : {}),
      ...(i === 0 && payload.replyTo ? { replyTo: payload.replyTo } : {})
    }, `${operation.id}_${i}`);
    if (!result?.success) return false;
  }
  return true;
}

export async function replayQueuedMemoSave(operation, { resolveImages, writeMemo } = {}) {
  const payload = operation?.payload;
  if (!payload?.memoData || !Array.isArray(payload.images) || typeof resolveImages !== 'function' || typeof writeMemo !== 'function') return false;
  const pending = payload.images.filter(image => !image.isExisting);
  const resolved = pending.length > 0
    ? await resolveImages(operation.calendarId, pending.map(image => ({ original: '', thumbnail: '', originalBlob: image.originalBlob, thumbnailBlob: image.thumbnailBlob })))
    : [];
  let next = 0;
  const imageUrls = payload.images.map(image => image.isExisting ? image.original : resolved[next++]?.imageUrl).filter(Boolean);
  next = 0;
  const thumbUrls = payload.images.map(image => image.isExisting ? (image.thumbnail || image.original) : resolved[next++]?.thumbUrl).filter(Boolean);
  const result = await writeMemo(operation.calendarId, payload.memoId, {
    ...payload.memoData,
    imageUrls,
    thumbUrls,
    imageUrl: imageUrls[0] || null,
    thumbUrl: thumbUrls[0] || null
  });
  return Boolean(result?.success ?? result);
}

export async function replayQueuedRootCollectionWrite(operation, { writeDocument } = {}) {
  const payload = operation?.payload;
  if (!payload?.collectionName || !payload.docId || typeof writeDocument !== 'function') return false;
  const result = await writeDocument(payload.collectionName, payload.docId, payload.data, payload.warnLabel || '대기 저장', { merge: Boolean(payload.merge) });
  return Boolean(result?.success ?? result);
}
