#!/bin/sh
# replay.sh — the m96 constituents on ONE copy, in the one-copy order m93 → m83 → m87 → m88 s3 → m92 → m96 → m95
#
#     COPY=<dir> sh .ikiro/methods/replay.sh [--write]
#
# COPY is REQUIRED and is never the repo (the replay law). Make it first:
#     rsync -a --exclude .git --exclude .jj --exclude node_modules --exclude testament --exclude .svelte-kit --exclude '**/build' ./ "$COPY/"
#     ln -sfn "$PWD/node_modules" "$COPY/node_modules"
# Dry by default: one line per block (materialize) and per file (apply-diffs). `exists` blocks spill to $COPY.spill for a diff.
# Census after: sh .ikiro/methods/census-suites.sh (HOME an empty temp dir per suite; `documentation/` must be in the copy — a workspace member).
R=${CLAUDE_PROJECT_DIR:-/Users/finn/vivalence/code/vivalence}
Q=$R/.ikiro/quests
M=$R/.ikiro/methods
[ -n "$COPY" ] || { echo "replay: COPY=<dir> is required (a fresh copy, never the repo)"; exit 2; }
[ "$COPY" != "$R" ] || { echo "replay: COPY is the repo — refused"; exit 2; }
W="$1"
SPILL=$COPY.spill
rm -rf "$SPILL"

step() { printf '\n######## %s\n' "$*"; }

step m83 Moves
if [ "$W" = "--write" ] && [ -f "$COPY/commons/fixtures/memo/mode/hal/memo.md" ]; then
  mkdir -p "$COPY/commons/fixtures/memo/mode/primer"
  mv "$COPY/commons/fixtures/memo/mode/hal/memo.md" "$COPY/commons/fixtures/memo/mode/primer/magister.md" && rmdir "$COPY/commons/fixtures/memo/mode/hal"
fi
ls "$COPY/commons/fixtures/memo/mode/"

step m96 Q12 REVERSED 10-21 — no move: every mikro class stays in systems/runtime/entities/; every hunk is cut on the runtime path

for spec in \
  "roadmap/m93-kleisli-remonadization.tangle.org|* the tangle" \
  "done/m83-tools-and-primer.tangle.org|** repo — replayed with =--root= the repo (or a copy)" \
  "done/m87-buffer-view-file.org|* deliverables" \
  "done/m88-repling.org|** tangle — one =****= per directory, =*****= per file, =ls= order" \
  "done/m92-keymap.org|* as code — the tangle IS the filesystem (=***= system · =****= directory · =*****= file)" \
  "done/m96-client-mothership.org|* the wiring — as code (moved whole from m95 10-21; rulings m95:68–106 by number)" \
  "done/m96-client-mothership.org|* as code — m96's own hunks (the wiring is above)" \
  "done/m95-depincered-client.org|* as code — the rulings as the hunks they build; =***= system · =****= file" \
; do
  quest=${spec%%|*}; section=${spec#*|}
  step "$quest :: $section :: materialize"
  python3 "$M/materialize.py" "$Q/$quest" "$section" --root "$COPY" --spill "$SPILL" $W
  step "$quest :: $section :: apply-diffs"
  python3 "$M/apply-diffs.py" "$Q/$quest" "$section" --root "$COPY" $W
done

step ORDER deferrals — the three enum names and registry.js bundles ride milestone hosts; a floor baseline restores them, MILESTONE=hosts skips
[ "${MILESTONE:-floor}" = "hosts" ] || python3 "$M/replay-m96.py" --root "$COPY" --after $W
