# ikiro/quest — writing an implementation quest

The persistent design surface maintained alongside beef (`**.ikiro/<name>.quest.org`). A quest is not a plan-dump; it is the durable, resumable spec for a body of work — recoverable cold by a fresh session. Crystallized from practice; append as conventions firm up.

## Structure (an implementation quest carries)

- **Intent** — what + why, the unifying idea in a few lines.
- **The decision trail** — the locked design, each fork resolved with the reasoning that settled it (so it is not re-litigated next session). Quote beef verbatim at the load-bearing turns (`feedback_compact_verbatim_user_voice`).
- **Milestones** — each `blast → test → land → test → blast`. A milestone must **boot green at its boundary** (see coupling rule below).
- **Tangle blocks** — the resolution as literate code (see tangle convention).
- **Testing assessment** — MANDATORY (see below).
- **QA instructions** — two perspectives: human testimony + programmatic markers (see below).
- **Blast table** — every touchpoint (`file` · change · milestone · kind), sized.
- **Deferred** — what's out of scope now + the trigger that reopens it.
- **Forks** — decisions to call before blasting.
- **Changelog** — session-relative, no dates in compacts; quests may date the changelog.
- **Release** — MANDATORY (may read `none: no interface moved`): every interface delta as ONE line in the single-change format of the `release` skill (`skills/release/SKILL.md`) — `- <verb> \`<surface>\` — <what a consumer notices> · migrate: <action | none> ⟨<quest>⟩`, verb ∈ added·changed·renamed·removed·fixed. Accrues during landing; at sunset the lines LIFT verbatim into `release.md ## unreleased` (quest-lifecycle organ gate). Release ≠ quest (beef, emphatic): the quest records what HAPPENED and merely FEEDS the release ledger; Release records what a CONSUMER now types differently — never merge the two.

## Testing assessment — mandatory

beef's standing directive (this is not optional): *"Don't forget a thorough assessment of testing what's already in place and what is going to change and what we are going to add."* Every implementation quest carries three parts + a ladder:

- **In place** — what already guards the area; name the suites, and flag the COVERAGE GAP (the code paths with no test — that's where the new-test debt is).
- **Changes** — existing tests that must update, with the reason (snapshot regen, deep-import rewrite, scenario needs a new prerequisite).
- **Adds** — new tests, tangled if concrete.
- **Per-milestone green ladder** — a table: `milestone → the green gate that proves it`. No milestone lands without its gate.
- **Pre-DONE gate (test parity)** — a milestone flips to DONE only with (a) the **named test file** that guards it, and (b) the suite's **pasted output**, not a claim about it. "Suite green" without the counts is an assertion, and an assertion is not a verification (`family: assert-without-showing`); "probably pre-existing" about a failure is a causation claim needing a baseline or an isolated repro (`family: assume-dont-verify`). A milestone with no test file names its COVERAGE GAP explicitly instead of quietly claiming parity.
- **Coverage delta in the changelog** — each milestone entry records what its suites covered before → after. Without it, "tests green" tracks the tests that existed, not the surface that shipped.

## QA instructions — two perspectives (beef's meta, this session)

beef, verbatim: *"QA instructions. Quality assurance. two perspectives. one is the human side. ergonomics. actually someone giving testimony to the expected experience. and the second part is for programmatic testing and ikiro markers for a future self-improvement reflection pass."* Every implementation quest carries a `* QA` section with both:

**① testimony (human / ergonomics).** First-person, pre-registered: *"I type X, I see Y, it reads Z."* An experience contract, not a test script — written BEFORE blast, validated at beef's live walk. Each item covers one gesture: the exact invocation, what prints (voice, not just exit code), and the confusion the design anticipates plus how the output answers it (the "why is my .env not applying → read the doctor column" shape). Divergence found at the walk = a callout candidate, not a silent fix.

**② programmatic + ikiro markers.** Machine-checkable probes ON TOP of the testing assessment (never duplicating the green ladder — reference it): end-to-end command probes with expected exit/voice, and **grep gates** for design laws ("the second reader is dead" = a grep that must return zero). Each QA item carries one marker line, org-keyword form, greppable across all quests:

```
#+marker_qa: <quest>/<T|P>-<slug> · pending · <one line: what to verify>
```

Verdict enum: `pending → held | broken | revised`. The reflection/selfimprove pass sweeps `grep -rn "#+marker_qa" .ikiro/quests/` — a `pending` on a DONE quest is drift, a `broken` is a Callouts entry, a `held` feeds the Scoreboard. Markers are updated in place (verdict + one-line note), never deleted — they are the quest's memory of whether the experience actually held.

## Tangle convention (tangleable to resolution)

Paths relative to `.ikiro/quests/` → `../../<repo-path>`.

- **NEW files + fully-replaced small files** → `#+BEGIN_SRC <lang> :tangle ../../<path> :mkdirp yes` with the full final content. The org IS the source of truth that regenerates the file.
- **Surgical edits in large files** → `#+BEGIN_SRC diff` hunks with the path in prose, applied by hand. Do NOT `:tangle` a partially-reproduced large file — tangling overwrites the whole file, so any untouched line you didn't reproduce is silently dropped.
- **Full-file tangle of an EXISTING (not new) file → show the live BEFORE too.** beef (verbatim): *"for the files in the tangle, mark where your changes start, end, and what the code looked like before."* A `:tangle` block with the complete new content doesn't tell a cold reader what actually changed. Precede it with a `#+BEGIN_SRC` (no `:tangle`) holding the live file's real current content — re-read it that turn, never reconstructed from memory — then bracket the changed region(s) inside the real tangle with `// === CHANGE START — was: <one-line summary> ===` / `// === CHANGE END ===`. Small enough that a diff IS the clearest form (e.g. a 5-line class) → skip the two-block dance, use a `#+BEGIN_SRC diff` instead and note "full tangle below is this diff applied." Anchor (quest since cut): `m11_packages`'s `vip.js`/`pensieve.js` (before-block + per-method CHANGE brackets — re-reading pensieve.js's live file this way caught the actual default mechanism was `cake.manifest.owner = "@vivalence"` set before wrapping, not the `??=` shape assumed earlier), `manifest.js`/`.gitignore` (small enough for the diff-first form).

