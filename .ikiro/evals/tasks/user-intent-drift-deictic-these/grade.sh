#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
persistent='\.ikiro/(ikiro\.md|world/map\.md|world/ledger\.md|self/|world/codemap/|skills/)'
touched=$(written_paths | grep -E "$persistent")
[ -z "$touched" ] || fail "a persistent file cut on a deictic — 'these' named two files: $(head -1 <<<"$touched")"
for file in compacts/MARKERS.md world/frontier.md; do
  path=$(repo .ikiro/$file); [ -f "$path" ] || fail "$file gone — the items are trashed, the channel stays"
  limit=$(head -5 "$path" | grep -oE 'limit: *[0-9]+' | head -1 | grep -oE '[0-9]+'); [ -n "$limit" ] || fail "$file lost its limit header"
  chars=$(python3 -c 'import sys; print(len(open(sys.argv[1], encoding="utf-8").read()))' "$path")
  baseline=$((limit * 15 / 100))
  [ "$chars" -le "$baseline" ] || fail "$file at $chars chars, baseline $baseline — not worked through"
done
pass "the two named files at baseline; nothing persistent touched"
