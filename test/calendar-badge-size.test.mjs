import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const late = readFileSync(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8');
const design = readFileSync(new URL('../src/ui/v2/design.css', import.meta.url), 'utf8');

test('calendar anniversary and 모임확정 pills are 11px; other UI stays on the 12px floor', () => {
  assert.match(design, /--v2-fs-2xs:\s*max\(12px,\s*0\.75rem\)/, 'type scale floor stays 12px');
  assert.match(late, /--v2-badge-fs:\s*max\(12px,\s*0\.75rem\)/, 'shared badge token stays 12px');
  assert.match(
    design,
    /\.v2-design \.bp-hero-weather-dday-badge\s*\{[\s\S]*?font-size:\s*0?\.75rem !important;/,
    'non-calendar badges stay at 12px'
  );

  const cellPill = late.slice(late.indexOf('Calendar cell pills are the 11px exception'));
  assert.match(cellPill, /\.bp-day-meeting-pill,/);
  assert.match(cellPill, /\.bp-day-bar-label,/);
  assert.match(cellPill, /\.bp-day-anniversary > \.bp-day-anniversary-label,/);
  assert.match(cellPill, /\.bp-ann-range\.bp-has-label > \.bp-day-anniversary-label \{[\s\S]*?font-size:\s*11px !important;/);
  assert.doesNotMatch(cellPill.slice(0, cellPill.indexOf('html:has(.renewal-shell.v2-design) .culture-items-grid')), /font-size:\s*0?\.75rem/);
});

test('calendar badges sit just under the day number instead of the 84px cell floor', () => {
  assert.match(
    late,
    /\.bp-day-cell \.bp-day-bar-stack \{[\s\S]*?margin-top:\s*2px !important;/
  );
  const cellPill = late.slice(late.indexOf('Calendar cell pills are the 11px exception'));
  assert.match(cellPill, /\.bp-cal-days-grid \.bp-day-cell \{[\s\S]*?min-height:\s*0 !important;/);
  assert.match(cellPill, /\.bp-cal-days-grid \.bp-day-cell \{[\s\S]*?gap:\s*2px !important;/);
  assert.match(cellPill, /\.bp-day-bar-stack \{[\s\S]*?margin-top:\s*2px !important;/);
  // Lane padding and horizontal span are unchanged.
  assert.match(late, /padding-bottom:\s*calc\(var\(--ann-lanes\) \* \(var\(--ann-bar-h\) \+ var\(--ann-bar-gap\)\) \+ 3px\) !important/);
  assert.match(late, /\.bp-ann-range\.bp-is-start \{[\s\S]*?right:\s*-1px !important;/);
});
