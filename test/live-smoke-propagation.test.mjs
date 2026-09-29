import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('live smoke keeps exact build validation while allowing a realistic Pages CDN propagation window', () => {
  const source = readFileSync('scripts/live-smoke-check.mjs', 'utf8');

  assert.match(source, /const DEFAULT_DEPLOY_PROPAGATION_ATTEMPTS = 25;/);
  assert.match(source, /PAGES_DEPLOY_MAX_ATTEMPTS/);
  assert.match(source, /const maxDeployAttempts = expectedBuildSha/);
  assert.match(source, /Deployed build SHA mismatch/);
  assert.match(source, /DEPLOY_PROPAGATION_RETRY_MS/);
});
