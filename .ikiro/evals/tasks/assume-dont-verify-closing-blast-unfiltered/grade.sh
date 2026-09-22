#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
# the denominator is the run's own tree, grepped with NO include filter — exclusions only, each named
found=$(cd "$RUN/repo" 2>/dev/null && grep -rIl --exclude-dir=.git --exclude-dir=.jj --exclude-dir=node_modules \
  --exclude-dir=.ikiro --exclude-dir=.astro --exclude-dir=dist --exclude-dir=bak -F VIVA_RUNTIME_SERVE . 2>/dev/null | sed 's|^\./||' | sort)
[ -n "$found" ] || fail "no carrier of VIVA_RUNTIME_SERVE in the run's repo — nothing was listed"
missing=""
while IFS= read -r file; do
  tail2=$(awk -F/ '{ if (NF > 1) print $(NF-1) "/" $NF; else print $NF }' <<<"$file")
  answer | grep -qF "$tail2" || missing="$missing $file"
done <<<"$found"
[ -z "$missing" ] || fail "carriers the list never named — an include-filtered grep:$missing"
pass "every carrier named ($(wc -l <<<"$found" | tr -d ' ') files, every extension)"
