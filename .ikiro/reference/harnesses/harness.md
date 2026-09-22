# harness — the reference

<!-- writer: agent · reference, unbudgeted · folds the nine files of the harness dossier (dossier · hackernews · reddit · primary · viva-census · wording · entities · mechanisms · client) into one · inside claims cite file:line (repo paths repo-rooted, registry paths ~/.viva/registry-rooted) · outside claims cite a source id (S·HN·R, §12) · examples/ run green · baseline .ikiro/quests/done/m29-agent-tools.org -->

```
.ikiro/reference/harnesses/
  harness.md        THIS — anatomy · build walkthrough · voice · entities · mechanisms · client · worked examples
                    · outside meta · scorecard + gaps · avenues · sources
  examples/
    rig.js          HARNESSED stand-in over a scripted Cortex — the REAL lowering, loop and dispatch, offline
    pt10/           guide.js · screen.js · tools.js · harness.js · pt10.test.js     (§8.1)
    seat/           harness.js · seat.test.js                                         (§8.2)

$ cd subsystems/typology && deno test -A --config deno.jsonc ../../.ikiro/reference/harnesses/examples/{pt10/pt10,seat/seat}.test.js
ok | 2 passed (8 steps) | 0 failed
```

Read §0–§2 once. Build with §3 open (it walks one harness from an empty file to a landed mode). §4–§7 are lookup. §8 is the whole code of two harnesses with what the model saw. §9 is the world outside viva. §10 scores the registry and lists the gaps. §11 is where this goes next.

---

## 0. three habits

