# Functions → Seoul (asia-northeast3)

Firestore is in Seoul; Cloud Functions defaulted to us-central1. Every Firestore read/write a
function made crossed the Pacific, so a tag save through `mediaCommand` (one transaction that
reads the photo index, the owning messages/memos and the meeting albums, then writes) and every
photo-index/comment-count trigger paid several ~150 ms round trips. Moving the hot-path functions
next to the database removes that.

Moved (list in `functions/seoul-moved-functions.txt`): the photo-index triggers, the photo comment
triggers, `ensureMeetingIdentity`, and `mediaCommand`. Scheduled jobs, admin/proxy endpoints stay
in us-central1 (not latency-sensitive; their URLs are hard-coded in older app builds).

## Step 1 — both regions (done 2026-10-02)

`functions/index.js` declares the moved triggers with `SEOUL_MOVE_REGIONS` (and `mediaCommand` with both regions permanently)
(`asia-northeast3`, `us-central1`). One deploy creates the Seoul copies and keeps the US ones, so
nothing is ever missing. While both run, a trigger fires twice per write: the photo-index rebuild
and comment recount are idempotent, and the comment push is claimed once (`claimPushDelivery`).

Order: deploy functions from the branch first (Deploy Firebase backend, `functions`), then merge,
so the app never calls a Seoul URL that does not exist yet. The app calls Seoul first and falls
back to us-central1 on 404/5xx/network errors (`src/core/bulk-photo-tags.js`).

## Step 2 — drop the US copies (after a few days)

1. In `functions/index.js` set `SEOUL_MOVE_REGIONS = [SEOUL_REGION]`.
2. Run Deploy Firebase backend with `targets: functions` and `delete_us_copies: true`. It deletes
   exactly the names in `seoul-moved-functions.txt` in us-central1, then deploys (the deploy has
   nothing left to delete, so no `--force` is needed).
`mediaCommand` is not in the list: it stays in both regions for good (the app calls Seoul and
falls back to us-central1; builds cached before the move only know the us-central1 URL).

Rollback: put `us-central1` back in `SEOUL_MOVE_REGIONS` and deploy.
