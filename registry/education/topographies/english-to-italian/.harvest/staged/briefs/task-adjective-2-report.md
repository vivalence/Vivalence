# Report: Italian adjective batch 2

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-2.json`

Total entities: 100 (validated via `python3 -c "import json; print(len(json.load(open('<staged path>'))))"` → 100).

## Shape convention

Followed batch-1's established staged convention (which itself mirrors the `english-to-spanish/dataset/literals/words/adjective.js` exemplar, minus RANKED/VOCALIZED since no frequency lookup or audio assets exist yet for this batch):
- `traits: ["TRANSLATED", "EXEMPLIFIED"]` only.
- Gendered pair: `<masc>.adjective.masculine.singular` + `<fem>.adjective.feminine.singular`, both carrying `word.lemma.<masc-form>`.
- Gendered word with no authored feminine sibling: `<masc>.adjective.masculine.singular` only, still carrying `word.gender.masculine`.
- Invariable (-e ending): `<word>.adjective`, no `word.gender.*` symbol.
- Proficiency: mix of `proficiency.cefr.a2` and `proficiency.cefr.b1` per the brief's "A2/B1 breadth" (batch-1 was cefr.a1-weighted survival vocabulary; this batch is deliberately pitched higher).

## Family counts (100 total)

- nationalities → `domain.social`: 20 (3 masc/fem pairs + 7 masculine-only + 7 invariable)
- weather/temperature → `domain.weather`: 12 (2 pairs + 6 masculine-only + 2 invariable)
- quantity/measure → no domain fit in `structural.js`: 18 (5 pairs + 4 masculine-only + 4 invariable)
- description/appearance → `domain.shape`/`domain.body`/`domain.home`/`domain.state`/none: 30 (12 pairs + 6 invariable)
- abstract/evaluation → no domain fit: 20 (8 pairs + 4 invariable)

Gender split: masculine 34, feminine 26, invariable 40 (34+26+40=100).

## Feminine variants (26 total)

italiana, tedesca, russa (nationalities) · nuvolosa, secca (weather) · piena, vuota, mezza, leggera, numerosa (quantity) · bassa, anziana, magra, grassa, pulita, sporca, robusta, snella, bionda, riccia, calva, scura (description) · autentica, certa, incerta, ovvia, assurda, logica, strana, tranquilla (abstract)

## Judgment calls

1. **Brief's illustrative examples collided with batch-1 slugs — swapped for fresh lemmas.** The brief's parenthetical suggestions for quantity ("leggero/leggera, pesante") and abstract/evaluation ("vero/vera, falso, giusto/giusta, sbagliato, possibile, sicuro/sicura, pericoloso") reused several adjectives already staged in `adjective-batch-1.json` — checked programmatically against batch-1's 120 slugs before writing anything: `pesante.adjective`, `falso.adjective.masculine.singular`, `giusto`/`giusta` (both genders), `sbagliato`/`sbagliata` (both genders), `possibile.adjective`, `sicuro.adjective.masculine.singular`, `pericoloso.adjective.masculine.singular`, and `vero.adjective.masculine.singular` are all already live in batch-1. Per the brief's hard rule ("none of its adjectives may reappear"), I dropped every one of these and substituted synonymous or adjacent vocabulary instead: quantity got `numeroso/numerosa` in place of `pesante`; abstract/evaluation got `autentico/autentica`, `certo/certa`, `incerto/incerta`, `ovvio/ovvia`, `assurdo/assurda`, `logico/logica`, `strano/strana` in place of the taken words, keeping only `tranquillo/tranquilla` from the brief's own abstract list (not present in batch-1). Also silently avoided `caldo/calda`, `freddo/fredda`, `alto`, `lungo/lunga`, `corto`, `forte`, `chiaro`, `raro`, `utile`/`inutile` for the same reason (all present in batch-1, several appearing as substrings of the brief's illustrative lists for weather/description).
2. **Cross-batch feminine-of-existing-masculine avoided entirely.** Rather than adding e.g. `sicura.adjective.feminine.singular` as a "new" entity referencing batch-1's existing `word.lemma.sicuro`, I chose fresh lemmas throughout to keep this batch's slug space fully disjoint from batch-1's — simpler to audit, no cross-file lemma-sharing ambiguity.
3. **`agile` and `fragile`: known == learning.** Both are legitimate English/Italian cognates (identical spelling, identical meaning) — the quality-criteria's documented exception ("unless legitimately the same word in both languages"). Verified no other entity in the batch has this collision.
4. **Nationalities get `domain.social`.** No `domain.nationality` symbol exists in `structural.js`; `domain.social` ("Greetings, introductions, and social interaction") was the closest natural fit, matching how "Di dove sei?" / "Sono italiano" plays out as an intro-conversation exchange.
5. **Quantity/measure and abstract/evaluation carry no domain symbol**, mirroring batch-1's precedent for its own evaluation family (30 entities, no domain) — nothing in `structural.js`'s domain list fits "full/empty/double" or "certain/logical/absurd" any better than forcing a mismatch.
6. **Description/appearance domain split**: physical build/size words (`basso`, `magro`, `grasso`, `robusto`, `snello`, `agile`, `fragile`, `resistente`, `imponente`) → `domain.shape` (consistent with batch-1's `alto`/`piccolo`/`grande` mapping); hair/skin/baldness (`biondo`, `riccio`, `calvo`, `scuro`) → `domain.body`; cleanliness (`pulito`, `sporco`) → `domain.home`; `debole` (weak) → `domain.state` (consistent with batch-1's `stanco`/`felice`/`triste`); `anziano`/`giovane` (age) left without a domain — no age-specific domain exists and forcing `domain.state` felt looser than the state examples above.
7. **All example subjects are generic role nouns** (il turista, la meccanica, il vicino, la ginnasta, ecc.) — no personal names anywhere, consistent with batch-1's own convention and satisfying the no-PII constraint by construction rather than by post-hoc filtering.
8. **Gender agreement discipline.** Every feminine entity's example uses a feminine-agreeing noun subject (la turista, la sedia, la modella, la mucca, la ballerina, la firma, ecc.); every masculine entity uses a masculine subject. Elision (`l'ingegnere`, `l'insegnante`, `l'artista`, `l'infermiera`, `l'inverno`, `l'acqua`) and the `lo`/`gli` rule before s+consonant or vowel (`lo scrittore`, `lo zaino`, `lo spazio`) applied per standard Italian orthography.
9. **`mezzo`/`mezza` (half) used attributively** ("Bevo mezzo litro di latte" / "Mangio mezza mela") rather than predicatively, since `il litro è mezzo` is not natural Italian — this still satisfies EXEMPLIFIED's requirement that the exact form appear in a natural sentence.

## Validation run

```
python3 -c "import json; print(len(json.load(open('/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-2.json'))))" → 100
```

Additional automated checks performed programmatically (all passed):
- No duplicate slugs within the file, and zero overlap against the union of: `adjective-batch-1.json` slugs, `noun-batch-1.json` slugs, and every `dataset/literals/words/*.js` slug (verb.js is the only non-trivial live file; adjective.js/noun.js/particle.js are empty stubs).
- No duplicate EXEMPLIFIED `learning` sentences within the file, and zero overlap against the same union (987 existing sentences collected from verb.js + both sibling staged batches).
- Every `learning` form is lowercase and appears verbatim inside its own EXEMPLIFIED `learning` sentence.
- `known` field contains no Italian diacritics, and `known != learning` for every entry except the two documented cognate exceptions (`agile`, `fragile`).
- Every entity carries `word`, `word.lemma.*`, `word.part-of-speech.adjective`, `word.number.singular`, and a `proficiency.cefr.*` symbol; gendered entries carry `word.gender.masculine`/`word.gender.feminine`; invariable entries carry neither.
- Every `domain.*`/`proficiency.*` symbol used exists in `dataset/symbols/structural.js` — zero invented symbols.

## Concerns

None blocking. One soft note: `riccio`/`riccia` (curly) and a few appearance adjectives describe hair/build informally in predicate position (`il ragazzino è riccio` = "the boy is curly-haired") rather than the stricter attributive-with-noun form (`i capelli ricci`) — this is colloquially standard Italian and matches the EXEMPLIFIED convention used throughout batch-1 (predicate `è + adjective`), but flagging in case a stricter register is wanted in review.

## Fix pass (against task-adjective-2-review.md)

### Critical #1 — six weather adjectives shipped invariable, missing gender

Fixed. All six were staged as `<form>.adjective` with no `word.gender.*` symbol despite being regular `-o/-a` adjectives (piovosa/soleggiata/umida/ventosa/gelida/afosa are all valid feminine forms). Renamed slug shape and added the missing symbol on each masculine-base entity — no feminine siblings added (review explicitly said not to):

- `piovoso.adjective` → `piovoso.adjective.masculine.singular` + `word.gender.masculine`
- `soleggiato.adjective` → `soleggiato.adjective.masculine.singular` + `word.gender.masculine`
- `umido.adjective` → `umido.adjective.masculine.singular` + `word.gender.masculine`
- `ventoso.adjective` → `ventoso.adjective.masculine.singular` + `word.gender.masculine`
- `gelido.adjective` → `gelido.adjective.masculine.singular` + `word.gender.masculine`
- `afoso.adjective` → `afoso.adjective.masculine.singular` + `word.gender.masculine`

`mite.adjective` and `variabile.adjective` (the two genuine -e invariables in the same family) left untouched — correctly ungendered.

### Important #2 — scuro/scura tagged domain.body, examples not body-related

Fixed by retagging rather than rewriting examples (cheaper, no risk to the already-verified gender-agreement/form-in-example checks):

- `scuro.adjective.masculine.singular` — example "The color is dark" / "Il colore è scuro" → `domain.body` replaced with `domain.color`.
- `scura.adjective.feminine.singular` — example "The room is dark" / "La stanza è scura" → `domain.body` replaced with `domain.home`.

Both symbols confirmed present in `dataset/symbols/structural.js`.

### Important #3 (report arithmetic) / Minor #4-6

Not touched per task scope — #3 is a self-report accuracy note (no data change needed), and Minor findings (known/example mismatch on `numerosa`/`minimo`, repeated "Il tempo è ___" subject, uneven nationality CEFR pitch) were left untouched as instructed.

## Post-fix mechanical checks (all passed)

```
JSON parses: OK
Entity count: 100 -> expected 100: True
Duplicate slugs within file: none
Duplicate EXEMPLIFIED learning examples within file: none
Slug overlap vs live dataset (dataset/literals/words/*.js): none
Example overlap vs live dataset: none
Slug overlap vs sibling staged files (.harvest/staged/*.json): none
Example overlap vs sibling staged files: none
Gender/number symbol issues (every gendered-shape slug carries word.gender.* + word.number.singular): none
Illegal (non-word) symbols not in structural.js: none
```

(`dataset/literals/words/index.js` is a barrel re-export, not an entity file — expectedly skipped by the JS-entity parser, not counted as a failure.)
