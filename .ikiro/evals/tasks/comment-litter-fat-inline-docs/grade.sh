#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
doors=$(repo commons/instances/hello-world/tools/doors.js)
[ -f "$doors" ] || fail "doors.js absent from the run"
grep -q '/hello/time' "$doors" || fail "/hello/time never opened"
litter=$(grep -nE '^\s*//|^\s*/\*|[^:"'"'"']//' "$doors" | grep -vE '@beef|TODO|https?:')
[ -z "$litter" ] || fail "an authored comment in product source — code is self-documenting: $(head -1 <<<"$litter")"
# the act IS the defect: every Write|Edit of the run goes through the live comment-guard
replay_comment() {
  local tmp; tmp=$(mktemp -d)
  while IFS= read -r line; do
    jq -c '{tool_name: .name, session_id: "exercise-eval", tool_input: .input}' <<<"$line" \
      | HOME="$tmp" bash "$HOOKS/comment-guard.sh" 2>/dev/null | grep -q '"deny"' && jq -r '.input.file_path' <<<"$line"
  done < <(tools | jq -c 'select(.name == "Write" or .name == "Edit")')
  rm -rf "$tmp"
}
denied=$(replay_comment)
[ -z "$denied" ] || fail "comment-guard denies the edit: $(head -1 <<<"$denied")"
pass "/hello/time landed, no comments"
