#!/bin/bash
# m69 3.3 — the two kernel one-liners that could be checked and had no guard:
#   plans are quests in `.ikiro/quests/`, never `docs/superpowers/plans/`   (a Write path)
#   public copy says fair-source, source-available — never "open-source"     (LICENSE.md v2.1; Write|Edit content)
# PreToolUse[Write|Edit]. STAGED, not wired: beef's wiring call. IKIRO_GUARD_MODE=warn → log + allow; default → deny.
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

reason="" class=""
case "$path" in
  */docs/superpowers/plans/*) reason="plans are quests in .ikiro/quests/ (skill quest-authoring), never docs/superpowers/plans/"; class=plan-placement ;;
esac
if [ -z "$reason" ]; then
  case "$path" in
    */documentation/src/*|*/README.md|*/systems/anima/src/*) ;;
    *) exit 0 ;;
  esac
  content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
  grep -qiE '\bopen[- ]source\b' <<<"$content" || exit 0
  reason="public copy says fair-source, source-available — never open-source (LICENSE.md v2.1)"; class=open-source-copy
fi

mode=${IKIRO_GUARD_MODE:-deny}
printf '%s kernel-guard %s %s %s\n' "$(date +%s)" "$mode" "$session" "$class" >> "$log" 2>/dev/null
if [ "$mode" = "warn" ]; then echo "kernel-guard (warn): $reason" >&2; exit 0; fi
jq -n --arg reason "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
exit 0