1. **Read the assembled prompt before the first live call.** A harness is a text-and-data pipeline; the artifact is what the provider receives. `examples/rig.js` captures it (`seen[0].system`, `.tools`, `.cache`); vdex pins its whole prompt in a snapshot (§4.4 #14).
2. **Every rule in prose gets a twin in code, or it is a wish.** "never invent a slug" holds because `literal.named` throws. "Run dry:true first" fails because `dry … .default(false)`. The best registry harnesses back each prohibition with a throwing repository call, a schema bound, or an absent tool.
3. **Size every tool output by what it costs forever.** Nothing in `turns` is cached; a `tool_result` re-bills on every later turn of the thread (§6.3). And today a tool error costs the model nothing at all — it reads `[object Object]` (§2.4, G2).

---

## 1. what a harness is

Outside: `Agent = Model + Harness` (HN #2). Weng: *"the system surrounding a base model that orchestrates execution and decides how the model thinks and plans, calls tools and acts, perceives and manages context, stores artifacts, and evaluates results"* (HN #17). Everything around the weights: system sections, the memory the model sees, the tool catalog, the loop, the shape of a tool result, what persists, what the client renders, the outer loop that verifies.

Inside viva: a harness is a `Vector` a mode exports. The runtime trait `HARNESSED` wraps it with claiming, arming, chaining, persisting, summarizing and the cortex leaf, and mounts it as `mode.harness` (server) and `/harness` on the mode's aperture (wire).

```
                 ┌──────────────────────── HARNESSED (runtime) ─────────────────────────────┐
 Dock / door ──▶ │ normalizing · claiming(thread, INTELLIGENT, VOCAL) · activating(controller) │
                 │ requesting → ctx.hallucination = { controller, policy, system, turns, tools } │
                 │   /dialogue: chaining (history + user Turn) · persisting (forked em)          │
                 │   ── domain.harness ── mode.harness ──   ◀ YOUR sections, defaults, branches  │
                 │ summarizing → policy.cache.marks · system.thread                              │
                 │ leaf → cortex.hallucinate[dialogue|object].render|stream(ctx.hallucination)   │
                 └──────────────────────────────┬────────────────────────────────────────────┘
                                                ▼
                 cortex → lowering (tools Vector → catalog) → respond (rounds · dispatch · packets)
                        → translate.buildParams (sections → blocks, marks → cache_control)
```

The fixed lexicon (runtime shard): `dialogue`/`object` × `render`/`stream` on every HARNESSED mode — /"The vector for harness is not semantic. It's functional lexicographic"/. A mode-specific nature (`/ask`, `/turn`) lives on an EXPOSED aperture door, never on the harness.

| avenue | persists turns | history | output | typical caller |
|---|---|---|---|---|
| `dialogue.stream` | ✓ | thread, all of it | packets | dock · streaming door |
| `dialogue.render` | ✓ (appending) | thread | `{turns, output:{message}, meta, condition}` | nested/internal |
| `object.render` | ✗ | `input.turns` only | `output.object` per schema | door, verifier, reviewer |
| `object.stream` | ✗ | `input.turns` | packets | rare |
| `verbatim.stream` | ✗ | — | transcript events | dictation |

---

## 2. anatomy — what your harness is handed, and in what order

### 2.1 the assembly

```js
// systems/runtime/daemon/traits/harnessed.js:158-229
export const HARNESSED = (mode, daemon) => {
  if (!daemon.cortex) throw new Error("HARNESSED: daemon has no cortex");
  const harness = new Vector()
    .use(shard.context.bind("daemon", daemon))
    .use(shard.context.bind("mode", mode))
    .use(normalizing).use(claiming).use(activating).use(requesting);
  harness.branch("/verbatim").open({ nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any }, shard.hal.verbatim({ polish: POLISH, tune: "fast" }));
  harness.branch("/dialogue").use(chaining).use(persisting);
  if (daemon.domain?.harness) harness.slurp(daemon.domain.harness);
  if (mode.module.harness) harness.slurp(mode.module.harness);
  harness.use(summarizing);
  for (const type of ["dialogue", "object"]) {
    harness.branch(type)
      .open("render", (ctx) => ctx.daemon.cortex.hallucinate[type].render(ctx.hallucination))
      .open({ nature: "stream", yields: Packet.Response }, (ctx) => ctx.daemon.cortex.hallucinate[type].stream(ctx.hallucination));
  }
  harness.branch("choice")
    .open("render", (ctx) => ctx.daemon.cortex.hallucinate.choice.render({
      controller: ctx.controller, policy: ctx.hallucination.policy,
      state: ctx.input.state, question: ctx.input.question, options: ctx.input.options,
    }));
  return () => {
    mode.harness = shape.object(harness, steer.strategy.echo);
    mode.aperture.branch("/harness").slurp(harness);
  };
};
```

```
anima Dock.svelte:240   thread.mode.harness.dialogue.stream({ thread, id, parts })
  │  (or a door:  ctx.mode.harness.object.render({ turns, output, …extra }))
  ▼
root   bind daemon · bind mode
       normalizing   "text" → { prompt }
       claiming      ctx.thread = Thread ROW · ctx.user · ctx.intelligent / ctx.vocal (claim-gated)      :23
       activating    ctx.activity + ctx.controller (or input.controller, no row)                         :33
       requesting    ctx.hallucination = { controller, policy, settings?, system, turns, tools, output? } :41
       ── domain.harness root uses ──                                                                    :179
       ── mode.module.harness root uses ──     ◀ YOU                                                     :180
       summarizing   policy.cache.marks = [LAST mode key, "tools"] · system.thread = skills.thread.summary :150
/dialogue
       chaining      turns = turn.history(thread) + the user Turn (flushed BEFORE the model runs)       :87
       persisting    folds the response into TurnEntity rows on a forked em, one flush at the end      :102
       ── your harness.branch("/dialogue") uses ──
/object
       ── your harness.branch("/object") uses ──          (no chaining, no persisting — by design)
/choice
       ── your harness.branch("/choice") uses ──          (reads ctx.input, never ctx.hallucination's turns)
leaf   render | stream → daemon.cortex.hallucinate[type](ctx.hallucination)
       choice render   → daemon.cortex.hallucinate.choice({ controller, policy, state, question, options })  :213
```

**Order: root uses in registration order, then the branch's uses, then the leaf.** A root `use` sees `turns: []` on a dialogue (history lands on `/dialogue`, after your root ran). Measured: object render saw `["role","guide"]`, dialogue saw `["role","guide","format","screen"]` (examples/pt10 test 4). Cortex `compile` (`prototypes/cortex.js:88-104`) runs `schema.fill` on the request and throws `[cortex] a hallucination requires a controller` without one.

### 2.2 the record you write to

```js
// systems/runtime/daemon/traits/harnessed.js:41-58 — requesting
const requesting = async (ctx, next) => {
  const { system, prompt, turns, output, tune, config } = ctx.input;
  ctx.hallucination = {
    controller: ctx.controller,
    policy: {
      ...config,
      ...(ctx.intelligent.tune && { tune: ctx.intelligent.tune }),
      ...(ctx.intelligent.rounds && { rounds: ctx.intelligent.rounds }),
      ...(tune && { tune }),
    },
    ...(ctx.intelligent.effort && { settings: { effort: ctx.intelligent.effort } }),
    system: typeof system === "string" ? { system } : { ...system },
    turns: turns ?? (prompt ? [{ role: "user", parts: [{ type: "text", text: prompt }] }] : []),
    tools: arming(ctx),
    ...(output && { output: { schema: output } }),
  };
  await next();
};
```

- Per-invocation channels: `tune`, `config` (spread into policy), `output`, `system`, `turns`/`prompt`/`parts`, `thread`, `id`, `controller`, `tools`. There is no `input.rounds`/`input.settings`/`input.policy`.
- **Extra keys pass through**: `harness.object.render({ turns, output, legal })` → `ctx.input.legal` in your middleware — the seam for caller-supplied verification data (§8.2).
- On `/dialogue`, `chaining` OVERWRITES `turns`: only `input.parts` reaches the model; a `prompt` string becomes a user turn with `parts: []`.

```js
// subsystems/typology/schematics/primitives/hallucination.js:378-380
Policy.dialogue = v.object({
  tune:    v.union([Tier, Tune]).optional(),                // a tier name or [intelligence, reasoning, speed, thrift]
  rounds:  v.integer({ minimum: 1, default: 10 }),          // tool rounds per turn — the ONLY budget the loop enforces
  backoff: v.array(v.integer(), { default: [1000, 4000] }), // retry waits, pre-first-packet only
  cache:   v.object({ marks: v.array(v.string()) }).optional(),
});
Request = { system?: record, turns: Turn[], tools?: Tool[], settings?, output?: { schema }, cache?: { marks } };
```

```js
// subsystems/typology/prototypes/cortex.js — tiers, [intelligence, reasoning, speed, thrift]
frugal:  [0.1, 0.3, 0.9, 1.0]   fast:      [0.4, 0.3, 1.0, 0.8]   balanced: [0.4, 0.6, 0.6, 0.6]
capable: [0.6, 0.8, 0.4, 0.4]   unleashed: [0.9, 1.0, 0.2, 0.2]   eager:    [0.3, 0.5, 0.5, 0.1]
// faculty(cortex, type, via, policy.tune) → cortex.findOne → nearest (squared Euclidean over the desire's length)
// no match → "[hallucination] no '<type>' faculty resolves a '<via>' avenue"; no tune → [0.5,0.5,0.5,0.5] (cortex.js:22)
```

### 2.3 arming — the names the model sees

```js
// systems/runtime/daemon/traits/harnessed.js:60-85
const arming = (ctx) => {
  const armed = new Vector()
    .slurp(skills.entity.entity).slurp(skills.buffer.buffer).slurp(skills.thread.thread).slurp(skills.mode.mode)
    .slurp(paladin.skills.fs.fs).slurp(paladin.skills.shell.shell);
  // services under /service/<slug> · AGENTIC peers under their slug (agentic.js)
  if (ctx.daemon.domain?.tools) armed.branch(ctx.daemon.domain.manifest.slug).slurp(ctx.daemon.domain.tools);
  if (ctx.mode.tools) armed.slurp(ctx.mode.tools);
  if (ctx.mode.generator?.tools) armed.branch("/generator").slurp(ctx.mode.generator.tools);
  // input.tools: { name: execute | { execute, ...edge } } → armed.open({ nature: new ToolCall(name).signal.pathname, ...edge }, execute)
  armed.use(shard.context.bind("daemon", ctx.daemon));
  armed.use(shard.context.bind("mode", ctx.mode));
  if (ctx.user) armed.use(shard.context.bind("user", ctx.user));
  if (ctx.input.thread) armed.use(shard.context.bind("thread", ctx.input.thread));   // ← the ID STRING
  return armed;
};
// subsystems/typology/prototypes/toolcall.js:22-28 — ToolCall.name = absolute.join("_")
```

```
mode.tools   /guide/read              → guide_read         (chess coach roots at /practice → practice_board)
domain       <domain-slug>/resolve    → assembly_resolve   language-learning_review   chess_legal   voffice_lookup
service      /service/<slug>/x        → service_<slug>_x
generator    /generator/view/render   → generator_view_render …_revise …_inspect …_list
AGENTIC      every other TOOLING mode → dojo_provision  harvest_drain  aprende_flashcard
runtime      entity_schema entity_find entity_count · buffer_update buffer_label · thread_update · mode_find
paladin      fs_tree fs_find fs_read fs_write fs_stat fs_move fs_delete · shell_run          ← on EVERY call
input.tools  lookup                    (in-process only; an execute does not survive JSON)
```

Pinned armory, hello-world (`commons/instances/hello-world/tests/snapshots/hello-world-armory.snapshot.json`): `fs_tree fs_find fs_read fs_write fs_stat fs_move fs_delete shell_run viva_doctor web_search web_read research generator_view_render generator_view_revise generator_view_inspect generator_view_list`. vdex's (from its hallucination snapshot): `entity_schema entity_find entity_count buffer_update buffer_label thread_update mode_find fs_tree … shell_run index find read write file move delete open`. Your persona's prohibitions must reckon with `fs_write`, `fs_delete`, `shell_run`, `buffer_update` being armed (G10).

### 2.4 what a tool returns, and what the model hears

The yield lexicon: **one bag — `message` (mind-facing), `object` (caller-code-facing), one key per entity type at the top level.**

```js
return { message: located(row), buffer: [row] };                               // ✓ lexicon form
return { message: line(row), entities: { literal: [row] }, object: { slug } }; // ✗ nested — skips spoken + anima (G11)
return { condition: "ERROR", message: "… — agenda first." };                   // an explicit refusal
throw new Error("no pt10 buffer is open on this thread — ask the operator to open the guide first"); // a fault
```

```js
// subsystems/typology/gestalten/belt/hallucinate.js:7-44 — what the model HEARS
export const speak = (output) => {
  if (output == null) return "";
  if (typeof output !== "object") return String(output);
  const { message, ...rest } = output;
  const rows = Object.fromEntries(Object.entries(rest).map(([key, value]) =>
    [key, Array.isArray(value) ? value.map((row) => card(row, spoken(key))) : value]));
  return [message, Object.keys(rows).length ? JSON.stringify(rows) : null].filter((line) => line != null && line !== "").join("\n");
};
// called: commons/hallucinators/anthropic/provider/translate.js:71 · openrouter/provider/translate.js:38
```

Measured (`deno run` against the real belt):
```
speak({ message: 'updated "Flamingo"', buffer: [{ id:"b1", index:0, mode:{id:"m1"}, thread:"t1", traits:["LABELED"], trait:{…}, data:{big:"x…"}, view:{hash:"abc", bundle:"…"} }] })
  → 'updated "Flamingo"\n{"buffer":[{"id":"b1","index":0,"mode":"m1","thread":"t1","traits":["LABELED"],"trait":{"LABELED":{"name":"Flamingo"}},"view":{"hash":"abc"}}]}'
speak({ message: '[assembly] no placement named "frame" — read the fold with assembly_resolve for real slugs' })
  → '[assembly] no placement named "frame" — read the fold with assembly_resolve for real slugs'
```

```js
// subsystems/typology/gestalten/belt/hallucinate.js:96-101 — every failed dispatch: the fault IS the message, condition says it failed
const message = fault instanceof NotFound
  ? `unknown tool: ${call.name} — armed: ${armory(tools) || "(none)"}`
  : fault.message;
return { call, result: { condition: "ERROR", output: { message } } };
// :157 — the tool_result part keeps the condition; nothing downstream sniffs the message for an error
parts.push({ type: "tool_result", id: call.id, condition: result.condition, output: result.output });
// commons/hallucinators/anthropic/provider/translate.js:72   ...(part.condition === "ERROR" && { is_error: true })
// commons/hallucinators/openrouter/provider/translate.js:38  content: `${part.condition === "ERROR" ? "error: " : ""}${speak(part.output)}`
```

Before 09-23 `message` was `{ error }`, an object, and `speak` joined it to `"[object Object]"` — every "error that names the next move" in the registry was written and never delivered (G2, landed). `Part.ToolResult.condition` is optional: turns persisted before carry none and read NOMINAL. Buffer is the only entity with a `spoken` list (`["id","index","mode","thread","traits","trait","view.hash"]` — `data` dropped); every other entity speaks its whole `toJSON()`.

### 2.5 the loop — `belt/hallucinate.js respond()`

```
while (rounds < policy.rounds)                                    :120
  proceed()? → deliver(request) [retry on retryable, pre-first-packet only, backoff[i]]  :55-74
  stream the turn, proceed() after every packet
  turn.meta.state !== "tools" → /response/close { state: complete }
  dispatch(policy, parts): Promise.all, one child controller per call (controller.branch(call.name))  :76-105
  yield /tool/call, /tool/yield per call (AFTER all finished) · /turn/full (the tool_result user turn)
rounds exhausted → /response/close { state: "length", rounds }    :161   (the last round's tools DID run)
fault → /response/close { state: "error", fault: { kind, message } }   :167-178
render() throws on anything but complete: "[hallucinate] 'dialogue' response closed length after N rounds"  :188-192
```

- Anthropic retryable `[408, 429, 500, 529]` (`translate.js:133-137`); never retries once packets flowed (no double billing); the sleep is not abortable.
- `rounds` is the only tool budget the loop enforces. Prose budgets ("at most THREE tool calls") under `rounds: 10` are wishes.
- The stub hallucinator (`commons/fixtures/hal/stub/`) calls every armed tool with `{ query }` whatever its schema says — for tool-loop tests register a scripted faculty (`examples/rig.js`, `subsystems/typology/tests/hallucination.test.js:49`).

### 2.6 the stream grammar

```
Packet.Response = TurnOpen | PartOpen | PartDelta | PartClose | TurnClose | ToolCall | ToolYield | TurnFull | ResponseClose
/turn/open      { turn: { role } }
/part/open      { index, part }
/part/delta     { index, delta }          strings concatenate, others replace (soma.pour)
/part/close     { index }                 tool_use string input → JSON.parse
/turn/close     { meta }                  { state, usage, provider }
/tool/call      { id, name, input }       emitted AFTER every tool in the round finished
/tool/yield     { id, result: { condition, output } }
/turn/full      { turn }                  the tool_result user turn
/response/close { meta: { state: complete|tools|length|abort|error|filter, rounds, fault? } }
```

```js
// derived from subsystems/typology/tests/gestalten/hallucinate.test.js:198-211
{ event: "/turn/open", turn: { role: "assistant" } }
{ event: "/part/open", index: 0, part: { type: "tool_use", id: "", name: "" } }
{ event: "/part/delta", index: 0, delta: { id: "u1", name: "lookup", input: { query: "casa" } } }
{ event: "/part/close", index: 0 }
{ event: "/turn/close", meta: { state: "tools" } }
{ event: "/tool/call", id: "u1", name: "lookup", input: { query: "casa" } }
{ event: "/tool/yield", id: "u1", result: { condition: "NOMINAL", output: { message: "house" } } }
{ event: "/turn/full", turn: { role: "user", parts: [{ type: "tool_result", id: "u1", output: { message: "house" } }] } }
{ event: "/turn/open", turn: { role: "assistant" } }
{ event: "/part/open", index: 0, part: { type: "text", text: "" } }
{ event: "/part/delta", index: 0, delta: { text: "casa means house" } }
{ event: "/part/close", index: 0 }
{ event: "/turn/close", meta: { state: "complete" } }
{ event: "/response/close", meta: { state: "complete", rounds: 2 } }
```

Folds (`gestalten/belt/soma.js`): `pour(turn, packet)` one turn · `scan(stream)` yields the running turn per packet (the dock's `live`) · `transcript(folded, packet)` the multi-round fold `{ turns, output, meta, condition }` — what `render()` returns. **The object is at `folded.output.object`**, never `folded.object` (G12).

### 2.7 ten laws, each verified

```
1  root → branch → leaf. Avenue-only sections go on harness.branch("/dialogue" | "/object").
2  ctx.thread is a Thread ROW in the harness (claiming) but an ID STRING in tools (arming).
   → threadOf = (ctx) => ctx.thread?.id ?? ctx.thread ?? null
3  the cache breakpoint lands on your LAST system key (summarizing, before system.thread). Volatile last = mark on volatile bytes. (G1)
4  a thrown tool reaches the model as its message, the part carrying condition ERROR (is_error on Anthropic, an `error: ` prefix on OpenRouter); a schema fault still speaks bare ("Validation failed: must be <= 3"). (G2b)
5  extra input keys pass through to ctx.input — caller-supplied verification data rides here.
6  re-render inside the harness with a BRANCHED controller: ctx.hallucination.controller.branch("repair-1").
7  the stub calls every tool with { query } — script a faculty for tool-loop tests.
8  rounds is the only enforced tool budget.
9  history is UNBOUNDED: every turn, every part, every tool_result bag, every send. Nothing compacts. (G9)
10 the thread OVERRIDES the call: INTELLIGENT.rounds beats input.config.rounds (harnessed.js:45-49). (G7)
```

### 2.8 choice — the sixth faculty: a distribution, never a sample

`dialogue` and `object` WRITE an answer; `choice` READS one. Several questions of ONE `primer`, each over a closed answer space the caller declares; the verdict is one distribution per question. Landed m70 (`quests/done/m70-choice-faculty.org`, M5 09-24); the shape is TypeSafe Jev's, in our words — /"we take the shape, bring our own words"/.

```js
// a HARNESSED mode — the whole call surface
const verdict = await ctx.mode.harness.choice.render({
  primer: { expected: "Vado al mercato.", answer: "Io vado al mercato domani." },
  questions: {
    same:  { type: "choice", ask: "Does `answer` mean `expected`?", options: { yes: null, partly: "extra or missing detail", no: null } },
    grade: { type: "score",  ask: "How close is `answer` to `expected`?", levels: ["wrong", "close", "exact"] },
    ok:    { type: "noul",   ask: "Is `answer` grammatical Italian?" },
  },
});
```

```json
{ "same": { "yes": 0.03, "partly": 0.96, "no": 0.01 }, "grade": [0.01, 0.97, 0.02], "ok": 0.97 }
```

A faculty, as the cortex holds it:

```json
{ "type": "choice", "tune": [0.4, 0.3, 1.0, 0.95], "context": 32000, "options": 255, "choices": null, "config": { "model": "typesafe/jev-1.13" }, "via": ["render"] }
```

```
the path, file:line
ctx.mode.harness.choice.render({ primer, questions })
  harnessed.js:214          branch "choice" — root uses ran (controller · thread-tuned policy); forwards primer · questions
    cortex.js:59            /choice branch
      shard/hallucinate.js  tagging    an absent `type` filled from the shape — questionmap [[choice, "options"], [score, "levels"], [noul]]
      shard/hallucinate.js  bounding   ≥1 question · a set ≥2 · past the faculty's `options` / `choices` → refused, naming the model
      shard/hallucinate.js  choosing   → belt.hallucinate.choose(faculty, round, policy)
        belt/hallucinate.js choose     span open · note {faculty, model, questions:{key:type}} · via.render(round, {signal}) · note {verdict} · close
          openrouter translate.js  translateChoice  primer → state · type verbatim · ask → instructions · options|levels → criteria
          openrouter index.js      makeChoice       fetch POST https://openrouter.ai/api/alpha/decisions (the same key; not the OpenAI SDK)
          openrouter translate.js  readChoice       answers → the caller's option order · score "0","1" → array · noul → number
```

The laws, each measured in m70:

```
1  one primer, many questions — one call, the primer paid once (TypeSafe: 13 questions in one call, 12.2× cheaper, same answers).
2  three kinds, TAGGED: choice (options, a named record, a rubric on any, null for none) · score (levels, ordered) · noul (none).
   An absent tag is filled from the shape; a tag that contradicts its keys is refused. /"a union carries a tag"/
3  the verdict is the distribution and nothing else — a record · an array · a number. No pick, score, confidence on our side:
   /"the output of render is the end of our concern."/
4  caps are the FACULTY's, flat beside `context`: options (depth — one answer space) · choices (width — questions per render,
   null unbounded). Floor when a faculty declares none: 26 · 1. The core schema carries structural minima only.
5  v.record(keys, values) DROPS its options (schematics/v.js:150) — minProperties never reaches a record; the minima live in `bounding`.
6  no derivation. choice cannot come from dialogue (a sample holds no distribution). No faculty → "[hallucination] no 'choice'
   faculty resolves a 'render' avenue". Never faked through object.
7  render only — one pass, nothing to stream.
8  the AbortSignal is ctx.controller.abort.signal. ctx.signal inside a compiled avenue is the ROUTING Signal.
9  the strip carries options · choices, or the wired client cortex refuses its own round on the floor.
```

When to reach for it instead of `object`:

```
a yes/no gate before an action (grade, resolve, destructive tool)   → noul + a threshold on the probability
a label from a known set (error family, intent, queue)              → choice over the named set
a position on a scale (CEFR, difficulty, severity)                  → score over ordered levels
several judgments of one transcript                                 → one render, one question per judgment
anything with free text, parameters, or an open answer              → object — choice cannot write
```

Measured live (M5, `typesafe/jev-1.13` over `/api/alpha/decisions`, 2 runs): the three-question round above, 397 input tokens, `usage.cost` 1.7e-05. M1–M4 ran on first-token logprobs of `qwen/qwen3.6-35b-a3b` (`top_logprobs` capped at 20, letters A–Z) — superseded: /"i dont like this compromise and i want to use the actual jev tech."/

A mode that is not HARNESSED calls the cortex directly with its own controller — riddler, `~/.viva/registry/education/modes/games/riddler/aperture.js:35`: `questions: { resolved: { type: "choice", ask, options: { yes: null, no: null } } }` → `verdict.resolved.yes > 0.9`.

---

## 3. building a harness — the walkthrough

One harness, from an empty file to a landed mode. The running example is pt10 (a drone-assembly mentor; full code §8.1). Every step shows the code and what the model sees.

### step 0 — choose the avenue

```
the human chats with it in the dock, history matters      → dialogue (the dock calls dialogue.stream)
the app needs a structured answer it acts on              → object, from a door (object.render + output schema)
the app shows a streamed coach's turn beside its own view → dialogue.stream from a door with `yields` (chess coach)
one-shot judgement inside another flow                    → object.render with input.turns, no thread
the answer must satisfy a rule code can check             → object + a verifier on /object (step 6)
the answer is one of a closed set of strings               → choice.render — a probability per option, no text (§2.8)
```

A mode serves the dock when its manifest traits include `HARNESSED` (the dock gates on `mode.implements("HARNESSED")`, `Dock.svelte:49`) and the chat panel on `conversational` (`systems/anima/src/app/panels/d/d.svelte:215` `m.implements("application") || m.implements("conversational")`). Its tools arm when the mode exports `tools` (`TOOLING`). Trait names are STATES, never capabilities.

### step 1 — the skeleton and its defaults

```js
// examples/pt10/harness.js (head)
import { shard, Vector } from "@vivalence/typology";

export const harness = new Vector()
  .use(shard.hal.defaults({ policy: { tune: "balanced", rounds: 4 }, settings: { effort: "low" } }));
```

```js
// subsystems/typology/gestalten/shard/hal.js:104-111 — fills gaps only
export const defaults = (record) => async (ctx, next) => {
  for (const layer of ["policy", "settings", "system", "output"])
    for (const [key, value] of Object.entries(record[layer] ?? {}))
      (ctx.hallucination[layer] ??= {})[key] ??= value;
  await next();
};
```

`??=` means the thread (INTELLIGENT) and the caller may override; `=` means nobody does. Pick `rounds` = the budget you would write in prose (4 for pt10: read, move, answer, one spare). Registry values: hello-world `capable/10/low` · coach `capable/6/low` · seat `capable/1/low` · analysis `capable/1/low`.

### step 2 — the persona, by six questions

```js
// examples/pt10/harness.js
const ROLE = [
  `You are the assembly mentor for the ${guide.guide.title} (${guide.guide.source}).`,                       // (a) role · audience · surface, from data
  "The [Guide] below is an index — part ids and step titles only. Read a step with guide_read before you instruct from it; never quote a bolt size, a torque or a warning you have not read.", // (b)+(c)+(e)
  "Put a step on the operator's screen with guide_step when they ask to see it or name a part they are about to fit.", // (e) WHEN, armed name
  "Warnings are said before instructions. Two or three plain sentences.",                                      // (d)
].join("\n");
```

```
(a) who am I, for whom, on what surface?      "assembly mentor" · "the operator" · the guide open on screen
(b) what vocabulary?                          [Guide] index from guide.js — the same data guide_read pages from
(c) what must I never do, and what enforces it?  "never quote a bolt size … you have not read" ← pages only reachable through guide_read
                                              step range ← v.integer({ minimum: 0, maximum: LAST }) · "no buffer open" ← the tool throws with the fix
(d) what register?                            "Warnings are said before instructions. Two or three plain sentences." + FORMAT on /dialogue
(e) in what order?                            read with guide_read before instructing · guide_step when asked or a part is named
(f) does every name resolve to an armed tool? guide_read, guide_step — /guide/read → guide_read; pinned by the test's seen[0].tools
```

§4.1 has the best registry exemplar for each question.

### step 3 — world sections: an index in context, pages behind a tool, the screen last

```js
// examples/pt10/harness.js
const INDEX = [
  "[Parts] id · label",
  ...guide.parts.map((part) => `${part.id} · ${part.label}`),
  "[Steps] number · section · title · ⚠ = carries a warning",
  ...guide.steps.map((step, index) => `${index} · ${step.section} · ${step.title}${step.warn.length ? " · ⚠" : ""}`),
].join("\n");

harness.use(async (ctx, next) => {
  ctx.hallucination.system.role = ROLE;      // stable
  ctx.hallucination.system.guide = INDEX;    // stable — changes only with the guide
  await next();
});
```

```
[Parts] id · label
frame · Frame
arm · Arm ×4
motor · Motor 2207 ×4
prop · Propeller 5" ×4
[Steps] number · section · title · ⚠ = carries a warning
0 · Overview · Everything in the kit
1 · Frame · Bolt the arms
2 · Motors · Mount the motors · ⚠
3 · Check · Spin up · ⚠
```

- **Bracketed headers** name world-state blocks; prose and descs point back at them by name ("Step number from the [Guide] index").
- **Index, not dump.** The registry pt10 put every step's text, warnings and prep into the prompt every turn; the index costs one line per step and a page only when read (§9.5.4 is the outside version: Vercel's 8 KB index, tool search).
- **One section per stability class, each its own key**, stable first. Rows designed for two readers: `// Every row stands alone: an agent greps a slug, a human reads a list.` (vdex/index.js).
- **The screen line comes last**, in its own key, in the house sentence — `On the operator's screen: …` (pt10, calendar, email, vdex) — and tools return the same sentence after they act, so the model's picture and the human's screen stay one sentence apart.

```js
// examples/pt10/screen.js — ONE reader of "where is the operator", shared by harness and tools (law 2)
export const threadOf = (ctx) => ctx.thread?.id ?? ctx.thread ?? null;
export const current = (ctx) => {
  const thread = threadOf(ctx);
  if (!thread) return null;
  return ctx.daemon.entities.buffer.findOne({ thread, mode: ctx.mode?.id ?? null }, { orderBy: { index: "desc" } });
};
export const located = (row) => {
  const at = row?.data?.step;
  if (at == null) return "Nothing is on the operator's screen.";
  const held = guide.steps[at];
  return `On the operator's screen: step ${at} · ${held.section} · ${held.title}.`;
};
```

### step 4 — tools: nature, valence, desc, bounds, return, error

```js
// examples/pt10/tools.js
const LAST = guide.steps.length - 1;
const STEP = v.integer({ minimum: 0, maximum: LAST }).desc(`Step number from the [Guide] index, 0 to ${LAST}. Example: 2`);

export const tools = new Vector()
  .open(
    {
      nature: "/guide/read",                                            // → guide_read
      valence: "Read one step of the guide in full — warnings, numbered instructions, bolts and tools. " +
        "The [Guide] index only names steps; read before you instruct. Example: { step: 2 }",
      input: v.object({ step: STEP }),
    },
    (ctx) => ({ message: page(ctx.input.step) }),
  )
  .open(
    {
      nature: "/guide/step",                                            // → guide_step
      valence: "Put a step on the operator's screen — the 3D view moves to it. 0 is the overview. " +
        "Returns where the screen now is. Example: { step: 2 }",
      input: v.object({ step: STEP }),
    },
    async (ctx) => {
      const row = await current(ctx);
      if (!row) throw new Error("no pt10 buffer is open on this thread — ask the operator to open the guide first");
      row.data = { ...row.data, step: ctx.input.step };
      await ctx.daemon.entities.em.flush();                              // the flush IS the broadcast
      return { message: located(row), buffer: [row] };                   // lexicon form
    },
  );
```

```
nature      a path; the armed name is its segments joined by "_" (plus a domain/generator/peer prefix, §2.3)
valence     WHAT + WHEN + COST + what the human SEES + "Example: { … }"
desc        ties the argument to the section it comes from + "Example: …"; one desc can serve payload AND tool (assembly schematics.js:148)
bounds      every numeric/enum limit in the schema, not the prose — the schema is the code twin
return      { message, <entity>: [rows] } at the top level; the message reuses the screen sentence
error       names the next move: "… — agenda first", "… — ask the operator to open the guide first"  (delivered: the message is what the model reads)
thread      threadOf(ctx), never ctx.input.thread (calendar/email read the undeclared key, G13)
```

### step 5 — avenue branches

```js
// examples/pt10/harness.js
const FORMAT = "Markdown renders in the dock: **bold** a warning, never a heading.";

harness.branch("/dialogue").use(async (ctx, next) => {
  ctx.hallucination.system.format = FORMAT;                          // the dock is the only reader of prose
  ctx.hallucination.system.screen = located(await current(ctx));     // volatile, last
  await next();
});
```

hello-world's reason, verbatim: `// the dock is the only reader of prose — an object or verbatim call has no markdown to render.` Post-stream work also lives on `/dialogue`, wrapping `ctx.output` after `await next()` (francesca, §4.4 #8).

### step 6 — verification in code, not in the prompt

When a rule is checkable, check it in the harness and repair with the fault as the prompt — the caller never retries.

```js
// examples/seat/harness.js (core)
harness.branch("/object").use(async (ctx, next) => {
  await next();
  const legal = ctx.input.legal;                   // law 5: caller-supplied verification data
  if (!legal) return;
  const tried = [];
  while (!legal.includes(uciOf(ctx.output))) {
    tried.push(uciOf(ctx.output) || "(empty)");
    if (tried.length > ATTEMPTS) throw new Error(`[seat] no legal move after ${tried.length} answers: ${tried.join(", ")}`);
    ctx.output = await ctx.daemon.cortex.hallucinate.object.render({
      ...ctx.hallucination,
      controller: ctx.hallucination.controller.branch(`repair-${tried.length}`),   // law 6
      turns: amended(ctx.hallucination.turns, tried, legal),
    });
  }
});
```

The fault is appended to the last USER turn, not sent as a new turn: on Anthropic the object avenue rides a `respond` tool (`translate.js` `RESPOND`, `tool_choice: any`); replaying the rejected answer would leave a `tool_use` without a `tool_result` (inferred from `translate.js`; not exercised on the Anthropic path).

### step 7 — tests, four kinds

```js
// 1. PROBE — assert the sections (droneaid/modes/assembly/pt10/tests/harness.test.js:7-31)
const bound = (vector, thread) => new Vector()
  .use(shard.context.bind("daemon", daemon)).use(shard.context.bind("mode", { entity: { id: "m1" } }))
  .use(shard.context.bind("thread", thread)).use(shard.context.bind("hallucination", { system: {} }))
  .slurp(vector);
// then open a /probe leaf that returns ctx.hallucination.system.<key>

// 2. SCRIPTED RIG — the real loop, a scripted faculty (examples/rig.js, §8.0)
const { cortex, seen } = scripted((request) => answered(request.turns).length ? say("…") : call("t1", "guide_read", { step: 2 }));

// 3. S0 — prose names are armed names (commons/instances/hello-world/tests/harness.snapshot.test.js:55-59)
specimen.it("S0: hello names the tools by their ARMED names", () => {
  specimen.expect(HELLO).toContain("viva_doctor"); specimen.expect(HELLO).toContain("web_search");
  specimen.expect(HELLO).not.toContain("search_web"); specimen.expect(HELLO).not.toContain("search_read");
});

// 4. CAPTURE SNAPSHOT — the assembled system + armory (vcompany/modes/office/vdex/tests/vdex.snapshot.test.js:79-100)
//    tests/snapshots/ is gitignored; SNAPSHOT_HOT=1 regenerates. The cheapest eval: it catches wording drift before a live call.
```

Runtime-level references: `systems/runtime/tests/harness.thread.test.js` (section order + cache marks), `cortex.integration.test.js` (persistence), `stub.activity.test.js` + `activity.integration.test.js` (controller), `sse.integration.test.js` (run FIRST on any streaming bug — green = provider, red = viva's SSE chain), anima `tests/harness-wire.test.js`.

### step 8 — calling it

```js
// dock (pattern A) — nothing to write; the dock sends { thread, id, parts }
// door, streaming (pattern B) — `yields` makes it SSE, exempt from the 8 s timeout
.open({ nature: "/turn", input: v.object({ buffer: BUFFER, thread: v.string().optional() }), yields: Packet.Response },
  async (ctx) => ctx.mode.harness.dialogue.stream({
    thread: ctx.input.thread ?? buffer.thread?.id ?? ctx.thread?.id,
    parts: [{ type: "text", text }],
    controller: ctx.controller?.branch?.("dialogue"),
  }))
// door, object (pattern B) — read render.output.object
const { output } = await ctx.mode.harness.object.render({ turns: [brief], output: ANSWER, legal: moves });
// internal utility inside /dialogue middleware — object, never dialogue (dialogue re-enters and persists junk turns)
await ctx.mode.harness.object.render({ turns, config });
// door, choice (§2.8) — a verdict over strings, no turns, no thread, no persistence
const verdict = await ctx.mode.harness.choice.render({ state, question, options: ["yes", "no"] });
if (belt.choice.probability(verdict, "yes") > 0.9) award();
```

§7 has all four client patterns with their code.

### step 9 — land it (registry code needs `go`)

```
~/.viva/registry/droneaid/modes/assembly/pt10/{pt10.viva.js, harness.js, tools.js, screen.js, guide.js, tests/}
deno test -A modes/assembly/pt10/tests/                          one-shot, never the --watch task
viva registry/tap ~/.viva/registry/droneaid                       runtime/watch deploys every registry save
viva instance/create @droneaid/instance/<slug> --use --init       or shelf-sync an existing instance
viva instance/doctor --json
GET /daemon/<slug>/mode/assembly/pt10/metadata/harness            the strip IS the contract
```

---

## 4. the voice — how wording is fitted to a domain

### 4.1 the six questions, with the best registry exemplar for each

**(a) Who am I, for whom, on what surface?** Name role AND audience AND the surface the audience sees; interpolate identity from data, never hand-write it.
```js
// droneaid/modes/assembly/pt10/harness.js:6-8
`You are the DroneAid assembly mentor for the ${guide.guide.title} (${guide.guide.source}).`,
"The operator has the build guide open as a 3D exploded view; every step below is a row on their screen.",
// assembly/modes/player/guide/harness.js:5 — the audience noun follows the domain: "builder", matching INSTRUCTED's desc
"You are the mentor beside a builder walking an assembly guide. … The [Screen] is where the builder is.",
// chess/modes/board/play/harness.js:9 — TWO audiences in one answer: the move to the rules engine, the comment to a human
"The comment is for the operator watching the board: one sentence, plain, no headings.",
// vcompany/modes/office/vdex/harness.js:4 · officer/harness.js:5 · aprende hal/tutor.js
`You are the archivist of ${company.name} (${company.seat}, ${company.stage}).` · `${language?.learning?.name}`
```

**(b) What vocabulary?** The domain's nouns, glossed once, from ONE source the payload also uses.
```js
// assembly/modes/editor/assembly/harness.js — [Ontology] GENERATED from the schematics: prompt words = payload words
`[Ontology]\n${ontology(ctx.daemon.domain.schematics)}`
//   → "part — placements may name it as their layer\n  PLACED — …\n    ref: string — The slug of the part it places."
// assembly/domain/assembly/schematics.js:148
// the verbs' parameters — what an aperture nature takes and what a tool takes are one description.
"Answer with exactly one legal move as UCI from the list you are given — from-square, to-square, promotion piece if any (e2e4, e7e8q)."  // chess: format glossed inline
"The JDex is Johnny.Decimal: areas NN-NN hold categories NN, categories hold ids NN.NN, and documents live at ids."                    // vdex: a rule of the world
"You deal cards (render buffers) onto the table (the moat) for the player."                                                             // dealer: metaphor glossed with the platform term
```

**(c) What must I never do — and what makes that true?**
```
"never invent one [slug]"               literal.named(slug) throws; /select checks $in → [assembly] no literal named "…"   assembly tools/index.js:57
"Never play a move for the student."    practice_move → { condition: "ERROR", message: `it is the student's move (${data.student}) — never play for them` }   chess practice tools/index.js:98
"you never send"                        /reply hard-codes held: true; no send tool exists                                email tools/index.js:59 · aperture:81
"never invent an area, category or id"  /file → file_category / file_taken ERROR                                        vdex snapshot test:137-139
"exactly two answers"                   v.array(…, { minItems: 2, maxItems: 2 })                                          primer types.js
"Never invent a move not in the list."  caller retries ×2 then a random legal move (seats.js:32-38) — or the harness verifier (§8.2)
"exactly as written in the deck"        .filter((face) => DECK.includes(face))                                            dealer.viva.js:84
✗ "Run dry:true first"                  NOT backed — dry … .default(false) makes wet the default                         harvest tools/index.js
✗ "at most THREE tool calls"            NOT backed — defaults({ policy: { rounds: 10 } })                                 hello-world
✗ "10-100 characters"                   a desc, not maxLength                                                            aprende tutor.js
```

**(d) What register?** Sentence counts, what the renderer draws, which language.
```js
"Two or three plain sentences unless the answer genuinely needs more."                         // hello-world
"Short answers. One or two plain sentences, then the step's own line when it says it better."  // player/guide — licenses quoting the source
body.desc("The reply, as the office writes: formal in German, plain in English.")              // email — bilingual rule in a field desc
// hello-world FORMAT, /dialogue only — the one harness that says what the renderer draws
"The dock renders markdown: # heading through ######, **bold**, *italic* or _italic_, `code`, [text](https://url), > quote, - bullet or 1. numbered, --- rule, ```lang fenced blocks, and | pipe | tables | above a |---|---| row.",
"Nothing else renders — no images, no HTML, no strikethrough, no footnotes, no task boxes — so reach for a list or a table only when the answer is genuinely shaped like one.",
```
Object renders put the register in the SCHEMA DESC (twice with the persona is fine): primer `form` + `prose` desc; seat SEAT + `ANSWER.comment`; francesca's reviewer: *"the output field descriptions carry the rules."*

**(e) In what order?** A numbered procedure naming tools by armed name, with per-phase budgets, is the strongest pattern.
```js
// chess/modes/coach/practice/harness.js:3-11
"Each turn you are told the student's last move. Do this, in order: call practice_board to see the position and the legal moves;",
"call practice_assess to see what the engine thinks; if it is your move, choose a move for YOUR side that fits the strength you were given",
"(gentle: sound but not sharp, leave the student chances; club: a good move; strong: the engine's first line) and play it with practice_move,",
// commons/instances/hello-world/harness.js:5-19 — LOOK / DECIDE / ACT / CHANGE
"1. LOOK. … pull the whole record with viva_doctor, ONCE. For a fact about the world, web_search ONCE, then web_read the one article … at most two calls.",
"2. DECIDE. No tool. Is this an answer, a page, or research? …",
"3. ACT, one call. …",
"4. CHANGE, only when asked. … ONE generator_view_revise on the same page, never a second draw; …",
// education/modes/tactics/harvest/hal/archivist.md — a ladder whose rungs ARE the tool names
"1. **survey** … 3. **dry vocalize** — resolve only. … 4. **wet** — only on the operator's explicit word. … 5. **drain** — …"
```
Francesca teaches by DEMONSTRATION: two full worked transcripts with the tool calls bracketed inline — `*[dojo_provision — set: [{pick: "literals", literals: ["del.contraction", …]}], recall both, streak 2]*`. For a method "built by trial and error over many sessions", a demo beats a rule.

**(f) Does every name in the prose resolve?** Only hello-world guards it (the S0 test, §3 step 7). Found without it: francesca `/drill` "Pull first" (no `pull`; meant `language-learning_queue`), francesca.md `STATE.md` (no file, no tool; the only write path is `fs_write`), reader "edit it, generator_view_render again" (ignores `generator_view_revise`), aprende "you can create experiences and load data" (two tools, neither loads), player/guide "the step tool" (holds both `step` and `assembly_step`).

### 4.2 the valence says WHEN, not just WHAT

```js
// research — trigger + cost + how to read a partial result        commons/instances/hello-world/tools/research.js:25-33
"… Use this when the operator wants to KEEP something. For a single fact, call web_search yourself. It costs a minute and several model calls — one call per subject, not one per question. If it comes back with condition ERROR and a buffer, the page IS on screen and the researcher stopped before summarising: answer from the page, and treat `message` as partial."
// web_read — the cost is FOREVER                                   web.js:50-60
"… A read is expensive and stays in this conversation for every later turn, so open a page you mean to use rather than one you are curious about, and never re-open a page already in this thread — its text is still here."
// vdex /index — the only valence that reasons about the prompt snapshot's staleness
"… Read it after your own writes; the rows in your instructions are from the start of the turn."
// assembly /resolve — read-before-write, with the reason           fold.js:11
"… Read before placing or writing a step — work with real paths and slugs, never remembered ones. Example: { slug: \"drone\", upto: 4 }"
// email /open — the human's side
"Put a thread on the operator's screen — the mail app opens it. Use it when you want them to look."
// chess /elo — how to INTERPRET the number
"… A number for the move, never a rating of the student. Needs the engine. Example: { buffer: \"01JQ…\" }."
// web_read fallback — an unavailable tool that says what to do instead
"web_read is not available on this daemon — no reader service is consumed. Do not retry it. Answer from the web_search snippets you already have, and say plainly that you could not open the page."
```

House style where it is consistent (assembly, chess, pt10, hello-world): every valence ends with `Example: { … }`; every `.desc()` carries `Example:` and ties back to its section (`"Step index from [Steps], 0 to 3. Example: 4"`, `"The practice buffer's id, from the thread's buffer list."`). Absent in calendar/email/vdex (inline samples `22, 22.04` instead), harvest, aprende, education domain tools, francesca `/drill` — the split follows authorship. Outside, tool-use examples moved accuracy 72% → 90% (S7).

### 4.3 ten techniques that recur

```
1  bracketed headers name world blocks; prose points at them    [Parts] [Steps] [Ontology] [Screen] [CAL from → to] [MAIL addr] [VDex — mount] [Thread …]
2  the screen line last, the same sentence everywhere           "On the operator's screen: …" — and the tool returns it
3  Example: in every valence and desc                           assembly · chess · pt10 · hello-world
4  one description, two consumers                               assembly schematics.js:148 — inspector and model read the same desc
5  rules written twice for object renders                       persona + schema desc (primer, analysis, seat, francesca reviewer)
6  dual audience in one line                                    "an agent greps a slug, a human reads a list" · "for the operator to key" · "the agent that called you will answer the operator from it"
7  "never invent X" as the universal guard                      code-backed whenever an identifier crosses into a repository call; prompt-only for quantities and evaluations
8  errors that name the next move                               "— agenda first" · "— inbox first" · "is a step — open it in the guide editor"   (vdex tools/index.js:11)
9  length fixed by sentence counts                              two-three (pt10, coach, hello, oracle, dealer) · one-two (assembly) · three max (analysis) · one (seat comment) · two-four (primer)
10 ordered procedures in the persona                            coach "Do this, in order" · LOOK/DECIDE/ACT/CHANGE · SEARCH/READ/DESIGN/DRAW · the five-rung ladder
```

A valence describing a UI effect ("the stage lights them", "the 3D view moves to it") tells the model what the human will see.

### 4.4 the nineteen harnesses — identity sheet

15 in `~/.viva/registry`, 4 in `commons/`. No domain barrel exports `harness`. No INTELLIGENT trait anywhere in the registry. Almost every harness is one shape: `new Vector().use(async (ctx, next) => { ctx.hallucination.system.<key> = …; await next(); })`.

**1 · droneaid pt10** — `droneaid/modes/assembly/pt10/harness.js` · mentor → operator with a 3D exploded view · `[Parts]` `[Steps]` + screen, all in one key · "never invent a bolt size, a part or a step" prompt-only (cheap: whole guide in context) · step range schema-backed · "warnings before instructions" but `steps()` renders text BEFORE `WARN` · valence says WHAT + `Example: { step: 4 }`, the trigger lives in ROLE · no defaults · returns `{condition, output}` where siblings return `{message, …rows}`. Rebuilt in §8.1.

**2 · assembly editor/assembly** — "the editor's hand" over "parts (what a thing IS) and placements (one occurrence of a part under a part's layer)" · `"Metres, Y-up, quaternion xyzw. A placement's translation is in its layer's frame."` · `[Ontology]` generated from schematics, `[Vocabulary]` grouped symbol families, `[Screen]` with placement lines `  ${path} ← ${ref} (${slug}) @ [x, y, z]` · errors teach mode boundaries (`"… is a step — open it in the guide editor"`) · domain valences are procedural about WHEN ("Then sequence it with assembly_sequence", "Rename a placement with assembly_move and a new name instead") · `symbol.find({})` unbounded, bare `catch {}`, no defaults.

**3 · assembly editor/guide** — "the author's hand"; division of labour spelled out ("Composition … is the assembly editor's; here you write guides and steps") · ontology filtered to `guide`+`step` · `/open` takes `{guide, step}` while editor/assembly's takes `{slug}` — one word, two shapes, same daemon.

**4 · assembly player/guide** — "the mentor beside a builder"; the only harness that licenses quoting the source line · HAZARD: a read-only persona on a write-capable armory — own `step` AND `assembly_step`, `assembly_part`, `fs_delete`, `shell_run`; "the step tool" never disambiguated.

**5 · chess board/play (the seat)** — object render, no tools · SEAT + per-call brief as the USER turn (FEN, SAN, `Legal moves (UCI · SAN)`, engine lines, `You already answered … — not legal here`) · two audiences · legality enforced by the CALLER (`seats.js:32-38`). Rebuilt in §8.2.

**6 · chess coach/practice** — opponent AND teacher · the strongest ordered procedure in the registry · strength bands glossed in prose (gentle/club/strong) · world state arrives via `practice_board`'s `describe()` and the door-composed user turn (`The student played ${last}. Board ${buffer.id}: it is your move. Take your turn.`) · `chess_legal/assess/elo` duplicate `practice_board/assess/elo`, both saying "Call this first".

**7 · chess study/analysis** — EXPLAIN inline in `analysis.viva.js:17-28` · "to the player who made it", "in plain words a club player follows" · brief carries win-chance %, judgement, perspective-flipped eval · register set twice (persona + `ANSWER.explanation` desc).

**8 · education francesca** — `francesca.md` (261 lines) injected whole, YAML frontmatter included · drill-master for "the learner", explicitly not a lecturer (`You run drills. You do not lecture`) · SRS signals MASTERY…FAILURE, pedagogy terms ("cold ambush", "tight rotation", "two clean hits, spaced, in both directions") · fixed correction block (`✗ leggate / ✓ leggete / -ere family voi is -ete`) · `Every turn ends with a prompt … never with an offer. No "Want to…?"` · AGENTIC: `dojo_*` resolve, but also `harvest_vocalize`, `harvest_drain` armed and never mentioned · the only post-stream work: a hidden reviewer persona whose rules live in schema descs, then `/review/literal` per review and a synthetic `language-learning_review` pair spliced into the sealed turn (`harness.js:53-130`, `setTimeout(1000)` standing in for "persisted").

**9 · education aprende** — "the helpdesk bot on a homepage" whose mission is "to cease existing as soon as possible" · the only lowercase casual register · valences "Pick count." only · better-crafted `drill`/`query` valences are the commented-out ones · real call is `object.render` from `aperture/message.js:21-30`, which reads `render.object` (G12).

**10 · education harvest** — "a careful archivist"; "The operator drives" · five-rung ladder · laws: name the language every sweep (schema-required ✓), auto never synthesizes (source map ✓), license on every landed file (code ✓), misses honest (`report.missed.push` ✓), dry first (✗ `dry.default(false)`) · no `Example:` anywhere · `tune ??= "capable"` hand-written, no rounds for long sweeps.

**11 · young-ladys-primer** — the only child audience and fictional frame (Diamond Age): `You never break character, never speak of lessons or skills or reading` · concept via `LABELED`, target = first unmastered `reading.%` concept with `REQUIRES` satisfied · history kept in `buffer.data.history` because `/object` persists nothing · answer position NOT shuffled (aperture.js:70) — habitual ordering leaks the answer.

**12 · vcompany calendar** — "You keep ${company.name}'s calendar … you never take anything off" (backed by the ABSENCE of a delete tool) · `"A row minted from mail names its message — say where a date came from before you act on it."` · column legend stated three times (DOCTRINE, `[CAL]` header, `/agenda`) · reads `ctx.input.thread` (G13) · no `Example:`.

**13 · vcompany email** — "you write replies for the operator to key — you never send" (code-backed: `held: true`) · `[MAIL]` 40-thread inbox dump + a provider `account()` round-trip every turn · the only bilingual register rule.

**14 · vcompany vdex** — "the archivist of ${company.name}" · Johnny.Decimal taught as the world's rule · `"Only the coordinates in the rows below exist"` code-backed · the full JDex dumped every turn · `console.log("ctx.hallucination.system:", …)` in the hot path (`harness.js:33`) · cache marks `["vdex","tools"]` with the screen line as `vdex`'s tail. The assembled prompt, from its snapshot:
```
You are the archivist of Test GmbH (Hamburg, test). The JDex on the mount is yours: you find, read, file, edit and tidy the company's documents for the operator, and you say where a thing is filed before you touch it.

The JDex is Johnny.Decimal: areas NN-NN hold categories NN, categories hold ids NN.NN, and documents live at ids.
…
[VDex — <mount>] · rows: a coordinate names a folder · a document is slug · title (the slug carries id and format)
10-19 viva
12 goals
12.04.ubiquity-and-a-thin-slice.md · Ubiquity and a Thin Slice
22.04.re24-05277.pdf · RE24-05277
…
On the operator's screen: readme.org · The company (org).

[Thread 01a0c884-…] · unlabeled · phase manual · buffers minted 1 · traits MASKED · user 01a0c884-…
[Mode office/vdex] VDex · traits DATASET BOOTED MOUNTED APPLICATION EMITTER STANDALONE EXPOSED HARNESSED TOOLING · source … · mountpoint <mount>
[Buffers on this thread] · 1 · rows: index · id · label · mode · status · data · view — these ids are what buffer_update and buffer_label take, never a document slug; …
0 · 01a0c884-… · vdex #0 · office/vdex · PENDING · {"open":"readme.org"}
```

**15 · vcompany officers** — a factory: `(manifest) => … "You are the ${manifest.name} of ${company.name} (${seat}, ${stage}) — ${manifest.description}."` · sound template, placeholder descriptions.

**16 · commons hello-world** — the most complete: `defaults`, named sections (`hello`, `machine`, `render`, `format` on `/dialogue`), LOOK/DECIDE/ACT/CHANGE, valences that teach COST, HOUSE RULES for generated Svelte (`· scoped <style> only. NEVER write utility classes`), the S0 test · "at most THREE" vs `rounds: 10` · `research` is a nested dialogue sub-agent with its own brief ("The whole assignment is FIVE to EIGHT tool calls. Count them.") — G5, G7.

**17 · chaosmonkey oracle** — a self-aware test persona; `/lookup` valence explains WHY the tool exists ("the wait is the point: a tool round is where a hold or a kill lands") · dead commented compaction (§6.6).

**18 · chaosmonkey reader** — "a UI craftsman"; the only one saying "user" · renders again instead of `generator_view_revise`, contradicting the runtime valence and hello-world.

**19 · playground dealer** — metaphor glossed with the platform term; emitter composes a `role: "system"` turn, `tune: "frugal"`, schema `{ faces }`, code filter.

Anomalies: `vcompany/modes/office/chat/chat.viva.js` claims HARNESSED with no harness export; dojo and nyan are TOOLING without HARNESSED; dead copies in `education/domain/tools/harness.bak/`, `education/bak/tmp/…`, `assembly/modes/bak/import/harness.js`.

### 4.5 anti-patterns → fix

```
prose names a tool that does not exist        → S0 test; name tools by ARMED name
read-only persona on a write-capable armory   → one line on what the generic tools are NOT for, or narrow arming (G10)
prose budget vs rounds                        → set rounds to the budget; the loop enforces only rounds
a rule and a default that pull apart          → flip the default to the safe side (harvest dry)
valence says WHAT, never WHEN                 → add trigger + cost + what the human sees
legend stated three times                     → one legend, in the header the rows sit under
frontmatter injected into the prompt          → strip it before system.<key> = …
"the target concept below" pointing at the user turn → say where it is
hidden answer position                        → shuffle in the aperture
debug print in the hot path                   → delete
personas silent about fs_* / shell_run        → "fs_* and shell_run are the machine's, not this office's"
whole world dumped every turn                 → index in context, pages behind a tool
one section holds stable + volatile           → split; volatile in its own key, last
```

---

## 5. entities in the harness

### 5.1 the law: harnesses READ, tools WRITE, doors carry the caller

```js
// READ in the harness — "the screen" = the newest buffer of THIS mode on THIS thread
// assembly/modes/editor/assembly/harness.js:66-70
export const open = (ctx) => {
  const thread = ctx.thread?.id ?? ctx.thread ?? null;
  if (!thread) return null;
  return ctx.daemon.entities.buffer.findOne({ thread, mode: ctx.mode.id }, { orderBy: { index: "desc" }, filters: false });
};
// WRITE in a tool, DIRECT — mutate + flush                       systems/runtime/daemon/skills/buffer.js
const row = await ctx.daemon.entities.buffer.findOneOrFail({ id: ctx.input.id });
row.data = { ...row.data, ...ctx.input.data };
await ctx.daemon.entities.em.flush();
return { message: `updated ${named(row)}`, buffer: [row] };
// WRITE through a DOOR — the caller rides along; the repository verb owns the flush
// assembly/domain/assembly/tools/mint.js:8-11 → aperture/index.js:22  (ctx) => literal(ctx).part(ctx.input, ctx.mode)
export const through = (nature) => async (ctx) => {
  const row = await ctx.daemon.call[nature]({ user: ctx.user, mode: ctx.mode, thread: ctx.thread, input: ctx.input });
  return { message: line(row), entities: { literal: [row] }, object: { slug: row.slug, ontology: row.ontology } };
};
```

- No mode harness writes before the model runs. The one harness write is francesca's post-stream Turn + Retention.
- **`em.flush()` is the broadcast.** `datamap.subscribe(shape.subscriber(twitch))` (`population.js:72`) turns every flush into `/after/<entity>/<op>` → `/subscribe` listeners. An assigned-but-unflushed row (a thrown tool, a harvest dry run) never reaches a client. Every flush echoes to every `{thread}` subscriber including the writer; a quiet write is `em.getConnection().execute` + `em.refresh(row)`.
- Buffer and Turn are user-scoped: a write outside a request context throws `[reactive] … is user-scoped but the ORM context carries no owner — the write escaped its request context…` → wrap post-stream work in `ctx.daemon.datamap.shard.carry()` (francesca `harness.js:14`).
- `daemon.call = shape.proxy(domain.aperture, steer.strategy.direct)`, two spellings: flat `ctx.daemon.call["/review/literal"]({ user, mode, thread, input })` (education, assembly) vs nested `ctx.daemon.call[door][path]({ ...ctx, input, output: undefined })` (chess). The thread goes three ways: `ctx.thread` (id), `{ id: ctx.thread }`, `{ id: ctx.input.thread }`.
- `/entities/<type>/update` REPLACES json props — never send a partial `trait`.

### 5.2 what is loaded, and the base verbs

```ts
// systems/runtime/daemon/entities/index.ts
export const sets = { network: { identity, daemon }, daemon: { user, mode }, kernel: { literal, symbol },
                      userspace: { intent, thread, turn, buffer }, transient: { activity } };
// population.js:48 — collate([daemon, kernel, userspace, transient, domain.entities]); network never reaches ctx.daemon.entities
// a domain entity REPLACES the runtime one of the same type (literal, symbol, buffer)
```

```
DataRepository (entities/base/DataEntity.ts)
  unique(x) :12 · get card() :23 · get extensions() :35 · reference(ref) :39 · ensure(query) :45
  updateOne(where, data) :54 · update :61 · removeOne :68 · remove :75 · find/findOne :82/:86 (traits rewritten) · findByIdentifiers :115
VirtualRepository (base/VirtualEntity.ts:19) — Activity; nanostores atom, no table
```

```
entity      key fields                                                            repository verbs beyond the base
Literal     slug traits trait symbol(derived) ontology(derived) symbols mode uses  find→resolveSearch→resolveSymbols · extensions +search +symbols
Symbol      slug traits(ONTOLOGICAL STRUCTURAL LABELED TOPOGRAPHICAL) literals mode —
Thread      user mode phase traits trait parent children buffers turns counter cursor  entity bindBuffer (the ONLY counter++) · beforeCreate copies intent traits
Turn        role parts meta parent children thread mode                           history (createdAt ASC) :8 · chain :12 · fold :25
Buffer      status data view index traits(LABELED) trait mode thread literals symbols  create({thread,…}) binds the thread :25
Activity    user mode thread buffer turn type status error steps(ring 12)         control(data, controller) :15 · removeOne aborts :33
Mode        type slug traits name description version installed                  unique {type, slug}
User        roles config threads                                                  —
Intent      user mode slug traits trait                                           unique {slug, mode, user}
```

Domain Literals (registry):
```
education  card [slug known learning ontology status]+retentions · search · feed novel due byStrength byLastSignal family sample · entity review(signal, ctx) :207
           + Retention (driver status strength nextAt …, evolve) · Trace (written by review, never read) · Buffer that DROPS create()'s thread binding (G, §5.6)
chess      card slug ontology + fen | plies·result | eco·name | rating·level · mint reach evaluated record rung ladder seal classify analysed puzzle pose
assembly   card slug ontology name + qty/file/placements by kind · named symbolsNamed mint part step guide placement sequence move rename duplicate
           retract closure resolve bom tree references slugOf
voffice    card slug ontology traits + title · search
```

### 5.3 each entity, where a harness or tool touches it

**Buffer — the screen.** Read in every thread summary; `open()`/`current()` in assembly ×3, pt10, calendar, email, vdex. Written directly (assembly ×3, pt10, `buffer_update`, generator `/render` `/revise`), by `updateOne` (chess practice), via emit (aprende ×5, dojo ×4, francesca drill, vdex/calendar/email `/open`).
```js
// chess/modes/coach/practice/tools/index.js:7-10, 169
export const load = async (ctx, id) => { const buffer = await ctx.daemon.entities.buffer.findOneOrFail({ id }); return { buffer, data: { ...buffer.data } }; };
buffer.literals.add(row);                                       // m:n Buffer↔Literal on seal
// systems/runtime/daemon/traits/generative.js:81-90 — Buffer.create binds the thread
const buffer = await ctx.daemon.entities.buffer.create({ mode: ctx.mode.entity.id, view: view.json, data: ctx.input.data ?? {},
  traits: ["LABELED"], trait: { LABELED: ctx.input.label }, thread: ctx.thread ?? null });
await ctx.daemon.entities.em.flush();
return { message: `drew ${named(buffer)}`, buffer: [buffer] };
// systems/runtime/daemon/traits/emitter.js:28-30, 57-61 — how most mode tools create buffers
if (ctx.input.thread) ctx.thread = await daemon.entities.thread.findOne(ctx.input.thread);
if (ctx.thread && result.condition === "NOMINAL") for (const buffer of result.output.buffer) ctx.thread.bindBuffer(buffer);
await daemon.entities.em.flush();
```
Emitter traps: `mode.emit.X` mints a fresh `ctx.pool` — a delegating emitter does `ctx.pool.add(await peer.emit.x({ ...payload, thread: ctx.input.thread }))` (forward the thread or the buffer persists `thread: null`; `aprende/emitter/nyan.js:23`). A peer is reached at runtime (`ctx.daemon.modes.game["dojo"].emit.flashcard.feed(…)`), never imported.

**Literal — the domain's rows.** Harness reads: assembly `named/resolve/tree`, vcompany `findOne({ ontology, slug })`. Tool reads by repository verb, never a hand walk:
```js
// education/domain/tools/queue.js:28-38
const picks = { due: () => literal.due(where, { limit }), feed: () => literal.feed(where, { limit }), novel: () => literal.novel(where, { limit }),
                weakest: () => literal.byStrength(where, { limit }), status: () => literal.sample(where, { status: ctx.input.status, limit }) };
// education/modes/tactics/survival/emitter/exercise.js:27
ctx.daemon.entities.literal.byLastSignal(["MISTAKE", "FAILURE"], where, { limit: 3 })
// chess/domain/aperture/index.js:14-51 — reach (the only writer of positions) → evaluated (cache) → record · rung → ladder
const position = await literal.reach(fen); const held = literal.evaluated(position, { depth }); await literal.record(position, evaluation);
// education/modes/tactics/harvest/tools/index.js:117-135 — direct assign; the flush is the only thing dry skips
literal.assign({ traits: [...new Set([...(literal.traits ?? []), "VOCALIZED"])], trait: { ...literal.trait, VOCALIZED: { asset: { path }, attribution: { author, license, source } } } });
if (!ctx.input.dry) await ctx.daemon.entities.em.flush();
```
Traps: `Literal.symbol` is DERIVED by `LiteralSubscriber` and pivot inserts never dirty the row — attach symbols before the create-flush and never trust `symbol.*` on a row created in the current unit of work.

**Symbol — vocabulary.** Read only: assembly `symbol.find({})` unbounded per turn and per `/open`/`/step` (via `read()`); education progress `find({}, { fields: ["slug"] })`; aprende query. Indirect through Literal's `symbols` filter.

**Turn — history.** Runtime `history` + `chain` on `/dialogue`, `recording`/`appending` for the response. Francesca is the only mode reading turns (`find({ thread }, { orderBy: { createdAt: "DESC" }, limit: 10 })`) and the only one writing (splices a synthetic pair into a sealed row, then flush). `turn.fold` has zero callers. A model reads turns only via `entity_find { entity: "turn" }`.

**Thread — the dial.** Runtime `claiming` (INTELLIGENT/VOCAL) and `summary`; `thread_update` writes `trait` but never `traits` (G8); emitter `bindBuffer`. No registry harness or tool reads the Thread repository directly.

**Retention / Trace (education)** — through the door only:
```js
// education/domain/tools/review.js:42-47 → aperture/index.js:50-62 → Literal.ts:207-248 (retention → evolve → Trace → flush)
const retention = await ctx.daemon.call["/review/literal"]({ user: ctx.user, mode: ctx.mode, thread: ctx.thread ? { id: ctx.thread } : null,
  input: { literal: literal.slug, signal: item.signal } });
```

**Activity** — `activating` + `chaining` stamps `turn`; dojo `/generate` calls `activity.control(...)` itself; the riddler door mints one to drive the cortex directly (§7). `entity_find { entity: "activity" }` works.

**Mode / User / Intent / Identity / Daemon** — `ctx.mode.entity.id` (pt10, calendar, email, vdex, generative) vs `ctx.mode.id` (assembly, activity, vdex's literal filter — both spellings in `vdex/harness.js:20` vs `:24`); `ctx.user` required by `review.js:25`; no repository use anywhere; Intent only via `entity_*`; Identity and Daemon never loaded.

### 5.4 the generic trio and the three projections

```js
// systems/runtime/daemon/skills/entity.js:101-161 — entity_find goes through repository.find, so traits · search · symbols filters work for free
const rows = await repository.find(where, { limit, offset, ...(order && { orderBy: order }),
  ...(fields === "card" && card.populate.length && { populate: card.populate }) });
const total = await repository.count(where);
const projected = fields === "card" ? rows.map(card.project) : rows.map((row) => row.toJSON?.() ?? row);
while (projected.length > 1 && JSON.stringify(projected).length > BUDGET) projected.pop();
return { output: { [ctx.input.entity]: projected, total,
  ...(projected.length < rows.length && { message: `trimmed to ${projected.length} of ${rows.length} loaded rows to stay under the result budget — narrow with where or page with offset` }),
  ...(served < total && { next: { offset: served } }) } };
```
`entity_schema` with no arg lists `{ type, rows, card }` per repository (Activity included); with an entity: columns, relations, operators, `extensions`, card.

```
repository.card      → entity_find / entity_schema only        default [id slug traits]; domains override
descriptor.spoken    → speak(), tool result → model text      only Buffer
domain line()        → the domain's own tool messages         education `slug · learning (known) · ontology · STATUS`, voffice, assembly
```
None knows the others. Rows nested under `entities: {…}` (assembly mint, education queue/lookup/review, francesca) skip `spoken` AND anima's `toolBuffers` (`turns.js:190` looks for `tool.entities?.buffer`) (G11).

### 5.5 the thread summary the runtime appends

```js
// systems/runtime/daemon/skills/thread.js:28-39
export const summary = async ({ daemon, mode, thread }) => {
  const modes = new Map(daemon.flatmodes().map((peer) => [peer.id, address(peer)]));
  const buffers = await daemon.entities.buffer.find({ thread: thread.id }, { orderBy: { index: "asc" } });
  return [
    threadline(thread), modeline(mode),
    `[Buffers on this thread] · ${buffers.length} · rows: index · id · label · mode · status · data · view — ` +
      `these ids are what buffer_update and buffer_label take, never a document slug; ` +
      `entity_find { entity: "buffer", where: { thread: "${thread.id}" }, fields: "full" } for whole rows`,
    ...buffers.map((buffer) => bufferline(buffer, modes)),
  ].join("\n");
};
// systems/runtime/tests/harness.thread.test.js:33-44
specimen.expect(Object.keys(captured.system)).toEqual(["dewey", "thread"]);
specimen.expect(rows[3]).toBe(`0 · ${first.id} · dewey #0 · teacher/dewey · PENDING · {}`);
specimen.expect(captured.policy.cache).toEqual({ marks: ["dewey", "tools"] });
```
Unbounded in buffer count; 320 chars of `data` per buffer.

### 5.6 entity issues found

```
nested entities: output skips spoken + anima           assembly mint.js:10 · education queue.js:47 lookup.js:50/70 review.js:55 · francesca   (G11)
calendar/email /open pass ctx.input.thread (undeclared) calendar tools/index.js:94 · email :99 — vdex does it right (thread: ctx.thread, …emission.output)  (G13)
education Buffer drops create()'s thread binding        education/domain/entities/userspace/Buffer.ts:11 — a generator_view_render there mints an unbound buffer (latent)
unbounded repeated reads per turn                      assembly symbol.find({}) · email 40 threads · vdex whole JDex · thread summary buffers
mode id spelled two ways                               ctx.mode.id vs ctx.mode.entity.id
unused                                                 Intent · Identity · Daemon · User/Mode repositories · turn.fold · both Traces as reads · ensure/update/remove
```

---

## 6. the mechanisms

### 6.1 defaults and precedence — who wins

```
key               1 (wins)                  2                        3                  4               5
policy.tune       input.tune                thread INTELLIGENT.tune  input.config.tune  hal.defaults    [0.5,0.5,0.5,0.5] at resolve
policy.rounds     thread INTELLIGENT.rounds input.config.rounds      hal.defaults       schema 10       —
policy.cache      summarizing (=, threaded) input.config.cache       hal.defaults       lowering derives —
policy.backoff    input.config.backoff      hal.defaults             schema [1000,4000] —               —
settings.effort   thread INTELLIGENT.effort hal.defaults             provider default   —               —
system.*          mode/domain middleware =  input.system             hal.defaults.system —              —
```

No registry call site uses `defaults`' `system` or `output` layers. The rounds row is a bug (G7): `commons/instances/hello-world/tools/research.js:4-18` says *"the researcher's own budget — NOT the thread's INTELLIGENT.rounds"* and passes `config: { rounds: 30 }`, but the nested call carries `thread`, so a thread dialed to `rounds: 1` starves it. `summarizing` assigns `policy.cache =` unconditionally on threaded calls.

### 6.2 thread traits as the user's dial — INTELLIGENT and VOCAL

```js
// subsystems/typology/schematics/entities/thread.js:4-46 — typed; read claim-gated, projected tune → policy, effort → settings
const INTELLIGENT = v.object({
  tune: v.union([Tier, Tune]).optional(),
  effort: v.enum(["none", "low", "medium", "high"]).optional(),
  rounds: v.integer({ minimum: 1, maximum: 50 }).optional(),
  thinking: v.boolean().optional(),                  // read NOWHERE server-side; the dock's display toggle
});
const VOCAL = v.object({ language: v.string().optional(), tune: v.union([Tier, Tune]).optional(),
  harmonize: v.object({ window, tolerance, tail }).optional(), polish: v.boolean().optional() });
// subsystems/typology/schematics/v.js:122-129 — not claimed → {} · one invalid field → {} (all-or-nothing) · undeclared name THROWS
factory.trait = (row, name) => {
  const schema = factory.traits[name];
  if (!schema) throw new Error(`[v] ${descriptor.$id} declares no trait ${name}`);
  const held = row?.traits?.includes(name) ? row.trait?.[name] : undefined;
  if (!held || [...schema.errors(held)][0]) return {};
  return schema.cast(held);
};
```

```js
// subsystems/typology/tests/v.test.js:252-260
const worn = { traits: ["INTELLIGENT"], trait: { INTELLIGENT: { tune: "capable", rounds: 12 } } };
expect(v.thread.trait(worn, "INTELLIGENT")).toEqual({ tune: "capable", rounds: 12 });
expect(v.thread.trait({ traits: [], trait: { INTELLIGENT: { tune: "capable" } } }, "INTELLIGENT")).toEqual({});   // not claimed
expect(v.thread.trait({ traits: ["INTELLIGENT"], trait: { INTELLIGENT: { rounds: 99 } } }, "INTELLIGENT")).toEqual({}); // invalid
expect(() => v.thread.trait(worn, "LABELED")).toThrow("declares no trait LABELED");
```

```js
// systems/anima/src/app/panels/e/widgets/Intelligent.svelte:59-73 — the ONE writer that claims and writes in one go
const current = { ...(thread.trait?.INTELLIGENT ?? {}), ...patch };
for (const key of Object.keys(current)) if (current[key] === undefined) delete current[key];
const trait = { ...thread.trait, INTELLIGENT: current };
const claim = thread.traits.includes("INTELLIGENT") ? {} : { traits: [...thread.traits, "INTELLIGENT"] };
await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait, ...claim });
```

```
read      claiming (harnessed.js:23-31) → requesting (tune, rounds, effort) · hal.verbatim (vocal.tune, language, harmonize, polish)
provider  anthropic translate.js:106-109  effort !== "none" → thinking: { type: "adaptive", display: "summarized" } + output_config.effort
          openrouter :118-120            reasoning: effort "none" → { enabled: false } · effort → { effort } · else { enabled: true }
