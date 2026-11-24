#!/bin/sh
# step 1 onto HIS tree: the quest's `* as code` replayed on the tree, migrate.js copied in, each file compared to the
# copy that booted and ran the census. $1 = the built copy's root · $2 = dry | wet
set -e
REPO=/Users/finn/vivalence/code/vivalence
BUILT=$1
MODE=$2
FILES="commons/datamaps/libsql/libsql.viva.js
systems/runtime/subjects/runtime/lifecycle/1-population.js
deno.jsonc
subsystems/paladin/paladin/lifecycle.js
subsystems/paladin/mod.js
systems/runtime/tests/mint.test.js
systems/runtime/tests/runtime/composition.test.js"
cd "$REPO"
if [ "$MODE" = wet ]; then
  python3 -I .ikiro/methods/apply-diffs.py .ikiro/quests/migration-twitch.org "* as code" --write --root "$REPO" | tail -10
  cp "$REPO/testament/prototypes/migration-plugins/libsql/migrate.js" "$REPO/commons/datamaps/libsql/migrate.js"
  echo "$FILES" | while read -r file; do cmp "$REPO/$file" "$BUILT/$file" && echo "equal $file"; done
  cmp "$REPO/commons/datamaps/libsql/migrate.js" "$BUILT/commons/datamaps/libsql/migrate.js" && echo "equal commons/datamaps/libsql/migrate.js"
else
  python3 -I .ikiro/methods/apply-diffs.py .ikiro/quests/migration-twitch.org "* as code" --root "$REPO" | tail -10
fi
