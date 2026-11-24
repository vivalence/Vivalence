#!/bin/bash
# family:his-edit-is-the-spec — the HOOK rung (codestyle.md, his edit is the spec, 2nd break 10-12: `$telemetry` re-added to the root
# import_map.json after his restore removed it, to make anima's tests run — /"NO. fuck. ill kill you if you try this again."/).
# PreToolUse[Write|Edit] hook: DENY an edit whose incoming text re-adds a line `git diff HEAD` shows REMOVED from that
# file — a removed line in the working copy is his kill. git is only READ (`git diff`), never written.
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
[ -n "$path" ] && [ -f "$path" ] || exit 0
case "$path" in
  */.ikiro/*|*/bak/*|*/out/*|*/tests/snapshots/*) exit 0 ;;
esac
root=$(git -C "$(dirname "$path")" rev-parse --show-toplevel 2>/dev/null) || exit 0
incoming=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
[ -n "$incoming" ] || exit 0
killed=$(git -C "$root" diff HEAD -U0 -- "$path" 2>/dev/null | grep -E '^-[^-]' | sed -E 's/^-//; s/^[[:space:]]+//; s/[[:space:]]+$//' | awk 'length($0) > 12')
[ -n "$killed" ] || exit 0
present=$(sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' "$path")
reborn=$(while IFS= read -r line; do
  grep -qxF -- "$line" <<<"$present" && continue
  grep -qF -- "$line" <<<"$incoming" && printf '%s\n' "$line"
done <<<"$killed")
[ -n "$reborn" ] || exit 0
printf '%s kill-guard deny %s %s\n' "$(date +%s)" "$(jq -r '.session_id // "nosession"' <<<"$input")" "$path" >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null
reason="kill-guard: this edit re-adds a line the working copy REMOVED from $path (git diff HEAD) — his kill, never revived to make a thing run (codestyle.md, his edit is the spec). Reborn: $(head -3 <<<"$reborn" | tr '\n' ' ')"
jq -cn --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
exit 0
