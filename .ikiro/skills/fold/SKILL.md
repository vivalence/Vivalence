---
name: fold
description: >-
  Fold a session into the files that own it — frontier rewritten whole, each live quest's handoff, every
  correction landed in the skill that should have fired, moved names grepped to zero, caps checked. No compact
  file. A correction codeword fires the same procedure mid-session for that one correction.
when_to_use: >-
  "compact" · "fold" · "disintegrate" · "write the compact" · the PreCompact gate printed its refusal · /compact
  is refused by the gate · end of a session · a sibling asks what this session settled · beef writes "retard"
  (verbatim only) · beef writes "i dont understand X" (any spelling) · "log a callout" · a hook denied or warned
  on something you did · the fold's codeword scan · you catch yourself repeating a correction · "mark this in
  ikiro" · "ikiro mark" · another session is live on this tree · a file changed between your read and your
  write · the running app looks a version behind · "wait, that was already fixed" · at every fold · before
  `Write` on frontier.md, MEMORY.md, quests/index.md or a codemap shard · a `rm -rf` near a live watcher ·
  `cap.py` prints OVER · a write warned over its cap · "clean up the frontier thoroughly" · "trash them" ·
  "prune".
---
<!-- limit: 5000 chars -->
# fold — "fold" · "retard" · "i dont understand X": land the session where it belongs

/"one thing thats annoying about the compact ritual is that it has a recency bias. work in a methodology that forces the agent to go message by message and section by section"/ — walk the transcript under `~/.claude/projects/`, never recall.

## the fold — one todo each

1. **walk** — every beef turn oldest-first: what he asked (verbatim when it decides) · landed · died · owed.
2. **corrections** — every `retard` · `i dont understand X` · guard fire · self-caught repeat in the walk → the correction procedure below, one each.
3. **quest handoffs** — per live quest touched, rewrite its `* handoff`: `goal` · `done` · `next` · `never` · `owed`. Outlives the quest → known issues (skill `quest`).
4. **frontier** — rewrite `world/frontier.md` WHOLE, ≤2000 chars, one line per live quest: `` - `<quest>` — next: <step>; owed: <items> ``. Re-read it first; it POINTS, the quest holds detail.
5. **zero the moved names** — every name deleted, moved or renamed this session: `grep -rn '<old>' . ~/.viva --exclude-dir=node_modules --exclude-dir=bak` → zero outside the keep-list; the hit count is the denominator.
6. **caps** — `python3 .ikiro/methods/cap.py`; paste its output.

No compact file is written.

## a correction — mid-session or at the fold

1. **which skill should have fired?** — its trigger matched and it did not load, or it loaded and its body lacked the rule.
2. **land ≤2 lines there** — in that skill, or `self.md` when no skill owns it. A rule carries its rejection: `REJECTED: x — why`. A missing trigger → the description, not the body.
3. **already written?** — `grep -rn '<the rule>' .ikiro/skills .ikiro/self.md`. A hit = the rule failed twice → propose a hook to beef (he wires it, warn → deny).
4. **execute it now** — redo the failed act under the new line. For `i dont understand X`: name what was missing (context · code before · code after · the choice · what he sees vs my internals), then re-explain in that shape.

/"the same goes for i dont understand xyz. mark where you shit explained by my feedback. learn and improve your approach adn formatting of explanations"/

Retracted (/"ok. then i retract the retard."/) → nothing lands. Not corrections: design leans, /"i suspect"/, `wait`. A code defect → known issues.

## siblings — another session is live

- **re-read before write** — `Write` on a file read minutes ago overwrites a sibling. /"Owner flipped, README changed three times, the quest index grew — all under me, all kept, all built on."/ Concurrent edits are canonical.
- **shortest clause** on shared capped files (`world/frontier.md`, `MEMORY.md`, `quests/index.md`, codemap shards); never trim a sibling's line to make room.
- **check the sibling's rulings** — a quest may already rule against what you land.
- **the shelf** — a sibling may have written the repo and left `~/.viva/instances/<slug>/` stale (skill `debug`).
- **near a live watcher** — `ps aux | grep deno` before any `rm -rf` or schema rename under `--watch`; that is a deployment.

## over cap — consolidate, never evict

A write past `limit: N chars` warns and lands; consolidate the file in the same turn. Each item gets one fate:

- **DRAIN** — to its owner (frontier → the quest's `* handoff` or `known-issues.org`).
- **TRASH** — inventory, history, narration, anything a grep answers.
- **KEEP** — only what is in flight and owned by nothing else.

Capture uncommitted text to `~/.viva/bak/ikiro/<slug>-<YYYYMMDD>/` first; re-run `cap.py` after. Nothing is summarized into a second place.
