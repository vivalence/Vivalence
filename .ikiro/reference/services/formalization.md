<!-- limit: 8000 chars · ruled 2026-11-11 in a drill · mode consume LANDED → quests/done/mode-consume.md, the recast UNLANDED · probe beside: implied.probe.js -->
# services — the formalization and the locks (drill 11-10 · 11-11)

beef, 11-11: /"Good formalization, that's how we are going to work it. I want you to add this to your own internals and code map."/

## the law

`manifest.type` is the ADDRESS: a segment of the identifier (`@chess/service/stockfish` · `@commons/datamap/libsql` · `@commons/hallucinator/anthropic`).
A trait names the EXPORT it travels with (`subsystems/paladin/prototypes/integrity.js:3`).

| trait | export | read by | wearers 11-11 |
|---|---|---|---|
| `PROVIDER` | `provider` | the consumer's boot | 0 (11 modules export it bare) |
| `ATTACHED` | `attachment` | the runtime | 0 |
| `SERVER` | `control` | nobody | 1 (`nlp-stanza`) |
| `SERVICE` | none | nobody | CUT 11-11 /"cuut"/ |

- `PROVIDER` — `provider(mask)` returns the live thing a consumer holds at `ctx.providers.<key>`. The types `service` · `datamap` · `hallucinator` IMPLY it; paladin fills it. beef: /"those imply a provider trait, which is something that Paladin should fix"/
- `ATTACHED` — the runtime mints a `Service` with its own controller, runs it, hangs `attachment` at `/attached/process/service/<type>/<slug>`, kills it in the beat's `finally`. beef: /"the service has an attachment that is attached to the runtime and run and manage and life cycled with a controller"/
- `SERVER` — `control`, a Vector that starts · stops · reports what runs OUTSIDE the runtime's process. beef: /"we expose a control vector. That if run, it controls some sort of service"/
- `DOCKER` · `COMPOSE` — untouched, m94: /"Server Docker Compose, yes, makes sense, but I cannot deprecate it right now."/

`ATTACHED` · `SERVER` are independent; `PROVIDER` is NOT — every `service` has one (the 11-11 walk: an `ATTACHED`-only module faults `PROVIDER: no provider export`; 0 real, 1 fixture, see handoff). After:

```js
reader      service       PROVIDER
stockfish   service       PROVIDER
nlp-stanza  service       PROVIDER · SERVER · DOCKER · COMPOSE · TOOLING
libsql      datamap       PROVIDER
anthropic   hallucinator  PROVIDER
```

## what IS, measured 11-11

```js
reader      provider() → { open }                       inside the runtime's process   nothing to start
stockfish   provider(mask) → new Engine(binary)         a child the provider spawns    nobody calls close()
nlp-stanza  provider(mask) → Connection(statics.remote) a container outside            started by hand
```

- consuming never starts anything: `systems/runtime/subjects/daemon/lifecycle/1-population.js:74` calls `citizen.provider(citizen)` blind.
- the runtime's `services` beat spawns only `ATTACHED` masks (`systems/runtime/subjects/runtime/lifecycle/1-population.js:124`): zero wearers, it spawns nothing.
- stanza's `control` has no caller and no rule checks it (`:43` cut 11-11).
- the runtime has no `consume` and `runtimeDie` no `providers` (`subsystems/typology/schematics/primitives/contexts.js:62`): its own modes read none.
- a mode lifts the daemon's bag (`systems/runtime/subjects/mode/factory.js:6`); its own `consume` lands over a copy (`systems/runtime/subjects/mode/lifecycle/1-population.js:14`, LANDED 11-11).

## the locks

Q0 — `consume` on runtime · daemon · mode, one shape. beef 11-11, over the recipe: /"correct."/

```jsonc
// instance.viva.jsonc
"runtime": {
  "consume": { "nlp": "@commons/service/nlp-stanza" }
},
"daemons": [{
  "consume": { "engine": "@chess/service/stockfish" },
  "modes": [{
    "module": "@chess/modes/study/analysis",
    "consume": { "reader": "@commons/service/reader-a" }
  }]
}]
```

```js
// subsystems/typology/schematics/primitives/instance.js — Mode (:34) LANDED · Runtime (:44) owed, as Daemon at :119
    consume: v.record(v.string(), Mask).default({}),
```

