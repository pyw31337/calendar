## V2 home visual verify (BentoPinkFinal)

Opt-in only: `?shell=v2` (default shell unchanged).

Compare Calendar home against `designv2/BentoPinkFinal-html/BentoPinkFinal.dc.html`:

| Viewport CSS px | Expected |
| --- | --- |
| 390 | Single-column bento; hero full-bleed; app shell max-width 480 centered |
| 768 | App shell max-width 760; 2-col bento grid; hero radius/margin |
| 1180 | Side rail still drawer until 1200; at ≥1200 persistent 232px rail + shell max-width 1180 |

Live data on home cards (chat / memo / gallery / places / calendar) must remain wired through `buildRenewalCalendarContext` + records context — no mock placeholders.

Regenerate namespaced mock CSS: `node scripts/generate-v2-reference-css.mjs`.
