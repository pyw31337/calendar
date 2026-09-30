import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildKakaoLocationTags, appendLocationTags } = require('../functions/photo-location-tags.js');

test('server fallback creates independent Korean administrative hashtags from Kakao coordinates', () => {
  const tags = buildKakaoLocationTags({
    address: {
      region_1depth_name: '경기도',
      region_2depth_name: '광명시',
      region_3depth_name: '철산동'
    }
  });
  assert.deepEqual(tags, ['#경기도', '#광명시', '#철산동']);
});

test('server fallback appends only missing location hashtags and retains manual tags', () => {
  const result = appendLocationTags('#260929 #아이폰17 #경기도', ['#경기도', '#광명시']);
  assert.equal(result, '#260929 #아이폰17 #경기도 #광명시');
});
