# V2 Submenu Gap Audit

**Date:** 2026-09-16 (KST)  
**Live base:** `https://pyw31337.github.io/calendar/?id=cw&shell=v2`  
**Captures:** `designv2/parity-shots/audit-live-capture/` (local PNGs; not committed)  
**User shots:** `designv2/parity-shots/audit-live-user/{content,memo,gallery,settlement,chat}.png`  
**Mocks:** `designv2/{BentoPinkFinal,ChatFull,MemoFull,PlacesFull,SettlementFull}-html/*.dc.html`  
**Prior claims:** #631 / #639 were chrome wraps + CSS over legacy trees — **insufficient**.

## Executive verdict

| Screen | Live state | Honest % vs Full/home IA | Priority |
|--------|------------|---------------------------|----------|
| Home (calendar) | Side rail + bento home present; density/hero still mid | ~50% | P1 polish |
| Chat | V2 header sometimes; **side rail hidden**; `position:fixed` fullscreen; body still ChatRoomView wrap | ~20% | **P0** |
| Memo | PageHeader + tags over legacy MemoView; rail hidden; mobile-column feel | ~25% | **P0** |
| Places | Same wrap pattern as Memo | ~25% | P0 |
| Settlement | PageHeader over SettlementSummaryModal; rail hidden; stretched empty PC | ~20% | **P0** |
| Gallery | **Pure legacy** (`🍺 … 갤러리`); `position:fixed` covers rail | ~10% | **P0** |
| Content | Legacy ContentView under records subtabs; rail visible but double chrome | ~15% | P1 |
| Archive | Legacy HistoryView; same as Content | ~15% | P1 |
| Side-nav | Present on home; **intentionally `display:none` on chat/memo/places/settlement** via `.v2-has-detail` | Broken IA | **P0** |
| Date modal | Opens; bento chrome partial | ~40% | P1 |

**Root causes (structural, not “more CSS”):**

1. `.v2-design.v2-has-detail > .bp-side-nav { display: none }` — destinations leave Bento IA.
2. `.v2-fullscreen { position: fixed; inset: 0 }` + gallery/content `position:fixed` page shells — mobile overlays on PC, covering the rail.
3. `renderV2` paths mostly `wrapLegacy` / slot-extract fallbacks — not ChatFull/MemoFull DOM.
4. Gallery / Content / Archive never get `renderV2` — raw default-shell page chrome.

## Per-screen detail

### Home — P1
- **Current:** BentoPinkFinal-ish rail + hero + calendar + bottom cards. Better than submenus; still not mock-perfect (type scale, card density).
- **Mock:** `BentoPinkFinal.dc.html`
- **Must-keep:** D-day hero, calendar grid/bars, side-nav badges, search, date modal.
- **Plan:** Leave structure; only touch if destination rebuild regresses padding/rail.

### Chat — P0
- **Current:** `ChatPane` → `ChatRoomView` + `renderChatScreen`. Preferred slot path often falls back to `v2-wrap-legacy`. Rail hidden. Composer/tools still legacy.
- **Mock:** `ChatFull.dc.html` (header+sub, scroll list, fixed composer row).
- **Must-keep:** search, share/menu, reply/edit/delete, images/link previews, participant switcher, emoji/meme/paste/attach, send, older-load, lightbox, notifications hooks.
- **Rebuild:** Keep rail; in-flow pane; ChatFull header/composer chrome; restyle message list with existing bubble modules; no feature drop.

### Memo — P0
- **Current:** Header + search + tag chips over legacy body/composer; rail hidden; dual chrome risk.
- **Mock:** `MemoFull.dc.html` (search, tag-filter, composer, card grid, comments).
- **Must-keep:** tag filter, composer+image, recent activity, card grid, comments CRUD, share, sort/menu, load-more.
- **Rebuild:** Rail + MemoFull frame; shared `ChatBubbleFrame` where cards already use it; hide legacy header.

### Places — P0
- **Current:** Same wrap as Memo.
- **Mock:** `PlacesFull.dc.html`
- **Must-keep:** map, category filters, search, CRUD, date jump, FAB.
- **Rebuild:** Rail + PlacesFull frame; contain map/list in main pane.

