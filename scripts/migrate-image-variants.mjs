#!/usr/bin/env node
/**
 * Idempotent image-variant migration.
 *
 * Chat uploads (uploadSource chat, or a message with no uploadSource) keep
 * original + 512 thumb and gain chatImages/.../_small.webp.
 * Gallery, memo, meeting, calendar, and anniversary uploads keep original +
 * small thumb. Their Firestore thumb fields are repointed at the small object
 * only after that object exists. A 512 `_thumb_` object is deleted only with
 * --delete-superseded, and never when it is the original bytes (including a
 * Sep 29 WebP payload that is still named .jpg).
 *
 * Dry-run is the default. Writes need --apply.
 * Auth: GOOGLE_OAUTH_ACCESS_TOKEN or GOOGLE_APPLICATION_CREDENTIALS (service account JSON).
 *
 *   node scripts/migrate-image-variants.mjs
 *   node scripts/migrate-image-variants.mjs --apply
 *   node scripts/migrate-image-variants.mjs --apply --delete-superseded
 */

import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import {
  canDeleteSupersededThumb,
  isChatImageUpload,
  isThumbObjectPath,
  siblingSmallStoragePath,
  storagePathFromDownloadUrl,
  variantMigrationPlan,
} from '../src/core/image-variants.js';

const execFileAsync = promisify(execFile);
const PROJECT_ID = 'metro-live-2918e';
const BUCKET = 'metro-live-2918e.firebasestorage.app';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const apply = process.argv.includes('--apply');
const deleteSuperseded = process.argv.includes('--delete-superseded');
const calendars = (process.env.CALENDARS || 'cw,kkot,jhair').split(',').map(s => s.trim()).filter(Boolean);

function decodeValue(val) {
  if (!val || typeof val !== 'object') return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in val) return Object.fromEntries(Object.entries(val.mapValue.fields || {}).map(([k, v]) => [k, decodeValue(v)]));
  if ('nullValue' in val) return null;
  return null;
}

function decodeDoc(doc) {
  return {
    id: doc.name.split('/').pop(),
    name: doc.name,
    ...Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, decodeValue(v)])),
  };
}

async function accessToken() {
  if (process.env.GOOGLE_OAUTH_ACCESS_TOKEN) return process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) return '';
  const sa = JSON.parse(await readFile(credPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const assertion = `${header}.${claim}.${signer.sign(sa.private_key).toString('base64url')}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`token exchange failed (${res.status})`);
  return data.access_token;
}

async function listCollection(token, path) {
  const docs = [];
  let pageToken = '';
  do {
    const url = `${FIRESTORE_BASE}/${path}?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`list ${path} failed ${res.status}`);
    const data = await res.json();
    (data.documents || []).forEach(doc => docs.push(decodeDoc(doc)));
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return docs;
}

function slotsFromDoc(doc, channel) {
  const urls = Array.isArray(doc.imageUrls) && doc.imageUrls.length ? doc.imageUrls : (doc.imageUrl ? [doc.imageUrl] : []);
  const thumbs = Array.isArray(doc.thumbUrls) && doc.thumbUrls.length ? doc.thumbUrls : (doc.thumbUrl ? [doc.thumbUrl] : []);
  const smalls = Array.isArray(doc.smallThumbUrls) && doc.smallThumbUrls.length ? doc.smallThumbUrls : (doc.smallThumbUrl ? [doc.smallThumbUrl] : []);
  const count = Math.max(urls.length, thumbs.length);
  const out = [];
  for (let index = 0; index < count; index += 1) {
    out.push({
      channel,
      uploadSource: doc.uploadSource || '',
      imageUrl: urls[index] || '',
      thumbUrl: thumbs[index] || '',
      smallThumbUrl: smalls[index] || '',
      docName: doc.name,
      index,
    });
  }
  if (channel === 'meeting') {
    (Array.isArray(doc.photos) ? doc.photos : []).forEach((photo, index) => {
      out.push({
        channel: 'meeting',
        uploadSource: photo?.uploadSource || 'meeting',
        imageUrl: photo?.imageUrl || '',
        thumbUrl: photo?.thumbUrl || '',
        smallThumbUrl: photo?.smallThumbUrl || '',
        docName: doc.name,
        index,
        meetingPhoto: true,
      });
    });
  }
  return out;
}

async function storageMetadata(token, objectPath) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(objectPath)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`metadata ${objectPath} failed ${res.status}`);
  return res.json();
}

function isGif(buffer) {
  return buffer.length >= 6 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
}

