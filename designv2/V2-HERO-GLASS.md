# V2 Hero Glass + Calendar Legend

**Live:** `https://pyw31337.github.io/calendar/?id=cw&shell=v2`  
**Captures:** `designv2/parity-shots/unit-loop/hero-glass/`

## Why live looked dull

| Layer | Before (dull) | After (mock) |
|-------|---------------|--------------|
| Hero gradient | `#4C1D95 → #7C3AED → #22D3B8` (lower chroma) | CodePen animated: `#7C2FE5 → #A21CAF → #e73c7e → #23a6d5 → #23d5ab` (400% size, 15s ease) |
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

## Living aurora (Gemini-style) — superseded

Replaced by **CodePen animated gradient** below. Prior captures remain at `designv2/parity-shots/unit-loop/hero-aurora/`.

## CodePen animated gradient background

**Technique:** [Pure CSS Animated Gradient Background](https://codepen.io/P1N2O/pen/pyBNzX) (P1N2O) — `linear-gradient(-45deg, …)` + `background-size: 400% 400%` + `@keyframes` shifting `background-position` 0%↔100% at 50% Y.

**Captures:** `designv2/parity-shots/unit-loop/hero-codepen-gradient/`

Home hero (`.bp-hero-zone`) uses this as the **primary** animated background (replaces multi-layer aurora drift):

| Layer | Role |
|-------|------|
| Base (`.bp-hero-zone`) | Brand stops `#7C2FE5`, `#A21CAF`, `#e73c7e`, `#23a6d5`, `#23d5ab` — `bp-hero-codepen-gradient` **15s** ease infinite |
| `::before` / `::after` | Disabled (`content: none`) — aurora mesh no longer the main motion |
| `.bp-hero-aurora` | Static soft bottom darken/vignette only (readable white text / `[모임확정]`) |

- Exact CodePen motion model; palette adapted to 모여라 V2 brand (deep purple / magenta / cyan / teal — no clashing orange).
- Glass chips / compact meeting card / icon buttons stay on top (frost over the wash).
- `prefers-reduced-motion: reduce` → static gradient at `background-position: 0% 50%` (no animation). Global V2 reduce rule plus hero-specific override in `design.css`.
- Scoped to `.v2-design` only; default shell untouched.
