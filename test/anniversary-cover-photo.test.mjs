import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAnniversaryCoverPhoto,
  resolveAnniversaryCoverPhoto,
  resolveAnniversaryCoverUrl,
  anniversaryPhotoMatchesDate
} from '../src/core/anniversary-cover-photo.js';

test('explicit anniversary photo wins over a same-date attachment', () => {
  const ann = { id: 'a1', date: '2026-10-26', photos: [{ id: 'ann', url: 'https://cdn/ann.jpg' }] };
  const result = resolveAnniversaryCoverPhoto(ann, [{ meetingDate: '2026-10-26', url: 'https://cdn/date.jpg' }]);
  assert.equal(result.id, 'ann');
  assert.equal(result.source, 'anniversary');
});

test('same-date attachment becomes the cover when anniversary has no media', () => {
  const ann = { id: 'a2', date: '2026-10-26', photos: [] };
  const result = resolveAnniversaryCoverPhoto(ann, [
    { meetingDate: '2026-10-25', url: 'https://cdn/old.jpg', createdAt: 20 },
    { meetingDate: '2026-10-26', thumbUrl: 'https://cdn/date-thumb.jpg', createdAt: 10 },
    { meetingDate: '2026-10-26', url: 'https://cdn/date-new.jpg', createdAt: 30 }
  ]);
  assert.equal(result.full, 'https://cdn/date-new.jpg');
  assert.equal(result.source, 'date');
  assert.equal(resolveAnniversaryCoverUrl(ann, [{ meetingDate: '2026-10-26', url: 'https://cdn/date.jpg' }]), 'https://cdn/date.jpg');
});

test('yearly anniversaries match a date by month/day', () => {
  const ann = { id: 'a3', type: 'yearly', date: '10-26' };
  assert.equal(anniversaryPhotoMatchesDate({ meetingDate: '2027-10-26', url: 'https://cdn/date.jpg' }, ann), true);
  assert.equal(anniversaryPhotoMatchesDate({ meetingDate: '2027-10-27', url: 'https://cdn/other.jpg' }, ann), false);
});

test('normalization keeps a thumb-only attachment renderable', () => {
  const result = normalizeAnniversaryCoverPhoto({ thumbUrl: 'https://cdn/thumb.webp' });
  assert.equal(result.full, 'https://cdn/thumb.webp');
  assert.equal(result.thumb, 'https://cdn/thumb.webp');
});
