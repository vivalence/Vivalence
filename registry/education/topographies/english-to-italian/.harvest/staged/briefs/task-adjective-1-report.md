# Report: Italian adjective batch 1

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-1.json`

Total entities: 120 (validated via `python3 -c "import json; print(len(json.load(open(...))))"` → 120).

## Shape convention

Followed the noun-batch-1 staged precedent (same brief family): staged entities carry `traits: ["TRANSLATED", "EXEMPLIFIED"]` only — no RANKED (frequency data), no VOCALIZED (no audio assets exist yet for this batch). Both are injected in later enrichment passes per the established staged→live pipeline.

Slug convention (mirrors the `english-to-spanish/dataset/literals/words/adjective.js` exemplar):
- Gendered pair: `<masc>.adjective.masculine.singular` + `<fem>.adjective.feminine.singular`, both carrying `word.lemma.<masc-form>`.
- Gendered word with no authored feminine sibling: `<masc>.adjective.masculine.singular` only (masculine form is still the base/only entity).
- Invariable (-e ending, singular form identical for both genders): `<word>.adjective`, no `word.gender.*` symbol.

## Family / domain counts (120 total)

- colors → `domain.color`: 16 (5 masc/fem pairs + 6 invariable)
- sizes/qualities → `domain.shape`: 26 (7 pairs + 5 masc-only + 7 invariable)
- states → `domain.state`: 24 (6 pairs + 6 masc-only + 6 invariable)
- personality → `domain.mind`: 24 (5 pairs + 6 masc-only + 8 invariable)
- evaluation → no domain symbol (no natural fit in `structural.js`'s domain list): 30 (5 pairs + 10 masc-only + 10 invariable)

Gender split: masculine 55, feminine 28, invariable 37 (55+28+37=120).

## Feminine variants (28 total — brief asked for "~30")

rossa, nera, bianca, gialla, grigia (colors) · piccola, nuova, vecchia, bella, calda, fredda, lunga (sizes) · stanca, malata, pronta, libera, arrabbiata, innamorata (states) · simpatica, seria, curiosa, onesta, allegra (personality) · buona, cara, giusta, sbagliata, perfetta (evaluation)

## Judgment calls

1. **RANKED/VOCALIZED omitted.** The brief for this task didn't restate the noun-batch-1 note explicitly ("staged = same as live minus RANKED, injected later"), but the sibling noun brief in the same `.harvest/staged/briefs/` directory does, and no audio assets exist for these words in `freight/audio/words/`. Followed that precedent rather than inventing RANKED numbers or a VOCALIZED path that would point at a nonexistent mp3.
2. **Feminine variant selection.** The brief names some pairs explicitly with a slash (`piccolo/piccola`, `stanco/stanca`, `simpatico/simpatica`, `buono/buona`, `caro/cara`, etc.) and others explicitly *without* a slash (`brutto`, `occupato`, `cattivo`) — read the no-slash forms as an intentional signal that those get a masculine-only entity. Followed that signal, and applied the same judgment to additional gendered adjectives I added beyond the brief's illustrative list (e.g., `alto`, `corto`, `sicuro`, `pericoloso` are masculine-only; `serio/seria`, `giusto/giusta` got both). Net feminine count landed at 28, close to but under the "~30" target — did not force it to exactly 30 since the brief itself used "~".
3. **Evaluation family has no domain symbol.** `buono/cattivo/facile/difficile/importante/…` don't map onto any existing `domain.*` slug in `structural.js` (no `domain.evaluation` or `domain.quality` exists). Per the brief's "domain.* where natural," left these 30 entities without a domain symbol rather than inventing a new domain slug (manifest/symbol set is fixed — never invent new ones per brief requirement #3).
4. **Gender agreement discipline.** For every masculine-only entity (e.g., `pericoloso`, `sicuro`, `confuso`, `spaventato`), the example sentence was built around a masculine noun so the adjective's masculine ending agrees — not just copying a feminine-noun sentence with the masculine adjective form. Verified this programmatically isn't feasible (no NLP gender tagger in scope) so it was done by hand during authoring and spot-checked.
5. **`avvocata` (feminine of avvocato/lawyer) and `direttrice`/`testimone`/`cantante`** used as feminine-agreement nouns in a few EXEMPLIFIED sentences — modern standard Italian, not archaic or informal.
6. **Uniqueness.** Verified programmatically: no duplicate slugs within the file, no duplicate EXEMPLIFIED `learning` sentences within the file, and no exact-string collision between this batch's example sentences and any sentence already present in `dataset/literals/**/*.js` (verb.js, sentences.js, etc. — all currently empty or non-overlapping).
7. **Symbol whitelist compliance.** Every `proficiency.*` and `domain.*` symbol used was checked against `dataset/symbols/structural.js` programmatically — zero symbols outside the whitelist.

## Validation run

```
python3 -c "import json; print(len(json.load(open('/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-1.json'))))" → 120
```

Additional automated checks performed (all passed): no duplicate slugs; `learning` always lowercase; `learning` is a substring of its own EXEMPLIFIED `learning` sentence; no diacritics in `known`; `known != learning` for every entry; no duplicate EXEMPLIFIED sentences within the file; every entity has `word`, `word.lemma.*`, `word.part-of-speech.adjective`, `word.number.singular`, and a `proficiency.cefr.*` symbol; all `domain.*`/`proficiency.*` symbols exist in `structural.js`.
