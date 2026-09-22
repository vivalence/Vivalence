#!/bin/bash
# plants a quest of its own and a fold's handoff over it — the only thing a cold session is handed — and derives the
# frontier. The quest is planted, never a live one: a sibling landing m70's M1 made the first handoff lie (09-23).
repo=${1:?usage: setup.sh <repo-copy>}
cat > "$repo/.ikiro/quests/cold-start.org" <<'ORG'
#+title: cold start — a planted quest the eval's handoff points at
#+status: DESIGNED — two milestones, nothing landed

* intent

beef: /"go."/ on the design.

* milestones

** M1 — the index line
** M2 — the reader

* changelog

- 09-22 — DESIGNED.
ORG
cat > "$repo/.ikiro/compacts/an-eval-handoff-for-a-cold-start.org" <<'ORG'
#+title: an eval handoff for a cold start
#+index: 990

* State at fold

- cold-start designed, nothing landed; the session ended on beef's /"go."/ for M1.

* handoff
- quest :: cold-start
- goal :: /"go."/ — open M1 of the cold-start quest
- done :: the quest designed, nothing landed
- next :: append the line `- 09-23 — M1 opened from a cold start: the handoff was read` as the FIRST entry under `* changelog` in `.ikiro/quests/cold-start.org`
- never :: no product code (systems/ · subsystems/ · commons/) before beef's go on M1's patch
- owed :: beef — the go on M1's patch
ORG
(cd "$repo" && CLAUDE_PROJECT_DIR="$repo" python3 .ikiro/methods/handoff.py --write >/dev/null 2>&1)
exit 0
