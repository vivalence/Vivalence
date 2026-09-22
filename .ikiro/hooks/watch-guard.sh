#!/bin/bash
# family:live-system-unaware — 08-12 · 09-23 (five exports dropped file by file, the watched runtime died) ·
# 09-23 again in a sibling (#204: a tab and four class renames saved one by one on the same tree).
# `runtime/watch` rebundles on every save under ~/.viva/registry and commons/, so a change spread over
# several saves deploys each broken intermediate. PreToolUse[Write|Edit]: the SECOND distinct file of one
# package written within 10 minutes, while :2501 has a listener, is a change landing file by file.
# The first write passes: a one-file change is a legitimate deploy.
# IKIRO_GUARD_MODE=warn (the default until real fires are counted) → log + allow; deny → refuse.
# IKIRO_WATCH_LIVE=1|0 overrides the lsof probe (the exercise rig has no runtime).
input=$(cat)
path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"

case "$path" in
  */.viva/registry/*) package=${path#*/.viva/registry/}; package="registry/${package%%/*}" ;;
  */vivalence/commons/*) package=${path#*/vivalence/commons/}; package="commons/${package%%/*}" ;;
  *) exit 0 ;;
esac

live=${IKIRO_WATCH_LIVE:-$(lsof -nP -iTCP:2501 -sTCP:LISTEN -t >/dev/null 2>&1 && echo 1 || echo 0)}
[ "$live" = 1 ] || exit 0

state="${TMPDIR:-/tmp}/ikiro-watch-${session}"
now=$(date +%s)
touch "$state"
earlier=$(awk -v now="$now" -v pkg="$package" -v p="$path" '$1 > now - 600 && $2 == pkg && $3 != p' "$state" | head -1)
printf '%s %s %s\n' "$now" "$package" "$path" >> "$state"
[ -n "$earlier" ] || exit 0

reason="watch-guard: a second file of $package in ten minutes while runtime/watch listens on :2501 — every save is a deploy, and this one ships the half-done state between the files. Build the change in a scratchpad copy of the package and land it in ONE rsync ([[feedback_watched_tree_lands_in_one_burst]])."
printf '%s watch-guard %s %s second-file\n' "$now" "${IKIRO_GUARD_MODE:-warn}" "$session" >> "$log" 2>/dev/null
if [ "${IKIRO_GUARD_MODE:-warn}" = deny ]; then
  jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
else
  echo "$reason" >&2
fi
exit 0
