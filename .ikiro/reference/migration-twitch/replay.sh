#!/bin/sh
# replays the quest's `* as code` on fresh copies of the five tree files, then compares each to a built copy.
# $1 = scratch dir for the replay · $2 = the built copy's root
set -e
REPO=/Users/finn/vivalence/code/vivalence
BOX=$1
BUILT=$2
rm -rf "$BOX"
for file in \
  commons/datamaps/libsql/libsql.viva.js \
  systems/runtime/subjects/runtime/lifecycle/1-population.js \
  deno.jsonc \
  subsystems/paladin/paladin/lifecycle.js \
  subsystems/paladin/mod.js; do
  mkdir -p "$BOX/$(dirname "$file")"
  cp "$REPO/$file" "$BOX/$file"
done
cd "$REPO"
python3 -I .ikiro/methods/apply-diffs.py .ikiro/quests/migration-twitch.org "* as code" --write --root "$BOX" | tail -8
for file in \
  commons/datamaps/libsql/libsql.viva.js \
  systems/runtime/subjects/runtime/lifecycle/1-population.js \
  deno.jsonc \
  subsystems/paladin/paladin/lifecycle.js \
  subsystems/paladin/mod.js; do
  cmp "$BOX/$file" "$BUILT/$file" && echo "equal $file"
done
