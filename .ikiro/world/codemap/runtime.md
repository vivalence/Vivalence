---
paths: ["systems/runtime/**"]
---
<!-- writer: agent · kind: persistent · limit: 22000 chars · traps only -->
# codemap: runtime — traps the code does not show

- `run.js`: importing it yields a POPULATED die, not a serving one; only `import.meta.main` serves.
- `Deno.serve` binds `[::1]`; `fetch` picks `127.0.0.1`. (`lifecycle/integrate.js:40` `hostname: url.hostname`) · `project_localhost_ipv6_serve_split`
- `population.js:collate` — schema/entity/repository OVERRIDE by type, subscribers ACCUMULATE; `{...traits, ...domain.traits}`: a domain's trait implementation wins.
- `@vivalence/runtime` barrel: explicit exports SHADOW star exports — take lowercase names from `sets.<tier>.<name>`. (`mod.js:6` `* as daemon` shadows `daemon/entities/index.ts:38`)
- `Thread.parent` cascades, `Turn.parent` has NO deleteRule, `Turn.mode` set null. Schema delta = restart; never hand-write a migration. (`daemon/entities/userspace/Thread.ts:149` · `daemon/entities/userspace/Turn.ts:64,90`)
- `Buffer.ts:create` — every query first, the mint last (a query auto-flushes the pending row into the wrong seat). `ThreadEntity.bindBuffer` is the ONLY `counter++`; the EMITTER drain binds what it drains, so a mint inside an emitter passes NO thread. `BufferSubscriber.beforeCreate` never reads `data`.
- `daemon/traits/index.js:stagger` — factories, then finalizers; terminators run BEFORE the datamap closes; an unimplemented declared trait → SILENT skip (`traits[trait]?.(mode, daemon)`), no warn, no throw — the trait set is OPEN (m68 M7).
- identity IS the manifest: read `mode.manifest.*`, `mode.slug/type/traits` do not exist; the ROW stays flat, unique `(slug, type)`. `project_manifest_is_identity`
- `mode.mount` is the seat UNDER the daemon; a runtime-rooted key composes `daemon.mount` in front. FRAUGHT carries, MOUNTED serves — ask one OR the other; a blank mountpoint is the doctor's fault. `project_freight_vs_mountpoint`
- `mode.application.buffer(desc)` FILLS, never `cast`. DEV `/metadata/application` recompiles per read — the only seam that refreshes a view. (`daemon/traits/application.js:19` · `daemon/aperture/metadata.js:34`)
- DATASET: a declared source is SCHEME (shared), a computed `load` source is the mounting's OWN; `stamp(mode)` hashes the installer itself. `project_mode_owns_rows` DATASINK: a user-scoped type THROWS.
- `harnessed.js` — seven keyed layers, later wins; paladin `fs_*`/`shell_run` UNBOUND; `armed` binds daemon/mode/user/thread itself; `system.thread` registers LAST; `daemon/skills/index.js` exports NAMESPACES (`entity.entity`). `project_armed_tool_stack`
- INTELLIGENT/VOCAL claim-gated via `v.thread.trait` (undeclared name THROWS); invocation > thread > mode; modes DEFAULT `??=`, MANDATE `=`. (`daemon/traits/harnessed.js:28` · `subsystems/typology/schematics/v.js:125`)
- `/dialogue` folds turns on a FORKED em — a tool flushing the root em cannot leak half a response. (`daemon/traits/harnessed.js:109`)
- `daemon.call` = `shape.proxy(domain.aperture, steer.strategy.direct)` compiled PRE-slurp: a daemon-root `authorize()` would 401 internal calls. (`daemon/lifecycle/resolution.js:11`)
- `authenticate()` → `ctx.identity`; `authorize()` READS ONLY → `ctx.user`; enrollment ONLY at `/userspace/handshake`; `bind("user")` behind `authorize()`. `project_user_bind_behind_authorize`
- `/metadata` strips are trait-conditional; the strip IS the contract; an async generator handler IS SSE — the only escape from anima's 8000 ms timeout. `project_aperture_streaming_sse`
- `deno task test` is `--watch`; one file = `deno test -A --no-check --config <repo>/deno.jsonc <file>`; `tests/snapshots/` GITIGNORED, `SNAPSHOT_HOT=1` regenerates. `project_corpus_snapshot_regime`
- the ONE console tap on a hallucination is `daemon/entities/transient/Activity.ts:18` — `new Span("hallucination").to(record => console.log(…))`; every open/note/fault/close of the belt and each tool dispatch prints as `[hal /hallucination(/<tool>)] <verb>`. The Activity row's 12-record ring is deleted when the controller settles — never read a finished run off it. `runtime/watch` restarts on the module graph AND `commons` + `~/.viva/registry`: a save to `harnessed.js`, a typology primitive or a provider `translate.js` each printed `Restarting!` (measured).
- a response close that is not `complete` PERSISTS: `daemon/traits/harnessed.js:137 verdict()` merges `{state, rounds, fault}` onto the provider's empty assistant turn or mints one when no turn opened; anima `systems/anima/src/app/panels/a/widgets/turns.js:251 turnVerdict` draws it. A `length` close with zero parts and `usage: null` = the provider ended before a word — bisect the REQUEST (tools first), not the belt.

