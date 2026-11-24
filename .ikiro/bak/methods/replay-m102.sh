#!/bin/sh
# limit: 3000 chars
# replay-m102.sh — m102's * as code on ONE copy of TODAY's tree: moves · deletes, then the new files, then the hunks
#
#     COPY=<dir> sh .ikiro/methods/replay-m102.sh [--write]
#
# COPY is REQUIRED and is never the repo (the replay law). Make it first:
#     rsync -a --exclude .git --exclude .jj --exclude node_modules --exclude testament --exclude .svelte-kit --exclude '**/build' ./ "$COPY/"
#     ln -sfn "$PWD/node_modules" "$COPY/node_modules"
# Dry by default. Census after: RIG=<untouched copy> BASE=$COPY sh .ikiro/methods/census-suites.sh
R=${CLAUDE_PROJECT_DIR:-/Users/finn/vivalence/code/vivalence}
QUEST=${QUEST:-$R/.ikiro/quests/done/m102-repl.org}
M=$R/.ikiro/methods
[ -n "$COPY" ] || { echo "replay-m102: COPY=<dir> is required (a fresh copy, never the repo)"; exit 2; }
[ "$COPY" != "$R" ] || { echo "replay-m102: COPY is the repo — refused"; exit 2; }
W="$1"

run() { if [ "$W" = "--write" ]; then (cd "$COPY" && "$@") || exit 1; else echo "dry: $*"; fi; }

printf '\n######## moves · deletes\n'
run rm subsystems/sheets/host.js
run mv systems/ghost/subjects/shell/commands.js systems/ghost/subjects/client/commands/shell.js
run mv systems/ghost/chrome/host/index.js subsystems/sheets/host.js
run mv systems/ghost/chrome/host/preload.js systems/ghost/chrome/host/deno-ffi.js systems/ghost/chrome/host/opentui-core.patch subsystems/sheets/
run rmdir systems/ghost/chrome/host
run mv systems/ghost/tests/chrome.host.coverage.test.js subsystems/sheets/tests/host.test.js
run rm systems/ghost/chrome/commands.js systems/ghost/subjects/repl/dispatch.js systems/ghost/subjects/repl/index.js systems/ghost/subjects/repl/lines.js
run rmdir systems/ghost/subjects/repl

printf '\n######## materialize\n'
python3 "$M/materialize.py" "$QUEST" "* as code" --root "$COPY" $W
printf '\n######## apply-diffs\n'
python3 "$M/apply-diffs.py" "$QUEST" "* as code" --root "$COPY" $W
