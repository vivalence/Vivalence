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

- **grep the surface** — `grep -rn "export " <subsystem>/<dir>/`; an existing primitive WINS, never a hand-rolled walker.
- **verify imports** — grep the ROOT barrel; a `<pkg>/<sub>` import is a defect, even quoted (REJECTED 10-24 ×2); `v` is typebox.
- **ontology before verbs** — contested term → skill `name`.
- **grep a NAME before typing it** — repo, typology, `~/.viva/registry`; a word refused once is refused everywhere.
- **staged commands · a carried file:line are NOTES** — a fresh per-op `go`, re-read on `@`; VCS commands beef runs. "test this" on a design = a scratchpad probe (REJECTED 10-13).
- **name the path's frame owner** — typed → cwd · declaration → its repo · record → its registry root; it decides placement (`find <owner> -name "*.test.js"`). PRINT a runtime value before deriving a path.
- **a recorded defect or a ruled rename in a file you touch lands WITH the touch; `fix` on a found cause = the fix, HOLY too** — never "OWED" or "your call" (REJECTED /"chrome not at all"/ · /"Fix, do"/ · 10-26 m108 7b deferred → word-guard deny).
- **guards read the whole command** — VCS words in `echo` · a heredoc → a file; `\//` → `startsWith` (REJECTED 10-22 ×5)

REJECTED: every check at once over a package.

## around — blast · test · change · test · blast

Skip a one-caller leaf · a doc · a test helper.

1. **blast** — list every consumer before touching anything:
   ```bash
   grep -rnI "<symbol>" systems/ subsystems/ commons/ testament/ documentation/ ~/.viva/instances ~/.viva/registry --exclude-dir=node_modules --exclude-dir=bak
   ```
   No `--include`, no `| head` (/"did you cover bruno?"/). Rename → also `grep -rn '\.\./.*<old>/'`. Every hit READ before it counts; a repository hides under its holders' names — grep the class too (`ctx.lighthouse.users` is `entities.user`), and the call SHAPE: `["key"]` · string · `accio(` · URL. NEW field: blast its SIBLING (`dock.lens`): every surface showing it, both clients, shows it (REJECTED 10-27 `DOCKED.markdown` ghost-only).
2. **test** — every touched dir's suite RUN first; after, reds identical BY NAME.
3. **change** — nothing else in the pass; a file list rides a python script, each anchor EXACTLY once (zsh never word-splits `$FILES`).
4. **test** — green again; a new red is yours. `*.snapshot.test.js` in compare mode + `SNAPSHOT_HOT=1` for wire ones; a rename's residue → skill `name`.
5. **blast** — re-grep; radius = beat 1.

Escalate before beat 3: suspected bug → test `current → broken`, patch, `→ fixed`; under-tested → contract test on OLD code; typology core → ask beef.

## after — a pasted envelope beside a baseline

1. **baseline before blame** — the pre-edit tree is `@` before my first edit (`jj evolog`), not HEAD (`@-` lacks his WIP): `methods/oldtree.sh <id> <path> <dest>`. REJECTED 10-19 `git archive` (vcs-guard).
2. **attribute pre-existing reds** — `grep -n '<test file>' .ikiro/known-issues.org` first; a hit names it, NO hit = find the cause, file it (REJECTED 10-24: "as before" ×4 hid a dead chrome).
3. **one file, one verdict** — censuses SERIAL (`connection.test.js:8` fixed port), no edit mid-census (REJECTED 10-23: 3 false reds).
4. **paste** `ok | N passed (M steps) | F failed (Ns)` from the tool result — never `suite N/M`.
5. **snapshots** — FROZEN `toEqual` the fixture, in PRODUCTION shape; `SNAPSHOT_HOT=1` REGENERATES them, never "verification" (capture: map).
6. a green must FAIL once (revert its line); an `alive()` skip counts as a pass; a recorded green is not a standing green; **a repo test reads no machine** (census: map); ledger code touched → `md5 -q ~/.viva/*.json` before · after, `ps -axo command | grep -- --watch` first.
7. **seams** — SERVED-only code → mount or walk it (skill `debug`).
8. /"run the coverage. blast change. itterate coverage."/ → per-file before → after.

## critical pass — true against HEAD, gated tree untouched

/"argue against it, find the weak spots"/.

1. base facts — `git merge-base`, `git diff --stat <claimed> HEAD -- <touched>`; `patch -p1 --dry-run -N`, never `git apply`.
2. sandbox — pre-edit copy minus `.git .jj`; `VIVA_REPOSITORY_MOUNT=<copy>` outranks `~/.viva/.env` (the REAL checkout); the copy's ledger names ITS commons; no root `.env`; a package copy under the ROOT config tests the REAL one → its own `deno.jsonc` (REJECTED 10-23).
3. baseline unpatched, then patched, side by side.
4. grep every absence claim.
5. read the CONSUMER side of every new seam.
6. compare against ≥1 live sibling — the oracle.
7. scope against the artifact's own words; park to `quests/<name>/deferred/`.
8. fix in sandbox → `git diff --no-index --src-prefix=a/ --dst-prefix=b/ base sandbox` → whitelist → dry-apply. Never hand-edit it.
9. the quest carries the delta: a `* critical pass` section; stale sentences annotated `/(pass: …)/`.

REJECTED: applying it — /"nooooooooot apply. just work them into the quest format"/.