- `daemon/traits/emitter.js:43` mints a fresh `ctx.pool = new Pool()` per `mode.emit.X` — a delegating emitter must `ctx.pool.add(peer.emit.x(input))` (promise or awaited result); a bare `await peer.emit.x(input)` drains the outer pool EMPTY. Correct: `~/.viva/registry/education/modes/home/aprende/emitter/nyan.js:23`.
- a peer mode is reached at runtime, never imported: `ctx.daemon.modes.game["dojo"].emit.flashcard.feed({...})` (`registry/education/modes/home/aprende/emitter/flashcard.js:12`); `mode.emit = shape.object(emitter)` (`daemon/traits/emitter.js:71`). `import … from "@vivalence/tactic/survival"` does not exist.
- a mode reaches LLMs through `ctx.mode.harness` only; an internal utility call inside `/dialogue` middleware uses `mode.harness.object.render({ turns, config })` (no scribe coupling; `registry/education/modes/home/aprende/aperture/message.js:21`) — `harness.dialogue.*` there re-enters and persists junk turns. `cortex.resolve`/`via`/`findOne` in a mode = violation.
- literal selection is repository verbs, never a hand walk: `ctx.daemon.entities.literal.byLastSignal(["MISTAKE","FAILURE"], where, { limit: 3 })` (`registry/education/modes/tactics/survival/emitter/exercise.js:27`) · `byStrength` · `feed/novel/due`; relations via `sentence.uses.getItems()`; annotated tokens only for positional indices (cloze).
- VIRTUAL entities (`daemon/entities/base/VirtualEntity.ts`): mikro derives `virtual = !!expression`, so `VirtualSchema` pins an `expression` that THROWS (:103); metadata is keyed by CLASS (`get(ProbeEntity)`); a real side's 1:m to a virtual must be `hidden: true` or every broadcast serializes `null`; scope stays FLAT (`{thread:{user}}` matches nothing — to-ones collapse to id); `updateOne` passes `em: this.em` to `assign`. NEVER `allowGlobalContext`, tests included (/"never a gloablContext. also not in testing"/).
- every tool name that appears in history must be CALLABLE — the fast tier imitates history reliably (a forged `appraise` round was copied four times); a wired async round uses the real armed name (`language-learning_review`). Steering rides the OUTPUT schema `.desc()`s (a `thinking` field ahead of `reviews`), not the prompt. (`registry/education/modes/teacher/francesca/harness.js:123`) `project_armed_tool_stack`
- `harness.choice.render({ primer, questions })` → `Choice.Verdict` = one distribution per question key (m70 M5): the branch reads `primer · questions` off `ctx.input` because `requesting` (`harnessed.js:41`) rebuilds `ctx.hallucination` as dialogue and drops everything else; keeps `ctx.controller` + the thread-tuned `policy`; render only. The verdict is the end of the concern — no readings. `/cortex/render` ROUND = `Request | Choice.Round` (`aperture/cortex.js:11`). A non-HARNESSED mode (riddler) calls `daemon.cortex.hallucinate.choice.render` with the activity's controller; the round writes that controller's span (`belt.hallucinate.choose`).
- the harness is a FIXED functional lexicon — `dialogue`/`object` × `render`/`stream` + `choice` × `render` on every HARNESSED mode (/"The vector for harness is not semantic. It's functional lexicographic"/); a mode-specific nature (`/ask`) lives on an EXPOSED aperture, never on the harness or the emitter. Trait names are STATES (`AIMED`, `MASKED`), never capabilities (`AIMABLE` ✗). (`daemon/traits/harnessed.js:204`) `project_chaosmonkey_oracle_harness_testbed`
- topography snapshots (`tests/topography/harness.js`): three vantages off ONE read-only ORM — `entities.find().toJSON()` ≡ `conn.call("/entities/<x>/find")` ≡ `RemoteRepository.find` — ONE canonical `entity-<x>.snapshot.json`, the other two `toEqual` it; trim at the QUERY (`options.fields`), never the snapshot; no `refreshDatabase`, never flush.
- `daemon/traits/dataset.js` link phase goes THROUGH the ORM: `find({slug:{$in}},{populate:[prop]})` → `from[prop].add(to)` → `from.assign({ updatedAt: new Date() })` (:258, a collection-only change fires no `beforeUpdate`) → forked flush + clear per 100. Raw pivot SQL skips `LiteralSubscriber` → `ontology`/`symbol` blank (6583 italian rows, `a486a8389`).
- datamap writes: `/entities/<type>/update` REPLACES json props (mikro assign, no merge) — never send a partial `trait`; every `buffer.data` flush is BROADCAST by `subsystems/typology/gestalten/shard/datamap.js:172 reactive()` to every `{thread}` subscriber INCLUDING the writer (a 1.5 s keep echoed hundreds of KB to a phone); a quiet write goes `em.getConnection().execute` + `em.refresh(row)` — `nativeUpdate` double-encodes json columns on libsql.
- emitter delegation FORWARDS the thread: the peer's EMITTER drains + flushes in its own context first, so `ctx.pool.add(await peer.emit.x({ ...payload, thread: ctx.input.thread }))` (declare `thread` in the peer's input); without it the buffer persists `thread: null` and never renders (`registry/education/modes/home/aprende/emitter/nyan.js:23` forwards it).
- mode harness: a ROOT `use` fires with `ctx.hallucination.turns` still `[]` (`/dialogue` fills them; dispatch is root-first); a dialogue-only section is `harness.branch("/dialogue").use(…)` (`commons/instances/hello-world/harness.js:37`). Turns sit past every `cache_control` breakpoint (anthropic `commons/hallucinators/anthropic/provider/translate.js:103-112` marks only last system + last tool): a tool result is re-billed EVERY later turn — size it by what it costs forever (11 kB doctor fold = 6073 uncached tokens/turn).
- authoring a harness → `.ikiro/reference/harnesses/harness.md` first (§3 walks one from empty file to landed mode; runnable `examples/`); every tool error speaks `[object Object]` today (known-issue `tool-errors-speak-as-object-object`).
- statics are served BLIND: `daemon/aperture/metadata.js:29` `if (mode.statics) meta.open("/statics", () => mode.statics)`; a per-language static rides `statics.language[slug].<key>` on the TOPOGRAPHY, the education domain folds `/language` — never a `daemon.statics` fold (/"this would force the runtime/daemon to know domain internals."/)
- "which MOUNTING is this" = the live `mode.manifest`'s `type` + `slug` (the kernel entry folded over the module, mask wins — `subsystems/paladin/prototypes/ledger/registry.js:216`); `mode.module.manifest.slug` answers only "which module" (`daemon/lifecycle/integration.js` prune keep-set read the MODULE's manifest → uninstall per boot, eleven duplicate sets). SQLite treats NULLs as DISTINCT in a unique index: a nulled `mode_id` turns `(slug, mode)` into a duplicate factory. Scope reads by `mode`, never `ontology`.
- `Literal.symbol` is DERIVED by `LiteralSubscriber` from the `symbols` relation and pivot inserts never dirty the literal: attach symbols BEFORE the create-flush, and a fresh row needs one touch (`assign({updatedAt: new Date()})` + flush) before its fold exists — `daemon/traits/dataset.js:187 linkPhase`. Never trust `symbol.*` on a row created in the current unit of work.
- a streaming bug: run `tests/sse.integration.test.js` FIRST (real `fetch` → `Deno.serve(http(aperture))`, mock cortex, asserts `meta.state`) — green = the provider, red = viva's SSE chain.
- `ModeTraitsEnum` (`daemon/entities/daemon/Mode.ts`) is validated on HYDRATE: drop a member and a row still carrying it throws `Invalid enum array items` inside `ObjectHydrator` before `population.js` can mirror it. Rename = add the new member, keep the old at the bottom (`:41` `TOOLED = "TOOLED", // TODO deprecated → TOOLING`), restart every instance, drop in a later pass (/"keep the old trait around, mark it as @deprecated, move it to the bottom of the list"/).
- a mode trait has THREE homes that drift apart: behavior `daemon/traits/<trait>.js` · persistence `ModeTraitsEnum` (missing → boot dies at flush) · client contract `implements("…")` (`systems/anima/src/app/panels/d/d.svelte:215` `m.implements("application") || m.implements("conversational")`). A dead/live claim needs the three-sided grep (/"how can i fucking chat with an application?? retard. i chat with conversational."/).

