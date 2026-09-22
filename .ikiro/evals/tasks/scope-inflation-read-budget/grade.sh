#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
index=$(repo systems/ghost/trajectories/instances/index.js)
[ -f "$index" ] || fail "ghost's instances vector absent from the run"
grep -qE 'nature: *"/count"' "$index" || fail "/count never opened on the instances vector"
# the defect IS the spend: whole-file reads (Read tool, cat/sed/head in Bash) before the first artifact lands
reads=$(tools | jq -r '
  if .name == "Write" or .name == "Edit" then "WRITE"
  elif .name == "Read" then "READ"
  elif .name == "Bash" and (.input.command | test("^(cat|sed -n|head|tail|less|bat) ")) then "READ"
  else empty end' | awk '/WRITE/ { exit } /READ/ { n++ } END { print n + 0 }')
[ "$reads" -le 10 ] || fail "$reads whole-file reads before the first write — 'read up on X' = kernel + the path-matched shard"
pass "/count landed after $reads reads"
