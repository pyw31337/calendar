import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLightboxPhotoOrigin, resolveMeetingPhotoDate } from '../src/ui/lightbox-photo-origin.js';

test('a chat photo with a date hashtag stays a chat photo', () => {
  const origin = resolveLightboxPhotoOrigin({ source: 'chat', uploadSource: 'chat', messageId: 'm1', tags: '#260926 #가족' });
  assert.equal(origin.kind, 'chat');
  assert.equal(origin.messageId, 'm1');
});

test('a chat photo shown inside a date modal (meetingDate set) stays a chat photo', () => {
  const origin = resolveLightboxPhotoOrigin({ source: 'chat-tag', uploadSource: 'chat', messageId: 'm2', sourceMessageId: 'm2', meetingDate: '2026-09-26' });
  assert.equal(origin.kind, 'chat');
  assert.equal(origin.messageId, 'm2');
});

test('an album reference whose source message is a chat upload is a chat photo', () => {
  // DateModal passes the source message's uploadSource for date-linked album entries.
  const origin = resolveLightboxPhotoOrigin({ source: 'lightbox-tag', uploadSource: 'chat', messageId: 'm3', sourceMessageId: 'm3', meetingDate: '2026-09-20' });
  assert.equal(origin.kind, 'chat');
});

test('a photo uploaded from the schedule is 일정 with its meeting date', () => {
  const origin = resolveLightboxPhotoOrigin({ source: 'meeting', uploadSource: 'meeting', messageId: 'm4', meetingDate: '2026-09-22' });
  assert.equal(origin.kind, 'meeting');
  assert.equal(origin.meetingDate, '2026-09-22');
});

test('a schedule upload from the photo index takes its date from the date hashtag', () => {
  const origin = resolveLightboxPhotoOrigin({ source: 'meeting', uploadSource: 'meeting', messageId: 'm5', meetingDate: '', tags: '#260919' });
  assert.equal(origin.kind, 'meeting');
  assert.equal(origin.meetingDate, '2026-09-19');
});

test('memo and gallery photos keep their origin even when date-tagged', () => {
  assert.equal(resolveLightboxPhotoOrigin({ source: 'memo', uploadSource: 'memo', messageId: 'memo1', tags: '#260926' }).kind, 'memo');
  assert.equal(resolveLightboxPhotoOrigin({ source: 'gallery', uploadSource: 'gallery', messageId: 'g1', tags: '#260926' }).kind, 'gallery');
  assert.equal(resolveLightboxPhotoOrigin({ source: 'chat', uploadSource: 'gallery', messageId: 'g2' }).kind, 'gallery');
});

test('anniversary photos stay anniversary', () => {
  assert.equal(resolveLightboxPhotoOrigin({ source: 'anniversary', anniversaryIndex: 2 }).kind, 'anniversary');
});

test('legacy metadata without an upload source falls back sensibly', () => {
  assert.equal(resolveLightboxPhotoOrigin({ meetingDate: '2026-01-02', photoId: 'p1' }).kind, 'meeting');
  assert.equal(resolveLightboxPhotoOrigin({ messageId: 'm6' }).kind, 'chat');
  assert.equal(resolveLightboxPhotoOrigin({ tags: '#2026-03-04' }).kind, 'meeting');
  assert.equal(resolveMeetingPhotoDate({ photoId: 'photo_cal_2026-05-06_1' }), '2026-05-06');
});

test('message ids reveal their upload path', async () => {
  const { inferUploadSourceFromMessageId } = await import('../src/ui/lightbox-photo-origin.js');
  assert.equal(inferUploadSourceFromMessageId('chat_cw_1789436115144_0_abc'), 'chat');
  assert.equal(inferUploadSourceFromMessageId('gallery_cw_1789_0_x'), 'gallery');
  assert.equal(inferUploadSourceFromMessageId('meeting_cw_2026-09-20_1789_0_y'), 'meeting');
  assert.equal(inferUploadSourceFromMessageId('abc123'), '');
});
