## V2 home visual verify (BentoPinkFinal)

Opt-in only: `?shell=v2` (default shell unchanged).

Compare Calendar home against `designv2/BentoPinkFinal-html/BentoPinkFinal.dc.html` and user shots in `designv2/parity-shots/`.

### Viewports

| Viewport CSS px | Expected |
| --- | --- |
| 320 | No horizontal overflow; hero brand + icon buttons stay on one row; D-day pill text ellipsizes; cards keep readable padding |
| 390 | Single-column bento; hero full-bleed; app shell max-width 480 centered |
| 768 | App shell max-width 760; hero radius/margin; 2-col bento grid; date sheet centered card |
| 1180 | Side rail still drawer until 1200; at ≥1200 persistent 232px rail + shell max-width 1180; brand hidden in hero |

### Home checklist (honest)

| Area | Status | Notes |
| --- | --- | --- |
| Gradient hero + glass D-day compact | Must match | `bp-hero-zone` + `bp-dday-*` from reference-home.css |
| D-day chip strip | Must match | Horizontal scroll, glass chips |
| Bento calendar card (not CalendarGrid) | Must match | `BentoCalendarCard` with `bp-day-cell` / dots / legend |
| Feed cards 채팅/메모/갤러리/장소 + 전체보기 | Must match | Live Firebase data via records context |
| Header brand + search + hamburger | Must match | White on gradient; drawer opens side-nav |
| Side nav labels | Matches BentoPinkFinal | 캘린더/채팅/정산/갤러리/장소/메모/컨텐츠/보관함 (+ 설정 group). 5-tab IA remains in routing (`캘린더/대화/기록/정산/더보기`); bottom nav hidden under v2 |
| Footer | Must match | Copyright + FAMILY LINK row |
| Date click → backdrop sheet | V2 only | `shellChrome: 'bento'` on DateModal → `bp-sheet-backdrop` + `bp-event-sheet` + handle; portals into `.v2-design`. Tabs restyled toward pill chrome. Empty-date / attend / place / settlement / photos content still use DateModal bodies — not a full DOM rebuild of every sheet panel |
| Default `?id=cw` | Unchanged | No `shellChrome`; no v2 CSS on default modal |

### Screenshots

- Targets: `designv2/parity-shots/mock-{mobile,tablet,pc}.png`
- WIP baselines: `designv2/parity-shots/live-{mobile,tablet,pc}.png`
- Date sheets: `designv2/parity-shots/backdrop/mock-*.png`

### Regen CSS

```bash
node scripts/generate-v2-reference-css.mjs
```

Live data on home cards must remain wired — no forever placeholders.
