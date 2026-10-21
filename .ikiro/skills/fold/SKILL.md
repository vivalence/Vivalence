---
name: fold
description: >-
  Fold a session into the files that own it — frontier rewritten whole, each live quest's handoff and the code
  beef affirmed, every correction landed in the skill that should have fired, moved names grepped to zero, caps
  checked. No compact file. A correction codeword fires the same procedure mid-session.
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

1. **walk** — every beef turn oldest-first WITH the reply it answered: what he asked (verbatim when it decides) · each fence he affirmed (a lock, skill `drill-me`, or `go`; silence ✗) · landed · died · owed.
2. **corrections** — every `retard` · `i dont understand X` · guard fire · self-caught repeat in the walk → a correction (below), one each.
3. **quest handoffs** — per live quest touched: each affirmed fence's LAST iteration → `* as code` verbatim, replacing the older (skill `quest`, Tangle), his words → `* the dialogue`; unowned → beside the rule it shows. Then `* handoff`: `goal` · `done` · `next` · `never` · `owed`. Outlives it → known issues.
4. **frontier** — rewrite `quests/frontier.md` WHOLE, ≤2000 chars, one line per live quest: `` - `<quest>` — next: <step>; owed: <items> `` (REJECTED 10-24 `next: go`). Re-read it first; it POINTS, the quest holds it.
5. **zero the moved names** — every name deleted · moved · renamed, one pass: `grep -rIEn 'a|b|c' . --exclude-dir={node_modules,bak}` (every text type; REJECTED 10-19 `--include='*.js'`: `chassis.jsx` hid) → zero bar the keep-list; `~/.viva` only if the name reached a shelf. REJECTED 10-12: nine `~/.viva` passes for same-day names (/"are they needed??"/)
6. **caps** — `python3 .ikiro/methods/cap.py`; paste its output.

## a correction — mid-session or at the fold

1. **which skill should have fired?** — its trigger matched and it did not load, or it loaded and its body lacked the rule.
2. **land ≤2 lines there** — in that skill, or `codestyle.md` when no skill owns it. A rule carries its rejection: `REJECTED: x — why`. A missing trigger → the description, not the body.
3. **already written?** — `grep -rn '<the rule>' .ikiro/skills .ikiro/codestyle.md`. A hit = the rule failed twice → propose a hook to beef (he wires it, warn → deny).
4. **execute it now** — redo the failed act under the new line. For `i dont understand X`: name what was missing (codestyle's Decision shape · what he sees vs my internals), then re-explain in that shape.

/"the same goes for i dont understand xyz. mark where you shit explained by my feedback. learn and improve your approach adn formatting of explanations"/

Retracted (/"ok. then i retract the retard."/) → nothing lands. Not corrections: design leans, /"i suspect"/, `wait`. A code defect → known issues.

## siblings — another session is live

- **re-read before write** — `Write` on a file read minutes ago overwrites a sibling. Concurrent edits are canonical.
- **shortest clause** on shared capped files (frontier · `MEMORY.md` · index · codemap); never trim a sibling's line to make room.
- **check the sibling's rulings** — a quest may already rule against what you land.
- **the shelf** — a sibling's repo write leaves `~/.viva/instances/<slug>/` stale (skill `debug`).
- **near a live watcher** — a `rm -rf` or schema rename under `--watch` IS a deploy (`map.md`).

## over cap — consolidate, never evict

A write past `limit: N chars` warns and lands; consolidate it the same turn, one fate per item: **DRAIN** to its owner (frontier → the quest's `* handoff` · `known-issues.org`) · **TRASH** inventory, history, narration, anything a grep answers · **KEEP** only what is in flight and owned by nothing else.

Capture uncommitted text to `~/.viva/bak/ikiro/<slug>-<YYYYMMDD>/` first; re-run `cap.py` after. Nothing is summarized into a second place.
