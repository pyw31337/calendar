# Local Culture Intelligence Worker

This is an optional Mac mini pass for the Culture Flow snapshot. It is deliberately layered:

1. `scripts/sync-culture-performances.mjs` performs deterministic normalization, poster recovery,
   date/venue-aware deduplication, and keeps every source listing on the merged card.
2. `scripts/culture-quality-report.mjs` records missing posters and merge candidates as a quality
   gate. It does not delete a valid touring production merely because its title is similar.
3. `scripts/culture-ai-review.mjs` sends only ambiguous same-title groups to a local Ollama server.
   It requests strict JSON in small batches and writes an auditable sidecar; it never changes the
   committed feed by itself. A slow or unavailable batch is recorded as `partial` instead of
   discarding successful batches. A later promotion step can be reviewed and tested before any
   suggestion becomes data.
4. `CulturePosterInsight.swift` is an optional Apple Vision helper for Korean/English poster OCR and
   feature-print generation. It is useful when two sources have different titles or a missing poster
   needs text recovery, but its output is also a suggestion, not a source-of-truth mutation.

## Mac mini setup

```sh
export MOYEORA_CULTURE_REPO_DIR="/Users/you/Developer/calendar"
export OLLAMA_CULTURE_MODEL="gemma4:latest" # choose a locally installed model
ollama serve
ollama pull "$OLLAMA_CULTURE_MODEL"
tools/local-culture-worker/run-culture-intelligence.sh
```

Ollama is contacted at `http://127.0.0.1:11434` by default. Keep the model name and any Ollama
credentials in the Mac's environment or launchd configuration, never in Git. For an unattended
machine, copy `com.moyeora.culture-intelligence.plist.template`, replace `__REPO__` and `__HOME__`,
then load it with `launchctl bootstrap gui/$(id -u) ...`.

Set `MOYEORA_CULTURE_PUSH=1` only after reviewing the quality reports and only on a clean `main`
checkout. The script stages generated culture snapshots/cache files only; it never stages secrets,
local reports, or unrelated work.

The worker defaults to eight AI groups per request, a 60-second Ollama request timeout, and a
420-second overall AI budget. Tune `OLLAMA_CULTURE_BATCH_SIZE`,
`OLLAMA_CULTURE_REQUEST_TIMEOUT_MS`, or `MOYEORA_CULTURE_AI_TIMEOUT_SEC` in launchd when using a
slower local model. Deterministic sync and quality checks remain independent of the AI sidecar.
