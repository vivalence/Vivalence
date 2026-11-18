#!/bin/bash
# family:live-system-unaware — 11-20: a browser walk on his served anima (:1794) ran with skill `debug`
# unloaded; its walk rule (a WRITE gesture rides a throwaway entity, his live entities are read off the db
# before and after, a session he is typing in is not walked) stood in the skill, unread: a synthetic head
# drag off the top perch released in a dock zone and docked HIS terminal.
# PreToolUse[mcp__claude-in-chrome__navigate]: a navigate to his :1794 · :2501 before skill `debug` was
# called this session. Warns ONCE per session, never denies. Reads the transcript for the skill's call.
# Wire: PreToolUse matcher "mcp__claude-in-chrome__navigate" → "$CLAUDE_PROJECT_DIR/.ikiro/hooks/walk-guard.sh"
# (settings.json, beef's).
input=$(cat)
session=$(jq -r '.session_id // "nosession"' <<<"$input")
transcript=$(jq -r '.transcript_path // empty' <<<"$input")
url=$(jq -r '.tool_input.url // empty' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

grep -qE '(localhost|127\.0\.0\.1|\[::1\]):(1794|2501)' <<<"$url" || exit 0
[ -f "$transcript" ] && grep -qE '"skill":[[:space:]]*"debug"' "$transcript" && exit 0
grep -q "walk-guard warn $session" "$log" 2>/dev/null && exit 0

{ printf '%s walk-guard warn %s\n' "$(date +%s)" "$session" >> "$log"; } 2>/dev/null
reason="walk-guard (warn): a walk on his served instance, and skill debug has not run. Its walk rule first: a WRITE gesture (a drag that can end in a repl command too) rides a throwaway entity; his live entities are read off the db before the first gesture and read back equal after the last; a session he is typing in is not walked."
jq -n --arg reason "$reason" '{ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: $reason } }'
exit 0
