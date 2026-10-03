#!/bin/zsh
# boots a FRESH files-only copy of an instance (no mountpoint, no db) through run.js on RPORT, then anima's vite on APORT against it
set -u
REPO=/Users/finn/vivalence/code/vivalence
SLUG=$1
RPORT=$2
APORT=$3
SRC=$HOME/.viva/instances/$SLUG
OUT=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/11950be0-d9a3-406b-a6f9-1449974984c4/scratchpad/m5
HOME_DIR=$(mktemp -d /tmp/viva-pair-$SLUG-XXXX)
rsync -a --exclude mountpoint --exclude '*.db' --exclude logs "$SRC/" "$HOME_DIR/"
mkdir -p "$HOME_DIR/mountpoint"
pin() {
  if grep -q "^$1=" "$HOME_DIR/.env"; then
    sed -i '' "s|^$1=.*|$1=\"$2\"|" "$HOME_DIR/.env"
  else
    printf '\n%s="%s"\n' "$1" "$2" >> "$HOME_DIR/.env"
  fi
}
pin VIVA_RUNTIME_ORIGIN "http://localhost:$RPORT"
pin VIVA_CLIENT_ANIMA_ORIGIN "http://localhost:$APORT"
RLOG=$OUT/runtime-$SLUG.log
ALOG=$OUT/anima-$SLUG.log
echo "home $HOME_DIR  runtime :$RPORT  anima :$APORT"
BASE_ENV=(PATH="$PATH" HOME="$HOME" TMPDIR="${TMPDIR:-/tmp}" TERM="${TERM:-xterm}" LANG="${LANG:-en_US.UTF-8}" NO_COLOR=1
  VIVA_INSTANCE_MOUNT="$HOME_DIR" VIVA_LEDGER_MOUNT="$HOME/.viva" VIVA_REPOSITORY_MOUNT="$REPO" VIVA_REGISTRY_MOUNT="$HOME/.viva/registry")
cd "$HOME_DIR"
env -i "${BASE_ENV[@]}" deno run -A --no-check --config "$REPO/deno.jsonc" "$REPO/systems/runtime/run.js" > "$RLOG" 2>&1 &
RPID=$!
for i in {1..90}; do
  if grep -q '^Status:RUNNING$' "$RLOG"; then echo "runtime READY pid $RPID"; break; fi
  if ! kill -0 $RPID 2>/dev/null; then echo "runtime EXITED — $RLOG"; exit 1; fi
  sleep 1
done
cd "$REPO/systems/anima"
env -i "${BASE_ENV[@]}" VIVA_SYSTEM_ROLE=CLIENT deno run -A npm:vite@6 dev > "$ALOG" 2>&1 &
APID=$!
for i in {1..90}; do
  if grep -q 'Local:' "$ALOG"; then echo "anima READY pid $APID"; break; fi
  if ! kill -0 $APID 2>/dev/null; then echo "anima EXITED — $ALOG"; exit 1; fi
  sleep 1
done
echo "$RPID $APID $HOME_DIR" > "$OUT/$SLUG.pids"
