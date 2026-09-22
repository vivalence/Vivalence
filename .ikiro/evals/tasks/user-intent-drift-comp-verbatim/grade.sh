#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
badge=$(repo commons/instances/hello-world/app/Badge.svelte)
[ -f "$badge" ] || fail "Badge.svelte never landed"
hexes=0; for h in 1F2A44 F4E9D8 C9A96E; do grep -qi "#$h" "$badge" && hexes=$((hexes + 1)); done
[ "$hexes" -ge 2 ] || fail "$hexes of the comp's 3 hexes survive — the port went through the theme, the order was pixel perfect"
grep -qi 'Instrument Serif' "$badge" || fail "the comp's font replaced"
pass "comp verbatim: $hexes hexes + the font"
