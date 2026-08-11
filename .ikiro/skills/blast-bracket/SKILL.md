---
name: blast-bracket
description: Bracket a risky edit to load-bearing code so drift cannot hide — blast · test · change · test · blast. Fires for any symbol with two or more consumers, a typology primitive, a trait, a shard, an entity/repository method, or anything a grep shows imported across containers.
when_to_use: "blast X" · "blast change X go" · "change this everywhere" · "is it safe to touch <symbol>?" · any edit whose radius you cannot name from memory.
---

# blast-bracket — "blast X" / "change this everywhere": bracket a risky edit to core code

The `blast · test · change · test · blast` discipline, walked rather than remembered. Canon: `.ikiro/self/rituals.md ## blast-bracket`.

beef, verbatim: *"blast. test. change. test. blast."*

**Skip it** for a leaf with one caller, a doc, or a test-only helper. Everything else brackets.

## The five beats — one todo each

1. **blast** — map every consumer. Output the list before touching anything.
   ```bash
   grep -rn "<symbol>" systems/ subsystems/ registry/ --include='*.js' --include='*.svelte'
   ```
   DISTINGUISH same-name-different-verb: `Queue.drain` ≠ `soma.drain`; `Broadcaster.subscribe` ≠ nanostores `.subscribe`.
2. **test** — the consumers' suites GREEN *first*. Record env-only baseline reds so the end-diff stays honest.
   ```bash
   deno test -A --no-check --ignore='**/bak/**' tests/
   ```
3. **change** — the edit. Nothing else in the same pass.
4. **test** — same suites, GREEN again. Green on both sides is the proof there is no drift. A red that was not red in beat 2 is yours.
5. **blast** — re-grep the consumer set. Confirm the radius matches beat 1, nothing new wired by accident, siblings untouched.

## Escalations — pick before beat 3

- **Suspected bug** → demo-driven proof FIRST: a throwaway test asserting `current → broken` AND `patched → fixed`, run, then delete. Proof precedes patch.
- **Under-tested target** → guardrail FIRST: write the contract test, green it on the OLD code, then change.
- **Holy layer** (typology core types/prototypes) → STOP, ask beef ([[feedback_typology_holy]]).

## beef's lingo

`blast` = verb+noun (map + intent) · `"X. blast"` = map only, no change · `"blast change X go"` = map + act, full bracket.
