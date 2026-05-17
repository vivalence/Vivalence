> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — typology (container)

Library. A grabbag of composable building blocks. Power emergent from composition, not procedure. Read `.ikiro/CLAUDE.md` first.

## architecture

one constructor, many shapes.

The root prototype is `subsystems/typology/prototypes/signature.js` (211 lines). Pattern, Signal, Path, Url, Action — each at `subsystems/typology/prototypes/<name>.js` — extend it via the coercion system. Constructor calls `this.coerce(signature)` which iterates `static coercions = []` (array of `[predicate, transform]` tuples). First match wins. Pass a string (or anything) to any Signature descendant and it gets transformed into the right structure: Pattern splits on `/`, Path normalizes filesystem paths, Url extracts origin.

The pattern recurs:

- shape compilers in `subsystems/typology/gestalten/shape/` transform a Vector into different surfaces. Each compiler walks the Vector and emits a consumer-shaped artifact.
- steer in `subsystems/typology/gestalten/steer/` transforms traversal into different dispatch strategies — single Vector, multiple traversal grammars.
- cast in `subsystems/typology/gestalten/cast/primitives.js` transforms anything into the right type (lookup, viva, manifest, cake).

structure:

```
subsystems/typology/
├── prototypes/         signature, pattern, signal, path, url, action          (root)
│                       + connection, request, response, context, status        (transport)
│                       + wafer, seek, vector, aperture                          (composition)
│                       + remote-repository, local-repository, entity-manager    (storage)
│                       + broadcaster, blacklist, freight, socket                (network)
│                       + conversation, cortex, hallucination                    (AI/conversation)
│                       + pipe, pool, queue, span, tracks, yield                 (flow)
│                       + buffer, env, mask, mode, scope                         (sundries)
├── entities/
│   ├── base/           BaseEntity, DataEntity, VirtualEntity
│   ├── kernel/         Literal, Symbol, Issue, Constraint
│   ├── network/        Identity, Daemon
│   ├── daemon/         User, Mode, Intent
│   └── userspace/      Buffer, Session
├── gestalten/          is, cast, not, fromm
│   ├── belt/           15 utility modules: array, crypto, fn, hash, id, middleware, object, promise, random, sleep, soma, sort, string, time
│   ├── shard/          16 network primitives: ambient, batch, caching, connection, context, cors, datamap, patterns, receiver, secure, serve, track, transmitter (+ index, index.client)
│   ├── steer/          4 routing strategies: apply, match, navigate, strategy
│   └── shape/          11 compilers: agentic (LLM tools), flat, http (handler), mcp (MCP tools), messenger (cross-host shape), object (nested obj), selbstbestimmt, strip (tree shape), subscriber (ORM POJO), tree
├── schematics/         TypeBox validation (7 files, 346 lines)
└── specimen/           BDD wrapper (@std/testing/bdd + @std/expect + custom is)
```

key verbs:

- Vector at `subsystems/typology/prototypes/vector.js`: `use(mw)` push middleware, `branch(sig)` create child, `open(sig, fn)` register effect, `slurp(other)` deep-merge
- steer at `subsystems/typology/gestalten/steer/`: `apply`, `match`, `navigate`, `strategy` (rollup, invoke, guarded, traverse exported from these via index.js)
- shape at `subsystems/typology/gestalten/shape/`: `http(v) → handler`, `object(v) → nested obj`, `agentic(v) → {tools, llmstxt}`, `mcp(v) → MCP tool catalog`, `subscriber(v) → ORM POJO`, `messenger(v) → cross-host shape descriptor`, `strip(v) → tree spec`
- Wafer at `subsystems/typology/prototypes/wafer.js` hooks: populate, resolve, integrate, disintegrate (empty here, filled by Die in `systems/runtime/die.js`)

entity flow:

```
Mode → Intent → Thread → Buffer → Turn
```

Mode is a manifest with traits. Intent is a thread template (slug + traits + trait config + mode). Thread is the live navigational session. Buffer is the queued/active unit. Turn is the dialogue contribution.

## channel grammar

Socket conversations use uniform verbs across per-content-type channels. Schema: `subsystems/typology/schematics/primitives/conversation.js`.

```
signal  = "/" channel "/" verb
channel = handshake | dialogue | speech | verbatim
verb    = open | packet | close | abort | error
```

| channel | content |
|---------|---------|
| handshake | connection meta + shape exchange |
| dialogue | text turns |
| speech | audio bytes |
| verbatim | transcript events |

| verb | meaning |
|------|---------|
| open | start of logical unit |
| packet | payload unit during the unit |
| close | clean end |
| abort | kill — cancel inflight |
| error | failure end with payload |

## context

dependencies (external): `@mikro-orm/core` (entities), `@sinclair/typebox` (schematics), `nanostores` (Connection, Status), `@std/testing/*` (specimen).

`@vivalence/shared` — still referenced in 7 prototype files for `hash`, `validators`, `obj`. Removal in progress.

dead code (current; classifier moved to `prototypes/bak/`):

- `subsystems/typology/prototypes/bak/classifier.js` — Classifier + Feature only referenced from bak; live test file gone
- `subsystems/typology/prototypes/mask.js` (33 lines) — exported but never imported externally; likely dead
- `subsystems/typology/prototypes/scope.js`, `mode.js` — placeholder stubs

testing gaps:
- **belt** (15 modules) — no dedicated test files
- **agentic / mcp shapes** — covered indirectly via mode integration tests; no unit suite
- **schematics validation** — no dedicated suite for `v.*` chain methods
- **steer.strategy** (rollup, guarded, invoke) — covered indirectly via shape tests; no unit suite
- **DATASET trait** — `runtime/tests/mode/dataset-trait.test.js` proposed; not yet authored

`tests/workpackage/` convention (renamed from `tests/quest/`): live in `workpackage/` while feature is in flight; promoted to flat `tests/<feature>.test.js` when stable. Currently empty — `conversation.test.js`, `cortex.hallucinators.test.js`, `voice.conversation.test.js` promoted to flat 2026-05-18.

active work:

- **cortex** (prototypes/cortex.js, hallucination.js, conversation.js) — LANDED. See root `.ikiro/quests/cortex.quest.org` DONE.
- **variant marker contract** — paladin compiles single `type: "variant"` marker (see paladin ikiro). Typology surface unchanged; downstream consumers should grep paladin.find.viva / paladin.read.viva / paladin.vip.accio* before hand-rolling.
- `@vivalence/shared` removal — belt re-exports need migration (hash used in 7 prototype files)
- **VOCALIZED trait + asset entity type** — see root `.ikiro/quests/longdistance.quest.org`. Audio prototypes landed: pipe, pool, queue, span, tracks, yield.
