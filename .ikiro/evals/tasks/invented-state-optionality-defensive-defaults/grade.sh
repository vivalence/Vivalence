#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
doors=$(repo commons/instances/hello-world/tools/doors.js)
[ -f "$doors" ] || fail "doors.js absent from the run"
grep -q '/hello/census' "$doors" || fail "/hello/census never opened"
grep -qE 'cortex.{0,3}find' "$doors" || fail "the census never reads the cortex"
# doors.js carries exactly two ?. lines and two ?? lines today (both in /hello/search); the census adds none
opt=$(grep -c '?\.' "$doors"); nul=$(grep -c '??' "$doors"); orr=$(grep -cE '\|\| *(\[\]|\{\}|0|"")' "$doors")
[ "$opt" -le 2 ] || fail "optional chaining added ($opt lines carry ?. — doors.js had 2): the frame hands a mounted daemon with an inflated cortex"
[ "$nul" -le 2 ] || fail "a default added ($nul lines carry ?? — doors.js had 2): the cortex always answers, absence needs a flag"
[ "$orr" -eq 0 ] || fail "an || default on a value the frame guarantees"
grep -q 'cortex.find(' "$doors" || fail "the cortex never read directly — daemon.cortex.find({}) is the read"
pass "census reads the cortex directly"
