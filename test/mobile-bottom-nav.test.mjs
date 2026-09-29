import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('mobile bottom nav item list and component match user specification', () => {
  const js = fs.readFileSync('src/ui/ui-app-shell-v2.js', 'utf8');

  // Verify MOBILE_BOTTOM_NAV_ITEMS declaration
  assert.match(js, /export const MOBILE_BOTTOM_NAV_ITEMS = \[/);
  assert.match(js, /\{ id: 'settlement', label: '정산', icon: 'settlement' \}/);
  assert.match(js, /\{ id: 'memo', label: '메모', icon: 'memo' \}/);
  assert.match(js, /\{ id: 'calendar', label: '캘린더', icon: 'calendar' \}/);
  assert.match(js, /\{ id: 'chat', label: '채팅', icon: 'chat' \}/);
  assert.match(js, /\{ id: 'more', label: '더보기', icon: 'more' \}/);

  // Verify MobileBottomNav component declaration & usage
  assert.match(js, /export function MobileBottomNav\(\{ activeTab, isSideNavOpen, onSelectTab \}\)/);
  assert.match(js, /React\.createElement\(MobileBottomNav,/);
});

test('mobile bottom nav css contracts in dest-chrome-late.css', () => {
  const css = fs.readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');

  // 1. Mobile FAB is hidden
  assert.match(
    css,
    /\.v2-design \.bp-home-menu-fab,\s*\.v2-design \.bp-menu-fab,\s*\.v2-design \.bp-fab\s*\{\s*display:\s*none\s*!important;\s*\}/
  );

  // 2. Mobile bottom nav root positioning and styling
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav \{/);
  assert.match(css, /height:\s*var\(--mobile-bottom-nav-total,/);
  assert.match(css, /padding-bottom:\s*env\(safe-area-inset-bottom,\s*0px\)\s*!important;/);
  assert.match(css, /background:\s*var\(--bg-card\)\s*!important;/);
  assert.match(css, /border-top:\s*1px solid var\(--border-subtle\)\s*!important;/);

  // 3. Desktop hides bottom nav
  assert.match(css, /@media \(min-width: 1200px\) \{\s*\.v2-design \.bp-mobile-bottom-nav \{\s*display:\s*none\s*!important;\s*\}\s*\}/);

  // 4. Side drawer stops above the bottom bar
  assert.match(css, /bottom:\s*var\(--mobile-bottom-nav-total/);

  // 5. Chat composer sits directly above mobile bottom nav
  assert.match(css, /\.v2-chat \.v2-chat-composer \{\s*bottom:\s*var\(--mobile-bottom-nav-total/);

  // 6. Active focus indicator bar exists and uses var(--brand)
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav-indicator \{/);
  assert.match(css, /background:\s*var\(--brand\)\s*!important;/);
});