writers   Intelligent widget (tiers, effort, rounds [1,2,5,10,25], thinking) · e-panel toggles (traits only; un-claiming silences, keeps data)
          dataspace dashboard (tune string-only, VOCAL without harmonize) · thread_update (NEVER claims → INTELLIGENT/VOCAL writes are gated off)
gaps      VOCAL has no anima widget · ThreadTraitsEnum lists MASKED AIMED QUEUEING LABELED only · no creation flow or intent seeds either (G8)
```

### 6.3 cache — where the breakpoints land

```js
// systems/runtime/daemon/traits/harnessed.js:150-156
const summarizing = async (ctx, next) => {
  if (ctx.thread) {
    ctx.hallucination.policy.cache = { marks: [...Object.keys(ctx.hallucination.system).slice(-1), "tools"] };   // BEFORE thread
    ctx.hallucination.system.thread = await skills.thread.summary(ctx);
  }
  await next();
};
// subsystems/typology/gestalten/shard/hallucinate.js:23-42 — no thread → lowering derives ["context", "tools"]
// commons/hallucinators/anthropic/provider/translate.js:87-113
for (const section of sections) if (marks.has(section.key)) section.block.cache_control = { type: "ephemeral" };
if (marks.has("context") && system.length) system.at(-1).cache_control = { type: "ephemeral" };
if (marks.has("tools")) params.tools.at(-1).cache_control = { type: "ephemeral" };
// commons/hallucinators/openrouter/provider/translate.js:~110-113 — honours ONLY "context"
```

```
tools[…, cache_control] · system[ role · guide · … · LAST-MODE-KEY(cache_control) · thread ] · messages[ … ]     (Anthropic)
                                                                                   └─ volatile, after the mark ✓
                                                                     └─ if THIS holds the screen line, the mark sits on volatile bytes ✗
