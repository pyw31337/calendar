'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { completeAnalysisLocationTags, appendTags } = require('../media-auto-tags');
const { getPhotoAssetKey } = require('../media-commands');
const { stableAnalysisId } = require('../media-analysis');

module.exports = function registerAutoTagContract(createDb) {
  let seq = 0;
  async function seed() {
    const db = await createDb();
    const calendarDocId = `cal_autotag_contract_${++seq}`;
    const root = db.collection('calendars').doc(calendarDocId);
    const url = 'https://firebasestorage.googleapis.com/v0/b/demo/o/photo.jpg?alt=media';
    const assetKey = getPhotoAssetKey(url);
    const source = root.collection('messages').doc('m1');
    const album = root.collection('confirmedMeetings').doc('2026-10-06');
    const photo = root.collection('photoIndex').doc(assetKey);
    const analysis = root.collection('mediaAnalysis').doc(stableAnalysisId(assetKey));
    await root.set({ calendar: { aiSettings: { autoLocationTags: true, autoLocationTagsSince: 10 } } });
    await source.set({ createdAt: 20, imageUrls: [url], imageTags: ['가족'], imageGeoMap: { [assetKey]: { lat: 37.47, lng: 126.86 } } });
    await album.set({ photos: [{ imageUrl: url, tags: '여행', createdAt: 20 }] });
    await photo.set({ assetKey, full: url, tags: '가족', uploadedAt: 20, latitude: 37.47, longitude: 126.86, ownerListComplete: true,
      owners: [{ sourceOwner: 'message:m1:0' }, { sourceOwner: 'meeting:2026-10-06:0' }] });
    await analysis.set({ assetKey, analysisVersion: 5, status: 'suggested', suggestedTags: ['잘못된인물', '잘못된장소'] });
    const run = overrides => completeAnalysisLocationTags({ db, calendarDocId, assetKey, now: 100, lookupTags: async () => ['#경기도', '#광명시'], ...overrides });
    return { db, root, source, album, photo, analysis, assetKey, run };
  }

  test('autonomous GPS completion adds facts to every owner and commits an audit, never model guesses', async () => {
    const fixture = await seed();
    const result = await fixture.run();
    assert.equal(result.status, 'applied');
    assert.deepEqual(result.addedTags, ['경기도', '광명시']);
    assert.deepEqual((await fixture.source.get()).data().imageTags, ['가족 #경기도 #광명시']);
    assert.equal((await fixture.album.get()).data().photos[0].tags, '여행 #경기도 #광명시');
    assert.equal((await fixture.analysis.get()).data().automatic.status, 'applied');
  });

  test('duplicate delivery and later user deletion never restore an automatically added tag', async () => {
    const fixture = await seed();
    await fixture.run();
    await fixture.source.update({ imageTags: ['사용자수정'], imageTagMap: { [fixture.assetKey]: '사용자수정' } });
    await fixture.run({ lookupTags: async () => { throw new Error('duplicate must not fetch'); } });
    assert.deepEqual((await fixture.source.get()).data().imageTags, ['사용자수정']);
  });

  test('preserves concurrent user tags and rejects changed source coordinates', async () => {
    const fixture = await seed();
    await fixture.run({ lookupTags: async () => {
      await fixture.source.update({ imageTags: ['새로운사용자태그'] });
      return ['#광명시'];
    } });
    assert.deepEqual((await fixture.source.get()).data().imageTags, ['새로운사용자태그 #광명시']);
    const conflict = await seed();
    const result = await conflict.run({ lookupTags: async () => {
      await conflict.source.update({ imageGeoMap: { [conflict.assetKey]: { lat: 35, lng: 129 } } });
      return ['#광명시'];
    } });
    assert.equal(result.reason, 'conflicting-gps');
    assert.deepEqual((await conflict.source.get()).data().imageTags, ['가족']);
  });

  test('abstains for human reviews, legacy results, incomplete ownership, deletion and opt-out', async () => {
    for (const scenario of ['review', 'legacy', 'owners', 'deleted', 'disabled']) {
      const fixture = await seed();
      if (scenario === 'review') await fixture.analysis.update({ review: { decision: 'rejected' } });
      if (scenario === 'owners') await fixture.photo.update({ ownerListComplete: false });
      if (scenario === 'deleted') await fixture.source.update({ removedAt: 1 });
      if (scenario === 'disabled') await fixture.root.update({ calendar: { aiSettings: { autoLocationTags: false } } });
      const result = await fixture.run({ legacy: scenario === 'legacy' });
      assert.notEqual(result.status, 'applied', scenario);
      assert.deepEqual((await fixture.source.get()).data().imageTags, ['가족']);
    }
  });

  test('three failed geocoder attempts are bounded and auditable, without any tag write', async () => {
    const fixture = await seed();
    let calls = 0;
    const lookupTags = async () => { calls += 1; throw new Error('sensitive API response'); };
    await assert.rejects(fixture.run({ lookupTags }));
    await assert.rejects(fixture.run({ lookupTags }));
    assert.equal((await fixture.run({ lookupTags })).status, 'failed');
    await fixture.run({ lookupTags });
    assert.equal(calls, 3);
    const audit = (await fixture.analysis.get()).data().automatic;
    assert.equal(audit.attempts, 3);
    assert.equal(JSON.stringify(audit).includes('sensitive'), false);
    assert.deepEqual((await fixture.source.get()).data().imageTags, ['가족']);
  });

  test('an exhausted tag budget never truncates tags or partly updates another owner', async () => {
    const fixture = await seed();
    const text = Array.from({ length: 20 }, (_, index) => `tag${index}`).join(' ');
    await fixture.album.update({ photos: [{ imageUrl: (await fixture.photo.get()).data().full, tags: text, createdAt: 20 }] });
    assert.equal((await fixture.run()).reason, 'tag-limit');
    assert.deepEqual((await fixture.source.get()).data().imageTags, ['가족']);
    assert.equal((await fixture.album.get()).data().photos[0].tags, text);
    assert.equal(appendTags('경기도 #광명시', ['경기도', '광명시']), '경기도 #광명시');
  });

  test('recovering from a transient geocoder failure applies exactly once', async () => {
    const fixture = await seed();
    await assert.rejects(fixture.run({ lookupTags: async () => { throw new Error('offline'); } }));
    assert.equal((await fixture.run()).status, 'applied');
    assert.equal((await fixture.analysis.get()).data().automatic.attempts, 2);
    assert.equal((await fixture.run()).status, 'applied');
    assert.deepEqual((await fixture.source.get()).data().imageTags, ['가족 #경기도 #광명시']);
  });

  test('first-ever v5 analysis of a historical photo cannot restore removed location tags', async () => {
    for (const scenario of ['old', 'unknown', 'not-enabled']) {
      const fixture = await seed();
      if (scenario === 'old') await fixture.photo.update({ uploadedAt: 1 });
      if (scenario === 'unknown') await fixture.photo.update({ uploadedAt: 0 });
      if (scenario === 'not-enabled') await fixture.root.set({ calendar: {} });
      const result = await fixture.run({ lookupTags: async () => { throw new Error('must not geocode'); } });
      assert.equal(result.status, 'skipped', scenario);
      assert.deepEqual((await fixture.source.get()).data().imageTags, ['가족']);
    }
    const editedOldPhoto = await seed();
    await editedOldPhoto.source.update({ createdAt: 1, updatedAt: 90 });
    assert.equal((await editedOldPhoto.run()).reason, 'preserve-historical-source');
    assert.deepEqual((await editedOldPhoto.source.get()).data().imageTags, ['가족']);
  });
};
