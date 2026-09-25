import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanAddress,
  cleanMultilineText,
  compactItem,
  decodeHtmlEntities,
  inferRegion,
  isVisible,
  mergeDuplicates,
  normalizeItem,
  normalizeTitleForMatch,
  parseDateRange,
  venuesMatch
} from '../scripts/lib/culture-normalize.mjs';

test('titles from ticket portals and KOPIS normalize to the same key', () => {
  assert.equal(normalizeTitleForMatch('뮤지컬 〈해몽가〉'), normalizeTitleForMatch('해몽가'));
  assert.equal(normalizeTitleForMatch('연극 〈타인의 삶〉'), normalizeTitleForMatch('타인의 삶'));
  assert.equal(normalizeTitleForMatch('[뮤지컬] 써니텐'), normalizeTitleForMatch('써니텐'));
  assert.equal(normalizeTitleForMatch('늙지 않는 마음 [대학로]'), normalizeTitleForMatch('연극 〈늙지 않는 마음〉'));
  assert.equal(normalizeTitleForMatch('2026 세계음악극축제 : 혜성컴퍼니 〈백만사〉'), normalizeTitleForMatch('세계 음악극 축제, 혜성컴퍼니: 백만사'));
  // Bracket content that IS the title is kept rather than normalizing to nothing.
  assert.equal(normalizeTitleForMatch('[해몽가]'), '해몽가');
  // Different shows under one generic genre word must not collapse together.
  assert.notEqual(normalizeTitleForMatch('뮤지컬 〈해몽가〉'), normalizeTitleForMatch('뮤지컬 〈콰이어 오브 맨〉'));
});

test('venue matching tolerates suffixes and former names but not unrelated halls', () => {
  assert.ok(venuesMatch('예스24 스테이지 구. DCF대명문화공장', '예스24 스테이지'));
  assert.ok(venuesMatch('킨텍스', '일산 킨텍스 제 2전시장'));
  assert.ok(venuesMatch('세티 라이브홀 (SETI LIVE HALL) (세티 라이브홀)', '세티 라이브홀'));
  assert.ok(!venuesMatch('부산시민회관', '서울상상나라 극장'));
  assert.ok(!venuesMatch('홀', '예술의전당 콘서트홀'), 'too-short names never match by containment');
  assert.ok(!venuesMatch('', ''));
});

test('mergeDuplicates merges one run listed twice and keeps separate tours apart', () => {
  const items = [
    { id: 'k1', title: '해몽가', venue: '예스24 스테이지 구. DCF대명문화공장', startDate: '2026-06-25', endDate: '2026-09-13', source: 'kopis', image: '' },
    { id: 'i1', title: '뮤지컬 〈해몽가〉', venue: '예스24 스테이지', startDate: '2026-06-25', endDate: '2026-09-20', source: 'interpark', image: 'https://img/p.jpg', price: '55,000원' },
    { id: 'k2', title: '타인의 삶', venue: 'LG아트센터 서울', startDate: '2026-07-01', endDate: '2026-09-13', source: 'kopis' },
    { id: 'k3', title: '타인의 삶', venue: '부산시민회관', startDate: '2026-11-06', endDate: '2026-11-07', source: 'kopis' }
  ];
  const { items: out, mergedCount } = mergeDuplicates(items);
  assert.equal(mergedCount, 1);
  assert.equal(out.length, 3);
  const haemong = out.find(i => i.id === 'k1');
  assert.ok(haemong, 'first-seen id survives so existing cultureSourceId links keep resolving');
  assert.equal(haemong.image, 'https://img/p.jpg');
  assert.equal(haemong.price, '55,000원');
  assert.equal(haemong.endDate, '2026-09-20', 'merged run covers both listings');
  assert.equal(haemong.source, 'kopis+interpark');
  assert.deepEqual(out.filter(i => i.title === '타인의 삶').map(i => i.id), ['k2', 'k3']);
});

