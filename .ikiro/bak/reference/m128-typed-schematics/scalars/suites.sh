#!/bin/sh
# typology's and paladin's suites on the tree and on the copy: sh suites.sh typology|paladin
S=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/c7863ddc-cbee-486c-89c8-f09ea0847126/scratchpad
T=/Users/finn/vivalence/code/vivalence
R="$T/.ikiro/reference/m128-typed-schematics/scalars"

sed -e 's#\./s4/typology/#./s6/subsystems/typology/#' -e 's#\./s4/paladin/#./s6/subsystems/paladin/#' \
  "$S/import_map.s4.json" > "$S/import_map.s6.json"
printf '{\n  "importMap": "./import_map.s6.json",\n  "lock": false\n}\n' > "$S/deno.s6.json"

run() {
  name=$1
  where=$2
  shift 2
  empty=$(mktemp -d)
  ( cd "$where" && DENO_DIR="$HOME/Library/Caches/deno" HOME="$empty" NO_COLOR=1 deno test -A --no-check "$@" > "$R/suite.$name.log" 2>&1 )
  echo "$name rc $?"
  tail -3 "$R/suite.$name.log" | cut -c1-200
}

paladin() {
  ls "$1"/*.test.js | grep -v '/bundler.test.js$'
}

case "$1" in
  typology)
    run typology.tree "$T" subsystems/typology/tests/
    run typology.copy "$S" --config "$S/deno.s6.json" "$S/s6/subsystems/typology/tests/"
    ;;
  paladin)
    run paladin.tree "$T" $(paladin "$T/subsystems/paladin/tests")
    run paladin.copy "$S" --config "$S/deno.s6.json" $(paladin "$S/s6/subsystems/paladin/tests")
    ;;
esac
