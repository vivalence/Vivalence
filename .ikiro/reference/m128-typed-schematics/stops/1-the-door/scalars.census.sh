#!/bin/sh
cd /Users/finn/vivalence/code/vivalence || exit 1
D=subsystems/typology/schematics

sites() {
  grep -rnF --include='*.js' -e "$1" "$D" \
    | grep -v "/scalars/" \
    | grep -v "schematics/v.js" \
    | grep -v "schematics/index.js" \
    | grep -v "prototypes/signatures.js" \
    | grep -vE '^[^:]*:[0-9]+:(import|export \{)' \
    | wc -l | tr -d ' '
}

echo "== bare strings"
echo "v.string( $(sites 'v.string(')"
echo "== named scalars, uses"
for name in 'Slug' 'slug(' 'ID' 'Username' 'Password' 'JWTToken' 'v.url(' 'v.mime(' 'v.instant(' 'v.datetime(' 'v.date(' 'v.zoned(' 'v.duration('; do
  echo "$name $(sites "$name")"
done
echo "== signature codecs, uses"
for name in 'Path(' 'FilePath(' 'Url(' 'Signal(' 'Signature(' 'Action(' 'Pattern('; do
  echo "$name $(sites "$name")"
done
echo "== keys holding a bare string, whole"
grep -rhoE '[a-zA-Z_$]+: v\.string\(' "$D" --include='*.js' \
  | sed -E 's/: v\.string\(//' | sort | uniq -c | sort -rn | awk '{printf "%s×%s  ", $2, $1} END {print ""}'
echo "== distinct keys"
grep -rhoE '[a-zA-Z_$]+: v\.string\(' "$D" --include='*.js' | sed -E 's/: v\.string\(//' | sort -u | wc -l | tr -d ' '
