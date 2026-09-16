import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const firebaseSrc = readFileSync(join(root, 'src/core/app-firebase-data.js'), 'utf8');
const helpersSrc = readFileSync(join(root, 'src/core/app-domain-helpers.js'), 'utf8');
const queueSrc = readFileSync(join(root, 'src/core/app-write-queue.js'), 'utf8');
const rulesSrc = readFileSync(join(root, 'firestore.rules'), 'utf8');

test('collection set honors options.merge on the SDK path', () => {
  assert.match(
    firebaseSrc,
    /if \(method === 'set'\) \{[\s\S]*?options\?\.merge \? \{ merge: true \} : undefined/,
    'SDK set must pass { merge: true } when options.merge is set'
  );
});

test('REST set+merge uses an updateMask so fields are not wiped', () => {
  assert.match(
    firebaseSrc,
    /useFieldMask = method === 'update' \|\| \(method === 'set' && options\?\.merge\)/,
    'REST fallback must field-mask set+merge writes'
  );
});

test('queued collection writes replay the merge flag', () => {
  assert.match(
    queueSrc,
    /merge: Boolean\(payload\.merge\)/,
    'collection-write replay must forward payload.merge'
  );
});

test('syncPushSubscriptionChannels prefers update then set+merge', () => {
  const idx = helpersSrc.indexOf('async function syncPushSubscriptionChannels');
  assert.ok(idx > 0);
  const block = helpersSrc.slice(idx, idx + 1800);
  assert.match(block, /'update',\s*'알림 채널 설정 동기화'/);
  assert.match(block, /'set',\s*'알림 채널 설정 동기화',\s*\{\s*merge:\s*true\s*\}/);
});

test('push_subscriptions updates use affectedKeys so lastPush* do not block channel sync', () => {
  const match = rulesSrc.match(/match \/push_subscriptions\/\{subId\} \{([\s\S]*?)\n\s{6}\}/);
  assert.ok(match, 'push_subscriptions rules block missing');
  const body = match[1];
  assert.match(body, /affectedKeys\(\)\.hasOnly\(pushClientWritableKeys\(\)\)/);
  assert.doesNotMatch(body, /allow create,\s*update:/);
  assert.match(body, /lastPush/);
});
