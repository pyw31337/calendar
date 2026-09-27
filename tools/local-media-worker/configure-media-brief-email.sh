#!/bin/zsh
set -euo pipefail

# Stores only sender credentials in Firebase Secret Manager, then deploys the scheduled briefing.
# Usage (the values are never written to this repository or the local worker configuration):
#   RESEND_API_KEY=re_... MEDIA_BRIEF_FROM='모아엘가 <brief@example.com>' \
#     tools/local-media-worker/configure-media-brief-email.sh

PROJECT_ID="${MOYEORA_FIREBASE_PROJECT:-metro-live-2918e}"
: "${RESEND_API_KEY:?Set a Resend API key in this command's environment}"
: "${MEDIA_BRIEF_FROM:?Set a Resend-verified sender, e.g. '모아엘가 <brief@example.com>'}"

umask 077
SECRET_FILE="$(/usr/bin/mktemp "${TMPDIR:-/tmp}/moyeora-brief-secret.XXXXXX")"
cleanup() { /bin/rm -f "$SECRET_FILE"; }
trap cleanup EXIT

/usr/bin/printf '%s' "$RESEND_API_KEY" > "$SECRET_FILE"
firebase --project "$PROJECT_ID" functions:secrets:set RESEND_API_KEY --data-file "$SECRET_FILE"
/usr/bin/printf '%s' "$MEDIA_BRIEF_FROM" > "$SECRET_FILE"
firebase --project "$PROJECT_ID" functions:secrets:set MEDIA_BRIEF_FROM --data-file "$SECRET_FILE"
firebase --project "$PROJECT_ID" deploy --only functions:sendDailyMediaAnalysisBrief

print 'Morning HTML briefing is enabled for pyw213@naver.com.'
