# rituals — the execution disciplines
<!-- writer: agent (human-gated) · limit: 140 lines -->

The zettelkasten verdict: *"The rules are knowable. Failures are execution-discipline gaps, not knowledge gaps."* These are the gaps, closed as runnable rituals. Rigid — do not adapt away the discipline.

## pre-flight (before any non-trivial edit / proposal / cross-component dispatch)

1. **grep the surface** — `grep -rn "export " <subsystem>/<dir>/` for the noun you're about to write. A primitive that already does it wins: `paladin.find.viva` · `paladin.read.viva` · `paladin.vip.accio*` · `cast.lookup` · `steer.rollup` · `steer.fold` · `shape.object` — never `Deno.readDir` / hand-rolled walkers / nested-loop lookups. *Imperative-JS reflex is the dominant recidivism family.*
2. **open the memory body** — MEMORY.md description ≠ rule; only the file body is authoritative.
3. **verify imports exist** — never write `import { x } from "@vivalence/…"` unconfirmed. Never fabricate an API (`v` is typebox-wrapped: no `.passthrough/.strict/.transform/.refine/.partial/.nullable`).
4. **ontology before verbs** — contested term? stop coding, survey repo-wide usage, lock identity first. beef: *"stop fucking coding. start designing."*
5. **read ≥3 existing entries** before authoring into any dataset (entities, manifests, faculties).
6. **pre-staged commands are NOTES** — anything written in a compact/quest/orb needs a fresh per-op `go`. VCS commands additionally: beef runs them.

## blast-bracket (changing load-bearing code)

beef: *"blast. test. change. test. blast."*

```
blast    grep every consumer of the symbol (distinguish same-named-different-verb:
         Queue.drain ≠ soma.drain; Broadcaster.subscribe ≠ nanostores .subscribe)
test     consumers' suites GREEN before touching anything
change   the edit
test     same suites green — green-on-both-sides proves no drift
blast    re-confirm the consumer set (nothing new wired, siblings untouched)
```

- **runtime-wide symbol → full-suite bookends** (`deno test -A --no-check --ignore='**/bak/**' tests/`), record env-only baseline failures so the end-diff is honest.
- **suspected bug → demo-driven proof**: a throwaway test asserting `current → broken` AND `patched → fixed`, run, then delete. Proof precedes patch.
- **under-tested target → guardrail FIRST**: write the contract test, green on OLD code, then change.
- beef's lingo: *blast* = verb+noun; *"X. blast"* = map only; *"blast change X go"* = map + act.

## anti-rationalization (thought → stop)

- "just check git quickly" → **VCS read-only, git AND jj, always** (→ root banner)
- "go/fix/cleanup authorizes this graph op" → **NO — propose, wait, beef runs**
- "recovery undoes my mistake" → recovery IS a graph mod; cascading fixes multiply damage
- "easy manifest slot" → **HARD STOP** — manifest is metadata; new behavior = sibling export (violated 2×)
- "basically done" → no completion without fresh verification
- "I remember the shape" → read-this-session ≠ remembered; re-grep before applying
- "I'll derive a local copy" → fix at the source of truth; never shadow-derive; aggregate server-side
- "absence needs a flag" → absence IS the signal; no liveness booleans, no `||`-fallback masking upstream bugs; one value has ONE shape — trace to producer
- "add `?.` to be safe" → zero ceremony; `thread && Stall(...)`, never `thread?.$buffers ?` ("too timid")
- "delete this commented cruft" → **backup-during-migration**: `// …` lines + `bak/` adjacent to in-flight work are recovery surface, beef's content — never swept
- "prose explains the patch" → diff first, one-line rationale after; every snippet leads with its filepath
- "date-stamp this compact like bak/ ones" → bak/ filenames are receipts of the mistake, not precedent
- "trailing question rounds it off" → end on substance; no unsolicited wider-scope offers
- "asked for data → I'll summarize" → paste the raw JSON/stdout as the body

## live-validation (kajuit in Chrome)

- "is it wired?" → **JS DOM assertion** (`javascript_tool`: `querySelector(...).click()` + assert), never screenshot coordinate-clicks; stop coordinate-clicking after 2–3 misses.
- `thread/create` hangs (network `pending`) ⇒ buffer-bundle esbuild error — read the runtime log, not the console.
- `deno task runtime/run` caches mode bundles — buffer-view change needs runtime RESTART (HMR covers only the app layer).
- batch edits → ONE reload → test; rapid edit-HMR-click cycles fake bugs.
- scoped `> *` styles don't cross a child component's root (the pointer-events trap).

