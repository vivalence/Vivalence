# Report: Italian adjective batch 4

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-4.json`

Total entities: 130 (verified via `json.load` + `len()`).

## Blocking set built first

Parsed live `dataset/literals/words/adjective.js` (350 entities) and every sibling file — `dataset/literals/words/*.js` (verb/noun/pronoun/etc.), `dataset/literals/sentences.js`, and all `.harvest/staged/*.json` — into one slug set (5964 raw `"slug"` occurrences, including nested symbol slugs — overinclusive by design) plus a `"learning"` (example-sentence) string set. Confirmed `adjective-batch-1/2/3.json` (120+100+130=350) are already fully absorbed into the live 350 — no double-counting risk.

## Shape convention (matched from live)

- `traits: ["TRANSLATED", "EXEMPLIFIED"]` only, no `RANKED` (matches staged batches 1-3; RANKED added at integration time).
- Gendered pair: `<masc>.adjective.masculine.singular` + `<fem>.adjective.feminine.singular`, both carrying `word.lemma.<masculine-form>` (confirmed against 124 live feminine entries: lemma is **always the masculine form**, never the feminine form itself — the brief's parenthetical said "= the feminine form" but its own instruction to "inspect and match" the live convention overrides that; matched what's actually there).
- Invariable (-e/-ista ending): `<word>.adjective`, no `word.gender.*`, still carries `word.number.singular`.
- `known` for feminine = `<masc known> (fem.)`, confirmed against live `italiano/italiana`, `tedesco/tedesca` nationality pairs.

## Family counts (130, sums exactly per brief's 20/20/25/35/30 split)

- **Ordinals (20)**: `primo`–`decimo` (10 lemmas × masc/fem). `ultimo/ultima` moved to frequency/time (semantically a time-reference word, and keeps ordinals at exactly 20 instead of 22). Symbol: `functional.number` (no domain symbol, per brief).
- **Materials (20)**: 7 pairs (`metallico/a`, `prezioso/a`, `solido/a`, `lucido/a`, `opaco/a`, `elastico/a`, `sintetico/a`) + 6 invariable (`trasparente`, `naturale`, `impermeabile`, `infiammabile`, `artificiale`, `durevole`). Symbol: `domain.shape`.
- **Frequency/time (25)**: 9 pairs (`quotidiano/a`, `moderno/a`, `antico/a`, `prossimo/a`, `scorso/a`, `immediato/a`, `futuro/a`, `passato/a`, `ultimo/a`) + 7 invariable (`settimanale`, `mensile`, `annuale`, `recente`, `breve`, `frequente`, `costante`). Symbol: `domain.time`.
- **Character-2 (35)**: 13 pairs (`maleducato/a`, `saggio/a`, `distratto/a`, `attento/a`, `maturo/a`, `bugiardo/a`, `creativo/a`, `severo/a`, `avaro/a`, `determinato/a`, `riservato/a`, `premuroso/a`, `schietto/a`) + 9 invariable (`impaziente`, `egoista`, `prudente`, `leale`, `fedele`, `affidabile`, `responsabile`, `socievole`, `ottimista`). Symbol: `domain.mind`.
- **Feminine gap-fills (30)**: highest-frequency (lowest `rank`) of the 36 masculine-only live entries — `vero, alto, sicuro, chiaro, economico, intero, doppio, minimo, americano, brutto, spagnolo, greco, falso, cattivo, corretto, pericoloso, occupato, adatto, sano, corto, raro, indiano, confuso, brasiliano, svizzero, messicano, generoso, triplo, umido, spaventato`. Left the 6 lowest-frequency gaps untouched (`gelido, piovoso, ventoso, soleggiato, afoso`, plus `spaventato` boundary — top-30-by-rank cutoff).

## Blocking-set findings — brief's suggestions already taken, dropped/swapped

- Materials: `rosa/viola/blu` (colors, already live invariables), `fragile` (already live invariable) — dropped. `plastico` — brief flagged with "?", skipped for `artificiale` instead (avoids the plastico/plastica-noun ambiguity).
- Character-2: `onesto/onesta`, `educato/educata`, `curioso/curiosa`, `testardo/testarda`, `paziente` — all **already fully live with both genders**, dropped entirely. `generoso/generosa` — masc already live; only the feminine half was needed, so it was routed through the gap-fill category instead of duplicated here (`generoso.adjective.masculine.singular` was never recreated).
- Also caught mid-build (not in brief, found via grep): `calmo/calma`, `nervoso/nervosa`, `tranquillo/tranquilla` — all already fully live — swapped out for `riservato/a`, `premuroso/a`, `schietto/a`.
- `futuro` and `passato` exist live only as **nouns** (noun.js) — used here as legitimate distinct-POS adjectives (`generazioni future`-style, `la settimana passata`-style), no slug collision.

## Validation run (all passed, 0 errors)

```
Entity count: 130
Internal duplicate slugs: none
Internal duplicate EXEMPLIFIED examples: none
Slug collisions vs live corpus + all staged siblings: none
Example-sentence collisions vs live corpus + all staged siblings: none
learning form appears verbatim in its own EXEMPLIFIED learning sentence: 130/130
learning is lowercase: 130/130
known != learning: 130/130
No Italian diacritics in known field: 130/130
Exactly 1 word.lemma symbol per entity: 130/130
word symbol + part-of-speech.adjective symbol present: 130/130
word.gender.* present iff gendered slug, absent iff invariable: 130/130 consistent
word.number.singular present on every entity: 130/130
proficiency.cefr.* present on every entity: 130/130
gap-fill masculine lemma targets all confirmed live: 30/30
Manual gender-agreement read-through of all 130 example sentences (article/noun/adjective agreement, incl. compound-tense participle agreement on scorso/passato): clean
```

## Concerns

None blocking. One soft note: `minima.adjective.feminine.singular` known field is `"minimum (fem.)"` but its EXEMPLIFIED English example says "The speed is minimal" (not the literal string "minimum") — this exactly mirrors the already-live masculine sibling `minimo` ("minimal" for known "minimum"), so it's an inherited convention from the live corpus, not a new deviation.
