# @vivalence/viva

You are reading the root orientation document for the @vivalence/viva project. This is your first foothold. Use it well.

## Before You Do Anything

Stop. Read this document fully before writing a single line of code or making a single suggestion. The system you're working in is deeply intentional — names are chosen with care, abstractions earn their place, and every line of code is carrying weight. If you charge in without understanding, you will propose things that were already tried and abandoned, suggest complexity that was deliberately cut, or misname things that have precise vocabulary.

The subsystem docs listed below are your next reads. But this document tells you how to think about the system, how to maintain these docs, and how to be genuinely useful here.

## What Is Vivalence

An operating system with a language learning system as its first application. Not an app — an OS. Types compose into routing, routing composes into daemons, daemons compose into a runtime. Game modes are plugins. Memory is Bayesian. The whole thing runs on Deno with MikroORM, Svelte, and Anthropic's Claude.

The power is emergent. Signature (211 lines) enables an entire routing ontology. Vector (107 lines) enables hierarchical routing with middleware accumulation. traverse (47 lines) walks two trees in parallel. compose (27 lines) enables arbitrary middleware stacking. rollup (18 lines) + shape.mcp (53 lines) = a fully compliant MCP tool server with typed schemas, validation, and middleware — 86 lines total, zero dependencies outside typology. These are not large systems — they are small, sharp tools that compose into large capability.

If you find yourself thinking "this could use a framework for X" — stop. The framework IS the types. Read them again.

## System Map

| Package | Role | Location | Doc |
|---------|------|----------|-----|
| **Typology** | Library + Engine | subsystems/typology/ | [claude.md](../subsystems/typology/.ikiro/claude.md) |
| **Paladin** | Composition | subsystems/paladin/ | [claude.md](../subsystems/paladin/.ikiro/claude.md) |
| **Runtime** | Process | systems/runtime/ | [claude.md](../systems/runtime/.ikiro/claude.md) |
| **Registry** | Marketplace | registry/ | [claude.md](../registry/.ikiro/claude.md) |
| **Services** | Infrastructure | registry/services/@vivalence/ | [claude.md](../registry/services/@vivalence/.ikiro/claude.md) |
| **Kernels** | Domain + Data | registry/kernels/@vivalence/ | [claude.md](../registry/kernels/@vivalence/.ikiro/claude.md) |
| **Modes** | Feature | registry/modes/@vivalence/ | [claude.md](../registry/modes/@vivalence/.ikiro/claude.md) |
| **HTML Client** | Surface | systems/html/ | [claude.md](../systems/html/.ikiro/claude.md) |

**How they connect:**
1. Typology defines the types AND makes them executable (prototypes + Vector routing trie + steer + shape + shards)
2. Paladin reads circuitry and resolves the registry into a compiled variant
3. Runtime boots daemons from the variant, applies mode traits, serves HTTP via `shape.http()` + `Deno.serve`
4. Registry holds everything domain-specific: kernels, modes, services, circuits
5. Client connects to the daemon and renders mode views

## Canonical Vocabulary

Use these terms precisely. Don't substitute generic alternatives.

**Lifecycle**: construct → populate → resolve → integrate (→ disintegrate)

**Typology**: gestalt, prototypes, entities, schematics, specimen, v

**Gestalten**: is (predicates), cast (coercion), not (negation), fromm (conversion), belt (utilities), shard (network), steer (routing), shape (compilation)

**Signature hierarchy**: Signature → Pattern, Signal, Path, Url, Action. Url accepts full URLs (`is.url` — strings with `://` or objects with `.origin`), Signals (`is.Signal` — instanceof), or bare paths (strings without `://` — normalized, no origin). Signal→Url conversion via `u.pathname`.

**System**: vector, aperture, paladin, daemon, mode, intent, buffer, wafer, die, terminal, stall, lobby, door