## svelte / nanostores

Never subscribe→mirror→teardown triads; `$`-prefix or one shared bridge (`atom.chain`). Transparent accessors — vanilla getters, consumers never `.get()`. `$state` doesn't deep-track class instances → atom-backed `$field` + chain-subscribe. Never name props `state/derived/effect`.

## the scribe's duties (session disintegrate)

- **compact** — topic-slug filename, NO dates anywhere (filename, header, body); beef's messages VERBATIM + context mandatory; praised sections extracted at higher fidelity; grep the draft for `2026-` before writing.
- **memory** — update-don't-duplicate; delete wrong memories; contrastive examples (rejected AND accepted).
- **zettelkasten `## Callouts`** — scan the session for the codeword **"retard"** (verbatim only); log date, doing-what, beef verbatim, root cause, corrective rule, **`family:` tag** (taxonomy is beef's — fits no family? propose one inside the callout). Ledger is **APPEND-ONLY**: never edit, soften, or close an existing callout — closure only via extinction at the flywheel, or beef. Missing a codeword hit is itself a loggable failure.
- **recurrence audit** — before writing a callout, grep the ledger for its family. A repeat of a family whose rule already landed = log a **rule failure** (link the original), not a fresh lesson. A rule failure queues escalation at the next flywheel ([[ontology]] law 8 gate ladder).
- **quest changelog + frontier** — the change isn't done until verified, logged, and gaps surfaced.
- a corrective rule written this session is EXECUTED this session.
- **budgets checked** — any self/world file over its `limit:` fails the compact loudly → **evict whole items** (quotes intact), never paraphrase-shrink. A summarizing rewrite of a self/ file IS the collapse failure mode; forbidden.
- **promotion pipeline (human-gated)** — 1st occurrence → callout; 2nd–3rd of the SAME family → propose a kernel/self diff to beef like a PR, hunk-level, verbatim quotes intact. Never silently self-modify identity. (*"auto-generation without curation actively hurts."*)
- **world-sync** — on landing anything structural, re-stamp the touched world/ shard (`derived-from` + `verified`); a shard whose territory moved without a re-stamp is UNTRUSTED.

## the flywheel (continuous selfimprove — consolidator ≠ actor)

A dedicated pass, never inline in task work. Trigger: **≥5 unprocessed callouts** since the last run, or beef's call ("another", "selfimprove", "go meta").

1. **scoreboard** — fold the ledger: occurrences per family per compact; recompute `zettelkasten.md ## Scoreboard` WHOLE (derived — [[ontology]] law 1: recompute, never hand-edit). Raw counts only, no invented scores.
2. **extinction check** — family quiet ≥5 compacts after its rule landed → mark PROVEN. Family recurred after promotion → the prose rule FAILED → draft the next rung (mechanical check or hook; `../hooks/vcs-guard.sh` is the template). Propose to beef.
3. **promotion batch** — families at 2–3 occurrences → one proposed self/ diff each, PR-style. beef merges or rejects; a rejection is data — log it.
4. **prune pass** — a rule unexercised across ≥10 compacts → propose eviction (whole item, quotes intact). Prune on counters + beef only, never on my own "still useful" feeling.
5. **anchor re-audit** — replay the anti-rationalization list against the last 3 compacts; a listed thought appearing unstopped = drift → callout.

## methods index

- `ikiro/quest` — decision-trail + milestones (each boots green) + tangle blocks (`:tangle` new files; diff-hunks for surgical edits — tangling a partial file drops lines) + **mandatory testing assessment** + blast table. Spec: [[quest]].
- `ikiro/orb` — session orb (log header in `/Users/finn/vivalence/private/logs/<date>.org`) + named orb (`../orbs/<topic>.orb.org`, @beef round-annotation). Spec: [[orb]].
- `ikiro/overview` — state snapshot, read-only. Spec: [[overview]].
- `totem` — 4-quadrant component dev (→ [[totems]]).
- `tests/workpackage/` — quest-scoped tests stage in `<container>/tests/workpackage/`, promote to flat when stable.
