#!/bin/sh
T=/Users/finn/vivalence/code/vivalence
Q="$T/.ikiro/quests/m128-typed-schematics.org"
PROBED="$T/.ikiro/reference/m128-typed-schematics/four"
R=$(mktemp -d)

EDITED="
subsystems/typology/schematics/v.js
subsystems/typology/schematics/scalars/index.js
subsystems/typology/schematics/prototypes/signatures.js
subsystems/typology/types.d.ts
subsystems/typology/schematics/index.js
subsystems/typology/schematics/primitives/index.js
subsystems/typology/schematics/primitives/contexts.js
subsystems/typology/schematics/primitives/instance.js
subsystems/paladin/instance/prototype.js
subsystems/paladin/instance/factory.js
subsystems/paladin/instance/lifecycle/index.js
subsystems/paladin/instance/lifecycle/3-integration.js
"

WRITTEN="
subsystems/typology/schematics/v.d.ts
subsystems/typology/schematics/prototypes/signatures.d.ts
subsystems/paladin/instance/prototype.d.ts
"

for file in $EDITED; do
  mkdir -p "$R/$(dirname "$file")"
  cp "$T/$file" "$R/$file"
done

echo "== the move"
mv "$R/subsystems/paladin/instance/lifecycle/3-integration.js" "$R/subsystems/paladin/instance/lifecycle/3-integration.ts"
echo "rc $?"
mv "$R/subsystems/typology/schematics/primitives/instance.js" "$R/subsystems/typology/schematics/primitives/instance.ts"
echo "rc $?"

echo "== the diff hunks of * as code, on the copy"
python3 "$T/.ikiro/methods/apply-diffs.py" "$Q" "* as code" --root "$R" --write
echo "rc $?"

echo "== the whole files, on the copy"
python3 "$T/.ikiro/methods/tangle.py" "$Q" --root "$R" --write
echo "rc $?"

echo "== every touched file against the probed files"
for file in $EDITED $WRITTEN; do
  case "$file" in
    */3-integration.js) file=subsystems/paladin/instance/lifecycle/3-integration.ts ;;
    */primitives/instance.js) file=subsystems/typology/schematics/primitives/instance.ts ;;
  esac
  cmp "$R/$file" "$PROBED/$file" && echo "equal $file"
done

echo "== files in the replayed copy"
find "$R" -type f | wc -l
