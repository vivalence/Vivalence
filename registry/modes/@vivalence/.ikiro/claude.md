# IKIRO — registry/modes (container)

Feature implementation. Game modes = player-facing experiences. Tactics = orchestrators (don't render directly). Each mode is a registry package; its manifest's `traits` array is the wiring contract — runtime trait functions read these and assemble the mode into a daemon during resolve. Read `.ikiro/CLAUDE.md` first.

## architecture

traits are the wiring contract.

Every mode's `.viva.js` exports the same anatomy: `manifest` (identity + traits) + `buffer` (BufferView pointing at a Svelte file + buffer schema) + `emitter` (Vector with routes) + `dataset` (intent rows, optionally symbols/literals). Each trait declared in the manifest maps to a runtime function in `systems/runtime/daemon/traits/`. During resolve, those functions read mode artifacts and wire them into the daemon — buffer compiles + serves `/view`; emitter mounts at `/emit/{route}`; dataset upserts via DATASET; intent dataset upserts + creates `/modes/:type/:method` routing.

mode anatomy:

```javascript
import { BufferView, Vector, v } from "@vivalence/typology";

export const manifest = { type, slug, name, description, version, traits };
export const buffer = new BufferView("buffer/Component.svelte", v.buffer({ data: { ... } }));
export const emitter = new Vector().open("/literal", async (ctx) => { ... });
export const dataset = { intent: [...] };
```

trait → runtime wiring:

| trait | runtime action | trait file |
|-------|---------------|------------|
| BUFFERED | esbuild-bundle Svelte view, serve /view, wire `mode.buffer()` factory | `systems/runtime/daemon/traits/buffered.js` |
| INTENTED | upsert intents from dataset, create per-intent routing | `systems/runtime/daemon/traits/intented.js` |
| EMITTER | mount emitter Vector at /emit, inject daemon/mode/seek/blacklist into ctx | `systems/runtime/daemon/traits/emitter.js` |
| DATASET | upsert symbols + literals (chunks of 100) | `systems/runtime/daemon/traits/dataset.js` |
| CHAOSMONKEY | wire harness — fail-fast + cortex.shard.harness + dialogue assembly + scribe + /harness mount | `systems/runtime/daemon/traits/chaosmonkey.js` |
| CONVERSATIONAL | thin ws session owner — /conversation route, per-connection vector | `systems/runtime/daemon/traits/conversational.js` |
| FRAUGHT | index freight catalog (audio, images), expose /freight | `systems/runtime/daemon/traits/index.js` |
| TOPOGRAPHICAL | carry corpus-level data | `traits/index.js` |
| VIEWABLE | (alias of BUFFERED — Svelte view bundler) | `traits/buffered.js` |
| LANGUAGED / AGENTIC | planned, not yet implemented | — |
| SELFEVIDENT | legacy no-op on Mode (still valid as Thread/Intent fallback) | — |

structure:

```
registry/modes/@vivalence/
├── game/                          11 modes (player-facing)
│   ├── pick/                      multiple choice — one tap
│   ├── judge/                     timed true/false — visual / audio / audio-only
│   ├── listen/                    audio-first recall — pick / type (needs VOCALIZED)
│   ├── exhibit/                   present knowledge, no testing
│   ├── flashcard/                 classic bidirectional recall
│   ├── match/                     connect literal pairs — translate / describe
│   ├── cloze/                     fill blanked tokens — type / pick / listen
│   ├── shadow/                    shadow reading + speed control
│   ├── write/                     free text production
│   ├── conjugation/               conjugation paradigm practice
│   └── paradigm/                  paradigm-specific drills
└── tactic/
    ├── survival/                  five-phase Brazilian session
    └── clinic/                    12 adaptive scopes (analysis + routine middleware split)
```

intent dataset (APPLICATIVE with FEEDING):

```javascript
{
  slug: "feed",
  type: "APPLICATIVE",
  traits: ["FEEDING"],
  trait: { FEEDING: { mount: "/emit/feed", queue: 1, mask: { batch: 4 } } },
}
```

game emitter pattern — every game mode exports a Vector with two routes. The original route accepts pre-fetched content from tactic callers. The `/feed` route self-sources literals via `ctx.daemon.entities.literal.feed()` — used by the mode's APPLICATIVE intent for standalone play. Feed routes accept optional `seek`, `blacklist`, `where`, `batch` from the FEEDING mask.

| mode | original route | gameplay variants |
|------|----------------|-------------------|
| pick | /literal | — |
| judge | /literal | visual / audio / audio-only |
| listen | /literal | pick / type |
| exhibit | /present | — |
| flashcard | /literals | — |
| match | /batch | translate / describe |
| cloze | /literal | type / pick / listen |
| shadow | /literals | — |
| write | /literals | — |
| conjugation | /literal | — |
| paradigm | /literal | — |

invocation — server tactics: `ctx.daemon.modes.game.{slug}.emit.{route}(input)`. Client: `terminal.daemon.call` through aperture wire protocol.

distractor fetching — pick / judge / listen emitters auto-fetch via `feed()` when no distractors are provided in input.

EMITTER trait does three things (`systems/runtime/daemon/traits/emitter.js`):

1. inject `ctx.daemon` + `ctx.mode`
2. resolve `ctx.input.seek` via `Seek.fromMask()` + `ctx.input.blacklist` via `new Blacklist()`
3. post-process — assign session + counter index to buffers, flush em, serialize response

Two surfaces: `mode.emit = shape.object(emitter)` (local callable) and `mode.aperture.branch("/emit").slurp(emitter)` (HTTP).

buffer schema (every game mode, via `v.buffer()`):

```javascript
const buffer = new BufferView(
  "buffer/Judge.svelte",
  v.buffer({
    data: {
      recall: v.string({ default: "LEARNING" }),
      gameplay: v.string({ default: "visual" }),
      speed: v.object({ rate: v.string(), base: v.number(), multiplier: v.number() }).optional(),
      items: v.array(v.object({ target: v.number(), shown: v.string(), correct: v.boolean() })),
    },
  }),
);
```

`mode.buffer({ data, literals })` creates a real MikroORM BufferEntity with the data and literal relations.

tactics (orchestrators):

- survival (`tactic/survival/`) — five-phase Brazilian Portuguese session. Each phase its own file in `emitter/`:

| phase | file | batch | strategy |
|-------|------|-------|----------|
| warmup | warmup.js | 8 | exhibit new, flash KNOWN, judge SLOW, listen pick |
| buildup | buildup.js | 6 | conjugation paradigms — exhibit, pick with paradigm distractors, match, judge |
| exercise | exercise.js | 3 | deep sentence work — token resolution, shadow, cloze, judge, write, listen |
| drill | drill.js | 12 | high volume verb reps — exhibit, flash LEARNING, write, judge FAST |
| cooldown | cooldown.js | 8 | relaxed listening — listen pick KNOWN, flash KNOWN |

All phases call `feed()` directly (not through aperture). Exercise resolves sentence tokens via `findOne()` with user-scoped memory population.

- clinic (`tactic/clinic/`) — 12 adaptive scopes (class, regularity, questions, connectors, negation, pronouns, determiners, adverbs, numbers, degrees, prepositions, ser-vs-estar). Phase-aware sub-emitter composition (introduce / drill / reinforce / hunt). Strength-based assess + weighted random selection + trace errorRate. M0 shipped: `clinic/emitter/shards/{analysis,routine}.js` factories. Pronouns is the first migrator. See `.ikiro/tactic-analysis-routine.workpackage.org`.

memory integration — game mode Svelte components call review through aperture:

```javascript
terminal.daemon.call("/review/literal", { signal: "SUCCESS", scope: { literal: lit.id } })
```

The aperture resolves the literal → `literal.review(signal, ctx)` → finds/creates user Memory → `memory.apply(signal, driver)` (drivers in `registry/kernels/@vivalence/domain/learning/memory/`) → creates Trace → flushes.

## context

consumers:

- runtime daemon — modes instantiated during populate; traits applied during resolve
- tactics — orchestrate game modes via `ctx.daemon.modes.game.{slug}.emit.{route}()`
- client — loads Svelte views via BUFFERED `/view` URL; calls `/emit` and `/review` via `daemon.call`

testing:

- Bruno tests for all game emitters + tactic emitters at `testament/_bruno/variants/daemons/test-language/modes/`
- Bayesian driver: 36-step suite at `registry/kernels/@vivalence/domain/learning/tests/memory/bayesian.test.js`
- no Svelte component unit tests
- no end-to-end mode lifecycle tests

active work:

- M2+ of tactic-analysis-routine — wire analysis + routine middleware into EMITTER trait
- Tier 2 game modes — reorder, dictation
- Tier 3 — minimal-pair
- conversational tactics (post-cortex)
- Listen TYPE feedback redesign shipped 2026-04-20 — two-column lexicon + usage layout, see `registry/modes/@vivalence/game/listen/buffer/Listen.svelte`

archived — `game/bak/`: conjugations (old), flashcards (old), translations, todo stubs (abandoned approaches before kernel simplification). `tactic/bak/`: old tactic format tests.
