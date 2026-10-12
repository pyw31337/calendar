'use strict';
// Photo upload / tag / album / delete lifecycle, repeated many times against the Firestore +
// Storage emulators with real image files:
//   npm run test:photo-stress            (STRESS_ROUNDS / STRESS_SEEDS to run longer)
//
// Uploads follow the browser's rules (src/core/app-image-pipeline.js: same bytes in one
// selection count once; a photo whose bytes are already stored reuses that original when the
// record holding it is slot-aligned and the file still exists). Tagging, album copies and
// deletes go through the real server code (functions/media-commands.js), and the photoIndex
// triggers (functions/index.js) run after every step in a shuffled order, sometimes twice,
// the way Firestore delivers events. After every step the data is checked against the rules
// the product depends on (see checkInvariants).
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Run under `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST unset).');

const fns = require('../index.js');
const media = require('../media-commands');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

const PROJECT = process.env.GCLOUD_PROJECT || 'demo-moyeora';
const BUCKET = `${PROJECT}.appspot.com`;
const CAL_ID = 'stresscal';
const CAL = `cal_${CAL_ID}`;
const db = getFirestore();
const bucket = getStorage().bucket(BUCKET);
const root = db.collection('calendars').doc(CAL);
const ROUNDS = Number(process.env.STRESS_ROUNDS || 60);
const SEEDS = String(process.env.STRESS_SEEDS || '1,2,3').split(',').map(Number).filter(Number.isFinite);

// ---------- real image files (valid PNGs, distinct bytes) ----------
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function makePng(width, height, seed) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x += 1) {
      const o = y * (width * 3 + 1) + 1 + x * 3;
      raw[o] = (x * 7 + seed * 31) & 255; raw[o + 1] = (y * 5 + seed * 17) & 255; raw[o + 2] = (x * y + seed * 13) & 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const POOL = Array.from({ length: 10 }, (_, i) => {
  const original = makePng(96 + i * 4, 64 + i * 2, i + 1);
  return { name: `photo${i + 1}.png`, original, thumb: makePng(32, 24, i + 101), fingerprint: `sha256:${crypto.createHash('sha256').update(original).digest('hex')}` };
});

// ---------- helpers ----------
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const downloadUrl = (path, token) => `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
const keyOf = url => media.getPhotoAssetKey(url);
const slotsOf = data => {
  const urls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
  const thumbs = Array.isArray(data.thumbUrls) ? data.thumbUrls : [];
  return urls.map((imageUrl, index) => ({ imageUrl, thumbUrl: thumbs[index] || imageUrl, index }));
};

async function readAll() {
  const out = {};
  for (const name of ['messages', 'memos', 'confirmedMeetings', 'photoIndex']) {
    const snap = await root.collection(name).get();
    out[name] = new Map(snap.docs.map(doc => [doc.id, doc.data()]));
  }
  return out;
}

async function reset() {
  for (const name of ['messages', 'memos', 'confirmedMeetings', 'photoIndex', 'photoIndexMeta', 'assetGraph', 'photoCommentItems']) {
    const snap = await root.collection(name).get();
    await Promise.all(snap.docs.map(doc => doc.ref.delete()));
  }
  // Only this test's own queue entries; the GC sweep below runs after the other emulator
  // tests (package.json runs this file as a separate step) since it sweeps every calendar.
  const gc = await db.collection('storageGc').where('calendarDocId', '==', CAL).get();
  await Promise.all(gc.docs.map(doc => doc.ref.delete()));
  const [files] = await bucket.getFiles({ prefix: `chatImages/${CAL_ID}/` });
  await Promise.all(files.map(file => file.delete().catch(() => {})));
  await root.set({ calendar: { id: CAL_ID, title: 'stress' }, revision: 1 }, { merge: true });
}

const TRIGGERS = {
  messages: [fns.onMessagePhotoIndexWrite, fns.onMessageMeetingPhotoIndexWrite],
  memos: [fns.onMemoPhotoIndexWrite],
  confirmedMeetings: [fns.onMeetingPhotoIndexWrite],
};
const PARAM = { messages: 'messageId', memos: 'memoId', confirmedMeetings: 'dateId' };

