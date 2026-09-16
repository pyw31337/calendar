# V2 Unit Loop

**Live base:** `https://pyw31337.github.io/calendar/?id=cw&shell=v2`  
**Baseline:** after #644 (`401b7ed2`+) / `7a34df49` on `main`  
**Captures:** `designv2/parity-shots/unit-loop/`

---

## Unit 0 — VERIFY (2026-09-16 KST)

### Capture inventory (390×844 mobile + PC home)

| Shot | Path |
|------|------|
| home | `unit-loop/unit0/home.png` |
| chat | `unit-loop/unit0/chat.png` |
| memo | `unit-loop/unit0/memo.png` |
| gallery | `unit-loop/unit0/gallery.png` |
| places | `unit-loop/unit0/places.png` |
| settlement | `unit-loop/unit0/settlement.png` |
| content | `unit-loop/unit0/content.png` |
| side-nav from memo | `unit-loop/unit0/side-nav-from-memo.png` |
| home PC (1280×800) | `unit-loop/unit0/home-pc.png` |
| measure JSON | `unit-loop/unit0/report.json` |

### Plan gates

| Gate | Result | Evidence |
|------|--------|----------|
| Memo: no tag cloud under search | **PASS** | `tagChipCount: 0`, no `.bp-tag-filter-row`; memo shot shows search → composer |
| Hamburger opens side-nav from destinations | **PASS** | Memo hamburger → `bp-is-open`, brand "모여라 캘린더", memo item highlighted |
| Gallery ~4 cols mobile | **PASS** | `galleryCols: 4` |
| Anniv labels hidden on mobile | **PASS** | home `annLabelDom: 12`, `annLabelVisibleCss: 0` (bars only) |
| Anniv labels visible on PC home | **PASS** | home-pc `annLabelVisibleCss: 12` with sample titles |

### Highest pain from captures → Unit 1

**Places: duplicate create controls.** Toolbar black `+` (`aria-label="장소 추가"`, `.btn-action-dark`) sits next to 편집, **and** purple `.bp-fab` (`장소 등록`) floats bottom-right. Both open register. PlacesFull mock + plan §1.3 call for a **single** purple FAB create surface — hide legacy toolbar add under V2 only; keep 편집 / visit chips / map / FAB.

Other screens look coherent post-#644 (memo clean, gallery 4-col, settlement single FAB, content chips+grid OK).

### Proposed Unit 1 (single focused fix)

Hide `.v2-design .v2-places button[aria-label="장소 추가"]` so only `.bp-fab` remains for create. Default shell untouched. No feature/URL change.

