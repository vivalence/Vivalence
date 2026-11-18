#!/bin/sh
# limit: 1500 chars · every surface hit of the machine (repo · registry · instances · history), per area and token
cd /Users/finn/vivalence/code/vivalence
OUT=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/e098a56c-10b6-4c39-bde7-2c3d73cc534f/scratchpad/m1
mkdir -p "$OUT"
/usr/bin/grep -rnIi \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.jj --exclude-dir=bak \
  --exclude=deno.lock --exclude=*.map \
  'surface' \
  systems subsystems commons documentation testament .claude .ikiro \
  "$HOME/.viva/registry" "$HOME/.viva/instances" \
  > "$OUT/hits.txt"
echo "== total hits"
wc -l < "$OUT/hits.txt"
echo "== per top area"
cut -d: -f1 "$OUT/hits.txt" | sed -E "s#^$HOME/.viva/##" | cut -d/ -f1-2 | sort | uniq -c | sort -rn
echo "== files per area"
cut -d: -f1 "$OUT/hits.txt" | sort -u | sed -E "s#^$HOME/.viva/##" | cut -d/ -f1-2 | sort | uniq -c | sort -rn
echo "== distinct surface tokens"
/usr/bin/grep -ohIiE '[A-Za-z_$.-]*surface[A-Za-z_$-]*' "$OUT/hits.txt" | sort | uniq -c | sort -rn
echo "== file names / dir names carrying surface"
find systems subsystems commons documentation "$HOME/.viva/registry" "$HOME/.viva/instances" -iname '*surface*' -not -path '*/node_modules/*' -not -path '*/bak/*'
