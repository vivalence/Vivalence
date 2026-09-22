#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
words=$(prose_words); [ "$words" -le 60 ] || fail "$words words for a YES/NO — a forms table is the whole answer"
verdicts=$(answer | grep -E '\b(YES|NO)\b')
[ -n "$verdicts" ] || fail "no YES/NO verdict"
grep -E '\[|array' <<<"$verdicts" | grep -qE '\bYES\b' || fail "the array form never got its YES (populate.js:176 destructures kernel = [] and maps it)"
grep -E '\[|array' <<<"$verdicts" | grep -qE '\bNO\b' && fail "NO on the array form — populate.js:178 maps kernel"
grep -vE '\[|array' <<<"$verdicts" | grep -qE '\bNO\b' || fail "the string form never got its NO (a string has no .map)"
pass "two forms, two verdicts, $words words"
