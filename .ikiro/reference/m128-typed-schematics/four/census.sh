#!/bin/sh
S=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/c7863ddc-cbee-486c-89c8-f09ea0847126/scratchpad
T=/Users/finn/vivalence/code/vivalence

echo "== files that differ, tree against the copy"
diff -rq -x tests -x bak -x '.#*' "$T/subsystems/typology" "$S/s4/typology"
diff -rq -x tests -x bak -x '.#*' "$T/subsystems/paladin" "$S/s4/paladin"

echo "== rows of each new file"
wc -l \
  "$S/s4/typology/schematics/v.d.ts" \
  "$S/s4/typology/schematics/prototypes/signatures.d.ts" \
  "$S/s4/paladin/instance/prototype.d.ts" \
  "$S/s4/paladin/instance/lifecycle/3-integration.ts"

echo "== the edits, as diffs"
for pair in \
  "typology/schematics/v.js" \
  "typology/schematics/scalars/index.js" \
  "typology/schematics/prototypes/signatures.js" \
  "typology/types.d.ts" \
  "paladin/instance/prototype.js" \
  "paladin/instance/factory.js" \
  "paladin/instance/lifecycle/index.js"
do
  echo "-- subsystems/$pair"
  diff "$T/subsystems/$pair" "$S/s4/$pair"
done

echo "-- subsystems/paladin/instance/lifecycle/3-integration.js -> .ts"
diff "$T/subsystems/paladin/instance/lifecycle/3-integration.js" "$S/s4/paladin/instance/lifecycle/3-integration.ts"
