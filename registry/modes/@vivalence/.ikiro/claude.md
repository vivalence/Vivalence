> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# Modes

> Game modes and tactics. The application-level behaviors that run on the engine.

## Role

Feature implementation. Modes are the player-facing experiences — flashcards, writing practice, shadow reading. Each mode is a registry package with a manifest declaring its traits and a .viva.js exporting its components. The runtime's trait system wires them into the daemon during the resolve phase.

## Mode Anatomy

Every mode exports from its .viva.js:

```javascript
import { BufferView, Vector, v } from "@vivalence/typology";

export const manifest = { type, slug, name, description, version, traits };
export const buffer = new BufferView("buffer/Component.svelte", v.buffer({ data: { ... } }));
export const emitter = new Vector().open("/literal", async (ctx) => { ... });
export const dataset = { intent: [...] };
```

**Traits determine wiring:**

| Trait | What it does | Applied by |
|-------|-------------|------------|
| BUFFERED | Bundles Svelte view, serves /view endpoint, wires mode.buffer() factory | traitmap.BUFFERED |
| INTENTED | Upserts intents from dataset, creates per-intent routing | traits/intented.js |
| EMITTER | Attaches emitter Vector as /emit endpoints, injects daemon/mode context | traits/emitter.js |
| SELFEVIDENT | Mode can open without an intent (standalone) | traitmap.SELFEVIDENT |
| DATASET | Upserts symbols/literals from dataset | traits/dataset.js |
| CHAOSMONKEY | Attaches hallucinator brain | traitmap.CHAOSMONKEY |
| FRAUGHT | Indexes freight catalog (audio, images), exposes /freight | traitmap.FRAUGHT |
| TOPOGRAPHICAL | Carries topology-level data | traitmap.TOPOGRAPHICAL |
| LANGUAGED | Conversation harness with personality (planned) | — |
| AGENTIC | Action harness with auto-resolve (planned) | — |

**Intent dataset format:**

```javascript
{
  slug: "survival-flashcard",
  type: "SELFEVIDENT",
  traits: ["FURNISHED"],
  data: {
    FURNISHED: {
      seek: { symbols: ["word", "proficiency.survival"] }
    }
  }
}
```

## Active Game Modes

Nine game modes under `game/`. All share: BUFFERED, INTENTED, EMITTER traits. Most add SELFEVIDENT.

| Mode | Slug | Emitter route | Gameplay variants | Description |
|------|------|---------------|-------------------|-------------|
| Pick | pick | /literal | — | Multiple choice from distractors. One tap. |
| Judge | judge | /literal | visual, audio, audio-only | Timed true/false on translation pairs. |
| Listen | listen | /literal | pick, type | Audio-first recall. Requires VOCALIZED. FRAUGHT. |
| Exhibit | exhibit | /present | — | Present structured knowledge. No testing. |
| Flashcard | flashcard | /literals | — | Classic bidirectional recall. |
| Match | match | /batch | translate, describe | Connect literal pairs across two columns. |
| Cloze | cloze | /literal | type, pick, listen | Fill blanked tokens in a sentence. |
| Shadow | shadow | /literals | — | Shadow reading/listening with speed control. |
| Write | write | /literals | — | Free text production. |

**Emitter pattern**: Each game mode exports an `emitter` Vector with one route. The route receives `ctx.input` (literal, distractors, recall, gameplay, speed) and returns a buffer via `ctx.mode.buffer({ data, literals })`.

Server-side callers (tactics) invoke emitters as `ctx.daemon.modes.game.{slug}.emit.{route}(input)`.
Client-side callers use `terminal.daemon.call` through the aperture wire protocol.

**Distractor fetching**: Pick, Judge, and Listen emitters auto-fetch distractors via `ctx.daemon.entities.literal.feed()` when none are provided in input.

## Active Tactics

Two tactics under `tactic/`. Tactics orchestrate game modes — they don't render directly.

### Survival `tactic/survival/`

Five-phase session for Brazilian Portuguese. Each phase is a separate file in `emitter/`:

| Phase | File | Default batch | Strategy |
|-------|------|---------------|----------|
| warmup | warmup.js | 8 | Easy recall — exhibit new, flash KNOWN, judge SLOW, listen pick |
| buildup | buildup.js | 6 | Conjugation paradigms — exhibit, pick with paradigm distractors, match, judge |
| exercise | exercise.js | 3 | Deep sentence work — token resolution, shadow, cloze, judge, write, listen |
| drill | drill.js | 12 | High volume verb reps — exhibit, flash LEARNING, write, judge FAST |
| cooldown | cooldown.js | 8 | Relaxed listening — listen pick KNOWN, flash KNOWN |

