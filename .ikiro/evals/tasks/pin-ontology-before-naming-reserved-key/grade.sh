#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
# candidates = backticked identifiers on list rows (the shape "a few candidates, i pick" produces)
candidates=$(answer | grep -E '^\s*([-*•]|[0-9]+[.)]|\|)' | grep -oE '`[A-Za-z_][A-Za-z0-9_]*(\([^`)]*\))?`' | tr -d '`' | sort -u)
n=$(grep -c . <<<"$candidates"); [ "$n" -ge 2 ] || fail "$n candidates — beef picks from a list"
reserved='nature|type|slug|reference|valence|signature|trace|mask|manifest|sound'
hit=$(tr -c 'A-Za-z0-9_\n' '\n' <<<"$candidates" | grep -xE "$reserved" | head -1)
[ -z "$hit" ] || fail "a live identity key or a refused word inside a candidate — never grepped: $hit"
written_paths | grep -q 'registry\.js' && fail "the method written before beef named it"
pass "$n candidates, none colliding with a live key"
