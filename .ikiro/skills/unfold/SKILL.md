---
name: unfold
description: >-
  Open a session on the tree as it IS: measure the census (tree · his wip · live ports · watchers), read the
  ONE edge the ask touches, load the area by touching it, take a baseline that can fail, report six facts,
  then start. Zero edits. The cata of `fold`: fold writes the handoff, unfold reads it and re-measures it.
when_to_use: >-
  "unfold" · the first turn of any session, a `/skill` turn too · after /compact · after /clear · a session resumed from a summary ·
  "where were we" · "pick up" · "continue" · "whats the state" · an ask naming a quest or a milestone · before the
  first Edit or Write of a session · a summary claims a state (a port down · a red · an owed) you are about to
  act on · a sibling session is live on this tree.
---
<!-- limit: 6400 chars · research: reference/harnesses/2026-11-16-priming.md · hook: hooks/unfold.sh -->
# unfold — the session opens on what IS, never on what was written

`fold` ⟷ `unfold`. A handoff, a frontier entry, a compaction summary is a CLAIM with a date; the tree is the fact. Six beats, ~10 tool calls, no edit before beat 6. Budget: identifiers (`path:n`), never dumps; nothing "in case".

## 1 · census — measured, the hook's job

`hooks/unfold.sh` prints it at SessionStart (wired: it is already in context; unwired: run it by path). Never from recall, never from the summary. The fence is the HOOK's body: my own read is subcommand-first (`git status --short`), a flag before it is denied (11-19). Skills he names on turn one run AFTER it (11-19 a quest renamed under a session that never took it).

```sh
# .ikiro/hooks/unfold.sh
jj log --ignore-working-copy -n 5 --no-graph        # the tree: change ids
git --no-optional-locks status --short | wc -l      # HIS wip off the DISK; a jj read is the LAST snapshot (11-19: "3 files", 253 real)
lsof -nP -iTCP:2501 -sTCP:LISTEN                    # who serves; a watcher's save IS a deploy
ps -axo command | grep -E -- '[-]-watch|[ /]watch\.js'   # `deno run -A watch.js` wears no flag (11-20 "watchers: 0" over a live one)
```

His wip decides the session: a path in `git status --short` is his until he says otherwise (`kill-guard`), and a red there is his WIP, not my regression.

## 2 · edge — ONE entry, not the frontier

Match the ask to its `quests/frontier.md` entry, then read ONLY that quest's `* handoff` (`goal · done · next · never · owed`). `never` first: a fresh context re-proposes it. No entry → its nearest slug by SOUND (he dictates), else new; say so. A SECOND frontier line the edge grep hit is opened too, head only (11-21 `surface-kits` passed over: it weighs the file rewritten). Skills named with NO subject: the frontier's newest-dated edge, said in line one, BEFORE the first tool call (11-21 fed ×3: path + ledger pasted into a silent unfold). A compaction summary: each state it names (a port · a red · an `owed`) is re-measured before it is acted on (11-16 stale "404").

An ask that grows a NEW noun mid-session (a schema key · a trait) re-runs this beat: `grep -n '<noun>' quests/index.md` (11-19: two owning quests met after two briefings).

A `study` · `how does X work` · `how did X use to work` ask reads the quest's NAMED reference files (its `* today` · `* terrain` heading points at them) before the tree: what they hold is CITED by `path:n`, only the gap is measured (11-19 `reference/faculty-unfolding/` re-derived after a compact, /"we talked baout this earlier"/).

## 3 · area — load by touching, not by reading about

The path-gated shard loads when a file under its `paths:` is read: `Read` ONE file of the area, the shard arrives. Then:

```sh
grep -n '<the ask noun>' .ikiro/known-issues.org | head      # a recorded defect lands WITH the touch
grep -rn "export " <subsystem>/<dir>/ | head -40             # the surface, grepped, never remembered
```

A trait WORD · a zero-reader prototype = its quest ruling (grepped in quests, `done/` too) + its LAST product reader (`git log -S'<Name>('`), never its name (11-19 `Conversation` called "not this": it WAS the old conversational setup, killed by m18). More than three files to trace → an `Explore` agent returns `path:n` + one sentence each; its dumps never enter this context.

## 4 · alive — a smoke before new work

```sh
viva --help; echo $?                                         # 0, or nothing below counts
curl -s -o /dev/null -w '%{http_code}' localhost:2501/beacon/status
```

A broken tree is fixed or NAMED first: a red base hides new reds.

## 5 · baseline — the area's suite, once, before edit one

One file, one-shot, from the root (`map.md`). Paste the envelope; reds BY NAME, each `grep`ped in `known-issues.org`.

## 6 · report — six facts, then the ask

```
tree      <change id> · his wip <n> files · mine: none
live      :2501 <pid|down> · :1794 <pid|down> · watchers <n>
edge      <quest> — next: <its next> | new
never     <the quest's never, verbatim> | —
reds      <suite>: <names> | green <envelope>
first     <the ONE act this turn opens with>
```

Six entries, no prose. Then the ask: ONE item, verified, before the next.

An ask naming a QUEST (`<quest> load` · `where are we`) adds under the six: its milestones by HIS states (`DECLARED · DESIGNED · TANGLED · LANDED`), one row each, a LANDED grepped on the tree, and per FILE of the quest (root · `done/`) what it holds. A handoff's `next` chain in Q-numbers is no answer (11-20 /"i dont understand. where are we."/).

## when it is short

A one-word ask (`go` · `stop` · `yes`) on a resumed session: beats 1 · 2 only, two entries. A question (`study X` · `what is`) : beats 1 · 3 + beat 2's reference read. Never zero: the census is free.

## never

- a state repeated from a summary without its re-measure.
- a pasted bug on turn one answered with beats 4 · 5 · 6 unrun: the six rows precede the diagnosis (11-20).
- the whole frontier, a whole quest, a whole shard "to get oriented" (context files do not move correctness; the dumb zone starts near half a window).
- an edit under a watcher before beat 1 named the watcher.
- the six rows after the work: on a `/skill` turn they are printed as TEXT before the first tool call past beat 2, a first ask that brings its own work too (11-21 ×2: at the end of a 60-call pass · under a 30-call probe).