```

- No message-level breakpoint in either provider → the growing history re-bills uncached every round of every send; a tool result costs its size on every later turn (11 kB doctor fold = 6073 uncached tokens/turn, runtime shard) (G3).
- OpenRouter never caches harnessed threads (marks are `[<key>, "tools"]`, it reads only `"context"`) (G3).
- Cache busters from outside (§9.5.3): a timestamp at the top of system, removing a tool mid-session, an idle session past TTL, a subagent with its own system prompt.

### 6.4 persistence — the rows one send writes

```js
// systems/runtime/daemon/traits/harnessed.js:102-134
const persisting = async (ctx, next) => {
  await next();
  if (ctx.output?.[Symbol.asyncIterator]) ctx.output = recording(ctx, ctx.output);
  else if (ctx.output?.turns) await appending(ctx, ctx.output.turns);
};
async function* recording(ctx, packets) {
  const em = ctx.daemon.entities.em.fork();
  let folded = null, parent = em.getReference(TurnEntity, ctx.turn.id), persisted = 0;
  try {
    for await (const packet of packets) {
      folded = soma.transcript(folded, packet);
      for (const turn of folded.turns.slice(persisted))
        parent = em.create(TurnEntity, { role: turn.role, parts: turn.parts, meta: turn.meta, parent, thread: ctx.thread?.id, mode: ctx.mode.id });
      persisted = folded.turns.length;
      yield packet;
    }
    await em.flush();
  } catch (error) { em.clear(); throw error; }
}
```

```
chaining   user      { id: input.id (client UUID), parts: input.parts, parent: last history turn }     flushed BEFORE the model runs
recording  assistant { parts: [text?, tool_use{id,name,input}], meta: { state: "tools", usage } }     ┐ forked em (a tool flushing the
           user      { parts: [{ type: "tool_result", id, output: <the WHOLE bag> }] }                  │ root em cannot leak a half response),
           assistant { parts: [text…], meta: { state: "complete", usage } }                             ┘ one flush after the stream drains
