---
name: blast-bracket
description: Bracket a risky edit to load-bearing code so drift cannot hide — blast · test · change · test · blast. Fires for any symbol with two or more consumers, a typology primitive, a trait, a shard, an entity/repository method, or anything a grep shows imported across containers.
when_to_use: >-
  "blast X" · "blast change X go" · "change this everywhere" · "is it safe to touch <symbol>?" · any edit whose
  radius you cannot name from memory.
---

# blast-bracket — "blast X" / "change this everywhere": bracket a risky edit to core code

The `blast · test · change · test · blast` discipline, walked rather than remembered. This file IS the canon.

beef, verbatim: *"blast. test. change. test. blast."*

**Skip it** for a leaf with one caller, a doc, or a test-only helper. Everything else brackets.

## The five beats — one todo each

1. **blast** — map every consumer. Output the list before touching anything.
   ```bash
   grep -rnI "<symbol>" systems/ subsystems/ commons/ testament/ documentation/ ~/.viva/instances ~/.viva/registry --exclude-dir=node_modules --exclude-dir=bak
   ```
   **No `--include` filters** — one `.mjs` config missed by an include list crashed beef's dev server (*"did you cover bruno? testing? json?"* · *"svelte"* · *"docker?"* · *"compose??"*). The radius is the whole machine: repo + `~/.viva/instances` + every tapped package (`feedback_flag_day_radius`). For a rename add `grep -rn '\.\./.*<old>/'` — a relative import carries no literal `registry/`.
   DISTINGUISH same-name-different-verb: `Queue.drain` ≠ `soma.drain`; `Broadcaster.subscribe` ≠ nanostores `.subscribe`.
2. **test** — the consumers' suites GREEN *first*. Record env-only baseline reds so the end-diff stays honest.
   ```bash
   deno test -A --no-check --ignore='**/bak/**' tests/
   ```
3. **change** — the edit. Nothing else in the same pass.
4. **test** — same suites, GREEN again. Green on both sides is the proof there is no drift. A red that was not red in beat 2 is yours.
   **fixtures** — every `*.snapshot.test.js` in compare mode + `SNAPSHOT_HOT=1` for the wire ones against a booted daemon; `grep -rn "<old>" tests/snapshots tests/fixtures ~/.viva/registry/*/tests` → ZERO. A suite reads the fixture it is given — a stale fixture is a red no suite reports (beef 09-17; `feedback_tests_and_fixtures_close_a_pass`).
5. **blast** — re-grep the consumer set. Confirm the radius matches beat 1, nothing new wired by accident, siblings untouched.

## Escalations — pick before beat 3

- **Suspected bug** → demo-driven proof FIRST: a throwaway test asserting `current → broken` AND `patched → fixed`, run, then delete. Proof precedes patch.
- **Under-tested target** → guardrail FIRST: write the contract test, green it on the OLD code, then change.
- **Holy layer** (typology core types/prototypes) → STOP, ask beef (`feedback_typology_holy`).

## beef's lingo

`blast` = verb+noun (map + intent) · `"X. blast"` = map only, no change · `"blast change X go"` = map + act, full bracket.
