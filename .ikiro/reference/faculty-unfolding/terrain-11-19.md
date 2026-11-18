<!-- writer: agent · limit: 28000 chars · read-only terrain, 11-19 -->

# faculty unfolding — terrain 11-19

Read on 11-19; nothing run.

## 1 · the faculty chain

**Stage 0, the ledger.** `~/.viva/ledger.viva.json` holds top-level `hallucinators` (anthropic · openrouter · elevenlabs: dialogue ×6, choice, picture ×3, speech ×2, verbatim) and `tiers` (5). `instances/localhost/instance.viva.jsonc` declares three daemons (chess · droneaid · spanish); none carries `hallucinators`.

**Stage 1, runtime.** A fresh Cortex, filled from the INSTANCE's list:

```js
// systems/runtime/subjects/runtime/lifecycle/1-population.js:85
  die.runtime.cortex = new Cortex(die.runtime.instance.tiers);
// :87
    (die.runtime.instance.hallucinators ?? []).map((query) => paladin.ledger.registry.accio(query)),
// :92
      die.runtime.cortex.register(
```

The ledger list IS the runtime's set; it has none "of its own".

**Stage 2, daemon.** Its mask's `hallucinators` (`subsystems/paladin/prototypes/registry.js:288`) are provided, then `split`:

```js
// systems/runtime/subjects/daemon/lifecycle/1-population.js:72
  die.daemon.cortex = die.runtime.cortex.split(faculties);
// subsystems/typology/prototypes/cortex.js:91
  split(supplied) {
    const cortex = new Cortex(this.tiers);
    for (const [type, held] of this.faculties) cortex.faculties.set(type, [...held]);
    return cortex.register(supplied);
  }
```

A COPY (new arrays, same faculty objects); additions never reach the runtime. `register` appends (`cortex.js:85-86`), no dedup by id. Tiers stay the runtime's.

**Stage 3, mode.** No hallucinator slot on a mode. The mode die is a lift of its host:

```js
// systems/runtime/subjects/mode/factory.js:7
      ...shard.context.lift(contexts.modeDie, context),
// subsystems/typology/gestalten/shard/context.js:24
export const lift = (set, source) => Object.fromEntries(Object.keys(set).map((word) => [word, source[word]]));
```

`contexts.modeDie` carries `...cortex` (`schematics/primitives/contexts.js:97`), so a daemon mode holds the SAME object as `die.daemon.cortex`; a runtime mode (e.g. `@commons/harness/runtime`) holds `die.runtime.cortex`.

**Verdict on "runtime merges its own, daemon merges its own, mode gets the union": PARTLY TRUE.** Runtime = the ledger's list (not "its own plus the ledger's"); daemon = copy of runtime ∪ its mask's list (TRUE); mode = its host's cortex by reference, no own addition (no merge stage at mode). Live data: no daemon declares hallucinators, so every daemon cortex today equals the runtime's content.

**Lookups.** `find` filters by type · via · provider · id (`cortex.js:97-108`); `findOne` → `nearest` by tune, else exactly one, else a derivation (`:110-116`). With no native `call`, `:146-151` derives one: `ear && mind && mouth ? cascade(ear, mind, mouth) : undefined` (verbatim · dialogue · speech, each `via: "stream"`).

## 2 · `/metadata/cortex` and capability reads

Served by runtime and daemon through one shard; a MODE serves none (it has `/metadata/status` · `/manifest`, `subjects/mode/lifecycle/1-population.js:29-30`, plus trait-gated `/metadata/harness` · `repl` · `aperture` · `emitter`).

```js
// systems/runtime/gestalten/shard/host.js:20
  root.open("/cortex", () => (context.cortex ? faculties.strip(context.cortex) : []));
  root.open("/tiers", () => (context.cortex ? context.cortex.tiers : {}));
```

Called from `runtime/lifecycle/3-integration.js:115-117` and `daemon/lifecycle/3-integration.js:26-29`. `host.cortex` (`host.js:35-41`) opens `/cortex/<type>/render|stream` for all six types regardless of what is held. `strip` (`typology/gestalten/belt/cortex.js:1-13`): type · id · tune · context · channels · provider · config · `via` keys.

