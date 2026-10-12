#!/bin/bash
# quest skill: the tangle IS the filesystem — one `****` per file, `ls` order; REJECTED 10-12 milestone order,
# broken again 10-16 (m86 B1 · B2 · C0 · A1–A4 groups, `****` headers naming three files) → this hook.
# PreToolUse[Write|Edit] on .ikiro/quests/*.org. STAGED, not wired: beef's wiring call. IKIRO_GUARD_MODE=warn → log + allow; default → deny.
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
case "$path" in */.ikiro/quests/*.org) ;; *) exit 0 ;; esac
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"
content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")

# a Write carries the whole file: look only inside `* tangle`; an Edit carries a fragment: look at all of it
if jq -e '.tool_input.content' <<<"$input" >/dev/null 2>&1; then
  scope=$(awk '/^\* tangle/{t=1; next} /^\* /{t=0} t' <<<"$content")
else
  scope=$content
fi
[ -n "$scope" ] || exit 0

reason="" class=""
if grep -qE '^\*\*\*? [A-Z]+[0-9]+ ' <<<"$scope"; then
  reason="the tangle is the filesystem: no deliverable/milestone groups (** B1 …) — one **** per file, ls order; landing order goes in * milestones"; class=tangle-grouped
elif grep -qE '^\*\*\*\* =[^=]+= · =' <<<"$scope"; then
  reason="one **** per file: a header naming two files (=a.js= · =b.js=) is two blocks"; class=tangle-multifile
fi
[ -n "$reason" ] || exit 0

mode=${IKIRO_GUARD_MODE:-deny}
printf '%s tangle-guard %s %s %s\n' "$(date +%s)" "$mode" "$session" "$class" >> "$log" 2>/dev/null
if [ "$mode" = "warn" ]; then echo "tangle-guard (warn): $reason" >&2; exit 0; fi
jq -n --arg reason "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
exit 0