<!-- generated: python3 .ikiro/methods/codemap.py runtime — never hand-edited -->
```jsonc
// systems/runtime
{
 "package": "@vivalence/runtime",
 "exports": {
  ".": "./mod.js",
  "./run": "./run.js",
  "./daemon": "./daemon/index.js",
  "./daemon/aperture": "./daemon/aperture/index.js",
  "./daemon/traits": "./daemon/traits/index.js",
  "./daemon/skills": "./daemon/skills/index.js",
  "./process": "./process/index.js",
  "./scenarios": "./tests/scenarios/index.js"
 },
 "barrels": {
  "mod.js": ["* from ./runtime.js", "* from ./die.js", "* from ./daemon/entities/index.ts", "* as lifecycle from ./lifecycle/index.js", "* as daemon from ./daemon/index.js", "* as process from ./process/index.js"],
  "run.js": ["default"],
  "daemon/index.js": ["* from ./daemon.js", "* from ./die.js", "* as lifecycle from ./lifecycle/index.js", "* as aperture from ./aperture/index.js", "* as traits from ./traits/index.js"],
  "daemon/aperture/index.js": ["* from ./userspace.js", "* from ./datamap.js", "* from ./modes.js", "* from ./freight.js", "* from ./metadata.js", "* from ./cortex.js"],
  "daemon/traits/index.js": ["stagger", "* from ./dataset.js", "* from ./datasink.js", "* from ./intented.js", "* from ./emitter.js", "* from ./application.js", "* from ./booted.js", "* from ./generative.js", "* from ./harnessed.js", "* from ./tooling.js", "* from ./agentic.js", "SELFEVIDENT", "CONVERSATIONAL", "STANDALONE", "EXPOSED", "FRAUGHT", "MOUNTED"],
  "daemon/skills/index.js": ["* as entity from ./entity.js", "* as buffer from ./buffer.js", "* as thread from ./thread.js", "* as mode from ./mode.js"],
  "process/index.js": ["* from ./process.js", "* from ./die.js"],
  "tests/scenarios/index.js": ["* as daemon from ./daemon.js", "* as lighthouse from ./lighthouse.js", "mountMode", "mountModes", "bench", "* as datamap from ./datamap.js", "SymbolConcrete", "BufferConcrete", "provider"]
 },
 "tasks": {
  "run": "deno run -A run.js",
  "watch": "deno run -A --watch=../../commons,$HOME/.viva/registry run.js",
  "playground/drain": "deno run -A --no-check tests/drain.playground.js",
  "test/snapshots": "SNAPSHOT_HOT=1 deno test -A --no-check tests/**/*.snapshot.test.js",
  "test/cortex": "deno test -A --no-check tests/cortex.integration.test.js",
  "interactive/activity": "deno run -A --no-check tests/interactive/activity/daemon.js --port 7710 --panel"
 },
 "tasks, one file each (all --watch)": 5,
 "tests": {
  "tests": 39,
  "tests/bench": 1,
  "tests/daemon": 7,
  "tests/fixtures": 1,
  "tests/mode": 7,
  "tests/runtime": 2,
  "tests/topography": 2
 }
}
```
<!-- /generated -->
