> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — registry/kernels (container)

Domain + Data. The what-is-being-learned. Three kernel types compose into a curriculum: one *domain* (the learning engine), N *ontologies* (what kinds of things exist), N *corpora* (what specific things, in what order). Read `.ikiro/CLAUDE.md` first.

## architecture

engine + symbols + instances, composed by daemon circuitry.

A daemon's `kernel: [...]` array names module references; paladin resolves them via VIP; the daemon's resolve phase calls each kernel's DATASET trait, upserting symbols + literals into the database. Domain kernels carry no DATASET payload — they bring entities, aperture endpoints, and mode prototypes (the runnable shape that operates over upserted data).

three types, three roles:

- domain — the engine. Entities (Literal, Symbol, Memory, Product), aperture (pick/review), mode prototypes (Game, Tactic). One per daemon.
- ontology — symbol hierarchies. Word ontology = Universal Dependencies POS tags. Sentence ontology = force/mood/tense/aspect. Conjugation ontology is minimal (single TOPOGRAPHICAL `conjugation` symbol); dimensional symbols come from word.
- corpus — language pair curricula. Literals (vocabulary items) + symbol associations (POS, proficiency, etc.). Trait-keyed data: TRANSLATED, EXEMPLIFIED, RANKED, ANNOTATED, VOCALIZED, CONJUGATED.

structure:

```
registry/kernels/@vivalence/
├── domain/learning/                      the learning engine
│   ├── domain.viva.js                    type=domain, slug=language-learning, v0.0.5
│   ├── entities/
│   │   ├── kernel/Literal.ts             extends LiteralEntity + traits + repository methods
│   │   ├── kernel/Symbol.ts              extends SymbolEntity + LEARNABLE/COMPLETABLE
│   │   ├── userspace/Memory.ts           user × literal, status machine, history
│   │   └── userspace/Product.ts          batch container
│   ├── memory/
│   │   ├── bayesian/index.js             ebisu spaced repetition (163 lines)
│   │   ├── boolean/index.js              binary GRADUATED|UNKNOWN (39 lines)
│   │   ├── schema.js                     signal validation (55 lines)
│   │   └── index.js                      driver selection (100 lines)
│   ├── aperture/                         pick/review HTTP routes
│   └── modes/                            Game, Tactic prototypes (47 lines)
├── ontology/
│   ├── word/                             UD POS hierarchy (~950 symbols)
│   ├── sentence/                         force/mood/tense/aspect (464 lines)
│   └── conjugation/                      thin — uses word symbols
└── corpus/
    ├── english-to-brazilian/             merged curriculum (2086 literals, 51 symbols)
    ├── english-to-brazilian-vocalized/   vocalized variant (audio assets)
    └── bak/                              survival/a1/a2 archived after merge; Spanish, Latin
```

domain entities — Literal extends typology's LiteralEntity; traits TRANSLATED / EXEMPLIFIED / RANKED / ANNOTATED / VOCALIZED / CONJUGATED. Additional fields: `rank` (frequency, lower = higher priority), `memories` (1:many → Memory). Repository methods accept `(where, opts?)` where opts = `{ limit, blacklist, populate }`: `feed`, `novel`, `due`, `byStrength`, `byLastSignal`. Symbol extends SymbolEntity — `data.LEARNABLE.{driver, type}` and `data.COMPLETABLE` are mutually exclusive. Memory (`entities/userspace/Memory.ts`, 105 lines) is unique on `[user, literal]`; status flow UNTOUCHED → UNKNOWN → LEARNING → KNOWN → GRADUATED; `state` JSON is driver-specific; `history` JSON[] retains last 10 signals; `nextIn` (hours) + `nextAt` (Date). Product extends ProductEntity — batch container.

LiteralSubscriber (afterFlush) — resolves ANNOTATED token slugs + CONJUGATED paradigm/infinitive slugs → `uses` junction rows via raw SQL.

memory drivers (common contract):

```
initiate(signal) → state
schedule(memory) → { nextIn, nextAt }
strength(memory) → number [0-1]
status(memory) → enum
update(memory, signal) → state
```

- bayesian — ebisu-js. State `[alpha, beta, tau]`. Signal→tau: MASTERY=24h, SUCCESS=3.4h, NEUTRAL=1h, MISTAKE=0.15h, FAILURE=0.08h. Status thresholds: UNKNOWN <6h, LEARNING ≥6h, KNOWN >7d, GRADUATED >45d.
- boolean — binary yes/no. GRADUATED or UNKNOWN. No spacing.
- driver selection (`memory/index.js`) — literal-only → BAYESIAN. Symbol scope → reads `symbol.data.LEARNABLE.driver`.

