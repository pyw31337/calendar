import test from 'node:test';
import assert from 'node:assert/strict';
import { URL } from 'node:url';
import { getInitialAppView, buildAppViewUrl } from '../src/core/app-routing-state.js';
import { photoLightbox, timestampMs } from '../src/ui/v2/view-data.js';

const location = search => ({ pathname: '/calendar/', search });
test('default routes ignore V2 tab/sub parameters', () => {
  assert.equal(getInitialAppView(location('?id=example&tab=records&sub=memo')), 'calendar');
  assert.equal(getInitialAppView(location('?view=chat&tab=records&sub=memo')), 'chat');
  assert.equal(buildAppViewUrl(location('?id=example'), 'memo'), '/calendar/?id=example&view=memo');
});
test('V2 destinations activate the corresponding existing data view', () => {
  for (const [sub, view] of Object.entries({ memo: 'memo', places: 'places', media: 'gallery', archive: 'history', content: 'content' })) {
    assert.equal(getInitialAppView(location(`?shell=v2&tab=records&sub=${sub}&view=chat`)), view);
    const url = buildAppViewUrl(location('?id=example&shell=v2&tab=chat'), view);
    const params = new URL(url, 'https://example.test').searchParams;
    assert.equal(params.get('tab'), 'records');
    assert.equal(params.get('sub'), sub);
    assert.equal(params.get('id'), 'example');
  }
  assert.equal(getInitialAppView(location('?shell=v2&tab=chat')), 'chat');
  assert.equal(getInitialAppView(location('?shell=v2&tab=settlement')), 'settlement');
  assert.equal(getInitialAppView(location('?shell=v2&tab=more')), 'calendar');
});
test('V2 home clears stale detail routes while retaining calendar identity', () => {
  const result = buildAppViewUrl(location('?shell=v2&id=example&tab=records&sub=memo&view=memo'), 'calendar');
  const params = new URL(result, 'https://example.test').searchParams;
  for (const key of ['tab', 'sub', 'view']) assert.equal(params.has(key), false);
  assert.equal(params.get('shell'), 'v2');
  assert.equal(params.get('id'), 'example');
});
test('direct share views remain authoritative', () => {
  assert.equal(getInitialAppView(location('?shell=v2&tab=chat'), () => ({ view: 'memo' })), 'memo');
});
test('gallery preview uses the shared lightbox URL and identity contract', () => {
  const photos = [{ full: 'https://example.test/a.jpg', messageId: 'm1', imageIndex: 0, assetKey: 'asset-1', thumb: 'thumb-1' }, { url: 'https://example.test/b.jpg', memoId: 'memo2', refKey: 'ref-2' }];
  const lightbox = photoLightbox(photos[1], photos);
  assert.deepEqual(lightbox.urls, photos.map(p => p.full || p.url));
  assert.equal(lightbox.index, 1);
  assert.equal(lightbox.meta[0].assetKey, 'asset-1');
  assert.equal(lightbox.meta[1].memoId, 'memo2');
  assert.equal(lightbox.meta[1].refKey, 'ref-2');
});
test('timestamps normalize without turning Firestore seconds into 1970 dates', () => {
  const ms = 1780000000000;
  for (const input of [ms, String(ms), { seconds: ms / 1000 }, { toMillis: () => ms }, { toDate: () => new Date(ms) }, new Date(ms).toISOString()]) assert.equal(timestampMs(input), ms);
  assert.equal(timestampMs(null), 0);
});
