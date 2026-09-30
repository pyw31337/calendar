import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { isAnalysisWindow, parseHolidayIcs } from '../tools/local-media-worker/run-scheduled-media-analysis.mjs';
import { isRetryableAssetFailure } from '../tools/local-media-worker/analysis-retry-policy.mjs';
import { fetchMediaAnalysisFeed, fetchMediaAnalysisPhoto, recordMediaAnalysisFeedback } from '../src/core/media-analysis-feed.js';

const require = createRequire(import.meta.url);
const { sanitizeAnalysisItem, stableAnalysisId, summarize } = require('../functions/media-analysis.js');
const { buildBrief, isEmailDeliveryConfigured, isNaverSmtpConfigured } = require('../functions/media-analysis-brief.js');

test('server analysis accepts bounded recommendations but never takes a raw image URL', () => {
  const item = sanitizeAnalysisItem({
    assetKey: 'asset:v1:abc-123',
    sourceUpdatedAt: 100,
    suggestedTags: ['#하니랜드', '파주시', '파주시'],
    people: ['영우'],
    places: ['하니랜드'],
    meetings: ['가을 나들이'],
    insight: { ocrText: ['입장권'], labels: [{ name: 'food', confidence: 0.91 }], faceCount: 2 }
  }, 200);
  assert.equal(item.assetKey, 'asset:v1:abc-123');
  assert.deepEqual(item.suggestedTags, ['하니랜드', '파주시']);
  assert.equal(item.faceCount, 2);
  assert.equal(item.imageUrl, undefined);
  assert.equal(stableAnalysisId(item.sourceKey).length, 64);
  assert.deepEqual(summarize([item]), { received: 1, suggested: 1, failed: 0, withPeople: 1, withPlaces: 1, withMeetings: 1, withText: 1 });
});

test('KST schedule grants nights, weekends and holiday daytime only', () => {
  const holidayKeys = parseHolidayIcs('BEGIN:VEVENT\nDTSTART;VALUE=DATE:20260928\nEND:VEVENT');
  assert.equal(isAnalysisWindow({ date: new Date('2026-09-28T01:00:00Z'), holidayKeys }).allowed, true); // 10:00 KST holiday
  assert.equal(isAnalysisWindow({ date: new Date('2026-09-29T01:00:00Z'), holidayKeys }).allowed, false); // 10:00 KST weekday
  assert.equal(isAnalysisWindow({ date: new Date('2026-09-29T13:00:00Z'), holidayKeys }).allowed, true); // 22:00 KST weekday
  assert.equal(isAnalysisWindow({ date: new Date('2026-09-27T01:00:00Z'), holidayKeys }).weekend, true);
});

test('allowAllHours overrides weekday daytime restrictions for background analysis', () => {
  const holidayKeys = new Set();
  assert.equal(isAnalysisWindow({ date: new Date('2026-09-29T01:00:00Z'), holidayKeys, allowAllHours: true }).allowed, true);
  assert.equal(isAnalysisWindow({ date: new Date('2026-09-29T01:00:00Z'), holidayKeys, allowAllHours: false }).allowed, false);
});

test('missing photos are recorded but do not pin the local analysis cursor', () => {
  assert.equal(isRetryableAssetFailure('Image download failed: 404'), false);
  assert.equal(isRetryableAssetFailure('Missing Firebase Storage URL'), false);
  assert.equal(isRetryableAssetFailure('Image download failed: 429'), true);
  assert.equal(isRetryableAssetFailure('Image download failed: 503'), true);
  assert.equal(isRetryableAssetFailure('Photo download timed out after 30s'), true);
});

