#!/bin/zsh
set -euo pipefail

# Mac mini scheduled pass. Deterministic sync/quality always runs; Ollama is opt-in and only
# reviews ambiguous groups. This script never sends a poster or user data to a cloud model.
WORKER_DIR="${0:A:h}"
REPO_DIR="${MOYEORA_CULTURE_REPO_DIR:-${WORKER_DIR:h:h}}"
REPORT_DIR="${MOYEORA_CULTURE_REPORT_DIR:-$HOME/Library/Application Support/Moyeora/culture-reports}"
MODEL="${OLLAMA_CULTURE_MODEL:-}"

[[ -d "$REPO_DIR/.git" ]] || { print -u2 "Not a calendar checkout: $REPO_DIR"; exit 2; }
mkdir -p "$REPORT_DIR"

# Pull only a clean main checkout. Local uncommitted work is never overwritten.
if [[ "${MOYEORA_CULTURE_AUTO_PULL:-1}" == "1" ]] \
  && [[ "$(/usr/bin/git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null)" == "main" ]] \
  && [[ -z "$(/usr/bin/git -C "$REPO_DIR" status --porcelain --untracked-files=no 2>/dev/null)" ]]; then
  /usr/bin/git -C "$REPO_DIR" pull --ff-only --quiet origin main || true
fi

cd "$REPO_DIR"
/usr/bin/env node scripts/sync-culture-performances.mjs
/usr/bin/env node scripts/culture-quality-report.mjs --strict --output="$REPORT_DIR/latest-quality.json"

if [[ -n "$MODEL" ]]; then
  /usr/bin/env node scripts/culture-ai-review.mjs \
    --model="$MODEL" \
    --output="$REPORT_DIR/latest-ai-review.json"
else
  /usr/bin/env node scripts/culture-ai-review.mjs --output="$REPORT_DIR/latest-ai-review.json"
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
