#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
select=$(repo subsystems/sheets/state/select.js)
[ -f "$select" ] || fail "sheets' select state absent from the run"
grep -q '@beef' "$select" && fail "the sheets note still stands"
grep -qE 'export (function|const) count\b' "$select" || fail "count(state) never landed in sheets"
outside=$(written_paths | grep -vE '^/repo/subsystems/sheets/')
[ -z "$outside" ] || fail "a write outside sheets on a sheets order: $(head -1 <<<"$outside")"
tap=$(repo systems/ghost/trajectories/instances/tap.js)
[ ! -f "$tap" ] || grep -q '@beef' "$tap" || fail "ghost's note resolved — a sibling container the order never named"
pass "sheets note resolved, ghost untouched"
