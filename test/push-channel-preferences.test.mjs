import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePushChannelPreferences } from '../src/core/push-channel-preferences.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('chat master override wins over a stale global chat channel preference', () => {
  assert.deepEqual(
    normalizePushChannelPreferences({ chat: false, memo: false, poll: true, schedule: false }, { chat: true }),
    { chat: true, memo: false, poll: true, schedule: false }
  );
});

test('channel normalization defaults legacy subscriptions to every supported channel', () => {
  assert.deepEqual(
    normalizePushChannelPreferences(null, null),
    { chat: true, memo: true, poll: true, schedule: true }
  );
});

test('notification state re-registers an enabled chat master with a chat delivery override', () => {
  const stateSrc = readFileSync(join(root, 'src/core/notification-pwa-state.js'), 'utf8');
  assert.match(stateSrc, /channelOverrides:\s*\{\s*chat:\s*true\s*\}/);
  assert.match(stateSrc, /subscribeUserToPush\(activeCalId, chatParticipantId, getChatDeliveryOptions\(\)\)/);
  assert.match(stateSrc, /ensurePushSubscriptionHealthy\(activeCalId, participantId, getChatDeliveryOptions\(\)\)/);
});

test('chat push trigger logs recipient-selection results for delivery diagnosis', () => {
  const functionSrc = readFileSync(join(root, 'functions/index.js'), 'utf8');
  assert.match(functionSrc, /Push broadcast result/);
  assert.match(functionSrc, /Chat push dispatch/);
  assert.match(functionSrc, /skippedChannel/);
});

test('chat push notification title uses senderName directly to avoid redundancy with iOS from-label', () => {
  const functionSrc = readFileSync(join(root, 'functions/index.js'), 'utf8');
  assert.match(functionSrc, /title:\s*senderName\s*\|\|\s*calendarTitle/);
});

