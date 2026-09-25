// What the watchdog probe compares: the newest message's identity plus the fields an edit or a
// soft delete changes. Equal signatures mean the live listener already has the head of the list.
export function chatMessageSignature(message) {
  if (!message || !message.id) return '';
  const images = Array.isArray(message.images) ? message.images.length : (message.imageUrl ? 1 : 0);
  return [
    message.id,
    Number(message.timestamp) || 0,
    Number(message.updatedAt || message.editedAt) || 0,
    String(message.text || ''),
    images,
    message.deleted || message.isDeleted ? 1 : 0
  ].join('|');
}
