#!/bin/zsh
set -euo pipefail

# One-time installer for this Mac. It stores the upload token in Keychain, never in the repo or
# launchd plist. Calendar ids are a comma-separated list, e.g. cw,kkot,jhair.
WORKER_DIR="${0:A:h}"
PROJECT_ID="${MOYEORA_FIREBASE_PROJECT:-metro-live-2918e}"
CALENDARS="${MOYEORA_MEDIA_CALENDARS:-cw}"
SUPPORT_DIR="$HOME/Library/Application Support/Moyeora"
AGENT_DIR="$HOME/Library/LaunchAgents"
CONFIG_PATH="$SUPPORT_DIR/media-worker.json"
TOKEN_SERVICE="Moyeora Media Analysis Worker"
TOKEN_ACCOUNT="${USER:-moyeora}"
PLIST_PATH="$AGENT_DIR/com.moyeora.media-analysis.plist"
LOG_PATH="$SUPPORT_DIR/media-analysis.log"
ERROR_LOG_PATH="$SUPPORT_DIR/media-analysis.error.log"

mkdir -p "$SUPPORT_DIR" "$AGENT_DIR" "$SUPPORT_DIR/media-analysis-reports"
VISION_BINARY="$SUPPORT_DIR/bin/media-insight"
mkdir -p "${VISION_BINARY:h}"
# Vision is compiled once at installation.  Calling `xcrun swift` per photo would repeatedly
# interpret the same source and turns a 200-photo batch into an hours-long job on a fast Mac.
/usr/bin/xcrun swiftc -O "$WORKER_DIR/MediaInsight.swift" -o "$VISION_BINARY"

if TOKEN="$(/usr/bin/security find-generic-password -a "$TOKEN_ACCOUNT" -s "$TOKEN_SERVICE" -w 2>/dev/null)"; then
  :
else
  TOKEN="$(/usr/bin/openssl rand -base64 48 | /usr/bin/tr -d '\n')"
  /usr/bin/security add-generic-password -U -a "$TOKEN_ACCOUNT" -s "$TOKEN_SERVICE" -w "$TOKEN"
fi

umask 077
TOKEN_FILE="$(/usr/bin/mktemp "$SUPPORT_DIR/.media-worker-token.XXXXXX")"
cleanup() { /bin/rm -f "$TOKEN_FILE"; }
trap cleanup EXIT
/usr/bin/printf '%s' "$TOKEN" > "$TOKEN_FILE"
firebase --project "$PROJECT_ID" functions:secrets:set MOYEORA_MEDIA_WORKER_TOKEN --data-file "$TOKEN_FILE"

CALENDAR_JSON="$(/usr/bin/env node -e 'const ids=process.argv[1].split(",").map(x=>x.trim()).filter(x=>/^[A-Za-z0-9_-]{1,64}$/.test(x)); if(!ids.length) process.exit(1); process.stdout.write(JSON.stringify(ids));' "$CALENDARS")"
/usr/bin/env node -e '
  const fs=require("fs");
  const [target, calendarIds, projectId, home]=process.argv.slice(1);
  fs.writeFileSync(target, JSON.stringify({
    schemaVersion: 1,
    calendarIds: JSON.parse(calendarIds),
    projectId,
    maxPerRun: 80,
    analysisConcurrency: 4,
    tokenService: "Moyeora Media Analysis Worker",
    tokenAccount: process.env.USER || "moyeora",
    visionBinary: `${home}/Library/Application Support/Moyeora/bin/media-insight`,
    statePath: `${home}/Library/Application Support/Moyeora/server-photo-analysis-state.json`,
    reportDirectory: `${home}/Library/Application Support/Moyeora/media-analysis-reports`,
    schedulerReportPath: `${home}/Library/Application Support/Moyeora/media-analysis-scheduler-latest.json`
  }, null, 2)+"\n", {mode:0o600});
' "$CONFIG_PATH" "$CALENDAR_JSON" "$PROJECT_ID" "$HOME"

/usr/bin/sed \
  -e "s|/REPLACE/WITH/ABSOLUTE/PATH/run-media-worker.sh|$WORKER_DIR/run-media-worker.sh|" \
  -e "s|/REPLACE/WITH/ABSOLUTE/PATH/media-worker.json|$CONFIG_PATH|" \
  -e "s|/REPLACE/WITH/ABSOLUTE/PATH/media-analysis.log|$LOG_PATH|" \
  -e "s|/REPLACE/WITH/ABSOLUTE/PATH/media-analysis.error.log|$ERROR_LOG_PATH|" \
  "$WORKER_DIR/com.moyeora.media-analysis.plist.template" > "$PLIST_PATH"
/usr/bin/plutil -lint "$PLIST_PATH"
/bin/chmod 600 "$CONFIG_PATH" "$PLIST_PATH"
/bin/launchctl bootout "gui/$(/usr/bin/id -u)" "$PLIST_PATH" 2>/dev/null || true
/bin/launchctl bootstrap "gui/$(/usr/bin/id -u)" "$PLIST_PATH"

print "Moyeora media analysis worker installed for: $CALENDARS"
print "Deploy ingestMediaAnalysis after this secret is set: firebase deploy --only functions:ingestMediaAnalysis,firestore:rules"
