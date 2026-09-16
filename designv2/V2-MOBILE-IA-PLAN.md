# V2 Mobile IA Plan (Phase 0)

**Date:** 2026-09-16 (KST)  
**Branch:** `feat/v2-mobile-consistency`  
**Scope:** `?shell=v2` mobile + side-nav only. Default shell untouched.  
**Rule:** Plan committed first; implement only to this document — no drive-by CSS.

## Capture inventory

| Shell | Path | Notes |
|-------|------|-------|
| Original / product structure (user live shots) | `designv2/parity-shots/phase0-mobile/default-ref/{chat,settlement,gallery,places,memo,content}.png` | Copied from `audit-live-user/t177-mobile/` — authoritative “how the product structures each page” |
| V2 mobile (live preview @390×844) | `designv2/parity-shots/phase0-mobile/v2/{chat,memo,gallery,places,settlement,content,side-menu}.png` | Captured 2026-09-16 against `http://127.0.0.1:4173/?id=cw&shell=v2` |
| V2 measure JSON | `designv2/parity-shots/phase0-mobile/v2-report.json` | Tag-chip count, FAB, rail display |

Default-shell `tab=` URLs on mobile often stay on the home calendar strip (투표/채팅/정산/메모); full destination chrome matches the user ref shots above. V2 uses first-class tab destinations.

---

## 1. Shared chrome (unify once)

### 1.1 Header module (`PageHeader` in `src/ui/v2/screens.js`)

**Target pattern (all destinations):**

| Slot | Behavior |
|------|----------|
| Back | `onBack` → calendar / prior tab |
| Title (+ optional subtitle/count) | Same typography tokens |
| Actions (right) | Only **wired** icons — never decorative |
| Hamburger | **Always** opens V2 side-nav drawer (`setIsSideNavOpen(true)`) on mobile |
| Share | Only when `onShare` is a real handler |
| Extra | Only when a dedicated handler exists (e.g. chat gallery, places map) |

**Spacing tokens (mobile):**

| Token | Value |
|-------|-------|
| Header pad | `12px 14px 10px` |
| Action icon hit | `≥44×44` visual via `7px` pad on `.bp-icon-btn` |
| Header action gap | `4px` |
| Page horizontal pad | `14px` |
| Section gap | `8–12px` |
| Card radius | `12–14px` |
| FAB | `52×52`, `right: 20px`, `bottom: 24px + safe-area` |

### 1.2 Side-nav mobile behavior

**Bug (current):** Home hamburger → `setIsSideNavOpen(true)` ✓. Destination `PageHeader` `onMenu` is wired to **app-settings** or **feature menus** (memo menu) ✗ — drawer never opens from chat/memo/places/settlement/gallery/content.

**Fix:**

1. Thread `onOpenSideNav={() => setIsSideNavOpen(true)}` from `RenewalAppShell` into every destination pane.
2. `PageHeader` / screen `onMenu` → `onOpenSideNav` (hamburger).
3. Feature-only menus (memo portal menu, chat room menu) must **not** steal the hamburger; expose them only if original had a distinct working control — otherwise drop.
4. Keep backdrop + slide-in rules under `max-width: 1199px` (`reference-home.css` / `design.css`). Do not `display:none` the rail on `.v2-has-detail` (already fixed in prior PRs; do not regress).
5. Selecting a side item closes the drawer (`setIsSideNavOpen(false)` — already present on `selectSideItem`).

### 1.3 FAB rules

| Screen | FAB | Action |
|--------|-----|--------|
| Memo | Yes | Expand / focus composer |
| Places | Yes | Create place |
| Settlement | Yes | Create expense |
| Chat | No | Composer is the primary create surface |
| Gallery | No FAB; use existing `+` / edit in toolbar |
| Content | No | Use existing register controls |

One purple circular `+` style (`.bp-fab`). No duplicate FABs over legacy ones — hide legacy FAB when V2 FAB is mounted.

### 1.4 Composer / author picker

- **Chat:** Keep top composer (attach · input · send) + author pill + tool icons (emoji / image / paste). Unify tool icon class (`.v2-tool-icon-btn`).
- **Memo:** Composer card + image affordance; no second conflicting composer chrome.
- Author pill colors stay participant-driven (existing).

---

## 2. Per-screen: original vs V2 mess → keep / remove / unify

### 2.1 Chat

| | Original | V2 now | Action |
|--|----------|--------|--------|
| Header | Back · 채팅 + subtitle · search / gallery / menu | Similar; menu ≠ side-nav | Wire menu → side-nav; keep search + gallery |
| Composer | Top-anchored + author pill + tools | Present | Keep; tighten pad tokens only |
| Bubbles | Name pills, timestamps, reply/edit/delete | Present | Keep features; no layout rewrite |
| Side-nav | Via hamburger | Broken | Fix via shared chrome |

### 2.2 Memo — **P0 user ask**

| | Original | V2 now | Action |
|--|----------|--------|--------|
| Search | Under header | Present (V2 + risk of legacy duplicate) | Keep **one** search in `PageHeader` |
| **Tag cloud** | Dense wrap under search | **89 chips** in V2 capture | **REMOVE** `.bp-tag-filter-row` from `MemoScreen` entirely |
| Tags still usable? | Card hashtags + `selectedTag` filter in `MemoView` | `onSelectTag` already passed | Keep card-tag → `setSelectedTag`; search can include tag text. **Do not** invent a dead filter icon |
| Header “정렬/filter” | Opens memo side menu | V2 sort icon → `onSort \|\| onMenu` (duplicate / fake) | **Remove** sort `extra` unless `onSort` is a real distinct handler (it is not today) |
| Hamburger | App / side menu | Opens memo menu | → side-nav |
| FAB | Purple `+` | Present | Keep; hide legacy duplicate if any |
| Composer | “새로운 메모…” | Present but competing with tag cloud for space | After tag removal, composer + list regain viewport |

