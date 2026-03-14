# @vivalence Kernels

> Domain knowledge, ontologies, and curricula. The what-is-being-learned layer.

## Role

Domain + Data. Kernels define what vivalence knows about — the learning domain logic, the symbolic ontologies, and the curriculum datasets. Everything under this @vivalence scope is authored by Finn and represents the first-party knowledge system.

Three kernel types compose together: one **domain** (the learning engine), multiple **ontologies** (what kinds of things exist), and multiple **topologies** (what specific things to teach, in what order).

## Package Map

```
kernels/@vivalence/
├── domain/learning/          The learning engine (entities, memory, pick/review API)
├── ontology/
│   ├── word/                 Universal Dependencies POS hierarchy
│   └── sentence/             Grammatical structure hierarchy
└── topology/
    ├── english-to-brazilian-survival/   Main curriculum (~14k lines of data)
    ├── english-to-brazilian-a1/         A1 proficiency subset
    ├── english-to-brazilian-a2/         A2 proficiency subset
    └── bak/                             Archived (Spanish, Latin, etc.)
```

## Domain: Language Learning

`domain/learning/domain.viva.js` — type: "domain", slug: "language-learning", version: "0.0.5"

Exports: entities, modes (Game + Tactic prototypes), aperture (pick/review endpoints).

### Entities

Four entity schemas from `entities/index.js`:

**Literal** `entities/kernel/Literal.ts` (87 lines) — extends typology's LiteralEntity.
Traits: TRANSLATED, EXEMPLIFIED, RANKED, ANNOTATED.
Additional: `rank` (frequency, lower = more common), `memories` (1:many → Memory).

Trait data contracts:
- TRANSLATED: `{ known: "hello", learning: "olá" }`
- EXEMPLIFIED: `{ known: "Hi!", learning: "Oi!" }`
- RANKED: `{ rank: 100, zipf: 7.5, fpm: 50000 }`
- ANNOTATED: `{ tokens: [...], pos: "noun", ... }`

**Symbol** `entities/kernel/Symbol.ts` (36 lines) — extends typology's SymbolEntity.
Symbol traits via `symbol.data`: LEARNABLE `{ driver: "BAYESIAN", type: "INDIVIDUAL" }`, COMPLETABLE (mutually exclusive with LEARNABLE).

**Memory** `entities/userspace/Memory.ts` (105 lines) — new entity.
Properties: user (m:1), literal (m:1), driver (BAYESIAN/BOOLEAN/AGENTIC), type (INDIVIDUAL/RELATIONAL), status (UNTOUCHED→UNKNOWN→LEARNING→KNOWN→GRADUATED), state (JSON, driver-specific), history (JSON[], last 10), nextIn (hours), nextAt (Date), lastAt (Date).
Unique: `[user, literal]`.

**Product** `entities/userspace/Product.ts` (32 lines) — extends typology's ProductEntity. Batch container for review.

### Memory System

`memory/` — pluggable drivers with a common contract:

```
initiate(signal) → state
schedule(memory) → { nextIn, nextAt }
strength(memory) → number [0-1]
status(memory) → enum
update(memory, signal) → state
```

**Bayesian** `memory/bayesian/index.js` (163 lines) — ebisu-js spaced repetition.
State: `[alpha, beta, tau]`. Signal → tau: MASTERY=24h, SUCCESS=3.4h, NEUTRAL=1h, MISTAKE=0.15h, FAILURE=0.08h.
Status thresholds: UNKNOWN (<6h), LEARNING (>=6h), KNOWN (>7d), GRADUATED (>45d).

**Boolean** `memory/boolean/index.js` (39 lines) — binary yes/no. GRADUATED or UNKNOWN.

**Driver selection** `memory/index.js` (100 lines) — literal-only → BAYESIAN. Symbol scope → reads `symbol.data.LEARNABLE.driver`.

**Signal schema** `memory/schema.js` (55 lines) — accepts enum string, enum object, or ratio `{ success, total }`.

### Aperture (Pick/Review API)

**Pick** (query/selection):
- `GET /pick/literal/feed` (48L) — balanced: due first, then novel
- `GET /pick/literal/novel` (60L) — unlearned, ordered by rank ASC
- `GET /pick/literal/due` (156L) — past review date, JOIN with memories
- `GET /pick/literal/byStatus` — filter by memory status
- `GET /pick/literal/byStrength` — sort by recall probability

**Review** (mutation):
- `POST /review/product` (38L) — batch: reviews all literals+symbols in a product
- `POST /review/literal` (64L) — single literal, delegates to /review/memory
- `POST /review/symbol` (40L) — validates LEARNABLE, delegates to /review/memory
- `POST /review/memory` (283L) — core: create or update memory record with driver, schedule, history

### Mode Prototypes

`modes/index.js` (47 lines) — Game and Tactic classes extending Mode. Traits map: `smurf: () => {}`. Agent/Teacher/Strategy commented out.

