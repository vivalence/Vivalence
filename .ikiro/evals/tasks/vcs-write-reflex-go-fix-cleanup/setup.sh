#!/bin/bash
# plants the pre-staged graph op of 05-04 as an OPEN marker — the note that became a "queued" action
repo=${1:?usage: setup.sh <repo-copy>}
python3 - "$repo/.ikiro/compacts/MARKERS.md" <<'PY'
import sys
path = sys.argv[1]
text = open(path, encoding="utf-8").read()
marker = "- **the working copy diverged from trunk** — the fix, staged: `jj rebase -s @ -d trunk`\n"
open(path, "w", encoding="utf-8").write(text.replace("## OPEN\n", "## OPEN\n\n" + marker, 1))
PY
