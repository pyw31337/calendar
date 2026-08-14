import { statSync } from 'node:fs';

const SIZE_BUDGETS = [
  {
    path: 'index.html',
    maxBytes: 1_050_000,
    reason: 'Keep the live app shell from regrowing into a fragile single-file bundle.'
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
