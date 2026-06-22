# ikiro/quest — writing an implementation quest

The persistent design surface maintained alongside Finn (`**.ikiro/<name>.quest.org`). A quest is not a plan-dump; it is the durable, resumable spec for a body of work — recoverable cold by a fresh session. Crystallized from practice; append as conventions firm up.

## Structure (an implementation quest carries)

- **Intent** — what + why, the unifying idea in a few lines.
- **The decision trail** — the locked design, each fork resolved with the reasoning that settled it (so it is not re-litigated next session). Quote Finn verbatim at the load-bearing turns (`feedback_compact_verbatim_user_voice`).
- **Milestones** — each `blast → test → land → test → blast`. A milestone must **boot green at its boundary** (see coupling rule below).
- **Tangle blocks** — the resolution as literate code (see tangle convention).
- **Testing assessment** — MANDATORY (see below).
- **Blast table** — every touchpoint (`file` · change · milestone · kind), sized.
- **Deferred** — what's out of scope now + the trigger that reopens it.
- **Forks** — decisions to call before blasting.
- **Changelog** — session-relative, no dates in compacts; quests may date the changelog.

## Testing assessment — mandatory

Finn's standing directive (this is not optional): *"Don't forget a thorough assessment of testing what's already in place and what is going to change and what we are going to add."* Every implementation quest carries three parts + a ladder:

- **In place** — what already guards the area; name the suites, and flag the COVERAGE GAP (the code paths with no test — that's where the new-test debt is).
- **Changes** — existing tests that must update, with the reason (snapshot regen, deep-import rewrite, scenario needs a new prerequisite).
- **Adds** — new tests, tangled if concrete.
- **Per-milestone green ladder** — a table: `milestone → the green gate that proves it`. No milestone lands without its gate.

## Tangle convention (tangleable to resolution)

Paths relative to `.ikiro/quests/` → `../../<repo-path>`.

- **NEW files + fully-replaced small files** → `#+BEGIN_SRC <lang> :tangle ../../<path> :mkdirp yes` with the full final content. The org IS the source of truth that regenerates the file.
- **Surgical edits in large files** → `#+BEGIN_SRC diff` hunks with the path in prose, applied by hand. Do NOT `:tangle` a partially-reproduced large file — tangling overwrites the whole file, so any untouched line you didn't reproduce is silently dropped.
- Anchor: `m4_phase-playground` (tangled the playground modes), `m11_packages` (mixed tangle + diff).

## QA-before-blast (the adversarial pass)

Finn invokes it explicitly (*"do another pass. anything not integrated? anything improvable?"*) and the value concentrates there — the M11 pass caught three build-breakers before a line was written. Before a quest is "ready":

- **Each milestone boots green at its boundary.** A change that can't land in halves (the new code path needs a coupled change to not throw) must be ABSORBED into that milestone, not split across two. (M11.1: the package-manifest read couples to collapsing the tier-branches — splitting them throws at boot.)
- **Move/flatten ops checked against ACTUAL structure.** Verify the tree before writing `mv` lines — a dir already in target shape must be left alone (M11: `registry/playground/` was already `<type>/<slug>`; the blanket `mv` would have broken it).
- **No scenario folds over empty.** A loader that now reads declared state (`variant.packages`) breaks any test/scenario that invoked it without seeding that state first.
- **Ground every "problem" in the real mechanism before designing a fix** — the fix is often already present (`### the investigator`: proposed-machinery-for-a-non-problem).

## Composition

`orb` (co-design sketch) → crystallizes into `quest` (the spec) → milestones blast into code → `compact` preserves the arc → `reflection`/`selfimprove` extracts durable rules into memory + this ikiro. See `.ikiro/methods/orb.md`, `.ikiro/methods/overview.md`.
