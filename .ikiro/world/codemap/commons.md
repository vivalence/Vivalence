---
paths: ["commons/**"]
---
<!-- writer: agent · kind: persistent · limit: 19800 chars · traps only, the code is the map -->
# codemap: commons — the checkout's ONE package; "registry" means the marketplace only

## finding and declaring

- a module's lookup is `@commons/<manifest.type>/<manifest.slug>` — the MANIFEST's words, never the directory: `services/nlp/` is `service/nlp-stanza`, `instances/hello-world/mode.viva.js` is `demo/hello-world`. Grep the slug, not the path. (`services/nlp/service.viva.js:9` · `instances/hello-world/mode.viva.js:6`)
- `manifest` is METADATA only; new behaviour = a sibling export. `SELFEVIDENT` · `CONVERSATIONAL` · `STANDALONE` are empty marker traits — they do nothing on their own. (`systems/runtime/lifecycle/mode/traits/index.js:16` · `:19` · `:22`)
- discovery skips `bak archive slp node_modules .git`: anything under `instances/bak/` or `hallucinators/bak/` is unreachable — moving a module there unregisters it. (`subsystems/paladin/belt/ignore.js:4`)
- a consumed TOOLING service mounts under its CONSUME KEY, not its `manifest.slug` → `ctx.daemon.services.<key>`. (`systems/runtime/lifecycle/daemon/population.js:73`)

## hello-world

- the root `README.md` "Hello, Instance!" block MIRRORS `instances/hello-world/instance.viva.js` but is not byte-identical (README folds `consume` to one line, omits `runtime.statics.remote`, regroups `environment`) → an edit lands in BOTH. `~/.viva/instances/hello-world/` is the copy the runtime bundles; a MOVE deletes there too. (`README.md:166` · `README.md:201`)
- the armed catalog is exactly EIGHT names; adding a tool reds `P-catalog`. (`instances/hello-world/tests/catalog.test.js:57`)
- `/hello/research` declares `yields: Packet.Response` → served as SSE, which is what exempts it from the request timeout; the `research` TOOL folds the same stream (a tool result cannot stream) into NOMINAL/ERROR — an ERROR carrying a buffer means the page IS on screen. (`instances/hello-world/tools/doors.js:21` · `tools/research.js:45`)
- `research.js` `ROUNDS = 30` is the researcher's budget, NOT the thread's `INTELLIGENT.rounds` — dialing the thread down must not starve research. (`instances/hello-world/tools/research.js:7`)
- `/hello/search` calls the same `query()` as `web_search` (TOOLING is in-process only); `wikipedia.js` `TIMEOUT = 6000` must stay UNDER the caller's request timeout (default 30000, `subsystems/typology/prototypes/request.js:15`) or the caller gets an empty envelope, no status. (`instances/hello-world/tools/wikipedia.js:10`)
- `page/index.js` `emitter` is THE MINT and passes NO thread to `buffer.create` — the EMITTER drain binds; passing one double-advances `thread.counter` (`P-nodoublebind`). `generator` arms NOTHING. `refuse()` rejects `https?:` imports because esbuild leaves them EXTERNAL, past the hash. (`instances/hello-world/page/index.js:33` · `:54`)
- `/hello/doctor` reports names and whether they resolve, never values. (`instances/hello-world/tools/doctor.js:17`)

## datamaps and hallucinators

