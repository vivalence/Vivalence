---
paths: ["commons/**"]
---
<!-- writer: agent · kind: persistent · limit: 19800 chars · traps only, the code is the map -->
# codemap: commons — the checkout's ONE package; "registry" means the marketplace only

- lookup is `@commons/<manifest.type>/<manifest.slug>` — the MANIFEST's type, never the directory (`services/nlp/` is `service/nlp-stanza`, `hello-world/mode.viva.js` is `demo/hello-world`). Grep a slug. (`services/nlp/service.viva.js:9`)
- `manifest` is METADATA only; new behaviour = a sibling export. `CONVERSATIONAL STANDALONE SELFEVIDENT` are empty markers. (`systems/runtime/daemon/traits/index.js:35`)
- discovery skips `bak archive slp node_modules .git`: `instances/bak/`, `hallucinators/bak/` are unreachable. (`subsystems/paladin/belt/ignore.js:4`)
- hello-world: `/hello/research` declares `yields: Packet.Response` → SSE, exempt from the transport timeout. `/hello/search` calls the same `query()` as `web_search` (TOOLING is in-process only). `wikipedia.js TIMEOUT = 6000` must stay UNDER the multiplex ~8 s or the caller gets an empty envelope, no status.
- the root `README.md` "Hello, Instance!" block MIRRORS `instance.viva.js` — not byte-identical today (`README.md:201` folds `consume` to one line; no `runtime.statics.remote`; `environment` regrouped with comments) — edit both. `~/.viva/instances/hello-world/` is the copy the runtime bundles; a MOVE deletes there too.
- `research.js`: `ROUNDS = 30` is the researcher's budget, NOT `INTELLIGENT.rounds`; a tool result cannot stream and `render()` throws on any close but `complete`.
- `instances/hello-world/page/index.js:29` `emitter` is THE MINT: it passes NO thread to `buffer.create` — the EMITTER drain binds; both = `thread.counter` double-advanced (`P-nodoublebind`). `generator` arms NOTHING; a node opened WITHOUT an effect rewords GENERATIVE's valence, and its `/view` `use` returns WITHOUT `next()` when `refuse()` throws. `refuse()` rejects `https?:` imports — esbuild leaves them EXTERNAL, past the hash.
- the armed catalog is EIGHT names; a consumed TOOLING service mounts under its CONSUME KEY, not `manifest.slug`. (`instances/hello-world/tests/catalog.test.js:55` · `systems/runtime/daemon/lifecycle/population.js:110`)
- libsql: `loadStrategy: "balanced"` never `joined`; the Migrator only when `migrations` is passed, `transactional: false`. `shard.carry` re-ENTERS the live `RequestContext` — `RequestContext.create` forks an identity map and strands the turn. (`datamaps/libsql/libsql.viva.js:22`)
- openrouter `choice` (m70): a `choosers` table beside `models` (default `qwen/qwen3.6-35b-a3b`, `statics.choosers` overrides); `buildChoiceParams` = one token · `logprobs` + `top_logprobs: 20` · reasoning off · `provider: { require_parameters: true }` — MEASURED: OpenRouter fans one model id across upstreams and Venice returns `logprobs: null` where AkashML/Darkbloom return 20; `readChoice` softmaxes the label logprobs inline, >20 labels throws. Anthropic can never serve `choice` (no logprobs). Which models can: `GET /api/v1/models` → `supported_parameters` ∋ `top_logprobs` (151 on 09-23). (`hallucinators/openrouter/provider/translate.js`)
- hallucinators: `provider()` → Faculty[]; `object` is DERIVED, no provider declares it. openrouter: the model table is overridable (`statics.models`), the reasoning switch is not (`reasoning:{enabled:false}` explicit); `cache.marks` stamps `cache_control` on the LAST section. A tool schema on the wire carries NO `$id`: `translateTools` runs `plain()` (openrouter + anthropic) — a NESTED `$id` (`v.primitives.Label` in `buffer_label`) made gpt-5.1 via OpenRouter answer `finish_reason: length` / `max_output_tokens` with zero output and no usage chunk, not a 400; a top-level `$id` passed. Bisect a dead provider answer by tools, one at a time, off a captured `buildParams()` body. (`hallucinators/openrouter/provider/translate.js:118`)
- openrouter `choice` is NOT a chat completion: `makeChoice` is a plain `fetch` to `https://openrouter.ai/api/alpha/decisions` (jev, `typesafe/jev-1.13`, the same key), `translateChoice` writes our `primer` as jev's `state` and our tag as jev's `type` verbatim (`choice · score · noul`), `readChoice` folds `answers` back in the CALLER's option order — jev returns `probabilities` keyed in its own order and score levels as `"0","1"` string keys. The chooser row carries `options: 255 · choices: null`; jev's own 422 (an 11-level score) comes back through `fault`. Live 09-24: 3 questions, 397 input tokens, `usage.cost` 1.7e-05. (`hallucinators/openrouter/provider/translate.js:256`)
- reader: `guard` refuses before the request leaves; `hop` re-guards EVERY redirect. `drink()` consumes the stream — `open()`'s return is the ONLY copy. Reached as `ctx.daemon.services.reader`, never kernelled. (`services/reader/hop.js:21` · `instances/hello-world/tools/web.js:72`)
- `fixtures/data/` is NOT a module — ONE consumer, `runtime/tests/scenarios/fixtures.js`, by relative path. (`systems/runtime/tests/scenarios/fixtures.js:1`)
- tests: NO commons task, no `deno.json*` — run a file by name with the root config. Snapshot fixtures gitignored: a fresh checkout throws until `SNAPSHOT_HOT=1`. `nlp/service`, `multiplayer/{auth,lighthouse}` need a LIVE process, no skip. (`instances/hello-world/tests/harness.snapshot.test.js:18`)
- tap: `/hello/doctor` = names, never values. (`instances/hello-world/tools/doctor.js:17`)