```

- The whole bag persists, entity rows included, and replays every later turn (law 9).
- A client that breaks out of `for await` triggers `return()`; no `finally` → forked rows lost, user row stays (G4). A controller stop ends with a normal `/response/close { state: "abort" }` → sealed turns DO flush.
- The nested researcher persists its turns into the OUTER thread and may interleave rows (G5).
- `/object` never persists, by design — the primer keeps its own history in `buffer.data.history`.

### 6.5 activity, controller, stop

```js
// systems/runtime/daemon/traits/harnessed.js:33-39
const activating = async (ctx, next) => {
  if (!ctx.input.controller) ctx.activity = await ctx.daemon.entities.activity.control({ user: ctx.user?.id ?? null, mode: ctx.mode.id, thread: ctx.thread?.id ?? null });
  ctx.controller = ctx.input.controller ?? ctx.activity.controller;     // pass input.controller to nest without a row
  await next();
};
// subsystems/typology/schematics/primitives/controller.js:3-23
transitions: { open: { IDLE: "RUNNING" }, pause: { RUNNING: "PAUSED" }, resume: { PAUSED: "RUNNING" },
  stop: { RUNNING: "STOPPING", PAUSED: "STOPPING" }, close: { RUNNING: "DONE", PAUSED: "DONE", STOPPING: "STOPPED" },
  fault: { …: "FAILED" }, abort: { …: "ABORTED" } },
signals: { SIGTERM: "stop", SIGSTOP: "pause", SIGCONT: "resume", SIGKILL: "abort" },
// prototypes/controller.js — branch(name) → a child; kill(name, input); proceed() parks while PAUSED, returns is("RUNNING")
```

```
SIGTERM → STOPPING → proceed() false → /response/close { state: "abort" } → span.close → STOPPED   click / Esc in the dock
SIGSTOP → PAUSED (proceed() parks on the gate) · SIGCONT → RUNNING
SIGKILL → ABORTED (controller.abort.signal = the provider fetch signal)                            hold stop 2 s
per tool: controller.branch(call.name) — span /hallucination/<tool>; SIGTERM propagates; a tool honours stop only by checking ctx.controller
Activity row: virtual, steps ring 12, deleted once settled; row.stdin.SIGTERM("reason")
lifecycle pinned: activity.integration.test.js:25-99 ["create","RUNNING","PAUSED","RUNNING","STOPPING","STOPPED","delete"]
```

The dock signals every live activity on the thread (roster), not just its own send's (G6); `stub.activity.test.js:96-120` matches by `row.turn === id`, the Dock does not.

### 6.6 compaction — what exists, what is dead, what to build

```ts
// systems/runtime/daemon/entities/userspace/Turn.ts:25-38 — zero callers, zero tests
// history() ana, fold() cata … the anchor reuses tract's last turn in place, so a real compaction never lands a fresh
// row with a createdAt between a live prompt and its own reply. Re-chaining a surviving tail is the caller's job.
async fold(tract, judge) {
  const verdict = await judge(tract);
  let anchor = null;
  if (verdict) { anchor = tract.at(-1); Object.assign(anchor, verdict); anchor.parent = null; }
  const drop = verdict ? tract.slice(0, -1) : tract;
  for (const turn of drop) this.em.remove(turn);
  await this.em.flush();
  return anchor;
}
```

Dead: `commons/playground/chaosmonkey/oracle/harness.js:14-53`, commented, headed `//@beef continuous compaction ought be a shards.hal.compactor`. Uncommented it would fail: `ctx.hallucination.entities.turn.all/replace` do not exist, it reads `render.object`, passes no controller, and slices a history whose live user turn is already chained. Intent on record (`.ikiro/quests/done/m26-hallucinate-contract.org:791`): *"compaction = fold old turns INTO a state section (history → state); the turn-repository fold(tract, judge) design is that slot. DEFERRED."* Also: `thread.cursor` is a BUFFER cursor, not a history cursor; `Faculty.context` is never checked — overflow surfaces as the provider's 400 → `/response/close { state: "error" }`. The shape to build is §11.1 A2.

### 6.7 voice and verbatim

```js
// subsystems/typology/gestalten/shard/hal.js:3-82 — mounted on /verbatim (harnessed.js:170-175)
export const verbatim = ({ polish, tune } = {}) => async (ctx) => {
  const vocal = ctx.vocal;
  const source = ctx.input.source ?? (ctx.request.raw?.body && ctx.request.subscribe());
  if (!source) throw new Error("[hal.verbatim] no audio source — pass input.source or feed the request body");
  const events = await ctx.daemon.cortex.hallucinate.verbatim.stream({
    controller: ctx.controller.branch("verbatim"), source,
    settings: { ...(vocal.language && { language: vocal.language }) },
    policy: { ...((vocal.tune ?? tune) && { tune: vocal.tune ?? tune }), ...(vocal.harmonize && { harmonize: vocal.harmonize }) },
  });
  const repair = async (text) => (await ctx.daemon.cortex.hallucinate.dialogue.render({
    controller: ctx.controller.branch("dialogue"), system: { polish },
    turns: [{ role: "user", parts: [{ type: "text", text }] }], policy: { tune: "fast", rounds: 1 },
  })).output.message?.trim() ?? null;
  ctx.output = controlled(ctx.controller, !polish || vocal.polish === false ? events : polishing(events, repair));
};
```
`POLISH` (`harnessed.js:8-13`) is a model persona of the second kind — a repair pass: *"Preserve every word as spoken … never translate, never correct grammar or word choice, never add, remove or reorder content, never answer or comment. Output only the corrected transcript."* Transcripts are not stored as turns. `hal.voice` (`hal.js:84-102`) is dead: no call sites, `input.tune.voice` always undefined, bypasses the cortex `/speech` avenue.

---

## 7. the client — four ways a harness is reached

```
A  generic dock          Dock.svelte:239-241   { thread, id, parts } only; tune/effort/rounds come from INTELLIGENT      any CONVERSATIONAL mode
B  an app's own door     chess Practice.svelte:85 → aperture/index.js:99 · primer Primer.svelte:14 → aperture.js:48       own brief / schema / server-side action
C  direct → /harness     Oracle.svelte:71      no thread → no INTELLIGENT, no persistence; 8000 ms timeout               playground only
D  tool yields → buffers client harnessed.js:16-36  entity arrays merged into local repositories BEFORE the consumer sees them   any tool returning buffer: [row]
```

```js
// A — systems/anima/src/app/panels/a/widgets/Dock.svelte:225-252
const id = crypto.randomUUID();
echo = { id, role: "user", parts, createdAt: new Date().toISOString() };    // dropped when thread.$turns delivers the same id
for await (const turn of soma.scan(thread.mode.harness.dialogue.stream({ thread: thread.id, id, parts }))) live = { ...turn };
```

```js
// B streaming — the app drains and ignores the packets; the board follows buffer.$data, the talk thread.$turns
// chess/modes/coach/practice/buffer/Practice.svelte:62-86
const drain = async (stream) => { thinking = true; try { for await (const _ of await stream); } finally { thinking = false; } };
const move = (uci) => guard("move", async () => { await call("move", { buffer: buffer.id, uci }); await drain(call("turn", { buffer: buffer.id, thread: thread?.id })); });
// B object — history owned by the buffer because /object persists nothing       young-ladys-primer/modes/home/primer/aperture.js:43-63
const render = await ctx.mode.harness.object.render({ turns, output: hal.narrator.output, thread: ctx.input.thread });
const scene = render.output.object;
buffer.data = { ...buffer.data, scene, history: [...turns, { role: "assistant", parts: [{ type: "text", text: scene.prose }] }] };
await ctx.daemon.entities.em.flush();
// B broken — education/modes/home/aprende/aperture/message.js:21-36 reads render.object → throws every call (G12)
```

```js
// C — commons/playground/chaosmonkey/oracle/buffer/Oracle.svelte:71-76
const render = await buffer.mode.harness.object.render({ turns: [{ role: "user", parts: [{ type: "text", text: prompt }] }], output: v.object({ answer: v.string() }) });
assistant.set(render?.output?.object?.answer ?? "");
```

```js
// D — systems/anima/src/typology/entities/mode/traits/harnessed.js:6-50
const merge = async (yielded) => {
  for (const [name, pojos] of Object.entries(yielded.output)) {
    if (name === "message" || name === "object") continue;
    if (!Array.isArray(pojos)) continue;
    const repository = ctx.daemon.entities[name];
    if (!repository) continue;
    yielded.output[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));
  }
};
const harness = mode.connection.branch("/harness").use(async (rqx, next) => {
  await next();
  const body = rqx.response?.body;
  if (body?.[Symbol.asyncIterator] && !body.getReader) {
    rqx.response.body = (async function* () { for await (const packet of body) { if (packet?.event === "/tool/yield" && is.yieldish(packet.result)) await merge(packet.result); yield packet; } })();
    return;
  }
  if (is.yieldish(body)) await merge(body);
});
mode.metadata.harness = await mode.connection.call("/metadata/harness");
mode.harness = shape.connection.wire(harness, mode.metadata.harness);
```
`mode.call` (aperture) paths do NOT get this merge — hello-world's `App.svelte:132` merges research buffers by hand: `// an aperture call is not an emit, so nothing merged these into the store for us.`

Rules that fall out:
```
a door returning a stream MUST declare yields  → wire projects connection.stream (SSE), exempt from shard.connection.timeout(8000) (dossier.js:62)
a buffered object.render door is NOT exempt    → aprende, primer, calendar-style doors abort after 8 s; an async generator handler IS SSE
the object is at render.output.object          → aprende's render.object throws
no registry app calls mode.harness directly    → the assembly editor's "harness" pane is a local grammar composer, no LLM
the stop button signals Activity rows           → row.stdin.SIGTERM; it does not abort the fetch
conversation.js                                → the one client path with tune, an AbortController and a speech channel — exported, never called
doors that bypass the harness                  → riddler (cortex.hallucinate.object.render with its own activity.control) · dealer (mode.emit → harness.object.render)
wire guards                                    → anima tests/harness-wire.test.js: stream leaves carry yields; /metadata/harness strips the mounted branch
no test covers the client HARNESSED merge
```

---

## 8. worked examples — the whole code, and what the model saw

### 8.0 the rig

```js
// .ikiro/reference/harnesses/examples/rig.js
import { Controller, Cortex, shape, shard, steer, Vector } from "@vivalence/typology";

export const userTurn = (text) => ({ role: "user", parts: [{ type: "text", text }] });

export const answered = (turns) =>
  turns.flatMap((turn) => turn.parts ?? []).filter((part) => part.type === "tool_result");

export const scripted = (script) => {
  const seen = [];
  const cortex = new Cortex().register([{
    type: "dialogue",
    tune: [0.5, 0.5, 0.5],
    channels: { in: ["text", "tool_result"], out: ["text", "tool_use", "object"] },
    via: {
      render: async (request) => {
        seen.push(JSON.parse(JSON.stringify({
          ...request,
          tools: request.tools?.map((tool) => tool.name),
          ...(request.output && { output: { schema: "(v schema)" } }),
        })));
        return script(request, seen.length - 1);
      },
    },
  }]);
  return { cortex, seen };
};

export const assemble = ({ daemon, mode, thread, harness, tools }) => {
  const armed = new Vector();
  if (tools) armed.slurp(tools);
  armed.use(shard.context.bind("daemon", daemon));
  armed.use(shard.context.bind("mode", mode));
  if (thread) armed.use(shard.context.bind("thread", thread.id));

  const vector = new Vector()
    .use(shard.context.bind("daemon", daemon))
    .use(shard.context.bind("mode", mode))
    .use(async (ctx, next) => {
      ctx.input = typeof ctx.input === "string" ? { prompt: ctx.input } : (ctx.input ?? {});
      ctx.thread = thread ?? null;
      const { system, turns, output, tune } = ctx.input;
      ctx.hallucination = {
        controller: new Controller(),
        policy: { ...(tune && { tune }) },
        system: { ...system },
        turns: turns ?? [],
        tools: armed,
        ...(output && { output: { schema: output } }),
      };
      await next();
    })
    .slurp(harness);

  for (const type of ["dialogue", "object"])
    vector.branch(type).open("render", (ctx) => ctx.daemon.cortex.hallucinate[type].render(ctx.hallucination));

  return shape.object(vector, steer.strategy.echo);
};
```

What the rig is and is not: it reproduces `requesting`'s record, the thread row/id split (law 2) and arming's context binds, then hands off to the REAL cortex (lowering, loop, dispatch, fold). It skips claiming, INTELLIGENT, chaining/persisting and `summarizing` — so no `system.thread`, and cache marks are the derived `["context","tools"]`. Trap met while building it: `structuredClone` of a request throws `#<Object> could not be cloned` on the v-schema in `request.output` — hence the JSON round trip with the schema replaced.

### 8.1 pt10 rebuilt — index in context, pages behind a tool, screen last

The registry version (`droneaid/modes/assembly/pt10/harness.js`) puts every part and every step's text, warnings and prep into `system.pt10` on every turn, joins the screen line into that same key, has no defaults, and returns `{condition, output}`. The rebuild answers the six questions (§3 step 2) and moves the pages behind `guide_read`.

```js
// .ikiro/reference/harnesses/examples/pt10/guide.js
export const guide = {
  guide: { title: "PT10 frame kit", source: "droneaid manual v2" },
  parts: [
    { id: "frame", label: "Frame" },
    { id: "arm", label: "Arm ×4" },
    { id: "motor", label: "Motor 2207 ×4" },
    { id: "prop", label: "Propeller 5\" ×4" },
  ],
  steps: [
    { section: "Overview", title: "Everything in the kit", parts: [], text: ["Lay out every part."], warn: [], prep: {} },
    { section: "Frame", title: "Bolt the arms", parts: ["frame", "arm"], text: ["Slide each arm into the frame slot.", "Tighten crosswise."], warn: [], prep: { Bolts: "16 mm ×8", Tool: "Hex 2.0" } },
    { section: "Motors", title: "Mount the motors", parts: ["motor", "arm"], text: ["Seat the motor on the arm plate.", "Thread the wires through the arm."], warn: ["Motor bolts longer than 6 mm touch the windings."], prep: { Bolts: "M3 6 mm ×16", Tool: "Hex 2.0" } },
    { section: "Check", title: "Spin up", parts: ["prop"], text: ["Fit props last.", "Arm on the bench, throttle 5%."], warn: ["Props on, battery in: the drone is live. Stand clear."], prep: {} },
  ],
};
```

```js
// .ikiro/reference/harnesses/examples/pt10/screen.js
import { guide } from "./guide.js";

export const threadOf = (ctx) => ctx.thread?.id ?? ctx.thread ?? null;
export const modeOf = (ctx) => ctx.mode?.id ?? null;

export const current = (ctx) => {
  const thread = threadOf(ctx);
  if (!thread) return null;
  return ctx.daemon.entities.buffer.findOne({ thread, mode: modeOf(ctx) }, { orderBy: { index: "desc" } });
};

export const located = (row) => {
  const at = row?.data?.step;
  if (at == null) return "Nothing is on the operator's screen.";
  const held = guide.steps[at];
  return `On the operator's screen: step ${at} · ${held.section} · ${held.title}.`;
};
```

```js
// .ikiro/reference/harnesses/examples/pt10/tools.js
import { v, Vector } from "@vivalence/typology";
import { guide } from "./guide.js";
import { current, located } from "./screen.js";

const LAST = guide.steps.length - 1;
const STEP = v.integer({ minimum: 0, maximum: LAST }).desc(`Step number from the [Guide] index, 0 to ${LAST}. Example: 2`);

const page = (index) => {
  const step = guide.steps[index];
  return [
    `step ${index} · ${step.section} · ${step.title} · parts ${step.parts.join(" ") || "none"}`,
    ...step.warn.map((line) => `WARN ${line}`),
    ...step.text.map((line, at) => `${at + 1}. ${line}`),
    ...Object.entries(step.prep).map(([key, value]) => `${key}: ${value}`),
  ].join("\n");
};

export const tools = new Vector()
  .open(
    {
      nature: "/guide/read",
      valence: "Read one step of the guide in full — warnings, numbered instructions, bolts and tools. " +
        "The [Guide] index only names steps; read before you instruct. Example: { step: 2 }",
      input: v.object({ step: STEP }),
    },
    (ctx) => ({ message: page(ctx.input.step) }),
  )
  .open(
    {
      nature: "/guide/step",
      valence: "Put a step on the operator's screen — the 3D view moves to it. 0 is the overview. " +
        "Returns where the screen now is. Example: { step: 2 }",
      input: v.object({ step: STEP }),
    },
    async (ctx) => {
      const row = await current(ctx);
      if (!row) throw new Error("no pt10 buffer is open on this thread — ask the operator to open the guide first");
      row.data = { ...row.data, step: ctx.input.step };
      await ctx.daemon.entities.em.flush();
      return { message: located(row), buffer: [row] };
    },
  );
```

```js
// .ikiro/reference/harnesses/examples/pt10/harness.js
import { shard, Vector } from "@vivalence/typology";
import { guide } from "./guide.js";
import { current, located } from "./screen.js";

const ROLE = [
  `You are the assembly mentor for the ${guide.guide.title} (${guide.guide.source}).`,
  "The [Guide] below is an index — part ids and step titles only. Read a step with guide_read before you instruct from it; never quote a bolt size, a torque or a warning you have not read.",
  "Put a step on the operator's screen with guide_step when they ask to see it or name a part they are about to fit.",
  "Warnings are said before instructions. Two or three plain sentences.",
].join("\n");

const INDEX = [
  "[Parts] id · label",
  ...guide.parts.map((part) => `${part.id} · ${part.label}`),
  "[Steps] number · section · title · ⚠ = carries a warning",
  ...guide.steps.map((step, index) => `${index} · ${step.section} · ${step.title}${step.warn.length ? " · ⚠" : ""}`),
].join("\n");

const FORMAT = "Markdown renders in the dock: **bold** a warning, never a heading.";

export const harness = new Vector()
  .use(shard.hal.defaults({ policy: { tune: "balanced", rounds: 4 }, settings: { effort: "low" } }))
  .use(async (ctx, next) => {
    ctx.hallucination.system.role = ROLE;
    ctx.hallucination.system.guide = INDEX;
    await next();
  });

harness.branch("/dialogue").use(async (ctx, next) => {
  ctx.hallucination.system.format = FORMAT;
  ctx.hallucination.system.screen = located(await current(ctx));
  await next();
});
```

What the provider received, round 1 of 3 (captured by the rig):
```json
{ "system": {
    "role":   "You are the assembly mentor for the PT10 frame kit (droneaid manual v2).\nThe [Guide] below is an index — … read a step with guide_read …",
    "guide":  "[Parts] id · label\nframe · Frame\narm · Arm ×4\nmotor · Motor 2207 ×4\nprop · Propeller 5\" ×4\n[Steps] number · section · title · ⚠ = carries a warning\n0 · Overview · Everything in the kit\n1 · Frame · Bolt the arms\n2 · Motors · Mount the motors · ⚠\n3 · Check · Spin up · ⚠",
    "format": "Markdown renders in the dock: **bold** a warning, never a heading.",
    "screen": "On the operator's screen: step 0 · Overview · Everything in the kit." },
  "turns": [ { "role": "user", "parts": [ { "type": "text", "text": "how do I mount the motors?" } ] } ],
  "tools": [ "guide_read", "guide_step" ], "cache": { "marks": [ "context", "tools" ] }, "settings": { "effort": "low" } }
```
```
round 1  model → tool_use guide_read { step: 2 }
         tool  → { "message": "step 2 · Motors · Mount the motors · parts motor arm\nWARN Motor bolts longer than 6 mm touch the windings.\n1. Seat the motor on the arm plate.\n2. Thread the wires through the arm.\nBolts: M3 6 mm ×16\nTool: Hex 2.0" }
round 2  model → tool_use guide_step { step: 2 }
         tool  → { "message": "On the operator's screen: step 2 · Motors · Mount the motors.", "buffer": [ { "id": "b1", …, "data": { "step": 2 } } ] }
         em.flush() → buffer b1 data.step 0 → 2   (live: the client receives it by the reactive broadcast, pattern D)
round 3  model → "**Motor bolts longer than 6 mm touch the windings.** Seat the motor, then thread the wires."
close    { "state": "complete", "rounds": 3 }
```
```json
// the failure paths, as the SCRIPTED faculty reads them — the provider path speaks the same string, is_error set
{ "type": "tool_result", "id": "t1", "output": { "message": { "error": "Validation failed: must be <= 3" } } }
{ "type": "tool_result", "id": "t1", "output": { "message": { "error": "no pt10 buffer is open on this thread — ask the operator to open the guide first" } } }
```
```
cost    registry: role + every part + every step's text/warn/prep + screen, every turn — grows with the guide
        rebuilt:  role + index (1 line/step) + screen; a page only when read
