'use strict';

// Trusted, additive automation. Model suggestions never become write instructions.
const { getPhotoAssetKey } = require('./media-commands');
const { stableAnalysisId } = require('./media-analysis');
const { readImageGeo, isIndexGeoPair } = require('./photo-index-geo');
const MAX_OWNERS = 12;
const MAX_ATTEMPTS = 3;
const active = data => data && !data.deletedAt && !data.removedAt && !data.isDeleted;
const tagsOf = value => [...new Set(String(value || '').split(/[\s,#]+/).filter(Boolean))];
const timestamp = value => value?.toMillis ? value.toMillis() : Number(value) || 0;

function automationPolicy(calendar, photo) {
  const settings = calendar?.aiSettings || {};
  if (settings.autoLocationTags === false) return 'disabled';
  // A newly created analysis document is NOT proof of a newly uploaded photo. Enable recovery
  // explicitly from a rollout time; historical edits must never be silently backfilled.
  const since = timestamp(settings.autoLocationTagsSince);
  if (settings.autoLocationTags !== true || since <= 0) return 'requires-opt-in';
  const uploadedAt = timestamp(photo?.uploadedAt || photo?.timestamp);
  if (!uploadedAt || uploadedAt < since) return 'preserve-historical-photo';
  return '';
}

function geoSignature(photo) {
  const lat = photo?.latitude;
  const lng = photo?.longitude;
  return isIndexGeoPair(lat, lng) ? `gps-v1:${lat.toFixed(5)},${lng.toFixed(5)}` : '';
}

function appendTags(current, additions) {
  const existing = tagsOf(current);
  const missing = additions.filter(tag => !existing.includes(tag));
  // Never truncate an existing tag or append a partial tag at a storage limit.
  const next = [String(current || '').trim(), ...missing.map(tag => `#${tag}`)].filter(Boolean).join(' ');
  if (existing.length + missing.length > 20 || next.length > 640) return null;
  return next;
}

async function completeAnalysisLocationTags({ db, calendarDocId, assetKey, lookupTags, now = Date.now(), legacy = false }) {
  const root = db.collection('calendars').doc(calendarDocId);
  const photoRef = root.collection('photoIndex').doc(assetKey);
  const analysisRef = root.collection('mediaAnalysis').doc(stableAnalysisId(assetKey));
  const initial = await photoRef.get();
  if (!initial.exists) return { status: 'skipped', reason: 'photo-deleted' };
  const signature = geoSignature(initial.data());
  if (!signature) return { status: 'skipped', reason: 'no-gps' };
  const initialAnalysis = await analysisRef.get();
  const initialCalendar = await root.get();
  const policy = automationPolicy(initialCalendar.data()?.calendar, initial.data());
  if (policy) return { status: 'skipped', reason: policy };
  if (initialAnalysis.data()?.review || legacy) return { status: 'skipped', reason: 'preserve-human-or-legacy-tags' };
  const prior = initialAnalysis.data()?.automatic;
  if (prior?.signature === signature && ['applied', 'unchanged', 'review-required'].includes(prior.status)) return prior;
  if (prior?.signature === signature && prior.attempts >= MAX_ATTEMPTS) return prior;
  const attempts = (prior?.signature === signature ? Number(prior.attempts) || 0 : 0) + 1;
  let candidates;
  try {
    candidates = tagsOf((await lookupTags(initial.data().latitude, initial.data().longitude)).join(' ')).slice(0, 5);
  } catch (error) {
    // Audit the bounded failure without retaining credentials/HTTP payloads in a public feed.
    await db.runTransaction(async tx => {
      const current = await tx.get(analysisRef);
      if (!current.exists || ['applied', 'unchanged', 'review-required'].includes(current.data()?.automatic?.status)) return;
      tx.set(analysisRef, { automatic: { signature, status: 'failed', reason: 'geocoder-unavailable', attempts, updatedAt: now, addedTags: [] } }, { merge: true });
    });
    if (attempts < MAX_ATTEMPTS) throw error;
    return { status: 'failed', reason: 'geocoder-unavailable' };
  }
  return db.runTransaction(async tx => {
    const [calendar, photoSnap, analysisSnap] = await Promise.all([tx.get(root), tx.get(photoRef), tx.get(analysisRef)]);
    if (!photoSnap.exists || !analysisSnap.exists || !calendar.exists) return { status: 'skipped', reason: 'source-deleted' };
    const photo = photoSnap.data();
    const analysis = analysisSnap.data();
    if (geoSignature(photo) !== signature) return { status: 'skipped', reason: 'gps-changed' };
    if (analysis.automatic?.signature === signature && ['applied', 'unchanged', 'review-required'].includes(analysis.automatic.status)) return analysis.automatic;
    const currentPolicy = automationPolicy(calendar.data()?.calendar, photo);
    if (currentPolicy) return { status: 'skipped', reason: currentPolicy };
    const audit = (status, reason, addedTags = []) => {
      const result = { signature, status, reason, addedTags, attempts, updatedAt: now, policyVersion: 1 };
      tx.set(analysisRef, { automatic: result }, { merge: true });
      return result;
    };
    if (analysis.review || legacy) return audit('review-required', 'preserve-human-or-legacy-tags');
    if (!active(photo) || analysis.status !== 'suggested' || Number(analysis.analysisVersion) < 5) return audit('review-required', 'ineligible-analysis');
    if (!candidates.length) return audit('review-required', 'no-administrative-address');
    const owners = Array.isArray(photo.owners) ? photo.owners : [];
    if (photo.ownerListComplete !== true || !owners.length || owners.length > MAX_OWNERS) return audit('review-required', 'incomplete-ownership');
    const refs = new Map();
    for (const owner of owners) {
      const match = String(owner.sourceOwner || '').match(/^(message|memo|meeting):([^/]+):\d+$/);
      if (!match) return audit('review-required', 'unsupported-owner');
      const collection = { message: 'messages', memo: 'memos', meeting: 'confirmedMeetings' }[match[1]];
      refs.set(`${collection}/${match[2]}`, root.collection(collection).doc(match[2]));
    }
    const sources = await Promise.all([...refs.values()].map(ref => tx.get(ref)));
    if (sources.some(snap => !snap.exists || !active(snap.data()))) return audit('review-required', 'owner-changed');
    const writes = [];
    const added = new Set();
    const enabledAt = timestamp(calendar.data()?.calendar?.aiSettings?.autoLocationTagsSince);
    let confirmedGps = false;
    let matched = 0;
    for (const snap of sources) {
      const data = snap.data();
      if (snap.ref.parent.id !== 'confirmedMeetings') {
        const created = timestamp(data.createdAt || data.timestamp);
        if (created < enabledAt) return audit('review-required', 'preserve-historical-source');
        if (timestamp(data.updatedAt) > created) return audit('review-required', 'preserve-edited-source');
      }
      const currentGeo = readImageGeo(data, assetKey);
      if (currentGeo) {
        if (geoSignature(currentGeo) !== signature) return audit('review-required', 'conflicting-gps');
        confirmedGps = true;
      }
      const merge = current => {
        matched += 1;
        candidates.filter(tag => !tagsOf(current).includes(tag)).forEach(tag => added.add(tag));
        return appendTags(current, candidates);
      };
      if (snap.ref.parent.id === 'confirmedMeetings') {
        const matchingPhotos = (data.photos || []).filter(photo => getPhotoAssetKey(photo?.imageUrl || photo?.full || photo?.thumbUrl || photo?.thumb) === assetKey);
        if (matchingPhotos.some(photo => timestamp(photo.createdAt) < enabledAt)) return audit('review-required', 'preserve-historical-source');
        if (matchingPhotos.some(photo => timestamp(photo.updatedAt) > timestamp(photo.createdAt))) return audit('review-required', 'preserve-edited-source');
        let overflow = false;
        const photos = (data.photos || []).map(photo => {
          if (getPhotoAssetKey(photo?.imageUrl || photo?.full || photo?.thumbUrl || photo?.thumb) !== assetKey) return photo;
          const tags = merge(photo.tags);
          if (tags === null) { overflow = true; return photo; }
          return { ...photo, tags };
        });
        if (overflow) return audit('review-required', 'tag-limit');
        writes.push(() => tx.update(snap.ref, { photos }));
      } else {
        const urls = data.imageUrls?.length ? data.imageUrls : [data.imageUrl || ''];
        const thumbs = data.thumbUrls?.length ? data.thumbUrls : [data.thumbUrl || ''];
        const imageTags = Array.isArray(data.imageTags) ? data.imageTags.slice() : [];
        const imageTagMap = { ...data.imageTagMap };
        for (let index = 0; index < Math.max(urls.length, thumbs.length); index += 1) {
          if (getPhotoAssetKey(urls[index] || thumbs[index]) !== assetKey) continue;
          const next = merge(imageTagMap[assetKey] ?? imageTags[index] ?? '');
          if (next === null) return audit('review-required', 'tag-limit');
          while (imageTags.length <= index) imageTags.push('');
          imageTags[index] = next;
          imageTagMap[assetKey] = next;
        }
        writes.push(() => tx.update(snap.ref, { imageTags, imageTagMap }));
      }
    }
    // Canonical coordinates alone may be an old projection: revalidate against an actual owner.
    if (!confirmedGps || matched < owners.length) return audit('review-required', 'source-metadata-unconfirmed');
    if (added.size) writes.forEach(write => write());
    // Signature, source edits and audit commit together. Deleting an auto-tag later does NOT
    // reintroduce it on the next analysis run, even after retries or duplicate event delivery.
    return audit(added.size ? 'applied' : 'unchanged', 'gps-administrative-address', [...added]);
  });
}

module.exports = { completeAnalysisLocationTags, geoSignature, appendTags };
