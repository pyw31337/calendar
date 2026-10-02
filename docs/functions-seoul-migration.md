# Functions → Seoul (asia-northeast3)

Firestore is in Seoul and every user is in Korea, but Cloud Functions defaulted to us-central1.
Every Firestore read/write a function made crossed the Pacific: a tag save through `mediaCommand`
(one transaction reading the photo index, the owning messages/memos and the albums, then writing)
took 1-2 s, every trigger paid several ~150 ms round trips, and the traffic was billed as
inter-region egress. Since 2026-10-03 every function is defined for Seoul.

## How the move is staged (no gap)

- **Triggers and HTTP endpoints** (`seoulFunctions()` in `functions/index.js`) are deployed in
  both regions while moving. Both copies firing on one write is safe: index rebuilds and recounts
  are idempotent and every push is claimed once (`claimPushDelivery`, a transaction on
  `push_delivery_claims`).
- **Scheduled jobs** have no claim, so they never run in two regions. They are Seoul-only
  (`functions.region(SEOUL_REGION)`); the first Seoul deploy runs with
  `delete_us_copies: schedules`, which deletes the us-central1 copies listed in
  `functions/seoul-scheduled-functions.txt` and then creates the Seoul ones.
- **The app and tools** call the Seoul URLs. `mediaCommand` (tag saves) falls back to us-central1
  on 404/5xx/network errors (`src/core/bulk-photo-tags.js`). Older cached app builds and a Mac
  worker that has not pulled yet keep using the us-central1 endpoints, which stay deployed.
- The deploy workflow sets the Artifact Registry cleanup policy for asia-northeast3 (the deploy
  reports an error without one).

Order: deploy functions from the branch first, then merge, so the app never calls a Seoul URL
that does not exist yet.

## Step 2 — drop the duplicate US triggers (a few days later)

1. In `functions/index.js` set `SEOUL_MOVE_REGIONS = [SEOUL_REGION]` for triggers (keep HTTP
   endpoints in both regions, or move them too once old app builds are gone).
2. Run Deploy Firebase backend with `targets: functions` and `delete_us_copies: triggers`. It
   deletes exactly the names in `functions/seoul-moved-functions.txt` in us-central1, then deploys.

Rollback: put `us-central1` back (for schedules: switch them back and run with the Seoul copies
deleted first) and deploy.
