#!/bin/zsh
set -euo pipefail

# Mac mini scheduled pass. Deterministic sync/quality always runs; Ollama is opt-in and only
# reviews ambiguous groups. This script never sends a poster or user data to a cloud model.
WORKER_DIR="${0:A:h}"
REPO_DIR="${MOYEORA_CULTURE_REPO_DIR:-${WORKER_DIR:h:h}}"
REPORT_DIR="${MOYEORA_CULTURE_REPORT_DIR:-$HOME/Library/Application Support/Moyeora/culture-reports}"
MODEL="${OLLAMA_CULTURE_MODEL:-}"
AI_TIMEOUT="${MOYEORA_CULTURE_AI_TIMEOUT_SEC:-420}"
AI_BATCH_SIZE="${OLLAMA_CULTURE_BATCH_SIZE:-8}"
AI_REQUEST_TIMEOUT_MS="${OLLAMA_CULTURE_REQUEST_TIMEOUT_MS:-60000}"

[[ -d "$REPO_DIR/.git" ]] || { print -u2 "Not a calendar checkout: $REPO_DIR"; exit 2; }
mkdir -p "$REPORT_DIR"

run_bounded() {
  local seconds="$1"
  shift
  "$@" &
  local child="$!"
  (
    sleep "$seconds"
    kill -TERM "$child" 2>/dev/null || exit 0
    sleep 5
    kill -KILL "$child" 2>/dev/null || true
  ) &
  local watchdog="$!"
  set +e
  wait "$child"
  local exit_code="$?"
  set -e
  kill "$watchdog" 2>/dev/null || true
  wait "$watchdog" 2>/dev/null || true
  return "$exit_code"
}

# Pull only a clean main checkout. Local uncommitted work is never overwritten.
if [[ "${MOYEORA_CULTURE_AUTO_PULL:-1}" == "1" ]] \
  && [[ "$(/usr/bin/git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null)" == "main" ]] \
  && [[ -z "$(/usr/bin/git -C "$REPO_DIR" status --porcelain --untracked-files=no 2>/dev/null)" ]]; then
  if ! GIT_TERMINAL_PROMPT=0 GIT_ASKPASS=/usr/bin/false run_bounded 30 \
    /usr/bin/git -C "$REPO_DIR" pull --ff-only --quiet origin main; then
    print -u2 "[culture-worker] auto-pull unavailable; continuing with the current clean checkout"
  fi
fi

cd "$REPO_DIR"
SOURCE_URL="${CULTURE_SYNC_SOURCE_URL:-https://pyw31337.github.io/culture/data/performances.json}"
SOURCE_FILE="$REPORT_DIR/performances-source.json"
SOURCE_TMP="$SOURCE_FILE.tmp.$$"
if ! /usr/bin/curl --fail --silent --show-error --location --retry 2 --connect-timeout 10 --max-time 90 \
  -A 'MoyeoraCultureWorker/1.0' -o "$SOURCE_TMP" "$SOURCE_URL"; then
  rm -f "$SOURCE_TMP"
  print -u2 "[culture-worker] source download failed; keeping the previous snapshot"
  exit 1
fi
mv "$SOURCE_TMP" "$SOURCE_FILE"

run_bounded "${MOYEORA_CULTURE_SYNC_TIMEOUT_SEC:-600}" \
  /usr/bin/env CULTURE_SYNC_SOURCE_FILE="$SOURCE_FILE" node scripts/sync-culture-performances.mjs
run_bounded "${MOYEORA_CULTURE_QUALITY_TIMEOUT_SEC:-120}" \
  /usr/bin/env node scripts/culture-quality-report.mjs --strict --output="$REPORT_DIR/latest-quality.json"

if [[ -n "$MODEL" ]]; then
  run_bounded "$AI_TIMEOUT" /usr/bin/env node scripts/culture-ai-review.mjs \
    --model="$MODEL" \
    --batch-size="$AI_BATCH_SIZE" \
    --timeout-ms="$AI_REQUEST_TIMEOUT_MS" \
    --output="$REPORT_DIR/latest-ai-review.json"
else
  run_bounded "$AI_TIMEOUT" /usr/bin/env node scripts/culture-ai-review.mjs \
    --batch-size="$AI_BATCH_SIZE" \
    --timeout-ms="$AI_REQUEST_TIMEOUT_MS" \
    --output="$REPORT_DIR/latest-ai-review.json"
fi

# Publishing is explicit. Set MOYEORA_CULTURE_PUSH=1 only on a dedicated checkout with a
# machine credential; only the generated snapshot/cache files are allowed into this commit.
if [[ "${MOYEORA_CULTURE_PUSH:-0}" == "1" ]]; then
  /usr/bin/git add public-vite/data/culture-*.json scripts/data/culture-poster-cache.json
  if ! /usr/bin/git diff --cached --quiet; then
    /usr/bin/git commit -m "data: refresh culture intelligence snapshot"
    /usr/bin/git push origin main
  fi
fi
