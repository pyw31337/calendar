import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildIntegrityReview, assetProjection, assetEdges } = require('../functions/media-graph.js');

const assetKey = 'asset:v1:stable-photo';
const full = 'https://firebasestorage.googleapis.com/v0/b/demo/o/photos%2Foriginal.jpg?alt=media&token=rotated';

test('integrity review preserves broken media and marks it for restore/reupload/hide instead of deletion', () => {
  const report = buildIntegrityReview({
    calendarId: 'cw',
    indexRows: [{ assetKey, full, thumb: full, tags: '파주', owners: [{ sourceOwner: 'message:m1:0', full }], legacyKeys: ['chat:m1:0'] }],
    messages: [{ id: 'm1', imageUrls: [full], imageTags: ['파주'] }],
    missingAssetKeys: new Set([assetKey])
  });
  const missing = report.findings.find(item => item.kind === 'missing_asset');
  assert.ok(missing);
  assert.deepEqual(missing.actions, ['restore_from_backup', 'reupload', 'hide']);
  assert.equal(report.assets[0].status, 'active');
});

test('legacy comment threads migrate only when an immutable asset-key alias resolves', () => {
  const common = {
    calendarId: 'cw',
    indexRows: [{ assetKey, full, thumb: full, owners: [{ sourceOwner: 'message:m1:0', full }], legacyKeys: ['chat:m1:0'] }],
    messages: [{ id: 'm1', imageUrls: [full] }]
  };
  const report = buildIntegrityReview({ ...common, comments: [
    { id: 'chat:m1:0', comments: [{ id: 'c1', text: '연결됨' }] },
    { id: 'chat:gone:0', comments: [{ id: 'c2', text: '검토 필요' }] }
  ] });
  assert.equal(report.findings.filter(item => item.kind === 'legacy_comment_migratable').length, 1);
  assert.equal(report.findings.filter(item => item.kind === 'legacy_comment_unresolved').length, 1);
});

test('asset projection and edges use immutable asset identity while keeping a meeting relation separate from its date', () => {
  const row = {
    assetKey, full, thumb: full, tags: '경기도 파주시 하니랜드', timestamp: 100,
    owners: [{ sourceOwner: 'meeting:2026-09-20:0', meetingId: 'meeting:opaque', meetingDate: '2026-09-20', participantId: 'p1' }]
  };
  const asset = assetProjection(row, { calendarId: 'cw' });
  const [edge] = assetEdges(row);
  assert.equal(asset.assetId, assetKey);
  assert.deepEqual(asset.tags.free, ['경기도', '파주시', '하니랜드']);
  assert.equal(edge.meetingId, 'meeting:opaque');
  assert.equal(edge.meetingDate, '2026-09-20');
  assert.notEqual(edge.meetingId, edge.meetingDate);
});