All phases call `ctx.daemon.entities.literal.feed()` directly (not through aperture).
Exercise phase resolves sentence tokens via `ctx.daemon.entities.literal.findOne()` with user-scoped memory population.

### Test `tactic/test/`

Minimal tactic for development. One emitter route `/flashcards` that feeds literals through flashcard buffers.

## Emitter Wiring

The EMITTER trait (`runtime/daemon/mode/traits/emitter.js`) does three things:

1. Injects `ctx.daemon` and `ctx.mode` into emitter middleware
2. Resolves `ctx.input.seek` via `Seek.fromMask()` and `ctx.input.blacklist` via `new Blacklist()`
3. Post-processes output: assigns session + counter index to buffers, flushes em, serializes response

The emitter Vector is exposed two ways:
- `mode.emit = shape.object(emitter)` — local callable object
- `mode.aperture.branch("/emit").slurp(emitter)` — HTTP endpoint at `/emit/{route}`

## Buffer Schema

Game modes define their buffer data schema using `v.buffer()`:

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

## Memory Integration

Game mode Svelte components call review through the aperture:
```javascript
terminal.daemon.call("/review/literal", { signal: "SUCCESS", scope: { literal: lit.id } })
```

The aperture resolves the literal and calls `literal.review(signal, ctx)` which:
1. Finds or creates the user's Memory for this literal
2. Calls `memory.apply(signal, driver)` — dispatches to the driver's `evolve()` or `encode()`
3. Creates a Trace entity
4. Flushes

Memory drivers: BAYESIAN (ebisu, default), BOOLEAN (binary), COUNTER (streak-based). See `domain/learning/memory/` and `.ikiro/memory-drivers.workpackage.org`.

## Archived Modes

In `game/bak/`: conjugations, flashcards (old), translations, todo stubs — abandoned approaches from before the kernel simplification.
In `tactic/bak/`: old tactic format tests.

## Where Used

- **Runtime daemon**: Modes instantiated during populate, traits applied during resolve
- **Tactics**: Orchestrate game modes via `ctx.daemon.modes.game.{slug}.emit.{route}()`
- **Client**: Loads Svelte views via BUFFERED /view URL, calls /emit and /review via daemon.call

## Work Packages

### Testing
- Bruno tests exist for all game emitters and tactic emitters (`testament/_bruno/variants/daemons/test-language/modes/`)
- Bayesian driver: 36-step test suite (`domain/learning/tests/memory/bayesian.test.js`)
- No mode-level unit tests (Svelte components untested)
- No end-to-end mode lifecycle tests

### Active Work
- implements filter + method across all entities via trait.js
- Wire exhibit + survival into daemon circuitry, end-to-end verify
- Counter + Boolean driver tests
- Tier 2 game modes (reorder, dictation)
- Tier 3 game modes (minimal-pair)
- Conversational tactics (post-cortex)

### Human Documentation Needs (Divio)
- **Tutorial**: "Build a new game mode" — manifest, BufferView, emitter, dataset, trait selection
- **Reference**: Emitter context shape, buffer data schema patterns, gameplay enum conventions
- **How-to**: "Add a new tactic" — emitter dir pattern, phase composition, literal feed integration

## Maintenance

When adding a new game mode:
1. Create `registry/modes/@vivalence/game/{slug}/{slug}.viva.js`
2. Export manifest with traits (at minimum: BUFFERED, INTENTED, EMITTER)
3. Create `buffer/{Name}.svelte` — BufferView points at it
4. Define emitter Vector with route(s)
5. Export dataset with intent entities if INTENTED
6. Wire into circuitry's daemon modes array
7. Add Bruno test at `testament/_bruno/variants/daemons/test-language/modes/game/{slug}/`

When adding a new tactic:
1. Create `registry/modes/@vivalence/tactic/{slug}/`
2. Create `emitter/` dir with one file per phase + `index.js` assembling the Vector
3. Export manifest (INTENTED, EMITTER), emitter, dataset from `.viva.js`
4. Phases call `ctx.daemon.entities.literal.feed()` directly and compose buffers via `ctx.daemon.modes.game.{slug}.emit.{route}()`
5. Add Bruno tests for each emitter phase
