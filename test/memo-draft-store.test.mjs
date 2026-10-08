import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  memoDraftKey, memoCommentDraftKey, normalizeMemoDraft, draftImageRefs, isMemoDraftEmpty,
  isSameMemoDraftContent, saveMemoDraft, loadMemoDraft, clearMemoDraft, pruneExpiredMemoDrafts,
  createDebouncedSaver, memoDraftFieldsFromMemo, restorableDraftImages,
  MEMO_DRAFT_TTL_MS, MEMO_DRAFT_DEBOUNCE_MS, MEMO_DRAFT_RESTORE_PROMPT, MEMO_DRAFT_CLOSE_MESSAGE,
} from '../src/core/memo-draft-store.js';

function memoryStorage() {
  const map = new Map();
  return {
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    _map: map,
  };
}

test('drafts are keyed per calendar and per memo (new / id / comment)', () => {
  assert.equal(memoDraftKey('calA', ''), 'gather_memo_draft_v1:calA:new');
  assert.equal(memoDraftKey('calA', 'memo_1'), 'gather_memo_draft_v1:calA:memo_1');
  assert.notEqual(memoDraftKey('calA', 'memo_1'), memoDraftKey('calB', 'memo_1'));
  assert.equal(memoDraftKey('', 'memo_1'), '', 'no calendar -> no draft');
  assert.equal(memoCommentDraftKey('calA', 'memo_1'), 'gather_memo_draft_v1:calA:comment:memo_1');
  assert.equal(memoCommentDraftKey('calA', ''), '');
});

test('photo binaries and local previews are never stored; uploaded URLs are', () => {
  const refs = draftImageRefs([
    { original: 'https://cdn.example/a.jpg', thumbnail: 'https://cdn.example/a_t.jpg', isExisting: true },
    { original: 'data:image/jpeg;base64,AAAA', thumbnail: 'data:image/jpeg;base64,BBBB', originalBlob: {} },
    { original: 'blob:https://x/123' },
    { original: 'https://cdn.example/b.jpg', originalBlob: { size: 3 } },
  ]);
  assert.deepEqual(refs, [{ original: 'https://cdn.example/a.jpg', thumbnail: 'https://cdn.example/a_t.jpg', fingerprint: '' }]);
  const draft = normalizeMemoDraft({ title: 't', text: 'b', tags: ['#2026-10-09', ' 캠핑 ', ''], images: [{ original: 'data:x' }] });
  assert.deepEqual(draft.tags, ['#2026-10-09', '캠핑'], 'date hashtags (the memo\'s date) ride along in tags');
  assert.deepEqual(draft.images, []);
  assert.equal(JSON.stringify(draft).includes('data:'), false);
});

test('save / load / clear round trip, empty drafts are removed', () => {
  const storage = memoryStorage();
  const key = memoDraftKey('calA', 'new');
  assert.equal(saveMemoDraft(key, { title: '', text: '  ', tags: [] }, { storage }), false);
  assert.equal(storage.getItem(key), null);
  assert.equal(saveMemoDraft(key, { title: '영월 준비물', text: '텐트', tags: ['캠핑'], tagInput: '불' }, { storage, now: 1000 }), true);
  const loaded = loadMemoDraft(key, { storage, now: 2000 });
  assert.equal(loaded.title, '영월 준비물');
  assert.equal(loaded.text, '텐트');
  assert.deepEqual(loaded.tags, ['캠핑']);
  assert.equal(loaded.tagInput, '불');
  assert.equal(loaded.savedAt, 1000);
  clearMemoDraft(key, { storage });
  assert.equal(loadMemoDraft(key, { storage }), null);
});

test('drafts expire after 7 days and corrupt entries are dropped', () => {
  const storage = memoryStorage();
  const key = memoDraftKey('calA', 'memo_9');
  saveMemoDraft(key, { text: 'old' }, { storage, now: 0 });
  assert.ok(loadMemoDraft(key, { storage, now: MEMO_DRAFT_TTL_MS - 1 }));
  assert.equal(loadMemoDraft(key, { storage, now: MEMO_DRAFT_TTL_MS + 1 }), null);
  assert.equal(storage.getItem(key), null, 'expired draft is deleted');
  storage.setItem(key, '{not json');
  assert.equal(loadMemoDraft(key, { storage }), null);
  assert.equal(storage.getItem(key), null);
  assert.equal(MEMO_DRAFT_TTL_MS, 7 * 24 * 60 * 60 * 1000);
});

test('pruneExpiredMemoDrafts only touches memo drafts', () => {
  const storage = memoryStorage();
  storage.setItem('gather_theme', 'dark');
  saveMemoDraft(memoDraftKey('a', 'new'), { text: 'x' }, { storage, now: 0 });
  saveMemoDraft(memoDraftKey('b', 'new'), { text: 'y' }, { storage, now: MEMO_DRAFT_TTL_MS });
  const removed = pruneExpiredMemoDrafts({ storage, now: MEMO_DRAFT_TTL_MS + 10 });
  assert.equal(removed, 1);
  assert.equal(storage.getItem('gather_theme'), 'dark');
  assert.ok(storage.getItem(memoDraftKey('b', 'new')));
});