test('live feed reads server-written analysis rows without exposing write credentials', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /calendars\/cal_cw:runQuery$/);
    const query = JSON.parse(init.body).structuredQuery;
    assert.equal(query.from[0].collectionId, 'mediaAnalysis');
    return new Response(JSON.stringify([{ document: {
      name: 'projects/x/databases/(default)/documents/calendars/cal_cw/mediaAnalysis/item1',
      fields: {
        suggestedTags: { arrayValue: { values: [{ stringValue: '하니랜드' }] } },
        faceCount: { integerValue: '1' },
        lastReceivedAt: { integerValue: '1000' }
      }
    } }]), { status: 200 });
  };
  try {
    const items = await fetchMediaAnalysisFeed({ calendarId: 'cw', projectId: 'metro-live-2918e', force: true });
    assert.deepEqual(items[0], { suggestedTags: ['하니랜드'], faceCount: 1, lastReceivedAt: 1000, id: 'item1' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchMediaAnalysisFeed applies customizable bounded limit', async () => {
  const originalFetch = globalThis.fetch;
  let requestedLimit = 0;
  globalThis.fetch = async (url, init) => {
    const query = JSON.parse(init.body).structuredQuery;
    requestedLimit = query.limit;
    return new Response(JSON.stringify([]), { status: 200 });
  };
  try {
    await fetchMediaAnalysisFeed({ calendarId: 'cw', projectId: 'metro-live-2918e', limit: 120, force: true });
    assert.equal(requestedLimit, 120);
    await fetchMediaAnalysisFeed({ calendarId: 'cw', projectId: 'metro-live-2918e', limit: 500, force: true });
    assert.equal(requestedLimit, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('AI review actions resolve a canonical photo only on demand and send bounded feedback to the server', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), init });
    if (String(url).includes('/photoIndex/asset%3Av1%3Aabc-123')) {
      return new Response(JSON.stringify({
        name: 'projects/x/databases/(default)/documents/calendars/cal_cw/photoIndex/asset:v1:abc-123',
        fields: { tags: { stringValue: '기존' }, sourceOwner: { stringValue: 'message:m1:0' } }
      }), { status: 200 });
    }
    return new Response(JSON.stringify({ ok: true, review: { decision: 'applied', finalTags: ['기존', '하니랜드'] } }), { status: 200 });
  };
  try {
    const photo = await fetchMediaAnalysisPhoto({ calendarId: 'cw', projectId: 'metro-live-2918e', assetKey: 'asset:v1:abc-123' });
    assert.equal(photo.sourceOwner, 'message:m1:0');
    const review = await recordMediaAnalysisFeedback({
      calendarId: 'cw', projectId: 'metro-live-2918e', assetKey: 'asset:v1:abc-123',
      decision: 'applied', proposedTags: ['하니랜드'], acceptedTags: ['하니랜드'], finalTags: ['기존', '하니랜드']
    });
    assert.deepEqual(review.finalTags, ['기존', '하니랜드']);
    assert.equal(requests.length, 2);
    assert.match(requests[1].url, /recordMediaAnalysisFeedback$/);
    assert.deepEqual(JSON.parse(requests[1].init.body).acceptedTags, ['하니랜드']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('daily briefing produces a readable HTML digest and flags stale or failed work', () => {
  const brief = buildBrief({
    dateLabel: '2026년 9월 28일 월요일',
    calendars: [{
      id: 'cw', name: '모아엘가', stale: true, healthLabel: '생존 신호 확인',
      summary: { received: 12, suggested: 9, failed: 1, withPeople: 3, withPlaces: 4, withMeetings: 2 }
    }]
  });
  assert.match(brief.subject, /^모여라 캘린더 AI 분석 브리핑/);
  assert.match(brief.html, /모아엘가/);
  assert.match(brief.html, /라이브 웹에서 분석 검토하기/);
  assert.match(brief.text, /오류 1건/);
  assert.equal(brief.staleCount, 1);
  assert.equal(brief.total.suggested, 9);
});

test('daily briefing remains in a safe server-only mode until a verified sender is configured', () => {
  assert.equal(isEmailDeliveryConfigured({ apiKey: '__NOT_CONFIGURED__', from: '__NOT_CONFIGURED__' }), false);
  assert.equal(isEmailDeliveryConfigured({ apiKey: 're_123456789012', from: '모아엘가 <brief@example.com>' }), true);
  assert.equal(isNaverSmtpConfigured({ account: 'pyw213@naver.com', appPassword: 'ABCD1234EFGH' }), true);
  assert.equal(isNaverSmtpConfigured({ account: 'pyw213@naver.com', appPassword: '__NOT_CONFIGURED__' }), false);
});
