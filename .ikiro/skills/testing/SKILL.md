---
name: testing
description: >-
  Get a test verdict that means something in vivalence — baseline before blame, pre-existing reds named with
  attribution, a one-file run because five of six test tasks are watchers, pasted `N passed | F failed` never
  the overloaded `suite N/M`, the guardrail written RED before the change, and the FROZEN vs CAPTURE snapshot
  families. Use when running, writing, or reporting tests anywhere in the repo or a registry package.
when_to_use: >-
  "run the tests" · "is it tested?" · "tests green?" · "write a test for" · a red you did not cause · a snapshot
  diff · "run the coverage" · before a milestone flips DONE · "verified by tests" is about to be typed.
---

# testing — a verdict is a pasted envelope with a baseline beside it

Canon: the path-matched `world/codemap/` shard (its test traps) · `methods/quest.md ## Testing assessment` · [[blast-bracket]] (the bracket around a change) · `feedback_tests_and_fixtures_close_a_pass` · `feedback_render_the_view_to_verify_it`. The two families the ledger grew on: `assume-dont-verify` (n=53) and `render-the-view`.

## The laws — in order of how often they saved a session

1. **baseline before blame.** A red you meet is proven pre-existing or owned — a HEAD copy in the scratchpad (`cp -r` + `git show HEAD:<file>` per touched file, read-only git) or an isolated repro per failure. *"probably pre-existing"* is a causation claim with no baseline (`assume-dont-verify`). When beef's WIP is red upstream, build the rig from HEAD copies, prove both sides, SAY the real suites are still red.
2. **name the pre-existing reds, with attribution.** *"paladin 41/185 · typology 124/502 (1 pre-existing `hallucination snapshot`) · runtime 55/347 (1 pre-existing `registry ingest fork 2`)"* · *"Ghost is red on the live tree from the SIBLING m57 rework, not m59."*
3. **one file, one verdict.** Every `deno task */test` except dapper is `--watch` and never exits — seven compacts burned a timeout on it, the memory body said so each time.
   ```sh
   deno test --config /Users/finn/vivalence/code/vivalence/deno.jsonc -A --no-check <file-or-dir>
   deno test --config /Users/finn/vivalence/code/vivalence/deno.jsonc -A --no-check ~/.viva/registry/<pkg>/<live-dir>/   # registry: no task runs these; `deno test <pkg>/` walks bak/
   ```
4. **the envelope, pasted.** `ok | N passed (M steps) | F failed (Ns)` from the tool result — never `suite N/M` (it means files/steps in m47 and passed/failed in m44, in one sentence). A report composed toward a number no tool printed is `report-without-doing`.
5. **guardrail RED first.** Suspected bug → a throwaway test asserting `current → broken`, run, then the patch, then `patched → fixed`. Under-tested target → the contract test green on OLD code, then change. The guardrail written AFTER the change proves the author's model, not the code (#87). Proof precedes patch.
6. **two snapshot families, one suffix.** FROZEN (9) read the committed fixture and `toEqual` it — `SNAPSHOT_HOT=1` REGENERATES them; running it as "verification" overwrites the evidence. CAPTURE (15) hold `const DRY = false` and rewrite the fixture every run — they cannot go red on drift. A rename closes only with every `*.snapshot.test.js` in compare mode + HOT for the wire ones against a booted daemon, and fixtures/ + snapshots/ (repo AND registry) grepped for the old name → ZERO. A suite reads the fixture it is given — a stale fixture is a red no suite reports.
7. **a skip that counts as a pass.** `alive()` guards that only ask whether `:2501` answers make green mean "verified OR not run" — nothing in the output separates them. A mechanism that produces a plausible result when it fails cannot report its own failure.
8. **a flat step count is not missing coverage.** New assertions inside existing steps leave `109 steps` unchanged by construction; a gate reading "steps went up" rejects correct work.
9. **a recorded green is not a standing green** (#92) — re-run before citing a quest's measured section ([[assume-dont-verify]], the CARRIED axis).
10. **green suites hide the seams.** *"Tests encode the author's model; defects live at the seams the artifact did not write."* Three shapes the corpus keeps meeting: code only the SERVED artifact executes (a wiring gap, not a function gap) → bundle it, mount it (`linkedom` rig, `systems/anima/tests/activity.mount.test.js`) or walk it ([[live-validation]]); a compile proves syntax, an `$effect` is proven by running it; a domain rig that collates by hand never builds a Die — a boot-killer sat beneath 22 green steps, and **no runtime test calls `lifecycle.mount`** (COVERAGE GAP, standing).
11. **coverage on beef's order** — *"is this already tested? run the coverage. blast change. itterate coverage."* → per-file numbers before → after.
12. **the artifact's OWNER decides where a test lives** — `find <owner> -name "*.test.js"` first; a mode's tests in the mode, a domain's in the domain (`fit-existing-trees`).

## The pre-DONE gate — discharged in the changelog

Named test file + pasted counts + the baseline + pre-existing reds attributed + walk incidents that are not the quest's + coverage delta. No counts, no DONE. A milestone with no test file names its COVERAGE GAP instead of claiming parity ([[quest-authoring]]).

## Rigs

`@vivalence/runtime/scenarios` — `provider` (a domain with an in-memory datamap: assembly, chess) · `mountMode` (one mode, traits staggered: media, vcompany, dojo) · `daemon` (a whole scenario daemon: education). `commons/instances/hello-world/tests/rig.js` — trait-level, no datamap. `chess/tests/render.js` — `npm:svelte/server` to render a buffer view offline. Cap anything that could loop: `--max-old-space-size`, an RSS watchdog, a timeout, on a `cp` of the db ([[debugging]]).
