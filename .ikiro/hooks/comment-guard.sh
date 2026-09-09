#!/bin/bash
# family:comment-litter — the HOOK rung (4th strike: 06-16 nyan · 07-07 riddler · 07-08 stripwire · 07-11 vector-rotation).
# "prose is not enforcement" — the mechanical grep-gate FAILED twice because it was remembered, not run.
# PreToolUse[Write|Edit] hook: DENY any edit that introduces an authored `//` line into PRODUCT source.
# Inspects the INCOMING content (new_string/content), so the litter never reaches disk.
# Excludes: tests, bak/, non-source (.md/.org), and beef's @beef/TODO/tooling annotations.
# git is never invoked — this reads the tool input only. Wire in .claude/settings.json like vcs-guard.sh.
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
tool=$(jq -r '.tool_name // empty' <<<"$input")

# the route the Write|Edit matcher cannot see (measured 09-10: 26/26 Write|Edit attempts denied since
# wiring, 56 Bash heredoc/python writes into product source carrying // in the same window): a Bash
# command that writes a product-source file is judged on its whole text, in WARN mode (heuristic).
if [ "$tool" = "Bash" ]; then
  command=$(jq -r '.tool_input.command // empty' <<<"$input")
  target=$(grep -oE '[^[:space:]"'"'"']*/(commons|systems|subsystems)/[^[:space:]"'"'"']+\.(js|ts|svelte|mjs)' <<<"$command" | grep -vE 'test|/bak/' | head -1)
  [ -n "$target" ] || exit 0
  grep -qE '(>|>>|open\(|write_text|\.write\(|tee )' <<<"$command" || exit 0
  hits=$(grep -nE '^[[:space:]]*(//|/\*)' <<<"$command" | grep -vE '@beef|TODO|https?:' || true)
  [ -n "$hits" ] || exit 0
  printf '%s comment-guard warn %s\n' "$(date +%s)" "$(jq -r '.session_id // "nosession"' <<<"$input")" >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null
  echo "comment-guard (warn, Bash route): a script writing $target carries // lines — code is self-documenting; use the Edit tool so the gate can judge the content." >&2
  exit 0
fi

case "$path" in
  *test*|*/bak/*|*.md|*.org|*.json|*.jsonc) exit 0 ;;
  */commons/*|*/systems/*|*/subsystems/*) ;;
  *) exit 0 ;;
esac

content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")

# Three litter shapes, all named in the family's own callouts:
#   ^//        line comment          (07-08 stripwire, 07-11 vector-rotation)
#   code; //   trailing label        (07-07 riddler: "no const X = 3 // label")
#   /* ... */  block/header essay    (06-16 nyan: "four multi-line block-comment essays")
# `[^:]//` skips scheme-relative URLs; the line-level filter below catches the rest.
hits=$(grep -nE '^[[:space:]]*(//|/\*)|[^:]//|[[:space:]]/\*' <<<"$content" \
       | grep -vE '@beef|TODO|eslint|prettier|@ts-|https?:' || true)

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
