# Architecture Review - 2026-08-21

## Current State
- Live deployment is Vite-based GitHub Pages: `src/` -> `dist/`.
- Firebase is the single source of truth for calendar data, chat, polls, logs, settlements, media metadata, and push subscriptions.
- Classic root files (`index.html`, `assets/*`) remain as rollback/reference material, not the primary live source.
- Calendar data separation is enforced through `cal_${calendarId}` document scope and validation scripts.

## What Is Stable
- `npm run check:all`, `npm run safety:test`, `npm run build`, and `npm run smoke:live` are the required release gate.
- Firestore rules bind calendar document IDs to calendar IDs and deny broad listing.
- Live smoke covers the main calendars, chat, memo, places, gallery, admin, and restore URLs.
- GitHub Pages deployment is handled by `Deploy Vite Pages`.

## Main Risks
- `src/core/app-main.js` still owns too many responsibilities: route state, modal state, Firebase subscription glue, media handlers, chat flow, settlement flow, and admin wiring.
- `src/main.jsx` imports all UI modules up front, so route-level lazy loading is not yet achieved.
- Web Push reliability depends on browser support, permission state, service worker registration, Firebase Messaging support, VAPID config, and Cloud Functions delivery. Chrome is the most predictable path; other browsers need explicit diagnostics.
- Storage rules currently use link-trust access: anyone with a calendar URL can upload allowed media under that calendar path.
- The classic rollback files can drift from `src/` if treated as active code.

## Safe Improvement Order
1. Keep operational docs, runbooks, and workflows aligned with actual Vite Pages deployment.
2. Add browser-level E2E and visual regression tests for the highest-risk flows.
3. Add an admin diagnostics panel for Firebase load status, Storage upload status, push permission, service worker, FCM token, and Functions response.
4. Split `app-main.js` by route/view without changing data shape.
5. Convert view bundles to lazy imports after route boundaries are stable.
6. Revisit write security with optional scoped edit tokens or admin-managed invite links.

## Definition Of Done For Future Large Refactors
- No data model changes without a backup and restore rehearsal.
- No Firestore/Storage rule changes without emulator or targeted live smoke checks.
- Every deploy must pass `npm run check:all`, `npm run safety:test`, `npm run build`, and `npm run smoke:live`.
- Main, chat, admin, restore, gallery, memo, places, polls, and settlement screens must load after deployment.
- The live service must be checked before continuing to the next refactor slice.

## Notes For Collaborating Agents
- Do not edit root `assets/*` expecting production changes unless intentionally maintaining classic rollback.
- Do not add new localStorage or JSONBlob persistence paths.
- Do not hardcode `kkot`, `cw`, or `jhair` into data reads/writes except in test fixtures or explicit smoke URL lists.
- Keep each change small enough to revert with a normal commit.