### Settlement — P0
- **Current:** Header + tabs/summary from legacy; FAB; rail hidden; wide empty PC.
- **Mock:** `SettlementFull.dc.html` (cards, share, totals).
- **Must-keep:** 누적/월별, 수입·지출·잔액, category bars, transaction rows (자비부담, running balance), CRUD/FAB, share.
- **Rebuild:** Rail + SettlementFull card layout chrome; keep calculator/handlers.

### Gallery — P0
- **Current:** `MediaPane` → `ChatGalleryModal asPage` with **fixed full-viewport** shell + legacy header. No V2 page frame.
- **Mock:** none Full — target BentoPinkFinal IA + home density.
- **Must-keep:** 사진/링크/파일 tabs+counts, 전체|일자, search, +/edit FABs, dense grid, stack badges, lightbox, upload/delete.
- **Rebuild:** `GalleryScreen` chrome; neutralize `position:fixed`; hide legacy header; keep feature DOM.

### Content — P1 (follow-up OK after P0 ship)
- **Current:** Legacy ContentView; records subtab row + emoji title header.
- **Mock:** none Full — Bento IA + consistent header/chips/grid.
- **Must-keep:** 문화/스포츠/영화, region, category chips+counts, grid/list toggle, detail, sync.
- **Rebuild:** `ContentScreen` + contain fixed shells; defer deep visual if P0 ships first.

### Archive / 보관함 — P1
- **Current:** Legacy HistoryView.
- **Must-keep:** 추억/인물/지난모임 tabs, share, date modal.
- **Rebuild:** `ArchiveScreen` same pattern as Gallery/Content.

## Rebuild plan (execution order)

1. **Shell IA fix (blocks everything):** stop hiding rail on destinations; destinations are first-class panes inside `renewal-shell-main`, not viewport-fixed overlays.
2. Chat → ChatFull structure (header/subtitle/search/gallery, list, composer).
3. Memo → MemoFull (search, tags, composer, cards).
4. Settlement → SettlementFull chrome + dense body.
5. Gallery → V2 page chrome + fixed-shell neutralization.
6. Places (same frame pattern).
7. Content + Archive (same chrome; can be immediate follow-up PR on this branch series).

## Hard rules (unchanged)