Consumers: ghost rebuilds a client Cortex per runtime and per daemon from `/metadata/tiers` + `/metadata/cortex` (`systems/ghost/gestalten/shard/host.js:39-40`); anima reads it (`systems/anima/src/surfaces/chrome/panels/sidebar/sections.js:95-108`).

Every position that branches on held faculties today:

- `systems/runtime/subjects/mode/traits/harnessed.js:287` `const streams = (type) => modeDie.cortex.find({ type, via: "stream" }).length > 0;` — `:289` grafts `/verbatim` iff a verbatim streams; `:297` grafts `/call` iff `streams("call") || (streams("verbatim") && streams("dialogue") && streams("speech"))`. Decided once at trait staging, per mode. `:275` throws without a cortex.
- ghost reads the served harness tree, not the cortex: `systems/ghost/entities/mode/traits/harnessed.js:37` `if (mode.harness.verbatim) mode.repl.graft(dictate, polish);` · `:38` `if (mode.harness.call) mode.repl.graft(call);`.
- anima `sections.js:532` `heard` = the repl resolves `/dictate` · `/call`; `:537` `EARLESS` when none.
- `cortex.js:137-151` DERIVATIONS; ghost `commands/content/harness.js:49` lists dialogue models.

## 3 · mode traits today

`subjects/mode/lifecycle/2-resolution.js:23` `stagger(modeDie.mode, modeDie, modeDie.traits)` runs `traits[name]?.(module, context)` per `manifest.traits` (`typology/gestalten/belt/traits.js:9-10`). The catalog, one barrel (`subjects/mode/traits/index.js`), is handed by the host: runtime `const { DATASET, DATASINK, ...admitted } = traits;` (`runtime/lifecycle/1-population.js:113`), daemon `die.traits = traits;` (`daemon/…/1-population.js:10`). Unknown names warn (`2-resolution.js:25-31`).

- `HARNESSED` (`harnessed.js:274-369`): the `/harness` Vector — `/dialogue` · `/object` · `/choice` · `/picture` · `/tool/*` · `/primer/*`, faculty-gated `/verbatim` · `/call`, `domain.harness` (`:313`), `module.harness` (`:314`), `/metadata/harness`.
- `CONVERSATIONAL`: no-op, CONFIRMED.

```js
// systems/runtime/subjects/mode/traits/conversational.js:1
export const CONVERSATIONAL = () => {};
```

- `TOOLING` (`tooling.js:1-4`): `mode.tools.graft(mode.module.tools)`.
- `PRIMER` (`primer.js:3-6`): `mode.primer = new Vector().graft(mode.module.primer)`, throws if absent.

**Inference: none.** `subsystems/paladin/prototypes/integrity.js` has `TRAITS` (`:6-24`, trait → export it travels with; `HARNESSED` · `CONVERSATIONAL` · `GENERATIVE` → `null`, `PRIMER` absent) and `RULES` (`:35-42`, faults when a declared trait lacks its export). NO `IMPLIED` exists in the file; `.ikiro/world/codemap/runtime.md:75` quotes it as present: FALSE (`done/mode-consume.md:127`: "UNLANDED"; the sketch maps a module TYPE to `PROVIDER`, not faculties to traits).

**Travel downward: none.** A mode's traits are its own `manifest.traits` only; the ledger's `runtime.traits` is `[]`, unread for modes; a host hands down the trait CATALOG (`die.traits`), not membership.

## 4 · thread traits HARNESSED · CONVERSATIONAL

Schema, whole:

```js
// subsystems/typology/schematics/traits/conversational.js:4
export const Conversational = v.object({
  language: v.array(v.string()).default([]),
  hear: v.object({ ...Selector }).default({}),
  speak: v.object({ ...Selector }).default({}),
  call: v.object({ ...Selector }).default({}),
  harmonize: v
    .object({
      window: v.integer({ minimum: 1 }).optional(),
      tolerance: v.number({ minimum: 0, maximum: 1 }).optional(),
      tail: v.integer({ minimum: 1 }).optional(),
    })
    .optional(),
  polish: v
    .object({
      ...Selector,
      engaged: v.boolean().default(true).optional(),
    })
    .default({})
    .desc('The model that repairs a dictation, and whether it runs. …'),
});
```

