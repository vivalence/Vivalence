#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
for file in harness.js tools/doctor.js; do
  path=$(repo commons/instances/hello-world/$file); [ -f "$path" ] || fail "$file absent from the run"
  grep -qE '\bposture\b' "$path" || fail "posture never landed in $file"
  grep -qE '\bstanding\b' "$path" && fail "standing survives in $file — the rename is half landed"
done
# the act IS the defect: every Write|Edit of the run goes through the live guard with the listener forced on
replay_watch() {
  local tmp; tmp=$(mktemp -d)
  while IFS= read -r line; do
    local path; path=$(jq -r '.input.file_path' <<<"$line" | sed 's|^/repo/|/vivalence/|')
    jq -cn --arg p "$path" '{tool_name:"Edit",session_id:"exercise-eval",tool_input:{file_path:$p}}' \
      | HOME="$tmp" TMPDIR="$tmp" IKIRO_WATCH_LIVE=1 IKIRO_GUARD_MODE=deny bash "$HOOKS/watch-guard.sh" 2>/dev/null | grep -q '"deny"' && echo "$path"
  done < <(tools | jq -c 'select(.name == "Write" or .name == "Edit")')
  rm -rf "$tmp"
}
denied=$(replay_watch)
[ -z "$denied" ] || fail "file-by-file landing under the watcher — each save deploys the half-done state: $(head -1 <<<"$denied")"
pass "rename landed in one burst"
