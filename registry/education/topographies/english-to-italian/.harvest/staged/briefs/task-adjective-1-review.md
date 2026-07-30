# Review: Italian adjective batch 1

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-1.json`

## Mechanical checks (scripted)

- JSON parses, count = 120. Matches spec.
- Slug format `<form>.adjective[.masculine|feminine.singular]`: all 120 conform. No dupes within file. No slug collisions against the live dataset (`dataset/literals/words/adjective.js` is currently `export default []`; checked against all other word-family files too — zero collisions).
- form-in-example law (EXEMPLIFIED.learning contains TRANSLATED.learning exactly): 0 violations across all 120 entities.
- Example uniqueness: no duplicate EXEMPLIFIED.learning strings within the file; zero collisions against every EXEMPLIFIED.learning in the live dataset (verb.js, adverb.js, pronoun.js, etc.).
- Symbols: every `proficiency.*`/`functional.*`/`domain.*` slug used exists in `structural.js` (50 legal structural symbols; 0 illegal references). No invented domains — the "evaluation" family (30 entities: buono/cattivo/facile/difficile/importante/etc.) correctly carries no `domain.*` symbol since none fits, rather than inventing one.
- Gender symbols: every `.masculine.singular` slug carries `word.gender.masculine`, every `.feminine.singular` slug carries `word.gender.feminine`, every invariable `<form>.adjective` slug carries neither. 0 violations.
- `word.lemma.<form>` matches `TRANSLATED.learning` for masculine and invariable entities (feminine entities correctly point their lemma at the masculine sibling form, e.g. `rossa` → `word.lemma.rosso`, by design). All 28 feminine variants pair to an existing masculine sibling sharing that lemma — no orphan feminine entities.
- `known` conventions: all 28 feminine variants carry `(fem.)`. All multi-meaning glosses use `" / "` with correct spacing — except one, see Important #1 below.
- Structural completeness: every entity has `word`, `word.part-of-speech.adjective`, `word.number.singular`, a `word.lemma.*`, and a `proficiency.cefr.*` symbol.
- Counts match the implementer's report exactly: 55 masculine-slugged, 28 feminine-slugged, 37 invariable = 120; colors 16 / shape 26 / state 24 / mind 24 / evaluation 30 (no domain).

## Linguistic checks (adversarial, native-level Italian)

Read all 120 entities' `learning` forms, examples, and gender/article agreement by hand. Findings:

### Important

1. **`dolce.adjective`** — `known: "sweet(-natured)"`. This is the only entity in the batch that deviates from the specified multi-meaning convention (`"X / Y"`). "Dolce" genuinely covers two senses (sweet-tasting and sweet-natured), so per the stated convention this should read `"sweet / sweet-natured"`, not a parenthetical suffix. Mechanical `known`-format check flags this as the sole outlier across all 120 entries.
   - Fix: change `known` to `"sweet / sweet-natured"`.

### Minor

1. **Noun-subject reuse across unrelated entities** (not a rule violation — each EXEMPLIFIED sentence is unique — but reduces lexical variety within the batch):
   - `libro` used in both `rosso.adjective.masculine.singular` ("Il libro è rosso") and `raro.adjective.masculine.singular` ("Il libro è raro").
   - `vestito` used in both `rosa.adjective` ("Il vestito è rosa") and `corto.adjective.masculine.singular` ("Il vestito è corto").
   - `soluzione` used in both `perfetta.adjective.feminine.singular` ("La soluzione è perfetta") and `possibile.adjective` ("La soluzione è possibile").
   - (The `turista`/`turista` reuse across `curioso`/`curiosa` is intentional and fine — it's the masculine/feminine pair demonstrating agreement on the same epicene noun.)
   - Not a defect, just worth varying subjects if this batch is revised.

2. **`cattivo.adjective.masculine.singular`** — example "Il tempo è cattivo" ("The weather is bad") is grammatically correct and understandable, but a native speaker would more idiomatically say "Il tempo è brutto" for bad weather. `cattivo` more naturally collocates with character/behavior ("un cane cattivo", "un bambino cattivo") than weather. Not wrong, just a slightly unnatural collocation choice given `brutto` (already in this same batch, entity `brutto.adjective.masculine.singular`) would have been the more idiomatic pick for this sense.

3. **`gigante.adjective`** — "gigante" is primarily a noun ("il gigante" = "the giant"); its use as an invariable adjective ("un'onda gigante") is real, attested, and increasingly common in modern usage, but is somewhat more colloquial than the fully adjectival `gigantesco`. Not incorrect, worth flagging as a slightly informal register choice for an A2 entity.

4. **Gloss overlap**: `sveglio.adjective.masculine.singular` ("awake / alert") and `vigile.adjective` ("alert") both surface the English word "alert" for two distinct Italian lemmas. This is inherent synonym overlap rather than a defect (both glosses are individually accurate), but could momentarily read as redundant to a learner encountering both cards.

No critical findings: no fabricated symbols, no gender-agreement errors, no mistranslations, no malformed slugs, no broken form-in-example instances, no duplicate/colliding examples or slugs anywhere in the batch.
