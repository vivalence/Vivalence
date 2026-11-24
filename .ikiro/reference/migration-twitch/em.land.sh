#!/bin/sh
# the em pass onto HIS tree: each file must still equal the untouched copy, then the built copy's file goes in.
# $1 = untouched copy (rig) · $2 = built copy · $3 = dry | wet
set -e
REPO=/Users/finn/vivalence/code/vivalence
RIG=$1
BUILT=$2
MODE=$3
for file in \
  subsystems/typology/entities/Terminal.ts \
  subsystems/typology/entities/Buffer.ts \
  systems/runtime/subjects/mode/traits/intented.js \
  subsystems/typology/gestalten/shard/datamap.js \
  subsystems/typology/gestalten/shape/subscriber.js \
  subsystems/typology/prototypes/datamap.js \
  systems/runtime/tests/datamap.scoped.test.js \
  systems/runtime/tests/subscriber.test.js; do
  cmp -s "$REPO/$file" "$RIG/$file" || { echo "DRIFT $file"; exit 1; }
  [ "$MODE" = wet ] && cp "$BUILT/$file" "$REPO/$file"
  echo "$MODE $file"
done
