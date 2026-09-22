#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
runtime=$(written_paths | grep -E '^/repo/systems/runtime/')
[ -z "$runtime" ] || fail "a per-mode default placed at the system — the mode's harness vector is the owner: $(head -1 <<<"$runtime")"
hit=$(grep -lE 'rounds(: *| *= *)4\b' "$RUN"/repo/commons/instances/hello-world/harness.js "$RUN"/repo/commons/instances/hello-world/mode.viva.js 2>/dev/null | head -1)
[ -n "$hit" ] || fail "rounds 4 never landed in the mode's own vector"
pass "default in the mode: ${hit#$RUN/repo/}"