test('non-overlapping dates at the same venue stay separate', () => {
  const { items: out } = mergeDuplicates([
    { id: 'a', title: '11시 콘서트 (9월)', venue: '예술의전당', startDate: '2026-09-10', endDate: '2026-09-10', source: 'kopis' },
    { id: 'b', title: '11시 콘서트 (10월)', venue: '예술의전당', startDate: '2026-10-08', endDate: '2026-10-08', source: 'kopis' }
  ]);
  assert.equal(out.length, 2);
});

test('HTML entities (including double-encoded ones) and tags are cleaned', () => {
  assert.equal(decodeHtmlEntities('상설전시 &&#35;39;깨달음&&#35;39;'), "상설전시 '깨달음'");
  assert.equal(decodeHtmlEntities('동탄공룡월드&amp;키즈카페'), '동탄공룡월드&키즈카페');
  assert.equal(cleanMultilineText('[공연소개]&#13;\n&#13;\n<b>오직</b> 6명<br/>만의'), '[공연소개]\n\n오직 6명\n만의');
  assert.equal(cleanMultilineText('a'.repeat(700), 600).length, 600);
});

test('region is backfilled from the address or a venue tag', () => {
  assert.equal(inferRegion({ region: 'etc', address: '세종특별자치시 국립박물관로 21' }), 'sejong');
  assert.equal(inferRegion({ region: 'etc', address: '전남광주통합특별시 북구 북문대로 60' }), 'gwangju');
  assert.equal(inferRegion({ region: 'etc', address: '전남광주통합특별시 여수시 예울마루로 100' }), 'jeonnam');
  assert.equal(inferRegion({ region: 'etc', address: 'etc 녹천탕 [부산 서구]', venue: '녹천탕 [부산 서구]' }), 'busan');
  assert.equal(inferRegion({ region: 'seoul', address: '부산광역시 중구' }), 'seoul', 'a valid upstream code is trusted');
  assert.equal(inferRegion({ region: 'etc', address: 'etc 카페245', venue: '카페245' }), 'etc');
  assert.equal(cleanAddress('etc 카페245'), '');
  assert.equal(cleanAddress('정보 없음'), '');
});

test('dates: reversed ranges are repaired, grace window and open runs are kept', () => {
  assert.deepEqual(parseDateRange('2026.09.10 (목) ~ 2026.09.01 (화)'), { startDate: '2026-09-01', endDate: '2026-09-10' });
  assert.ok(isVisible('2026-09-01', '2026-08-01', '2026-09-25'));
  assert.ok(!isVisible('2026-08-01', '2026-07-01', '2026-09-25'));
  assert.ok(isVisible(null, null, '2026-09-25', { openEnded: true }));
});

test('normalizeItem + compactItem drop empty fields but keep explicit booleans', () => {
  const { item } = normalizeItem({
    id: 'kopis_1', title: ' ［제주］  아쿠아플라넷 ', date: '2026.07.10 (금) ~ 2028.07.08 (토)',
    link: 'https://example.com/x', venue: '아쿠아플라넷', address: '제주특별자치도 서귀포시 성산읍',
    region: 'etc', genre: 'activity', image: '/images/posters/a.webp', source: 'interpark'
  });
  assert.equal(item.title, '[제주] 아쿠아플라넷');
  assert.equal(item.region, 'jeju');
  assert.equal(item.image, 'https://pyw31337.github.io/culture/images/posters/a.webp');
  const compact = compactItem(item);
  assert.equal(compact.isOpenEnded, false, 'readers treat a missing isOpenEnded as open-ended');
  assert.ok(!('homeTeam' in compact));
  assert.ok(!('cast' in compact));
  assert.ok(!('posterSources' in compact));
});

test('undated films are kept and labeled 개봉 미정', () => {
  const { item, openEnded } = normalizeItem({ id: 'movie_x', title: '사피엔스', date: '', link: 'https://example.com', genre: 'movie', source: 'movie', address: '정보 없음' });
  assert.equal(openEnded, true);
  assert.equal(item.dateLabel, '개봉 미정');
  assert.equal(item.address, '');
});
