import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPhotoIndexSummary } from '../src/core/photo-index.js';

test('photo index summary exposes a server-issued revision and tolerates pre-deploy absence', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async url => {
    calls.push(String(url));
    return {
      ok: true,
      status: 200,
      json: async () => ({ fields: { revision: { integerValue: '17' }, updatedAt: { integerValue: '1760000000000' } } })
    };
  };
  try {
    const summary = await fetchPhotoIndexSummary({ calendarId: 'summary_contract', projectId: 'demo-project', force: true });
    assert.deepEqual(summary, { version: '17', updatedAt: 1760000000000, exists: true });
    assert.match(calls[0], /cal_summary_contract\/photoIndexMeta\/summary$/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('missing summary remains a compatible live-read fallback during rollout', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) });
  try {
    const summary = await fetchPhotoIndexSummary({ calendarId: 'summary_missing', projectId: 'demo-project', force: true });
    assert.deepEqual(summary, { version: '', updatedAt: 0, exists: false });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