// Fire the triggers for every document that changed, shuffled and sometimes delivered twice.
async function deliverEvents(before, after, random) {
  const events = [];
  for (const name of Object.keys(TRIGGERS)) {
    const ids = new Set([...before[name].keys(), ...after[name].keys()]);
    for (const id of ids) {
      const a = before[name].get(id);
      const b = after[name].get(id);
      if (JSON.stringify(a) === JSON.stringify(b)) continue;
      const ref = root.collection(name).doc(id);
      const change = {
        before: { exists: Boolean(a), data: () => a, ref },
        after: { exists: Boolean(b), data: () => b, ref },
      };
      for (const fn of TRIGGERS[name]) {
        events.push({ fn, change, context: { params: { calendarDocId: CAL, [PARAM[name]]: id } } });
        if (random() < 0.25) events.push({ fn, change, context: { params: { calendarDocId: CAL, [PARAM[name]]: id } } });
      }
    }
  }
  for (let i = events.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [events[i], events[j]] = [events[j], events[i]];
  }
  for (const event of events) await event.fn.run(event.change, event.context);
}

// ---------- the browser's upload rule (app-image-pipeline.js) ----------
async function findReusableOriginals(fingerprints) {
  const map = new Map();
  for (const name of ['messages', 'memos']) {
    const snap = await root.collection(name).where('imageFingerprints', 'array-contains-any', fingerprints.slice(0, 30)).get();
    snap.docs.forEach(doc => {
      const data = doc.data();
      const urls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
      const prints = Array.isArray(data.imageFingerprints) ? data.imageFingerprints : [];
      if (!urls.length || prints.length !== urls.length) return; // only slot-aligned records are trusted
      prints.forEach((fp, index) => {
        if (fp && !map.has(fp) && /^https:\/\//.test(urls[index] || '')) map.set(fp, { imageUrl: urls[index], thumbUrl: (data.thumbUrls || [])[index] || urls[index] });
      });
    });
  }
  for (const [fp, original] of Array.from(map)) {
    const [exists] = await bucket.file(media.storagePathFromUrl(original.imageUrl)).exists();
    if (!exists) map.delete(fp);
  }
  return map;
}

let uploadCounter = 0;
async function clientUpload(collection, picks, stats) {
  const seen = new Set();
  const files = picks.filter(file => (seen.has(file.fingerprint) ? false : seen.add(file.fingerprint)));
  const reuse = await findReusableOriginals(files.map(file => file.fingerprint));
  const slots = [];
  for (const [index, file] of files.entries()) {
    if (reuse.has(file.fingerprint)) {
      // The reused photo keeps its current tags (readStoredPhotoTags in app-image-pipeline.js).
      const original = reuse.get(file.fingerprint);
      const row = await root.collection('photoIndex').doc(keyOf(original.imageUrl)).get();
      slots.push({ ...original, fingerprint: file.fingerprint, tags: String(row.data()?.tags || '') });
      stats.reused += 1;
      continue;
    }
    uploadCounter += 1;
    const base = `chatImages/${CAL_ID}/${Date.now()}_${uploadCounter}_${index}`;
    const originalPath = `${base}_original_${file.original.length}b.png`;
    const thumbPath = `${base}_thumb_${file.thumb.length}b.png`;
    const token = crypto.randomUUID();
    await bucket.file(originalPath).save(file.original, { contentType: 'image/png', metadata: { metadata: { firebaseStorageDownloadTokens: token } } });
    await bucket.file(thumbPath).save(file.thumb, { contentType: 'image/png', metadata: { metadata: { firebaseStorageDownloadTokens: token } } });
    slots.push({ imageUrl: downloadUrl(originalPath, token), thumbUrl: downloadUrl(thumbPath, token), fingerprint: file.fingerprint });
    stats.uploaded += 1;
  }
  if (!slots.length) return null;
  uploadCounter += 1;
  const id = `${collection === 'messages' ? 'm' : 'memo'}${uploadCounter}`;
  await root.collection(collection).doc(id).set({
    participantId: 'p1',
    text: collection === 'messages' ? '갤러리 사진' : `메모 ${uploadCounter}`,
    timestamp: Date.now() + uploadCounter,
    ...(collection === 'messages' ? { uploadSource: 'gallery' } : {}),
    imageUrls: slots.map(s => s.imageUrl),
    thumbUrls: slots.map(s => s.thumbUrl),
    imageUrl: slots[0].imageUrl,
    thumbUrl: slots[0].thumbUrl,
    imageTags: slots.map(slot => slot.tags || ''),
    imageFingerprints: slots.map(s => s.fingerprint),
    imageIntake: slots.map((s, index) => ({ source: 'clip', client: 'desktop', name: `photo-${index}`, mime: 'image/png' })),
  });
  return id;
}

// ---------- the rules checked after every step ----------
function checkInvariants(state, model, stepLabel, problems) {
  const fail = (rule, detail) => problems.push(`${stepLabel} | ${rule} | ${detail}`);
  const referenced = new Map(); // assetKey -> Set(owner)
  const add = (key, owner) => { if (!referenced.has(key)) referenced.set(key, new Set()); referenced.get(key).add(owner); };

  for (const name of ['messages', 'memos']) {
    for (const [id, data] of state[name]) {
      const slots = slotsOf(data);
      const lengths = { imageUrls: slots.length, thumbUrls: (data.thumbUrls || []).length };
      ['imageTags', 'imageFingerprints', 'imageIntake'].forEach(field => { if (Array.isArray(data[field])) lengths[field] = data[field].length; });
      if (new Set(Object.values(lengths)).size > 1) fail('R1 per-photo lists stay aligned', `${name}/${id} ${JSON.stringify(lengths)}`);
      slots.forEach(slot => {
        add(keyOf(slot.imageUrl), `${name === 'messages' ? 'message' : 'memo'}:${id}`);
        const fp = (data.imageFingerprints || [])[slot.index];
        const expectFp = model.fingerprintByPath.get(media.storagePathFromUrl(slot.imageUrl));
        if (fp && expectFp && fp !== expectFp) fail('R2 fingerprint belongs to its own photo', `${name}/${id} slot ${slot.index}`);
        const expectedTag = model.tags.get(keyOf(slot.imageUrl));
        if (expectedTag !== undefined && slot.index < (data.imageTags || []).length && (data.imageTags[slot.index] || '') !== expectedTag) {
          fail('R3 a tag follows its photo', `${name}/${id} slot ${slot.index} has "${data.imageTags[slot.index]}" expected "${expectedTag}"`);
        }
      });
    }
  }
  for (const [id, data] of state.confirmedMeetings) {
    (Array.isArray(data.photos) ? data.photos : []).forEach(photo => {
      add(keyOf(photo.imageUrl), `meeting:${id}`);
      if (photo.sourceMessageId && Number.isInteger(photo.sourceImageIndex)) {
        const source = state.messages.get(photo.sourceMessageId);
        const slot = source ? slotsOf(source)[photo.sourceImageIndex] : null;
        if (source && (!slot || keyOf(slot.imageUrl) !== keyOf(photo.imageUrl))) fail('R4 album copy points at the same photo', `meeting/${id} ${photo.id} -> ${photo.sourceMessageId}[${photo.sourceImageIndex}]`);
      }
      const expectedTag = model.tags.get(keyOf(photo.imageUrl));
      if (expectedTag !== undefined && (photo.tags || '') !== expectedTag) fail('R3 a tag follows its photo', `meeting/${id} ${photo.id} "${photo.tags}" expected "${expectedTag}"`);
    });
  }
  // R5 photoIndex has exactly one row per referenced photo, owned by the documents showing it.
  for (const [key, owners] of referenced) {
    const row = state.photoIndex.get(key);
    if (!row) { fail('R5 index row for every photo', key); continue; }
    const rowOwners = new Set((row.owners || []).map(owner => String(owner.sourceOwner || '').split(':').slice(0, 2).join(':')));
    owners.forEach(owner => { if (!rowOwners.has(owner)) fail('R5 index owners match', `${key} missing ${owner}`); });
    rowOwners.forEach(owner => { if (!owners.has(owner)) fail('R5 index owners match', `${key} stale ${owner}`); });
    const expectedTag = model.tags.get(key);
    if (expectedTag !== undefined && (row.tags || '') !== expectedTag) fail('R3 a tag follows its photo', `photoIndex ${key} "${row.tags}" expected "${expectedTag}"`);
  }
  for (const key of state.photoIndex.keys()) if (!referenced.has(key)) fail('R6 no index row for a photo that is gone', key);
  model.deleted.forEach(key => { if (referenced.has(key)) fail('R7 a deleted photo is gone everywhere', key); });

  // R8 one stored original per photo content (no duplicates on the server).
  const pathsByFingerprint = new Map();
  for (const [key] of referenced) {
    const path = model.pathByKey.get(key);
    const fp = path ? model.fingerprintByPath.get(path) : '';
    if (!fp) continue;
    if (!pathsByFingerprint.has(fp)) pathsByFingerprint.set(fp, new Set());
    pathsByFingerprint.get(fp).add(path);
  }
  pathsByFingerprint.forEach((paths, fp) => { if (paths.size > 1) fail('R8 one stored copy per photo', `${fp.slice(7, 19)} stored ${paths.size}x`); });
  return referenced;
}

async function checkFilesExist(referenced, model, label, problems) {
  for (const key of referenced.keys()) {
    const path = model.pathByKey.get(key);
    if (!path) continue;
    const [exists] = await bucket.file(path).exists();
    if (!exists) problems.push(`${label} | R9 every shown photo's file exists | ${path}`);
  }
}

function rememberPaths(state, model) {
  for (const name of ['messages', 'memos']) {
    for (const data of state[name].values()) {
      slotsOf(data).forEach((slot, index) => {
        const path = media.storagePathFromUrl(slot.imageUrl);
        model.pathByKey.set(keyOf(slot.imageUrl), path);
        const fp = (data.imageFingerprints || [])[index];
        if (fp && !model.fingerprintByPath.has(path)) model.fingerprintByPath.set(path, fp);
      });
    }
  }
}

// A tag written by the server reaches every slot of that photo, reused copies included.
function setTag(model, key, tag) {
  model.tags.set(key, tag);
}

async function runSeed(seed) {
  await reset();
  const random = rng(seed);
  const pick = list => list[Math.floor(random() * list.length)];
  const model = { tags: new Map(), deleted: new Set(), pathByKey: new Map(), fingerprintByPath: new Map() };
  const stats = { uploaded: 0, reused: 0, tagged: 0, bulkTagged: 0, deleted: 0, albumAdds: 0, reuploadAfterDelete: 0, ops: 0 };
  const problems = [];
  let before = await readAll();
  for (let step = 1; step <= ROUNDS; step += 1) {
    const roll = random();
    let label = '';
    const photos = [];
    for (const name of ['messages', 'memos']) for (const [id, data] of before[name]) slotsOf(data).forEach(slot => photos.push({ ...slot, id, collection: name }));
    if (roll < 0.38 || photos.length < 3) {
      const collection = random() < 0.75 ? 'messages' : 'memos';
      const count = 1 + Math.floor(random() * 4);
      const picks = Array.from({ length: count }, () => pick(POOL));
      const reusedBefore = stats.reused;
      const id = await clientUpload(collection, picks, stats);
      label = `upload ${count} to ${collection}/${id} (reused ${stats.reused - reusedBefore})`;
      if (id) {
        const data = (await root.collection(collection).doc(id).get()).data();
        slotsOf(data).forEach(slot => {
          const key = keyOf(slot.imageUrl);
          if (model.deleted.has(key)) { model.deleted.delete(key); stats.reuploadAfterDelete += 1; }
        });
      }
    } else if (roll < 0.58) {
      const target = pick(photos);
      const tag = `태그${step} ${pick(['서준', '도은', '영월', '속리산', '파주'])}`;
      const result = await media.tagAsset({ db, calendarDocId: CAL, asset: { imageUrl: target.imageUrl, thumbUrl: target.thumbUrl }, tags: tag });
      if (result.ok) setTag(model, keyOf(target.imageUrl), tag);
      stats.tagged += 1;
      label = `tag ${target.collection}/${target.id}[${target.index}]`;
    } else if (roll < 0.68) {
      const targets = Array.from(new Map(Array.from({ length: 3 }, () => pick(photos)).map(p => [keyOf(p.imageUrl), p])).values());
      const items = targets.map((p, i) => ({ imageUrl: p.imageUrl, thumbUrl: p.thumbUrl, messageId: p.collection === 'messages' ? p.id : '', memoId: p.collection === 'memos' ? p.id : '', tags: `일괄${step}-${i}` }));
      const result = await media.bulkTagAssets({ db, calendarDocId: CAL, items });
      if (result.ok) items.forEach(item => setTag(model, keyOf(item.imageUrl), item.tags));
      stats.bulkTagged += 1;
      label = `bulk tag ${items.length}`;
    } else if (roll < 0.78) {
      const target = pick(photos.filter(p => p.collection === 'messages'));
      if (target) {
        const date = `2026-10-${String(1 + Math.floor(random() * 5)).padStart(2, '0')}`;
        const ref = root.collection('confirmedMeetings').doc(date);
        const current = (await ref.get()).data() || { date, photos: [] };
        if (!(current.photos || []).some(p => keyOf(p.imageUrl) === keyOf(target.imageUrl))) {
          const tag = model.tags.get(keyOf(target.imageUrl)) || '';
          current.photos = [...(current.photos || []), { id: `ph${step}`, imageUrl: target.imageUrl, thumbUrl: target.thumbUrl, sourceMessageId: target.id, sourceImageIndex: target.index, tags: tag }];
          await ref.set(current);
          stats.albumAdds += 1;
        }
        label = `album ${date} += ${target.id}[${target.index}]`;
      }
    } else {
      const target = pick(photos);
      const result = await media.deleteAsset({ db, calendarDocId: CAL, asset: { imageUrl: target.imageUrl, thumbUrl: target.thumbUrl, messageId: target.collection === 'messages' ? target.id : '', memoId: target.collection === 'memos' ? target.id : '' } });
      if (result.ok) { model.deleted.add(keyOf(target.imageUrl)); model.tags.delete(keyOf(target.imageUrl)); }
      stats.deleted += 1;
      label = `delete ${target.collection}/${target.id}[${target.index}]`;
    }
    stats.ops += 1;
    const after = await readAll();
    await deliverEvents(before, after, random);
    before = await readAll();
    rememberPaths(before, model);
    const referenced = checkInvariants(before, model, `seed ${seed} step ${step} ${label}`, problems);
    if (step % 10 === 0 || step === ROUNDS) await checkFilesExist(referenced, model, `seed ${seed} step ${step}`, problems);
  }
  // Storage GC after the 7-day grace: originals are never deleted, files still shown stay.
  const gc = await media.sweepStorageGc({ db, bucket, now: Date.now() + media.GC_GRACE_MS + 60000 });
  const finalState = await readAll();
  const referenced = checkInvariants(finalState, model, `seed ${seed} after GC`, problems);
  await checkFilesExist(referenced, model, `seed ${seed} after GC`, problems);
  for (const path of model.fingerprintByPath.keys()) {
    const [exists] = await bucket.file(path).exists();
    if (!exists) problems.push(`seed ${seed} after GC | R10 originals are never deleted | ${path}`);
  }
  return { seed, stats, gc, problems };
}

test('photo lifecycle stays consistent across repeated upload / tag / album / delete rounds', { timeout: 30 * 60 * 1000 }, async () => {
  const reports = [];
  for (const seed of SEEDS) reports.push(await runSeed(seed));
  const byRule = new Map();
  reports.forEach(report => report.problems.forEach(line => {
    const rule = line.split(' | ')[1];
    if (!byRule.has(rule)) byRule.set(rule, []);
    byRule.get(rule).push(line);
  }));
  console.log(JSON.stringify(reports.map(({ seed, stats, gc, problems }) => ({ seed, stats, gc, problems: problems.length })), null, 1));
  byRule.forEach((lines, rule) => console.log(`\n${rule}: ${lines.length}\n  ${lines.slice(0, 6).join('\n  ')}`));
  assert.equal(byRule.size, 0, `rules broken: ${Array.from(byRule.keys()).join(', ')}`);
});