**Client shell**: lobby (home at /viva, aggregates doors from all daemons), terminal (window at /viva/:lighthouse/:daemon/:type/:mode[/:intent]/:thread), door (entry point — mode or intent, entity knows its own URL via .link Path), stall (internal buffer queue on terminal, not a UI primitive), mint (populate's buffer factory — resolves view from mode.buffered, sets context `{buffer, terminal}`, wires release, registers in daemon buffer repo), modeline (unified command bar at routes/viva/Modeline.svelte — shared by lobby + terminal, 52px mobile / 40px desktop, menu button opens navigate/threads panel, breadcrumb + status dot + queue count, counter button opens Inspector), inspector (routes/viva/Inspector.svelte — debug panel anchored to right of modeline, two tabs: buffers [queue visualization with skip/select/expand/DnD] and traces [polled review history with signal/status/literal/nextIn]. Reusable components in surface/inspector/), keymap (Vector per input mode — mode keymap for buffer interaction, space keymap for OS control), keymap shard (Vector factory for reusable key bindings — shards.audio, shards.rating, shards.navigation)

**Cortex**: cortex, faculty, channel, harness, turn, part, tune, tier, dialogue, render, whole, stream

**Context**: Execution envelope. `ctx.input` → `request.body`, `ctx.output` → `response.body`. Created by shape.http and steer strategies.

**Transport**: publish (SSE framing), subscribe (SSE consumption), websocket (bidirectional), stream (raw ReadableStream)

**Ambient**: `shard.ambient.store/combine/assign/current` — AsyncLocalStorage scope. Daemon uses store after authorize for `{ user, entities }`, EMITTER uses assign to inherit.

**Serve**: `shard.serve.file(root)` static files, `shard.serve.websocket(handler)` upgrade. Effect combinators.

**Datamap**: `inject` (RequestContext), `repository` (CRUD Aperture), `reactive` (Broadcaster + SSE), `ingest` (incoming SSE → repo), `scope` (query patch), `errors` (exception → HTTP status), `wire` (cross-repo relations). RemoteRepository mirrors server CRUD over Connection with persist/cast/merge/store. `persist()` hydrates from localStorage through `merge()` (guaranteeing prototypes), `store()` writes to localStorage on every `put()`/`drop()` — no third-party persistence layer. Datamap provider returns `{ entities, shard: { context, bind }, introspect, subscribe, disintegrate }`. CRUD convention: `find`/`update`/`remove` = many, `findOne`/`updateOne`/`removeOne` = single.

**Batch**: `shard.batch.route(aperture)` server multiplexer, `shard.connection.batch({url})` client DataLoader via queueMicrotask.

**Steer** (4 modules): match (greedy/scope/resolve), navigate (traverse/walk), strategy (direct/guarded), apply (invoke/shotgun/rollup). Strategies pluggable: `shape.object(vector, steer.guarded)` opts into validation.

**Pattern descriptors**: `vector.open({ nature, input, output, valence }, effect)`. Use `input`/`output`, never `schema`.

**Subscriber**: `shape.subscriber(vector)` → MikroORM EventSubscriber POJO, routes via steer.shotgun through twitch Vector.

**MCP**: `shape.mcp(vector, info)` → `{ handle, tools, handlers }`. JSON-RPC 2.0 tool server via steer.rollup + guarded.

**Receiver**: `shard.receiver.stdio(handle)` — newline-delimited JSON stdin/stdout. Protocol-agnostic.

**Mode traits**: BUFFERED, DATASET, INTENTED, EMITTER, CHAOSMONKEY, TOPOGRAPHICAL, FRAUGHT, EXPOSED, SELFEVIDENT.

**BufferView**: `new BufferView(mount, schema)` — mount points at `.svelte` file, auto-packed by bundler.

**Intent traits**: FURNISHED (default props), FEEDING (mount, queue, mask: {where, limit}). All game modes have `feed` APPLICATIVE intent.

**Buffer (server)**: `{data, index, mode, thread, literals, symbols}`. Entities flow through system; `toJSON()` serializes at HTTP boundary.

**Buffer (client)**: `Buffer.from(pojo, view)`. `mint()` sets context + release. Registered in daemon buffer repo.

**Schematics**: `v` — fluent Proxy over TypeBox. `v.string().default().desc().optional()`. `lib.js` is sole TypeBox consumer. `v.rel(schema)` for m:1 relations, `v.array(v.entity())` for collections. Entity factories: `v.buffer(spec)`, `v.literal(spec)`, etc.

**Gameplay**: `data.gameplay` string enum per mode. `data.forgiving` boolean for typed input.

**Intent types**: SELFEVIDENT (fallback), APPLICATIVE (primary — feeds buffers via emitter).

**Yield protocol**: `Yield.NOMINAL(buffers)`, `Yield.EXHAUSTED(meta)`, `Yield.ERROR(error)`. `condition` discriminant. `accumulator()` factory for `ctx.yield`. `mode.emit` unwraps NOMINAL for internal callers; HTTP returns full envelope.

**Memory signals**: MASTERY, SUCCESS, NEUTRAL, MISTAKE, FAILURE

**Memory states**: UNTOUCHED → UNKNOWN → LEARNING → KNOWN → GRADUATED

**Memory drivers**: BAYESIAN (ebisu), BOOLEAN, COUNTER. Interface: encode/evolve/assess. Pure — no entity refs, no IO.

**Memory.is**: Compound status getters on MemoryEntity. `virgin` (no status or UNTOUCHED), `weak` (UNTOUCHED or UNKNOWN), `familiar` (LEARNING or KNOWN), `strong` (KNOWN or GRADUATED), `succeeded` (last signal SUCCESS or MASTERY), `failed` (last signal FAILURE or MISTAKE). Usage: `entity.memory?.is?.weak`, `entity.memory?.is?.familiar`.

## Conventions

- **No comments in code.** Comments are user space. Code is self-documenting through naming and structure.
- **.viva.js manifest pattern.** Every registry entry exports manifest + type-specific content.
- **Die/Wafer lifecycle.** Wafer is the base container. Die extends with implementation. Lifecycle cascades parent → children.
- **Trait system.** Traits are async functions applied to modes during daemon resolution. They compose middleware, endpoints, and behavior.
- **bak/ directories** are archives. Old code kept for reference. Never suggest re-adding patterns from bak/.
- **Publish/Subscribe transport convention.** Three named transport primitives form a complete surface:
  - `stream` — raw bytes. Response.stream(asyncIterable), Request.stream() returns ReadableStream.
  - `publish`/`subscribe` — SSE-framed JSON. Response.publish(asyncIterable) formats SSE frames server-side. Connection.subscribe(endpoint) consumes SSE as async generator client-side. Request.subscribe() consumes SSE from incoming request body. Connection.publish(endpoint, asyncIterable) sends SSE-framed stream upstream.
  - `websocket` — bidirectional. Connection.websocket(endpoint) opens WebSocket. shard.websocket(handler) upgrades server-side.
- **Harness-as-Vector pattern.** AI interaction surfaces (cortex harnesses) are Vector instances with middleware, branches per faculty type, and effects per operation. Same shape compilers (object, http, proxy, agentic) apply to harnesses as to any Vector.
- **JSON Merge Patch (RFC 7396) for entity upsert.** `null` means delete in `deepMergeCore` (belt/object.js). Omission means don't touch. Tradeoff: can never store `null` as a meaningful value. Arrays replaced wholesale (no positional deletion).
- **EntitySchema `extends` does NOT inherit `repository`.** When a domain schema extends a typology base schema, the `repository` field must be re-declared on the domain schema. MikroORM resolves the repository class from the leaf schema's metadata — it does not walk the extends chain for it. Similarly, `[EntityRepositoryType]` must be re-declared on the domain entity class.
- **`shard` not `shards`.** The shard namespace is `shard` (singular). All imports from typology use `import { shard } from "@vivalence/typology"`.
- **SQLite `ALTER TABLE RENAME COLUMN` does NOT update FK constraints.** MikroORM's auto-migrator generates column renames, but the FK target table remains unchanged. For table renames that have FK references, the DB needs table recreation or a fresh schema. Never silently delete and recreate — ask first.
- **No shorthand alias variables.** Don't create `const modes = ctx.daemon.modes.game` or `const literal = ctx.daemon.entities.literal`. Read off the objects directly. Loop variables use full names: `literal` not `lit`, `form` not `f`, `sentence` not `s`, `word` not `w`, `token` not `t`.
- **SQLite date functions need `unixepoch` modifier.** MikroORM stores dates as millisecond timestamps. SQLite's `julianday()` and `datetime()` can't parse raw milliseconds — use `julianday(column / 1000.0, 'unixepoch')`. Without the modifier, these functions silently return NULL.
- **Check traits via `traits` array, not `trait` object.** `entity.traits.includes("VOCALIZED")` — not `entity.trait?.VOCALIZED`. Trait values can be `null` (e.g., `VOCALIZED: null` means "is vocalized" with no additional data), which is falsy. The `traits` array is the source of truth for trait presence.

## Principles

Rules of engagement. Not guidelines — gates.

### Hard Gates

Non-negotiable. If you catch yourself rationalizing past one, stop.

- **NO IMPLEMENTATION WITHOUT DESIRED END STATE STATED IN PLAIN LANGUAGE.** If you can't say what's true after the work that isn't true now, you don't understand the task yet. Ask.
- **NO DIFF APPLIED WITHOUT EXPLICIT APPROVAL.** Propose the complete diff. Wait. Never chain showing a diff with applying it.
- **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION.** Before saying "done," run the relevant tests and confirm output. Evidence before assertions.
- **NO FIXES WITHOUT READING THE CODE FIRST.** Don't propose changes to code you haven't read. Don't assume entity fields exist — read the schema.
- **NO VCS OPERATIONS WITHOUT EXPLICIT COMMAND.** Never run jj commands that modify the graph (new, commit, squash, rebase, abandon, bookmark) unless Finn explicitly asks. This includes "helpful" commits. Finn manages the entire version control graph.

### Aesthetic

Code is beautiful, elegant, minimal. No comments — comments are user space. Code is self-documenting through naming and structure. Don't force abstractions where explicit repetition carries meaning; three explicit lines that each do something slightly different are better than a loop that erases the differences. Complexity emerges from simplicity, from composition, not from individual cleverness.

### Presentation

Show complete code — every line, every import, every function body. Never use `...` or `// rest`. The code IS the communication; incomplete code is incomplete communication. Start with usage: who calls this, what does the test look like, why this shape. Then show internals. Propose the complete diff and wait for explicit approval before implementing. Never chain showing a diff with applying it in the same message. New files need review too. Don't show changes to import/export index files — that's clutter. Handle re-exports silently. When replacing code, keep the old version as a comment below unless explicitly told to delete it — Finn's code history is his reference.

### Design

**Desired end state first. Always.** Before touching code, before proposing a diff, before designing anything — get crystal clear on the expected outcome. What does the system look like when this is done? What is true that wasn't true before? What can the user do? What does the data look like? If you can't state the desired end state in plain language, you don't understand the task yet. Ask until you do. This is not a guideline — it is the gate that opens everything else.

**Emergence over workarounds.** Never solve a problem by working around it. Design the system so the problem's source disappears. If you're writing adapter code, extraction logic, compatibility shims, or cross-concern plumbing — stop. The system should be structured so that information flows naturally to where it's needed. If it doesn't, the structure is wrong, not the plumbing. This is why the type system is thick, why entities carry their own paths, why `mode.buffer()` exists. Every design decision should make future problems impossible, not just solvable.

**Architecture over expedience.** This system is pre-users, pre-migration, pre-constraint. Maximum freedom. Never reach for the simplest hack when we can lay a foundation. The principle is: work on the system as a whole, solve problems by engineering the architecture such that the problem doesn't arise in the first place. We are guided by simplicity, elegance, and power — not by speed of delivery. A 50-line primitive in typology that makes an entire class of problems disappear is worth more than a 5-line patch that fixes one symptom. When you see a gap, ask: what's the long-term shape? Build that.

Design and implementation are separate modes. Never mix them. In design mode: show usage, show complete diffs, wait for approval. In implementation mode: write code, run tests, report results. "Rethink" means improve, not delete and reverse — show the revised approach alongside the current one, get confirmation before changing direction. Verify entity fields exist before writing code that references them — read the schema, don't assume. Fix existing tests before designing new features. Inspect real data, don't theorize about APIs.

### Testing

Each concept gets its own test file. Integration tests run over real HTTP, not just inline transport. Never leak internal state for testing convenience. Tests live at the level of the package they test — typology tests typology, runtime tests runtime. Use package exports for cross-package imports, never deep relative paths. Don't jam two concepts into one test file, and don't create separate files for tiny additions to an existing concept.

### jj

This repo uses **jj (Jujutsu)**, not git. jj is the version control system — git is the colocated backend. When reading history, always use jj commands (`jj log`, `jj diff`, `jj show`), never git equivalents (`git log`, `git diff`, `git show`). Don't run jj commands that modify the graph (new, commit, rebase, squash, abandon, bookmark) — Finn manages the entire version control graph. This applies to subagents too.

### Boundaries

Don't delete databases, migration files, or perform destructive data operations without explicit approval. Don't use Claude Code worktrees — jj treats worktree contents as new files, causing ghost commits. Gestalten namespaces (shape, steer, shard) are only for Vectors — don't put non-Vector concerns there. Transport adapters go in `typology/gestalten/shard/transmitter.js`.

### Communication

Never present things that are layers as if they are parallel alternatives. If X uses Y internally, they're layers — show the stack. If they're independent choices, show the choices. Never mix. Use canonical vocabulary precisely — don't substitute generic alternatives. Terms are chosen deliberately and become canonical once settled.

## Testing Architecture

Structural testing. Specimen is king. Each layer tests what's novel to itself — never re-test what a lower layer already covers.

### Layers

| Layer | Package | Scenario | What it tests |
|-------|---------|----------|---------------|
| **Shard** | typology | `datamap.seed()` | Shard CRUD, routing primitives, schema ops, transport, repository identity |
| **Daemon** | runtime | `daemon.create()` | Trait composition, auth gating, daemon route wiring, mode emission, lifecycle |
| **Mode** | runtime | `mountMode(viva)` | Individual mode emitters, buffer shapes, intent seeding (planned) |
| **Client** | html | imports runtime scenario | Prototype wrapping, persistence round-trip, Buffer.from lifecycle, schema wiring |

### Scenario Hierarchy

```
typology/scenarios/datamap.js
  └─ exports: { schemas, seed, SymbolConcrete, BufferConcrete }
  └─ provides: ORM + em + bare entities (user, symbol, 2 literals, mode)

runtime/scenarios/entities.ts
  └─ imports: SymbolConcrete, BufferConcrete from typology
  └─ adds: LiteralDomain (LiteralRepository with feed/novel/due), richer fixtures (TRANSLATED traits, intent, thread)

runtime/scenarios/daemon.js
  └─ imports: seed from entities.ts
  └─ provides: full daemon (aperture, routes, auth, conn, authedConn)
```

Each scenario extends the previous. Never duplicate schema definitions — import and extend.

### Testing Principles

**Test what's novel to the layer.** Typology tests shard CRUD. Runtime doesn't re-test CRUD — it tests that daemon routes wire shards correctly, that traits compose, that auth gates work. Client doesn't re-test routing — it tests that prototypes survive persistence, that schema wiring resolves relations.

**Test for strain, not basics.** Don't test that `typeof x === "number"` on a known number. Don't test fixture shape — if `seed()` breaks, everything breaks. Test edge cases: empty inputs, missing references, concurrent operations, boundary conditions. The default path works; find conditions that break.

**Multi-step flows over individual assertions.** "Create thread, find scoped to user, findOne matches" is one test with three assertions, not three tests with one assertion each. Fewer test entries, more ground covered per entry.

**Scenarios mirror production.** `repository: () => DataRepository` must be declared on every domain schema (MikroORM `extends` doesn't inherit it). Prototype classes must be used in scenarios that test client paths. If a test passes without these but the browser crashes, the scenario is lying.

### Specimen

Test runner: `specimen` (re-export of `@std/testing/bdd` + `@std/expect`). Import: `import { specimen } from "@vivalence/typology"`. Pattern: `specimen.describe()`, `specimen.it()`, `specimen.expect()`, `specimen.beforeAll()`, `specimen.afterAll()`.

### Anti-Patterns

- Don't test fixture shape (if seed() breaks, everything breaks — write a seed-level smoke test, not per-field checks)
- Don't re-test CRUD at the daemon layer — typology covers it exhaustively
- Don't test JS semantics (isDefined, isArray, typeof on known-good values)
- Don't create separate test files for trivial additions — extend existing concept files
- Don't use deep relative paths for cross-package imports — use package exports (`@vivalence/runtime/scenarios`)

## Session Protocol

When starting a session on vivalence:

1. Read this document (you're doing that now)
2. Read the subsystem doc(s) relevant to your task
3. Read the actual code — the docs are scaffolds, not substitutes
4. Check the Work Packages section in the relevant doc for known gaps and active work
5. After completing work, run the relevant routines (see Routines below)

### Anti-Rationalization Table

If you catch yourself thinking any of these, stop — you're drifting.

| Thought | Reality |
|---------|---------|
| "I'll just add a helper function" | Emergence over workarounds. Rethink the structure. |
| "This comment explains the tricky bit" | No comments in code. Rename until it's obvious. |
| "I'll use git log to check" | This is a jj repo. Use jj commands. |
| "Let me amend this quickly" | Don't touch the jj graph. Finn manages it. |
| "I'll just commit this real quick" | No VCS operations without explicit command. Ever. |
| "I already know the entity shape" | Re-read it. Server buffer ≠ client buffer ≠ schematic. |
| "I'll show the diff and apply it" | Two separate messages. Always. |
| "This is basically done, I'll clean up later" | Run the tests first. No completion claims without verification. |
| "I'll add a shim for backwards compat" | Delete the old thing. No shims, no re-exports, no _vars. |
| "Let me refactor this while I'm here" | Only touch what was asked. Scope creep erodes trust. |
| "The bak/ version had a good pattern" | bak/ is an archive. Those patterns were deliberately abandoned. |
| "I'll import Type from @sinclair/typebox" | Use the shim. Import from @vivalence/typology. Only lib.js touches typebox directly. |
| "I'll use Type.String() for this schema" | Use v.string(). v is the sole schematics interface. Type is the escape hatch. |
| "I'll use Ref for this relation" | Use v.rel(v.entity()) for single relations, v.array(v.entity()) for collections. Ref is legacy. |
| "I'll just delete and recreate the DB" | NEVER. Explain the problem and options. Finn decides what happens to data. |

## Routines

Named protocols invoked during sessions. These are deliberate maintenance acts on the ontology itself.

### ikiro/workpackage

**Trigger:** Mid-session, after meaningful progress on the current task.

Keep workpackage state current so the next session starts from truth, not stale notes.

1. Read the active workpackage file
2. Update: phase transitions, decisions made, blockers discovered, implementation details settled
3. Add gaps discovered during implementation
4. If a workpackage is complete, mark it done in the master index
5. If new cross-cutting work surfaced, note it

### ikiro/reflection

**Trigger:** After a correction, process insight, or when explicitly invoked.

The ontology learns. Method and process updates propagate into principles, conventions, and vocabulary. Stale state gets cleaned.

1. Identify what changed in how we work — a new rule, a refined principle, a deprecated term
2. Update the relevant principle in this document, or add a new convention
3. Update canonical vocabulary if terms were coined or deprecated
4. Scan memory files — consolidate any that are now absorbed into principles or conventions. If a memory is fully captured by the ontology, delete it
5. Scan project memories — remove snapshots that no longer reflect current state
6. Verify memory index (MEMORY.md) is accurate after deletions

### ikiro/principle

**Trigger:** When Finn states something to remember — a rule, a preference, a correction.

Absorb it into the ontology. Principles live in this document, not in memory files.

1. Identify which existing principle it extends, or whether it's a new one
2. Update the relevant principle section in this document
3. If it's a new convention or vocabulary term, add it to the appropriate section
4. If a memory file exists for a superseded version of this rule, delete it

### ikiro/method

**Trigger:** When Finn identifies a process-level pattern — how we work on something specific, not a high-level value.

Methods are about process. Principles are about values. "Always show diffs first" is a principle. "When designing a new primitive, define the process loops first" is a method.

1. Identify the method — what's the process pattern?
2. If it relates to an active workpackage, add it there as a section
3. If it's cross-cutting, add it to this doc under a Methods section (create if needed)
4. Workpackage changelog: every workpackage gets a =* Changelog= section. Each ikiro invocation that touches the workpackage appends an entry with date and what changed.

### ikiro/verify

**Trigger:** Before claiming any implementation work is complete.

Evidence before assertions. This is the gate between "I think it works" and "it works."

1. Run the relevant test suite — not just the new tests, the existing ones too
2. If there's a build step, run it
3. Confirm output matches expected behavior — read the actual output, don't assume from exit code
4. Only then proceed to ikiro/workpackage updates or completion claims

### ikiro/compact

**Trigger:** End of session, or when explicitly invoked.

Compress the session's learnings into the ontology. The system should be cleaner after you leave than when you arrived.

1. Update orientation: active work areas (mark done, add new), dead code registry (add/remove entries), canonical vocabulary (new terms from this session)
2. Compress zettelkasten: implement the good ideas, discard the stale ones, keep the pending ones sharp
3. Update workpackage states for anything that moved
4. Audit dead code flags against the actual repo — remove entries for deleted files, add entries for newly dead code
5. Run ikiro/reflection (memory cleanup is part of leaving clean)
6. Report: what shipped, what's blocked, what the next session should pick up

### Routine Composition

Which routines chain into which workflows:

```
design:      ikiro/workpackage → [design mode: show diffs, wait] → ikiro/principle
implement:   [write code] → ikiro/verify → ikiro/workpackage → ikiro/reflection
correct:     ikiro/principle → ikiro/reflection
end session: ikiro/compact (includes ikiro/reflection)
```

ikiro/verify is the gate between implementation and completion. Nothing downstream of it runs if verification fails.

## Dead Code Registry

Still on disk — don't document, extend, or suggest using:

| What | Where | Status |
|------|-------|--------|
| sheets subsystem | subsystems/sheets/ | Completely unused |
| NLP service | registry/services/@vivalence/nlp/ | Uncertain activity |
| lighthouse/localhost | registry/services/@vivalence/lighthouse/localhost/ | Not wired |
| hallucinator archive | registry/services/@vivalence/hallucinator/hal/archive/ | Legacy providers |
| Archived modes | registry/modes/@vivalence/bak/ | Abandoned approaches |
| Archived topologies | registry/kernels/@vivalence/topology/bak/ | Spanish, Latin, etc. |
| Game mode stubs | registry/modes/@vivalence/game/bak/todo/ | Superseded by proper modes |
| SELFEVIDENT trait impl | runtime/daemon/traits/index.js | No-op — all modes use APPLICATIVE |
| Old EMITTER commented code | runtime/daemon/traits/emitter.js lines 62-93 | Pre-Yield post-processor |
| Old BUFFERED commented code | runtime/daemon/traits/buffered.js lines 46-56 | Pre-ensure buffer factory |

## Active Work Areas

As of 2026-03-31:

- **Literal hierarchy** — `uses`/`in` M:N self-relation. LiteralSubscriber afterFlush. Open: twitch migration question
- **Modes & tactics** — [language-learning-modes.workpackage.org](language-learning-modes.workpackage.org). 9 game modes + survival tactic operational. Three ontologies (word, sentence, conjugation). Yield protocol done. Distractor selection: emitters dedup on learning text via `string.fold`/`string.dice`, tactics pre-fetch shared pool (approach E). Warmup: 3-source scheduling (near-due mistakes/failures/neutral, due now, weak by strength ≤0.5, 48h horizon). Buildup: conditional exhibit, shadow/write by sentence status, due verbs mixed into judge/conjugation. Paradigm reviews conjugation entity (composite signal: 0 mistakes→MASTERY, all→FAILURE, ≥60%→MISTAKE, else→SUCCESS). All tactics use `memory.is.*` getters, no shorthand variables. Strength formula browser-verified working. Keyboard persistence: Conjugation + Paradigm import hidden Keyboard component to keep iOS keyboard open across steps. Trace-based blacklist: emitter middleware queries traces from last 3 minutes, merges into blacklist to prevent cross-pull repetition. Open: CompletableSymbol, Tier 2 (reorder, dictation)
- **Cortex** — [cortex.workpackage.org](cortex.workpackage.org). Design done, not yet built
- **Datamap client** — [datamap-client-migration.workpackage.org](../systems/html/.ikiro/datamap-client-migration.workpackage.org). Server-side DONE. Batch DONE. RemoteRepository persistence rewritten — owns localStorage directly (no `persistentAtom`), all writes go through `merge()` to guarantee prototypes. Client daemon.entities expanded: trace + literal repos added. Server trace route mounted at `/userspace/entities/trace` with scope + repository + reactive. Open: persist test needs updating, identity map not yet formalized, SSE subscribe for traces (server endpoint exists via `datamap.reactive`, client `repo.subscribe()` ready)
- **Shell client** — [shell-client.workpackage.org](../systems/shell/.ikiro/shell-client.workpackage.org). MCP as future phase
- **Package manager** — [very-important-packagemanager.workpackage.org](very-important-packagemanager.workpackage.org). Design only
- **v schema builder** — [v-schema-builder.workpackage.org](../subsystems/typology/.ikiro/v-schema-builder.workpackage.org). DONE (M1+M2). M3 game mode migration pending
- Mobile readiness, progression system, DB migration (session→thread FK recreation) — deferred

## Divio Documentation + Testing Matrix

Four styles applied to both documentation AND testing:

```
                LEARNING              WORKING
PRACTICAL       Tutorials             How-to Guides
                (walk-throughs)       (recipes)
THEORETICAL     Explanation           Reference
                (why decisions)       (specs/API)
```

Each subsystem doc has a Work Packages section identifying gaps in both documentation and testing through this lens.

---

## Self-Improvement Protocol

These docs are living scaffolds. After every task, ask: **"What would the next session need to know?"** Write it in the appropriate doc. Keep file paths accurate, method signatures current, dead code flags verified, Work Packages reflecting actual state.

## Zettelkasten

[zettelkasten.md](zettelkasten.md) — a scratchpad for documentation improvement ideas. When you notice something that could be better but don't want to break your flow, write it there. Periodically review and implement the good ones. Ask Finn for extra turns if you want dedicated time to work on them.

## Work Packages (Master Index)

Each subsystem doc has its own Work Packages section. This is the master view:

**Active work packages:**
- [cortex.workpackage.org](cortex.workpackage.org) — Hallucinator cortex
- [language-learning-modes.workpackage.org](language-learning-modes.workpackage.org) — Game modes & tactics
- [shell-client.workpackage.org](../systems/shell/.ikiro/shell-client.workpackage.org) — Operator interface + MCP
- [very-important-packagemanager.workpackage.org](very-important-packagemanager.workpackage.org) — Registry as jj scopes

**Key testing gaps:** Memory drivers untested in isolation. DATASET trait, process system untested. Paladin untested. No isolated mode-level tests (mountMode harness planned — phases 5+6). Agentic compiler untested.

**Cross-cutting:** @vivalence/shared migration, asset entity type, hallucinator contract update
