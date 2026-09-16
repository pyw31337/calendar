# V2 Hero Glass + Calendar Legend

**Live:** `https://pyw31337.github.io/calendar/?id=cw&shell=v2`  
**Captures:** `designv2/parity-shots/unit-loop/hero-glass/`

## Why live looked dull

| Layer | Before (dull) | After (mock) |
|-------|---------------|--------------|
| Hero gradient | `#4C1D95 → #7C3AED → #22D3B8` (lower chroma) | `#3B0764 → #6D28D9 → #A21CAF → #06B6D4` (high chroma purple→magenta→cyan) |
| Glass fill | `rgba(255,255,255,0.16)` | `rgba(255,255,255,0.18–0.22)` |
| Glass border | `rgba(255,255,255,0.28–0.36)` | `rgba(255,255,255,0.50–0.55)` + inset highlight |
| Blur | 10–20px | 20–24px + `saturate(180%)` |
| D-day badge | Solid white pill, purple text | Vivid purple→blue gradient, **white** text |
| Icon buttons | Soft frosted, weak edge | Crisp white edge + subtle outer glow |

Apple-like glass = bright edge + inset highlight + enough blur/saturation so fills do not read as muddy gray.

## Calendar legend / bar tokens

| Token | Value | Use |
|-------|-------|-----|
| `--cal-schedule` | `#7C2FE5` | 일정·여행 legend capsule + meeting/schedule day bars |
| `--cal-anniversary` | `#F76AAD` | 기념일 legend capsule + anniversary day bars |

- Stop using `--status-green` (`#16A34A`) for anniversary legend/bars under `.v2-design`.
- Participant legend colors unchanged.
- Defined on `.v2-design` (`reference-home.css`) and `.renewal-shell.v2-design` (`design.css`).

## 모임확정 title visibility

Compact + expanded hero labels render a non-shrinking **`[모임확정]`** prefix (`bp-dday-compact-prefix`) and an ellipsis-only detail span (`bp-dday-compact-detail`: date · note/title). Prefix never clips at the start.

## Files

- `src/ui/v2/reference-home.css` — tokens + hero glass
- `src/ui/v2/design.css` — tokens + bar colors + glass reinforces
- `src/ui/ui-app-shell-v2.js` — legend dots + `meetingLabelParts` / `renderMeetingLabel`

## Living aurora (Gemini-style)

**Captures:** `designv2/parity-shots/unit-loop/hero-aurora/`

Home hero (`.bp-hero-zone`) uses a **CSS-only living mesh** — not a static linear wash:

| Layer | Role |
|-------|------|
| Base | Deep purple → violet → teal linear + soft bottom darken |
| `::before` | Purple / magenta radial blobs — `bp-hero-aurora-drift-a` (~22s) |
| `::after` | Cyan / blue / magenta blobs — `bp-hero-aurora-drift-b` (~28s, counter) |
| `.bp-hero-aurora` | Soft top bloom + bottom vignette — `bp-hero-aurora-pulse` (~16s) |

- Animations use GPU-friendly `transform` + `opacity` only (no canvas / per-frame JS).
- Glass chips / compact meeting card / icon buttons stay as-is (frost over the mesh).
- Bottom vignette keeps white title / `[모임확정]` readable when hues peak bright.
- `prefers-reduced-motion: reduce` → static vivid mesh (no drift/pulse). Existing global V2 reduce rule plus hero-specific override.
- Scoped to `.v2-design` only; default shell untouched.
