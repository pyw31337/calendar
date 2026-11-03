import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARCHIVE_CACHE_TTL_MS,
  getArchiveStorageKey,
  getPersistedArchiveCache,
  savePersistedArchiveCache,
  clearPersistedArchiveCache,
  computeArchiveMemoryGroups
} from '../src/core/archive-smart-cache.js';

test('archive-smart-cache: saves and retrieves cached memory groups with TTL', () => {
  const calId = 'test-cal-1';
  clearPersistedArchiveCache(calId);

  const testData = {
    memoryGroups: [
      {
        id: 'anniv-1',
        title: '여름 제주 여행',
        startDate: '2026-07-10',
        endDate: '2026-07-12',
        photos: [
          { full: 'https://example.com/p1.jpg', thumb: 'https://example.com/p1_t.jpg', assetKey: 'k1' },
          { full: 'https://example.com/p2.jpg', thumb: 'https://example.com/p2_t.jpg', assetKey: 'k2' }
        ]
      }
    ]
  };

  savePersistedArchiveCache(calId, testData);
  const cached = getPersistedArchiveCache(calId);
  assert.ok(cached, 'Cache should exist');
  assert.equal(cached.memoryGroups?.length, 1);
  assert.equal(cached.memoryGroups[0].title, '여름 제주 여행');
  assert.equal(cached.memoryGroups[0].photos.length, 2);

  clearPersistedArchiveCache(calId);
  assert.equal(getPersistedArchiveCache(calId), null);
});

test('archive-smart-cache: computeArchiveMemoryGroups correctly groups and sorts', () => {
  const anniversaries = [
    { id: 'a1', title: '봄 나들이', startDate: '2026-04-01', endDate: '2026-04-02' },
    { id: 'a2', title: '여름 바다', startDate: '2026-08-01', endDate: '2026-08-03' },
    { id: 'a3', title: '사진 없는 일정', startDate: '2026-01-01', endDate: '2026-01-02' }
  ];

  const photoEntries = [
    { assetKey: 'p1', date: '2026-04-01' },
    { assetKey: 'p2', date: '2026-08-02' }
  ];

  const entryMatchesDateRange = (entry, start, end) => {
    return entry.date >= start && entry.date <= end;
  };

  const isMemoryPhotoExcluded = () => false;
  const getPhotoAssetCommentKey = p => p.assetKey;
  const assignPhotosToSingleMemory = (groups) => groups;

  const result = computeArchiveMemoryGroups({
    anniversaries,
    photoEntries,
    entryMatchesDateRange,
    isMemoryPhotoExcluded,
    getPhotoAssetCommentKey,
    assignPhotosToSingleMemory
  });

  // Groups without photos should be filtered out
  assert.equal(result.length, 2);
  // Sorted descending by startDate (2026-08-01 before 2026-04-01)
  assert.equal(result[0].id, 'a2');
  assert.equal(result[1].id, 'a1');
});