cache   keys [role, guide, format, screen]; on a threaded call summarizing marks "screen" (law 3) — role+guide+format re-write once per screen change (G1)
```

```js
// .ikiro/reference/harnesses/examples/pt10/pt10.test.js
import { specimen } from "@vivalence/typology";
import { answered, assemble, scripted, userTurn } from "../rig.js";
import { harness } from "./harness.js";
import { tools } from "./tools.js";

const world = () => {
  const rows = [{ id: "b1", index: 0, thread: "t1", mode: "m1", data: { step: 0 } }];
  const flushed = [];
  const daemon = {
    entities: {
      buffer: { findOne: async (where) => rows.find((row) => row.thread === where.thread && row.mode === where.mode) ?? null },
      em: { flush: async () => flushed.push(rows.map((row) => ({ ...row.data }))) },
    },
  };
  return { rows, flushed, daemon };
};

const call = (id, name, input) => ({ role: "assistant", parts: [{ type: "tool_use", id, name, input }], meta: { state: "tools" } });
const say = (text) => ({ role: "assistant", parts: [{ type: "text", text }], meta: { state: "complete" } });

specimen.describe("pt10 rebuilt — index in context, pages behind a tool, screen last", () => {
  specimen.it("reads before it instructs, moves the screen, then answers", async () => {
    const { rows, flushed, daemon } = world();
    const { cortex, seen } = scripted((request) => {
      const results = answered(request.turns).length;
      if (results === 0) return call("t1", "guide_read", { step: 2 });
      if (results === 1) return call("t2", "guide_step", { step: 2 });
      return say("**Motor bolts longer than 6 mm touch the windings.** Seat the motor, then thread the wires.");
    });
    daemon.cortex = cortex;
    const mentor = assemble({ daemon, mode: { id: "m1" }, thread: { id: "t1" }, harness, tools });
    const folded = await mentor.dialogue.render({ turns: [userTurn("how do I mount the motors?")] });
    specimen.expect(Object.keys(seen[0].system)).toEqual(["role", "guide", "format", "screen"]);
    specimen.expect(seen[0].system.screen).toBe("On the operator's screen: step 0 · Overview · Everything in the kit.");
    specimen.expect(seen[0].tools).toEqual(["guide_read", "guide_step"]);
    specimen.expect(folded.meta.state).toBe("complete");
    specimen.expect(rows[0].data.step).toBe(2);
    specimen.expect(flushed).toHaveLength(1);
  });

  specimen.it("an out-of-range step comes back as an error the model can read, and the loop continues", async () => {
    const { daemon } = world();
    const { cortex, seen } = scripted((request) => answered(request.turns).length ? say("There are only steps 0 to 3.") : call("t1", "guide_read", { step: 9 }));
    daemon.cortex = cortex;
    const mentor = assemble({ daemon, mode: { id: "m1" }, thread: { id: "t1" }, harness, tools });
    const folded = await mentor.dialogue.render({ turns: [userTurn("read step 9")] });
    const [result] = answered(seen[1].turns);
    specimen.expect(folded.meta.state).toBe("complete");
    specimen.expect(JSON.stringify(result.output)).toContain("error");
  });

  specimen.it("no buffer on the thread: the tool refuses with the fix in the message", async () => {
    const { daemon } = world();
    const { cortex, seen } = scripted((request) => answered(request.turns).length ? say("Open the guide first.") : call("t1", "guide_step", { step: 1 }));
    daemon.cortex = cortex;
    const mentor = assemble({ daemon, mode: { id: "m1" }, thread: { id: "t9" }, harness, tools });
    await mentor.dialogue.render({ turns: [userTurn("show step 1")] });
    const [result] = answered(seen[1].turns);
    specimen.expect(JSON.stringify(result.output)).toContain("ask the operator to open the guide first");
    specimen.expect(seen[0].system.screen).toBe("Nothing is on the operator's screen.");
  });

  specimen.it("an object render never sees the dialogue-only sections", async () => {
    const { daemon } = world();
    const { cortex, seen } = scripted(() => ({ role: "assistant", parts: [{ type: "object", data: { ok: true } }], meta: { state: "complete" }, object: { ok: true } }));
    daemon.cortex = cortex;
    const mentor = assemble({ daemon, mode: { id: "m1" }, thread: { id: "t1" }, harness, tools });
    await mentor.object.render({ turns: [userTurn("classify")], output: { type: "object" } });
    specimen.expect(Object.keys(seen[0].system)).toEqual(["role", "guide"]);
  });
});
```
(The file on disk also `console.log`s REQUEST[0], TOOL_RESULTS and FOLDED — the captures above.)

### 8.2 seat — the harness verifies, the caller never retries

The registry version (`chess/modes/board/play`): defaults + "Never invent a move"; legality is enforced by the CALLER (`seats.js` keeps `tried`, re-briefs, then plays a random legal move) — every consumer repeats the loop. The voice stays; the rule's twin moves from caller retry to a harness verifier on `/object`, fed by `ctx.input.legal` (law 5).

```js
// .ikiro/reference/harnesses/examples/seat/harness.js
import { shard, v, Vector } from "@vivalence/typology";

export const ANSWER = v.object({
  uci: v.string().desc('One move as UCI, taken from the legal list. Example: "g1f3"'),
  comment: v.string().desc('One sentence for the operator. Example: "Developing with tempo."'),
});

const SEAT = [
  "You are seated at a chess board and it is your move.",
  "Answer with exactly one move from the legal list, as UCI.",
  "The comment is one plain sentence for the operator watching.",
].join("\n");

const ATTEMPTS = 2;

const uciOf = (folded) => String(folded?.output?.object?.uci ?? "").trim();

const amended = (turns, tried, legal) => {
  const last = turns.at(-1);
  const fault = {
    type: "text",
    text: `Rejected, not legal in this position: ${tried.join(", ")}. Legal moves: ${legal.join(" ")}. Answer with one of them.`,
  };
  return [...turns.slice(0, -1), { ...last, parts: [...last.parts, fault] }];
};

export const harness = new Vector()
  .use(shard.hal.defaults({ policy: { tune: "capable", rounds: 1 }, settings: { effort: "low" } }))
  .use(async (ctx, next) => {
    ctx.hallucination.system.seat = SEAT;
    await next();
  });

harness.branch("/object").use(async (ctx, next) => {
  await next();
  const legal = ctx.input.legal;
  if (!legal) return;
  const tried = [];
  while (!legal.includes(uciOf(ctx.output))) {
    tried.push(uciOf(ctx.output) || "(empty)");
    if (tried.length > ATTEMPTS) throw new Error(`[seat] no legal move after ${tried.length} answers: ${tried.join(", ")}`);
    ctx.output = await ctx.daemon.cortex.hallucinate.object.render({
      ...ctx.hallucination,
      controller: ctx.hallucination.controller.branch(`repair-${tried.length}`),
      turns: amended(ctx.hallucination.turns, tried, legal),
    });
  }
});
```

```json
// REQUEST[0] → { "uci": "e2e5" } ✗
{ "system": { "seat": "…" }, "turns": [ { "role": "user", "parts": [ { "type": "text", "text": "Position: start. Legal: e2e4 d2d4 g1f3. Your move." } ] } ],
  "cache": { "marks": [ "context" ] }, "settings": { "effort": "low" }, "output": { "schema": "(v schema)" } }
// REQUEST[1].turns → { "uci": "e2e4" } ✓
[ { "role": "user", "parts": [ { "type": "text", "text": "Position: start. Legal: e2e4 d2d4 g1f3. Your move." },
                               { "type": "text", "text": "Rejected, not legal in this position: e2e5. Legal moves: e2e4 d2d4 g1f3. Answer with one of them." } ] } ]
// the CALLER receives — folded.output
{ "object": { "uci": "e2e4", "comment": "King's pawn." } }
```

```js
// .ikiro/reference/harnesses/examples/seat/seat.test.js
import { specimen } from "@vivalence/typology";
import { assemble, scripted, userTurn } from "../rig.js";
import { ANSWER, harness } from "./harness.js";

const object = (data) => ({ role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data });
const LEGAL = ["e2e4", "d2d4", "g1f3"];
const brief = userTurn("Position: start. Legal: e2e4 d2d4 g1f3. Your move.");

