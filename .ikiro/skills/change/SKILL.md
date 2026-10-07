---
name: change
description: >-
  Before, around and after a code edit — pre-flight checks before authoring, the blast · test · change · test ·
  blast bracket, a test verdict that means something, the critical pass against HEAD in a sandbox.
when_to_use: >-
  "add X to <subsystem>" · "wire up <thing>" · "write a new <primitive>" · "add a test for" · deriving a path
  from a runtime value · before any cross-component dispatch · before acting on a command staged in a quest ·
  "blast X" · "blast change X go" · "change this everywhere" · "is it safe to touch <symbol>?" · any edit whose
  radius you cannot name from memory · a symbol with two or more consumers · "run the tests" · "is it tested?" ·
  "tests green?" · a red you did not cause · a snapshot diff · "run the coverage" · before a
  milestone flips DONE · "verified by tests" is about to be typed · "critical pass" · "sanity pass" · "another
  pass" · "do another pass" · "anything not integrated? anything improvable?" · "argue against it, find the weak
  spots" · "is the quest really complete?" · before `#+status` says tangleable · before beef applies an attached
  patch or package tree.
---
<!-- limit: 6000 chars -->
# change — "wire up X" · "blast X" · "tests green?" · "critical pass": guard a code edit

## before — per noun, when the noun is touched

- **grep the surface** — `grep -rn "export " <subsystem>/<dir>/`; an existing primitive WINS, never a hand-rolled walker.
- **verify imports** — grep the barrel first; `v` is typebox, no zod methods (codemap typology).
- **ontology before verbs** — contested term → skill `name`. /"stop fucking coding. start designing."/
- **grep a NAME before typing it** — repo, `subsystems/typology`, `~/.viva/registry`; a word beef refused once is refused everywhere.
- **read ≥3 entries** before adding to a dataset.
- **staged commands are NOTES** — a fresh per-op `go`; VCS commands beef runs.
- **name the path's frame owner** — operator-typed → cwd · module declaration → declaring repo · record → its registry root. PRINT a runtime value before deriving a path.
- **the owner decides placement** — `find <owner> -name "*.test.js"` first.

REJECTED: all checks at once over a package — /"ok you;ve overdone it on the inputs"/.

## around — blast · test · change · test · blast

/"blast. test. change. test. blast."/ Skip for a leaf with one caller, a doc, a test-only helper.

1. **blast** — list every consumer before touching anything:
   ```bash
   grep -rnI "<symbol>" systems/ subsystems/ commons/ testament/ documentation/ ~/.viva/instances ~/.viva/registry --exclude-dir=node_modules --exclude-dir=bak
   ```
   No `--include` filters, no `| head` — /"did you cover bruno? testing? json?"/ · /"compose??"/. Rename → also `grep -rn '\.\./.*<old>/'`. Every hit READ before it counts; a repository hides under its holders' names — grep the class too (`ctx.lighthouse.users` is `entities.user`: 10-10 missed `/verify`).
2. **test** — consumers' suites GREEN first; record baseline reds.
3. **change** — nothing else in the pass; a file list rides a python script — zsh never word-splits `$FILES`, `set -- $s`, `$F` (10-08 · 10-09 · 10-10 ×2 — hook owed).
4. **test** — green again; a new red is yours. `*.snapshot.test.js` in compare mode + `SNAPSHOT_HOT=1` for wire ones; a rename's residue → skill `name`.
5. **blast** — re-grep; radius = beat 1.

Escalate before beat 3: suspected bug → throwaway test `current → broken`, patch, `patched → fixed`; under-tested → contract test green on OLD code; typology core → STOP, ask beef.

## after — a pasted envelope beside a baseline

1. **baseline before blame** — a HEAD copy in the scratchpad: `cp -cR`, then `git show HEAD:<file>` over each file `git hash-object --stdin-paths` says differs.
2. **attribute pre-existing reds** — `grep -n '<test file>' .ikiro/known-issues.org` before calling a red found; a hit is its name.
3. **one file, one verdict** — every `deno task */test` except dapper is `--watch`:
   ```sh
   deno test --config /Users/finn/vivalence/code/vivalence/deno.jsonc -A --no-check <file-or-dir>
   cd /Users/finn/vivalence/code/vivalence && deno test --config deno.jsonc -A --no-check ~/.viva/registry/<pkg>/<live-dir>/
   ```
4. **paste** `ok | N passed (M steps) | F failed (Ns)` from the tool result — never `suite N/M`.
5. **snapshots** — FROZEN `toEqual` the fixture; `SNAPSHOT_HOT=1` REGENERATES them, never "verification". CAPTURE: `invariants.md`.
6. an `alive()` skip counts as a pass; a recorded green is not a standing green; **a repo test reads no machine** — census and stub in `world/codemap/invariants.md`; ledger code touched → `md5 -q ~/.viva/*.json` before · after.
7. **seams** — code only the SERVED artifact runs → mount or walk it (skill `debug`).
8. /"run the coverage. blast change. itterate coverage."/ → per-file before → after.

Pre-DONE: test file + pasted counts + baseline + attributed reds + coverage delta. No counts, no DONE.

## critical pass — true against HEAD, gated tree untouched

/"argue against it, find the weak spots"/.

1. base facts — `git merge-base`, `git diff --stat <claimed> HEAD -- <touched>`; `patch -p1 --dry-run -N`, never `git apply`.
2. sandbox — the HEAD copy minus `.git .jj`; `VIVA_REPOSITORY_MOUNT=<copy>` outranks `~/.viva/.env` (the REAL checkout); the copy's ledger names ITS commons (`registry.json` is absolute); no root `.env`.
3. baseline unpatched, then patched, side by side.
4. grep every absence claim ("no X exists", "Y is dead").
5. read the CONSUMER side of every new seam.
6. compare against ≥1 live sibling — the oracle.
7. scope against the artifact's own words; park to `quests/<name>/deferred/`.
8. fix in sandbox → `git diff --no-index --src-prefix=a/ --dst-prefix=b/ base sandbox` → whitelist → dry-apply. Never hand-edit a patch.
9. the quest carries the delta: a `* critical pass` section; stale sentences annotated `/(pass: …)/`.

REJECTED: applying it — /"nooooooooot apply. just work them into the quest format"/.
