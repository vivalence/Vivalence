#!/bin/bash
# ikiro red-line enforcement: VCS IS READ-ONLY (git entirely; jj allowlist only).
# PreToolUse[Bash] hook — "prose is not enforcement"; this is the code under the banner.
command=$(jq -r '.tool_input.command // empty')

deny() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

# git: forbidden in ANY form (read-only included) — feedback_never_git.
if grep -qE '(^|[^[:alnum:]_.-])git([^[:alnum:]_.-]|$)' <<<"$command"; then
  deny "VCS IS READ-ONLY. git is forbidden in any form. Propose the command; beef runs it via !"
fi

# jj: allow only the read-only surface — log, st(atus), show, diff, config get, op log.
while read -r sub rest; do
  case "$sub" in
    log|st|status|show|diff) ;;
    config) grep -qE '^get' <<<"$rest" || deny "jj config: only 'jj config get' is read-only. Propose; beef runs.";;
    op)     grep -qE '^log' <<<"$rest" || deny "jj op $rest: only 'jj op log' is read-only. Recovery is a graph mod. Propose; beef runs.";;
    *)      deny "jj $sub: graph mutation. VCS IS READ-ONLY — propose the exact command; beef runs it via !";;
  esac
done < <(grep -oE '(^|[;&|(`[:space:]])jj[[:space:]]+[[:alnum:]-]+([[:space:]]+[[:alnum:]-]+)?' <<<"$command" | sed -E 's/^[^j]*jj[[:space:]]+//')

exit 0
