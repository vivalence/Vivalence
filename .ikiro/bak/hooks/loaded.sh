#!/bin/bash
# InstructionsLoaded instrument (observe-only; exit code ignored by Claude Code): one row per rule load so the
# channel census m69 1.2 measured by hand is read by methods/molt.py — which shard loads, how often, by which reason.
# Row: <ts> loaded <load_reason> <session> <path relative to the repo>. No guard, no decision: a rule that cannot
# be checked is at least counted. Wire: InstructionsLoaded → "$CLAUDE_PROJECT_DIR/.ikiro/hooks/loaded.sh" (settings.json, beef's).
input=$(cat)
[ "$(jq -r '.hook_event_name // empty' <<<"$input")" = "InstructionsLoaded" ] || exit 0
session=$(jq -r '.session_id // "nosession"' <<<"$input")
reason=$(jq -r '.load_reason // "unknown"' <<<"$input")
path=$(jq -r '.file_path // empty' <<<"$input")
[ -n "$path" ] || exit 0
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${path#"$root"/}"
rel="${rel/#$HOME\//~/}"
printf '%s loaded %s %s %s\n' "$(date +%s)" "$reason" "$session" "$rel" >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null
exit 0
