# V2 responsive design system and verification plan

## Scope

V2 uses one shell for the calendar home, chat, settlement, gallery, places,
memo, content and archive destinations. Destination screens own their feature
content, while the shell owns navigation, spacing tokens, search entry points,
responsive breakpoints and modal/backdrop behavior.

## Shared tokens

| Token | Desktop | Mobile | Use |
| --- | ---: | ---: | --- |
| `--v2-page-gutter` | 32px (max 64px) | 12px | destination content edge |
| `--v2-section-gap` | 24px | 16px | card/section separation |
| `--v2-header-height` | 60px | 56px | all subpage headers |
| `--v2-tab-height` | 50px | 48px | primary and secondary tabs |
| `--v2-control-radius` | 12px | 12px | buttons, inputs, cards |
| `--v2-brand` | `#7c2fe5` | `#7c2fe5` | active/focus state |

New component styles should consume these tokens instead of introducing a
one-off rem/px value. Existing legacy values are migrated as each module is
touched; no broad stylesheet rewrite is performed without a visual diff.

## Responsive structure

- Desktop (>=1200px): fixed side rail; no duplicate header menu button.
- Tablet (768–1199px): side rail may collapse; header menu remains available.
- Mobile (<768px): drawer side rail; destination header hides on downward scroll
  and returns on upward scroll. A circular floating back control remains fixed
  while the header is hidden.

## Verification matrix

Capture each route at 1440×1000 and 390×844 after every module change:

`calendar`, `chat`, `settlement`, `gallery`, `places`, `memo`, `content`,
`archive`, `search`, plus the date detail modal and share modal.

For each capture check: header geometry, side-rail state, tab baseline,
content gutter, overflow, modal centering, focus/hover state, and console
errors. The browser smoke suite remains the fast regression gate; parity shots
are the visual gate.

## Current implementation sequence

1. Shared shell/header and integrated-search destination.
2. Calendar rhythm and anniversary color/span semantics.
3. Responsive header scroll behavior and floating back affordance.
4. Destination card parity (chat, memo, gallery, places) and modal/backdrop
   review.
5. Screenshot-based spacing audit and token migration of remaining outliers.