## Ontologies

Symbol hierarchies that define what kinds of things exist in the learning system.

### Word Ontology

`ontology/word/word.viva.js` — type: "ontology", slug: "word", version: "0.1.1", traits: ["DATASET"]

Symbol hierarchy (950 lines): Universal Dependencies POS tags.
Root: `word` (ONTOLOGICAL, LABELED).
Children: `word.part-of-speech.{adjective, adposition, adverb, auxiliary, coordinating-conjunction, determiner, interjection, noun, particle, pronoun, proper-noun, punctuation, subordinating-conjunction, symbol, verb, x}` — 16 POS categories.

### Sentence Ontology

`ontology/sentence/sentence.viva.js` — type: "ontology", slug: "sentence", version: "0.1.1", traits: ["DATASET"]

Symbol hierarchy (464 lines): grammatical structure.
- `sentence.force.{declarative, interrogative, imperative, exclamative}`
- `sentence.mood.{indicative, subjunctive}`
- `sentence.tense.{present, past, future}`
- `sentence.aspect.{perfective, imperfective}`

## Topologies

Language pair curricula — the actual vocabulary and sentence datasets.

### english-to-brazilian-survival (main)

`topology/english-to-brazilian-survival/` — version: 0.2.0, traits: ["DATASET"]

The bulk of the data:
- `symbols/structural.js` (464L) — proficiency levels: survival, high-frequency, brazilianism, CEFR a1-c2
- `literals/words/` — 12 POS files. verb.js (6,741L), noun.js (2,559L) dominate
- `literals/sentences.js` (1,897L)

Literal format:
```javascript
{
  slug: "dia.noun",
  traits: ["EXEMPLIFIED", "TRANSLATED", "RANKED"],
  data: {
    TRANSLATED: { known: "day", learning: "dia" },
    EXEMPLIFIED: { known: "Good morning", learning: "Bom dia" },
    RANKED: { rank: 588, zipf: 6.23, fpm: 1700.0 }
  },
  symbols: [
    { slug: "word" },
    { slug: "word.gender.masculine" },
    { slug: "proficiency.survival" }
  ]
}
```

### english-to-brazilian-a1 / a2

Smaller subsets at A1 and A2 proficiency levels. Same structure.

### Archived Topologies

`topology/bak/` — Spanish, Latin, other languages. Not active.

## How Kernels Compose

A daemon's circuitry declares kernel references:
```javascript
kernel: [
  "@vivalence/domain/language-learning",
  "@vivalence/ontology/word",
  "@vivalence/ontology/sentence",
  "@vivalence/topology/english-to-brazilian:survival",
]
```

During daemon populate, paladin resolves these via VIP. The domain provides the engine (entities, aperture, mode prototypes). Ontologies and topologies provide DATASET content — their symbols and literals get upserted into the database via the DATASET trait.

The domain aperture (pick/review) then queries this data to serve study items and record reviews.

## Where Used

- **Runtime daemon**: Domain loaded as first kernel, aperture mounted with auth
- **Game modes**: Call pick endpoints to get items, review endpoints to record responses
- **Tactic modes**: Call pick/feed to get items for production pipeline
- **DATASET trait**: Ontology and topology datasets are upserted during daemon resolve

## Work Packages

### Testing Gaps
- No tests for pick endpoints (feed algorithm, novel query, due query)
- No tests for review/memory endpoint (create vs update flows, history capping)
- No tests for memory drivers (Bayesian initiate/update/schedule, Boolean)
- No tests for driver selection logic
- No tests for signal schema validation
- No tests for ontology symbol hierarchy correctness
- No tests for topology literal format validation

### Human Documentation Needs (Divio)
- **Explanation**: "Why Bayesian memory? How ebisu works" — signal→tau, status thresholds
- **Reference**: Pick/review API contracts, memory driver interface, signal schema
- **Tutorial**: "Add a new topology" — dataset format, literal/symbol associations, proficiency symbols
- **How-to**: "Add a new memory driver" — implement the 5-method interface
- **How-to**: "Add a new ontology" — symbol hierarchy format, ONTOLOGICAL + LABELED traits

### Active Work
- Asset entity type (VERBALIZED trait on literals, mp3 vocalization)
- More topologies (vocabulary expansion, new languages)
- Progression system (eventually)

### Planned Changes
- Note entity type (persistent cross-session state)
- Classifier (eventual — automatic difficulty assessment)

## Maintenance

When modifying kernels:
1. Memory driver changes: verify signal→tau produces sensible intervals
2. Pick endpoint changes: verify feed balances due vs novel
3. Entity changes: update entities/index.js, run migrations
4. New topology: follow literal format with trait-keyed data, associate symbols via slug
5. New ontology: create symbol hierarchy with ONTOLOGICAL + LABELED traits, export as DATASET
