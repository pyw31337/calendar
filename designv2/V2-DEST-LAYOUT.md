# V2 Destination Full-Bleed Layout Module

**Live:** `https://pyw31337.github.io/calendar/?id=cw&shell=v2`  
**Baseline:** Chat (`.v2-chat` / `.v2-chat-shell`) — max-width none, no outer page margin.  
**Module:** `src/ui/v2/dest-layout.css` (imported once from `src/ui/v2/screens.js`)  
**Captures:** `designv2/parity-shots/unit-loop/dest-fullbleed/`

## Goal

All remaining V2 destination pages fill the main pane **edge-to-edge under the side rail** (마진 없이 / full-bleed), matching chat. No floating max-width card and no outer `margin: 14px` around the whole page / map / list shell.

Internal content padding (~14px horizontal for readability, like the chat message column) is OK. Shared sticky `PageHeader` stays full width — no double gutters under it.

## One-shot tweaks (change all destinations at once)

Edit tokens on `.v2-design` in `src/ui/v2/dest-layout.css`:

| Token | Default | Meaning |
|-------|---------|---------|
| `--v2-dest-pad-x` | `0px` | Outer horizontal inset of the whole destination shell |
| `--v2-dest-pad-y` | `0px` | Outer vertical inset of the whole destination shell |
| `--v2-dest-content-pad-x` | `14px` | Inner content column pad (lists / grids / map toolbar) |
| `--v2-dest-content-pad-y` | `0px` | Inner content vertical pad (reserved) |

Shared classes:

- **`.v2-dest-page`** — put on every destination root (already used). Full-bleed width / max-width / margin / outer pad tokens.
- **`.v2-dest-body` / `.v2-legacy-body`** — fill under `PageHeader`; no outer side margin.
- **`.v2-dest-content-pad`** — optional helper for a content column without reintroducing outer gutters.

To restore a framed “card” look later: set `--v2-dest-pad-x` / `--v2-dest-pad-y` (e.g. `14px`) in one place.

## Screens using the module

| Screen | Root class | Notes |
|--------|------------|-------|
| Chat | `.v2-chat.v2-dest-page` | **Reference** — unchanged full-bleed |
| Memo | `.v2-memo.v2-dest-page` | Inner list pad via `--v2-dest-content-pad-x` |
| Places | `.v2-places.v2-dest-page` | Map panel outer margin neutralized |
| Settlement | `.v2-settlement.v2-dest-page` | Body pad uses content token |
| Gallery | `.v2-gallery.v2-dest-page` | Embed / records frame |
| Content | `.v2-content.v2-dest-page` | Embed / records frame |
| Archive | `.v2-archive.v2-dest-page` | Embed / records frame |

Home / calendar main stays as-is (not a `v2-dest-page`).

## Margins removed / neutralized

Also neutralized (via dest-layout, not reference file edits):

- `design.css` `--v2-page-pad` on `.bp-app-shell` for destination roots (was ~20–24px, creating a gap above sticky `PageHeader`)
- `reference-{memo,places,settlement}.css` `@media (min-width: 1200px)` `padding: 0 20px` / capped `max-width` on `.bp-app-shell`

- `.v2-map-panel { margin: 14px }` → `var(--v2-dest-pad-*)` (0)
- `.v2-places .v2-map-panel { margin: 10px 14px 0 }` → `0` (edge-to-edge under header; square corners)
- `.v2-places-legacy .places-map-sticky-area { margin: 10px 14px 0 }` → outer pad tokens (0)

## Files

- `src/ui/v2/dest-layout.css` — tokens + shared full-bleed rules
- `src/ui/v2/screens.js` — imports `dest-layout.css`
- `src/ui/v2/screens.css` — offenders wired to tokens; gallery/content/archive included in dest shell list

## Captures (PC 1280 crop)

See `designv2/parity-shots/unit-loop/dest-fullbleed/`:

- `chat-baseline.png` — chat reference (no outer margin)
- `memo.png` / `places.png` / `settlement.png` / `gallery.png` — destinations aligned to chat

Confirm chat remains the visual baseline; other dests should not show a floating card inset from the rail.
