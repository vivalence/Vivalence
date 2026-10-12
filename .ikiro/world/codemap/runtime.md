---
paths: ["systems/runtime/**"]
---
<!-- writer: agent · limit: 2650 chars · traps only · paths relative to systems/runtime -->
# codemap: runtime

- **the boot is a VECTOR per process type** — `lifecycle/<type>/execution.js`; a lifecycle `(die, next)` closes what it opened in its OWN `finally`. `lifecycle/<type>/` holds PHASE files only (execution · population · resolution · integration); helpers → `gestalten/belt/`.
- **the die is a bag** `{ controller, mask, <type> }`; the runtime's adds `aperture`, the ROOT server; no `die.host`. A mode is NO process: `mode.stdout` is a branch of its rung's controller span — a trait reports there, never `console.log`.
- **readiness is a span tap**; serve on `url.hostname`. A scenario boots by COMPOSING lifecycles (`tests/scenarios/bench.js`). ONE datamap per runtime; a daemon BORROWS it, strikes repositories scoped to its slug.
- **a declared trait the rung does not offer is LOGGED, never thrown** — the set is OPEN; `die.traits` is per rung (the runtime's drops `DATASET · DATASINK`). A mode trait has THREE homes: `traits/<trait>.js` · `ModeTraitsEnum` (`entities/Mode.ts`; dropping a member kills hydration — keep the old at the bottom) · the client `implements(…)`.
- **identity IS the manifest** — `mode.manifest.*`, the modes entry folded over the module, mask wins. `mode.reference` = `/mode/<type>/<slug>` relative to its rung.
- **`daemon.call` proxies the DOMAIN aperture past auth**; a trait-gated route is grafted or ABSENT. The lighthouse is its own lifecycle, traits staggered like a mode's (`JOINABLE` · `AUTOLOGIN`, user `localhost`).
- **entities**: schema delta = restart; `/entities/<type>/update` is mikro assign, no merge — never a partial `trait`; every flush BROADCASTS to every subscriber incl. the writer. User-data repos are STRICT user-scoped; waive `{ filters: { user: false } }`. NEVER `allowGlobalContext`. `Literal.symbol` is DERIVED by the twitch. DATASINK on a user-scoped type THROWS.
- **harness**: seven armed layers, later wins (skills · paladin · services · domain · `mode.tools` · generator · `input.tools`); a ROOT `use` sees `turns: []` — dialogue-only sections go `harness.branch("/dialogue")`; a tool result is re-billed every later turn. FIXED lexicon `dialogue`/`object` × `render`/`stream` + `choice`; a mode verb lives on an EXPOSED aperture. LLMs ONLY through `ctx.mode.harness`.
- **emitter**: a delegating emitter passes `thread: ctx.input.thread` or the buffer persists `thread: null`; a peer is reached at runtime `ctx.modes[type][slug].emit[verb]`. An async-generator handler IS SSE. Streaming bug → `tests/sse.integration.test.js` FIRST.
