import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectCandidate } from '../scripts/scan-secrets.mjs';

function withTempFile(name, content, run) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'calendar-secret-scan-'));
  const file = path.join(directory, name);
  try {
    fs.writeFileSync(file, content);
    return run(file, directory);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('secret scan catches Firebase Admin filenames without printing file contents', () => {
  withTempFile('project-firebase-adminsdk-abc.json', '{}', (file, root) => {
    assert.deepEqual(inspectCandidate(file, root), [
      { path: 'project-firebase-adminsdk-abc.json', rule: 'firebase-admin-service-account-filename' },
    ]);
  });
});

test('secret scan catches service account private keys and leaves normal Firebase config alone', () => {
  withTempFile('firebase.json', '{"projectId":"demo"}', (file, root) => {
    assert.deepEqual(inspectCandidate(file, root), []);
  });
  const privateKeyValue = `-----BEGIN ${'PRIVATE KEY'}-----\\nexample`;
  withTempFile('config.json', `{"private_key":"${privateKeyValue}"}`, (file, root) => {
    assert.deepEqual(inspectCandidate(file, root).map(finding => finding.rule), [
      'private-key-pem',
      'service-account-private-key',
    ]);
  });
});