specimen.describe("seat — the harness verifies in code and repairs with the fault as prompt", () => {
  specimen.it("an illegal answer is repaired once; the caller only ever sees a legal move", async () => {
    const answers = [{ uci: "e2e5", comment: "Bold." }, { uci: "e2e4", comment: "King's pawn." }];
    const { cortex, seen } = scripted((_, index) => object(answers[index]));
    const seat = assemble({ daemon: { cortex }, mode: { id: "m1" }, harness });
    const folded = await seat.object.render({ turns: [brief], output: ANSWER, legal: LEGAL });
    specimen.expect(seen).toHaveLength(2);
    specimen.expect(folded.output.object.uci).toBe("e2e4");
    specimen.expect(seen[1].turns).toHaveLength(1);
    specimen.expect(seen[1].turns[0].parts.at(-1).text).toContain("Rejected, not legal in this position: e2e5");
  });

  specimen.it("a legal first answer costs exactly one call", async () => {
    const { cortex, seen } = scripted(() => object({ uci: "g1f3", comment: "Develop." }));
    const seat = assemble({ daemon: { cortex }, mode: { id: "m1" }, harness });
    await seat.object.render({ turns: [brief], output: ANSWER, legal: LEGAL });
    specimen.expect(seen).toHaveLength(1);
  });

  specimen.it("three illegal answers throw, naming every one", async () => {
    const { cortex, seen } = scripted(() => object({ uci: "a1a8", comment: "?" }));
    const seat = assemble({ daemon: { cortex }, mode: { id: "m1" }, harness });
    let error = null;
    await seat.object.render({ turns: [brief], output: ANSWER, legal: LEGAL }).catch((thrown) => (error = thrown));
    specimen.expect(seen).toHaveLength(3);
    specimen.expect(error.message).toBe("[seat] no legal move after 3 answers: a1a8, a1a8, a1a8");
  });

  specimen.it("the dialogue avenue is untouched by the object verifier", async () => {
    const { cortex, seen } = scripted(() => ({ role: "assistant", parts: [{ type: "text", text: "hi" }], meta: { state: "complete" } }));
    const seat = assemble({ daemon: { cortex }, mode: { id: "m1" }, harness });
    const folded = await seat.dialogue.render({ turns: [userTurn("hello")], legal: LEGAL });
    specimen.expect(seen).toHaveLength(1);
    specimen.expect(folded.output.message).toBe("hi");
  });
});
```

```js
// the caller shrinks from a retry loop to one line
const { output } = await ctx.mode.harness.object.render({ turns: [brief], output: ANSWER, legal: moves });
```

---

## 9. the meta outside viva

### 9.1 m29's six laws, re-measured

```
m29 law                                          status          evidence
tools = contract with a non-deterministic caller holds, sharper  the caller is TRAINED on tool shapes: Codex on apply_patch; old_content → old_string (HN #3); "better models, worse tools" (S27)
response shaping = biggest lever                 holds           errors-only backpressure (S31); "should not print thousands of useless bytes" (S10)
error strings are prompts                        holds (G2 landed 09-23)      Manus keep-errors (S22)
progressive disclosure                           contested       8 KB AGENTS.md index 100% vs skills 79%; skills never invoked in 56% of cases (HN #7)
definitions cost before anything runs            holds, worse    Claude Code 33k prefix vs OpenCode 7k (HN #5); Pi 1.3k · OpenCode 7.2k · Claude Code 23.1k (R #1)
stable prefix                                    holds; THE metric  "KV-cache hit rate is the single most important metric" (S22); idle >1 h = full miss (HN #20)
```

### 9.2 ten points new since m29

1. **Harnesses decay.** *"Every component in a harness encodes an assumption about what the model can't do on its own"* (S1). Anthropic cut >80% of Claude Code's system prompt for the Claude 5 generation *"with no measurable loss"* (HN #6); the context-anxiety fix became *"dead weight"* on Opus 4.5 (S2). One "≤25 words between tool calls" line degraded Claude Code and was reverted (S16).
2. **Bash-only is competitive.** arXiv 2609.20804, 176 settings: *"bash-capable models can operate effectively with a bash-only interface and achieve substantially lower cost"* (HN #4); Vercel 15+ tools → bash, 80% → 100%, 3.5× faster (S33).
3. **Model-harness fit.** Use the tool shapes the model was post-trained on — Claude `Edit(file_path, old_string, new_string, replace_all)`, GPT `apply_patch` (HN #3, S18); Cursor renames tools per family and lost 30% dropping reasoning traces (S35).
4. **The harness moves scores 3–14 pts at a fixed model** (LangChain 52.8 → 66.5, S34; Droid 58.8% vs Claude Code 43.2% on the same Opus, S36). METR dissents: product harnesses ≈ basic scaffolds on time horizon (S39). Infra alone moves 6 pts; gaps < 3 pts are noise (S11).
5. **Multi-agent reconciled.** *"writes stay single-threaded and the additional agents contribute intelligence rather than actions"* (S21). Subagents are context firewalls (S31), not role-play; 5 generalist instances beat role-specialists (reddit r/ClaudeAI 1r6kub4).
6. **Reset beats summarize** for long runs: a fresh context and a structured handoff file (S1, R #11: *"You're better off with a handoff file and using clear"*). Rule-based elision before LLM summary is the most efficient context management (HN #4).
7. **Memory files: short, hand-written, pointer-shaped.** ETH: context files add >20% cost for no success gain; *"repository overviews … are not helpful"* (S38). OpenAI: *"AGENTS.md as table of contents, not encyclopedia"*, ~100 lines (S17). HumanLayer: root file under 60 lines, ~150–200 instructions followable (S30). Auto-memory distrusted; version-controlled memory preferred (HN #6).
8. **Sandbox over prompts.** Sandboxing cut permission prompts 84%, needs *"both filesystem and network isolation"* (S14); auto mode still misses 17% of overeager actions (S15); an in-harness restriction is *"a 'do not walk on grass' sign"* (HN #11).
9. **The outer loop is the new layer.** *"the harness level loop: the loop outside the agent loop"* (S26); Ralph `while :; do cat PROMPT.md | claude-code ; done` (S28).
10. **Practitioner floor** (reddit): the same diffs from three harnesses at 4× time spread (R #1); a date at the top of the prompt flushes the cache at midnight (R #8); *"100k tokens used in context is the dumb zone"* (R #20); *"There is NO way to guarantee compliance only via the prompt … If you need compliance, you need it scripted deterministically"* (R #10).

### 9.3 open debates

```
thin vs thick         thin: Cherny "thinnest possible wrapper", Pi, Ralph, METR · thick: LangChain +13.7, Factory, Anthropic's 3-agent harness
                      → a thin loop plus heavy ENVIRONMENT work (verification, docs, lints, structure) — what OpenAI calls harness engineering
MCP vs CLI vs skills  CLI for solo terminal agents; MCP for auth, governance, audit, non-shell clients (HN #10); skills can gate MCP
single vs multi       single writer + read-only helpers (S21); +90% on research at 15× tokens, less for coding (S9)
compaction vs reset   reset + handoff (S1) · server-side encrypted compaction (S18, HN #13) · async compaction (S19) · keep all, push to files (S22)
trained on harness?   yes: Codex on apply_patch/shell_command/update_plan (S18) · counter-claims unverified
memory files at all?  ETH null result vs vendor advice → short files that point elsewhere
```

### 9.4 numbers

```
LangChain Terminal-Bench 2.0         52.8 → 66.5, same gpt-5.2-codex                        S34
Factory Terminal-Bench 1             Droid+Opus 58.8% · Droid+Sonnet 50.5% · Claude Code+Opus 43.2%   S36
Anthropic infra noise                6 pts TB2.0 · ~1.5 pts SWE-bench · <3 pts = noise       S11
tool search                          Opus 4 49 → 74% · Opus 4.5 79.5 → 88.1%                 S7
tool-use examples                    72% → 90%                                               S7
code-exec over MCP                   150,000 → 2,000 tokens (98.7%)                           S6
edit format alone                    +15 pts avg, hashline beats patch in 14/16 models        HN #1
multi-agent research                 +90.2% at ~15× chat tokens; tokens explain 80% of variance S9
Terminal-Bench 2.1 fix               28 broken tasks moved one pairing 12.1%                  S40
start tokens                         Pi 1,340 · OpenCode 7,197 · Claude Code 23,132 (1,430 of it system prompt)  R #1
subagent burn                        121k → 513k tokens with two subagents                    HN #5
```

### 9.5 provider-agnostic guides — the thing, and the code that produces it

#### 9.5.1 the loop

```js
// minimal-harness.js — the entire agent loop
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
const tools = {
  bash: {
    definition: { name: "bash", description: "Run a shell command. Returns stdout+stderr, truncated to 8 KB. " + 'Example: { "command": "rg -n TODO src/" }',
      input_schema: { type: "object", properties: { command: { type: "string" } }, required: ["command"] } },
    execute: async ({ command }) => {
      const out = await new Deno.Command("sh", { args: ["-c", command] }).output();
      const text = new TextDecoder().decode(out.stdout) + new TextDecoder().decode(out.stderr);
      return text.length > 8192 ? text.slice(0, 8192) + `\n[truncated ${text.length - 8192} bytes — narrow the command]` : text;
    },
  },
};
export async function run(prompt, { rounds = 20 } = {}) {
  const messages = [{ role: "user", content: prompt }];
  for (let round = 0; round < rounds; round++) {
    const response = await client.messages.create({ model: "claude-sonnet-5", max_tokens: 8192,
      system: "You are a coding agent in a POSIX shell. Verify before claiming done.",
      tools: Object.values(tools).map((tool) => tool.definition), messages });
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "tool_use") return { messages, state: "complete" };
    const results = await Promise.all(response.content.filter((block) => block.type === "tool_use").map(async (call) => {
      try { return { type: "tool_result", tool_use_id: call.id, content: await tools[call.name].execute(call.input) }; }
      catch (fault) { return { type: "tool_result", tool_use_id: call.id, content: `error: ${fault.message}`, is_error: true }; }
    }));
    messages.push({ role: "user", content: results });
  }
  return { messages, state: "length" };
}
```
```
1  every tool_use gets exactly one tool_result, same id, in the NEXT user turn
2  errors return as results (a STRING), never throw out of the loop          ← viva since G2 landed: dispatch:98, the part carries condition
3  a round ceiling closes as "length", distinct from "complete"
4  tool results are bounded, and the truncation message says how to narrow
5  parallel tool calls dispatch concurrently, results keep call order
```
*"It's an LLM, a loop, and enough tokens"* — under 400 lines of Go (S29). viva's `respond()` is this loop plus a controller, retry, a span and the packet grammar.

#### 9.5.2 tools — the contract

```json
// BAD — 30 tools shaped like the REST API, prose-only params, raw row back
{ "name": "getUserById", "description": "Gets a user.", "input_schema": { "type": "object", "properties": { "id": {} } } }
// GOOD — one consolidated, namespaced tool; enums + defaults in the schema; an example in the description
{ "name": "entity_find",
  "description": "Find rows of one entity type. Returns cards (id + key fields) unless projection='full'. Max 50 rows; page with offset. Example: { \"entity\": \"user\", \"where\": { \"email\": { \"$like\": \"%@acme.io\" } }, \"limit\": 12 }",
  "input_schema": { "type": "object", "required": ["entity"], "properties": {
    "entity": { "type": "string", "enum": ["user", "thread", "buffer", "turn"] },
    "where": { "type": "object", "description": "Mikro-style filter. Example: { \"status\": \"PENDING\" }" },
    "projection": { "type": "string", "enum": ["card", "full"], "default": "card" },
    "limit": { "type": "integer", "minimum": 1, "maximum": 50, "default": 12 },
    "offset": { "type": "integer", "minimum": 0, "default": 0 } } } }
```
```js
// shape.js — card projection + byte budget + steering truncation (viva: entity_find's BUDGET loop, §5.4)
const CARDS = { user: ["id", "email", "role"], buffer: ["id", "index", "status", "trait.LABELED.name"] };
const pick = (row, paths) => Object.fromEntries(paths.map((path) => [path, path.split(".").reduce((value, key) => value?.[key], row)]));
export const shape = (entity, rows, { projection = "card", budget = 10_000, offset = 0 } = {}) => {
  const projected = projection === "full" ? rows : rows.map((row) => pick(row, CARDS[entity]));
  if (JSON.stringify(projected).length <= budget) return JSON.stringify(projected);
  const kept = [];
  for (const row of projected) { if (JSON.stringify(kept).length > budget * 0.9) break; kept.push(row); }
  return JSON.stringify(kept) + `\n[${projected.length - kept.length} more rows — call again with offset: ${offset + kept.length}, or narrow 'where']`;
};
// errors are prompts
throw new Error(`unknown entity 'litreal' — this daemon has: literal, symbol, thread, buffer. Did you mean 'literal'?`);
// model-harness fit — name edit tools the way the model was trained
const EDIT = {
  claude: { name: "Edit", input_schema: { type: "object", required: ["file_path", "old_string", "new_string"], properties: { file_path: { type: "string" }, old_string: { type: "string" }, new_string: { type: "string" }, replace_all: { type: "boolean", default: false } } } },
  gpt:    { name: "apply_patch", input_schema: { type: "object", required: ["input"], properties: { input: { type: "string", description: "*** Begin Patch … *** End Patch" } } } },
};
```
Anthropic's list (S5): consolidate operations, namespace, paginate/range/filter/truncate, improve tools with evals. Keep params ≤ 8, enums in the schema (m29).

#### 9.5.3 context layout — stable first, volatile last, breakpoints between

```
 tools[]            never changes in a session          ◀ cache_control (breakpoint 1)
 system.persona     never changes
 system.memory      AGENTS.md, changes per repo         ◀ cache_control (breakpoint 2)
 system.state       thread/buffers/time — VOLATILE      (re-billed every call)
 messages[0..N-1]   append-only history                 ◀ cache_control (breakpoint 3)
 messages[N]        the new turn
```
```js
// layout.js — named sections → Anthropic system blocks with breakpoints (viva: translate.buildParams from cache.marks)
export const lower = ({ sections, marks, tools, messages }) => ({
  system: Object.entries(sections).map(([key, text]) => ({ type: "text", text, ...(marks.includes(key) && { cache_control: { type: "ephemeral" } }) })),
  tools: tools.map((tool, index) => index === tools.length - 1 && marks.includes("tools") ? { ...tool, cache_control: { type: "ephemeral" } } : tool),
  messages: messages.map((message, index) => index === messages.length - 2 && marks.includes("history")
    ? { ...message, content: [].concat(message.content).map((block, i, all) => i === all.length - 1
        ? { ...(typeof block === "string" ? { type: "text", text: block } : block), cache_control: { type: "ephemeral" } } : block) }
    : message),
});
// mask.js — the catalog stays byte-stable; the gate refuses at dispatch (Manus: MASK, don't remove)
const ALLOWED = { plan: new Set(["read", "grep"]), build: new Set(["read", "grep", "edit", "bash"]) };
export const gate = (phase) => (call) => ALLOWED[phase].has(call.name) ? null : `tool '${call.name}' is unavailable in ${phase} phase — available: ${[...ALLOWED[phase]].join(", ")}`;
```
```
✗ timestamp at the TOP of system          → every call a full miss       (R #8 — the midnight flush)
✗ removing a tool mid-session             → tools block changes → miss  (S22)
✗ session idle > TTL (5 min / 1 h)        → full miss on resume         (HN #20)
✗ subagent with a different system prompt → its own cold prefix         (HN #5: "Every subagent send the same ~30k system prompts")
✗ attribution header varying per call     → CLAUDE_CODE_ATTRIBUTION_HEADER=0 or prefix caching breaks  (R #3)
```

#### 9.5.4 progressive disclosure — skills vs the index

```markdown
---
name: blast-bracket
description: >-
  Bracket a risky edit to load-bearing code — blast · test · change · test · blast. Use for any symbol with two or more consumers.
---
# (level 2 — loaded only when invoked) … see methods/blast.md (level 3 — read on demand)
```
Three levels, metadata → SKILL.md → bundled files (S8); *"a few dozen extra tokens"* each (S25). Counter-evidence: the always-loaded index beat skills (HN #7), and ikiro lost 7 of 9 skills' triggers to a YAML error for months. The hybrid: an AGENTS.md of ~100 lines that is a table of contents and says *before you touch X, read Y*.
```js
// deferred.js — names in context, schemas behind a search tool (S7: Opus 4 49 → 74%)
export const catalog = (all) => [{ name: "tool_search", description: `Load full definitions for tools by name or keyword. Available: ${all.map((tool) => tool.name).join(", ")}`,
  input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } }];
```
viva's version: pt10's `[Guide]` section is titles only; `guide_read` is the level-2 page (§8.1).

#### 9.5.5 context budget — elide, then summarize, or reset

```js
// elide.js — rule-based, deterministic, first
export const elide = (messages, { keepLast = 6, maxResult = 400 } = {}) =>
  messages.map((message, index) => {
    if (index >= messages.length - keepLast || message.role !== "user" || !Array.isArray(message.content)) return message;
    return { ...message, content: message.content.map((block) =>
      block.type === "tool_result" && String(block.content).length > maxResult
        ? { ...block, content: String(block.content).slice(0, maxResult) + `\n[elided ${String(block.content).length - maxResult} bytes of an old result — re-run the tool if needed]` }
        : block) };
  });
// reset.js — the harness decides, not the model (context anxiety: models wrap up early near their believed limit, S1)
if (usage.input_tokens / window > 0.55) {
  await run("Write progress.json per the schema. Do not continue the task.", { messages });
  messages = [{ role: "user", content: `Resume. Read progress.json first.\n\n${task}` }];
}
```
```json
// progress.json — written before reset, read by the fresh context (S3: "a structured JSON file with a list of end-to-end feature descriptions")
{ "goal": "port auth to sessions",
  "features": [ { "id": "F1", "desc": "login issues session cookie", "passes": true, "commit": "a1b2c3" },
                { "id": "F2", "desc": "logout revokes session", "passes": false, "blocker": "revoke() not exported from store.js" } ],
  "next": "export revoke from src/session/store.js, then run test/logout.test.js",
  "never": ["edit migrations/", "run the full suite"] }
```
HumanLayer keeps utilization at 40–60% (HN #18); others checkpoint at 25–30% into PROGRESS.md; context management helps most at tight budgets (35.7 pts at 32k vs 2.7 at 128k, HN #4). viva: nothing does this yet (§11.1 A2); `buffer.data` is the natural `progress.json`.

#### 9.5.6 subagents — context firewall, single writer

```js
export const research = {
  definition: { name: "research", description: "Delegate a read-only investigation to a fresh context. It can read/grep/run tests, never edit. Returns ≤1500 tokens: findings with file:line. Example: { \"question\": \"who calls revoke()?\" }",
    input_schema: { type: "object", properties: { question: { type: "string" } }, required: ["question"] } },
  execute: async ({ question }) => {
    const { messages } = await run(`${question}\n\nAnswer in ≤1500 tokens, cite file:line. You cannot edit.`, { tools: readOnly, rounds: 15 });
    return messages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
  },
};
```
viva: hello-world's `research` IS this — `investigate` calls `ctx.mode.harness.dialogue.stream({ thread, parts, system: { brief: BRIEF }, config: { rounds: ROUNDS }, controller: ctx.controller?.branch("dialogue") })` and folds the stream to `{ condition, message, buffer }` for the outer model. Its defects: G5 (persists into the outer thread), G7 (its rounds lose to the thread).

#### 9.5.7 verification — backpressure is the biggest lever

```js
export const verified = (run) => async (prompt, options) => {
  let result = await run(prompt, options);
  for (let attempt = 0; attempt < 3 && result.state === "complete"; attempt++) {
    const check = await sh("deno check src/ && deno test -A test/ 2>&1 | grep -E 'FAILED|error' | head -30");   // errors only, never success output
    if (!check.trim()) return result;
    result = await run(`Checks fail — fix before finishing:\n${check}`, { ...options, messages: result.messages });
  }
  return result;
};
```
*"it's important that the task verifier is nearly perfect"* (S10); the evaluator is a separate agent because self-evaluation is biased (S1); the orchestrator reviewing its workers is *"grading its own homework"* (R #13). viva: the verifier lives on the harness's `/object` branch (§8.2).

#### 9.5.8 permission — a gate at dispatch, a sandbox under it

```js
export const guard = (classify) => async (call, transcript) => {
  if (READ_ONLY.has(call.name)) return "allow";
  const actions = transcript.filter((block) => block.type === "tool_use");   // what it DID, not what it SAID (S15)
  return classify({ intent: transcript[0], actions, next: call });           // → "allow" | "ask" | "deny"
};
```
```
prompt       stops nothing
classifier   ~83% of overeager actions caught; 17% FN (n=52); users approve 93% of prompts anyway   S15
sandbox      fs + net isolation, bubblewrap/seatbelt; microVM per session (HN #19)                 S14
```
viva: `fs_*` and `shell_run` are armed everywhere; the persona is the only gate (G10, G14).

#### 9.5.9 the outer loop

```sh
while :; do
  cat PROMPT.md | claude -p --output-format stream-json >> ralph.log
  deno test -A 2>&1 | tail -5 >> ralph.log
  git add -A && git commit -qm "ralph: $(date +%s)" || true
done
```
```markdown
<!-- PROMPT.md --> Read specs/*.md and progress.json. Pick the ONE highest-priority failing feature. Implement it. Run its test. Update progress.json. Stop.
```
*"Validation criteria per task have to be agreed upon before the loop even begins"* (R #20). Parallel writers work with a test oracle and file-lock claims in `current_tasks/` (S10).

#### 9.5.10 evaluating a harness

```js
const trials = await Promise.all(tasks.flatMap((task) => Array.from({ length: k }, () => attempt(task))));
const byTask = Object.groupBy(trials, (trial) => trial.task);
const passAtK  = mean(Object.values(byTask).map((runs) => runs.some((run) => run.passed)));
const passHatK = mean(Object.values(byTask).map((runs) => runs.every((run) => run.passed)));
```
```
grade the artifact, not the path · 20–50 real tasks · READ the transcripts · pin infra or a 6-pt gap is noise · <3-pt deltas are not results   S12 · S11
error analysis over traces comes first                                                                                                     S41
```
viva: the capture snapshot of prompt + armory (vdex, hello-world) is the cheapest eval.

---

## 10. scorecard and gaps

### 10.1 upgrading a registry harness — score yourself

```
                                  pt10 edA edG plG play coach anal fran apre harv prim cal mail vdex off  hello
defaults via shard.hal.defaults    ✗    ✗   ✗   ✗   ✓    ✓     ✓    ~    ✗    ~    ✗    ✗   ✗    ✗    ✗    ✓
index in context, pages by tool    ✗    ✗   ✗   ✗   -    -     -    -    -    -    -    ✗   ✗    ✗    -    -
volatile section last, own key     ✗    ✗   ✗   ✗   -    -     -    -    -    -    -    ✗   ✗    ✗    -    ?
avenue sections on a branch        ✗    ✗   ✗   ✗   -    ✗     -    ✓    ✗    ✗    ✗    ✗   ✗    ✗    ✗    ✓
threadOf(ctx) not ctx.input.thread ✗    ✓   ✓   ✓   -    -     -    ✗    -    -    -    ✗   ✗    ✗    -    -
prose names = armed names (test)   -    ✗   ✗   ✗   -    ✗     -    ✗    ✗    ✗    -    ✗   ✗    ✗    -    ✓
every prohibition has a code twin  ~    ✓   ✓   ~   ✓    ~     ~    ~    ✗    ~    ~    ~   ✓    ~    -    ✗
valences say WHEN + Example:       ~    ✓   ✓   ✓   -    ✓     -    ~    ✗    ~    -    ✗   ~    ~    -    ✓
rows at top level (lexicon form)   ✓    ✗   ✗   ✗   -    ✓     -    ✗    ✓    ✓    -    ✓   ✓    ✓    -    ✓
verification in code, not prompt   -    -   -   -   ✗    ✗     -    -    -    -    -    -   ✓    -    -    ✗
unbounded dumps per turn           ✗    ✗   ✗   -   -    -     -    -    -    -    -    ✗   ✗    ✗    -    -
✗ fails · ✓ holds · ~ partly · - n/a · ? not checked
```

The checklist behind it, for a new harness:
```
[ ] defaults through shard.hal.defaults; rounds = the prose budget
[ ] ROLE answers (a)–(f); identity interpolated from data
[ ] stable sections first, each its own key; the screen line last, own key; the house sentence
[ ] index in context, pages behind a tool; nothing unbounded per turn
[ ] avenue-only sections on harness.branch
[ ] every tool: WHEN + cost + what the human sees + Example:; descs tie back to their section
[ ] every limit in the schema; every prohibition with a code twin or an absent tool
[ ] returns { message, <entity>: [rows] } top level; errors name the next move
[ ] threadOf(ctx) everywhere; one reader of "the screen" shared by harness and tools
[ ] a line on what fs_* / shell_run / buffer_update are NOT for
[ ] tests: scripted rig · S0 names · capture snapshot of prompt + armory
[ ] if a rule is checkable, a verifier on /object, never a caller retry
```

### 10.2 gaps in viva — each a proposal; code only with `go`

```
G1  cache mark on the last mode key (harnessed.js:150) — unconditional on threaded calls; a volatile last section carries the breakpoint
    shape    policy.cache ??= … (a mode that declares marks keeps them), or mark the last STABLE key the mode names

G2  LANDED 09-23 — dispatch speaks the fault as a string message; the tool_result part carries `condition`; Anthropic sets is_error,
    OpenRouter prefixes `error: `; fromm.yield and anima read the condition, never sniff message.error (§2.4)
    G2b ValidationError text is bare ("Validation failed: must be <= 3") — add the tool, the field and the schema line   OPEN

G3  no message-level cache breakpoint in either provider; OpenRouter honours only "context"
    shape    translate: cache_control on the last block of messages[N-2] when marks include "history"; OpenRouter honours named keys + "tools"

G4  recording has no finally — a client return() drops the forked rows, the user row stays
    shape    finally { if (!thrown) await em.flush(); else em.clear(); } — or flush per sealed turn

G5  a nested dialogue.stream with `thread` persists into the OUTER thread (research.js) and may interleave rows
    shape    a nested call runs on a child thread (Thread.parent exists), or passes no thread and carries turns

G6  the dock's stop signals every live activity on the thread
    shape    owed(armed, activities.filter((row) => row.turn === id), …)

G7  INTELLIGENT.rounds overrides input.config.rounds (harnessed.js:45-49) · known-issue intelligent-rounds-overrides-call-config
    shape    { ...intelligent, ...config, ...(tune && { tune }) } — the call above the thread

G8  thread_update writes trait, never claims traits → the model can never switch INTELLIGENT/VOCAL on; ThreadTraitsEnum lacks both;
    VOCAL has no anima widget; INTELLIGENT.thinking is display-only
    shape    thread_update claims on write (as Intelligent.svelte:66); add both to the enum; a Vocal widget

G9  no compaction: turn.fold has zero callers; history unbounded; faculty.context never checked
    shape    §11.1 A2 — elide by rule, then fold the oldest tract via turn.fold, keep the tail live

G10 every harness armed with fs_write / fs_delete / shell_run / buffer_update; personas never mention them
    shape    arming narrowed by a manifest claim, or one standing ROLE line                                    (§11.1 A6)

G11 rows nested under `entities:` (assembly, education, francesca) skip the spoken card and anima's toolBuffers
    shape    the lexicon form enforced by a test or by fromm.yield

G12 aprende /assistant/message reads render.object → throws every call · known-issue aprende-message-reads-render-object
    shape    render.output.object

G13 ctx.thread is a row in the harness, an id in tools; calendar/email read ctx.input.thread (undeclared)
    shape    bind the same thing on both sides; until then threadOf(ctx)

G14 validation is the only input gate; no dispatch-time permission
    shape    a guard middleware on `armed`, judging actions not words                                         (§11.1 A7)

G15 no domain barrel exports harness though HARNESSED slurps daemon.domain.harness; assembly's three modes each copy the ontology/screen
    shape    the domain's [Ontology] on the domain barrel; modes keep ROLE and screen                          (§11.1 A4)
```

Standing ruled and open known-issues this touches: `harness-does-not-require-thread-in-its-input` (*"harness always has thread in input. else throws"* — not implemented), `thread bricked by abort-mid-tool-stream` (line refs stale), `tool DoS by input.tools nature-collision` (`tools: { entity_find: … }` breaks that skill daemon-wide).

---

## 11. avenues for expansion

Each avenue: what it unlocks · the shape in code · what to measure. Everything under `systems/`, `subsystems/`, `commons/` and the registry is a PROPOSAL until beef's `go`.

### 11.1 in viva — build next, in this order

**A1 · deliver tool errors (G2)** — LANDED 09-23, see §2.4. Left of it: G2b, a ValidationError that names its tool, field and schema line.

**A2 · `shard.hal.compactor` (G9).** Unlocks long threads without the provider's 400. Elide by rule first, fold by model only if still over:
```js
// PROPOSAL — subsystems/typology/gestalten/shard/hal.js; registered by the mode on harness.branch("/dialogue") (turns are loaded there)
export const compactor = ({ keep = 8, budget = 60_000, elide = 400 } = {}) => async (ctx, next) => {
  const turns = ctx.hallucination.turns;
  for (const turn of turns.slice(0, -keep))                                            // 1. rule-based elision; every decision stays
    for (const part of turn.parts ?? [])
      if (part.type === "tool_result" && JSON.stringify(part.output).length > elide)
        part.output = { message: `[elided ${JSON.stringify(part.output).length} bytes — re-run the tool if needed]` };
  if (JSON.stringify(turns).length > budget) {                                         // 2. only if still over: fold the oldest tract
    const tract = turns.slice(0, -keep);
    const anchor = await ctx.daemon.entities.turn.fold(tract, async (tract) => {
      const folded = await ctx.daemon.cortex.hallucinate.object.render({
        controller: ctx.controller.branch("compact"),
        system: { compact: "Fold the conversation above into a state record: goals, decisions, open threads, ids in play." },
        turns: [...tract, { role: "user", parts: [{ type: "text", text: "Write the state record." }] }],
        output: { schema: STATE }, policy: { tune: "fast", rounds: 1 },
      });
      return { role: "assistant", parts: [{ type: "text", text: `[state]\n${JSON.stringify(folded.output.object)}` }] };
    });
    ctx.hallucination.turns = [anchor, ...turns.slice(-keep)];
  }
  await next();
};
```
Needs first: re-parent the tail's first surviving turn to the anchor (fold's comment says the caller's job); keep the live user turn chained by `chaining` in the tail; decide whether elision mutates the persisted parts (it does above — rows are managed entities) or a copy. Measure: bytes/turn before and after on a 40-turn hello-world thread; `usage` from `/turn/close`.

**A3 · `shard.hal.verify` — the seat pattern, general.**
```js
// PROPOSAL — subsystems/typology/gestalten/shard/hal.js
export const verify = ({ judge, amend, attempts = 2, name = "verify" }) => async (ctx, next) => {
  await next();
  const faults = [];
  for (let fault = await judge(ctx.output, ctx); fault; fault = await judge(ctx.output, ctx)) {
    faults.push(fault);
    if (faults.length > attempts) throw new Error(`[${name}] still failing after ${faults.length} answers: ${faults.join(" · ")}`);
    ctx.output = await ctx.daemon.cortex.hallucinate.object.render({
      ...ctx.hallucination,
      controller: ctx.hallucination.controller.branch(`${name}-${faults.length}`),
      turns: amend(ctx.hallucination.turns, faults, ctx),
    });
  }
};
// the seat becomes
harness.branch("/object").use(shard.hal.verify({
  name: "seat",
  judge: (folded, ctx) => ctx.input.legal && !ctx.input.legal.includes(uciOf(folded)) && (uciOf(folded) || "(empty)"),
  amend: (turns, tried, ctx) => amended(turns, tried, ctx.input.legal),
}));
```
Candidates: primer (exactly one correct answer), dealer (faces in the deck), francesca's reviewer (slugs that exist — judge by `literal.findByIdentifiers`), analysis (the named line is in the engine's lines). Open: exercise the repair on the real Anthropic path (the `respond`-tool reasoning in §3 step 6 is inferred).

**A4 · a domain harness (G15).** HARNESSED already slurps `daemon.domain.harness` before the mode's. The assembly domain could own `[Ontology]` once:
```js
// PROPOSAL — ~/.viva/registry/assembly/domain/assembly/harness.js, exported from the domain barrel
export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.system.ontology = `[Ontology]\n${ontology(ctx.daemon.domain.schematics)}`;   // stable, domain-wide, first
  await next();
});
```
Modes keep ROLE and screen; the cache prefix then shares the ontology across the three modes. Mind law 3 — the domain key comes first, so it never carries the mark.

**A5 · cache marks a mode can own (G1, G3).**
```diff
// systems/runtime/daemon/traits/harnessed.js:152
-    ctx.hallucination.policy.cache = { marks: [...Object.keys(ctx.hallucination.system).slice(-1), "tools"] };
+    ctx.hallucination.policy.cache ??= { marks: [...Object.keys(ctx.hallucination.system).slice(-1), "tools", "history"] };
```
+ Anthropic translate marks the last block of `messages.at(-2)` on `"history"`; OpenRouter honours named keys and `"tools"`. A mode with a volatile screen then declares `shard.hal.defaults({ policy: { cache: { marks: ["guide", "tools", "history"] } } })`. Measure: `cache_read_input_tokens` / `cache_creation_input_tokens` in `/turn/close` usage across 10 turns, before and after.

**A6 · a narrowed armory (G10).** A manifest claim that drops the machine tools from a mode's arming:
```js
// PROPOSAL — systems/runtime/daemon/traits/harnessed.js arming
const machine = !ctx.mode.manifest.sandboxed;                    // name to be ruled — a trait is a STATE (e.g. CONFINED), never a capability
if (machine) armed.slurp(paladin.skills.fs.fs).slurp(paladin.skills.shell.shell);
```
Unlocks honest read-only personas (player/guide, calendar) and a smaller prefix. Measure: armory token count per mode (the §9.4 Systima method) before/after.

**A7 · a dispatch guard (G14).** Root uses on `armed` run before every tool leaf (the context binds prove it), so a mode-supplied guard fits there:
```js
// PROPOSAL — arming: if (ctx.mode.module.guard) armed.use(ctx.mode.module.guard)
export const guard = async (ctx, next) => {
  if (WRITES.has(nameOf(ctx)) && !ctx.input.confirmed) throw new Error(`${nameOf(ctx)} writes — say what it will change and ask the operator first`);
  await next();
};
```
Unverified: which ctx field carries the called nature inside an armed middleware (`nameOf`). Pairs with A1 — a refusal only steers once errors are delivered.

**A8 · nested calls on a child thread (G5, G7).**
```js
// PROPOSAL — commons/instances/hello-world/tools/research.js
const child = await ctx.daemon.entities.thread.create({ user: ctx.user, mode: ctx.mode.entity.id, parent: threadOf(ctx),
  traits: ["LABELED"], trait: { LABELED: { name: `research · ${ctx.input.brief.slice(0, 40)}` } } });
await ctx.daemon.entities.em.flush();
return ctx.mode.harness.dialogue.stream({ thread: child.id, parts, system: { brief: BRIEF }, config: { rounds: ROUNDS }, controller: ctx.controller?.branch("dialogue") });
```
The researcher's turns stop interleaving with the outer thread; its rounds still lose to the CHILD's INTELLIGENT (none) — G7 fixed by construction here, still open in general. `Thread.parent` cascades on delete.

**A9 · S0 as a shared helper.** Every harness gets the prose-names test for one line:
```js
// PROPOSAL — systems/runtime/tests/scenarios/armed.js (reached through accio, never a relative path)
export const unarmed = (prose, armory) =>
  [...new Set(prose.match(/\b[a-z][a-z0-9]*(?:[-_][a-z0-9]+)+\b/g) ?? [])].filter((name) => name.includes("_") && !armory.includes(name));
// in a mode's test
specimen.expect(unarmed(ROLE, seen[0].tools)).toEqual([]);
```
Catches francesca's `pull`-style drift only when the name is snake-shaped; a bare verb ("Pull first") still needs a hand list. Measure: run it over the 19 harnesses — the §4.1(f) findings are the expected hits.

**A10 · capture snapshots as the eval floor.** Per mode: `tests/snapshots/<mode>-hallucination.snapshot.json` holding `{ system, tools, cache, settings }` of a fixed scenario (vdex's shape), `SNAPSHOT_HOT=1` regenerates. Then a live tier: 20–50 real operator asks per mode, pass^k, transcripts read (S12). Measure first: which of the 19 have a snapshot today (vdex, hello-world).

**A11 · handoff over reset.** For long agentic modes, the harness writes the state to `buffer.data` (the screen already IS persisted state the client renders) and a fresh thread resumes from it — the §9.5.5 `progress.json` with the buffer as the file. Pairs with A2 as the "reset" branch of reset-vs-compact.

**A12 · the settings surface (G8).** `thread_update` claims on write; `INTELLIGENT` and `VOCAL` join `ThreadTraitsEnum` (add, never remove — hydrate validates the enum); a Vocal widget beside Intelligent.svelte; `INTELLIGENT.thinking` either wired to `effort` or documented as display-only. An intent could seed INTELLIGENT for a mode's threads (`Thread.beforeCreate` already copies intent traits).

**A13 · model-harness fit.** The harness runs before the faculty is resolved, so it cannot name tools per model family (§9.2 #3). Avenue: resolve the faculty in `requesting` and expose `ctx.faculty` so a mode can pick `Edit`-shaped vs `apply_patch`-shaped tools, or let `translate.buildParams` rename per provider. Research first: does any viva tool shape collide with a trained shape badly enough to matter.

**A14 · an outer loop over a daemon.** The Ralph shape against a mode: a script that POSTs `…/mode/<type>/<slug>/harness/dialogue/stream` with a fixed PROMPT, runs the mode's own tests, and appends to a log — the loop outside the agent loop (S26). Needs: the auth route for a non-browser caller (unverified), and a mode whose work has a verifier.

**A15 · land the two examples.** pt10 into `~/.viva/registry/droneaid/modes/assembly/pt10/` and the seat verifier into `chess/modes/board/play/` (then `seats.js` drops its retry loop). Verbs in §3 step 9.

### 11.2 in this reference — research not yet done

```
live cache hit rate per harnessed mode                usage.cache_read_input_tokens over a 10-turn thread (before A5)
armory token cost per mode                            count the lowered catalog like Systima/R #1 (hello-world, vdex, francesca)
the seat repair on the Anthropic path                 the respond-tool + tool_choice inference in §3 step 6 is unexercised
the rewrite of the other 17 harnesses                 each against §10.1; francesca and aprende first (most drift)
mode.call.harness.* over the aperture                 probably exists WITHOUT the D merge — unconfirmed
the client HARNESSED merge                            no test covers it
OpenAI's harness-engineering + App Server pages       403 at fetch; quotes via a mirror (S17)
13 unread reddit threads                              titles in §12.3 — third-party harness bans and compaction complaints
Terminal-Bench leaderboard numbers marked unverified  §9.4 carries only verified ones
```

### 11.3 how to extend this file

```
a new harness in the registry     → a line in §4.4 · a column in §10.1 · its exemplars into §4.1 if it beats one
a gap found                       → G16… in §10.2 · a known-issue entry · an avenue in §11.1 if it has a shape
a law re-measured                 → edit §2.7 with the measured line and the command that measured it
an avenue landed                  → move it from §11.1 into the section it changes; delete the PROPOSAL tag
an outside source                 → an S/HN/R id in §12, cited where it lands
```

---

## 12. sources

### 12.1 inside — the files every section leans on

```
systems/runtime/daemon/traits/harnessed.js         the chain, arming, requesting, persisting, summarizing, HARNESSED
subsystems/typology/gestalten/belt/hallucinate.js  speak, deliver, dispatch, respond, render
subsystems/typology/gestalten/shard/hal.js         defaults, verbatim, voice
subsystems/typology/gestalten/shard/hallucinate.js lowering, derived marks, optioning + choosing (choice)
subsystems/typology/gestalten/belt/choice.js       pick · probability · expect · confidence — readings over a Verdict
commons/hallucinators/openrouter/provider/         buildChoiceParams · readChoice · the choosers table
subsystems/typology/prototypes/{cortex,controller,toolcall}.js
subsystems/typology/schematics/primitives/{hallucination,controller}.js · schematics/entities/thread.js · schematics/v.js
subsystems/typology/gestalten/belt/soma.js         pour, scan, transcript
systems/runtime/daemon/skills/{entity,buffer,thread,mode}.js
systems/runtime/daemon/entities/{base,kernel,userspace,transient}/*.ts
commons/hallucinators/{anthropic,openrouter}/provider/translate.js
systems/anima/src/typology/entities/mode/traits/harnessed.js · src/app/panels/a/widgets/{Dock.svelte,stop.svelte.js,turns.js} · panels/e/widgets/Intelligent.svelte
commons/instances/hello-world/{harness.js,mode.viva.js,tools/*} · commons/playground/{chaosmonkey,dealer}
~/.viva/registry/{droneaid,assembly,chess,education,young-ladys-primer,vcompany}/…   (§4.4)
.ikiro/quests/done/m29-agent-tools.org · m26-hallucinate-contract.org:791
```

### 12.2 outside — primary (S)

```
S1   Anthropic · Rajasekaran · Harness design for long-running application development (2026-03-24)  anthropic.com/engineering/harness-design-long-running-apps
S2   Anthropic · Scaling Managed Agents: decoupling the brain from the hands (2026-04-08)            anthropic.com/engineering/managed-agents
S3   Anthropic · Young · Effective harnesses for long-running agents (2025-11-26)                    anthropic.com/engineering/effective-harnesses-for-long-running-agents
S4   Anthropic · Effective context engineering for AI agents (2025-09-29)                            anthropic.com/engineering/effective-context-engineering-for-ai-agents
S5   Anthropic · Aizawa · Writing effective tools for agents (2025-09-11)                            anthropic.com/engineering/writing-tools-for-agents
S6   Anthropic · Code execution with MCP (2025-11-04)                                                anthropic.com/engineering/code-execution-with-mcp
S7   Anthropic · Wu · Introducing advanced tool use (2025-11-24)                                     anthropic.com/engineering/advanced-tool-use
S8   Anthropic · Equipping agents for the real world with Agent Skills (2025-10-16)                  anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
S9   Anthropic · How we built our multi-agent research system (2025-06-13)                          anthropic.com/engineering/multi-agent-research-system
S10  Anthropic · Carlini · Building a C compiler with a team of parallel Claudes (2026-02-05)        anthropic.com/engineering/building-c-compiler
S11  Anthropic · Segato · Quantifying infrastructure noise in agentic coding evals (2026-02-05)      anthropic.com/engineering/infrastructure-noise
S12  Anthropic · Demystifying evals for AI agents (2026-01-09)                                       anthropic.com/engineering/demystifying-evals-for-ai-agents
S14  Anthropic · Beyond permission prompts (sandboxing) (2025-10-20)                                 anthropic.com/engineering/claude-code-sandboxing
S15  Anthropic · Hughes · How we built Claude Code auto mode (2026-03-25)                            anthropic.com/engineering/claude-code-auto-mode
S16  Anthropic · April 23 postmortem (2026-04-23)                                                    anthropic.com/engineering/april-23-postmortem
S17  OpenAI · Lopopolo · Harness engineering: leveraging Codex in an agent-first world (2026-02-11)   openai.com/index/harness-engineering (403; mirror businessdatasolutions.github.io/ai-wiki)
S18  OpenAI · Codex Prompting Guide                                                                  developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
S19  Google · Lin · Architecting efficient context-aware multi-agent framework (ADK) (2025-12-04)   developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production
S20  Cognition · Yan · Don't Build Multi-Agents (2025-06-12)                                         cognition.com/blog/dont-build-multi-agents
S21  Cognition · Yan · Multi-Agents: What's Actually Working (2026-04-22)                            cognition.com/blog/multi-agents-working
S22  Manus · Ji · Context Engineering for AI Agents (2025-07-18)                                     manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
S23  Zechner · What I learned building an opinionated and minimal coding agent (2025-11-30)          mariozechner.at/posts/2025-11-30-pi-coding-agent
S24  Ronacher · Pi: The Minimal Agent Within OpenClaw (2026-01-31)                                   lucumr.pocoo.org/2026/1/31/pi
S25  Willison · Claude Skills are awesome (2025-10-16) · Designing agentic loops (2025-09-30)        simonwillison.net
S26  Ronacher · The Coming Loop (2026-06-23)                                                         lucumr.pocoo.org/2026/6/23/the-coming-loop
S27  Ronacher · Better models, worse tools (2026-07-04)                                              lucumr.pocoo.org/2026/7/4/better-models-worse-tools
S28  Huntley · Ralph Wiggum as a "software engineer" (2025-07-14)                                    ghuntley.com/ralph
S29  Ball · How to Build an Agent (2025-04-15)                                                       ampcode.com/how-to-build-an-agent
S30  HumanLayer · Writing a good CLAUDE.md (2025-11-25)                                              humanlayer.dev/blog/writing-a-good-claude-md
S31  HumanLayer · Skill Issue: Harness Engineering for Coding Agents (2026-03-12)                    humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents
S33  Vercel · Qu · We removed 80% of our agent's tools (2025-12-22)                                  vercel.com/blog/we-removed-80-percent-of-our-agents-tools
S34  LangChain · Trivedy · Improving Deep Agents with harness engineering (2026-02-17)               langchain.com/blog/improving-deep-agents-with-harness-engineering
S35  Cursor · Improving Cursor's agent for OpenAI Codex models (2025-12-04)                          cursor.com/blog/codex-model-harness
S36  Factory · Droid: #1 on Terminal-Bench (2025-09-25)                                              factory.com/news/terminal-bench
S37  Chroma · Context Rot (2025-07-14)                                                               trychroma.com/research/context-rot
S38  ETH Zurich · Evaluating AGENTS.md (2026-02)                                                     arxiv.org/abs/2602.11988
S39  METR · Measuring Time Horizon using Claude Code and Codex (2026-02-13)                          metr.org/notes/2026-02-13-measuring-time-horizon-using-claude-code-and-codex
S40  Terminal-Bench 2.1 notes                                                                        tbench.ai/news/terminal-bench-2-1
S41  Husain · Evals FAQ                                                                              hamel.dev/blog/posts/evals-faq
S42  Latent Space · Is Harness Engineering real? (2026-03-05)                                        latent.space/p/ainews-is-harness-engineering-real
S43  Bustamante · Model-harness fit (2026-05-03) — attributions unreliable                           nicolasbustamante.com/blog/model-harness-fit
```
Quotes came through a summarizer — near-verbatim; check the source before leaning on one.

### 12.3 outside — Hacker News (HN) and reddit (R)

```
HN #1   Improving 15 LLMs at Coding in One Afternoon. Only the Harness Changed (832)   news.ycombinator.com/item?id=46988596
HN #2   What Is a Harness? (Earendil) (589)                                             item?id=49409092
HN #3   HarnessTax: How Much Does the Harness Matter (231)                              item?id=49733726
HN #4   An empirical study of harness design for coding agents, arXiv 2609.20804 (225)  item?id=49753878
HN #5   Claude Code sends 33k tokens before reading the prompt; OpenCode sends 7k (706) item?id=48883275
HN #6   The new rules of context engineering for Claude 5 generation models (463)       item?id=49051361
HN #7   AGENTS.md outperforms skills in our agent evals (Vercel) (524)                  item?id=46809708
HN #8   Claude Skills are awesome, maybe a bigger deal than MCP (738)                   item?id=45619537
HN #9   SkillsBench (364)                                                               item?id=47040430
HN #10  MCP vs CLI — 47208398 · 47712718 · 49779329
HN #11  Pi, a minimal terminal coding harness (608) · Zechner's post (421)              item?id=47143754 · 46844822
HN #12  How to code Claude Code in 200 lines of code (816)                              item?id=46545620
HN #13  Unrolling the Codex agent loop (456)                                            item?id=46737630
HN #14  Codex starts encrypting sub-agent prompts (425)                                 item?id=48905028
HN #15  DeepSeek Harness developer preview (747)                                        item?id=49285244
HN #16  Harness engineering: Leveraging Codex (297)                                     item?id=48416264
HN #17  Harness engineering for self-improvement (Weng) (334)                           item?id=49164896
HN #18  Why Software Factories Fail (HumanLayer) (394) · 40–60% utilization (517)      item?id=49023019 · 45347532
HN #19  Breaking Claude Code Opus 5 Auto Mode (399) · Docker Sandboxes (694)            item?id=49506819 · 49239751
HN #20  Anthropic April 23 postmortem thread (942)                                      item?id=47878905

R #1    Harness showdown: Claude Code vs OpenCode vs Pi (307)                          reddit.com/r/LocalLLaMA/comments/1v7d8px
R #2    You guys gotta try OpenCode + OSS LLM (417)                                     r/LocalLLaMA 1ru6qml
R #3    OpenCode concerns (not truely local) (326)                                      r/LocalLLaMA 1rv690j
R #4    Qwen 3.8 27b – PI AGENT vs OPENCODE                                             r/LocalLLaMA 1vu0u2v
R #5    Recommend harness for local coding?                                             r/LocalLLaMA 1vov2an
R #6    Best harness for long autonomous tasks                                          r/LocalLLaMA 1vvsgsp
R #7    DeepSeek Harness is Insanely Good                                               r/LocalLLaMA 1vw10m3
R #8    OpenCode / Pi prompt-processing fix (the midnight cache flush) (123)            r/LocalLLaMA 1tjoiij
R #9    What skills are you using?                                                      r/ClaudeCode 1rp02ln
R #10   Whats even the point of Claude.md                                               r/ClaudeCode 1t3fvf9
R #11   Compaction is Hot Garbage                                                       r/ClaudeAI 1vefr07
R #12   When I have to compact a 2 day long 900k context session (994)                  r/ClaudeAI 1v9bq96
R #13   Claude subagent … prompt injected my main session (1277)                        r/ClaudeAI 1vu2umz
R #14   Why is Claude so mean to its subagents (2188)                                   r/ClaudeAI 1va9ozk
R #15   I ship AI agents in production. The mess is MCP.                                r/ClaudeAI 1tuqqpn
R #16   Anthropic removed claude code from its 20$ plan                                 r/codex 1ss3u36
R #17   GPT 5.6 beats Fable 5 in benchmarks, but …                                      r/codex 1v2lnse
R #18   Luna can now be used when spawning sub-agents                                   r/codex 1vp6v7g
R #19   dump the most POWERFUL tips                                                     r/codex 1un0ujl
R #20   Ralph Wiggum breakdown · honest review of Ralph                                 r/ClaudeAI 1qlqaub · r/ClaudeCode 1q2qvta
unread  r/codex 1vthm3m 1w2m3ba 1wdlp7q 1txhom4 1uvmngz · r/LocalLLaMA 1scvo88 1soerpk 1t5g1fi 1w53mwu 1w8f7bp · r/ClaudeAI 1sbtmru 1qa50sq · r/ClaudeCode 1wl4c13
```
reddit came through Wayback captures of old.reddit (the live site blocks the fetch tools); model names as posters wrote them.

### 12.4 former files → here

```
dossier.md §N        → the section of the same subject here (anatomy §2 · voice §4 · entities §5 · mechanisms §6 · client §7 · examples §8 · meta §9 · gaps §10)
primary.md           → §9 + S ids in §12.2
hackernews.md #N     → HN #N in §12.3 (same numbering)
reddit.md #N         → R #N in §12.3 (same numbering)
viva-census.md       → §4.4 + §10.1
wording.md           → §4
entities.md          → §5
mechanisms.md        → §2.5–2.6 + §6
client.md            → §7
```
