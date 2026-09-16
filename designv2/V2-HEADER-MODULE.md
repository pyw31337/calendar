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
- Brand: **모여라 캘린더** + purple pill **calendar name** (`bp-side-nav-cal-badge`)
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
