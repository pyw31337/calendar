import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyErrorPattern,
  analyzeRecentErrors,
  executeAutomatedSelfHealing,
  renderErrorDiagnosticReport,
  remediationForCluster,
  FAILURE_PATTERNS
} from '../scripts/lib/daily-error-analyzer.js';

test('classifyErrorPattern classifies network and timeout errors correctly', () => {
  assert.equal(classifyErrorPattern('Fetch failed timeout at 12000ms', 'memo_save_failure'), FAILURE_PATTERNS.TRANSIENT_NETWORK);
  assert.equal(classifyErrorPattern('NetworkError: Load failed', 'write_queue_deferred'), FAILURE_PATTERNS.TRANSIENT_NETWORK);
  assert.equal(classifyErrorPattern('HTTP 503 Service Unavailable', 'client_error'), FAILURE_PATTERNS.TRANSIENT_NETWORK);
});

test('classifyErrorPattern classifies conflicts, integrity, crash, and permissions', () => {
  assert.equal(classifyErrorPattern('Revision conflict precondition failed', 'calendar_save_failure'), FAILURE_PATTERNS.REVISION_CONFLICT);
  assert.equal(classifyErrorPattern('Copies with different tags detected', 'photo_audit'), FAILURE_PATTERNS.DATA_INTEGRITY);
  assert.equal(classifyErrorPattern('TypeError: Cannot read properties of undefined', 'client_error'), FAILURE_PATTERNS.CLIENT_CRASH);
  assert.equal(classifyErrorPattern('Missing or insufficient permissions', 'calendar_save_failure'), FAILURE_PATTERNS.PERMISSION_DENIED);
  assert.equal(classifyErrorPattern('Rate limit exceeded 429', 'memo_create_failure'), FAILURE_PATTERNS.RATE_LIMIT);
  assert.equal(classifyErrorPattern('Some random message', 'random_action'), FAILURE_PATTERNS.UNKNOWN);
});

test('analyzeRecentErrors groups by action and failure target with actor attribution', () => {
  const now = Date.now();
  const mockLogs = [
    {
      action: 'memo_create_failure',
      target: '새 메모 작성 및 저장 실패 [PHOTO_NOT_STORED] 사진 업로드 실패',
      calendarId: 'cal-flower',
      actorId: 'user-iphone-1',
      actorName: '민지',
      receivedAt: now - 1000,
      resource: { title: '유치원 소풍' }
    },
    {
      action: 'memo_create_failure',
      target: '새 메모 작성 및 저장 실패 [PHOTO_NOT_STORED] 사진 업로드 실패',
      calendarId: 'cal-flower',
      actorId: 'user-iphone-2',
      actorName: '철수',
      receivedAt: now - 2000,
      resource: { title: '준비물 목록' }
    },
    {
      action: 'write_queue_deferred',
      target: '백그라운드 지속 업로드 재시도 대기 (시도 1회차) NetworkError: Fetch failed',
      calendarId: 'cal-flower',
      actorId: 'user-iphone-1',
      receivedAt: now - 3000
    },
    {
      action: 'calendar_save_failure',
      target: '오래된 에러',
      calendarId: 'cal-flower',
      receivedAt: now - 48 * 60 * 60 * 1000 // 48h ago, should be filtered
    },
    {
      action: 'memo_view_open', // Non-error action, should be ignored
      target: '메모 열람',
      calendarId: 'cal-flower',
      receivedAt: now - 500
    }
  ];

  const analysis = analyzeRecentErrors(mockLogs, { now });
  assert.equal(analysis.totalEvents, 3);
  assert.equal(analysis.clusterCount, 2);

  const topCluster = analysis.clusters[0];
  assert.equal(topCluster.action, 'memo_create_failure');
  assert.equal(topCluster.count, 2);
  assert.equal(topCluster.uniqueUsers, 2);
  assert.deepEqual(topCluster.calendars, ['cal-flower']);
  assert.equal(topCluster.actorsList.some(a => a.name === '민지'), true);
  assert.equal(topCluster.actorsList.some(a => a.name === '철수'), true);
  assert.equal(topCluster.sampleResources.length, 2);
});

