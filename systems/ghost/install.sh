#!/bin/sh
REPO="${1:-$(pwd)}"
CONFIG="${XDG_CONFIG_HOME:-$HOME/.config}/viva"
ENV="$CONFIG/env"
mkdir -p "$CONFIG"
{ grep -v '^export VIVA_REPOSITORY_MOUNT=' "$ENV" 2>/dev/null; echo "export VIVA_REPOSITORY_MOUNT=\"$REPO\""; } > "$ENV.tmp" && mv "$ENV.tmp" "$ENV"
chmod +x "$REPO/systems/ghost/ghost.sh"
ln -sf "$REPO/systems/ghost/ghost.sh" "$HOME/.deno/bin/viva"
echo "viva → $REPO  ·  config: $ENV"
