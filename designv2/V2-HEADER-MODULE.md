# V2 Header Module (+ side-nav / chat mock parity)

**Live:** `https://pyw31337.github.io/calendar/?id=cw&shell=v2`  
**Mock source:** `designv2/parity-shots/mock-chat-header-side.png`  
**Captures:** `designv2/parity-shots/unit-loop/header-module/`

## What shipped

### A. Shared `PageHeader` (all destinations)
- Stacked **title** (bold) + **subtitle** (gray) under back chevron
- Default right actions: **search** (when `onSearch`) + **menu** (when `onMenu`); share remains optional
- Applied on: Chat, Memo, Places, Settlement, Gallery, Content, Archive

### Subtitle sourcing (no invented counts)
| Screen | Subtitle |
|--------|----------|
| Chat | `calendar.title` · `{active participant count}명` |
| Memo / Places / Settlement | `calendar.title` (cleaned) |
| Gallery / Content / Archive | `calendarName` from shell (same cleaned calendar title) |

### B. Side-nav
- Brand: **모여라 캘린더** + purple pill **calendar name** (`bp-side-nav-cal-badge`, leading emoji/symbols stripped like header subtitle)
- Active: light purple bg + purple text/icon
- Chat meta: solid author color pill (white text)
- Settlement: red balance badge + date chip (`bp-side-nav-date-chip`)
- Places / Memo: existing meta subtitle text

### C. Chat body + composer
- Message area `#fafafc`
- Author pills denser (participant colors, white text)
- Bubbles white + `#eceaf5` border
- Composer: attach · input (`메시지를 입력하세요...`) · emoji · meme · purple send; author picker bottom-left; paste + gallery kept as tools; resize handle kept above

## Files
- `src/ui/v2/screens.js` — PageHeader + screen subtitles + composer rebuild
- `src/ui/ui-app-shell-v2.js` — brand badge, pill/chip, calendarName → records panes
- `src/ui/v2/design.css` / `screens.css` — header / side-nav / composer CSS
- `test/v2-routing.test.mjs` — searchLabel assertion tweak

## Side-nav mock parity tokens (2026-09-16)

Measured against `parity-shots/mock-chat-header-side.png` vs local `?shell=v2` PC (1280×800).

| Token | Before (live) | After | Mock target |
|-------|---------------|-------|-------------|
| Brand top (`.bp-side-nav-head` pad-top) | 16px | **28px** | ~28px generous |
| Brand icon | 22px favicon PNG | **18px** outline calendar SVG | outline ~18–20 |
| Cal badge | emoji risk | **모아엘가** text only (strip pictographs) | no emoji |
| Nav label | 13.76px (rem) | **14px** | ~14 |
| Nav icon | 16px | **18px** | ~18–20 |
| Row pitch | ~34px | **46px** | ~45–47 |
| Brand→first primary gap | crowded (manual card) | **50px** | ~50 |
| IA | manual banner + settings → primary | **primary → content/archive → settings + manual row → footer** | mock order |

Files: `src/ui/ui-app-shell-v2.js`, `src/ui/v2/design.css`, measure `parity-shots/unit-loop/side-nav-measure.json`.

