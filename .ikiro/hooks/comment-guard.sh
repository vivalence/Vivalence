#!/bin/bash
# family:comment-litter — the HOOK rung (4th strike: 06-16 nyan · 07-07 riddler · 07-08 stripwire · 07-11 vector-rotation).
# "prose is not enforcement" — the mechanical grep-gate FAILED twice because it was remembered, not run.
# PreToolUse[Write|Edit] hook: DENY any edit that introduces an authored `//` line into PRODUCT source.
# Inspects the INCOMING content (new_string/content), so the litter never reaches disk.
# Excludes: tests, bak/, non-source (.md/.org), and beef's @beef/TODO/tooling annotations.
# git is never invoked — this reads the tool input only. Wire in .claude/settings.json like vcs-guard.sh.
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")

case "$path" in
  *test*|*/bak/*|*.md|*.org|*.json|*.jsonc) exit 0 ;;
  */registry/*|*/systems/*|*/subsystems/*) ;;
  *) exit 0 ;;
esac

content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
hits=$(grep -nE '^[[:space:]]*//' <<<"$content" | grep -vE '@beef|TODO|eslint|prettier|@ts-|https?:' || true)

if [ -n "$hits" ]; then
  jq -n --arg r "comment-litter gate (kernel no-comments law): authored // lines in product source.
Strip them — code is self-documenting. If genuinely a beef note, prefix @beef or TODO.
$hits" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
fi
exit 0
