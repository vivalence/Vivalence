#!/bin/bash
# family:session-open — the first Edit|Write of a session lands before skill `unfold` ran (11-20: a sibling
# session live on the tree and on ~/.viva, unseen until the fold; its trigger stood twice and was skipped).
# PreToolUse[Edit|Write]. Warns ONCE per session, never denies. Reads the transcript for the skill's call.
# Wire: PreToolUse matcher "Edit|Write" → "$CLAUDE_PROJECT_DIR/.ikiro/hooks/unfold-guard.sh" (settings.json, beef's).
input=$(cat)
session=$(jq -r '.session_id // "nosession"' <<<"$input")
transcript=$(jq -r '.transcript_path // empty' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

[ -f "$transcript" ] || exit 0
grep -qE '"skill":[[:space:]]*"unfold"' "$transcript" && exit 0
grep -q "unfold-guard warn $session" "$log" 2>/dev/null && exit 0

siblings=$(find "$(dirname "$transcript")" -maxdepth 1 -name '*.jsonl' -mmin -10 ! -name "$(basename "$transcript")" 2>/dev/null | wc -l | tr -d ' ')
{ printf '%s unfold-guard warn %s\n' "$(date +%s)" "$session" >> "$log"; } 2>/dev/null
reason="unfold-guard (warn): the first write of this session, and skill unfold has not run. Sessions written in the last 10 min beside this one: $siblings. Census first: tree · his wip · ports · siblings · the edge."
jq -n --arg reason "$reason" '{ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: $reason } }'
exit 0
