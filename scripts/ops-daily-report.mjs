// Daily ops report (.github/workflows/ops-daily-report.yml).
//
//   npm run ops:daily-report              # prints the markdown report
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo npm run ops:daily-report -- --publish
//
// 1. Runs the read-only media integrity audit (scripts/audit-media-integrity.mjs).
// 2. Reads the last 24h of structured client/action audit events (serverAuditLogs) with the service account
//    in GOOGLE_APPLICATION_CREDENTIALS_JSON, if present -- the collection is not client-readable.
// 3. Persists the bounded diagnostic snapshot to opsDailyReports for later investigation.
// 4. With --publish, keeps ONE open issue labelled `ops-daily` up to date and comments on it only
//    when something got worse than the previous run (scripts/lib/ops-daily-report.mjs), so the
//    owner gets a GitHub notification for regressions but not for long-standing legacy counts.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import {
  REPORT_MARKER, summarizeIntegrity, summarizeClientErrors, parsePreviousState,
  diffAgainstPrevious, renderReport, renderAlertComment,
} from './lib/ops-daily-report.mjs';
import {
  analyzeRecentErrors, executeAutomatedSelfHealing, renderErrorDiagnosticReport
} from './lib/daily-error-analyzer.js';

const run = promisify(execFile);
const publish = process.argv.includes('--publish');
const LABEL = 'ops-daily';

async function runIntegrityAudit() {
  const { stdout } = await run(process.execPath, ['scripts/audit-media-integrity.mjs'], {
    env: process.env, maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(stdout.slice(stdout.indexOf('{')));
}

async function readClientErrorLogs() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) return null;
  const require = createRequire(new URL('../functions/package.json', import.meta.url));
  const { initializeApp, cert, deleteApp } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const app = initializeApp({ credential: cert(JSON.parse(json)) }, 'ops-daily-report');
  try {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const snap = await getFirestore(app).collection('serverAuditLogs')
      .where('receivedAt', '>=', since).orderBy('receivedAt', 'desc').limit(2000).get();
    return snap.docs.map(doc => doc.data());
  } finally {
    await deleteApp(app);
  }
}

async function persistDiagnosticReport({ date, analysis, healingResult, integrity, errors, errorsAvailable }) {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) return;
  const require = createRequire(new URL('../functions/package.json', import.meta.url));
  const { initializeApp, cert, deleteApp } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const app = initializeApp({ credential: cert(JSON.parse(json)) }, 'ops-daily-diagnostic');
  try {
    const clusters = (analysis.clusters || []).slice(0, 100).map(cluster => ({
      action: String(cluster.action || '').slice(0, 80),
      message: String(cluster.message || '').slice(0, 240),
      pattern: String(cluster.pattern || '').slice(0, 40),
      count: Number(cluster.count) || 0,
      calendars: Array.isArray(cluster.calendars) ? cluster.calendars.slice(0, 30) : [],
      uniqueUsers: Number(cluster.uniqueUsers) || 0,
      sampleResources: Array.isArray(cluster.sampleResources) ? cluster.sampleResources.slice(0, 3) : []
    }));
    await getFirestore(app).collection('opsDailyReports').doc(date).set({
      date,
      generatedAt: Date.now(),
      source: 'github-actions:ops-daily-report',
      errorsAvailable: Boolean(errorsAvailable),
      integrity: integrity.counts,
      integrityFailures: integrity.failed,
      clientErrors: Array.isArray(errors) ? errors : [],
      analysis: {
        totalEvents: analysis.totalEvents,
        clusterCount: analysis.clusterCount,
        patternSummary: analysis.patternSummary,
        actionLifecycle: analysis.actionLifecycle,
        clusters
      },
      healing: {
        dryRun: Boolean(healingResult?.dryRun),
        healedCount: Number(healingResult?.healedCount) || 0,
        actionsTaken: Array.isArray(healingResult?.actionsTaken) ? healingResult.actionsTaken.slice(0, 100) : [],
        plans: Array.isArray(healingResult?.plans) ? healingResult.plans.slice(0, 50) : []
      }
    }, { merge: true });
  } finally {
    await deleteApp(app);
  }
}

async function github(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${options.method || 'GET'} ${path} failed: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function publishReport({ body, date, current }) {
  const issues = await github(`/issues?state=open&labels=${LABEL}&per_page=10`);
  const existing = (issues || []).find(issue => String(issue.body || '').includes(REPORT_MARKER));
  const previous = existing ? parsePreviousState(existing.body) : null;
  const diff = diffAgainstPrevious(previous, current);
  const finalBody = body(diff);
  if (existing) {
    await github(`/issues/${existing.number}`, { method: 'PATCH', body: JSON.stringify({ body: finalBody }) });
    if (diff.worse.length || diff.newErrors.length) {
      await github(`/issues/${existing.number}/comments`, { method: 'POST', body: JSON.stringify({ body: renderAlertComment({ date, diff }) }) });
    }
    console.log(`updated issue #${existing.number} (worse=${diff.worse.length}, newErrors=${diff.newErrors.length})`);
  } else {
    const created = await github('/issues', {
      method: 'POST',
      body: JSON.stringify({ title: '운영 일일 점검 (자동)', body: finalBody, labels: [LABEL] }),
    });
    console.log(`created issue #${created.number}`);
  }
}

const date = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10); // KST
const integrity = summarizeIntegrity(await runIntegrityAudit());
let logs = null;
try {
  logs = await readClientErrorLogs();
} catch (err) {
  console.warn('[ops-daily-report] client error logs unavailable:', err?.message || err);
}
const errors = summarizeClientErrors(logs || []);
const current = { counts: integrity.counts, failed: integrity.failed, errors };

const errorAnalysis = analyzeRecentErrors(logs || []);
const healingResult = await executeAutomatedSelfHealing({
  calendarIds: Object.keys(integrity.counts).map(k => k.split('.')[0]),
  clusters: errorAnalysis.clusters,
  dryRun: true
});
const diagnosticReport = renderErrorDiagnosticReport({ date, analysis: errorAnalysis, healingResult });

const body = diff => `${renderReport({ date, integrity, errors, diff, errorsAvailable: logs !== null })}\n\n${diagnosticReport}`;

try {
  await persistDiagnosticReport({ date, analysis: errorAnalysis, healingResult, integrity, errors, errorsAvailable: logs !== null });
} catch (err) {
  console.warn('[ops-daily-report] diagnostic report persistence unavailable:', err?.message || err);
}

if (publish) {
  await publishReport({ body, date, current });
} else {
  console.log(body(diffAgainstPrevious(null, current)));
}
