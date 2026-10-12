#!/bin/bash
# family:blast-filtered — the HOOK rung (skill change: "No --include, no | head"; broken 10-19 in m91 milestone 3:
# a consumer grep ran --include=*.js, subsystems/drapes/dom/chassis.jsx never surfaced, three drapes suites went red).
# PreToolUse[Bash], WARN only: a recursive grep over a code root (systems · subsystems · commons · documentation · ~/.viva)
# that filters by --include, or pipes into head, is a blast that can miss a consumer. A doc grep over .ikiro is not judged.
# git is never invoked — this reads the tool input only. Wire in .claude/settings.json like comment-guard.sh (Bash route).
input=$(cat)
[ "$(jq -r '.tool_name // empty' <<<"$input")" = "Bash" ] || exit 0
command=$(jq -r '.tool_input.command // empty' <<<"$input")
grep -qE '(^|[;&|(`[:space:]])grep[[:space:]]+(-[A-Za-z]*r|.*[[:space:]]-[A-Za-z]*r)' <<<"$command" || exit 0
grep -qE '(^|[[:space:]"'"'"'/])(systems|subsystems|commons|documentation|\.viva)(/|[[:space:]"'"'"']|$)' <<<"$command" || exit 0
filtered=""
grep -qE -- '--include[= ]' <<<"$command" && filtered="--include"
grep -qE 'grep[^|]*\|[[:space:]]*head\b' <<<"$command" && filtered="${filtered:+$filtered · }| head"
[ -n "$filtered" ] || exit 0
printf '%s blast-guard warn %s blast-filtered\n' "$(date +%s)" "$(jq -r '.session_id // "nosession"' <<<"$input")" >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null
echo "blast-guard (warn): a recursive grep over a code root carries $filtered — a .jsx · .svelte · .json · .ts consumer can hide (m91: chassis.jsx). Blast every text type: grep -rnI … --exclude-dir=node_modules --exclude-dir=bak (skill change)." >&2
exit 0
