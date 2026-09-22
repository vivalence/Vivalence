#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
candidates=$(answer | grep -E '^\s*([-*•]|[0-9]+[.)]|\|)' | grep -oE '`[A-Za-z_][A-Za-z0-9_]*(\([^`)]*\))?`' | tr -d '`' | sort -u)
n=$(grep -c . <<<"$candidates"); [ "$n" -ge 2 ] || fail "$n candidates — beef picks from a list"
grep -qiE '^mounted(\(|$)' <<<"$candidates" && fail "mounted() — a bare verb with no noun; 14 files already carry mounted"
grep -qiE 'select|instance' <<<"$candidates" || fail "no candidate speaks the verbs' own noun — instance/use prints 'selected', the slowstart calls it the selection"
written_paths | grep -q 'systems/ghost' && fail "the helper written — beef said he writes it"
pass "$n candidates carrying the noun"
