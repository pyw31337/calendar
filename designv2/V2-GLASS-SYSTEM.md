# V2 Glass System — vivid + glassy

**Live:** `https://pyw31337.github.io/calendar/?id=cw&shell=v2`  
**Captures:** `designv2/parity-shots/unit-loop/glass-system/`  
**Tokens live on:** `.renewal-shell.v2-design` / `.v2-design` (`src/ui/v2/design.css`)

## Concept (lock in)

V2 redesign = **vivid + glassy** (Apple-like): clean sharp edges, glassmorphism, high chroma.

- **On dark / hero gradients:** frosted white fill + bright white edge + inset highlight + blur/saturate (dark glass).
- **On light / white destination pages:** frosted **white** surface + crisp `#eceaf5` border + soft violet tint on hover — **not** purple page gradients.
- Accents / primary actions use vivid schedule purple (`#7C2FE5` / `--cal-schedule` family), slight glow, clean circle edges.
- Cards: thin crisp border + optional very light shadow (Apple card — not heavy drop shadow).

**Future V2 polish must stay vivid+glassy.** Do not regress to flat muddy gray fills or dull `#7C3AED` chrome when a vivid token exists.

Related shipped work:

- Hero dark-glass + legend: `designv2/V2-HERO-GLASS.md` (#657)
- Dest full-bleed: `designv2/V2-DEST-LAYOUT.md` (#656)

## Token table

| Token | Value | Role |
|-------|-------|------|
| `--brand` | `#7C2FE5` | Primary UI purple (aligned with schedule) |
| `--brand-soft` | `#F3EEFF` | Soft purple fill |
| `--cal-schedule` | `#7C2FE5` | 일정·여행 legend / bars |
| `--cal-anniversary` | `#F76AAD` | 기념일 legend / bars |
| `--v2-primary` | `#7C2FE5` | FAB / send / primary circle actions |
| `--v2-primary-glow` | `0 6px 18px rgba(124,47,229,0.40)` | FAB glow |
| `--v2-primary-glow-sm` | `0 3px 10px rgba(124,47,229,0.32)` | Send / small primary |
| `--v2-glass-blur` | `blur(20px) saturate(180%)` | Standard glass blur |
| `--v2-glass-blur-strong` | `blur(24px) saturate(180%)` | Hero compact glass |
| `--v2-glass-dark-fill` | `rgba(255,255,255,0.22)` | Dark-glass fill |
| `--v2-glass-dark-border` | `rgba(255,255,255,0.55)` | Dark-glass crisp edge |
| `--v2-glass-dark-inset` | `inset 0 1px 0 rgba(255,255,255,0.65)` | Dark-glass highlight |
| `--v2-glass-dark-glow` | `0 4px 14px rgba(76,29,149,0.22)` | Dark-glass outer |
| `--v2-glass-light-fill` | `rgba(255,255,255,0.88)` | Light-glass fill |
| `--v2-glass-light-border` | `#eceaf5` | Light-glass edge |
| `--v2-glass-light-inset` | `inset 0 1px 0 rgba(255,255,255,0.95)` | Light-glass highlight |
| `--v2-glass-light-shadow` | `0 1px 2px rgba(30,27,46,0.04)` | Light-glass soft shadow |
| `--v2-glass-light-hover-fill` | `rgba(243,238,255,0.78)` | Light-glass hover (violet tint) |
| `--v2-glass-light-hover-border` | `#e0d4ff` | Light-glass hover edge |
| `--v2-glass-purple-fill` | `rgba(124,47,229,0.10)` | Soft purple glass (nav active) |
| `--v2-glass-purple-border` | `rgba(124,47,229,0.26)` | Soft purple edge |
| `--v2-glass-purple-inset` | `inset 0 1px 0 rgba(255,255,255,0.72)` | Soft purple highlight |
| `--v2-card-border` | `#eceaf5` | Card crisp border |
| `--v2-card-shadow` | `0 1px 3px …, 0 4px 12px …` | Apple-light card shadow |

## Shared classes

| Class | Use |
|-------|-----|
| `.v2-glass-light` | Frosted white + crisp border (utility) |
| `.v2-glass-purple` | Soft purple glass fill (utility) |
| `.v2-card-glass` | Thin border + light card shadow |
| `.v2-fab-vivid` / `.bp-fab` | Vivid primary circle + glow |

Hero keeps **dark-glass** icon buttons (`.bp-hero-zone .bp-icon-btn`). Destination `PageHeader` / fullscreen chrome use **light-glass** icon buttons.

## Where used

| Surface | Treatment |
|---------|-----------|
| Home hero (existing) | Dark glass + vivid gradient — tokens wired |
| Side-nav active item | Soft purple glass fill + crisp purple edge |
| Side-nav cal-badge | Sharper purple pill + border/inset |
| Side-nav collapse btn | Light glass border (not dull gray) |
| PageHeader icon buttons | Light glass on white pages |
| Chat / dest header icons | Same light-glass tokens |
| FAB / composer send | `--v2-primary` + glow, clean circle |
| Chips / settlement badges | Higher chroma + crisp edge |
| Author pills | Crisp edge + inset highlight |
| Memo / places / settlement cards | `--v2-card-border` + `--v2-card-shadow` |

## Files

- `src/ui/v2/design.css` — token source of truth + side-nav / PageHeader / utilities
- `src/ui/v2/screens.css` — dest chrome (icon-btn light glass, FAB, send, cards)
- `src/ui/v2/reference-home.css` + dest reference CSS — `--brand` → `#7C2FE5`
- `src/ui/v2/chat-bubble-modules.css` — brand fallbacks

## Do / Don't

- **Do** prefer tokens / shared classes over one-off magic numbers.
- **Do** keep white destination pages white — glass = frosted white + sharp border + vivid accents only.
- **Don't** turn dest pages into purple gradients.
- **Don't** flatten glass back to borderless muted gray icon buttons.
