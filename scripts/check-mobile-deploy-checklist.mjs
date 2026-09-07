import fs from 'node:fs';

const css = fs.readFileSync('src/app.css', 'utf8');
const notifications = fs.readFileSync('src/core/app-notifications.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const checks = [
  ['mobile inputs use 16px minimum', /font-size:\s*1rem\s*!important/.test(css)],
  ['bottom sheet overlay has elevated z-index', /bottom-sheet-overlay[\s\S]{0,1200}z-index:\s*2?\d{4}/.test(css)],
  ['iOS standalone notification diagnostics present', /standalone|display-mode:\s*standalone/.test(notifications) && /Notification\.permission/.test(notifications)],
  ['service-worker cache is build SHA scoped', /__BUILD_SHA__/.test(sw)],
];
const failures = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? '✓' : '✗'} ${label}`);
if (failures.length) process.exit(1);
