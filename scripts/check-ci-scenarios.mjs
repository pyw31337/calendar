import fs from 'node:fs';

const smoke = fs.readFileSync('scripts/browser-smoke-test.mjs', 'utf8');
const deployWorkflow = fs.readFileSync('.github/workflows/deploy-vite-pages.yml', 'utf8');
const required = [
  ['places route', /view=places/],
  ['settlement route', /view=settlement/],
  ['map/cluster route coverage', /view=places[\s\S]*view=settlement/],
  ['mobile viewport', /width: 390/],
  ['Pages base path forwarded to Vite preview', /VITE_BASE_PATH:[\s\S]*LOCAL_BASE_PATH/],
];
const workflowRequired = [
  ['deploy smoke uses Pages base path', /CALENDAR_SMOKE_BASE_PATH:\s*\/calendar\//],
  ['deploy smoke is a blocking gate', /name:\s*Run browser smoke before publishing artifact(?:(?!continue-on-error)[\s\S])*?name:\s*Publish to gh-pages/],
];
const missing = [
  ...required.filter(([, pattern]) => !pattern.test(smoke)),
  ...workflowRequired.filter(([, pattern]) => !pattern.test(deployWorkflow)),
];
for (const [label, pattern] of required) console.log(`${pattern.test(smoke) ? '✓' : '✗'} ${label}`);
for (const [label, pattern] of workflowRequired) console.log(`${pattern.test(deployWorkflow) ? '✓' : '✗'} ${label}`);
if (missing.length) process.exit(1);
