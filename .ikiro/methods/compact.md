# the compact walk — deriving a compact instead of recalling one

beef: *"one thing thats annoying about the compact ritual is that it has a recency bias. work in a methodology that forces the agent to go message by message and section by section"*

## why the bias exists

A compact written **from context** cannot be even-handed. By fold time the early session has been summarized — or dropped — while the last few turns sit in the window verbatim. So the compact over-weights the end, and the parts most likely to be lost are the ones already hardest to see. Exhortation cannot fix this: "be thorough" is prose, and prose is not enforcement. The fix has to change the INPUT, not the intention.

**Do not recall the session. Read it.** The transcript is on disk at `~/.claude/projects/-Users-finn-vivalence-code-vivalence/<session-id>.jsonl`, complete and unsummarized, and it is uniformly detailed at both ends.

## markers first

Before the extractor, read `.ikiro/compacts/MARKERS.md`. Each OPEN entry is an order beef
gave mid-session and deferred to the fold — settle it in the compact body, then move it to
SETTLED with a one-line verdict. An unsettled marker is a dropped instruction, not a
backlog item.

## the walk

1. **SPINE** — extract every beef turn in order, numbered `1..N`. Never from memory; run `python3 .ikiro/methods/spine.py <session-id>` (pass the id — the scratchpad dir name is it; the newest transcript is a SIBLING's when one is live). `N` is now a fact, and the walk has a denominator. The dedupe compares **full text**, never a prefix: two DesignSync handoffs sent 8s apart shared a 200-char prefix and one was silently eaten, while a queue echo is byte-identical and still collapses. Prefix matching cannot tell a duplicate from a sibling. A re-delivery outside the 180s window survives as its own turn on purpose — beef repeating himself is data.
   **1b. SKILLS** — `python3 .ikiro/methods/skills.py <session-id>` prints every `Skill` firing aligned to the turn it sits under, and the `** skills` table skeleton. Mechanical, like the spine: the transcript holds the firings, so they are read, never recalled — and a fold that recalls them records the skills it *remembers* invoking, which is the same recency bias one level up. Run it here; write the verdicts at step 8, once the walk can say whether the skill carried the turn.
2. **WINDOWS** — walk **oldest first**, ~4 turns per window. Per turn write one row: `n · what beef asked (verbatim when it is a decision, a gate, or a correction) · what landed · what was decided or killed`.
3. **COVERAGE** — every `n` in `1..N` appears in exactly one row. A turn with nothing durable is written `NOTHING`, never skipped in silence. Unaccounted turns > 0 means the walk is not finished. This is the forcing function: the count exists before the writing starts, so a short walk is visibly short rather than plausibly complete.
4. **SECTIONS** — compose section by section (`#+TOPIC` · `* Arc` beats · failures · `* State at fold`), and fill **each section from the whole row table**. Never write the compact top-to-bottom in one pass: a single pass re-imposes narrative order, which is recency order wearing a different hat.
5. **BALANCE** — count which rows each section cites. If more than half the citations fall in the last third of `N`, the bias survived; go back to the rows. This is the measurable test, and it is the difference between a method and a wish.
6. **INDEX** — regenerate `compacts/index.md` (never hand-patch it). A compact nobody can find is not a record: measured once, **32 of 35 were unreachable from live canon**. The check is a count — numbered entries must equal `.org` files in the directory. The `## by tag` fold is RETIRED (beef: *"too much time in updates, not enough payback"*, executed 09-21); `#+filetags:` is no longer required on a compact, and nothing reads it. Ids are the citation key and still stamped once, forever.
7. **QUEST REPORT** — `CLAUDE_SESSION_ID=<this session> python3 .ikiro/methods/quest-report.py --format md --stamp --compact <this compact>`: the five-column table lands as the compact's `* quest report` section and the three derived header keys are restamped on every live quest. Read the `sessions` column before claiming anything about the tree — a live sibling means a shard or an hour-old grep can already be false.
8. **SKILL VERDICTS** — fill the `** skills` organ: one row per firing, `skill · turn · verdict · the line`, verdict from the closed set in `skills/LEDGER.md` (`HELD · GAP · STALE · MISFIRE · MISSED`). Then add the **MISSED** rows — a turn that needed a skill and got none, including a name reached for that did not resolve. Append every non-`HELD` row to `skills/LEDGER.md`; the compact is the citation, the ledger is the store, because compacts are prunable and a skill corpus kept only in them dies with the next cut. The verdict is on what the skill DID for the turn, not on how it read.
9. **SETTLEMENT** — then the scribe pass: loose ends resolved by a landed rule get FIXED in the compact turn, budgets checked in chars, date-scan before writing.

## the handoff — how a compact ENDS

/"You're better off with a handoff file and using clear"/ (`reference/harnesses/harness.md` §9.5.5, R #11) — a
summary is read as history, a handoff is read as orders. Every compact ends in `* handoff`, one block per quest the
session moved, org description lines, keys repeatable:

```org
* handoff
- quest :: m67-assembly-ontology
- goal :: /"one number settles the centring"/ — the motor_2 translation off the network pane
- done :: `modes/editor/assembly/buffer/fold.js:88` lanes fold by joint; `deno test … tests/fold.test.js` → ok | 7 passed
- next :: `curl -s :2501/daemon/assembly/resolve | jq '.motor_2'` and compare to the pane
- never :: no auto-selection in a fresh buffer (/"no fucking default"/)
- owed :: beef — the navigation standard · the commit
```

A block with no `quest` line is session-level (`none`): one per compact, live until a later handoff closes it with
`- settles :: #<index>` — two sessions' owed items never evict each other. `world/frontier.md` is then DERIVED, never written:
`python3 .ikiro/methods/handoff.py --write`, and `--check` must read byte-identical. The next session reads
`handoff.py --latest` first. `next` is ONE step a fresh session can land cold; a `never` carries beef's ruling
verbatim; `owed` names what only beef can give.

## the extractor

`python3 .ikiro/methods/spine.py <session-id>` — the body of that script IS the spec (it lived here as a pasted block until 09-22; the one method whose thesis is "prose is not enforcement" shipped its enforcement as a block to hand-paste every fold). Prints `BEEF TURNS: N (raw R, D queue duplicates collapsed)` then one numbered row per turn, MID-TURN marked, the TAIL of long turns shown.

## the index generator

`python3 .ikiro/methods/compact-index.py` — regenerates `compacts/index.md`; the body of that script IS the spec (it used to live here as a pasted block, and a pasted block is DERIVED prose inside an authored file: the fold that lost nine entries had no runnable generator). The check after regeneration is the script's own last line: compacts · ids stamped.

## the skills reader

`python3 .ikiro/methods/skills.py <session-id>` — the body IS the spec. Reads `tool_use` blocks named `Skill` out of the same transcript, aligns each to the beef turn it sits under (by importing `spine`, never by re-deriving the numbering), and marks the ones whose `is_error` result says the name did not resolve. `--fold` is the board over all 135 transcripts crossed with `skills/LEDGER.md`: firings · sessions · notes by verdict · never-fired · **names that were reached for and do not exist** — `ikiro-compact` and `ikiro:compact` both reached for within three days of each other, which is the trigger surface saying the fold skill is not called what the hand types.

## the canon path audit (world-sync step)

A **lead generator, never a verdict** — the same status the kernel gives a codemap claim. It flags container-rooted paths that live canon asserts as CURRENT but that do not exist on disk. Measured baseline: **56 raw → 25 after the three skip classes**, and the skips are what make it survivable.

An earlier general path-existence checker was built, measured at 7 false positives on a clean tree, and BINNED — correctly, because canon legitimately names things that are gone. The difference here is that the three reasons it legitimately does so are now classified rather than tripped over:

- **RECORDS assert the past, not the present.** `zettelkasten.md` (append-only Callouts), `loop-backlog.md`, `known-issues.org`, and everything under `compacts/` are out of scope by construction. A ledger entry describing a path that was wrong IS the record working.
- **Context marks it gone.** `emigrated · deleted · renamed · no longer · dead · slop · moved · superseded · gone · left · old`. Missing `gone` alone produced a false positive on `world/codemap/paladin.md`, on a line reading *"is GONE from every Dockerfile"* — the checker flagged the sentence that had already done its job.
- **A prefix that is not repo-rooted is not a lead at all.** Measured at one fold: 94 raw leads, of which
  **59 began `registry/`** — a directory that does not exist at the repo root at all. It went to `commons/`
  at m47, and in live canon `registry/...` overwhelmingly names the INSTANCE, `~/.viva/registry/`, which the
  container-rooted-paths law writes exactly that way. Every one of the 59 was noise. `docs/` was dead the
  same way — the tree has `documentation/`. The regex above now matches `commons` and drops both, taking the
  sweep from 94 to 35 and back inside the survivable band. Adding a prefix to that alternation without first
  checking it resolves from the repo root re-poisons the whole audit: a lead generator at 88% noise is read
  as broken and then ignored, which is worse than not running it.
- **Design that was never built.** `sketch · dormant · DESIGNED · planned · proposed · WITHDRAWN · deferred · parked`, plus a file-wide trip at 3+ such markers. `project_longdistance_audio_sketch` is seven paths of scaffolding that deliberately does not exist.

Suggest a successor only at **suffix depth ≥3, unique at that depth**. A unique BASENAME match is not identity — it proposed `systems/runtime/daemon/entities.js` → `registry/viva/lighthouse/multiplayer/server/entities.js`, and `daemon/kernel.js` → `schematics/primitives/kernel.js`. A wrong repoint is worse than a stale path: it reads as freshly verified.

`python3 .ikiro/methods/canon-paths.py` — the body IS the spec; the skip classes above are its constants.

## three traps, all hit while building this

- **Mid-turn interjections are `type: "queue-operation"`, not `user`.** A walk over `user` messages misses them entirely — and in the session that produced this method, the two most consequential instructions were both mid-turn (*"can you add a hook to /compact?"* and *"kill it. move the meta information about how to rebuild the history into m31 root"*). A compact built from a `user`-only walk would have recorded neither, while still looking complete. This is a SECOND bias, sharper than recency: whole instructions are structurally invisible.
- **Dedupe must be time-windowed, never content-keyed.** Each queued message appears twice (~20 s apart). Keying on content alone collapsed five identical cron-fired prompts into one and cut a 12-turn session to 8 — the naive fix silently deleted four iterations of work. Match on content **within 180 s**.
- **A quoted turn's payload is its TAIL.** beef often pastes my own text back with the instruction appended — *"…deletion isn't git-reversible — the kernel's* **which 372k?**" and *"…5,333 lines git: A* **kill it.**". The quoted block is the address; the last clause is the order. Reading such a turn as a comment on my text, rather than as an instruction, loses the instruction.

- **A mid-turn message can be missing from the transcript entirely.** A message beef sent while a tool ran — with a screenshot, delivered inside the tool result as *"The user sent a new message while you were working"* — left NO row in the `.jsonl`: no `user`, no `queue-operation`, no text to grep. Its only traces were beef's next turn (*"Ignore the chess message."*) and the assistant's reply. When a turn in the spine answers something the spine does not hold, that is evidence of a lost turn: log it as a dash row between its neighbours, from the reply and the answer, and say it is not in the transcript.

## the denominator is the point

Every failure this method prevents has the same shape: the walk looked done because nothing said how much there was. `N` first, rows second, prose last.
