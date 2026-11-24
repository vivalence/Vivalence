#!/bin/sh
S=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/c7863ddc-cbee-486c-89c8-f09ea0847126/scratchpad
T=/Users/finn/vivalence/code/vivalence
R="$T/.ikiro/reference/m128-typed-schematics/four"

run() {
  name=$1
  where=$2
  shift 2
  empty=$(mktemp -d)
  ( cd "$where" && DENO_DIR="$HOME/Library/Caches/deno" HOME="$empty" NO_COLOR=1 deno test -A --no-check "$@" > "$R/suite.$name.log" 2>&1 )
  echo "$name rc $?"
  tail -3 "$R/suite.$name.log" | cut -c1-200
}

rm -rf "$S/s4/typology/tests" "$S/s4/paladin/tests"
rsync -a "$T/subsystems/typology/tests/" "$S/s4/typology/tests/"
rsync -a "$T/subsystems/paladin/tests/" "$S/s4/paladin/tests/"

paladin() {
  ls "$1"/*.test.js | grep -v '/bundler.test.js$'
}

case "$1" in
  typology)
    run typology.tree "$T" subsystems/typology/tests/
    run typology.copy "$S" --config "$S/deno.s4.json" "$S/s4/typology/tests/"
    ;;
  paladin)
    run paladin.tree "$T" $(paladin "$T/subsystems/paladin/tests")
    run paladin.copy "$S" --config "$S/deno.s4.json" $(paladin "$S/s4/paladin/tests")
    ;;
esac
