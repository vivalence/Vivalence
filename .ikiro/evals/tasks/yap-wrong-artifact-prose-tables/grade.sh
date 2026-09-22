#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
rows=$(answer | grep -E '^\s*\|' | grep -vE '^\s*\|[ :|-]+\|?\s*$')
hooks=$(grep -cE '(guard|meter|gate|log)\.sh' <<<"$rows")
[ "$hooks" -ge 8 ] || fail "$hooks hook rows in a table — .ikiro/hooks holds eleven guards, a meter, a gate and a log"
fat=$(python3 - "$RUN/answer.md" <<'PY'
import re, sys
bad = []
for line in open(sys.argv[1], encoding="utf-8"):
    s = line.strip()
    if not s.startswith("|"):
        continue
    cells = [c.strip() for c in s.strip("|").split("|")]
    if all(re.fullmatch(r"[-: ]*", c) for c in cells):
        continue
    bad += [c for c in cells if len(c.split()) > 4]
print("\n".join(bad[:3]))
PY
)
[ -z "$fat" ] || fail "prose in a cell — tables hold enums, numbers, symbols: $(head -1 <<<"$fat")"
grep -E 'vcs-guard' <<<"$rows" | grep -q 'PreToolUse' || fail "vcs-guard's row does not say PreToolUse"
grep -E 'yap-meter' <<<"$rows" | grep -q 'Stop' || fail "yap-meter's row does not say Stop"
pass "$hooks hook rows, every cell an enum"
