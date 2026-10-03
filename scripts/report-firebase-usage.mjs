#!/usr/bin/env node
/**
 * Read-only Firebase usage report for the last DAYS days (default 7), from Cloud Monitoring:
 * Firestore reads/writes/deletes per day, Storage bytes stored and sent, Cloud Functions
 * executions per function. Used to pick cost work by measurement instead of guesses
 * (docs/firebase-cost-control.md). Needs the service account (Deploy Firebase backend workflow).
 *
 *   [DAYS=7] node scripts/report-firebase-usage.mjs
 */
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { GoogleAuth } = require('google-auth-library');

const PROJECT = process.env.GCLOUD_PROJECT || 'metro-live-2918e';
const DAYS = Math.max(1, Math.min(30, Number(process.env.DAYS) || 7));
const DAY = 24 * 60 * 60 * 1000;
// Free tier (Spark/Blaze no-cost quota) for reference.
const FREE = { reads: 50000, writes: 20000, deletes: 20000 };

const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/monitoring.read'] });
const client = await auth.getClient();
const end = new Date(Math.floor(Date.now() / DAY) * DAY);
const start = new Date(end.getTime() - DAYS * DAY);

async function series(metric, { groupBy = [], reducer = 'REDUCE_SUM', aligner = 'ALIGN_SUM', resourceType = '' } = {}) {
  const params = new URLSearchParams({
    filter: `metric.type="${metric}"${resourceType ? ` AND resource.type="${resourceType}"` : ''}`,
    'interval.startTime': start.toISOString(),
    'interval.endTime': end.toISOString(),
    'aggregation.alignmentPeriod': `${DAY / 1000}s`,
    'aggregation.perSeriesAligner': aligner,
    'aggregation.crossSeriesReducer': reducer,
  });
  groupBy.forEach(field => params.append('aggregation.groupByFields', field));
  const url = `https://monitoring.googleapis.com/v3/projects/${PROJECT}/timeSeries?${params}`;
  try {
    const { data } = await client.request({ url });
    return data.timeSeries || [];
  } catch (error) {
    return [{ error: String(error?.response?.data?.error?.message || error?.message || error).slice(0, 200) }];
  }
}

const valueOf = point => Number(point.value?.int64Value ?? point.value?.doubleValue ?? 0);
function perDay(list) {
  if (list[0]?.error) return { error: list[0].error };
  const days = {};
  list.forEach(item => (item.points || []).forEach(point => {
    const day = String(point.interval?.endTime || '').slice(0, 10);
    days[day] = (days[day] || 0) + valueOf(point);
  }));
  return Object.fromEntries(Object.entries(days).sort());
}
function totals(list, label) {
  if (list[0]?.error) return { error: list[0].error };
  const out = {};
  list.forEach(item => {
    const key = item.metric?.labels?.[label] || item.resource?.labels?.[label] || 'unknown';
    out[key] = (out[key] || 0) + (item.points || []).reduce((sum, point) => sum + valueOf(point), 0);
  });
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]));
}

const [reads, writes, deletes, readsByType, sent, stored, executions] = await Promise.all([
  series('firestore.googleapis.com/document/read_count'),
  series('firestore.googleapis.com/document/write_count'),
  series('firestore.googleapis.com/document/delete_count'),
  series('firestore.googleapis.com/document/read_count', { groupBy: ['metric.label.type'] }),
  series('storage.googleapis.com/network/sent_bytes_count', { groupBy: ['resource.label.bucket_name'] }),
  series('storage.googleapis.com/storage/total_bytes', { aligner: 'ALIGN_MEAN', groupBy: ['resource.label.bucket_name'] }),
  series('cloudfunctions.googleapis.com/function/execution_count', { groupBy: ['resource.label.function_name', 'resource.label.region'] }),
]);

const execByFunction = {};
if (!executions[0]?.error) {
  executions.forEach(item => {
    const key = `${item.resource?.labels?.function_name}@${item.resource?.labels?.region}`;
    execByFunction[key] = (execByFunction[key] || 0) + (item.points || []).reduce((sum, point) => sum + valueOf(point), 0);
  });
}
const storedLatest = stored[0]?.error ? { error: stored[0].error } : Object.fromEntries(stored.map(item => [
  item.resource?.labels?.bucket_name, Math.round(valueOf((item.points || [])[0] || {}) / 1048576) + ' MB',
]));
const sentMB = totals(sent, 'bucket_name');
Object.keys(sentMB).forEach(key => { if (typeof sentMB[key] === 'number') sentMB[key] = `${Math.round(sentMB[key] / 1048576)} MB`; });

console.log(JSON.stringify({
  project: PROJECT,
  window: { start: start.toISOString(), end: end.toISOString(), days: DAYS },
  freeTierPerDay: FREE,
  firestore: { readsPerDay: perDay(reads), writesPerDay: perDay(writes), deletesPerDay: perDay(deletes), readsByType: totals(readsByType, 'type') },
  storage: { storedNow: storedLatest, sentInWindow: sentMB },
  functions: { executionsInWindow: Object.fromEntries(Object.entries(execByFunction).sort((a, b) => b[1] - a[1]).slice(0, 40)) },
}, null, 2));
