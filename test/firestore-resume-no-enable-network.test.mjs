import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// enableNetwork() on a live Listen stream makes the SDK re-send every active target; the backend
// rejects them ("Target ID already exists") and every realtime listener dies until a reload.
// Production logged ~400 realtime_fallback:already-exists bursts from the foreground handlers
// that called it. The network is never disabled, so there is nothing for it to re-enable.
test('no src code calls firestore enableNetwork()', () => {
  const hits = [];
  (function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/\.(js|jsx|mjs)$/.test(name)) {
        fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
          if (/\benableNetwork\s*\(/.test(line) && !/^\s*(\/\/|\*)/.test(line)) hits.push(`${p}:${i + 1}`);
        });
      }
    }
  })('src');
  assert.deepEqual(hits, []);
});
