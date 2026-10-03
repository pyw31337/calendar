#!/bin/zsh
set -eu

# The scheduled worker uses server-side canonical photoIndex rows, so it only analyzes changed
# uploads and stores recommendations back in Firestore.  The old Inbox-only mode remains as a
# safe fallback until the one-time setup script creates this config.
WORKER_DIR="${0:A:h}"
INBOX_DIR="${MOYEORA_MEDIA_INBOX:-$HOME/Pictures/Moyeora Inbox}"
OUTPUT_FILE="${MOYEORA_MEDIA_SUGGESTIONS:-$HOME/Library/Application Support/Moyeora/media-suggestions.json}"
CONFIG_FILE="${1:-${MOYEORA_MEDIA_WORKER_CONFIG:-$HOME/Library/Application Support/Moyeora/media-worker.json}}"

# Keep this Mac on the latest worker code: once a day, a fast-forward-only pull of the calendar
# repo when it is on main with no local edits. Server addresses move (e.g. the Seoul move), so a
# Mac that never pulled kept calling endpoints that were being retired. Never fails the run.
REPO_DIR="${WORKER_DIR:h:h}"
PULL_STAMP="$HOME/Library/Application Support/Moyeora/last-auto-pull"
if [[ -d "$REPO_DIR/.git" ]] && [[ ! -f "$PULL_STAMP" || -n "$(/usr/bin/find "$PULL_STAMP" -mmin +1440 2>/dev/null)" ]]; then
  mkdir -p "${PULL_STAMP:h}"
  if [[ "$(/usr/bin/git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null)" == "main" ]] \
    && [[ -z "$(/usr/bin/git -C "$REPO_DIR" status --porcelain --untracked-files=no 2>/dev/null)" ]]; then
    /usr/bin/git -C "$REPO_DIR" pull --ff-only --quiet origin main >/dev/null 2>&1 || true
  fi
  /usr/bin/touch "$PULL_STAMP"
fi

if [[ -f "$CONFIG_FILE" ]]; then
  # 어드민 '맥 백업' 버튼: one small check per run; runs backup.sh --auto only when requested.
  /usr/bin/env node "$WORKER_DIR/../mac-automation/mac-backup-sync.mjs" "$CONFIG_FILE" || true
  exec /usr/bin/env node "$WORKER_DIR/run-scheduled-media-analysis.mjs" "$CONFIG_FILE"
fi

[[ -d "$INBOX_DIR" ]] || exit 0
exec /usr/bin/env node "$WORKER_DIR/run-local-photo-analysis.mjs" --input "$INBOX_DIR" --output "$OUTPUT_FILE" --max 40