Sibling `schematics/traits/harnessed.js:4-14`: `Selector` + `tier` (default `"capable"`) · `effort` (`"low"`) · `rounds` (12) · `thinking` · `slugging` (`deep|nested`). Retired names heal: `{ retired: { INTELLIGENT: "HARNESSED", VOCAL: "CONVERSATIONAL" } }` (`schematics/traits/index.js:67`).

Hooks (`subsystems/typology/entities/Thread.ts`): `onLoad` repairs a stored CONVERSATIONAL (`:70-73`) and casts (`:76`); `beforeCreate` copies an intent's traits (`:80-90`, `thread.traits = [...intent.traits];` `:88`), then — on EVERY new thread, unconditionally:

```ts
// subsystems/typology/entities/Thread.ts:94
        Object.assign(args.entity, belt.traits.patch(args.entity, { HARNESSED: {}, CONVERSATIONAL: {} }));
```

(The patch is `:94`, not `:93`.) Neither the MODE's traits nor the cortex is read here.

Readers:

- `systems/runtime/subjects/mode/traits/harnessed.js:29-30` — `ctx.harnessed` / `ctx.conversational`, `null` when unworn.
- `typology/gestalten/shard/hal.js:53` `ctx.conversational.polish` · `:74-77` · `:89` · `:97-104`; no null arm (a thread without it would throw: unproven by run).
- anima `sections.js:540` · `:548` · `:563`; ghost `commands/content/polish.js:15-18` (writes it) · `modeline/popover.jsx:96`.

Mode declarations (no `bak/`):

| | CONVERSATIONAL + HARNESSED | HARNESSED without CONVERSATIONAL |
|---|---|---|
| commons | editors/darkroom · fixtures/memo · instances/hello-world · playground/dealer · chaosmonkey/oracle | harnesses/runtime · reader/reader · chaosmonkey/reader |
| registry | assembly guide/editor · guide/player · model/editor; education aprende · harvest · comando · cocina · francesca; chess board/play · coach/practice | young-ladys-primer home/primer; education dojo · wakaru; vcompany calendar · chat · email · vdex · cto · cfo · ceo; chess study/analysis · coach/coach |

m125 ruled 11-19 (`.ikiro/quests/m125-francesca-call.org:34`): /"Yes, we add the conversational trait if the mode is conversational."/ — unlanded.

## 5 · primers and tools per level

**Runtime.** No runtime-level primer or tools object. `commons/harnesses/runtime/runtime-harness.viva.js` is a MODE (`type: "harness"`, `HARNESSED · TOOLING · PRIMER`, `:5-12`) at `/runtime/runtime/mode/harness/runtime`: `primer` identity · world · runtime · daemons · modes · threads + entities (`:26-80`); `tools` fs · shell + entity · buffer · thread · mode (`:82-89`).

**Daemon/domain.** The domain = the daemon's `type: "domain"` mode (`registry.js:291`), cast by `kernel.Domain` (`schematics/primitives/kernel.js:7-15`, open, no primer/tools/harness keys). Read at `harnessed.js:47` (primer) · `:81` (tools) · `:313` (harness). Education and chess domains export `tools` only; zero domains export `primer` or `harness`. `systems/runtime/gestalten/{primer,tools}/` are libraries; three tools always armed (`:83`).

**Mode.** `module.primer` → `mode.primer` (PRIMER), `module.tools` → `mode.tools` (TOOLING), `module.harness` grafted into `/harness` (`harnessed.js:314`).

**Composition of one request.** `priming` (`harnessed.js:44-50`) grafts `ctx.mode.primer` under the mode's own narrowed home (`:46`, `own(ctx)` at `:42`), then:

```js
// systems/runtime/subjects/mode/traits/harnessed.js:47
  if (ctx.domain?.primer) primer.branch(ctx.domain.manifest.slug).graft(ctx.domain.primer);
  if (ctx.input.system) for (const [nature, effect] of Object.entries(ctx.input.system)) primer.open(nature, effect);
```

`armory` (`:74-84`) grafts `ctx.mode.tools` under the same home (`:82`), and:

