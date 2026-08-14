import { spawnSync } from 'node:child_process';

// Production is intentionally Firestore-only. The old regression script drove a
// removed localStorage mode, so keep this command aligned with the checks CI
// trusts today: storage safety, tab reachability, and a production build.
const CURRENT_REGRESSION_SUITES = [
  ['safety:test', 'Firebase-only storage, URL parsing, merge, log, and sanitizer checks'],
  ['check:asset-mirrors', 'external root/public asset mirror checks'],
  ['check:size-budget', 'single-file app shell size budget checks'],
  ['check:tab-wiring', 'reachable tab/mode branch checks'],
  ['build', 'production bundle smoke check']
];

for (const [scriptName, description] of CURRENT_REGRESSION_SUITES) {
  console.log(`\n[regression] ${scriptName} - ${description}`);
  const result = spawnSync('npm', ['run', scriptName], {
    stdio: 'inherit',
    env: { ...process.env, npm_config_loglevel: 'error' }
  });

  if (result.error) {
    console.error(`[regression] Failed to start ${scriptName}:`, result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[regression] ${scriptName} failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log('\nRegression suite passed.');
