import assert from 'node:assert/strict';
import test from 'node:test';
import { getPhotoTagCompleteness } from '../src/core/photo-tag-completeness.js';
import { hasEquivalentPhotoTag, photoMatchesPlaceTag } from '../src/core/photo-tag-identity.js';
import { classifyPhoto } from '../tools/local-media-worker/analysis-evidence.mjs';
const calendar = {
  participants: [{ name: '박영우', aliases: ['아빠', 'Young'] }, { name: '송은혜', nickname: '은혜' }],
  customPersonTags: ['서준', { name: '도은', aliases: ['둘째'] }],
  places: [{ name: '속리산 숲체험휴양마을', alias: '속리산숙소' }, { title: '영월 외룡캠핑장', aliases: ['외룡캠핑장'] }]
};

test('existing person aliases, given names, compact place names and aliases are classified consistently', () => {
  for (const tags of [
    '#261006 #영우 #속리산숲체험휴양마을',
    '#2026-10-06 #서준 #도은 #속리산숙소',
    '261006 둘째 외룡캠핑장',
    '261006 Ｙｏｕｎｇ 영월외룡캠핑장',
    '261006 은혜 #속리산_숲체험휴양마을'
    , '#261006 #서준 #속리산 숲체험휴양마을'
  ]) {
    const result = getPhotoTagCompleteness(tags, calendar);
    assert.deepEqual(result.missing, [], tags);
    assert.ok(result.evidence.people.length > 0);
    assert.ok(result.evidence.places.length > 0);
  }
  assert.equal(photoMatchesPlaceTag({ tags: '외룡캠핑장' }, calendar.places[1]), true);
  assert.equal(photoMatchesPlaceTag({ tags: '서울랜드마크' }, { name: '서울랜드' }), false);
  assert.equal(photoMatchesPlaceTag({ tags: '외룡캠핑장2호점' }, calendar.places[1]), false);
});

test('administrative location tags need not be registered as venues', () => {
  for (const tag of ['경기도', '광명시', '경기도광명시', '서울특별시강남구', '강원특별자치도', '영월군']) {
    assert.equal(getPhotoTagCompleteness(`261006 서준 ${tag}`, calendar).isComplete, true, tag);
  }
  for (const tag of ['맛있구', '정말멋지시', '구', '랜드']) {
    assert.equal(getPhotoTagCompleteness(tag, { places: [{ name: '서울랜드' }] }).hasPlace, false, tag);
  }
});

test('typed metadata and explicit category exclusions do not trigger repeated tag requests', () => {
  const typed = getPhotoTagCompleteness('261006', {}, { personTags: [{ name: '서준' }], locationTags: ['광명시'] });
  assert.equal(typed.isComplete, true);
  const excluded = getPhotoTagCompleteness('261006 인물아님 장소아님', calendar);
  assert.equal(excluded.isComplete, true);
  assert.deepEqual(excluded.missing, []);
  assert.equal(excluded.hasPerson, false, 'an exemption is not a person detection');
});

test('unloaded photo data is unknown, not missing; invalid dates and unrelated name substrings are not facts', () => {
  const pending = getPhotoTagCompleteness('', calendar, { sourceAvailable: false });
  assert.equal(pending.status, 'pending');
  assert.deepEqual(pending.missing, []);
  assert.equal(pending.isComplete, false);
  assert.equal(getPhotoTagCompleteness('260230', calendar).hasDate, false);
  assert.equal(getPhotoTagCompleteness('영우동 도은혜', calendar).hasPerson, false);
  assert.equal(getPhotoTagCompleteness('영우사진', calendar).hasPerson, true);
});

test('existing aliases suppress redundant full-name recommendations in both worker and UI', () => {
  const photo = { tags: '261006 영우 속리산숙소 광명시' };
  assert.equal(hasEquivalentPhotoTag('박영우', photo, calendar), true);
  assert.equal(hasEquivalentPhotoTag('속리산숲체험휴양마을', photo, calendar), true);
  const analysis = classifyPhoto(photo, { suggestedTags: ['박영우', '속리산숲체험휴양마을', '공원'] }, calendar);
  assert.deepEqual(analysis.suggestedTags, ['공원']);
  assert.ok(analysis.people.includes('영우'));
  assert.ok(analysis.places.includes('광명시'));
});