```js
// systems/runtime/subjects/mode/traits/harnessed.js:81
  if (ctx.domain?.tools) tools.branch(ctx.domain.manifest.slug, ctx.domain.tools);
// :83
  return tools.graft(gestalten.tools.modes, gestalten.tools.tool, gestalten.tools.primer);
```

By default a request carries ONLY its own mode's primer + its daemon's domain primer + per-request `input.system`; the runtime harness's identity · world do NOT reach a daemon mode unless the thread's `PRIMED` names them (same for fs · shell tools and `TOOLED`). Other levels enter only through `PRIMED` · `TOOLED` deltas (`composing`, `:117-136`), resolved by `gestalten/reference/reading.js:13-22` `readings`, tried in order: the mode's home, the host's modes, `/runtime…`, `/daemon/<slug>…`, the absolute reference; `found` keeps the first per narrowed name:

```js
// systems/runtime/gestalten/reference/reading.js:61
  return [...named.values()].map((held) => held[0]);
```

**Overwrite vs deeper.** Mechanically last writer wins: `open` sets `this.branch(signature).effect = effect` (`prototypes/vector.js:56-57`), `graft` `if (vector.effect) this.effect = vector.effect` (`:73`). Across levels it does not occur: another mode's section is narrowed under a marker (`belt/reference.js:21` `if (kind === "runtime") return new Signal(["runtime", ...rest]).pathname;`, `:22` `[kind, slug, ...rest]`), a DIFFERENT, deeper path than the mode's own; on a clash `found` keeps the nearest (`reading.js:61`, m122 Q38). The only same-path overwrite is per request, `ctx.input.system` (`harnessed.js:48`). No level overwrites another level's primer by name today.

**Collection.** Not leaf-only: `steer.trie.leaves` emits every node holding an effect, stem or leaf (`steer/trie.js:52-54` `...(f.effect === undefined ? [] : [{ pattern: f.signature, steps: f.steps, effect: f.effect, carry: f.carry }])`); a Vector-valued effect recurses:

```js
// subsystems/typology/gestalten/shape/primer.js:13
    return effect instanceof Vector ? nodes(effect, node.nature, node.load) : [node];
```

Section key = joined path (`shape/primer.js:6`, `:38`); load = `steps.findLast((step) => step.load)?.load ?? inherited` (`:8`); `lazy` nodes become one listing (`:58`). One fixed strategy; no steerable collection function.

## 6 · "contextmap" in the trail

Owner's words, the only verbatim use:

- `.ikiro/quests/m122-harness-layout.org:64` Q37 — /"they all go back to root. … nothing writes to the contextmap something that is unrooted."/ — ruling: "R1: a key runs from root to the node picked, branch or leaf; a writer's rule (=keyed=), no schema". Here contextmap = the thread's `TOOLED` · `PRIMED` reference → load map.

Agent prose, not his: `done/m17_client_ctx_grammar.quest.org:261` (re-frame research); `done/m26-hallucinate-contract.org:761` ("Context Map … — deleted", the old `prototypes/hallucination.js`); `done/m23-debuggable-hallucinations.org:358` · `:386` (that old `context` Map of system sections).

m122 rulings that constrain layering (verbatim, `m122-harness-layout.org`):

- `:8` /"conversational used to be the marker for this. that was the idea. but conversation became a faculty and its kinda not clean rn. so. /fold then we clean up the mode traits"/
- `:23` Q0 — "=CONVERSATIONAL= = a human converses here (typed · dictated · called); =HARNESSED= = the mode has a model" · /"i would think for conversational to include chat turn stuff."/
- `:35` Q10 — "=TOOLED= · =PRIMED= on the thread … the mode keeps =TOOLING= · =PRIMER="; `:43` Q18 /"like tools."/
- `:54` Q27 — /"all tools and primer are stored complete in the trait. what does the narrowing is the actual vector loading under context aka with thread mode runtime daemon."/
- `:63` Q36A — /"if a mode runs in runtime, it must receive runtime. a modedie receives the runtime if its a daemon mode also, yes."/
- `:65` Q38 — "one name, two tools → the nearest loads"

