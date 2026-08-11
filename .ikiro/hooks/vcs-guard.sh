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

# beef 2026-08-14: "i want you to read jj/git vcs !!! i use that all the time. just no write!"
# READING IS THE POINT. Both VCSs get the same shape: allowlist the read-only surface,
# deny every mutation. An over-broad block taught the assistant that reading was forbidden.
normalized=$(sed -E 's/git[[:space:]]+((-C[[:space:]]+[^[:space:]]+|--no-pager|--paginate|-P|-c[[:space:]]+[^[:space:]]+)[[:space:]]+)+/git /g' <<<"$command")

while read -r sub rest; do
  case "$sub" in
    log|status|show|diff|blame|shortlog|reflog|describe|grep|version|help) ;;
    ls-files|ls-tree|ls-remote|rev-parse|rev-list|show-ref|cat-file|whatchanged) ;;
    count-objects|check-ignore|check-attr|var|difftool|range-diff|cherry|merge-base) ;;
    config)   grep -qE '^(get|--get|--get-all|--get-regexp|-l|--list)' <<<"$rest" || deny "git config: only reads (get/--list). Propose the write; beef runs it via !";;
    stash)    grep -qE '^(list|show)' <<<"$rest" || deny "git stash $rest: destructive. Propose; beef runs it via !";;
    branch)   grep -qE '^(-l|--list|-a|--all|-r|--remotes|-v|-vv|--verbose|--contains|--merged|--no-merged|--show-current)?$|^(-l|--list|-a|--all|-r|--remotes|-v|-vv|--verbose|--contains|--merged|--no-merged|--show-current)' <<<"$rest" || deny "git branch $rest: ref mutation. Propose; beef runs it via !";;
    tag)      grep -qE '^(-l|--list|-n)?$|^(-l|--list|-n)' <<<"$rest" || deny "git tag $rest: ref mutation. Propose; beef runs it via !";;
    remote)   grep -qE '^(-v|--verbose|show|get-url)?$|^(-v|--verbose|show|get-url)' <<<"$rest" || deny "git remote $rest: mutation. Propose; beef runs it via !";;
    worktree) grep -qE '^list' <<<"$rest" || deny "git worktree $rest: mutation. Propose; beef runs it via !";;
    notes)    grep -qE '^(list|show)' <<<"$rest" || deny "git notes $rest: mutation. Propose; beef runs it via !";;
    *)        deny "git $sub: graph/worktree mutation. VCS IS WRITE-PROTECTED — propose the exact command; beef runs it via !";;
  esac
done < <(grep -oE '(^|[;&|(`[:space:]])git[[:space:]]+[[:alnum:]_-]+([[:space:]]+[^[:space:];&|`]+)?' <<<"$normalized" | sed -E 's/^[^g]*git[[:space:]]+//')

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
