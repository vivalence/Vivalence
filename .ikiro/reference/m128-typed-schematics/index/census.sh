#!/bin/sh
cd /Users/finn/vivalence/code/vivalence
S=subsystems/typology
cnt() { find "$1" -type f -name "$2" -not -path '*/node_modules/*' -not -path '*/bak/*' -not -path '*/.svelte-kit/*' -not -path '*/dist/*' -not -path '*/build/*' 2>/dev/null | wc -l | tr -d ' '; }
echo "dir | js | ts | d.ts | svelte | jsx"
for d in $S/schematics/scalars $S/schematics/primitives $S/schematics/entities $S/schematics/prototypes $S/schematics/traits $S/prototypes $S/entities $S/gestalten subsystems/paladin subsystems/dapper subsystems/drapes subsystems/sheets systems/runtime systems/ghost systems/anima commons "$HOME/.viva/registry"; do
  echo "$d | $(cnt $d '*.js') | $(( $(cnt $d '*.ts') - $(cnt $d '*.d.ts') )) | $(cnt $d '*.d.ts') | $(cnt $d '*.svelte') | $(cnt $d '*.jsx')"
done
echo "== exported schematics"
for d in scalars primitives entities prototypes traits; do echo "$d $(grep -hE '^export const [A-Za-z]' $S/schematics/$d/*.[jt]s | wc -l | tr -d ' ')"; done
echo "== bare builders"
grep -rhoE "v\.(string|integer|number|boolean)\(" $S/schematics --include='*.js' --include='*.ts' --exclude-dir=bak | sort | uniq -c
echo "== gestalten"
for d in belt bundle cast fromm is not shape shard steer; do echo "$d $(find $S/gestalten/$d -name '*.js' | wc -l | tr -d ' ')"; done
echo "== vectors"
echo "files $(grep -rlE 'new Vector\(' subsystems systems commons --include='*.js' --include='*.ts' --exclude-dir=node_modules --exclude-dir=bak --exclude-dir=build --exclude-dir=dist --exclude-dir=.svelte-kit | wc -l | tr -d ' ')"
grep -rhoE "\.(open|branch)\(" subsystems systems commons --include='*.js' --exclude-dir=node_modules --exclude-dir=bak --exclude-dir=build --exclude-dir=dist --exclude-dir=.svelte-kit --exclude-dir=tests | sort | uniq -c
echo "beats $(find systems subsystems -path '*/lifecycle/[0-9]-*.[jt]s' -not -path '*/bak/*' -not -path '*/node_modules/*' | wc -l | tr -d ' ')"
echo "traits $(find systems subsystems commons -path '*/traits/*.js' -not -path '*/bak/*' -not -path '*/node_modules/*' -not -path '*/schematics/*' | wc -l | tr -d ' ')"
echo "apertures $(find systems subsystems commons -path '*/apertures/*.js' -not -path '*/bak/*' -not -path '*/node_modules/*' | wc -l | tr -d ' ')"
echo "== tests | snapshot tests"
for d in subsystems/typology subsystems/paladin subsystems/dapper subsystems/drapes subsystems/sheets systems/runtime systems/ghost systems/anima commons; do
  echo "$d $(find $d -name '*.test.js' -not -path '*/node_modules/*' -not -path '*/bak/*' | wc -l | tr -d ' ') $(find $d -name '*.snapshot.test.js' -not -path '*/node_modules/*' -not -path '*/bak/*' | wc -l | tr -d ' ')"
done
