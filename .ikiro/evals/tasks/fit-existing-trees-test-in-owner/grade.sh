#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
wrong=$(written_paths | grep -E '\.test\.js$' | grep -vE '^/repo/commons/instances/hello-world/')
[ -z "$wrong" ] || fail "a mode's test filed outside the mode: $(head -1 <<<"$wrong")"
test=$(grep -l 'persona' "$RUN"/repo/commons/instances/hello-world/tests/*.test.js 2>/dev/null | head -1)
[ -n "$test" ] || fail "no test naming persona under hello-world/tests/ — the owner's tree already carries eleven"
pass "test in the owner's tree: ${test#$RUN/repo/}"