- Default shell untouched.
- Keep `id` / `shell=v2` / `tab` / `sub` / write queues / Firestore.
- Do not remove features — restyle / re-house only.
- Typography = original mock + slight bump (not #634/#635 bloat).

## Evidence notes

- Live capture JSON shows `v2-design` + `bp-side-nav` in DOM for gallery/content, but gallery’s `position:fixed; inset:0; z-index:1005` covers the rail visually — matches user “legacy chrome” shots.
- Chat/memo/settlement add `v2-has-detail`, which **CSS-hides** the rail entirely.
- User rejection of “V2 submenus done” is correct: home ~50%, submenus are wraps, not Full redesigns.

---

## Phase B status (feat/v2-submenu-rebuild)

Shipped structural fixes (not claim-complete Full parity):

1. **Side rail kept on destinations** — removed `.v2-has-detail` nav hide / zero-padding.
2. **Fixed page shells neutralized** under `.renewal-shell-main` (absolute/sticky in-pane).
3. **Gallery / Content / Archive** get `v2-*-embed` frames + `v2Embed` relative layout in feature views.
4. Chat/Memo/Places/Settlement use `v2-dest-page` in-flow panes beside the rail.

**Smoke (local preview, 1440×900):** rail `width=280` visible on chat/memo/settlement/gallery/content.

### Remaining gaps (follow-up)
- Chat/Memo/Settlement bodies still largely legacy trees under V2 chrome (ChatFull composer/message density incomplete).
- Gallery still shows records subtab strip + legacy tabs; needs denser Bento header integration.
- Content/Archive visual polish (chips/grid) deferred to next PR on this series.
- Places Full card grid parity incomplete.

---

## Compare loop (2026-09-16 KST) — local preview after structural rebuild

### Method
PC 1440×900 screenshots in `designv2/parity-shots/audit-live-capture/loop{2,3,4}-*.png` vs `mock-*-full.png` + `audit-live-user/`.

### Results after fix cycles

| Screen | Gate | Notes |
|--------|------|-------|
| Chat | **Pass (structure)** | Rail 280; ChatFull path (`v2-chat-root`); single V2 header; composer = attach + pill + send. Dual legacy header fixed. |
| Memo | **Pass (structure)** | Rail + MemoFull chrome (search/tags/composer/cards/FAB). ~760px column. |
| Settlement | **Pass (structure)** | Rail + header/tabs/summary/category/list/FAB; ~760px column (not edge-stretch). |
| Gallery | **Pass (structure)** after height fix | Was empty (absolute children collapsed MediaPane). Now scroll≈810px, dense grid, 사진/링크/파일 + 전체\|일자. |
| Places | Partial | Rail + dest header; PlacesFull card density still follow-up. |
| Content/Archive | Partial | Embed + rail; visual polish follow-up. |

### Remaining diffs → next slice
1. **Chat bubbles:** mock uses colored name pills left of every bubble + timestamp under bubble; live still uses mixed legacy bubble chrome.
2. **Gallery chrome:** records subtab strip (전체/사진·영상/…) still sits above gallery — compress or fold when side-nav already selected 갤러리; unify header hierarchy.
3. **Settlement:** SettlementFull card chrome (rounded cards per meeting) vs live list rows — restyle rows into cards.
4. **Content/Archive:** dedicated Full mocks absent — continue Bento density pass.

### Fixes landed this loop
- `extractChatSlots` detects send via button children text (`전송`)
- Hide `.chat-room-header` whenever `.v2-chat` present
- PC density columns for chat/memo/settlement
- `v2-records-frame` / body flex + absolute fill (gallery empty-pane regression)

### Loop 6 (gallery tabs + chat width)
- Gallery `사진|링크|파일` were `position:fixed; left:0` → 사진 tab hid under 280px rail. Fixed via `v2Embed` sticky + CSS.
- Chat column widened 720→1080px beside rail (loop6-chat).
- Still open: bubble own-message color vs ChatFull white bubbles; SettlementFull card chrome; Content/Archive polish.

---

## Phase C status (feat/v2-submenu-rebuild-2) — 2026-09-16 KST loop7–8

Local preview 1440×900: `designv2/parity-shots/audit-live-capture/loop{7,8}-*.png`

| Screen | Gate | After / before notes |
|--------|------|----------------------|
| Chat | **Pass (meta layout)** | Meta under bubble for own+others (`metaBelow:true`). Name pills left of others. Own stays end-aligned; white bubbles; speech tails hidden. Before: meta beside bubble / mixed chrome. |
| Gallery | **Pass** | Records strip (전체/사진·영상/…) **removed** when `sub=media` (`v2-records-no-subtab`). Feature tabs 사진/링크/파일 kept; rail 280. Before: redundant strip above 갤러리 header. |
| Settlement | **Pass (denser chrome)** | `.settlement-ledger-row` bordered cards ~63px avg; person-grid gaps tightened. Before: airy padding / no ledger class. |
| Places | **Pass (structure+density)** | `.place-card-row` PlacesFull-ish chrome (12px radius, tighter pad/gap). Before: CSS only targeted unused `.bp-place-card`. |
| Content | **Pass (chrome)** | No records strip; rail + culture tabs/chips/grid intact. |
| Archive | **Pass (chrome)** | No records strip; 추억/인물/지난모임 + cards. |

### Code
- `RecordsPane`: omit subtab row for media/content/archive
- `SettlementSummaryModal`: `settlement-ledger-row` class (presentation hook)
- `screens.css`: ChatFull bubble grid, gallery strip hide, settlement/places density, content/archive chrome

### Remaining gaps (next slice OK)
- Chat: ChatFull mock left-aligns *all* rows (live keeps own end-align by product choice); optional own name-pill.
- Settlement: hero 1/N gradient cards ≠ SettlementFull white meeting cards (data model differs); ledger denser but not Full row chrome.
- Places: card height still content-bound (~110px); map+list dual pane polish.
- Content/Archive: no dedicated Full mocks — further Bento type/grid polish only.
