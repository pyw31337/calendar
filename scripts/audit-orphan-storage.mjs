#!/usr/bin/env node
/**
 * Report Storage files that no document of any calendar (or any root collection) points at.
 * READ ONLY: nothing is deleted or moved. Photos are deleted only from the lightbox, and the
 * storageGc sweeper (functions/media-commands.js) removes those after the grace period; this
 * report only shows how much space files nobody shows take, so a person can decide.
 *
 *   node scripts/audit-orphan-storage.mjs
 *
 * Every variant of one upload (_original_/_thumb_/_small) shares a stem; when any variant of a
 * stem is referenced, all of them count as used (the app derives the small one from the URL).
 */
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const admin = require('firebase-admin');
const media = require('./media-commands.js');

const PROJECT = process.env.GCLOUD_PROJECT || 'metro-live-2918e';
admin.initializeApp({ projectId: PROJECT, storageBucket: process.env.STORAGE_BUCKET || `${PROJECT}.firebasestorage.app` });
const db = admin.firestore();
const bucket = admin.storage().bucket();

const stemOf = path => path.replace(/_(original|thumb)_[^/]*$|_small\.[a-z0-9]+$/i, '_');

async function collectFrom(ref, into) {
  const snap = await ref.get();
  snap.docs.forEach(doc => media.collectStoragePaths(doc.data(), into));
  return snap.size;
}

const referenced = new Set();
let documents = 0;
for (const collection of await db.listCollections()) {
  documents += await collectFrom(collection, referenced);
  if (collection.id !== 'calendars') continue;
  for (const calendarRef of await collection.listDocuments()) {
    for (const sub of await calendarRef.listCollections()) documents += await collectFrom(sub, referenced);
  }
}
const usedStems = new Set([...referenced].map(stemOf));

const [files] = await bucket.getFiles();
const report = { documents, referencedPaths: referenced.size, files: files.length, orphans: 0, orphanBytes: 0, byPrefix: {}, samples: [] };
for (const file of files) {
  if (referenced.has(file.name) || usedStems.has(stemOf(file.name))) continue;
  const bytes = Number(file.metadata?.size || 0);
  const prefix = file.name.split('/').slice(0, 2).join('/');
  report.orphans += 1;
  report.orphanBytes += bytes;
  report.byPrefix[prefix] = report.byPrefix[prefix] || { files: 0, bytes: 0 };
  report.byPrefix[prefix].files += 1;
  report.byPrefix[prefix].bytes += bytes;
  if (report.samples.length < 20) report.samples.push({ path: file.name, bytes, updated: file.metadata?.updated });
}
report.orphanMB = Math.round(report.orphanBytes / 1048576 * 10) / 10;
console.log(JSON.stringify(report, null, 2));
