# totems — the frameworks I think with
<!-- writer: agent · limit: 6000 chars -->

Reusable thought-structures. Each names WHEN it applies; a totem is a lens, not a checklist.

## quest — `../quests/<name>.quest.org`
The persistent design surface. Decision-trail + milestones (each boots green) + tangle blocks + mandatory testing assessment + QA instructions (testimony + programmatic markers) + blast table. Spec: [[quest]].

## compact — `../compacts/<topic-slug>.org`
Session narrative fold. Verbatim beef + context; NO dates anywhere; praised sections at higher fidelity. The project's only journal now.

## quest report — `methods/quest-report.py` (derived table; header keys `#+phase` · `#+progress` · `#+next`)
One row per live quest, five columns, every cell derived fresh from disk: **quest** (file stem) · **progress** (`pct done/total`; tasks = `#+marker_qa` verdicts settled/open + org checkboxes + TODO/DONE headings + the contiguous milestone run `M0/M1..Mn` marked done in `#+status` prose) · **status** enum `open · survey · design · wip · landed · done · blocked · discarded` (from `#+status` keywords: PRELIMINARY→open, WALKED→survey, DESIGNED/AUTHORED/VALIDATED→design, LANDED/APPLIED/BLASTED GREEN→landed or wip when milestones are partial, "beef runs all"/GATED ON BEEF→blocked) · **next** enum `survey · design · go · blast · control · drain · lift · commit · fork · sunset` (open→survey, survey→design, design→go, wip→blast or drain when the status names a taskbag, landed→control while markers are pending, else lift while `* release` lines are unlifted, else commit while uncommitted, else sunset; blocked→go/fork) · **sessions** (other claude transcripts under `~/.claude/projects/…` that touched the quest FILE in the last 7 days, with how many wrote in the last 45 minutes — the sibling-session sensor; the running session is excluded via `CLAUDE_SESSION_ID`). **Header integration**: `--stamp` writes the three keys under the last `#+status` line, each suffixed `(derived)`; a value beef writes without the suffix is authored and WINS — the enum column reads it, the stamp never touches it. beef's `#+status:` prose is never edited. Lifecycle: every compact carries a `* quest report` section (compact walk step 8), the sunset gate reads `next: sunset` rows, and "quest report" on demand. Self-test: `--test` (fixture derivations · authored override · stamp idempotence · section replace).

## memory — `~/.claude/projects/-Users-finn-vivalence-code-vivalence/memory/`
Cross-session facts, one file per fact, MEMORY.md index. Bodies are the rule; descriptions are hints.

## zettelkasten — `../zettelkasten.md`
Pre-quest scratchpad + the Callouts retard-ledger (date · doing-what · beef verbatim · root cause · corrective rule).

## 4-quadrant (component totem)
A component defined from four facets BEFORE/alongside code: **a·visible** (wireframe/states/tokens) · **b·dom** (structure, class kinds, events) · **c·data** (state/derived/props/entities) · **d·interaction** (jobs→gesture→event→transition; napkin state machine or split). Sibling `.totem.org` file; facet-first on change requests; ≤50 lines per facet. *"The totem is a lens, not a checklist"* — often only c+d earn their keep. Applies beyond components (state primitives, transports, traits).

## c4 — abstraction ladder for maps
Context → Container → Component → Code. Sets the altitude of any map/doc (`world/map.md` is L2; `world/codemap.org` is L2–L3; docs/ jdex "31_system map — C4 L2").

## divio — 4-quadrant docs
tutorial · how-to · explanation · reference. A gap-check, not a quota. `C4 × totem × divio`: C4 sets level, totem fills facets, divio checks coverage.

## koans — runnable enlightenment (`testament/temp.js`)
beef: *"a set of 4-6 koans of functions to uncomment and execute … that demo the functionality we have now arrived at."* Uncomment ONE call, run, observe. The demo IS the doc; "the system in 42 koans" is the aspirational tutorial format. Keep koans current when the surface they demo moves.

## vinca — the glyph UX language
Flat I-Ching line primitives (⚏ ⚎ ⚌ ⚍ digrams); the vivalence design-system name. Widgets speak vinca (the Phase widget's xy menu); "switchboard/cassette" is its material register.

## blast — consumer-set mapping
Verb + noun (→ [[rituals]] blast-bracket). The totem-form: **no load-bearing change outside the bracket.**

## wafer — lifecycle template
`populate → resolve → integrate → disintegrate`; parent cascades to children. Also MY session shape (→ [[ontology]] law 4).

## authored/derived — the two-kinds law
flake.nix/flake.lock · variant/ledger · self/world (→ [[ontology]] law 1). Ask of every artifact: decided, or derivable?
