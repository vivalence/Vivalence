#!/bin/sh

ENV="${XDG_CONFIG_HOME:-$HOME/.config}/viva/env"
[ -f "$ENV" ] && . "$ENV"

exec deno run --config "$VIVA_REPOSITORY_MOUNT/deno.jsonc" -A "$VIVA_REPOSITORY_MOUNT/systems/ghost/mod.js" "$@"