m117 (`done/m117-root-harness.org`): `:14` /"build our harness to be basically empty besides some tools at default, and then each instance has to bring its own harness…"/; `:120` cites m84 /"launch an entirely empty runtime harness … how we allow users to overwrite them"/; `:119` R2 "tools are IMPORTED by a mode, never autoloaded by the trait".

## 7 · what CONVERSATIONAL used to do

Server, mode trait `systems/runtime/daemon/traits/conversational.js`:

- 04-05 `5dabc63cc`: `if (!mode.cake.dialogue) return;`, a `/dialogue` Vector: thread, history, user turn, `daemon.cortex.spawn()`, persist.
- 04-17 `d431050fc` · 05-04 `81c627d4a`: a `/conversation` WEBSOCKET on `mode.aperture`: `dialogue/open` streams `mode.harness.dialogue.stream`, then speech via `daemon.cortex.resolve("speech", …)`; `verbatim/*` gated `mode.traits.includes("VOCALIZED")`, ASR's final transcript fired a dialogue turn; `dialogue/abort`.
- 05-17 `7703b295b` → 07-06 `bb5cf8287`: speech · verbatim commented out. 07-11 `305701e90`: deleted.
- 09-09 `30308ade2`: the no-op (`daemon/traits/index.js:37`); 10-21 `bf2d02990` to `subjects/mode/traits/`.

Client, kajuit thread trait (05-04 `4b828cc6b`, gone by 07-11): wearing `CONVERSATIONAL` opened `connection.socket("/conversation", …)` + `new Conversation`; `engage`/`release` toggled it; `send`/`abort`; `$streaming` · `$pending` atoms. Thread `VOCAL` → `CONVERSATIONAL`: 11-12 `4d3eabb79`.

## 8 · the call's wiring, by owner

- `typology/gestalten/belt/cascade.js` (typology belt): `cascade(ear, mind, mouth)` → a `type: "call"` faculty (`:99-105`); answers on `/turn/close` or a fed `/turn/full`, aborts speaking on a user `/turn/open` (`:79`), seals `interrupted` (`:29`). Reads no trait.
- `cortex.js:146-151` (typology prototype): derives it from `query.hear` · `mind` · `speak`, asked by `shard/hallucinate.js:61`.
- `belt/hallucinate.js:253-286` `converse` (typology belt): runs the call, answers tool turns into the source (`:274-277`). Reads no trait.
- `shard/hal.js` (typology shard): `verbatim` (`:73-86`) reads CONVERSATIONAL `hear` · `language` · `harmonize`; `call` (`:88-107`) reads `call` · `hear` · `speak` · `language`, `mind` from the HARNESSED policy (`:101`); `repairing` (`:52-65`) reads `polish`.
- `runtime/subjects/mode/traits/harnessed.js` (runtime HARNESSED mode trait): `/verbatim` (`:289-295`) · `/call` (`:297-305`) gated by faculties; `attending` (`:153-158`), `persisting` (`:160-164`) → `recording` (`:169-208`); `claiming` copies CONVERSATIONAL to `ctx.conversational` (`:30`).
- `ghost/gestalten/commands/content/call.js` (ghost command): `ctx.terminal.mode.harness.call.stream(source, …)` (`:53`), grafted when the served harness has `call` (`entities/mode/traits/harnessed.js:38`). Reads no CONVERSATIONAL.

## 9 · open facts

- `own(ctx)`'s path under `slugging: "deep"` (root vs behind slug, m122 Q18 vs Q27): not run.
- A pre-11-12 thread without CONVERSATIONAL on `/verbatim` (`hal.js:76`): unproven.
- Whether the domain also staggers as a Mode (its tools armed twice): unread.
- `tune: mind.tune` (`cascade.js:102`) under `nearest`: unproven.
- Daemon hallucinators (`registry.js:288` → `split`): no live user, not run.

## 10 · director · actor — the record and the two references (a subagent's report, 11-19)

His order: /"first go through our conversations since m122 and find references to the actor/director model … second study the architecture examples we settled on … 1: report the references and then 2: design our actor/director given a study of the code of the references."/ The agent read 68 transcripts since 11-12 and both repos' code (downloaded under the session scratchpad `director-actor/{shuo-src,rvc-src}`, gone at a reboot). Spot-checked by me: four quotes grep true in transcript `71aea799`, `done/voice.quest.org:42` reads as cited. Everything else here is the AGENT's, unverified.

