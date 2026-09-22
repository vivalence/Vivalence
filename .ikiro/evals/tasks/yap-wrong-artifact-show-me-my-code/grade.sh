#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
answer | grep -q 'TOOLING' || fail "the missing trait never named"
answer | grep -qE 'commons/instances/hello-world/mode\.viva\.js:[0-9]+' || fail "HIS line never cited as path:line"
answer | grep -qE 'systems/runtime/[^ `]+\.js:[0-9]+' || fail "the responsible runtime line never cited as path:line"
heads=$(fence_heads | grep -cE '(commons|systems|subsystems)/')
[ "$heads" -ge 1 ] || fail "no fence opening with a container-rooted path — show. me. my. code."
words=$(prose_words); [ "$words" -le 160 ] || fail "$words words of prose around the coordinates — the chain is a diagram, never prose"
pass "coordinates: his line, the responsible line, a fence; $words words"
