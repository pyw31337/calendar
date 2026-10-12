import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

// The Mac photo tools are Python. Their end-to-end check (fake Takeout folder, fake calendar
// photos, no network) runs wherever python3 + Pillow exist -- the family Mac and this dev box;
// CI runners without Pillow skip it.
const python = spawnSync('python3', ['-I', '-c', 'import PIL'], { encoding: 'utf8' });

test('people import: upload-date fix, name pair suggestions, verified people for face learning', { skip: python.status !== 0 && 'python3 with Pillow not installed' }, () => {
  const run = spawnSync('python3', ['-I', 'tools/local-media-worker/test_people_import.py'], { encoding: 'utf8', timeout: 240000 });
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.match(run.stderr, /\nOK/);
});
