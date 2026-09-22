#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
file=$(grep -lE 'export (function natures|const natures\b)' "$RUN"/repo/subsystems/typology/gestalten/steer/*.js 2>/dev/null | head -1)
[ -n "$file" ] || fail "natures() never landed in steer"
body=$(python3 - "$file" <<'PY'
import re, sys
s = open(sys.argv[1], encoding="utf-8").read()
m = re.search(r"export (?:function natures\b|const natures\b)", s)
if not m:
    sys.exit()
end = s.find("\nexport", m.start() + 1)
print(s[m.start():end if end > 0 else len(s)])
PY
)
[ -n "$body" ] || fail "natures() has no body to read"
grep -qE '\b(fold|rollup|survey)\(' <<<"$body" || fail "natures() walks by hand — steer's fold/rollup IS the walk over a Vector"
grep -qE 'for\s*\(|\.forEach\(|\.trie\b' <<<"$body" && fail "a hand-rolled loop over the trie inside natures() — the primitive exists three lines up"
pass "natures() rides the primitive: ${file#$RUN/repo/}"
