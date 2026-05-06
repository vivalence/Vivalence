> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — typology (container)

Library. A grabbag of composable building blocks. Power emergent from composition, not procedure. Read `.ikiro/CLAUDE.md` first.

## architecture

one constructor, many shapes.

The root prototype is `subsystems/typology/prototypes/signature.js` (211 lines). Pattern, Signal, Path, Url, Action — each at `subsystems/typology/prototypes/<name>.js` — extend it via the coercion system. Constructor calls `this.coerce(signature)` which iterates `static coercions = []` (array of `[predicate, transform]` tuples). First match wins. Pass a string (or anything) to any Signature descendant and it gets transformed into the right structure: Pattern splits on `/`, Path normalizes filesystem paths, Url extracts origin.

The pattern recurs:

- shape compilers in `subsystems/typology/gestalten/shape/` transform a Vector into different surfaces — `http.js` produces an HTTP handler, `object.js` produces a nested object, `agentic.js` produces LLM tools, `subscriber.js` produces an ORM POJO
- steer in `subsystems/typology/gestalten/steer/` transforms traversal into different dispatch strategies — `match.js` greedy/scope/resolve, `shotgun.js` shotgun/shine/spray, plus `traverse.js`, `walk.js`, `invoke.js`, `spread.js`
- cast in `subsystems/typology/gestalten/cast/primitives.js` transforms anything into the right type

structure:

```
subsystems/typology/
├── prototypes/         signature, pattern, signal, path, url, action
│                       + agent, connection, request, response, context, status,
│                         wafer, seek, vector, aperture, repository (RemoteRepository),
│                         broadcaster, blacklist, freight
├── entities/
│   ├── base/           BaseEntity, DataEntity, VirtualEntity
│   ├── kernel/         Literal, Symbol, Issue, Constraint
│   ├── network/        Identity, Daemon
│   ├── daemon/         User, Mode, Intent
│   └── userspace/      Buffer, Session
├── gestalten/          is, cast, not, fromm
│   ├── belt/           12 utility modules (object, array, fn, hash, middleware, ...)
│   ├── shard/          12 network primitives (connection, ambient, secure, datamap, ...)
│   ├── steer/          6 routing operations (traverse, walk, invoke, match, shotgun, spread)
│   └── shape/          4 compilers (http, object, agentic, subscriber)
├── schematics/         TypeBox validation (7 files, 346 lines)
└── specimen/           BDD wrapper (@std/testing/bdd + @std/expect + custom is)
```

key verbs:

- Vector at `subsystems/typology/prototypes/vector.js`: `use(mw)` push middleware, `branch(sig)` create child, `open(sig, fn)` register effect, `slurp(other)` deep-merge
- steer at `subsystems/typology/gestalten/steer/`: traverse, walk, invoke, scope, greedy, resolve, shotgun, shine, spray, spread
- shape at `subsystems/typology/gestalten/shape/`: `http(v) → handler`, `object(v) → nested obj`, `agentic(v) → llm tools`, `subscriber(v) → orm POJO`
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

dead code:

- `subsystems/typology/prototypes/classifier.js` (143 lines) + `subsystems/typology/tests/classifier.test.js` (134 lines) — Classifier and Feature only referenced in bak/; move or delete
- `subsystems/typology/prototypes/mask.js` (33 lines) — exported but never imported externally; likely dead
- `subsystems/typology/prototypes/scope.js`, `subsystems/typology/prototypes/mode.js`, `subsystems/typology/prototypes/view.js` — placeholders with minimal content

testing gaps: belt (12 modules in `subsystems/typology/gestalten/belt/`), agentic shape, schematics validation, steer shotgun/shine/spray (covered indirectly via `subsystems/typology/tests/shards/datamap.test.js` and `datamap.integration.test.js`). New prototypes added 2 days ago without dedicated tests: BELL (`prototypes/bell.js` — singleton client audio context, longdistance round 5).

open regression: `subsystems/typology/tests/repository.persist.test.js:348` — `JSON.parse(storedrepo.encode([mode]))` is a typo from effect-saturation cleanup. `stored` (was `localStorage.getItem(key)`) was deleted but its name was concatenated with `repo.encode([mode])` instead of replaced. Throws ReferenceError. Effect-saturation marked DONE while this regression sat untriaged. `const key` two lines above is dead. Fix: either restore `localStorage.getItem(key)` round-trip or change to `JSON.parse(repo.encode([mode]))` (direct encode test — matches intent of three sibling `repo.$entities.set([...])` removals).

`tests/workpackage/` convention: `subsystems/typology/tests/workpackage/{session, voice.session}.test.js` are workpackage-staging tests. They live in `workpackage/` while feature is in flight; promoted to flat structure when stable. Currently both should be promoted (Session + voice.session shipped 2 days ago).

active work:

- cortex primitives (Turn, Part shapes) may land in typology — see `.ikiro/cortex.workpackage.org`
- `@vivalence/shared` removal — belt re-exports need migration (hash used in 7 prototype files)
- VOCALIZED trait + asset entity type — see `.ikiro/longdistance.workpackage.org`
