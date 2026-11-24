#!/bin/bash
# limit: 1400 chars
# family:silent-run — 11-20 (nine nudges, then fifty) · 11-21 (25 reads under one line while a census ran).
# PostToolUse[*]: every 6th tool call since my last text is a batch with no line above it. Warn only.
# Unwired: his to add under PostToolUse in .claude/settings.json.
input=$(cat)
transcript=$(jq -r '.transcript_path // empty' <<<"$input")
log=${IKIRO_HOOKS_LOG:-$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log}
[ -f "$transcript" ] || exit 0

quiet=$(tail -n 400 "$transcript" | jq -s '
  [.[] | select(.type == "assistant") | .message.content[]? | .type | select(. == "text" or . == "tool_use")]
  | length - 1 - (rindex("text") // -1)')
[ "${quiet:-0}" -gt 0 ] && [ $((quiet % 6)) -eq 0 ] || exit 0

printf '%s quiet-guard warn silent-run %s\n' "$(date -u +%FT%TZ)" "$(jq -r '.session_id // "nosession"' <<<"$input")" >> "$log"
jq -n --arg quiet "$quiet" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: "quiet-guard: \($quiet) tool calls since your last line. Say in ONE line what this batch runs, then go on."
  }
}'
