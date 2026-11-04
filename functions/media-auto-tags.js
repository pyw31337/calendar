'use strict';

// Trusted, additive automation. Face writes require an explicit safe-mode opt-in and threshold.
const { getPhotoAssetKey } = require('./media-commands');
const mediaCommands = require('./media-commands');
const { stableAnalysisId } = require('./media-analysis');
const { readImageGeo, isIndexGeoPair } = require('./photo-index-geo');
const MAX_OWNERS = 12;
const MAX_ATTEMPTS = 3;
const FACE_AUTO_MIN_SCORE = 0.86;
const completed = (automatic, signature) => automatic?.signature === signature && ['applied', 'unchanged', 'review-required'].includes(automatic.status);
const active = data => data && !data.deletedAt && !data.removedAt && !data.isDeleted;
const tagsOf = value => [...new Set(String(value || '').split(/[\s,#]+/).filter(Boolean))];
const faceName = value => String(value || '').replace(/^#+/, '').replace(/\s+/g, ' ').trim().slice(0, 80);
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
  // Reserve the external-call budget atomically. Duplicate trigger deliveries may run in
  // parallel: counting only after geocoding allows all of them to spend the same attempt.
  const reservation = await db.runTransaction(async tx => {
    const [calendar, photo, analysis] = await Promise.all([tx.get(root), tx.get(photoRef), tx.get(analysisRef)]);
    if (!calendar.exists || !photo.exists || !analysis.exists) return { status: 'skipped', reason: 'source-deleted' };
    if (geoSignature(photo.data()) !== signature) return { status: 'skipped', reason: 'gps-changed' };
    const policy = automationPolicy(calendar.data()?.calendar, photo.data());
    if (policy) return { status: 'skipped', reason: policy };
    if (analysis.data()?.review || legacy) return { status: 'skipped', reason: 'preserve-human-or-legacy-tags' };
    if (!active(photo.data()) || analysis.data().status !== 'suggested' || Number(analysis.data().analysisVersion) < 5) return { status: 'skipped', reason: 'ineligible-analysis' };
    const prior = analysis.data()?.automatic;
    if (completed(prior, signature) || (prior?.signature === signature && prior.attempts >= MAX_ATTEMPTS)) return prior;
    const attempts = (prior?.signature === signature ? Number(prior.attempts) || 0 : 0) + 1;
    tx.set(analysisRef, { automatic: { signature, status: 'processing', attempts, updatedAt: now, addedTags: [], policyVersion: 1 } }, { merge: true });
    return { reserved: true, attempts };
  });
  if (!reservation.reserved) return reservation;
  const { attempts } = reservation;
  let candidates;
  try {
    candidates = tagsOf((await lookupTags(initial.data().latitude, initial.data().longitude)).join(' ')).slice(0, 5);
  } catch (error) {
    // Audit the bounded failure without retaining credentials/HTTP payloads in a public feed.
    const failure = await db.runTransaction(async tx => {
      const current = await tx.get(analysisRef);
      const automatic = current.data()?.automatic;
      if (!current.exists || automatic?.signature !== signature) return { status: 'skipped', reason: 'source-changed' };
      if (completed(automatic, signature)) return automatic;
      const result = { signature, status: 'failed', reason: 'geocoder-unavailable', attempts: Math.max(attempts, automatic.attempts || 0), updatedAt: now, addedTags: [] };
      tx.set(analysisRef, { automatic: result }, { merge: true });
      return result;
    });
    if (failure.status === 'failed' && failure.attempts < MAX_ATTEMPTS) throw error;
    return failure;
  }
  return db.runTransaction(async tx => {
    const [calendar, photoSnap, analysisSnap] = await Promise.all([tx.get(root), tx.get(photoRef), tx.get(analysisRef)]);
    if (!photoSnap.exists || !analysisSnap.exists || !calendar.exists) return { status: 'skipped', reason: 'source-deleted' };
    const photo = photoSnap.data();
    const analysis = analysisSnap.data();
    if (geoSignature(photo) !== signature) return { status: 'skipped', reason: 'gps-changed' };
    if (completed(analysis.automatic, signature)) return analysis.automatic;
    const currentPolicy = automationPolicy(calendar.data()?.calendar, photo);
    if (currentPolicy) return { status: 'skipped', reason: currentPolicy };
    const audit = (status, reason, addedTags = []) => {
      const recordedAttempts = analysis.automatic?.signature === signature ? analysis.automatic.attempts || 0 : 0;
      const result = { signature, status, reason, addedTags, attempts: Math.max(attempts, recordedAttempts), updatedAt: now, policyVersion: 1 };
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

async function completeAnalysisFaceTags({ db, calendarDocId, accepted = [], photoSnaps = [], analysisSnaps = [], now = Date.now() }) {
  const root = db.collection('calendars').doc(calendarDocId);
  const calendarSnap = await root.get();
  const settings = calendarSnap.data()?.calendar?.aiSettings || {};
  // Safe mode is the default for new face results; an explicit review/false setting is the
  // kill switch. A 24-hour fallback rollout window prevents historical backfills from mutating.
  if (settings.autoFaceTags === false || String(settings.autoClassificationMode || 'safe') !== 'safe') return { status: 'requires-review-mode', applied: 0 };
  const since = timestamp(settings.autoFaceTagsSince) || now - 24 * 60 * 60 * 1000;
  const photos = new Map(photoSnaps.filter(snap => snap?.exists).map(snap => [snap.id, snap.data() || {}]));
  const prior = new Map(analysisSnaps.filter(snap => snap?.exists).map(snap => [snap.id, snap.data() || {}]));
  const items = [];
  const audit = [];
  accepted.forEach(item => {
    const photo = photos.get(item.assetKey);
    const previous = prior.get(item.id);
    const best = (Array.isArray(item.facePeople) ? item.facePeople : []).slice().sort((a, b) => Number(b.score) - Number(a.score))[0];
    const uploadedAt = timestamp(photo?.uploadedAt || photo?.timestamp || photo?.createdAt);
    const name = faceName(best?.name);
    if (previous?.review) { audit.push({ id: item.id, status: 'preserved', reason: 'human-review' }); return; }
    if (previous?.automaticFace?.status === 'applied' && previous.automaticFace.name === name) { audit.push({ id: item.id, status: 'preserved', reason: 'automatic-write-complete', name }); return; }
    if (!photo || !name || Number(best?.score) < FACE_AUTO_MIN_SCORE) { audit.push({ id: item.id, status: 'review-required', reason: 'low-confidence' }); return; }
    if (uploadedAt && uploadedAt < since) { audit.push({ id: item.id, status: 'preserved', reason: 'historical-photo' }); return; }
    const current = tagsOf(photo.tags);
    if (current.some(tag => tag === name || (name.length === 3 && tag === name.slice(1)))) { audit.push({ id: item.id, status: 'unchanged', reason: 'person-tag-exists' }); return; }
    const tags = appendTags(photo.tags, [name]);
    if (!tags) { audit.push({ id: item.id, status: 'review-required', reason: 'tag-limit' }); return; }
    items.push({ imageUrl: photo.full || photo.imageUrl, thumbUrl: photo.thumb || photo.thumbUrl, tags });
    audit.push({ id: item.id, status: 'pending', reason: 'high-confidence-face', name, score: Number(best.score) });
  });
  if (items.length) {
    const result = await mediaCommands.bulkTagAssets({ db, calendarDocId, items, now });
    const applied = result.ok ? items.length : 0;
    if (audit.length) await Promise.all(audit.map(entry => {
      const finalStatus = entry.status === 'pending' ? (result.ok ? 'applied' : 'failed') : entry.status;
      return root.collection('mediaAnalysis').doc(entry.id).set({ automaticFace: { status: finalStatus, reason: entry.reason, name: entry.name || '', score: entry.score || 0, updatedAt: now, policyVersion: 1 } }, { merge: true });
    }));
    return { status: result.ok ? 'applied' : 'failed', applied, audit };
  }
  if (audit.length) {
    await Promise.all(audit.map(entry => root.collection('mediaAnalysis').doc(entry.id).set({ automaticFace: { status: entry.status, reason: entry.reason, name: entry.name || '', score: entry.score || 0, updatedAt: now, policyVersion: 1 } }, { merge: true })));
  }
  return { status: 'no-op', applied: 0, audit };
}

module.exports = { completeAnalysisLocationTags, completeAnalysisFaceTags, geoSignature, appendTags };
