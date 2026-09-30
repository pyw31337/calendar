// Pure push policy shared by the Firestore triggers in index.js.
// Memo notifications used to compare the whole document (JSON.stringify) and then
// fan out to every push_subscriptions doc. Maintenance writes (link preview,
// image tags, GPS, asset graph, updatedAt) re-sent the same memo text, and iOS
// does not reliably collapse Web Push tags, so one unchanged memo became a
// lock-screen storm. Decisions here notify only on a user-visible revision and
// collapse duplicate device subscriptions before anything is sent.

const crypto = require('crypto');

function revisionHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

function claimDocId(key) {
  return String(key || '').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 420);
}

function textOf(memo) {
  return [String(memo?.title || '').trim(), String(memo?.text || '').trim()].join('\u0001');
}

function imageSignature(memo) {
  const urls = Array.isArray(memo?.imageUrls)
    ? memo.imageUrls
    : (memo?.imageUrl ? [memo.imageUrl] : []);
  return urls.map(url => String(url || '').trim()).filter(Boolean).join('\u0001');
}

function commentSignature(memo) {
  const comments = Array.isArray(memo?.comments) ? memo.comments : [];
  return comments.map(comment => [
    String(comment?.id || ''),
    String(comment?.text || '').trim(),
    String(comment?.participantId || comment?.authorId || '')
  ].join('\u0002')).join('\u0001');
}

function visibleMemoSignature(memo) {
  return [textOf(memo), imageSignature(memo), commentSignature(memo)].join('\u0001');
}

function addedComment(before, after) {
  const previous = new Set((Array.isArray(before?.comments) ? before.comments : []).map(comment => String(comment?.id || '')));
  const comments = Array.isArray(after?.comments) ? after.comments : [];
  const added = comments.filter(comment => comment && !previous.has(String(comment.id || '')));
  return added.length ? added[added.length - 1] : null;
}

function hasVisibleMemoContent(memo) {
  return Boolean(
    String(memo?.title || '').trim()
    || String(memo?.text || '').trim()
    || imageSignature(memo)
    || (Array.isArray(memo?.comments) && memo.comments.length)
  );
}

/**
 * @returns {null | {kind: string, claimKey: string, tag: string, body: string, authorName: string, skipParticipantId: string|null, renotify: boolean}}
 */
function decideMemoNotification(before, after, context = {}) {
  if (!after || typeof after !== 'object') return null;
  if (after.deletedAt) return null;
  const memoId = String(context.memoId || after.id || '').trim();
  if (!memoId) return null;
  if (!hasVisibleMemoContent(after)) return null;
  const nextSignature = visibleMemoSignature(after);
  if (before && visibleMemoSignature(before) === nextSignature) return null;

  const textChanged = !before || textOf(before) !== textOf(after);
  const imagesChanged = !before || imageSignature(before) !== imageSignature(after);
  const commentsChanged = !before || commentSignature(before) !== commentSignature(after);
  let kind = 'create';
  if (before) {
    if (textChanged) kind = 'edit';
    else if (imagesChanged) kind = 'images';
    else if (commentsChanged) kind = 'comment';
    else return null;
  }

  const comment = kind === 'comment' ? addedComment(before, after) : null;
  const commentBody = String(comment?.text || '').trim();
  const bodySource = kind === 'comment' && commentBody
    ? commentBody
    : (after.text || after.title || '새 메모');
  const body = String(bodySource).trim().slice(0, 120) || '새 메모가 등록되었습니다';
  const revision = revisionHash(nextSignature);
  const skipParticipantId = kind === 'comment'
    ? (comment?.participantId || comment?.authorId || after.participantId || after.authorId || null)
    : (after.participantId || after.authorId || null);

  return {
    kind,
    claimKey: claimDocId(`memo_${memoId}_${revision}`),
    tag: `memo-${memoId}-${revision}`,
    body,
    authorName: String(after.authorName || after.participantName || '').trim(),
    skipParticipantId: skipParticipantId ? String(skipParticipantId) : null,
    renotify: false
  };
}

function takeNotificationClaim(claims, key) {
  const id = claimDocId(key);
  if (!id || !claims || typeof claims.has !== 'function' || typeof claims.add !== 'function') return false;
  if (claims.has(id)) return false;
  claims.add(id);
  return true;
}

function planMemoPush(before, after, claims, context = {}) {
  const decision = decideMemoNotification(before, after, context);
  if (!decision) return null;
  if (!takeNotificationClaim(claims, decision.claimKey)) return null;
  return decision;
}

