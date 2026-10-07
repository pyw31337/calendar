import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('the deploy copier publishes only manifest-backed share routes', () => {
  const source = fs.readFileSync('scripts/copy-static-to-dist.mjs', 'utf8');
  assert.match(source, /published share calendars/);
  assert.match(source, /for \(const calendarId of calendarIds\) copyDir/);
  assert.doesNotMatch(source, /copyDir\(path\.join\(root, 'share'\), path\.join\(dist, 'share'\)\)/);
});
