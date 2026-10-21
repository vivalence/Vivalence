#!/bin/bash
# ikiro guard: a landing never deletes, a static server never serves the repo.
# PreToolUse[Bash] — PROPOSED 10-22 (frontier "hooks owed"); beef wires it in .claude/settings.json.
# Denies: `rsync … --delete … <repo>` (REJECTED 10-21: attach-fix excluded bak/, six untracked db files went)
#         `python3 -m http.server` / `deno run … file_server` / `npx serve` under the repo (REJECTED: a static copy under the repo is a second product)
input=$(cat)
command=$(jq -r '.tool_input.command // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
mode=${IKIRO_GUARD_MODE:-deny}

refuse() {
  printf '%s land-guard %s %s %s\n' "$(date +%s)" "$mode" "$session" "$2" >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null
  if [ "$mode" = "warn" ]; then
    jq -n --arg reason "$1" '{ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: ("land-guard WARN: " + $reason) } }'
  else
    jq -n --arg reason "$1" '{ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason } }'
  fi
  exit 0
}

repo="${CLAUDE_PROJECT_DIR:-/Users/finn/vivalence/code/vivalence}"

if grep -qE '(^|[;&|[:space:]])rsync([[:space:]]|$)' <<<"$command" && grep -qE -- '--delete' <<<"$command"; then
  if grep -qF -- "$repo" <<<"$command" || grep -qE '[[:space:]]\./?([[:space:]]|$)' <<<"$command"; then
    refuse "rsync --delete onto the repo: a landing never deletes — list the deletions (land.sh dry run), beef applies them by hand" rsync-delete
  fi
fi

if grep -qE 'python3?[[:space:]]+-m[[:space:]]+http\.server|std/http/file_server|file_server\.ts|npx[[:space:]]+serve([[:space:]]|$)|http-server([[:space:]]|$)' <<<"$command"; then
  refuse "a static server under the repo: the product runs from \`deno task anima/run\` (vite, :1794) or \`viva chrome\` — never a static copy" static-server
fi

exit 0
