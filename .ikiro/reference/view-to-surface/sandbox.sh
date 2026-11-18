#!/bin/sh
# limit: 1200 chars · two clones (pristine · renamed) of the repo minus .git .jj .env*, and of the six registry packages M1 touches
set -e
SRC=/Users/finn/vivalence/code/vivalence
REG=/Users/finn/.viva/registry
BOX=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/e098a56c-10b6-4c39-bde7-2c3d73cc534f/scratchpad/m1box
rm -rf "$BOX"
mkdir -p "$BOX/pristine" "$BOX/renamed" "$BOX/pristine-registry" "$BOX/renamed-registry"
cd "$SRC"
for entry in * .[!.]*; do
  case "$entry" in
    .git|.jj|.env|.env.*) continue ;;
  esac
  cp -cR "$entry" "$BOX/pristine/"
  cp -cR "$entry" "$BOX/renamed/"
done
for pkg in assembly chess education media vcompany young-ladys-primer; do
  rsync -a --exclude .git --exclude .jj "$REG/$pkg/" "$BOX/pristine-registry/$pkg/"
  rsync -a --exclude .git --exclude .jj "$REG/$pkg/" "$BOX/renamed-registry/$pkg/"
done
ls -a "$BOX/renamed" | tr '\n' ' '
echo
ls "$BOX/renamed-registry"
