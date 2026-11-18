#!/bin/sh
# usage: census.sh <copy-root> <label>
C=$1; L=$2; S=$(dirname "$0")
run() { # name dir glob...
  n=$1; d=$2; shift 2
  ( cd "$C/$d" && NO_COLOR=1 DENO_DIR=$HOME/Library/Caches/deno HOME=$(mktemp -d) deno test -A --no-check "$@" > "$S/$L.$n.txt" 2>&1 )
  printf '%-10s %s\n' "$n" "$(grep -E '^(ok|FAILED) \|' "$S/$L.$n.txt" | tail -1)"
}
for s in "$@"; do :; done
case " $3 " in *" paladin "*|"  ") ;; esac
want() { [ -z "$ONLY" ] || echo " $ONLY " | grep -q " $1 "; }
want paladin  && run paladin  subsystems/paladin  'tests/**/*.test.js'
want typology && run typology subsystems/typology 'tests/**/*.test.js'
want runtime  && run runtime  systems/runtime     'tests/**/*.test.js'
want ghost    && run ghost    systems/ghost       'tests/**/*.test.js'
want anima    && run anima    systems/anima       'tests/**/*.test.js'
want commons  && run commons  .                   'commons/**/*.test.js'
want testament && run testament . 'testament/**/*.test.js'
exit 0