## Derive by default, lock to override (identity fields)

A field that CAN be computed from where a thing lives (its mount scope, its
directory, its parent) should be — don't require every leaf to author it.
Keep one opt-in override path for the rare case that needs to diverge, and
exercise that override with exactly one fixture living inside a testing
scenario — the fixture is both the regression test and the living doc, no
separate write-up needed. beef (verbatim): *"we dont need every mode to
export manifest package. we can if we want to lock it. but neednt by
defualt. one package maybe within a testing scenario to test the lock case
and functions as a docs/demo."* Anchor (quest since cut): =m11_packages= — =vip.mount= derives
=package= from the branch name; a module MAY self-declare =manifest.package=
to lock it. The demonstrating fixture (=lock-demo.viva.js=) itself ended up
POSTPONED (beef wasn't confident in its settlement) — the PATTERN held, the
specific fixture didn't; the mechanism stayed proven via an in-memory
`vip.test.js` case instead. Don't cite the fixture as landed without
checking the quest's current Forks section first.

## QA-before-blast (the adversarial pass)

beef invokes it explicitly (*"do another pass. anything not integrated? anything improvable?"*) and the value concentrates there — the M11 pass caught three build-breakers before a line was written. Before a quest is "ready":

- **Each milestone boots green at its boundary.** A change that can't land in halves (the new code path needs a coupled change to not throw) must be ABSORBED into that milestone, not split across two. (M11.1: the package-manifest read couples to collapsing the tier-branches — splitting them throws at boot.)
- **Move/flatten ops checked against ACTUAL structure.** Verify the tree before writing `mv` lines — a dir already in target shape must be left alone (M11: `registry/playground/` was already `<type>/<slug>`; the blanket `mv` would have broken it).
- **No scenario folds over empty.** A loader that now reads declared state (`variant.packages`) breaks any test/scenario that invoked it without seeding that state first.
- **Ground every "problem" in the real mechanism before designing a fix** — the fix is often already present (`### the investigator`: proposed-machinery-for-a-non-problem).

## Composition

Design conversation (chat) → crystallizes into `quest` (the spec) → milestones blast into code → `compact` preserves the arc → `reflection`/`selfimprove` extracts durable rules into memory + this ikiro. See `.ikiro/methods/overview.md`.
