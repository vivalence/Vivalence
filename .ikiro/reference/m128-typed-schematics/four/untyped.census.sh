#!/bin/sh
S=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/c7863ddc-cbee-486c-89c8-f09ea0847126/scratchpad
R=/Users/finn/vivalence/code/vivalence/.ikiro/reference/m128-typed-schematics/four
COPY=${1:-s4}
OUT="$R/untyped.$COPY.raw.log"

cd "$S" || exit 1
NO_COLOR=1 deno check --config "$S/deno.$COPY.check.json" \
  "$S/$COPY/paladin/instance/factory.js" \
  "$S/$COPY/paladin/instance/lifecycle/index.js" > "$OUT" 2>&1
echo "deno check rc $?"
grep -c '' "$OUT"
tail -2 "$OUT"

python3 "$R/untyped.py" "$OUT" "$COPY/paladin/instance/"
