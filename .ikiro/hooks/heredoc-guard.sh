#!/bin/bash
# family:harness-friction — a script fed to an interpreter by heredoc or -c (codestyle: "prose rides no
# heredoc, a probe file neither": 11-20 ×2, ×9 on a sandbox copy, 11-21 ×3). A script is a FILE the Write
# tool made, then run: a guard sees Edit · Write only. PreToolUse[Bash]. UNWIRED: his to add to settings.
# IKIRO_GUARD_MODE=warn → log + allow (calibration); default → deny.
input=$(cat)
command=$(jq -r '.tool_input.command // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

hit=$(grep -oE '(python3?|deno|node|sh|bash|zsh)([[:space:]]+-[A-Za-z]+)*[[:space:]]+(-[[:space:]]+)?[^|;&]*<<-?[[:space:]]*.?[A-Za-z_]+|(python3?|node)([[:space:]]+-[A-Za-z]+)*[[:space:]]+-c[[:space:]]|deno[[:space:]]+eval[[:space:]]' <<<"$command" | head -1)
[ -n "$hit" ] || exit 0

reason="a script rides no heredoc and no -c: Write it as a FILE in the scratchpad, then run the file (codestyle, every .ikiro bullet)."
mode=${IKIRO_GUARD_MODE:-deny}
printf '%s heredoc-guard %s %s\n' "$(date +%s)" "$mode" "$session" >> "$log" 2>/dev/null
if [ "$mode" = "warn" ]; then jq -n --arg reason "heredoc-guard (warn): $reason" '{ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: $reason } }'; exit 0; fi
jq -n --arg reason "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
exit 0