- `commons/fixtures/data/live.js` owns liveness: probes `/metadata/daemons`, derives the slug, logs in → `{base, connection, daemons, up, slug, mount, identity, authority, modes, mounts, reason}`. A test never pins `const DAEMON = "brazilian"`; `runtime.mounts("game/pick")` guards per mode; every skip prints `SKIP: <why>`. beef: /"fixtures is yours. you run that shit. just like /tests"/ — no per-item go.
- `@commons/hallucinator/stub` (`fixtures/hal/stub/`): the script is a PURE fn of the request — `--run <name> --deltas 40 --pace 120ms --stall 4s --tool lookup --rounds 2 --fault retryable --timeout --object '{…}' --close length` parsed by `Signal` (`--close <state>` seals an assistant turn with NO parts and that state), round = count of `tool_result` turns. Mount it ALONE (a neighbouring tune shadows it on `nearest`); a scenario calls `world.cortex.faculties.clear()` first (`systems/runtime/tests/stub.activity.test.js:16`).

<!-- generated: python3 .ikiro/methods/codemap.py commons — never hand-edited -->
```jsonc
// commons
{
 "manifest": "package.viva.js",
 "folders": {
  "dashboards": {"dataspace": 5},
  "datamaps": {"libsql": 1},
  "fixtures": {"data": 8, "hal": 1, "instance": 1, "language-learning": 2},
  "hallucinators": {"anthropic": 3, "deepgram": 3, "elevenlabs": 3, "openrouter": 3},
  "instances": {"hello-world": 8, "localhost": 0, "multiplayer": 2, "playground": 1},
  "ledger": {},
  "lighthouses": {"multiplayer": 4},
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
  "lighthouses/multiplayer/tests": 3,
  "services/nlp/tests": 3,
  "services/reader/tests": 6
 }
}
```
<!-- /generated -->
