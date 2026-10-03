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

## Step 2 — drop the duplicate US triggers (done 2026-10-03)

Triggers now use `seoulTriggerFunctions()` (Seoul only); HTTP endpoints keep `seoulFunctions()`
(both regions) for cached app builds and the Mac worker. Deployed with `delete_us_copies: triggers`.


1. In `functions/index.js` set `SEOUL_MOVE_REGIONS = [SEOUL_REGION]` for triggers (keep HTTP
   endpoints in both regions, or move them too once old app builds are gone).
2. Run Deploy Firebase backend with `targets: functions` and `delete_us_copies: triggers`. It
   deletes exactly the names in `functions/seoul-moved-functions.txt` in us-central1, then deploys.

Rollback: put `us-central1` back (for schedules: switch them back and run with the Seoul copies
deleted first) and deploy.

## Step 3 — HTTP endpoints Seoul-only (ready; runs when the owner approves deleting the US copies)

The app loads its page fresh on every open (sw.js never serves a cached index.html while online)
and has called Seoul since 2026-10-02, so `mediaCommand` no longer falls back to us-central1. To finish:
in `functions/index.js` make `seoulFunctions()` Seoul-only and `mediaCommand` Seoul-only, give
`ingestMediaAnalysis`/`getMediaAnalysisCalibration` a `workerFunctions()` (Seoul + us-central1),
then deploy with `delete_us_copies: http` (`functions/seoul-moved-http-functions.txt`). A tab left open since before the move gets the
"새 버전" banner and works again after reloading.

Exception: `ingestMediaAnalysis` and `getMediaAnalysisCalibration` keep a us-central1 copy
(`workerFunctions()`) until the Mac worker has pulled; `run-media-worker.sh` now pulls main
(fast-forward only, clean tree) once a day. Once its runs show up in asia-northeast3 only, move
those two to `seoulFunctions()` and delete the copies.