### 2.3 Gallery

| | Original | V2 now | Action |
|--|----------|--------|--------|
| Grid | 4-col mobile | ~3-col in one capture | Unify to **4 columns on mobile** (`max-width: 639px`), 3-col tablet+ as already intended for PC |
| Toggle | 전체 \| 일자 | Present | Keep (wired) |
| `+` / edit | Toolbar | Present | Keep |
| Header menu | — | Often app-settings | → side-nav |
| Fixed shell | Legacy `position:fixed` | Partially neutralized | Ensure no cover over drawer |

### 2.4 Places

| | Original | V2 now | Action |
|--|----------|--------|--------|
| Search + map + filters + cards + FAB | All present | Largely parity | Token unify only |
| Header map/share/menu | Present | Menu wrong target | Menu → side-nav; keep map + share |
| Visit chips | 전체/방문/예정 | Present | Keep |

### 2.5 Settlement

| | Original | V2 now | Action |
|--|----------|--------|--------|
| Tabs + summary + category + list + FAB | Present | Near parity | Token unify; menu → side-nav |
| Share | Present | Keep | |

### 2.6 Content

| | Original | V2 now | Action |
|--|----------|--------|--------|
| Region + view toggle + category chips + 2-col grid | Present | Present with V2 header wrap | Menu → side-nav; hide duplicate legacy title if double chrome |
| Fake controls | None expected | Audit any non-wired toggles | Remove or wire |

### 2.7 Side menu (drawer)

| | Home | Destinations |
|--|------|----------------|
| Open | Hamburger works | **Broken** — fix |
| Contents | Brand, manual, settings, main/sub items, share | Same drawer instance |
| Capture note | `v2/side-menu.png` did not show open drawer (open failed from home heuristics in one run) | After fix, re-capture open state from a destination header |

---

## 3. Progressive disclosure — anniversary bars

**Goal:** PC/wide → anniversary **title text inside** green badge; mobile/narrow → **thin color bar only** (text off).

**Status on `main`:** Labels forced visible / `bar-only` bars — not progressive.

**Ship in Phase 1 (from stopped-agent WIP, reviewed):**

- Render `.bp-day-anniversary-label` in DOM always.
- Default CSS: hide label; compact bar height.
- `@media (min-width: 768px)`: show label on non-`mid` / non-`bar-only` segments.
- Mid segments of 연일 ranges stay connectors.

Files: `src/ui/ui-app-shell-v2.js`, `src/ui/v2/design.css`.

---

## 4. Consistency matrix

| Concern | Chat | Memo | Places | Settlement | Gallery | Content | Home |
|---------|------|------|--------|------------|---------|---------|------|
| `PageHeader` module | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | TopHeader (brand) |
| Hamburger → side-nav | fix | fix | fix | fix | fix | fix | ✓ |
| H-pad 14px | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | hero tokens |
| FAB rules | — | ✓ | ✓ | ✓ | toolbar | — | — |
| Composer/author pattern | top composer | memo composer | — | — | — | — | — |
| No fake filters | — | remove sort+cloud | — | — | — | audit | — |
| Anniv text PC on / mobile off | — | — | — | — | — | — | Phase 1 |

---

## 5. Implementation order

1. **Side-nav wiring** — `onOpenSideNav` through panes → all `PageHeader`/`Gallery`/`Content` menus. Re-capture drawer from memo + chat.
2. **Memo cleanup** — remove tag cloud; remove unwired sort extra; hide legacy duplicate search/tag chrome under V2; keep `onSelectTag` via cards.
3. **Anniversary progressive disclosure** — JS + CSS as above.
4. **Gallery mobile 4-col** + ensure fixed shells don’t cover drawer.
5. **Token pass** — shared header/FAB/padding only where screens diverge (screens.css / design.css under `.v2-design`).
6. **Content double-chrome** — hide legacy page title when V2 header present.
7. **Screenshot compare** after each major screen; then build, Pages deploy, PR.

### Explicit non-goals (defer)

- Full ChatFull/MemoFull DOM rebuild beyond chrome consistency.
- PC density / bento home polish.
- Archive deep visual parity.
- Changing default shell.
- Inventing new filter UIs.

### Guardrails

- Preserve features, URLs (`?shell=v2&tab=…`), and data handlers.
- Edits only under V2 modules / `.v2-design` selectors / shell pass-throughs.
- No drive-by CSS outside listed items.

---

## 6. Phase 1 checklist (track in PR)

- [x] Destination hamburger opens side-nav on mobile
- [x] Memo tag cloud removed under search
- [x] No fake memo sort/filter icon
- [x] Memo tags still filter via card tag taps / existing `selectedTag`
- [x] Anniversary: mobile bar-only, PC/wide label
- [x] Gallery mobile 4-column
- [x] Shared header/FAB/padding tokens applied
- [x] Content/Gallery no double title chrome
- [x] Post-fix mobile screenshots under `designv2/parity-shots/phase0-mobile/v2-after/`
- [ ] PR merged + GitHub Pages updated