Gap: the recipe writes a bare string; `Mask` (`instance.js:12`) takes `{ module }`. Unruled.

Q1 — A: the daemon's providers stay, the mode's own keys land on top. beef: /"q1:a"/

LANDED 11-11 with `registry.wire` resolving a mode's `consume`: `.ikiro/quests/done/mode-consume.md`, a booted runtime read (`mode-consume.boot.probe.js`).

Q2 — A: `SERVICE` the trait dies, `service` the type stays. beef: /"q2: a"/

LANDED 11-11: `systems/runtime/subjects/service/traits/index.js` exports `attached` · `PROVIDER`; rules `integrity.js:43` · `:44` deleted with it; zero hits for the word outside `testament/m76-probe` (its own frozen copy).

## the hunks — SKETCH, affirmed as the formalization

```js
// subsystems/paladin/prototypes/integrity.js
export const IMPLIED = {
  service: ["PROVIDER"],
  datamap: ["PROVIDER"],
  hallucinator: ["PROVIDER"],
};

const imply = (module) => ({
  ...module,
  manifest: {
    ...module.manifest,
    traits: [...new Set([...traits(module), ...IMPLIED[module.manifest.type]])],
  },
});
```

```diff
// subsystems/paladin/prototypes/integrity.js — RULES, after the Manifest rule
+  [(module) => module.manifest.type in IMPLIED, imply],
// TRAITS
   ATTACHED: "attachment",
   PROVIDER: "provider",
+  SERVER: "control",
```

The two rules that blocked it are gone (Q2, LANDED): `IMPLIED` · `imply` · the RULES row are what is left to land.

## the probe — `implied.probe.js`, `deno run -A --no-check --config deno.jsonc`

```js
today       stockfish {"traits":[],"faults":[]}
today       mute      {"traits":[],"faults":[]}
implied-44  stockfish {"traits":["PROVIDER"],"faults":[]}
implied-44  mute      {"traits":["PROVIDER"],"faults":["PROVIDER: no provider export"]}
implied-44  libsql    {"traits":["PROVIDER"],"faults":[]}
```

Not probed: the `SERVER` entry against the real stanza module · the registry's mount path end to end.

## who runs a service — RULED 11-11

beef: /"the Paladin does not spawn. The Paladin provides us the tools, or provides the runtime with the tools to manage that stuff, to manage all of the system level interfaces. But the responsibility lies, and the operation, all of that lies with the runtime itself."/ · /"the services are run/owned by runtime. but we run it by hand for nwo"/

- services are RUN and OWNED by the runtime; paladin hands the tools.
- by hand for now: nothing is built.
- REJECTED: stanza as a third child of paladin's supervisor (`viva instance/up`) — my lean, "spawning is paladin's".
- REJECTED: a `SERVER` trait function dispatching `control` `/up` · `/down` — /"the way that you have implemented this doesn't make any sense. This up, down, slash up, slash down."/
- OPEN: what `SERVER` carries. /"something isn't right about this trait."/ The `+  SERVER: "control"` hunk above is unsettled until he rules.

## handoff — 11-11

- next, on his word: `IMPLIED` · `imply` · the RULES row; fixture `subsystems/paladin/tests/registry.wire.test.js:124` gets `provider: () => ({})`, its expects `:131` `:136` `:138` `:143` gain `"PROVIDER"`.

## owed — unasked

1. what a `SERVER` carries, and how the runtime runs it (after "by hand for now").
2. who closes what a `provider` opened (stockfish's child) — PARKED with the teardown study, `.ikiro/reference/teardown/study.md`.
3. the runtime's own `consume` → `runtimeDie.providers`.
4. `runtime.services` keyed flat by slug; the tool route `/service/<key>` (m109: kept, unruled).
5. the stale desc at `subsystems/typology/schematics/traits/index.js:73` ("on its daemon" — it is the runtime).
6. a mode's `consume` entry with a blank secret is not dropped at settle (`subsystems/paladin/instance/lifecycle/3-integration.js:37` drops the daemon's only): its provider throws at boot.
7. an OBJECT mode entry with a relative `module` is not anchored (`subsystems/paladin/instance/lifecycle/1-population.js:14`, strings only): boot dies `Cannot read properties of undefined (reading 'split')`. Older than 11-11; UNFILED, `known-issues.org` full.
8. a bare string as a `consume` · `hallucinators` entry — HIS.
