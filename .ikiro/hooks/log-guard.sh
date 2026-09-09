#!/bin/bash
# family:privacy-leak, SECRET axis (ledger "a boot debug log printed a live API key"): every boot-path
# structure below the pinhole — mask · die · service · register · secrets — holds fired secrets in CLEAR.
# PreToolUse[Write|Edit]: deny product-source content that console-logs one of them whole.
# IKIRO_GUARD_MODE=warn → log + allow (calibration); default → deny.
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

case "$path" in
  *test*|*/bak/*|*.md|*.org|*.json|*.jsonc) exit 0 ;;
  */commons/*|*/systems/*|*/subsystems/*) ;;
  *) exit 0 ;;
esac
content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
# string and template literal bodies are labels, not objects — strip them before matching
bare=$(sed -E 's/`[^`]*`/``/g; s/"[^"]*"/""/g; s/'"'"'[^'"'"']*'"'"'/'"''"'/g' <<<"$content")
hits=$(grep -nE 'console\.(log|dir|debug|info|warn|error)\([^)]*\b(mask|die|service|register|secrets?|daemonDie)\b' <<<"$bare" || true)
[ -n "$hits" ] || exit 0

reason="never log a mask/die/service/register — a hydrated structure holds secrets in clear (ledger: the mask print that leaked a live key). Log the slot label and module, never the object. Hits: $(head -3 <<<"$hits" | tr '\n' ' ')"
mode=${IKIRO_GUARD_MODE:-deny}
printf '%s log-guard %s %s\n' "$(date +%s)" "$mode" "$session" >> "$log" 2>/dev/null
if [ "$mode" = "warn" ]; then echo "log-guard (warn): $reason" >&2; exit 0; fi
jq -n --arg reason "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
exit 0
