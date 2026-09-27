/**
 * Daily ops report (scripts/ops-daily-report.mjs): turns the media integrity audit and the last
 * 24h of client_error audit events into one markdown report, and decides whether anything got
 * WORSE since the previous report. Existing legacy problems are listed but do not alert every day;
 * only a count that went up (or a new error message) does.
 *
 * Pure functions only, so the alert rules are unit-tested (test/ops-daily-report.test.mjs).
 */

export const REPORT_MARKER = '<!-- ops-daily-report -->';
const STATE_RE = /<!-- ops-daily-state (\{.*?\}) -->/s;

// Counts from scripts/audit-media-integrity.mjs that mean "a user can see something broken".
export const PROBLEM_FIELDS = [
  ['deadIndexRows', '썸네일/사진 파일이 사라진 갤러리 항목'],
  ['sourceRefsToMissingFiles', '없는 파일을 가리키는 채팅·일정·메모 사진'],
  ['staleIndexOwners', '원본에서 지워졌는데 갤러리에 남은 연결'],
  ['copiesWithDifferentTags', '같은 사진인데 사본마다 태그가 다른 경우'],
  ['orphanCommentThreads', '사진 없이 남은 댓글 묶음'],
];

export function summarizeIntegrity(auditOutput) {
  const reports = Array.isArray(auditOutput?.reports) ? auditOutput.reports : [];
  const counts = {};
  const failed = [];
  reports.forEach(report => {
    const calendarId = String(report?.calendarId || '');
    if (!calendarId) return;
    if (report.error) { failed.push({ calendarId, error: String(report.error) }); return; }
    PROBLEM_FIELDS.forEach(([field]) => {
      counts[`${calendarId}.${field}`] = Number(report[field]) || 0;
    });
  });
  return { counts, failed, reports };
}

export function summarizeClientErrors(logs, { now = Date.now(), windowMs = 24 * 60 * 60 * 1000 } = {}) {
  const since = now - windowMs;
  const byMessage = new Map();
  (Array.isArray(logs) ? logs : []).forEach(log => {
    if (log?.action !== 'client_error' || Number(log.receivedAt) < since) return;
    const message = String(log.target || '').trim().slice(0, 200) || '(내용 없음)';
    const entry = byMessage.get(message) || { message, count: 0, calendars: new Set(), sessions: new Set() };
    entry.count += 1;
    if (log.calendarId) entry.calendars.add(String(log.calendarId));
    if (log.sessionId) entry.sessions.add(String(log.sessionId));
    byMessage.set(message, entry);
  });
  return Array.from(byMessage.values())
    .map(entry => ({ message: entry.message, count: entry.count, calendars: [...entry.calendars].sort(), people: entry.sessions.size }))
    .sort((a, b) => b.count - a.count || a.message.localeCompare(b.message));
}

export function parsePreviousState(issueBody) {
  const match = STATE_RE.exec(String(issueBody || ''));
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch (_) { return null; }
}

// What is worse than last time: a problem count that went up, a calendar whose audit failed, and
// error messages not seen in the previous report. First run (no previous state) never alerts.
export function diffAgainstPrevious(previous, current) {
  if (!previous) return { worse: [], newErrors: [], firstRun: true };
  const prevCounts = previous.counts || {};
  const worse = Object.entries(current.counts)
    .filter(([key, value]) => value > (Number(prevCounts[key]) || 0))
    .map(([key, value]) => ({ key, before: Number(prevCounts[key]) || 0, after: value }));
  current.failed.forEach(({ calendarId }) => worse.push({ key: `${calendarId}.auditFailed`, before: 0, after: 1 }));
  const seen = new Set(previous.errorMessages || []);
  const newErrors = current.errors.filter(error => !seen.has(error.message));
  return { worse, newErrors, firstRun: false };
}

const labelFor = key => {
  const [calendarId, field] = key.split('.');
  const label = PROBLEM_FIELDS.find(([name]) => name === field)?.[1] || (field === 'auditFailed' ? '점검 자체가 실패' : field);
  return `${calendarId}: ${label}`;
};

export function renderReport({ date, integrity, errors, diff, errorsAvailable }) {
  const lines = [REPORT_MARKER, `## 운영 일일 점검 (${date})`, ''];
  lines.push(diff.worse.length || diff.newErrors.length
    ? `**⚠️ 어제보다 나빠진 항목이 있어요.**`
    : '**어제보다 나빠진 항목 없음.**');
  lines.push('', '### 사진 무결성', '', '| 캘린더 | 항목 | 개수 |', '|---|---|---|');
  Object.entries(integrity.counts).forEach(([key, value]) => {
    const changed = diff.worse.find(item => item.key === key);
    const [calendarId] = key.split('.');
    lines.push(`| ${calendarId} | ${labelFor(key).split(': ')[1]} | ${value}${changed ? ` (↑ ${changed.before}→${value})` : ''} |`);
  });
  integrity.failed.forEach(({ calendarId, error }) => lines.push(`| ${calendarId} | 점검 실패 | ${error.slice(0, 80)} |`));
  lines.push('', '### 최근 24시간 앱 오류', '');
  if (!errorsAvailable) lines.push('_오류 기록을 읽지 못했어요 (서비스 계정 비밀값 없음)._');
  else if (!errors.length) lines.push('오류 없음.');
  else {
    lines.push('| 횟수 | 사람 수 | 캘린더 | 오류 |', '|---|---|---|---|');
    errors.slice(0, 20).forEach(error => {
      const isNew = diff.newErrors.some(item => item.message === error.message);
      lines.push(`| ${error.count} | ${error.people} | ${error.calendars.join(', ')} | ${isNew ? '🆕 ' : ''}${error.message.replace(/\|/g, '\\|')} |`);
    });
  }
  const state = { counts: integrity.counts, errorMessages: errors.map(error => error.message) };
  lines.push('', `<!-- ops-daily-state ${JSON.stringify(state)} -->`);
  return lines.join('\n');
}

export function renderAlertComment({ date, diff }) {
  const lines = [`**${date} 점검에서 나빠진 항목**`, ''];
  diff.worse.forEach(item => lines.push(`- ${labelFor(item.key)}: ${item.before} → ${item.after}`));
  diff.newErrors.forEach(error => lines.push(`- 새 앱 오류 (${error.count}회): ${error.message}`));
  lines.push('', '자세한 표는 이슈 본문에 있어요.');
  return lines.join('\n');
}
