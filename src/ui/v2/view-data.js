// Presentation-only normalization. Never writes or changes the source records.
export function timestampMs(value) {
  if (value == null || value === '') return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  return Date.parse(value) || 0;
}

// Participant records keep the full name (for example 박영우), while compact name
// badges use the given name only (영우). Keep this presentation rule centralized.
export function shortParticipantName(name) {
  const value = String(name || '').trim();
  if (/^[가-힣]{3,4}$/.test(value)) return value.slice(1);
  return value;
}

export function authorFor(row, participants = []) {
  const participant = participants.find(p => p.id === row?.participantId || p.id === row?.authorId || p.name === row?.senderName || p.name === row?.author);
  return { name: row?.senderName || participant?.name || row?.author || '알 수 없음', color: participant?.color || '#A78BFA' };
}

export function latestRows(rows = []) {
  return rows.filter(Boolean).slice().sort((a, b) => timestampMs(b.timestamp ?? b.updatedAt ?? b.createdAt) - timestampMs(a.timestamp ?? a.updatedAt ?? a.createdAt));
}

export function photoLightbox(photo, photos) {
  const url = photo.full || photo.url || photo.imageUrl || photo.downloadURL;
  return {
    ...photo, url, urls: photos.map(p => p.full || p.url || p.imageUrl || p.downloadURL),
    index: Math.max(0, photos.indexOf(photo)),
    meta: photos.map(p => ({ ...p, source: p.source || p.uploadSource, thumb: p.thumb || p.thumbnailUrl || p.thumbUrl })),
  };
}
