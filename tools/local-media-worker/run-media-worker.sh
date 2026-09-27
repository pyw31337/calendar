#!/bin/zsh
set -eu

# Copy this script outside the repository only if you want a different inbox. The defaults keep
# original files and suggestions in the logged-in user's home directory, not in the app bundle.
WORKER_DIR="${0:A:h}"
INBOX_DIR="${MOYEORA_MEDIA_INBOX:-$HOME/Pictures/Moyeora Inbox}"
OUTPUT_FILE="${MOYEORA_MEDIA_SUGGESTIONS:-$HOME/Library/Application Support/Moyeora/media-suggestions.json}"

[[ -d "$INBOX_DIR" ]] || exit 0
exec /usr/bin/env node "$WORKER_DIR/run-local-photo-analysis.mjs" --input "$INBOX_DIR" --output "$OUTPUT_FILE" --max 40