- libsql `provider(mask, options)` → `new Datamap(orm)` (typology's face; `shard.carry` re-ENTERS the live `RequestContext` — `RequestContext.create` forks an identity map and strands the turn, `subsystems/typology/prototypes/datamap.js:17`). `config`: seat = `mask.mountpoint.branch(statics.db.file)`; no mountpoint → `:memory:` + `createSchema`, a seat → the Migrator (`transactional: false`); `options` spreads LAST (carries `entities` + CONSTRUCTED `subscribers`); `loadStrategy: "balanced"`, never `joined`. A test with no mask: `config({}, { entities })`. (`datamaps/libsql/libsql.viva.js:11` · `:26`)
- a tool schema on the wire carries NO `$id`: `translateTools` runs `plain()` (openrouter + anthropic). A NESTED `$id` made gpt-5.1 via OpenRouter answer `finish_reason: length` with zero output and no usage — not a 400. Bisect a dead provider answer by tools, one at a time, off a captured params body. (`hallucinators/openrouter/provider/translate.js:135` · `hallucinators/anthropic/provider/translate.js:130`)
- openrouter: the model table is overridable (`statics.models`), the reasoning switch is not (explicit `reasoning`); `cache_control` lands on the LAST system section only. `provider()` → Faculty[]; `object` is DERIVED, no provider declares it. (`hallucinators/openrouter/provider/translate.js:112` · `:118`)
- openrouter `choice` is NOT a chat completion and has no logprobs path (`buildChoiceParams` grep → 0): `makeChoice` is a plain `fetch` to `https://openrouter.ai/api/alpha/decisions` (jev, `typesafe/jev-1.13`, same key; `choosers` row `options: 255 · choices: null`, `statics.choosers` overrides). `translateChoice` sends our `primer` as jev's `state`, our tag as its `type` verbatim (`choice · score · noul`); `readChoice` folds `answers` back in the CALLER's option order — jev keys `probabilities` in its own order and score levels as `"0","1"` strings. jev's 422 (e.g. an 11-level score) comes back through `fault`. Anthropic cannot serve `choice`. (`hallucinators/openrouter/provider/index.js:13` · `:50` · `:104` · `translate.js:258` · `:274`)
- `@commons/hallucinator/stub` (`fixtures/hal/stub/`): the script is a PURE fn of the request — `--deltas 40 --pace 120ms --stall 4s --tool lookup --rounds 2 --fault retryable --timeout --object '{…}' --close length`, parsed by `Signal`; `--close <state>` seals a turn with NO parts; the round is READ off `tool_result` turns, never counted. Mount it ALONE (a neighbouring tune shadows it on `nearest`, `subsystems/typology/prototypes/cortex.js:15`); a scenario calls `world.cortex.faculties.clear()` first. (`fixtures/hal/stub/provider/script.js:17` · `:70` · `systems/runtime/tests/stub.activity.test.js:16`)

## services

- reader: `guard` refuses before the request leaves; `hop` re-guards EVERY redirect. `drink()` consumes the stream — what it returns is the ONLY copy. Reached as `ctx.daemon.services.reader`, never kernelled. (`services/reader/hop.js:21` · `:42` · `instances/hello-world/tools/web.js:72`)
- the multiplayer lighthouse is `attachment · manifest · provider`, traits `SERVICE · PROVIDER · DATAMAP · ATTACHED`; `/announce` takes no bearer (known-issue `announce-without-a-bearer`). (`lighthouses/multiplayer/multiplayer.viva.js:8` · `attachment/daemons.js:5`)

## fixtures and tests

- `fixtures/data/` is NOT a module — ONE consumer, re-exported by relative path (grep `fixtures/data` → 1 hit). (`systems/runtime/tests/scenarios/fixtures.js:1`)
- `fixtures/data/live.js` owns liveness: probes `/metadata/daemons`, picks the slug, logs in → `{ base, connection, daemons, up, slug, reference, identity, authority, modes, mounts }`, or `up: false` + a reason. A test never pins `const DAEMON = "brazilian"` (grep → 0); guard per mode with `mounts("game/pick")`; every skip prints `SKIP: <why>`. beef: /"fixtures is yours. you run that shit. just like /tests"/ — no per-item go. (`fixtures/data/live.js:79`)
- NO commons task and no `deno.json*` under `commons/` — run a file by name with the root config (`deno test -A --no-check <file>`).
- `*.snapshot.json` is gitignored: a fresh checkout's snapshot test throws on the missing file until a run with `SNAPSHOT_HOT=1`. (`hallucinators/openrouter/tests/translate.snapshot.test.js:11` · `instances/hello-world/tests/harness.snapshot.test.js:18`)
- `services/nlp/tests/service.test.js` needs a LIVE python+stanza process and has no skip (only `tokenize.test.js` skips) → it reds on a machine without stanza.
- `lighthouses/multiplayer/tests/{shape,auth,lighthouse,datamap}` ride ONE in-process rig — `create()` → `{ conn, connect(token), signup, seedDaemon, close, … }` over the fixture seed; never spawn a process for them. (`systems/runtime/tests/scenarios/lighthouse.js:6` · `:61`)

<!-- writer: agent · hand-kept, recounted 10-06 (entries per dir, bak/ excluded) -->
```jsonc
// commons
{
 "manifest": "package.viva.js",
 "folders": {
  "dashboards": {"dataspace": 5},
  "datamaps": {"libsql": 1},
  "fixtures": {"data": 8, "hal": 1, "instance": 1, "language-learning": 2},
  "hallucinators": {"anthropic": 3, "deepgram": 3, "elevenlabs": 3, "openrouter": 3},
  "instances": {"hello-world": 8, "localhost": 0, "multiplayer": 3, "playground": 1},
  "ledger": ["ledger.viva.js"],
  "lighthouses": {"multiplayer": 5},
  "playground": {"automaton": 2, "card": 2, "chaosmonkey": 3, "dealer": 2, "spawned": 2, "spawner": 2, "switchboard": 2},
  "services": {"nlp": 5, "reader": 8}
 },
 "tests": {
  "fixtures/hal/stub/tests": 1,
  "hallucinators/anthropic/tests": 2,
  "hallucinators/deepgram/tests": 2,
  "hallucinators/elevenlabs/tests": 1,
  "hallucinators/openrouter/tests": 2,
  "instances/hello-world/tests": 11,
  "lighthouses/multiplayer/tests": 4,
  "services/nlp/tests": 3,
  "services/reader/tests": 6
 }
}
```
