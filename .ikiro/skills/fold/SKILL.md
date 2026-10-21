---
name: fold
description: >-
  Fold a session into its owners — frontier rewritten whole, each live quest's handoff + the code beef
  affirmed, each correction landed in the skill that should have fired, moved names grepped to zero, caps
  checked. No compact file; a correction codeword fires it mid-session.
when_to_use: >-
  "compact" · "fold" · "disintegrate" · "write the compact" · the PreCompact gate refuses /compact · end of a
  session · a sibling asks what this session settled · "retard" (verbatim only) · "i dont understand X" (any
  spelling) · "log a callout" · a hook denied or warned you · you catch yourself repeating a correction · "mark
  this in ikiro" · "ikiro mark" · another session is live on this tree · a file changed between your read and
  your write · the running app looks a version behind · "wait, that was already fixed" · before `Write` on
  frontier.md, MEMORY.md, quests/index.md or a codemap shard · a `rm -rf` near a live watcher · `cap.py` prints
  OVER · a write warned over its cap · "clean up the frontier thoroughly" · "trash them" · "prune".
---
<!-- limit: 5000 chars -->
# fold — land the session where it belongs: his words AND the code he affirmed

/"one thing thats annoying about the compact ritual is that it has a recency bias. work in a methodology that forces the agent to go message by message and section by section"/ — walk the transcript, never recall. /"not only My yap but also the code snippets … That I have affirmed, confirmed, that are the latest state of the iterations"/

## the fold — one todo each

1. **walk** — THIS session's `<scratchpad dir>.jsonl`, never the newest; harness rows (skill body · summary) = NOTHING. Each beef turn oldest-first WITH the reply it answers: his words VERBATIM, only code he quotes trimmed · each fence he affirmed (a lock, `drill-me`, `go`; silence ✗) · landed · died · owed — measured THAT turn (`git status --short` per container · grep), never recalled.
2. **corrections** — every `retard` · `i dont understand X` · guard fire · self-caught repeat · his silent edits (`jj diff -r @`) → a correction (below), one each.
3. **quest handoffs** — per live quest touched: each affirmed fence's LAST iteration → `* as code` verbatim, replacing the older (skill `quest`, Tangle), his words → `* the dialogue`; unowned → beside the rule it shows. Then `* handoff`: `goal` · `done` · `next` · `never` · `owed`. Outlives it → known issues.
4. **frontier** — rewrite `quests/frontier.md` WHOLE, ≤2000 chars, one line per live quest: `` - `<quest>` — next: <step>; owed: <items> `` (REJECTED 10-24 `next: go`). Re-read it first; it POINTS, the quest holds it.
5. **zero the moved names** — every name deleted · moved · renamed, one pass: `grep -rIEn 'a|b|c' . --exclude-dir={node_modules,bak}` (every text type; REJECTED 10-19 `--include='*.js'`: `chassis.jsx` hid) → zero bar the keep-list; `~/.viva` only if the name reached a shelf. REJECTED 10-12: nine `~/.viva` passes for same-day names (/"are they needed??"/)
6. **caps** — `python3 .ikiro/methods/cap.py`; paste its output.

## a correction — mid-session or at the fold

1. **which skill should have fired?** — trigger matched, never loaded, or body lacked the rule.
2. **land ≤2 lines there** — that skill, else `codestyle.md`; with its `REJECTED: x — why`. A missing trigger → the description.
3. **already written?** — `grep -rn '<the rule>' .ikiro/skills .ikiro/codestyle.md`. A hit = failed twice → propose a hook (he wires it, warn → deny).
4. **execute it now** — redo the act under the new line; `i dont understand X`: name what was missing (codestyle's Decision shape · what he sees vs my internals), re-explain in it.

/"the same goes for i dont understand xyz. mark where you shit explained by my feedback. learn and improve your approach adn formatting of explanations"/

Retracted (/"ok. then i retract the retard."/) → nothing lands. Not corrections: design leans, /"i suspect"/, `wait`. A code defect → known issues.

## siblings — another session is live

- **re-read before write** — a `Write` on a minutes-old read overwrites a sibling; concurrent edits are canonical.
- **shortest clause** on shared capped files (frontier · `MEMORY.md` · index · codemap); never trim a sibling's line.
- **check the sibling's rulings** — a quest may already rule against what you land.
- **the shelf** — a sibling's repo write leaves `~/.viva/instances/<slug>/` stale (skill `debug`).
- **near a live watcher** — a `rm -rf` or schema rename under `--watch` IS a deploy (`map.md`).

## over cap — consolidate, never evict

A write past `limit: N chars` warns and lands; consolidate same turn, one fate each: **DRAIN** to its owner (frontier → the quest's `* handoff` · `known-issues.org`) · **TRASH** inventory, history, narration, anything a grep answers · **KEEP** only what is in flight and unowned.

Capture uncommitted text to `~/.viva/bak/ikiro/<slug>-<YYYYMMDD>/` first; re-run `cap.py` after. Nothing is summarized into a second place.
