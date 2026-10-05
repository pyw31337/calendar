import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};

const {
  classifyIntakeSource,
  detectUploadClient,
  buildImageIntakeEntry,
  storedPhotoPayload,
  markFileIntakeSource
} = await import('../src/core/upload-intake.js');
const { sanitizeMessageForFirestore } = await import('../src/core/app-domain-helpers.js');
const { uploadChatImageAssets, resolveImageUrls } = await import('../src/core/app-image-pipeline.js');

test('paperclip records clip, and image.jpg from that same input records camera', () => {
  const library = { name: 'IMG_2045.HEIC', type: 'image/heic' };
  const capture = { name: 'image.jpg', type: 'image/jpeg' };
  assert.equal(classifyIntakeSource('clip', library), 'clip');
  assert.equal(classifyIntakeSource('clip', capture), 'camera');
  assert.equal(classifyIntakeSource('paste', capture), 'paste');
  const entry = buildImageIntakeEntry({ source: 'clip', file: library, client: 'ios-safari' });
  assert.equal(entry.source, 'clip');
  assert.equal(entry.name, 'IMG_2045.HEIC');
  assert.equal(entry.mime, 'image/heic');
  assert.equal(entry.fail, undefined);
});

test('client comes from userAgent and display-mode', () => {
  assert.equal(detectUploadClient('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', 'browser'), 'ios-safari');
  assert.equal(detectUploadClient('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', 'standalone'), 'ios-pwa');
  assert.equal(detectUploadClient('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) CriOS/126.0.6478.35 Mobile/15E148 Safari/604.1', ''), 'other');
  assert.equal(detectUploadClient('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '', { maxTouchPoints: 5 }), 'ios-safari');
  assert.equal(detectUploadClient('Mozilla/5.0 (Windows NT 10.0)', ''), 'other');
});

test('a failed upload does not produce a Firestore payload', async () => {
  let wrote = false;
  const blob = new Blob([Uint8Array.from([1, 2, 3])], { type: 'image/webp' });
  await assert.rejects(
    () => resolveImageUrls('cal', {
      originalBlob: blob,
      thumbnailBlob: blob,
      intakeSource: 'clip',
      intakeClient: 'ios-safari',
      intakeName: 'IMG_1.JPG',
      intakeMime: 'image/jpeg'
    }, 0, null, async () => null),
    err => err && err.code === 'PHOTO_NOT_STORED'
  );
  const payload = storedPhotoPayload({ text: '', uploadSource: 'chat' }, [{ imageUrl: 'data:image/png;base64,AAAA', thumbUrl: 'data:image/png;base64,AAAA' }]);
  if (payload) wrote = true;
  assert.equal(payload, null);
  assert.equal(wrote, false);
});

test('a successful send stores the intake source on the message', () => {
  const payload = storedPhotoPayload({
    text: '안녕',
    uploadSource: 'chat',
    imageUrl: 'https://files.example/o',
    thumbUrl: 'https://files.example/t'
  }, [{
    imageUrl: 'https://files.example/o',
    thumbUrl: 'https://files.example/t',
    intake: { source: 'paste', client: 'ios-pwa', name: 'paste.png', mime: 'image/png' }
  }]);
  assert.equal(payload.text, '안녕');
  assert.equal(payload.imageIntake[0].source, 'paste');
  assert.equal(payload.imageIntake[0].client, 'ios-pwa');
  assert.equal(payload.imageIntake[0].name, 'paste.png');
  assert.equal(JSON.stringify(payload).includes('base64'), false);
  const saved = sanitizeMessageForFirestore(payload);
  assert.equal(saved.imageIntake[0].source, 'paste');
});

test('a saved original is kept when the thumb upload fails', async () => {
  window.addEventListener = () => {};
  window.removeEventListener = () => {};
  const deleted = [];
  window.__gatherFirebaseStorage = {
    ref(path) {
      const ok = path.includes('_original_');
      return {
        path,
        put() {
          return {
            cancel() {},
            pause() {},
            resume() {},
            snapshot: {
              ref: {
                async getDownloadURL() {
                  return `https://files.example/${path}`;
                }
              }
            },
            on(_event, _progress, error, complete) {
              if (ok) complete();
              else error(new Error('thumb failed'));
            }
          };
        },
        async delete() {
          deleted.push(path);
        },
        async getDownloadURL() {
          const err = new Error('missing');
          err.code = 'storage/object-not-found';
          throw err;
        }
      };
    }
  };
  const originalBlob = new Blob([Uint8Array.from([9])], { type: 'image/webp' });
  const thumbnailBlob = new Blob([Uint8Array.from([8])], { type: 'image/webp' });
  const smallThumbBlob = new Blob([Uint8Array.from([7])], { type: 'image/webp' });
  const result = await uploadChatImageAssets('cal', {
    originalBlob,
    thumbnailBlob,
    smallThumbBlob
  }, 0, null, 1000);
  assert.ok(result);
  assert.match(result.imageUrl, /_original_/);
  assert.equal(result.thumbUrl, result.imageUrl);
  assert.match(result.intakeFail, /thumb/);
  assert.deepEqual(deleted, []);
  const payload = storedPhotoPayload({
    text: '',
    uploadSource: 'chat',
    imageUrl: result.imageUrl,
    thumbUrl: result.thumbUrl
  }, [{
    imageUrl: result.imageUrl,
    thumbUrl: result.thumbUrl,
    intake: { source: 'clip', client: 'ios-safari', name: 'IMG_9.JPG', mime: 'image/jpeg', fail: result.intakeFail }
  }]);
  assert.equal(payload.imageUrl, result.imageUrl);
  assert.equal(payload.imageIntake[0].fail, result.intakeFail);
  assert.equal(payload.imageIntake[0].source, 'clip');
});

test('markFileIntakeSource is readable by the compressor without copying bytes', () => {
  const file = new File([Uint8Array.from([1])], 'notes.png', { type: 'image/png' });
  markFileIntakeSource([file], 'share');
  assert.equal(file.intakeSource, 'share');
});
