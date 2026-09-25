import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chatMessageSignature } from '../src/core/chat-message-signature.js';

// The chat watchdog probes the newest message (1 read) before re-reading the whole live window;
// equal signatures mean the realtime listener already delivered the head of the list.
test('signature matches for the same message and changes on edit/delete/new message', () => {
  const m = { id: 'a', timestamp: 10, text: 'hi', images: [{}] };
  assert.equal(chatMessageSignature(m), chatMessageSignature({ ...m, participantId: 'x' }));
  assert.notEqual(chatMessageSignature(m), chatMessageSignature({ ...m, text: 'edited' }));
  assert.notEqual(chatMessageSignature(m), chatMessageSignature({ ...m, updatedAt: 11 }));
  assert.notEqual(chatMessageSignature(m), chatMessageSignature({ ...m, deleted: true }));
  assert.notEqual(chatMessageSignature(m), chatMessageSignature({ ...m, id: 'b' }));
  assert.equal(chatMessageSignature(null), '');
});

test('the listener depends on the effective window, and the watchdog probes before a full read', () => {
  const src = fs.readFileSync('src/core/use-chat-message-window.js', 'utf8');
  assert.match(src, /\}, \[activeCalId, activeView, liveChatLimit, firebaseDb, firebaseConnectionVersion\]\);/);
  assert.match(src, /const probe = await fetchNewestMessage\(activeCalId\);[\s\S]{0,200}chatMessageSignature\(probe\) === chatMessageSignature\(knownNewest\)\) return;/);
  assert.match(src, /handleOnline = \(\) => \{ void reconcile\(\{ full: true \}\); \}/);
});
