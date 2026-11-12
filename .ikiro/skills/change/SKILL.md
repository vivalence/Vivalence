---
name: change
description: >-
  Before, around and after a code edit — pre-flight, the blast · test · change · test · blast bracket, a
  verdict that can fail, the critical pass on a sandbox.
when_to_use: >-
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
<!-- limit: 6000 chars -->
# change — guard a code edit

## before — per noun touched

- **grep the surface** — `grep -rn "export " <subsystem>/<dir>/` AND the body; a primitive WINS, its SIBLING copies its signature. A scope VALUE is read off the host die, never a repository class (11-09).
- **verify imports** — grep the ROOT barrel; a subpath import is a defect, even quoted (REJECTED 10-24 ×2).
- **grep a NAME before typing it** — scope (`grep -nw` file + importers; a redeclare served 11-17), repo, typology, `~/.viva/registry`; a NEW key vs its signature's nouns + entity fields: a clash is ASKED, never a departure (11-16 /"it mixes shit"/); refused once, refused everywhere. A fix reads the quest's `never` · amen'd stops.
- **staged commands · a carried file:line are NOTES** — a fresh per-op `go`, re-read on `@`. "test this" on a design = a scratchpad probe.
- **a path's frame owner** — typed → cwd · declaration → its repo · record → its registry. PRINT the value first.
- **a recorded defect or a ruled rename in a file you touch or naming its mechanism (his registry too) lands WITH the touch; `fix` on a found cause · `isnt X? cause Y` = the fix, HOLY too** — never "OWED" · a question box; a vague `fix both` = the widest reading (REJECTED /"Fix, do"/ · 11-12 /"fix all"/); ONE complaint, EVERY found cause fixed that pass (11-18 turn cut, repl echo left).

## around — blast · test · change · test · blast

Skip: 1-caller leaf · doc · test helper.

1. **blast** — every consumer first:
   ```bash
   grep -rnI "<symbol>" systems/ subsystems/ commons/ testament/ documentation/ ~/.viva/instances ~/.viva/registry --exclude-dir={node_modules,bak}
   ```
   No `--include` · `| head`. Rename → `grep -rn '\.\./.*<old>/'`. Every hit READ; a repository hides under its holders' names (`ctx.lighthouse.users` 11-10), each test's hand-built die; the call SHAPE: `["key"]` · string · `accio(` · URL. NEW field: blast its SIBLING (`dock.lens`): every surface, both clients, shows it ALIKE (11-17 `<<`). Past grep (wire · db column · teardown): the ONE fact it is safe by, RUN, else `unproven`.
2. **test** — each touched dir's + every blast consumer's suite WHOLE, first; after, reds same BY NAME
3. **change** — nothing else in the pass; a file list = a python script, each anchor ONCE; hookless: `lsof` first.
4. **test** — green; a new red is yours. `*.snapshot.test.js` in compare mode + `SNAPSHOT_HOT=1` for wire ones; a rename's residue → skill `name`.
5. **blast** — re-grep; radius = beat 1.

Escalate before beat 3: suspected bug · MY flag → test `current → broken` → patch → `fixed`, unreproduced = no fix, no ask (11-17 /"We don't want to crosswire"/); under-tested → contract test on OLD code; typology core → ask; found bug → WHOSE code (11-14)

## after — a pasted envelope beside a baseline

1. **baseline before blame** — the pre-edit tree is `@` before my first edit (`jj evolog`), not HEAD (`@-` lacks his WIP): `methods/oldtree.sh <id> <path> <dest>`. REJECTED 10-19 `git archive` (vcs-guard).
2. **attribute pre-existing reds** — `grep -n '<test file>' .ikiro/known-issues.org` first; a hit, READ, names it, NO hit = find the cause, file it (REJECTED 10-24 ×4).
3. **one file, one verdict** — censuses SERIAL (`connection.test.js:8` fixed port), no edit mid-census (10-23 · 11-18).
4. **paste** `ok | N passed (M steps) | F failed (Ns)` from the tool result — not `suite N/M`; `NO_COLOR=1` to grep it.
5. **snapshots** — FROZEN `toEqual` the fixture, in PRODUCTION shape; `SNAPSHOT_HOT=1` REGENERATES them, never "verification".
6. a green must FAIL once (its row, in place, no cp back; never under a LIVE watcher, typology too: 11-18 it served the mutant), on the ASKED property; a ruled field lands when a READER greps; `alive()` skip = pass; an assertion holds data, never a live node; ledger code → `md5 -q ~/.viva/*.json` before · after, `--watch` procs first.
7. **seams** — SERVED-only code → mount or walk it (skill `debug`).
8. /"run the coverage. blast change. itterate coverage."/ → per-file before → after.

## critical pass — true against HEAD, gated tree untouched

1. base facts — `git merge-base`, `git diff --stat <claimed> HEAD -- <touched>`; `patch -p1 --dry-run -N`, never `git apply`.
2. sandbox — pre-edit copy minus `.git .jj`, each workspace `deno.jsonc` kept; `VIVA_REPOSITORY_MOUNT=<copy>` outranks `~/.viva/.env`; the copy's ledger names ITS commons; no root `.env`; a package copy under the ROOT config tests the REAL one → its own `deno.jsonc`.
3. baseline unpatched · patched, beside.
4. read the CONSUMER side of every new seam.
5. compare ≥1 live sibling — the oracle; its guard, where we differ.
6. scope against the artifact's own words; park in its `* deferred`.
7. fix in sandbox → `git diff --no-index base sandbox` → whitelist → dry-apply. Never by hand.
8. the quest carries the delta: a `* critical pass` section; stale sentences annotated `/(pass: …)/`.

REJECTED: applying it (/"nooooooooot apply"/).
