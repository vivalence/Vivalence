#!/bin/zsh
# boots a FRESH copy of an instance (files only, .env origin pinned to a free port) through run.js, full log to a file
set -u
REPO=/Users/finn/vivalence/code/vivalence
SLUG=${1:-chess}
PORT=${2:-27601}
SRC=$HOME/.viva/instances/$SLUG
HOME_DIR=$(mktemp -d /tmp/viva-fresh-$SLUG-XXXX)
LOG=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/11950be0-d9a3-406b-a6f9-1449974984c4/scratchpad/m2/boot-$SLUG.log
for f in "$SRC"/*(.N) "$SRC"/.env(.N); do cp "$f" "$HOME_DIR/"; done
if grep -q '^VIVA_RUNTIME_ORIGIN=' "$HOME_DIR/.env"; then
  sed -i '' "s|^VIVA_RUNTIME_ORIGIN=.*|VIVA_RUNTIME_ORIGIN=\"http://localhost:$PORT\"|" "$HOME_DIR/.env"
else
  printf '\nVIVA_RUNTIME_ORIGIN="http://localhost:%s"\n' "$PORT" >> "$HOME_DIR/.env"
fi
echo "home $HOME_DIR  port $PORT  log $LOG"
cd "$HOME_DIR"
env -i PATH="$PATH" HOME="$HOME" TMPDIR="${TMPDIR:-/tmp}" TERM="${TERM:-xterm}" LANG="${LANG:-en_US.UTF-8}" NO_COLOR=1 \
  VIVA_INSTANCE_MOUNT="$HOME_DIR" VIVA_LEDGER_MOUNT="$HOME/.viva" VIVA_REPOSITORY_MOUNT="$REPO" VIVA_REGISTRY_MOUNT="$HOME/.viva/registry" \
  deno run -A --no-check --config "$REPO/deno.jsonc" "$REPO/systems/runtime/run.js" > "$LOG" 2>&1 &
PID=$!
echo "pid $PID"
for i in {1..60}; do
  if grep -q '^Status:RUNNING$' "$LOG"; then echo READY; break; fi
  if ! kill -0 $PID 2>/dev/null; then echo "EXITED"; break; fi
  sleep 1
done
echo "$PID" > "$LOG.pid"