test('ambiguous given names and shared aliases remain person tags without suppressing distinct people', () => {
  const sharedNames = {
    participants: [
      { id: 'park', name: '박영우', aliases: ['아빠', 'YoungPark'] },
      { id: 'kim', name: '김영우', aliases: ['아빠', 'YoungKim'] }
    ]
  };
  for (const existing of ['영우', '영우사진', '아빠']) {
    const photo = { tags: existing };
    assert.equal(getPhotoTagCompleteness(existing, sharedNames).hasPerson, true, existing);
    assert.equal(hasEquivalentPhotoTag('박영우', photo, sharedNames), false, existing);
    assert.equal(hasEquivalentPhotoTag('김영우', photo, sharedNames), false, existing);
  }
  assert.equal(hasEquivalentPhotoTag('아빠', { tags: '아빠' }, sharedNames), true, 'exact tags are still identical');
  assert.equal(hasEquivalentPhotoTag('영우', { tags: '박영우' }, sharedNames), false, 'ambiguity applies to the candidate too');
  assert.equal(hasEquivalentPhotoTag('김영우', { tags: '박영우' }, sharedNames), false);
  assert.equal(hasEquivalentPhotoTag('박영우', { tags: 'YoungPark' }, sharedNames), true);
  assert.equal(hasEquivalentPhotoTag('박영우', { tags: '영우사진' }, { participants: [sharedNames.participants[0]] }), true);
  assert.deepEqual(classifyPhoto({ tags: '261006 영우 광명시' }, { suggestedTags: ['박영우', '김영우'] }, sharedNames).suggestedTags,
    ['박영우', '김영우'], 'worker preserves recommendations that ambiguous tags cannot resolve');
});

test('parent relationship suffixes never imply identity with the named child', () => {
  const family = { participants: [{ id: 'child', name: '유리' }, { id: 'mother', name: '유리엄마' }, { id: 'father', name: '유리아빠' }] };
  for (const parent of ['유리엄마', '유리아빠']) {
    assert.equal(getPhotoTagCompleteness(parent, family).hasPerson, true, 'registered parent remains classified');
    assert.equal(hasEquivalentPhotoTag('유리', { tags: parent }, family), false);
    assert.equal(hasEquivalentPhotoTag(parent, { tags: '유리' }, family), false);
    assert.equal(hasEquivalentPhotoTag('유리', { tags: parent }, { participants: [family.participants[0]] }), false);
    assert.equal(hasEquivalentPhotoTag(parent, { tags: parent }, family), true);
  }
});

test('place identity cache follows in-place name and alias edits', () => {
  const place = { name: '기존숙소', aliases: ['예전별칭'] };
  const placesCalendar = { places: [place] };
  assert.equal(photoMatchesPlaceTag({ tags: '기존숙소' }, place), true);
  assert.equal(hasEquivalentPhotoTag('기존숙소', { tags: '예전별칭' }, placesCalendar), true);
  place.name = '새숙소';
  place.aliases[0] = '새별칭';
  assert.equal(photoMatchesPlaceTag({ tags: '기존숙소' }, place), false);
  assert.equal(photoMatchesPlaceTag({ tags: '새숙소' }, place), true);
  assert.equal(hasEquivalentPhotoTag('새숙소', { tags: '예전별칭' }, placesCalendar), false);
  assert.equal(hasEquivalentPhotoTag('새숙소', { tags: '새별칭' }, placesCalendar), true);
  place.aliases.push('추가별칭');
  assert.equal(photoMatchesPlaceTag({ tags: '추가별칭' }, place), true);
  place.aliases.splice(0, 1);
  assert.equal(photoMatchesPlaceTag({ tags: '새별칭' }, place), false);
});

test('typed and caption tags and long dates are not re-suggested by the worker', () => {
  for (const photo of [
    { tags: '2026-10-06', capturedAt: '2026-10-06', personTags: ['서준'], placeTags: [], locationTags: ['광명시'] },
    { tags: '261006', caption: '#영우 #속리산 숲체험휴양마을' }
  ]) {
    assert.equal(getPhotoTagCompleteness(photo.tags, calendar, photo).isComplete, true);
    assert.deepEqual(classifyPhoto(photo, {}, calendar).suggestedTags, []);
  }
  const excluded = classifyPhoto({ tags: '261006 인물아님 장소아님', latitude: 37, longitude: 127 },
    { ocrText: ['박영우'] }, { participants: calendar.participants, places: { p: { name: '숙소', lat: 37, lng: 127 } } });
  assert.deepEqual(excluded.suggestedTags, []);
});
