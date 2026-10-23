#!/usr/bin/env node
/**
 * Update Cache-Control metadata for Firebase Storage files to 1 year + immutable:
 *   "public, max-age=31536000, immutable"
 *
 * Safe & idempotent:
 * - Does NOT touch file contents or download/re-upload files.
 * - Files that already have the target Cache-Control are skipped.
 * - Default is DRY-RUN mode. Set APPLY=1 to commit changes.
 *
 * Usage:
 *   node scripts/ops-set-storage-cache-control.mjs            # Dry-run report
 *   APPLY=1 node scripts/ops-set-storage-cache-control.mjs   # Apply changes
 */

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PROJECT = process.env.GCLOUD_PROJECT || 'metro-live-2918e';
const BUCKET = process.env.STORAGE_BUCKET || `${PROJECT}.firebasestorage.app`;
const TARGET_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const APPLY = process.env.APPLY === '1';
const CONCURRENCY = Math.max(1, Math.min(50, Number(process.env.CONCURRENCY) || 25));

function getAccessToken() {
  const customToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.GCS_TOKEN;
  if (customToken) return customToken;

  const configstorePath = join(homedir(), '.config/configstore/firebase-tools.json');
  if (existsSync(configstorePath)) {
    try {
      const cfg = JSON.parse(readFileSync(configstorePath, 'utf8'));
      const token = cfg.tokens?.access_token;
      if (token) return token;
    } catch (_) { /* ignore */ }
  }
  return null;
}

const token = getAccessToken();
if (!token) {
  console.error('[ops-set-storage-cache-control] Error: Could not obtain OAuth access token from Firebase CLI or environment.');
  console.error('Please run "npx firebase login" first.');
  process.exit(1);
}

const authHeader = { Authorization: `Bearer ${token}` };

async function listAllFiles() {
  const files = [];
  let pageToken = '';
  console.log(`[ops-set-storage-cache-control] Listing files in bucket "${BUCKET}"...`);

  do {
    const url = new URL(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(BUCKET)}/o`);
    url.searchParams.set('maxResults', '1000');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), { headers: authHeader });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to list files (${res.status}): ${body}`);
    }

    const data = await res.json();
    if (Array.isArray(data.items)) {
      files.push(...data.items);
    }
    pageToken = data.nextPageToken || '';
    process.stdout.write(`  Found ${files.length} files...\r`);
  } while (pageToken);

  console.log(`\n[ops-set-storage-cache-control] Total files found: ${files.length}`);
  return files;
}

async function updateFileCacheControl(file) {
  const objectName = file.name;
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(BUCKET)}/o/${encodeURIComponent(objectName)}`;
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cacheControl: TARGET_CACHE_CONTROL
        })
      });

      if (res.ok) return;

      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`HTTP ${res.status}: ${await res.text()}`);
        await new Promise(r => setTimeout(r, 200 * attempt));
        continue;
      }

      const body = await res.text();
      throw new Error(`Failed to patch ${objectName} (${res.status}): ${body}`);
    } catch (err) {
      lastError = err;
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 200 * attempt));
      }
    }
  }

  throw lastError || new Error(`Failed to patch ${objectName} after 3 attempts`);
}

async function runPool(items, concurrency, fn) {
  let index = 0;
  let running = 0;
  let completed = 0;
  const errors = [];

  return new Promise(resolve => {
    function next() {
      if (index >= items.length && running === 0) {
        return resolve(errors);
      }
      while (running < concurrency && index < items.length) {
        const item = items[index++];
        running++;
        fn(item)
          .then(() => {
            completed++;
            if (completed % 25 === 0 || completed === items.length) {
              process.stdout.write(`  Progress: ${completed}/${items.length} (${Math.round((completed / items.length) * 100)}%)\r`);
            }
          })
          .catch(err => {
            errors.push({ item: item.name, error: err.message });
          })
          .finally(() => {
            running--;
            next();
          });
      }
    }
    next();
  });
}

async function main() {
  console.log(`=== Storage Cache-Control Batch Manager ===`);
  console.log(`Mode: ${APPLY ? '🚀 LIVE APPLY' : '🔍 DRY-RUN (no changes will be made)'}`);
  console.log(`Target: ${TARGET_CACHE_CONTROL}\n`);

  const files = await listAllFiles();

  const toUpdate = [];
  const alreadySet = [];

  for (const file of files) {
    if (file.cacheControl === TARGET_CACHE_CONTROL) {
      alreadySet.push(file);
    } else {
      toUpdate.push(file);
    }
  }

  console.log(`\n--- Status Summary ---`);
  console.log(`Already has target Cache-Control: ${alreadySet.length}`);
  console.log(`Needs Cache-Control update:       ${toUpdate.length}`);

  if (toUpdate.length === 0) {
    console.log(`\n🎉 All files already have the target Cache-Control setting! Nothing to do.`);
    return;
  }

  if (toUpdate.length > 0) {
    console.log(`\nSample files to be updated:`);
    toUpdate.slice(0, 5).forEach(f => {
      console.log(`  - ${f.name} (current: ${f.cacheControl || 'none'})`);
    });
  }

  if (!APPLY) {
    console.log(`\n💡 This was a DRY-RUN. To apply these ${toUpdate.length} updates, run:`);
    console.log(`   APPLY=1 node scripts/ops-set-storage-cache-control.mjs\n`);
    return;
  }

  console.log(`\nStarting updates with concurrency ${CONCURRENCY}...`);
  const errors = await runPool(toUpdate, CONCURRENCY, updateFileCacheControl);

  console.log(`\n\n--- Update Results ---`);
  console.log(`Successfully updated: ${toUpdate.length - errors.length}`);
  console.log(`Failed:               ${errors.length}`);

  if (errors.length > 0) {
    console.error(`\nErrors encountered:`);
    errors.slice(0, 10).forEach(e => console.error(`  - ${e.item}: ${e.error}`));
    process.exitCode = 1;
  } else {
    console.log(`\n✅ All ${toUpdate.length} files successfully updated to 1-year cache!`);
  }
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
