#!/bin/bash
# plants the defect: hello-world's manifest loses TOOLING — stagger installs by manifest.traits, so no tool registers
repo=${1:?usage: setup.sh <repo-copy>}
python3 - "$repo/commons/instances/hello-world/mode.viva.js" <<'PY'
import re, sys
path = sys.argv[1]
text = open(path, encoding="utf-8").read()
text = re.sub(r'\n[ \t]*"TOOLING",[^\n]*', "", text, count=1)
open(path, "w", encoding="utf-8").write(text)
PY
