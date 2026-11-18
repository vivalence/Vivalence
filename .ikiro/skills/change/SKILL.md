---
name: change
description: >-
  Before, around and after a code edit — pre-flight, the blast · test · change · test · blast bracket, a
  verdict that can fail, the critical pass on a sandbox.
when_to_use: >-
  `go` on MY proposal · the first Edit of product source in a session (11-19: a go'd land, `change` never loaded) ·
  "add X to <subsystem>" · "wire up <thing>" · "write a new <primitive>" · "add a test for" · deriving a path
  from a runtime value · a cross-component dispatch · acting on a quest-staged command ·
  "blast X" · "blast change X go" · "change this everywhere" · "is it safe to touch <symbol>?" · an edit whose
  radius you cannot name · a symbol with ≥2 consumers · "run the tests" ·
  "tests green?" · a red you did not cause · a snapshot diff · "run the coverage" · before a
  milestone flips DONE · "verified by tests" about to be typed · "critical pass" · "(do) another
  pass" · "anything not integrated? anything improvable?" · "argue against it, find the weak
  spots" · "is the quest really complete?" · before `#+status` says tangleable · before beef applies a
  patch or package tree.
---
<!-- limit: 11000 chars -->
# change — guard a code edit

## before — per noun touched

- **grep the surface** — `grep -rn "export " <subsystem>/<dir>/` AND the body; a primitive WINS, its SIBLING copies its signature; a primitive's PARAMETER I lean on: `grep -n '<primitive>' .ikiro/known-issues.org` first (11-21 `stream(…, signal)`, filed dead 10-05, met after three live hangs). A scope VALUE is read off the host die, never a repository class (11-09).
- **verify imports** — grep the ROOT barrel; a subpath import is a defect, even quoted (REJECTED 10-24 ×2).
- **grep a NAME before typing it** — scope (`grep -nw` file + importers; a redeclare served 11-17; an EXPORT's name in every file that will import it, tests too: 11-21 `say` minted in a kit, taken in the view and the rig; a COINED export too, in its file and his handoff's nouns, before the Write: 11-21 `seat` · `fill`, his noun · a redeclare, three renames), repo, typology, `~/.viva/registry`; a NEW key vs its signature's nouns + entity fields: a clash is ASKED, never a departure (11-16 /"it mixes shit"/); refused once, refused everywhere. A fix reads the quest's `never` · amen'd stops.
- **staged commands · a carried file:line are NOTES** — a fresh per-op `go`, re-read on `@`. "test this" on a design = a scratchpad probe.
- **a path's frame owner** — typed → cwd · declaration → its repo · record → its registry. PRINT the value first; a sandbox probe prints its resolved repository root.
- **a tree with no `.jj` · `.git` (`ls -a`)** — capture to `~/.viva/bak/<scope>/<slug>-<YYYYMMDD>/` BEFORE the write (11-19 vcompany, no undo); a migration of HIS stored data is SHOWN as a dry run first (tally · unplaced · one entity before · after · the route), rides the product's OWN install (a changed dataset file, one restart) before any hand SQL, its store compared to its files entity by entity BEFORE and AFTER, the db captured by `.backup` (AFFIRMED 11-21 /"amen."/).
- **a recorded defect or a ruled rename in a file you touch or naming its mechanism (his registry too) lands WITH the touch; `fix` on a found cause · `isnt X? cause Y` = the fix, HOLY too** — never "OWED" · a question box; a vague `fix both` = the widest reading (REJECTED /"Fix, do"/ · 11-12 /"fix all"/); ONE complaint, EVERY found cause fixed that pass (11-18 turn cut, repl echo left).

## around — blast · test · change · test · blast

Skip: 1-caller leaf · doc · test helper.

1. **blast** — every consumer first:
   ```bash
   grep -rnI "<symbol>" systems/ subsystems/ commons/ testament/ documentation/ ~/.viva/instances ~/.viva/registry --exclude-dir={node_modules,bak}
   ```
   No `--include` · `| head`. Rename → the BARE tail word, every spelling: quoted · `\/`-escaped in a rig's regex · a path · `'\.\./.*<old>/'` (11-19: 3 rig resolvers missed). Every hit READ; a repository hides under its holders' names (`ctx.lighthouse.users` 11-10), each test's hand-built die; the call SHAPE: `["key"]` · string · `accio(` · URL. NEW field: blast its SIBLING (`dock.lens`): every surface, both clients, shows it ALIKE (11-17 `<<`). Past grep (wire · db column · teardown): the ONE fact it is safe by, RUN, else `unproven`. A PRINTED line is a wire: its literal (`'\] start'`) is grepped, rigs' regexes too, before its format · its filter changes (11-20 every boot test hung 90 s on `READY`).
