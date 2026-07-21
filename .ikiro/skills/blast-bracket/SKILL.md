---
name: blast-bracket
description: Use when changing load-bearing code — any symbol with more than one consumer, a typology primitive, a trait, a shard, an entity/repository method, or anything a grep shows is imported across containers. Triggers like "blast X", "blast change X go", "change this everywhere", "is it safe to touch <symbol>?". The discipline that brackets a risky edit so drift can't hide.
---

# blast-bracket

Invocable runner for the `blast · test · change · test · blast` discipline. Canon lives in `.ikiro/self/rituals.md ## blast-bracket` — this is the step-by-step form for when you're about to touch load-bearing code and want the guardrails walked, not remembered.

beef, verbatim: *"blast. test. change. test. blast."*

## When it fires vs. when it doesn't

- **Fires:** the symbol has ≥2 consumers · it's a typology primitive / trait / shard / entity method · a grep shows cross-container imports · you're unsure of the blast radius.
- **Skips:** a leaf with one caller, a doc/comment, a test-only helper. Don't ceremony a one-consumer change.

## The five beats (make one todo per beat)

1. **blast** — `grep -rn "<symbol>"` every consumer. DISTINGUISH same-name-different-verb: `Queue.drain` ≠ `soma.drain`; `Broadcaster.subscribe` ≠ nanostores `.subscribe`. Output the consumer list before touching anything.
2. **test** — the consumers' suites GREEN *first*. Record any env-only baseline reds so the end-diff is honest. Runtime-wide symbol → full-suite bookends: `deno test -A --no-check --ignore='**/bak/**' tests/`.
3. **change** — the edit. Nothing else in the same pass.
4. **test** — the same suites GREEN again. Green-on-both-sides is the proof there's no drift. A red that wasn't red in beat 2 is yours.
5. **blast** — re-grep the consumer set. Confirm: nothing new wired by accident, siblings untouched, the radius matches beat 1.

## Escalations (pick before beat 3)

- **Suspected bug** → demo-driven proof FIRST: a throwaway test asserting `current → broken` AND `patched → fixed`, run, then delete. Proof precedes patch.
- **Under-tested target** → guardrail FIRST: write the contract test, green it on the OLD code, then change.
- **Holy layer** (typology core types/prototypes) → STOP, ask beef before touching ([[feedback_typology_holy]]).

## beef's lingo

`blast` = verb+noun (map + intent) · `"X. blast"` = map only, no change · `"blast change X go"` = map + act, full bracket.

---
_Wiring: this skill lives under `.ikiro/skills/` for ontology; Claude Code auto-discovers only from `.claude/skills/`. Wire once: `ln -s ../.ikiro/skills .claude/skills`._
