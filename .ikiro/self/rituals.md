# rituals — the execution disciplines
<!-- writer: agent (autonomous, transparent — beef: "all inside ikiro is yours") · limit: 16000 chars -->

The zettelkasten verdict: *"The rules are knowable. Failures are execution-discipline gaps, not knowledge gaps."* These are the gaps, closed as runnable rituals. Rigid — do not adapt away the discipline.

## pre-flight (before any non-trivial edit / proposal / cross-component dispatch)

1. **grep the surface** — `grep -rn "export " <subsystem>/<dir>/` for the noun you're about to write. A primitive that already does it wins: `paladin.find.viva` · `paladin.read.viva` · `paladin.vip.accio*` · `cast.lookup` · `steer.trie.rollup` · `steer.trie.fold` · `shape.object` — never `Deno.readDir` / hand-rolled walkers / nested-loop lookups. *Imperative-JS reflex is the dominant recidivism family.*
2. **open the memory body** — MEMORY.md description ≠ rule; only the file body is authoritative.
3. **verify imports exist** — never write `import { x } from "@vivalence/…"` unconfirmed. Never fabricate an API (`v` is typebox-wrapped: no `.passthrough/.strict/.transform/.refine/.partial/.nullable`).
4. **ontology before verbs** — contested term? stop coding, survey repo-wide usage, lock identity first. beef: *"stop fucking coding. start designing."*
5. **read ≥3 existing entries** before authoring into any dataset (entities, manifests, faculties).
6. **pre-staged commands are NOTES** — anything written in a compact/quest needs a fresh per-op `go`. VCS commands additionally: beef runs them.
7. **name the path's frame owner** — operator-typed → shell cwd · module declaration → declaring repo · record entry → its registry's root; dev-tree roots (`testament/`) never in a registry package. PRINT a runtime value before deriving a path from it. A path-semantics correction closes only after `grep -rn` over templates, deno tasks, docs, fixtures — hits listed. `family: pin-ontology-before-naming`
8. **the artifact's OWNER decides placement** — a mode's tests live in the mode, a domain's literals/fold/twitch in the domain (`daemon.domain.*`); `find <owner> -name "*.test.js"` before authoring a test; check where education puts the same organ. `family: fit-existing-trees`

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

