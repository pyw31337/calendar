import test from 'node:test';
import assert from 'node:assert/strict';

const m = await import('../src/core/photo-index.js');

const row = i => ({ document: { name: `projects/p/databases/(default)/documents/calendars/cal_x/photoIndex/k${i}`, fields: { timestamp: { integerValue: String(10000 - i) } } } });
const decode = doc => ({ assetKey: doc.name.split('/').pop() });

function mockFirestore(total) {
  const bodies = [];
  globalThis.fetch = async (url, init) => {
    const q = JSON.parse(init.body).structuredQuery;
    bodies.push(q);
    let start = q.offset || 0;
    if (q.startAt) start = Number(q.startAt.values[1].referenceValue.split('/k').pop()) + 1;
    const rows = [];
    for (let i = start; i < Math.min(total, start + q.limit); i += 1) rows.push(row(i));
    return { ok: true, json: async () => rows };
  };
  return bodies;
}

test('sequential pages continue from the previous page cursor instead of an offset', async () => {
  const bodies = mockFirestore(250);
  m.invalidatePhotoIndexCache('x');
  const p1 = await m.fetchPhotoIndexPage({ calendarId: 'x', projectId: 'p', page: 1, decodeDocument: decode });
  const p2 = await m.fetchPhotoIndexPage({ calendarId: 'x', projectId: 'p', page: 2, decodeDocument: decode });
  const p3 = await m.fetchPhotoIndexPage({ calendarId: 'x', projectId: 'p', page: 3, decodeDocument: decode });
  assert.deepEqual([p1.length, p2.length, p3.length], [100, 100, 50]);
  assert.equal(p2[0].mediaKey, 'k100');
  assert.equal(p3[0].mediaKey, 'k200');
  assert.equal(bodies[1].offset, undefined);
  assert.equal(bodies[1].startAt.before, false);
  assert.equal(bodies[2].offset, undefined);
});

test('a direct jump without a cursor falls back to offset, and loadAll walks every row once', async () => {
  const bodies = mockFirestore(730);
  m.invalidatePhotoIndexCache('x');
  const p5 = await m.fetchPhotoIndexPage({ calendarId: 'x', projectId: 'p', page: 5, decodeDocument: decode });
  assert.equal(bodies[0].offset, 400);
  assert.equal(p5[0].mediaKey, 'k400');
  m.invalidatePhotoIndexCache('x');
  bodies.length = 0;
  const pages = await m.fetchAllPhotoIndexPages({ calendarId: 'x', projectId: 'p', pageCount: 8, decodeDocument: decode });
  const keys = pages.flat().map(item => item.mediaKey);
  assert.equal(keys.length, 730);
  assert.equal(new Set(keys).size, 730);
  assert.equal(bodies.length, 3);
  assert.ok(bodies.every(body => !body.offset));
});
