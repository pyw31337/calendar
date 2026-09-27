import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLocationHashtags,
  mergeLocationResults,
  parseKakaoAddress
} from '../src/core/photo-metadata-tags.js';

test('Korean photo GPS tags retain venue, province, city and 읍·면·동 independently', () => {
  const tags = buildLocationHashtags({
    country: '대한민국',
    province: '경기도',
    city: '파주시',
    suburb: '문산읍',
    building: '하니랜드'
  }, '하니랜드');
  assert.deepEqual(tags, ['#하니랜드', '#경기도', '#파주시', '#문산읍', '#경기도파주시']);
});

test('Kakao and fallback reverse-geocode results do not discard 읍·면·동 during merge', () => {
  const kakao = parseKakaoAddress({
    road_address: {
      region_1depth_name: '경기',
      region_2depth_name: '파주시',
      building_name: '하니랜드'
    },
    address: {
      region_1depth_name: '경기',
      region_2depth_name: '파주시',
      region_3depth_name: '문산읍'
    }
  });
  const merged = mergeLocationResults(kakao, { locationTags: ['#파주시'], sido: '경기도', sigungu: '파주시' });
  assert.equal(merged.dong, '문산읍');
  assert.ok(merged.locationTags.includes('#문산읍'));
  assert.ok(merged.locationTags.includes('#하니랜드'));
});