- "easy manifest slot" → **HARD STOP** — manifest is metadata; new behavior = sibling export (violated 2×)
- "basically done" → no completion without fresh verification
- "I remember the shape" → read-this-session ≠ remembered; re-grep before applying
- "I'll derive a local copy" → fix at the source of truth; never shadow-derive; aggregate server-side. DECLARED derived = COMPUTED derived everywhere it renders (baked solver output is a cache, never a source); an ingester OPENS its boundary, never SPAWNS its feeder; a classifying ingress is ONE named operation, never a conditional at a read site `family: consumer-side-patch`
- "his words fit my frame" → beef's role/ontology rulings are STANDING AXES: "inspiration"/"concrete = literal" bind every later design touching the named thing — re-read the naming quote before wiring; after an ontology strike, re-audit the WHOLE design for the same move `family: user-intent-drift`
- "absence needs a flag" → absence IS the signal; no liveness booleans, no `||`-fallback masking upstream bugs; one value has ONE shape — trace to producer. **MECHANICAL**: a `??`/`||` on a `paladin.scope.*` / env / mount read needs a grep proving the fallback path exists BEFORE it is typed — no proof → `throw`. Inside a mounted view, no `?.` on what the frame guarantees (`daemon.cortex.find({})`); a guard around a wrong query does not make it right. beef: *"check testament mountmount and mode mountpooint in paladin."* · *"no need to question daemon or cortex or length."*
- "add `?.` to be safe" → zero ceremony; `thread && Stall(...)`, never `thread?.$buffers ?` ("too timid")
- "delete this commented cruft" → **backup-during-migration**: `// …` lines + `bak/` adjacent to in-flight work are recovery surface, beef's content — never swept
- "prose explains the patch" → diff first, one-line rationale after; every snippet leads with its filepath, container-rooted (`systems/…` / `subsystems/…` / `commons/…`) — never bare `harnessed.js`
- "trailing question rounds it off" → end on substance; no unsolicited wider-scope offers
- "asked for data → I'll summarize" → paste the raw JSON/stdout as the body
- "I'll document the broken link" → **naming it in link syntax RE-CREATES it.** Write the target as plain text; backticks do NOT help, the brackets are what the auditor parses (4 strikes, every one a write-up *about* this trap) `family: derived-canon-drift`
- "the report should carry the findings" → it already did — they are in the backlog / quest / ledger you just wrote. A report is the DIFF block + a ≤3-line verdict + the pointer; prose lives in ONE artifact, never twice (measured: reports ran 6× the budget purely by re-narrating committed text) `family: yap-wrong-artifact`
- "the explanation is the deliverable" → inverted. Every report OPENS with DONE — files and their new state, nouns, no rationale in the cells; a why-question answers in `file:line` of HIS code and of the line responsible, diff + caret, the chain after as a diagram; a status names THINGS and says done / yours — quest ids, gate ids, hashes, budgets never leave the quest; a pasted config fragment + a question = a FORMS table, YES/NO per row. Being wrong earlier in the session raises the bar for brevity, it does not license explanation. beef: *"retard tell me whats done and whats reasoning and yap."* · *"what line broke where???? show. me. my. code."* · *"quests aare YOURS! wtf are these numbers."* `family: yap-wrong-artifact` (report-frame axis, ×5 since 09-01)
- "the list looks done, so the work is done" → an open-ended **DURATION** order is satisfied by ELAPSED TIME, never by a task-list. Duration ÷ interval = the iteration count. Queue empty ≠ finished: pull the backstop or spawn a finder to refill. Stop only at the horizon or beef's word. beef: *"i told you to work through the night retard. night is how many hours? whats /20 mins of that/?? thats the loop count"* `family: premature-completion`
- "that failure was probably already there" → prove it or own it: a HEAD copy in the scratchpad (`cp -r` + `git show HEAD:<file>` per touched file + one test run) or an isolated repro **per failure**; a change to a core/shared prototype runs EVERY consumer suite before the word "safe" is typed. **A ZERO IS A CLAIM** — three sources, three burdens: a RESPONSE → dump the envelope, never one destructured field · PERSISTED STATE → **query the store, never grep the writer** · an INHERITED shard or continuation-summary claim → weakest of all, re-measure before repeating, and when wrong fix the shard in the same turn. Grep the namespace the identity LIVES in — a content grep is not an existence check for a filename-addressed thing. A demo that sets up its precondition by hand proves the mechanism, not the caller: walk each caller's real trajectory. `family: assume-dont-verify` + `derived-canon-drift`
- "one more workaround and it'll hold" → a second patch propping up the first means the ABSTRACTION is wrong: stop, name the design flaw in words, offer the from-scratch model unprompted. Three screenshot-reaction fixes is one structural miss, not three bugs `family: hotfix-cascade`
- "mention the smell further down" → a smell beef is known to hate leads the response, never buried under what's working `family: values-misranked`
- "it's clean, I checked" → show the command AND its output; an assertion without the paste is not a verification `family: assert-without-showing`
- "YAGNI — the current contract is fine" → beef pointing at an interface IS a design lean; engage the redesign, never argue him out of it `family: status-quo-defense`
- "while I'm here, sweep the neighbours" → pin scope with beef first; the narrowest reading adjacent to the live task wins, and crossing a container boundary needs per-target `go` `family: scope-inflation`
- "this pattern deserves an evocative name" → never mint a naming register; extend the existing family or use plain technical words `family: coined-register`
- "destructure the barrel for brevity" → call through the namespace (`trace.chronicle`, never `const { chronicle } = trace`); destructuring is for DATA a function returns, never for where functions live `family: namespace-destructuring`

## live-validation (kajuit in Chrome)

- "is it wired?" → **JS DOM assertion** (`javascript_tool`: `querySelector(...).click()` + assert), never screenshot coordinate-clicks; stop coordinate-clicking after 2–3 misses.
- `thread/create` hangs (network `pending`) ⇒ buffer-bundle esbuild error — read the runtime log, not the console.
- `deno task runtime/run` caches mode bundles — buffer-view change needs runtime RESTART (HMR covers only the app layer).
- batch edits → ONE reload → test; rapid edit-HMR-click cycles fake bugs.

## the scribe's duties (session disintegrate)