async function renderSmallWebp(buffer) {
  const dir = tmpdir();
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const src = join(dir, `variant-src-${stamp}`);
  const png = join(dir, `variant-png-${stamp}.png`);
  const webp = join(dir, `variant-webp-${stamp}.webp`);
  await import('node:fs/promises').then(fs => fs.writeFile(src, buffer));
  const cwebp = existsSync('/opt/homebrew/bin/cwebp') ? '/opt/homebrew/bin/cwebp' : 'cwebp';
  try {
    await execFileAsync('sips', ['-Z', '160', src, '--out', png]);
    await execFileAsync(cwebp, ['-q', '80', png, '-o', webp]);
    return await readFile(webp);
  } finally {
    await Promise.all([src, png, webp].map(file => import('node:fs/promises').then(fs => fs.unlink(file).catch(() => {}))));
  }
}

async function uploadSmall(token, objectPath, buffer) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?name=${encodeURIComponent(objectPath)}&uploadType=media`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`upload ${objectPath} failed ${res.status}`);
  const data = await res.json();
  const downloadToken = String(data.downloadTokens || '').split(',')[0];
  const media = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(objectPath)}?alt=media`;
  return downloadToken ? `${media}&token=${downloadToken}` : media;
}

async function patchFields(token, docName, fields) {
  const relative = docName.split('/documents/')[1];
  const mask = Object.keys(fields).map(key => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&');
  const res = await fetch(`${FIRESTORE_BASE}/${relative}?${mask}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`patch failed ${res.status}`);
}

function jsToFirestore(value) {
  if (Array.isArray(value)) return { arrayValue: { values: value.map(jsToFirestore) } };
  if (value && typeof value === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, jsToFirestore(v)])) } };
  }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value == null) return { nullValue: null };
  return { stringValue: String(value) };
}

async function deleteObject(token, objectPath) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(objectPath)}`;
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok && res.status !== 404) throw new Error(`delete ${objectPath} failed ${res.status}`);
}

async function main() {
  if (deleteSuperseded && !apply) throw new Error('--delete-superseded requires --apply');
  const token = await accessToken();
  if (!token) {
    console.log(JSON.stringify({
      ran: false,
      reason: 'missing credentials',
      how: 'Set GOOGLE_OAUTH_ACCESS_TOKEN or GOOGLE_APPLICATION_CREDENTIALS, then run node scripts/migrate-image-variants.mjs (add --apply to write).',
    }));
    return;
  }
  const groups = new Map();
  for (const calId of calendars) {
    const [messages, memos, meetings] = await Promise.all([
      listCollection(token, `calendars/cal_${calId}/messages`),
      listCollection(token, `calendars/cal_${calId}/memos`),
      listCollection(token, `calendars/cal_${calId}/confirmedMeetings`),
    ]);
    const refs = [
      ...messages.flatMap(doc => slotsFromDoc(doc, 'message')),
      ...memos.flatMap(doc => slotsFromDoc(doc, 'memo')),
      ...meetings.flatMap(doc => slotsFromDoc(doc, 'meeting')),
    ];
    refs.forEach(ref => {
      const originalPath = storagePathFromDownloadUrl(ref.imageUrl);
      if (!originalPath) return;
      if (!groups.has(originalPath)) groups.set(originalPath, []);
      groups.get(originalPath).push(ref);
    });
  }

  const summary = {
    ran: true,
    apply,
    deleteSuperseded,
    assets: groups.size,
    chat: 0,
    other: 0,
    createSmall: 0,
    alreadyHadSmall: 0,
    retarget: 0,
    deleteEligible: 0,
    skippedGif: 0,
    created: 0,
    retargeted: 0,
    deleted: 0,
  };

  const smallPaths = [...new Set([...groups.keys()].map(siblingSmallStoragePath).filter(Boolean))];
  const smallExists = new Map();
  let cursor = 0;
  async function probeWorker() {
    while (cursor < smallPaths.length) {
      const index = cursor++;
      const path = smallPaths[index];
      const meta = await storageMetadata(token, path);
      smallExists.set(path, Boolean(meta));
      if ((index + 1) % 200 === 0) console.error(`probed ${index + 1}/${smallPaths.length}`);
    }
  }
  await Promise.all(Array.from({ length: 16 }, probeWorker));

  for (const [originalPath, refs] of groups) {
    const chat = refs.some(ref => isChatImageUpload(ref));
    if (chat) summary.chat += 1;
    else summary.other += 1;
    const smallPath = siblingSmallStoragePath(originalPath);
    if (!smallPath) continue;
    const smallObjectExists = smallExists.get(smallPath) === true;
    const thumbPath = storagePathFromDownloadUrl(refs.find(ref => isThumbObjectPath(storagePathFromDownloadUrl(ref.thumbUrl)))?.thumbUrl || '');
    const refsPointAtSmall = refs.every(ref => {
      const thumb = storagePathFromDownloadUrl(ref.thumbUrl);
      const small = storagePathFromDownloadUrl(ref.smallThumbUrl);
      return thumb === smallPath || small === smallPath || (!chat && thumb === smallPath);
    });
    const plan = variantMigrationPlan({
      chat,
      smallObjectExists,
      thumbPath,
      smallPath,
      originalPaths: [originalPath],
      refsPointAtSmall,
      thumbStillReferenced: Boolean(thumbPath) && refs.some(ref => storagePathFromDownloadUrl(ref.thumbUrl) === thumbPath),
    });
    if (plan.createSmall) summary.createSmall += 1;
    else summary.alreadyHadSmall += 1;
    if (plan.retargetThumb) summary.retarget += 1;
    const deleteOk = canDeleteSupersededThumb({
      chat,
      thumbPath,
      originalPaths: [originalPath],
      smallExists: smallObjectExists || plan.createSmall,
      refsPointAtSmall: refsPointAtSmall || plan.retargetThumb,
      thumbStillReferenced: false,
      thumbIsOriginalBytes: thumbPath === originalPath,
    });
    if (deleteOk && thumbPath && thumbPath !== originalPath) summary.deleteEligible += 1;
    if (thumbPath) refs.thumbPath = thumbPath;
    if (!apply) continue;
    let smallUrl = refs.find(ref => storagePathFromDownloadUrl(ref.smallThumbUrl) === smallPath)?.smallThumbUrl
      || (storagePathFromDownloadUrl(refs[0].thumbUrl) === smallPath ? refs[0].thumbUrl : '');
    if (plan.createSmall) {
      const downloadUrl = refs.find(ref => storagePathFromDownloadUrl(ref.imageUrl) === originalPath)?.imageUrl;
      const downloaded = await fetch(downloadUrl);
      if (!downloaded.ok) throw new Error(`download failed ${downloaded.status} ${originalPath}`);
      const bytes = Buffer.from(await downloaded.arrayBuffer());
      if (isGif(bytes)) {
        summary.skippedGif += 1;
        continue;
      }
      const webp = await renderSmallWebp(bytes);
      smallUrl = await uploadSmall(token, smallPath, webp);
      summary.created += 1;
    }
    if (!chat && smallUrl && plan.retargetThumb) {
      summary.retargeted += 1;
      // Reference updates are grouped by document below, after every asset in the
      // document is known. Record the desired URL on the ref for the patch pass.
      refs.forEach(ref => { ref.nextThumbUrl = smallUrl; });
    }
  }

  if (apply) {
    const byDoc = new Map();
    for (const refs of groups.values()) {
      refs.forEach(ref => {
        if (!ref.nextThumbUrl) return;
        if (!byDoc.has(ref.docName)) byDoc.set(ref.docName, []);
        byDoc.get(ref.docName).push(ref);
      });
    }
    for (const [docName, refs] of byDoc) {
      const res = await fetch(`https://firestore.googleapis.com/v1/${docName}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`read ${docName} failed ${res.status}`);
      const doc = decodeDoc(await res.json());
      const meeting = refs.some(ref => ref.meetingPhoto);
      if (meeting) {
        const photos = Array.isArray(doc.photos) ? doc.photos.map(photo => ({ ...photo })) : [];
        refs.forEach(ref => {
          if (photos[ref.index]) photos[ref.index].thumbUrl = ref.nextThumbUrl;
        });
        await patchFields(token, docName, { photos: jsToFirestore(photos) });
        continue;
      }
      const urls = Array.isArray(doc.imageUrls) && doc.imageUrls.length ? doc.imageUrls.slice() : (doc.imageUrl ? [doc.imageUrl] : []);
      const thumbs = Array.isArray(doc.thumbUrls) && doc.thumbUrls.length ? doc.thumbUrls.slice() : (doc.thumbUrl ? [doc.thumbUrl] : []);
      while (thumbs.length < urls.length) thumbs.push('');
      refs.forEach(ref => {
        if (!ref.meetingPhoto) thumbs[ref.index] = ref.nextThumbUrl;
      });
      await patchFields(token, docName, {
        thumbUrls: jsToFirestore(thumbs),
        thumbUrl: jsToFirestore(thumbs.find(Boolean) || ''),
      });
    }
  }

  if (apply && deleteSuperseded) {
    for (const [originalPath, refs] of groups) {
      const chat = refs.some(ref => isChatImageUpload(ref));
      const smallPath = siblingSmallStoragePath(originalPath);
      const thumbPath = refs.thumbPath || '';
      if (!smallPath || !thumbPath || thumbPath === originalPath || chat) continue;
      const smallMeta = await storageMetadata(token, smallPath);
      if (!smallMeta) continue;
      const stillReferenced = refs.some(ref => storagePathFromDownloadUrl(ref.thumbUrl) === thumbPath && !ref.nextThumbUrl);
      if (!canDeleteSupersededThumb({
        chat: false,
        thumbPath,
        originalPaths: [originalPath],
        smallExists: true,
        refsPointAtSmall: !stillReferenced,
        thumbStillReferenced: stillReferenced,
        thumbIsOriginalBytes: false,
      })) continue;
      await deleteObject(token, thumbPath);
      summary.deleted += 1;
    }
  }

  console.log(JSON.stringify(summary));
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
