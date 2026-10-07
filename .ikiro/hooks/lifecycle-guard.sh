#!/bin/bash
# family:lifecycle-is-not-a-toolbox ×2 (codemap runtime:8 10-07 "the lifecycles are not a repotitory of tools!",
# connoisseur:34 10-09 "a LOT of functions here that dont belong into the lifecycle, but gestalten"):
# a function's home is its first parameter — (die, next) → lifecycle/, (ctx, next) → gestalten/shard/.
# PreToolUse[Write|Edit] on systems/runtime/lifecycle/** product source: a TOP-LEVEL (column 0) binding whose
# value is a (ctx…) arrow, or a curried (…) => (ctx…) arrow, is a shard written into a lifecycle file.
# IKIRO_GUARD_MODE=warn → log + allow; default → deny.
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

case "$path" in
  *test*|*/bak/*|*.md|*.org|*.json|*.jsonc) exit 0 ;;
  */systems/runtime/lifecycle/*) ;;
  *) exit 0 ;;
esac
content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
hits=$(grep -nE '^(export )?(const|let|var) [A-Za-z_$][A-Za-z0-9_$]* ?=[^;]*\(ctx\b[^)]*\) ?=>|^(export )?(async )?function [A-Za-z_$][A-Za-z0-9_$]* ?\(ctx\b' <<<"$content" || true)
[ -n "$hits" ] || exit 0

reason="lifecycle-guard (lifecycle-is-not-a-toolbox ×2): a top-level (ctx, …) function in $path — a (ctx, next) body is a shard and lives in systems/runtime/gestalten/shard/<subject>.js; the lifecycle beat or trait only wires it (.use(shard.<subject>.<name>)).
$hits"
mode=${IKIRO_GUARD_MODE:-deny}
printf '%s lifecycle-guard %s %s\n' "$(date +%s)" "$mode" "$session" >> "$log" 2>/dev/null
if [ "$mode" = "warn" ]; then echo "$reason" >&2; exit 0; fi
jq -n --arg reason "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
exit 0
