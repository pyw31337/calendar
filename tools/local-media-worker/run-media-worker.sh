#!/bin/zsh
set -eu

# The scheduled worker uses server-side canonical photoIndex rows, so it only analyzes changed
# uploads and stores recommendations back in Firestore.  The old Inbox-only mode remains as a
# safe fallback until the one-time setup script creates this config.
WORKER_DIR="${0:A:h}"
INBOX_DIR="${MOYEORA_MEDIA_INBOX:-$HOME/Pictures/Moyeora Inbox}"
OUTPUT_FILE="${MOYEORA_MEDIA_SUGGESTIONS:-$HOME/Library/Application Support/Moyeora/media-suggestions.json}"
CONFIG_FILE="${1:-${MOYEORA_MEDIA_WORKER_CONFIG:-$HOME/Library/Application Support/Moyeora/media-worker.json}}"

if [[ -f "$CONFIG_FILE" ]]; then
  exec /usr/bin/env node "$WORKER_DIR/run-scheduled-media-analysis.mjs" "$CONFIG_FILE"
fi

[[ -d "$INBOX_DIR" ]] || exit 0
exec /usr/bin/env node "$WORKER_DIR/run-local-photo-analysis.mjs" --input "$INBOX_DIR" --output "$OUTPUT_FILE" --max 40
