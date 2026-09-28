# Skills ledger — what a skill did for the turn it fired on
<!-- writer: agent · kind: ledger -->

> **Append-only.** One line per note, never edited, never closed by me — same discipline as
> `zettelkasten.md ## Callouts`, and for the same reason: the board over it is derived and rewritten
> whole, so the entries have to be the thing that cannot move. Closure comes from an amendment landed
> at a flywheel (step 6), recorded as a new line, or from beef.
>
> **Written at the fold, not in the turn.** `python3 .ikiro/methods/skills.py <session-id>` reads the
> firings out of the transcript — that half is mechanical. The verdict is the judgment, and it is
> written once the session is walked, so it is a verdict on what the skill *did*, not on how it felt
> while reading it.
>
> **This file is the store; the compact's `** skills` organ is the citation.** Compacts are prunable
> (119 → 8 in the 20% cut, which silently made every compact-denominated clock unreachable). A skill
> corpus that lives only in compacts dies the same way.

## the line

```
- MM-DD `<skill>` VERDICT — what happened, in one line · #<compact-id>
```

`skills.py` parses exactly that shape, plus the compact's `** skills` table row pasted whole
(`| skill | where | VERDICT | line |`, stamped with the file's day). A line it cannot parse is not in the board.

An amendment landed at a flywheel is its own line, and it CLOSES every earlier open note of that skill
and verdict — the board's verdict cells count open notes only:

```
- MM-DD AMENDED `<skill>` (VERDICT) — what changed in the skill · flywheel MM-DD
```

## the five verdicts — closed set, LOCKED 09-22 (beef: *"go"*)

Taxonomy is beef's, always ([[ontology]]). These five were proposed on 09-22 with the loop and
amen'd in one word. A sixth is not added by me; a verdict that fits none of them is written as the
closest one plus the sentence that did not fit, and the gap goes to him.

| verdict | means | the line owes |
|---|---|---|
| `HELD` | fired, carried the turn, nothing missing | nothing — one line, no amendment |
| `GAP` | right skill, and a beat the turn needed was not in it | the beat, in the words the turn needed |
| `STALE` | it asserted something the disk or the practice contradicts | the correction, measured |
| `MISFIRE` | it fired and was the wrong skill for this turn | which skill was right |
| `MISSED` | nothing fired and something should have — including a name reached for that did not resolve | the skill name, or `none exists` |

`GAP` and `STALE` are about the BODY. `MISFIRE` and `MISSED` are about the TRIGGER SURFACE
(`description` + `when_to_use`) — never fix a missed trigger by adding body, that is the move that
makes a skill long and still unfindable.

`HELD` is filed too. Without it the board only counts complaints, and a skill with three GAPs out of
three firings reads identical to one with three out of thirty.

## Notes

Seeded 09-22 from `skills.py --fold` over all 135 transcripts — the only notes that can be written
backwards, because they are mechanical: a name was reached for and the harness answered that it does
not exist. Every later line is a judgment written at a fold.

All three predate the skill they name. Checked, not assumed: `compact-walk` and `design-handoff` are
both staged-new on 09-22, so on 09-19 and 08-30 there was nothing to find under any spelling. The
first draft of these lines read them as naming defects — wrong, and the wrong reading is the more
flattering one, because it makes the fix a rename instead of a gap.

**So `NAMES THAT DID NOT RESOLVE` is a proposal channel before it is a rename channel.** A name
reached for that resolves to nothing is a skill the hand already expects to exist; twice, it named
one that was later built anyway, from a different route and three days late.

- 09-19 `compact-walk` MISSED — reached for as `ikiro-compact` when no fold skill existed; built 09-22 · board 09-22
- 09-21 `compact-walk` MISSED — reached for again as `ikiro:compact`, two days later, still nothing on disk; built the next day · board 09-22
- 08-30 `design-handoff` MISSED — reached for as `design-login`, three weeks before any design skill existed; built 09-22 · board 09-22
- 09-22 `debugging` HELD — not a note on a firing: the question the first board raised, settled. `superpowers:systematic-debugging` fired 20x (4 in 08, 16 in 09) against this skill's 0, which reads as a dead trigger and is not one — it was written 09-22 and its own canon line already names systematic-debugging as the general discipline it follows. Process skill and domain skill COMPOSE; the zero is age. Re-read at the first board where this skill shows `QUIET`, not `NEWBORN` · board 09-22


| (none) | edafd0fa/189 | MISSED | a live walk in beef's anima has no exit step — no skill says delete the thread and buffers you spawned; the residue was met as a default (compact #195) |
| (none) | edafd0fa/196 | MISSED | `mode-development` did not fire on /"this is a big task"/ — a whole mode rebuilt, nineteen files. Its own canon line (an `$effect` fix is proven by mounting it, not compiling it) is the law broken twice in that rebuild |
| (none) | edafd0fa/196 | MISSED | `testing` did not fire; the pre-DONE gate was satisfied by habit and the standing COVERAGE GAP — nothing MOUNTS a view of this package in a suite — went unnamed while two mount-time defects shipped |
| (none) | edafd0fa/199 | MISSED | `debugging` / `systematic-debugging` did not fire on a reported VISUAL defect; three passes of reasoning from source, then one measurement ended it. A screenshot is a bug report and should arm the debugging trigger |
| (none) | edafd0fa/202 | MISSED | no skill says /a second report of something you called unreproducible is evidence about your verdict/; the answer was in the compacts and beef had to point at them |
| (none) | fc59f22c/63 | MISSED | `callout` names /"mark this in ikiro"/ as a trigger and did not fire on beef's spelling /"Ikiro mark"/; the marking landed by hand in three canon files — the trigger surface gains his spelling |
| (none) | fc59f22c/65 | MISSED | `capture-before-delete` did not fire on /"remove the trait"/ under `~/.viva/registry/vcompany` (no VCS); the capture happened by habit, four files to `~/.viva/bak/` |
| (none) | fc59f22c/66 | MISSED | `callout` did not fire on /"i dont understand 13"/ — no trigger existed; beef made it one (/"the same goes for i dont understand xyz"/): lexicon row, fourth ingress, the description gains the phrase |
| (none) | fc59f22c/69 | MISSED | `quest-lifecycle` did not fire on /"when done, move to done"/; the organ gate and the `done/` move ran from memory of the skill, and the index's live count was wrong on the first pass |
| (none) | fc59f22c/83 | MISSED | `rename-pass` did not fire: a retired env var (`VIVA_LIGHTHOUSE_SERVE`) and a moved path literal are its trigger; the residue grep ran in two passes, key first, path literals only at 85 — 21 shelf + 13 checkout files |
| (none) | fc59f22c/83 | MISSED | `capture-before-delete` did not fire: 20 files captured from memory of the rule; skill never fired, no loss |
| callout | #199 t232 | MISSED | codeword "retarded" landed; the RULE FAILURE entry was hand-written without firing the skill |
| debugging | #199 t218 | MISSED | a screenshot + complaint (the collapse, third report); the harness that settled it was built without the skill |
| blast-bracket | #199 t226 | MISSED | `Literal.ts` changed under two consumers; the five beats run by hand, the skill never fired |
| sibling-reconcile | fc59f22c/93 | MISSED | a plan (91) and a `go` (93) against `~/.viva/registry/assembly` while the "assembly editor" transcript was writing `Literal.ts` · `schematics.js` · `Inspector.svelte`; the transcripts' and files' mtimes were read only after go; nothing written, held |
| design-handoff | fc59f22c/101 | GAP | both texts read, hexes mapped, but "one line per pane" never written and no ceiling on the read — ~600k tokens of inputs, zero output |
| sibling-reconcile | fc59f22c/101 | GAP | file and transcript mtimes stood in for the quest report's sessions column, which never ran |
| pre-flight | fc59f22c/101 | GAP | all eight checks fired at once over a whole package; nothing in the body says when pre-flight is done |
| quest-authoring | fc59f22c/113 | MISSED | its body read with cat, never fired; the quest was written without the firing on record |
| design-handoff | fc59f22c/115 | STALE | step 4 maps every hex to a token; beef: pixel-perfect first, theme later |
| debugging | edafd0fa/241 | GAP | step 3 "pin the environment" lists shelf · instance · port · .env · docker, never the CLIENT (which browser, its HTTP cache) — a Firefox-only stale-GLB render cost three turns and one retracted correct theory |
| design-handoff | edafd0fa/248 | MISSED | the comp re-pasted; answered "same v3" from github.md's sync date — the skill's step 1 (fetch whole) would have read the file itself |
| design-handoff | fc59f22c t132 | MISSED | a port correction on a live screen; step 9 (measure the served DOM) not fired, four turns spent guessing |

## flywheel 09-23 — amendments landed (step 6)

- 09-23 AMENDED `flywheel` (STALE) — the board read 4 notes of 27: three folds pasted `** skills` table rows the line regex never matched; `skills.py` now parses the row, `(none)` files under the first backticked skill named · flywheel 09-23
- 09-23 AMENDED `flywheel` (GAP) — QUIET ≥10 fired on all ten unfired skills in thirty hours; the rewrite now also needs the skill's situation to have arisen in the window · flywheel 09-23
- 09-23 AMENDED `design-handoff` (STALE) — step 4 rewritten: the comp's palette verbatim in one block until beef orders the theme; description and the mode-development hex line re-stamped · flywheel 09-23
- 09-23 AMENDED `design-handoff` (GAP) — step 0 added: read the comp + the schematic, write the pane lines, then read on touch; a re-pasted comp is re-read from the file; step 9 gains the host-CSS console snippet · flywheel 09-23
- 09-23 AMENDED `design-handoff` (MISSED) — trigger gains beef's spellings: the comp re-pasted · "this doesnt look like its design" · "pixel perfect" · "this is what it must look like" · flywheel 09-23
- 09-23 AMENDED `debugging` (GAP) — step 3 gains the CLIENT: which browser, its HTTP cache, a console snippet in his tab before theory; trigger gains "still." · "collapsed" · "garbage" · flywheel 09-23
- 09-23 AMENDED `pre-flight` (GAP) — "When pre-flight is DONE" added (per noun, on touch, never a whole package); a ninth check, grep a NAME before typing it, promoted from pin-ontology NAMING ×4 + no-fabricated-conventions ×2 · flywheel 09-23
- 09-23 AMENDED `mode-development` (GAP) — "Landing on a watched tree" added: one-burst rsync after `lsof`, the `$effect` both-sides grep and the async `onMount` check before views are called complete · flywheel 09-23
- 09-23 AMENDED `capture-before-delete` (MISSED) — trigger gains "remove the <field|trait|export>" in a registry package and a key migrated across recipes and `.env` · flywheel 09-23
- 09-23 AMENDED `rename-pass` (MISSED) — QUIET 23 with its situation arisen (the retired `VIVA_LIGHTHOUSE_SERVE`, 21 files); trigger rewritten once: a key RETIRED or a path MOVED · flywheel 09-23
- 09-23 AMENDED `ontology-pass` (MISSED) — QUIET 23 while the fourth ontology `guide` was designed without it (#200–#201); trigger rewritten once: a NEW kind enters a domain · flywheel 09-23
- 09-23 AMENDED `live-validation` (STALE) — `paths: "systems/anima/**"` removed. The 09-22 strict-YAML fix ARMED a gate the broken frontmatter had silently dropped: 6 firings before, 0 after, while 09-23 walked registry modes in Chrome (#203 #204) — a registry path never matches a repo glob · flywheel 09-23
- 09-23 AMENDED `debugging` (MISSED) — trigger gains "still." after a fix · "collapsed" · "garbage": both misses (edafd0fa/199 · #199 t218) were a visual defect reported in beef's words, not the word "screenshot" · flywheel 09-23
- 09-23 AMENDED `callout` (MISSED) — recorded, not made here: the folds that filed fc59f22c/63 and /66 landed "ikiro mark" and "i dont understand X" in the trigger themselves; #199 t232 ("retarded") was a firing skipped with the trigger present, not a trigger defect · flywheel 09-23

- 7525eb00/6 `known-issues` MISSED — three defects measured/read mid-pass (speak → "[object Object]", aprende render.object, INTELLIGENT.rounds precedence) were filed only at the fold; the trigger "a defect outside the current quest's scope" was present in a research turn, not a fix turn · #205
- 7525eb00/5 `sibling-reconcile` MISSED — `.ikiro/reference/` gained five foreign files and the memory store was folded into ikiro (m69) during the session; noticed in the reply, never walked · #205

Held at one note, amend on a second: `sibling-reconcile` GAP (the quest report's sessions column never run before a `go`, fc59f22c/93 · /101) · `live-validation` GAP (a walk has no exit step — delete the threads and buffers it spawned, close the tab; `feedback_close_verification_tabs`).
- fc59f22c/149 `debugging` MISSED — screenshot + complaint; source read instead of reproducing; the slider showing 0 under a 0.75 floor stayed unexplained · #206
- fc59f22c/151 `debugging` MISSED — same trigger; cause found by grep, never reproduced · #206
- fc59f22c/154 `pre-flight` MISSED — a schema authoring turn; the checks run by hand, the skill never fired · #206
- 3c02f5d2/3 `budget-eviction` MISSED — /"work them through. trash them."/ fired nothing; the cut ran by hand, then the trigger gained "trash them" · "prune" in the same session · #207
- 3c02f5d2/3 `capture-before-delete` MISSED — 55 uncommitted ikiro files captured by hand before the cut; the trigger names `~/.viva` only · #207
- 3c02f5d2/6 `capture-before-delete` MISSED — the auto-memory dir (301 files, no VCS) captured by hand; its path is outside every trigger phrase · #207
- 3c02f5d2/3 `sibling-reconcile` MISSED — 23 shared files cut with three live sessions, mtime checks inside the agents only, the sessions column never read first · #207
- 3c02f5d2/1 `flywheel` HELD — six steps ran; the prune step read OVER only, which beef's baseline order then widened · #207
- 3c02f5d2/4 `quest-authoring` HELD — organs, markers clean, report reads design · go · #207
- 3c02f5d2/8 `compact-walk` HELD — spine and skills by id · #207
- edafd0fa/264 `design-handoff` MISSED — the comp re-pasted with "another pass. align with guide editor" fired nothing; the trigger lists "the comp re-pasted" · #208
- edafd0fa/265 `debugging` MISSED — "parts arent solid" + screenshot fired nothing; reproduced by hand · #208
- edafd0fa/267 `debugging` MISSED — "the buffer loses its state" fired nothing; a remount page built by hand · #208
- edafd0fa/278 `testing` MISSED — "Build the harness" wrote a test file, red-first and baseline by hand; no trigger names "harness" · #208
- fc59f22c/159 `pre-flight` MISSED — two guide harnesses authored; `find <owner> -name "*.test.js"` unrun, the sibling's identical bench surfaced only at the landing diff · #209
- fc59f22c/159 `sibling-reconcile` MISSED — a file written at the package root (`tests/hal.js`) outside my owned paths without reading the sessions column · #209
- 8f39f3b2/4 `live-validation` MISSED — a Dock change walked in Chrome by hand, three tries (collapsed dock, thread-less terminal); the skill's sequence covers both · #210
- 8f39f3b2/4 `pre-flight` MISSED — `turnVerdict` · `verdict()` · a stub flag authored on a grep, the nine checks never run as a list · #210
- 73fd63c4/11 `blast-bracket` MISSED — `FacultyType` · `Policy` · `Hallucination` consumed across three containers; landed on suite counts, never a blast list · #212
- 73fd63c4/11 `testing` MISSED — baseline and one-file runs by hand, the guardrail never RED first; no trigger fired on "go" · #212
- 73fd63c4/9 `pre-flight` MISSED — `ctx.mode.tools.edges()` reached a numbered sketch; a grep would have refused it · #212
- 73fd63c4/16 `capture-before-delete` MISSED — the baks were made by hand before editing two `.env` files; the `~/.viva` trigger never fired · #212
- 73fd63c4/15 `known-issues` MISSED — an entry filed by hand in the skill's shape, cut two turns later as resolved · #212
- 73fd63c4/15 `shelf-sync` MISSED — "no shelf copy" measured by `find`, the skill's diff sequence never ran · #212
- fc59f22c/168 `sibling-reconcile` MISSED — typology · commons edited on files `git status` showed modified by the live m70 sibling; the sessions column never read before the first write · #213
- 8f39f3b2/47 `quest-lifecycle` GAP — `index.md` says derived, regenerate at every sunset, but no method regenerates it; m70's line moved live → done by hand · #214
- 8f39f3b2/43 `blast-bracket` MISSED — M5 reshaped a typology schematic with nine consumers across four containers; baseline, blast grep and re-grep ran by hand, the skill never fired · #214
- 8f39f3b2/43 `pre-flight` MISSED — four new nouns (`Choice.Question` · `Choice.Round` · `tagging` · `bounding`) and `belt.hallucinate.choose`; `v.record` dropping `minProperties` was found by a red test, not by the check · #214
- 8f39f3b2/58 `live-validation` MISSED — the census was proven in a fresh Chrome tab by hand (console read, a `console.log` wrap, `window.__viva`); the skill never fired · #215
- 9c4d5944/5 `ontology-pass` MISSED — one concept under three names (zone · skeleton · level), zone names and slot names settled over eight turns by hand; the skill never fired · #216
- 9c4d5944/46 `design-handoff` MISSED — a `.dc.html` pasted a second time; the comp re-read by hand, the pass never fired, and the reply argued structure from the comp's porcelain hexes until beef: /"what the designer does is what the designer does in its own universe"/ · #217
- 9c4d5944/45 `quest-authoring` MISSED — m72 rewritten whole three times (45 · 53 · 59) with no firing; marker and structure checks ran by hand · #217
- 9c4d5944/54 `ontology-pass` MISSED — `body` in two meanings (zone 1 · text step), five names proposed by hand; the skill fired at 48 for zone and not again · #217
- 9c4d5944/67 `critical-pass` GAP — on a design-only quest (no patch) the sandbox + baseline steps did not translate into "probe the riskiest new seam": the typology import was listed as unproven, not run, until beef: /"test this early/first/as part of baseline."/ · #218
- 9c4d5944/68 `quest-authoring` MISSED — m72 reworked twice more (68 · 72) by counted-swap scripts, no firing; recurring from #217 · #218
- 54db1175/12 `shelf-sync` MISSED — `commons/instances/hello-world/app/App.svelte` edited with its shelf copy live; captured, diffed and synced by hand, the skill never fired · #219
- 9c4d5944/79 `testing` GAP — baseline taken per chosen file, not per touched directory: hello-world's four reds had no before-run and were attributed by import graph until patch 3 · #220
- 9c4d5944/79 `quest-authoring` MISSED — m72 re-cut into four patches and m73 seeded (87) with no firing; third fold running · #220
- 9c4d5944/81 `live-validation` MISSED — four Chrome walks with no firing; the first probed the static build's 404 page (entry is `200.html`) · #220
- 9c4d5944/85 `shelf-sync` MISSED — hello-world shelf synced by hand, its tests overwritten before capture; recurring from 54db1175/12 · #220
- 9c4d5944/93 `design-handoff` GAP — the body knows neither `DesignSync get_file`'s 256 KiB cap (the comp came back `truncated: true`, `render()` lost) nor a comp already built on our token space, where step 4 (palette verbatim) and step 1 (bundler manifest) do not apply · #221
- 9c4d5944/95 `quest-authoring` MISSED — m73 worked out from seed to six patches (95–104) with no firing; fourth fold running · #221
- 9c4d5944/112 `quest-authoring` MISSED — m73 rewritten twice (against the comp's logic class, then by the critical pass) with no firing; fifth fold running · #222
- 9c4d5944/113 `critical-pass` GAP — the ten steps cover an artifact that can be applied; three of m73's six patches were still designs. The beat the turn needed: for an unbuilt patch, read every `file:line`, every absence claim, every named symbol and every test that reads a touched file against the live tree (two read-only passes: 242 held, 12 moved, 29 wrong) · #222
- 9c4d5944/113 `testing` MISSED — five suites baselined and re-run in a sandbox copy by its laws (baseline first, one envelope per suite, pasted), no firing · #222
- 9c4d5944/113 `live-validation` MISSED — the kit walked in Chrome from a sandbox build with no firing; a hidden tab's DOM was read before its screenshot and gave stale values · #222
- 9c4d5944/125 `live-validation` GAP — the sequence restarts the runtime for a buffer view; it does not say a dapper edit reaches the served sheet only after `anima/watch` restarts (`world/codemap/design.md:13`) — porcelain painted no ground until found · #223
- 9c4d5944/132 `blast-bracket` MISSED — m73's patches 3 · 5 deleted nine files and a global rule block; the consumer greps ran by hand, no firing · #223
- 9c4d5944/129 `testing` MISSED — six suites baselined before every patch and pasted after, by its laws, no firing; third fold running · #223
- 9c4d5944/135 `quest-authoring` MISSED — two organs (`* expectation ↔ reality` · `* dropped`) added to m73 on beef's order, no firing; sixth fold running · #223
- 9c4d5944/142 `design-handoff` GAP — no step holds the comp against the served tree region by region before a done claim, and none re-fetches the comp before apply; the radial's paint and the pincer's brand ring were found by beef, 17 more by an audit after · #224
- 9c4d5944/150 `design-handoff` MISSED — the design tool's handoff pasted (`Implement: Anima.dc.html`) over a comp that had moved; fetched, decoded and diffed by its laws, no firing · #224
- 9c4d5944/145 `live-validation` MISSED — the radial and the brand walked in Chrome, no firing · #224
- 9c4d5944/155 `live-validation` GAP — a hidden tab never advances a CSS transition: a computed style read after a theme switch reports the state before; the body names `requestAnimationFrame` only · #224
- 9c4d5944/160 `quest-authoring` MISSED — a QA marker and an audit block added to m73, no firing; seventh fold running · #224
- fd17e14d/11 `testing` MISSED — runtime baseline (65 passed, 422 steps) and a sandbox suite run and pasted by its laws for m74, no firing
- fd17e14d/11 `blast-bracket` MISSED — `Die` · `.good` · `stagger` consumers grepped by hand across the repo and `~/.viva/registry` for m74's flag day, no firing
- 9c4d5944/162 `live-validation` MISSED — the chess board in four themes and the radial walked in Chrome, no firing · #226
- 9c4d5944/162 `live-validation` GAP — one storage key for every tab: a snapshot restored after a walk overwrote beef's newer save; a hidden tab throttles `setTimeout` (a second, then minutes), so a synthetic tap needs down and up back to back and a hold-and-wait walk timed out · #226
- 9c4d5944/162 `testing` MISSED — guardrails first by its laws (chess P-theme-reads red; the gesture's nine old steps green on the pre-image, nine new red there), no firing; fourth fold running · #226
- 9c4d5944/162 `blast-bracket` MISSED — the keep-list's `gesture.js` · `geometry.js` changed, consumers (`+page` · the pincer · `BridgeSection` · tests) mapped by hand, suites both sides, no firing · #226
- 9c4d5944/162 `callout` MISSED — beef's caps logged as a RULE FAILURE (`flag-day-radius`) in the skill's shape, the recurrence audit by grep, no firing · #226
- 9c4d5944/162 `quest-authoring` MISSED — m73's status · marker · two organ blocks · changelog · release written, no firing; eighth fold running · #226
- 9c4d5944/164 `design-handoff` MISSED — a screenshot of the shoulder against the comp's bone keys: `MG` read from the logic class, the icons fetched, ported, no firing; its step 9 (a snippet measured in HIS tab) not run · #226
- 9c4d5944/168 `budget-eviction` GAP — frontier 1257/750, every line over it KEEP by the skill's own rule (a live sibling's m74 handoff, 496 chars; beef's owed session blocks #211–#219, 329); no fate named for KEEP alone above baseline, the gate waits on `compact-go` · #226
- fd17e14d/24 `testing` MISSED — "test if this structure is possible on a scratchpad": three sandbox suites built and run, counts pasted by the skill's laws, no firing · #227
- fd17e14d/27 `blast-bracket` MISSED — "fix the typology. execute and direct.": `steer.strategy.direct` (16 readers, registry included) and `steer.dispatch.execute` grepped by hand before and after, suites both sides, no firing · #227
- fd17e14d/44 `quest-authoring` MISSED — "generally rework the quest … entirely state. no history.": m74 rewritten whole (2496 → 712 lines), organs chosen by hand, no firing · #227
- 339ef973/8 `debugging` MISSED — two red rehearsals of a prod cutover isolated by hand (orphan July migrations · dead-port lighthouse), a green control with an isolated lighthouse, no firing · #228
- 339ef973/9 `capture-before-delete` MISSED — a daemon seat moved on the prod mountpoint volume after `scripts/backup.sh`, capture held by hand; the skill scopes `~/.viva`, a prod volume is the same shape and not in its trigger surface · #228
- 886a541b/9 `compact-walk` STALE — the failure table names `queue-operation` as the mid-turn shape; Claude Code 2.1.284 writes a mid-turn message as `attachment` · `queued_command` · `humanTurn`, and `spine.py` read N=6 of 9 (the three agent-law turns lost). Extractor taught the shape this fold · #229
- 886a541b/2 `quest-authoring` MISSED — "use this opportunity to nugde our testing …": runtime-scenarios written whole (718 lines, organs by hand) and m74 rewritten after its critical pass, no firing · #229
- 886a541b/2 `blast-bracket` MISSED — "@beef go land." on `belt/control.js`: a typology primitive, bracketed by hand (typology `131 passed (562 steps)` before and after, the name grepped), no firing · #229
- 886a541b/16 `quest-authoring` MISSED — "cut the yap. loose 40% of text.": m74 rewritten whole while beef marked it live; his 12 inline `@beef` comments lifted into QUESTIONED, no firing · #230
- 886a541b/23 `callout` MISSED — "dont cut my comments idiot": the entry written by hand, recurrence audit skipped, no firing · #230
- 886a541b/32 `quest-authoring` MISSED — "work through my notes. drop them where resolved.": 39 marks worked through a hand-written splice script, organs checked by hand; the skill's mark grep ran, no firing · #231
- 886a541b/36 `rename-pass` GAP — "make this m75.": the skill carries organs for EXECUTING a rename (blast, residue); authoring a rename QUEST with forks still open (four meanings of one word, a word still to choose) has no organ for the partition of meanings itself · #231
- 886a541b/59 `quest-lifecycle` GAP — "work those into one. merge 75 into 74": no organ for a MERGE (one quest absorbed, the other to `discarded/` with an epitaph, the host's milestone refs renumbered in siblings); its tree preamble runs `.ikiro/methods/quest-report.py` cwd-relative and printed a crash from `.ikiro/quests` · #233
