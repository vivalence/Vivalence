#!/bin/bash
# family:harness-friction — cwd drift (10 compacts): Bash cwd PERSISTS across calls, so a bare
# `cd <relative> && …` leaves the next call somewhere else. PreToolUse[Bash].
# Denies a relative `cd` at a command head unless it sits inside a subshell `( … )`.
# IKIRO_GUARD_MODE=warn → log + allow (calibration); default → deny.
input=$(cat)
command=$(jq -r '.tool_input.command // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

hit=$(grep -oE '(^|[;&|]|&&|\|\|)[[:space:]]*cd[[:space:]]+[^[:space:];&|/~$"'"'"'-][^[:space:];&|]*' <<<"$command" | head -1)
[ -n "$hit" ] || exit 0

# a subshell owns its cwd: `(cd x && …)` never leaks
before=${command%%"$hit"*}
open=$(tr -cd '(' <<<"$before" | wc -c); close=$(tr -cd ')' <<<"$before" | wc -c)
[ "$open" -gt "$close" ] && exit 0

reason="cwd persists across Bash calls (harness-friction, 10 compacts). '$hit' would move every later call. Use an absolute path, or a subshell: (cd … && …)."
mode=${IKIRO_GUARD_MODE:-deny}
printf '%s cwd-guard %s %s\n' "$(date +%s)" "$mode" "$session" >> "$log" 2>/dev/null
if [ "$mode" = "warn" ]; then echo "cwd-guard (warn): $reason" >&2; exit 0; fi
jq -n --arg reason "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
exit 0
