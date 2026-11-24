#!/bin/sh
set -eu

REPO="${1:-$(pwd)}"
CONFIG="${XDG_CONFIG_HOME:-$HOME/.config}/viva"
ENV="$CONFIG/env"
mkdir -p "$CONFIG"

{ grep -v '^export VIVA_REPOSITORY_MOUNT=' "$ENV" 2>/dev/null || true; echo "export VIVA_REPOSITORY_MOUNT=\"$REPO\""; } > "$ENV.tmp" && mv "$ENV.tmp" "$ENV"
chmod +x "$REPO/systems/ghost/ghost.sh"
ln -sf "$REPO/systems/ghost/ghost.sh" "$HOME/.deno/bin/viva"

cd "$REPO"
deno cache subsystems/sheets/host.js
entry="$(deno eval 'console.log(new URL(import.meta.resolve("@opentui/core")).pathname)')"
target="$(dirname "$entry")/chunk-node-tfvyz31s.js"
grep -q "__opentuiNodeFfi" "$target" || deno eval '
const [target] = Deno.args;
const shim = "globalThis.__opentuiNodeFfi ?? ";
const seams = [
  ["const nodeFfi = ", "requireModule(\"node:ffi\");"],
  ["createNodeBackend2(", "await importModule(\"node:ffi\"))"],
];
let text = Deno.readTextFileSync(target);
for (const [before, after] of seams) {
  const seam = before + after;
  if (text.split(seam).length !== 2) throw new Error(`${target}: ${seam} not found once`);
  text = text.replace(seam, before + shim + after);
}
Deno.writeTextFileSync(target, text);
' "$target"

"${SHELL:-sh}" -lic 'command -v viva' >/dev/null 2>&1 || echo "viva: a fresh shell does not find viva — add to your rc: export PATH=\"\$HOME/.deno/bin:\$PATH\""
echo "viva → $REPO  ·  config: $ENV  ·  opentui core: $target"