2. **test** — each touched dir's + every blast consumer's suite WHOLE, BEFORE edit one, the list a GREP of each touched file's names over every `tests/`, never picked by eye (11-21 paladin's `registry.integrity.test.js` met only at the fold): no snapshot may hold it (11-18); after, reds same BY NAME
3. **change** — nothing else in the pass; a file list = a python script, each anchor ONCE, its list an ALLOW-list of roots PRINTED first, never repo-minus-excludes (11-19 two `.ikiro` files rewritten). A listener (`lsof` first): build in a sandbox copy, land in ONE pass, its files typed out in the `for`, never a `$VAR` (zsh keeps it ONE word: 11-20 nothing copied, the bare `touch` redeployed), an `Edit` IS a save: files ≥2 → the sandbox BEFORE Edit one (11-20 ×4 warns, a `go` is no exemption) — a Bash write slips `watch-guard`; a `vite.config.mjs` edit is HIS restart (11-19 chrome 500). A copy AGES: it takes the tree's moved files BEFORE its suites, the land refuses a tree file that moved since (hash · mtime), a sibling's fresh rows are re-laid under mine, never overwritten (11-21 two sibling lands mid-build, one cut an import my landed hunk called); a scripted replace's result is `diff`ed and READ before the land (11-21 one indent laid over three depths, two saves); vite's first answer after a save may be the old module: the SECOND read counts (11-21 a zero read three lands running).
4. **test** — green; a new red is yours. `*.snapshot.test.js` in compare mode + `SNAPSHOT_HOT=1` for wire ones; a rename's residue → skill `name`.
5. **blast** — re-grep; radius = beat 1.

Escalate before beat 3: suspected bug · MY flag → test `current → broken` → patch → `fixed`, unreproduced = no fix, no ask (11-17 /"We don't want to crosswire"/); under-tested → contract test on OLD code; typology core → ask; found bug → WHOSE code (11-14)

## after — a pasted envelope beside a baseline

1. **baseline before blame** — beat 2's envelope; else `@` before edit one (`jj evolog`), not HEAD: `methods/oldtree.sh <id> <path> <dest>`. REJECTED 10-19 `git archive`.
2. **attribute pre-existing reds** — `grep -n '<test file>' .ikiro/known-issues.org` first; a hit, READ, names it, NO hit = find the cause, file it (REJECTED 10-24 ×4). A red on MY copy is BLAMED only after that file ran ≥3× on the pristine copy that turn (11-20 a filed 1-in-3 flake blamed on two milestones). A stall is a HANG only after `ps -o time` stood still: a sleeping laptop stalls too (`pmset -g log`, 11-20 ×2).
3. **one file, one verdict** — censuses SERIAL (`connection.test.js:8` fixed port), no edit mid-census (10-23 · 11-18), no other process of mine beside it (11-21 a rig world + a browser walk under ghost's suite); a census IS `methods/census-suites.sh`, its header steps too (`SNAPSHOT_HOT=1` on hello-world), its red-name comparison too (`AGAINST=`, 11-21 a hand filter matched every step row), never a hand loop (11-20 a zsh loop ran nothing; a stale snapshot read as a red).
4. **paste** `ok | N passed (M steps) | F failed (Ns)` from the tool result — not `suite N/M`; `NO_COLOR=1` to grep it.
5. **snapshots** — FROZEN `toEqual` the fixture, in PRODUCTION shape; `SNAPSHOT_HOT=1` REGENERATES them, never "verification". A suite that CAPTURES on every run WRITES: under a live watcher it runs on the copy only, an agent's brief names it (11-20 `harness.snapshot.test.js` rewrote three on the live tree).
6. a green must FAIL once (its row, in place, no cp back; never under a LIVE watcher, typology too: 11-18 it served the mutant), on the ASKED property; a test rewritten so HE can do X is run THROUGH X before the land, his act replayed as drained files or a rig write (11-20 a guides rewrite still pinned `uses` equal · a count · a line: red on one anchored line, found only on his /"do another pass"/); a ruled field lands when a READER greps; `alive()` skip = pass; an assertion holds data, never a live node; ledger code → `md5 -q ~/.viva/*.json` before · after, `--watch` procs first.
7. **seams** — SERVED-only code → mount or walk it (skill `debug`).
8. /"run the coverage. blast change. itterate coverage."/ → per-file before → after.

## critical pass — true against HEAD, gated tree untouched

1. base facts — `git merge-base`, `git diff --stat <claimed> HEAD -- <touched>`; `patch -p1 --dry-run -N`, never `git apply`.
2. sandbox — pre-edit copy minus `.git .jj .env*`, skipped BY the copy loop (`cp -cR` per top-level entry: an APFS clone, `node_modules` in seconds; 11-21 `.env` copied, the baseline ran beside it), a pristine twin kept for `methods/blocks.py <pristine> <copy> <path …>` (the quest's diff blocks), each workspace `deno.jsonc` kept, EVERY member of the root one copied (11-20 `documentation` left out: its stderr warn read as two red suites); `VIVA_REPOSITORY_MOUNT=<copy>` outranks `~/.viva/.env`; the copy's ledger names ITS commons; no root `.env`; a package copy under the ROOT config tests the REAL one → its own `deno.jsonc`. A `deno run` of a file OUTSIDE the root takes `--config <root>/deno.jsonc`, `deno test` from the root does not (11-20). A probe in a copy imports through ITS map, never a bare `jsr:` (11-20 it rewrote the copy's `deno.lock`); two copies are compared BOTH ways, one-sided files printed (`diff -rq`, its `Only in` rows read: 11-20 a stray file hid behind the filter).
3. baseline unpatched · patched, beside.
4. read the CONSUMER side of every new seam.
5. compare ≥1 live sibling — the oracle; its guard, where we differ.
6. scope against the artifact's own words; park in its `* deferred`.
7. fix in sandbox → `git diff --no-index base sandbox` → whitelist → dry-apply. Never by hand.
8. the quest carries the delta: a `* critical pass` section; stale sentences annotated `/(pass: …)/`.

REJECTED: applying it (/"nooooooooot apply"/).