trait data contracts (literal):

- TRANSLATED — `{ known: "hello", learning: "olá" }`
- EXEMPLIFIED — `{ known: "Hi!", learning: "Oi!" }`
- RANKED — `{ rank: 100, zipf: 7.5, fpm: 50000 }` (words) or `{ rank: 1 }` (conjugations, self-referential)
- ANNOTATED — `{ tokens: [...] }` — sentence tokens with literal slug refs
- VOCALIZED — `{ asset: { path: "words/falo.mp3" } }`
- CONJUGATED — `{ infinitive: "slug", paradigm: { firstSingular, thirdSingular, firstPlural, thirdPlural: "slug" } }`

aperture — pick/review:

- pick (query) — `GET /pick/literal/{feed, novel, due, byStatus, byStrength}`. `feed` (48 lines) balances due first then novel. `novel` (60 lines) unlearned, ordered by rank ASC. `due` (156 lines) past review date, JOIN with memories.
- review (mutation) — `POST /review/{product, literal, symbol, memory}`. `/review/memory` (283 lines) is the core: create or update memory record with driver, schedule, history.

literal format (corpus):

```javascript
{
  slug: "dia.noun",
  traits: ["EXEMPLIFIED", "TRANSLATED", "RANKED"],
  data: {
    TRANSLATED: { known: "day", learning: "dia" },
    EXEMPLIFIED: { known: "Good morning", learning: "Bom dia" },
    RANKED: { rank: 588, zipf: 6.23, fpm: 1700.0 },
  },
  symbols: [
    { slug: "word" },
    { slug: "word.gender.masculine" },
    { slug: "proficiency.survival" },
  ],
}
```

how kernels compose — daemon circuitry declares:

```
kernel: [
  "@vivalence/domain/language-learning",
  "@vivalence/ontology/word",
  "@vivalence/ontology/sentence",
  "@vivalence/corpus/english-to-brazilian",
]
```

Domain provides engine. Ontologies + corpora provide DATASET that gets upserted at daemon resolve via the DATASET trait (chunks of 100). The domain aperture then queries this data to serve study items and record reviews.

## context

consumers:

- runtime daemon — domain loaded as first kernel, aperture mounted with auth via lighthouse
- game modes — call `/pick` endpoints (feed/novel/due) for items, `/review` to record signals
- tactic modes — call pick.feed directly via `ctx.daemon.entities.literal.feed()` (skipping aperture)
- DATASET trait — ontology + corpus datasets upserted during daemon resolve

testing gaps — **biggest test blind spot in the system**. Repo-wide test pyramid is inverted: 54 typology tests at the foundation, 1 kernel test (`bayesian.test.js`, 36 steps) at the product surface. The learning domain — the *product* — is the least verified layer. Specifics:

- no tests for pick endpoints (feed, novel, due, byStatus, byStrength — 5 routes, 0 coverage)
- no tests for review endpoints (product, literal, symbol, memory — 4 routes, 0 coverage)
- no tests for `/review/memory` (the 283-line core mutation: create vs update flows, history capping)
- no tests for Boolean + COUNTER memory drivers in isolation — same 5-method contract as Bayesian, would benefit from a shared parity scenario
- no tests for driver selection logic, signal schema validation
- no tests for ontology symbol-hierarchy correctness or corpus literal-format validation
- no test for the DATASET trait — the bridge from kernels to DB; if it breaks, all corpus data fails to load (also flagged in runtime IKIRO context)

active work:

- VOCALIZED trait + asset entity type — pending typology enum expansion (see `.ikiro/longdistance.workpackage.org`)
- more corpora (vocabulary expansion, additional language pairs)
- progression system (eventually)

planned changes:

- Note entity type (persistent cross-session state)
- Classifier (eventual — automatic difficulty assessment)
- Buffer/Intent migration — entity renames in aperture endpoints
- harness may introduce domain-specific part types (prosody, expression — open string per harness workpackage)

quality criteria — `registry/kernels/@vivalence/.ikiro/corpus-quality-criteria.md` is the canonical data quality checklist (TRANSLATED/EXEMPLIFIED/VOCALIZED/RANKED contracts, symbol requirements, verb conventions, suffix encoding for diacritics, 14-item audit). Read before touching any corpus literal.
