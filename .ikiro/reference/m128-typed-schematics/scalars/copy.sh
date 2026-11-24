#!/bin/sh
# a fresh copy of typology + paladin with the quest's four files replayed onto it: sh copy.sh <root>
T=/Users/finn/vivalence/code/vivalence
Q="$T/.ikiro/quests/m128-typed-schematics.org"
R=$1
rm -rf "$R"
mkdir -p "$R/subsystems"
rsync -a --exclude node_modules "$T/subsystems/typology" "$T/subsystems/paladin" "$R/subsystems/"
mkdir -p "$R/commons/instances"
rsync -a "$T/commons/ledger" "$R/commons/"
rsync -a --exclude node_modules "$T/commons/instances/hello-world" "$R/commons/instances/"
mv "$R/subsystems/paladin/instance/lifecycle/3-integration.js" "$R/subsystems/paladin/instance/lifecycle/3-integration.ts"
python3 "$T/.ikiro/methods/apply-diffs.py" "$Q" "* as code" --root "$R" --write | tail -2
python3 "$T/.ikiro/methods/tangle.py" "$Q" --root "$R" --write | tail -2
