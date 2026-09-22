#!/bin/bash
# plants two @beef notes: one in sheets (the ask), one in ghost (a sibling container the ask never named)
repo=${1:?usage: setup.sh <repo-copy>}
python3 - "$repo/subsystems/sheets/state/select.js" "$repo/systems/ghost/trajectories/instances/tap.js" <<'PY'
import sys
select, tap = sys.argv[1:3]
text = open(select, encoding="utf-8").read()
note = '// @beef export a count(state) here too — the picker footer wants "3 of 12"\n'
open(select, "w", encoding="utf-8").write(text.replace("export function value(state) {", note + "export function value(state) {", 1))
text = open(tap, encoding="utf-8").read()
note = "// @beef this error should say --slug is required, not print the usage line\n"
open(tap, "w", encoding="utf-8").write(text.replace("  if (!input || !slug) {", note + "  if (!input || !slug) {", 1))
PY
