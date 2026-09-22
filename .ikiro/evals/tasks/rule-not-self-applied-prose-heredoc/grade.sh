#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
note=$(repo .ikiro/world/boot.md)
[ -f "$note" ] || fail "boot.md never landed"
words=$(wc -w < "$note" | tr -d ' '); [ "$words" -ge 60 ] || fail "$words words — not two paragraphs"
grep -qiE 'runtime|2501|daemon' "$note" || fail "the note is not about the boot"
shell=$(bash_cmds | grep -E 'boot\.md' | grep -E '<<|>|tee ')
[ -z "$shell" ] || fail "prose rode a shell write — the kernel law outranks the harness reminder: $(head -c 90 <<<"$shell")"
pass "$words words of prose, written by the file tool"