function decideChatNotification(message, context = {}) {
  if (!message || typeof message !== 'object') return null;
  if (message.uploadSource === 'meeting' || message.uploadSource === 'gallery') return null;
  const messageId = String(context.messageId || message.id || '').trim();
  if (!messageId) return null;
  const hasContent = Boolean(
    String(message.text || '').trim()
    || message.imageUrl
    || (Array.isArray(message.imageUrls) && message.imageUrls.length)
    || (Array.isArray(message.fileAttachments) && message.fileAttachments.length)
  );
  if (!hasContent) return null;
  return {
    claimKey: claimDocId(`chat_${messageId}`),
    tag: `chat-${messageId}`,
    skipParticipantId: message.participantId ? String(message.participantId) : null,
    renotify: false
  };
}

function planChatPush(message, claims, context = {}) {
  const decision = decideChatNotification(message, context);
  if (!decision) return null;
  if (!takeNotificationClaim(claims, decision.claimKey)) return null;
  return decision;
}

function pollContentSignature(poll) {
  const options = Array.isArray(poll?.options) ? poll.options : [];
  return [
    String(poll?.title || '').trim(),
    options.map(option => String(option?.text || '').trim()).join('\u0001')
  ].join('\u0002');
}

function decidePollNotifications(beforePolls, afterPolls) {
  const before = Array.isArray(beforePolls) ? beforePolls.filter(poll => poll && poll.id) : [];
  const after = Array.isArray(afterPolls) ? afterPolls.filter(poll => poll && poll.id) : [];
  const beforeIds = new Set(before.map(poll => poll.id));
  const beforeSignatures = new Set(before.map(pollContentSignature));
  return after.filter(poll => poll.id && !beforeIds.has(poll.id)).filter(poll => {
    // A calendar rewrite that mints a fresh id for an unchanged poll is not a new vote.
    return !beforeSignatures.has(pollContentSignature(poll));
  }).map(poll => ({
    poll,
    claimKey: claimDocId(`poll_${poll.id}`),
    tag: `poll-${poll.id}`,
    skipParticipantId: poll.participantId || poll.createdBy || poll.authorId || null,
    renotify: false
  }));
}

function planPollPushes(beforePolls, afterPolls, claims) {
  return decidePollNotifications(beforePolls, afterPolls).filter(decision => takeNotificationClaim(claims, decision.claimKey));
}

function decideScheduleNotification(before, after, context = {}) {
  if (!after || typeof after !== 'object') return null;
  const wasConfirmed = !!before && before.confirmed !== false;
  const isConfirmed = after.confirmed !== false;
  if (!isConfirmed || wasConfirmed) return null;
  if (context.stale) return null;
  const dateId = String(context.dateId || after.date || '').trim();
  if (!dateId) return null;
  const confirmedAt = Number(after.confirmedAt || 0) || 0;
  return {
    claimKey: claimDocId(`schedule_${dateId}_${confirmedAt || 'confirmed'}`),
    tag: `schedule-${dateId}-${confirmedAt || 'confirmed'}`,
    skipParticipantId: after.confirmedBy || after.participantId || null,
    renotify: false
  };
}

function planSchedulePush(before, after, claims, context = {}) {
  const decision = decideScheduleNotification(before, after, context);
  if (!decision) return null;
  if (!takeNotificationClaim(claims, decision.claimKey)) return null;
  return decision;
}

function subscriptionFreshness(entry) {
  return Number(entry?.lastSeenAt || entry?.updatedAt || entry?.createdAt || 0) || 0;
}

// One phone can accumulate many still-valid Web Push endpoints (service-worker
// updates subscribe again without deleting the previous Firestore doc). Sending
// to every doc is what stacks identical lock-screen cards. Keep the newest
// subscription per device, then per endpoint.
function selectDeliverableSubscriptions(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const byDevice = new Map();
  list.forEach(entry => {
    const endpoint = String(entry?.endpoint || '');
    if (!endpoint) return;
    const deviceId = String(entry?.deviceId || '').trim();
    const key = deviceId ? `device:${deviceId}` : `endpoint:${endpoint}`;
    const previous = byDevice.get(key);
    if (!previous || subscriptionFreshness(entry) >= subscriptionFreshness(previous)) byDevice.set(key, entry);
  });
  const byEndpoint = new Map();
  for (const entry of byDevice.values()) {
    const endpoint = String(entry.endpoint || '');
    const previous = byEndpoint.get(endpoint);
    if (!previous || subscriptionFreshness(entry) >= subscriptionFreshness(previous)) byEndpoint.set(endpoint, entry);
  }
  return Array.from(byEndpoint.values());
}

module.exports = {
  revisionHash,
  claimDocId,
  visibleMemoSignature,
  decideMemoNotification,
  takeNotificationClaim,
  planMemoPush,
  decideChatNotification,
  planChatPush,
  decidePollNotifications,
  planPollPushes,
  decideScheduleNotification,
  planSchedulePush,
  selectDeliverableSubscriptions
};
