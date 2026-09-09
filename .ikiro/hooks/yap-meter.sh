#!/bin/bash
# family:yap-wrong-artifact (27 entries, prose rung FAILED since 05-05). Stop hook, LOG-ONLY: never blocks.
# Records words outside code fences + fence count per turn so the flywheel folds a measured yap rate
# instead of inferring one from silence. Read it with: awk '{w+=$4; n++} END{print w/n}' hooks.log-yap
input=$(cat)
msg=$(jq -r '.last_assistant_message // empty' <<<"$input")
[ -n "$msg" ] || exit 0
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log-yap"

fences=$(grep -c '^```' <<<"$msg")
prose=$(awk 'BEGIN{f=0} /^```/{f=!f; next} !f{print}' <<<"$msg")
words=$(wc -w <<<"$prose" | tr -d ' ')
lines=$(grep -c . <<<"$prose")
printf '%s %s %s %s %s\n' "$(date +%s)" "$session" "$lines" "$words" "$fences" >> "$log" 2>/dev/null
exit 0
