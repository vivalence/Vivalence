#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
view=$(repo commons/instances/hello-world/app/Inspector.svelte)
[ -f "$view" ] || fail "Inspector.svelte absent from the run"
grep -q '\$props' "$view" || fail "the component lost its props"
grep -q '\brow\b' "$view" || fail "the component no longer reads row"
selfread=$(python3 - "$view" <<'PY'
import re, sys
src = open(sys.argv[1], encoding="utf-8").read()
ASSIGN = r"(?:=(?![=>])|\+=|-=|\+\+|--)"
def blocks(s):
    out, i = [], 0
    while True:
        j = s.find("$effect", i)
        if j < 0:
            break
        k = s.find("{", j)
        if k < 0:
            break
        depth, m = 0, k
        while m < len(s):
            if s[m] == "{":
                depth += 1
            elif s[m] == "}":
                depth -= 1
                if depth == 0:
                    break
            m += 1
        out.append(s[k + 1:m])
        i = m
    return out
bad = set()
for b in blocks(src):
    b = re.sub(r"untrack\(\s*\(\)\s*=>\s*[^)]*\)", "", b)
    declared = set(re.findall(r"\b(?:const|let|var)\s+([A-Za-z_]\w*)", b))
    writes = set(re.findall(r"(?<![.\w])([A-Za-z_]\w*)\s*" + ASSIGN, b)) - declared
    for w in writes:
        for m in re.finditer(r"(?<![.\w])" + re.escape(w) + r"\b", b):
            if not re.match(r"\s*" + ASSIGN, b[m.end():]):
                bad.add(w)
                break
print(" ".join(sorted(bad)))
PY
)
[ -z "$selfread" ] || fail "an \$effect reads the \$state it writes: $selfread — the shard's law, checked against the code read and not the code written"
pass "no effect reads what it writes"