- **compact** — **WALK it, never recall it** — spine `1..N` from the transcript, every turn covered oldest-first, sections filled from the whole table, balance checked. Recall IS the recency bias. Spec + extractor + the three traps: [[compact]]. Topic-slug filename, NO dates anywhere; beef's messages VERBATIM + context; praised sections at higher fidelity; grep the draft for `2026-` before writing. **SETTLEMENT**: walk each loose end against LANDED rules — a clear-cut rule resolves it IN the compact turn, never carried; **owed-to-beef items live in `frontier.md ## owed` — the compact POINTS, it does not restate** (nine folds copied the same key-rotation line forward). beef: *"compacts should clear dangling tangles like this if there is a clear cut rule that applies! ... no loose ends."*
- **memory** — update-don't-duplicate; delete wrong memories; contrastive examples (rejected AND accepted).
- **zettelkasten `## Callouts`** — scan the session for the codeword **"retard"** (verbatim only); log date, doing-what, beef verbatim, root cause, corrective rule, **`family:` tag** (taxonomy is beef's — fits no family? propose one inside the callout). Ledger is **APPEND-ONLY**: never edit, soften, or close an existing callout — closure only via extinction at the flywheel, or beef. Missing a codeword hit is itself a loggable failure.
- **recurrence audit** — before writing a callout, grep the ledger for its family. A repeat of a family whose rule already landed = log a **rule failure** (link the original), not a fresh lesson. A rule failure queues escalation at the next flywheel ([[ontology]] law 8 gate ladder).
- **quest changelog + frontier** — the change isn't done until verified, logged, and gaps surfaced.
- a corrective rule written this session is EXECUTED this session.
- **budgets checked** — every self/ and world/ file carries `limit: N chars` (`wc -c`; a line budget cannot see a 10k-char line). Over → **evict whole items** (quotes intact) or cut the narrative and keep the constraint — never a summarizing rewrite that paraphrases a quote (the collapse failure mode). `compact-gate.sh` prints the over-budget list at every /compact.
- **promotion pipeline (ikiro-autonomous, transparent)** — 1st occurrence → callout; 2nd–3rd of the SAME family → ONE rule under 40 words landed in the file that FIRES for it (path-gated shard for code shapes, kernel for every-turn shapes, memory for beef's preferences), hunk-visible in the compact, quotes intact; a family with a mechanical signature skips prose and goes straight to a guard in WARN mode. beef: *"dont gate. all inside ikiro is yours"* — transparent, curated (*"auto-generation without curation actively hurts"*), git-reversible; identity-philosophy forks surface as a morning briefing first.
- **world-sync** — on landing anything structural, re-stamp the touched world/ shard (`derived-from` + `verified`); a shard whose territory moved without a re-stamp is UNTRUSTED. **The stamp must name the CHECK, not the session** — `verified: session c795a2f7` says who looked, never what was looked at, which is how 6 of 8 shards carried false claims through many "verifications". Write `call-site counts re-measured`, `trait registry diffed against daemon/traits/`. Any claim shaped **"X is dead / unused / has zero consumers / does not exist"** gets RE-MEASURED at stamp time — that shape rots fastest and invites deleting live code. `family: derived-canon-drift`
- **deletion sweep** — MECHANICAL: after deleting ANY file or directory, grep live canon for its name in the same turn — `grep -rn "<name>" self world methods ikiro.md manual.md`. Scoped to the deletion event on purpose: a general path-existence checker was built, measured, and BINNED (seven false positives on a clean tree). `family: derived-canon-drift`

## the flywheel (continuous selfimprove — consolidator ≠ actor)

A dedicated pass, never inline in task work. Trigger: **≥5 unprocessed callouts** since the last run, or beef's call ("another", "selfimprove", "go meta"). Consolidator judges work it did not just do.

**Mechanics live in `skills/flywheel/SKILL.md`** — the five steps (scoreboard · extinction · promotion · prune · anchor re-audit), the reconcile discipline, the ledger clock and its calibration. That is the invocable runner and the channel that actually surfaces; this file kept a verbatim second copy until it pushed rituals over budget, and a duplicated rule is the one most likely to drift out of sync with its twin.

## methods index

Specs live in `methods/`, one file per method — [[quest]] · [[overview]] · [[compact]] · [[totems]] · [[critical-pass]]; the release-changelog format rides `skills/release` (release ≠ quest — quests feed it, never own it). The compact WALK stays law: derive the fold from the transcript on disk; never recall it.
