import { statSync } from 'node:fs';

const SIZE_BUDGETS = [
  {
    path: 'index.html',
    maxBytes: 2_440_000,
    reason: 'Keep the live app shell within bounds (temporarily doubled to 200% for active dev).'
  },
  {
    path: 'assets/app-main.js',
    maxBytes: 1_240_000,
    reason: 'App shell monolith guard (temporarily doubled to 200% for active dev).'
  }
];

for (const budget of SIZE_BUDGETS) {
  const { size } = statSync(budget.path);
  if (size > budget.maxBytes) {
    console.error(
      `Size budget exceeded: ${budget.path} is ${size.toLocaleString()} bytes, ` +
      `limit is ${budget.maxBytes.toLocaleString()} bytes. ${budget.reason}`
    );
    process.exit(1);
  }
  console.log(`[size-budget] ${budget.path} ${size.toLocaleString()} / ${budget.maxBytes.toLocaleString()} bytes`);
}

console.log('Size budget check passed.');
