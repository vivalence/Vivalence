#!/bin/sh
# limit: 1200 chars · after the land: every file that differs between HIS live tree and the tested check copy, inside the rename's roots; plus files only one side holds
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
REG=/Users/finn/.viva/registry
X="-x node_modules -x bak -x bak.belt -x build -x dist -x bundle -x .harvest -x .git -x .jj -x snapshots -x mountpoint"
for root in systems subsystems commons documentation/src; do
  diff -rq $X "$BOX/check/$root" "$REPO/$root" 2>&1 | sed "s#$BOX/check/##; s#$REPO/##"
done
for pkg in assembly chess education media vcompany young-ladys-primer; do
  diff -rq $X "$BOX/check-registry/$pkg" "$REG/$pkg" 2>&1 | sed "s#$BOX/check-registry/#@#; s#$REG/#@#"
done
