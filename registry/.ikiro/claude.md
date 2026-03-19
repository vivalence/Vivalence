> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# Registry

> Marketplace of composable packages. Kernels, modes, services, and wafers — discovered by manifest, loaded by VIP.

## Role

Feature + Domain + Infrastructure registry. Everything that makes the system do something specific lives here. The registry is a flat namespace of packages, each exporting a `.viva.js` manifest. Paladin's VIP system mounts directories, indexes manifests by owner/type/slug/version, and resolves them on demand via `accio()`.

## Structure

```
registry/
├── kernels/@vivalence/       Domain knowledge + data
│   ├── domain/learning/      Language learning domain (entities, memory, aperture, modes)
│   ├── ontology/word/        Word ontology (Universal Dependencies POS hierarchy)
│   ├── ontology/sentence/    Sentence ontology (force, mood, tense, aspect)
│   └── topology/             Language pair curricula
│       ├── english-to-brazilian-survival/
│       ├── english-to-brazilian-a1/
│       └── english-to-brazilian-a2/
├── modes/@vivalence/         Gameplay modes
│   ├── game/flashcard/       Classic recall (VIEWABLE, BUFFERED, VALENTIC)
│   ├── game/write/           Writing practice (VIEWABLE, VALENTIC)
│   ├── game/shadow/          Shadow reading (VIEWABLE, VALENTIC, BUFFERED)
│   └── tactic/test/          Production orchestrator (VALENTIC, PRODUCER)
├── services/@vivalence/      Infrastructure (see services/.ikiro/claude.md)
│   ├── datamap/libsql/
│   ├── hallucinator/hal/
│   ├── lighthouse/multiplayer/
│   └── nlp/
└── wafers/@vivalence/        Circuit definitions
    ├── circuitry/runtime/    Runtime circuit
    ├── circuitry/html/       Client circuit
    └── variant/multiplayer/  Multiplayer variant
```

## .viva.js Manifest Pattern

Every registry entry exports a `.viva.js` file as its entry point. The manifest is the identity contract:

```javascript
export const manifest = {
  type: "domain" | "ontology" | "topology" | "game" | "tactic" |
        "service" | "datamap" | "hallucinator" | "lighthouse" | "circuit",
  slug: "unique-identifier",
  name: "Human-readable name",
  version: "0.0.1",
  traits: ["DATASET", "VIEWABLE", "BUFFERED", "VALENTIC", "PRODUCER", "FRAUGHT", ...],
};
```

Beyond the manifest, entries export type-specific content:

| Type | Additional Exports |
|------|-------------------|
| domain | entities, modes, traits, aperture |
| ontology | dataset (symbol hierarchy) |
| topology | dataset (literals + symbol associations) |
| game | view, dataset (valences), optionally freight |
| tactic | dataset (valences), production (Aperture pipeline) — migrating to emitter (Vector) |
| service | provider(config), optionally aperture |
| circuit | runtime, clients, daemons[], services[] |

## Discovery + Loading Flow

1. **Circuitry** declares module references as strings: `"@vivalence/domain/language-learning"`
2. **Paladin** scans registry directories, imports all .viva.js files, registers in Pensieve (owner → type → slug → version)
3. **VIP.accio(query)** resolves a string to the loaded module (with semver version matching)
4. **Runtime** calls `accioMap` to bulk-resolve a daemon's entire dependency tree

## Kernel Types

Three types, each with a distinct role:

**Domain** — the learning system itself. Exports entities (Literal, Symbol, Memory, Product), aperture (pick/review endpoints), mode prototypes (Game, Tactic), and traits. One domain per daemon.

**Ontology** — symbol hierarchies. Word ontology follows Universal Dependencies (POS tags). Sentence ontology covers force/mood/tense/aspect. Ontologies export DATASET with symbols that get upserted into the database.

**Topology** — language pair curricula. Each topology exports DATASET with literals (vocabulary items) and their symbol associations (POS, proficiency level, etc.). Literals carry data in trait-keyed structures: TRANSLATED, EXEMPLIFIED, RANKED, ANNOTATED.

## Circuit/Wafer Pattern

Circuits (in wafers/) define system composition — which daemons run, which services they consume, which clients connect. A circuit's .viva.js exports:

```javascript
export const manifest = { type: "circuit", slug: "runtime" };
export const runtime = { slug, statics, datamap };
export const services = [...];
export const daemons = [{
  slug, kernel: [...module refs], modes: [...module refs],
  lighthouse: {...}, datamap: {...}, hallucinator: {...},
  consume: {...}
}];
```

Paladin resolves circuits during `resolve.circuitry()` and compiles them into `paladin.variant`.

## Where Used

- **Paladin**: VIP mounts and indexes the entire registry
- **Runtime**: Resolves all daemon dependencies from registry via accioMap
- **Daemon lifecycle**: Modes, kernels, and services loaded from registry during populate phase

## Work Packages

### Testing Gaps
- No registry-level integration tests for .viva.js loading
- No tests for manifest validation (missing fields, version conflicts)
- No tests for VIP resolution across registry entries

### Human Documentation Needs (Divio)
- **Tutorial**: "Create a new language learning daemon" — wire circuitry, add kernel references, pick modes
- **How-to**: "Add a topology" — dataset format, literal/symbol contract, proficiency levels
- **How-to**: "Add a new game mode" — manifest, view, dataset, traits
- **Reference**: .viva.js contract specification per type

### Active Work
- New modes incoming ("shittons of games" — conjugation practice, more game types)
- Asset entity type (VERBALIZED trait on literals, mp3 vocalization)
- Note entity type (persistent cross-session state for modes)
- Hallucinator service contract changing to faculty array — see [cortex.workpackage.org](../.ikiro/cortex.workpackage.org)
- Buffer/Intent migration — mode trait renames, valence→intent dataset format change
- Package manager — registry evolving into jj-driven discovery scopes — see [very-important-packagemanager.workpackage.org](../.ikiro/very-important-packagemanager.workpackage.org)

### Dead / Archived
- `modes/bak/`: agent, strategy, tactic (old version), teacher — 11+ archived modes
- `topology/bak/`: Spanish, Latin, and other language topologies
- `services/hallucinator/hal/archive/`: Groq, OpenAI, Perplexity, TogetherAI providers

## Maintenance

When adding a new registry entry:
1. Create directory under the appropriate category: `registry/{type}/@vivalence/{slug}/`
2. Export manifest + type-specific content from `{name}.viva.js`
3. Wire into circuitry if needed (daemon kernel/modes, or system services)
4. VIP will discover it automatically when the directory is mounted
5. For modes: declare traits that match what the daemon's traitmap supports
