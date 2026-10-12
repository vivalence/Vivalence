#!/bin/sh

ENV="${XDG_CONFIG_HOME:-$HOME/.config}/viva/env"
[ -f "$ENV" ] && . "$ENV"

VIVA_PROCESS_ID="${VIVA_PROCESS_ID:-$PPID}"
export VIVA_PROCESS_ID

exec deno run --config "$VIVA_REPOSITORY_MOUNT/deno.jsonc" -A "$VIVA_REPOSITORY_MOUNT/systems/ghost/run.js" "$@"