test('executeAutomatedSelfHealing triggers tag divergence repair and handles dryRun', async () => {
  let repairCalledWith = null;
  const mockRepairFn = async (calId, opts) => {
    repairCalledWith = { calId, opts };
    return { repaired: 3 };
  };

  const clusters = [
    {
      pattern: FAILURE_PATTERNS.DATA_INTEGRITY,
      calendars: new Set(['cal-flower']),
      count: 2
    },
    {
      pattern: FAILURE_PATTERNS.TRANSIENT_NETWORK,
      calendars: new Set(['cal-flower']),
      count: 5
    }
  ];

  // Dry-run mode
  const dryResult = await executeAutomatedSelfHealing({
    calendarIds: ['cal-flower'],
    clusters,
    dryRun: true,
    repairTagDivergenceFn: mockRepairFn
  });

  assert.equal(dryResult.dryRun, true);
  assert.equal(dryResult.healedCount, 3);
  assert.equal(repairCalledWith.opts.apply, false);
  assert.equal(dryResult.actionsTaken.length, 2);
  assert.match(dryResult.actionsTaken[0], /사진 태그 불일치 3건 자동 정렬 복구 완료/);
  assert.match(dryResult.actionsTaken[1], /네트워크 일시 오류 5건/);

  // Apply mode
  const applyResult = await executeAutomatedSelfHealing({
    calendarIds: ['cal-flower'],
    clusters,
    dryRun: false,
    repairTagDivergenceFn: mockRepairFn
  });
  assert.equal(applyResult.dryRun, false);
  assert.equal(repairCalledWith.opts.apply, true);
});

test('renderErrorDiagnosticReport outputs markdown report with failure and healing summary', () => {
  const analysis = {
    totalEvents: 3,
    clusterCount: 2,
    clusters: [
      {
        count: 2,
        action: 'memo_create_failure',
        message: '사진 업로드 실패',
        pattern: FAILURE_PATTERNS.TRANSIENT_NETWORK,
        actorsList: [{ name: '민지', count: 2 }],
        calendars: ['cal-flower']
      }
    ],
    patternSummary: {
      [FAILURE_PATTERNS.TRANSIENT_NETWORK]: 2,
      [FAILURE_PATTERNS.DATA_INTEGRITY]: 1
    }
  };

  const healingResult = {
    healedCount: 1,
    actionsTaken: ['[cal-flower] 사진 태그 불일치 1건 자동 정렬 복구 완료']
  };

  const report = renderErrorDiagnosticReport({
    date: '2026-11-03',
    analysis,
    healingResult
  });

  assert.match(report, /# 🩺 운영 일일 오류 분석 및 자동 복구 보고서 \(2026-11-03\)/);
  assert.match(report, /총 오류 발생 수 \| 군집화된 문제 유형 \| 관련 캘린더 \| 자동 복구\(Self-Healing\) 조치/);
  assert.match(report, /2회 \| 민지\(2회\) \| `memo_create_failure` \| 사진 업로드 실패 \| `TRANSIENT_NETWORK`/);
  assert.match(report, /사진 태그 불일치 1건 자동 정렬 복구 완료/);
});

test('analysis closes the action lifecycle and produces memo remediation guidance', () => {
  const now = Date.now();
  const analysis = analyzeRecentErrors([
    { action: 'memo_update', status: 'started', attemptId: 'a1', calendarId: 'cw', timestamp: now - 500 },
    { action: 'memo_update_failure', status: 'failed', attemptId: 'a1', target: '메모 수정 실패 timeout', calendarId: 'cw', timestamp: now - 400 },
    { action: 'write_queue_replayed', status: 'healed', attemptId: 'a1', target: '대기 저장 자동 복구 완료', calendarId: 'cw', timestamp: now - 100 },
  ], { now });
  assert.equal(analysis.actionLifecycle.total, 1);
  assert.equal(analysis.actionLifecycle.healed, 1);
  assert.equal(analysis.actionLifecycle.unresolved, 0);
  assert.equal(remediationForCluster({ action: 'memo_update_failure', message: 'timeout', pattern: FAILURE_PATTERNS.TRANSIENT_NETWORK }).action, 'replay_when_online');
  assert.equal(remediationForCluster({ action: 'memo_update_failure', message: '내용 저장 실패', pattern: FAILURE_PATTERNS.UNKNOWN }).action, 'preserve_draft_and_retry');
});