**His words, by session (`sid` = the transcript's first 8 chars).**

- `71aea799` 11-18 18:05 — the two repos named with /"have a agent build a reference for these two versus our own call implementation."/ → `reference/call-faculty/voice-loops-11-18.md`. They were settled on as VOICE-LOOP references, before director · actor existed.
- `71aea799` 11-18 18:21 q15 — /"are there architectures like say 2 level calls where one fast model does the talking and a slower model tells the direction and calls tools and works in the background? a director and an actor basically?"/ · q6 /"quietness is a function of the invoker, not the tool itslef. if we want a quiet tool we just dont return anythign."/
- `71aea799` 11-19 09:07 — /"q15 we call it Director and actor"/ · /"for francesca: we would not need any tools on the actor. we'd just expect the actor to act adn respond based on [system identity world] [director directions tool-results context] [history user agent user agent user]"/ (reverses my proposal one turn before, an actor holding `grade`) · /"so director has a dual role of controlling tools invocation and the speakers context. is  that a known structure? can we steal something here?"/
- `71aea799` 11-19 12:51 — /"q15. great. we will take all this logic and wiring and express it as property and function of the conversational trait. … the conversational trait is what implements this actor-director system, provides contextual update style tools, wires primers and tools (via harness), and is the consumer of whatever system we come up with to declare specific faculties from provider.model for certain jobs."/ · /"maybe a lot of belt cascade actually belongs in the conversational trait. so, conversational trait triggers the inclusion into the harness of all the conversational wiring. runtimes, daemons, and modes are harnessed."/ · q22 /"without specilation seems reasonable for today. … speculation can be embedded later? maybe even asa settting."/ His "great." answered MY three steals from Talker–Reasoner (one state object read latest · the director writes ahead · a wait flag): praise, no ruling.
- `71aea799` 11-19 15:28 — /"r7 your pick"/ (the directions as a packet beside `/turn/full`) · q1 /"map specific faculty tiers to specific roles"/ · /"for conversational that we need either call or [s2t,t2s,t2t]"/
- `55c5aab0` 11-19 — /"like in conversation we might have actor tier, ear tier, etc."/ · /"we might also add actor and director here.  those two being dialogue."/
- `849857cb` 11-19 — the asks recorded in the quest's `* the runtime · client side` and `* the drill`.
- Before m122, `done/voice.quest.org:19 · :42 · :1137-1146`: "Two-tier (fast filler + slow thinker) … rejected by user" (05-06). That shape had TWO SPEAKERS.
- Never his words: Talker · Reasoner · supervisor · "two minds" · "fast mind" · "slow mind". Mine: "an agent on its own thread" · "judges right/wrong aloud by itself" · "one turn stale by design" (`m125-francesca-call.org:210-228`).

**shuo (`NickTikhonov/shuo`).** One pure `process_event(state, event) → (state, actions)` (`shuo/state.py:22-60`), two phases LISTENING · RESPONDING (`types.py:19-33`), history in the Agent. Turn end is Deepgram Flux's `EndOfTurn` · `StartOfTurn` (`services/flux.py:131-139`). Barge-in cancels LLM, then TTS, then the player (`agent.py:126-149`); stored = the GENERATED text + `"..."` (`llm.py:109-112`). The system prompt is a constant (`llm.py:15`); every reply rebuilds `[system] + history` (`llm.py:83-85`). Speed: a warm TTS pool (`tts_pool.py:77-163`), every token to TTS, Groq. No tools, no second model (grep 0).

**RealtimeVoiceChat (`KoljaB/RealtimeVoiceChat`).** Four threads (`speech_pipeline_manager.py:201-210`), the request queue drains to the newest (`:252-256`). Turn end is local: VAD + a DistilBERT "sentence finished" score + a speed knob (`turndetect.py:265-296 · :475-496`). SPECULATION is its core: a reply prepared on a stable partial (`server.py:635-646`), kept if the last five words match ≥ 0.95 (`speech_pipeline_manager.py:442-532`), audio held until the final (`server.py:664-691`). First clause to TTS first (`text_context.py:28-70`). Echo gate: the mic reaches STT 1 s after the first TTS chunk (`audio_in.py:200-201`). The system prompt is fixed at startup; each request `[system] + history + user` (`llm_module.py:638-650`). No tools, no second model (grep 0).

**platypush (`https://blog.platypush.tech/article/Rewriting-my-voice-assistant-pipeline`), added by him 11-19** — /"here more orientation and architectural ideas"/ · /"remember this as an additional reference"/. Read through a fetch agent, not by me. A rewrite of the HEARING layer: microWakeWord for the wake word, Silero VAD with a majority vote over 0.5 s (a turn closes 1.0–1.6 s after the last word, 6–10 s before). Each stage is a plugin, local or cloud, with its own config block; ONE model request a turn, its system text a `context` entry in that block. A hook subscribes to the recognised-speech event, runs BEFORE the reply and can replace it. The ear is muted while the assistant speaks (no barge-in); a reply ending in `?` keeps the conversation open. Holds no second model, no tools, no history handling, no persistence, no streaming. What it gives us: the hook as the director's wake (ours runs beside the reply, twin `shard/hal.js:39`) · context named in config, the third way to split a primer per mind (probed `director-actor-11-19/split.c.probe.js`, unruled).

**What they settle.** Neither holds a director: both are references for the ACTOR's loop. They settle turn end, the order of a barge-in, the first-clause flush, the warm mouth, speculation as a later option, and that EVERY reply is a fresh request built from system + history (ours freezes `system` for a call, `belt/cascade.js:32 · :50`). Telling the mind where it was cut (m125 Q26) goes beyond both.

**The agent's design, a SKETCH, unruled.** Actor: tier `actor`, no tools, each reply a fresh request = the primer minus a `director/` branch + a `directions` section + the text history; never waits by default. Director: the HARNESSED mind on the SAME thread, never speaks, full primer + the mode's tools + one quiet tool of the trait (`/conversation/direct`, returns nothing, writes `thread.trait.CONVERSATIONAL.directions` as `tool_load` writes `TOOLED`); wakes on each sealed learner turn, a newer turn supersedes a running one. One source, two readers: a typed reply reads the directions through a primer section (`shape/primer.js:22-23`), a live call gets the same value as a packet (r7); a native call only the packet. Dies: francesca's reviewer (`harness.js:11-129`, its prompt → `primer/director/review.md`), the tools handed into a call (`shard/hal.js:92-94`), the call's mind off the HARNESSED policy (`:101`), the hard `tier: "fast"`.

**Forks the agent leaves to him.** F1 which turns run the split (calls only · modes that author a `director` primer branch · everywhere; the runtime harness wears CONVERSATIONAL and its chat needs tools on whoever answers) · F2 whether the actor ever waits · F3 what wakes the director · F4 where the director's own rounds are stored (same thread tagged · on the actor's turn · a child thread · nowhere) · F5 the director's model (HARNESSED's selector, or a new key) · F6 where the directions live · F7 the first reply (director first, or it catches up) · F8 the packet's name (`/system/full` has zero hits) · F9 how a trait attaches a primer section and a tool to a harness that builds both per request (`harnessed.js:44-50 · :74-98`).

**Contradictions it names.** The "examples we settled on" hold no director · the 05-06 two-tier rejection's cost (incoherence) partly applies to a director one turn behind · m123 Q0 (the belt owns a call's tool loop) against a tool-less actor · /"its the thing we talk to"/: the actor, or the director's gear? · /"[director directions tool-results context]"/: raw tool results, or the director's digest? · r7 ruled, then /"your mental model … is not correct"/: WHICH part is unknown · r3 puts CONVERSATIONAL on the runtime harness (F1) · a spoken verdict by the actor against a grade landing a turn late · /"conversational engages entity and prototype"/ against m18's cut of `Conversation`.

**Unverified by the agent.** `belt.fn.tap` · `belt.object.omit` as names · how a provider takes `tool_use` parts in history with no tools declared · whether `Turn.history` filters by meta. Guard: its report file was denied (/Subagents should return findings as text/); this section is that report, condensed.
