import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('mobile bottom nav item list and component match user specification', () => {
  const js = fs.readFileSync('src/ui/ui-app-shell-v2.js', 'utf8');

  // Verify MOBILE_BOTTOM_NAV_ITEMS declaration
  assert.match(js, /export const MOBILE_BOTTOM_NAV_ITEMS = \[/);
  assert.match(js, /\{ id: 'settlement', label: '정산', icon: 'settlement' \}/);
  assert.match(js, /\{ id: 'memo', label: '메모', icon: 'memo' \}/);
  assert.match(js, /\{ id: 'calendar', label: '캘린더', icon: 'calendar',\s*isCenter:\s*true \}/);
  assert.match(js, /\{ id: 'chat', label: '채팅', icon: 'chat' \}/);
  assert.match(js, /\{ id: 'more', label: '더보기', icon: 'more' \}/);

  // Verify MobileBottomNav component declaration & usage
  assert.match(js, /export function MobileBottomNav\(\{ activeTab, isSideNavOpen, onSelectTab \}\)/);
  assert.match(js, /React\.createElement\(MobileBottomNav,/);
  // Center circle for calendar without bottom text label
  assert.match(js, /mobile-bottom-nav-center-circle/);
});

test('mobile bottom nav css contracts in dest-chrome-late.css', () => {
  const css = fs.readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');

  // 1. Mobile FAB is hidden
  assert.match(
    css,
    /\.v2-design \.bp-home-menu-fab,\s*\.v2-design \.bp-menu-fab,\s*\.v2-design \.bp-fab\s*\{\s*display:\s*none\s*!important;\s*\}/
  );

  // 2. Mobile bottom nav root positioning, rounded top corners, no border-top
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav \{/);
  assert.match(css, /height:\s*var\(--mobile-bottom-nav-total,/);
  assert.match(css, /padding-bottom:\s*env\(safe-area-inset-bottom,\s*0px\)\s*!important;/);
  assert.match(css, /background:\s*var\(--bg-card\)\s*!important;/);
  assert.match(css, /border-top:\s*none\s*!important;/);
  assert.match(css, /border-radius:\s*24px 24px 0 0\s*!important;/);

  // 3. Desktop hides bottom nav
  assert.match(css, /@media \(min-width: 1200px\) \{[\s\S]*\.v2-design \.bp-mobile-bottom-nav \{\s*display:\s*none\s*!important;\s*\}\s*\}/);

  // 4. Side drawer stops above the bottom bar
  assert.match(css, /bottom:\s*var\(--mobile-bottom-nav-total/);

  // 5. Chat composer sits directly above mobile bottom nav
  assert.match(css, /\.v2-chat \.v2-chat-composer \{\s*[\s\S]*bottom:\s*var\(--mobile-bottom-nav-total/);

  // 6. Active focus indicator bar exists and uses var(--brand)
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav-indicator \{/);
  assert.match(css, /background:\s*var\(--brand\)\s*!important;/);

  // 7. Center circle has exaggerated aurora wave animation & vibrant purple-blue gradient
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav-center-circle::before \{/);
  assert.match(css, /animation:\s*bp-cal-aurora-wave 3s ease-in-out infinite alternate,\s*bp-cal-aurora-spin 6\.5s linear infinite\s*!important;/);

  // 8. Lateral item offset positioning for spacing balance
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav-item\.bp-item-settlement\s*\{\s*transform:\s*translateX\(10px\)\s*!important;\s*\}/);
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav-item\.bp-item-memo\s*\{\s*transform:\s*translateX\(-8px\)\s*!important;\s*\}/);
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav-item\.bp-item-chat\s*\{\s*transform:\s*translateX\(8px\)\s*!important;\s*\}/);
  assert.match(css, /\.v2-design \.bp-mobile-bottom-nav-item\.bp-item-more\s*\{\s*transform:\s*translateX\(-10px\)\s*!important;\s*\}/);

  // 9. When virtual keyboard is open, hide bottom nav and zero out nav clearance
  assert.match(css, /html:has\(\.renewal-shell\.v2-design\)\[data-v2-keyboard\]\s*\{\s*--mobile-bottom-nav-total:\s*0px\s*!important;\s*\}/);
  assert.match(css, /html:has\(\.renewal-shell\.v2-design\)\[data-v2-keyboard\]\s*\.bp-mobile-bottom-nav\s*\{\s*display:\s*none\s*!important;\s*\}/);

  // 10. v2-chat-root is pinned to top: 0 and bottom: 0 so it never lifts upward on keyboard open
  assert.match(css, /html:has\(\.renewal-shell\.v2-design\)\s*\.v2-chat\s*\.v2-chat-root\s*\{[\s\S]*top:\s*0\s*!important;[\s\S]*bottom:\s*0\s*!important;/);
});

test('ChatScreen in screens.js does not shift v2-chat-root by viewportBottom', () => {
  const js = fs.readFileSync('src/ui/v2/screens.js', 'utf8');
  assert.doesNotMatch(js, /className:\s*'chat-room-container v2-chat-root',\s*style:\s*\{[\s\S]*bottom:\s*p\.viewportBottom/);
  assert.match(js, /className:\s*'chat-room-container v2-chat-root',\s*style:\s*\{[\s\S]*bottom:\s*0,/);
});
