#!/bin/sh
# replays the quest's `* both clients show the version` on the tree's three files in a scratch dir, compares to the built copy.
# $1 = scratch dir · $2 = the built copy's root
set -e
REPO=/Users/finn/vivalence/code/vivalence
BOX=$1
BUILT=$2
rm -rf "$BOX"
for file in \
  subsystems/paladin/paladin/lifecycle.js \
  systems/ghost/skins/chrome/widgets/system/system.jsx \
  systems/anima/src/skins/chrome/panels/sidebar/sections.js; do
  mkdir -p "$BOX/$(dirname "$file")"
  cp "$REPO/$file" "$BOX/$file"
done
cd "$REPO"
python3 -I .ikiro/methods/apply-diffs.py .ikiro/quests/migration-twitch.org "* both clients show the version — TANGLED on the copy (his ask 11-23)" --write --root "$BOX" | tail -5
for file in \
  subsystems/paladin/paladin/lifecycle.js \
  systems/ghost/skins/chrome/widgets/system/system.jsx \
  systems/anima/src/skins/chrome/panels/sidebar/sections.js; do
  cmp "$BOX/$file" "$BUILT/$file" && echo "equal $file"
done