test('quota errors never throw out of autosave', () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); }, removeItem: () => {} };
  assert.equal(saveMemoDraft('k', { text: 'x' }, { storage }), false);
});

test('debounced saver: trailing ~500ms, flush and cancel', () => {
  const timers = [];
  const fake = { set: (fn, ms) => { timers.push({ fn, ms, live: true }); return timers.length - 1; }, clear: (h) => { if (timers[h]) timers[h].live = false; } };
  const calls = [];
  const save = createDebouncedSaver((...args) => calls.push(args), MEMO_DRAFT_DEBOUNCE_MS, fake);
  save('k', 'a'); save('k', 'ab'); save('k', 'abc');
  assert.equal(timers.filter(t => t.live).length, 1);
  assert.equal(timers.at(-1).ms, 500);
  timers.at(-1).fn();
  assert.deepEqual(calls, [['k', 'abc']], 'only the last change is written');
  save('k', 'abcd');
  save.flush();
  assert.deepEqual(calls.at(-1), ['k', 'abcd'], 'flush writes immediately (editor closing)');
  save('k', 'zzz');
  save.cancel();
  save.flush();
  assert.equal(calls.length, 2, 'cancel drops the pending save (successful save path)');
});

test('restore is only offered for real changes; photo refs restore only if the memo still has them', () => {
  const memo = { id: 'm1', title: '제목', text: '본문', tags: ['#캠핑'], imageUrls: ['https://c/a.jpg', 'https://c/b.jpg'], thumbUrls: ['https://c/a_t.jpg', 'https://c/b_t.jpg'] };
  const base = memoDraftFieldsFromMemo(memo);
  assert.deepEqual(base.tags, ['캠핑']);
  assert.equal(isSameMemoDraftContent(base, { ...base, color: 'red' }), true, 'colour alone never prompts');
  assert.equal(isSameMemoDraftContent(base, { ...base, text: '본문 수정' }), false);
  const restored = restorableDraftImages({ images: [{ original: 'https://c/b.jpg' }, { original: 'https://evil/x.jpg' }] }, memo);
  assert.deepEqual(restored, [{ original: 'https://c/b.jpg', thumbnail: 'https://c/b_t.jpg', fingerprint: '', isExisting: true }]);
  assert.equal(isMemoDraftEmpty(normalizeMemoDraft({ tagInput: '  ' })), true);
});

test('memo editor wires autosave, V2 restore prompt and the draft-kept close warning', async () => {
  assert.equal(MEMO_DRAFT_RESTORE_PROMPT, '작성 중이던 메모가 있어요. 이어서 쓸까요?');
  assert.match(MEMO_DRAFT_CLOSE_MESSAGE, /저장하지 않은 내용이 있습니다/);
  assert.match(MEMO_DRAFT_CLOSE_MESSAGE, /임시 저장/);
  const view = await readFile(new URL('../src/ui/ui-memo-view.js', import.meta.url), 'utf8');
  assert.match(view, /useModalDirtyGuard\(\s*closeMemoEditor,\s*onRequestConfirm,\s*MEMO_DRAFT_CLOSE_MESSAGE/);
  assert.match(view, /active: !!editingMemo && editDraftCheckedKey === editDraftKey && !editDraftOffer/, 'autosave waits for the restore check');
  assert.match(view, /editDraftAutosave\.clear\(editDraftKey\);\s*showToast\('메모가 수정되었습니다\.'/);
  assert.match(view, /newDraftAutosave\.clear\(memoDraftKey\(calendarId, 'new'\)\);\s*showToast\('메모가 저장되었습니다\.'/);
  assert.match(view, /MemoDraftRestorePrompt, \{ draft: editDraftOffer/);
  assert.match(view, /MemoDraftRestorePrompt, \{ draft: newDraftOffer/);
  const ui = await readFile(new URL('../src/ui/memo-draft-ui.js', import.meta.url), 'utf8');
  assert.match(ui, /'새로 쓰기'/);
  assert.match(ui, /'이어쓰기'/);
  const css = await readFile(new URL('../src/ui/v2/memo-draft.css', import.meta.url), 'utf8');
  assert.match(css, /var\(--a-brand, #7C2FE5\)/, 'V2 purple accent through the theme token');
});

test('default debounce timers work when setTimeout rejects a foreign `this` (browser Illegal invocation)', async () => {
  const realSet = globalThis.setTimeout;
  const realClear = globalThis.clearTimeout;
  const strict = (real) => function (...args) {
    if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation');
    return real(...args);
  };
  globalThis.setTimeout = strict(realSet);
  globalThis.clearTimeout = strict(realClear);
  try {
    const calls = [];
    const save = createDebouncedSaver((v) => calls.push(v), 1);
    save('a');
    save('b');
    save.flush();
    save('c');
    save.cancel();
    assert.deepEqual(calls, ['b']);
  } finally {
    globalThis.setTimeout = realSet;
    globalThis.clearTimeout = realClear;
  }
});
