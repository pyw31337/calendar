#!/usr/bin/env node
/**
 * Daily Error Analysis & Self-Healing Runner (CLI)
 *
 * Usage:
 *   node scripts/daily-error-heal.mjs                 # Dry-run analysis and report
 *   node scripts/daily-error-heal.mjs --apply         # Execute automated self-healing procedures
 *   npm run ops:error-heal                            # Run via npm script
 *
 * Integrates:
 *   - Error logs extraction from Firestore serverAuditLogs (if GOOGLE_APPLICATION_CREDENTIALS_JSON is present)
 *   - Failure pattern classification (Network Transient, Conflict, Integrity, Rate Limit, Permission)
 *   - Automated self-healing execution
 *   - Markdown diagnostic report rendering
 */

import { createRequire } from 'node:module';
import { analyzeRecentErrors, executeAutomatedSelfHealing, renderErrorDiagnosticReport } from './lib/daily-error-analyzer.js';

const apply = process.argv.includes('--apply') || process.env.APPLY === '1';
const dryRun = !apply;

async function readRecentAuditLogs() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) {
    console.warn('[daily-error-heal] No service account key found in GOOGLE_APPLICATION_CREDENTIALS_JSON. Using empty/local buffer.');
    return [];
  }
  try {
    const require = createRequire(new URL('../functions/package.json', import.meta.url));
    const { initializeApp, cert, deleteApp } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    const app = initializeApp({ credential: cert(JSON.parse(json)) }, 'daily-error-heal');
    try {
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const snap = await getFirestore(app).collection('serverAuditLogs')
        .where('receivedAt', '>=', since)
        .orderBy('receivedAt', 'desc')
        .limit(2000)
        .get();
      return snap.docs.map(doc => doc.data());
    } finally {
      await deleteApp(app);
    }
  } catch (err) {
    console.warn('[daily-error-heal] Failed to read serverAuditLogs:', err?.message || err);
    return [];
  }
}

async function main() {
  const date = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  console.log(`[daily-error-heal] Starting 24h error analysis for ${date} (dryRun=${dryRun})...`);

  const logs = await readRecentAuditLogs();
  const analysis = analyzeRecentErrors(logs);

  const healingResult = await executeAutomatedSelfHealing({
    calendarIds: [],
    clusters: analysis.clusters,
    dryRun
  });

  const report = renderErrorDiagnosticReport({
    date,
    analysis,
    healingResult
  });

  console.log('\n' + report + '\n');
}

main().catch(err => {
  console.error('[daily-error-heal] Fatal error:', err);
  process.exit(1);
});
