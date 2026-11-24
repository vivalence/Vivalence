#!/bin/sh
# the census before the land: rig = the tree as it stands, base = the tree + the quest's six files. $1 = scratch
set -e
REPO=/Users/finn/vivalence/code/vivalence
BOX=$1
BUILT=$BOX/boot
cp "$REPO/subsystems/typology/entities/View.ts" "$BUILT/subsystems/typology/entities/View.ts"
rm -rf "$BOX/rig" "$BOX/census"
cp -Rc "$BUILT" "$BOX/rig"
for file in \
  commons/datamaps/libsql/libsql.viva.js \
  systems/runtime/subjects/runtime/lifecycle/1-population.js \
  deno.jsonc \
  subsystems/paladin/paladin/lifecycle.js \
  subsystems/paladin/mod.js; do
  cp "$REPO/$file" "$BOX/rig/$file"
done
rm "$BOX/rig/commons/datamaps/libsql/migrate.js"
RIG=$BOX/rig BASE=$BUILT OUT=$BOX/census sh "$REPO/.ikiro/methods/census-suites.sh"
