# Report: Italian noun batch 3 — nature · weather · animals · time · education

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-3.json`

150 entities, JSON array, validated with `python3 -c "import json; print(len(json.load(open('noun-batch-3.json'))))"` → `150`.

## Domain counts

| domain | count |
|---|---|
| domain.nature | 30 |
| domain.weather | 20 |
| domain.animals | 25 |
| domain.weekday | 7 |
| domain.time | 33 |
| domain.education | 35 |

Time total (weekday + time) = 40, matching the brief.

## Gender split

masculine 78 · feminine 72.

## CEFR split

a1 75 · a2 68 · b1 7 (b1 used sparingly for lower-frequency abstract time/weather nouns: istante, decennio, scadenza, durata, vigilia, grandine, rugiada).

## Entity shape

Identical to batch 1: `traits: ["TRANSLATED", "EXEMPLIFIED"]` only, symbols = `word` / `word.lemma.<form>` / `word.part-of-speech.noun` / `word.gender.*` / `word.number.singular` / one `proficiency.cefr.*` / one `domain.*`. No RANKED, no VOCALIZED (injected later per regime).

## Weekdays

`domain.weekday` (not `domain.time`) applied to all 7: lunedì, martedì, mercoledì, giovedì, venerdì, sabato (masculine), domenica (feminine). All lowercase. Examples use the habitual `Il/La + weekday` construction ("Il lunedì vado in palestra") to make the gendered article visible, since bare weekday nouns in Italian usually drop the article in one-off references.

## Judgment calls

- **Dupe collisions found and resolved against sibling `noun-batch-1.json`** (not caught until cross-file script ran): the brief's suggested word lists for animals (`pesce`) and education (`scuola`, `biblioteca`) collided with slugs already staged in batch 1 (`pesce.noun` under domain.food, `scuola.noun`/`biblioteca.noun` under domain.city). Swapped: `pesce` → `tartaruga` (turtle, animals), `scuola` → `liceo` (high school, education), `biblioteca` → `compagno` (classmate, education). A third candidate replacement, `orario`, was also found already taken in batch 1 (domain.transport) and rejected before use. Zero collisions remain (script-verified against all live `dataset/literals/words/*.js` and all sibling `.harvest/staged/*.json`).
- **Greek `-ma` masculine exception**: `clima`, `diploma` tagged masculine despite the `-a` ending (standard Italian rule for Greek-origin `-ma` nouns).
- **`insegnante`** (teacher) is epicene/invariable in Italian; tagged masculine as the citation-form convention (consistent with batch 2's guidance for epicene nouns), no feminine sibling minted since not called out as high-value in this brief.
- **`diploma.noun`** has `known == learning` ("diploma"/"diploma") — legitimate same-word exception per corpus-quality-criteria.md, not a defect.
- **No `proficiency.survival` tag applied** to any entry in this batch — none of nature/weather/animals/time/education are day-one transactional in the sense used for batch 1's food/money domains; all entries carry only a CEFR band + domain.
- **`terra`** (earth/land) and **`attimo`** (instant/moment) use the known `"a / b"` multi-meaning convention per corpus-quality-criteria.md.

## Validation run

- Internal duplicate slugs: none. Internal duplicate example sentences: none.
- Every `learning` word appears verbatim (case-insensitive) inside its own Italian example.
- Every entity has exactly one gender symbol and exactly one domain symbol.
- Cross-checked against all live `english-to-italian/dataset/literals/words/*.js` files (988 existing slugs/examples across all parts of speech) — zero slug or example collisions.
- Cross-checked against sibling staged `noun-batch-1.json` + `adjective-batch-1.json` (270 entities) — zero slug or example collisions after the three swaps above.
