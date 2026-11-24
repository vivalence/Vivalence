#!/bin/sh
# replay — land the channel-media quest on a COPY, one milestone at a time. Never on the repo.
#   sh .ikiro/reference/channel-media/replay.sh <copy> [1|2|3|4|6|7]   (no number: 1 2 3 4 6, in order) · 5 and 7r take a copy of ~/.viva/registry
set -e
here=/Users/finn/vivalence/code/vivalence/.ikiro
copy=${1:?a copy of the tree}
quest=$here/quests/channel-media-appendix-I-diffs.org
second=$here/quests/channel-media-appendix-II-diffs.org
third=$here/quests/channel-media-appendix-III-diffs.org
one() { python3 $here/methods/apply-diffs.py ${2:-$quest} "$1" --write --root $copy | tail -1; }
born() { for file in "$@"; do mkdir -p "$copy/$(dirname $file)"; cp "$here/reference/channel-media/new/$file" "$copy/$file"; done; }
for step in ${2:-1 2 3 4 6}; do
  case $step in
    1) born subsystems/typology/tests/schematics/channels.test.js
       one "* milestone 1 — the grammar" ;;
    2) born subsystems/typology/gestalten/belt/channel.js subsystems/typology/tests/gestalten/belt/channel.test.js
       one "* milestone 2 — match · lower · take · give" ;;
    3) one "* milestones 3 · 4 — held in, held out" ;;
    4) born systems/runtime/tests/harness.filing.test.js
       one "* milestone 4b — filing on every route that passes turns" ;;
    5) one "* milestone 5 — the registry fixtures follow" $second ;;
    6) one "* milestone 6 — a packet carries its media type" $second ;;
    7) one "* milestone 7 — a render is turns in, a turn out" $third ;;
    7r) one "* milestone 7 — the registry caller follows" $third ;;
  esac
done
