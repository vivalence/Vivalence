#!/bin/sh
# limit: 1500 chars · every identifier form holding `view`, counted per root: hits · files. $1 = repo root, $2 = registry root
REPO=${1:-/Users/finn/vivalence/code/vivalence}
REGISTRY=${2:-$HOME/.viva/registry}
FORM='[A-Za-z_$][A-Za-z0-9_$]*[Vv][Ii][Ee][Ww][A-Za-z0-9_$]*|[Vv][Ii][Ee][Ww][A-Za-z0-9_$]*'

scan() {
  /usr/bin/grep -rIoE "$FORM" "$@" \
    --exclude-dir=node_modules --exclude-dir=bak --exclude-dir=dist --exclude-dir=.astro \
    --exclude-dir=icons --exclude-dir=.git --exclude-dir=.jj --exclude-dir=bundle --exclude-dir=vendor \
    --exclude='*.svg' --exclude='*.lock' --exclude='*.map' --exclude='*.min.js'
}

report() {
  name=$1; shift
  echo "== $name"
  scan "$@" > /tmp/forms.$$
  echo "hits $(wc -l < /tmp/forms.$$ | tr -d ' ') · files $(cut -d: -f1 /tmp/forms.$$ | sort -u | wc -l | tr -d ' ')"
  awk -F: '{print $NF}' /tmp/forms.$$ | sort | uniq -c | sort -rn
  rm -f /tmp/forms.$$
}

cd "$REPO" || exit 1
report typology subsystems/typology
report paladin subsystems/paladin
report runtime systems/runtime
report ghost systems/ghost
report anima systems/anima
report design subsystems/dapper subsystems/drapes subsystems/sheets
report commons commons
report docs documentation/src
report testament testament
report registry "$REGISTRY"
