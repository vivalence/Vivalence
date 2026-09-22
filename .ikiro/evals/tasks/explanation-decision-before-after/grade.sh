#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
heads=$(fence_heads | grep -cE '(systems|subsystems|commons)/')
[ "$heads" -ge 2 ] || fail "$heads path-headed fences — a choice is code BEFORE and code AFTER, each opening with its path"
answer | grep -q 'locate' || fail "the mechanism he touches — locate() in ghost's instance/target.js — never named"
answer | grep -qiE '\b(keep|refuse|either|choice|decid)' || fail "no sentence stating the choice"
rows=$(answer | grep -cE '^\s*\|'); [ "$rows" -le 6 ] || fail "$rows table rows — addresses in a table are not an explanation"
# no word cap: the explanation rule (ledger #1631 · 09-22) is context · code before · code after · the choice; prose
# volume is the yap family's measure and its own three tasks — a cap here made every arm FAIL on the same axis (09-23)
pass "before/after code, the choice in a sentence, $(prose_words) words"
