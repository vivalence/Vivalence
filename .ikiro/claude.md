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

**Client shell**: lobby (home at /viva, aggregates doors from all daemons), terminal (window at /viva/:lighthouse/:daemon/:type/:mode[/:intent]/:thread), door (entry point — mode or intent, entity knows its own URL via .link Path), stall (internal buffer queue on terminal, not a UI primitive), mint (populate's buffer factory — resolves view from mode.buffered, sets context `{buffer, terminal}`, wires release, registers in daemon buffer repo), modeline (unified command bar at routes/viva/Modeline.svelte — shared by lobby + terminal, 44px mobile / 32px desktop, menu button opens navigate/threads panel, breadcrumb + status dot + queue count), keymap (Vector per input mode — mode keymap for buffer interaction, space keymap for OS control), keymap shard (Vector factory for reusable key bindings — shards.audio, shards.rating, shards.navigation)

**Cortex**: cortex, faculty, channel, harness, turn, part, tune, tier, dialogue, render, whole, stream

**Context**: `new Context({ request: { body, url, method, headers, raw }, params, signal, steps })` — execution envelope. Object.assign then field-by-field defaults (request→Request, response→Response, params→{}, state→{}). `ctx.input` proxies to `request.body`, `ctx.output` proxies to `response.body`. Created by shape.http (full HTTP request) and steer strategies (body + signal as url). Connection creates Request directly for client-side calls.

**Transport**: publish (server-side SSE framing via Response), subscribe (client-side SSE consumption via Connection/Request), websocket (bidirectional via Connection/shard.serve), stream (raw ReadableStream via Response/Request)

**Ambient**: `shard.ambient.store(resolve)` — middleware wrapping `next()` in AsyncLocalStorage with `resolve(ctx)` as the store value. `shard.ambient.combine(fn)` — middleware calling `fn(ctx, store)` for imperative merge. `shard.ambient.assign(fn)` — middleware calling `object.assign(ctx, fn(store))` for deep merge. `shard.ambient.current()` — read the store directly. Used by daemon: `store` after authorize puts `{ user, entities }` in scope, `assign` on EMITTER vector inherits them into shape.object contexts.

**Serve**: `shard.serve.file(root)` — static file serving effect (MIME detection, Deno.open streaming). `shard.serve.websocket(handler)` — WebSocket upgrade effect. Both are effect combinators returning arity-1 handler functions.

**Datamap**: shard.datamap.inject (datamap provider → RequestContext per request + ctx.entities), shard.datamap.repository (MikroORM repo → CRUD Aperture), shard.datamap.reactive (repo + twitch Vector → Broadcaster + /subscribe SSE), shard.datamap.ingest (incoming SSE → repo mutations), shard.datamap.scope (ctx → patch middleware), shard.datamap.errors (exception → HTTP status), RemoteRepository (client-side generic repo over Connection — identity map via `merge`/`_upsert`, `resolve` hook for re-enrichment after upsert, `_upsert` skips undefined incoming values), Broadcaster (async pub/sub with filtered subscriptions + timeout), EntityStore (schema-driven repo wiring — Phase C). **Datamap service provider** returns opaque interface: `{ entities, shard: { context(fn), bind(name, resolve) }, introspect(), subscribe(sub), disintegrate() }`. `bind` is a middleware factory: `bind("user", (ctx) => ({ user: ctx.user.id }))` returns shard-shaped `(ctx, next)` that calls `setFilterParams`. Entity schemas declare MikroORM filters natively via `filters: { user: { cond: (args) => ({ user: args.user }), default: true } }`. No `@mikro-orm/*` imports outside typology/entities, domain entities, and the service itself.

**Steer** (4 modules): **match** — greedy, scope, resolve (pattern matching at one node). **navigate** — traverse (one signal → one effect), walk (interactive/async). **strategy** — dispatch (arity-aware effect call), direct (execute with Context + signal + steps + params), guarded (validate input against step schemas then execute). **apply** — invoke (traverse + execute), shotgun (navigate signal, fire all terminal effects — used by shape.subscriber for multi-listener event dispatch), rollup (recursive tree walk, collect all effects as `[{ pattern, steps, fn }]` — used by shape.mcp for tool compilation). Strategies are pluggable: `shape.object(vector, steer.guarded)` opts into validation, `steer.direct` is the default. `guarded` walks all steps (branch + leaf patterns) checking `pattern.input` schemas via TypeBox `Value.Default` + `Value.Errors`.

**Pattern descriptors**: `vector.open({ nature: "/feed", input: v.object({...}), output: v.buffer({...}), valence: "fetch items" }, effect)` — or function form `vector.open((s) => ({ nature, input, output }), effect)`. Extra properties land on the leaf Pattern via `{ nature, ...valence }` destructure in Pattern's object coercion. Branch patterns carry schemas too: `vector.branch({ nature: "/emit", input: v.object({...}) })`. Use `input`/`output`, never `schema`.

**Subscriber**: shape.subscriber(vector) — function returning MikroORM EventSubscriber POJO, routes entity events via steer.shotgun through a twitch Vector

**MCP**: shape.mcp(vector, info) — compiles Vector into MCP tool server via steer.rollup. Pattern descriptors provide tool metadata: `nature` → tool name (joined with `_` through branches), `valence` → description, `input` → inputSchema, `output` → outputSchema. Returns `{ handle, tools, handlers }`. `handle(message)` processes JSON-RPC 2.0 messages (initialize, tools/list, tools/call) with complete envelope wrapping. `tools` is the MCP tool definition array. `handlers` is a Map of tool name → guarded callable. Validation, defaults, and middleware accumulation all work through the standard steer.guarded strategy. MCP as a mode trait: mode exports `mcp` Vector, trait compiles via shape.mcp, mounts transport.

**Receiver**: `shard.receiver.stdio(handle)` — generic inbound I/O: reads newline-delimited JSON from stdin, dispatches to handle, writes responses to stdout. Protocol-agnostic — knows nothing about JSON-RPC or MCP. The counterpart to `shard.transport` (outbound). Symmetric: transport sends, receiver receives.

**Mode traits**: BUFFERED (was VIEWABLE — bundles, serves, wires mode.buffer()), DATASET, INTENTED, EMITTER, CHAOSMONKEY, TOPOGRAPHICAL, FRAUGHT (+ VIEWABLE, VALENTIC, PRODUCER, SELFEVIDENT as legacy in enum only — no active modes use SELFEVIDENT)

**BufferView**: `new BufferView(mount, schema)` or `new BufferView({ mount, schema })` — mount is a path to a `.svelte` file (auto-packed by bundler) or `.svelte.js` file (legacy manual pack). The bundler auto-wraps `.svelte` entries with mount/unmount via esbuild stdin, keeping the svelte runtime inside the bundle (no dual-runtime). `outfile: entry` preserves the source path in output so `serve(branch)` path matching works. `serve(branch)` reconstructs the absolute path and finds the matching output file — never simplified to just `bundles[0]`.

**Intent traits**: FURNISHED (default buffer props), FEEDING (mount, queue, mask: {where, limit}). All 9 game modes have a `feed` APPLICATIVE intent with FEEDING mount `/emit/feed`. Feed routes self-source literals via `literal.feed()` and create mode-appropriate buffers. Tactics also use FEEDING for their phase emitters (warmup, buildup, etc.). `where` carries symbol scoping and column filters (was `seek`). `limit` caps results (was `batch`/`take`).

**Buffer entity (server)**: `{data, index, mode, thread, literals, symbols}` — no traits, no status on server. `data` (was props) holds value fields, `literals`/`symbols` are m:n relations. `mode.buffer()` creates real MikroORM entities. Entities flow through the system — EMITTER post-processor returns entities, not POJOs. Serialization happens at the HTTP boundary via `toJSON()` in `shape.http`'s `JSON.stringify`. Status is client-only. Review results live in memory system.

**Buffer (client)**: `Buffer.from(pojo, view)` — pojo is server data (`{id, mode, data, literals, symbols}`), view is `mode.buffered` (`{url, schema}`). `context` and `release` are set by the environment (populate's `mint()`), not by Buffer.from. `mint()` sets `buffer.context = { buffer, terminal }`. Frame.svelte passes `buffer.context` to the Svelte component. Buffers are registered in daemon's buffer repo via `merge` for navigation.

**Schematics**: `v` is the sole schematics interface. Fluent Proxy over TypeBox — `v.string().default().desc().optional()`. Returns real TypeBox JSON Schema objects. **Structure**: `schematics/lib.js` is the ONLY file that imports from `@sinclair/typebox` (TypeBox shim + enhance proxy + entityFactory). `schematics/scalars/` holds domain scalars (ID, Slug, Timestamp, etc.). `schematics/entities/` holds entity descriptors (own fields + relation thunks). `schematics/index.js` assembles v: wires entity factories + `v.rel()` after all modules load. **Primitives**: `v.string(opts)`, `v.number(opts)`, `v.boolean()`, `v.integer()`, `v.object(props, opts)`, `v.array(items, opts)`, `v.union()`, `v.intersect()`, `v.const(val)` (JSON Schema `const`, was TypeBox `Literal`), `v.record()`, `v.any()`, `v.unknown()`, `v.null()`. **Chains**: `.default(val)` / `.default` (dual: setter/getter), `.desc(text)`, `.optional()`, `.$id(name)` (dual: setter/getter). **Instance ops**: `.check(val)`, `.create()`, `.clean(val)`, `.errors(val)`, `.compile()`, `.defaults(val)`. **Static ops**: `v.diff(a,b)`, `v.patch(val, edits)`, `v.equal(a,b)`, `v.clone(val)`. **JSON Schema**: `v.$ref(schema)` for `$ref`, `.$id(name)` for `$id`. **Relations**: `v.rel(schema)` — MikroORM Rel duality, `Union(ID, schema)`. For m:1/1:1 single relations. Collections (m:n/1:m) use `v.array(v.entity())` directly — no rel needed. **Entities**: `v.buffer(spec)`, `v.literal(spec)`, `v.symbol(spec)`, `v.mode(spec)`, `v.intent(spec)`, `v.thread(spec)`, `v.user(spec)` — each built via `entityFactory(descriptor, BaseEntitySchema)`. No args = base schema. With spec = narrowed. Descriptors declare own fields + relation thunks resolved at call time. Cycle detection (Literal ↔ Symbol) returns base schema without relations. **Constraints**: via constructor opts — `v.string({ minLength: 1, pattern: "^..." })`. All JSON Schema keywords supported. **Interop**: `Type` remains as escape hatch. `v.*()` and `Type.*()` produce the same objects, mixable freely. **Legacy**: `Ref` scalar still exported for backwards compat. `BufferSchema` replaced by `BufferDescriptor` + `v.buffer()`. Old `v.literal()` (TypeBox Literal) renamed to `v.const()` to free the name for the Literal entity.

**Gameplay**: `data.gameplay` string enum on modes with multiple interaction variants. Set by tactic or intent. Cloze: type|pick|listen. Match: translate|describe. Judge: visual|audio|audio-only. Listen: pick|type. `data.forgiving` boolean for typed input normalization.

**Intent types**: SELFEVIDENT (fallback — mode opens without intent, client creates empty buffer), APPLICATIVE (intent feeds buffers via emitter — primary path for all game modes and tactics). Client wiring: `daemon.js` aims intent.emit at `FEEDING.mount` with mask merged. `populate.js` calls `intent.emit({thread, blacklist})` via stall.withPull.

**Entity trait data**: `entity.trait.TRAIT_NAME` — the `trait` column is a JSON object keyed by trait name (was `data`, renamed)

**Traits (planned, not yet in code)**: LANGUAGED, AGENTIC (cortex)

**Memory signals**: MASTERY, SUCCESS, NEUTRAL, MISTAKE, FAILURE

**Memory states**: UNTOUCHED → UNKNOWN → LEARNING → KNOWN → GRADUATED

**Memory drivers**: BAYESIAN (ebisu), BOOLEAN (binary), COUNTER (streak). Driver interface: encode(signal) → {state, status, nextIn, nextAt}, evolve(signal, memory) → same, assess(memory) → {status, nextIn, nextAt}. Each driver exports sql.strength(table) for lazy formula composition. Drivers are pure — no entity refs, no IO.

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

Don't delete databases, migration files, or perform destructive data operations without explicit approval. Don't use Claude Code worktrees — jj treats worktree contents as new files, causing ghost commits. Gestalten namespaces (shape, steer, shard) are only for Vectors — don't put non-Vector concerns there. Transport adapters go in `typology/gestalten/shard/transporter.js`.

### Communication

Never present things that are layers as if they are parallel alternatives. If X uses Y internally, they're layers — show the stack. If they're independent choices, show the choices. Never mix. Use canonical vocabulary precisely — don't substitute generic alternatives. Terms are chosen deliberately and become canonical once settled.

## Testing Philosophy

Structural testing. Specimen is king.

Three patterns:
1. **Specimen** (typology tests) — gestalt-first: construction → gestalt → valences. Uses describe/it from @std/testing/bdd + expect from @std/expect + gestalten.is for type assertions. Also covers vector/controller/compiler/shard tests.
2. **Deno native** (paladin tests) — Deno.test + assertEquals. Direct function testing.
3. **Lifecycle** (runtime tests) — validates phase transitions through populate → resolve → integrate → disintegrate.

Future vision: specimen evolves into a lifecycle-driven BDD framework composed via Vector.

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

Known dead or dormant code — don't document it, don't suggest using it, don't extend it:

| What | Where | Status |
|------|-------|--------|
| Classifier + Feature prototypes | typology/prototypes/classifier.js | Dead (only in bak + 1 test) |
| Mask prototype | typology/prototypes/mask.js | Likely dead (never imported outside typology) |
| sheets subsystem | subsystems/sheets/ | Completely unused |
| Shell system | systems/shell/ | Active — [shell-client.workpackage.org](../systems/shell/.ikiro/shell-client.workpackage.org) |
| NLP service | registry/services/@vivalence/nlp/ | Wired but uncertain activity |
| lighthouse/localhost | registry/services/@vivalence/lighthouse/localhost/ | Not wired in circuitry |
| hallucinator archive | registry/services/@vivalence/hallucinator/hal/archive/ | Legacy providers (Groq, OpenAI, etc.) |
| 11+ archived modes | registry/modes/@vivalence/bak/ | Abandoned pedagogical approaches |
| Archived topologies | registry/kernels/@vivalence/topology/bak/ | Spanish, Latin, etc. |
| ValenceEntity + valence.js | typology + client | Replaced by IntentEntity + intent.js |
| ProductEntity + product.js | typology + client | Replaced by BufferEntity (typology) + buffer prototype (client) |
| valentic.js / producer.js | runtime/daemon/mode/traits/ | Replaced by intented.js / emitter.js |
| Old runtime test scenarios | runtime/tests/scenarios/bak/ | Superseded by scope-split tests (daemon/, mode/, runtime/) |
| shape.Subscriber class | typology | Replaced by shape.subscriber(vector) function |
| entities.on (Vector) | runtime/daemon/lifecycle/population.js | Renamed to good.twitch (on Runtime prototype). entities.twitch dead |
| maps export | typology/entities/index.ts | Replaced by direct named exports (literal, symbol, etc.) + flat sets object |
| population.twitch() | runtime/daemon/lifecycle/population.js | Removed — twitch subscriber wired in datamap() via datamap.subscribe() |
| daemon.kernel.orm | runtime/daemon/daemon.js | Removed — ORM access via daemonDie.datamap interface only |
| Old parametric entity routes | runtime/daemon/aperture/ (commented) | Replaced by shard.datamap per-entity branches |
| valentic.js / producer.js | runtime/daemon/mode/traits/ | Replaced by intented.js / emitter.js |
| [...viva] catch-all route | html/src/routes/[...viva]/ | Superseded by viva/ + viva/[...terminal]/ — +page.svelte moved to bak/ |
| Navtree.svelte | html/src/routes/[...viva]/Navtree.svelte | Replaced by lobby doors. Not imported by new routes |
| Old populate.js | html/src/routes/[...viva]/lib/populate.js | Replaced by thread-anchored populate in viva/[...terminal]/lib/ |
| Old url.js | html/src/routes/[...viva]/lib/url.js | Replaced by $lib/url.js (parseTerminalPath) |
| m.link / i.link (old computation) | html/src/typology/entities/daemon.js | Recomputed from daemon.link root (was SELFEVIDENT-gated mount.rebase) |
| View prototype | typology/prototypes/view.js | Replaced by BufferView (same file, renamed class). Client Buffer now in html/src/typology/entities/buffer.js |
| pack() + belt/ | drapes/belt/pack.js, drapes/belt/ | Deleted — bundler auto-wraps .svelte entries. Only bak/ references remain |
| View export alias | typology/prototypes/index.ts | `export { BufferView as View }` — only bak/ modes use View. Active modes use BufferView |
| .svelte.js buffer wrappers | registry/modes/**/buffer/*.svelte.js | Deleted — .viva.js now points at .svelte directly |
| Old Buffer prototype (client) | html/src/typology/prototypes/buffer.js | Deleted — Buffer is now an Entity in html/src/typology/entities/buffer.js |
| Commented code in populate.js | html/src/routes/viva/[...terminal]/lib/populate.js | Old Buffer.hydrate paths removed, clean mint() factory in place |
| todo/ game stubs | registry/modes/@vivalence/game/bak/todo/ | Superseded by proper game modes in game/{cloze,pick,match,judge,listen,exhibit}/ |
| SELFEVIDENT trait impl | runtime/daemon/mode/traitmap.js | No-op function. No active modes use SELFEVIDENT — all game modes migrated to APPLICATIVE intents |
| Aperture pick/ + review/ | domain/learning/aperture/bak.pick/, bak.review/ | Replaced by LiteralRepository methods (feed/novel/due) + literal.review(). Aperture index.js is thin exposition |
| Aperture lib/ (shared, get, sort, filter) | domain/learning/aperture/bak.pick/lib/ | Dead — all query logic now in LiteralRepository |
| findBySymbols | typology/entities/kernel/Literal.ts | Dead method — replaced by resolveSymbols in find/findOne override. Slug resolution via native MikroORM m:n queries, no roundtrip |
| Scope, Blacklist classes | typology/prototypes/ | Superseded by native MikroORM queries |
| Old steer files (traverse.js, walk.js, invoke.js, shotgun.js, spread.js, dispatch.js) | typology/gestalten/steer/ | Replaced by match.js, navigate.js, strategy.js, apply.js |
| Old steer controllers (shotgun-along, spray, harvest, collect) | typology/gestalten/steer/bak.js | Dead — no live consumers. shine renamed to shotgun (terminal multi-match). rollup added (recursive tree collection) |
| drapes Modeline component | was drapes/panels/Modeline.svelte | Deleted — app uses single Modeline at routes/viva/Modeline.svelte |
| Old modeline files | html/bak/[...viva]/Modeline.svelte, bak/Modeline.svelte, surface/panels/bak.modeline.svelte, drapes/bak/components/modeline/ | Deleted |
| Navtree.svelte | was html/bak/[...viva]/Navtree.svelte | Deleted — navtree logic merged into Modeline panel |
| seek param / Seek for symbols | was on feed/novel/due/aperture/emitters | Replaced by where.symbols — resolveSymbols handles $all/$in/$none sugar with native MikroORM slug queries |
| take param | was on feed/novel/due/aperture/emitters | Replaced by limit everywhere |
| batch param | was on FEEDING mask + emitters | Replaced by limit everywhere |
| LiteralSubscriber (domain rank) | domain/learning/entities/kernel/Literal.ts | Replaced by rank formula — COALESCE(json_extract(trait, '$.RANKED.rank'), 999999) |
| memory.history JSON array | domain/learning/entities/userspace/Memory.ts | Replaced by Trace entity (1:M on memory) |
| Play.bak.js | domain/learning/entities/userspace/ | Replaced by Trace entity |
| Old memory drivers (dirs) | domain/learning/memory/bak/bayesian/, bak/boolean/ | Replaced by flat bayesian.js, boolean.js, counter.js with encode/evolve/assess interface |
| memory/schema.js | domain/learning/memory/bak/schema.js | Signal validation moved inline; schema unused |
| getMemoryDriver / validateDriver | domain/learning/memory/bak/ (was index.js) | Dead — symbol-scoped driver resolution removed (symbols not reviewable) |
| primitives/production.js | schematics/primitives/production.js | Dead — references `Type` without import, uses abandoned PRODUCER vocabulary |
| BufferSchema (standalone) | schematics/entities/buffer.js | Replaced by BufferDescriptor + v.buffer(). Old .of() pattern superseded by entityFactory |
| Ref as v method | was v.ref() | Replaced by v.rel() for typed relations. Ref scalar still in scalars/ for backwards compat |
| shard/websocket.js | typology/gestalten/shard/ | Deleted — merged into shard/serve.js as `shard.serve.websocket()` |
| `shards` export alias | was re-exported alongside `shard` | Removed — `shard` (singular) is the only export |
| findForUser / findOneForUser | domain/learning/entities/kernel/Literal.ts | Deleted — MikroORM filter on Memory auto-scopes by user |
| user param on feed/novel/due/byStrength | domain/learning/entities/kernel/Literal.ts | Removed — user auto-injected via MikroORM filter |
| user: ctx.user.id in emitters | all game + tactic emitters, aperture | Removed — filter handles it |
| populateWhere: { memories: { user } } | aperture, exercise emitter | Removed — filter handles it |
| SessionEntity / SessionSchema | was typology/entities/userspace/Session.ts | Renamed to ThreadEntity / ThreadSchema in Thread.ts. v.session() → v.thread(). All refs updated. DB needs table recreation for FK fix |
| session.js (client) | was html/src/typology/entities/session.js | Renamed to thread.js. Session class → Thread class |
| SessionDescriptor | was schematics/entities/session.js | Renamed to ThreadDescriptor in thread.js |
| symbol.word distractor matching | was on judge/pick/listen emitters | Replaced by `ontology` column match — symbol.word was exact JSON match on full morphological profile, always returned empty |
| defaults key on emitter input | was client daemon.js + all /feed emitters | Removed — FURNISHED never overlapped FEEDING, defaults was always {} |
| buildItem() in judge | was judge.viva.js | Deleted — logic inlined, then simplified to single boolean distractor |

## Active Work Areas

As of 2026-03-26 (updated end of session):

- Audio player variants — inline DONE (drapes/decor/Audio.svelte). Dictation and longform variants deferred
- Mobile readiness on client
- Hallucinator cortex — [cortex.workpackage.org](cortex.workpackage.org) — daemon-level AI orchestrator with faculties, channels, harnesses (Vector), turns/parts, tune/tier resolution, LANGUAGED/AGENTIC traits
- Datamap shard + client entity migration — [datamap-client-migration.workpackage.org](../systems/html/.ikiro/datamap-client-migration.workpackage.org) — typology DONE (40 tests), runtime DONE, lighthouse DONE. **Datamap ownership refactor DONE** — service provider owns all MikroORM, opaque interface, RequestContext per request, `shard.datamap.inject()`. Client (B), schema projection (C), reactive E2E (E) next
- Package manager — [very-important-packagemanager.workpackage.org](very-important-packagemanager.workpackage.org) — registry as jj-driven discovery scopes
- **Modes & tactics** — [language-learning-modes.workpackage.org](language-learning-modes.workpackage.org) — All 9 game modes APPLICATIVE with `/feed` emitter routes. Survival tactic (5 phases). LiteralRepository with resolveSymbols/feed/novel/due/byStrength — `where` + `limit` unified query interface, synchronous slug resolution via native MikroORM m:n queries. Trace entity + literal.review(). Memory drivers: Bayesian (ebisu), Boolean, Counter. 36-step Bayesian test suite. Distractor type matching via `ontology` column on judge/pick/listen. `defaults` sweep complete — FURNISHED injection removed from client. MikroORM user filter on Memory/Trace — schema-declared, bind as shard middleware, zero manual user threading. resolveTraits on DataRepository — SQLite shim for JSON array queries ($contains/$overlap/$none → LIKE). **DONE**: seek→where, batch/take→limit, findBySymbols→resolveSymbols, modeline redesign, user filter, resolveTraits, FAILURE→MISTAKE. **Open**: emitter exhaustion ontology (stall retries forever on empty). Tier 2 (reorder, dictation) and Tier 3 (minimal-pair) pending. Conversational tactics post-cortex.
- **v schema builder** — [v-schema-builder.workpackage.org](../subsystems/typology/.ikiro/v-schema-builder.workpackage.org) — IMPLEMENTED. M1 (lib.js: enhance + primitives + constraints + instance/static ops + entityFactory), M2 (110 test steps). Entity descriptors for all daemon entities. v.rel() for MikroORM Rel duality. v.const() renamed from v.literal(). Schematics refactored: lib.js (sole TypeBox consumer), scalars/ (domain), entities/ (descriptors). **Pattern descriptors DONE** — vector.open accepts `{ nature, input, output, valence }` descriptors. Steer reorg (match/navigate/strategy/apply). Strategies: direct + guarded (opt-in validation via TypeBox Value). Context unified — strategies create real Contexts with signal-as-url. M3 (game mode migration) pending.
- **Shell client** — [shell-client.workpackage.org](../systems/shell/.ikiro/shell-client.workpackage.org) — Operator interface for humans and agents. Claude as first customer. Auth + Connection + strip/wire repos. MCP as future phase (shape.mcp compiler + viva --mcp stdio mode)
- Progression system (eventually)
- DB migration — props→data column rename, buffer_literals/buffer_symbols join tables, **session→thread table+FK recreation** (deferred to deploy)

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

This is the most important section in this document. These docs are not finished artifacts — they are living scaffolds that you must maintain, question, challenge, and improve every time you work in this codebase.

### The Core Question

Every time you finish a task, ask yourself:

**"What would I have needed to read earlier, such that this process would have gone smoother, faster, better, with lower friction, leading to better outcomes faster?"**

Then write that thing into the appropriate doc. Not a note to yourself — a clear, useful addition that the next agent (or you in a fresh session) can actually use.

### When to Update

- **After learning something new** about a subsystem that isn't documented
- **After code changes** that make a doc inaccurate
- **After finding inaccuracies** — fix them immediately, don't leave them as traps
- **After completing a task** — update Work Packages (mark done, add discovered gaps)
- **After being briefed on new work** — add to relevant Work Packages
- **After struggling** — if you had to figure something out the hard way, document the shortcut

### What to Update

- **"Where Used" stubs** — these start empty. As you trace code, fill them in. Every cross-reference you add saves a future agent minutes of grepping.
- **Dead code flags** — verify or remove them. If something was dead and is now used, update the flag.
- **New patterns** — if you discover a pattern not documented (a new trait, a new composition technique, a new test approach), add it.
- **Method signatures** — if they changed, update them. Stale signatures are worse than no documentation.
- **Work Packages** — this is the heartbeat. Completed tasks get marked. New gaps get added. Active work areas get updated.

### How to Improve

- **Add code examples** that demonstrate compositional elegance. Show how 27 lines of compose() enables the entire middleware system. Show how one Signature class yields an entire routing ontology. The ratio of power to lines is extreme — make that visible.
- **Add test patterns** — when you write a test that uses a novel approach, document the pattern.
- **Cross-reference between docs** — the system is deeply interconnected. A change in typology affects vector affects runtime. Make those connections explicit.
- **Improve this root doc** — if you find a better way to organize the system map, a clearer way to explain conventions, a more useful session protocol, change it. This document improves itself.

### Quality Signals

How to tell if the docs are good:
- File paths are accurate (files exist where docs say they do)
- Method signatures match the actual code
- Dead code flags are verified (not stale guesses)
- "Where Used" sections have real cross-references (not just "[populate]" stubs)
- Work Packages reflect actual current state (not a snapshot from weeks ago)
- A new agent reading these docs can start productive work without 30 minutes of exploration

### The Docs Are Your Partner

You don't just read these docs — you co-author them. Every session you run is an opportunity to make the next session better. The compound effect is enormous: a small update today saves 10 minutes next week, which saves an hour next month, which means the system ships faster.

Don't treat documentation as a chore that happens after the work. Treat it as part of the work. The doc update is not overhead — it's the return on investment from everything you just learned.

### Improving This Document

This root document is the entry point for every future session. If it fails to orient an agent quickly and correctly, everything downstream suffers. So:

- If the System Map is missing a package, add it
- If the Canonical Vocabulary has a new term, add it
- If the Active Work Areas are stale, update them from git log
- If the Dead Code Registry has entries that are now alive (or dead entries not listed), fix it
- If you can think of a better Session Protocol, write it
- If this Self-Improvement Protocol doesn't motivate you to actually improve the docs, rewrite it until it does

## Zettelkasten

[zettelkasten.md](zettelkasten.md) — a scratchpad for documentation improvement ideas. When you notice something that could be better but don't want to break your flow, write it there. Periodically review and implement the good ones. Ask Finn for extra turns if you want dedicated time to work on them.

## Work Packages (Master Index)

Each subsystem doc has its own Work Packages section. This is the master view:

**Active work packages (with .org files):**
- [cortex.workpackage.org](cortex.workpackage.org) — Hallucinator cortex: faculties, channels, harnesses, turns/parts, tune/tier, LANGUAGED/AGENTIC traits
- [very-important-packagemanager.workpackage.org](very-important-packagemanager.workpackage.org) — Registry as jj-driven discovery scopes
- [language-learning-modes.workpackage.org](language-learning-modes.workpackage.org) — Game modes & tactics: symbol-driven learning toolset, emitter + conversational architectures
- [v-schema-builder.workpackage.org](../subsystems/typology/.ikiro/v-schema-builder.workpackage.org) — Fluent schema builder over TypeBox via Proxy. v.string().default().desc().optional() — Zod ergonomics, JSON Schema output
- [shell-client.workpackage.org](../systems/shell/.ikiro/shell-client.workpackage.org) — Operator interface: auth + strip/wire repos + domain endpoints. Claude as first customer. MCP as future phase

**Critical testing gaps across the system:**
- Learning domain: pick/review endpoints tested via integration test (39 steps). Memory drivers, signal schema still untested in isolation
- Runtime: datamap CRUD, userspace auth+scoping, freight, INTENTED, EMITTER, full lifecycle smoke test all tested (54 steps, 7 suites). Integration test adds 41 steps over live HTTP (all 9 game emitters, 5 tactic phases, pick routes, review). DATASET trait, process system untested. View bundler tested (7 steps)
- Modes: all 9 game mode emitters + 5 tactic phases tested via integration test. No isolated mode-level tests
- Paladin: scopes untested, variant compilation untested
- Typology: entity trait system untested, gestalt belt/shard untested
- Typology: agentic compiler untested. rollup tested (14 specs). shape.mcp tested (20 specs). shard.receiver.stdio untested (needs process-level integration test)
- Typology: new transport surface tests exist (publish/subscribe/websocket) but Request.subscribe() not yet tested

**Cross-cutting active work:**
- @vivalence/shared migration (belt re-exports, hash in 7+ files)
- Asset entity type across domain + runtime + client
- Hallucinator service contract update (current {object, action} → faculty array for cortex)

**Human documentation priorities (Divio):**
1. Tutorial: "Build a new game mode" (most requested path for new agents)
2. Explanation: "How Signature composition works" (core insight of the system)
3. Reference: Pick/review API contracts (most used endpoints)
4. How-to: "Add a topology" (most common data task)
