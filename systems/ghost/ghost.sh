#!/bin/sh

ENV="${XDG_CONFIG_HOME:-$HOME/.config}/viva/env"
[ -f "$ENV" ] && . "$ENV"

# the shell that INVOKED viva owns the session. $$ here is this script's own pid — fresh on every
# invocation, so a selection written under it could never be read back. the invoker is our parent.
VIVA_PROCESS_ID="${VIVA_PROCESS_ID:-$PPID}"
export VIVA_PROCESS_ID

exec deno run --config "$VIVA_REPOSITORY_MOUNT/deno.jsonc" -A "$VIVA_REPOSITORY_MOUNT/systems/ghost/mod.js" "$@"
