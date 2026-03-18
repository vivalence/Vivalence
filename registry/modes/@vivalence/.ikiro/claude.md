> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# Modes

> Game modes and tactics. The application-level behaviors that run on the engine.

## Role

Feature implementation. Modes are the player-facing experiences — flashcards, writing practice, shadow reading. Each mode is a registry package with a manifest declaring its traits and a .viva.js exporting its components. The runtime's trait system wires them into the daemon during the resolve phase.

## Active Modes

### Game Modes

Three working game modes under `game/`:

**Flashcard** `game/flashcard/flashcard.viva.js`
- Type: game, slug: flashcard, version: 0.1.0
- Traits: VIEWABLE, BUFFERED, VALENTIC
- View: `buffer/Flashcard.svelte` (282 lines)
- Dataset: 1 valence (survival-flashcard), seeks word + proficiency.survival symbols
- Classic bidirectional recall. Player sees one side, guesses the other.

**Write** `game/write/write.viva.js`
- Type: game, slug: write
- Traits: VIEWABLE, VALENTIC
- View: `buffer/Write.svelte` (521 lines)
- Dataset: 1 valence (survival-words), seeks sentence + proficiency.survival symbols
- Writing practice for sentences.

**Shadow** `game/shadow/shadow.viva.js`
- Type: game, slug: shadow
- Traits: VIEWABLE, VALENTIC, BUFFERED
- View: `buffer/Shadow.svelte` (612 lines — largest game mode)
- Dataset: 1 valence (survival-shadow), seeks sentence + proficiency.survival, speed: SLOW
- Shadow reading/listening practice for sentences.

### Tactic Mode

**Test** `tactic/test/test.viva.js`
- Type: tactic, slug: test
- Traits: VALENTIC, PRODUCER
- No view (not VIEWABLE — orchestrates, doesn't display)
- Dataset: 1 valence (test), PRODUCTIVE trait with mount `/generate/introduction`
- Production pipeline (101 lines): Aperture-based

Production workflow:
1. Fetch a sentence via `/pick/literal/feed` with seek criteria
2. Extract all tokens from the sentence's ANNOTATED data
3. Resolve token memories for the current user
4. Generate products routed to different game modes based on memory status:
   - Shadow: for unknown/unlearned content (sentence or tokens)
   - Flashcard: for tokens in LEARNING status
   - Write: for tokens with unknown memory
5. Returns `ProductionResult.nominal({ products })`

The tactic adapts game mode selection based on the learner's current memory state.

## Mode Anatomy

Every mode exports from its .viva.js:

```javascript
export const manifest = { type, slug, name, version, traits };
export const view = new View("buffer/Component.svelte.js");  // if VIEWABLE
export const dataset = { entities: { valence: [...] } };      // if VALENTIC
export const production = new Aperture()...;                   // if PRODUCER
```

**Traits determine wiring:**

| Trait | What it does | Applied by |
|-------|-------------|------------|
| VIEWABLE | Compiles Svelte view, exposes /view endpoint | traitmap.VIEWABLE |
| BUFFERED | Manages buffer state lifecycle | traitmap (runtime) |
| VALENTIC | Creates per-valence routing branches | traits/valentic.js |
| PRODUCER | Attaches production pipeline middleware | traits/producer.js |
| DATASET | Upserts symbols/literals from dataset | traits/dataset.js |
| CHAOSMONKEY | Attaches hallucinator brain | traitmap.CHAOSMONKEY |

**Valence dataset format:**

```javascript
{
  slug: "survival-flashcard",
  type: "SELFEVIDENT",
  traits: ["BUFFERED"],
  data: {
    BUFFERED: {
      recall: "LEARNING",
      seek: { symbols: ["word", "proficiency.survival"] }
    }
  }
}
```

Valences with PRODUCTIVE trait define production configuration:
```javascript
data: {
  PRODUCTIVE: {
    mount: "/generate/introduction",
    queue: 1,
    mask: { batch: 1, stock: 1, seek: { symbols: [...] } }
  }
}
```

## Archived Modes

In `bak/`: agent, strategy, tactic (old version), teacher — 11+ archived experimental modes. These represent abandoned pedagogical approaches from before the kernel simplification.

## Where Used

- **Runtime daemon**: Modes are instantiated during daemon populate, traits applied during resolve
- **Tactic**: Produces products that reference game mode producer IDs
- **Client**: Loads mode views via VIEWABLE URL, manages buffer lifecycle

## Work Packages

### Testing Gaps
- No mode-level tests for any active mode
- No end-to-end mode lifecycle tests (load → trait application → aperture → production)
- Tactic production pipeline has no tests (most complex mode logic)
- No tests for view bundle compilation per mode

### Human Documentation Needs (Divio)
- **Tutorial**: "Build a new game mode" — manifest, view component, dataset, trait selection
- **Reference**: Mode manifest format, trait contracts, valence data structure
- **How-to**: "Add a new tactic" — production pipeline via Aperture, ProductionResult API

### Active Work
- More game modes planned (conjugation practice, more interaction types)
- Tactic entity management still being figured out
- Production pipeline in flux (greed/recall quirks)

### Planned Changes
- Many more modes coming
- Asset integration (VERBALIZED literals with audio)
- Note entity for persistent cross-session mode state

## Maintenance

When adding a new mode:
1. Create directory: `registry/modes/@vivalence/{type}/{slug}/`
2. Export manifest with appropriate traits from `{slug}.viva.js`
3. If VIEWABLE: create `buffer/{Component}.svelte` + wrapper `.svelte.js`
4. If VALENTIC: export dataset with valence entities
5. If PRODUCER: export production Aperture with generation endpoints
6. Wire into circuitry's daemon modes array: `"@vivalence/{type}/{slug}"`
