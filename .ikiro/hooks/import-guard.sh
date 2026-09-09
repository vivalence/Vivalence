#!/bin/bash
# family:relative-import-reflex ×2 (ledger 08-29 "i hate that you fucking keep using relative imports",
# "@beef NO. no leaving the mode!"): a commons module resolves inside its own directory or by package
# identifier; a `../` chain that climbs past `commons/<type>/<slug>/` welds two modules to a layout.
# PreToolUse[Write|Edit] on commons/ product source. IKIRO_GUARD_MODE=warn → log + allow; default → deny.
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

case "$path" in
  *test*|*/bak/*|*.md|*.org|*.json|*.jsonc) exit 0 ;;
  */commons/*) ;;
  *) exit 0 ;;
esac
# depth of the file's directory below commons/<type>/<slug>
inside=${path#*/commons/}
depth=$(awk -F/ '{print NF-3}' <<<"$inside")   # NF = type slug [dirs…] file
[ "$depth" -ge 0 ] || exit 0
content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
hits=""
while read -r spec; do
  ups=$(grep -o '\.\./' <<<"$spec" | wc -l | tr -d ' ')
  [ "$ups" -gt "$depth" ] && hits="$hits $spec"
done < <(grep -oE "(from|import)[[:space:]]*\(?[[:space:]]*[\"'](\.\./)+[^\"']*[\"']" <<<"$content" | grep -oE "[\"'][^\"']*[\"']")
[ -n "$hits" ] || exit 0

reason="no leaving the mode (relative-import-reflex ×2): $hits climbs past commons/${inside%%/*}/$(cut -d/ -f2 <<<"$inside")/. Reach another module at runtime (daemon.domain.*, @commons/<type>/<slug>) or own the value here."
mode=${IKIRO_GUARD_MODE:-deny}
printf '%s import-guard %s %s\n' "$(date +%s)" "$mode" "$session" >> "$log" 2>/dev/null
if [ "$mode" = "warn" ]; then echo "import-guard (warn): $reason" >&2; exit 0; fi
jq -n --arg reason "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
exit 0
