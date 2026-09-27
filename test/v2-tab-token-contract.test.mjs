import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const shared = readFileSync(join(root, 'src/ui/ui-shared.js'), 'utf8');
const gallery = readFileSync(join(root, 'src/ui/ui-summary-gallery.js'), 'utf8');
const chrome = readFileSync(join(root, 'src/ui/v2/dest-chrome-late.css'), 'utf8');

test('V2 date-sheet tab labels and state dots use shared tokens', () => {
  assert.match(shared, /underline-tabs-label\$\{isDotBadge && showBadge \? ' has-status-dot' : ''\}/);
  assert.match(shared, /className: 'underline-tabs-count'/);
  assert.match(gallery, /className: `underline-tabs-count/);
  assert.match(chrome, /--v2-event-sheet-tab-label-fs:\s*0\.9rem;/);
  assert.match(chrome, /--v2-tab-status-dot-size:\s*6px;/);
  assert.match(chrome, /\.bp-event-sheet \.underline-tabs-label\.has-status-dot::after[\s\S]*?width:\s*var\(--v2-tab-status-dot-size\);[\s\S]*?height:\s*var\(--v2-tab-status-dot-size\);/);
});

test('V2 calendar rail D-day remains plain purple status text', () => {
  const match = chrome.match(/\.v2-design \.bp-side-nav-calendar-dday-badge \{([\s\S]*?)\n\}/);
  assert.ok(match, 'calendar D-day selector exists');
  assert.match(match[1], /background:\s*transparent;/);
  assert.match(match[1], /color:\s*var\(--brand, #7C2FE5\);/);
  assert.doesNotMatch(match[1], /!important/);
});
