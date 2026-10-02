import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isExcludedFromPeople, withNotAPersonTag, withoutPersonTag } from '../src/ui/archive-person-exclusion.js';

test('분류 필요 제외 adds the 인물아님 mark once, in front', () => {
  assert.deepEqual(withNotAPersonTag('220604 리버파크펜션'), { status: 'add', tags: '인물아님 220604 리버파크펜션', before: '220604 리버파크펜션' });
  assert.equal(withNotAPersonTag('인물아님 220604').status, 'already');
  assert.equal(isExcludedFromPeople('#220604 #인물아님'), true);
  assert.equal(isExcludedFromPeople('220604'), false);
});

test('a person view 제외 removes every tag that person matches, nothing else', () => {
  assert.deepEqual(withoutPersonTag('201018 박영우 영우사진 미나', '박영우'), { status: 'remove', tags: '201018 미나', before: '201018 박영우 영우사진 미나' });
  assert.equal(withoutPersonTag('201018 미나', '박영우').status, 'already');
});

test('보관함 인물 tab never deletes photos: its bulk button excludes', () => {
  const src = readFileSync(new URL('../src/ui/ui-summary-gallery.js', import.meta.url), 'utf8');
  assert.match(src, /onDeletePhotos: handleExcludeSelectedPeoplePhotos,\s*deleteMode: 'exclude'/);
  assert.doesNotMatch(src, /handleDeleteSelectedPeoplePhotos/);
});
